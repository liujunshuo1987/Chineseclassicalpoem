import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;
        const orderId = session.metadata?.order_id;
        const credits = parseInt(session.metadata?.credits || '0');
        const bonusCredits = parseInt(session.metadata?.bonus_credits || '0');
        const totalCredits = credits + bonusCredits;

        if (!userId || !orderId) {
          console.error('Missing metadata in checkout session');
          break;
        }

        const { error: orderUpdateError } = await supabase
          .from('payment_orders')
          .update({
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (orderUpdateError) {
          console.error('Failed to update order:', orderUpdateError);
          break;
        }

        const { data: addResult, error: addError } = await supabase.rpc(
          'add_credits',
          {
            p_user_id: userId,
            p_amount: totalCredits,
            p_type: 'purchase',
            p_description: `购买积分套餐：${credits} 积分${bonusCredits > 0 ? ` + ${bonusCredits} 赠送` : ''}`,
            p_related_entity_id: parseInt(orderId),
            p_related_entity_type: 'order'
          }
        );

        if (addError || !addResult?.success) {
          console.error('Failed to add credits:', addError);
          break;
        }

        console.log(`Credits added successfully for user ${userId}: ${totalCredits} credits`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const { error } = await supabase
          .from('payment_orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update failed order:', error);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        const { data: order } = await supabase
          .from('payment_orders')
          .select('*')
          .eq('stripe_payment_intent_id', charge.payment_intent as string)
          .maybeSingle();

        if (order && order.status === 'completed') {
          const totalCredits = order.credits + order.bonus_credits;

          await supabase
            .from('payment_orders')
            .update({ status: 'refunded' })
            .eq('id', order.id);

          await supabase.rpc('deduct_credits', {
            p_user_id: order.user_id,
            p_amount: totalCredits,
            p_type: 'refund',
            p_description: `订单退款：${order.order_number}`,
            p_related_entity_id: order.id,
            p_related_entity_type: 'order'
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
