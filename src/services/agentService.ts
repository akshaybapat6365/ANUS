import type { TaskRequest, TaskResponse, StatusResponse } from '@/types/api';

// Pointing to our Next.js API proxy
const API_ENDPOINT = '/api/proxy';

// For direct API calls (not through proxy)
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

export const agentService = {
  /**
   * Submit a task to the ANUS backend
   */
  async submitTask(request: TaskRequest): Promise<TaskResponse> {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get the status of a task
   */
  async getTaskStatus(taskId: string): Promise<StatusResponse> {
    const response = await fetch(`${API_ENDPOINT}?taskId=${taskId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Poll for task status until completion
   */
  async pollTaskUntilComplete(
    taskId: string, 
    onUpdate: (status: StatusResponse) => void,
    interval = 1000,
    timeout = 300000 // 5 minutes
  ): Promise<StatusResponse> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getTaskStatus(taskId);
          
          // Call the update callback
          onUpdate(status);
          
          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }
          
          // Check for timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Polling timeout exceeded'));
            return;
          }
          
          // Schedule next poll
          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };
      
      // Start polling
      poll();
    });
  }
}; 