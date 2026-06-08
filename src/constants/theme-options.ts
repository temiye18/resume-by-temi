import { Sun03Icon, Moon02Icon, LaptopIcon } from '@hugeicons/core-free-icons';
import type { IThemeOption } from '@/interfaces/i-theme-option';

export const themeOptions: IThemeOption[] = [
  { value: 'light', label: 'Light theme', icon: Sun03Icon },
  { value: 'system', label: 'System theme', icon: LaptopIcon },
  { value: 'dark', label: 'Dark theme', icon: Moon02Icon },
];
