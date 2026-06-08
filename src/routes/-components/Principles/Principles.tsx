import { type FC } from 'react';
import { m, useReducedMotion } from 'motion/react';
import {
  landingPrinciples,
  principleContainerVariants,
  easeOutExpo,
} from '@/constants';

const Principles: FC = () => {
  const reducedMotion = useReducedMotion();
  const initial = reducedMotion ? false : 'hidden';

  return (
    <section
      id="principles"
      className="border-t border-border/80 px-6 py-28 sm:px-12 sm:py-40"
      aria-label="Design principles"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="max-w-[20ch]">
          <h2
            className="font-display font-medium text-ink text-balance"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              lineHeight: '0.98',
              letterSpacing: '-0.028em',
            }}
          >
            Three things{' '}
            <span className="italic font-normal text-accent-ink dark:text-accent">decided</span>{' '}
            upfront.
          </h2>
        </div>

        <ol className="mt-24 flex flex-col gap-20 sm:gap-32">
          {landingPrinciples.map((p, i) => (
            <m.li
              key={p.title}
              className="grid gap-x-12 gap-y-6 lg:grid-cols-[8rem_1fr_1fr] lg:items-start"
              initial={initial}
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={principleContainerVariants}
            >
              <m.span
                className="block font-display italic font-normal text-faint tabular-nums"
                style={{
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  lineHeight: '0.9',
                  letterSpacing: '-0.02em',
                  willChange: 'transform',
                }}
                variants={{
                  hidden: { scale: 0.94, x: 0 },
                  visible: {
                    scale: 1,
                    x: 0,
                    transition: { duration: 0.7, ease: easeOutExpo },
                  },
                }}
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </m.span>

              <m.h3
                className="font-display font-medium text-ink text-balance"
                style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)',
                  lineHeight: '1.05',
                  letterSpacing: '-0.022em',
                  willChange: 'transform',
                }}
                variants={{
                  hidden: { y: 8 },
                  visible: {
                    y: 0,
                    transition: { duration: 0.55, ease: easeOutExpo, delay: 0.08 },
                  },
                }}
              >
                {p.title}
              </m.h3>

              <m.p
                className="font-sans text-ink-soft text-pretty"
                style={{
                  fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
                  lineHeight: '1.62',
                  maxWidth: '52ch',
                  fontVariationSettings: '"wdth" 96',
                  willChange: 'transform',
                }}
                variants={{
                  hidden: { y: 6 },
                  visible: {
                    y: 0,
                    transition: { duration: 0.5, ease: easeOutExpo, delay: 0.16 },
                  },
                }}
              >
                {p.body}
              </m.p>
            </m.li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Principles;
