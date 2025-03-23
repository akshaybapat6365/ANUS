'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [task, setTask] = useState('');
  const [mode, setMode] = useState('single');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of results when new content is added
  useEffect(() => {
    if (resultRef.current && result) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  const handleSubmit = async () => {
    if (!task.trim()) {
      setError('Please enter a task description');
      return;
    }

    setError('');
    setLoading(true);
    setResult('');
    
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

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 p-4 bg-gray-900">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">ANUS</h1>
            <div className="ml-2 px-2 py-1 rounded-md bg-blue-600 text-xs font-medium">BETA</div>
          </div>
          <p className="text-sm text-gray-400">Autonomous Networked Utility System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 mt-8">
            <h2 className="text-4xl font-bold mb-4">AI Agent Framework</h2>
            <p className="text-xl text-gray-400 mb-8">
              Execute complex tasks through natural language instructions
            </p>
          </div>

          {/* Task Input */}
          <div className="bg-gray-900 rounded-lg p-6 mb-8 shadow-card">
            <h3 className="text-xl font-semibold mb-4">Enter a Task</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Describe your task here..." 
                className="flex-grow bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select 
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                aria-label="Agent mode" 
                className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single Agent</option>
                <option value="multi">Multi Agent</option>
                <option value="auto">Auto</option>
              </select>
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading}
                className={`${loading ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md px-6 py-2 transition-colors flex items-center justify-center min-w-[120px]`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Loading indicator">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing
                  </span>
                ) : 'Run Task'}
              </button>
            </div>
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>

          {/* Results Area */}
          <div className="bg-gray-900 rounded-lg p-6 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Results</h3>
              {result && (
                <button 
                  type="button"
                  onClick={() => setResult('')}
                  className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div 
              ref={resultRef}
              className="bg-gray-800 rounded-md p-4 min-h-[300px] max-h-[500px] overflow-y-auto font-mono text-sm"
            >
              {result ? (
                <div className="whitespace-pre-wrap">{result}</div>
              ) : (
                <div className="text-gray-400 h-full flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Empty results icon">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <p>Your task results will appear here...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 text-center text-gray-500 text-sm bg-gray-900">
        <p>ANUS - Autonomous Networked Utility System | <a href="https://github.com/akshaybapat6365/ANUS" className="text-blue-400 hover:underline">GitHub</a></p>
      </footer>
    </div>
  );
}
