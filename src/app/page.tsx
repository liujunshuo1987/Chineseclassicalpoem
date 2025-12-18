import Link from 'next/link';
import { BookOpen, Scan, Feather } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">古籍智能平台</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900"
              >
                关于我们
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900"
              >
                积分套餐
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                免费开始
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI 赋能的古籍阅读与诗词创作
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            使用先进的 OCR 和 AI 技术，让古籍阅读更轻松，让诗词创作更有趣
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
            >
              注册即送 20 积分
            </Link>
            <Link
              href="/pricing"
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
            >
              查看积分套餐
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            核心功能
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Scan className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">智能扫描</h3>
              <p className="text-gray-600">
                高精度 OCR 识别古籍文字，AI 自动断句标点
              </p>
              <p className="text-sm text-primary-600 mt-2">仅需 10 积分/次</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">深度阅读</h3>
              <p className="text-gray-600">
                AI 分析文本结构，提供详细注释和翻译
              </p>
              <p className="text-sm text-primary-600 mt-2">仅需 15 积分/次</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Feather className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">诗词创作</h3>
              <p className="text-gray-600">
                AI 根据关键词和风格创作优美诗词
              </p>
              <p className="text-sm text-primary-600 mt-2">仅需 20 积分/次</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 古籍智能平台. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
