import type { ITemplateTile } from '@/interfaces/i-template-tile';

export const templateTiles: ITemplateTile[] = [
  {
    variant: 'modern-minimal',
    name: 'Modern Minimal',
    caption: 'Generous whitespace, weight-based hierarchy, no rules. The default.',
  },
  {
    variant: 'classic-serif',
    name: 'Classic Serif',
    caption: 'Centered name, small-caps headings with rules. For consulting, law, finance.',
  },
  {
    variant: 'tech-sans',
    name: 'Tech Sans',
    caption: 'Left-aligned name with an accent underline. For engineers, PMs, designers.',
  },
  {
    variant: 'executive',
    name: 'Executive',
    caption: 'Larger name, tighter density, thick accent rule. For 15+ years.',
  },
  {
    variant: 'compact',
    name: 'Compact',
    caption: 'Tighter rhythm, more sections per page. For students and early career.',
  },
  {
    variant: 'editorial',
    name: 'Editorial',
    caption: 'Large two-line name, accent stripe on headings. For creative roles.',
  },
  {
    variant: 'geometric',
    name: 'Geometric',
    caption: 'Geometric sans, generous air, wide-tracked labels. For product and design.',
  },
  {
    variant: 'standard',
    name: 'Standard',
    caption: 'Neutral Swiss grid with full-width rules. For engineering, finance, ops.',
  },
  {
    variant: 'broadsheet',
    name: 'Broadsheet',
    caption: 'Modern editorial serif, hairline headings. For writers, comms, academia.',
  },
  {
    variant: 'warmth',
    name: 'Warmth',
    caption: 'Humanist and approachable, softer rhythm. For education, health, non-profit.',
  },
  {
    variant: 'refined',
    name: 'Refined',
    caption: 'Elegant high-contrast serif, quietly premium. For law and senior roles.',
  },
];
