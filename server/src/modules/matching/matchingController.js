import * as matchingService from './matchingService.js';
import { sendSuccess } from '../../utils/response.js';

export const getProjectRecommendations = async (req, res, next) => {
  try {
    const recommendations = await matchingService.getRecommendedCollaboratorsForProject(
      req.params.projectId,
      parseInt(req.query.limit || '10', 10)
    );
    return sendSuccess(res, recommendations, 'Recommended collaborators for project.');
  } catch (error) {
    next(error);
  }
};

export const getProjectSkillGaps = async (req, res, next) => {
  try {
    const gaps = await matchingService.analyzeProjectSkillGaps(req.params.projectId);
    return sendSuccess(res, gaps, 'Team skill gap analysis.');
  } catch (error) {
    next(error);
  }
};

export const getMyRecommendedProjects = async (req, res, next) => {
  try {
    const projects = await matchingService.getRecommendedProjectsForUser(
      req.user.id,
      parseInt(req.query.limit || '8', 10)
    );
    return sendSuccess(res, projects, 'Recommended projects based on your skills.');
  } catch (error) {
    next(error);
  }
};

export const getMyCommunicationMatches = async (req, res, next) => {
  try {
    const matches = await matchingService.getCommunicationMatches(
      req.user.id,
      parseInt(req.query.limit || '12', 10)
    );
    return sendSuccess(res, matches, 'Recommended communication collaborators.');
  } catch (error) {
    next(error);
  }
};

export const getMyRecommendedCollaborators = async (req, res, next) => {
  try {
    // If user has a project they lead, get recommendations for that project; otherwise general recommendations
    const ledProject = await req.user.createdProjects?.[0];
    if (ledProject) {
      const recommendations = await matchingService.getRecommendedCollaboratorsForProject(ledProject.id, 6);
      return sendSuccess(res, recommendations, 'Recommended collaborators.');
    }

    // Otherwise return top communication / complementary matches
    const matches = await matchingService.getCommunicationMatches(req.user.id, 6);
    return sendSuccess(res, matches, 'Recommended collaborators.');
  } catch (error) {
    next(error);
  }
};
