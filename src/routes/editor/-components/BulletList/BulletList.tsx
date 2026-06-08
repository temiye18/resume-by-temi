import { type FC } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import RichTextField from '@/components/RichTextField/RichTextField';

interface IBulletListProps {
  bullets: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

const BulletList: FC<IBulletListProps> = ({ bullets, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-2 select-none text-sm text-muted" aria-hidden>
            •
          </span>
          <RichTextField
            value={b}
            onChange={(next) => {
              const arr = bullets.slice();
              arr[i] = next;
              onChange(arr);
            }}
            placeholder={placeholder ?? 'A quantified achievement…'}
            singleLine={false}
            className="flex-1"
            minHeight={36}
          />
          <button
            type="button"
            onClick={() => onChange(bullets.filter((_, j) => j !== i))}
            className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-xs text-muted transition-colors duration-fast ease-out-quart hover:bg-danger-soft hover:text-danger"
            aria-label="Delete bullet"
          >
            <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={1.5} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...bullets, ''])}
        className="inline-flex h-7 items-center gap-1.5 self-start rounded-sm border border-dashed border-border px-2 text-xs text-muted transition-colors duration-fast ease-out-quart hover:border-border-strong hover:text-ink-soft"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={1.5} />
        Add bullet
      </button>
    </div>
  );
};

export default BulletList;
