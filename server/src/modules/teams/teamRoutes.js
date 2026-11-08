import { Router } from 'express';
import * as teamController from './teamController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, teamController.getMyTeams);
router.get('/:id', requireAuth, teamController.getWorkspace);

export default router;
