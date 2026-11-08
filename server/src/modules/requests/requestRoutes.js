import { Router } from 'express';
import * as teamController from '../teams/teamController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Requests inbox (received & sent)
router.get('/inbox', requireAuth, teamController.getRequestsInbox);

// Send join request to a project
router.post('/projects/:projectId', requireAuth, teamController.sendJoinRequest);

// Leader actions on join requests
router.patch('/:id/accept', requireAuth, teamController.acceptRequest);
router.patch('/:id/reject', requireAuth, teamController.rejectRequest);

export default router;
