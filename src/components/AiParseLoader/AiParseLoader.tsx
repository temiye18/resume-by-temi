import { type FC, useEffect } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { easeOutExpo, aiParseSteps } from '@/constants';
import type { AiParseStage } from '@/types/ai-parse-stage-type';
import ScanPanel from './ScanPanel';
import TokenStream from './TokenStream';

interface IAiParseLoaderProps {
  open: boolean;
  stage: AiParseStage;
  fileName?: string;
  fileSize?: number;
  fallbackEngaged?: boolean;
  onCancel?: () => void;
}

const stageIndex = (s: AiParseStage): number =>
  aiParseSteps.findIndex((step) => step.key === s);

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AiParseLoader: FC<IAiParseLoaderProps> = ({
  open,
  stage,
  fileName,
  fileSize,
  fallbackEngaged,
  onCancel,
}) => {
  const reducedMotion = useReducedMotion() ?? false;
  const activeIndex = stageIndex(stage);
  const currentStep = aiParseSteps[activeIndex] ?? aiParseSteps[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label="Parsing your résumé"
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-bg/90 backdrop-blur-[3px]" aria-hidden />
          <m.div
            className={cn(
              'relative flex w-full max-w-[760px] flex-col gap-6 rounded-md border border-border bg-bg p-7 shadow-modal',
              'overflow-hidden',
            )}
            initial={{ y: 12, scale: 0.985, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.985, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.36, ease: easeOutExpo }}
          >
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1.5 min-w-0">
                <p className="flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.24em] text-muted">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-pill bg-accent"
                    style={{
                      boxShadow: reducedMotion
                        ? undefined
                        : '0 0 6px var(--color-accent), 0 0 12px var(--color-accent)',
                    }}
                  />
                  Smart parse
                  <span aria-hidden className="text-faint">/</span>
                  <span className="text-ink-soft">
                    {fallbackEngaged ? 'flash-lite' : 'gemini 2.5 flash'}
                  </span>
                </p>
                <h2 className="font-display text-2xl font-medium text-ink text-balance">
                  Reading your résumé.
                </h2>
              </div>
              {fileName ? (
                <p className="flex max-w-[40%] flex-col items-end gap-0.5 font-mono text-2xs text-muted">
                  <span className="truncate text-ink-soft">{fileName}</span>
                  {fileSize ? (
                    <span className="tabular-nums">{formatBytes(fileSize)}</span>
                  ) : null}
                </p>
              ) : null}
            </header>

            <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-5">
              <ScanPanel />
              <TokenStream />
            </div>

            <footer className="flex flex-col gap-3 border-t border-border/70 pt-4">
              <div className="flex items-baseline justify-between gap-4 font-mono text-2xs">
                <span className="text-ink-soft">
                  STAGE {String(activeIndex + 1).padStart(2, '0')}/04
                  <span aria-hidden className="mx-1.5 text-faint">·</span>
                  <span className="text-ink">{currentStep.caption}</span>
                </span>
                {onCancel ? (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="font-sans text-xs text-muted underline-offset-4 hover:text-ink-soft hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={aiParseSteps.length} aria-valuenow={activeIndex + 1}>
                {aiParseSteps.map((step, i) => {
                  const isComplete = i < activeIndex;
                  const isActive = i === activeIndex;
                  return (
                    <span key={step.key} className="flex-1 relative h-[3px] overflow-hidden rounded-pill bg-border">
                      {isComplete ? (
                        <span className="absolute inset-0 bg-accent/60" />
                      ) : null}
                      {isActive ? (
                        <m.span
                          className="absolute inset-y-0 left-0 bg-accent"
                          initial={{ width: '20%' }}
                          animate={
                            reducedMotion
                              ? { width: '80%' }
                              : { width: ['10%', '85%', '50%', '95%', '40%'] }
                          }
                          transition={{
                            duration: reducedMotion ? 0 : 3,
                            repeat: reducedMotion ? 0 : Infinity,
                            ease: 'easeInOut',
                          }}
                          style={{
                            boxShadow:
                              '0 0 6px var(--color-accent), 0 0 12px var(--color-accent)',
                          }}
                        />
                      ) : null}
                    </span>
                  );
                })}
              </div>
              <p className="flex items-center justify-between font-mono text-2xs text-muted">
                <span>
                  {fallbackEngaged
                    ? 'fallback engaged · via Cloudflare proxy'
                    : 'via Cloudflare proxy · keys on server'}
                </span>
                <span className="tabular-nums">CONN.OK</span>
              </p>
            </footer>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AiParseLoader;
