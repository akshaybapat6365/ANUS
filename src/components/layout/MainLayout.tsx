import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[rgb(var(--background-rgb))]">
      {/* Top navigation bar */}
      <TopNavBar />
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Content area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 