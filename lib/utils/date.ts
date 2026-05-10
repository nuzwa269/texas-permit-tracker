import { differenceInDays, formatDistanceToNow, isPast, format } from 'date-fns';

export function getDaysUntilExpiration(expirationDate: string): number {
  return differenceInDays(new Date(expirationDate), new Date());
}

export function isExpired(expirationDate: string): boolean {
  return isPast(new Date(expirationDate));
}

export function getExpirationStatus(expirationDate: string): {
  daysRemaining: number;
  isExpired: boolean;
  isCritical: boolean; // Less than 30 days
  isWarning: boolean; // Less than 60 days
} {
  const daysRemaining = getDaysUntilExpiration(expirationDate);
  const expired = isExpired(expirationDate);

  return {
    daysRemaining,
    isExpired: expired,
    isCritical: !expired && daysRemaining <= 30,
    isWarning: !expired && daysRemaining > 30 && daysRemaining <= 60,
  };
}

export function formatExpirationDate(expirationDate: string): string {
  return format(new Date(expirationDate), 'MMM dd, yyyy');
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}