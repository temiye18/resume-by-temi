import { useEffect } from 'react';
import Lenis from 'lenis';
import { useRouterState } from '@tanstack/react-router';

const DISABLED_ROUTE_PATTERNS = [/^\/editor(\/|$)/];

const isDisabledRoute = (pathname: string): boolean =>
  DISABLED_ROUTE_PATTERNS.some((re) => re.test(pathname));

const easeOutExpoSoft = (t: number): number =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t));

export const useSmoothScroll = (): void => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDisabledRoute(pathname)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: easeOutExpoSoft,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      anchors: {
        offset: -80,
        easing: easeOutExpoSoft,
      },
    });

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [pathname]);
};
