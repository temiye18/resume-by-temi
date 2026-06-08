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
import { timeOfDayGreeting, extractResumeText, parseResumeText } from '@/helpers';
import { cn } from '@/lib/cn';
import ResumeCard from './ResumeCard';
import AiParseLoader, { type AiParseStage } from '@/components/AiParseLoader/AiParseLoader';

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const records = useLiveQuery(() => db.resumes.orderBy('updatedAt').reverse().toArray());
  const [dragHover, setDragHover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStage, setAiStage] = useState<AiParseStage>('uploaded');
  const [aiFile, setAiFile] = useState<{ name: string; size: number } | null>(null);
  const [fallback, setFallback] = useState(false);
  const smartInputRef = useRef<HTMLInputElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);

  const greeting = timeOfDayGreeting();
  const hasResumes = (records?.length ?? 0) > 0;

  const handleStartFresh = async () => {
    setBusy(true);
    setError(null);
    const record = await createResume(emptyResume(), 'modern-minimal', 'Untitled résumé');
    setBusy(false);
    navigate({ to: '/editor/$resumeId', params: { resumeId: record.id } });
  };

  const isJsonFile = (file: File): boolean =>
    file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');

  const importJson = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const result = ResumeSchema.safeParse(parsed);
    if (!result.success) {
      setError("That file isn't a valid JSON Resume document.");
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
  };

  const importLocal = async (file: File) => {
    const text = await extractResumeText(file);
    if (text.trim().length < 60) {
      setError(
        'We could only extract a few characters of text. If this is a scanned PDF, the words are images — re-export from Word or Pages as text.',
      );
      setBusy(false);
      return;
    }
    const { resume } = parseResumeText(text);
    const validation = ResumeSchema.safeParse(resume);
    if (!validation.success) {
      setError(
        'We parsed the file but the result did not match the resume schema. Try a different format.',
      );
      setBusy(false);
      return;
    }
    const name =
      validation.data.basics.name && validation.data.basics.name !== 'Your Name'
        ? `${validation.data.basics.name} (imported)`
        : 'Imported résumé';
    const record = await createResume(validation.data, 'modern-minimal', name);
    setBusy(false);
    navigate({ to: '/editor/$resumeId', params: { resumeId: record.id } });
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      if (isJsonFile(file)) {
        await importJson(file);
        return;
      }
      setAiFile({ name: file.name, size: file.size });
      setAiStage('uploaded');
      setFallback(false);
      setAiOpen(true);
      await new Promise((r) => setTimeout(r, 300));
      setAiStage('reading');
      try {
        const { parseResumeWithGemini } = await import('@/helpers/parse-resume-with-gemini');
        setAiStage('extracting');
        const resume = await parseResumeWithGemini(file);
        setAiStage('done');
        await new Promise((r) => setTimeout(r, 320));
        const validation = ResumeSchema.safeParse(resume);
        if (!validation.success) {
          throw new Error('Gemini returned a shape we could not validate.');
        }
        const name =
          validation.data.basics.name && validation.data.basics.name !== 'Your Name'
            ? `${validation.data.basics.name} (imported)`
            : 'Imported résumé';
        const record = await createResume(validation.data, 'modern-minimal', name);
        setAiOpen(false);
        setBusy(false);
        navigate({ to: '/editor/$resumeId', params: { resumeId: record.id } });
      } catch (geminiErr) {
        setFallback(true);
        setAiStage('extracting');
        await importLocal(file);
        setAiOpen(false);
        void geminiErr;
      }
    } catch (e) {
      setAiOpen(false);
      setError(e instanceof Error ? e.message : 'Could not read that file.');
      setBusy(false);
    }
  };

  const handleLocalFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      if (isJsonFile(file)) {
        await importJson(file);
        return;
      }
      await importLocal(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.');
      setBusy(false);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const handleLocalFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleLocalFile(file);
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

        <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-6">
          <button
            type="button"
            onClick={handleStartFresh}
            disabled={busy}
            className={cn(
              'group relative flex flex-col items-start justify-between gap-3 rounded-md border border-border bg-surface p-6 text-left min-h-[200px]',
              'transition-[border-color,background-color,box-shadow] duration-base ease-out-quart',
              'hover:border-border-strong hover:bg-bg hover:shadow-1',
              'focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-1',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          >
            <div>
              <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">
                Blank document
              </p>
              <p className="mt-3 font-display text-2xl font-medium text-ink">Start fresh</p>
              <p className="mt-2 font-sans text-sm text-ink-soft text-pretty">
                A new résumé populated with realistic placeholders. Replace them line by line.
              </p>
            </div>
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={18}
              strokeWidth={1.5}
              className="text-faint transition-[color,transform] duration-fast ease-out-quart group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragHover(true);
            }}
            onDragLeave={() => setDragHover(false)}
            onDrop={handleDrop}
            className={cn(
              'group relative flex flex-col gap-4 rounded-md border bg-surface p-6 cursor-pointer min-h-[200px]',
              'transition-[border-color,background-color] duration-base ease-out-quart',
              dragHover
                ? 'border-accent bg-accent-soft shadow-1'
                : 'border-border hover:border-border-strong hover:bg-bg',
              busy && 'opacity-40 cursor-not-allowed',
            )}
          >
            <input
              ref={smartInputRef}
              type="file"
              accept="application/json,.json,application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,.txt,text/plain"
              className="sr-only"
              onChange={handleFileInput}
              disabled={busy}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">
                  Smart parse
                </p>
                <p className="mt-3 font-display text-2xl font-medium text-ink">
                  Drop in your old résumé.
                </p>
                <span
                  aria-hidden
                  className="mt-2 inline-block h-px w-12 bg-accent"
                />
              </div>
              <HugeiconsIcon
                icon={FileUploadIcon}
                size={18}
                strokeWidth={1.5}
                className="text-faint transition-colors duration-fast ease-out-quart group-hover:text-ink"
              />
            </div>
            <p className="font-sans text-sm text-ink-soft text-pretty">
              We send your PDF, DOCX, or JSON résumé to Gemini through our Cloudflare proxy.
              It reads layout, headings, dates, and skills, then drops the result straight into
              the editor for you to review.
            </p>
            <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-border/60 pt-3 font-mono text-2xs">
              <div>
                <dt className="text-muted">Model</dt>
                <dd className="mt-1 text-ink-soft tabular-nums">gemini-2.5-flash</dd>
              </div>
              <div>
                <dt className="text-muted">Sent via</dt>
                <dd className="mt-1 text-ink-soft">our proxy</dd>
              </div>
              <div>
                <dt className="text-muted">Retention</dt>
                <dd className="mt-1 text-ink-soft">none here</dd>
              </div>
            </dl>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-sans text-sm text-ink-soft">
          <span>Prefer to keep the file off our servers?</span>
          <button
            type="button"
            onClick={() => localInputRef.current?.click()}
            disabled={busy}
            className="inline-flex h-8 items-center rounded-sm font-medium text-ink underline-offset-4 transition-colors duration-fast ease-out-quart hover:underline hover:text-accent-ink focus-visible:outline-none focus-visible:underline disabled:opacity-40"
          >
            Use the local parser instead
          </button>
          <span className="font-mono text-2xs text-muted">
            Heuristic only · file never leaves your browser
          </span>
          <input
            ref={localInputRef}
            type="file"
            accept="application/json,.json,application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,.txt,text/plain"
            className="sr-only"
            onChange={handleLocalFileInput}
            disabled={busy}
          />
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
      <AiParseLoader
        open={aiOpen}
        stage={aiStage}
        fileName={aiFile?.name}
        fileSize={aiFile?.size}
        fallbackEngaged={fallback}
      />
    </section>
  );
};

export default Dashboard;
