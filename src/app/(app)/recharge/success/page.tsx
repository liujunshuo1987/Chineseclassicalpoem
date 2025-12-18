'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function RechargeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('无效的支付会话');
      setLoading(false);
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError('验证支付状态失败');
        }
      } catch (err) {
        setError('验证过程中发生错误');
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
          <p className="text-gray-600">正在验证支付状态...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/app/recharge')}>返回充值页面</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">支付成功</h1>
          <p className="text-gray-600 mb-8">您的积分已成功充值</p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">订单号：</span>
                  <span className="font-mono font-semibold">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">购买积分：</span>
                  <span className="font-semibold">{order.credits} 积分</span>
                </div>
                {order.bonus_credits > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">赠送积分：</span>
                    <span className="font-semibold text-primary-600">
                      {order.bonus_credits} 积分
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-300 pt-3 mt-3">
                  <span className="text-gray-900 font-semibold">总计：</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {order.credits + order.bonus_credits} 积分
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push('/app/dashboard')}>返回首页</Button>
            <Button variant="secondary" onClick={() => router.push('/app/scanner')}>
              开始使用
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
