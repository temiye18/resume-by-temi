import type { RefineKind } from '@/types/refine-kind-type';

interface IRefineStreamRequest {
  text: string;
  kind: RefineKind;
  context?: string;
  signal?: AbortSignal;
}

const ENDPOINT = '/api/refine-text';

const toVariant = (line: string): string | null => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('{')) return null;
  let obj: { text?: unknown; error?: unknown };
  try {
    obj = JSON.parse(trimmed) as { text?: unknown; error?: unknown };
  } catch {
    return null;
  }
  if (typeof obj.error === 'string') throw new Error(obj.error);
  return typeof obj.text === 'string' && obj.text.trim() ? obj.text.trim() : null;
};

export async function* streamRefine(req: IRefineStreamRequest): AsyncGenerator<string> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: req.signal,
    body: JSON.stringify({ text: req.text, kind: req.kind, context: req.context }),
  });

  if (!res.ok || !res.body) {
    const message = await res.text().catch(() => '');
    throw new Error(message || `AI refine failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl = buf.indexOf('\n');
    while (nl >= 0) {
      const variant = toVariant(buf.slice(0, nl));
      buf = buf.slice(nl + 1);
      if (variant) yield variant;
      nl = buf.indexOf('\n');
    }
  }
  const tail = toVariant(buf);
  if (tail) yield tail;
}
