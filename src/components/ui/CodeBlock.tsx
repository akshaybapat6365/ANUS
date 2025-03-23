import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Simple function to determine language class for syntax highlighting
  // In a real app, you'd use a library like Prism.js or highlight.js
  const getLanguageClass = (lang: string) => {
    const normalizedLang = lang.toLowerCase();
    const supportedLanguages = [
      'javascript', 'typescript', 'python', 'html', 'css', 
      'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php'
    ];
    
    return supportedLanguages.includes(normalizedLang) 
      ? `language-${normalizedLang}` 
      : 'language-plaintext';
  };
  
  return (
    <div className="relative bg-[rgba(var(--code-bg),0.5)] rounded-md mb-4 overflow-hidden group">
      {/* Language tag */}
      {language && (
        <div className="absolute top-2 right-2 bg-[rgba(var(--border-color),0.7)] px-2 py-1 rounded text-xs text-gray-400">
          {language}
        </div>
      )}
      
      {/* Copy button */}
      <button
        type="button"
        onClick={copyToClipboard}
        className="absolute top-2 right-14 bg-[rgba(var(--border-color),0.7)] px-2 py-1 rounded text-xs text-gray-400 hover:bg-[rgba(var(--border-color),1)] transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      
      {/* Code content */}
      <pre className={`p-4 pt-10 overflow-x-auto ${getLanguageClass(language)}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
} 