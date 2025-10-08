import React from 'react';
import { Camera, BookOpen, PenTool, Sparkles, Zap, Heart } from 'lucide-react';

type Page = 'home' | 'scanner' | 'reader' | 'creator';

interface HomePageProps {
  isEnglish: boolean;
  onNavigate: (page: Page) => void;
  onShowAuth: () => void;
  onShowMembership: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ isEnglish, onNavigate, onShowAuth, onShowMembership }) => {
  const features = [
    {
      icon: PenTool,
      titleEn: 'Generate Poetry',
      titleZh: '創作詩詞',
      descEn: 'Create classical Chinese poems in traditional styles',
      descZh: '創作傳統風格的古典中文詩詞',
      color: 'from-purple-500 to-pink-500',
      action: () => onNavigate('creator')
    },
    {
      icon: BookOpen,
      titleEn: 'Read & Annotate',
      titleZh: '閱讀與註釋',
      descEn: 'Explore texts with intelligent annotations and explanations',
      descZh: '通過智能註釋和解釋探索文本',
      color: 'from-emerald-500 to-teal-500',
      action: () => onNavigate('reader')
    },
    {
      icon: Camera,
      titleEn: 'Scan Texts',
      titleZh: '掃描文本',
      descEn: 'Capture and digitize classical Chinese texts with OCR',
      descZh: '使用OCR技術捕捉並數位化古典中文文本',
      color: 'from-blue-500 to-cyan-500',
      action: () => onNavigate('scanner')
    }
  ];

  const stats = [
    {
      icon: Sparkles,
      valueEn: '99%',
      valueZh: '99%',
      labelEn: 'OCR Accuracy',
      labelZh: 'OCR準確率'
    },
    {
      icon: Zap,
      valueEn: '<3s',
      valueZh: '<3秒',
      labelEn: 'Processing Speed',
      labelZh: '處理速度'
    },
    {
      icon: Heart,
      valueEn: '50K+',
      valueZh: '5萬+',
      labelEn: 'Users',
      labelZh: '用戶'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      {/* Hero Section */}
      <div className="text-center mb-6 md:mb-12">
        <h2 className="text-lg md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-2 md:mb-6">
          {isEnglish ? 'Discover Classical Chinese Literature' : '探索古典中文文學'}
        </h2>
        <p className="text-xs md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {isEnglish
            ? 'Experience the beauty of ancient texts through modern technology. Digitize, understand, and create classical Chinese literature with AI assistance.'
            : '通過現代科技體驗古代文本之美。借助AI輔助數位化、理解和創作古典中文文學。'
          }
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              onClick={feature.action}
              className="group cursor-pointer bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Mobile: Horizontal centered layout */}
              <div className="flex md:block items-center md:items-start justify-center md:justify-start gap-3 md:gap-0">
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r ${feature.color} rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 md:mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="flex-1 md:flex-none text-left md:text-left">
                  <h3 className="text-sm md:text-2xl font-semibold text-gray-900 mb-1 md:mb-3">
                    {isEnglish ? feature.titleEn : feature.titleZh}
                  </h3>
                  <p className="text-xs md:text-base text-gray-600 leading-relaxed">
                    {isEnglish ? feature.descEn : feature.descZh}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg">
        <div className="grid grid-cols-3 gap-3 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Icon className="w-4 h-4 md:w-6 md:h-6 text-indigo-600" />
                </div>
                <div className="text-lg md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1 md:mb-2">
                  {isEnglish ? stat.valueEn : stat.valueZh}
                </div>
                <div className="text-xs md:text-sm lg:text-base text-gray-600">
                  {isEnglish ? stat.labelEn : stat.labelZh}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Text Preview */}
      <div className="mt-8 md:mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-8">
        <h3 className="text-sm md:text-2xl font-semibold text-center text-gray-900 mb-3 md:mb-6">
          {isEnglish ? 'Experience Classical Beauty' : '體驗古典之美'}
        </h3>
        <div className="text-center">
          <div className="text-base md:text-3xl font-serif text-gray-800 mb-2 md:mb-4 leading-relaxed">
            床前明月光，疑是地上霜。<br />
            舉頭望明月，低頭思故鄉。
          </div>
          <div className="text-xs md:text-sm text-gray-600 italic">
            {isEnglish 
              ? "Li Bai - 'Quiet Night Thoughts'"
              : "李白 - 《靜夜思》"
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;