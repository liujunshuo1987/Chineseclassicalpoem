import React, { useState, useEffect } from 'react';
import { User, LogOut, Crown, Clock, Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType, UserPermissions } from '../types/user';

interface UserStatusProps {
  isEnglish: boolean;
  onShowAuth: () => void;
  onShowMembership: () => void;
}

const UserStatus: React.FC<UserStatusProps> = ({ isEnglish, onShowAuth, onShowMembership }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    const updateUserStatus = () => {
      const currentUser = authService.getCurrentUser();
      const userPermissions = authService.getUserPermissions();
      setUser(currentUser);
      setPermissions(userPermissions);
    };

    updateUserStatus();
    const unsubscribe = authService.subscribe(updateUserStatus);
    
    return unsubscribe;
  }, []);

  const handleStartTrial = () => {
    authService.startTrial().then((success) => {
      // Trial started successfully
    });
  };

  const getMembershipStatusText = () => {
    if (!user) return isEnglish ? 'Guest' : '访客';

    // Show admin status first
    if (user.role === 'admin') {
      return isEnglish ? 'Administrator' : '管理员';
    }

    switch (user.membershipType) {
      case 'visitor':
        return isEnglish ? 'Visitor' : '访客';
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
    if (!user) return 'text-gray-600';

    // Admin gets special color
    if (user.role === 'admin') {
      return 'text-green-600 font-semibold';
    }

    switch (user.membershipType) {
      case 'visitor':
        return 'text-gray-600';
      case 'trial':
        return 'text-blue-600';
      case 'monthly':
        return 'text-purple-600';
      case 'annual':
        return 'text-yellow-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="text-center">
          <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm mb-3">
            {isEnglish ? 'Sign in to unlock full features' : '登录以解锁完整功能'}
          </p>
          <button
            onClick={onShowAuth}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {isEnglish ? 'Sign In' : '登录'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.username}</p>
            <p className={`text-xs ${getMembershipColor()}`}>
              {getMembershipStatusText()}
            </p>
          </div>
        </div>
        <button
          onClick={() => authService.logout()}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isEnglish ? 'Sign Out' : '退出登录'}
        >
          <LogOut className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Trial Status */}
      {user.membershipType === 'trial' && permissions?.trialDaysRemaining !== undefined && (
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {isEnglish ? 'Trial Period' : '试用期'}
            </span>
          </div>
          <p className="text-xs text-blue-700">
            {isEnglish 
              ? `${permissions.trialDaysRemaining} days remaining`
              : `剩余 ${permissions.trialDaysRemaining} 天`
            }
          </p>
        </div>
      )}

      {/* Admin Badge */}
      {user.role === 'admin' && (
        <div className="bg-green-50 rounded-lg p-3 mb-3 border border-green-200">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-900">
              {isEnglish ? 'Full Access' : '完全权限'}
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            {isEnglish ? 'Unlimited features & no restrictions' : '无限功能 & 无限制'}
          </p>
        </div>
      )}

      {/* Generation Limits */}
      {permissions && !permissions.isAdmin && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {isEnglish ? 'Daily Generations' : '每日生成次数'}
            </span>
          </div>
          <p className="text-xs text-gray-700">
            {permissions.dailyLimit === 999
              ? (isEnglish ? 'Unlimited' : '无限制')
              : `${permissions.remainingGenerations}/${permissions.dailyLimit}`
            }
          </p>
        </div>
      )}

      {/* Action Buttons - Hide for admins */}
      {user.role !== 'admin' && (
        <div className="space-y-2">
          {user.membershipType === 'visitor' && (
            <button
              onClick={handleStartTrial}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              {isEnglish ? 'Start 7-Day Trial' : '开始7天试用'}
            </button>
          )}

          {(user.membershipType === 'visitor' || user.membershipType === 'trial' || user.membershipType === 'expired') && (
            <button
              onClick={onShowMembership}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors text-sm flex items-center justify-center space-x-1"
            >
              <Crown className="w-4 h-4" />
              <span>{isEnglish ? 'Upgrade' : '升级会员'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserStatus;