import React, { useState } from 'react';
import { PenTool, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { deepseekService } from '../services/deepseekApi';
import { authService } from '../services/authService';
import ProtectedContent from './ProtectedContent';

interface CreatorProps {
  isEnglish: boolean;
  onShowAuth: () => void;
  onShowMembership: () => void;
}

type PoemCategory = 'poetry' | 'ci' | 'couplet' | 'fu';
type PoemStyle = {
  category: PoemCategory;
  style: string;
  displayName: string;
  description: string;
};

interface Poem {
  content: string;
  style: string;
  theme: string;
  explanation: string;
}

const Creator: React.FC<CreatorProps> = ({ isEnglish, onShowAuth, onShowMembership }) => {
  const [keywords, setKeywords] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PoemCategory>('poetry');
  const [selectedStyle, setSelectedStyle] = useState<PoemStyle>({
    category: 'poetry',
    style: '5char_jueju',
    displayName: '五言絕句',
    description: '四行，每行五字'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPoem, setGeneratedPoem] = useState<Poem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    {
      id: 'poetry' as PoemCategory,
      nameEn: 'Poetry',
      nameZh: '詩',
      icon: '📜'
    },
    {
      id: 'ci' as PoemCategory,
      nameEn: 'Ci',
      nameZh: '詞',
      icon: '🎵'
    },
    {
      id: 'couplet' as PoemCategory,
      nameEn: 'Couplet',
      nameZh: '對聯',
      icon: '🏮'
    },
    {
      id: 'fu' as PoemCategory,
      nameEn: 'Fu',
      nameZh: '賦',
      icon: '📖'
    }
  ];

  const poetryStyles = [
    {
      category: 'poetry' as PoemCategory,
      style: '5char_jueju',
      displayName: '五言絕句',
      description: '四行，每行五字',
      descriptionEn: '4 lines, 5 characters each'
    },
    {
      category: 'poetry' as PoemCategory,
      style: '7char_jueju',
      displayName: '七言絕句',
      description: '四行，每行七字',
      descriptionEn: '4 lines, 7 characters each'
    },
    {
      category: 'poetry' as PoemCategory,
      style: '5char_lushi',
      displayName: '五言律詩',
      description: '八行，每行五字，需遵循平仄格律',
      descriptionEn: '8 lines, 5 characters each, tonal patterns required'
    },
    {
      category: 'poetry' as PoemCategory,
      style: '7char_lushi',
      displayName: '七言律詩',
      description: '八行，每行七字，需遵循平仄格律',
      descriptionEn: '8 lines, 7 characters each, tonal patterns required'
    },
    {
      category: 'poetry' as PoemCategory,
      style: '5char_gushi',
      displayName: '五言古詩',
      description: '長度不定，每行五字，格律較寬鬆',
      descriptionEn: 'Variable length, 5 characters per line, looser rules'
    },
    {
      category: 'poetry' as PoemCategory,
      style: '7char_gushi',
      displayName: '七言古詩',
      description: '長度不定，每行七字，格律較寬鬆',
      descriptionEn: 'Variable length, 7 characters per line, looser rules'
    }
  ];

  const ciStyles = [
    {
      category: 'ci' as PoemCategory,
      style: 'dielianhua',
      displayName: '蝶戀花',
      description: '上下闋各五句，字數固定',
      descriptionEn: 'Fixed pattern with upper and lower stanzas'
    },
    {
      category: 'ci' as PoemCategory,
      style: 'shuidiaogeto',
      displayName: '水調歌頭',
      description: '上下闋，氣勢宏大',
      descriptionEn: 'Grand and majestic ci pattern'
    },
    {
      category: 'ci' as PoemCategory,
      style: 'niannujiao',
      displayName: '念奴嬌',
      description: '豪放詞牌，適合抒發壯志',
      descriptionEn: 'Bold ci pattern for expressing grand aspirations'
    },
    {
      category: 'ci' as PoemCategory,
      style: 'rumenglin',
      displayName: '如夢令',
      description: '短小精悍，六句三十三字',
      descriptionEn: 'Short and concise, 6 lines with 33 characters'
    },
    {
      category: 'ci' as PoemCategory,
      style: 'yumeiren',
      displayName: '虞美人',
      description: '婉約詞牌，適合抒情',
      descriptionEn: 'Graceful ci pattern for lyrical expression'
    },
    {
      category: 'ci' as PoemCategory,
      style: 'huanxisha',
      displayName: '浣溪沙',
      description: '上三下四，清新淡雅',
      descriptionEn: 'Fresh and elegant pattern'
    },
    {
      category: 'ci' as PoemCategory,
      style: 'qingyuan',
      displayName: '青玉案',
      description: '適合寫景抒懷',
      descriptionEn: 'Suitable for scenic description and emotion'
    }
  ];

  const otherStyles = [
    {
      category: 'couplet' as PoemCategory,
      style: 'couplet',
      displayName: '對聯',
      description: '兩行對偶，平仄相對，語義呼應',
      descriptionEn: 'Two parallel lines with tonal and semantic balance'
    },
    {
      category: 'fu' as PoemCategory,
      style: 'fu',
      displayName: '賦',
      description: '長篇韻文，鋪陳描寫，自由長度',
      descriptionEn: 'Long descriptive prose-poetry, free length'
    }
  ];

  const getAllStyles = () => {
    return [...poetryStyles, ...ciStyles, ...otherStyles];
  };

  const getStylesForCategory = (category: PoemCategory) => {
    switch (category) {
      case 'poetry':
        return poetryStyles;
      case 'ci':
        return ciStyles;
      case 'couplet':
        return otherStyles.filter(s => s.category === 'couplet');
      case 'fu':
        return otherStyles.filter(s => s.category === 'fu');
      default:
        return poetryStyles;
    }
  };

  const handleCategoryChange = (category: PoemCategory) => {
    setSelectedCategory(category);
    const stylesForCategory = getStylesForCategory(category);
    if (stylesForCategory.length > 0) {
      setSelectedStyle(stylesForCategory[0]);
    }
  };

  const generatePoem = async () => {
    if (!keywords.trim()) return;

    // Check permissions before generating
    const permissions = authService.getUserPermissions();
    if (!permissions.canGenerate || permissions.remainingGenerations <= 0) {
      const user = authService.getCurrentUser();
      if (!user) {
        onShowAuth();
      } else {
        onShowMembership();
      }
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const poemData = await deepseekService.generatePoetry(keywords, selectedStyle.style, selectedStyle.displayName);
      
      setGeneratedPoem({
        content: poemData.content,
        style: selectedStyle.displayName,
        theme: keywords,
        explanation: `${poemData.explanation}\n\n格律分析：${poemData.styleAnalysis}`
      });
      
      // Increment generation count
      authService.incrementGenerationCount();
    } catch (err) {
      console.error('Poetry generation error:', err);
      setError(isEnglish ? 'Failed to generate poetry. Please try again.' : '詩詞生成失敗，請重試。');
    } finally {
      setIsGenerating(false);
    }
  };

  const permissions = authService.getUserPermissions();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {isEnglish ? 'Poetry Creator' : '詩詞創作'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isEnglish 
            ? 'Create classical Chinese poetry using AI. Enter keywords and select a style to generate beautiful verses.'
            : '使用AI創作古典中文詩詞。輸入關鍵詞並選擇風格，生成優美的詩句。'
          }
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="space-y-6">
          {/* Keywords Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {isEnglish ? 'Keywords or Theme' : '關鍵詞或主題'}
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={isEnglish ? 'e.g., moonlight, autumn river, nostalgia' : '例如：月光、秋水、思鄉'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {isEnglish ? 'Poetry Style' : '詩詞風格'}
            </label>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-semibold text-gray-900">
                      {isEnglish ? category.nameEn : category.nameZh}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Style Options for Selected Category */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getStylesForCategory(selectedCategory).map((style) => (
                <div
                  key={style.style}
                  onClick={() => setSelectedStyle(style)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedStyle.style === style.style
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                    {style.displayName}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {isEnglish ? style.descriptionEn : style.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <ProtectedContent
            type="generate"
            isEnglish={isEnglish}
            onShowAuth={onShowAuth}
            onShowMembership={onShowMembership}
          >
            <button
              onClick={generatePoem}
              disabled={!keywords.trim() || isGenerating || !permissions.canGenerate || permissions.remainingGenerations <= 0}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{isEnglish ? 'Generating...' : '創作中...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{isEnglish ? 'Generate Poetry' : '生成詩詞'}</span>
                </>
              )}
            </button>
          </ProtectedContent>
          
          {/* Generation Limit Info */}
          {permissions.dailyLimit !== 999 && (
            <div className="mt-2 text-center text-sm text-gray-600">
              {isEnglish 
                ? `${permissions.remainingGenerations}/${permissions.dailyLimit} generations remaining today`
                : `今日剩余生成次数：${permissions.remainingGenerations}/${permissions.dailyLimit}`
              }
            </div>
          )}
        </div>
      </div>

      {/* Generated Poem */}
      {generatedPoem && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <PenTool className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {isEnglish ? 'Generated Poetry' : '生成的詩詞'}
            </h3>
          </div>

          <ProtectedContent
            content={generatedPoem.content}
            isEnglish={isEnglish}
            onShowAuth={onShowAuth}
            onShowMembership={onShowMembership}
            type="copy"
          >
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-100 mb-6">
              <div className="text-2xl font-serif text-gray-800 leading-loose text-center whitespace-pre-line">
                {generatedPoem.content}
              </div>
            </div>
          </ProtectedContent>

          {/* Poem Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {isEnglish ? 'Style' : '風格'}
              </h4>
              <p className="text-gray-700">{generatedPoem.style}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {isEnglish ? 'Theme' : '主題'}
              </h4>
              <p className="text-gray-700">{generatedPoem.theme}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              {isEnglish ? 'Explanation' : '解釋'}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {generatedPoem.explanation}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <ProtectedContent
              content={generatedPoem.content}
              isEnglish={isEnglish}
              onShowAuth={onShowAuth}
              onShowMembership={onShowMembership}
              type="copy"
            >
              <div></div>
            </ProtectedContent>
            
            <ProtectedContent
              content={generatedPoem.content}
              isEnglish={isEnglish}
              onShowAuth={onShowAuth}
              onShowMembership={onShowMembership}
              type="export"
            >
              <div></div>
            </ProtectedContent>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setGeneratedPoem(null)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              {isEnglish ? 'Create Another' : '再創作一首'}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">
                {isEnglish ? 'Generation Error' : '生成錯誤'}
              </h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Examples */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          {isEnglish ? 'AI-Powered Creation - Sample Themes' : 'AI智能創作 - 推薦主題'}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {isEnglish 
            ? 'Powered by DeepSeek AI for authentic classical Chinese poetry generation'
            : '由DeepSeek AI驅動，生成地道的古典中文詩詞'
          }
        </p>
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            {isEnglish 
              ? `Current selection: ${selectedStyle.displayName} - ${selectedStyle.descriptionEn || selectedStyle.description}`
              : `當前選擇：${selectedStyle.displayName} - ${selectedStyle.description}`
            }
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['月光', '春風', '思鄉', '山水', '離別', '友情'].map((theme) => (
            <button
              key={theme}
              onClick={() => setKeywords(theme)}
              className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors border border-gray-200"
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Creator;