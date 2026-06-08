import { type FC, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { aiTokenStreamSequence } from '@/constants';

const LINE_INTERVAL_MS = 180;
const VISIBLE_LINES = 9;

interface IRenderedLine {
  text: string;
  key: number;
  charsTyped: number;
}

const TokenStream: FC = () => {
  const reducedMotion = useReducedMotion() ?? false;
  const [lines, setLines] = useState<IRenderedLine[]>(
    reducedMotion
      ? aiTokenStreamSequence.slice(-VISIBLE_LINES).map((text, i) => ({
          text,
          key: i,
          charsTyped: text.length,
        }))
      : [],
  );
  const indexRef = useRef(0);
  const keyRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;

    const advance = () => {
      if (cancelled) return;
      const source = aiTokenStreamSequence[indexRef.current % aiTokenStreamSequence.length];
      const newKey = keyRef.current++;
      setLines((prev) => {
        const next = [...prev, { text: source, key: newKey, charsTyped: 0 }];
        return next.slice(-VISIBLE_LINES);
      });
      typeLine(newKey, source, 0);
      indexRef.current += 1;
      window.setTimeout(advance, LINE_INTERVAL_MS + source.length * 6);
    };

    const typeLine = (key: number, source: string, char: number) => {
      if (cancelled) return;
      if (char > source.length) return;
      setLines((prev) =>
        prev.map((l) => (l.key === key ? { ...l, charsTyped: char } : l)),
      );
      window.setTimeout(() => typeLine(key, source, char + 1), 14);
    };

    advance();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center justify-between font-mono text-2xs text-muted tabular-nums">
        <span>STREAM_OUT</span>
        <span className="inline-flex items-center gap-1">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-pill bg-accent"
            style={{ boxShadow: '0 0 6px var(--color-accent)' }}
          />
          LIVE
        </span>
      </div>
      <div
        className={cn(
          'relative aspect-[5/3] sm:aspect-[3/4.2] w-full overflow-hidden rounded-xs',
          'border border-border bg-surface-sunk/40 p-3',
        )}
        aria-hidden
      >
        <div
          className="absolute inset-x-0 top-0 h-6 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, var(--color-bg), transparent)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-6 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, var(--color-bg), transparent)',
          }}
        />
        <ol className="flex flex-col gap-[3px] font-mono text-[10px] leading-[1.45] text-ink-soft tabular-nums">
          {lines.map((line, idx) => {
            const visibleText = line.text.slice(0, line.charsTyped);
            const isCurrent = idx === lines.length - 1;
            const isStale = idx < lines.length - 3;
            return (
              <li
                key={line.key}
                className={cn(
                  'whitespace-pre transition-opacity duration-300',
                  isStale && 'opacity-30',
                  !isStale && !isCurrent && 'opacity-70',
                  isCurrent && 'text-ink',
                )}
              >
                <span>{visibleText}</span>
                {isCurrent ? (
                  <span
                    aria-hidden
                    className="ml-[1px] inline-block h-[0.95em] w-[5px] translate-y-[0.12em] animate-cursor-blink bg-accent align-baseline"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default TokenStream;
