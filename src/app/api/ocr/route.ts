import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const OCR_COST = 10;

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

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    const { data: deductResult, error: deductError } = await supabase.rpc(
      'deduct_credits',
      {
        p_user_id: user.id,
        p_amount: OCR_COST,
        p_type: 'ocr',
        p_description: 'OCR 图片识别'
      }
    );

    if (deductError || !deductResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error: deductResult?.error || 'insufficient_credits',
          message: deductResult?.message || '积分不足',
          current_balance: deductResult?.current_balance,
          required: OCR_COST
        },
        { status: 402 }
      );
    }

    const ocrFormData = new FormData();
    ocrFormData.append('file', imageFile);
    ocrFormData.append('apikey', process.env.OCR_API_KEY!);
    ocrFormData.append('language', 'chs');
    ocrFormData.append('isOverlayRequired', 'true');
    ocrFormData.append('detectOrientation', 'true');
    ocrFormData.append('scale', 'true');
    ocrFormData.append('OCREngine', '2');

    const ocrResponse = await fetch(process.env.OCR_API_URL!, {
      method: 'POST',
      body: ocrFormData,
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR API error: ${ocrResponse.status}`);
    }

    const ocrData = await ocrResponse.json();

    if (ocrData.IsErroredOnProcessing) {
      throw new Error(ocrData.ErrorMessage || 'OCR processing failed');
    }

    if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      throw new Error('No text found in image');
    }

    const text = ocrData.ParsedResults[0].ParsedText || '';

    return NextResponse.json({
      success: true,
      text,
      credits_deducted: OCR_COST,
      new_balance: deductResult.new_balance
    });

  } catch (error: any) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'OCR processing failed' },
      { status: 500 }
    );
  }
}
