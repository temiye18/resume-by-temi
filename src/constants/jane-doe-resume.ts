import type { Resume } from '@/schema/resume';
import { DEFAULT_SECTION_ORDER, DEFAULT_VISIBLE_SECTIONS } from '@/schema/section-key';

export const janeDoeResume: Resume = {
  basics: {
    name: 'Jane Doe',
    label: 'Senior Software Engineer',
    email: 'jane@example.com',
    phone: '+1 (415) 555 0119',
    url: '',
    summary:
      'Backend-leaning full-stack engineer with seven years building observability and data pipelines for high-traffic consumer products. Comfortable owning a system end to end, from on-call rotation to API contract review.',
    location: {
      city: 'San Francisco',
      region: 'CA',
      countryCode: 'US',
    },
    profiles: [
      {
        network: 'LinkedIn',
        url: 'https://linkedin.com/in/janedoe',
      },
      {
        network: 'GitHub',
        url: 'https://github.com/janedoe',
      },
    ],
  },
  work: [
    {
      id: 'work-acme',
      name: 'Acme Corp',
      position: 'Senior Software Engineer',
      url: '',
      startDate: '2023-01',
      endDate: 'Present',
      location: 'San Francisco, CA',
      highlights: [
        'Led the migration of the billing pipeline off legacy cron workers onto an event-driven Temporal architecture, reducing reconciliation lag from 14 hours to 6 minutes.',
        'Designed the read-path caching layer that absorbed a 4x traffic increase during the 2025 launch week with no customer-visible incident.',
        'Hired and mentored two engineers; both are now leading their own projects.',
      ],
    },
    {
      id: 'work-northwind',
      name: 'Northwind Labs',
      position: 'Software Engineer',
      url: '',
      startDate: '2020-04',
      endDate: '2022-12',
      location: 'Remote',
      highlights: [
        'Built the analytics ingest service handling 18M events per day across 40 customer tenants.',
        'Replaced a hand-rolled retry queue with a tested SQS-backed worker pool, cutting on-call pages by 60 percent.',
      ],
    },
    {
      id: 'work-ironwood',
      name: 'Ironwood Studio',
      position: 'Software Engineer Intern',
      url: '',
      startDate: '2019-06',
      endDate: '2019-08',
      location: 'New York, NY',
      highlights: [
        'Prototyped a real-time collaborative cursor system that shipped as the core feature of the 1.0 release.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-michigan',
      institution: 'University of Michigan',
      url: '',
      area: 'Computer Science',
      studyType: 'B.S.',
      endDate: '2019',
      courses: [],
      highlights: [],
    },
  ],
  skills: [
    {
      id: 'skill-languages',
      name: 'Languages',
      keywords: ['TypeScript', 'Go', 'Python', 'SQL'],
    },
    {
      id: 'skill-systems',
      name: 'Systems',
      keywords: ['Postgres', 'Temporal', 'Kafka', 'Redis', 'AWS'],
    },
    {
      id: 'skill-practices',
      name: 'Practices',
      keywords: ['Distributed systems', 'Observability', 'On-call rotation'],
    },
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
    paperSize: 'LETTER',
  },
};
