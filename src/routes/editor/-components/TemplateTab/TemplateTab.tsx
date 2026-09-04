import { type FC } from 'react';
import { cn } from '@/lib/cn';
import { useResumeStore } from '@/store/resumeStore';
import { templateTiles } from '@/constants';

const TemplateTab: FC = () => {
  const templateId = useResumeStore((s) => s.templateId);
  const setTemplate = useResumeStore((s) => s.setTemplate);

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Template</p>
      <p className="font-sans text-sm text-ink-soft text-pretty">
        Switching templates keeps every line you've written. The same JSON, eleven presentations.
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {templateTiles.map((tile) => {
          const active = templateId === tile.variant;
          return (
            <button
              key={tile.variant}
              type="button"
              onClick={() => setTemplate(tile.variant)}
              className={cn(
                'relative flex flex-col gap-1 rounded-sm border bg-surface p-3 text-left',
                'transition-[border-color,background-color] duration-fast ease-out-quart',
                active
                  ? 'border-accent bg-accent-soft'
                  : 'border-border hover:border-border-strong hover:bg-bg',
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-pill bg-accent"
                />
              ) : null}
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-md font-medium text-ink">{tile.name}</span>
                <span className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">
                  {tile.variant.replace('-', ' · ')}
                </span>
              </div>
              <span className="font-sans text-xs text-ink-soft">{tile.caption}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateTab;
