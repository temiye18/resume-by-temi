import { create } from 'zustand';
import { temporal } from 'zundo';
import { produce } from 'immer';
import { emptyResume } from '@/schema/resume';
import { defaultThemeOverrides } from '@/db/repository';
import type { IResumeState } from '@/interfaces/i-resume-state';

const baseState = (): Pick<
  IResumeState,
  'resumeId' | 'name' | 'resume' | 'templateId' | 'theme' | 'lastSavedAt' | 'isSaving'
> => ({
  resumeId: null,
  name: 'Untitled résumé',
  resume: emptyResume(),
  templateId: 'modern-minimal',
  theme: defaultThemeOverrides(),
  lastSavedAt: null,
  isSaving: false,
});

export const useResumeStore = create<IResumeState>()(
  temporal(
    (set) => ({
      ...baseState(),
      load: (record) =>
        set({
          resumeId: record.id,
          name: record.name,
          resume: record.resume,
          templateId: record.templateId,
          theme: record.theme,
          lastSavedAt: record.updatedAt,
          isSaving: false,
        }),
      reset: () => set({ ...baseState() }),
      setResume: (next) => set({ resume: next }),
      patchResume: (mutator) =>
        set((state) => ({
          resume: produce(state.resume, mutator),
        })),
      setName: (name) => set({ name }),
      setTemplate: (templateId) => set({ templateId }),
      setTheme: (patch) => set((state) => ({ theme: { ...state.theme, ...patch } })),
      setLastSavedAt: (iso) => set({ lastSavedAt: iso }),
      setSaving: (saving) => set({ isSaving: saving }),
    }),
    {
      limit: 100,
      partialize: (state) => ({
        resume: state.resume,
        name: state.name,
        templateId: state.templateId,
        theme: state.theme,
      }),
      handleSet: (handleSet) => {
        let timer: ReturnType<typeof setTimeout> | null = null;
        return (pastState) => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            handleSet(pastState);
            timer = null;
          }, 500);
        };
      },
    },
  ),
);

export const useResumeTemporal = useResumeStore.temporal;
