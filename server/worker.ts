import { parseResumeViaGemini } from './gemini-parse';
import { streamTailorLines } from './gemini-tailor';

interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS?: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

interface ITailorBody {
  resumeJson?: string;
  jobDescription?: string;
  jobTitle?: string;
  company?: string;
  focusFindings?: string[];
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

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const handleParseResume = async (request: Request, env: Env): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }

  const origin = request.headers.get('origin');
  if (!isOriginAllowed(origin, env.ALLOWED_ORIGINS)) {
    return new Response('Origin not allowed', { status: 403 });
  }
  if (!env.GEMINI_API_KEY) {
    return new Response('Server is missing GEMINI_API_KEY', { status: 500 });
  }

  let body: IRequestBody;
  try {
    body = (await request.json()) as IRequestBody;
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
      apiKey: env.GEMINI_API_KEY,
      mimeType: body.mimeType,
      data: body.data,
    });
    return json(200, result);
  } catch (err) {
    return json(502, { error: err instanceof Error ? err.message : String(err) });
  }
};

const handleTailorResume = async (request: Request, env: Env): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  const origin = request.headers.get('origin');
  if (!isOriginAllowed(origin, env.ALLOWED_ORIGINS)) {
    return new Response('Origin not allowed', { status: 403 });
  }
  if (!env.GEMINI_API_KEY) {
    return new Response('Server is missing GEMINI_API_KEY', { status: 500 });
  }

  let body: ITailorBody;
  try {
    body = (await request.json()) as ITailorBody;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }
  if (!body.resumeJson || !body.jobDescription) {
    return new Response('Request must include resumeJson and jobDescription', { status: 400 });
  }
  if (body.resumeJson.length + body.jobDescription.length > 200_000) {
    return new Response('Resume and job description are too large', { status: 413 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const line of streamTailorLines({
          apiKey: env.GEMINI_API_KEY,
          resumeJson: body.resumeJson!,
          jobDescription: body.jobDescription!,
          jobTitle: body.jobTitle,
          company: body.company,
          focusFindings: body.focusFindings,
        })) {
          controller.enqueue(encoder.encode(`${line}\n`));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`${JSON.stringify({ error: message })}\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/parse-resume') {
      return handleParseResume(request, env);
    }
    if (url.pathname === '/api/tailor-resume') {
      return handleTailorResume(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
