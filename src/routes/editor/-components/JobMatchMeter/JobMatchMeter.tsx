import { type FC } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';

interface IJobMatchMeterProps {
  value: number;
  caption?: string;
  delta?: number | null;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const JobMatchMeter: FC<IJobMatchMeterProps> = ({ value, caption, delta }) => {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative inline-flex h-24 w-24 shrink-0 items-center justify-center"
        role="img"
        aria-label={`${clamped}% job match`}
      >
        <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90" aria-hidden>
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            strokeWidth="5"
            className="stroke-border"
          />
          <m.circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            className="stroke-accent"
            strokeDasharray={CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduceMotion ? 0 : 0.54, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold leading-none tabular-nums text-ink">
            {clamped}
            <span className="font-sans text-sm font-normal text-muted">%</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
          Job match
        </span>
        {caption ? (
          <span className="font-sans text-sm text-ink-soft text-pretty">{caption}</span>
        ) : null}
        {delta != null && delta > 0 ? (
          <span
            className={cn(
              'inline-flex w-fit items-center rounded-xs px-1.5 py-0.5',
              'font-mono text-2xs tabular-nums bg-accent-soft text-accent-ink',
            )}
          >
            +{delta} since AI
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default JobMatchMeter;
