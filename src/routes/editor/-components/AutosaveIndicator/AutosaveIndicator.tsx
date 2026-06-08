import { type FC, useEffect, useState } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { formatRelativeTime } from '@/helpers';
import { cn } from '@/lib/cn';

const AutosaveIndicator: FC = () => {
  const lastSavedAt = useResumeStore((s) => s.lastSavedAt);
  const isSaving = useResumeStore((s) => s.isSaving);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(id);
  }, []);

  const label = (() => {
    if (isSaving) return 'Saving…';
    if (!lastSavedAt) return 'Not saved yet';
    return `Saved ${formatRelativeTime(lastSavedAt)}`;
  })();

  return (
    <span
      key={tick}
      className="inline-flex items-center gap-2 font-mono text-2xs tabular-nums text-muted"
      aria-live="polite"
    >
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-pill',
          isSaving
            ? 'bg-accent animate-soft-pulse'
            : lastSavedAt
              ? 'bg-accent'
              : 'bg-border-strong',
        )}
        aria-hidden
      />
      {label}
    </span>
  );
};

export default AutosaveIndicator;
