const inr = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${n.toLocaleString('en-IN')}`;

export function formatSalaryRange(min?: number, max?: number): string {
  if (min && max) {
    return `${inr(min)} – ${inr(max)}`;
  }
  if (min) {
    return `From ${inr(min)}`;
  }
  if (max) {
    return `Up to ${inr(max)}`;
  }
  return 'Not disclosed';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

export const formatJobType = (type: string) => JOB_TYPE_LABEL[type] ?? type;

/** "Sakshi Mehar" → "Sakshi" */
export const firstName = (name?: string) => name?.trim().split(/\s+/)[0] ?? '';

/** "Sakshi Mehar" → "SM" */
export const initials = (name?: string) =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');

/** ISO date → "Just now" / "5m ago" / "3h ago" / "2d ago" / "12 Apr 2025" */
export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) {
    return 'Just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : formatDate(iso);
}

/** Greeting for the current time of day. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
}
