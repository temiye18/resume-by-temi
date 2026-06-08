import { type FC, useEffect } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Alert01Icon,
  Cancel01Icon,
  AnalyticsUpIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import type { IAtsCheckResult } from '@/interfaces/i-ats-check-result';

interface IAtsCheckModalProps {
  open: boolean;
  busy: boolean;
  result: IAtsCheckResult | null;
  onClose: () => void;
}

const AtsCheckModal: FC<IAtsCheckModalProps> = ({ open, busy, result, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute inset-0 bg-bg/70 backdrop-blur-[2px]"
          />
          <m.div
            className="relative flex w-full max-w-[480px] max-h-[85vh] flex-col overflow-hidden rounded-md border border-border bg-bg shadow-modal"
            initial={{ y: 8, scale: 0.985, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.985, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="ATS compatibility check"
          >
            {busy ? (
              <div className="p-6">
                <BusyState />
              </div>
            ) : result ? (
              <ResultState result={result} onClose={onClose} />
            ) : null}
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

const BusyState: FC = () => (
  <div className="flex flex-col items-center gap-6 py-6">
    <div className="relative inline-flex h-16 w-16 items-center justify-center">
      <m.div
        className="absolute inset-0 rounded-pill border-2 border-transparent border-t-accent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.95, ease: 'linear', repeat: Infinity }}
      />
      <HugeiconsIcon icon={AnalyticsUpIcon} size={26} strokeWidth={1.5} className="text-ink" />
    </div>
    <div className="flex flex-col items-center gap-1.5">
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">Extracting text</p>
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">
        Validating reading order
      </p>
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">
        Verifying font embed
      </p>
    </div>
  </div>
);

const ResultState: FC<{ result: IAtsCheckResult; onClose: () => void }> = ({ result, onClose }) => {
  const errors = result.findings.filter((f) => f.severity === 'error');
  const warnings = result.findings.filter((f) => f.severity === 'warning');

  const status: 'pass' | 'warning' | 'error' = errors.length
    ? 'error'
    : warnings.length
      ? 'warning'
      : 'pass';

  const Icon =
    status === 'pass' ? CheckmarkCircle02Icon : status === 'warning' ? Alert01Icon : Cancel01Icon;

  const headline =
    status === 'pass'
      ? 'Passes ATS compatibility.'
      : status === 'warning'
        ? 'Compatible, with notes.'
        : 'Something is keeping this from parsing.';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <span
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-pill',
            status === 'pass' && 'bg-success-soft text-success',
            status === 'warning' && 'bg-warning-soft text-warning',
            status === 'error' && 'bg-danger-soft text-danger',
          )}
        >
          <HugeiconsIcon icon={Icon} size={20} strokeWidth={1.75} />
        </span>
        <h2 className="flex-1 min-w-0 font-display text-lg font-medium text-ink truncate">
          {headline}
        </h2>
        <div className="flex shrink-0 flex-col items-end">
          <span
            className={cn(
              'font-display text-2xl font-semibold tabular-nums leading-none',
              result.score >= 90 && 'text-success',
              result.score >= 70 && result.score < 90 && 'text-warning',
              result.score < 70 && 'text-danger',
            )}
          >
            {result.score}
          </span>
          <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">score</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-ink transition-colors duration-fast ease-out-quart"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-slim px-6 py-4">
        {result.findings.length === 0 ? (
          <p className="font-sans text-sm text-ink-soft text-pretty">
            The PDF's selectable text contains every section heading, your contact details, and
            every bullet. No image-rendered text. All fonts embedded.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {result.findings.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-sm border border-border bg-surface px-3 py-2"
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-4 items-center rounded-xs px-1.5 font-mono text-2xs uppercase tracking-[0.16em]',
                    f.severity === 'error' && 'bg-danger-soft text-danger',
                    f.severity === 'warning' && 'bg-warning-soft text-warning',
                    f.severity === 'info' && 'bg-info-soft text-info',
                  )}
                >
                  {f.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-ink">{f.rule}</p>
                  <p className="font-sans text-sm text-ink-soft">{f.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border/60 px-6 py-3">
        <p className="font-mono text-2xs tabular-nums text-muted">
          {result.meta.sections} sections · {result.meta.bullets} bullets ·{' '}
          {result.meta.sizeKb} KB
        </p>
      </div>
    </div>
  );
};

export default AtsCheckModal;
