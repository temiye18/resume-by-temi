import type { Resume } from '@/schema/resume';
import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IResumeRecord } from '@/interfaces/i-resume-record';
import type { IResumeThemeOverrides } from '@/interfaces/i-resume-theme-overrides';

export interface IResumeState {
  resumeId: string | null;
  name: string;
  resume: Resume;
  templateId: ResumeVariant;
  theme: IResumeThemeOverrides;
  lastSavedAt: string | null;
  isSaving: boolean;

  load: (record: IResumeRecord) => void;
  reset: () => void;
  setResume: (next: Resume) => void;
  patchResume: (mutator: (draft: Resume) => void) => void;
  setName: (name: string) => void;
  setTemplate: (templateId: ResumeVariant) => void;
  setTheme: (patch: Partial<IResumeThemeOverrides>) => void;
  setLastSavedAt: (iso: string | null) => void;
  setSaving: (saving: boolean) => void;
}
