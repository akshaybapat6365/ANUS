'use client';

import React, { useState, useEffect } from 'react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';

export default function Home() {
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiTest, setApiTest] = useState<Record<string, any> | null>(null);
  const [debug, setDebug] = useState<Record<string, any>>({});

  // Add debug info
  const addDebugInfo = (key: string, data: any) => {
    setDebug(prev => ({ ...prev, [key]: data }));
  };

  // Test the API connection on load
  useEffect(() => {
    fetch('/api/test')
      .then(res => res.json())
      .then(data => {
        setApiTest(data);
        addDebugInfo('api_test', data);
        console.log('API test result:', data);
      })
      .catch(err => {
        console.error('API test error:', err);
        setError(`API test failed: ${err.message}`);
        addDebugInfo('api_test_error', err.message);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');
    setDebug({});

    try {
      addDebugInfo('request', {
        prompt: message,
        mode: 'single'
      });

      // Use our proxy API
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          mode: 'single'
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        addDebugInfo('response_error', {
          status: res.status,
          text: errorText
        });
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      addDebugInfo('task_created', data);
      console.log('Task created:', data);

      if (data.status === 'completed' && data.result) {
        // Handle immediate response
        const result = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
        setResponse(result);
        addDebugInfo('immediate_result', result);
        setIsLoading(false);
        return;
      }

      // Poll for result
      const taskId = data.task_id;
      
      const checkResult = async () => {
        try {
          addDebugInfo('polling_task', taskId);
          const statusRes = await fetch(`/api/proxy?taskId=${taskId}`);
          
          if (!statusRes.ok) {
            const errorText = await statusRes.text();
            addDebugInfo('polling_error', {
              status: statusRes.status,
              text: errorText
            });
            throw new Error(`Status API error: ${statusRes.status} - ${errorText}`);
          }

          const statusData = await statusRes.json();
          addDebugInfo('task_status', statusData);
          console.log('Task status:', statusData);

          if (statusData.status === 'completed' && statusData.result) {
            // Complete
            const result = typeof statusData.result === 'string' 
              ? statusData.result 
              : JSON.stringify(statusData.result, null, 2);
            setResponse(result);
            addDebugInfo('final_result', result);
            setIsLoading(false);
          } else if (statusData.status === 'failed') {
            // Failed
            const errorMsg = statusData.result?.error || 'Unknown error';
            setError(`Task failed: ${errorMsg}`);
            addDebugInfo('task_failed', errorMsg);
            setIsLoading(false);
          } else {
            // Still running, check again in 1 second
            addDebugInfo('still_running', statusData.status);
            setTimeout(checkResult, 1000);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error('Error checking status:', err);
          setError(`Error checking status: ${errorMsg}`);
          addDebugInfo('status_check_error', errorMsg);
          setIsLoading(false);
        }
      };

      checkResult();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error:', err);
      setError(`Error: ${errorMsg}`);
      addDebugInfo('submit_error', errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gray-900 text-white">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-center">ANUS Test Interface</h1>
          <Link 
            href="/settings" 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
          >
            Settings
          </Link>
        </div>
        
        {/* API Test Results */}
        <div className="bg-gray-800 rounded-lg p-4 mt-4">
          <h2 className="text-xl font-semibold mb-2">API Test Results</h2>
          {apiTest ? (
            <pre className="whitespace-pre-wrap bg-gray-700 p-4 rounded text-sm">{JSON.stringify(apiTest, null, 2)}</pre>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <div>Loading API test results...</div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
          <div className="flex flex-col gap-4">
            <label htmlFor="message" className="text-lg font-medium">
              Enter your message:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full p-4 border rounded-md bg-gray-700 border-gray-600 text-white"
              rows={3}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`px-6 py-3 rounded-md font-medium bg-indigo-600 hover:bg-indigo-500 transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Send Request'}
            </button>
          </div>
        </form>

        {/* Response or Error Display */}
        {response && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Response:</h2>
            <pre className="whitespace-pre-wrap bg-gray-700 p-4 rounded text-sm">{response}</pre>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 p-4 rounded-lg text-red-200">
            <h2 className="text-lg font-semibold mb-1">Error:</h2>
            <p>{error}</p>
          </div>
        )}
        
        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-4 mt-4 text-gray-300">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <pre className="whitespace-pre-wrap bg-gray-700 p-4 rounded text-sm">{JSON.stringify(debug, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
