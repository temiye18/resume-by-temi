import { useStore } from 'zustand';
import { useResumeTemporal } from '@/store/resumeStore';

export const useResumeHistory = () => {
  const undo = useStore(useResumeTemporal, (s) => s.undo);
  const redo = useStore(useResumeTemporal, (s) => s.redo);
  const canUndo = useStore(useResumeTemporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useResumeTemporal, (s) => s.futureStates.length > 0);
  return { undo, redo, canUndo, canRedo };
};
