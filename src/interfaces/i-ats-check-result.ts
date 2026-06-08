export type AtsFindingSeverity = 'error' | 'warning' | 'info';

export interface IAtsFinding {
  severity: AtsFindingSeverity;
  rule: string;
  message: string;
}

export interface IAtsCheckResult {
  passed: boolean;
  score: number;
  findings: IAtsFinding[];
  meta: {
    sections: number;
    bullets: number;
    sizeKb: number;
  };
}
