import type { IFixtureResume } from '@/interfaces/i-fixture-resume';

export const janeDoe: IFixtureResume = {
  name: 'Jane Doe',
  label: 'Senior Software Engineer',
  contact: {
    email: 'jane@example.com',
    phone: '+1 (415) 555 0119',
    location: 'San Francisco, CA',
    profiles: [
      { label: 'linkedin.com/in/janedoe', url: 'https://linkedin.com/in/janedoe' },
      { label: 'github.com/janedoe', url: 'https://github.com/janedoe' },
    ],
  },
  summary:
    'Backend-leaning full-stack engineer with seven years building observability and data pipelines for high-traffic consumer products. Comfortable owning a system end to end, from on-call rotation to API contract review.',
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'Acme Corp',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: 'Present',
      bullets: [
        {
          text: 'Led the migration of the billing pipeline off legacy cron workers onto an event-driven Temporal architecture, reducing reconciliation lag from 14 hours to 6 minutes.',
        },
        {
          text: 'Designed the read-path caching layer that absorbed a 4x traffic increase during the 2025 launch week with no customer-visible incident.',
        },
        {
          text: 'Hired and mentored two engineers; both are now leading their own projects.',
        },
      ],
    },
    {
      role: 'Software Engineer',
      company: 'Northwind Labs',
      location: 'Remote',
      startDate: '2020-04',
      endDate: '2022-12',
      bullets: [
        {
          text: 'Built the analytics ingest service handling 18M events per day across 40 customer tenants.',
        },
        {
          text: 'Replaced a hand-rolled retry queue with a tested SQS-backed worker pool, cutting on-call pages by 60 percent.',
        },
      ],
    },
    {
      role: 'Software Engineer Intern',
      company: 'Ironwood Studio',
      location: 'New York, NY',
      startDate: '2019-06',
      endDate: '2019-08',
      bullets: [
        {
          text: 'Prototyped a real-time collaborative cursor system that shipped as the core feature of the 1.0 release.',
        },
      ],
    },
  ],
  education: [
    {
      institution: 'University of Michigan',
      degree: 'B.S.',
      field: 'Computer Science',
      endDate: '2019',
    },
  ],
  skills: [
    { group: 'Languages', items: ['TypeScript', 'Go', 'Python', 'SQL'] },
    { group: 'Systems', items: ['Postgres', 'Temporal', 'Kafka', 'Redis', 'AWS'] },
    { group: 'Practices', items: ['Distributed systems', 'Observability', 'On-call rotation'] },
  ],
};
