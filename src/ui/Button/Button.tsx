import { type ButtonHTMLAttributes, type FC, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ButtonIntent } from '@/types/button-intent-type';
import type { ButtonSize } from '@/types/button-size-type';

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: ButtonIntent;
  size?: ButtonSize;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
}

const intentClasses: Record<ButtonIntent, string> = {
  primary:
    'bg-accent text-accent-on hover:bg-accent-hover active:translate-y-px shadow-1 active:shadow-none',
  secondary:
    'bg-bg text-ink border border-border hover:bg-surface hover:border-border-strong active:translate-y-px',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface hover:text-ink',
  destructive: 'bg-danger text-bg hover:brightness-95 active:translate-y-px',
  link: 'bg-transparent text-accent hover:text-accent-hover underline underline-offset-4 decoration-1 px-0',
};

const sizeClasses: Record<ButtonSize, string> = {
  compact: 'h-7 px-2.5 text-sm gap-1.5',
  default: 'h-9 px-3 text-sm gap-2',
  large: 'h-11 px-4 text-base gap-2',
};

const ButtonImpl = forwardRef<HTMLButtonElement, IButtonProps>(function Button(
  {
    intent = 'secondary',
    size = 'default',
    className,
    children,
    iconLeading,
    iconTrailing,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-sm font-medium tracking-[0] whitespace-nowrap',
        'transition-[background-color,color,border-color,transform,box-shadow] duration-fast ease-out-quart',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-none',
        intentClasses[intent],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {iconLeading ? (
        <span className="inline-flex shrink-0 items-center" aria-hidden>
          {iconLeading}
        </span>
      ) : null}
      <span>{children}</span>
      {iconTrailing ? (
        <span className="inline-flex shrink-0 items-center" aria-hidden>
          {iconTrailing}
        </span>
      ) : null}
    </button>
  );
});

export const Button: FC<IButtonProps> = ButtonImpl;
