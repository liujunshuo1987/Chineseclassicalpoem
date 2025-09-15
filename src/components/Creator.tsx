import React, { useState } from 'react';
import { PenTool, Sparkles, RefreshCw, Copy, Download, AlertCircle } from 'lucide-react';
import { deepseekService } from '../services/deepseekApi';

interface CreatorProps {
  isEnglish: boolean;
}

type PoemStyle = '5char' | '7char' | 'couplet';

interface Poem {
  content: string;
  style: string;
  theme: string;
  explanation: string;
}

const Creator: React.FC<CreatorProps> = ({ isEnglish }) => {
  const [keywords, setKeywords] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<PoemStyle>('5char');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPoem, setGeneratedPoem] = useState<Poem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles = [
    {
      id: '5char' as PoemStyle,
      nameEn: '5-Character Quatrain',
      nameZh: '五言絕句',
      descEn: 'Four lines, five characters each',
      descZh: '四行，每行五字'
    },
    {
      id: '7char' as PoemStyle,
      nameEn: '7-Character Quatrain',
      nameZh: '七言絕句',
      descEn: 'Four lines, seven characters each',
      descZh: '四行，每行七字'
    },
    {
      id: 'couplet' as PoemStyle,
      nameEn: 'Couplet',
      nameZh: '對聯',
      descEn: 'Two parallel lines with matching tones',
      descZh: '兩行對偶，平仄相對'
    }
  ];

  const generatePoem = async () => {
    if (!keywords.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const poemData = await deepseekService.generatePoetry(keywords, selectedStyle);
      
      const styleNames = {
        '5char': '五言絕句',
        '7char': '七言絕句',
        'couplet': '對聯'
      };

      setGeneratedPoem({
        content: poemData.content,
        style: styleNames[selectedStyle],
        theme: keywords,
        explanation: `${poemData.explanation}\n\n格律分析：${poemData.styleAnalysis}`
      });
    } catch (err) {
      console.error('Poetry generation error:', err);
      setError(isEnglish ? 'Failed to generate poetry. Please try again.' : '詩詞生成失敗，請重試。');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPoem) {
      navigator.clipboard.writeText(generatedPoem.content);
    }
  };

  const downloadPoem = () => {
    if (generatedPoem) {
      const element = document.createElement('a');
      const file = new Blob([generatedPoem.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'classical_poem.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

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
            <div className="grid md:grid-cols-3 gap-4">
              {styles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {isEnglish ? style.nameEn : style.nameZh}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEnglish ? style.descEn : style.descZh}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePoem}
            disabled={!keywords.trim() || isGenerating}
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

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-100 mb-6">
            <div className="text-2xl font-serif text-gray-800 leading-loose text-center whitespace-pre-line">
              {generatedPoem.content}
            </div>
          </div>

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
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Copy className="w-5 h-5" />
              <span>{isEnglish ? 'Copy' : '複製'}</span>
            </button>
            <button
              onClick={downloadPoem}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>{isEnglish ? 'Download' : '下載'}</span>
            </button>
            <button
              onClick={() => setGeneratedPoem(null)}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
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