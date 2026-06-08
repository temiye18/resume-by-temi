import type { IconSvgElement } from '@hugeicons/react';

export interface IEditorSidebarTab {
  icon: IconSvgElement;
  label: string;
  active?: boolean;
}

export interface IEditorSectionSummary {
  name: string;
  hint: string;
}
