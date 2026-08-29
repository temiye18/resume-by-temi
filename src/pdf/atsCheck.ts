import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Resume } from '@/schema/resume';
import type { IAtsCheckResult, IAtsFinding } from '@/interfaces/i-ats-check-result';
import { stripMarkdown, recognizeSkills, groupSkillsByCategory } from '@/helpers';
import { skillCategoryLabels } from '@/constants/skill-category-labels';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface IExtracted {
  text: string;
  pageCount: number;
  wordCount: number;
  fonts: Set<string>;
  embeddedFonts: number;
  totalFonts: number;
  meta: { title?: string; author?: string };
}

const extractFromPdf = async (blob: Blob): Promise<IExtracted> => {
  const buffer = await blob.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  const fonts = new Set<string>();
  let embeddedFonts = 0;
  let totalFonts = 0;

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);

    const ops = await page.getOperatorList();
    for (const dep of ops.fnArray) {
      if (dep === undefined) continue;
    }
    const commonObjs = page.commonObjs as unknown as { _objs?: Record<string, { data?: { name?: string; loadedName?: string; isType3Font?: boolean; missingFile?: boolean } }> };
    if (commonObjs._objs) {
      for (const key of Object.keys(commonObjs._objs)) {
        const o = commonObjs._objs[key]?.data;
        if (!o || !o.loadedName) continue;
        const name = o.name || o.loadedName;
        if (!name || fonts.has(name)) continue;
        fonts.add(name);
        totalFonts += 1;
        if (!o.missingFile && !o.isType3Font) embeddedFonts += 1;
      }
    }
  }

  const text = pages.join('\n');
  const words = text.trim().split(/\s+/).filter(Boolean);
  const meta = await doc.getMetadata().catch(() => ({ info: {} }));
  const info = (meta?.info ?? {}) as Record<string, unknown>;

  return {
    text,
    pageCount: doc.numPages,
    wordCount: words.length,
    fonts,
    embeddedFonts,
    totalFonts,
    meta: {
      title: typeof info.Title === 'string' ? (info.Title as string) : undefined,
      author: typeof info.Author === 'string' ? (info.Author as string) : undefined,
    },
  };
};

const RESERVED_SECTION_WORDS = new Set([
  'summary', 'experience', 'work history', 'work experience', 'employment',
  'education', 'skills', 'languages', 'projects', 'certifications',
  'certificates', 'awards', 'publications', 'volunteer', 'references',
  'interests', 'objective', 'profile', 'about',
]);

const ACTION_VERBS = new Set([
  'led', 'built', 'launched', 'designed', 'developed', 'engineered',
  'shipped', 'created', 'implemented', 'architected', 'owned', 'drove',
  'delivered', 'managed', 'mentored', 'scaled', 'optimized', 'reduced',
  'increased', 'improved', 'migrated', 'introduced', 'spearheaded',
  'authored', 'rewrote', 'refactored', 'automated', 'integrated',
  'analyzed', 'researched', 'investigated', 'collaborated', 'partnered',
  'coordinated', 'orchestrated', 'established', 'pioneered', 'transformed',
  'consolidated', 'streamlined', 'standardized', 'restructured', 'redesigned',
  'eliminated', 'achieved', 'accelerated', 'negotiated', 'piloted',
  'presented', 'published', 'recruited', 'trained', 'supervised',
  'oversaw', 'directed', 'planned', 'executed', 'reviewed', 'audited',
  'tested', 'debugged', 'deployed', 'monitored', 'maintained',
  'configured', 'instrumented', 'profiled', 'modernized', 'hardened',
  'secured', 'documented', 'guided', 'enabled', 'unlocked',
]);

const FIRST_PERSON_RE = /\b(i|i'm|i'll|i've|i'd|my|me|myself)\b/i;
const WEAK_VOICE_PHRASES = [
  /\bresponsible for\b/i,
  /\bin charge of\b/i,
  /\bduties included\b/i,
  /\bhelped (?:with|to)\b/i,
  /\bworked on\b/i,
  /\bworked with\b/i,
  /\bassisted (?:with|in)\b/i,
  /\bparticipated in\b/i,
];
const PASSIVE_RE = /\b(?:was|were|been|being|is|are|am)\s+(?:[a-z]+ed|[a-z]+en)\b/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d().\-\s]{7,}$/;
const URL_RE = /^https?:\/\/[\w.-]+(?:\.[\w.-]+)+[/\w\-._~:?#[\]@!$&'()*+,;=]*$/i;
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'or', 'but', 'the', 'is', 'are', 'was', 'were',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'from',
  'that', 'this', 'these', 'those', 'it', 'its', 'be', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
  'you', 'your', 'we', 'our', 'us', 'they', 'them', 'their',
]);

const normalize = (s: string): string => {
  const lowered = s.toLowerCase().replace(/\s+/g, ' ').trim();
  return lowered.replace(/(?:\b[a-z]\b ){3,}\b[a-z]\b/g, (run) =>
    run.replace(/ /g, ''),
  );
};

const firstWord = (s: string): string => {
  const stripped = stripMarkdown(s).trim();
  const match = stripped.match(/^[A-Za-z][A-Za-z'-]*/);
  return match ? match[0].toLowerCase() : '';
};

const tokenize = (s: string): string[] => {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
};

const collectKeywords = (s: string): Set<string> => {
  const set = new Set<string>();
  for (const t of tokenize(s)) set.add(t);
  return set;
};

const dateFormat = (raw?: string): 'year' | 'year-month' | 'year-month-day' | 'present' | 'other' | null => {
  if (!raw) return null;
  if (raw === 'Present') return 'present';
  if (/^\d{4}$/.test(raw)) return 'year';
  if (/^\d{4}-\d{2}$/.test(raw)) return 'year-month';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return 'year-month-day';
  return 'other';
};

const tally = (start: number) => {
  let score = start;
  let floor = 0;
  return {
    deduct: (amount: number, cap?: number) => {
      if (cap !== undefined) {
        const room = cap - floor;
        const applied = Math.min(amount, Math.max(0, room));
        floor += applied;
        score -= applied;
      } else {
        score -= amount;
      }
    },
    value: () => Math.max(0, Math.min(100, Math.round(score))),
  };
};

interface IAtsCheckOptions {
  jobDescription?: string;
}

export const atsCheck = async (
  blob: Blob,
  resume: Resume,
  options: IAtsCheckOptions = {},
): Promise<IAtsCheckResult> => {
  const findings: IAtsFinding[] = [];
  const meta = {
    sections: 0,
    bullets: resume.work.reduce((acc, w) => acc + w.highlights.length, 0),
    sizeKb: Math.round(blob.size / 1024),
  };
  meta.sections =
    (resume.basics.summary ? 1 : 0) +
    (resume.work.length > 0 ? 1 : 0) +
    (resume.education.length > 0 ? 1 : 0) +
    (resume.skills.length > 0 ? 1 : 0) +
    (resume.projects.length > 0 ? 1 : 0);

  const score = tally(100);

  let parsed: IExtracted;
  try {
    parsed = await extractFromPdf(blob);
  } catch (e) {
    findings.push({
      severity: 'error',
      rule: 'Selectable text',
      message: `Could not extract text from the PDF. ${e instanceof Error ? e.message : ''}`,
    });
    return { passed: false, score: 0, findings, meta };
  }

  const normalized = normalize(parsed.text);

  if (parsed.text.trim().length < 200) {
    findings.push({
      severity: 'error',
      rule: 'Selectable text',
      message: 'Extracted text is too short. This may indicate a rasterized PDF.',
    });
    score.deduct(40);
  }

  if (resume.basics.name && !normalized.includes(normalize(resume.basics.name))) {
    findings.push({
      severity: 'error',
      rule: 'Name in text layer',
      message: `Could not find "${resume.basics.name}" in the extracted text.`,
    });
    score.deduct(15);
  }

  if (!resume.basics.email) {
    findings.push({
      severity: 'warning',
      rule: 'Contact essentials',
      message: 'No email address is set — most ATS systems require one.',
    });
    score.deduct(8);
  } else if (!EMAIL_RE.test(resume.basics.email)) {
    findings.push({
      severity: 'warning',
      rule: 'Contact essentials',
      message: `"${resume.basics.email}" does not look like a valid email address.`,
    });
    score.deduct(5);
  } else if (!normalized.includes(normalize(resume.basics.email))) {
    findings.push({
      severity: 'warning',
      rule: 'Contact essentials',
      message: 'Email address not found in extracted text.',
    });
    score.deduct(5);
  }

  if (!resume.basics.phone) {
    findings.push({
      severity: 'warning',
      rule: 'Contact essentials',
      message: 'No phone number is set — most ATS systems will downscore.',
    });
    score.deduct(4);
  } else if (!PHONE_RE.test(resume.basics.phone)) {
    findings.push({
      severity: 'warning',
      rule: 'Contact essentials',
      message: `"${resume.basics.phone}" does not look like a parseable phone number.`,
    });
    score.deduct(3);
  }

  const sectionsToCheck: { flag: boolean; label: string }[] = [
    { flag: !!resume.basics.summary, label: 'Summary' },
    { flag: resume.work.length > 0, label: 'Experience' },
    { flag: resume.education.length > 0, label: 'Education' },
    { flag: resume.skills.length > 0, label: 'Skills' },
  ];
  for (const s of sectionsToCheck) {
    if (s.flag && !normalized.includes(normalize(s.label))) {
      findings.push({
        severity: 'warning',
        rule: 'Standard heading',
        message: `The "${s.label}" heading was expected but not found in the extracted text.`,
      });
      score.deduct(4);
    }
  }

  for (const profile of resume.basics.profiles) {
    if (!URL_RE.test(profile.url)) {
      findings.push({
        severity: 'warning',
        rule: 'Profile URL format',
        message: `Profile link "${profile.url || '(empty)'}" is missing or malformed.`,
      });
      score.deduct(2);
    }
  }

  for (const group of resume.skills) {
    const norm = group.name.trim().toLowerCase();
    if (RESERVED_SECTION_WORDS.has(norm)) {
      findings.push({
        severity: 'warning',
        rule: 'Skill group naming',
        message: `Skill group "${group.name}" collides with a standard resume section — many ATS will read it as a new section. Try "Programming Languages", "Tools & Platforms", "Domain Skills", etc.`,
      });
      score.deduct(6);
    }
  }

  if (resume.work.length === 0) {
    findings.push({
      severity: 'warning',
      rule: 'Work history',
      message: 'No work history. Most ATS scoring engines weight Experience heavily.',
    });
    score.deduct(10);
  }

  let bulletsTotal = 0;
  let bulletsMatched = 0;
  let actionVerbBullets = 0;
  let quantifiedBullets = 0;
  let firstPersonBullets = 0;
  let weakVoiceBullets = 0;
  let passiveBullets = 0;

  for (const entry of resume.work) {
    if (entry.highlights.length === 0) {
      findings.push({
        severity: 'warning',
        rule: 'Bullets per role',
        message: `"${entry.position || entry.name || 'Untitled role'}" has no bullet points. Recruiters and ATS expect 2–5 per role.`,
      });
      score.deduct(3);
    } else if (entry.highlights.length < 2) {
      findings.push({
        severity: 'info',
        rule: 'Bullets per role',
        message: `"${entry.position || entry.name}" has only ${entry.highlights.length} bullet. Aim for 2–5.`,
      });
      score.deduct(1);
    }
    for (const h of entry.highlights) {
      bulletsTotal += 1;
      const plain = stripMarkdown(h);
      const first = plain.split(/[.;:]/)[0].trim();
      if (first.length >= 12 && normalized.includes(normalize(first.slice(0, 60)))) {
        bulletsMatched += 1;
      }
      if (ACTION_VERBS.has(firstWord(plain))) actionVerbBullets += 1;
      if (/\b\d[\d,.]*\s*(%|x|m|k|b|users?|requests?|years?|months?|days?|hours?|engineers?|teams?)\b/i.test(plain)) {
        quantifiedBullets += 1;
      }
      if (FIRST_PERSON_RE.test(plain)) firstPersonBullets += 1;
      if (WEAK_VOICE_PHRASES.some((re) => re.test(plain))) weakVoiceBullets += 1;
      if (PASSIVE_RE.test(plain)) passiveBullets += 1;
    }
  }

  if (bulletsTotal > 0) {
    if (bulletsMatched / bulletsTotal < 0.7) {
      findings.push({
        severity: 'warning',
        rule: 'Bullet recoverability',
        message: `Only ${bulletsMatched} of ${bulletsTotal} sampled bullets were recoverable from the text layer.`,
      });
      score.deduct(8);
    }
    if (actionVerbBullets / bulletsTotal < 0.7) {
      findings.push({
        severity: 'info',
        rule: 'Action verbs',
        message: `Only ${actionVerbBullets} of ${bulletsTotal} bullets begin with a strong action verb (led, built, launched, …).`,
      });
      score.deduct(6);
    }
    if (quantifiedBullets / bulletsTotal < 0.3) {
      findings.push({
        severity: 'info',
        rule: 'Quantified impact',
        message: `Only ${quantifiedBullets} of ${bulletsTotal} bullets include a number, %, or unit. ATS keyword scoring favors quantified wins.`,
      });
      score.deduct(5);
    }
    if (firstPersonBullets > 0) {
      findings.push({
        severity: 'warning',
        rule: 'Third-person voice',
        message: `${firstPersonBullets} bullet(s) use first person ("I", "my"). Resume bullets should be action-led (e.g. "Led", "Built").`,
      });
      score.deduct(3 * firstPersonBullets, 9);
    }
    if (weakVoiceBullets > 0) {
      findings.push({
        severity: 'info',
        rule: 'Strong phrasing',
        message: `${weakVoiceBullets} bullet(s) use weak phrases ("responsible for", "worked on", "duties included"). Rewrite with the impact you delivered.`,
      });
      score.deduct(2 * weakVoiceBullets, 8);
    }
    if (passiveBullets / bulletsTotal > 0.25) {
      findings.push({
        severity: 'info',
        rule: 'Active voice',
        message: `${passiveBullets} of ${bulletsTotal} bullets read passive ("was implemented", "were managed"). Recruiters and ATS weight active voice higher.`,
      });
      score.deduct(4);
    }
  }

  for (const entry of resume.work) {
    const role = entry.position || entry.name || 'Untitled role';
    if (entry.position && !normalized.includes(normalize(entry.position))) {
      findings.push({
        severity: 'warning',
        rule: 'Role in the PDF',
        message: `Role "${entry.position}" was not found in the PDF text layer.`,
      });
      score.deduct(3, 12);
    }
    if (entry.name && !normalized.includes(normalize(entry.name))) {
      findings.push({
        severity: 'warning',
        rule: 'Company in the PDF',
        message: `Company "${entry.name}" (under "${role}") was not found in the PDF text layer.`,
      });
      score.deduct(3, 12);
    }
    if (!entry.startDate) {
      findings.push({
        severity: 'warning',
        rule: 'Role dates',
        message: `"${role}" is missing a start date.`,
      });
      score.deduct(3);
    }
    if (!entry.endDate) {
      findings.push({
        severity: 'info',
        rule: 'Role dates',
        message: `"${role}" has no end date. Use "Present" if you still work there.`,
      });
      score.deduct(1);
    }
  }

  for (const entry of resume.education) {
    if (entry.institution && !normalized.includes(normalize(entry.institution))) {
      findings.push({
        severity: 'warning',
        rule: 'School in the PDF',
        message: `School "${entry.institution}" was not found in the PDF text layer.`,
      });
      score.deduct(3, 9);
    }
  }

  const dateFormats = new Set<string>();
  for (const entry of resume.work) {
    const sf = dateFormat(entry.startDate);
    const ef = dateFormat(entry.endDate);
    if (sf && sf !== 'present') dateFormats.add(sf);
    if (ef && ef !== 'present') dateFormats.add(ef);
  }
  if (dateFormats.size > 1) {
    findings.push({
      severity: 'info',
      rule: 'Date consistency',
      message: `Mixed date formats found (${[...dateFormats].join(', ')}). Keep every role on the same precision (YYYY-MM is recommended).`,
    });
    score.deduct(3);
  }

  if (resume.basics.summary) {
    const summaryLen = stripMarkdown(resume.basics.summary).trim().length;
    if (summaryLen < 80) {
      findings.push({
        severity: 'info',
        rule: 'Summary depth',
        message: `Summary is ${summaryLen} characters. Aim for 200–400 to load it with keywords ATS engines weight heavily.`,
      });
      score.deduct(3);
    }
  } else {
    findings.push({
      severity: 'info',
      rule: 'Summary depth',
      message: 'No summary set. A 2–3 line summary above experience boosts keyword density.',
    });
    score.deduct(2);
  }

  if (resume.skills.reduce((acc, g) => acc + g.keywords.length, 0) < 8) {
    findings.push({
      severity: 'info',
      rule: 'Skill density',
      message: 'Fewer than 8 skills listed. ATS keyword scoring rewards 10–25 well-chosen skills.',
    });
    score.deduct(3);
  }

  if (resume.education.length === 0) {
    findings.push({
      severity: 'info',
      rule: 'Education',
      message: 'No education entry. Most ATS expect at least one.',
    });
    score.deduct(2);
  }

  if (parsed.pageCount > 2) {
    findings.push({
      severity: 'warning',
      rule: 'Length',
      message: `${parsed.pageCount} pages. Most recruiters and ATS scoring engines expect 1–2 pages.`,
    });
    score.deduct(4);
  }
  if (parsed.wordCount < 250) {
    findings.push({
      severity: 'info',
      rule: 'Length',
      message: `${parsed.wordCount} words. Real-content resumes land at 350–700 — ATS keyword scoring favors density.`,
    });
    score.deduct(3);
  } else if (parsed.wordCount > 900) {
    findings.push({
      severity: 'info',
      rule: 'Length',
      message: `${parsed.wordCount} words. Above ~900 the keyword signal/noise ratio drops; tighten lower-impact bullets.`,
    });
    score.deduct(2);
  }

  if (parsed.totalFonts > 0 && parsed.embeddedFonts < parsed.totalFonts) {
    findings.push({
      severity: 'error',
      rule: 'Fonts embedded',
      message: `${parsed.totalFonts - parsed.embeddedFonts} font(s) appear unembedded. Some ATS parsers replace glyphs with question marks when a font isn't embedded.`,
    });
    score.deduct(10);
  }

  if (!parsed.meta.title) {
    findings.push({
      severity: 'info',
      rule: 'PDF metadata',
      message: 'PDF has no Title metadata. Some ATS systems read it as a backup for the candidate name.',
    });
    score.deduct(1);
  }
  if (!parsed.meta.author) {
    findings.push({
      severity: 'info',
      rule: 'PDF metadata',
      message: 'PDF has no Author metadata. Set basics.name and re-export.',
    });
    score.deduct(1);
  }

  const resumeText = [
    resume.basics.summary ?? '',
    resume.work.flatMap((w) => [w.position, w.name, ...w.highlights]).join(' '),
    resume.skills.flatMap((g) => [g.name, ...g.keywords]).join(' '),
    resume.education.flatMap((e) => [e.institution, e.studyType ?? '', e.area ?? '']).join(' '),
    resume.projects.flatMap((p) => [p.name, p.description ?? '', ...p.highlights]).join(' '),
  ].join(' ');
  const resumeSkills = recognizeSkills(resumeText);

  if (options.jobDescription && options.jobDescription.trim().length > 80) {
    const jd = options.jobDescription;
    const jdRawKeywords = collectKeywords(jd);
    const jdSkills = recognizeSkills(jd);

    const taxonomyHits = [...jdSkills].filter((s) => resumeSkills.has(s));
    const taxonomyMisses = [...jdSkills].filter((s) => !resumeSkills.has(s));
    const taxonomyCoverage = jdSkills.size > 0 ? taxonomyHits.length / jdSkills.size : 1;

    const resumeRawKeywords = collectKeywords(resumeText);
    let rawMatched = 0;
    const rawMissing: string[] = [];
    for (const k of jdRawKeywords) {
      if (resumeRawKeywords.has(k)) rawMatched += 1;
      else rawMissing.push(k);
    }
    const rawCoverage = jdRawKeywords.size > 0 ? rawMatched / jdRawKeywords.size : 1;
    const coverage = jdSkills.size >= 5 ? taxonomyCoverage * 0.7 + rawCoverage * 0.3 : rawCoverage;
    const pct = Math.round(coverage * 100);

    if (coverage < 0.4) {
      findings.push({
        severity: 'warning',
        rule: 'Job-description match',
        message: `Resume covers ${pct}% of the job description (${rawMatched}/${jdRawKeywords.size} raw keywords, ${taxonomyHits.length}/${jdSkills.size} recognized skills). Below 50% rarely clears keyword filters.`,
      });
      score.deduct(15);
    } else if (coverage < 0.6) {
      findings.push({
        severity: 'info',
        rule: 'Job-description match',
        message: `Resume covers ${pct}% of the job description (${taxonomyHits.length}/${jdSkills.size} recognized skills). Aim for 60%+ to clear most filters.`,
      });
      score.deduct(8);
    } else if (coverage < 0.75) {
      findings.push({
        severity: 'info',
        rule: 'Job-description match',
        message: `Resume covers ${pct}% of the job description. Add the missing 25% to push past 75%.`,
      });
      score.deduct(3);
    }

    if (taxonomyMisses.length > 0 && taxonomyCoverage < 0.9) {
      const grouped = groupSkillsByCategory(taxonomyMisses);
      const lines: string[] = [];
      for (const [cat, items] of grouped) {
        const label = skillCategoryLabels[cat as keyof typeof skillCategoryLabels] ?? cat;
        const names = items.slice(0, 6).map((s) => s.name).join(', ');
        lines.push(`${label}: ${names}`);
      }
      findings.push({
        severity: 'info',
        rule: 'Missing skills',
        message: `The job description lists skills your resume doesn't mention. ${lines.join(' · ')}`,
      });
    }

    if (rawMissing.length > 0 && rawCoverage < 0.85) {
      const topRaw = rawMissing
        .filter((w) => ![...resumeSkills, ...jdSkills].some((s) => s.name.toLowerCase().includes(w)))
        .slice(0, 10);
      if (topRaw.length > 0) {
        findings.push({
          severity: 'info',
          rule: 'Other job-description terms',
          message: `Other terms from the job description worth mirroring: ${topRaw.join(', ')}.`,
        });
      }
    }
  }

  if (resumeSkills.size < 5) {
    findings.push({
      severity: 'info',
      rule: 'Recognized skills',
      message: `Only ${resumeSkills.size} skills in our taxonomy were recognized in your resume text. Add named tools, frameworks, methodologies — ATS keyword scoring weights recognized industry skills higher than free text.`,
    });
    score.deduct(4);
  }

  const errors = findings.filter((f) => f.severity === 'error');

  return {
    passed: errors.length === 0,
    score: score.value(),
    findings,
    meta,
  };
};
