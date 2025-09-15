import React, { useState } from 'react';
import { PenTool, Sparkles, RefreshCw, Copy, Download } from 'lucide-react';

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

  // Mock poem database for demo
  const mockPoems: Record<PoemStyle, Poem[]> = {
    '5char': [
      {
        content: '月下獨酌時，\n清風拂面來。\n孤影伴吾醉，\n詩心自徘徊。',
        style: '五言絕句',
        theme: '月光, 孤獨, 詩酒',
        explanation: '此詩描寫月夜獨飲的情景，表達詩人孤獨而自得的心境。'
      },
      {
        content: '春山花正開，\n流水向東歸。\n鳥語林間響，\n人閒心自飛。',
        style: '五言絕句',
        theme: '春天, 山水, 自然',
        explanation: '描繪春日山景，以自然之美映襯心靈的自由與寧靜。'
      }
    ],
    '7char': [
      {
        content: '秋風蕭瑟夜深沈，\n明月當空照古今。\n獨坐高樓望遠處，\n思君不見淚如金。',
        style: '七言絕句',
        theme: '秋夜, 思念, 離別',
        explanation: '此詩表達秋夜思人的深情，以明月古今不變襯托人世離合之苦。'
      },
      {
        content: '江南煙雨潤如詩，\n楊柳依依伴水湄。\n小橋流水人家美，\n一片春光醉客歸。',
        style: '七言絕句',
        theme: '江南, 春景, 詩意',
        explanation: '描繪江南春日美景，以詩意的筆觸展現水鄉風情。'
      }
    ],
    'couplet': [
      {
        content: '上聯：春風化雨潤大地\n下聯：明月照人暖心田',
        style: '對聯',
        theme: '春天, 自然, 溫暖',
        explanation: '此聯以春風明月比喻溫暖人心的美好事物，對仗工整，意境深遠。'
      },
      {
        content: '上聯：山高水長情不斷\n下聯：花開花落意無窮',
        style: '對聯',
        theme: '山水, 情感, 永恆',
        explanation: '表達情感如山水般綿長，如花開花落般無窮無盡的意境。'
      }
    ]
  };

  const generatePoem = async () => {
    if (!keywords.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Select a random poem from the mock database
    const poemsOfStyle = mockPoems[selectedStyle];
    const randomPoem = poemsOfStyle[Math.floor(Math.random() * poemsOfStyle.length)];
    
    setGeneratedPoem({
      ...randomPoem,
      theme: keywords // Use user's keywords as theme
    });
    setIsGenerating(false);
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

      {/* Sample Examples */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          {isEnglish ? 'Sample Themes to Try' : '推薦主題'}
        </h4>
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