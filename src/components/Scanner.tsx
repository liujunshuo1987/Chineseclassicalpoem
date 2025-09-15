import React, { useState } from 'react';
import { Camera, Upload, Loader, CheckCircle, AlertCircle, BookOpen, FileText, Tag, Copyright, Sparkles } from 'lucide-react';
import { deepseekService } from '../services/deepseekApi';
import { ocrService } from '../services/ocrApi';

interface ScannerProps {
  isEnglish: boolean;
  onNavigateToReader: (text: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ isEnglish, onNavigateToReader }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    mainText: string;
    annotations: string;
    title: string;
    copyright: string;
    decorativeElements: string;
    punctuatedText: string;
    paragraphs: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      // Step 1: OCR processing
      const rawOCRText = await ocrService.processImage(imageFile);
      
      if (!rawOCRText.trim()) {
        throw new Error(isEnglish ? 'No text detected in image' : '图像中未检测到文字');
      }

      // Step 2: AI analysis and categorization
      const analysis = await deepseekService.analyzeAncientBookText(rawOCRText);
      setAnalysisResult(analysis);
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err instanceof Error ? err.message : (isEnglish ? 'Failed to process image. Please try again.' : '图像处理失败，请重试。'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewInReader = () => {
    if (analysisResult?.punctuatedText) {
      onNavigateToReader(analysisResult.punctuatedText);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {isEnglish ? 'Text Scanner' : '文本掃描'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isEnglish 
            ? 'Upload an image of classical Chinese text and let our AI process it with OCR and intelligent correction.'
            : '上傳古典中文文本圖像，讓我們的AI通過OCR和智能校正處理它。'
          }
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="border-2 border-dashed border-indigo-200 rounded-xl p-12 text-center hover:border-indigo-300 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer ${isProcessing ? 'opacity-50' : 'hover:text-indigo-600'} transition-colors`}
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isProcessing ? (
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isProcessing 
                ? (isEnglish ? 'Processing...' : '處理中...')
                : (isEnglish ? 'Upload Image' : '上傳圖像')
              }
            </h3>
            <p className="text-gray-500">
              {isEnglish 
                ? 'Click to select an image file or drag and drop'
                : '點擊選擇圖像文件或拖拽上傳'
              }
            </p>
          </label>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            <div>
              <h4 className="font-semibold text-blue-900">
                {isEnglish ? 'Processing Image...' : '處理圖像中...'}
              </h4>
              <p className="text-blue-700 text-sm">
                {isEnglish 
                  ? 'Applying OCR and AI-powered text correction with DeepSeek'
                  : '應用OCR和DeepSeek智能文本校正'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">
                {isEnglish ? 'Processing Error' : '處理錯誤'}
              </h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {analysisResult && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {isEnglish ? 'Ancient Book Analysis Complete' : '古籍分析完成'}
            </h3>
          </div>
          
          {/* Title Section */}
          {analysisResult.title && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900">
                  {isEnglish ? 'Title' : '標題'}
                </h4>
              </div>
              <div className="text-lg font-serif text-amber-800">
                {analysisResult.title}
              </div>
            </div>
          )}

          {/* Main Text Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">
                {isEnglish ? 'Main Text (Punctuated)' : '正文（已加標點）'}
              </h4>
            </div>
            <div className="text-lg font-serif text-blue-800 leading-relaxed">
              {analysisResult.punctuatedText}
            </div>
          </div>

          {/* Annotations Section */}
          {analysisResult.annotations && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">
                  {isEnglish ? 'Annotations' : '註釋'}
                </h4>
              </div>
              <div className="text-sm font-serif text-green-800 leading-relaxed">
                {analysisResult.annotations}
              </div>
            </div>
          )}

          {/* Copyright/Publication Info */}
          {analysisResult.copyright && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Copyright className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">
                  {isEnglish ? 'Publication Info' : '版權信息'}
                </h4>
              </div>
              <div className="text-sm text-purple-800">
                {analysisResult.copyright}
              </div>
            </div>
          )}

          {/* Decorative Elements */}
          {analysisResult.decorativeElements && (
            <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                <h4 className="font-semibold text-rose-900">
                  {isEnglish ? 'Decorative Elements' : '裝飾元素'}
                </h4>
              </div>
              <div className="text-sm text-rose-800">
                {analysisResult.decorativeElements}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleViewInReader}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              {isEnglish ? 'View in Reader' : '在閱讀器中查看'}
            </button>
            <button
              onClick={() => {
                setUploadedImage(null);
                setAnalysisResult(null);
                setError(null);
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              {isEnglish ? 'Scan Another' : '掃描另一個'}
            </button>
          </div>
        </div>
      )}

      {/* AI Processing Info */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">
              {isEnglish ? 'AI-Powered Processing' : 'AI智能處理'}
            </h4>
            <p className="text-amber-700 text-sm">
              {isEnglish 
                ? 'Using specialized ancient book OCR with DeepSeek AI for comprehensive text analysis and categorization.'
                : '使用專業古籍OCR配合DeepSeek AI進行全面文本分析和分類。'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;