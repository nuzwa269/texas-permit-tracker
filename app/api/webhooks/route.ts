import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Required so Next.js doesn't buffer/parse the body — Stripe needs the raw bytes.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('[webhook] checkout.session.completed missing client_reference_id');
      return NextResponse.json({ error: 'Missing user ID.' }, { status: 400 });
    }

    // Determine plan from amount_total (in cents)
    const amountTotal = session.amount_total ?? 0;
    const planType = amountTotal <= 4900 ? 'starter' : 'pro';

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_subscribed: true, plan_type: planType })
      .eq('id', userId);

    if (error) {
      console.error('[webhook] Supabase update failed:', error);
      return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
    }

    console.log(`[webhook] Subscription activated for user ${userId} — plan: ${planType}`);
  }

  return NextResponse.json({ received: true });
}
