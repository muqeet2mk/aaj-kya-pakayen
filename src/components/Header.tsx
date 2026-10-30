import React from 'react';
import { useApp } from '../context/AppContext';
import { UtensilsCrossed, Plus, Globe } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const { activeTab, setActiveTab, language, setLanguage, t } = useApp();

  const navItems: Array<{ id: 'home' | 'library' | 'calendar' | 'reports' | 'settings'; label: string }> = [
    { id: 'home', label: t.nav.home },
    { id: 'library', label: t.nav.library },
    { id: 'calendar', label: t.nav.calendar },
    { id: 'reports', label: t.nav.reports },
    { id: 'settings', label: t.nav.settings },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E2D9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left text-[#231E1B] group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#BD5338] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#231E1B] whitespace-nowrap">
              {language === 'ur' ? 'آج کیا پکائیں؟' : 'Aaj Kya Pakayen?'}
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 Clean Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C534E]">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#BD5338] font-semibold'
                    : 'hover:text-[#231E1B]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BD5338] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action & Language Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}
            className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-lg border border-[#DCD5C9] bg-white/70 hover:bg-white text-xs font-semibold text-[#4A423D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#BD5338]" />
            <span className="whitespace-nowrap">{language === 'en' ? 'اردو' : 'English'}</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#BD5338] hover:bg-[#A9452C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.nav.addDish}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
