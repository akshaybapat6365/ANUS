'use client';

import { useState } from 'react';

export default function Home() {
  const [task, setTask] = useState('');
  const [mode, setMode] = useState('single');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!task.trim()) {
      setError('Please enter a task description');
      return;
    }

    setError('');
    setLoading(true);
    
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
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ANUS</h1>
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
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Enter a Task</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe your task here..." 
                className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select 
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                aria-label="Agent mode" 
                className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single Agent</option>
                <option value="multi">Multi Agent</option>
                <option value="auto">Auto</option>
              </select>
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading}
                className={`${loading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md px-6 py-2 transition-colors`}
              >
                {loading ? 'Processing...' : 'Run Task'}
              </button>
            </div>
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>

          {/* Results Area */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Results</h3>
            <div className="bg-gray-700 rounded-md p-4 min-h-[200px] font-mono text-sm">
              {result ? (
                <p>{result}</p>
              ) : (
                <p className="text-gray-400">Your task results will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 text-center text-gray-500 text-sm">
        <p>ANUS - Autonomous Networked Utility System | <a href="https://github.com/nikmcfly/ANUS" className="text-blue-400 hover:underline">GitHub</a></p>
      </footer>
    </div>
  );
}
