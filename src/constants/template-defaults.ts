import type { ResumeVariant } from '@/types/resume-variant-type';
import type { ResumeFontFamily } from '@/types/resume-theme-type';

export interface ITemplateFontDefault {
  headingFont: ResumeFontFamily;
  bodyFont: ResumeFontFamily;
}

// Signature typography per template. Applied on template selection and used by the
// preview surfaces so a template reads the way its name promises.
export const templateDefaults: Record<ResumeVariant, ITemplateFontDefault> = {
  'modern-minimal': { headingFont: 'Inter', bodyFont: 'Inter' },
  'classic-serif': { headingFont: 'Source Serif 4', bodyFont: 'EB Garamond' },
  'tech-sans': { headingFont: 'Inter', bodyFont: 'Inter' },
  executive: { headingFont: 'Inter', bodyFont: 'Source Serif 4' },
  compact: { headingFont: 'Lato', bodyFont: 'Lato' },
  editorial: { headingFont: 'Inter', bodyFont: 'Lora' },
  geometric: { headingFont: 'Manrope', bodyFont: 'Manrope' },
  standard: { headingFont: 'Work Sans', bodyFont: 'Inter' },
  broadsheet: { headingFont: 'Newsreader', bodyFont: 'PT Serif' },
  warmth: { headingFont: 'Nunito Sans', bodyFont: 'Nunito Sans' },
  refined: { headingFont: 'Spectral', bodyFont: 'Spectral' },
};
