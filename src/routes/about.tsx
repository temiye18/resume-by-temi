import { type FC } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import SiteHeader from '@/components/SiteHeader/SiteHeader';
import SiteFooter from '@/components/SiteFooter/SiteFooter';

const AboutPage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <SiteHeader />
      <main className="flex-1 px-6 py-20 sm:px-12 sm:py-32">
        <div className="mx-auto max-w-[1280px]">
          <h1
            className="font-display font-medium text-ink text-balance"
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              lineHeight: '0.98',
              letterSpacing: '-0.028em',
              maxWidth: '20ch',
            }}
          >
            One{' '}
            <span className="italic font-normal text-accent-ink dark:text-accent">person</span>{' '}
            built this.
          </h1>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">About</p>
            <div
              className="flex flex-col gap-6 font-sans text-ink-soft text-pretty"
              style={{
                fontSize: 'clamp(1rem, 1.2vw, 1.125rem)',
                lineHeight: '1.65',
                maxWidth: '60ch',
                fontVariationSettings: '"wdth" 96',
              }}
            >
              <p>
                Most free resume builders are loss-leaders for a paid product. They show you a
                pretty preview and lock the PDF download behind a sign-up wall, then quietly send
                your resume content to their backend so they can email you about job listings.
              </p>
              <p>
                This one was built by one person who wanted a resume builder for themselves and
                couldn't find one that respected the document. Source Serif and Vollkorn on the
                page, single-column ATS-safe vector PDFs out, no account, no servers, no
                trackers, no upsell.
              </p>
              <p>
                The code is open source. The design decisions are documented in DESIGN.md. The
                ATS-compliance rules are documented in ATS-COMPLIANCE.md. The architecture is
                documented in SPEC.md. If you want to fork it, you have everything you need.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export const Route = createFileRoute('/about')({
  component: AboutPage,
});
