import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ANNOTATION_COST = 5;

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

    const { selectedText, context } = await request.json();

    if (!selectedText) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    const { data: deductResult, error: deductError } = await supabase.rpc(
      'deduct_credits',
      {
        p_user_id: user.id,
        p_amount: ANNOTATION_COST,
        p_type: 'annotation',
        p_description: '文本注释'
      }
    );

    if (deductError || !deductResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error: deductResult?.error || 'insufficient_credits',
          message: deductResult?.message || '积分不足',
          current_balance: deductResult?.current_balance,
          required: ANNOTATION_COST
        },
        { status: 402 }
      );
    }

    const messages = [
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

    const response = await axios.post(
      process.env.DEEPSEEK_API_URL!,
      {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
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

    const annotation = {
      explanation: parsed.explanation || '暂无解释',
      translation: parsed.translation || 'No translation available',
      reference: parsed.reference || '暂无典故'
    };

    return NextResponse.json({
      success: true,
      annotation,
      credits_deducted: ANNOTATION_COST,
      new_balance: deductResult.new_balance
    });

  } catch (error: any) {
    console.error('AI Annotation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Annotation failed' },
      { status: 500 }
    );
  }
}
