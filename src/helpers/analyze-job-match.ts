import type { Resume } from '@/schema/resume';
import type { IJobMatch } from '@/interfaces/i-job-match';
import { recognizeSkills } from './recognize-skills';

const resumeToText = (resume: Resume): string =>
  [
    resume.basics.summary ?? '',
    resume.work.flatMap((w) => [w.position, w.name, ...w.highlights]).join(' '),
    resume.skills.flatMap((g) => [g.name, ...g.keywords]).join(' '),
    resume.projects.flatMap((p) => [p.name, p.description ?? '', ...p.highlights]).join(' '),
    resume.education.flatMap((e) => [e.institution, e.studyType ?? '', e.area ?? '']).join(' '),
  ].join(' ');

export const analyzeJobMatch = (resume: Resume, jobDescription: string): IJobMatch => {
  const resumeSkills = recognizeSkills(resumeToText(resume));
  const resumeNames = new Set([...resumeSkills].map((s) => s.name.toLowerCase()));
  const jdSkills = recognizeSkills(jobDescription);

  const matched: string[] = [];
  const missing: string[] = [];
  for (const s of jdSkills) {
    if (resumeNames.has(s.name.toLowerCase())) matched.push(s.name);
    else missing.push(s.name);
  }

  return {
    coverage: jdSkills.size > 0 ? Math.round((matched.length / jdSkills.size) * 100) : 100,
    matchedSkills: matched,
    missingSkills: missing,
    jdSkillCount: jdSkills.size,
  };
};
