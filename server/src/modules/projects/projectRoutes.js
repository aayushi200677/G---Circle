import { Router } from 'express';
import * as projectController from './projectController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// AI / Rule-based extraction
router.post('/analyze', requireAuth, projectController.analyzeDescription);

// CRUD
router.post('/', requireAuth, projectController.create);
router.get('/', requireAuth, projectController.getAll);
router.get('/:id', requireAuth, projectController.getById);
router.put('/:id', requireAuth, projectController.update);
router.delete('/:id', requireAuth, projectController.remove);

export default router;
