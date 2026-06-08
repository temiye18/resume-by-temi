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
            The editor stays on{' '}
            <span className="italic font-normal text-accent-ink dark:text-accent">your</span>{' '}
            machine.
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
                identifier is sent to our servers from the editor, because the editor has no
                server side to send anything to.
              </p>
              <p>
                We use Cloudflare Web Analytics for page-view counting. It is cookieless and does
                not collect any personal information. We see "the landing page was visited 412
                times today" and nothing else: no IP, no fingerprint, no user agent stored.
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
            </div>
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">
              The Smart parse exception
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
                There is exactly one place in the product where résumé content leaves your
                browser, and it is opt-in: the Smart parse button on the dashboard's import
                card. When you choose Smart parse, the file you drop in (your old PDF or DOCX)
                is sent to Google's Gemini API so it can read the layout, headings, and dates
                and return structured fields. We never see the file ourselves; the call goes
                through a Cloudflare Pages Function that holds our API key and forwards your
                upload to Gemini.
              </p>
              <p>
                What gets sent: the file you chose, its filename, and its MIME type. What does
                not get sent: anything you've already typed into the editor, anything saved in
                IndexedDB, the names of your other résumés, your browser fingerprint. We do not
                log the upload or its response on our side; Google's retention policy applies to
                what they receive.
              </p>
              <p>
                If you'd rather not involve Gemini, the import card has a small secondary link
                that runs the parser entirely in your browser. It reads less accurately for
                complex layouts, but the file never leaves your machine. The choice is per
                upload, and it is always available without setup.
              </p>
            </div>
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <p className="font-mono text-2xs uppercase tracking-[0.22em] text-muted">
              What comes later
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
                If we ever introduce optional cloud sync, it will require an explicit account
                creation and a clear consent dialog explaining what gets stored on the server.
                Until then: your machine, your résumé.
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
