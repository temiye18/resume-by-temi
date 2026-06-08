import type { ThemeMode } from '@/types/theme-mode-type';
import type { AppliedTheme } from '@/types/applied-theme-type';

export interface IThemeResult {
  mode: ThemeMode;
  applied: AppliedTheme;
  setMode: (mode: ThemeMode) => void;
}
