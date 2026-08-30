export const PRIMARY_MODEL = 'gemini-3.7-flash';
export const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

export type GeminiRefineModel = typeof PRIMARY_MODEL | typeof FALLBACK_MODEL;
export type RefineKind = 'bullet' | 'summary' | 'description';

const KIND_RULES: Record<RefineKind, string> = {
  bullet:
    'This is one résumé bullet. Each variant is ONE line, starts with a strong past-tense action verb, uses no first person ("I", "my"), cuts filler, and stays under ~30 words. If the user included a number or metric, keep it exactly.',
  summary:
    'This is a résumé summary. Each variant is 2–3 tight sentences in third person (no "I"/"my"), professional and specific, foregrounding the strengths the user already stated.',
  description:
    'This is a short descriptive paragraph. Each variant is clear, active, concrete prose with the filler and hedging removed. Keep it brief.',
};

export const buildSystemInstruction = (kind: RefineKind): string =>
  `You refine a SINGLE field from a résumé into TWO distinct improved variants, so the user can pick. You never invent anything.

Rules:
- Preserve every fact, name, date, number, and technology the user wrote. Never add facts, metrics, tools, or claims they did not state.
- Stay in the same language as the input.
- Keep any light markdown the user used (**bold**, *italic*, [text](url)).
- ${KIND_RULES[kind]}
- The two variants must both follow the rules but differ in wording or emphasis (e.g. one tighter, one more descriptive) so the choice is meaningful.

Output format — NDJSON, and nothing else:
- Emit EXACTLY two lines. Each line is one JSON object: {"text":"<refined variant>"}.
- No preamble, no markdown code fences, no numbering, no extra lines.`;

export interface IRefineArgs {
  apiKey: string;
  text: string;
  kind: RefineKind;
  context?: string;
}

const buildRequestBody = (kind: RefineKind, text: string, context?: string): unknown => {
  const ctx = context ? `Context: ${context}\n\n` : '';
  return {
    systemInstruction: { parts: [{ text: buildSystemInstruction(kind) }] },
    contents: [{ role: 'user', parts: [{ text: `${ctx}Field to refine:\n${text}` }] }],
    generationConfig: { temperature: 0.45, responseMimeType: 'text/plain' },
  };
};

const extractDelta = (sseData: string): string => {
  try {
    const payload = JSON.parse(sseData) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return (payload.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  } catch {
    return '';
  }
};

const cleanLine = (raw: string): string | null => {
  const line = raw.trim().replace(/^```(?:json|ndjson)?$/i, '').replace(/,$/, '');
  if (!line.startsWith('{')) return null;
  try {
    const obj = JSON.parse(line) as { text?: unknown };
    if (typeof obj.text !== 'string' || !obj.text.trim()) return null;
    return JSON.stringify({ text: obj.text.trim() });
  } catch {
    return null;
  }
};

async function* readGeminiStream(
  model: GeminiRefineModel,
  args: IRefineArgs,
): AsyncGenerator<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${args.apiKey}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequestBody(args.kind, args.text, args.context)),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini ${model} returned ${res.status}: ${text.slice(0, 240)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = '';
  let ndjson = '';

  const drain = function* (): Generator<string> {
    let nl = ndjson.indexOf('\n');
    while (nl >= 0) {
      const candidate = cleanLine(ndjson.slice(0, nl));
      ndjson = ndjson.slice(nl + 1);
      if (candidate) yield candidate;
      nl = ndjson.indexOf('\n');
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    sseBuffer += decoder.decode(value, { stream: true });
    let sep = sseBuffer.indexOf('\n');
    while (sep >= 0) {
      const rawLine = sseBuffer.slice(0, sep).trim();
      sseBuffer = sseBuffer.slice(sep + 1);
      if (rawLine.startsWith('data:')) {
        ndjson += extractDelta(rawLine.slice(5).trim());
        yield* drain();
      }
      sep = sseBuffer.indexOf('\n');
    }
  }
  const tail = cleanLine(ndjson);
  if (tail) yield tail;
}

export async function* streamRefineVariants(args: IRefineArgs): AsyncGenerator<string> {
  let emitted = 0;
  try {
    for await (const line of readGeminiStream(PRIMARY_MODEL, args)) {
      emitted += 1;
      yield line;
    }
  } catch (primaryErr) {
    if (emitted > 0) throw primaryErr;
    for await (const line of readGeminiStream(FALLBACK_MODEL, args)) {
      yield line;
    }
  }
}
