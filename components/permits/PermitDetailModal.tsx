'use client';

import { useState } from 'react';
import { X, Loader2, MapPin, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { updatePermit } from '@/lib/supabase/permits';
import { NotesSection } from '@/components/permits/NotesSection';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getExpirationStatus, formatExpirationDate } from '@/lib/utils/date';
import type { Permit, PermitStatus } from '@/types/permit';

const STATUSES: PermitStatus[] = ['Pending', 'Approved', 'Delayed', 'Rejected', 'Expired'];

interface PermitDetailModalProps {
  permit: Permit;
  userId: string;
  userDisplayName: string;
  onClose: () => void;
  /** Called with the freshly-updated permit after a status change. */
  onStatusChanged: (updated: Permit) => void;
}

export function PermitDetailModal({
  permit,
  userId,
  userDisplayName,
  onClose,
  onStatusChanged,
}: PermitDetailModalProps) {
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<PermitStatus>(permit.status);

  const exp = getExpirationStatus(permit.expiration_date);
  // 🔴 Highlight header red when expiring in < 30 days
  const isUrgent = exp.isCritical && !exp.isExpired;

  async function handleStatusChange(newStatus: PermitStatus) {
    if (newStatus === optimisticStatus || changingStatus) return;

    // Optimistic UI update
    const previousStatus = optimisticStatus;
    setOptimisticStatus(newStatus);
    setChangingStatus(true);
    setStatusError(null);

    try {
      const updated = await updatePermit(permit.id, { status: newStatus });
      onStatusChanged(updated);
    } catch (err: unknown) {
      // Roll back on failure
      setOptimisticStatus(previousStatus);
      setStatusError(
        err instanceof Error ? err.message : 'Failed to update status. Please try again.'
      );
    } finally {
      setChangingStatus(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className={`flex items-start justify-between px-6 py-4 border-b rounded-t-2xl
            ${
              isUrgent
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText
                className={`w-5 h-5 shrink-0 ${
                  isUrgent ? 'text-red-600' : 'text-navy-600'
                }`}
              />
              <h2
                className={`text-xl font-semibold truncate ${
                  isUrgent ? 'text-red-900' : 'text-navy-900'
                }`}
              >
                {permit.permit_number}
              </h2>
            </div>

            {/* Urgent expiry warning */}
            {isUrgent && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                Expires in {exp.daysRemaining} day
                {exp.daysRemaining !== 1 ? 's' : ''} — action required
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100
              hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Permit details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
              <span>{permit.city_county}</span>
            </div>
            <div>
              <StatusBadge status={optimisticStatus} />
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Submitted {formatExpirationDate(permit.date_submitted)}</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                isUrgent ? 'text-red-600 font-semibold' : 'text-slate-600'
              }`}
            >
              <Calendar
                className={`w-4 h-4 shrink-0 ${
                  isUrgent ? 'text-red-500' : 'text-slate-400'
                }`}
              />
              <span>
                Expires {formatExpirationDate(permit.expiration_date)}
                {!exp.isExpired && (
                  <span className="ml-1 text-xs">({exp.daysRemaining}d remaining)</span>
                )}
              </span>
            </div>
          </div>

          {/* ── Change Status section ────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Change Status</h3>
              {changingStatus && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </span>
              )}
            </div>

            {statusError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {statusError}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const isCurrent = s === optimisticStatus;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={changingStatus}
                    aria-pressed={isCurrent}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                      focus:outline-none focus:ring-2 focus:ring-navy-500
                      ${
                        isCurrent
                          ? 'bg-navy-700 text-white shadow-sm cursor-default'
                          : 'bg-white border border-slate-300 text-slate-700
                             hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Notes section ────────────────────────────────── */}
          <NotesSection
            permitId={permit.id}
            userId={userId}
            userDisplayName={userDisplayName}
          />
        </div>
      </div>
    </div>
  );
}
