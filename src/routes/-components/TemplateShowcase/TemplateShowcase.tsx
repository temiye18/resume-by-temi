import { type FC, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import { useIsDesktop } from '@/hooks';
import { templateTiles } from '@/constants';
import type { ResumeVariant } from '@/types/resume-variant-type';

gsap.registerPlugin(ScrollTrigger);

interface IShowcaseCardProps {
  variant: ResumeVariant;
  name: string;
  caption: string;
}

const ShowcaseCard: FC<IShowcaseCardProps> = ({ variant, name, caption }) => (
  <div className="showcase-card relative w-[min(80vw,360px)] shrink-0 [backface-visibility:hidden] will-change-transform sm:w-[min(38vw,380px)]">
    <a href={`/templates/${variant}`} className="group block focus-visible:outline-none">
      <div className="mb-4">
        <span className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">
          {variant.replace('-', ' · ')}
        </span>
      </div>
      <div
        className="relative overflow-hidden rounded-canvas bg-surface-sunk shadow-3 group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2"
        style={{
          aspectRatio: '8.5 / 11',
          outline: '1px solid oklch(1 0 0 / 0.05)',
          outlineOffset: '-1px',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            transform: 'scale(0.85)',
            width: '117.6%',
            height: '117.6%',
            transformOrigin: 'center center',
          }}
        >
          <ResumePreview variant={variant} interactive={false} />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-1.5">
        <h3
          className="font-display font-medium text-ink transition-colors duration-base ease-out-quart group-hover:text-accent-ink dark:group-hover:text-accent"
          style={{ fontSize: 'clamp(1.5rem, 2.2vw, 1.875rem)', lineHeight: '1.05', letterSpacing: '-0.022em' }}
        >
          {name}
        </h3>
        <p
          className="font-sans text-ink-soft text-pretty"
          style={{ fontSize: '1rem', lineHeight: '1.5', maxWidth: '38ch', fontVariationSettings: '"wdth" 96' }}
        >
          {caption}
        </p>
      </div>
    </a>
  </div>
);

const TOTAL_LABEL = String(templateTiles.length).padStart(2, '0');

const TemplateShowcase: FC = () => {
  const reduce = useReducedMotion() ?? false;
  const isDesktop = useIsDesktop();
  const usePinnedScene = isDesktop && !reduce;
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  // GSAP ScrollTrigger pin + horizontal scrub is an external animation system; an effect is the correct boundary.
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || !usePinnedScene) return;

    const cards = gsap.utils.toArray<HTMLElement>('.showcase-card');
    let activeIndex = -1;

    const applyCoverflow = () => {
      const vpCenter = window.innerWidth / 2;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const d = gsap.utils.clamp(-1, 1, (cardCenter - vpCenter) / vpCenter);
        gsap.set(card, {
          rotationY: d * -40,
          scale: 1 - Math.abs(d) * 0.22,
          z: -Math.abs(d) * 280,
        });
      });
    };

    const updateCounter = (progress: number) => {
      const idx = Math.round(progress * (cards.length - 1));
      if (idx !== activeIndex && counterRef.current) {
        activeIndex = idx;
        counterRef.current.textContent = String(idx + 1).padStart(2, '0');
      }
    };

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            applyCoverflow();
            updateCounter(self.progress);
            if (fillRef.current) fillRef.current.style.transform = `scaleX(${self.progress})`;
            if (hintRef.current) hintRef.current.style.opacity = self.progress > 0.06 ? '0' : '1';
          },
          onRefresh: applyCoverflow,
        },
      });
      applyCoverflow();
    }, sectionRef);

    return () => ctx.revert();
  }, [usePinnedScene]);

  if (!usePinnedScene) {
    return (
      <div className="overflow-x-auto" aria-label="Template showcase">
        <div className="flex gap-10 px-6 pb-4 sm:px-12">
          {templateTiles.map((tile) => (
            <ShowcaseCard key={tile.variant} {...tile} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-bg [perspective:1600px]"
      aria-label="Template showcase"
    >
      <div
        ref={trackRef}
        className="flex h-full items-center gap-[4vw] px-[calc(50vw-min(40vw,190px))] [transform-style:preserve-3d] will-change-transform"
      >
        {templateTiles.map((tile) => (
          <ShowcaseCard key={tile.variant} {...tile} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center sm:bottom-10">
        <div className="flex items-center gap-4 font-mono text-2xs tracking-[0.2em] text-muted">
          <span className="tabular-nums text-ink-soft">
            <span ref={counterRef} className="text-accent">01</span> / {TOTAL_LABEL}
          </span>
          <span className="relative block h-px w-24 overflow-hidden bg-border-strong sm:w-32">
            <span
              ref={fillRef}
              className="absolute inset-0 origin-left bg-accent"
              style={{ transform: 'scaleX(0)' }}
            />
          </span>
          <span ref={hintRef} className="transition-opacity duration-300">keep scrolling</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateShowcase;
