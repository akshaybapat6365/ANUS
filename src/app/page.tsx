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
    if (resultRef.current && activeTask) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [activeTask]);

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
  
  // Dummy code for display in the code editor
  const codeExample = `import sys
import os
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Initialize API client
client = ApiClient()

# Create directory for charts if it doesn't exist
if not os.path.exists('../charts'):
    os.makedirs('../charts')

print("Analyzing Tesla's financial data...")

# Since Yahoo Finance API doesn't directly provide income statement, balance sheet,
# and cash flow data,
# we'll create a comprehensive analysis based on available data and supplement with
# research

# Financial data for Tesla (manually compiled from recent quarterly and annual
# reports)
# This data would typically come from financial APIs, but we'll use this for
# demonstration
financial_data = {
    'revenue': {
        '2019': 24578,
        '2020': 31536,
        '2021': 53823,
        '2022': 81462,
        '2023': 96773,
    }
}`;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation */}
      <header className="h-14 border-b border-[rgba(var(--border-color),0.5)] flex items-center justify-between px-4">
        <div className="flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Manus logo">
            <title>Manus</title>
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-2 text-lg font-semibold">manus</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-base font-normal mr-8">Comprehensive Tesla Stock Analysis and Investment Insights</span>
          <button aria-label="Share link" className="mr-4 p-1 hover:bg-[rgba(255,255,255,0.1)] rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <title>Share</title>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 7a3 3 0 11-6 0 3 3 0 016 0zM10 12a3 3 0 11-6 0 3 3 0 016 0zM20 17a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button aria-label="Clone document" className="mr-4 p-1 hover:bg-[rgba(255,255,255,0.1)] rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <title>Clone</title>
              <path d="M20 8h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a href="#" className="manus-button">Log in</a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Conversation */}
        <div className="w-[55%] flex flex-col bg-[rgb(var(--background-rgb))]">
          {/* Instruction area */}
          <div className="p-5 border-b border-[rgba(var(--border-color),0.5)] overflow-y-auto max-h-[300px]">
            <div className="p-6 rounded-md bg-[rgba(var(--sidebar-bg),0.5)] mb-2">
              <h2 className="text-base font-medium mb-4">I'd like a thorough analysis of Tesla stock, including:</h2>
              <ul className="list-none pl-0 space-y-2">
                <li>Summary: Company overview, key metrics, performance data and investment recommendations</li>
                <li>Financial Data: Revenue trends, profit margins, balance sheet and cash flow analysis</li>
                <li>Market Sentiment: Analyst ratings, sentiment indicators and news impact</li>
                <li>Technical Analysis: Price trends, technical indicators and support/resistance levels</li>
                <li>Compare Assets: Market share and financial metrics vs. key competitors</li>
                <li>Value Investor: Intrinsic value, growth potential and risk factors</li>
                <li>Investment Thesis: SWOT analysis and recommendations for different investor types</li>
              </ul>
            </div>
            <div className="mb-1 flex items-center">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[rgba(var(--accent-rgb),0.2)] text-xs mr-2 text-[rgb(var(--accent-rgb))]">1</span>
              <span className="text-sm text-gray-400">Connected to datasource(6)</span>
              <button aria-label="Toggle dropdown" className="ml-1 p-1 hover:bg-[rgba(255,255,255,0.1)] rounded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <title>Toggle</title>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tasks and steps */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="pl-5 mb-4">
              <div className="flex items-start">
                <div className="flex items-center mt-1 mr-2">
                  <div className="checkmark-circle completed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-label="Completed item">
                      <title>Completed</title>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <button 
                    type="button"
                    className="w-full text-left flex items-center text-gray-300 hover:text-white"
                    aria-label="Expand task"
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
                    onClick={() => {}}
                  >
                    <span className="flex-1">Create comprehensive Tesla stock analysis task list</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="pl-5 mb-4">
              <div className="flex items-start">
                <div className="flex items-center mt-1 mr-2">
                  <div className="checkmark-circle completed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-label="Completed item">
                      <title>Completed</title>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-gray-300">Creating a plan for Tesla stock analysis</div>
                  <div className="bg-[rgba(var(--sidebar-bg),0.3)] rounded p-2 mt-1 text-sm">
                    <div className="mb-1 flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 mr-1">
                        <path d="M8 9h8M8 13h6M8 17h4M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-gray-400">Executing command</span>
                    </div>
                    <code className="block text-xs text-gray-300 bg-[rgba(0,0,0,0.2)] p-2 rounded font-mono">mkdir -p tesla_analysis && cd tesla_analysis && touch todo.md</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="pl-5 mb-4">
              <div className="flex items-start">
                <div className="flex items-center mt-1 mr-2">
                  <div className="checkmark-circle completed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-label="Completed item">
                      <title>Completed</title>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-gray-300">Creating a todo list for Tesla stock analysis</div>
                  <div className="bg-[rgba(var(--sidebar-bg),0.3)] rounded p-2 mt-1 text-sm">
                    <div className="mb-1 flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 mr-1">
                        <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-gray-400">Creating file</span>
                    </div>
                    <code className="block text-xs text-gray-300 font-mono">tesla_analysis/todo.md</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="pl-5 mb-4">
              <div className="flex items-start">
                <div className="flex items-center mt-1 mr-2">
                  <div className="checkmark-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor" aria-label="In progress item">
                      <title>In progress</title>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-gray-300">Collect and analyze Tesla's financial data</div>
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-[rgba(var(--border-color),0.5)] p-4">
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Ask a follow-up question..."
                className="flex-1 bg-[rgba(var(--code-bg),0.6)] border border-[rgba(var(--border-color),0.7)] rounded px-4 py-2 text-sm"
                aria-label="Ask a follow-up question"
              />
            </div>
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>
        </div>

        {/* Right panel - Code Editor */}
        <div className="w-[45%] border-l border-[rgba(var(--border-color),0.5)] bg-[rgb(var(--editor-bg))]">
          {/* Editor header */}
          <div className="border-b border-[rgba(var(--border-color),0.5)] p-3 flex justify-between items-center">
            <div className="flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-base font-medium">Manus's Computer</span>
              <button className="ml-1 opacity-40 hover:opacity-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Expand">
                  <title>Expand</title>
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <span>Manus is using</span>
              <span className="ml-1 text-white">Editor</span>
            </div>
          </div>

          {/* Editor content */}
          <div className="p-3">
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Creating file</span>
              <span className="ml-1 text-gray-300">tesla_analysis/data/tesla_financial_analysis.py</span>
            </div>

            <div className="bg-[rgb(var(--code-bg))] rounded-md p-3">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <div>tesla_financial_analysis.py</div>
                <div className="flex items-center">
                  <button className="opacity-60 hover:opacity-100 p-1">Diff</button>
                  <button className="opacity-60 hover:opacity-100 p-1">Original</button>
                  <button className="text-white p-1">Modified</button>
                </div>
              </div>

              <div className="code-editor overflow-auto text-xs" style={{maxHeight: "calc(100vh - 250px)"}}>
                <pre className="text-gray-300 whitespace-pre">{codeExample.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="line-number">{i+1}</span>
                    <span>{line}</span>
                  </div>
                ))}</pre>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center text-gray-400 text-sm">
                <button aria-label="Previous" className="opacity-60 hover:opacity-100 p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <title>Previous</title>
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button aria-label="Next" className="opacity-60 hover:opacity-100 p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <title>Next</title>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="ml-2">3/10</div>
              </div>
              <div className="flex items-center">
                <div className="bg-[rgb(var(--accent-rgb))] rounded-full w-3 h-3 mr-1.5"></div>
                <span className="text-sm">Manus is working: Collect and analyze Tesla's financial data</span>
                <button className="ml-2 opacity-40 hover:opacity-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Expand">
                    <title>Expand</title>
                    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-400 text-xs">0:00 Using terminal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
