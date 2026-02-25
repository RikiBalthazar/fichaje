export interface Project {
  id: string;
  name: string;
  description: string;
  total_minutes: number;
  is_active: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
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
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
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
