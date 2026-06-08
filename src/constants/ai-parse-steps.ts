import type { AiParseStage } from '@/types/ai-parse-stage-type';

interface IAiParseStep {
  key: AiParseStage;
  caption: string;
}

export const aiParseSteps: IAiParseStep[] = [
  { key: 'uploaded', caption: 'Receiving document' },
  { key: 'reading', caption: 'Reading layout' },
  { key: 'extracting', caption: 'Extracting fields' },
  { key: 'done', caption: 'Opening editor' },
];
