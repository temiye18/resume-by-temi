import type { IconSvgElement } from '@hugeicons/react';
import type { ThemeMode } from '@/types/theme-mode-type';

export interface IThemeOption {
  value: ThemeMode;
  label: string;
  icon: IconSvgElement;
}
