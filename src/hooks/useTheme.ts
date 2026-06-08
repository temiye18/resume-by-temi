import { useSyncExternalStore } from 'react';
import { useSettingsStore, applyThemeToDom, resolveAppliedTheme } from '@/store/settingsStore';
import type { ThemeMode } from '@/types/theme-mode-type';
import type { AppliedTheme } from '@/types/applied-theme-type';
import type { IThemeResult } from '@/interfaces/i-theme-result';

const subscribe = (callback: () => void): (() => void) => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
};

const getServerSnapshot = (): boolean => false;

export const useTheme = (): IThemeResult => {
  const mode = useSettingsStore((s) => s.themeMode);
  const setMode = useSettingsStore((s) => s.setThemeMode);

  const systemDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    getServerSnapshot,
  );

  const applied: AppliedTheme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  return {
    mode,
    applied,
    setMode: (next: ThemeMode) => {
      setMode(next);
      applyThemeToDom(next);
    },
  };
};

export const initializeTheme = (): void => {
  const stored = localStorage.getItem('resume-builder.settings');
  let mode: ThemeMode = 'system';
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { themeMode?: ThemeMode } };
      if (parsed.state?.themeMode) mode = parsed.state.themeMode;
    } catch {
      mode = 'system';
    }
  }
  applyThemeToDom(mode);

  if (mode === 'system') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      const current = useSettingsStore.getState().themeMode;
      if (current === 'system') applyThemeToDom('system');
    });
  }
};

export { resolveAppliedTheme };
