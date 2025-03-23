/**
 * API Types for the ANUS Backend
 */

export interface TaskRequest {
  prompt: string;
  mode?: 'single' | 'multi';
  context?: Record<string, unknown>;
}

export interface TaskResponse {
  task_id: string;
  status: TaskStatus;
  result?: Record<string, unknown> | null;
}

export interface StatusResponse {
  status: TaskStatus;
  result?: Record<string, unknown> | null;
}

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed'; 