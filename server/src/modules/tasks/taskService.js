import prisma from '../../config/db.js';

export const getTeamTasks = async (teamId, userId) => {
  // Ensure user is authorized member of this team
  const isMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!isMember) {
    const error = new Error('Unauthorized. You must be a member of this team to view its tasks.');
    error.statusCode = 403;
    throw error;
  }

  const tasks = await prisma.task.findMany({
    where: { teamId },
    include: {
      assignedTo: {
        select: { id: true, name: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return tasks;
};

export const createTask = async (teamId, userId, data) => {
  const isMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (!isMember) {
    const error = new Error('Unauthorized. You must be an active team member to create tasks.');
    error.statusCode = 403;
    throw error;
  }

  const { title, description, assignedToId, priority, status, dueDate } = data;

  const task = await prisma.task.create({
    data: {
      teamId,
      title,
      description: description || null,
      assignedToId: assignedToId || null,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: userId,
    },
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  // If assigned to another member, send notification
  if (assignedToId && assignedToId !== userId) {
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        title: 'New Task Assigned',
        message: `You were assigned task: "${title}".`,
        type: 'TASK_ASSIGNED',
        link: `/teams/${teamId}`,
      },
    });
  }

  return task;
};

export const updateTask = async (taskId, userId, data) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      team: { include: { members: true } },
    },
  });

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMember = task.team.members.some((m) => m.userId === userId);
  if (!isMember) {
    const error = new Error('Unauthorized. Only team members can update team tasks.');
    error.statusCode = 403;
    throw error;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return updated;
};

export const deleteTask = async (taskId, userId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { team: true },
  });

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  const isLeader = task.team.leaderId === userId;
  const isCreator = task.createdById === userId;

  if (!isLeader && !isCreator) {
    const error = new Error('Unauthorized. Only task creator or team leader can delete this task.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.task.delete({ where: { id: taskId } });
  return { message: 'Task deleted successfully.' };
};

export const getMyTasks = async (userId, filters = {}) => {
  const { status, priority } = filters;
  const where = { assignedToId: userId };

  if (status && status !== 'All') {
    where.status = status;
  }
  if (priority && priority !== 'All') {
    where.priority = priority;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          project: { select: { id: true, title: true } },
        },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
  });

  return tasks;
};
