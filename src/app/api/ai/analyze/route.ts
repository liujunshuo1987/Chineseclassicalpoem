import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ANALYSIS_COST = 15;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    const { data: deductResult, error: deductError } = await supabase.rpc(
      'deduct_credits',
      {
        p_user_id: user.id,
        p_amount: ANALYSIS_COST,
        p_type: 'analysis',
        p_description: 'AI 文本分析'
      }
    );

    if (deductError || !deductResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error: deductResult?.error || 'insufficient_credits',
          message: deductResult?.message || '积分不足',
          current_balance: deductResult?.current_balance,
          required: ANALYSIS_COST
        },
        { status: 402 }
      );
    }

    const messages = [
      {
        role: 'system',
        content: `你是一个古籍文献专家。请分析古书页面的OCR文本，识别并分类不同的文本元素：
1. 正文 - 主要的古典文本内容
2. 注释 - 小字注释、夹注、眉批等
3. 标题 - 篇名、章节标题
4. 版权信息 - 刻印信息、出版信息
5. 装饰元素 - 花边、符号等非文字内容

同时请：
- 为正文添加适当的标点符号（句读）
- 将正文按意义分段
- 当遇到混合的不同类型文本（如诗歌、文章、标题、注释等）时，请在不同文本类型之间用两个空行分隔

请以JSON格式返回：
{
  "mainText": "识别出的正文内容",
  "annotations": "注释内容",
  "title": "标题内容",
  "copyright": "版权或刻印信息",
  "decorativeElements": "装饰元素描述",
  "punctuatedText": "加标点的正文，不同文本类型之间用两个空行分隔",
  "paragraphs": ["分段后的正文数组"]
}`
      },
      {
        role: 'user',
        content: `请分析以下古书OCR文本：\n\n${text}`
      }
    ];

    const response = await axios.post(
      process.env.DEEPSEEK_API_URL!,
      {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content || '';
    const cleanedResponse = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleanedResponse);

    const analysis = {
      mainText: parsed.mainText || '',
      annotations: parsed.annotations || '',
      title: parsed.title || '',
      copyright: parsed.copyright || '',
      decorativeElements: parsed.decorativeElements || '',
      punctuatedText: parsed.punctuatedText || text,
      paragraphs: parsed.paragraphs || [text]
    };

    return NextResponse.json({
      success: true,
      analysis,
      credits_deducted: ANALYSIS_COST,
      new_balance: deductResult.new_balance
    });

  } catch (error: any) {
    console.error('AI Analysis API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
