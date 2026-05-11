'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getPermits } from '@/lib/supabase/permits';
import { PermitCard } from '@/components/permits/PermitCard';
import { NewPermitModal } from '@/components/permits/NewPermitModal';
import { PermitDetailModal } from '@/components/permits/PermitDetailModal';
import { JurisdictionPortalDropdown } from '@/components/permits/JurisdictionPortalDropdown';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { getExpirationStatus } from '@/lib/utils/date';
import type { Permit, PermitStatus } from '@/types/permit';

// Starter plan permit limit (keep in sync with your LemonSqueezy product config)
const STARTER_PERMIT_LIMIT = 10;

const STATUS_OPTIONS: Array<PermitStatus | 'All'> = [
  'All',
  'Pending',
  'Approved',
  'Delayed',
  'Rejected',
  'Expired',
];

export default function DashboardPage() {
  const router = useRouter();

  // ── Auth state ────────────────────────────────────────────────
  const [userId, setUserId]       = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // ── Subscription state ────────────────────────────────────────
  const [isSubscribed, setIsSubscribed]   = useState<boolean>(false);
  const [subChecked, setSubChecked]       = useState<boolean>(false);

  // ── Data state ────────────────────────────────────────────────
  const [permits, setPermits]         = useState<Permit[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);

  // ── UI state ──────────────────────────────────────────────────
  const [showNewModal, setShowNewModal]   = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState<PermitStatus | 'All'>('All');

  // ── Auth check + initial fetch ────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace('/');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email ?? user.id);

      // ── Fetch subscription status from profiles table ──────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_subscribed')
        .eq('id', user.id)
        .single();

      setIsSubscribed(profile?.is_subscribed ?? false);
      setSubChecked(true);
      // ─────────────────────────────────────────────────────────

      getPermits()
        .then(setPermits)
        .catch((err: Error) => setFetchError(err.message))
        .finally(() => setLoading(false));
    });
  }, [router]);

  // ── Filtered / derived data ───────────────────────────────────
  const filteredPermits = useMemo(() => {
    return permits.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.permit_number.toLowerCase().includes(q) ||
        p.city_county.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [permits, searchQuery, statusFilter]);

  const activePermits = filteredPermits.filter(
    (p) => p.status !== 'Expired' && p.status !== 'Rejected'
  );

  // Permits expiring in < 30 days (across ALL permits, not just filtered)
  const expiringCount = permits.filter((p) => {
    const s = getExpirationStatus(p.expiration_date);
    return s.isCritical && !s.isExpired;
  }).length;

  const stats = {
    total:   permits.filter((p) => p.status !== 'Expired' && p.status !== 'Rejected').length,
    pending:  permits.filter((p) => p.status === 'Pending').length,
    approved: permits.filter((p) => p.status === 'Approved').length,
    delayed:  permits.filter((p) => p.status === 'Delayed').length,
  };

  // ── Paywall helper: can the user open the "New Permit" modal? ─
  const trialLimitReached = !isSubscribed && permits.length >= STARTER_PERMIT_LIMIT;

  function handleAddPermitClick() {
    if (trialLimitReached) return; // button is grayed out; guard just in case
    setShowNewModal(true);
  }

  // ── Handlers ──────────────────────────────────────────────────
  function handleCreated(permit: Permit) {
    setPermits((prev) => [permit, ...prev]);
    setShowNewModal(false);
  }

  function handleStatusChanged(updated: Permit) {
    setPermits((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPermit(updated);
  }

  // ── Loading screen ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading permits…</span>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Trial Mode banner (shown when not subscribed) ── */}
      {subChecked && !isSubscribed && (
        <TrialBanner
          permitCount={permits.length}
          starterLimit={STARTER_PERMIT_LIMIT}
        />
      )}

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-navy-900">Texas Permit Tracker</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your building permits across Texas
              </p>
            </div>
            {/* Header actions */}
            <div className="flex items-center gap-3 shrink-0">
              <JurisdictionPortalDropdown />

              {/* ── Paywall: gray out button if trial limit reached ── */}
              {trialLimitReached ? (
                <div className="relative group">
                  <button
                    disabled
                    aria-disabled="true"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-400 font-semibold text-sm cursor-not-allowed select-none"
                  >
                    <Plus className="w-5 h-5" />
                    New Permit
                  </button>
                  {/* Tooltip */}
                  <div
                    role="tooltip"
                    className="absolute -bottom-10 right-0 whitespace-nowrap bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                  >
                    Upgrade to Pro for unlimited permits
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddPermitClick}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Permit
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Fetch error */}
        {fetchError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠ Failed to load permits: {fetchError}
          </div>
        )}

        {/* Expiring-soon banner */}
        {expiringCount > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium text-red-700">
              {expiringCount} permit{expiringCount > 1 ? 's are' : ' is'} expiring within
              30 days — highlighted in red below.
            </p>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Total Active</div>
            <div className="text-3xl font-bold text-navy-900">{stats.total}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="card p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">Delayed</div>
            <div className="text-3xl font-bold text-safety-600">{stats.delayed}</div>
          </div>
        </div>

        {/* Search + Status Filter bar */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by permit number or city…"
                className="input-field pl-10 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PermitStatus | 'All')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700
                focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white whitespace-nowrap"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Permits grid */}
        {activePermits.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-navy-900 mb-4">
              Active Permits
              <span className="ml-2 text-base font-normal text-slate-500">
                ({activePermits.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activePermits.map((permit) => {
                const exp = getExpirationStatus(permit.expiration_date);
                const isUrgent = exp.isCritical && !exp.isExpired;
                return (
                  <div
                    key={permit.id}
                    className={
                      isUrgent
                        ? 'ring-2 ring-red-500 ring-offset-2 rounded-xl'
                        : ''
                    }
                  >
                    <PermitCard
                      permit={permit}
                      onClick={() => setSelectedPermit(permit)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {activePermits.length === 0 && (
          <div className="card p-12 text-center">
            <div className="text-slate-300 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No active permits</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || statusFilter !== 'All'
                ? 'No permits match your current filters.'
                : 'Get started by creating your first permit.'}
            </p>
            {!searchQuery && statusFilter === 'All' && !trialLimitReached && (
              <button
                onClick={handleAddPermitClick}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Permit
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {showNewModal && userId && (
        <NewPermitModal
          userId={userId}
          onClose={() => setShowNewModal(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedPermit && userId && (
        <PermitDetailModal
          permit={selectedPermit}
          userId={userId}
          userDisplayName={userEmail}
          onClose={() => setSelectedPermit(null)}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </div>
  );
}
