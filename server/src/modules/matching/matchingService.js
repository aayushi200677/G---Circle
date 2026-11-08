import prisma from '../../config/db.js';
import { MATCHING_WEIGHTS } from '../../config/constants.js';

/**
 * Analyze team skill coverage vs project requirements.
 * Identifies covered capabilities and genuine missing gaps.
 */
export const analyzeProjectSkillGaps = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      skills: {
        include: { skill: true },
        orderBy: { importance: 'desc' },
      },
      roles: true,
      team: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  skills: { include: { skill: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const teamMembers = project.team?.members || [];

  // Map team's collective skills to highest proficiency and who covers it
  const teamSkillsMap = new Map();
  for (const member of teamMembers) {
    for (const us of member.user.skills) {
      const existing = teamSkillsMap.get(us.skillId);
      if (!existing || us.proficiency > existing.proficiency) {
        teamSkillsMap.set(us.skillId, {
          skillId: us.skillId,
          name: us.skill.name,
          proficiency: us.proficiency,
          coveredBy: existing ? [...existing.coveredBy, member.user.name] : [member.user.name],
        });
      } else {
        existing.coveredBy.push(member.user.name);
      }
    }
  }

  const requiredSkills = project.skills.map((ps) => ({
    skillId: ps.skillId,
    name: ps.skill.name,
    category: ps.skill.category,
    importance: ps.importance,
  }));

  const coveredSkills = [];
  const missingSkills = [];

  for (const reqSkill of requiredSkills) {
    const teamSkill = teamSkillsMap.get(reqSkill.skillId);
    if (teamSkill && teamSkill.proficiency >= 2) {
      coveredSkills.push({
        ...reqSkill,
        coveredBy: Array.from(new Set(teamSkill.coveredBy)),
        maxProficiency: teamSkill.proficiency,
      });
    } else {
      missingSkills.push({
        ...reqSkill,
        currentMaxProficiency: teamSkill ? teamSkill.proficiency : 0,
      });
    }
  }

  return {
    projectId,
    projectTitle: project.title,
    totalRequiredCount: requiredSkills.length,
    coveredCount: coveredSkills.length,
    missingCount: missingSkills.length,
    requiredSkills,
    coveredSkills,
    missingSkills,
    teamSize: teamMembers.length,
    requiredTeamSize: project.requiredTeamSize,
  };
};

/**
 * Recommend collaborators for a specific project based on complementary team matching.
 */
export const getRecommendedCollaboratorsForProject = async (projectId, limit = 10) => {
  const gapAnalysis = await analyzeProjectSkillGaps(projectId);
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      creator: { include: { preferences: true, languages: true } },
      roles: true,
      team: {
        include: {
          members: true,
          requests: true,
        },
      },
    },
  });

  const existingMemberIds = new Set(project.team?.members.map((m) => m.userId) || []);
  const pendingUserIds = new Set(project.team?.requests.map((r) => r.userId) || []);

  // Fetch candidate students who are verified and not already members
  const candidates = await prisma.user.findMany({
    where: {
      emailVerified: true,
      id: { notIn: Array.from(existingMemberIds) },
    },
    include: {
      skills: { include: { skill: true } },
      communicationSkills: { include: { communicationSkill: true } },
      languages: true,
      preferences: true,
      teamMemberships: true,
    },
  });

  const missingSkillIds = new Set(gapAnalysis.missingSkills.map((s) => s.skillId));
  const missingSkillImportanceMap = new Map(
    gapAnalysis.missingSkills.map((s) => [s.skillId, s.importance])
  );

  // Maximum possible weighted score for missing skills
  let maxPossibleMissingScore = 0;
  for (const ms of gapAnalysis.missingSkills) {
    maxPossibleMissingScore += ms.importance * 4; // 4 = Expert
  }

  // Also calculate total required max score as fallback if no gaps remain
  let maxPossibleTotalScore = 0;
  for (const rs of gapAnalysis.requiredSkills) {
    maxPossibleTotalScore += rs.importance * 4;
  }

  const recommendations = [];

  for (const candidate of candidates) {
    // 1. Complementary Skill Match (40%)
    let missingSkillPoints = 0;
    const filledGaps = [];

    for (const userSkill of candidate.skills) {
      if (missingSkillIds.has(userSkill.skillId)) {
        const weight = missingSkillImportanceMap.get(userSkill.skillId) || 3;
        missingSkillPoints += weight * userSkill.proficiency;
        filledGaps.push({
          name: userSkill.skill.name,
          proficiency: userSkill.proficiency,
          proficiencyLabel: getProficiencyLabel(userSkill.proficiency),
          importance: weight,
        });
      }
    }

    let complementarySkillScore = 0;
    if (maxPossibleMissingScore > 0) {
      complementarySkillScore = Math.min(missingSkillPoints / maxPossibleMissingScore, 1.0);
    } else if (maxPossibleTotalScore > 0) {
      // If team has all skills covered, evaluate total skill match
      let totalPoints = 0;
      for (const us of candidate.skills) {
        const req = gapAnalysis.requiredSkills.find((rs) => rs.skillId === us.skillId);
        if (req) {
          totalPoints += req.importance * us.proficiency;
        }
      }
      complementarySkillScore = Math.min(totalPoints / maxPossibleTotalScore, 1.0);
    }

    // 2. Role Compatibility (15%)
    let roleScore = 0.5;
    const openRoleNames = project.roles
      .filter((r) => r.openCount > 0)
      .map((r) => r.roleName.toLowerCase());

    const matchedRoles = candidate.preferredRoles.filter((pr) =>
      openRoleNames.some((orn) => orn.includes(pr.toLowerCase()) || pr.toLowerCase().includes(orn))
    );
    if (matchedRoles.length > 0) {
      roleScore = 1.0;
    }

    // 3. Availability Compatibility (10%)
    let availabilityScore = 0.7;
    const leaderAvailability = project.creator.preferences?.availability || 'Flexible';
    const candidateAvailability = candidate.availability || candidate.preferences?.availability || 'Flexible';

    if (candidateAvailability === 'Flexible' || leaderAvailability === 'Flexible') {
      availabilityScore = 1.0;
    } else if (candidateAvailability === leaderAvailability) {
      availabilityScore = 1.0;
    } else {
      availabilityScore = 0.6;
    }

    // 4. Experience Compatibility (10%)
    let experienceScore = 0.6;
    if (candidate.experience && candidate.experience.length > 30) {
      experienceScore = 0.9;
    }
    if (candidate.academicYear === '3rd Year' || candidate.academicYear === '4th Year') {
      experienceScore = Math.min(experienceScore + 0.1, 1.0);
    }

    // 5. Interest Compatibility (10%)
    const interestScore = 0.75;

    // 6. Previous Project Experience (5%)
    const pastProjectScore = candidate.teamMemberships.length > 0 ? 0.9 : 0.6;

    // 7. Communication Compatibility (10%)
    let communicationScore = 0.6;
    const leaderStyle = project.creator.preferences?.collaborationStyle;
    const candidateStyle = candidate.preferences?.collaborationStyle;

    if (leaderStyle && candidateStyle && leaderStyle === candidateStyle) {
      communicationScore += 0.25;
    }

    // Shared communication methods
    const leaderMethods = new Set(project.creator.preferences?.communicationMethods || []);
    const candidateMethods = candidate.preferences?.communicationMethods || [];
    const sharedMethods = candidateMethods.filter((m) => leaderMethods.has(m));
    if (sharedMethods.length > 0) {
      communicationScore += 0.15;
    }
    communicationScore = Math.min(communicationScore, 1.0);

    // Composite Weighted Score
    const finalScore =
      MATCHING_WEIGHTS.COMPLEMENTARY_SKILLS * complementarySkillScore +
      MATCHING_WEIGHTS.ROLE_COMPATIBILITY * roleScore +
      MATCHING_WEIGHTS.AVAILABILITY * availabilityScore +
      MATCHING_WEIGHTS.EXPERIENCE * experienceScore +
      MATCHING_WEIGHTS.INTERESTS * interestScore +
      MATCHING_WEIGHTS.PREVIOUS_PROJECTS * pastProjectScore +
      MATCHING_WEIGHTS.COMMUNICATION * communicationScore;

    const matchPercentage = Math.round(finalScore * 100);

    // Build transparent explanation: "Why this student is recommended"
    let whyRecommended = '';
    if (filledGaps.length > 0) {
      const gapStrings = filledGaps.map((g) => `${g.name} (${g.proficiencyLabel})`);
      if (gapStrings.length === 1) {
        whyRecommended = `Your team currently lacks ${filledGaps[0].name}. This student brings this missing capability at ${filledGaps[0].proficiencyLabel} level.`;
      } else {
        whyRecommended = `Your team needs ${filledGaps.map((g) => g.name).join(' and ')}. This student directly fills these missing capabilities: ${gapStrings.join(', ')}.`;
      }
    } else if (matchedRoles.length > 0) {
      whyRecommended = `Matches your open team role for ${matchedRoles.join(', ')} with high availability alignment.`;
    } else {
      whyRecommended = `Strong complementary collaborator with solid technical foundation and aligned working style.`;
    }

    recommendations.push({
      student: {
        id: candidate.id,
        name: candidate.name,
        studentId: candidate.studentId,
        avatar: candidate.avatar,
        academicYear: candidate.academicYear,
        course: candidate.course,
        bio: candidate.bio,
        availability: candidate.availability,
        preferredRoles: candidate.preferredRoles,
        skills: candidate.skills.map((s) => ({
          name: s.skill.name,
          category: s.skill.category,
          proficiency: s.proficiency,
          proficiencyLabel: getProficiencyLabel(s.proficiency),
        })),
        communicationSkills: candidate.communicationSkills.map((cs) => ({
          name: cs.communicationSkill.name,
          proficiency: cs.proficiency,
        })),
        preferences: candidate.preferences,
      },
      matchPercentage,
      compositeScore: Number(finalScore.toFixed(2)),
      complementarySkillScore: Math.round(complementarySkillScore * 100),
      roleScore: Math.round(roleScore * 100),
      communicationScore: Math.round(communicationScore * 100),
      filledGaps,
      whyRecommended,
      hasPendingRequest: pendingUserIds.has(candidate.id),
    });
  }

  // Sort by match percentage descending
  recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return recommendations.slice(0, limit);
};

/**
 * Recommend projects to a student based on skills they can contribute.
 */
export const getRecommendedProjectsForUser = async (userId, limit = 8) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { include: { skill: true } },
      preferences: true,
      teamMemberships: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const userSkillIds = new Set(user.skills.map((s) => s.skillId));
  const userSkillMap = new Map(user.skills.map((s) => [s.skillId, s.proficiency]));

  // Get recruiting projects user is not already part of
  const participatingProjectIds = new Set();
  for (const tm of user.teamMemberships) {
    const team = await prisma.team.findUnique({ where: { id: tm.teamId } });
    if (team) participatingProjectIds.add(team.projectId);
  }

  const projects = await prisma.project.findMany({
    where: {
      status: 'RECRUITING',
      creatorId: { not: userId },
      id: { notIn: Array.from(participatingProjectIds) },
    },
    include: {
      creator: { select: { id: true, name: true, avatar: true } },
      skills: { include: { skill: true } },
      roles: true,
      team: {
        include: {
          members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        },
      },
    },
  });

  const projectRecommendations = [];

  for (const project of projects) {
    let matchPoints = 0;
    let maxPoints = 0;
    const contributedSkills = [];

    for (const ps of project.skills) {
      const weight = ps.importance;
      maxPoints += weight * 4;

      if (userSkillIds.has(ps.skillId)) {
        const proficiency = userSkillMap.get(ps.skillId) || 1;
        matchPoints += weight * proficiency;
        contributedSkills.push({
          name: ps.skill.name,
          proficiency,
          proficiencyLabel: getProficiencyLabel(proficiency),
        });
      }
    }

    const skillMatchPercentage = maxPoints > 0 ? Math.round((matchPoints / maxPoints) * 100) : 50;

    projectRecommendations.push({
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        projectType: project.projectType,
        difficulty: project.difficulty,
        deadline: project.deadline,
        requiredTeamSize: project.requiredTeamSize,
        currentTeamSize: project.team?.members.length || 1,
        creator: project.creator,
        skills: project.skills.map((ps) => ({
          name: ps.skill.name,
          importance: ps.importance,
        })),
        roles: project.roles,
        members: project.team?.members || [],
      },
      skillMatchPercentage,
      contributedSkills,
      whyRecommended:
        contributedSkills.length > 0
          ? `You can contribute ${contributedSkills.map((s) => s.name).join(', ')} to this team.`
          : `Looking for eager collaborators for ${project.projectType} project.`,
    });
  }

  projectRecommendations.sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);
  return projectRecommendations.slice(0, limit);
};

/**
 * Communication-focused collaborator discovery ("Find Communication Partners").
 * Pairs technically skilled students with strong communicators, public speakers, presenters, coordinators.
 */
export const getCommunicationMatches = async (userId, limit = 12) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { include: { skill: true } },
      communicationSkills: { include: { communicationSkill: true } },
      languages: true,
      preferences: true,
    },
  });

  if (!currentUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const myCommSkillIds = new Set(currentUser.communicationSkills.map((cs) => cs.communicationSkillId));
  const myLanguages = new Set(currentUser.languages.map((l) => l.language));
  const myMethods = new Set(currentUser.preferences?.communicationMethods || []);
  const myStyle = currentUser.preferences?.collaborationStyle || 'Brainstorming together';
  const myAvailability = currentUser.availability || currentUser.preferences?.availability || 'Flexible';

  const otherStudents = await prisma.user.findMany({
    where: {
      emailVerified: true,
      id: { not: userId },
    },
    include: {
      communicationSkills: { include: { communicationSkill: true } },
      languages: true,
      preferences: true,
      skills: { include: { skill: true } },
    },
  });

  const matches = [];

  for (const student of otherStudents) {
    let commScore = 0;
    const reasons = [];

    // 1. Complementary Communication Strengths:
    // If student has communication skills that current user has lower proficiency in or lacks
    const highCommSkills = student.communicationSkills.filter((cs) => cs.proficiency >= 3);
    const complementaryComm = highCommSkills.filter((cs) => !myCommSkillIds.has(cs.communicationSkillId));

    if (complementaryComm.length > 0) {
      commScore += 35;
      reasons.push(`Brings strong ${complementaryComm.map((c) => c.communicationSkill.name).join(' & ')}`);
    } else if (highCommSkills.length > 0) {
      commScore += 25;
      reasons.push(`Skilled in ${highCommSkills[0].communicationSkill.name}`);
    }

    // 2. Collaboration Style Alignment
    const studentStyle = student.preferences?.collaborationStyle || 'Brainstorming together';
    if (studentStyle === myStyle) {
      commScore += 25;
      reasons.push(`Both prefer "${myStyle}"`);
    } else {
      commScore += 12;
    }

    // 3. Shared Communication Methods
    const studentMethods = student.preferences?.communicationMethods || [];
    const sharedMethods = studentMethods.filter((m) => myMethods.has(m));
    if (sharedMethods.length > 0) {
      commScore += 20;
      reasons.push(`Overlaps in ${sharedMethods[0]}`);
    } else {
      commScore += 8;
    }

    // 4. Shared Languages
    const studentLanguages = student.languages.map((l) => l.language);
    const sharedLanguages = studentLanguages.filter((l) => myLanguages.has(l));
    if (sharedLanguages.length > 0) {
      commScore += 10;
    }

    // 5. Availability
    const studentAvailability = student.availability || student.preferences?.availability || 'Flexible';
    if (studentAvailability === 'Flexible' || myAvailability === 'Flexible' || studentAvailability === myAvailability) {
      commScore += 10;
    } else {
      commScore += 5;
    }

    const matchPercentage = Math.min(Math.round(commScore), 99);

    let whyRecommended = 'Strong communication synergy.';
    if (reasons.length > 0) {
      whyRecommended = `${reasons.join('. ')}.`;
    }

    matches.push({
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        avatar: student.avatar,
        academicYear: student.academicYear,
        course: student.course,
        bio: student.bio,
        availability: studentAvailability,
        preferredRoles: student.preferredRoles,
        communicationStrengths: student.communicationSkills.map((cs) => ({
          name: cs.communicationSkill.name,
          proficiency: cs.proficiency,
        })),
        languages: studentLanguages,
        collaborationStyle: studentStyle,
        communicationMethods: studentMethods,
        technicalSkills: student.skills.slice(0, 4).map((s) => s.skill.name),
      },
      matchPercentage,
      whyRecommended,
    });
  }

  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return matches.slice(0, limit);
};

function getProficiencyLabel(level) {
  switch (level) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Intermediate';
    case 3:
      return 'Advanced';
    case 4:
      return 'Expert';
    default:
      return 'Intermediate';
  }
}
