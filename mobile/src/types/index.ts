export type AppLanguage = 'ru' | 'en';

export interface User {
  _id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  source?: string;
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDays?: number;
}

export interface GeneratedProject {
  projectName: string;
  description: string;
  color?: string;
  tasks?: GeneratedTask[];
  recommendations?: string[];
}

export interface GeneratedPresentation {
  title: string;
  subtitle?: string;
  slides: Array<{
    id?: string;
    type?: string;
    title: string;
    content?: string;
    bullets?: string[];
  }>;
}
