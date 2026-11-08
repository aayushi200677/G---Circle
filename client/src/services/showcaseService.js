import api from './api.js';

export const showcaseService = {
  getPublicShowcase: (params) => api.get('/showcase', { params }),
  getMyVideos: () => api.get('/showcase/me'),
  getUserVideos: (userId) => api.get(`/showcase/user/${userId}`),
  uploadVideo: (formData, onUploadProgress) =>
    api.post('/showcase/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  updateVideo: (id, data) => api.put(`/showcase/${id}`, data),
  deleteVideo: (id) => api.delete(`/showcase/${id}`),
  getStreamUrl: (videoId) => {
    const token = localStorage.getItem('gcircle_token');
    return `/api/showcase/stream/${videoId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
};
