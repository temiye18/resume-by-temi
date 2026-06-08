import { type FC } from 'react';
import { cn } from '@/lib/cn';
import type { WordmarkSize } from '@/types/wordmark-size-type';

interface IWordmarkProps {
  size?: WordmarkSize;
  className?: string;
}

const Wordmark: FC<IWordmarkProps> = ({ size = 'sm', className }) => {
  const display = size === 'md' ? 'text-md' : 'text-sm';
  return (
    <a
      href="/"
      className={cn(
        'inline-flex items-baseline gap-2 text-ink no-underline rounded-xs',
        'transition-colors duration-fast ease-out-quart hover:text-accent',
        className,
      )}
      aria-label="Résumé, home"
    >
      <span className={cn('font-display italic font-medium leading-none', display)}>Résumé</span>
      <span className="font-sans text-xs text-muted leading-none">by Temi</span>
    </a>
  );
};

export default Wordmark;
