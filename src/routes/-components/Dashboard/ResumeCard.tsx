import { type FC, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowUpRight01Icon,
  CopyIcon,
  Edit01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/helpers';
import {
  renameResume,
  duplicateResume,
  deleteResume,
} from '@/db/repository';
import type { IResumeRecord } from '@/interfaces/i-resume-record';
import type { ResumeVariant } from '@/types/resume-variant-type';

interface IResumeCardProps {
  record: IResumeRecord;
}

const ResumeCard: FC<IResumeCardProps> = ({ record }) => {
  const [editing, setEditing] = useState(false);
  const [pendingName, setPendingName] = useState(record.name);
  const [busy, setBusy] = useState(false);

  const commitRename = async () => {
    const next = pendingName.trim();
    if (!next || next === record.name) {
      setEditing(false);
      setPendingName(record.name);
      return;
    }
    setBusy(true);
    await renameResume(record.id, next);
    setBusy(false);
    setEditing(false);
  };

  const handleDuplicate = async () => {
    setBusy(true);
    await duplicateResume(record.id);
    setBusy(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${record.name}"? This cannot be undone.`)) return;
    setBusy(true);
    await deleteResume(record.id);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-md border border-border bg-surface shadow-1',
        'transition-shadow duration-base ease-out-quart hover:shadow-2',
      )}
    >
      <Link
        to="/editor/$resumeId"
        params={{ resumeId: record.id }}
        className="block focus-visible:outline-none"
        aria-label={`Open ${record.name}`}
      >
        <div
          className="relative overflow-hidden bg-surface-sunk"
          style={{ aspectRatio: '8.5 / 11' }}
        >
          <div
            aria-hidden
            className="absolute inset-0 origin-top-left pointer-events-none"
            style={{
              transform: 'scale(0.42)',
              width: '238.1%',
              height: '238.1%',
            }}
          >
            <ResumePreview
              variant={record.templateId as ResumeVariant}
              resume={undefined}
            />
          </div>
        </div>
      </Link>

      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void commitRename();
                if (e.key === 'Escape') {
                  setEditing(false);
                  setPendingName(record.name);
                }
              }}
              className="w-full font-display text-md font-medium text-ink bg-transparent outline-none border-b border-border-strong"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="block w-full text-left font-display text-md font-medium text-ink truncate hover:text-accent-ink dark:hover:text-accent transition-colors duration-fast ease-out-quart"
            >
              {record.name}
            </button>
          )}
          <p className="mt-1 font-mono text-2xs tabular-nums text-muted truncate">
            {record.templateId.replace('-', ' · ')} · edited {formatRelativeTime(record.updatedAt)}
          </p>
        </div>
        <Link
          to="/editor/$resumeId"
          params={{ resumeId: record.id }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-ink-soft transition-colors duration-fast ease-out-quart hover:bg-bg hover:text-ink focus-visible:outline-none"
          aria-label="Open editor"
        >
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="flex items-center gap-1 border-t border-border/60 px-2 py-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-xs text-ink-soft transition-colors duration-fast ease-out-quart hover:bg-bg hover:text-ink disabled:opacity-40"
        >
          <HugeiconsIcon icon={Edit01Icon} size={13} strokeWidth={1.5} />
          Rename
        </button>
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={busy}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-xs text-ink-soft transition-colors duration-fast ease-out-quart hover:bg-bg hover:text-ink disabled:opacity-40"
        >
          <HugeiconsIcon icon={CopyIcon} size={13} strokeWidth={1.5} />
          Duplicate
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-xs text-ink-soft transition-colors duration-fast ease-out-quart hover:bg-danger-soft hover:text-danger disabled:opacity-40"
        >
          <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={1.5} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
