import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { parseResumeViaGemini } from './gemini-parse';

const readBody = async (req: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString('utf-8');
};

const send = (res: ServerResponse, status: number, body: unknown): void => {
  res.statusCode = status;
  if (typeof body === 'string') {
    res.end(body);
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

export const parseResumeDevPlugin = (): Plugin => {
  let apiKey: string | undefined;

  return {
    name: 'parse-resume-dev',
    apply: 'serve',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/parse-resume', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        if (!apiKey) {
          send(
            res,
            500,
            'Smart parse needs GEMINI_API_KEY. Add it to .env (without the VITE_ prefix) and restart pnpm dev.',
          );
          return;
        }
        try {
          const raw = await readBody(req);
          const body = JSON.parse(raw) as {
            data?: string;
            mimeType?: string;
            fileName?: string;
          };
          if (!body.data || !body.mimeType) {
            send(res, 400, 'Request must include data and mimeType');
            return;
          }
          const approxBytes = Math.ceil((body.data.length * 3) / 4);
          if (approxBytes > 12 * 1024 * 1024) {
            send(res, 413, 'File too large; under 12MB please');
            return;
          }
          const result = await parseResumeViaGemini({
            apiKey,
            mimeType: body.mimeType,
            data: body.data,
          });
          send(res, 200, result);
        } catch (err) {
          send(res, 502, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    },
  };
};
