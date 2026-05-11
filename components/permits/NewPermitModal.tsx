'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { TEXAS_CITIES } from '@/lib/constants/cities';
import { createPermit } from '@/lib/supabase/permits';
import type { Permit, PermitStatus } from '@/types/permit';

const STATUSES: PermitStatus[] = ['Pending', 'Approved', 'Delayed', 'Rejected', 'Expired'];

interface NewPermitModalProps {
  userId: string;
  onClose: () => void;
  onCreated: (permit: Permit) => void;
}

interface FormValues {
  permit_number: string;
  city_county: string;
  status: PermitStatus;
  date_submitted: string;
  expiration_date: string;
}

const DEFAULT_FORM: FormValues = {
  permit_number: '',
  city_county: TEXAS_CITIES[0],
  status: 'Pending',
  date_submitted: new Date().toISOString().split('T')[0],
  expiration_date: '',
};

export function NewPermitModal({ userId, onClose, onCreated }: NewPermitModalProps) {
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(): boolean {
    const next: Partial<FormValues> = {};
    if (!form.permit_number.trim()) next.permit_number = 'Permit number is required.';
    if (!form.city_county) next.city_county = 'City / county is required.';
    if (!form.date_submitted) next.date_submitted = 'Submission date is required.';
    if (!form.expiration_date) {
      next.expiration_date = 'Expiration date is required.';
    } else if (form.expiration_date <= form.date_submitted) {
      next.expiration_date = 'Expiration date must be after the submission date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      const permit = await createPermit({ ...form, user_id: userId });
      onCreated(permit);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  function field<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-navy-900">New Permit</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-6 py-5">

            {serverError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </p>
            )}

            {/* Permit Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Permit Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.permit_number}
                onChange={(e) => field('permit_number', e.target.value)}
                placeholder="e.g. TX-2024-001234"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-navy-500
                  ${ errors.permit_number ? 'border-red-400' : 'border-slate-300' }`}
              />
              {errors.permit_number && (
                <p className="mt-1 text-xs text-red-600">{errors.permit_number}</p>
              )}
            </div>

            {/* City / County */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                City / County <span className="text-red-500">*</span>
              </label>
              <select
                value={form.city_county}
                onChange={(e) => field('city_county', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-navy-500
                  ${ errors.city_county ? 'border-red-400' : 'border-slate-300' }`}
              >
                {TEXAS_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city_county && (
                <p className="mt-1 text-xs text-red-600">{errors.city_county}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => field('status', e.target.value as PermitStatus)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Date Submitted <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date_submitted}
                  onChange={(e) => field('date_submitted', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900
                    focus:outline-none focus:ring-2 focus:ring-navy-500
                    ${ errors.date_submitted ? 'border-red-400' : 'border-slate-300' }`}
                />
                {errors.date_submitted && (
                  <p className="mt-1 text-xs text-red-600">{errors.date_submitted}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Expiration Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.expiration_date}
                  onChange={(e) => field('expiration_date', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900
                    focus:outline-none focus:ring-2 focus:ring-navy-500
                    ${ errors.expiration_date ? 'border-red-400' : 'border-slate-300' }`}
                />
                {errors.expiration_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.expiration_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium
                text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium
                text-white hover:bg-navy-800 disabled:opacity-60 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating…' : 'Create Permit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
