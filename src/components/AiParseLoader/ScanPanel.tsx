import { type FC, useEffect, useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { aiScanFields, aiScanTextLines } from '@/constants';

const SCAN_DURATION_MS = 4000;

const ScanPanel: FC = () => {
  const reducedMotion = useReducedMotion() ?? false;
  const [progress, setProgress] = useState(reducedMotion ? 0.95 : 0);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(0.95);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = ((elapsed % SCAN_DURATION_MS) / SCAN_DURATION_MS);
      setProgress(p);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const scanY = progress * 118;

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center justify-between font-mono text-2xs text-muted tabular-nums">
        <span>SCAN_0.{(progress * 100).toFixed(0).padStart(2, '0')}</span>
        <span>118.0mm</span>
      </div>
      <div
        className={cn(
          'relative aspect-[3/4.2] w-full overflow-hidden rounded-xs',
          'border border-border bg-surface-sunk/40',
        )}
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--color-ink) 1px, transparent 1px), linear-gradient(to bottom, var(--color-ink) 1px, transparent 1px)',
            backgroundSize: '12.5% 8.33%',
          }}
        />
        {aiScanTextLines.map((line, i) => (
          <span
            key={i}
            className="absolute left-[6%] h-[1.5px] rounded-pill bg-ink/15"
            style={{
              top: `${line.top}%`,
              width: `${line.width}%`,
            }}
          />
        ))}
        {aiScanFields.map((field, i) => {
          const detected = progress >= field.detectAt;
          return (
            <m.div
              key={`${field.label}-${i}`}
              className={cn(
                'absolute left-[4%] right-[4%] rounded-xs border',
                detected
                  ? 'border-accent/80 bg-accent/12'
                  : 'border-transparent bg-transparent',
              )}
              style={{
                top: `${field.top}%`,
                height: `${field.height}%`,
              }}
              animate={{
                borderColor: detected
                  ? 'var(--color-accent)'
                  : 'transparent',
                backgroundColor: detected
                  ? 'color-mix(in oklch, var(--color-accent) 12%, transparent)'
                  : 'transparent',
              }}
              transition={{ duration: 0.22 }}
            >
              {detected ? (
                <m.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className={cn(
                    'absolute -top-[1px] right-[2px] translate-y-[-100%] rounded-t-xs px-1 py-[1px]',
                    'bg-accent font-mono text-[8px] uppercase tracking-[0.2em] text-on-accent leading-none',
                  )}
                >
                  {field.label}
                </m.span>
              ) : null}
            </m.div>
          );
        })}
        <div
          className="absolute left-0 right-0 h-px bg-accent"
          style={{
            top: `${scanY}%`,
            boxShadow:
              '0 -8px 16px -4px color-mix(in oklch, var(--color-accent) 40%, transparent), 0 0 8px color-mix(in oklch, var(--color-accent) 60%, transparent)',
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            top: `max(0%, calc(${scanY}% - 12%))`,
            height: '12%',
            background:
              'linear-gradient(to bottom, color-mix(in oklch, var(--color-accent) 0%, transparent), color-mix(in oklch, var(--color-accent) 14%, transparent))',
          }}
        />
        <span className="absolute left-1.5 top-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-muted">
          PDF
        </span>
        <span className="absolute right-1.5 top-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-muted tabular-nums">
          A4
        </span>
        <span className="absolute left-1.5 bottom-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-muted">
          P.01
        </span>
      </div>
    </div>
  );
};

export default ScanPanel;
