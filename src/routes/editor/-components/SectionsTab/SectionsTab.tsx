import { type FC, type ChangeEvent, useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { useResumeStore } from '@/store/resumeStore';
import { newId } from '@/schema/resume';
import { cn } from '@/lib/cn';
import RichTextField from '@/components/RichTextField/RichTextField';
import BulletList from '../BulletList/BulletList';
import { MonthPicker } from '@/ui';
import { easeOutExpo } from '@/constants';

interface IFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'date';
  multiline?: boolean;
  rows?: number;
}

const Field: FC<IFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline,
  rows = 3,
}) => {
  const id = label.replace(/\s+/g, '-').toLowerCase();
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="rounded-sm border border-border bg-bg px-2.5 py-2 font-sans text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none transition-colors duration-fast ease-out-quart"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 rounded-sm border border-border bg-bg px-2.5 font-sans text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none transition-colors duration-fast ease-out-quart"
        />
      )}
    </label>
  );
};

interface IDisclosureProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const Disclosure: FC<IDisclosureProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn(
        'group rounded-sm border bg-surface transition-[border-color,background-color] duration-fast ease-out-quart',
        open ? 'border-border-strong bg-bg shadow-1' : 'border-border hover:border-border-strong',
      )}
    >
      <div className="flex items-center gap-1 px-2.5 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group/btn flex flex-1 min-w-0 items-center gap-2 text-left focus-visible:outline-none"
          aria-expanded={open}
        >
          <m.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.22, ease: easeOutExpo }}
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={11} strokeWidth={1.75} />
          </m.span>
          <span className="flex-1 min-w-0 truncate">
            <span className="font-sans text-sm font-medium text-ink">{title}</span>
            {subtitle ? (
              <span className="ml-2 font-display italic text-sm text-muted">{subtitle}</span>
            ) : null}
          </span>
        </button>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-fast ease-out-quart group-hover:opacity-100 focus-within:opacity-100">
          {onMoveUp ? (
            <button
              type="button"
              onClick={onMoveUp}
              className="inline-flex h-6 w-6 items-center justify-center rounded-xs text-muted transition-colors duration-fast ease-out-quart hover:bg-bg hover:text-ink"
              aria-label="Move up"
            >
              <HugeiconsIcon icon={ArrowUp01Icon} size={11} strokeWidth={1.5} />
            </button>
          ) : null}
          {onMoveDown ? (
            <button
              type="button"
              onClick={onMoveDown}
              className="inline-flex h-6 w-6 items-center justify-center rounded-xs text-muted transition-colors duration-fast ease-out-quart hover:bg-bg hover:text-ink"
              aria-label="Move down"
            >
              <HugeiconsIcon icon={ArrowDown01Icon} size={11} strokeWidth={1.5} />
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-6 w-6 items-center justify-center rounded-xs text-muted transition-colors duration-fast ease-out-quart hover:bg-danger-soft hover:text-danger"
              aria-label="Remove"
            >
              <HugeiconsIcon icon={Delete02Icon} size={11} strokeWidth={1.5} />
            </button>
          ) : null}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-border/60 px-2.5 py-3">
              {children}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const SectionHeading: FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">{children}</h3>
);

const moveArrayItem = <T,>(arr: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};


const SectionsTab: FC = () => {
  const resume = useResumeStore((s) => s.resume);
  const patchResume = useResumeStore((s) => s.patchResume);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Basics */}
      <section className="flex flex-col gap-3">
        <SectionHeading>Contact</SectionHeading>
        <Field
          label="Name"
          value={resume.basics.name}
          onChange={(v) =>
            patchResume((d) => {
              d.basics.name = v;
            })
          }
        />
        <Field
          label="Title"
          value={resume.basics.label ?? ''}
          onChange={(v) =>
            patchResume((d) => {
              d.basics.label = v;
            })
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Email"
            type="email"
            value={resume.basics.email ?? ''}
            onChange={(v) =>
              patchResume((d) => {
                d.basics.email = v;
              })
            }
          />
          <Field
            label="Phone"
            value={resume.basics.phone ?? ''}
            onChange={(v) =>
              patchResume((d) => {
                d.basics.phone = v;
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="City"
            value={resume.basics.location?.city ?? ''}
            onChange={(v) =>
              patchResume((d) => {
                if (!d.basics.location) d.basics.location = {};
                d.basics.location.city = v;
              })
            }
          />
          <Field
            label="Region"
            value={resume.basics.location?.region ?? ''}
            onChange={(v) =>
              patchResume((d) => {
                if (!d.basics.location) d.basics.location = {};
                d.basics.location.region = v;
              })
            }
          />
        </div>

        {/* Profile links */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">
              Links
            </span>
            <button
              type="button"
              onClick={() =>
                patchResume((d) => {
                  d.basics.profiles.push({ network: '', url: 'https://' });
                })
              }
              className="inline-flex h-6 items-center gap-1 rounded-sm border border-dashed border-border px-1.5 text-2xs text-muted transition-colors duration-fast ease-out-quart hover:border-border-strong hover:text-ink-soft"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={11} strokeWidth={1.5} />
              Add link
            </button>
          </div>
          {resume.basics.profiles.length === 0 ? (
            <p className="font-sans text-xs text-faint">
              LinkedIn, GitHub, personal site, etc. They appear in the contact line.
            </p>
          ) : null}
          {resume.basics.profiles.map((profile, i) => (
            <div
              key={i}
              className="rounded-sm border border-border bg-surface p-2.5 flex flex-col gap-2"
            >
              <div className="flex gap-2 items-center">
                <input
                  value={profile.username ?? ''}
                  onChange={(e) =>
                    patchResume((d) => {
                      d.basics.profiles[i].username = e.target.value || undefined;
                    })
                  }
                  placeholder="LinkedIn"
                  className="h-8 flex-1 min-w-0 rounded-sm border border-border bg-bg px-2 font-sans text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none transition-colors duration-fast ease-out-quart"
                />
                <button
                  type="button"
                  onClick={() =>
                    patchResume((d) => {
                      d.basics.profiles.splice(i, 1);
                    })
                  }
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xs text-muted transition-colors duration-fast ease-out-quart hover:bg-danger-soft hover:text-danger"
                  aria-label="Remove link"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={1.5} />
                </button>
              </div>
              <input
                value={profile.url}
                onChange={(e) =>
                  patchResume((d) => {
                    d.basics.profiles[i].url = e.target.value;
                  })
                }
                placeholder="https://linkedin.com/in/you"
                className="h-8 rounded-sm border border-border bg-bg px-2 font-sans text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none transition-colors duration-fast ease-out-quart"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <SectionHeading>Summary</SectionHeading>
          <span className="font-mono text-2xs text-faint">
            select to format · **bold** *italic*
          </span>
        </div>
        <RichTextField
          value={resume.basics.summary ?? ''}
          onChange={(v) =>
            patchResume((d) => {
              d.basics.summary = v;
            })
          }
          placeholder="A concise 2–3 sentence summary of who you are and what you do."
          minHeight={80}
          ariaLabel="Summary"
          blockFormats
        />
      </section>

      {/* Experience */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionHeading>Experience</SectionHeading>
          <button
            type="button"
            onClick={() =>
              patchResume((d) => {
                d.work.push({
                  id: newId(),
                  name: 'Company',
                  position: 'Title',
                  startDate: '2025-01',
                  endDate: 'Present',
                  location: '',
                  highlights: [],
                });
              })
            }
            className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-dashed border-border px-2 text-xs text-muted hover:border-border-strong hover:text-ink-soft transition-colors duration-fast ease-out-quart"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={1.5} />
            Add entry
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {resume.work.map((entry, i) => (
            <Disclosure
              key={entry.id}
              title={entry.position || 'New entry'}
              subtitle={entry.name}
              defaultOpen={i === 0}
              onRemove={() =>
                patchResume((d) => {
                  d.work.splice(i, 1);
                })
              }
              onMoveUp={
                i > 0
                  ? () =>
                      patchResume((d) => {
                        d.work = moveArrayItem(d.work, i, i - 1);
                      })
                  : undefined
              }
              onMoveDown={
                i < resume.work.length - 1
                  ? () =>
                      patchResume((d) => {
                        d.work = moveArrayItem(d.work, i, i + 1);
                      })
                  : undefined
              }
            >
              <Field
                label="Role"
                value={entry.position}
                onChange={(v) =>
                  patchResume((d) => {
                    d.work[i].position = v;
                  })
                }
              />
              <Field
                label="Company"
                value={entry.name}
                onChange={(v) =>
                  patchResume((d) => {
                    d.work[i].name = v;
                  })
                }
              />
              <Field
                label="Location"
                value={entry.location ?? ''}
                onChange={(v) =>
                  patchResume((d) => {
                    d.work[i].location = v;
                  })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <MonthPicker
                  label="Start"
                  value={entry.startDate}
                  onChange={(v) =>
                    patchResume((d) => {
                      d.work[i].startDate = v;
                    })
                  }
                />
                <MonthPicker
                  label="End"
                  value={entry.endDate ?? ''}
                  allowPresent
                  onChange={(v) =>
                    patchResume((d) => {
                      d.work[i].endDate = v;
                    })
                  }
                />
              </div>
              <div>
                <SectionHeading>Bullets</SectionHeading>
                <div className="mt-2">
                  <BulletList
                    bullets={entry.highlights}
                    onChange={(next) =>
                      patchResume((d) => {
                        d.work[i].highlights = next;
                      })
                    }
                  />
                </div>
              </div>
            </Disclosure>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionHeading>Projects</SectionHeading>
          <button
            type="button"
            onClick={() =>
              patchResume((d) => {
                d.projects.push({
                  id: newId(),
                  name: 'Project',
                  description: '',
                  highlights: [],
                  keywords: [],
                  roles: [],
                });
              })
            }
            className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-dashed border-border px-2 text-xs text-muted hover:border-border-strong hover:text-ink-soft transition-colors duration-fast ease-out-quart"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={1.5} />
            Add entry
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {resume.projects.map((entry, i) => (
            <Disclosure
              key={entry.id}
              title={entry.name || 'New project'}
              subtitle={entry.description}
              onRemove={() =>
                patchResume((d) => {
                  d.projects.splice(i, 1);
                })
              }
              onMoveUp={
                i > 0
                  ? () =>
                      patchResume((d) => {
                        d.projects = moveArrayItem(d.projects, i, i - 1);
                      })
                  : undefined
              }
              onMoveDown={
                i < resume.projects.length - 1
                  ? () =>
                      patchResume((d) => {
                        d.projects = moveArrayItem(d.projects, i, i + 1);
                      })
                  : undefined
              }
            >
              <Field
                label="Name"
                value={entry.name}
                onChange={(v) =>
                  patchResume((d) => {
                    d.projects[i].name = v;
                  })
                }
              />
              <Field
                label="Description"
                value={entry.description ?? ''}
                placeholder="One-line tagline (e.g. real-time markdown editor)"
                onChange={(v) =>
                  patchResume((d) => {
                    d.projects[i].description = v;
                  })
                }
              />
              <Field
                label="Website"
                type="text"
                value={entry.url ?? ''}
                placeholder="https://project.live.com"
                onChange={(v) =>
                  patchResume((d) => {
                    d.projects[i].url = v;
                  })
                }
              />
              <Field
                label="Code repository"
                type="text"
                value={entry.repository ?? ''}
                placeholder="https://github.com/you/project"
                onChange={(v) =>
                  patchResume((d) => {
                    d.projects[i].repository = v;
                  })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <MonthPicker
                  label="Start"
                  value={entry.startDate ?? ''}
                  onChange={(v) =>
                    patchResume((d) => {
                      d.projects[i].startDate = v || undefined;
                    })
                  }
                />
                <MonthPicker
                  label="End"
                  value={entry.endDate ?? ''}
                  onChange={(v) =>
                    patchResume((d) => {
                      d.projects[i].endDate = v || undefined;
                    })
                  }
                />
              </div>
              <div>
                <SectionHeading>Bullets</SectionHeading>
                <div className="mt-2">
                  <BulletList
                    bullets={entry.highlights}
                    onChange={(next) =>
                      patchResume((d) => {
                        d.projects[i].highlights = next;
                      })
                    }
                  />
                </div>
              </div>
            </Disclosure>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionHeading>Education</SectionHeading>
          <button
            type="button"
            onClick={() =>
              patchResume((d) => {
                d.education.push({
                  id: newId(),
                  institution: 'School',
                  studyType: 'Degree',
                  area: 'Field',
                  endDate: '',
                  highlights: [],
                  courses: [],
                });
              })
            }
            className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-dashed border-border px-2 text-xs text-muted hover:border-border-strong hover:text-ink-soft transition-colors duration-fast ease-out-quart"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={1.5} />
            Add entry
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {resume.education.map((entry, i) => (
            <Disclosure
              key={entry.id}
              title={entry.institution || 'New entry'}
              subtitle={[entry.studyType, entry.area].filter(Boolean).join(' · ')}
              onRemove={() =>
                patchResume((d) => {
                  d.education.splice(i, 1);
                })
              }
              onMoveUp={
                i > 0
                  ? () =>
                      patchResume((d) => {
                        d.education = moveArrayItem(d.education, i, i - 1);
                      })
                  : undefined
              }
              onMoveDown={
                i < resume.education.length - 1
                  ? () =>
                      patchResume((d) => {
                        d.education = moveArrayItem(d.education, i, i + 1);
                      })
                  : undefined
              }
            >
              <Field
                label="Institution"
                value={entry.institution}
                onChange={(v) =>
                  patchResume((d) => {
                    d.education[i].institution = v;
                  })
                }
              />
              <Field
                label="Degree"
                value={entry.studyType ?? ''}
                onChange={(v) =>
                  patchResume((d) => {
                    d.education[i].studyType = v;
                  })
                }
              />
              <Field
                label="Field of study"
                value={entry.area ?? ''}
                onChange={(v) =>
                  patchResume((d) => {
                    d.education[i].area = v;
                  })
                }
              />
              <MonthPicker
                label="End"
                value={entry.endDate ?? ''}
                onChange={(v) =>
                  patchResume((d) => {
                    d.education[i].endDate = v;
                  })
                }
              />
            </Disclosure>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionHeading>Skills</SectionHeading>
          <button
            type="button"
            onClick={() =>
              patchResume((d) => {
                d.skills.push({ id: newId(), name: 'Group', keywords: [] });
              })
            }
            className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-dashed border-border px-2 text-xs text-muted hover:border-border-strong hover:text-ink-soft transition-colors duration-fast ease-out-quart"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={1.5} />
            Add group
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {resume.skills.map((group, i) => (
            <div
              key={group.id}
              className={cn('flex flex-col gap-2 rounded-sm border border-border bg-bg p-3')}
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  value={group.name}
                  onChange={(e) =>
                    patchResume((d) => {
                      d.skills[i].name = e.target.value;
                    })
                  }
                  className="flex-1 h-8 rounded-sm border border-transparent bg-transparent px-1 font-sans text-sm font-medium text-ink focus:border-border-strong focus:outline-none transition-colors duration-fast ease-out-quart"
                  placeholder="Group label"
                />
                <button
                  type="button"
                  onClick={() =>
                    patchResume((d) => {
                      d.skills.splice(i, 1);
                    })
                  }
                  className="inline-flex h-6 w-6 items-center justify-center rounded-xs text-muted hover:text-danger transition-colors duration-fast ease-out-quart"
                  aria-label="Remove group"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={1.5} />
                </button>
              </div>
              <input
                value={group.keywords.join(', ')}
                onChange={(e) =>
                  patchResume((d) => {
                    d.skills[i].keywords = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                  })
                }
                placeholder="Comma-separated skills"
                className="h-8 rounded-sm border border-border bg-bg px-2.5 font-sans text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none transition-colors duration-fast ease-out-quart"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SectionsTab;
