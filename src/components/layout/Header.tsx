'use client';

import { Menu } from 'lucide-react';
import PortfolioPanel from './PortfolioPanel';

interface HeaderProps {
  title:     string;
  breadcrumb?: string;
  actions?:  React.ReactNode;
  onMenuToggle?: () => void;
}

export default function Header({ title, breadcrumb, actions, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between min-h-[72px] bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 md:px-8 py-3.5 gap-4">
      
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <button 
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-[12px] bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors shrink-0 shadow-sm"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {breadcrumb && (
            <div className="text-[10px] md:text-[11px] text-gray-500 mb-0.5 font-bold tracking-widest uppercase truncate">
              {breadcrumb}
            </div>
          )}
          <h1 className="text-[18px] md:text-[20px] font-bold text-gray-900 m-0 tracking-tight truncate leading-none">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {actions && (
          <div className="hidden sm:flex items-center gap-2">
            {actions}
          </div>
        )}
        <div className="flex-shrink-0">
          <PortfolioPanel />
        </div>
      </div>

    </header>
  );
}