import type { ThemeMode } from '@/types/theme-mode-type';

export interface ISettingsState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}
