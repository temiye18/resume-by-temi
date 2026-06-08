import { type FC } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import EditorShell from '@/routes/editor/-components/EditorShell/EditorShell';

const EditorPage: FC = () => {
  const { resumeId } = Route.useParams();
  return <EditorShell resumeId={resumeId} />;
};

export const Route = createFileRoute('/editor/$resumeId')({
  component: EditorPage,
});
