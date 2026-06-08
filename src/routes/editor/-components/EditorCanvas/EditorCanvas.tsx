import { type FC } from 'react';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import { useResumeStore } from '@/store/resumeStore';
import { resumeToFixture } from '@/helpers';

const EditorCanvas: FC = () => {
  const resume = useResumeStore((s) => s.resume);
  const templateId = useResumeStore((s) => s.templateId);
  const accentColor = useResumeStore((s) => s.theme.accentColor);
  const headingFont = useResumeStore((s) => s.theme.headingFont);
  const bodyFont = useResumeStore((s) => s.theme.bodyFont);
  const fixture = resumeToFixture(resume);

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
