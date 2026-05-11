import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Environment variables — add these to Vercel before going live:
//   LEMONSQUEEZY_API_KEY
//   LEMONSQUEEZY_STORE_ID
//   LEMONSQUEEZY_VARIANT_ID_STARTER
//   LEMONSQUEEZY_VARIANT_ID_PRO
//   NEXT_PUBLIC_APP_URL  (e.g. https://texaspermittracker.com)
// ─────────────────────────────────────────────────────────────────────────────

const LEMONSQUEEZY_API_KEY       = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID      = process.env.LEMONSQUEEZY_STORE_ID;
const APP_URL                    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const variantId = body.get('variantId') as string | null;
    const plan      = body.get('plan')      as string | null;

    // ── Placeholder log (safe to deploy now) ──────────────────────────────────
    console.log('Checkout initiated', { plan, variantId });

    // ── TODO: swap this block in once your LemonSqueezy account is live ───────
    //
    // if (!LEMONSQUEEZY_API_KEY || !LEMONSQUEEZY_STORE_ID || !variantId) {
    //   return NextResponse.json({ error: 'Missing LemonSqueezy configuration.' }, { status: 500 });
    // }
    //
    // const lsRes = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
    //     Accept: 'application/vnd.api+json',
    //     'Content-Type': 'application/vnd.api+json',
    //   },
    //   body: JSON.stringify({
    //     data: {
    //       type: 'checkouts',
    //       attributes: {
    //         checkout_options: { dark: false },
    //         checkout_data: { custom: { plan } },
    //         product_options: {
    //           redirect_url: `${APP_URL}/dashboard?subscribed=true`,
    //         },
    //       },
    //       relationships: {
    //         store:   { data: { type: 'stores',   id: LEMONSQUEEZY_STORE_ID } },
    //         variant: { data: { type: 'variants', id: variantId } },
    //       },
    //     },
    //   }),
    // });
    //
    // const lsJson = await lsRes.json();
    // const checkoutUrl = lsJson?.data?.attributes?.url;
    // return NextResponse.redirect(checkoutUrl, 303);
    // ─────────────────────────────────────────────────────────────────────────

    // Temporary: redirect back to pricing with a coming-soon notice
    return NextResponse.redirect(
      new URL(`/pricing?notice=coming-soon&plan=${plan ?? ''}`, APP_URL),
      303,
    );
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
