import { Permit } from '@/types/permit';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getExpirationStatus, formatExpirationDate } from '@/lib/utils/date';
import { MapPin, Calendar, FileText, MessageSquare } from 'lucide-react';

interface PermitCardProps {
  permit: Permit;
  onClick?: () => void;
}

export function PermitCard({ permit, onClick }: PermitCardProps) {
  const expiration = getExpirationStatus(permit.expiration_date);
  
  // Calculate progress percentage (inverse of days remaining)
  const totalDays = 180; // Assume typical permit validity is 180 days
  const daysElapsed = totalDays - expiration.daysRemaining;
  const progressPercentage = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));

  // Determine progress variant based on expiration status
  let progressVariant: 'success' | 'warning' | 'critical' | 'expired' = 'success';
  if (expiration.isExpired) {
    progressVariant = 'expired';
  } else if (expiration.isCritical) {
    progressVariant = 'critical';
  } else if (expiration.isWarning) {
    progressVariant = 'warning';
  }

  const notesCount = permit.notes?.length || 0;

  return (
    <div
      className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-semibold text-navy-900">
              {permit.permit_number}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{permit.city_county}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Submitted {formatExpirationDate(permit.date_submitted)}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={permit.status} />
      </div>

      {/* Expiration Progress */}
      <div className="mb-4">
        <ProgressBar
          percentage={progressPercentage}
          variant={progressVariant}
          label={`Expires ${formatExpirationDate(permit.expiration_date)}`}
        />
        <div className="mt-2 text-sm font-medium">
          {expiration.isExpired ? (
            <span className="text-slate-600">Expired</span>
          ) : (
            <span className={`${
              expiration.isCritical
                ? 'text-safety-600'
                : expiration.isWarning
                ? 'text-amber-600'
                : 'text-green-600'
            }`}>
              {expiration.daysRemaining} days remaining
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MessageSquare className="w-4 h-4" />
          <span>{notesCount} {notesCount === 1 ? 'note' : 'notes'}</span>
        </div>
        <button className="text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors">
          View Details →
        </button>
      </div>
    </div>
  );
}