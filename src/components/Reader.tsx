import React, { useState } from 'react';
import { BookOpen, MessageCircle, X, Lightbulb, ExternalLink, FileText, Send, Loader } from 'lucide-react';
import { deepseekService } from '../services/deepseekApi';

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
  const [isLoadingAnnotation, setIsLoadingAnnotation] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    mainText: string;
    annotations: string;
    title: string;
    copyright: string;
    decorativeElements: string;
    punctuatedText: string;
    paragraphs: string[];
  } | null>(null);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [displayText, setDisplayText] = useState(text);
  const [questionableSegments, setQuestionableSegments] = useState<string[]>([]);

  const handleTextSelection = async (selectedText: string) => {
    if (selectedText.trim().length === 0) return;

    setSelectedText(selectedText);
    setIsLoadingAnnotation(true);
    setShowAnnotation(true);
    setAnnotation(null);

    try {
      const annotationData = await deepseekService.annotateText(selectedText, text);
      setSelectedText(selectedText);
      setAnnotation({
        text: selectedText,
        explanation: annotationData.explanation,
        translation: annotationData.translation,
        reference: annotationData.reference
      });
    } catch (error) {
      console.error('Failed to get annotation:', error);
      setAnnotation({
        text: selectedText,
        explanation: isEnglish 
          ? 'Failed to load annotation. Please try again.'
          : '註釋載入失敗，請重試。',
        translation: 'Annotation loading failed',
        reference: 'Unable to retrieve reference'
      });
    } finally {
      setIsLoadingAnnotation(false);
    }
  };

  const analyzeInputText = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const analysis = await deepseekService.analyzeAncientBookText(inputText);
      // Directly apply the analysis results
      setAnalysisResult(analysis);
      setDisplayText(analysis.punctuatedText);
      identifyQuestionableSegments(analysis.punctuatedText);
      setInputText(''); // Clear the input after successful analysis
    } catch (error) {
      console.error('Failed to analyze text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const identifyQuestionableSegments = (text: string) => {
    // Simple heuristic to identify potentially questionable segments
    const questionable: string[] = [];
    
    // Look for unusual character combinations or potential OCR errors
    const segments = text.split(/[，。；：！？]/);
    segments.forEach(segment => {
      const trimmed = segment.trim();
      if (trimmed.length > 0) {
        // Mark segments with unusual patterns as questionable
        if (
          /[a-zA-Z0-9]/.test(trimmed) || // Contains Latin characters or numbers
          /[^\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(trimmed) || // Contains non-CJK characters
          trimmed.length < 2 || // Very short segments
          /(.)\1{3,}/.test(trimmed) // Repeated characters (potential OCR error)
        ) {
          questionable.push(trimmed);
        }
      }
    });
    
    setQuestionableSegments(questionable);
  };

  const renderFormattedText = (text: string) => {
    if (!analysisResult?.paragraphs || analysisResult.paragraphs.length <= 1) {
      return renderInteractiveText(text);
    }

    return (
      <div className="space-y-6">
        {analysisResult.paragraphs.map((paragraph, index) => (
          <div key={index} className="paragraph-section text-xl font-serif leading-loose">
            <div className="indent-8">
              {renderInteractiveTextWithHighlights(paragraph)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInteractiveTextWithHighlights = (text: string) => {
    const segments = text.split('').map((char, index) => {
      // Check if this character is part of a questionable segment
      const isQuestionable = questionableSegments.some(segment => 
        text.includes(segment) && segment.includes(char)
      );
      
      return (
        <span
          key={index}
          className={`cursor-pointer transition-colors rounded px-0.5 ${
            isQuestionable 
              ? 'bg-red-100 text-red-800 hover:bg-red-200 border-b border-red-300' 
              : 'hover:bg-yellow-200'
          }`}
          onClick={() => {
            // Find a reasonable segment around the clicked character
            const start = Math.max(0, index - 3);
            const end = Math.min(text.length, index + 4);
            const segment = text.slice(start, end);
            handleTextSelection(segment);
          }}
          title={isQuestionable ? (isEnglish ? 'Questionable content - click for analysis' : '可疑内容 - 点击分析') : ''}
        >
          {char}
        </span>
      );
    });

    return <div className="leading-relaxed">{segments}</div>;
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

  const currentDisplayText = displayText || text || sampleText;

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
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">
            {isEnglish ? 'Classical Text' : '古典文本'}
          </h3>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
          <div className="text-2xl font-serif text-gray-800 leading-loose">
            {analysisResult ? (
              <div className="text-left">
                {renderFormattedText(currentDisplayText)}
              </div>
            ) : (
              <div className="text-center">
                {currentDisplayText === sampleText ? renderInteractiveText(sampleText) : renderInteractiveText(currentDisplayText)}
              </div>
            )}
          </div>
        </div>

        {!text && !displayText && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-center">
              {defaultText}
            </p>
          </div>
        )}

        {/* Analysis Status */}
        {analysisResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-green-800 font-medium">
                  {isEnglish ? 'Text Analysis Applied' : '文本分析已应用'}
                </p>
                <p className="text-green-700 text-sm">
                  {isEnglish 
                    ? `Formatted into ${analysisResult.paragraphs.length} paragraphs. Red highlights indicate questionable content.`
                    : `已格式化为${analysisResult.paragraphs.length}个段落。红色高亮表示可疑内容。`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Text Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">
            {isEnglish ? 'Analyze Raw Text' : '分析原始文本'}
          </h3>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isEnglish 
              ? 'Paste unannotated classical Chinese text here for AI analysis...'
              : '在此粘贴未加标点的古典中文文本进行AI分析...'
            }
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
          
          <button
            onClick={analyzeInputText}
            disabled={!inputText.trim() || isAnalyzing}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{isEnglish ? 'Analyzing with AI...' : 'AI分析中...'}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{isEnglish ? 'Analyze Text' : '分析文本'}</span>
              </>
            )}
          </button>
        </div>
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
              <li>• {isEnglish ? 'Yellow highlights show interactive elements, red highlights show questionable content' : '黄色高亮显示交互元素，红色高亮显示可疑内容'}</li>
              <li>• {isEnglish ? 'Annotations include modern explanations and references' : '註釋包括現代解釋和參考資料'}</li>
              <li>• {isEnglish ? 'After analysis, text is formatted into numbered paragraphs' : '分析后，文本格式化为编号段落'}</li>
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
                    {isEnglish ? 'AI Annotation' : 'AI註釋'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnnotation(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {isLoadingAnnotation ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">
                    {isEnglish ? 'Analyzing with AI...' : 'AI分析中...'}
                  </span>
                </div>
              ) : annotation ? (
                <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {isEnglish ? 'Selected Text' : '選中文本'}
                  </h4>
                  <div className="bg-yellow-100 rounded-lg p-3 text-lg font-serif text-gray-800">
                    {selectedText}
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
              ) : null}

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