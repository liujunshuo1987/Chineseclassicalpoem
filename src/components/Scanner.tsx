import React, { useState } from 'react';
import { Camera, Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { deepseekService } from '../services/deepseekApi';

interface ScannerProps {
  isEnglish: boolean;
  onNavigateToReader: (text: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ isEnglish, onNavigateToReader }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Mock OCR raw text (simulating OCR output with errors)
  const mockOCRTexts = [
    '子曰学而时习之不亦说乎有朋自远方来不亦乐乎人不知而不愠不亦君子乎',
    '天下皆知美之为美斯恶已皆知善之为善斯不善已故有无相生难易相成长短相较高下相倾音声相和前后相随',
    '昔者庄周梦为胡蝶栩栩然胡蝶也自喻适志与不知周也俄然觉则蘧蘧然周也不知周之梦为胡蝶与胡蝶之梦为周与'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        processImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    setIsProcessing(true);
    setOcrResult('');
    setError(null);

    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get mock OCR raw text
      const rawOCRText = mockOCRTexts[Math.floor(Math.random() * mockOCRTexts.length)];
      
      // Use DeepSeek API to correct and punctuate the text
      const correctedText = await deepseekService.correctOCRText(rawOCRText);
      setOcrResult(correctedText);
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(isEnglish ? 'Failed to process image. Please try again.' : '图像处理失败，请重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewInReader = () => {
    if (ocrResult) {
      onNavigateToReader(ocrResult);
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
      {ocrResult && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {isEnglish ? 'Processing Complete' : '處理完成'}
            </h3>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              {isEnglish ? 'Processed Text:' : '處理後文本：'}
            </h4>
            <div className="text-lg font-serif text-gray-800 leading-relaxed">
              {ocrResult}
            </div>
          </div>

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
                setOcrResult('');
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
                ? 'Using DeepSeek AI for intelligent text correction and punctuation. OCR simulation with real AI processing.'
                : '使用DeepSeek AI進行智能文本校正和標點。OCR模擬配合真實AI處理。'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;