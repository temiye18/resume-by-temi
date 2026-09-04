import { type FC, useRef } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import { cn } from '@/lib/cn';
import { tileNumberVariants, galleryTileVariants, easeOutExpo, templateDefaults } from '@/constants';
import type { ResumeVariant } from '@/types/resume-variant-type';

interface ITemplateTileProps {
  variant: ResumeVariant;
  name: string;
  caption: string;
  index: number;
}

const TemplateTile: FC<ITemplateTileProps> = ({ variant, name, caption, index }) => {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const depth = index % 2 === 0 ? 54 : 30;
  const parallaxY = useTransform(scrollYProgress, [0, 1], [depth, -depth]);

  return (
    <m.div
      ref={ref}
      variants={galleryTileVariants}
      style={{ willChange: 'transform, opacity' }}
    >
      <m.div style={reduce ? undefined : { y: parallaxY }}>
      <m.a
        href={`/templates/${variant}`}
        className="group block focus-visible:outline-none"
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
      >
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <m.span
            className="font-display italic font-normal text-faint tabular-nums"
            style={{
              fontSize: 'clamp(1.5rem, 2vw, 2rem)',
              lineHeight: '1',
              letterSpacing: '-0.015em',
              willChange: 'transform',
            }}
            variants={tileNumberVariants}
            aria-hidden
          >
            {String(index).padStart(2, '0')}
          </m.span>
          <span className="font-mono text-2xs uppercase tracking-[0.2em] text-muted">
            {variant.replace('-', ' · ')}
          </span>
        </div>

        <m.div
          className={cn(
            'relative overflow-hidden rounded-canvas bg-surface-sunk',
            'shadow-2 group-hover:shadow-3 transition-shadow duration-base ease-out-quart',
            'group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2',
          )}
          style={{
            aspectRatio: '8.5 / 11',
            outline: '1px solid oklch(1 0 0 / 0.04)',
            outlineOffset: '-1px',
          }}
        >
          <m.div
            aria-hidden
            className="absolute inset-0 origin-center"
            style={{
              transform: 'scale(0.85)',
              width: '117.6%',
              height: '117.6%',
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
            variants={{
              rest: { scale: 0.85 },
              hover: {
                scale: 0.88,
                transition: { duration: 0.55, ease: easeOutExpo },
              },
            }}
          >
            <ResumePreview
              variant={variant}
              interactive={false}
              headingFont={templateDefaults[variant].headingFont}
              bodyFont={templateDefaults[variant].bodyFont}
            />
          </m.div>
        </m.div>

        <div className="mt-6 flex flex-col gap-2.5">
          <h3
            className="font-display font-medium text-ink transition-colors duration-base ease-out-quart group-hover:text-accent-ink dark:group-hover:text-accent"
            style={{
              fontSize: 'clamp(1.75rem, 2.6vw, 2.25rem)',
              lineHeight: '1.05',
              letterSpacing: '-0.022em',
            }}
          >
            {name}
          </h3>
          <p
            className="font-sans text-ink-soft text-pretty"
            style={{
              fontSize: '1.0625rem',
              lineHeight: '1.5',
              maxWidth: '42ch',
              fontVariationSettings: '"wdth" 96',
            }}
          >
            {caption}
          </p>
        </div>
      </m.a>
      </m.div>
    </m.div>
  );
};

export default TemplateTile;
