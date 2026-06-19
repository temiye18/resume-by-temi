export const PRIMARY_MODEL = 'gemini-2.5-flash';
export const FALLBACK_MODEL = 'gemini-2.5-flash-lite';

export type GeminiModel = typeof PRIMARY_MODEL | typeof FALLBACK_MODEL;

export const SYSTEM_INSTRUCTION = `You are extracting structured data from a résumé.

You will receive a single document. Read it carefully — including layout, headings, dates, bullet structure. Produce a JSON object that matches the provided schema exactly.

Field guidance:
- basics.name: the candidate's full name. If unknown, leave empty.
- basics.label: their current title or headline (e.g. "Senior Software Engineer"). Leave empty if not stated.
- basics.email and basics.phone: as written in the document.
- basics.summary: the prose summary or profile paragraph. Plain text; preserve sentence order. Empty if there isn't one.
- basics.location.city/region/countryCode: parse the location line. countryCode must be ISO 3166-1 alpha-2 ("US", "GB", "NG") or omitted.
- basics.profiles: every URL the candidate publishes. For each, set network ("LinkedIn", "GitHub", "X", "Website"), the human-readable username/handle, and the absolute url including the https:// prefix.
- work[]: every role, in the order they appear. position is the job title, name is the company. startDate / endDate must be YYYY, YYYY-MM, or YYYY-MM-DD. Use the literal string "Present" if the role is current.
- work[].highlights: each bullet as one string, leading dash/bullet character removed.
- education[]: each entry. studyType is the degree ("Bachelor of Science"), area is the field ("Computer Science"). score is the GPA or grade ("3.8/4.0", "First Class Honours", "Distinction") if listed; omit otherwise.
- skills[]: group related skills under a name. The name must NOT collide with a standard section heading (avoid "Languages", "Education", "Skills" — use "Programming Languages", "Frameworks & Tools", "Domain Skills").
- projects[]: optional. Same date format rules. Capture every URL the document gives — set "url" for the live/website link and "repository" for the source-code link (GitHub, GitLab, Bitbucket, etc.). If only one URL is listed and it looks like a code host (github.com, gitlab.com, bitbucket.org, codeberg.org, sr.ht), put it in "repository"; otherwise in "url".

Do not invent facts. If a field is not in the document, omit it or leave it empty. Return JSON only, no commentary.`;

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    basics: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        label: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        summary: { type: 'string' },
        location: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            region: { type: 'string' },
            countryCode: { type: 'string' },
          },
        },
        profiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              network: { type: 'string' },
              username: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
    work: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          studyType: { type: 'string' },
          area: { type: 'string' },
          score: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          url: { type: 'string' },
          repository: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

interface ICallArgs {
  apiKey: string;
  mimeType: string;
  data: string;
}

const callOnce = async (model: GeminiModel, args: ICallArgs): Promise<unknown> => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${args.apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Extract structured résumé fields from the attached document.' },
          { inlineData: { mimeType: args.mimeType, data: args.data } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini ${model} returned ${res.status}: ${text.slice(0, 240)}`);
  }

  const payload = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const textPart = payload.candidates?.[0]?.content?.parts?.find(
    (p) => typeof p.text === 'string',
  );
  if (!textPart?.text) {
    throw new Error(`Gemini ${model} returned no text candidate`);
  }
  return JSON.parse(textPart.text);
};

export interface IParseResumeResult {
  resume: unknown;
  modelUsed: GeminiModel;
}

export const parseResumeViaGemini = async (args: ICallArgs): Promise<IParseResumeResult> => {
  let primaryErr: unknown;
  try {
    const resume = await callOnce(PRIMARY_MODEL, args);
    return { resume, modelUsed: PRIMARY_MODEL };
  } catch (err) {
    primaryErr = err;
  }
  try {
    const resume = await callOnce(FALLBACK_MODEL, args);
    return { resume, modelUsed: FALLBACK_MODEL };
  } catch (fallbackErr) {
    throw new Error(
      `Both Gemini models failed. Primary: ${String(primaryErr)} · Fallback: ${String(fallbackErr)}`,
    );
  }
};
