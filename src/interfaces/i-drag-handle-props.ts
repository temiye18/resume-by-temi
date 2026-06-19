import type { useSortable } from '@dnd-kit/sortable';

export interface IDragHandleProps {
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
}
