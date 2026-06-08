import { useResumeStore } from '@/store/resumeStore';
import { updateResume } from '@/db/repository';
import type { IResumeState } from '@/interfaces/i-resume-state';

const AUTOSAVE_DEBOUNCE_MS = 500;

let timer: ReturnType<typeof setTimeout> | null = null;
let pending = false;
let unsubscribe: (() => void) | null = null;

const flush = async () => {
  const state = useResumeStore.getState();
  if (!state.resumeId) return;
  pending = false;
  state.setSaving(true);
  try {
    await updateResume(state.resumeId, {
      name: state.name,
      resume: state.resume,
      templateId: state.templateId,
      theme: state.theme,
    });
    state.setLastSavedAt(new Date().toISOString());
  } finally {
    state.setSaving(false);
  }
};

const schedule = () => {
  if (timer) clearTimeout(timer);
  pending = true;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, AUTOSAVE_DEBOUNCE_MS);
};

const subscribed = (state: IResumeState, prev: IResumeState): void => {
  if (!state.resumeId) return;
  const changed =
    state.resume !== prev.resume ||
    state.name !== prev.name ||
    state.templateId !== prev.templateId ||
    state.theme !== prev.theme;
  if (changed) schedule();
};

export const startAutosave = (): void => {
  if (unsubscribe) return;
  unsubscribe = useResumeStore.subscribe((state, prev) => subscribed(state, prev));
};

export const stopAutosave = (flushNow: boolean): void => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  if (flushNow && pending) void flush();
};

export const flushAutosaveNow = (): Promise<void> => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  return flush();
};
