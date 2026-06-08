export const COLORS = {
  bg: 'oklch(0.130 0 0)',
  surface: 'oklch(0.170 0 0)',
  surfaceSunk: 'oklch(0.105 0 0)',
  border: 'oklch(0.260 0 0)',
  borderStrong: 'oklch(0.360 0 0)',
  ink: 'oklch(0.970 0 0)',
  inkSoft: 'oklch(0.820 0 0)',
  muted: 'oklch(0.640 0 0)',
  faint: 'oklch(0.460 0 0)',
  accent: 'oklch(0.700 0.140 65)',
  accentSoft: 'oklch(0.290 0.060 65)',
  accentOn: 'oklch(0.130 0 0)',
  paper: 'oklch(1.000 0 0)',
  paperInk: 'oklch(0.150 0 0)',
  paperRule: 'oklch(0.880 0 0)',
  paperMuted: 'oklch(0.500 0 0)',
  success: 'oklch(0.700 0.140 148)',
};

export const FONTS = {
  display: '"Vollkorn Variable", Georgia, serif',
  body: '"Bricolage Grotesque Variable", system-ui, sans-serif',
  mono: '"Geist Mono Variable", "Geist Mono", monospace',
};

export const EASE = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
};
