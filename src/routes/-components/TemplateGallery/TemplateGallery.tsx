import { type FC } from 'react';
import TemplateTile from '../TemplateTile/TemplateTile';
import { templateTiles } from '@/constants';

const TemplateGallery: FC = () => {
  return (
    <section
      id="templates"
      className="border-t border-border/80 px-6 py-28 sm:px-12 sm:py-40"
      aria-label="Template gallery"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:items-end">
          <div className="max-w-[28ch]">
            <h2
              className="font-display font-medium text-ink text-balance"
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                lineHeight: '0.98',
                letterSpacing: '-0.028em',
              }}
            >
              <span className="italic font-normal text-accent-ink dark:text-accent">Six</span>{' '}
              places to start.
            </h2>
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
            Every template renders the same JSON document. You can switch between them inside the
            editor at any time without losing a single line. Each one is tested against the
            ATS-compliance audit, so the worst-case rendering is still parseable.
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-x-12 gap-y-20 sm:grid-cols-2 sm:gap-x-16 sm:gap-y-24">
          {templateTiles.map((tile, i) => (
            <TemplateTile key={tile.variant} index={i + 1} {...tile} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplateGallery;
