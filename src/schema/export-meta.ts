import { z } from 'zod';

export const RESUME_BUILDER_META_VERSION = 1;

const ThemeOverrides = z.object({
  headingFont: z.string(),
  bodyFont: z.string(),
  accentColor: z.string(),
  typeScale: z.number(),
  lineHeight: z.number(),
});

export const ResumeBuilderMetaSchema = z.object({
  version: z.number(),
  templateId: z.string(),
  theme: ThemeOverrides,
  name: z.string().optional(),
  schemaVersion: z.number().optional(),
  exportedAt: z.string().optional(),
});

export type ResumeBuilderMeta = z.infer<typeof ResumeBuilderMetaSchema>;
