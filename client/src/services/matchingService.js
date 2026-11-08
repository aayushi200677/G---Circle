import api from './api.js';

export const matchingService = {
  getProjectRecommendations: (projectId) => api.get(`/matching/projects/${projectId}/recommendations`),
  getProjectSkillGaps: (projectId) => api.get(`/matching/projects/${projectId}/skill-gaps`),
  getMyRecommendedProjects: () => api.get('/matching/recommended-projects'),
  getMyRecommendedCollaborators: () => api.get('/matching/recommended-collaborators'),
  getMyCommunicationMatches: () => api.get('/matching/communication-matches'),
};
