import { type FC, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { LaptopIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Link } from '@tanstack/react-router';
import { useIsDesktop } from '@/hooks';
import Wordmark from '@/components/Wordmark/Wordmark';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

interface IMobileGuardProps {
  children: ReactNode;
}

const MobileGuard: FC<IMobileGuardProps> = ({ children }) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <Wordmark />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex max-w-[28rem] flex-col items-start text-left">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-border bg-surface text-ink-soft">
            <HugeiconsIcon icon={LaptopIcon} size={22} strokeWidth={1.5} />
          </span>

          <h1
            className="mt-8 font-display font-medium text-ink text-balance"
            style={{
              fontSize: 'clamp(2rem, 8vw, 2.75rem)',
              lineHeight: '1.02',
              letterSpacing: '-0.025em',
            }}
          >
            This editor is built for a{' '}
            <span className="italic font-normal text-accent-ink dark:text-accent">wider</span>{' '}
            screen.
          </h1>

          <p
            className="mt-6 font-sans text-ink-soft text-pretty"
            style={{
              fontSize: '1.0625rem',
              lineHeight: '1.55',
              fontVariationSettings: '"wdth" 96',
            }}
          >
            Open this URL on your laptop or desktop. Everything will be where you left it, the
            resume content stays on the device you typed it on.
          </p>

          <Link
            to="/"
            className="mt-10 inline-flex items-center gap-2 font-sans text-sm font-medium text-ink-soft underline underline-offset-4 decoration-1 decoration-border-strong transition-colors duration-fast ease-out-quart hover:text-ink hover:decoration-ink"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.5} />
            Back to the landing page
          </Link>

          <p className="mt-12 font-mono text-2xs uppercase tracking-[0.22em] text-muted">
            Mobile editing is planned for v2.0
          </p>
        </div>
      </main>
    </div>
  );
};

export default MobileGuard;
