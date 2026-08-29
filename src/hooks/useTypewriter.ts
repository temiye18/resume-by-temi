import { useEffect, useRef, useState } from 'react';

export const useTypewriter = (
  text: string,
  active: boolean,
  charsPerSecond = 140,
): string => {
  const [count, setCount] = useState(() => (active ? 0 : text.length));
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setCount(text.length);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const n = Math.min(text.length, Math.floor(((t - start) / 1000) * charsPerSecond));
      setCount(n);
      if (n < text.length) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [text, active, charsPerSecond]);

  return text.slice(0, count);
};
