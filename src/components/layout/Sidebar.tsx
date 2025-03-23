import React from 'react';
import { useAgent } from '../../contexts/AgentContext';

export default function Sidebar() {
  const { state, startTask } = useAgent();
  const { history, currentTask } = state;

  return (
    <div className="w-64 bg-[rgb(var(--sidebar-bg))] border-r border-[rgba(var(--border-color),0.5)] flex flex-col">
      {/* Logo and app name */}
      <div className="p-4 border-b border-[rgba(var(--border-color),0.5)] flex items-center">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-7 w-7 mr-2"
          aria-hidden="true"
        >
          <path 
            d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M12 16v-4M12 8h.01" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
        <h1 className="text-xl font-bold">ANUS</h1>
      </div>
      
      {/* Task history */}
      <div className="flex-1 overflow-auto p-1">
        <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Task History</p>
        <div className="space-y-0.5">
          {history.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 italic">
              No tasks yet. Start by asking a question.
            </div>
          ) : (
            history.map((task) => (
              <div 
                key={task.id} 
                className={`
                  task-item p-2 rounded cursor-pointer flex items-center
                  ${currentTask?.id === task.id ? 'bg-[rgba(var(--code-bg),1)]' : 'hover:bg-[rgba(var(--code-bg),0.5)]'}
                `}
              >
                <div className={`
                  checkmark-circle mr-2
                  ${task.status === 'completed' ? 'completed' : ''}
                `}>
                  {task.status === 'completed' && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-3 w-3 text-white" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                  {task.status === 'running' && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <p className="text-sm truncate">{task.title}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Settings */}
      <div className="p-3 border-t border-[rgba(var(--border-color),0.5)]">
        <button
          type="button"
          className="w-full flex items-center p-2 rounded hover:bg-[rgba(var(--code-bg),0.5)] text-gray-400"
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2"
            aria-hidden="true"
          >
            <path 
              d="M12 15a3 3 0 100-6 3 3 0 000 6z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
} 