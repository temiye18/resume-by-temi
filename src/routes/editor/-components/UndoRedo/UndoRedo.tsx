import { type FC, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UndoIcon, RedoIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/cn';
import { useResumeHistory } from '@/hooks';

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl';

const isEditableTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.isContentEditable ||
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    !!el.closest('input, textarea, [contenteditable="true"]')
  );
};

const UndoRedo: FC = () => {
  const { undo, redo, canUndo, canRedo } = useResumeHistory();

  useEffect(() => {
    // Global editor shortcut — a real window keydown source, not derivable in render.
    // Skips editable fields so Tiptap / inputs keep their own granular undo.
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      const isUndo = key === 'z' && !e.shiftKey;
      const isRedo = (key === 'z' && e.shiftKey) || (key === 'y' && e.ctrlKey && !e.metaKey);
      if (!isUndo && !isRedo) return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      if (isRedo) redo();
      else undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return (
    <div className="flex items-center">
      <HistoryButton
        label={`Undo (${mod}Z)`}
        icon={UndoIcon}
        disabled={!canUndo}
        onClick={() => undo()}
      />
      <HistoryButton
        label={`Redo (${mod}⇧Z)`}
        icon={RedoIcon}
        disabled={!canRedo}
        onClick={() => redo()}
      />
    </div>
  );
};

interface IHistoryButtonProps {
  label: string;
  icon: Parameters<typeof HugeiconsIcon>[0]['icon'];
  disabled: boolean;
  onClick: () => void;
}

const HistoryButton: FC<IHistoryButtonProps> = ({ label, icon, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-sm transition-colors duration-fast ease-out-quart focus-visible:outline-none',
      disabled
        ? 'cursor-not-allowed text-faint'
        : 'text-ink-soft hover:bg-surface hover:text-ink',
    )}
  >
    <HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} />
  </button>
);

export default UndoRedo;
