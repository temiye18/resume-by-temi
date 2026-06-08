import { type FC } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import MobileGuard from '@/components/MobileGuard/MobileGuard';
import EditorShell from '@/routes/editor/-components/EditorShell/EditorShell';

const EditorPage: FC = () => {
  const { resumeId } = Route.useParams();
  return (
    <MobileGuard>
      <EditorShell resumeId={resumeId} />
    </MobileGuard>
  );
};

export const Route = createFileRoute('/editor/$resumeId')({
  component: EditorPage,
});
