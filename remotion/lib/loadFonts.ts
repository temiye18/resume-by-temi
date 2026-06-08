import { continueRender, delayRender, staticFile } from 'remotion';

let registered = false;

export const loadFonts = (): void => {
  if (registered) return;
  registered = true;

  const handle = delayRender('loading fonts');

  const faces = [
    new FontFace(
      'Vollkorn Variable',
      `url('https://cdn.jsdelivr.net/fontsource/fonts/vollkorn:vf@latest/latin-wght-normal.woff2')`,
      { weight: '400 900', style: 'normal' },
    ),
    new FontFace(
      'Vollkorn Variable',
      `url('https://cdn.jsdelivr.net/fontsource/fonts/vollkorn:vf@latest/latin-wght-italic.woff2')`,
      { weight: '400 900', style: 'italic' },
    ),
    new FontFace(
      'Bricolage Grotesque Variable',
      `url('https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque:vf@latest/latin-wght-normal.woff2')`,
      { weight: '200 800', style: 'normal' },
    ),
    new FontFace(
      'Geist Mono Variable',
      `url('https://cdn.jsdelivr.net/fontsource/fonts/geist-mono:vf@latest/latin-wght-normal.woff2')`,
      { weight: '100 900', style: 'normal' },
    ),
  ];

  Promise.all(
    faces.map(async (face) => {
      const loaded = await face.load();
      document.fonts.add(loaded);
    }),
  )
    .catch(() => {
      /* font failure is non-fatal — fall back to system */
    })
    .finally(() => continueRender(handle));

  // staticFile reference keeps Remotion from tree-shaking the import.
  void staticFile;
};
