import type { ResumeFontFamily } from '@/types/resume-theme-type';

export interface IResumeThemeOverrides {
  headingFont: ResumeFontFamily;
  bodyFont: ResumeFontFamily;
  accentColor: string;
  typeScale: number;
  lineHeight: number;
}
