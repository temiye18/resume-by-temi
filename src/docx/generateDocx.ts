import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import type { Resume } from '@/schema/resume';
import { formatPdfDateRange } from '@/pdf/format-date-range';
import { stripMarkdown } from '@/helpers';

const FONT = 'Calibri';
const SIZE_NORMAL = 22; // half-points → 11pt
const SIZE_NAME = 36; // 18pt
const SIZE_LABEL = 24; // 12pt
const SIZE_HEADING = 22; // 11pt
const COLOR_INK = '111111';
const COLOR_MUTED = '555555';

const text = (
  content: string,
  options: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {},
): TextRun =>
  new TextRun({
    text: content,
    font: FONT,
    bold: options.bold ?? false,
    italics: options.italics ?? false,
    size: options.size ?? SIZE_NORMAL,
    color: options.color ?? COLOR_INK,
  });

const composeContact = (resume: Resume): string => {
  const parts: string[] = [];
  if (resume.basics.location?.city || resume.basics.location?.region) {
    parts.push(
      [resume.basics.location.city, resume.basics.location.region].filter(Boolean).join(', '),
    );
  }
  if (resume.basics.email) parts.push(resume.basics.email);
  if (resume.basics.phone) parts.push(resume.basics.phone);
  for (const p of resume.basics.profiles) parts.push(p.url.replace(/^https?:\/\//, ''));
  return parts.join(' · ');
};

const sectionHeading = (label: string): Paragraph =>
  new Paragraph({
    spacing: { before: 240, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_INK, space: 1 },
    },
    children: [
      text(label.toUpperCase(), {
        bold: true,
        size: SIZE_HEADING,
      }),
    ],
  });

const bulletParagraph = (content: string): Paragraph =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [text(content)],
  });

export const generateDocx = async (resume: Resume): Promise<Blob> => {
  const children: Paragraph[] = [];

  // Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [text(resume.basics.name, { bold: true, size: SIZE_NAME })],
    }),
  );
  if (resume.basics.label) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [text(resume.basics.label, { size: SIZE_LABEL, color: COLOR_MUTED })],
      }),
    );
  }
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [text(composeContact(resume), { color: COLOR_MUTED })],
    }),
  );

  // Summary
  if (resume.basics.summary) {
    children.push(sectionHeading('Summary'));
    children.push(new Paragraph({ children: [text(stripMarkdown(resume.basics.summary))] }));
  }

  // Experience
  if (resume.work.length > 0) {
    children.push(sectionHeading('Experience'));
    for (const entry of resume.work) {
      const headerRuns = [
        text(entry.position, { bold: true }),
        text(' · '),
        text(entry.name, { color: COLOR_MUTED }),
      ];
      if (entry.location) {
        headerRuns.push(text(' · '), text(entry.location, { color: COLOR_MUTED }));
      }
      headerRuns.push(
        text('  '),
        text(formatPdfDateRange(entry.startDate, entry.endDate), { color: COLOR_MUTED }),
      );
      children.push(
        new Paragraph({
          spacing: { before: 80, after: entry.summary ? 0 : 40 },
          children: headerRuns,
        }),
      );
      if (entry.summary) {
        children.push(
          new Paragraph({ spacing: { after: 40 }, children: [text(entry.summary)] }),
        );
      }
      for (const h of entry.highlights) {
        children.push(bulletParagraph(stripMarkdown(h)));
      }
    }
  }

  // Projects
  if (resume.projects.length > 0) {
    children.push(sectionHeading('Projects'));
    for (const entry of resume.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 0 },
          children: [
            text(entry.name, { bold: true }),
            text('  '),
            text(formatPdfDateRange(entry.startDate, entry.endDate), { color: COLOR_MUTED }),
          ],
        }),
      );
      const projectLinks: string[] = [];
      if (entry.url) {
        projectLinks.push(entry.url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
      }
      if (entry.repository) {
        projectLinks.push(entry.repository.replace(/^https?:\/\//, '').replace(/\/$/, ''));
      }
      if (projectLinks.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 0 },
            children: [text(projectLinks.join(' · '), { color: COLOR_MUTED })],
          }),
        );
      }
      if (entry.description) {
        children.push(
          new Paragraph({ spacing: { after: 40 }, children: [text(entry.description)] }),
        );
      }
      for (const h of entry.highlights) {
        children.push(bulletParagraph(stripMarkdown(h)));
      }
    }
  }

  // Education
  if (resume.education.length > 0) {
    children.push(sectionHeading('Education'));
    for (const entry of resume.education) {
      const degree = [entry.studyType, entry.area].filter(Boolean).join(' ');
      const headerRuns = [
        text(entry.institution, { bold: true }),
        text(' · '),
        text(degree, { color: COLOR_MUTED }),
      ];
      if (entry.score) {
        headerRuns.push(text(' · '), text(`GPA: ${entry.score}`, { color: COLOR_MUTED }));
      }
      headerRuns.push(text('  '), text(entry.endDate ?? '', { color: COLOR_MUTED }));
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: headerRuns,
        }),
      );
      for (const h of entry.highlights) {
        children.push(bulletParagraph(stripMarkdown(h)));
      }
    }
  }

  // Skills
  if (resume.skills.length > 0) {
    children.push(sectionHeading('Skills'));
    for (const group of resume.skills) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            text(`${group.name}: `, { bold: true }),
            text(group.keywords.join(', ')),
          ],
        }),
      );
    }
  }

  // Certifications
  if (resume.certificates.length > 0) {
    children.push(sectionHeading('Certifications'));
    for (const entry of resume.certificates) {
      const runs = [text(entry.name, { bold: true })];
      const tail: string[] = [];
      if (entry.issuer) tail.push(entry.issuer);
      if (entry.url) {
        tail.push(entry.url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
      }
      if (entry.date) tail.push(entry.date);
      if (tail.length > 0) {
        runs.push(text(' · '), text(tail.join(' · '), { color: COLOR_MUTED }));
      }
      children.push(
        new Paragraph({ spacing: { after: 40 }, children: runs }),
      );
    }
  }

  // Languages
  if (resume.languages.length > 0) {
    children.push(sectionHeading('Languages'));
    for (const entry of resume.languages) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            text(`${entry.language}`, { bold: true }),
            entry.fluency ? text(` · ${entry.fluency}`) : text(''),
          ],
        }),
      );
    }
  }

  // Volunteer
  if (resume.volunteer.length > 0) {
    children.push(sectionHeading('Volunteer Experience'));
    for (const entry of resume.volunteer) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            text(entry.position, { bold: true }),
            text(' · '),
            text(entry.organization, { color: COLOR_MUTED }),
            text('  '),
            text(formatPdfDateRange(entry.startDate, entry.endDate), { color: COLOR_MUTED }),
          ],
        }),
      );
      for (const h of entry.highlights) {
        children.push(bulletParagraph(stripMarkdown(h)));
      }
    }
  }

  const doc = new Document({
    creator: resume.basics.name,
    title: `${resume.basics.name} Resume`,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_NORMAL },
        },
        heading1: {
          run: { font: FONT, size: SIZE_HEADING, bold: true },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
};
