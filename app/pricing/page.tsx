import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$49/mo',
    description: 'Built for small contractors tracking permits across Texas.',
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_STARTER?.trim(),
    features: [
      'Up to 10 permits',
      'Email alerts',
      'Texas city links',
    ],
    highlighted: false,
    cta: 'Choose Starter',
  },
  {
    name: 'Pro',
    price: '$99/mo',
    description: 'For growing teams that need full visibility and faster support.',
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID_PRO?.trim(),
    features: [
      'Unlimited permits',
      'SMS alerts',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Choose Pro',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-slate-200 max-w-2xl mx-auto">
            Choose the right plan for your construction workflow and scale permit tracking
            across Texas with confidence.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            const hasVariant = Boolean(plan.variantId);
            const checkoutUrl = hasVariant
              ? `https://app.lemonsqueezy.com/checkout/buy/${plan.variantId}`
              : '#';

            return (
              <div
                key={plan.name}
                className={`relative rounded-xl shadow-sm border border-slate-200 bg-white p-8 flex flex-col ${
                  plan.highlighted ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-900">
                    Most Popular
                  </span>
                )}

                <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-2 text-slate-600">{plan.description}</p>
                <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900">{plan.price}</p>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {hasVariant ? (
                  <a
                    href={checkoutUrl}
                    className={`mt-8 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${
                      plan.highlighted
                        ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-8 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold bg-slate-200 text-slate-500 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-600">
          Cancel within 30 days anytime. Texas-focused support is included with every plan.
        </p>
      </div>
    </div>
  );
}
