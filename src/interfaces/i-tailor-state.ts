import type { Resume } from '@/schema/resume';
import type { TailorStatus } from '@/types/tailor-status-type';
import type { TailorDecision } from '@/types/tailor-decision-type';
import type { IJobMatch } from '@/interfaces/i-job-match';
import type { ITailorSuggestion } from '@/interfaces/i-tailor-suggestion';

export interface ITailorState {
  status: TailorStatus;
  jobDescription: string;
  jobTitle: string;
  company: string;
  match: IJobMatch | null;
  suggestions: ITailorSuggestion[];
  decisions: Record<string, TailorDecision>;
  error: string | null;
  setJobDescription: (value: string) => void;
  setJobTitle: (value: string) => void;
  setCompany: (value: string) => void;
  analyze: (resume: Resume) => void;
  start: (resume: Resume, focusFindings?: string[]) => Promise<void>;
  stop: () => void;
  decide: (id: string, decision: TailorDecision) => void;
  reset: () => void;
}
