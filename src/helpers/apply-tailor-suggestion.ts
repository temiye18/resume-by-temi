import type { Resume } from '@/schema/resume';
import { newId } from '@/schema/resume';
import type { ITailorSuggestion } from '@/interfaces/i-tailor-suggestion';

export const tailorMutator =
  (s: ITailorSuggestion) =>
  (draft: Resume): void => {
    switch (s.op) {
      case 'rewrite-summary':
        draft.basics.summary = s.after;
        return;
      case 'replace-bullet': {
        const w = draft.work.find((e) => e.id === s.workId);
        if (w && s.index !== undefined && s.index < w.highlights.length) {
          w.highlights[s.index] = s.after;
        }
        return;
      }
      case 'add-bullet': {
        const w = draft.work.find((e) => e.id === s.workId);
        if (w) w.highlights.push(s.after);
        return;
      }
      case 'replace-project-bullet': {
        const p = draft.projects.find((e) => e.id === s.projectId);
        if (p && s.index !== undefined && s.index < p.highlights.length) {
          p.highlights[s.index] = s.after;
        }
        return;
      }
      case 'add-skill': {
        if (!s.skill) return;
        const groupName = s.group?.trim() || 'Additional Skills';
        let group = draft.skills.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
        if (!group) {
          group = { id: newId(), name: groupName, keywords: [] };
          draft.skills.push(group);
        }
        if (!group.keywords.some((k) => k.toLowerCase() === s.skill!.toLowerCase())) {
          group.keywords.push(s.skill);
        }
        return;
      }
    }
  };
