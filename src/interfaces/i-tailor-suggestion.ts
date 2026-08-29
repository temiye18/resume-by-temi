import type { TailorOp } from '@/types/tailor-op-type';

export interface ITailorSuggestion {
  id: string;
  op: TailorOp;
  workId?: string;
  projectId?: string;
  index?: number;
  group?: string;
  skill?: string;
  before: string;
  after: string;
  reason: string;
  confirm: boolean;
  placeholder: boolean;
}
