import { type FC } from 'react';
import { m } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { ctaArrowVariants, ctaButtonVariants } from '@/constants';

const Closing: FC = () => {
  return (
    <section
      className="relative border-t border-border/80 px-6 py-32 sm:px-12 sm:py-48 overflow-hidden"
      aria-label="Open the editor"
    >
      <div className="mx-auto max-w-[1280px] text-center">
        <h2
          className="font-display font-medium text-ink mx-auto text-balance"
          style={{
            fontSize: 'clamp(3rem, 7.5vw, 6.5rem)',
            lineHeight: '0.96',
            letterSpacing: '-0.035em',
            maxWidth: '22ch',
          }}
        >
          Whatever Monday brings, you can{' '}
          <span className="italic font-normal text-accent-ink dark:text-accent">apply</span>{' '}
          tonight.
        </h2>

        <div className="mt-16 inline-flex flex-col items-center gap-6">
          <m.a
            href="/app"
            className="group inline-flex h-14 items-center gap-3 rounded-sm bg-ink px-8 text-lg font-medium text-bg shadow-2 focus-visible:outline-none"
            variants={ctaButtonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="pressed"
            style={{ willChange: 'transform' }}
          >
            <span className="transition-colors duration-fast ease-out-quart">
              Open the editor
            </span>
            <m.span
              aria-hidden
              className="inline-flex"
              variants={ctaArrowVariants}
              style={{ willChange: 'transform' }}
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={24} strokeWidth={1.5} />
            </m.span>
          </m.a>
          <p className="font-mono text-xs tabular-nums text-muted">
            No sign-up. No email. Just the tool.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Closing;
