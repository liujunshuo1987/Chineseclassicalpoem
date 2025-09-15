import axios from 'axios';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL;

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class DeepSeekService {
  private async callAPI(messages: DeepSeekMessage[]): Promise<string> {
    try {
      const response = await axios.post<DeepSeekResponse>(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error('Failed to process request with DeepSeek API');
    }
  }

  async correctOCRText(rawText: string): Promise<string> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个专门处理古典中文文本的专家。你的任务是：
1. 纠正OCR识别错误的字符
2. 添加适当的标点符号（句读）
3. 保持原文的古典中文风格
4. 只返回纠正后的文本，不要添加任何解释`
      },
      {
        role: 'user',
        content: `请纠正以下OCR识别的古典中文文本并添加标点符号：\n\n${rawText}`
      }
    ];

    return await this.callAPI(messages);
  }

  async annotateText(selectedText: string, context: string = ''): Promise<{
    explanation: string;
    translation: string;
    reference: string;
  }> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个古典中文文学专家。请为用户选中的文本提供详细注释，包括：
1. 现代中文解释
2. 英文翻译
3. 可能的典故或出处
请以JSON格式返回，格式如下：
{
  "explanation": "现代中文解释",
  "translation": "English translation",
  "reference": "典故或出处"
}`
      },
      {
        role: 'user',
        content: `请为以下古典中文文本提供注释：
选中文本：${selectedText}
${context ? `上下文：${context}` : ''}`
      }
    ];

    try {
      const response = await this.callAPI(messages);
      // Clean the response by removing markdown code blocks
      const cleanedResponse = response.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      return {
        explanation: parsed.explanation || '暂无解释',
        translation: parsed.translation || 'No translation available',
        reference: parsed.reference || '暂无典故'
      };
    } catch (error) {
      console.error('Failed to parse annotation response:', error);
      return {
        explanation: '解析注释时出现错误',
        translation: 'Error parsing annotation',
        reference: '无法获取典故信息'
      };
    }
  }

  async generatePoetry(keywords: string, style: string): Promise<{
    content: string;
    explanation: string;
    styleAnalysis: string;
  }> {
    const stylePrompts = {
      '5char': '五言绝句（四行，每行五字，押韵）',
      '7char': '七言绝句（四行，每行七字，押韵）',
      'couplet': '对联（两行对偶，平仄相对）'
    };

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `你是一个古典诗词创作专家。请根据用户提供的关键词和风格创作诗词。
要求：
1. 严格按照指定的格律创作
2. 注意平仄和押韵
3. 意境优美，符合古典诗词风格
4. 返回JSON格式：
{
  "content": "创作的诗词内容",
  "explanation": "诗词的意境和主题解释",
  "styleAnalysis": "格律和技法分析"
}`
      },
      {
        role: 'user',
        content: `请创作一首${stylePrompts[style as keyof typeof stylePrompts] || '古典诗词'}，主题关键词：${keywords}`
      }
    ];

    try {
      const response = await this.callAPI(messages);
      // Clean the response by removing markdown code blocks
      const cleanedResponse = response.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      return {
        content: parsed.content || '创作失败',
        explanation: parsed.explanation || '暂无解释',
        styleAnalysis: parsed.styleAnalysis || '暂无分析'
      };
    } catch (error) {
      console.error('Failed to parse poetry response:', error);
      return {
        content: '诗词创作时出现错误',
        explanation: '无法生成诗词解释',
        styleAnalysis: '无法分析格律'
      };
    }
  }
}

export const deepseekService = new DeepSeekService();