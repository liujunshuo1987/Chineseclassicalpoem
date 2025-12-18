import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Coins, Check, BookOpen } from 'lucide-react';

const packages = [
  { name: '体验包', credits: 100, bonus: 0, price: 4.99 },
  { name: '标准包', credits: 500, bonus: 50, price: 19.99 },
  { name: '超值包', credits: 1200, bonus: 200, price: 39.99, recommended: true },
  { name: '专业包', credits: 3000, bonus: 700, price: 89.99 },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">古籍智能平台</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                首页
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                关于
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                登录
              </Link>
              <Link
                href="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">积分套餐</h1>
          <p className="text-xl text-gray-600">
            选择适合您的积分套餐，开启古籍探索之旅
          </p>
          <p className="text-primary-600 mt-2">新用户注册即送 20 积分</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {packages.map((pkg) => {
            const totalCredits = pkg.credits + pkg.bonus;
            const unitPrice = pkg.price / pkg.credits;

            return (
              <Card
                key={pkg.name}
                className={`relative ${pkg.recommended ? 'border-primary-500 border-2 shadow-lg' : ''}`}
              >
                {pkg.recommended && (
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
                      ${pkg.price.toFixed(2)}
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{pkg.credits} 积分</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-primary-600 font-semibold">
                          额外赠送 {pkg.bonus} 积分
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600 text-sm">共 {totalCredits} 积分</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-gray-600 text-sm">
                        ${unitPrice.toFixed(4)}/积分
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">积分使用说明</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 font-bold">10</span>
                  <div>
                    <span className="font-semibold">OCR 扫描识别</span>
                    <p className="text-sm text-gray-600">高精度识别古籍文字</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 font-bold">15</span>
                  <div>
                    <span className="font-semibold">AI 文本分析</span>
                    <p className="text-sm text-gray-600">智能断句、分类、注释</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 font-bold">20</span>
                  <div>
                    <span className="font-semibold">诗词创作</span>
                    <p className="text-sm text-gray-600">AI 生成精美诗词</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 font-bold">5</span>
                  <div>
                    <span className="font-semibold">文本注释</span>
                    <p className="text-sm text-gray-600">详细的词句解释</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">常见问题</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">积分有效期？</h3>
                  <p className="text-sm text-gray-600">积分永久有效，无过期时间</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">支持退款吗？</h3>
                  <p className="text-sm text-gray-600">支持退款，未使用的积分可全额退回</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">支付方式？</h3>
                  <p className="text-sm text-gray-600">
                    支持 Stripe 支付，可使用信用卡、借记卡等
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">如何开始使用？</h3>
                  <p className="text-sm text-gray-600">
                    注册账户后即可开始使用，新用户赠送 20 积分
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            立即注册，开始使用
          </Link>
        </div>
      </div>
    </div>
  );
}
