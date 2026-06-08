import { nanoid } from 'nanoid';
import { db } from './dexie';
import type { IResumeRecord } from '@/interfaces/i-resume-record';
import type { IResumeThemeOverrides } from '@/interfaces/i-resume-theme-overrides';
import type { Resume } from '@/schema/resume';
import type { ResumeVariant } from '@/types/resume-variant-type';

export const defaultThemeOverrides = (): IResumeThemeOverrides => ({
  headingFont: 'Inter',
  bodyFont: 'Inter',
  accentColor: '#a16207',
  typeScale: 1,
  lineHeight: 1.3,
});

export const createResume = async (
  resume: Resume,
  templateId: ResumeVariant = 'modern-minimal',
  name?: string,
): Promise<IResumeRecord> => {
  const now = new Date().toISOString();
  const record: IResumeRecord = {
    id: nanoid(),
    name: name ?? resume.basics.name ?? 'Untitled résumé',
    resume,
    templateId,
    theme: defaultThemeOverrides(),
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1,
  };
  await db.resumes.put(record);
  return record;
};

export const getResume = async (id: string): Promise<IResumeRecord | undefined> => {
  return db.resumes.get(id);
};

export const listResumes = async (): Promise<IResumeRecord[]> => {
  return db.resumes.orderBy('updatedAt').reverse().toArray();
};

export const updateResume = async (
  id: string,
  patch: Partial<Omit<IResumeRecord, 'id' | 'createdAt'>>,
): Promise<void> => {
  await db.resumes.update(id, { ...patch, updatedAt: new Date().toISOString() });
};

export const renameResume = async (id: string, name: string): Promise<void> => {
  await updateResume(id, { name });
};

export const duplicateResume = async (id: string): Promise<IResumeRecord | null> => {
  const existing = await getResume(id);
  if (!existing) return null;
  return createResume(
    existing.resume,
    existing.templateId,
    `${existing.name} (copy)`,
  );
};

export const deleteResume = async (id: string): Promise<void> => {
  await db.resumes.delete(id);
};

export const clearAllData = async (): Promise<void> => {
  await db.transaction('rw', db.resumes, db.settings, async () => {
    await db.resumes.clear();
    await db.settings.clear();
  });
};
