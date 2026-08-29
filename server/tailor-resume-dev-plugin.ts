import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { streamTailorLines } from './gemini-tailor';

interface IRequestBody {
  resumeJson?: string;
  jobDescription?: string;
  jobTitle?: string;
  company?: string;
  focusFindings?: string[];
}

const readBody = async (req: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf-8');
};

export const tailorResumeDevPlugin = (): Plugin => {
  let apiKey: string | undefined;

  return {
    name: 'tailor-resume-dev',
    apply: 'serve',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/tailor-resume', async (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        if (!apiKey) {
          res.statusCode = 500;
          res.end('AI tailoring needs GEMINI_API_KEY. Add it to .env (without the VITE_ prefix) and restart pnpm dev.');
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
        if (!body.resumeJson || !body.jobDescription) {
          res.statusCode = 400;
          res.end('Request must include resumeJson and jobDescription');
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        try {
          for await (const line of streamTailorLines({
            apiKey,
            resumeJson: body.resumeJson,
            jobDescription: body.jobDescription,
            jobTitle: body.jobTitle,
            company: body.company,
            focusFindings: body.focusFindings,
          })) {
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
