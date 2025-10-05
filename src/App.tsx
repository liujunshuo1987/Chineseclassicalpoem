import React, { useState } from 'react';
import { Camera, BookOpen, PenTool, Home, Languages, Settings, MessageCircle, Key, User } from 'lucide-react';
import HomePage from './components/HomePage';
import Scanner from './components/Scanner';
import Reader from './components/Reader';
import Creator from './components/Creator';
import SettingsPage from './components/SettingsPage';
import AboutPage from './components/AboutPage';
import AccountPage from './components/AccountPage';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import MembershipModal from './components/MembershipModal';
import UserStatus from './components/UserStatus';

type Page = 'home' | 'scanner' | 'reader' | 'creator' | 'settings' | 'about' | 'account';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isEnglish, setIsEnglish] = useState(false);
  const [processedText, setProcessedText] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const toggleLanguage = () => {
    setIsEnglish(!isEnglish);
  };

  const navigateToReader = (text: string) => {
    setProcessedText(text);
    setCurrentPage('reader');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            isEnglish={isEnglish} 
            onNavigate={setCurrentPage}
            onShowAuth={() => setShowAuthModal(true)}
            onShowMembership={() => setShowMembershipModal(true)}
          />
        );
      case 'scanner':
        return (
          <Scanner 
            isEnglish={isEnglish} 
            onNavigateToReader={navigateToReader}
            onShowAuth={() => setShowAuthModal(true)}
            onShowMembership={() => setShowMembershipModal(true)}
          />
        );
      case 'reader':
        return (
          <Reader 
            isEnglish={isEnglish} 
            text={processedText}
            onShowAuth={() => setShowAuthModal(true)}
            onShowMembership={() => setShowMembershipModal(true)}
          />
        );
      case 'creator':
        return (
          <Creator 
            isEnglish={isEnglish}
            onShowAuth={() => setShowAuthModal(true)}
            onShowMembership={() => setShowMembershipModal(true)}
          />
        );
      case 'settings':
        return <SettingsPage isEnglish={isEnglish} />;
      case 'about':
        return <AboutPage isEnglish={isEnglish} />;
      case 'account':
        return (
          <AccountPage
            isEnglish={isEnglish}
            onShowMembership={() => setShowMembershipModal(true)}
          />
        );
      default:
        return <HomePage isEnglish={isEnglish} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 py-3 md:px-4 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {isEnglish ? 'Classical Chinese Literature' : '文'}
              </h1>
            </div>

            <div className="flex items-center space-x-1 md:space-x-3">
              {/* User Status */}
              <div className="hidden md:block">
                <UserStatus
                  isEnglish={isEnglish}
                  onShowAuth={() => setShowAuthModal(true)}
                  onNavigateToAccount={() => setCurrentPage('account')}
                />
              </div>

              {/* Mobile User Button */}
              <button
                onClick={() => setShowAuthModal(true)}
                className="md:hidden flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title={isEnglish ? 'User Account' : '用户账户'}
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center p-2 md:px-3 md:py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-colors"
                title={isEnglish ? 'Switch Language' : '切换语言'}
              >
                <Languages className="w-5 h-5 md:w-4 md:h-4 text-indigo-600" />
                <span className="hidden md:inline-block md:ml-2 text-sm font-medium text-indigo-700">
                  {isEnglish ? '中文' : 'EN'}
                </span>
              </button>

              <button
                onClick={() => setCurrentPage('settings')}
                className="flex items-center justify-center p-2 md:px-3 md:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title={isEnglish ? 'API Settings' : 'API 設置'}
              >
                <Key className="w-5 h-5 md:w-4 md:h-4 text-gray-600" />
                <span className="hidden md:inline-block md:ml-2 text-sm font-medium text-gray-700">
                  {isEnglish ? 'API Settings' : 'API 設置'}
                </span>
              </button>

              <button
                onClick={() => setCurrentPage('about')}
                className="flex items-center justify-center p-2 md:px-3 md:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title={isEnglish ? 'Contact Us' : '聯繫我們'}
              >
                <MessageCircle className="w-5 h-5 md:w-4 md:h-4 text-gray-600" />
                <span className="hidden md:inline-block md:ml-2 text-sm font-medium text-gray-700">
                  {isEnglish ? 'Contact Us' : '聯繫我們'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        {renderPage()}
      </main>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isEnglish={isEnglish}
      />
      
      <MembershipModal 
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        isEnglish={isEnglish}
      />

      {/* Navigation */}
      <Navigation 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isEnglish={isEnglish}
      />
    </div>
  );
}

export default App;