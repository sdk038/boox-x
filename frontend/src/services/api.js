import axios from 'axios';

// В продакшене используем переменную окружения, локально — localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Создание экземпляра axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавление токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ответов и ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/auth/avatar')
};

// Boards API
export const boardsAPI = {
  getAll: () => api.get('/boards'),
  getOne: (id) => api.get(`/boards/${id}`),
  create: (boardData) => api.post('/boards', boardData),
  update: (id, boardData) => api.put(`/boards/${id}`, boardData),
  delete: (id) => api.delete(`/boards/${id}`),
  getTasks: (boardId) => api.get(`/boards/${boardId}/tasks`)
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`)
};

// Files API
export const filesAPI = {
  getAll: () => api.get('/files'),
  upload: (formData) => {
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (id) => api.delete(`/files/${id}`)
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settingsData) => api.put('/settings', settingsData)
};


export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (page = 1, limit = 20) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  getActivity: (page = 1, limit = 50, filters = {}) => {
    let url = `/admin/activity?page=${page}&limit=${limit}`;
    if (filters.action) url += `&action=${filters.action}`;
    if (filters.userId) url += `&userId=${filters.userId}`;
    return api.get(url);
  },
  getUserActivity: (userId) => api.get(`/admin/users/${userId}/activity`),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getActivityChart: (days = 7) => api.get(`/admin/activity/chart?days=${days}`)
};

// AI API
export const aiAPI = {
  generateProject: (description, preferences = '') => 
    api.post('/ai/generate-project', { description, preferences }),
  createProjectFromAI: (projectData) => 
    api.post('/ai/create-project', { projectData }),
  generateTask: (description, boardId = null) => 
    api.post('/ai/generate-task', { description, boardId }),
  analyzeProject: (boardId) => 
    api.post('/ai/analyze-project', { boardId }),
  chat: (message, context = null) => 
    api.post('/ai/chat', { message, context })
};

export default api;
