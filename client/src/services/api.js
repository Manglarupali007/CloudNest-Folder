import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept request to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cloudnest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response to catch 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto logout on public share checks
      if (!error.config.url.includes('/share/view/')) {
        localStorage.removeItem('cloudnest_token');
        localStorage.removeItem('cloudnest_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  demoLogin: () => api.post('/auth/demo-login'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Folder Endpoints
export const folderAPI = {
  getFolders: (params) => api.get('/folders', { params }),
  getFolder: (id) => api.get(`/folders/${id}`),
  createFolder: (data) => api.post('/folders', data),
  updateFolder: (id, data) => api.put(`/folders/${id}`, data),
  toggleStar: (id) => api.patch(`/folders/${id}/star`),
  trashFolder: (id) => api.delete(`/folders/${id}`),
  restoreFolder: (id) => api.patch(`/folders/${id}/restore`),
  deletePermanently: (id) => api.delete(`/folders/${id}/permanent`)
};

// File Endpoints
export const fileAPI = {
  getFiles: (params) => api.get('/files', { params }),
  getFile: (id) => api.get(`/files/${id}`),
  uploadFiles: (formData, onProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    }),
  downloadUrl: (id) => {
    const token = localStorage.getItem('cloudnest_token');
    return `/api/files/${id}/download?token=${token}`;
  },
  previewUrl: (id) => {
    const token = localStorage.getItem('cloudnest_token');
    return `/api/files/${id}/preview?token=${token}`;
  },
  renameFile: (id, name) => api.put(`/files/${id}/rename`, { name }),
  moveFile: (id, folderId) => api.patch(`/files/${id}/move`, { folderId }),
  toggleStar: (id) => api.patch(`/files/${id}/star`),
  trashFile: (id) => api.delete(`/files/${id}`),
  restoreFile: (id) => api.patch(`/files/${id}/restore`),
  deletePermanently: (id) => api.delete(`/files/${id}/permanent`),
  bulkTrash: (fileIds) => api.post('/files/bulk-trash', { fileIds }),
  bulkDelete: (fileIds) => api.post('/files/bulk-delete', { fileIds })
};

// Share Endpoints
export const shareAPI = {
  createShareLink: (fileId, expiresInDays) => api.post(`/share/${fileId}`, { expiresInDays }),
  revokeShareLink: (fileId) => api.delete(`/share/${fileId}`),
  getMyShares: () => api.get('/share/my-shares'),
  getSharedFile: (token) => api.get(`/share/view/${token}`),
  downloadSharedUrl: (token) => `/api/share/download/${token}`,
  previewSharedUrl: (token) => `/api/share/preview/${token}`
};

// Analytics Endpoints
export const analyticsAPI = {
  getStorageOverview: () => api.get('/analytics/storage'),
  getRecentActivities: (limit) => api.get('/analytics/activity', { params: { limit } })
};

export default api;
