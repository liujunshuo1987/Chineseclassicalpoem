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
      setAnalysisResult(analysis);
      setShowAnalysisResult(true);
    } catch (error) {
      console.error('Failed to analyze text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useAnalyzedText = () => {
    if (analysisResult?.punctuatedText) {
      // This would typically call a prop function to update the main text
      // For now, we'll just close the analysis result
      setShowAnalysisResult(false);
      setInputText('');
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
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
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

      {/* Analysis Result Modal */}
      {showAnalysisResult && analysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {isEnglish ? 'Text Analysis Results' : '文本分析结果'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnalysisResult(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Title Section */}
                {analysisResult.title && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      {isEnglish ? 'Title' : '标题'}
                    </h4>
                    <div className="text-lg font-serif text-amber-800">
                      {analysisResult.title}
                    </div>
                  </div>
                )}

                {/* Main Text Section */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    {isEnglish ? 'Main Text (Punctuated)' : '正文（已加标点）'}
                  </h4>
                  <div className="text-lg font-serif text-blue-800 leading-relaxed">
                    {analysisResult.punctuatedText}
                  </div>
                </div>

                {/* Paragraphs Section */}
                {analysisResult.paragraphs && analysisResult.paragraphs.length > 1 && (
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                    <h4 className="font-semibold text-cyan-900 mb-3">
                      {isEnglish ? 'Paragraphs' : '分段'}
                    </h4>
                    <div className="space-y-3">
                      {analysisResult.paragraphs.map((paragraph, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-cyan-100">
                          <div className="text-sm font-medium text-cyan-700 mb-1">
                            {isEnglish ? `Paragraph ${index + 1}` : `第${index + 1}段`}
                          </div>
                          <div className="font-serif text-cyan-800 leading-relaxed">
                            {paragraph}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Annotations Section */}
                {analysisResult.annotations && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">
                      {isEnglish ? 'Annotations' : '注释'}
                    </h4>
                    <div className="text-sm font-serif text-green-800 leading-relaxed">
                      {analysisResult.annotations}
                    </div>
                  </div>
                )}

                {/* Copyright/Publication Info */}
                {analysisResult.copyright && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      {isEnglish ? 'Publication Info' : '版权信息'}
                    </h4>
                    <div className="text-sm text-purple-800">
                      {analysisResult.copyright}
                    </div>
                  </div>
                )}

                {/* Decorative Elements */}
                {analysisResult.decorativeElements && (
                  <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                    <h4 className="font-semibold text-rose-900 mb-2">
                      {isEnglish ? 'Decorative Elements' : '装饰元素'}
                    </h4>
                    <div className="text-sm text-rose-800">
                      {analysisResult.decorativeElements}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={useAnalyzedText}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  {isEnglish ? 'Use This Analysis' : '使用此分析'}
                </button>
                <button
                  onClick={() => setShowAnalysisResult(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  {isEnglish ? 'Close' : '关闭'}
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