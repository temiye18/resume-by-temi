import type { Resume } from '@/schema/resume';
import type { ResumeVariant } from '@/types/resume-variant-type';
import type { IResumeThemeOverrides } from '@/interfaces/i-resume-theme-overrides';
import type { IJobTarget } from '@/interfaces/i-job-target';

export interface IResumeRecord {
  id: string;
  name: string;
  resume: Resume;
  templateId: ResumeVariant;
  theme: IResumeThemeOverrides;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  jobTarget?: IJobTarget;
}
