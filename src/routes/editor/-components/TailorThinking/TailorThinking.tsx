import { type FC, type CSSProperties, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { tailorThinkingSteps, tailorReasoningLines } from '@/constants';

interface ITailorThinkingProps {
  variant: 'full' | 'strip';
  onStop: () => void;
}

const ACCENT_GLOW: CSSProperties = {
  boxShadow: '0 0 6px var(--color-accent), 0 0 13px var(--color-accent)',
};

const Reticle: FC<{ size: number }> = ({ size }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <svg viewBox="0 0 72 72" className="absolute inset-0 h-full w-full">
      <circle cx="36" cy="36" r="32" fill="none" strokeWidth="1" className="stroke-border" />
      <circle cx="36" cy="36" r="20" fill="none" strokeWidth="1" className="stroke-border/70" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={36 + Math.cos(a) * 30}
            y1={36 + Math.sin(a) * 30}
            x2={36 + Math.cos(a) * 33}
            y2={36 + Math.sin(a) * 33}
            strokeWidth="1"
            className="stroke-border"
          />
        );
      })}
    </svg>
    <svg viewBox="0 0 72 72" className="absolute inset-0 h-full w-full animate-spin-cw">
      <circle
        cx="36"
        cy="36"
        r="26"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="46 164"
        className="stroke-accent"
      />
    </svg>
    <svg viewBox="0 0 72 72" className="absolute inset-0 h-full w-full animate-spin-ccw">
      <circle
        cx="36"
        cy="36"
        r="14"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="26 62"
        className="stroke-accent/70"
      />
      <circle cx="36" cy="22" r="2" className="fill-accent" />
    </svg>
    <span
      aria-hidden
      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-accent animate-soft-pulse"
      style={ACCENT_GLOW}
    />
  </div>
);

const VISIBLE_LINES = 6;

interface IRenderedLine {
  text: string;
  key: number;
  chars: number;
}

const ReasoningTerminal: FC = () => {
  const reduced = useReducedMotion() ?? false;
  const [lines, setLines] = useState<IRenderedLine[]>(
    reduced
      ? tailorReasoningLines.slice(0, VISIBLE_LINES).map((text, i) => ({ text, key: i, chars: text.length }))
      : [],
  );
  const idx = useRef(0);
  const keySeq = useRef(0);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;

    const type = (key: number, text: string, char: number) => {
      if (cancelled || char > text.length) return;
      setLines((prev) => prev.map((l) => (l.key === key ? { ...l, chars: char } : l)));
      window.setTimeout(() => type(key, text, char + 1), 12);
    };

    const advance = () => {
      if (cancelled) return;
      const text = tailorReasoningLines[idx.current % tailorReasoningLines.length];
      const key = keySeq.current++;
      setLines((prev) => [...prev, { text, key, chars: 0 }].slice(-VISIBLE_LINES));
      type(key, text, 0);
      idx.current += 1;
      window.setTimeout(advance, 340 + text.length * 8);
    };

    advance();
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  return (
    <div
      aria-hidden
      className="relative h-[136px] overflow-hidden rounded-xs border border-border bg-bg/60 px-3 py-2.5"
    >
      <ol className="flex flex-col gap-[3px] font-mono text-[10px] leading-[1.5] text-ink-soft tabular-nums">
        {lines.map((line, i) => {
          const current = i === lines.length - 1;
          const stale = i < lines.length - 3;
          return (
            <li
              key={line.key}
              className={cn(
                'whitespace-pre transition-opacity duration-300',
                stale && 'opacity-30',
                !stale && !current && 'opacity-70',
                current && 'text-accent-ink dark:text-accent opacity-100',
              )}
            >
              <span>{line.text.slice(0, line.chars)}</span>
              {current ? (
                <span
                  aria-hidden
                  className="ml-[1px] inline-block h-[0.9em] w-[5px] translate-y-[0.1em] animate-cursor-blink bg-accent align-baseline"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const CornerBrackets: FC = () => (
  <>
    <span aria-hidden className="pointer-events-none absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-accent/40" />
    <span aria-hidden className="pointer-events-none absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t border-accent/40" />
    <span aria-hidden className="pointer-events-none absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-accent/40" />
    <span aria-hidden className="pointer-events-none absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-accent/40" />
  </>
);

const useThinkingClock = (): { elapsed: number; step: number } => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const id = window.setInterval(() => setElapsed(performance.now() - started), 100);
    return () => window.clearInterval(id);
  }, []);
  const step = Math.min(tailorThinkingSteps.length - 1, Math.floor(elapsed / 1700));
  return { elapsed, step };
};

const TailorThinking: FC<ITailorThinkingProps> = ({ variant, onStop }) => {
  const { elapsed, step } = useThinkingClock();
  const seconds = (elapsed / 1000).toFixed(1);

  if (variant === 'strip') {
    return (
      <div className="flex items-center gap-3 rounded-md border border-accent/30 bg-surface-sunk/40 px-3 py-2.5">
        <Reticle size={22} />
        <span className="flex-1 truncate font-mono text-2xs uppercase tracking-[0.14em] text-ink-soft">
          {tailorThinkingSteps[step]}
          <span aria-hidden className="ml-[3px] inline-block h-[0.85em] w-[5px] translate-y-[0.1em] animate-cursor-blink bg-accent align-baseline" />
        </span>
        <button
          type="button"
          onClick={onStop}
          className="shrink-0 font-mono text-2xs uppercase tracking-[0.16em] text-muted underline decoration-1 underline-offset-2 transition-colors duration-fast ease-out-quart hover:text-ink focus-visible:outline-none"
        >
          Stop
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-accent/30 bg-surface-sunk/40 p-4">
      <CornerBrackets />

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-muted">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-pill bg-accent" style={ACCENT_GLOW} />
          Tailoring agent
        </p>
        <span className="font-mono text-2xs tabular-nums text-muted">T+{seconds}s</span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Reticle size={72} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-sans text-sm font-medium text-ink text-pretty">
            {tailorThinkingSteps[step]}
            <span aria-hidden className="ml-[3px] inline-block h-[0.9em] w-[6px] translate-y-[0.12em] animate-cursor-blink bg-accent align-baseline" />
          </p>
          <div className="flex items-center gap-1">
            {tailorThinkingSteps.map((label, i) => (
              <span
                key={label}
                className={cn(
                  'h-[3px] flex-1 rounded-pill transition-colors duration-base ease-out-quart',
                  i < step && 'bg-accent/60',
                  i === step && 'bg-accent animate-soft-pulse',
                  i > step && 'bg-border',
                )}
              />
            ))}
          </div>
          <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted tabular-nums">
            step {String(step + 1).padStart(2, '0')}/{String(tailorThinkingSteps.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <ReasoningTerminal />
      </div>

      <div className="mt-3 flex items-center justify-end font-mono text-2xs text-muted">
        <span className="inline-flex items-center gap-1.5 text-ink-soft">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-pill bg-accent" style={ACCENT_GLOW} />
          STREAMING
        </span>
      </div>

      <button
        type="button"
        onClick={onStop}
        className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-sm border border-border bg-bg font-sans text-sm font-medium text-ink-soft transition-colors duration-fast ease-out-quart hover:border-border-strong hover:text-ink focus-visible:outline-none"
      >
        Stop
      </button>
    </div>
  );
};

export default TailorThinking;
