import { type FC } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import { atsExtractedLines, atsVerifiedItems } from '@/constants';

const AtsComparison: FC = () => {
  return (
    <section
      id="ats"
      className="border-t border-border/80 px-6 py-28 sm:px-12 sm:py-40"
      aria-label="ATS parsing comparison"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[18ch]">
          <h2
            className="font-display font-medium text-ink text-balance"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              lineHeight: '0.98',
              letterSpacing: '-0.028em',
            }}
          >
            One file. Two{' '}
            <span className="italic font-normal text-accent-ink dark:text-accent">readers</span>
            .
          </h2>
        </div>

        <p
          className="mt-10 font-sans text-ink-soft text-pretty"
          style={{
            fontSize: 'clamp(1rem, 1.2vw, 1.1875rem)',
            lineHeight: '1.6',
            maxWidth: '60ch',
            fontVariationSettings: '"wdth" 96',
          }}
        >
          Every other free resume builder makes a pretty PDF that an Applicant Tracking System
          reads as scrambled gibberish. This one renders real, selectable text in a structure
          the major ATS parsers (Workday, Greenhouse, Lever, Taleo, Ashby) are designed to read.
          Every template is tested against the rules in our own ATS-compliance audit before
          shipping.
        </p>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-0">
          <div className="flex flex-col">
            <div className="mb-5 flex items-baseline justify-between border-b border-border/70 pb-3">
              <p className="font-sans text-sm font-medium text-ink">What the human sees</p>
              <p className="font-mono text-2xs uppercase tracking-[0.18em] text-muted">
                modern-minimal · letter · 184 KB
              </p>
            </div>
            <div className="relative bg-bg">
              <div
                className="mx-auto w-full max-w-[420px] shadow-canvas rounded-canvas overflow-hidden"
                style={{ outline: '1px solid oklch(1 0 0 / 0.04)', outlineOffset: '-1px' }}
              >
                <ResumePreview variant="modern-minimal" />
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="relative hidden flex-col items-center justify-center lg:flex"
            style={{ width: '6rem' }}
          >
            <div className="h-full w-px bg-border-strong" />
            <div className="absolute inset-y-1/2 -translate-y-1/2 flex items-center justify-center rounded-pill border border-border-strong bg-bg p-2 text-muted">
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-5 flex items-baseline justify-between border-b border-border/70 pb-3">
              <p className="font-sans text-sm font-medium text-ink">What the ATS reads</p>
              <p className="font-mono text-2xs uppercase tracking-[0.18em] text-muted">
                pdftotext extraction
              </p>
            </div>
            <pre className="flex-1 max-h-[480px] overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs leading-[1.7] text-ink-soft">
              {atsExtractedLines.join('\n')}
            </pre>
          </div>
        </div>

        <ul className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/70 pt-8">
          {atsVerifiedItems.map((label) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 font-sans text-sm text-ink-soft"
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                size={16}
                strokeWidth={1.75}
                className="text-accent"
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AtsComparison;
