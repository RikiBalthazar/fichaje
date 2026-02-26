import axios from 'axios';
import { Project, TimeEntry, DescriptionTemplate, AuthResponse, TimerStateResponse } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  me: async (): Promise<{ user: { id: string; email: string } }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  }
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get('/projects');
    return data;
  },

  getAllIncludingInactive: async (): Promise<Project[]> => {
    const { data } = await api.get('/projects/all-including-inactive');
    return data;
  },

  create: async (name: string, description: string): Promise<Project> => {
    const { data } = await api.post('/projects', { name, description });
    return data;
  },

  update: async (id: string, name: string, description: string): Promise<Project> => {
    const { data } = await api.put(`/projects/${id}`, { name, description });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  getById: async (id: string): Promise<Project> => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  updateOrder: async (projects: { id: string }[]): Promise<void> => {
    await api.post('/projects/order', { projects });
  },

  toggleActive: async (id: string): Promise<Project> => {
    const { data } = await api.patch(`/projects/${id}/toggle`);
    return data;
  }
};

// Time Entries API
export const timeEntriesAPI = {
  getAll: async (): Promise<TimeEntry[]> => {
    const { data } = await api.get('/time-entries');
    return data;
  },

  getByProject: async (projectId: string): Promise<TimeEntry[]> => {
    const { data } = await api.get(`/time-entries/project/${projectId}`);
    return data;
  },

  create: async (params: {
    projectId: string;
    startTime: string;
    endTime: string;
    duration: number;
    durationCentesimal: string;
    description: string;
  }): Promise<TimeEntry> => {
    const { data } = await api.post('/time-entries', params);
    return data;
  },

  update: async (id: string, params: {
    duration?: number;
    durationCentesimal?: string;
    description?: string;
    endTime?: string;
  }): Promise<TimeEntry> => {
    const { data } = await api.put(`/time-entries/${id}`, params);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/time-entries/${id}`);
  }
};

// Export API
export const exportAPI = {
  generateTxt: async (filters?: {
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<string> => {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append('projectId', filters.projectId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const url = `/export/txt${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await api.get(url);
    return data.content;
  }
};

// Description Templates API
export const templatesAPI = {
  getAll: async (): Promise<DescriptionTemplate[]> => {
    const { data } = await api.get('/templates');
    return data;
  },

  create: async (name: string, description: string): Promise<DescriptionTemplate> => {
    const { data } = await api.post('/templates', { name, description });
    return data;
  },

  update: async (id: string, name: string, description: string): Promise<DescriptionTemplate> => {
    const { data } = await api.put(`/templates/${id}`, { name, description });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`);
  },

  updateOrder: async (templates: { id: string }[]): Promise<void> => {
    await api.post('/templates/order', { templates });
  }
};

// Timer API
export const timerAPI = {
  getState: async (): Promise<TimerStateResponse> => {
    const { data } = await api.get('/timer/state');
    return data;
  },

  start: async (projectId: string): Promise<TimerStateResponse> => {
    const { data } = await api.post('/timer/start', { projectId });
    return data;
  },

  pause: async (): Promise<TimerStateResponse> => {
    const { data } = await api.post('/timer/pause');
    return data;
  },

  stop: async (projectId: string, description: string): Promise<{ entry: TimeEntry; state: TimerStateResponse }> => {
    const { data } = await api.post('/timer/stop', { projectId, description });
    return data;
  }
};

export default api;
