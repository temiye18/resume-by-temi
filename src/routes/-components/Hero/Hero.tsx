import { type FC, Fragment, useEffect, useMemo, useState } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import {
  heroFadeUpVariants,
  ctaArrowVariants,
  ctaButtonVariants,
  easeOutExpo,
  heroHeadlineParts,
  heroTypewriterCharMs,
  heroTypewriterStartDelayMs,
} from '@/constants';
import ResumeStack from './ResumeStack';

interface IFlatChar {
  char: string;
  italic: boolean;
}

interface ITypewriterCursorProps {
  blinking: boolean;
}

const TypewriterCursor: FC<ITypewriterCursorProps> = ({ blinking }) => (
  <span
    aria-hidden
    className={cn(
      'inline-block align-baseline bg-accent translate-y-[0.08em]',
      'h-[0.78em] w-[3px]',
      blinking && 'animate-cursor-blink',
    )}
  />
);

const Hero: FC = () => {
  const reducedMotion = useReducedMotion();

  const flatChars = useMemo<IFlatChar[]>(
    () =>
      heroHeadlineParts.flatMap((part) =>
        Array.from(part.text).map((ch) => ({ char: ch, italic: part.italic })),
      ),
    [],
  );

  const totalChars = flatChars.length;
  const fullHeadlineText = heroHeadlineParts.map((p) => p.text).join('');

  const [typed, setTyped] = useState(() => (reducedMotion ? totalChars : 0));
  const isDone = typed >= totalChars;

  useEffect(() => {
    if (reducedMotion) {
      setTyped(totalChars);
      return;
    }
    const start = performance.now();
    let frameId = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const effective = Math.max(0, elapsed - heroTypewriterStartDelayMs);
      const next = Math.min(totalChars, Math.floor(effective / heroTypewriterCharMs));
      setTyped(next);
      if (next < totalChars) {
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [totalChars, reducedMotion]);

  const totalTypingMs = heroTypewriterStartDelayMs + totalChars * heroTypewriterCharMs;
  const tailDelayBase = reducedMotion ? 0 : totalTypingMs / 1000;

  const initial = reducedMotion ? false : 'hidden';

  return (
    <section
      className="relative overflow-hidden px-6 pt-16 pb-20 sm:px-12 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36"
      aria-label="Introduction"
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-x-12 gap-y-16 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="order-1">
          <h1
            className="font-display font-medium text-ink text-balance"
            style={{
              fontSize: 'clamp(3rem, 6.4vw, 6rem)',
              lineHeight: '0.94',
              letterSpacing: '-0.038em',
              maxWidth: '12ch',
            }}
            aria-label={fullHeadlineText}
          >
            {flatChars.map(({ char, italic }, i) => (
              <Fragment key={i}>
                {i === typed && !isDone ? <TypewriterCursor blinking={false} /> : null}
                <span
                  aria-hidden
                  className={cn(
                    'typewriter-char',
                    italic && 'italic font-normal text-accent-ink dark:text-accent',
                    i >= typed && 'opacity-0',
                  )}
                >
                  {char}
                </span>
              </Fragment>
            ))}
            {isDone ? <TypewriterCursor blinking={true} /> : null}
          </h1>

          <m.div
            className="mt-10 flex flex-col gap-8"
            initial={initial}
            animate="visible"
            variants={heroFadeUpVariants}
            transition={{ delay: tailDelayBase + 0.1, duration: 0.6, ease: easeOutExpo }}
          >
            <p
              className="font-sans text-ink-soft text-pretty"
              style={{
                fontSize: 'clamp(1.0625rem, 1.3vw, 1.1875rem)',
                lineHeight: '1.55',
                maxWidth: '46ch',
                fontVariationSettings: '"wdth" 96',
              }}
            >
              No account, no watermark, no export paywall. The PDFs you download parse cleanly in
              every major Applicant Tracking System, and still look like you spent a Saturday on
              them. The editor runs entirely in your browser.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <m.a
                href="/app"
                className="group inline-flex h-12 items-center gap-2.5 rounded-sm bg-ink px-6 text-base font-medium text-bg shadow-1 will-change-transform focus-visible:outline-none"
                variants={ctaButtonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="pressed"
              >
                <span className="transition-colors duration-fast ease-out-quart">
                  Open the editor
                </span>
                <m.span
                  aria-hidden
                  className="inline-flex will-change-transform"
                  variants={ctaArrowVariants}
                >
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={22} strokeWidth={1.5} />
                </m.span>
              </m.a>
              <a
                href="#templates"
                className="inline-flex h-12 items-center px-1 text-base font-medium text-ink-soft underline underline-offset-[6px] decoration-1 decoration-border-strong transition-colors duration-fast ease-out-quart hover:text-ink hover:decoration-ink focus-visible:outline-none"
              >
                See the templates
              </a>
            </div>
          </m.div>

          <m.p
            className="mt-14 flex items-center gap-3 font-mono text-xs tabular-nums text-muted"
            initial={initial}
            animate="visible"
            variants={heroFadeUpVariants}
            transition={{ delay: tailDelayBase + 0.32, duration: 0.55, ease: easeOutExpo }}
          >
            <span className="inline-block h-px w-10 bg-border-strong" aria-hidden />
            <span>52 KB · works offline · no tracking</span>
          </m.p>
        </div>

        <div className="order-2 lg:pl-4">
          <ResumeStack startDelay={reducedMotion ? 0 : 0.45} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
