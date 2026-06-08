import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types/theme-mode-type';
import type { AppliedTheme } from '@/types/applied-theme-type';
import type { ISettingsState } from '@/interfaces/i-settings-state';

export const useSettingsStore = create<ISettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    { name: 'resume-builder.settings' },
  ),
);

export const resolveAppliedTheme = (mode: ThemeMode): AppliedTheme => {
  if (mode !== 'system') return mode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyThemeToDom = (mode: ThemeMode): void => {
  const applied = resolveAppliedTheme(mode);
  const root = document.documentElement;
  if (applied === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};
