import { createRootRoute, Outlet } from '@tanstack/react-router';
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <Outlet />
      </MotionConfig>
    </LazyMotion>
  );
}
