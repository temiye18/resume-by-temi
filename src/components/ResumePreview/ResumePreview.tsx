import { type FC, type ReactNode, Fragment } from 'react';
import { cn } from '@/lib/cn';
import { janeDoe, resumeVariantStyles } from '@/constants';
import MarkdownText from '@/components/MarkdownText/MarkdownText';
import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IFixtureResume } from '@/interfaces/i-fixture-resume';

interface IResumePreviewProps {
  variant?: ResumeVariant;
  resume?: IFixtureResume;
  showCursor?: boolean;
  cursorActive?: boolean;
  accentColor?: string;
  headingFont?: string;
  bodyFont?: string;
  typeScale?: number;
  lineHeight?: number;
  className?: string;
}

const formatDateRange = (start: string, end: string): string => {
  const fmt = (raw: string) => {
    if (raw === 'Present') return 'Present';
    const [y, m] = raw.split('-');
    if (!m) return y;
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };
  return `${fmt(start)} — ${fmt(end)}`;
};

const fontStack = (family?: string, fallback = 'serif'): string => {
  if (!family) return '';
  return `'${family}', ${fallback}`;
};

const linkClass = 'text-inherit no-underline hover:text-accent';

const renderContactLine = (resume: IFixtureResume): ReactNode => {
  const parts: { key: string; node: ReactNode }[] = [];
  if (resume.contact.location) {
    parts.push({ key: 'loc', node: resume.contact.location });
  }
  if (resume.contact.email) {
    parts.push({
      key: 'email',
      node: (
        <a href={`mailto:${resume.contact.email}`} className={linkClass}>
          {resume.contact.email}
        </a>
      ),
    });
  }
  if (resume.contact.phone) {
    parts.push({
      key: 'phone',
      node: (
        <a
          href={`tel:${resume.contact.phone.replace(/[^+\d]/g, '')}`}
          className={linkClass}
        >
          {resume.contact.phone}
        </a>
      ),
    });
  }
  resume.contact.profiles.forEach((p, idx) => {
    parts.push({
      key: `p-${idx}`,
      node: (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {p.label}
        </a>
      ),
    });
  });
  return parts.map((p, i) => (
    <Fragment key={p.key}>
      {i > 0 ? ' · ' : null}
      {p.node}
    </Fragment>
  ));
};

const ResumePreview: FC<IResumePreviewProps> = ({
  variant = 'modern-minimal',
  resume = janeDoe,
  showCursor = false,
  cursorActive = true,
  accentColor,
  headingFont,
  bodyFont,
  typeScale,
  lineHeight,
  className,
}) => {
  const v = resumeVariantStyles[variant];
  const isCentered = variant === 'classic-serif';

  const articleStyle: Record<string, string> = {
    ['--resume-paper']: 'oklch(1 0 0)',
    ['--resume-ink']: 'oklch(0.15 0 0)',
    ['--resume-rule']: 'oklch(0.88 0 0)',
  };
  if (accentColor) articleStyle['--color-accent'] = accentColor;
  if (headingFont) articleStyle['--font-display'] = fontStack(headingFont, 'Georgia, serif');
  if (bodyFont) {
    articleStyle['--font-sans'] = fontStack(bodyFont, 'system-ui, sans-serif');
  }
  if (typeScale) articleStyle['--resume-type-scale'] = String(typeScale);
  if (lineHeight) articleStyle['--resume-line-height'] = String(lineHeight);

  return (
    <article
      className={cn(
        'bg-[var(--resume-paper)] text-[var(--resume-ink)] w-full',
        v.paper,
        className,
      )}
      style={{
        ...articleStyle,
        ['--resume-muted' as string]: 'oklch(0.5 0 0)',
      }}
      aria-label={`Resume preview, ${variant} template`}
    >
      <header className={cn(isCentered && 'text-center')}>
        <h1 className={v.name}>
          {resume.name}
          {showCursor ? (
            <span
              className={cn(
                'ml-1 inline-block h-[0.78em] w-[2px] translate-y-[0.08em] bg-accent align-baseline',
                cursorActive ? 'animate-cursor-blink opacity-100' : 'opacity-0',
              )}
              aria-hidden
            />
          ) : null}
        </h1>
        <p className={v.label}>{resume.label}</p>
        {v.rule ? <div className={v.rule} aria-hidden /> : null}
        <p className={v.contact}>{renderContactLine(resume)}</p>
      </header>

      <section>
        <h2 className={v.sectionHeading}>Summary</h2>
        <div className={v.summary}>
          <MarkdownText source={resume.summary} blocks />
        </div>
      </section>

      <section>
        <h2 className={v.sectionHeading}>Experience</h2>
        {resume.experience.map((entry) => (
          <div key={`${entry.company}-${entry.role}`}>
            <div className={v.entryHeader}>
              <div className="flex-1 min-w-0">
                <span className={v.entryRole}>{entry.role}</span>
                {' · '}
                <span className={v.entryCompany}>{entry.company}</span>
              </div>
              <span className={v.entryDates}>
                {formatDateRange(entry.startDate, entry.endDate)}
              </span>
            </div>
            <ul>
              {entry.bullets.map((bullet, i) => (
                <li key={i} className={cn(v.bullet, 'flex gap-2')}>
                  <span aria-hidden className="select-none">
                    •
                  </span>
                  <span className="flex-1">
                    <MarkdownText source={bullet.text} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2 className={v.sectionHeading}>Education</h2>
        {resume.education.map((entry) => (
          <div key={entry.institution} className={v.entryHeader}>
            <div className="flex-1">
              <span className={v.entryRole}>{entry.institution}</span>
              {' · '}
              <span className={v.entryCompany}>
                {entry.degree} {entry.field}
              </span>
            </div>
            <span className={v.entryDates}>{entry.endDate}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 className={v.sectionHeading}>Skills</h2>
        {resume.skills.map((group) => (
          <p key={group.group} className={cn('mt-1', v.skillsList)}>
            <span className={v.skillsGroupLabel}>{group.group}</span>
            {': '}
            <span>{group.items.join(', ')}</span>
          </p>
        ))}
      </section>
    </article>
  );
};

export default ResumePreview;
