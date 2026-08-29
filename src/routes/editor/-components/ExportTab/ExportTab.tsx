import { type FC, type ChangeEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Download04Icon,
  FileExportIcon,
  ShieldUserIcon,
  AnalyticsUpIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';

interface IExportTabProps {
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  onDownloadJson: () => void;
  onAtsCheck: () => void;
  onOpenTailor: () => void;
  jobDescription: string;
  onChangeJobDescription: (next: string) => void;
  pdfBusy?: boolean;
  docxBusy?: boolean;
  atsBusy?: boolean;
}

const ExportTab: FC<IExportTabProps> = ({
  onDownloadPdf,
  onDownloadDocx,
  onDownloadJson,
  onAtsCheck,
  onOpenTailor,
  jobDescription,
  onChangeJobDescription,
  pdfBusy,
  docxBusy,
  atsBusy,
}) => {
  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Tailor</h3>
        <button
          type="button"
          onClick={onOpenTailor}
          className="flex w-full items-start gap-3 rounded-sm border border-accent/40 bg-accent-soft/50 p-3 text-left transition-[border-color] duration-fast ease-out-quart hover:border-accent focus-visible:outline-none"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-bg text-accent-ink dark:text-accent">
            <HugeiconsIcon icon={AnalyticsUpIcon} size={16} strokeWidth={1.5} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-medium text-ink">Tailor to a job</p>
            <p className="font-sans text-xs text-ink-soft">
              Paste a job description. AI rewrites your résumé to match it — you approve every
              change.
            </p>
          </div>
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Downloads</h3>
        <ExportButton
          label="Download PDF"
          subtitle="Recommended. Single-column, embedded fonts, ATS-friendly."
          icon={Download04Icon}
          onClick={onDownloadPdf}
          busy={pdfBusy}
          primary
        />
        <ExportButton
          label="Download DOCX"
          subtitle="Plain Calibri 11pt. For places that prefer Word."
          icon={FileExportIcon}
          onClick={onDownloadDocx}
          busy={docxBusy}
        />
        <ExportButton
          label="Download JSON"
          subtitle="JSON Resume format. Portable to other tools."
          icon={FileExportIcon}
          onClick={onDownloadJson}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Verify</h3>
        <ExportButton
          label="Check ATS compatibility"
          subtitle="Round-trips every field, scores against R1–R22, optionally matches a JD."
          icon={ShieldUserIcon}
          onClick={onAtsCheck}
          busy={atsBusy}
        />
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
            Job description <span className="text-faint normal-case tracking-normal">(optional, paste to score keyword overlap)</span>
          </span>
          <textarea
            value={jobDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChangeJobDescription(e.target.value)}
            placeholder="Paste a job description here to score your resume's keyword coverage against it."
            rows={6}
            className="rounded-sm border border-border bg-bg px-2.5 py-2 font-sans text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none transition-colors duration-fast ease-out-quart scrollbar-slim resize-none"
          />
        </label>
      </section>
    </div>
  );
};

interface IExportButtonProps {
  label: string;
  subtitle: string;
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  onClick: () => void;
  busy?: boolean;
  primary?: boolean;
}

const ExportButton: FC<IExportButtonProps> = ({
  label,
  subtitle,
  icon,
  onClick,
  busy,
  primary,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    className={cn(
      'flex w-full items-start gap-3 rounded-sm border p-3 text-left',
      'transition-[border-color,background-color] duration-fast ease-out-quart',
      'focus-visible:outline-none focus-visible:border-accent',
      primary
        ? 'border-ink bg-ink text-bg hover:bg-accent hover:border-accent'
        : 'border-border bg-surface text-ink hover:border-border-strong hover:bg-bg',
      busy && 'opacity-50 cursor-not-allowed',
    )}
  >
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xs',
        primary ? 'bg-bg/10' : 'bg-bg',
      )}
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} />
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-sans text-sm font-medium">{busy ? 'Working…' : label}</p>
      <p className={cn('font-sans text-xs', primary ? 'opacity-80' : 'text-ink-soft')}>
        {subtitle}
      </p>
    </div>
  </button>
);

export default ExportTab;
