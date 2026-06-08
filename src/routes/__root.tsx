import { createRootRoute, Outlet } from '@tanstack/react-router';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';
import { useSmoothScroll } from '@/hooks';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useSmoothScroll();
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <Outlet />
      </MotionConfig>
    </LazyMotion>
  );
}
