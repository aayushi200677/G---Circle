import api from './api.js';

export const teamService = {
  getMyTeams: () => api.get('/teams'),
  getWorkspace: (id) => api.get(`/teams/${id}`),
  sendJoinRequest: (projectId, message) => api.post(`/requests/projects/${projectId}`, { message }),
  getRequestsInbox: () => api.get('/requests/inbox'),
  acceptRequest: (id) => api.patch(`/requests/${id}/accept`),
  rejectRequest: (id) => api.patch(`/requests/${id}/reject`),
};
