import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { streamRefineVariants, type RefineKind } from './gemini-refine';

interface IRequestBody {
  text?: string;
  kind?: RefineKind;
  context?: string;
}

const KINDS: RefineKind[] = ['bullet', 'summary', 'description'];

const readBody = async (req: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf-8');
};

export const refineTextDevPlugin = (): Plugin => {
  let apiKey: string | undefined;

  return {
    name: 'refine-text-dev',
    apply: 'serve',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/refine-text', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        if (!apiKey) {
          res.statusCode = 500;
          res.end('AI refine needs GEMINI_API_KEY. Add it to .env (without the VITE_ prefix) and restart pnpm dev.');
          return;
        }
        let body: IRequestBody;
        try {
          body = JSON.parse(await readBody(req)) as IRequestBody;
        } catch {
          res.statusCode = 400;
          res.end('Invalid JSON body');
          return;
        }
        const text = body.text?.trim();
        const kind = body.kind && KINDS.includes(body.kind) ? body.kind : undefined;
        if (!text || !kind) {
          res.statusCode = 400;
          res.end('Request must include text and a valid kind');
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        try {
          for await (const line of streamRefineVariants({ apiKey, text, kind, context: body.context })) {
            (res as ServerResponse).write(`${line}\n`);
          }
          res.end();
        } catch (err) {
          res.write(`${JSON.stringify({ error: err instanceof Error ? err.message : String(err) })}\n`);
          res.end();
        }
      });
    },
  };
};
