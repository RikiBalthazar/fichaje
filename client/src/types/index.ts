export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  totalMinutes: number;
  isActive: number;
  orderIndex: number;
  isFavorite: number;
  lastUsedAt: string | null;
  tags: string; // JSON string array
  targetMinutes?: number | null;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  durationCentesimal: string;
  description: string;
  createdAt: string;
}

export interface TimerState {
  projectId: string | null;
  isRunning: boolean;
  elapsedSeconds: number;
  startedAt: number;
}

export interface TimerStateResponse {
  active: {
    projectId: string;
    startedAt: string;
    accumulatedSeconds: number;
  } | null;
  paused: Array<{
    projectId: string;
    accumulatedSeconds: number;
  }>;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DescriptionTemplate {
  id: string;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
