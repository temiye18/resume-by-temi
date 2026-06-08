import { type FC, useEffect } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import { easeOutExpo } from '@/constants';

export type AiParseStage = 'uploaded' | 'reading' | 'extracting' | 'done';

interface IAiParseLoaderProps {
  open: boolean;
  stage: AiParseStage;
  fileName?: string;
  fileSize?: number;
  fallbackEngaged?: boolean;
  onCancel?: () => void;
}

interface IStepDef {
  key: AiParseStage;
  title: string;
  detail: string;
}

const STEPS: IStepDef[] = [
  {
    key: 'uploaded',
    title: 'Document received',
    detail: 'Reading the file from your drive into memory.',
  },
  {
    key: 'reading',
    title: 'Reading the layout',
    detail: 'Walking the document with Gemini to pick up structure and headings.',
  },
  {
    key: 'extracting',
    title: 'Extracting fields',
    detail: 'Pulling name, contact, work history, education, and skills into structured form.',
  },
  {
    key: 'done',
    title: 'Opening the editor',
    detail: 'Validating the extracted data and routing you to your résumé.',
  },
];

const stageIndex = (s: AiParseStage): number => STEPS.findIndex((step) => step.key === s);

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
  const reducedMotion = useReducedMotion();
  const activeIndex = stageIndex(stage);

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
          <div className="absolute inset-0 bg-bg/85 backdrop-blur-[2px]" aria-hidden />
          <m.div
            className="relative flex w-full max-w-[520px] flex-col gap-8 rounded-md border border-border bg-bg p-8 shadow-modal"
            initial={{ y: 12, scale: 0.985, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.985, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.32, ease: easeOutExpo }}
          >
            <header className="flex flex-col gap-2">
              <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">
                Smart parse
              </p>
              <h2 className="font-display text-2xl font-medium text-ink text-balance">
                Reading your résumé.
              </h2>
              {fileName ? (
                <p className="mt-1 flex items-baseline gap-2 font-mono text-2xs text-muted">
                  <span className="truncate text-ink-soft">{fileName}</span>
                  {fileSize ? <span aria-hidden>·</span> : null}
                  {fileSize ? <span className="tabular-nums">{formatBytes(fileSize)}</span> : null}
                </p>
              ) : null}
            </header>

            <ol className="flex flex-col">
              {STEPS.map((step, i) => {
                const isActive = i === activeIndex;
                const isComplete = i < activeIndex;
                const isPending = i > activeIndex;
                return (
                  <li
                    key={step.key}
                    className={cn(
                      'relative flex gap-4 py-3',
                      i < STEPS.length - 1 && 'pb-4',
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div className="relative flex w-6 shrink-0 justify-center pt-0.5">
                      {isComplete ? (
                        <span className="text-faint">
                          <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} />
                        </span>
                      ) : (
                        <span
                          aria-hidden
                          className={cn(
                            'inline-block w-px h-[0.95em]',
                            isActive ? 'bg-accent' : 'bg-border',
                          )}
                        />
                      )}
                      {isActive && !reducedMotion ? (
                        <m.span
                          aria-hidden
                          className="absolute left-1/2 top-0 h-[0.95em] w-px -translate-x-1/2 bg-accent"
                          initial={{ opacity: 0.35, scaleY: 1 }}
                          animate={{ opacity: [0.35, 1, 0.35], scaleY: [1, 1.18, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ transformOrigin: 'top' }}
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p
                        className={cn(
                          'font-display leading-snug text-balance transition-colors duration-base ease-out-quart',
                          isActive && 'text-ink text-lg font-medium',
                          isComplete && 'text-ink-soft text-base font-normal',
                          isPending && 'text-faint text-base font-normal',
                        )}
                      >
                        {step.title}
                      </p>
                      <p
                        className={cn(
                          'font-sans text-sm text-pretty transition-colors duration-base ease-out-quart',
                          isActive ? 'text-ink-soft' : 'text-faint',
                        )}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <footer className="flex items-center justify-between border-t border-border/60 pt-4">
              <p className="font-mono text-2xs text-muted">
                {fallbackEngaged ? (
                  <>
                    <span className="tabular-nums text-ink-soft">gemini-2.5-flash-lite</span>
                    <span aria-hidden> · </span>
                    <span>fallback engaged</span>
                  </>
                ) : (
                  <>
                    <span className="tabular-nums text-ink-soft">gemini-2.5-flash</span>
                    <span aria-hidden> · </span>
                    <span>via Cloudflare proxy</span>
                  </>
                )}
              </p>
              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-sm font-sans text-xs text-muted underline-offset-4 hover:text-ink-soft hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  Cancel
                </button>
              ) : null}
            </footer>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AiParseLoader;
