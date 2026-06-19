import { type FC, type ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { IDragHandleProps } from '@/interfaces/i-drag-handle-props';

interface ISortableEntryProps {
  id: string;
  children: (handle: IDragHandleProps, isDragging: boolean) => ReactNode;
}

const SortableEntry: FC<ISortableEntryProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
    >
      {children({ attributes, listeners }, isDragging)}
    </div>
  );
};

export default SortableEntry;
