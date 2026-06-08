const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export const formatRelativeTime = (isoOrEpoch: string | number, now: Date = new Date()): string => {
  const then = typeof isoOrEpoch === 'string' ? new Date(isoOrEpoch).getTime() : isoOrEpoch;
  const delta = now.getTime() - then;
  if (delta < 5 * SECOND) return 'just now';
  if (delta < MINUTE) return `${Math.floor(delta / SECOND)}s ago`;
  if (delta < HOUR) {
    const m = Math.floor(delta / MINUTE);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (delta < DAY) {
    const h = Math.floor(delta / HOUR);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (delta < WEEK) {
    const d = Math.floor(delta / DAY);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  return new Date(then).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
