import axios from 'axios';

// Normalize VITE_API_URL: handles trailing slashes, missing /api, or existing /api gracefully
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
let baseDomain = rawApiUrl.replace(/\/+$/, ''); // Remove trailing slashes

let finalApiBase = '/api';
if (baseDomain) {
  if (baseDomain.endsWith('/api')) {
    finalApiBase = baseDomain;
  } else {
    finalApiBase = `${baseDomain}/api`;
  }
}

export const API_BASE_URL = finalApiBase;
export const BACKEND_URL = baseDomain.replace(/\/api$/, '');

if (import.meta.env.DEV) {
  console.log('[CloudNest API] Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
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
    return `${API_BASE_URL}/files/${id}/download?token=${encodeURIComponent(token || '')}`;
  },

  previewUrl: (id) => {
    const token = localStorage.getItem('cloudnest_token');
    return `${API_BASE_URL}/files/${id}/preview?token=${encodeURIComponent(token || '')}`;
  },
  renameFile: (id, name) => api.put(`/files/${id}/rename`, { name }),
  moveFile: (id, folderId) => api.patch(`/files/${id}/move`, { folderId }),
  toggleStar: (id) => api.patch(`/files/${id}/star`),
  trashFile: (id) => api.delete(`/files/${id}`),
  restoreFile: (id) => api.patch(`/files/${id}/restore`),
  deletePermanently: (id) => api.delete(`/files/${id}/permanent`),
  bulkTrash: (fileIds) => api.post('/files/bulk-trash', { fileIds }),
  bulkDelete: (fileIds) => api.post('/files/bulk-delete', { fileIds }),
  createDocument: (data) => api.post('/files/create-document', data),
  updateFileContent: (id, content) => api.put(`/files/${id}/content`, { content }),
  updateTags: (id, tags) => api.patch(`/files/${id}/tags`, { tags })
};

// Share Endpoints
export const shareAPI = {
  createShareLink: (fileId, expiresInDays) => api.post(`/share/${fileId}`, { expiresInDays }),
  revokeShareLink: (fileId) => api.delete(`/share/${fileId}`),
  getMyShares: () => api.get('/share/my-shares'),
  getSharedFile: (token) => api.get(`/share/view/${token}`),
  downloadSharedUrl: (token) =>
    `${API_BASE_URL}/share/download/${token}`,

  previewSharedUrl: (token) =>
    `${API_BASE_URL}/share/preview/${token}`,
};

// Analytics Endpoints
export const analyticsAPI = {
  getStorageOverview: () => api.get('/analytics/storage'),
  getRecentActivities: (limit) => api.get('/analytics/activity', { params: { limit } })
};

export default api;
