import React from 'react';
import { Home, Camera, BookOpen, PenTool } from 'lucide-react';

type Page = 'home' | 'scanner' | 'reader' | 'creator' | 'settings' | 'about';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isEnglish: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isEnglish }) => {
  const navItems = [
    {
      id: 'home' as Page,
      icon: Home,
      labelEn: 'Home',
      labelZh: '首頁'
    },
    {
      id: 'creator' as Page,
      icon: PenTool,
      labelEn: 'Create',
      labelZh: '創作'
    },
    {
      id: 'reader' as Page,
      icon: BookOpen,
      labelEn: 'Read',
      labelZh: '閱讀'
    },
    {
      id: 'scanner' as Page,
      icon: Camera,
      labelEn: 'Scan',
      labelZh: '掃描'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-40">
      <div className="max-w-6xl mx-auto px-3">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center space-y-0.5 py-1.5 px-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-25'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`}
                />
                <span className="text-xs font-medium">
                  {isEnglish ? item.labelEn : item.labelZh}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;