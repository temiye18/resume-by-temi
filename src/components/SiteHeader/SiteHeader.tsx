import { type FC } from 'react';
import Wordmark from '@/components/Wordmark/Wordmark';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

const SiteHeader: FC = () => {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/60 bg-bg/85 backdrop-blur-[2px]"
      role="banner"
    >
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-6 px-6 sm:px-10">
        <Wordmark />
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          <a
            href="#templates"
            className="text-sm text-ink-soft transition-colors duration-fast ease-out-quart hover:text-ink"
          >
            Templates
          </a>
          <a
            href="#ats"
            className="text-sm text-ink-soft transition-colors duration-fast ease-out-quart hover:text-ink"
          >
            How it parses
          </a>
          <a
            href="#principles"
            className="text-sm text-ink-soft transition-colors duration-fast ease-out-quart hover:text-ink"
          >
            Principles
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/app"
            className="hidden h-9 items-center rounded-sm border border-border px-3 text-sm font-medium text-ink transition-[background-color,border-color] duration-fast ease-out-quart hover:bg-surface hover:border-border-strong sm:inline-flex"
          >
            Open editor
          </a>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
