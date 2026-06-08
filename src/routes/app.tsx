import { type FC } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import SiteHeader from '@/components/SiteHeader/SiteHeader';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Dashboard from '@/routes/-components/Dashboard/Dashboard';

const AppPage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <SiteHeader />
      <main className="flex-1">
        <Dashboard />
      </main>
      <SiteFooter />
    </div>
  );
};

export const Route = createFileRoute('/app')({
  component: AppPage,
});
