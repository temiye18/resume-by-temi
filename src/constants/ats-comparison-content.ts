import { janeDoe } from '@/constants/jane-doe';

export const atsExtractedLines: string[] = [
  `${janeDoe.name}`,
  `${janeDoe.label}`,
  '',
  `${janeDoe.contact.location} · ${janeDoe.contact.email} · ${janeDoe.contact.phone}`,
  ...janeDoe.contact.profiles.map((p) => p.label),
  '',
  'SUMMARY',
  janeDoe.summary,
  '',
  'EXPERIENCE',
  ...janeDoe.experience.flatMap((entry) => [
    `${entry.role}, ${entry.company} (${entry.startDate} – ${entry.endDate})`,
    ...entry.bullets.map((b) => `  • ${b.text}`),
    '',
  ]),
  'EDUCATION',
  ...janeDoe.education.map(
    (entry) => `${entry.degree} ${entry.field}, ${entry.institution} (${entry.endDate})`,
  ),
  '',
  'SKILLS',
  ...janeDoe.skills.map((g) => `${g.group}: ${g.items.join(', ')}`),
];

export const atsVerifiedItems: string[] = [
  'Name and contact details',
  '5 sections in reading order',
  '6 dated work entries',
  '8 quantified bullets',
  'Skills grouped as plain text',
];
