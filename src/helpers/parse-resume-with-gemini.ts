import type { Resume } from '@/schema/resume';
import { emptyResume, newId } from '@/schema/resume';

interface IGeminiResumePayload {
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    summary?: string;
    location?: { city?: string; region?: string; countryCode?: string };
    profiles?: { network?: string; username?: string; url?: string }[];
  };
  work?: {
    position?: string;
    name?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    highlights?: string[];
  }[];
  education?: {
    institution?: string;
    studyType?: string;
    area?: string;
    startDate?: string;
    endDate?: string;
    highlights?: string[];
  }[];
  skills?: { name?: string; keywords?: string[] }[];
  projects?: {
    name?: string;
    description?: string;
    url?: string;
    repository?: string;
    startDate?: string;
    endDate?: string;
    highlights?: string[];
  }[];
}

interface IGeminiResponse {
  resume: IGeminiResumePayload;
  modelUsed: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite';
}

const PROXY_ENDPOINT = '/api/parse-resume';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read file as data URL'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

const sanitizeDate = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (trimmed === 'Present' || trimmed === 'present' || trimmed === 'Current') return 'Present';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  return undefined;
};

const sanitizeUrl = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  let candidate = raw.trim().replace(/[.,;:!?)\]}"']+$/, '');
  if (!candidate) return undefined;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return undefined;
  }
};

const ensureCountryCode = (cc?: string): string | undefined => {
  if (!cc) return undefined;
  const trimmed = cc.trim().toUpperCase();
  return trimmed.length === 2 ? trimmed : undefined;
};

const mergePayloadIntoResume = (payload: IGeminiResumePayload): Resume => {
  const resume = emptyResume();
  const basics = payload.basics ?? {};
  if (basics.name) resume.basics.name = basics.name.trim();
  resume.basics.label = (basics.label ?? '').trim();
  if (basics.email) resume.basics.email = basics.email.trim();
  if (basics.phone) resume.basics.phone = basics.phone.trim();
  resume.basics.summary = (basics.summary ?? '').trim();
  if (basics.location) {
    resume.basics.location = {
      city: basics.location.city?.trim() ?? '',
      region: basics.location.region?.trim() ?? '',
      countryCode: ensureCountryCode(basics.location.countryCode),
    };
  }
  const profilesList: { network: string; url: string; username?: string }[] = [];
  for (const p of basics.profiles ?? []) {
    const url = sanitizeUrl(p.url);
    if (!url) continue;
    const username = p.username?.trim();
    profilesList.push({
      network: (p.network ?? '').trim(),
      url,
      ...(username ? { username } : {}),
    });
  }
  resume.basics.profiles = profilesList;

  const fallbackYear = String(new Date().getFullYear());
  resume.work = (payload.work ?? []).map((w) => ({
    id: newId(),
    name: (w.name ?? '').trim(),
    position: (w.position ?? '').trim(),
    location: (w.location ?? '').trim(),
    startDate: sanitizeDate(w.startDate) ?? fallbackYear,
    ...(sanitizeDate(w.endDate) ? { endDate: sanitizeDate(w.endDate)! } : {}),
    highlights: (w.highlights ?? []).map((h) => h.trim()).filter(Boolean),
    keywords: [],
  }));

  resume.education = (payload.education ?? []).map((e) => ({
    id: newId(),
    institution: (e.institution ?? '').trim(),
    area: (e.area ?? '').trim(),
    studyType: (e.studyType ?? '').trim(),
    ...(sanitizeDate(e.startDate) ? { startDate: sanitizeDate(e.startDate)! } : {}),
    ...(sanitizeDate(e.endDate) ? { endDate: sanitizeDate(e.endDate)! } : {}),
    highlights: (e.highlights ?? []).map((h) => h.trim()).filter(Boolean),
    courses: [],
  }));

  resume.skills = (payload.skills ?? [])
    .map((s) => ({
      id: newId(),
      name: (s.name ?? '').trim(),
      keywords: (s.keywords ?? []).map((k) => k.trim()).filter(Boolean),
    }))
    .filter((s) => s.name && s.keywords.length > 0);

  resume.projects = (payload.projects ?? []).map((p) => ({
    id: newId(),
    name: (p.name ?? '').trim() || 'Project',
    description: (p.description ?? '').trim(),
    ...(sanitizeUrl(p.url) ? { url: sanitizeUrl(p.url)! } : {}),
    ...(sanitizeUrl(p.repository) ? { repository: sanitizeUrl(p.repository)! } : {}),
    keywords: [],
    ...(sanitizeDate(p.startDate) ? { startDate: sanitizeDate(p.startDate)! } : {}),
    ...(sanitizeDate(p.endDate) ? { endDate: sanitizeDate(p.endDate)! } : {}),
    highlights: (p.highlights ?? []).map((h) => h.trim()).filter(Boolean),
    roles: [],
  }));

  return resume;
};

export const parseResumeWithGemini = async (file: File): Promise<Resume> => {
  const base64 = await fileToBase64(file);
  const mimeType = file.type || guessMime(file.name);

  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType,
      data: base64,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      `Smart parse failed (${response.status}): ${message || 'no response body'}`,
    );
  }

  const payload = (await response.json()) as IGeminiResponse;
  if (!payload?.resume) {
    throw new Error('Smart parse returned an unexpected payload');
  }
  return mergePayloadIntoResume(payload.resume);
};

const guessMime = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (lower.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
};
