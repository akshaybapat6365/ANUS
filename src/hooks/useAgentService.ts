import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAgent } from '../contexts/AgentContext';
import type { Message, Task } from '../types';

export default function useAgentService() {
  const { state, startTask, completeTask, failTask, addSubtask } = useAgent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [agentMode, setAgentMode] = useState<'single' | 'multi'>('single');

  // Process a user request
  const processRequest = useCallback(async (userMessage: string, mode?: 'single' | 'multi') => {
    // Set the agent mode
    const taskMode = mode || agentMode;
    
    // Add user message to history
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Start a new task with the specified mode
    setIsStreaming(true);
    setStreamedResponse('Thinking...');

    try {
      // Start task through the agent context (which now uses our backend API)
      await startTask(userMessage, taskMode);
      
      // The agent context now handles polling for results
      // We'll get results through state updates
      
      // We can simulate the streaming by updating streamedResponse
      // when we see that the state has changed
      const checkInterval = setInterval(() => {
        if (state.currentTask?.status === 'completed' && state.currentTask?.result) {
          // Clear the interval
          clearInterval(checkInterval);
          
          // Add the completed response to messages
          const assistantMsg: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: state.currentTask.result,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMsg]);
          setStreamedResponse('');
          setIsStreaming(false);
        } else if (state.status === 'error') {
          // Clear the interval on error
          clearInterval(checkInterval);
          setStreamedResponse('');
          setIsStreaming(false);
        }
      }, 500);
      
      // Set a timeout to clear the interval if it takes too long
      setTimeout(() => {
        clearInterval(checkInterval);
        if (isStreaming) {
          setIsStreaming(false);
          failTask('Task timed out - no response from backend');
        }
      }, 300000); // 5 minute timeout
      
    } catch (error) {
      failTask(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsStreaming(false);
    }
  }, [messages, startTask, failTask, agentMode, state]);

  // Toggle agent mode
  const toggleAgentMode = useCallback(() => {
    setAgentMode(prev => prev === 'single' ? 'multi' : 'single');
  }, []);

  // Execute code or commands
  const executeCode = useCallback(async (code: string, language: string) => {
    // In the unified version, this would connect to our backend API
    // For now, we'll simulate execution with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a simulated result
    return {
      success: true,
      output: `[Execution via backend] ${language} code executed successfully`,
    };
  }, []);

  return {
    messages,
    isStreaming,
    streamedResponse,
    processRequest,
    executeCode,
    agentMode,
    toggleAgentMode,
    currentTask: state.currentTask,
    taskHistory: state.history,
    status: state.status,
    error: state.error,
  };
} 