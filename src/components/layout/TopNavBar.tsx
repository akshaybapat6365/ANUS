import React from 'react';

export default function TopNavBar() {
  return (
    <header className="h-14 border-b border-[rgba(var(--border-color),0.5)] flex items-center justify-between px-4">
      <div className="flex items-center">
        <span className="text-base font-normal">Autonomous Networked Utility System</span>
      </div>
      
      <div className="flex items-center">
        <button 
          type="button"
          className="bg-[rgb(var(--accent-rgb))] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[rgba(var(--accent-rgb),0.9)] transition-colors"
          onClick={() => alert('Login functionality would be implemented here')}
        >
          Log in
        </button>
      </div>
    </header>
  );
} 