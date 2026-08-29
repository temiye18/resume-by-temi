import { type FC } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import { useTypewriter } from '@/hooks/useTypewriter';
import type { ITailorSuggestion } from '@/interfaces/i-tailor-suggestion';
import type { TailorDecision } from '@/types/tailor-decision-type';

interface ITailorSuggestionCardProps {
  suggestion: ITailorSuggestion;
  decision: TailorDecision;
  animate: boolean;
  onDecide: (decision: TailorDecision) => void;
}

const opLabel = (s: ITailorSuggestion): string => {
  switch (s.op) {
    case 'rewrite-summary':
      return 'Summary';
    case 'replace-bullet':
      return 'Sharpen bullet';
    case 'add-bullet':
      return 'New bullet';
    case 'replace-project-bullet':
      return 'Project bullet';
    case 'add-skill':
      return 'Skill from the JD';
  }
};

const TailorSuggestionCard: FC<ITailorSuggestionCardProps> = ({
  suggestion,
  decision,
  animate,
  onDecide,
}) => {
  const shown = useTypewriter(suggestion.after, animate && decision === 'pending');
  const accepted = decision === 'accepted';
  const rejected = decision === 'rejected';
  const displayAfter =
    suggestion.op === 'add-skill' && suggestion.skill ? suggestion.skill : shown;

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-md border p-3.5 transition-colors duration-base ease-out-quart',
        accepted && 'border-accent/50 bg-accent-soft/40',
        rejected && 'border-border bg-surface-sunk/40 opacity-55',
        !accepted && !rejected && 'border-border bg-surface',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
          {opLabel(suggestion)}
        </span>
        {suggestion.confirm ? (
          <span className="font-mono text-2xs uppercase tracking-[0.14em] text-warning">
            only if you have it
          </span>
        ) : null}
      </div>

      {suggestion.before ? (
        <p
          className={cn(
            'font-sans text-sm leading-snug text-muted line-through decoration-1',
            rejected && 'no-underline',
          )}
        >
          {suggestion.before}
        </p>
      ) : null}

      <p
        className={cn(
          'font-sans text-sm leading-snug text-pretty',
          rejected ? 'text-muted' : 'text-accent-ink dark:text-accent',
        )}
      >
        {displayAfter}
      </p>

      {suggestion.reason ? (
        <p className="font-mono text-2xs leading-normal text-muted">↳ {suggestion.reason}</p>
      ) : null}

      {decision === 'pending' ? (
        <div className="mt-0.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDecide('accepted')}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-sm bg-ink px-3 font-sans text-xs font-medium text-bg transition-[background-color,transform] duration-fast ease-out-quart hover:bg-accent active:translate-y-px focus-visible:outline-none"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} strokeWidth={1.75} />
            {suggestion.confirm ? 'Yes, I have it' : 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => onDecide('rejected')}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-sm border border-border bg-bg px-3 font-sans text-xs font-medium text-ink-soft transition-colors duration-fast ease-out-quart hover:border-border-strong hover:text-ink focus-visible:outline-none"
          >
            Skip
          </button>
        </div>
      ) : (
        <div className="mt-0.5 flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.16em]',
              accepted ? 'text-accent-ink dark:text-accent' : 'text-muted',
            )}
          >
            <HugeiconsIcon
              icon={accepted ? CheckmarkCircle02Icon : Cancel01Icon}
              size={13}
              strokeWidth={1.75}
            />
            {accepted ? 'Applied' : 'Skipped'}
          </span>
          <button
            type="button"
            onClick={() => onDecide('pending')}
            className="font-mono text-2xs uppercase tracking-[0.16em] text-muted underline decoration-1 underline-offset-2 transition-colors duration-fast ease-out-quart hover:text-ink"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
};

export default TailorSuggestionCard;
