import { CheckCircle2 } from 'lucide-react';
import { CheckoutButton } from './CheckoutButton';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    description: 'Perfect for small contractors managing a handful of permits.',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
    features: [
      'Up to 10 active permits',
      'Status tracking & history',
      'Email notifications',
      'Full dashboard access',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/mo',
    description: 'For busy teams tracking permits across multiple Texas cities.',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited active permits',
      'SMS alerts for expirations',
      'Priority support',
      'Everything in Starter',
    ],
    highlighted: true,
    cta: 'Go Pro',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto">
          Choose the plan that fits your workflow. Upgrade or cancel anytime.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl shadow-sm p-8 flex flex-col ${
              plan.highlighted
                ? 'ring-2 ring-blue-500 shadow-lg scale-[1.02]'
                : 'border border-slate-200'
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full tracking-wide">
                Most Popular
              </span>
            )}

            {/* Plan name & price */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
              <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 mb-1">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <CheckoutButton priceId={plan.priceId} highlighted={plan.highlighted}>
              {plan.cta}
            </CheckoutButton>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-slate-400">
        Cancel anytime. No contracts. Prices in USD.
      </p>
    </div>
  );
}
