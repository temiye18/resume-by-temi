import { type FC, useEffect } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import { easeOutExpo } from '@/constants';
import type { AiParseStage } from '@/types/ai-parse-stage-type';
import AiParseShell from './AiParseShell';

interface IAiParseLoaderProps {
  open: boolean;
  stage: AiParseStage;
  fileName?: string;
  fileSize?: number;
  fallbackEngaged?: boolean;
  onCancel?: () => void;
}

const AiParseLoader: FC<IAiParseLoaderProps> = ({
  open,
  stage,
  fileName,
  fileSize,
  fallbackEngaged,
  onCancel,
}) => {
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label="Parsing your résumé"
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-bg/90 backdrop-blur-[3px]" aria-hidden />
          <m.div
            className="relative w-full max-w-[760px]"
            initial={{ y: 12, scale: 0.985, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.985, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.36, ease: easeOutExpo }}
          >
            <AiParseShell
              stage={stage}
              fileName={fileName}
              fileSize={fileSize}
              fallbackEngaged={fallbackEngaged}
              onCancel={onCancel}
            />
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AiParseLoader;
