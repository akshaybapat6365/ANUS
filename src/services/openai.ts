import type { CompletionResponse, StreamingCompletionResponse } from '../types';

// API base URL
const API_BASE_URL = 'https://api.openai.com/v1';

// Access token from environment variable
const getApiKey = () => {
  // In Next.js, use environment variables
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
};

// Refactor this to use your own API key or server-side handling for security
// This is just for demonstration purposes
// In a real app, you should never expose your API key in client-side code
const headers = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
});

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAICompletionOptions {
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  messages: OpenAIMessage[];
}

/**
 * Get completions from OpenAI API
 */
export async function getCompletion(options: OpenAICompletionOptions): Promise<CompletionResponse> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable.');

  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get completion from OpenAI API');
  }

  const data = await response.json();
  return data;
}

/**
 * Stream completions from OpenAI API
 */
export async function streamCompletion(
  options: OpenAICompletionOptions, 
  onChunk: (chunk: StreamingCompletionResponse) => void
): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable.');

  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to stream completion from OpenAI API');
  }

  // Process the stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  if (!reader) throw new Error('Failed to create stream reader');

  try {
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.replace(/^data: /, '').trim());

      for (const line of lines) {
        if (line === '[DONE]') {
          done = true;
          break;
        }

        try {
          const parsedLine = JSON.parse(line);
          onChunk(parsedLine);
        } catch (error) {
          console.error('Error parsing streaming response line:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/**
 * Generate a system message for the agent
 */
export function generateSystemMessage(): OpenAIMessage {
  return {
    role: 'system',
    content: `You are a helpful intelligent assistant called ANUS (Autonomous Networked Utility System).
You excel at task planning, coding, research, and creative problem-solving.
You analyze problems step by step, break tasks into subtasks, and provide detailed, accurate solutions.
You always provide explanations for your reasoning and code, making sure the user understands your approach.
When writing code, you follow best practices, include error handling, and optimize for readability and efficiency.
You can work with various programming languages and frameworks, adapting to the user's needs.
Always be respectful, helpful, and focus on providing the best possible assistance.`
  };
} 