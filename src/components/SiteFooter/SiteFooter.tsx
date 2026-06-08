import { type FC } from 'react';

const SiteFooter: FC = () => {
  return (
    <footer
      className="border-t border-border/60 px-6 py-6 text-sm text-muted sm:px-10"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
        <p>
          Built by Temi. Open source.{' '}
          <a
            href="/privacy"
            className="text-ink-soft underline underline-offset-4 decoration-1 transition-colors duration-fast ease-out-quart hover:text-ink"
          >
            Privacy
          </a>
          .
        </p>
        <p className="font-mono text-xs text-muted tabular-nums">2026</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
