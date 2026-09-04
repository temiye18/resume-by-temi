import { type FC, useRef, useState } from 'react';
import { m, useInView, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import {
  editorSidebarTabs,
  editorSectionSummaries,
  canvasLiftVariants,
} from '@/constants';

const EditorPreview: FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const inView = useInView(canvasRef, { once: true, margin: '-15% 0px -15% 0px' });
  const reducedMotion = useReducedMotion();
  const [cursorActive, setCursorActive] = useState(false);

  const { scrollYProgress } = useScroll({
    target: deviceRef,
    offset: ['start end', 'center center'],
  });
  const deviceScale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const deviceY = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const deviceOpacity = useTransform(scrollYProgress, [0, 0.55], [0.3, 1]);

  return (
    <section className="px-6 sm:px-10" aria-label="Live editor preview">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <p className="font-mono text-xs tabular-nums text-muted">
            <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] mr-2 rounded-pill bg-accent align-middle animate-soft-pulse" />
            live · this is the editor
          </p>
          <p className="hidden font-mono text-xs tabular-nums text-muted sm:block">
            jane-doe.resume · letter · saved just now
          </p>
        </div>

        <m.div
          ref={deviceRef}
          className="relative overflow-hidden rounded-lg border border-border bg-surface shadow-3 will-change-transform"
          style={
            reducedMotion
              ? undefined
              : { scale: deviceScale, y: deviceY, opacity: deviceOpacity, transformOrigin: 'center 40%' }
          }
        >
          <div className="flex h-12 items-center justify-between border-b border-border bg-surface-sunk px-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-pill bg-faint" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-pill bg-faint" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-pill bg-faint" aria-hidden />
              </div>
              <p className="font-sans text-sm font-medium text-ink-soft">
                Jane Doe — Senior Engineer
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="hidden font-mono text-xs tabular-nums text-muted sm:block">
                <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] mr-1.5 rounded-pill bg-accent" />
                Saved just now
              </p>
              <span className="inline-flex h-7 items-center rounded-sm bg-accent px-2.5 text-xs font-medium text-accent-on">
                Download
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[200px_1fr] sm:grid-cols-[260px_1fr]">
            <aside className="border-r border-border bg-surface-sunk/40">
              <div className="border-b border-border/60 p-3">
                <div className="flex flex-col gap-1">
                  {editorSidebarTabs.map(({ icon, label, active }) => (
                    <div
                      key={label}
                      className={
                        active
                          ? 'relative flex items-center gap-2.5 rounded-sm bg-bg px-2.5 py-2 text-sm font-medium text-ink shadow-1'
                          : 'flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-ink-soft'
                      }
                    >
                      {active ? (
                        <span
                          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-pill bg-accent"
                          aria-hidden
                        />
                      ) : null}
                      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3">
                <p className="px-1.5 pb-2 font-mono text-2xs uppercase tracking-[0.18em] text-muted">
                  Sections
                </p>
                <ul className="flex flex-col gap-0.5">
                  {editorSectionSummaries.map((s, i) => (
                    <li
                      key={s.name}
                      className={
                        i === 2
                          ? 'flex items-baseline justify-between rounded-sm bg-bg px-2.5 py-1.5 text-sm text-ink shadow-1'
                          : 'flex items-baseline justify-between rounded-sm px-2.5 py-1.5 text-sm text-ink-soft hover:bg-bg/40'
                      }
                    >
                      <span>{s.name}</span>
                      <span className="font-mono text-2xs tabular-nums text-muted">{s.hint}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-border px-2.5 py-1.5 text-xs text-muted transition-colors duration-fast ease-out-quart hover:border-border-strong hover:text-ink-soft"
                >
                  <HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={1.5} />
                  Add section
                </button>
              </div>

              <div className="border-t border-border/60 p-3">
                <p className="px-1.5 pb-2 font-mono text-2xs uppercase tracking-[0.18em] text-muted">
                  Theme
                </p>
                <div className="flex items-center gap-1.5 px-1.5">
                  <button
                    type="button"
                    aria-label="Amber accent (active)"
                    className="h-5 w-5 rounded-pill ring-2 ring-offset-2 ring-offset-surface-sunk ring-accent"
                    style={{ backgroundColor: 'oklch(0.585 0.15 62)' }}
                  />
                  <button
                    type="button"
                    aria-label="Slate accent"
                    className="h-5 w-5 rounded-pill"
                    style={{ backgroundColor: 'oklch(0.45 0.04 240)' }}
                  />
                  <button
                    type="button"
                    aria-label="Forest accent"
                    className="h-5 w-5 rounded-pill"
                    style={{ backgroundColor: 'oklch(0.45 0.12 145)' }}
                  />
                  <button
                    type="button"
                    aria-label="Ink accent"
                    className="h-5 w-5 rounded-pill"
                    style={{ backgroundColor: 'oklch(0.18 0 0)' }}
                  />
                  <button
                    type="button"
                    aria-label="Editorial accent"
                    className="h-5 w-5 rounded-pill"
                    style={{ backgroundColor: 'oklch(0.5 0.18 25)' }}
                  />
                </div>
              </div>
            </aside>

            <div className="relative bg-bg p-6 sm:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                aria-hidden
                style={{
                  background:
                    'radial-gradient(ellipse 70% 50% at 50% 60%, oklch(0 0 0 / 0.06) 0%, oklch(0 0 0 / 0) 70%)',
                }}
              />
              <m.div
                ref={canvasRef}
                className="relative mx-auto max-w-[440px] shadow-canvas rounded-canvas"
                style={{
                  outline: '1px solid oklch(1 0 0 / 0.04)',
                  outlineOffset: '-1px',
                  willChange: 'transform, opacity',
                }}
                initial={reducedMotion ? false : 'hidden'}
                animate={inView ? 'visible' : 'hidden'}
                variants={canvasLiftVariants}
                onAnimationComplete={() => setCursorActive(true)}
              >
                <ResumePreview
                  variant="modern-minimal"
                  showCursor
                  cursorActive={cursorActive || !!reducedMotion}
                />
              </m.div>

              <div className="relative mt-4 flex items-center justify-between font-mono text-2xs tabular-nums text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-1 w-3 border-t border-dashed border-border-strong" />
                  page break · letter
                </span>
                <span>1 of 1</span>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default EditorPreview;
