'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiKeyForm {
  openai: string;
  google: string;
  deepseek: string;
}

interface Config {
  ai_providers?: {
    [key: string]: {
      api_key?: string;
      default_model?: string;
      available_models?: string[];
    };
  };
  agent?: {
    mode?: string;
    memory_capacity?: number;
    memory_retention_seconds?: number;
  };
  tools?: {
    enabled?: boolean;
    [key: string]: {
      enabled?: boolean;
      name?: string;
      description?: string;
      config?: Record<string, unknown>;
    };
  };
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyForm>({
    openai: '',
    google: '',
    deepseek: '',
  });
  
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load current configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy?path=/api/config');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch configuration: ${response.status}`);
        }
        
        const data = await response.json();
        setConfig(data.config);
        
        // Update API key form with masked values
        if (data.config.ai_providers) {
          const newApiKeys: ApiKeyForm = { ...apiKeys };
          Object.keys(data.config.ai_providers).forEach(provider => {
            if (provider in newApiKeys) {
              newApiKeys[provider as keyof ApiKeyForm] = 
                data.config.ai_providers[provider].api_key || '';
            }
          });
          setApiKeys(newApiKeys);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        console.error('Error loading configuration:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  const handleInputChange = (provider: keyof ApiKeyForm, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };
  
  const saveApiKey = async (provider: string) => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      const response = await fetch('/api/proxy?path=/api/config/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          api_key: apiKeys[provider as keyof ApiKeyForm],
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save API key: ${errorText}`);
      }
      
      const data = await response.json();
      setSuccessMessage(`${provider} API key saved successfully`);
      
      // Refresh config
      const configResponse = await fetch('/api/proxy?path=/api/config');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfig(configData.config);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
      console.error('Error saving API key:', err);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col p-6 bg-gray-900 text-white">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">ANUS Settings</h1>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
          >
            Back to Home
          </Link>
        </div>
        
        {/* API Keys Section */}
        <div className="bg-gray-800 rounded-lg p-6 mt-4">
          <h2 className="text-xl font-semibold mb-4">AI Provider API Keys</h2>
          
          {loading ? (
            <p>Loading configuration...</p>
          ) : (
            <div className="space-y-6">
              {/* OpenAI */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="openai" className="text-lg font-medium">
                    OpenAI API Key
                    {config?.ai_providers?.openai?.default_model && (
                      <span className="ml-2 text-sm text-gray-400">
                        (Default: {config.ai_providers.openai.default_model})
                      </span>
                    )}
                  </label>
                  <button 
                    onClick={() => saveApiKey('openai')}
                    disabled={saving}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 rounded text-sm transition"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <input
                  id="openai"
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => handleInputChange('openai', e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                {config?.ai_providers?.openai?.available_models && (
                  <div className="text-sm text-gray-400 mt-1">
                    Available models: {config.ai_providers.openai.available_models.join(', ')}
                  </div>
                )}
              </div>
              
              {/* Google Gemini */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="google" className="text-lg font-medium">
                    Google Gemini API Key
                    {config?.ai_providers?.google?.default_model && (
                      <span className="ml-2 text-sm text-gray-400">
                        (Default: {config.ai_providers.google.default_model})
                      </span>
                    )}
                  </label>
                  <button 
                    onClick={() => saveApiKey('google')}
                    disabled={saving}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 rounded text-sm transition"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <input
                  id="google"
                  type="password"
                  value={apiKeys.google}
                  onChange={(e) => handleInputChange('google', e.target.value)}
                  placeholder="Enter your Google Gemini API key"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                {config?.ai_providers?.google?.available_models && (
                  <div className="text-sm text-gray-400 mt-1">
                    Available models: {config.ai_providers.google.available_models.join(', ')}
                  </div>
                )}
              </div>
              
              {/* DeepSeek */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="deepseek" className="text-lg font-medium">
                    DeepSeek API Key
                    {config?.ai_providers?.deepseek?.default_model && (
                      <span className="ml-2 text-sm text-gray-400">
                        (Default: {config.ai_providers.deepseek.default_model})
                      </span>
                    )}
                  </label>
                  <button 
                    onClick={() => saveApiKey('deepseek')}
                    disabled={saving}
                    className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 rounded text-sm transition"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <input
                  id="deepseek"
                  type="password"
                  value={apiKeys.deepseek}
                  onChange={(e) => handleInputChange('deepseek', e.target.value)}
                  placeholder="Enter your DeepSeek API key"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
                {config?.ai_providers?.deepseek?.available_models && (
                  <div className="text-sm text-gray-400 mt-1">
                    Available models: {config.ai_providers.deepseek.available_models.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-800 rounded-md text-green-300">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-300">
              {error}
            </div>
          )}
        </div>
        
        {/* Other Settings Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Agent Settings</h2>
          
          {loading ? (
            <p>Loading configuration...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Default Agent Mode</h3>
                <div className="text-gray-300">
                  {config?.agent?.mode === 'single' ? 'Single Agent' : 'Multi Agent'}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Memory Capacity</h3>
                <div className="text-gray-300">
                  {config?.agent?.memory_capacity || 'Unknown'} items
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Tools Enabled</h3>
                <div className="text-gray-300">
                  {config?.tools?.enabled ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 