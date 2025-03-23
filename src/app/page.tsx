'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [task, setTask] = useState('');
  const [mode, setMode] = useState('single');
  const [results, setResults] = useState<Array<{id: string, task: string, result: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of results when new content is added
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [results, activeTask]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!task.trim()) {
      setError('Please enter a task description');
      return;
    }

    setError('');
    setLoading(true);
    
    const taskId = `task-${Date.now()}`;
    const newTask = {
      id: taskId,
      task: task,
      result: ''
    };
    
    setResults(prev => [...prev, newTask]);
    setActiveTask(taskId);
    
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, mode }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process task');
      }

      setResults(prev => 
        prev.map(t => 
          t.id === taskId 
            ? { ...t, result: data.result } 
            : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setResults(prev => 
        prev.map(t => 
          t.id === taskId 
            ? { ...t, result: `Error: ${err instanceof Error ? err.message : 'An unexpected error occurred'}` } 
            : t
        )
      );
    } finally {
      setLoading(false);
      setTask('');
    }
  };

  const getCurrentTaskResult = () => {
    if (!activeTask) return null;
    return results.find(r => r.id === activeTask);
  };

  const currentTaskResult = getCurrentTaskResult();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-[rgb(var(--sidebar-bg))] border-r border-[rgba(var(--border-color),0.5)] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[rgba(var(--border-color),0.5)] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <h1 className="text-xl font-bold">ANUS</h1>
        </div>
        
        {/* Task History */}
        <div className="flex-1 overflow-auto p-1">
          <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Task History</p>
          <div className="space-y-0.5">
            {results.map((result) => (
              <div 
                key={result.id} 
                className={`task-item p-2 rounded cursor-pointer flex items-center ${activeTask === result.id ? 'bg-[rgba(var(--code-bg),1)]' : 'hover:bg-[rgba(var(--code-bg),0.5)]'}`}
                onClick={() => setActiveTask(result.id)}
              >
                <div className={`checkmark-circle mr-2 ${result.result ? 'completed' : ''}`}>
                  {result.result && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="truncate flex-1">
                  <p className="text-sm truncate">{result.task}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="p-3 border-t border-[rgba(var(--border-color),0.5)]">
          <label className="text-xs text-gray-400 block mb-1.5">Agent Mode</label>
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-[rgba(var(--code-bg),1)] border border-[rgba(var(--border-color),0.5)] rounded px-2 py-1.5 text-sm"
          >
            <option value="single">Single Agent</option>
            <option value="multi">Multi Agent</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[rgb(var(--editor-bg))]">
        {/* Header */}
        <div className="border-b border-[rgba(var(--border-color),0.5)] p-4 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">Task Runner</h2>
            <div className="ml-2 px-2 py-0.5 rounded-md bg-blue-600 text-xs font-medium">BETA</div>
          </div>
          <p className="text-sm text-gray-400">Autonomous Networked Utility System</p>
        </div>
        
        {/* Task Results Area */}
        <div className="flex-1 overflow-auto p-4" ref={resultRef}>
          {!results.length ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-lg">Enter a task to get started</p>
              <p className="text-sm mt-2">Example: "Research the latest advancements in AI"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentTaskResult && (
                <div className="conversation-item">
                  <div className="flex items-start mb-4">
                    <div className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-sm font-semibold">Q</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Your task:</p>
                      <p className="text-white">{currentTaskResult.task}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="text-sm font-semibold">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm mb-1">Result:</p>
                      {!currentTaskResult.result && loading ? (
                        <div className="p-3 bg-[rgba(var(--code-bg),1)] rounded code-font">
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing task<span className="terminal-cursor"></span>
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 bg-[rgba(var(--code-bg),1)] rounded code-font whitespace-pre-wrap">
                          {currentTaskResult.result || "Waiting for response..."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t border-[rgba(var(--border-color),0.5)] p-4">
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter your task here..."
              className="flex-1 bg-[rgba(var(--code-bg),1)] border border-[rgba(var(--border-color),0.5)] rounded-l px-4 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`${loading ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-r px-4 py-2 transition-colors`}
            >
              {loading ? (
                <span>Running...</span>
              ) : 'Run Task'}
            </button>
          </div>
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
