import { test, expect } from '@playwright/test';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { janeDoeResume } from '../../src/constants/jane-doe-resume';
import type { ResumeVariant } from '../../src/types/resume-variant-type';

const TEMPLATES: ResumeVariant[] = [
  'modern-minimal',
  'classic-serif',
  'tech-sans',
  'executive',
  'compact',
  'editorial',
  'geometric',
  'standard',
  'broadsheet',
  'warmth',
  'refined',
];

const normalize = (s: string): string =>
  s
    .replace(/ /g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()
    .replace(/(?:\b[a-z]\b ){3,}\b[a-z]\b/g, (run) => run.replace(/ /g, ''))
    .replace(/\b[a-z]{1,2}\b(?: [a-z]{1,2}\b){3,}/g, (run) => run.replace(/ /g, ''));

const extractText = async (bytes: Uint8Array): Promise<string> => {
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items.map((item) => ('str' in item ? item.str : '')).join(' '),
    );
  }
  return pages.join(' ');
};

const generatePdfInPage = async (
  page: import('@playwright/test').Page,
  templateId: ResumeVariant,
): Promise<Uint8Array> => {
  const base64 = await page.evaluate(
    async ({ id, resume }) => {
      const moduleUrl = '/src/pdf/generatePdf.ts';
      const mod = (await import(/* @vite-ignore */ moduleUrl)) as {
        generatePdf: (opts: {
          resume: unknown;
          templateId: string;
          theme: Record<string, unknown>;
        }) => Promise<Blob>;
      };
      const blob = await mod.generatePdf({ resume, templateId: id, theme: {} });
      const buf = await blob.arrayBuffer();
      const u8 = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < u8.byteLength; i += 1) bin += String.fromCharCode(u8[i]!);
      return btoa(bin);
    },
    { id: templateId, resume: janeDoeResume },
  );
  return new Uint8Array(Buffer.from(base64, 'base64'));
};

test.describe.configure({ timeout: 180_000 });

test.describe('PDF round-trip (ATS safety)', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'PDF output is engine-independent; one browser is enough',
    );
  });

  for (const templateId of TEMPLATES) {
    test(`${templateId}: every field round-trips through the PDF text layer`, async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const bytes = await generatePdfInPage(page, templateId);
      expect(bytes.byteLength).toBeGreaterThan(2_000);

      const raw = await extractText(bytes);
      const text = normalize(raw);

      expect.soft(text, 'name').toContain('jane doe');
      expect.soft(text, 'label').toContain('senior software engineer');
      expect.soft(text, 'email').toContain('jane@example.com');
      expect.soft(text, 'phone digits').toMatch(/\+?1[\s().-]*415[\s().-]*555[\s().-]*0119/);
      expect.soft(text, 'location').toContain('san francisco');
      expect.soft(text, 'linkedin profile').toContain('linkedin.com/in/janedoe');
      expect.soft(text, 'github profile').toContain('github.com/janedoe');

      for (const heading of ['summary', 'experience', 'education', 'skills']) {
        const looseRe = new RegExp(heading.split('').join('\\s*'), 'i');
        expect.soft(text, `${heading} heading`).toMatch(looseRe);
      }

      expect.soft(text, 'summary opening').toContain(
        'backend-leaning full-stack engineer',
      );

      for (const role of janeDoeResume.work) {
        expect.soft(text, `role ${role.position}`).toContain(normalize(role.position));
        expect.soft(text, `company ${role.name}`).toContain(normalize(role.name));
        for (const bullet of role.highlights) {
          const head = normalize(bullet.split(/[.;:]/)[0]!).slice(0, 60);
          expect.soft(text, `bullet "${head}"`).toContain(head);
        }
      }

      for (const edu of janeDoeResume.education) {
        expect.soft(text, `school ${edu.institution}`).toContain(normalize(edu.institution));
        if (edu.area) expect.soft(text, `area ${edu.area}`).toContain(normalize(edu.area));
      }

      for (const group of janeDoeResume.skills) {
        expect.soft(text, `skill group ${group.name}`).toContain(normalize(group.name));
        for (const kw of group.keywords) {
          expect.soft(text, `skill ${kw}`).toContain(normalize(kw));
        }
      }
    });
  }
});
