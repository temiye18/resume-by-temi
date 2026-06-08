import { parseResumeViaGemini } from '../server/gemini-parse';

interface IVercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

interface IVercelResponse {
  status(code: number): IVercelResponse;
  json(body: unknown): IVercelResponse;
  send(body: string): IVercelResponse;
}

interface IRequestBody {
  fileName?: string;
  mimeType?: string;
  data?: string;
}

const normalizeOrigin = (raw: string): string =>
  raw.trim().toLowerCase().replace(/\/+$/, '');

const isOriginAllowed = (
  origin: string | undefined,
  allowed: string | undefined,
): boolean => {
  const list = (allowed ?? '')
    .split(',')
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);
  if (list.length === 0) return true;
  if (!origin) return false;
  return list.includes(normalizeOrigin(origin));
};

export default async function handler(
  req: IVercelRequest,
  res: IVercelResponse,
): Promise<void> {
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
  if (!body?.data || !body?.mimeType) {
    res.status(400).send('Request must include data and mimeType');
    return;
  }

  const approxBytes = Math.ceil((body.data.length * 3) / 4);
  if (approxBytes > 12 * 1024 * 1024) {
    res.status(413).send('File too large; under 12MB please');
    return;
  }

  try {
    const result = await parseResumeViaGemini({
      apiKey,
      mimeType: body.mimeType,
      data: body.data,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
