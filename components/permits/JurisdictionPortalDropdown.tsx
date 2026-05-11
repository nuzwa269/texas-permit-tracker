'use client';

import { useState, useRef, useEffect } from 'react';
import { ExternalLink, ChevronDown, MapPin, Phone, Info } from 'lucide-react';
import { TEXAS_JURISDICTIONS, type TexasJurisdiction } from '@/lib/constants/jurisdictions';

export function JurisdictionPortalDropdown() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const hoveredJurisdiction: TexasJurisdiction | undefined = TEXAS_JURISDICTIONS.find(
    (j) => j.city === hovered
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white
          px-3 py-2 text-sm font-medium text-slate-700 shadow-sm
          hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-navy-500
          transition-colors whitespace-nowrap"
      >
        <MapPin className="w-4 h-4 text-navy-600" />
        City Portals
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 z-40 mt-2 w-[520px] max-w-[calc(100vw-2rem)]
            rounded-xl border border-slate-200 bg-white shadow-xl
            animate-in fade-in slide-in-from-top-1 duration-150"
          role="menu"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Texas Building Permit Portals
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any city to open its official portal in a new tab.
            </p>
          </div>

          {/* City list + detail panel side-by-side */}
          <div className="flex">
            {/* Left — city list */}
            <ul className="w-44 border-r border-slate-100 py-1 shrink-0" role="none">
              {TEXAS_JURISDICTIONS.map((j) => (
                <li key={j.city} role="none">
                  <a
                    href={j.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onMouseEnter={() => setHovered(j.city)}
                    onFocus={() => setHovered(j.city)}
                    className="flex items-center justify-between gap-2 px-4 py-2.5
                      text-sm text-slate-700 hover:bg-navy-50 hover:text-navy-800
                      focus:outline-none focus:bg-navy-50 focus:text-navy-800
                      transition-colors group"
                  >
                    <span className="font-medium">{j.city}</span>
                    <ExternalLink
                      className="w-3.5 h-3.5 text-slate-400
                        group-hover:text-navy-600 group-focus:text-navy-600
                        transition-colors shrink-0"
                    />
                  </a>
                </li>
              ))}
            </ul>

            {/* Right — detail panel */}
            <div className="flex-1 p-4">
              {hoveredJurisdiction ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">
                      Department
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {hoveredJurisdiction.department}
                    </p>
                  </div>

                  {hoveredJurisdiction.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`tel:${hoveredJurisdiction.phone.replace(/[^\d+]/g, '')}`}
                        className="text-sm text-navy-700 hover:underline"
                      >
                        {hoveredJurisdiction.phone}
                      </a>
                    </div>
                  )}

                  {hoveredJurisdiction.notes && (
                    <div className="flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600">{hoveredJurisdiction.notes}</p>
                    </div>
                  )}

                  <a
                    href={hoveredJurisdiction.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-navy-700
                      px-3 py-1.5 text-xs font-medium text-white
                      hover:bg-navy-800 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open {hoveredJurisdiction.city} Portal
                  </a>
                </div>
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center">
                  <p className="text-xs text-slate-400 text-center">
                    Hover a city to see details
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 rounded-b-xl">
            <p className="text-[11px] text-slate-400">
              Links open official city/county government portals in a new tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
