import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

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

    const { package_id } = await request.json();

    if (!package_id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const { data: creditPackage, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .maybeSingle();

    if (packageError || !creditPackage) {
      return NextResponse.json(
        { success: false, error: 'Invalid package' },
        { status: 404 }
      );
    }

    const orderNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        package_id: creditPackage.id,
        credits: creditPackage.credits,
        bonus_credits: creditPackage.bonus_credits,
        amount_cents: creditPackage.price_cents,
        currency: creditPackage.currency,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: creditPackage.currency,
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.credits} 积分${creditPackage.bonus_credits > 0 ? ` + ${creditPackage.bonus_credits} 赠送积分` : ''}`,
            },
            unit_amount: creditPackage.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/recharge/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/recharge`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        order_id: order.id.toString(),
        order_number: orderNumber,
        package_id: creditPackage.id.toString(),
        credits: creditPackage.credits.toString(),
        bonus_credits: creditPackage.bonus_credits.toString(),
      },
    });

    await supabase
      .from('payment_orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      session_id: session.id,
      url: session.url,
      order_number: orderNumber
    });

  } catch (error: any) {
    console.error('Stripe checkout creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
