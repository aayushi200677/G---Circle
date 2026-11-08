import api from './api.js';

export const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getPublicProfile: (id) => api.get(`/users/${id}`),
  searchStudents: (params) => api.get('/users/search', { params }),
  getSkillsCatalog: () => api.get('/skills'),
  addSkill: (data) => api.post('/users/me/skills', data),
  updateSkill: (id, data) => api.put(`/users/me/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/users/me/skills/${id}`),
  getCommunicationSkills: () => api.get('/skills/communication'),
  addCommunicationSkill: (data) => api.post('/skills/communication', data),
  deleteCommunicationSkill: (id) => api.delete(`/skills/communication/${id}`),
  getPreferences: () => api.get('/users/me/preferences'),
  updatePreferences: (data) => api.put('/users/me/preferences', data),
  getStats: () => api.get('/dashboard/stats'),
  getNotifications: () => api.get('/dashboard/notifications'),
  markNotificationRead: (id) => api.patch(`/dashboard/notifications/${id}/read`),
};
