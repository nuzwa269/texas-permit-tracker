interface ProgressBarProps {
  percentage: number;
  variant?: 'success' | 'warning' | 'critical' | 'expired';
  label?: string;
}

const variantColors = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  critical: 'bg-safety-500',
  expired: 'bg-slate-400',
};

export function ProgressBar({ percentage, variant = 'success', label }: ProgressBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>{label}</span>
          <span>{clampedPercentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${variantColors[variant]}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}