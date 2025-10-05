import React, { useState } from 'react';
import { X, Crown, Check, Zap, Gift, CreditCard } from 'lucide-react';
import { authService } from '../services/authService';
import { MembershipPlan } from '../types/user';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglish: boolean;
}

const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose, isEnglish }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const plans = authService.getMembershipPlans();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, directly upgrade the user
    authService.upgradeMembership(selectedPlan as 'monthly' | 'annual');
    
    setIsProcessing(false);
    onClose();
  };

  const handlePaymentMethodSelect = () => {
    setShowPayment(true);
  };

  if (showPayment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {isEnglish ? 'Complete Payment' : '完成支付'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <div className="text-gray-500">
                  {paymentMethod === 'wechat' ? '微信支付二维码' : '支付宝二维码'}
                </div>
              </div>
              <p className="text-gray-600">
                {isEnglish 
                  ? 'Scan the QR code with your mobile app to complete payment'
                  : '使用手机应用扫描二维码完成支付'
                }
              </p>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing 
                ? (isEnglish ? 'Processing...' : '处理中...')
                : (isEnglish ? 'Payment Completed' : '支付完成')
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                {isEnglish ? 'Unlock Your Poetic World' : '解锁您的诗词世界'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-600">
              {isEnglish 
                ? 'Upgrade now to continue composing, copying, and sharing your AI-generated Tang and Song poems.'
                : '立即升级，继续创作、复制和分享您的AI生成的唐诗宋词。'
              }
            </p>
          </div>

          {/* Membership Plans */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {plan.popular && (
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <Gift className="w-3 h-3" />
                      <span>{isEnglish ? 'POPULAR' : '热门'}</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {isEnglish ? plan.name : plan.nameZh}
                  </h4>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-bold text-indigo-600">¥{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">¥{plan.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {plan.period === 'monthly' 
                      ? (isEnglish ? 'per month' : '每月')
                      : (isEnglish ? 'per year' : '每年')
                    }
                  </p>
                </div>

                <ul className="space-y-2">
                  {(isEnglish ? plan.features : plan.featuresZh).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              {isEnglish ? 'Payment Method' : '支付方式'}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('wechat')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  paymentMethod === 'wechat'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 rounded mx-auto mb-2"></div>
                  <span className="text-sm font-medium">微信支付</span>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('alipay')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  paymentMethod === 'alipay'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 rounded mx-auto mb-2"></div>
                  <span className="text-sm font-medium">支付宝</span>
                </div>
              </button>
            </div>
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handlePaymentMethodSelect}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>
              {isEnglish ? 'Subscribe Now' : '立即订阅'}
            </span>
          </button>

          {/* Limited Time Offer */}
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h5 className="font-semibold text-yellow-900">
                {isEnglish ? 'Limited Time Offer' : '限时优惠'}
              </h5>
            </div>
            <p className="text-yellow-800 text-sm">
              {isEnglish 
                ? 'First month only ¥19 for monthly plan, first year only ¥218 for annual plan!'
                : '月度计划首月仅需¥19，年度计划首年仅需¥218！'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;