export type SkillCategory =
  | 'programming-languages'
  | 'web-frontend'
  | 'web-backend'
  | 'mobile'
  | 'databases'
  | 'cloud-devops'
  | 'data-ml'
  | 'design-ux'
  | 'marketing'
  | 'sales'
  | 'finance'
  | 'business-ops'
  | 'leadership-soft'
  | 'healthcare'
  | 'security'
  | 'product-mgmt'
  | 'qa-testing';

export type SkillKind =
  | 'language'
  | 'framework'
  | 'library'
  | 'tool'
  | 'platform'
  | 'database'
  | 'concept'
  | 'methodology'
  | 'certification'
  | 'soft';

export interface ISkillEntry {
  name: string;
  aliases?: string[];
  category: SkillCategory;
  kind: SkillKind;
}
