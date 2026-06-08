import type { Resume } from '@/schema/resume';
import { emptyResume, newId } from '@/schema/resume';
import { recognizeSkills, groupSkillsByCategory } from './recognize-skills';
import { skillCategoryLabels } from '@/constants/skill-category-labels';
import type { SkillCategory } from '@/interfaces/i-skill-entry';

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/g;
const URL_RE = /\bhttps?:\/\/[^\s)]+/gi;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)]+/i;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s)]+/i;
const TWITTER_RE = /(?:https?:\/\/)?(?:www\.|x\.com\/|twitter\.com\/)[^\s)]+/i;

const SECTION_KEYWORDS: Record<string, string> = {
  summary: 'summary',
  profile: 'summary',
  objective: 'summary',
  about: 'summary',
  experience: 'work',
  'work experience': 'work',
  'work history': 'work',
  employment: 'work',
  'professional experience': 'work',
  education: 'education',
  'academic background': 'education',
  skills: 'skills',
  'technical skills': 'skills',
  'core competencies': 'skills',
  projects: 'projects',
  certifications: 'certificates',
  certificates: 'certificates',
  languages: 'languages',
  volunteer: 'volunteer',
  'volunteer experience': 'volunteer',
  awards: 'awards',
  publications: 'publications',
};

interface ISectionBlock {
  key: string;
  heading: string;
  lines: string[];
}

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'january', 'february', 'march', 'april', 'june', 'july', 'august',
  'september', 'october', 'november', 'december',
];
const MONTH_RE = new RegExp(`\\b(${MONTHS.join('|')})\\.?\\s+(\\d{4})`, 'i');
const YEAR_RE = /\b(19|20)\d{2}\b/;
const DATE_RANGE_RE = new RegExp(
  `(${MONTH_RE.source}|(?:19|20)\\d{2}|present|current)\\s*[-–—to]+\\s*(${MONTH_RE.source}|(?:19|20)\\d{2}|present|current)`,
  'i',
);

const normLine = (s: string): string => s.replace(/\s+/g, ' ').trim();

const splitLines = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map(normLine)
    .filter(Boolean);

const sectionKeyFromHeading = (line: string): string | null => {
  const lower = line.toLowerCase().replace(/[^a-z\s&]/g, '').replace(/\s+/g, ' ').trim();
  if (lower.length > 40) return null;
  for (const [keyword, key] of Object.entries(SECTION_KEYWORDS)) {
    if (lower === keyword) return key;
    if (lower.startsWith(`${keyword} `)) return key;
  }
  return null;
};

const splitIntoSections = (lines: string[]): { header: string[]; sections: ISectionBlock[] } => {
  const header: string[] = [];
  const sections: ISectionBlock[] = [];
  let current: ISectionBlock | null = null;
  let seenSection = false;

  for (const raw of lines) {
    const key = sectionKeyFromHeading(raw);
    if (key) {
      if (current) sections.push(current);
      current = { key, heading: raw, lines: [] };
      seenSection = true;
      continue;
    }
    if (!seenSection) {
      header.push(raw);
    } else if (current) {
      current.lines.push(raw);
    }
  }
  if (current) sections.push(current);
  return { header, sections };
};

const monthToNum = (m: string): string => {
  const map: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10',
    november: '11', december: '12',
  };
  return map[m.toLowerCase()] ?? '01';
};

const parseDateToken = (token: string): string | null => {
  const t = token.trim().toLowerCase();
  if (!t) return null;
  if (t === 'present' || t === 'current') return 'Present';
  const monthMatch = t.match(/\b([a-z]+)\.?\s+(\d{4})\b/i);
  if (monthMatch) return `${monthMatch[2]}-${monthToNum(monthMatch[1])}`;
  const yearMatch = t.match(/\b((?:19|20)\d{2})\b/);
  if (yearMatch) return yearMatch[1];
  return null;
};

const extractDateRange = (line: string): { start?: string; end?: string; cleaned: string } => {
  const match = line.match(DATE_RANGE_RE);
  if (!match) {
    const single = line.match(MONTH_RE) ?? line.match(YEAR_RE);
    if (single) {
      const value = parseDateToken(single[0]);
      const cleaned = line.replace(single[0], '').replace(/[\s|,–—-]+$/, '').trim();
      return value
        ? { end: value, cleaned }
        : { cleaned };
    }
    return { cleaned: line };
  }
  const [whole, startRaw, , , endRaw] = match;
  void [, , , , whole];
  const start = parseDateToken(startRaw ?? '');
  const end = parseDateToken(endRaw ?? '');
  const cleaned = line.replace(match[0], '').replace(/[\s|,–—-]+$/, '').replace(/^[\s|,–—-]+/, '').trim();
  return { start: start ?? undefined, end: end ?? undefined, cleaned };
};

interface IEntryBuffer {
  header: string;
  date?: { start?: string; end?: string };
  detail: string;
  bullets: string[];
}

const splitEntries = (lines: string[]): IEntryBuffer[] => {
  const entries: IEntryBuffer[] = [];
  let buffer: IEntryBuffer | null = null;

  const isBullet = (s: string): boolean => /^[•·●▪▫◦●■►‣–-]\s+/.test(s) || /^\d+\.\s+/.test(s);
  const startsEntry = (s: string): boolean => {
    if (isBullet(s)) return false;
    const hasDate = DATE_RANGE_RE.test(s) || MONTH_RE.test(s) || /\b(19|20)\d{2}\b/.test(s);
    const titleish = /^[A-Z][A-Za-z0-9 .,&'\-()/]{2,80}$/.test(s);
    return hasDate || titleish;
  };

  for (const raw of lines) {
    if (isBullet(raw)) {
      const cleaned = raw.replace(/^[•·●▪▫◦●■►‣–-]\s+/, '').replace(/^\d+\.\s+/, '').trim();
      if (!buffer) {
        buffer = { header: '', detail: '', bullets: [] };
        entries.push(buffer);
      }
      buffer.bullets.push(cleaned);
      continue;
    }
    if (startsEntry(raw) && (!buffer || buffer.bullets.length > 0 || buffer.detail.length > 0)) {
      if (buffer) entries.push(buffer);
      const { start, end, cleaned } = extractDateRange(raw);
      buffer = {
        header: cleaned,
        date: start || end ? { start, end } : undefined,
        detail: '',
        bullets: [],
      };
      if (!entries.includes(buffer)) entries.push(buffer);
      continue;
    }
    if (buffer) {
      if (!buffer.date) {
        const { start, end, cleaned } = extractDateRange(raw);
        if (start || end) {
          buffer.date = { start, end };
          if (cleaned) buffer.detail = buffer.detail ? `${buffer.detail} ${cleaned}` : cleaned;
          continue;
        }
      }
      buffer.detail = buffer.detail ? `${buffer.detail} ${raw}` : raw;
    } else {
      const { start, end, cleaned } = extractDateRange(raw);
      buffer = {
        header: cleaned,
        date: start || end ? { start, end } : undefined,
        detail: '',
        bullets: [],
      };
      entries.push(buffer);
    }
  }
  return entries.filter((e) => e.header || e.detail || e.bullets.length);
};

const splitHeaderForRole = (header: string): { left: string; right: string } => {
  const separators = ['·', '|', ' at ', ' – ', ' — ', ' - ', ','];
  for (const sep of separators) {
    const idx = header.indexOf(sep);
    if (idx > 2 && idx < header.length - 2) {
      return {
        left: header.slice(0, idx).trim(),
        right: header.slice(idx + sep.length).trim(),
      };
    }
  }
  return { left: header.trim(), right: '' };
};

const extractContactFromHeader = (
  headerLines: string[],
): { name: string; label: string; email?: string; phone?: string; location?: string; profiles: { network: string; url: string; username?: string }[] } => {
  const joined = headerLines.join(' ');
  const emailMatch = joined.match(EMAIL_RE);
  const email = emailMatch?.[0];

  const phoneCandidates = joined.match(PHONE_RE) ?? [];
  const phone = phoneCandidates
    .map((p) => p.trim())
    .find((p) => p.replace(/\D/g, '').length >= 7);

  const urls = (joined.match(URL_RE) ?? []).map((u) =>
    u.replace(/[.,;:!?)\]}"']+$/, ''),
  );
  const profiles: { network: string; url: string; username?: string }[] = [];
  for (const url of urls) {
    try {
      new URL(url);
    } catch {
      continue;
    }
    if (LINKEDIN_RE.test(url)) profiles.push({ network: 'LinkedIn', url, username: 'LinkedIn' });
    else if (GITHUB_RE.test(url)) profiles.push({ network: 'GitHub', url, username: 'GitHub' });
    else if (TWITTER_RE.test(url)) profiles.push({ network: 'X', url, username: 'X' });
    else profiles.push({ network: '', url });
  }
  const linkedinBare = joined.match(/\blinkedin\.com\/[A-Za-z0-9/_.-]+/i)?.[0];
  const githubBare = joined.match(/\bgithub\.com\/[A-Za-z0-9/_.-]+/i)?.[0];
  if (linkedinBare && !profiles.some((p) => p.url.toLowerCase().includes('linkedin.com'))) {
    profiles.push({ network: 'LinkedIn', url: `https://${linkedinBare}`, username: 'LinkedIn' });
  }
  if (githubBare && !profiles.some((p) => p.url.toLowerCase().includes('github.com'))) {
    profiles.push({ network: 'GitHub', url: `https://${githubBare}`, username: 'GitHub' });
  }

  const nameCandidates = headerLines
    .filter((l) => !EMAIL_RE.test(l) && !URL_RE.test(l) && !PHONE_RE.test(l))
    .filter((l) => l.length >= 2 && l.length <= 60)
    .filter((l) => /^[A-Z][A-Za-z .'\-]+$/.test(l));
  const name = nameCandidates[0] ?? '';

  const labelCandidates = headerLines
    .filter((l) => l !== name)
    .filter((l) => !EMAIL_RE.test(l) && !URL_RE.test(l) && !PHONE_RE.test(l))
    .filter((l) => l.length >= 4 && l.length <= 80);
  const label = labelCandidates[0] ?? '';

  let location: string | undefined;
  const locationCandidate = headerLines.find((l) =>
    /^[A-Z][A-Za-z .'\-]+,\s*[A-Z]{2,}(?:,\s*[A-Z][a-z]+)?$/.test(l),
  );
  if (locationCandidate) location = locationCandidate;

  return { name, label, email, phone, location, profiles };
};

const buildSkillsFromText = (
  fullText: string,
): { id: string; name: string; keywords: string[] }[] => {
  const recognized = recognizeSkills(fullText);
  if (recognized.size === 0) return [];
  const grouped = groupSkillsByCategory(recognized);
  const groups: { id: string; name: string; keywords: string[] }[] = [];
  for (const [category, entries] of grouped) {
    const label = skillCategoryLabels[category as SkillCategory] ?? category;
    groups.push({
      id: newId(),
      name: label,
      keywords: entries.map((e) => e.name).sort(),
    });
  }
  return groups;
};

export interface IResumeParseResult {
  resume: Resume;
  detected: {
    name: boolean;
    email: boolean;
    phone: boolean;
    workEntries: number;
    educationEntries: number;
    skillsRecognized: number;
  };
}

export const parseResumeText = (text: string): IResumeParseResult => {
  const lines = splitLines(text);
  const { header, sections } = splitIntoSections(lines);
  const contact = extractContactFromHeader(header);

  const resume = emptyResume();
  resume.basics.name = contact.name || resume.basics.name;
  resume.basics.label = contact.label || '';
  if (contact.email) resume.basics.email = contact.email;
  if (contact.phone) resume.basics.phone = contact.phone;
  if (contact.location) {
    const parts = contact.location.split(',').map((s) => s.trim());
    resume.basics.location = {
      city: parts[0] ?? '',
      region: parts[1] ?? '',
      countryCode: parts[2] && parts[2].length === 2 ? parts[2].toUpperCase() : undefined,
    };
  }
  resume.basics.profiles = contact.profiles;
  resume.basics.summary = '';

  resume.work = [];
  resume.education = [];

  for (const section of sections) {
    if (section.key === 'summary') {
      resume.basics.summary = section.lines.join(' ').trim();
    } else if (section.key === 'work') {
      const entries = splitEntries(section.lines);
      const fallbackYear = String(new Date().getFullYear());
      resume.work = entries.map((e) => {
        const { left, right } = splitHeaderForRole(e.header);
        return {
          id: newId(),
          name: right || '',
          position: left || '',
          location: '',
          startDate: e.date?.start || fallbackYear,
          ...(e.date?.end ? { endDate: e.date.end } : {}),
          highlights: e.bullets.length > 0 ? e.bullets : e.detail ? [e.detail] : [],
          keywords: [],
        };
      });
    } else if (section.key === 'education') {
      const entries = splitEntries(section.lines);
      resume.education = entries.map((e) => {
        const { left, right } = splitHeaderForRole(e.header);
        return {
          id: newId(),
          institution: left || '',
          area: right || e.detail || '',
          studyType: '',
          ...(e.date?.start ? { startDate: e.date.start } : {}),
          ...(e.date?.end ? { endDate: e.date.end } : {}),
          highlights: e.bullets,
          courses: [],
        };
      });
    } else if (section.key === 'projects') {
      const entries = splitEntries(section.lines);
      resume.projects = entries.map((e) => ({
        id: newId(),
        name: e.header || 'Project',
        description: e.detail,
        keywords: [],
        ...(e.date?.start ? { startDate: e.date.start } : {}),
        ...(e.date?.end ? { endDate: e.date.end } : {}),
        highlights: e.bullets,
        roles: [],
      }));
    }
  }

  resume.skills = buildSkillsFromText(text);

  return {
    resume,
    detected: {
      name: !!contact.name,
      email: !!contact.email,
      phone: !!contact.phone,
      workEntries: resume.work.length,
      educationEntries: resume.education.length,
      skillsRecognized: resume.skills.reduce((acc, g) => acc + g.keywords.length, 0),
    },
  };
};
