import type { IPrinciple } from '@/interfaces/i-principle';

export const landingPrinciples: IPrinciple[] = [
  {
    title: 'The work is the brand.',
    body: 'There are no marketing illustrations next to the product screenshots. The product screenshot is the marketing. The landing page you are reading right now is a working editor pulled in below; the dashboard you reach after clicking through is the same surface, populated with what you build.',
  },
  {
    title: 'Architectural, not decorative.',
    body: 'Pure white in light mode, pure neutral near-black in dark mode. No tinted backgrounds, no glassmorphism, no gradients smuggled in to add interest. Warmth and identity live in a single deeply considered amber, used the way an editor uses a red pencil: rarely, always meaningfully.',
  },
  {
    title: 'Quiet motion, loaded with meaning.',
    body: "The page does not perform on load. Buttons do not bounce. The product's motion is reserved for moments that carry real information: autosave completing, the ATS-check ritual finishing, a template change crossfading into place. When motion appears, you notice, because it is rare.",
  },
];
