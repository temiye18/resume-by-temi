import { type FC } from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import SiteHeader from '@/components/SiteHeader/SiteHeader';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import ResumePreview from '@/components/ResumePreview/ResumePreview';
import { templateTiles } from '@/constants';
import type { ResumeVariant } from '@/types/resume-variant-type';

const TemplateDetailPage: FC = () => {
  const { tile } = Route.useLoaderData();
  const variant = tile.variant as ResumeVariant;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <SiteHeader />
      <main className="flex-1 px-6 py-16 sm:px-12 sm:py-24">
        <div className="mx-auto max-w-[1280px]">
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 font-sans text-sm text-ink-soft transition-colors duration-fast ease-out-quart hover:text-ink"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
            All templates
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:items-start">
            <div>
              <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">
                {variant.replace('-', ' · ')}
              </p>
              <h1
                className="mt-4 font-display font-medium text-ink text-balance"
                style={{
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                  lineHeight: '0.98',
                  letterSpacing: '-0.028em',
                }}
              >
                {tile.name}
              </h1>
              <p
                className="mt-8 font-sans text-ink-soft text-pretty"
                style={{
                  fontSize: 'clamp(1.0625rem, 1.4vw, 1.25rem)',
                  lineHeight: '1.6',
                  maxWidth: '50ch',
                  fontVariationSettings: '"wdth" 96',
                }}
              >
                {tile.caption}
              </p>

              <Link
                to="/app"
                className="mt-12 inline-flex h-12 items-center gap-2.5 rounded-sm bg-ink px-6 text-base font-medium text-bg shadow-1 transition-[background-color,transform] duration-fast ease-out-quart hover:bg-accent active:translate-y-px focus-visible:outline-none"
              >
                Use this template
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={20} strokeWidth={1.5} />
              </Link>
            </div>

            <div
              className="shadow-canvas rounded-canvas overflow-hidden"
              style={{ outline: '1px solid oklch(1 0 0 / 0.04)', outlineOffset: '-1px' }}
            >
              <ResumePreview variant={variant} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export const Route = createFileRoute('/templates/$variant')({
  component: TemplateDetailPage,
  loader: ({ params }) => {
    const tile = templateTiles.find((t) => t.variant === params.variant);
    if (!tile) throw notFound();
    return { tile };
  },
});
