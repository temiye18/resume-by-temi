import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { ResumeFontFamily } from '@/types/resume-theme-type';
import type { ResumePaperSize } from '@/schema/resume';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface IPdfStyleHints {
  headingFont?: ResumeFontFamily;
  bodyFont?: ResumeFontFamily;
  paperSize?: ResumePaperSize;
}

// The theme-selectable families (mono excluded — templates only use it for metadata).
const FAMILIES: ResumeFontFamily[] = [
  'Inter',
  'Source Sans 3',
  'Lato',
  'Open Sans',
  'Source Serif 4',
  'EB Garamond',
  'Lora',
  'Merriweather',
];

const WEIGHTS =
  /(regular|bold|italic|medium|semibold|light|book|oblique|thin|black|extralight|extrabold)/g;

const normalize = (raw: string): string =>
  raw
    .toLowerCase()
    .replace(/^[a-z]{6}\+/, '')
    .replace(WEIGHTS, '')
    .replace(/[^a-z0-9]/g, '');

const CATALOG = new Map(FAMILIES.map((f) => [normalize(f), f]));

const matchFamily = (raw?: string): ResumeFontFamily | undefined =>
  raw ? CATALOG.get(normalize(raw)) : undefined;

interface IFontObjs {
  _objs?: Record<string, { data?: { name?: string; loadedName?: string } }>;
}

export const detectPdfStyle = async (blob: Blob): Promise<IPdfStyleHints> => {
  try {
    const buffer = await blob.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

    const page1 = await doc.getPage(1);
    const width = Math.abs(page1.view[2] - page1.view[0]);
    const paperSize: ResumePaperSize =
      Math.abs(width - 595.28) < Math.abs(width - 612) ? 'A4' : 'LETTER';

    const charsByFamily = new Map<ResumeFontFamily, number>();
    let maxSize = 0;
    let headingFont: ResumeFontFamily | undefined;

    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const objs = (page.commonObjs as unknown as IFontObjs)._objs ?? {};
      for (const item of content.items) {
        if (!('str' in item) || !item.str.trim()) continue;
        const fontData = objs[item.fontName]?.data;
        const family = matchFamily(fontData?.name ?? fontData?.loadedName);
        if (!family) continue;
        const size = Math.hypot(item.transform[2], item.transform[3]);
        charsByFamily.set(family, (charsByFamily.get(family) ?? 0) + item.str.length);
        if (size > maxSize) {
          maxSize = size;
          headingFont = family;
        }
      }
    }

    let bodyFont: ResumeFontFamily | undefined;
    let mostChars = 0;
    for (const [family, chars] of charsByFamily) {
      if (chars > mostChars) {
        mostChars = chars;
        bodyFont = family;
      }
    }

    return {
      paperSize,
      ...(headingFont ? { headingFont } : {}),
      ...(bodyFont ? { bodyFont } : {}),
    };
  } catch {
    return {};
  }
};
