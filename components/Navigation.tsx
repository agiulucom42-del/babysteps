
import React from 'react';
import { Home, Book, Activity, Ruler, MessageCircleHeart } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  themeColor: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView, themeColor }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Özet' },
    { id: 'diary', icon: Book, label: 'Günlük' },
    { id: 'growth', icon: Ruler, label: 'Gelişim' },
    { id: 'health', icon: Activity, label: 'Aşılar' },
    { id: 'ai-chat', icon: MessageCircleHeart, label: 'Asistan' },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-${themeColor}-100 pb-safe pt-2 px-4 shadow-lg z-50`}>
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                isActive ? `text-${themeColor}-500` : `text-slate-400 hover:text-${themeColor}-300`
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;