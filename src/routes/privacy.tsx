import { type FC } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import SiteHeader from '@/components/SiteHeader/SiteHeader';
import SiteFooter from '@/components/SiteFooter/SiteFooter';

const PrivacyPage: FC = () => {
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
            Your resume{' '}
            <span className="italic font-normal text-accent-ink dark:text-accent">never</span>{' '}
            leaves your machine.
          </h1>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">
              Privacy policy
            </p>
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
                This is a fully client-side tool. Every keystroke you type into the editor is
                stored in your browser's IndexedDB. The PDF you download is rendered in the same
                browser tab. Nothing about the resume content, your name, your email, or any
                identifier is sent to our servers, because there are no servers.
              </p>
              <p>
                We use Cloudflare Web Analytics for page-view counting. It is cookieless and does
                not collect any personal information. We see "the landing page was visited 412
                times today" and nothing else — no IP, no fingerprint, no user agent stored.
              </p>
              <p>
                We do not use third-party trackers. No Google Analytics, no Mixpanel, no Segment,
                no Facebook Pixel, no advertising SDKs.
              </p>
              <p>
                You can delete every byte we know about you, on demand, with the "Delete all my
                data" button in the editor settings. It clears IndexedDB and OPFS for this origin.
                The next time you visit, you start from a blank canvas.
              </p>
              <p>
                If we ever introduce optional cloud sync, it will require an explicit account
                creation and a clear consent dialog explaining what gets stored on the server.
                Until then: your machine, your resume.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});
