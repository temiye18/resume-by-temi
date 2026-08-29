export const PRIMARY_MODEL = 'gemini-2.5-flash';
export const FALLBACK_MODEL = 'gemini-2.5-flash-lite';

export type GeminiTailorModel = typeof PRIMARY_MODEL | typeof FALLBACK_MODEL;

export const SYSTEM_INSTRUCTION = `You are a senior resume editor tailoring a candidate's existing resume to one specific job description so it clears Applicant Tracking Systems (ATS) and reads sharply to a recruiter.

You receive: (1) the candidate's resume as JSON — each work entry has an "id" and a "highlights" array (bullets addressed by their 0-based index); each project has an "id"; (2) the target job description; (3) optionally a list of weaknesses an automated ATS checker already found. Your job is to propose focused edits that close those gaps and mirror the language of the job description.

ABSOLUTE HONESTY RULES — these are non-negotiable:
- NEVER invent employers, job titles, dates, degrees, certifications, metrics, or technologies the candidate has not demonstrably used.
- Only rephrase, strengthen, and re-order facts that are ALREADY present in the resume. You may sharpen weak phrasing ("responsible for" -> a strong action verb), surface a real detail more prominently, and mirror a job-description keyword ONLY when the candidate's own text already supports it.
- If a bullet would be stronger with a number the resume does not contain, keep it truthful and insert the literal token [add metric] where the candidate should fill one in, and set "placeholder": true.
- If the job description requires a skill the resume never mentions, DO NOT assume the candidate has it. Emit an "add-skill" suggestion with "confirm": true and a reason that says it is only for them to add if they genuinely have it.

OUTPUT FORMAT — NDJSON, and nothing else:
- Emit ONE JSON object per line. No prose, no markdown, no code fences, no wrapping array.
- Each object is one suggestion. Keep the list focused: 6-14 of the highest-impact edits, most impactful first.
- Shapes (include only the fields listed for that op):
  {"op":"rewrite-summary","after":"<full rewritten summary, 2-3 sentences>","reason":"<short why, name the ATS gap or JD keyword>","placeholder":false}
  {"op":"replace-bullet","workId":"<id>","index":<n>,"after":"<rewritten bullet>","reason":"<short why>","placeholder":false}
  {"op":"add-bullet","workId":"<id>","after":"<new truthful bullet, may use [add metric]>","reason":"<short why>","placeholder":true}
  {"op":"replace-project-bullet","projectId":"<id>","index":<n>,"after":"<rewritten bullet>","reason":"<short why>","placeholder":false}
  {"op":"add-skill","group":"<existing or sensible skill group name>","skill":"<one skill from the JD>","reason":"The JD calls for this — add only if you have it.","confirm":true}
- "reason" is always short (max ~14 words). Reference the real gap ("no action verb", "JD requires Kubernetes", "unquantified").
- Only reference work "id"s, project "id"s, and highlight indices that exist in the provided resume. Never fabricate an id.
- Bullets must be one line, start with a strong past-tense action verb, and contain no leading dash or bullet character.`;

export const ATS_SYSTEM_INSTRUCTION = `You are a senior resume editor improving a candidate's existing resume so it scores higher on an Applicant Tracking System (ATS) check.

You receive: (1) the candidate's resume as JSON — each work entry has an "id" and a "highlights" array (bullets addressed by their 0-based index); each project has an "id"; (2) a list of specific issues an automated ATS checker found. Propose focused edits that fix those issues.

ABSOLUTE HONESTY RULES — non-negotiable:
- NEVER invent employers, titles, dates, degrees, certifications, metrics, or technologies the candidate has not stated.
- Only rephrase, strengthen, and re-order facts already present: sharpen weak phrasing, lead bullets with a strong past-tense action verb, use active voice, drop first person, and tighten wordy lines.
- If a bullet would be stronger with a number the resume does not contain, keep it truthful and insert the literal token [add metric] where the candidate should fill one in, and set "placeholder": true.

Map each edit to a reported issue — unquantified bullets -> add [add metric]; passive/weak/first-person phrasing -> rewrite active and third person; thin summary -> expand to 2-3 sentences; wordy or too long -> tighten.

OUTPUT FORMAT — NDJSON, and nothing else:
- Emit ONE JSON object per line. No prose, no markdown, no code fences, no wrapping array.
- 6-14 of the highest-impact edits, most impactful first.
- Shapes (include only the fields listed for that op):
  {"op":"rewrite-summary","after":"<full rewritten summary, 2-3 sentences>","reason":"<which ATS issue this closes>","placeholder":false}
  {"op":"replace-bullet","workId":"<id>","index":<n>,"after":"<rewritten bullet>","reason":"<short why>","placeholder":false}
  {"op":"add-bullet","workId":"<id>","after":"<new truthful bullet, may use [add metric]>","reason":"<short why>","placeholder":true}
  {"op":"replace-project-bullet","projectId":"<id>","index":<n>,"after":"<rewritten bullet>","reason":"<short why>"}
  {"op":"add-skill","group":"<existing or sensible skill group name>","skill":"<skill the resume already demonstrates>","reason":"...","confirm":true}
- "reason" is short (max ~14 words) and names the ATS issue it closes.
- Only reference work "id"s, project "id"s, and highlight indices that exist. Bullets are one line, start with a strong past-tense action verb, and have no leading dash.`;

export interface ITailorArgs {
  apiKey: string;
  resumeJson: string;
  jobDescription?: string;
  jobTitle?: string;
  company?: string;
  focusFindings?: string[];
  mode?: 'job' | 'ats';
}

const buildRequestBody = (args: ITailorArgs): unknown => {
  if (args.mode === 'ats') {
    const findings =
      args.focusFindings && args.focusFindings.length > 0
        ? args.focusFindings.map((f) => `- ${f}`).join('\n')
        : '- General ATS quality: strong action verbs, quantified impact, active voice, a fuller summary.';
    const userText = `ATS issues to fix:\n${findings}\n\nCANDIDATE RESUME (JSON):\n${args.resumeJson}\n\nReturn NDJSON suggestions now.`;
    return {
      systemInstruction: { parts: [{ text: ATS_SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.35, responseMimeType: 'text/plain' },
    };
  }

  const targetLine = [args.jobTitle, args.company].filter(Boolean).join(' at ');
  const findings =
    args.focusFindings && args.focusFindings.length > 0
      ? `\n\nAn automated ATS checker flagged these weaknesses — prioritise closing them:\n- ${args.focusFindings.join('\n- ')}`
      : '';
  const userText = `Target role: ${targetLine || '(not specified)'}\n\nJOB DESCRIPTION:\n${args.jobDescription ?? ''}\n\nCANDIDATE RESUME (JSON):\n${args.resumeJson}${findings}\n\nReturn NDJSON suggestions now.`;
  return {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: { temperature: 0.35, responseMimeType: 'text/plain' },
  };
};

const extractDelta = (sseData: string): string => {
  try {
    const payload = JSON.parse(sseData) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const parts = payload.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p) => p.text ?? '').join('');
  } catch {
    return '';
  }
};

const cleanLine = (raw: string): string | null => {
  const line = raw.trim().replace(/^```(?:json|ndjson)?$/i, '').replace(/,$/, '');
  if (!line || line === '[' || line === ']' || line === '```') return null;
  if (!line.startsWith('{')) return null;
  try {
    return JSON.stringify(JSON.parse(line));
  } catch {
    return null;
  }
};

async function* readGeminiStream(
  model: GeminiTailorModel,
  args: ITailorArgs,
): AsyncGenerator<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${args.apiKey}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequestBody(args)),
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

export async function* streamTailorLines(args: ITailorArgs): AsyncGenerator<string> {
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
