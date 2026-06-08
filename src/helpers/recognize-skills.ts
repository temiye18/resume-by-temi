import { skillTaxonomy } from '@/constants/skill-taxonomy';
import type { ISkillEntry } from '@/interfaces/i-skill-entry';

const buildIndex = (): { byPhrase: Map<string, ISkillEntry>; maxWords: number } => {
  const byPhrase = new Map<string, ISkillEntry>();
  let maxWords = 1;
  for (const entry of skillTaxonomy) {
    const candidates = [entry.name, ...(entry.aliases ?? [])];
    for (const candidate of candidates) {
      const key = candidate.toLowerCase().trim();
      if (!key) continue;
      if (!byPhrase.has(key)) byPhrase.set(key, entry);
      const wordCount = key.split(/\s+/).length;
      if (wordCount > maxWords) maxWords = wordCount;
    }
  }
  return { byPhrase, maxWords };
};

let indexCache: ReturnType<typeof buildIndex> | null = null;
const getIndex = () => {
  if (!indexCache) indexCache = buildIndex();
  return indexCache;
};

const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./&\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
};

export const recognizeSkills = (text: string): Set<ISkillEntry> => {
  const { byPhrase, maxWords } = getIndex();
  const tokens = tokenize(text);
  const found = new Set<ISkillEntry>();

  for (let i = 0; i < tokens.length; i += 1) {
    const remaining = Math.min(maxWords, tokens.length - i);
    for (let span = remaining; span >= 1; span -= 1) {
      const phrase = tokens.slice(i, i + span).join(' ');
      const hit = byPhrase.get(phrase);
      if (hit) {
        found.add(hit);
        break;
      }
    }
  }
  return found;
};

export const groupSkillsByCategory = (
  skills: Iterable<ISkillEntry>,
): Map<string, ISkillEntry[]> => {
  const map = new Map<string, ISkillEntry[]>();
  for (const s of skills) {
    const arr = map.get(s.category) ?? [];
    arr.push(s);
    map.set(s.category, arr);
  }
  return map;
};
