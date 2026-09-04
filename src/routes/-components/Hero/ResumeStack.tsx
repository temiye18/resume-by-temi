import { type FC, type PointerEvent, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/cn';
import { heroResumeCards } from '@/constants';
import type { IHeroResumeCard } from '@/interfaces/i-hero-resume-card';

gsap.registerPlugin(ScrollTrigger);

interface IRest {
  rotate: number;
  x: number;
  y: number;
  z: number;
  zi: number;
}

// Fanned resting pose per card, with real Z-depth: dark sheet back-left, light back-right, front pulled forward.
const REST: IRest[] = [
  { rotate: -11, x: -92, y: 30, z: -150, zi: 10 },
  { rotate: 9, x: 98, y: 52, z: -70, zi: 20 },
  { rotate: -2.5, x: 6, y: 0, z: 96, zi: 30 },
];

interface IBarProps {
  className: string;
  w: string;
  h?: string;
}

const Bar: FC<IBarProps> = ({ className, w, h = 'h-1.5' }) => (
  <span className={cn('block rounded-full', h, w, className)} aria-hidden />
);

interface IEntryProps {
  bar: string;
  faint: string;
  accentTitle?: boolean;
}

const Entry: FC<IEntryProps> = ({ bar, faint, accentTitle }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-3">
      <Bar className={accentTitle ? 'bg-accent' : bar} w="w-2/5" h="h-2" />
      <Bar className={faint} w="w-1/6" />
    </div>
    <Bar className={faint} w="w-full" />
    <Bar className={faint} w="w-5/6" />
  </div>
);

const ResumeSheet: FC<{ card: IHeroResumeCard }> = ({ card }) => {
  const dark = card.tone === 'dark';
  const bg = dark ? 'bg-paper-dark' : 'bg-paper';
  const nameCls = dark ? 'text-paper-dark-ink' : 'text-paper-ink';
  const roleCls = dark ? 'text-paper-dark-soft' : 'text-paper-soft';
  const line = dark ? 'bg-paper-dark-line' : 'bg-paper-line';
  const bar = dark ? 'bg-paper-dark-line' : 'bg-paper-line';
  const faint = dark ? 'bg-paper-dark-line/60' : 'bg-paper-faint';

  return (
    <div
      className={cn('flex h-full w-full flex-col gap-3.5 rounded-[3px] p-5 shadow-3', bg)}
      style={dark ? undefined : { outline: '1px solid oklch(0 0 0 / 0.06)', outlineOffset: '-1px' }}
    >
      <div className="flex flex-col gap-1">
        <span className={cn('font-sans text-[15px] font-semibold leading-tight tracking-tight', nameCls)}>
          {card.name}
        </span>
        <span className={cn('font-sans text-[10px] font-medium', roleCls)}>{card.role}</span>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Bar className={faint} w="w-8" h="h-1" />
          <Bar className={faint} w="w-10" h="h-1" />
          <Bar className={faint} w="w-6" h="h-1" />
        </div>
      </div>

      <div className={cn('h-px w-full', line)} />

      <div className="flex flex-col gap-2.5">
        <span className={cn('font-mono text-[8px] uppercase tracking-[0.22em]', roleCls)}>
          Experience
        </span>
        <Entry bar={bar} faint={faint} accentTitle={card.accent} />
        <Entry bar={bar} faint={faint} />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <span className={cn('font-mono text-[8px] uppercase tracking-[0.22em]', roleCls)}>
          Skills
        </span>
        <div className="flex flex-wrap gap-1.5">
          <Bar className={faint} w="w-10" h="h-2.5" />
          <Bar className={faint} w="w-8" h="h-2.5" />
          <Bar className={faint} w="w-12" h="h-2.5" />
          <Bar className={faint} w="w-9" h="h-2.5" />
        </div>
      </div>
    </div>
  );
};

type QuickTo = ReturnType<typeof gsap.quickTo>;

const ResumeStack: FC<{ startDelay?: number }> = ({ startDelay = 0.45 }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tiltY = useRef<QuickTo | null>(null);
  const tiltX = useRef<QuickTo | null>(null);

  // GSAP + ScrollTrigger is an external animation system; an effect is the correct boundary to drive it.
  useEffect(() => {
    const wrap = wrapRef.current;
    const scene = sceneRef.current;
    if (!wrap || !scene) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.hero-card');
      cards.forEach((el, i) => {
        const r = REST[i] ?? REST[0];
        gsap.set(el, {
          rotateZ: r.rotate,
          x: r.x,
          y: r.y,
          z: r.z,
          zIndex: r.zi,
          transformPerspective: 1000,
        });
      });

      if (reduce) return;

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      cards.forEach((el, i) => {
        const r = REST[i] ?? REST[0];
        tl.from(
          el,
          {
            autoAlpha: 0,
            y: r.y + 128,
            z: r.z - 380,
            rotateZ: r.rotate + (i - 1) * 10,
            duration: 1.2,
          },
          startDelay + i * 0.13,
        );
      });

      gsap.to(scene, {
        y: -72,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top 18%',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      tiltY.current = gsap.quickTo(scene, 'rotationY', { duration: 0.8, ease: 'power3.out' });
      tiltX.current = gsap.quickTo(scene, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    }, wrapRef);

    return () => ctx.revert();
  }, [startDelay]);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap || !tiltY.current) return;
    const rect = wrap.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.current(nx * 28);
    tiltX.current?.(-ny * 19);
  };
  const reset = () => {
    tiltY.current?.(0);
    tiltX.current?.(0);
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className="relative mx-auto h-[clamp(400px,52vw,520px)] w-full max-w-[520px] [perspective:1100px]"
      aria-hidden
    >
      <div ref={sceneRef} className="absolute inset-0 [transform-style:preserve-3d]">
        {heroResumeCards.map((card) => (
          <div
            key={card.name}
            className="hero-card absolute inset-0 m-auto h-[clamp(300px,42vw,392px)] w-[clamp(224px,31vw,290px)] [backface-visibility:hidden] will-change-transform"
          >
            <ResumeSheet card={card} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeStack;
