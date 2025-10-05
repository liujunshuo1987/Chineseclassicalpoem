import React, { useState, useEffect } from 'react';
import { User, LogOut, Crown, Settings } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types/user';

interface UserStatusProps {
  isEnglish: boolean;
  onShowAuth: () => void;
  onNavigateToAccount: () => void;
}

const UserStatus: React.FC<UserStatusProps> = ({ isEnglish, onShowAuth, onNavigateToAccount }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const updateUserStatus = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    };

    updateUserStatus();
    const unsubscribe = authService.subscribe(updateUserStatus);

    return unsubscribe;
  }, []);

  const getMembershipStatusText = () => {
    if (!user) return isEnglish ? 'Guest' : '访客';

    if (user.role === 'admin') {
      return isEnglish ? 'Administrator' : '管理员';
    }

    switch (user.membershipType) {
      case 'visitor':
        return isEnglish ? 'Visitor' : '访客用户';
      case 'trial':
        return isEnglish ? 'Trial User' : '试用用户';
      case 'monthly':
        return isEnglish ? 'Monthly Member' : '月度会员';
      case 'annual':
        return isEnglish ? 'Annual Member' : '年度会员';
      case 'expired':
        return isEnglish ? 'Expired' : '已过期';
      default:
        return isEnglish ? 'Unknown' : '未知';
    }
  };

  const getMembershipColor = () => {
    if (!user) return 'bg-gray-100 text-gray-700';

    if (user.role === 'admin') {
      return 'bg-green-100 text-green-700';
    }

    switch (user.membershipType) {
      case 'visitor':
        return 'bg-gray-100 text-gray-700';
      case 'trial':
        return 'bg-blue-100 text-blue-700';
      case 'monthly':
        return 'bg-purple-100 text-purple-700';
      case 'annual':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) {
    return (
      <button
        onClick={onShowAuth}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        {isEnglish ? 'Sign In' : '登录'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-900 text-sm">{user.username}</p>
          <p className={`text-xs px-2 py-0.5 rounded ${getMembershipColor()}`}>
            {getMembershipStatusText()}
          </p>
        </div>
        <LogOut className="w-4 h-4 text-gray-400" />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => {
                setShowDropdown(false);
                onNavigateToAccount();
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">
                {isEnglish ? 'Account Settings' : '账户设置'}
              </span>
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                authService.logout();
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">
                {isEnglish ? 'Sign Out' : '退出登录'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserStatus;