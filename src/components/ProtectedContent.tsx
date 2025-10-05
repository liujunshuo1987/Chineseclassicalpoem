import React, { useState, useEffect } from 'react';
import { Lock, Crown, Copy, Download } from 'lucide-react';
import { authService } from '../services/authService';
import { UserPermissions } from '../types/user';

interface ProtectedContentProps {
  children: React.ReactNode;
  content?: string;
  isEnglish: boolean;
  onShowMembership: () => void;
  onShowAuth: () => void;
  type?: 'copy' | 'export' | 'generate';
}

const ProtectedContent: React.FC<ProtectedContentProps> = ({ 
  children, 
  content, 
  isEnglish, 
  onShowMembership, 
  onShowAuth,
  type = 'copy'
}) => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const updatePermissions = () => {
      setPermissions(authService.getUserPermissions());
      setUser(authService.getCurrentUser());
    };

    updatePermissions();
    const unsubscribe = authService.subscribe(updatePermissions);
    
    return unsubscribe;
  }, []);

  const canAccess = () => {
    if (!permissions) return false;

    // Admins have access to everything
    if (permissions.isAdmin) return true;

    switch (type) {
      case 'copy':
        return permissions.canCopy;
      case 'export':
        return permissions.canExport;
      case 'generate':
        return permissions.canGenerate && permissions.remainingGenerations > 0;
      default:
        return false;
    }
  };

  const handleCopy = () => {
    if (content && canAccess()) {
      navigator.clipboard.writeText(content);
    }
  };

  const handleExport = () => {
    if (content && canAccess()) {
      const element = document.createElement('a');
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'classical_text.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const getActionText = () => {
    switch (type) {
      case 'copy':
        return isEnglish ? 'Copy' : '复制';
      case 'export':
        return isEnglish ? 'Export' : '导出';
      case 'generate':
        return isEnglish ? 'Generate' : '生成';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'copy':
        return Copy;
      case 'export':
        return Download;
      default:
        return Lock;
    }
  };

  if (!canAccess()) {
    return (
      <div className="relative">
        {/* Overlay for protected content */}
        <div className="relative">
          <div className={`${type === 'copy' ? 'select-none pointer-events-none' : ''}`}>
            {children}
          </div>
          
          {type === 'copy' && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 max-w-sm">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {isEnglish ? 'Premium Feature' : '高级功能'}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {isEnglish 
                    ? 'Sign in and upgrade to copy and export your creations'
                    : '登录并升级以复制和导出您的作品'
                  }
                </p>
                <div className="space-y-2">
                  {!user && (
                    <button
                      onClick={onShowAuth}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                    >
                      {isEnglish ? 'Sign In' : '登录'}
                    </button>
                  )}
                  <button
                    onClick={onShowMembership}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{isEnglish ? 'Upgrade' : '升级会员'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons for export/generate */}
        {(type === 'export' || type === 'generate') && (
          <div className="mt-4">
            <button
              onClick={!user ? onShowAuth : onShowMembership}
              disabled
              className="bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Lock className="w-5 h-5" />
              <span>{getActionText()} - {isEnglish ? 'Premium Only' : '仅限会员'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // For accessible content, render normally with action buttons
  return (
    <div>
      {children}
      {(type === 'copy' || type === 'export') && content && (
        <div className="mt-4 flex gap-2">
          {type === 'copy' && (
            <button
              onClick={handleCopy}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Copy className="w-5 h-5" />
              <span>{isEnglish ? 'Copy' : '复制'}</span>
            </button>
          )}
          {type === 'export' && (
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>{isEnglish ? 'Export' : '导出'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProtectedContent;