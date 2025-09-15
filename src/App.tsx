import React, { useState } from 'react';
import { Camera, BookOpen, PenTool, Home, Languages, Settings } from 'lucide-react';
import HomePage from './components/HomePage';
import Scanner from './components/Scanner';
import Reader from './components/Reader';
import Creator from './components/Creator';
import SettingsPage from './components/SettingsPage';
import Navigation from './components/Navigation';

type Page = 'home' | 'scanner' | 'reader' | 'creator' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isEnglish, setIsEnglish] = useState(false);
  const [processedText, setProcessedText] = useState('');

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
        return <HomePage isEnglish={isEnglish} onNavigate={setCurrentPage} />;
      case 'scanner':
        return <Scanner isEnglish={isEnglish} onNavigateToReader={navigateToReader} />;
      case 'reader':
        return <Reader isEnglish={isEnglish} text={processedText} />;
      case 'creator':
        return <Creator isEnglish={isEnglish} />;
      case 'settings':
        return <SettingsPage isEnglish={isEnglish} />;
      default:
        return <HomePage isEnglish={isEnglish} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {isEnglish ? 'Classical Chinese Literature' : '古典文學'}
              </h1>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 transition-colors"
            >
              <Languages className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                {isEnglish ? '中文' : 'EN'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {renderPage()}
      </main>

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