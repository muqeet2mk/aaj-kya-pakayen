import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, BookOpen, CalendarDays, PieChart, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const tabs: Array<{ id: 'home' | 'library' | 'calendar' | 'reports' | 'settings'; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.nav.home, icon: <Home className="w-5 h-5" /> },
    { id: 'library', label: t.nav.library, icon: <BookOpen className="w-5 h-5" /> },
    { id: 'calendar', label: t.nav.calendar, icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'reports', label: t.nav.reports, icon: <PieChart className="w-5 h-5" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-lg border-t border-[#E8E2D9] px-2 py-1 safe-area-pb">
      <div className="grid grid-cols-5 items-center h-14">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isActive ? 'text-[#BD5338]' : 'text-[#786F68] hover:text-[#231E1B]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#BD5338] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'font-semibold text-[#BD5338]' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
