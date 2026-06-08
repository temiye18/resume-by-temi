import type { Resume } from '@/schema/resume';
import type { IFixtureResume } from '@/interfaces/i-fixture-resume';
import { displayProfileText } from './display-profile';

const composeLocation = (
  loc?: { city?: string; region?: string; countryCode?: string },
): string => {
  if (!loc) return '';
  const parts = [loc.city, loc.region].filter(Boolean);
  return parts.join(', ');
};

export const resumeToFixture = (resume: Resume): IFixtureResume => {
  const basics = resume.basics;
  return {
    name: basics.name,
    label: basics.label ?? '',
    contact: {
      email: basics.email ?? '',
      phone: basics.phone ?? '',
      location: composeLocation(basics.location),
      profiles: basics.profiles.map((p) => ({
        label: displayProfileText(p),
        url: p.url,
      })),
    },
    summary: basics.summary ?? '',
    experience: resume.work.map((w) => ({
      role: w.position,
      company: w.name,
      location: w.location ?? '',
      startDate: w.startDate,
      endDate: w.endDate ?? 'Present',
      bullets: w.highlights.map((text) => ({ text })),
    })),
    education: resume.education.map((e) => ({
      institution: e.institution,
      degree: e.studyType ?? '',
      field: e.area ?? '',
      endDate: e.endDate ?? '',
    })),
    skills: resume.skills.map((s) => ({
      group: s.name,
      items: s.keywords,
    })),
  };
};
