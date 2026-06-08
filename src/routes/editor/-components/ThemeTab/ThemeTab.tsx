import { type FC } from 'react';
import { cn } from '@/lib/cn';
import { useResumeStore } from '@/store/resumeStore';
import { fontCatalog } from '@/constants';
import type { ResumeFontFamily } from '@/types/resume-theme-type';

const ACCENT_PRESETS = [
  { name: 'Ink', value: '#1f2937' },
  { name: 'Amber', value: '#a16207' },
  { name: 'Forest', value: '#166534' },
  { name: 'Slate', value: '#475569' },
  { name: 'Wine', value: '#9f1239' },
  { name: 'Indigo', value: '#3730a3' },
];

const ThemeTab: FC = () => {
  const theme = useResumeStore((s) => s.theme);
  const setTheme = useResumeStore((s) => s.setTheme);
  const resume = useResumeStore((s) => s.resume);
  const patchResume = useResumeStore((s) => s.patchResume);

  const paperSize = resume['x-builder'].paperSize;

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Heading font</h3>
        <FontList
          value={theme.headingFont}
          onChange={(family) => setTheme({ headingFont: family })}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Body font</h3>
        <FontList
          value={theme.bodyFont}
          onChange={(family) => setTheme({ bodyFont: family })}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Accent color</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setTheme({ accentColor: preset.value })}
              aria-label={`${preset.name} accent`}
              className={cn(
                'h-7 w-7 rounded-pill transition-shadow duration-fast ease-out-quart',
                theme.accentColor === preset.value
                  ? 'ring-2 ring-offset-2 ring-offset-bg ring-accent'
                  : 'hover:ring-1 hover:ring-border-strong',
              )}
              style={{ backgroundColor: preset.value }}
            />
          ))}
          <label className="ml-2 inline-flex items-center gap-2">
            <span className="font-mono text-2xs text-muted">Custom</span>
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => setTheme({ accentColor: e.target.value })}
              className="h-7 w-9 rounded-sm border border-border bg-bg p-0.5 cursor-pointer"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Type scale</h3>
        <input
          type="range"
          min={0.9}
          max={1.15}
          step={0.01}
          value={theme.typeScale}
          onChange={(e) => setTheme({ typeScale: Number(e.target.value) })}
          className="w-full accent-accent"
        />
        <p className="font-mono text-2xs tabular-nums text-muted">
          {(theme.typeScale * 100).toFixed(0)}% of default
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Line height</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { label: 'Compact', value: 1.15 },
              { label: 'Normal', value: 1.3 },
              { label: 'Relaxed', value: 1.5 },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme({ lineHeight: opt.value })}
              className={cn(
                'h-8 rounded-sm border text-xs font-medium transition-colors duration-fast ease-out-quart',
                Math.abs(theme.lineHeight - opt.value) < 0.01
                  ? 'border-accent bg-accent-soft text-accent-ink'
                  : 'border-border bg-bg text-ink-soft hover:bg-surface',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-2xs uppercase tracking-[0.16em] text-muted">Paper size</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {(['LETTER', 'A4'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() =>
                patchResume((d) => {
                  d['x-builder'].paperSize = size;
                })
              }
              className={cn(
                'h-8 rounded-sm border text-xs font-medium transition-colors duration-fast ease-out-quart',
                paperSize === size
                  ? 'border-accent bg-accent-soft text-accent-ink'
                  : 'border-border bg-bg text-ink-soft hover:bg-surface',
              )}
            >
              {size === 'LETTER' ? 'Letter' : 'A4'}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

interface IFontListProps {
  value: ResumeFontFamily;
  onChange: (family: ResumeFontFamily) => void;
}

const FontList: FC<IFontListProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-0.5">
      {fontCatalog.map((entry) => {
        const active = value === entry.family;
        return (
          <button
            key={entry.family}
            type="button"
            onClick={() => onChange(entry.family)}
            className={cn(
              'flex items-center justify-between gap-3 rounded-sm border px-2.5 py-2 text-left',
              'transition-[border-color,background-color] duration-fast ease-out-quart',
              active
                ? 'border-accent bg-accent-soft'
                : 'border-transparent hover:border-border hover:bg-surface',
            )}
          >
            <div className="flex flex-col">
              <span className="font-sans text-sm text-ink">{entry.family}</span>
              <span className="font-mono text-2xs uppercase tracking-[0.18em] text-muted">
                {entry.group}
              </span>
            </div>
            {active ? (
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-pill bg-accent"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeTab;
