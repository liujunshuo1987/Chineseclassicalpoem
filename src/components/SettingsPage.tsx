import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface SettingsPageProps {
  isEnglish: boolean;
}

interface APISettings {
  ocrApiKey: string;
  ocrApiUrl: string;
  llmApiKey: string;
  llmApiUrl: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isEnglish }) => {
  const [settings, setSettings] = useState<APISettings>({
    ocrApiKey: '',
    ocrApiUrl: '',
    llmApiKey: '',
    llmApiUrl: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    ocr: false,
    llm: false
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    } else {
      // Load from environment variables as defaults
      setSettings({
        ocrApiKey: import.meta.env.VITE_OCR_API_KEY || '',
        ocrApiUrl: import.meta.env.VITE_OCR_API_URL || 'https://api.ocr.space/parse/image',
        llmApiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
        llmApiUrl: import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions'
      });
    }
  }, []);

  const handleInputChange = (field: keyof APISettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('apiSettings', JSON.stringify(settings));
      
      // Update environment variables for immediate use
      (window as any).__API_SETTINGS__ = settings;
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      ocrApiKey: import.meta.env.VITE_OCR_API_KEY || '',
      ocrApiUrl: import.meta.env.VITE_OCR_API_URL || 'https://api.ocr.space/parse/image',
      llmApiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      llmApiUrl: import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions'
    };
    setSettings(defaultSettings);
    localStorage.removeItem('apiSettings');
    (window as any).__API_SETTINGS__ = defaultSettings;
  };

  const toggleKeyVisibility = (type: 'ocr' | 'llm') => {
    setShowKeys(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {isEnglish ? 'API Settings' : 'API 設置'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isEnglish 
            ? 'Configure your own OCR and LLM API endpoints for ancient book processing and text analysis.'
            : '配置您自己的OCR和LLM API端點，用於古籍處理和文本分析。'
          }
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">
            {isEnglish ? 'API Configuration' : 'API 配置'}
          </h3>
        </div>

        <div className="space-y-8">
          {/* OCR API Settings */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {isEnglish ? 'OCR API Settings' : 'OCR API 設置'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEnglish ? 'OCR API Key' : 'OCR API 密鑰'}
                </label>
                <div className="relative">
                  <input
                    type={showKeys.ocr ? 'text' : 'password'}
                    value={settings.ocrApiKey}
                    onChange={(e) => handleInputChange('ocrApiKey', e.target.value)}
                    placeholder={isEnglish ? 'Enter your OCR API key' : '輸入您的OCR API密鑰'}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('ocr')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.ocr ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEnglish ? 'OCR API URL' : 'OCR API 網址'}
                </label>
                <input
                  type="text"
                  value={settings.ocrApiUrl}
                  onChange={(e) => handleInputChange('ocrApiUrl', e.target.value)}
                  placeholder={isEnglish ? 'Enter OCR API endpoint URL' : '輸入OCR API端點網址'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* LLM API Settings */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {isEnglish ? 'LLM API Settings' : 'LLM API 設置'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEnglish ? 'LLM API Key' : 'LLM API 密鑰'}
                </label>
                <div className="relative">
                  <input
                    type={showKeys.llm ? 'text' : 'password'}
                    value={settings.llmApiKey}
                    onChange={(e) => handleInputChange('llmApiKey', e.target.value)}
                    placeholder={isEnglish ? 'Enter your LLM API key' : '輸入您的LLM API密鑰'}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('llm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys.llm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEnglish ? 'LLM API URL' : 'LLM API 網址'}
                </label>
                <input
                  type="text"
                  value={settings.llmApiUrl}
                  onChange={(e) => handleInputChange('llmApiUrl', e.target.value)}
                  placeholder={isEnglish ? 'Enter LLM API endpoint URL' : '輸入LLM API端點網址'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isEnglish ? 'Saving...' : '保存中...'}</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>{isEnglish ? 'Saved!' : '已保存！'}</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="w-5 h-5" />
                <span>{isEnglish ? 'Error' : '錯誤'}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{isEnglish ? 'Save Settings' : '保存設置'}</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{isEnglish ? 'Reset to Default' : '重置為默認'}</span>
          </button>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                {isEnglish ? 'Configuration Notes' : '配置說明'}
              </h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• {isEnglish ? 'OCR API: Used for processing ancient book images and text recognition' : 'OCR API：用於處理古籍圖像和文字識別'}</li>
                <li>• {isEnglish ? 'LLM API: Used for text analysis, annotation, and poetry creation' : 'LLM API：用於文本分析、註釋和詩詞創作'}</li>
                <li>• {isEnglish ? 'Settings are saved locally in your browser' : '設置保存在您的瀏覽器本地'}</li>
                <li>• {isEnglish ? 'Changes take effect immediately after saving' : '保存後更改立即生效'}</li>
                <li>• {isEnglish ? 'Payment processing is handled securely on the server' : '支付處理在服務器端安全進行'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;