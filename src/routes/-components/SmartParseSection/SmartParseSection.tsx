import { type FC, useEffect, useRef, useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AiParseShell from '@/components/AiParseLoader/AiParseShell';
import type { AiParseStage } from '@/types/ai-parse-stage-type';
import {
  sectionContainerVariants,
  sectionHeadingRevealVariants,
  sectionBodyRevealVariants,
} from '@/constants';

gsap.registerPlugin(ScrollTrigger);

const STAGE_CYCLE: { stage: AiParseStage; durationMs: number }[] = [
  { stage: 'uploaded', durationMs: 1400 },
  { stage: 'reading', durationMs: 3200 },
  { stage: 'extracting', durationMs: 4400 },
  { stage: 'done', durationMs: 1600 },
];

const VIEWPORT = { once: true, margin: '0px 0px -120px 0px' } as const;

const SmartParseSection: FC = () => {
  const reducedMotion = useReducedMotion() ?? false;
  const [cycleIndex, setCycleIndex] = useState(reducedMotion ? 2 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const next = (i: number) => {
      if (cancelled) return;
      setCycleIndex(i);
      const { durationMs } = STAGE_CYCLE[i];
      timeout = setTimeout(() => next((i + 1) % STAGE_CYCLE.length), durationMs);
    };
    next(0);
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [reducedMotion]);

  const panelRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger scrub is an external animation system; an effect is the correct boundary.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        panel,
        { rotationY: 17, y: 64, transformPerspective: 1300, transformOrigin: 'left center' },
        {
          rotationY: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top bottom', end: 'center center', scrub: 1 },
        },
      );
    });
    return () => mm.revert();
  }, []);

  const stage = STAGE_CYCLE[cycleIndex].stage;
  const initial = reducedMotion ? false : 'hidden';

  return (
    <m.section
      className="relative border-t border-border/80 px-6 py-32 sm:px-12 sm:py-40 overflow-hidden"
      aria-label="Smart parse — bring your existing résumé"
      initial={initial}
      whileInView="visible"
      viewport={VIEWPORT}
      variants={sectionContainerVariants}
    >
      <div className="mx-auto max-w-[1280px] grid gap-12 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] lg:gap-16">
        <div className="flex flex-col gap-7 lg:pt-4">
          <m.p
            className="font-mono text-2xs uppercase tracking-[0.24em] text-muted"
            variants={sectionHeadingRevealVariants}
          >
            Smart parse
          </m.p>
          <m.h2
            className="font-display font-medium text-ink text-balance"
            style={{
              fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
              lineHeight: '1.02',
              letterSpacing: '-0.028em',
              maxWidth: '18ch',
            }}
            variants={sectionHeadingRevealVariants}
          >
            Hand in the résumé you have.{' '}
            <span className="italic font-normal text-ink-soft">
              Open the one you can edit.
            </span>
          </m.h2>
          <m.div
            className="flex flex-col gap-5 text-pretty"
            variants={sectionBodyRevealVariants}
          >
            <p
              className="font-sans text-ink-soft"
              style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
                lineHeight: '1.6',
                maxWidth: '52ch',
              }}
            >
              Drop your PDF or DOCX on the dashboard. Gemini 2.5 Flash reads the layout,
              picks out your name, contact, every role with its dates and bullets, your
              schools, and every skill you've named anywhere in the document. The result
              lands in the editor for you to confirm. Usually under ten seconds.
            </p>
            <p
              className="font-sans text-ink-soft"
              style={{
                fontSize: 'clamp(0.95rem, 1.1vw, 1.0625rem)',
                lineHeight: '1.6',
                maxWidth: '52ch',
              }}
            >
              Files go through our Cloudflare proxy to Google. We log nothing on our
              side; the proxy holds the key, never the client.{' '}
              <a
                href="/privacy"
                className="text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                What we send, in plain words.
              </a>
            </p>
          </m.div>
          <m.dl
            className="grid grid-cols-3 gap-x-6 gap-y-3 border-t border-border/60 pt-6 font-mono text-2xs max-w-[44ch]"
            variants={sectionBodyRevealVariants}
          >
            <div className="flex flex-col gap-1">
              <dt className="text-muted">Reads</dt>
              <dd className="text-ink-soft">PDF · DOCX · TXT</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted">Returns</dt>
              <dd className="text-ink-soft">JSON résumé</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted">Fallback</dt>
              <dd className="text-ink-soft">Local parser</dd>
            </div>
          </m.dl>
        </div>

        <m.div
          className="relative [perspective:1300px]"
          variants={sectionBodyRevealVariants}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 rounded-[2rem]"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 40%, color-mix(in oklch, var(--color-accent) 8%, transparent), transparent 70%)',
            }}
            aria-hidden
          />
          <div ref={panelRef} className="relative [transform-style:preserve-3d] will-change-transform">
            <p className="mb-3 flex items-center justify-between font-mono text-2xs uppercase tracking-[0.24em] text-muted">
              <span>Live preview</span>
              <span className="inline-flex items-center gap-1.5 text-ink-soft">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-pill bg-accent"
                  style={{
                    boxShadow: reducedMotion
                      ? undefined
                      : '0 0 6px var(--color-accent), 0 0 10px var(--color-accent)',
                  }}
                />
                looping demo
              </span>
            </p>
            <AiParseShell
              stage={stage}
              fileName="your-old-resume.pdf"
              fileSize={184320}
            />
          </div>
        </m.div>
      </div>
    </m.section>
  );
};

export default SmartParseSection;
