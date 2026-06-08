import { type FC } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks';
import { themeOptions } from '@/constants';

const ThemeToggle: FC = () => {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        'inline-flex items-center gap-0 rounded-pill border border-border bg-surface p-0.5',
        'shadow-1',
      )}
    >
      {themeOptions.map(({ value, label, icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            aria-label={label}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-pill',
              'transition-[background-color,color,box-shadow] duration-fast ease-out-quart',
              active
                ? 'bg-bg text-ink shadow-1'
                : 'text-muted hover:text-ink-soft hover:bg-bg/40',
            )}
          >
            <HugeiconsIcon icon={icon} size={15} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
