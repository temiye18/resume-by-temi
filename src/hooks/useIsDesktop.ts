import { useSyncExternalStore } from 'react';

const DESKTOP_QUERY = '(min-width: 768px)';

const subscribe = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
};

const getSnapshot = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia(DESKTOP_QUERY).matches;
};

const getServerSnapshot = (): boolean => true;

export const useIsDesktop = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
