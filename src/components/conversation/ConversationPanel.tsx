import React, { useState, useRef, useEffect } from 'react';
import useAgentService from '../../hooks/useAgentService';
import MessageItem from './MessageItem';
import TaskProgress from './TaskProgress';

interface ConversationPanelProps {
  initialPrompt?: string;
}

export default function ConversationPanel({ initialPrompt }: ConversationPanelProps) {
  const {
    messages,
    isStreaming,
    streamedResponse,
    processRequest,
    currentTask,
    taskHistory,
    status,
    error,
    agentMode,
    toggleAgentMode,
  } = useAgentService();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamedResponse]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle initial prompt if provided
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      processRequest(initialPrompt);
    }
  }, [initialPrompt, messages.length, processRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    const userInput = input;
    setInput('');
    await processRequest(userInput);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with agent mode selector */}
      <div className="border-b border-[rgba(var(--border-color),0.5)] p-3 flex justify-between items-center">
        <h2 className="text-lg font-medium">ANUS Conversation</h2>
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">Agent Mode:</span>
          <button
            onClick={toggleAgentMode}
            className={`
              px-3 py-1 text-xs rounded-md font-medium transition-colors
              ${agentMode === 'single' 
                ? 'bg-blue-600 text-white' 
                : 'bg-purple-600 text-white'}
            `}
          >
            {agentMode === 'single' ? 'Single Agent' : 'Multi Agent'}
          </button>
        </div>
      </div>
      
      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Initial system message if conversation is empty */}
        {messages.length === 0 && !initialPrompt && (
          <div className="bg-[rgba(var(--sidebar-bg),0.5)] p-4 rounded-md mb-4">
            <h2 className="text-lg font-medium mb-2">Welcome to ANUS</h2>
            <p className="text-gray-300 mb-1">
              I'm an Autonomous Networked Utility System designed to help with:
            </p>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>Analyzing complex problems</li>
              <li>Writing and explaining code</li>
              <li>Researching topics in depth</li>
              <li>Generating creative content</li>
              <li>Breaking tasks into manageable steps</li>
            </ul>
            <p className="text-gray-300 mt-2">
              Try asking something like "Write a recursive function to calculate Fibonacci numbers" or "Explain how transformers work in AI"
            </p>
          </div>
        )}

        {/* Message history */}
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {/* Streaming response */}
        {isStreaming && (
          <MessageItem
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamedResponse,
              timestamp: new Date(),
            }}
            isStreaming={true}
          />
        )}

        {/* Task progress display */}
        {currentTask && (
          <TaskProgress task={currentTask} />
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-300 mb-4">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <div className="border-t border-[rgba(var(--border-color),0.5)] p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ANUS in ${agentMode} mode...`}
              className="flex-1 bg-[rgba(var(--code-bg),0.6)] border border-[rgba(var(--border-color),0.7)] rounded-l px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[rgb(var(--accent-rgb))]"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className={`
                bg-[rgb(var(--accent-rgb))] px-4 py-2 rounded-r text-white font-medium text-sm
                ${(isStreaming || !input.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgb(var(--accent-rgb),0.9)]'}
              `}
            >
              {isStreaming ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 