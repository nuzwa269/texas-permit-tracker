import { PermitStatus } from '@/types/permit';
import { Clock, CheckCircle, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PermitStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<PermitStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  Pending: {
    label: 'Pending',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    icon: Clock,
  },
  Approved: {
    label: 'Approved',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
  },
  Delayed: {
    label: 'Delayed',
    bgColor: 'bg-safety-100',
    textColor: 'text-safety-800',
    icon: AlertTriangle,
  },
  Rejected: {
    label: 'Rejected',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: XCircle,
  },
  Expired: {
    label: 'Expired',
    bgColor: 'bg-slate-200',
    textColor: 'text-slate-700',
    icon: AlertCircle,
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}