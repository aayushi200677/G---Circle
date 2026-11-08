import api from './api.js';

export const taskService = {
  getMyTasks: (params) => api.get('/tasks/me', { params }),
  getTeamTasks: (teamId) => api.get(`/tasks/team/${teamId}`),
  createTask: (teamId, data) => api.post(`/tasks/team/${teamId}`, data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};
