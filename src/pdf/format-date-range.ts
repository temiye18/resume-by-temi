export const formatPdfDateRange = (start: string | undefined, end: string | undefined): string => {
  const fmt = (raw?: string): string => {
    if (!raw) return '';
    if (raw === 'Present') return 'Present';
    const [y, m] = raw.split('-');
    if (!m) return y;
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };
  if (!start && !end) return '';
  if (!end) return fmt(start);
  if (!start) return fmt(end);
  return `${fmt(start)} – ${fmt(end)}`;
};
