import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function AboutPage() {
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
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                积分套餐
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">关于我们</h1>

        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            古籍智能平台致力于用现代 AI 技术让古籍阅读变得更加简单、有趣。我们结合了先进的 OCR
            识别技术和 AI 文本分析能力，为用户提供完整的古籍数字化解决方案。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">核心功能</h2>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong>智能扫描：</strong>
              高精度 OCR 识别古籍文字，支持多种古籍字体和排版
            </li>
            <li>
              <strong>AI 分析：</strong>
              自动断句、加标点，识别标题、正文、注释等不同文本类型
            </li>
            <li>
              <strong>文本注释：</strong>
              为选中的文本提供详细注释、翻译和典故解释
            </li>
            <li>
              <strong>诗词创作：</strong>
              根据关键词和风格要求，AI 生成符合格律的古典诗词
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">技术优势</h2>
          <ul className="space-y-3 text-gray-600">
            <li>采用业界领先的 OCR 识别引擎，对古籍文字识别准确率高</li>
            <li>基于 DeepSeek AI 大模型，理解古典中文语境</li>
            <li>支持多种诗词格律和词牌，创作质量高</li>
            <li>响应速度快，用户体验流畅</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">使用场景</h2>
          <ul className="space-y-3 text-gray-600">
            <li>古籍研究者进行文献整理和数字化</li>
            <li>国学爱好者学习和理解古典文献</li>
            <li>诗词创作爱好者寻找灵感和学习格律</li>
            <li>教育工作者制作教学材料</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">联系我们</h2>
          <p className="text-gray-600">
            如有任何问题或建议，欢迎通过邮箱联系我们：
            <a href="mailto:support@example.com" className="text-primary-600 hover:text-primary-700">
              support@example.com
            </a>
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            立即开始使用
          </Link>
        </div>
      </div>
    </div>
  );
}
