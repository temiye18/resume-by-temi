import { type FC } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import SiteHeader from '@/components/SiteHeader/SiteHeader';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import TemplateTile from '@/routes/-components/TemplateTile/TemplateTile';
import { templateTiles } from '@/constants';

const TemplatesPage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <SiteHeader />
      <main className="flex-1 px-6 py-20 sm:px-12 sm:py-32">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:items-end">
            <div className="max-w-[28ch]">
              <h1
                className="font-display font-medium text-ink text-balance"
                style={{
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                  lineHeight: '0.98',
                  letterSpacing: '-0.028em',
                }}
              >
                <span className="italic font-normal text-accent-ink dark:text-accent">Eleven</span>{' '}
                templates.
              </h1>
            </div>
            <p
              className="font-sans text-ink-soft text-pretty"
              style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
                lineHeight: '1.6',
                maxWidth: '52ch',
                fontVariationSettings: '"wdth" 96',
              }}
            >
              Every template renders the same JSON document. They are tested against the same
              ATS-compliance audit. The only difference is how a person reads them.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-x-12 gap-y-20 sm:grid-cols-2 sm:gap-x-16 sm:gap-y-24">
            {templateTiles.map((tile, i) => (
              <TemplateTile key={tile.variant} index={i + 1} {...tile} />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export const Route = createFileRoute('/templates/')({
  component: TemplatesPage,
});
