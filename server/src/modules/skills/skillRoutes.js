import { Router } from 'express';
import * as userController from '../users/userController.js';
import * as skillService from './skillService.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

router.get('/', userController.getSkillsCatalog);

router.get('/communication', async (req, res, next) => {
  try {
    const list = await skillService.getAllCommunicationSkills();
    return sendSuccess(res, list, 'Communication skills catalog.');
  } catch (err) {
    next(err);
  }
});

router.post('/communication', requireAuth, async (req, res, next) => {
  try {
    const result = await skillService.addUserCommunicationSkill(req.user.id, req.body);
    return sendSuccess(res, result, 'Communication strength added.', 201);
  } catch (err) {
    next(err);
  }
});

router.delete('/communication/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await skillService.deleteUserCommunicationSkill(req.user.id, req.params.id);
    return sendSuccess(res, result, result.message);
  } catch (err) {
    next(err);
  }
});

export default router;
