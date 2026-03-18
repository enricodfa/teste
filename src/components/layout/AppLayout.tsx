'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children:   React.ReactNode;
  title:      string;
  subtitle?:  string;
  actions?:   React.ReactNode;
}

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change automatically for mobile UX
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen w-full min-w-0 transition-all duration-300">
        <Header 
          title={title} 
          breadcrumb={subtitle} 
          actions={actions}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-5 md:p-7 w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}