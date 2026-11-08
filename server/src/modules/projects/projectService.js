import prisma from '../../config/db.js';
import { llmExtractionSchema } from '../../validators/projectValidator.js';

/**
 * Intelligent rule-based NLP extraction with Zod validation.
 * Extracts skills, weights, roles, difficulty, and team size from project descriptions.
 */
export const analyzeProjectDescription = async ({ title = '', description }) => {
  const text = `${title} ${description}`.toLowerCase();

  // Knowledge base of skill signals
  const skillKeywords = [
    { name: 'React.js', patterns: ['react', 'react.js', 'frontend', 'ui', 'redux', 'next.js'], importance: 4 },
    { name: 'Node.js', patterns: ['node', 'node.js', 'backend', 'express', 'express.js', 'api'], importance: 4 },
    { name: 'Python', patterns: ['python', 'django', 'fastapi', 'flask', 'scripting'], importance: 4 },
    { name: 'Machine Learning', patterns: ['machine learning', 'ml', 'scikit', 'model', 'predictive', 'ai', 'artificial intelligence'], importance: 5 },
    { name: 'Deep Learning', patterns: ['deep learning', 'neural network', 'pytorch', 'tensorflow', 'cnn', 'rnn', 'transformer', 'llm'], importance: 5 },
    { name: 'PostgreSQL', patterns: ['postgres', 'postgresql', 'sql', 'database', 'relational', 'prisma'], importance: 4 },
    { name: 'UI/UX Design', patterns: ['ui/ux', 'design', 'figma', 'wireframe', 'prototype', 'user experience', 'interface'], importance: 3 },
    { name: 'Tailwind CSS', patterns: ['tailwind', 'css', 'styling', 'responsive'], importance: 3 },
    { name: 'Docker', patterns: ['docker', 'container', 'kubernetes', 'devops', 'cloud'], importance: 4 },
    { name: 'Git & GitHub', patterns: ['git', 'github', 'version control', 'collaboration'], importance: 2 },
    { name: 'TypeScript', patterns: ['typescript', 'typed', 'ts'], importance: 4 },
    { name: 'Flutter', patterns: ['flutter', 'dart', 'mobile app', 'android', 'ios'], importance: 4 },
  ];

  const matchedSkills = [];
  for (const sk of skillKeywords) {
    const hasMatch = sk.patterns.some((pattern) => text.includes(pattern));
    if (hasMatch) {
      matchedSkills.push({
        skill: sk.name,
        importance: sk.importance,
      });
    }
  }

  // Fallback default skills if very short or no matches
  if (matchedSkills.length === 0) {
    matchedSkills.push(
      { skill: 'React.js', importance: 3 },
      { skill: 'Node.js', importance: 3 },
      { skill: 'UI/UX Design', importance: 3 }
    );
  }

  // Detect project type
  let detectedType = 'Hackathon';
  if (text.includes('research') || text.includes('paper') || text.includes('thesis')) {
    detectedType = 'Research';
  } else if (text.includes('startup') || text.includes('business') || text.includes('commercial')) {
    detectedType = 'Startup';
  } else if (text.includes('academic') || text.includes('curriculum') || text.includes('coursework')) {
    detectedType = 'Academic';
  } else if (text.includes('open source') || text.includes('library')) {
    detectedType = 'Open Source';
  } else if (text.includes('competition') || text.includes('contest')) {
    detectedType = 'Competition';
  }

  // Detect difficulty
  let difficulty = 'Intermediate';
  if (text.includes('advanced') || text.includes('complex') || text.includes('deep learning') || text.includes('distributed')) {
    difficulty = 'Advanced';
  } else if (text.includes('expert') || text.includes('production-grade')) {
    difficulty = 'Expert';
  } else if (text.includes('beginner') || text.includes('starter') || text.includes('simple')) {
    difficulty = 'Beginner';
  }

  // Infer roles from detected skills
  const inferredRoles = [];
  const skillNames = matchedSkills.map((s) => s.skill);

  if (skillNames.includes('React.js') || skillNames.includes('UI/UX Design')) {
    inferredRoles.push('Frontend Developer');
  }
  if (skillNames.includes('Node.js') || skillNames.includes('Python') || skillNames.includes('PostgreSQL')) {
    inferredRoles.push('Backend Developer');
  }
  if (skillNames.includes('Machine Learning') || skillNames.includes('Deep Learning')) {
    inferredRoles.push('ML Engineer');
  }
  if (skillNames.includes('Docker')) {
    inferredRoles.push('DevOps Specialist');
  }
  inferredRoles.push('Pitch & Presentation Lead');

  const rawResult = {
    project_type: detectedType,
    required_skills: matchedSkills.slice(0, 5),
    roles: Array.from(new Set(inferredRoles)).slice(0, 4),
    team_size: Math.min(Math.max(inferredRoles.length, 3), 5),
    difficulty,
    missing_skills: matchedSkills.filter((s) => s.importance >= 4).map((s) => s.skill).slice(0, 2),
  };

  // Validate output against Zod schema
  return llmExtractionSchema.parse(rawResult);
};

export const createProject = async (userId, data) => {
  const { title, description, projectType, requiredTeamSize, difficulty, deadline, requiredSkills, roles } = data;

  // Use database transaction for atomic project & team creation
  const createdProject = await prisma.$transaction(async (tx) => {
    // 1. Create project
    const project = await tx.project.create({
      data: {
        title,
        description,
        projectType,
        requiredTeamSize,
        difficulty,
        deadline: deadline ? new Date(deadline) : null,
        creatorId: userId,
      },
    });

    // 2. Automatically create associated team
    const team = await tx.team.create({
      data: {
        name: `${title} Team`,
        projectId: project.id,
        leaderId: userId,
      },
    });

    // 3. Make creator the Team Leader
    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: 'Team Leader',
      },
    });

    // 4. Save required skills
    for (const reqSkill of requiredSkills) {
      let skillId = reqSkill.skillId;
      if (!skillId) {
        let skill = await tx.skill.findUnique({ where: { name: reqSkill.name.trim() } });
        if (!skill) {
          skill = await tx.skill.create({
            data: { name: reqSkill.name.trim(), category: 'Other' },
          });
        }
        skillId = skill.id;
      }

      await tx.projectSkill.create({
        data: {
          projectId: project.id,
          skillId,
          importance: reqSkill.importance || 3,
        },
      });
    }

    // 5. Save roles
    if (roles && roles.length > 0) {
      for (const r of roles) {
        await tx.projectRole.create({
          data: {
            projectId: project.id,
            roleName: r.roleName.trim(),
            openCount: r.openCount || 1,
          },
        });
      }
    }

    return project;
  });

  return await getProjectById(createdProject.id, userId);
};

export const getProjects = async (filters, currentUserId = null) => {
  const { query, projectType, difficulty, skill, role, status } = filters;
  const where = {};

  if (status && status !== 'All') {
    where.status = status;
  } else {
    where.status = 'RECRUITING';
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (projectType && projectType !== 'All') {
    where.projectType = projectType;
  }

  if (difficulty && difficulty !== 'All') {
    where.difficulty = difficulty;
  }

  if (role && role !== 'All') {
    where.roles = {
      some: {
        roleName: { contains: role, mode: 'insensitive' },
      },
    };
  }

  if (skill && skill !== 'All') {
    where.skills = {
      some: {
        skill: {
          name: { contains: skill, mode: 'insensitive' },
        },
      },
    };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, avatar: true, academicYear: true, course: true } },
      skills: {
        include: { skill: true },
        orderBy: { importance: 'desc' },
      },
      roles: true,
      team: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
          requests: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { status: true, id: true },
              }
            : false,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects.map((p) => {
    const isMember = currentUserId ? p.team?.members.some((m) => m.userId === currentUserId) : false;
    const isLeader = currentUserId ? p.creatorId === currentUserId : false;
    const userRequest = currentUserId && p.team?.requests?.length > 0 ? p.team.requests[0] : null;

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      projectType: p.projectType,
      difficulty: p.difficulty,
      deadline: p.deadline,
      status: p.status,
      requiredTeamSize: p.requiredTeamSize,
      currentTeamSize: p.team?.members.length || 1,
      creator: p.creator,
      skills: p.skills.map((s) => ({
        id: s.skillId,
        name: s.skill.name,
        category: s.skill.category,
        importance: s.importance,
      })),
      roles: p.roles,
      teamId: p.team?.id,
      isMember,
      isLeader,
      userRequestStatus: userRequest ? userRequest.status : null,
      createdAt: p.createdAt,
    };
  });
};

export const getProjectById = async (projectId, currentUserId = null) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          studentId: true,
          email: true,
          avatar: true,
          academicYear: true,
          course: true,
          bio: true,
          linkedin: true,
          github: true,
        },
      },
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
                select: {
                  id: true,
                  name: true,
                  studentId: true,
                  avatar: true,
                  academicYear: true,
                  course: true,
                  skills: { include: { skill: true } },
                },
              },
            },
          },
          requests: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  academicYear: true,
                  course: true,
                  skills: { include: { skill: true } },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
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

  const isLeader = currentUserId ? project.creatorId === currentUserId : false;
  const isMember = currentUserId ? project.team?.members.some((m) => m.userId === currentUserId) : false;
  const myRequest = currentUserId
    ? project.team?.requests.find((r) => r.userId === currentUserId)
    : null;

  return {
    ...project,
    isLeader,
    isMember,
    myRequestStatus: myRequest ? myRequest.status : null,
  };
};

export const updateProject = async (userId, projectId, data) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.creatorId !== userId) {
    const error = new Error('Unauthorized. Only the project creator can edit this project.');
    error.statusCode = 403;
    throw error;
  }

  const { title, description, projectType, requiredTeamSize, difficulty, deadline, status } = data;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: title || undefined,
      description: description || undefined,
      projectType: projectType || undefined,
      requiredTeamSize: requiredTeamSize || undefined,
      difficulty: difficulty || undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      status: status || undefined,
    },
  });

  return updated;
};

export const deleteProject = async (userId, projectId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.creatorId !== userId) {
    const error = new Error('Unauthorized. Only the project creator can delete this project.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.project.delete({ where: { id: projectId } });
  return { message: 'Project deleted successfully.' };
};
