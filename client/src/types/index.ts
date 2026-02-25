export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  totalMinutes: number;
  isActive: number;
  orderIndex: number;
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

export interface DescriptionTemplate {
  id: string;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
