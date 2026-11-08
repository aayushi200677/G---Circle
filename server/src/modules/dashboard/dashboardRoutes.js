import { Router } from 'express';
import prisma from '../../config/db.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [myProjectsCount, activeTeamsCount, completedTasksCount] = await Promise.all([
      prisma.project.count({ where: { creatorId: userId } }),
      prisma.teamMember.count({ where: { userId } }),
      prisma.task.count({ where: { assignedToId: userId, status: 'DONE' } }),
    ]);

    // Pending requests on teams led by user
    const ledTeams = await prisma.team.findMany({
      where: { leaderId: userId },
      select: { id: true },
    });
    const ledTeamIds = ledTeams.map((t) => t.id);

    const pendingRequestsCount = await prisma.teamRequest.count({
      where: {
        teamId: { in: ledTeamIds },
        status: 'PENDING',
      },
    });

    return sendSuccess(res, {
      myProjects: myProjectsCount,
      activeTeams: activeTeamsCount,
      pendingRequests: pendingRequestsCount,
      completedTasks: completedTasksCount,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/notifications/:id/read', requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    return sendSuccess(res, null, 'Marked as read.');
  } catch (error) {
    next(error);
  }
});

export default router;
