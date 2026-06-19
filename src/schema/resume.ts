import { z } from 'zod';
import { nanoid } from 'nanoid';
import { DEFAULT_SECTION_ORDER, DEFAULT_VISIBLE_SECTIONS } from './section-key';

const IsoDate = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$|^Present$/);

const Profile = z.object({
  network: z.string(),
  username: z.string().optional(),
  url: z.string().url(),
});

const Basics = z.object({
  name: z.string().min(1),
  label: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  summary: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      region: z.string().optional(),
      countryCode: z.string().length(2).optional(),
    })
    .optional(),
  profiles: z.array(Profile).default([]),
});

const Work = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  url: z.string().url().optional().or(z.literal('')),
  startDate: IsoDate,
  endDate: IsoDate.optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

const Education = z.object({
  id: z.string(),
  institution: z.string(),
  url: z.string().url().optional().or(z.literal('')),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: IsoDate.optional(),
  endDate: IsoDate.optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
});

const Skill = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

const Project = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  startDate: IsoDate.optional(),
  endDate: IsoDate.optional(),
  url: z.string().url().optional().or(z.literal('')),
  repository: z.string().url().optional().or(z.literal('')),
  roles: z.array(z.string()).default([]),
  entity: z.string().optional(),
  type: z.string().optional(),
});

const Certificate = z.object({
  id: z.string(),
  name: z.string(),
  date: IsoDate.optional(),
  issuer: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

const Language = z.object({
  id: z.string(),
  language: z.string(),
  fluency: z.string().optional(),
});

const Volunteer = z.object({
  id: z.string(),
  organization: z.string(),
  position: z.string(),
  url: z.string().url().optional().or(z.literal('')),
  startDate: IsoDate.optional(),
  endDate: IsoDate.optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

const Award = z.object({
  id: z.string(),
  title: z.string(),
  date: IsoDate.optional(),
  awarder: z.string().optional(),
  summary: z.string().optional(),
});

const Publication = z.object({
  id: z.string(),
  name: z.string(),
  publisher: z.string().optional(),
  releaseDate: IsoDate.optional(),
  url: z.string().url().optional().or(z.literal('')),
  summary: z.string().optional(),
});

const Reference = z.object({
  id: z.string().default(() => nanoid()),
  name: z.string(),
  reference: z.string(),
});

const Interest = z.object({
  id: z.string(),
  name: z.string(),
  keywords: z.array(z.string()).default([]),
});

const CustomSection = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
});

const PaperSize = z.enum(['LETTER', 'A4']);

const XBuilder = z.object({
  schemaVersion: z.number().default(1),
  sectionOrder: z.array(z.string()).default(() => [...DEFAULT_SECTION_ORDER]),
  customSections: z.array(CustomSection).default([]),
  visibleSections: z.array(z.string()).default(() => [...DEFAULT_VISIBLE_SECTIONS]),
  paperSize: PaperSize.default('LETTER'),
});

export const ResumeSchema = z.object({
  basics: Basics,
  work: z.array(Work).default([]),
  education: z.array(Education).default([]),
  skills: z.array(Skill).default([]),
  projects: z.array(Project).default([]),
  certificates: z.array(Certificate).default([]),
  languages: z.array(Language).default([]),
  volunteer: z.array(Volunteer).default([]),
  awards: z.array(Award).default([]),
  publications: z.array(Publication).default([]),
  references: z.array(Reference).default([]),
  interests: z.array(Interest).default([]),
  'x-builder': XBuilder.default(() => XBuilder.parse({})),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type ResumeBasics = z.infer<typeof Basics>;
export type ResumeWork = z.infer<typeof Work>;
export type ResumeEducation = z.infer<typeof Education>;
export type ResumeSkill = z.infer<typeof Skill>;
export type ResumeProject = z.infer<typeof Project>;
export type ResumeCertificate = z.infer<typeof Certificate>;
export type ResumeLanguage = z.infer<typeof Language>;
export type ResumeVolunteer = z.infer<typeof Volunteer>;
export type ResumeAward = z.infer<typeof Award>;
export type ResumePublication = z.infer<typeof Publication>;
export type ResumeReference = z.infer<typeof Reference>;
export type ResumeInterest = z.infer<typeof Interest>;
export type ResumeCustomSection = z.infer<typeof CustomSection>;
export type ResumePaperSize = z.infer<typeof PaperSize>;

const LETTER_LOCALE_PREFIXES = ['en-US', 'en-CA', 'es-MX', 'en-PH', 'fil-PH'];

export const detectPaperSize = (): ResumePaperSize => {
  if (typeof navigator === 'undefined') return 'LETTER';
  const locale = navigator.language;
  return LETTER_LOCALE_PREFIXES.some((l) => locale.toLowerCase().startsWith(l.toLowerCase()))
    ? 'LETTER'
    : 'A4';
};

export const emptyResume = (): Resume => ({
  basics: {
    name: 'Your Name',
    label: 'Your Title',
    email: 'you@example.com',
    phone: '+1 (555) 555 0100',
    location: { city: 'City', region: 'State', countryCode: 'US' },
    profiles: [
      { network: 'LinkedIn', url: 'https://linkedin.com/in/you' },
      { network: 'GitHub', url: 'https://github.com/you' },
    ],
    summary: 'A concise 2-3 sentence summary of who you are and what you do.',
  },
  work: [
    {
      id: nanoid(),
      name: 'Company Name',
      position: 'Job Title',
      startDate: '2023-01',
      endDate: 'Present',
      location: 'City, State',
      highlights: [
        'Quantified achievement using a strong action verb (e.g., reduced infra cost by 30%).',
        'Second accomplishment that highlights scope and impact.',
      ],
    },
  ],
  education: [
    {
      id: nanoid(),
      institution: 'University Name',
      studyType: 'Bachelor of Science',
      area: 'Computer Science',
      endDate: '2022',
      highlights: [],
      courses: [],
    },
  ],
  skills: [
    { id: nanoid(), name: 'Programming Languages', keywords: ['TypeScript', 'Python', 'Go'] },
    { id: nanoid(), name: 'Frameworks & Tools', keywords: ['React', 'Node.js'] },
  ],
  projects: [],
  certificates: [],
  languages: [],
  volunteer: [],
  awards: [],
  publications: [],
  references: [],
  interests: [],
  'x-builder': {
    schemaVersion: 1,
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    customSections: [],
    visibleSections: [...DEFAULT_VISIBLE_SECTIONS],
    paperSize: detectPaperSize(),
  },
});

export const newId = (): string => nanoid();
