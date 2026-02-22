import axios from 'axios';
import { secureStorage } from './storage';
import { AuthResponse, ChatResponse, GeneratedPresentation, GeneratedProject, User } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', payload),
  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', payload),
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
};

export const aiAPI = {
  chat: (message: string, context: string | null) =>
    api.post<ChatResponse>('/ai/chat', { message, context }),
  generateProject: (description: string, preferences = '') =>
    api.post<{ success: boolean; project: GeneratedProject }>('/ai/generate-project', {
      description,
      preferences,
    }),
  createProjectFromAI: (projectData: GeneratedProject) =>
    api.post<{ success: boolean; board: { _id: string; name: string } }>('/ai/create-project', { projectData }),
  generatePresentation: (topic: string, slidesCount = 8, style = 'modern') =>
    api.post<{ success: boolean; source?: string; presentation: GeneratedPresentation }>(
      '/ai/generate-presentation',
      { topic, slidesCount, style },
      { timeout: 90000 }
    ),
};

export default api;
