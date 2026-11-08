import prisma from '../../config/db.js';

export const getMyTeams = async (userId) => {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          project: {
            include: {
              skills: { include: { skill: true } },
            },
          },
          leader: {
            select: { id: true, name: true, avatar: true, email: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true, course: true, academicYear: true },
              },
            },
          },
          tasks: true,
        },
      },
    },
  });

  return memberships.map((m) => {
    const t = m.team;
    const completedTasks = t.tasks.filter((tk) => tk.status === 'DONE').length;
    const totalTasks = t.tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      teamId: t.id,
      teamName: t.name,
      myRole: m.role,
      isLeader: t.leaderId === userId,
      leader: t.leader,
      project: {
        id: t.project.id,
        title: t.project.title,
        description: t.project.description,
        projectType: t.project.projectType,
        status: t.project.status,
        deadline: t.project.deadline,
        requiredTeamSize: t.project.requiredTeamSize,
        skills: t.project.skills.map((s) => s.skill.name),
      },
      members: t.members,
      memberCount: t.members.length,
      taskCount: totalTasks,
      completedTaskCount: completedTasks,
      progress,
    };
  });
};

export const getTeamWorkspace = async (teamId, userId) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      project: {
        include: {
          skills: { include: { skill: true } },
          roles: true,
        },
      },
      leader: {
        select: { id: true, name: true, email: true, avatar: true, academicYear: true, course: true },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              academicYear: true,
              course: true,
              skills: {
                include: { skill: true },
                orderBy: { proficiency: 'desc' },
              },
            },
          },
        },
      },
      tasks: {
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!team) {
    const error = new Error('Team workspace not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ensure authorized team member
  const isMember = team.members.some((m) => m.userId === userId);
  if (!isMember) {
    const error = new Error('Unauthorized. You must be an active team member to access this workspace.');
    error.statusCode = 403;
    throw error;
  }

  const completedCount = team.tasks.filter((t) => t.status === 'DONE').length;
  const progress = team.tasks.length > 0 ? Math.round((completedCount / team.tasks.length) * 100) : 0;

  return {
    ...team,
    isLeader: team.leaderId === userId,
    progress,
  };
};

export const sendJoinRequest = async (userId, projectId, message) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: {
          members: true,
          requests: true,
        },
      },
    },
  });

  if (!project || !project.team) {
    const error = new Error('Project or associated team does not exist.');
    error.statusCode = 404;
    throw error;
  }

  const team = project.team;

  // 1. Prevent joining own project
  if (team.leaderId === userId) {
    const error = new Error('You are already the leader of this project team.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Prevent duplicate team membership
  const alreadyMember = team.members.some((m) => m.userId === userId);
  if (alreadyMember) {
    const error = new Error('You are already a member of this team.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check if team is already full
  if (team.members.length >= project.requiredTeamSize) {
    const error = new Error('This team has already reached its maximum required member capacity.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Check for existing request
  const existingRequest = team.requests.find((r) => r.userId === userId);
  if (existingRequest) {
    if (existingRequest.status === 'PENDING') {
      const error = new Error('You have already submitted a join request for this team. Please wait for the leader to review.');
      error.statusCode = 400;
      throw error;
    }
    if (existingRequest.status === 'ACCEPTED') {
      const error = new Error('Your request was already accepted.');
      error.statusCode = 400;
      throw error;
    }
    // If previously rejected, allow re-applying by updating status
    const updated = await prisma.teamRequest.update({
      where: { id: existingRequest.id },
      data: {
        status: 'PENDING',
        message: message || existingRequest.message,
      },
    });
    return updated;
  }

  // Create new join request
  const request = await prisma.teamRequest.create({
    data: {
      teamId: team.id,
      userId,
      message: message || 'I would like to collaborate on this project.',
      status: 'PENDING',
    },
  });

  // Notify team leader
  const applicant = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.notification.create({
    data: {
      userId: team.leaderId,
      title: 'New Join Request',
      message: `${applicant?.name || 'A student'} requested to join "${project.title}".`,
      type: 'JOIN_REQUEST',
      link: '/requests',
    },
  });

  return request;
};

export const getRequestsInbox = async (userId) => {
  // Requests received for teams led by user
  const ledTeams = await prisma.team.findMany({
    where: { leaderId: userId },
    select: { id: true },
  });
  const ledTeamIds = ledTeams.map((t) => t.id);

  const receivedRequests = await prisma.teamRequest.findMany({
    where: {
      teamId: { in: ledTeamIds },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          studentId: true,
          email: true,
          avatar: true,
          academicYear: true,
          course: true,
          bio: true,
          experience: true,
          skills: {
            include: { skill: true },
            orderBy: { proficiency: 'desc' },
          },
        },
      },
      team: {
        include: {
          project: { select: { id: true, title: true, projectType: true, requiredTeamSize: true } },
          members: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Requests sent by user
  const sentRequests = await prisma.teamRequest.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          project: { select: { id: true, title: true, projectType: true } },
          leader: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    received: receivedRequests.map((r) => ({
      id: r.id,
      teamId: r.teamId,
      projectName: r.team.project.title,
      projectId: r.team.project.id,
      requiredTeamSize: r.team.project.requiredTeamSize,
      currentMembers: r.team.members.length,
      student: r.user,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    })),
    sent: sentRequests.map((r) => ({
      id: r.id,
      teamId: r.teamId,
      projectName: r.team.project.title,
      projectId: r.team.project.id,
      leader: r.team.leader,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt,
    })),
  };
};

export const acceptRequest = async (leaderId, requestId) => {
  return await prisma.$transaction(async (tx) => {
    const request = await tx.teamRequest.findUnique({
      where: { id: requestId },
      include: {
        team: {
          include: {
            project: true,
            members: true,
          },
        },
      },
    });

    if (!request) {
      const error = new Error('Join request not found.');
      error.statusCode = 404;
      throw error;
    }

    if (request.team.leaderId !== leaderId) {
      const error = new Error('Unauthorized. Only the team leader can accept join requests.');
      error.statusCode = 403;
      throw error;
    }

    if (request.status === 'ACCEPTED') {
      const error = new Error('This request has already been accepted.');
      error.statusCode = 400;
      throw error;
    }

    // Check if team is full
    if (request.team.members.length >= request.team.project.requiredTeamSize) {
      const error = new Error('Team is already at full capacity. Cannot accept more members.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Update request status
    const updatedRequest = await tx.teamRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    // 2. Add to team members
    await tx.teamMember.create({
      data: {
        teamId: request.teamId,
        userId: request.userId,
        role: 'Collaborator',
      },
    });

    // 3. Notify student
    await tx.notification.create({
      data: {
        userId: request.userId,
        title: 'Join Request Accepted!',
        message: `Congratulations! Your request to join "${request.team.project.title}" has been accepted.`,
        type: 'REQUEST_ACCEPTED',
        link: `/teams/${request.teamId}`,
      },
    });

    return updatedRequest;
  });
};

export const rejectRequest = async (leaderId, requestId) => {
  const request = await prisma.teamRequest.findUnique({
    where: { id: requestId },
    include: {
      team: { include: { project: true } },
    },
  });

  if (!request) {
    const error = new Error('Join request not found.');
    error.statusCode = 404;
    throw error;
  }

  if (request.team.leaderId !== leaderId) {
    const error = new Error('Unauthorized. Only the team leader can reject join requests.');
    error.statusCode = 403;
    throw error;
  }

  const updatedRequest = await prisma.teamRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      userId: request.userId,
      title: 'Join Request Update',
      message: `Your request to join "${request.team.project.title}" was not accepted at this time.`,
      type: 'REQUEST_REJECTED',
    },
  });

  return updatedRequest;
};
