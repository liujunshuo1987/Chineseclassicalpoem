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
    if (type === 'copy') {
      return (
        <div className="relative">
          <div className="relative">
            <div className="select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
              {children}
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  {isEnglish
                    ? 'Upgrade to copy and export text'
                    : '升级会员以复制和导出文本'
                  }
                </span>
              </div>
              <div className="mt-3">
                <button
                  onClick={onShowMembership}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors text-sm inline-flex items-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>{isEnglish ? 'Upgrade' : '升级会员'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'export') {
      return (
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
      );
    }

    if (type === 'generate') {
      return (
        <div>
          {children}
        </div>
      );
    }

    return <div>{children}</div>;
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