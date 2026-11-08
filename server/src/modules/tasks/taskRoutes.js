import { Router } from 'express';
import * as taskController from './taskController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Personal tasks
router.get('/me', requireAuth, taskController.getMyTasks);

// Team tasks
router.get('/team/:teamId', requireAuth, taskController.getTeamTasks);
router.post('/team/:teamId', requireAuth, taskController.createTeamTask);

// Individual task updates
router.patch('/:id', requireAuth, taskController.updateTask);
router.delete('/:id', requireAuth, taskController.deleteTask);

export default router;
