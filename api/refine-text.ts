import { streamRefineVariants, type RefineKind } from '../server/gemini-refine.js';

interface IVercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

interface IVercelResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  write(chunk: string): void;
  end(chunk?: string): void;
  status(code: number): IVercelResponse;
  send(body: string): IVercelResponse;
  flushHeaders?(): void;
}

interface IRequestBody {
  text?: string;
  kind?: RefineKind;
  context?: string;
}

const KINDS: RefineKind[] = ['bullet', 'summary', 'description'];

const normalizeOrigin = (raw: string): string => raw.trim().toLowerCase().replace(/\/+$/, '');

const isOriginAllowed = (origin: string | undefined, allowed: string | undefined): boolean => {
  const list = (allowed ?? '').split(',').map(normalizeOrigin).filter(Boolean);
  if (list.length === 0) return true;
  if (!origin) return false;
  return list.includes(normalizeOrigin(origin));
};

export default async function handler(req: IVercelRequest, res: IVercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const originHeader = req.headers['origin'];
  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  if (!isOriginAllowed(origin, process.env.ALLOWED_ORIGINS)) {
    res.status(403).send('Origin not allowed');
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).send('Server is missing GEMINI_API_KEY');
    return;
  }

  const body = req.body as IRequestBody | undefined;
  const text = body?.text?.trim();
  const kind = body?.kind && KINDS.includes(body.kind) ? body.kind : undefined;
  if (!text || !kind) {
    res.status(400).send('Request must include text and a valid kind');
    return;
  }
  if (text.length > 20_000) {
    res.status(413).send('Text is too long to refine');
    return;
  }

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.flushHeaders?.();

  try {
    for await (const line of streamRefineVariants({ apiKey, text, kind, context: body?.context })) {
      res.write(`${line}\n`);
    }
    res.end();
  } catch (err) {
    res.write(`${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n`);
    res.end();
  }
}
