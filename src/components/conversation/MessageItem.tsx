import React from 'react';
import type { Message } from '../../types';
import CodeBlock from '../ui/CodeBlock';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageItem({ message, isStreaming = false }: MessageItemProps) {
  // Function to format and render message content with code blocks
  const renderContent = () => {
    const content = message.content;
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all code blocks and split the content
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
      });
    }

    // If no code blocks found, just return the content as text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: content,
      });
    }

    // Render each part
    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <CodeBlock
            key={index}
            code={part.content}
            language={part.language}
          />
        );
      } else {
        return (
          <div 
            key={index} 
            className="whitespace-pre-line mb-3"
            dangerouslySetInnerHTML={{ __html: formatTextWithMarkdown(part.content) }}
          />
        );
      }
    });
  };

  // Simple markdown-like formatting for text
  const formatTextWithMarkdown = (text: string) => {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
      // Italic
      .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
      // Line breaks
      .replace(/\n/g, '<br />');
  };

  return (
    <div className={`mb-6 ${message.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}>
      <div className="flex items-start">
        {/* Avatar for the message sender */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0
          ${message.role === 'user' ? 'bg-gray-700' : 'bg-[rgb(var(--accent-rgb))]'}
        `}>
          <span className="text-sm font-semibold">
            {message.role === 'user' ? 'U' : 'A'}
          </span>
        </div>

        {/* Message content */}
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1">
            {message.role === 'user' ? 'User' : 'ANUS'} - {formatTimestamp(message.timestamp)}
          </div>
          <div className={`
            p-3 rounded-md
            ${message.role === 'user' 
              ? 'bg-gray-700' 
              : isStreaming 
                ? 'bg-[rgba(var(--accent-rgb),0.15)] border border-[rgba(var(--accent-rgb),0.3)]' 
                : 'bg-[rgba(var(--code-bg),1)]'
            }
          `}>
            {renderContent()}
            {isStreaming && (
              <span className="inline-block h-4 w-2 bg-white animate-pulse ml-1"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
} 