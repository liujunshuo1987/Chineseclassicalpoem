import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const { data: order } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('stripe_checkout_session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      session: {
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
      },
      order: order || null
    });

  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify session' },
      { status: 500 }
    );
  }
}
