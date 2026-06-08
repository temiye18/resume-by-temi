import { type FC } from 'react';
import { cn } from '@/lib/cn';
import { janeDoe, resumeVariantStyles } from '@/constants';
import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IFixtureResume } from '@/interfaces/i-fixture-resume';

interface IResumePreviewProps {
  variant?: ResumeVariant;
  resume?: IFixtureResume;
  showCursor?: boolean;
  cursorActive?: boolean;
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

const ResumePreview: FC<IResumePreviewProps> = ({
  variant = 'modern-minimal',
  resume = janeDoe,
  showCursor = false,
  cursorActive = true,
  className,
}) => {
  const v = resumeVariantStyles[variant];
  const isCentered = variant === 'classic-serif';

  return (
    <article
      className={cn(
        'bg-[var(--resume-paper)] text-[var(--resume-ink)] aspect-[8.5/11]',
        'overflow-hidden w-full',
        v.paper,
        className,
      )}
      style={{
        ['--resume-paper' as string]: 'oklch(1 0 0)',
        ['--resume-ink' as string]: 'oklch(0.15 0 0)',
        ['--resume-rule' as string]: 'oklch(0.88 0 0)',
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
        <p className={v.contact}>
          {resume.contact.location}
          {' · '}
          {resume.contact.email}
          {' · '}
          {resume.contact.phone}
          {' · '}
          {resume.contact.profiles.map((p) => p.label).join(' · ')}
        </p>
      </header>

      <section>
        <h2 className={v.sectionHeading}>Summary</h2>
        <p className={v.summary}>{resume.summary}</p>
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
                  <span className="flex-1">{bullet.text}</span>
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
