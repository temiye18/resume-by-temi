import Dexie, { type Table } from 'dexie';
import type { IResumeRecord } from '@/interfaces/i-resume-record';

interface IAppSetting {
  key: string;
  value: unknown;
}

class ResumeBuilderDB extends Dexie {
  resumes!: Table<IResumeRecord, string>;
  settings!: Table<IAppSetting, string>;

  constructor() {
    super('resume-builder');
    this.version(1).stores({
      resumes: 'id, name, updatedAt',
      settings: 'key',
    });
  }
}

export const db = new ResumeBuilderDB();
