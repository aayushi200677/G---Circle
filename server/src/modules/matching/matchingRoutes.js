import { Router } from 'express';
import * as matchingController from './matchingController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Project-specific recommendations & skill gap analysis
router.get('/projects/:projectId/recommendations', requireAuth, matchingController.getProjectRecommendations);
router.get('/projects/:projectId/skill-gaps', requireAuth, matchingController.getProjectSkillGaps);

// User-centric recommendations
router.get('/recommended-projects', requireAuth, matchingController.getMyRecommendedProjects);
router.get('/recommended-collaborators', requireAuth, matchingController.getMyRecommendedCollaborators);
router.get('/communication-matches', requireAuth, matchingController.getMyCommunicationMatches);

export default router;
