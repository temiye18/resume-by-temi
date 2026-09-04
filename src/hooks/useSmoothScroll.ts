import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouterState } from '@tanstack/react-router';

gsap.registerPlugin(ScrollTrigger);

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

    // Lenis drives the scroll; ScrollTrigger reads from it and shares GSAP's ticker.
    lenis.on('scroll', ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
    };
  }, [pathname]);
};
