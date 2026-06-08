import {
  LeftToRightListBulletIcon,
  DashboardSquare01Icon,
  Download04Icon,
  TextFontIcon,
} from '@hugeicons/core-free-icons';
import type { IEditorSidebarTab, IEditorSectionSummary } from '@/interfaces/i-editor-mock';

export const editorSidebarTabs: IEditorSidebarTab[] = [
  { icon: LeftToRightListBulletIcon, label: 'Sections', active: true },
  { icon: DashboardSquare01Icon, label: 'Template' },
  { icon: TextFontIcon, label: 'Theme' },
  { icon: Download04Icon, label: 'Export' },
];

export const editorSectionSummaries: IEditorSectionSummary[] = [
  { name: 'Contact', hint: 'Header' },
  { name: 'Summary', hint: '1 paragraph' },
  { name: 'Experience', hint: '3 entries' },
  { name: 'Education', hint: '1 entry' },
  { name: 'Skills', hint: '3 groups' },
];
