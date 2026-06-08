import { type FC, type ChangeEvent, type DragEvent, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowUpRight01Icon,
  FileUploadIcon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import { db } from '@/db/dexie';
import { createResume, clearAllData } from '@/db/repository';
import { emptyResume, ResumeSchema } from '@/schema/resume';
import { timeOfDayGreeting } from '@/helpers';
import { cn } from '@/lib/cn';
import ResumeCard from './ResumeCard';

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const records = useLiveQuery(() => db.resumes.orderBy('updatedAt').reverse().toArray());
  const [dragHover, setDragHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const greeting = timeOfDayGreeting();
  const hasResumes = (records?.length ?? 0) > 0;

  const handleStartFresh = async () => {
    setBusy(true);
    setError(null);
    const record = await createResume(emptyResume(), 'modern-minimal', 'Untitled résumé');
    setBusy(false);
    navigate({ to: '/editor/$resumeId', params: { resumeId: record.id } });
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = ResumeSchema.safeParse(parsed);
      if (!result.success) {
        setError('That file isn\'t a valid JSON Resume document.');
        setBusy(false);
        return;
      }
      const name =
        result.data.basics.name && result.data.basics.name !== 'Your Name'
          ? `${result.data.basics.name} (imported)`
          : 'Imported résumé';
      const record = await createResume(result.data, 'modern-minimal', name);
      setBusy(false);
      navigate({ to: '/editor/$resumeId', params: { resumeId: record.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.');
      setBusy(false);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragHover(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        'Delete every résumé and every byte stored by this site? This cannot be undone.',
      )
    ) {
      return;
    }
    setBusy(true);
    await clearAllData();
    setBusy(false);
  };

  return (
    <section className="px-6 py-16 sm:px-12 sm:py-24" aria-label="Your resumes">
      <div className="mx-auto max-w-[1280px]">
        <header className="max-w-[42ch]">
          <h1
            className="font-display font-medium text-ink text-balance"
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
              lineHeight: '1.04',
              letterSpacing: '-0.028em',
            }}
          >
            {greeting}{' '}
            <span className="italic font-normal text-ink-soft">
              {hasResumes ? 'Pick up where you left off.' : 'Where would you like to start?'}
            </span>
          </h1>
        </header>

        <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-6">
          <button
            type="button"
            onClick={handleStartFresh}
            disabled={busy}
            className={cn(
              'group relative flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-6 text-left',
              'transition-[border-color,background-color,box-shadow] duration-base ease-out-quart',
              'hover:border-border-strong hover:bg-bg hover:shadow-1',
              'focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-1',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <div className="flex w-full items-start justify-between gap-3">
              <p className="font-display text-2xl font-medium text-ink">Start fresh</p>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={20}
                strokeWidth={1.5}
                className="text-ink-soft transition-[color,transform] duration-fast ease-out-quart group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
            <p className="font-sans text-sm text-ink-soft">
              A new document populated with realistic placeholders. Replace them line by line.
            </p>
          </button>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragHover(true);
            }}
            onDragLeave={() => setDragHover(false)}
            onDrop={handleDrop}
            className={cn(
              'group relative flex flex-col items-start gap-3 rounded-md border border-dashed bg-surface p-6 text-left cursor-pointer',
              'transition-[border-color,background-color] duration-base ease-out-quart',
              dragHover
                ? 'border-accent bg-accent-soft'
                : 'border-border hover:border-border-strong hover:bg-bg',
              busy && 'opacity-40 cursor-not-allowed',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={handleFileInput}
              disabled={busy}
            />
            <div className="flex w-full items-start justify-between gap-3">
              <p className="font-display text-2xl font-medium text-ink">Import JSON résumé</p>
              <HugeiconsIcon
                icon={FileUploadIcon}
                size={20}
                strokeWidth={1.5}
                className="text-ink-soft transition-colors duration-fast ease-out-quart group-hover:text-ink"
              />
            </div>
            <p className="font-sans text-sm text-ink-soft">
              Drop a JSON Resume file here or click to select. We validate the shape before
              opening it.
            </p>
          </label>
        </div>

        {error ? (
          <p className="mt-4 font-mono text-2xs text-danger">{error}</p>
        ) : null}

        {records === undefined ? (
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-surface-sunk"
                style={{ height: '420px' }}
                aria-hidden
              />
            ))}
          </div>
        ) : hasResumes ? (
          <>
            <div className="mt-20 mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-medium text-ink">Your résumés</h2>
              <span className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">
                {records.length} saved · stored on this device
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {records.map((record) => (
                <ResumeCard key={record.id} record={record} />
              ))}
            </div>

            <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
              <p className="font-sans text-sm text-ink-soft max-w-[60ch]">
                Everything you see here lives in this browser's IndexedDB. Clearing it removes
                every résumé and starts fresh.
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={busy}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-sm text-ink-soft transition-colors duration-fast ease-out-quart hover:border-danger hover:text-danger hover:bg-danger-soft disabled:opacity-40"
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.5} />
                Delete all my data
              </button>
            </div>
          </>
        ) : (
          <div className="mt-24 max-w-[52ch] font-sans text-md text-ink-soft">
            <p>
              No résumés saved here yet. Once you start one, it lives in this browser's
              storage and never leaves your machine.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
