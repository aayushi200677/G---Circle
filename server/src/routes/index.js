import { Router } from 'express';
import authRoutes from '../modules/auth/authRoutes.js';
import userRoutes from '../modules/users/userRoutes.js';
import skillRoutes from '../modules/skills/skillRoutes.js';
import projectRoutes from '../modules/projects/projectRoutes.js';
import teamRoutes from '../modules/teams/teamRoutes.js';
import requestRoutes from '../modules/requests/requestRoutes.js';
import matchingRoutes from '../modules/matching/matchingRoutes.js';
import taskRoutes from '../modules/tasks/taskRoutes.js';
import dashboardRoutes from '../modules/dashboard/dashboardRoutes.js';
import showcaseRoutes from '../modules/showcase/showcaseRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/skills', skillRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/teams', teamRoutes);
apiRouter.use('/requests', requestRoutes);
apiRouter.use('/matching', matchingRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/showcase', showcaseRoutes);

export default apiRouter;
