import { create } from 'zustand';
import { analyzeJobMatch, streamTailorSuggestions } from '@/helpers';
import type { ITailorState } from '@/interfaces/i-tailor-state';

const MIN_JD_LENGTH = 40;

let controller: AbortController | null = null;

export const useTailorStore = create<ITailorState>((set, get) => ({
  status: 'idle',
  jobDescription: '',
  jobTitle: '',
  company: '',
  match: null,
  suggestions: [],
  decisions: {},
  error: null,

  setJobDescription: (value) => set({ jobDescription: value }),
  setJobTitle: (value) => set({ jobTitle: value }),
  setCompany: (value) => set({ company: value }),

  analyze: (resume) => {
    const jd = get().jobDescription.trim();
    set({ match: jd.length < MIN_JD_LENGTH ? null : analyzeJobMatch(resume, jd) });
  },

  start: async (resume, focusFindings) => {
    const jd = get().jobDescription.trim();
    if (jd.length < MIN_JD_LENGTH) {
      set({ status: 'error', error: 'Paste a job description first (a sentence or two is enough).' });
      return;
    }
    controller?.abort();
    controller = new AbortController();
    set({
      status: 'streaming',
      suggestions: [],
      decisions: {},
      error: null,
      match: analyzeJobMatch(resume, jd),
    });

    try {
      for await (const suggestion of streamTailorSuggestions({
        resume,
        jobDescription: jd,
        jobTitle: get().jobTitle.trim() || undefined,
        company: get().company.trim() || undefined,
        focusFindings,
        signal: controller.signal,
      })) {
        set((state) => ({
          suggestions: [...state.suggestions, suggestion],
          decisions: { ...state.decisions, [suggestion.id]: 'pending' },
        }));
      }
      set({ status: 'ready' });
    } catch (err) {
      if (controller?.signal.aborted) {
        set({ status: 'ready' });
        return;
      }
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'AI tailoring failed. Please try again.',
      });
    }
  },

  stop: () => {
    controller?.abort();
    set({ status: 'ready' });
  },

  decide: (id, decision) =>
    set((state) => ({ decisions: { ...state.decisions, [id]: decision } })),

  decideAllPending: (decision) =>
    set((state) => {
      const next = { ...state.decisions };
      for (const s of state.suggestions) {
        if ((next[s.id] ?? 'pending') === 'pending') next[s.id] = decision;
      }
      return { decisions: next };
    }),

  reset: () => {
    controller?.abort();
    controller = null;
    set({
      status: 'idle',
      jobDescription: '',
      jobTitle: '',
      company: '',
      match: null,
      suggestions: [],
      decisions: {},
      error: null,
    });
  },
}));
