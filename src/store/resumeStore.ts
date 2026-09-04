import { create } from 'zustand';
import { temporal } from 'zundo';
import { produce } from 'immer';
import { emptyResume } from '@/schema/resume';
import { defaultThemeOverrides } from '@/db/repository';
import { templateDefaults } from '@/constants';
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
      setTemplate: (templateId) =>
        set((state) => ({
          templateId,
          theme: { ...state.theme, ...templateDefaults[templateId] },
        })),
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
      // Only the four tracked fields matter. Immer returns a stable reference when a
      // mutation changes nothing, so referential equality here means "no real edit" —
      // which keeps autosave's setSaving/setLastSavedAt writes out of the history and
      // stops them from wiping the redo stack.
      equality: (a, b) =>
        a.resume === b.resume &&
        a.name === b.name &&
        a.templateId === b.templateId &&
        a.theme === b.theme,
      // Leading-edge grouping: record the pre-burst state on the first real change
      // (so undo is available instantly), then coalesce further changes for 500ms so a
      // run of keystrokes collapses into one undo step.
      handleSet: (handleSet) => {
        let cooling = false;
        let timer: ReturnType<typeof setTimeout> | null = null;
        return (pastState) => {
          if (!cooling) {
            handleSet(pastState);
            cooling = true;
          }
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            cooling = false;
            timer = null;
          }, 500);
        };
      },
    },
  ),
);

export const useResumeTemporal = useResumeStore.temporal;
