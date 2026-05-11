'use client';

import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';

interface TrialBannerProps {
  /** Call this to open the "New Permit" modal — used by the paywalled button. */
  onAddPermit?: () => void;
  /** Current permit count (used to decide whether to hard-block the button). */
  permitCount?: number;
  /** Starter plan limit (default 10). */
  starterLimit?: number;
}

/**
 * TrialBanner
 * -----------
 * Shows a sticky top banner when the user is in Trial Mode
 * and replaces the "Add New Permit" button with a grayed-out,
 * locked version once they hit the Starter-plan limit.
 *
 * Usage in DashboardPage:
 *   import { TrialBanner } from '@/components/subscription/TrialBanner';
 *
 *   <TrialBanner
 *     onAddPermit={() => setShowNewModal(true)}
 *     permitCount={permits.length}
 *   />
 */
export function TrialBanner({
  onAddPermit,
  permitCount = 0,
  starterLimit = 10,
}: TrialBannerProps) {
  const limitReached = permitCount >= starterLimit;

  return (
    <>
      {/* ── Sticky Trial Mode banner ── */}
      <div className="w-full bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">
              <strong>Trial Mode</strong> — You are using a free trial.&nbsp;
              {limitReached
                ? `You have reached the ${starterLimit}-permit limit.`
                : `${starterLimit - permitCount} of ${starterLimit} permit slots remaining.`}
            </span>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade Now
          </Link>
        </div>
      </div>

      {/* ── Paywalled "Add New Permit" button (rendered wherever this component is placed) ── */}
      {limitReached && (
        <div className="flex items-center gap-2 group relative">
          <button
            disabled
            aria-disabled="true"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed select-none"
          >
            <Lock className="w-4 h-4" />
            Add New Permit
          </button>
          {/* Tooltip */}
          <div
            role="tooltip"
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
          >
            Upgrade to Pro for unlimited permits
          </div>
        </div>
      )}
    </>
  );
}
