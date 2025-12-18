'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Coins, Check, Loader2 } from 'lucide-react';
import { CreditPackage } from '@/types/database';

export default function RechargePage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPackages() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data, error } = await supabase
          .from('credit_packages')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (!error && data) {
          setPackages(data);
        }
      } catch (error) {
        console.error('Failed to load packages:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  const handlePurchase = async (packageId: number) => {
    try {
      setProcessingPackageId(packageId);

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || '创建支付会话失败');
        setProcessingPackageId(null);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('支付过程中发生错误');
      setProcessingPackageId(null);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    if (currency === 'usd') {
      return `$${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">充值积分</h1>
        <p className="text-lg text-gray-600">选择适合您的积分套餐，开启探索之旅</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {packages.map((pkg) => {
          const totalCredits = pkg.credits + pkg.bonus_credits;
          const unitPrice = pkg.price_cents / pkg.credits / 100;
          const isRecommended = pkg.sort_order === 3;

          return (
            <Card
              key={pkg.id}
              className={`relative ${isRecommended ? 'border-primary-500 border-2 shadow-lg' : ''}`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    推荐
                  </span>
                </div>
              )}

              <CardHeader>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Coins className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">
                    {formatPrice(pkg.price_cents, pkg.currency)}
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{pkg.credits} 积分</span>
                  </div>
                  {pkg.bonus_credits > 0 && (
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-primary-600 font-semibold">
                        额外赠送 {pkg.bonus_credits} 积分
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600 text-sm">
                      共 {totalCredits} 积分
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600 text-sm">
                      单价 ${unitPrice.toFixed(4)}/积分
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={processingPackageId !== null}
                  variant={isRecommended ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {processingPackageId === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    '立即购买'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">积分使用说明</h2>
        <ul className="space-y-2 text-blue-800">
          <li>• OCR 扫描识别：10 积分/次</li>
          <li>• AI 文本分析：15 积分/次</li>
          <li>• 诗词创作：20 积分/次</li>
          <li>• 文本注释：5 积分/次</li>
        </ul>
        <p className="text-sm text-blue-700 mt-4">
          积分永久有效，支持退款（未使用部分）
        </p>
      </div>
    </div>
  );
}
