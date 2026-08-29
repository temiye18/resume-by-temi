import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { EMBEDDED_SOURCE_NAME } from './embedSource';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

interface IPdfAttachment {
  filename?: string;
  content?: Uint8Array;
}

export const readEmbeddedSource = async (blob: Blob): Promise<string | null> => {
  try {
    const buffer = await blob.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
    const attachments = (await doc.getAttachments()) as Record<string, IPdfAttachment> | null;
    if (!attachments) return null;
    for (const key of Object.keys(attachments)) {
      const att = attachments[key];
      const isMatch = att?.filename === EMBEDDED_SOURCE_NAME || key === EMBEDDED_SOURCE_NAME;
      if (isMatch && att?.content) {
        return new TextDecoder().decode(att.content);
      }
    }
    return null;
  } catch {
    return null;
  }
};
