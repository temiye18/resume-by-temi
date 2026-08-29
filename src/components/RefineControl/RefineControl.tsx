import { type FC, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiMagicIcon, CheckmarkCircle02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import { streamRefine } from '@/helpers';
import { useTypewriter } from '@/hooks/useTypewriter';
import type { RefineKind } from '@/types/refine-kind-type';

interface IRefineControlProps {
  getText: () => string;
  onAccept: (refined: string) => void;
  kind: RefineKind;
  context?: string;
  disabled?: boolean;
  className?: string;
}

type RefineState = 'idle' | 'streaming' | 'ready' | 'error';

interface IVariantCardProps {
  text: string;
  index: number;
  animate: boolean;
  onUse: () => void;
}

const VariantCard: FC<IVariantCardProps> = ({ text, index, animate, onUse }) => {
  const shown = useTypewriter(text, animate);
  return (
    <div className="flex flex-col gap-1.5 rounded-xs border border-border bg-bg p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
          Option {index + 1}
        </span>
        <button
          type="button"
          onClick={onUse}
          className="inline-flex h-6 items-center gap-1 rounded-xs bg-ink px-2 font-sans text-2xs font-medium text-bg transition-[background-color] duration-fast ease-out-quart hover:bg-accent focus-visible:outline-none"
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} strokeWidth={1.75} />
          Use this
        </button>
      </div>
      <p className="whitespace-pre-wrap font-sans text-sm leading-snug text-ink">
        {shown}
        {animate && shown.length < text.length ? (
          <span aria-hidden className="ml-[1px] inline-block h-[0.9em] w-[5px] translate-y-[0.1em] animate-cursor-blink bg-accent align-baseline" />
        ) : null}
      </p>
    </div>
  );
};

const RefineControl: FC<IRefineControlProps> = ({
  getText,
  onAccept,
  kind,
  context,
  disabled,
  className,
}) => {
  const [state, setState] = useState<RefineState>('idle');
  const [variants, setVariants] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const run = async () => {
    const text = getText().trim();
    if (text.length < 8) return;
    controller.current?.abort();
    controller.current = new AbortController();
    setVariants([]);
    setError(null);
    setState('streaming');
    try {
      let count = 0;
      for await (const variant of streamRefine({ text, kind, context, signal: controller.current.signal })) {
        count += 1;
        setVariants((prev) => (prev.length < 2 ? [...prev, variant] : prev));
      }
      if (count === 0) {
        setState('error');
        setError('Could not refine this. Try again.');
      } else {
        setState('ready');
      }
    } catch (err) {
      if (controller.current?.signal.aborted) return;
      setState('error');
      setError(err instanceof Error ? err.message : 'Refine failed. Please try again.');
    }
  };

  const close = () => {
    controller.current?.abort();
    setState('idle');
    setVariants([]);
    setError(null);
  };

  const accept = (text: string) => {
    const next = text.trim();
    if (next) onAccept(next);
    close();
  };

  if (state === 'idle') {
    return (
      <div className={cn('flex justify-end', className)}>
        <button
          type="button"
          onClick={() => void run()}
          disabled={disabled}
          className={cn(
            'inline-flex h-6 items-center gap-1 rounded-xs px-1.5 font-mono text-2xs uppercase tracking-[0.14em] transition-colors duration-fast ease-out-quart focus-visible:outline-none',
            disabled
              ? 'cursor-not-allowed text-faint'
              : 'text-muted hover:bg-accent-soft/50 hover:text-accent-ink dark:hover:text-accent',
          )}
          title={disabled ? 'Write a little more first' : 'Refine this with AI'}
        >
          <HugeiconsIcon icon={AiMagicIcon} size={13} strokeWidth={1.5} />
          Refine
        </button>
      </div>
    );
  }

  const streaming = state === 'streaming';

  return (
    <div
      aria-live="polite"
      className={cn('flex flex-col gap-2 rounded-sm border border-accent/40 bg-accent-soft/30 p-2.5', className)}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-accent-ink dark:text-accent">
          <HugeiconsIcon icon={AiMagicIcon} size={12} strokeWidth={1.5} />
          {streaming ? 'Refining' : state === 'error' ? 'Refine' : 'Pick a version'}
        </span>
        {streaming ? (
          <span aria-hidden className="h-1.5 w-1.5 rounded-pill bg-accent animate-soft-pulse" />
        ) : null}
      </div>

      {state === 'error' ? (
        <p className="font-sans text-sm text-danger">{error}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {variants.map((text, i) => (
            <VariantCard
              key={i}
              text={text}
              index={i}
              animate={streaming && i === variants.length - 1}
              onUse={() => accept(text)}
            />
          ))}
          {streaming && variants.length < 2 ? (
            <div className="flex items-center gap-2 rounded-xs border border-dashed border-border px-2 py-2.5">
              <span aria-hidden className="h-1.5 w-1.5 rounded-pill bg-accent animate-soft-pulse" />
              <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
                Writing option {variants.length + 1}…
              </span>
            </div>
          ) : null}
        </div>
      )}

      <div className="flex items-center gap-2">
        {streaming ? (
          <button
            type="button"
            onClick={close}
            className="inline-flex h-7 items-center rounded-sm border border-border bg-bg px-2.5 font-sans text-xs font-medium text-ink-soft transition-colors duration-fast ease-out-quart hover:text-ink focus-visible:outline-none"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void run()}
            className="inline-flex h-7 items-center rounded-sm border border-border bg-bg px-2.5 font-sans text-xs font-medium text-ink-soft transition-colors duration-fast ease-out-quart hover:text-ink focus-visible:outline-none"
          >
            {state === 'error' ? 'Try again' : 'Redo'}
          </button>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Discard suggestions"
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors duration-fast ease-out-quart hover:bg-bg hover:text-ink focus-visible:outline-none"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default RefineControl;
