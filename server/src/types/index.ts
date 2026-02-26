export interface Project {
  id: string;
  user_id?: string | null;
  name: string;
  description: string;
  total_minutes: number;
  is_active: number;
  order_index: number;
  is_favorite: number;
  last_used_at: string | null;
  tags: string; // JSON string array
  target_minutes?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id?: string | null;
  project_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  duration_centesimal: string;
  description: string | null;
  created_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  tags?: string[];
  targetMinutes?: number | null;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  tags?: string[];
  targetMinutes?: number | null;
}

export interface CreateTimeEntryRequest {
  projectId: string;
  startTime: string;
  endTime: string;
  duration: number;
  durationCentesimal: string;
  description?: string;
}

export interface UpdateTimeEntryRequest {
  duration?: number;
  durationCentesimal?: string;
  description?: string;
  endTime?: string;
}

export interface DescriptionTemplate {
  id: string;
  user_id?: string | null;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDescriptionTemplateRequest {
  name: string;
  description: string;
}

export interface UpdateDescriptionTemplateRequest {
  name?: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface TimerState {
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
