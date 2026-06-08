import type { ResumeFontFamily } from '@/types/resume-theme-type';

export interface IFontCatalogEntry {
  family: ResumeFontFamily;
  group: 'Sans' | 'Serif' | 'Mono';
  sample: string;
}
