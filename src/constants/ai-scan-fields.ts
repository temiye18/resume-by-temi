interface IDetectedField {
  label: string;
  top: number;
  height: number;
  detectAt: number;
}

export const aiScanFields: IDetectedField[] = [
  { label: 'NAME', top: 8, height: 12, detectAt: 0.06 },
  { label: 'TITLE', top: 24, height: 8, detectAt: 0.14 },
  { label: 'CONTACT', top: 36, height: 8, detectAt: 0.22 },
  { label: 'SUMMARY', top: 48, height: 14, detectAt: 0.32 },
  { label: 'EXPERIENCE', top: 66, height: 22, detectAt: 0.5 },
  { label: 'EDUCATION', top: 90, height: 12, detectAt: 0.72 },
  { label: 'SKILLS', top: 104, height: 10, detectAt: 0.86 },
];
