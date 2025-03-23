import React from 'react';
import type { Task } from '../../types';

interface TaskProgressProps {
  task: Task;
}

export default function TaskProgress({ task }: TaskProgressProps) {
  // Get status color based on task status
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'running':
        return 'bg-blue-600 animate-pulse';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  // Format status text
  const formatStatus = (status: Task['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="border border-[rgba(var(--border-color),0.7)] rounded-md mb-4 overflow-hidden">
      <div className="bg-[rgba(var(--sidebar-bg),0.7)] px-4 py-2 flex items-center justify-between border-b border-[rgba(var(--border-color),0.7)]">
        <h3 className="font-medium">Task: {task.title}</h3>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(task.status)}`} />
          <span className="text-sm text-gray-300">{formatStatus(task.status)}</span>
        </div>
      </div>
      
      {/* Task details */}
      <div className="p-4 bg-[rgba(var(--code-bg),0.4)]">
        {/* Show subtasks if any */}
        {task.subtasks.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Subtasks:</h4>
            <ul className="space-y-1">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(subtask.status)}`} />
                  <span>{subtask.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Show result if completed */}
        {task.status === 'completed' && task.result && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-300">Outcome:</h4>
            <p className="text-sm text-gray-300 bg-[rgba(var(--code-bg),0.7)] p-2 rounded">
              {task.result.length > 150 ? `${task.result.substring(0, 150)}...` : task.result}
            </p>
          </div>
        )}
        
        {/* Show error if failed */}
        {task.status === 'failed' && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-300">Error:</h4>
            <p className="text-sm text-red-300 bg-red-900/30 p-2 rounded">
              Failed to complete task
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 