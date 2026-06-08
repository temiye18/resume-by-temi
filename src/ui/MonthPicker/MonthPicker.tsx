import {
  type FC,
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/cn';
import { easeOutExpo } from '@/constants';

interface IMonthPickerProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  allowPresent?: boolean;
  presentLabel?: string;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const POPOVER_WIDTH = 256;
const POPOVER_HEIGHT_ESTIMATE = 280;
const VIEWPORT_MARGIN = 8;

const parseValue = (value: string): { year: number; month: number } | null => {
  if (!value) return null;
  const parsed = parse(value, 'yyyy-MM', new Date());
  if (isValid(parsed)) {
    return { year: parsed.getFullYear(), month: parsed.getMonth() };
  }
  const yearOnly = parse(value, 'yyyy', new Date());
  if (isValid(yearOnly)) {
    return { year: yearOnly.getFullYear(), month: 0 };
  }
  return null;
};

interface IPlacement {
  top: number;
  left: number;
  origin: string;
}

const computePlacement = (triggerRect: DOMRect): IPlacement => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - triggerRect.bottom;
  const placeAbove = spaceBelow < POPOVER_HEIGHT_ESTIMATE + VIEWPORT_MARGIN
    && triggerRect.top > POPOVER_HEIGHT_ESTIMATE + VIEWPORT_MARGIN;
  const top = placeAbove
    ? triggerRect.top - POPOVER_HEIGHT_ESTIMATE - 6
    : triggerRect.bottom + 6;

  let left = triggerRect.left;
  if (left + POPOVER_WIDTH + VIEWPORT_MARGIN > vw) {
    left = Math.max(VIEWPORT_MARGIN, triggerRect.right - POPOVER_WIDTH);
  }
  left = Math.max(VIEWPORT_MARGIN, left);

  return {
    top,
    left,
    origin: placeAbove ? 'bottom left' : 'top left',
  };
};

const MonthPicker: FC<IMonthPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'YYYY-MM',
  allowPresent = false,
  presentLabel = 'Present',
}) => {
  const id = `mp-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [placement, setPlacement] = useState<IPlacement | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const parsed = useMemo(() => parseValue(value), [value]);
  const today = useMemo(() => new Date(), []);
  const initialViewYear = parsed?.year ?? today.getFullYear();
  const [viewYear, setViewYear] = useState(initialViewYear);

  useEffect(() => {
    if (open) {
      setViewYear(parsed?.year ?? today.getFullYear());
    }
  }, [open, parsed, today]);

  useEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    const update = () => {
      if (!triggerRef.current) return;
      setPlacement(computePlacement(triggerRef.current.getBoundingClientRect()));
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePopover = popoverRef.current?.contains(target);
      if (!insideTrigger && !insidePopover) {
        setOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const commitDraft = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange('');
      return;
    }
    if (allowPresent && trimmed.toLowerCase() === 'present') {
      onChange('Present');
      return;
    }
    const p = parseValue(trimmed);
    if (p) {
      onChange(format(new Date(p.year, p.month, 1), 'yyyy-MM'));
      return;
    }
    onChange(trimmed);
  };

  const handleInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitDraft(draft);
      setOpen(false);
    } else if (e.key === 'ArrowDown' && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handlePickMonth = (monthIndex: number) => {
    const next = format(new Date(viewYear, monthIndex, 1), 'yyyy-MM');
    onChange(next);
    setOpen(false);
  };

  const isPresent = value === 'Present';
  const selectedMonth = parsed?.month ?? -1;
  const selectedYear = parsed?.year ?? -1;
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const popover = open && placement ? (
    <AnimatePresence>
      <m.div
        ref={popoverRef}
        initial={{ opacity: 0, y: -4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.16, ease: easeOutExpo }}
        role="dialog"
        aria-label={`${label} picker`}
        style={{
          position: 'fixed',
          top: placement.top,
          left: placement.left,
          width: POPOVER_WIDTH,
          transformOrigin: placement.origin,
        }}
        className="z-50 rounded-md border border-border bg-bg p-3 shadow-2"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-ink transition-colors duration-fast ease-out-quart"
            aria-label="Previous year"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.8} />
          </button>
          <span className="font-display text-sm font-semibold text-ink tabular-nums">
            {viewYear}
          </span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-ink transition-colors duration-fast ease-out-quart"
            aria-label="Next year"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1">
          {MONTHS_SHORT.map((mLabel, idx) => {
            const isSelected = !isPresent && idx === selectedMonth && viewYear === selectedYear;
            const isCurrent = idx === currentMonth && viewYear === currentYear;
            return (
              <button
                key={mLabel}
                type="button"
                onClick={() => handlePickMonth(idx)}
                className={cn(
                  'h-8 rounded-sm font-sans text-sm transition-colors duration-fast ease-out-quart',
                  isSelected
                    ? 'bg-accent text-on-accent'
                    : isCurrent
                      ? 'border border-border-strong text-ink hover:bg-surface'
                      : 'text-ink hover:bg-surface',
                )}
                aria-pressed={isSelected}
              >
                {mLabel}
              </button>
            );
          })}
        </div>

        {allowPresent ? (
          <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-border pt-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={isPresent}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                  onChange('Present');
                  setOpen(false);
                } else {
                  onChange('');
                }
              }}
              className="h-3.5 w-3.5 cursor-pointer accent-[var(--color-accent)]"
            />
            <span className="font-sans">I currently work here</span>
          </label>
        ) : null}
      </m.div>
    </AnimatePresence>
  ) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-2xs uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      <div
        ref={triggerRef}
        className={cn(
          'flex h-8 items-center rounded-sm border bg-bg transition-colors duration-fast ease-out-quart',
          open ? 'border-accent' : 'border-border hover:border-border-strong',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={isPresent ? presentLabel : draft}
          disabled={isPresent}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
          onBlur={() => {
            if (!isPresent) commitDraft(draft);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKey}
          placeholder={placeholder}
          className={cn(
            'h-full flex-1 min-w-0 bg-transparent pl-2.5 pr-1 font-sans text-sm text-ink placeholder:text-muted focus:outline-none',
            isPresent && 'italic text-muted',
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
        />
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) inputRef.current?.focus();
          }}
          className="flex h-full w-8 items-center justify-center text-muted hover:text-ink transition-colors duration-fast ease-out-quart"
          aria-label={`Open ${label} picker`}
          tabIndex={-1}
        >
          <HugeiconsIcon icon={Calendar03Icon} size={14} strokeWidth={1.8} />
        </button>
      </div>
      {popover ? createPortal(popover, document.body) : null}
    </div>
  );
};

export default MonthPicker;
