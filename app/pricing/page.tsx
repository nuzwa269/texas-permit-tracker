import Link from 'next/link';
import { Check, Zap, Shield } from 'lucide-react';

const STARTER_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID_STARTER;
const PRO_VARIANT_ID     = process.env.LEMONSQUEEZY_VARIANT_ID_PRO;

const plans = [
  {
    id: 'starter',
    variantId: STARTER_VARIANT_ID,
    name: 'Starter',
    price: 49,
    description: 'Perfect for independent contractors tracking a handful of permits.',
    icon: Zap,
    iconColor: 'text-amber-500',
    badgeColor: 'bg-amber-50 text-amber-700 ring-amber-200',
    borderColor: 'border-slate-200',
    ctaClass:
      'w-full py-3 rounded-xl font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors',
    features: [
      'Up to 10 active permits',
      'Email alerts on status changes',
      'Texas city & county portal links',
      'Expiration countdown warnings',
      'Standard support',
    ],
  },
  {
    id: 'pro',
    variantId: PRO_VARIANT_ID,
    name: 'Pro',
    price: 99,
    description: 'Built for busy contractors managing large permit portfolios.',
    icon: Shield,
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-700 ring-blue-200',
    borderColor: 'border-blue-500',
    ctaClass:
      'w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md',
    badge: 'Most Popular',
    features: [
      'Unlimited active permits',
      'SMS alerts (instant notifications)',
      'Priority support (< 4 h response)',
      'Texas city & county portal links',
      'Advanced analytics & exports',
      'Early access to new features',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Nav ── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-navy-900">
            Texas Permit Tracker
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="py-20 px-4 text-center">
        <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-blue-50 text-blue-600 ring-1 ring-blue-200">
          Simple Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
          Choose the plan that fits
          <span className="text-blue-600"> your workload</span>
        </h1>
        <p className="max-w-xl mx-auto text-lg text-slate-600">
          All plans include a&nbsp;<strong>7-day free trial</strong>. No credit card required
          to get started.
        </p>
      </section>

      {/* ── Cards ── */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 ${
                  plan.borderColor
                } shadow-sm hover:shadow-lg transition-shadow p-8 flex flex-col gap-6`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ring-1 ${
                        plan.badgeColor
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl bg-slate-50 ${
                      plan.iconColor
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">
                      ${plan.price}
                    </span>
                    <span className="text-slate-500 mb-2">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                </div>

                {/* CTA */}
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="variantId" value={plan.variantId ?? ''} />
                  <input type="hidden" name="plan" value={plan.id} />
                  <button type="submit" className={plan.ctaClass}>
                    Get started with {plan.name}
                  </button>
                </form>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                      <Check className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── FAQ / reassurance strip ── */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-sm text-slate-600">
          {[
            { emoji: '🔒', text: 'Payments secured by LemonSqueezy' },
            { emoji: '↩️', text: 'Cancel anytime — no lock-in contracts' },
            { emoji: '🇺🇸', text: 'Built exclusively for Texas contractors' },
          ].map((item) => (
            <div
              key={item.text}
              className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm"
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
