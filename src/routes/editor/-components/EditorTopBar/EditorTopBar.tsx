import { type FC, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Download04Icon, AnalyticsUpIcon } from '@hugeicons/core-free-icons';
import AutosaveIndicator from '../AutosaveIndicator/AutosaveIndicator';
import UndoRedo from '../UndoRedo/UndoRedo';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import { useResumeStore } from '@/store/resumeStore';

interface IEditorTopBarProps {
  onDownload: () => void;
  downloading?: boolean;
  onOpenTailor: () => void;
}

const EditorTopBar: FC<IEditorTopBarProps> = ({
  onDownload,
  downloading = false,
  onOpenTailor,
}) => {
  const name = useResumeStore((s) => s.name);
  const setName = useResumeStore((s) => s.setName);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== name) setName(next);
    else setDraft(name);
    setEditing(false);
  };

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-bg px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/app"
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-ink-soft transition-colors duration-fast ease-out-quart hover:bg-surface hover:text-ink focus-visible:outline-none"
          aria-label="Back to dashboard"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
        </Link>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(name);
                setEditing(false);
              }
            }}
            className="bg-transparent font-display text-md font-medium text-ink outline-none border-b border-border-strong px-0.5"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(name);
              setEditing(true);
            }}
            className="truncate font-display text-md font-medium text-ink hover:text-accent-ink dark:hover:text-accent transition-colors duration-fast ease-out-quart"
          >
            {name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <UndoRedo />
        <span aria-hidden className="hidden h-5 w-px bg-border sm:block" />
        <AutosaveIndicator />
        <ThemeToggle />
        <button
          type="button"
          onClick={onOpenTailor}
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-bg px-2.5 sm:px-3 text-sm font-medium text-ink-soft transition-colors duration-fast ease-out-quart hover:border-border-strong hover:text-ink focus-visible:outline-none"
        >
          <HugeiconsIcon icon={AnalyticsUpIcon} size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">Tailor</span>
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          aria-label={downloading ? 'Generating PDF' : 'Download PDF'}
          className="inline-flex h-9 items-center gap-2 rounded-sm bg-ink px-3 sm:px-3.5 text-sm font-medium text-bg shadow-1 transition-[background-color,transform] duration-fast ease-out-quart hover:bg-accent active:translate-y-px focus-visible:outline-none disabled:opacity-50"
        >
          <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">
            {downloading ? 'Generating…' : 'Download PDF'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default EditorTopBar;
