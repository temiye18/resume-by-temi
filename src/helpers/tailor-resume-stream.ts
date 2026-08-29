import { nanoid } from 'nanoid';
import type { Resume } from '@/schema/resume';
import type { ITailorSuggestion } from '@/interfaces/i-tailor-suggestion';
import type { TailorOp } from '@/types/tailor-op-type';

interface ITailorStreamRequest {
  resume: Resume;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  focusFindings?: string[];
  signal?: AbortSignal;
}

const ENDPOINT = '/api/tailor-resume';
const VALID_OPS: TailorOp[] = [
  'rewrite-summary',
  'replace-bullet',
  'add-bullet',
  'add-skill',
  'replace-project-bullet',
];

const compactResume = (resume: Resume): string =>
  JSON.stringify({
    summary: resume.basics.summary ?? '',
    work: resume.work.map((w) => ({
      id: w.id,
      position: w.position,
      name: w.name,
      highlights: w.highlights,
    })),
    projects: resume.projects.map((p) => ({
      id: p.id,
      name: p.name,
      highlights: p.highlights,
    })),
    skills: resume.skills.map((g) => ({ name: g.name, keywords: g.keywords })),
  });

const toSuggestion = (line: string, resume: Resume): ITailorSuggestion | null => {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(line) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (typeof raw.error === 'string') throw new Error(raw.error);

  const op = raw.op as TailorOp;
  if (!VALID_OPS.includes(op)) return null;
  const after = typeof raw.after === 'string' ? raw.after.trim() : '';
  const workId = typeof raw.workId === 'string' ? raw.workId : undefined;
  const projectId = typeof raw.projectId === 'string' ? raw.projectId : undefined;
  const index = typeof raw.index === 'number' ? raw.index : undefined;
  const group = typeof raw.group === 'string' ? raw.group : undefined;
  const skill = typeof raw.skill === 'string' ? raw.skill.trim() : undefined;

  let before = '';
  if (op === 'rewrite-summary') {
    if (!after) return null;
    before = resume.basics.summary ?? '';
  } else if (op === 'replace-bullet') {
    const w = resume.work.find((e) => e.id === workId);
    if (!w || index === undefined || index < 0 || index >= w.highlights.length || !after) return null;
    before = w.highlights[index];
  } else if (op === 'add-bullet') {
    if (!resume.work.some((e) => e.id === workId) || !after) return null;
  } else if (op === 'replace-project-bullet') {
    const p = resume.projects.find((e) => e.id === projectId);
    if (!p || index === undefined || index < 0 || index >= p.highlights.length || !after) return null;
    before = p.highlights[index];
  } else if (op === 'add-skill') {
    if (!skill) return null;
  }

  return {
    id: nanoid(),
    op,
    workId,
    projectId,
    index,
    group,
    skill,
    before,
    after,
    reason: typeof raw.reason === 'string' ? raw.reason.trim() : '',
    confirm: op === 'add-skill' || raw.confirm === true,
    placeholder: raw.placeholder === true || after.includes('[add'),
  };
};

export async function* streamTailorSuggestions(
  req: ITailorStreamRequest,
): AsyncGenerator<ITailorSuggestion> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: req.signal,
    body: JSON.stringify({
      resumeJson: compactResume(req.resume),
      jobDescription: req.jobDescription,
      jobTitle: req.jobTitle,
      company: req.company,
      focusFindings: req.focusFindings,
    }),
  });

  if (!res.ok || !res.body) {
    const message = await res.text().catch(() => '');
    throw new Error(message || `AI tailoring failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl = buf.indexOf('\n');
    while (nl >= 0) {
      const suggestion = toSuggestion(buf.slice(0, nl).trim(), req.resume);
      buf = buf.slice(nl + 1);
      if (suggestion) yield suggestion;
      nl = buf.indexOf('\n');
    }
  }
  const tail = toSuggestion(buf.trim(), req.resume);
  if (tail) yield tail;
}
