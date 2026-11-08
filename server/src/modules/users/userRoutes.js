import { Router } from 'express';
import * as userController from './userController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated discovery
router.get('/search', requireAuth, userController.searchStudents);
router.get('/me', requireAuth, userController.getMe);
router.put('/me', requireAuth, userController.updateMe);
router.get('/me/preferences', requireAuth, userController.getMyPreferences);
router.put('/me/preferences', requireAuth, userController.updateMyPreferences);

// Skills routes
router.post('/me/skills', requireAuth, userController.addMySkill);
router.put('/me/skills/:id', requireAuth, userController.updateMySkill);
router.delete('/me/skills/:id', requireAuth, userController.deleteMySkill);

// Public student profile
router.get('/:id', requireAuth, userController.getPublicProfile);

export default router;
