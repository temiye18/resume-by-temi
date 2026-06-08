import { createFileRoute } from '@tanstack/react-router';
import SiteHeader from '@/components/SiteHeader/SiteHeader';
import SiteFooter from '@/components/SiteFooter/SiteFooter';
import Hero from './-components/Hero/Hero';
import EditorPreview from './-components/EditorPreview/EditorPreview';
import AtsComparison from './-components/AtsComparison/AtsComparison';
import TemplateGallery from './-components/TemplateGallery/TemplateGallery';
import Principles from './-components/Principles/Principles';
import Closing from './-components/Closing/Closing';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <EditorPreview />
        <AtsComparison />
        <TemplateGallery />
        <Principles />
        <Closing />
      </main>
      <SiteFooter />
    </div>
  );
}
