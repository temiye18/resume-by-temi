import type { Resume } from '@/schema/resume';
import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IResumeThemeOverrides } from '@/interfaces/i-resume-theme-overrides';
import { RESUME_BUILDER_META_VERSION, ResumeBuilderMetaSchema } from '@/schema/export-meta';

const VARIANTS: ResumeVariant[] = [
  'modern-minimal',
  'classic-serif',
  'tech-sans',
  'executive',
  'compact',
  'editorial',
];

interface IExportInput {
  resume: Resume;
  templateId: ResumeVariant;
  theme: IResumeThemeOverrides;
  name: string;
}

interface IBuilderStyle {
  templateId: ResumeVariant;
  theme: IResumeThemeOverrides;
  name?: string;
}

export const toExportEnvelope = (input: IExportInput): Record<string, unknown> => ({
  ...input.resume,
  meta: {
    resumeBuilder: {
      version: RESUME_BUILDER_META_VERSION,
      templateId: input.templateId,
      theme: input.theme,
      name: input.name,
      schemaVersion: input.resume['x-builder'].schemaVersion,
      exportedAt: new Date().toISOString(),
    },
  },
});

export const readBuilderMeta = (raw: unknown): IBuilderStyle | null => {
  const source = (raw as { meta?: { resumeBuilder?: unknown } })?.meta?.resumeBuilder;
  if (!source) return null;
  const parsed = ResumeBuilderMetaSchema.safeParse(source);
  if (!parsed.success) return null;
  const templateId = (VARIANTS as string[]).includes(parsed.data.templateId)
    ? (parsed.data.templateId as ResumeVariant)
    : 'modern-minimal';
  return {
    templateId,
    theme: parsed.data.theme as IResumeThemeOverrides,
    name: parsed.data.name,
  };
};
