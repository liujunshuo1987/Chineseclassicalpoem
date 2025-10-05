import React, { useState, useEffect } from 'react';
import { User, Crown, Clock, Zap, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { authService } from '../services/authService';
import { databaseService } from '../services/databaseService';
import { User as UserType, UserPermissions } from '../types/user';

interface AccountPageProps {
  isEnglish: boolean;
  onShowMembership: () => void;
}

interface Order {
  id: number;
  order_number: string;
  plan_type: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const AccountPage: React.FC<AccountPageProps> = ({ isEnglish, onShowMembership }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const updateUserStatus = () => {
      const currentUser = authService.getCurrentUser();
      const userPermissions = authService.getUserPermissions();
      setUser(currentUser);
      setPermissions(userPermissions);

      if (currentUser) {
        loadOrders(currentUser.id);
      }
    };

    updateUserStatus();
    const unsubscribe = authService.subscribe(updateUserStatus);

    return unsubscribe;
  }, []);

  const loadOrders = async (userId: string) => {
    try {
      const userOrders = await databaseService.getUserOrders(userId);
      setOrders(userOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleStartTrial = async () => {
    const success = await authService.startTrial();
    if (success) {
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
    }
  };

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return isEnglish ? 'Completed' : '已完成';
      case 'pending':
        return isEnglish ? 'Pending' : '待处理';
      case 'failed':
        return isEnglish ? 'Failed' : '失败';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEnglish ? 'Account Settings' : '账户设置'}
          </h2>
          <p className="text-gray-600">
            {isEnglish ? 'Please sign in to view your account' : '请登录以查看您的账户信息'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isEnglish ? 'Account Settings' : '账户设置'}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - User Info & Membership */}
        <div className="md:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                <p className="text-sm text-gray-600">
                  {isEnglish ? 'User ID' : '用户 ID'}: {user.id}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {isEnglish ? 'Membership Status' : '会员状态'}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {getMembershipStatusText()}
                </span>
              </div>

              {user.role === 'admin' && (
                <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Crown className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">
                      {isEnglish ? 'Administrator' : '管理员'}
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    {isEnglish ? 'Full access to all features' : '拥有所有功能的完全访问权限'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Membership Info Card */}
          {user.role !== 'admin' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {isEnglish ? 'Membership Details' : '会员详情'}
              </h3>

              {/* Trial Status */}
              {user.membershipType === 'trial' && permissions?.trialDaysRemaining !== undefined && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      {isEnglish ? 'Trial Period' : '试用期'}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {isEnglish
                      ? `${permissions.trialDaysRemaining} days remaining`
                      : `剩余 ${permissions.trialDaysRemaining} 天`
                    }
                  </p>
                </div>
              )}

              {/* Generation Limits */}
              {permissions && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {isEnglish ? 'Daily Generations' : '每日生成次数'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {permissions.dailyLimit === 999
                      ? (isEnglish ? 'Unlimited' : '无限制')
                      : `${permissions.remainingGenerations}/${permissions.dailyLimit} ${isEnglish ? 'remaining' : '剩余'}`
                    }
                  </p>
                </div>
              )}

              {/* Expiry Date */}
              {(user.membershipType === 'monthly' || user.membershipType === 'annual') && user.expiryDate && (
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">
                      {isEnglish ? 'Valid Until' : '有效期至'}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">
                    {new Date(user.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {user.membershipType === 'visitor' && (
                  <button
                    onClick={handleStartTrial}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    {isEnglish ? 'Start 7-Day Trial' : '开始7天试用'}
                  </button>
                )}

                {(user.membershipType === 'visitor' || user.membershipType === 'trial' || user.membershipType === 'expired') && (
                  <button
                    onClick={onShowMembership}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <Crown className="w-5 h-5" />
                    <span>{isEnglish ? 'Upgrade Membership' : '升级会员'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Orders */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {isEnglish ? 'Order History' : '订单历史'}
              </h3>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {isEnglish ? 'No orders yet' : '暂无订单记录'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {order.order_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {isEnglish ? 'Plan Type' : '套餐类型'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.plan_type === 'monthly'
                            ? (isEnglish ? 'Monthly' : '月度会员')
                            : (isEnglish ? 'Annual' : '年度会员')
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {isEnglish ? 'Amount' : '金额'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ¥{order.amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {isEnglish ? 'Payment Method' : '支付方式'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.payment_method === 'wechat'
                            ? (isEnglish ? 'WeChat Pay' : '微信支付')
                            : (isEnglish ? 'Alipay' : '支付宝')
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
