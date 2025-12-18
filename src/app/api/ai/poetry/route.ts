import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const POETRY_COST = 20;

const STYLE_PROMPTS: { [key: string]: string } = {
  '5char_jueju': '五言绝句：四行，每行五字，押韵，平仄有序',
  '7char_jueju': '七言绝句：四行，每行七字，押韵，平仄有序',
  '5char_lushi': '五言律诗：八行，每行五字，严格平仄格律，中间两联对仗',
  '7char_lushi': '七言律诗：八行，每行七字，严格平仄格律，中间两联对仗',
  '5char_gushi': '五言古诗：每行五字，长度不定，格律相对自由',
  '7char_gushi': '七言古诗：每行七字，长度不定，格律相对自由',
  'dielianhua': '蝶恋花词牌：上下阕各五句，严格按照蝶恋花格律填词',
  'shuidiaogeto': '水调歌头词牌：上下阕，气势宏大，严格按照水调歌头格律填词',
  'niannujiao': '念奴娇词牌：豪放风格，适合抒发壮志，严格按照念奴娇格律填词',
  'rumenglin': '如梦令词牌：六句三十三字，短小精悍，严格按照如梦令格律填词',
  'yumeiren': '虞美人词牌：婉约风格，适合抒情，严格按照虞美人格律填词',
  'huanxisha': '浣溪沙词牌：上三下四，清新淡雅，严格按照浣溪沙格律填词',
  'qingyuan': '青玉案词牌：适合写景抒怀，严格按照青玉案格律填词',
  'couplet': '对联：两行对偶，平仄相对，语义呼应，字数相等',
  'fu': '赋：长篇韵文，铺陈描写，句式灵活，可长可短'
};

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

    const { keywords, style, styleName } = await request.json();

    if (!keywords || !style || !styleName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: deductResult, error: deductError } = await supabase.rpc(
      'deduct_credits',
      {
        p_user_id: user.id,
        p_amount: POETRY_COST,
        p_type: 'poetry',
        p_description: '诗词创作'
      }
    );

    if (deductError || !deductResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error: deductResult?.error || 'insufficient_credits',
          message: deductResult?.message || '积分不足',
          current_balance: deductResult?.current_balance,
          required: POETRY_COST
        },
        { status: 402 }
      );
    }

    const stylePrompt = STYLE_PROMPTS[style] || '古典诗词';

    const messages = [
      {
        role: 'system',
        content: `你是一个古典诗词创作专家，精通各种诗词格律。请根据用户提供的关键词和风格创作诗词。
要求：
1. 严格按照指定的诗词格律和词牌要求创作
2. 注意平仄、押韵、对仗等格律要求
3. 意境优美，符合古典诗词风格和传统
4. 对于词牌，必须严格按照该词牌的字数、句数、平仄要求填词
5. 返回JSON格式：
{
  "content": "创作的诗词内容",
  "explanation": "诗词的意境和主题解释",
  "styleAnalysis": "详细的格律、平仄、押韵分析"
}`
      },
      {
        role: 'user',
        content: `请创作一首${stylePrompt}，主题关键词：${keywords}。请严格按照${styleName}的格律要求创作。`
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

    const poetry = {
      content: parsed.content || '创作失败',
      explanation: parsed.explanation || '暂无解释',
      styleAnalysis: parsed.styleAnalysis || '暂无分析'
    };

    const { data: poetryRecord, error: insertError } = await supabase
      .from('poetry_generations')
      .insert({
        user_id: user.id,
        keywords,
        style,
        style_name: styleName,
        content: poetry.content,
        explanation: poetry.explanation,
        style_analysis: poetry.styleAnalysis,
        credits_cost: POETRY_COST
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save poetry:', insertError);
    }

    return NextResponse.json({
      success: true,
      poetry,
      poetry_id: poetryRecord?.id,
      credits_deducted: POETRY_COST,
      new_balance: deductResult.new_balance
    });

  } catch (error: any) {
    console.error('AI Poetry API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Poetry generation failed' },
      { status: 500 }
    );
  }
}
