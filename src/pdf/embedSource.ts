import { PDFDocument } from 'pdf-lib';

export const EMBEDDED_SOURCE_NAME = 'resume-builder.json';

export const embedResumeSource = async (pdfBlob: Blob, sourceJson: string): Promise<Blob> => {
  const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  await doc.attach(new TextEncoder().encode(sourceJson), EMBEDDED_SOURCE_NAME, {
    mimeType: 'application/json',
    description: 'Editable résumé source — re-import this PDF to restore template, fonts, and settings.',
    creationDate: new Date(),
    modificationDate: new Date(),
  });
  const out = await doc.save();
  const copy = new Uint8Array(out.byteLength);
  copy.set(out);
  return new Blob([copy], { type: 'application/pdf' });
};
