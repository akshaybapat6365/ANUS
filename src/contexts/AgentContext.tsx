import React, { createContext, useContext, useReducer, type ReactNode, useCallback } from 'react';
import type { AgentState, AgentAction, Task } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { agentService } from '../services/agentService';
import type { StatusResponse } from '../types/api';

// Initial state
const initialState: AgentState = {
  status: 'idle',
  history: [],
  error: undefined,
};

// Action types
const ActionTypes = {
  START_TASK: 'START_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  FAIL_TASK: 'FAIL_TASK',
  ADD_SUBTASK: 'ADD_SUBTASK',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE',
};

// Reducer
function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case ActionTypes.START_TASK: {
      const newTask = action.payload as Task;
      return {
        ...state,
        status: 'executing',
        currentTask: newTask,
        history: [...state.history, newTask],
        error: undefined,
      };
    }
    case ActionTypes.COMPLETE_TASK: {
      if (!state.currentTask) return state;
      
      const updatedTask = {
        ...state.currentTask,
        status: 'completed' as const,
        result: action.payload as string,
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        status: 'idle',
        currentTask: updatedTask,
        history: state.history.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        ),
      };
    }
    case ActionTypes.FAIL_TASK: {
      if (!state.currentTask) return state;
      
      const updatedTask = {
        ...state.currentTask,
        status: 'failed' as const,
        updatedAt: new Date(),
      };
      
      return {
        ...state,
        status: 'error',
        currentTask: updatedTask,
        history: state.history.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        ),
        error: action.payload as string,
      };
    }
    case ActionTypes.ADD_SUBTASK: {
      if (!state.currentTask) return state;
      
      const subtask = action.payload as Task;
      const updatedTask = {
        ...state.currentTask,
        subtasks: [...state.currentTask.subtasks, subtask],
      };
      
      return {
        ...state,
        currentTask: updatedTask,
        history: state.history.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        ),
      };
    }
    case ActionTypes.SET_ERROR: {
      return {
        ...state,
        status: 'error',
        error: action.payload as string,
      };
    }
    case ActionTypes.CLEAR_ERROR: {
      return {
        ...state,
        status: state.status === 'error' ? 'idle' : state.status,
        error: undefined,
      };
    }
    case ActionTypes.RESET_STATE: {
      return initialState;
    }
    default:
      return state;
  }
}

// Context
interface AgentContextType {
  state: AgentState;
  startTask: (title: string, mode?: 'single' | 'multi') => Promise<void>;
  completeTask: (result: string) => void;
  failTask: (error: string) => void;
  addSubtask: (title: string) => void;
  clearError: () => void;
  setError: (error: string) => void;
  resetState: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Provider
interface AgentProviderProps {
  children: ReactNode;
}

export function AgentProvider({ children }: AgentProviderProps) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  const startTask = useCallback(async (title: string, mode: 'single' | 'multi' = 'single') => {
    const newTask: Task = {
      id: uuidv4(),
      title,
      status: 'running',
      createdAt: new Date(),
      updatedAt: new Date(),
      subtasks: [],
    };

    dispatch({ 
      type: ActionTypes.START_TASK, 
      payload: newTask
    });

    try {
      // Call our backend API
      const response = await agentService.submitTask({
        prompt: title,
        mode: mode
      });
      
      // If we get an immediate response (simulation mode)
      if (response.status === 'completed' && response.result) {
        // Process the immediate result
        const resultString = typeof response.result === 'string' 
          ? response.result 
          : JSON.stringify(response.result);
          
        dispatch({ 
          type: ActionTypes.COMPLETE_TASK, 
          payload: resultString
        });
        return;
      }
      
      // Start polling for results
      agentService.pollTaskUntilComplete(
        response.task_id,
        (status: StatusResponse) => {
          // Handle status updates if needed
          // This could be used to update progress indicators
        },
      ).then((finalStatus) => {
        if (finalStatus.status === 'completed' && finalStatus.result) {
          // Task completed successfully
          const resultString = typeof finalStatus.result === 'string' 
            ? finalStatus.result 
            : JSON.stringify(finalStatus.result);
            
          dispatch({ 
            type: ActionTypes.COMPLETE_TASK, 
            payload: resultString
          });
        } else {
          // Task failed or returned unexpected result
          dispatch({ 
            type: ActionTypes.FAIL_TASK, 
            payload: 'Task failed or returned unexpected result'
          });
        }
      }).catch((error) => {
        dispatch({ 
          type: ActionTypes.FAIL_TASK, 
          payload: error instanceof Error ? error.message : 'Unknown error during task execution'
        });
      });
    } catch (error) {
      console.error('Error starting task:', error);
      dispatch({ 
        type: ActionTypes.FAIL_TASK, 
        payload: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, []);

  const completeTask = useCallback((result: string) => {
    dispatch({ 
      type: ActionTypes.COMPLETE_TASK, 
      payload: result 
    });
  }, []);

  const failTask = useCallback((error: string) => {
    dispatch({ 
      type: ActionTypes.FAIL_TASK, 
      payload: error 
    });
  }, []);

  const addSubtask = useCallback((title: string) => {
    const subtask: Task = {
      id: uuidv4(),
      title,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentTaskId: state.currentTask?.id,
      subtasks: [],
    };

    dispatch({ 
      type: ActionTypes.ADD_SUBTASK, 
      payload: subtask 
    });
  }, [state.currentTask?.id]);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ 
      type: ActionTypes.SET_ERROR, 
      payload: error 
    });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_STATE });
  }, []);

  const value = {
    state,
    startTask,
    completeTask,
    failTask,
    addSubtask,
    clearError,
    setError,
    resetState,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

// Hook
export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
} 