import React, { useState } from 'react';
import { BookOpen, MessageCircle, X, Lightbulb, ExternalLink } from 'lucide-react';

interface ReaderProps {
  isEnglish: boolean;
  text: string;
}

interface Annotation {
  text: string;
  explanation: string;
  translation?: string;
  reference?: string;
}

const Reader: React.FC<ReaderProps> = ({ isEnglish, text }) => {
  const [selectedText, setSelectedText] = useState('');
  const [annotation, setAnnotation] = useState<Annotation | null>(null);
  const [showAnnotation, setShowAnnotation] = useState(false);

  // Mock annotations database
  const annotations: Record<string, Annotation> = {
    '學而時習之': {
      text: '學而時習之',
      explanation: '學習並且經常溫習所學的知識',
      translation: 'Learning and frequently reviewing what has been learned',
      reference: '《論語·學而》'
    },
    '不亦說乎': {
      text: '不亦說乎',
      explanation: '不是很快樂嗎？「說」通「悦」，表示喜悅',
      translation: 'Is it not a pleasure?',
      reference: '《論語·學而》'
    },
    '有朋自遠方來': {
      text: '有朋自遠方來',
      explanation: '有志同道合的朋友從遠方來訪',
      translation: 'Having friends come from afar',
      reference: '《論語·學而》'
    },
    '天下皆知美之為美': {
      text: '天下皆知美之為美',
      explanation: '天下的人都知道美的所以為美',
      translation: 'When all under Heaven know what is beautiful as beautiful',
      reference: '《道德經》第二章'
    },
    '有無相生': {
      text: '有無相生',
      explanation: '有和無是相互依存、相互產生的',
      translation: 'Being and non-being produce each other',
      reference: '《道德經》第二章'
    },
    '莊周夢為胡蝶': {
      text: '莊周夢為胡蝶',
      explanation: '莊子夢見自己變成了蝴蝶',
      translation: 'Zhuangzi dreamed he was a butterfly',
      reference: '《莊子·齊物論》'
    }
  };

  const handleTextSelection = (selectedText: string) => {
    // Find the best matching annotation
    const matchingKey = Object.keys(annotations).find(key => 
      selectedText.includes(key) || key.includes(selectedText)
    );
    
    if (matchingKey) {
      setSelectedText(selectedText);
      setAnnotation(annotations[matchingKey]);
      setShowAnnotation(true);
    } else {
      // Generate a mock annotation for demo purposes
      setSelectedText(selectedText);
      setAnnotation({
        text: selectedText,
        explanation: isEnglish 
          ? 'This phrase contains classical Chinese elements that would benefit from scholarly interpretation.'
          : '此詞句包含古典中文元素，需要學術解釋。',
        translation: isEnglish ? 'Translation would appear here' : '翻譯將在此顯示',
        reference: isEnglish ? 'Classical text reference' : '古典文獻參考'
      });
      setShowAnnotation(true);
    }
  };

  const renderInteractiveText = (text: string) => {
    // Split text into clickable segments
    const segments = text.split('').map((char, index) => (
      <span
        key={index}
        className="hover:bg-yellow-200 cursor-pointer transition-colors rounded px-0.5"
        onClick={() => {
          // Find a reasonable segment around the clicked character
          const start = Math.max(0, index - 2);
          const end = Math.min(text.length, index + 3);
          const segment = text.slice(start, end);
          handleTextSelection(segment);
        }}
      >
        {char}
      </span>
    ));

    return <div className="leading-relaxed">{segments}</div>;
  };

  const defaultText = isEnglish 
    ? "Click 'Scan Texts' to upload an image, or try the sample text above by clicking on any characters."
    : "點擊「掃描文本」上傳圖像，或點擊上方文字中的任意字符嘗試樣本文本。";

  const sampleText = "子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？」";

  const displayText = text || sampleText;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {isEnglish ? 'Text Reader' : '文本閱讀器'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isEnglish 
            ? 'Tap any word or phrase to see annotations, translations, and references.'
            : '點擊任何詞彙或短語查看註釋、翻譯和參考資料。'
          }
        </p>
      </div>

      {/* Reading Area */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">
            {isEnglish ? 'Classical Text' : '古典文本'}
          </h3>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
          <div className="text-2xl font-serif text-gray-800 leading-loose text-center">
            {text ? renderInteractiveText(text) : renderInteractiveText(sampleText)}
          </div>
        </div>

        {!text && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-center">
              {defaultText}
            </p>
          </div>
        )}
      </div>

      {/* Reading Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-6 h-6 text-indigo-600 mt-1" />
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">
              {isEnglish ? 'Reading Tips' : '閱讀提示'}
            </h4>
            <ul className="text-indigo-700 space-y-1 text-sm">
              <li>• {isEnglish ? 'Click on characters or phrases to see annotations' : '點擊字符或短語查看註釋'}</li>
              <li>• {isEnglish ? 'Highlighted text shows interactive elements' : '高亮文本顯示交互元素'}</li>
              <li>• {isEnglish ? 'Annotations include modern explanations and references' : '註釋包括現代解釋和參考資料'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Annotation Modal */}
      {showAnnotation && annotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {isEnglish ? 'Annotation' : '註釋'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnnotation(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {isEnglish ? 'Selected Text' : '選中文本'}
                  </h4>
                  <div className="bg-yellow-100 rounded-lg p-3 text-lg font-serif text-gray-800">
                    {annotation.text}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {isEnglish ? 'Explanation' : '解釋'}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {annotation.explanation}
                  </p>
                </div>

                {annotation.translation && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {isEnglish ? 'Translation' : '翻譯'}
                    </h4>
                    <p className="text-gray-700 italic">
                      {annotation.translation}
                    </p>
                  </div>
                )}

                {annotation.reference && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {isEnglish ? 'Reference' : '參考'}
                    </h4>
                    <div className="flex items-center space-x-2 text-indigo-600">
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">{annotation.reference}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowAnnotation(false)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {isEnglish ? 'Close' : '關閉'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;