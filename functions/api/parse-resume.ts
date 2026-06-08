import { parseResumeViaGemini } from '../../server/gemini-parse';

interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}

interface IRequestBody {
  fileName?: string;
  mimeType?: string;
  data?: string;
}

const isOriginAllowed = (origin: string | null, allowed: string | undefined): boolean => {
  if (!origin) return false;
  const list = (allowed ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return true;
  return list.includes(origin);
};

const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const origin = ctx.request.headers.get('origin');
  if (!isOriginAllowed(origin, ctx.env.ALLOWED_ORIGINS)) {
    return new Response('Origin not allowed', { status: 403 });
  }
  if (!ctx.env.GEMINI_API_KEY) {
    return new Response('Server is missing GEMINI_API_KEY', { status: 500 });
  }

  let body: IRequestBody;
  try {
    body = (await ctx.request.json()) as IRequestBody;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }
  if (!body.data || !body.mimeType) {
    return new Response('Request must include data and mimeType', { status: 400 });
  }
  const approxBytes = Math.ceil((body.data.length * 3) / 4);
  if (approxBytes > 12 * 1024 * 1024) {
    return new Response('File too large; under 12MB please', { status: 413 });
  }

  try {
    const result = await parseResumeViaGemini({
      apiKey: ctx.env.GEMINI_API_KEY,
      mimeType: body.mimeType,
      data: body.data,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export { onRequestPost };
