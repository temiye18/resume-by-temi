export const SECTION_KEYS = [
  'basics',
  'summary',
  'work',
  'projects',
  'education',
  'skills',
  'certificates',
  'languages',
  'awards',
  'publications',
  'volunteer',
  'interests',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  basics: 'Contact',
  summary: 'Summary',
  work: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certificates: 'Certifications',
  languages: 'Languages',
  awards: 'Awards',
  publications: 'Publications',
  volunteer: 'Volunteer Experience',
  interests: 'Interests',
};

export const DEFAULT_SECTION_ORDER: SectionKey[] = [...SECTION_KEYS];

export const DEFAULT_VISIBLE_SECTIONS: SectionKey[] = [
  'basics',
  'summary',
  'work',
  'projects',
  'education',
  'skills',
];
