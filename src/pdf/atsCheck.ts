import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Resume } from '@/schema/resume';
import type { IAtsCheckResult, IAtsFinding } from '@/interfaces/i-ats-check-result';
import { stripMarkdown } from '@/helpers';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const extractTextFromPdf = async (blob: Blob): Promise<string> => {
  const buffer = await blob.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }
  return pages.join('\n');
};

const SECTION_HEADINGS: { resumeFlag: (r: Resume) => boolean; label: string; rule: string }[] = [
  { resumeFlag: (r) => !!r.basics.summary, label: 'Summary', rule: 'R3 · standard heading' },
  { resumeFlag: (r) => r.work.length > 0, label: 'Experience', rule: 'R3 · standard heading' },
  {
    resumeFlag: (r) => r.education.length > 0,
    label: 'Education',
    rule: 'R3 · standard heading',
  },
  { resumeFlag: (r) => r.skills.length > 0, label: 'Skills', rule: 'R3 · standard heading' },
];

const normalize = (s: string): string =>
  s.toLowerCase().replace(/\s+/g, ' ').trim();

export const atsCheck = async (
  blob: Blob,
  resume: Resume,
): Promise<IAtsCheckResult> => {
  const findings: IAtsFinding[] = [];

  let extracted = '';
  try {
    extracted = await extractTextFromPdf(blob);
  } catch (e) {
    findings.push({
      severity: 'error',
      rule: 'R1 · selectable text',
      message: `Could not extract text from the PDF. ${e instanceof Error ? e.message : ''}`,
    });
    return {
      passed: false,
      findings,
      meta: { sections: 0, bullets: 0, sizeKb: Math.round(blob.size / 1024) },
    };
  }

  const normalized = normalize(extracted);

  if (extracted.trim().length < 200) {
    findings.push({
      severity: 'error',
      rule: 'R1 · selectable text',
      message: 'Extracted text is too short. This may indicate a rasterized PDF.',
    });
  }

  if (resume.basics.name && !normalized.includes(normalize(resume.basics.name))) {
    findings.push({
      severity: 'error',
      rule: 'R1 · name in text layer',
      message: `Could not find "${resume.basics.name}" in the extracted text.`,
    });
  }

  if (
    resume.basics.email &&
    resume.basics.email.length > 3 &&
    !normalized.includes(normalize(resume.basics.email))
  ) {
    findings.push({
      severity: 'warning',
      rule: 'R1 · contact in text layer',
      message: 'Email address not found in extracted text.',
    });
  }

  for (const section of SECTION_HEADINGS) {
    if (!section.resumeFlag(resume)) continue;
    if (!normalized.includes(normalize(section.label))) {
      findings.push({
        severity: 'warning',
        rule: section.rule,
        message: `The "${section.label}" heading was expected but not found in the extracted text.`,
      });
    }
  }

  let bulletsMatched = 0;
  let bulletsTotal = 0;
  for (const entry of resume.work) {
    for (const h of entry.highlights.slice(0, 3)) {
      bulletsTotal += 1;
      const plain = stripMarkdown(h);
      const first = plain.split(/[.;:]/)[0].trim();
      if (first.length < 12) continue;
      if (normalized.includes(normalize(first.slice(0, 60)))) bulletsMatched += 1;
    }
  }
  if (bulletsTotal > 0 && bulletsMatched / bulletsTotal < 0.7) {
    findings.push({
      severity: 'warning',
      rule: 'R1 · bullet content',
      message: `Only ${bulletsMatched} of ${bulletsTotal} sampled bullets were recoverable from the text layer.`,
    });
  }

  const bullets = resume.work.reduce((acc, w) => acc + w.highlights.length, 0);
  const sections =
    (resume.basics.summary ? 1 : 0) +
    (resume.work.length > 0 ? 1 : 0) +
    (resume.education.length > 0 ? 1 : 0) +
    (resume.skills.length > 0 ? 1 : 0) +
    (resume.projects.length > 0 ? 1 : 0);

  const errors = findings.filter((f) => f.severity === 'error');

  return {
    passed: errors.length === 0,
    findings,
    meta: {
      sections,
      bullets,
      sizeKb: Math.round(blob.size / 1024),
    },
  };
};
