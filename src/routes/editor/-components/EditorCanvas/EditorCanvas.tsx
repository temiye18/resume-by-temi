import { type FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import { useResumeStore } from '@/store/resumeStore';
import { resumeToFixture } from '@/helpers';
import { useIsDesktop } from '@/hooks/useIsDesktop';

const CANVAS_NATURAL_WIDTH = 820;

const EditorCanvas: FC = () => {
  const resume = useResumeStore((s) => s.resume);
  const templateId = useResumeStore((s) => s.templateId);
  const accentColor = useResumeStore((s) => s.theme.accentColor);
  const headingFont = useResumeStore((s) => s.theme.headingFont);
  const bodyFont = useResumeStore((s) => s.theme.bodyFont);
  const typeScale = useResumeStore((s) => s.theme.typeScale);
  const lineHeight = useResumeStore((s) => s.theme.lineHeight);
  const fixture = resumeToFixture(resume);
  const isDesktop = useIsDesktop();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [paperHeight, setPaperHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (isDesktop) {
      setScale(1);
      return;
    }
    const node = wrapperRef.current;
    if (!node) return;
    const compute = () => {
      const w = node.clientWidth;
      const target = w - 24;
      setScale(Math.min(1, target / CANVAS_NATURAL_WIDTH));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(node);
    return () => ro.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop) return;
    const node = paperRef.current;
    if (!node) return;
    const update = () => setPaperHeight(node.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, [isDesktop, templateId, resume]);

  if (!isDesktop) {
    return (
      <div ref={wrapperRef} className="relative h-full overflow-y-auto scrollbar-slim bg-bg">
        <div className="px-3 pt-4 pb-10">
          <div
            className="mx-auto"
            style={{
              width: CANVAS_NATURAL_WIDTH * scale,
              height: paperHeight ? paperHeight * scale : undefined,
            }}
          >
            <div
              ref={paperRef}
              className="origin-top-left shadow-canvas rounded-canvas overflow-hidden bg-resume-paper"
              style={{
                width: CANVAS_NATURAL_WIDTH,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                outline: '1px solid oklch(1 0 0 / 0.04)',
                outlineOffset: '-1px',
              }}
            >
              <ResumePreview
                variant={templateId}
                resume={fixture}
                accentColor={accentColor}
                headingFont={headingFont}
                bodyFont={bodyFont}
                typeScale={typeScale}
                lineHeight={lineHeight}
                interactive={false}
              />
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-2xs tabular-nums text-muted">
            {resume['x-builder'].paperSize === 'A4' ? 'A4' : 'letter'} · 1 of 1
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto scrollbar-slim bg-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, oklch(0 0 0 / 0.05) 0%, oklch(0 0 0 / 0) 70%)',
        }}
      />
      <div className="relative mx-auto max-w-[820px] px-8 py-12 sm:px-12 sm:py-16">
        <div
          className="mx-auto shadow-canvas rounded-canvas overflow-hidden bg-resume-paper"
          style={{
            outline: '1px solid oklch(1 0 0 / 0.04)',
            outlineOffset: '-1px',
          }}
        >
          <ResumePreview
            variant={templateId}
            resume={fixture}
            accentColor={accentColor}
            headingFont={headingFont}
            bodyFont={bodyFont}
            typeScale={typeScale}
            lineHeight={lineHeight}
          />
        </div>

        <div className="mt-6 flex items-center justify-between font-mono text-2xs tabular-nums text-muted">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-px w-4 border-t border-dashed border-border-strong"
            />
            page break · {resume['x-builder'].paperSize === 'A4' ? 'A4' : 'letter'}
          </span>
          <span>1 of 1</span>
        </div>
      </div>
    </div>
  );
};

export default EditorCanvas;
