import { createElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ensureFontsRegistered } from './registerFonts';
import ResumeDocument from './ResumeDocument';
import type { Resume } from '@/schema/resume';
import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IResumeThemeOverrides } from '@/interfaces/i-resume-theme-overrides';

interface IGeneratePdfOptions {
  resume: Resume;
  templateId: ResumeVariant;
  theme: IResumeThemeOverrides;
  title?: string;
}

export const generatePdf = async ({
  resume,
  templateId,
  theme,
  title,
}: IGeneratePdfOptions): Promise<Blob> => {
  ensureFontsRegistered();
  const instance = pdf(
    createElement(ResumeDocument, { resume, templateId, theme, title }),
  );
  return instance.toBlob();
};
