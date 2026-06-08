#!/usr/bin/env node
// Resume Builder PreToolUse quality hook.
//
// Reads the JSON tool-call payload from stdin (Edit/Write/MultiEdit),
// runs the file path + new content through project-specific rules from
// CLAUDE.md / ATS-COMPLIANCE.md, and surfaces a nudge via stderr +
// exit code 2 when an antipattern is detected.
//
// Per-session dedupe at ~/.claude/resume-builder-quality-state-<session>.json
// keeps the same (file, rule) pair from re-firing on every keystroke.
// Disable entirely: ENABLE_RESUME_BUILDER_QUALITY=0

const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.ENABLE_RESUME_BUILDER_QUALITY === '0') process.exit(0);

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const toolName = input.tool_name || '';
if (!['Edit', 'Write', 'MultiEdit'].includes(toolName)) process.exit(0);

const toolInput = input.tool_input || {};
const filePath = (toolInput.file_path || '').replace(/\\/g, '/');
if (!filePath) process.exit(0);

// Skip non-code files and out-of-scope paths.
if (/\.(md|json|yaml|yml|lock|txt|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$/i.test(filePath)) process.exit(0);
if (/\.claude\/hooks\//.test(filePath)) process.exit(0);
if (/node_modules\//.test(filePath)) process.exit(0);
if (/\/(dist|coverage|playwright-report|test-results)\//.test(filePath)) process.exit(0);

let content = '';
if (toolName === 'Write') content = toolInput.content || '';
else if (toolName === 'Edit') content = toolInput.new_string || '';
else if (toolName === 'MultiEdit') content = (toolInput.edits || []).map((e) => e.new_string || '').join('\n');

// ---- shared helpers (used by inline_data_collection + over-extraction rules) ----

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Walk forward from an opening bracket and count its top-level items.
// Honours nested brackets, strings (with escapes), and // and /* */ comments.
function countTopLevelItems(src, openIdx, openChar) {
  const PAIR = { '[': ']', '{': '}', '(': ')' };
  const closeChar = PAIR[openChar];
  let depth = 1;
  let inString = null;
  let inComment = null;
  let commas = 0;
  let hasContent = false;
  for (let i = openIdx + 1; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];
    if (inComment === '/') {
      if (ch === '\n') inComment = null;
      continue;
    }
    if (inComment === '*') {
      if (ch === '*' && next === '/') {
        inComment = null;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '/' && next === '/') {
      inComment = '/';
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      inComment = '*';
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      hasContent = true;
      continue;
    }
    if (ch === '[' || ch === '{' || ch === '(') {
      depth += 1;
      hasContent = true;
      continue;
    }
    if (ch === ']' || ch === '}' || ch === ')') {
      depth -= 1;
      if (depth === 0 && ch === closeChar) {
        return hasContent ? commas + 1 : 0;
      }
      continue;
    }
    if (ch === ',' && depth === 1) {
      commas += 1;
      continue;
    }
    if (!/\s/.test(ch)) hasContent = true;
  }
  return 0;
}

function findProjectRoot(startFile) {
  let dir = path.dirname(startFile);
  for (let i = 0; i < 12; i += 1) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function countImporters(importPath) {
  const root = findProjectRoot(filePath);
  if (!root) return 0;
  const srcDir = path.join(root, 'src');
  if (!fs.existsSync(srcDir)) return 0;
  const re = new RegExp(`from\\s+['"]${escapeRegex(importPath)}['"]`);
  const selfPath = path.resolve(filePath);
  let count = 0;
  const skipDirs = new Set(['node_modules', 'dist', 'coverage', 'playwright-report', '.tmp-shots', 'build']);
  const walk = (dir) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        walk(path.join(dir, entry.name));
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (path.resolve(full) === selfPath) continue;
      try {
        if (re.test(fs.readFileSync(full, 'utf8'))) count += 1;
      } catch {
        /* read failure is non-fatal */
      }
    }
  };
  walk(srcDir);
  return count;
}
if (!content) process.exit(0);

const sessionId = input.session_id || 'default';
const stateFile = path.join(os.homedir(), '.claude', `resume-builder-quality-state-${sessionId}.json`);

const shown = (() => {
  try {
    return new Set(JSON.parse(fs.readFileSync(stateFile, 'utf8')));
  } catch {
    return new Set();
  }
})();

const isCode = /\.(ts|tsx|js|jsx)$/.test(filePath);
const isSrc = /\/src\//.test(filePath) && isCode;
const isReact = /\.(tsx|jsx)$/.test(filePath);
const isReactSrc = isSrc && isReact;
const isTest = /\/tests?\//.test(filePath) || /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath);
const isStyles = /\.css$/.test(filePath) || /\/styles\//.test(filePath);
const isConfig =
  /\/(vite|vitest|playwright|tailwind|postcss)\.config\.(ts|js)$/.test(filePath) ||
  /\/eslint\.config\.(js|ts)$/.test(filePath) ||
  /\/tsconfig.*\.json$/.test(filePath);
const isAllowedDexie = /\/src\/(db|store)\//.test(filePath);
const isAllowedFontRegister = /\/src\/(pdf|fonts)\//.test(filePath);
const isInterfaceFile = /\/src\/interfaces\/i-[a-z0-9-]+\.ts$/.test(filePath);
const isTypeFile = /\/src\/types\/[a-z0-9-]+-type\.ts$/.test(filePath);
const isTemplate = /\/src\/templates\//.test(filePath);
const isPdfRender = /\/src\/(pdf|templates)\//.test(filePath);
const isHookFile = /\/src\/hooks\//.test(filePath);
const isBarrel = /\/(index|registry)\.ts$/.test(filePath);
const isMainEntry = /\/src\/main\.tsx$/.test(filePath);

const RULES = [
  // ============================================================
  // 1. useEffect anti-patterns
  // ============================================================
  {
    name: 'useeffect_eslint_disable',
    when: () =>
      isReactSrc && /eslint-disable(?:-next-line)?\s+react-hooks\/exhaustive-deps/.test(content),
    msg: `'eslint-disable react-hooks/exhaustive-deps' is banned in this codebase (CLAUDE.md).
If the linter flags a missing dep, address the root cause:

  - Inline the function body so its closure captures fresh values each rebuild,
    then list only the real external deps.
  - Replace the effect with a derived value, event handler, or useImperativeHandle.
  - Move the responsibility out of the component (helpers/, store/, db/repository).

Never silence the rule.`,
  },

  {
    name: 'useeffect_prop_to_state_sync',
    when: () => {
      if (!isReactSrc) return false;
      // useEffect body is 1-4 setX(...) calls and nothing else, with a non-empty
      // dep array. Narrow enough to avoid flagging real effects.
      const re =
        /useEffect\(\s*\(\s*\)\s*=>\s*\{\s*(?:if\s*\([^)]*\)\s*return\s*;?\s*)?(?:set[A-Z]\w*\([^)]*\)\s*;?\s*){1,4}\}\s*,\s*\[[^\]]+\]\s*\)/m;
      return re.test(content);
    },
    msg: `Looks like a useEffect is syncing props into local state. Banned per CLAUDE.md.

  // DON'T
  useEffect(() => {
    setName(initial.name);
    setDescription(initial.description ?? '');
  }, [initial]);

  // DO — derive during render, OR remount by changing key:
  // Parent:  <Dialog key={editingId ?? 'create'} initial={editing} />
  // Child:   const [name, setName] = useState(initial?.name ?? '');

When the parent's 'key' changes React remounts; useState re-seeds from fresh props.
No effect, no stale-state bookkeeping.`,
  },

  {
    name: 'useeffect_event_in_disguise',
    when: () => {
      if (!isReactSrc) return false;
      // useEffect with toast.* / navigate / router.push / window.open / etc. — all
      // event-handler responsibilities pretending to be effects.
      const re =
        /useEffect\(\s*(?:async\s*)?\(\s*\)\s*=>\s*\{[\s\S]{0,400}?(?:toast\.|navigate\(|router\.(?:push|replace|navigate)|window\.open\(|saveAs\(|alert\(|confirm\()/m;
      return re.test(content);
    },
    msg: `Looks like a useEffect is doing something a USER triggered (toast, navigation,
file download, modal open). Move it into the event handler that caused it.

  // DON'T
  useEffect(() => {
    if (saved) toast.success('Saved');
  }, [saved]);

  // DO
  const handleSave = () => {
    saveResume();
    toast.success('Saved');
  };

Effects exist to synchronize with external systems (sockets, DOM listeners,
matchMedia, ResizeObserver, IndexedDB observables) — not to react to UI events.`,
  },

  {
    name: 'useeffect_for_dexie_read',
    when: () => {
      if (!isReactSrc) return false;
      const re =
        /useEffect\(\s*(?:async\s*)?\(\s*\)\s*=>\s*\{[\s\S]{0,400}?(?:db\.\w+\.|repository\.|dexie)/m;
      return re.test(content);
    },
    msg: `useEffect + Dexie reads is the wrong pattern. Use 'useLiveQuery' from
'dexie-react-hooks' — it returns 'undefined' until the first result, then a
real value, and stays subscribed for live updates.

  // DON'T
  useEffect(() => { db.resumes.toArray().then(setRecords); }, []);

  // DO
  const records = useLiveQuery(() => db.resumes.toArray());
  if (records === undefined) return <Skeleton />;

Gate the render on 'records === undefined', not on a separate isLoading flag —
see CLAUDE.md "Loading and empty states".`,
  },

  {
    name: 'useeffect_derived_from_props',
    when: () => {
      if (!isReactSrc) return false;
      // useState(...) immediately followed within ~6 lines by a useEffect that
      // setsState from a prop/computed value. Heuristic — high signal.
      const re =
        /const\s+\[\s*\w+\s*,\s*set[A-Z]\w*\s*\]\s*=\s*useState\([^)]*\)\s*;[\s\S]{0,200}?useEffect\(\s*\(\s*\)\s*=>\s*\{\s*set[A-Z]\w*\([^)]+\)\s*;?\s*\}\s*,\s*\[[^\]]+\]\s*\)/m;
      return re.test(content);
    },
    msg: `useState + useEffect-that-sets-it-from-a-derivable-value is the most common
useEffect misuse. If the value can be computed from props or other state,
compute it during render:

  // DON'T
  const [count, setCount] = useState(items.length);
  useEffect(() => setCount(items.length), [items]);

  // DO
  const count = items.length;

React re-renders when 'items' changes; 'count' is always fresh. The state +
effect added a render, a tick of staleness, and zero value.`,
  },

  // ============================================================
  // 2. Excessive comments
  // ============================================================
  {
    name: 'comment_block_4_plus',
    when: () => {
      if (!isCode || isTest || isConfig) return false;
      return /(?:^[ \t]*\/\/[^\n]*\n){4,}/m.test(content);
    },
    msg: `4+ consecutive '//' lines detected. Comments in this codebase should be RARE
and explain WHY, not WHAT. Long comment blocks are almost always:

  - Describing what the next few lines do (the code already does that).
  - Step-by-step narration ("// 1. Get user  // 2. Validate  // 3. Save").
  - JSDoc-ish prose that belongs in a README or, more often, nowhere.

Delete what isn't load-bearing. If one line genuinely explains a non-obvious
WHY (a hidden constraint, a bug-induced workaround, a subtle invariant), keep
that one line and drop the rest.`,
  },

  {
    name: 'section_divider_comment',
    when: () => {
      if (!isCode || isConfig) return false;
      return /\/\/\s*[=\-*]{4,}/.test(content) || /\/\*\s*[=\-*]{4,}/.test(content);
    },
    msg: `Section-divider comment ('// ===== Foo =====', '// ---- bar ----') detected.
These are forbidden — they signal that the file is doing too much. If you
need section markers to navigate a file, the file should be split into smaller
files (one component per folder, one concern per module — CLAUDE.md S-of-SOLID).`,
  },

  {
    name: 'comment_describes_what',
    when: () => {
      if (!isCode || isTest || isConfig) return false;
      // Imperative-verb-first comments naming a basic operation that the code
      // line already expresses. Tuned to be specific enough to avoid noise.
      const re =
        /^[ \t]*\/\/\s*(?:Fetch|Loop|Iterate|Set|Get|Return|Initialize|Initialise|Create|Render|Call|Map|Filter|Sort|Update|Handle|Compute|Calculate|Build|Make|Add|Remove|Delete|Check|Validate|Parse|Format)\s+(?:the|all|each|every|a|an|this|that)?\s*[a-z]/m;
      return re.test(content);
    },
    msg: `Comment looks like it describes WHAT the code does ('// Fetch the user',
'// Loop through items', '// Render the list'). Well-named identifiers already
do that. Delete the comment.

The only comments worth writing in this codebase:
  - WHY: a non-obvious constraint, invariant, or workaround for a known bug.
  - Reference: '// Workaround for https://github.com/foo/bar/issues/123'.
  - Subtle gotcha that would surprise a careful reader.

If the comment restates the code, it's dead weight that goes stale.`,
  },

  {
    name: 'multiline_jsdoc',
    when: () => {
      if (!isCode || isTest || isConfig || isBarrel) return false;
      // 3+ line JSDoc block. Single-line '/** brief */' is OK for occasional
      // public-API hints but multi-line JSDoc is over-documentation in this
      // codebase — TypeScript types are the documentation.
      return /\/\*\*[ \t]*\n(?:[ \t]*\*[^\n]*\n){2,}[ \t]*\*\//m.test(content);
    },
    msg: `Multi-line JSDoc detected. In this codebase TypeScript types ARE the
documentation — JSDoc is rarely justified. Drop the block.

If you genuinely need a hint on a complex public function (rare, mostly in
helpers/), a single-line summary is enough:

  // DON'T
  /**
   * Extracts plain text from a markdown subset string.
   * Supports bold, italic, and links.
   * @param input - the markdown string
   * @returns the plain string
   */
  export const extractPlainText = (input: string): string => …

  // DO
  // Markdown subset → plain text. See DATA-MODEL.md "Rich Text in String Fields".
  export const extractPlainText = (input: string): string => …`,
  },

  {
    name: 'todo_without_context',
    when: () => {
      if (!isCode) return false;
      // // TODO without an 8+ char explanation after it, or // FIXME bare.
      return /\/\/\s*(TODO|FIXME|XXX|HACK)\b(?![(:].{8})/m.test(content);
    },
    msg: `Bare TODO/FIXME/HACK comment without context. If you must leave one, write
WHY it exists and what would resolve it:

  // DON'T
  // TODO

  // DO
  // TODO(2026-07): rewire when Tiptap 3 ships — current upgrade-path blocked
  //   by the textStyle attribute regression (tracking: <link or note>).

A TODO with no body is noise that survives forever. Either fix it, file an
issue, or write a sentence so the next reader knows what to do.`,
  },

  // ============================================================
  // 3. Bans from CLAUDE.md and ATS-COMPLIANCE.md
  // ============================================================
  {
    name: 'dangerously_set_inner_html',
    when: () => isReactSrc && /dangerouslySetInnerHTML\s*=/.test(content),
    msg: `'dangerouslySetInnerHTML' is forbidden in this codebase (CLAUDE.md, dual
render-tree section). The only content we render comes from:

  - Schema-validated resume data (always string, never HTML).
  - Tiptap-controlled editor content (sanitized by ProseMirror schema).
  - Static template text we author.

If you need to render rich text from a markdown subset, parse it into spans/
marks via the helpers in '@/helpers' — never inject raw HTML.`,
  },

  {
    name: 'ats_hostile_pdf_lib',
    when: () =>
      /from\s+['"](?:html2canvas|jspdf|html2pdf|html2pdf\.js|dom-to-image|dom-to-image-more)['"]/.test(
        content,
      ),
    msg: `An ATS-hostile PDF rasterizer was imported. These libraries produce PDFs
whose "text" is a screenshot — ATS systems parse them at ~0%. Banned by
ATS-COMPLIANCE.md R1.

Use '@react-pdf/renderer' exclusively, via the pipeline in:
  - src/pdf/generatePdf.ts
  - src/pdf/primitives/

No exceptions, no fallbacks, no "just for the thumbnail". Thumbnails render
via the HTML preview at low fidelity, never via a DOM screenshot.`,
  },

  {
    name: 'react_default_import',
    when: () => isReactSrc && /^\s*import\s+React\s*(?:,|from)/m.test(content),
    msg: `Don't use 'import React from "react"'. Use a named import instead, per
CLAUDE.md ("Components and imports"):

  // DON'T
  import React from 'react';
  const Foo: React.FC<Props> = …

  // DO
  import { FC } from 'react';
  const Foo: FC<Props> = …

React 19 + the jsx-runtime mean the default import is unnecessary noise.`,
  },

  {
    name: 'inline_style_jsx',
    when: () => {
      if (!isReactSrc) return false;
      // style={{ ... }} in JSX. Detect across one line; allow CSS-variable
      // pattern (style={{ '--var': value }}) as the documented escape hatch.
      const matches = content.match(/style=\{\{[^}]+\}\}/g) || [];
      return matches.some((m) => !/['"]--[a-z][\w-]*['"]\s*:/.test(m));
    },
    msg: `Inline 'style={{ ... }}' detected (and it's not the CSS-variable escape hatch).
Banned per CLAUDE.md "Styling".

  // DON'T
  <div style={{ padding: 12, backgroundColor: '#f7f9fa' }} />

  // DO — Tailwind class
  <div className="p-3 bg-resume-rule" />

  // DO — dynamic value, expressed via CSS custom property
  <div style={{ '--accent': userAccent } as CSSProperties}
       className="bg-[var(--accent)]" />

Inline styles bypass the theme system, re-introduce hardcoded values, and
fragment the design system across hundreds of one-offs.`,
  },

  {
    name: 'hex_color_literal',
    when: () => {
      if ((!isSrc && !isStyles) || isMainEntry) return false;
      // Hex literal in code (not a Tailwind class). Whitelist common literals
      // that ARE allowed: full white / black in PDF primitives only.
      const re = /(?<!['"])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?!\w)/g;
      const matches = content.match(re) || [];
      const offending = matches.filter((m) => !/^#(?:fff|ffffff|000|000000)$/i.test(m));
      // Allow hex in globals.css (where the theme variables ARE defined) and
      // template theme.ts files (where defaults live alongside the schema).
      if (/\/styles\/globals\.css$/.test(filePath)) return false;
      if (/\/templates\/[a-z-]+\/theme\.ts$/.test(filePath)) return false;
      return offending.length > 0;
    },
    msg: `Hex color literal in source. Per CLAUDE.md "Styling", colors come from
theme tokens declared in 'src/styles/globals.css' under '@theme', referenced
via Tailwind classes or 'var(--color-…)':

  // DON'T
  <div className="text-[#1e40af]" />
  background: '#f7f9fa';

  // DO — add the token to globals.css if it doesn't exist, then:
  <div className="text-accent" />
  background: var(--color-resume-rule);

Allowed exceptions: globals.css (where tokens are defined) and a template's
'theme.ts' (where default values live alongside the schema). Everywhere else,
use the token.`,
  },

  {
    name: 'tailwind_arbitrary_value',
    when: () => {
      if (!isReactSrc) return false;
      // Tailwind arbitrary values: bg-[#fff], text-[14px], p-[3px].
      return /\b(?:bg|text|border|p[trblxy]?|m[trblxy]?|w|h|gap|rounded|ring|shadow)-\[[^\]\s]+\]/.test(
        content,
      );
    },
    msg: `Tailwind arbitrary value (e.g. 'bg-[#1e40af]', 'text-[14px]', 'p-[3px]')
detected. Arbitrary values bypass the design system.

If the value is needed often, add it to '@theme' in 'src/styles/globals.css'
as a token, then use the generated class. If it's needed once, you're
probably reaching for a value the design system would tell you not to use —
double-check before adding the token.`,
  },

  {
    name: 'any_type',
    when: () => {
      if (!isSrc) return false;
      // ': any' annotation or 'as any' cast. Allow 'any[]' inside ts-expect-error
      // ignore lines, allow it as part of '<any>' generic only as last resort.
      return /(?<!\w):\s*any\b/.test(content) || /\bas\s+any\b/.test(content);
    },
    msg: `': any' / 'as any' detected. Per CLAUDE.md "Schema-first", we lean on Zod-
derived types and never cast around the type system.

  // DON'T
  const data: any = JSON.parse(raw);
  const r = payload as any as Resume;

  // DO — validate at the boundary:
  const data = Resume.parse(JSON.parse(raw));   // throws if invalid
  const parsed = Resume.safeParse(payload);
  if (!parsed.success) return …;
  const r = parsed.data;                         // typed Resume

If you genuinely need a structural escape (an interop boundary with a
typeless library), use 'unknown' + a narrowing parse — not 'any'.`,
  },

  {
    name: 'ts_ignore_or_expect_error',
    when: () =>
      isSrc && /@ts-(?:ignore|expect-error)\b(?!\s.{8,})/m.test(content),
    msg: `'@ts-ignore' / '@ts-expect-error' without a follow-up explanation. If you
must use one (rarely), the next chars must explain why the type system is
genuinely wrong here:

  // DON'T
  // @ts-ignore
  doSomething(badInput);

  // DO
  // @ts-expect-error react-pdf Font types omit fontWeight on src; runtime accepts it.
  Font.register({ family: 'Inter', fonts: [{ src, fontWeight: 700 }] });

Most '@ts-ignore' usages are wallpaper over a real type bug — fix the type
instead.`,
  },

  {
    name: 'console_log',
    when: () => isSrc && !isTest && /\bconsole\.(log|debug|info)\s*\(/.test(content),
    msg: `'console.log' / .debug / .info left in src/. Likely a debug leftover.

  - If you need persistent diagnostics, route through 'src/lib/analytics.ts' or
    a future error-reporting hook, not raw console.
  - 'console.warn' / 'console.error' are allowed for genuine runtime issues
    a user might need to see in DevTools.
  - 'localStorage.debug = "resume-builder:*"' is the documented dev-debug path.

Remove the log before merging.`,
  },

  {
    name: 'debugger_statement',
    when: () => isSrc && /(^|\s)debugger\s*;?(\s|$)/m.test(content),
    msg: `'debugger' statement left in source. Remove before merging.`,
  },

  // ============================================================
  // 4. Architecture
  // ============================================================
  {
    name: 'direct_dexie_import',
    when: () =>
      isSrc &&
      !isAllowedDexie &&
      /from\s+['"]dexie['"]/.test(content),
    msg: `'dexie' imported outside 'src/db/' or 'src/store/'. Components and routes
must not touch Dexie directly — they go through:

  - 'src/db/repository.ts' for CRUD wrappers, OR
  - 'useLiveQuery' from 'dexie-react-hooks' against the typed 'db' instance, OR
  - the Zustand store, which owns its own persistence via 'store/middleware/autosave.ts'.

Direct Dexie usage leaks the persistence layer into the view layer and
makes future schema migrations impossible to coordinate.`,
  },

  {
    name: 'font_register_outside_pdf',
    when: () => isSrc && !isAllowedFontRegister && /\bFont\.register\s*\(/.test(content),
    msg: `'Font.register(...)' called outside 'src/pdf/' or 'src/fonts/'. All font
registration goes through:

  - src/pdf/registerFonts.ts (boot-time registration), or
  - src/fonts/loader.ts (lazy registration when a user picks a new font).

Scattering Font.register calls leads to double-registration, race conditions
on first PDF generation, and missing weight variants.`,
  },

  {
    name: 'react_pdf_renderer_outside_pdf_tree',
    when: () => {
      if (!isReactSrc) return false;
      if (isPdfRender) return false;
      return /from\s+['"]@react-pdf\/renderer['"]/.test(content);
    },
    msg: `'@react-pdf/renderer' imported outside 'src/pdf/' or 'src/templates/'. The
PDF render tree is isolated by design (CLAUDE.md "Dual render-tree pattern") —
the HTML preview and the PDF export are SEPARATE trees consuming the same
data. Importing react-pdf elsewhere collapses that separation.

If you need a low-fi thumbnail, render the HTML 'Preview' component at a
scaled-down size — never invoke react-pdf for it.`,
  },

  {
    name: 'parent_relative_import',
    when: () => isSrc && /from\s+['"]\.\.\/\.\.\//.test(content),
    msg: `Parent-relative import ('../../...') detected. Use the '@/' alias instead
(CLAUDE.md "Path alias"):

  // DON'T
  import { Resume } from '../../schema/resume';

  // DO
  import { Resume } from '@/schema/resume';

Aliased imports are stable under refactor and self-document the boundary
being crossed.`,
  },

  {
    name: 'barrel_deep_import',
    when: () => isSrc && /from\s+['"]@\/(?:ui|helpers|constants|hooks)\/[A-Za-z]/.test(content),
    msg: `Deep import into a barrel-having group detected. Always go through the
barrel (CLAUDE.md "Imports — barrel discipline"):

  // DON'T
  import { Button } from '@/ui/Button/Button';
  import { formatDateRange } from '@/helpers/format-date-range';

  // DO
  import { Button } from '@/ui';
  import { formatDateRange } from '@/helpers';

The folders that DO use direct imports — interfaces/, types/, schema/,
components/, templates/, routes/-components/ — surface domain coupling
on purpose; deep imports there are correct.`,
  },

  {
    name: 'multiple_components_per_file',
    when: () => {
      if (!isReactSrc || isBarrel) return false;
      const componentExports = content.match(/\bexport\s+(?:default\s+)?(?:const|function)\s+[A-Z]\w+/g) || [];
      const componentSignatures = componentExports.filter((m) =>
        // Match anything that looks like a React component declaration.
        /(?:const|function)\s+[A-Z]/.test(m),
      );
      return componentSignatures.length > 1;
    },
    msg: `Multiple React components exported from one file. The rule is "one folder
per component, one component per file" (CLAUDE.md "Component folder layout").

If 'Foo.tsx' and 'Bar.tsx' both live under the same surface, give each its
own folder:

  Foo/
    Foo.tsx          ← exports Foo
  Bar/
    Bar.tsx          ← exports Bar

Tiny PRIVATE helpers used only inside the file's main component may stay as
non-exported 'const's in the same file. Anything 'export'-ed gets its own
folder.`,
  },

  {
    name: 'createcontext_for_app_state',
    when: () => {
      if (!isReactSrc) return false;
      if (/\/(router|providers|theme-provider|TooltipProvider)\b/.test(filePath)) return false;
      return /\bcreateContext\s*\(/.test(content) || /from\s+['"]react['"][^;]*createContext/.test(content);
    },
    msg: `'createContext' detected in feature code. Per CLAUDE.md "State management",
application state lives in Zustand — Context is reserved for things that are
genuinely tree-scoped (router context, theme provider).

  // DON'T — Context for app state
  const ResumeContext = createContext(...)

  // DO — Zustand slice
  import { useResumeStore } from '@/store/resumeStore';
  const resume = useResumeStore((s) => s.resume);

Context for shared state causes excess re-renders and pulls in providers no
test wants to set up.`,
  },

  {
    name: 'localstorage_for_resume_content',
    when: () => isSrc && /localStorage\.(setItem|getItem)\s*\(\s*['"](?:resume|draft|content|document)/i.test(content),
    msg: `localStorage looks like it's being used for resume content. Per CLAUDE.md
"State management" and the persistence layer in SPEC.md, resume content lives
in IndexedDB via Dexie. localStorage caps at ~5MB and is synchronous — fatal
once users embed photos or run multiple drafts.

  // DO
  // Go through 'src/db/repository.ts' or rely on the autosave middleware
  // attached to the Zustand store.

localStorage IS appropriate for tiny app-level prefs (last opened template,
sidebar collapsed, locale override) — but never for the resume document.`,
  },

  {
    name: 'interface_missing_i_prefix',
    when: () => {
      if (!isInterfaceFile) return false;
      // File is in interfaces/i-foo.ts but exports an interface without the I prefix.
      const exports = content.match(/^\s*export\s+interface\s+([A-Z]\w+)/gm) || [];
      return exports.some((e) => !/^\s*export\s+interface\s+I[A-Z]/.test(e));
    },
    msg: `File is in 'src/interfaces/' but its exported interface is missing the 'I'
prefix. Per CLAUDE.md "Types and interfaces":

  // DON'T — file: src/interfaces/i-resume-record.ts
  export interface ResumeRecord { ... }

  // DO
  export interface IResumeRecord { ... }

If you don't want the 'I' prefix, the shape probably belongs in 'src/types/'
as a type alias or in 'src/schema/' as a Zod-inferred type — not in
'src/interfaces/'.`,
  },

  {
    name: 'interface_in_component_file',
    when: () => {
      if (!isReactSrc) return false;
      if (/\/interfaces\//.test(filePath)) return false;
      // export interface in a .tsx file — should be moved to interfaces/.
      // Local non-exported interfaces are fine.
      return /^\s*export\s+interface\s+[A-Z]/m.test(content);
    },
    msg: `Exported 'interface' in a .tsx component file. Move shared object shapes to
'src/interfaces/i-<domain>.ts' so they can be imported without coupling to a
component (CLAUDE.md "Types and interfaces").

Inline 'interface Props' that isn't 'export'-ed is fine — that's the local
prop type for this component. Only flag and move it the moment a sibling
needs to import it.`,
  },

  {
    name: 'inline_type_to_move',
    when: () => {
      if (!isReactSrc) return false;
      if (/\/types\//.test(filePath) || /\/interfaces\//.test(filePath)) return false;
      // export type Foo = 'a' | 'b' in a tsx → belongs in types/
      return /^\s*export\s+type\s+[A-Z]\w*\s*=\s*['"][^'"]+['"]\s*\|\s*['"]/m.test(content);
    },
    msg: `Exported union type alias in a .tsx file. Move to 'src/types/<domain>-type.ts'
so siblings can import it without coupling to this component (CLAUDE.md
"Types and interfaces").

  // DON'T — in Foo.tsx
  export type Status = 'idle' | 'busy' | 'done';

  // DO — in src/types/status-type.ts
  export type Status = 'idle' | 'busy' | 'done';`,
  },

  {
    name: 'inline_data_collection',
    when: () => {
      if (!isReactSrc) return false;
      if (isTest || isConfig) return false;
      // Find top-level const FOO = [ ... ]  or  const FOO = { ... }
      // (allows optional type annotation, accepts any const name).
      const declRe = /^(?:export\s+)?const\s+\w+(?:\s*:\s*[^=]+)?\s*=\s*([\[\{])/gm;
      let m;
      while ((m = declRe.exec(content)) !== null) {
        const openIdx = m.index + m[0].length - 1;
        const items = countTopLevelItems(content, openIdx, m[1]);
        if (items >= 4) return true;
      }
      return false;
    },
    msg: `Large data collection (4+ items) declared inline in a .tsx component file.
Per CLAUDE.md, all "dummy data," fixtures, sample collections, configuration
arrays, and option lists live in 'src/constants/<domain>.ts' and are imported
via '@/constants'. Component files contain components, not data.

  // DON'T — in Foo.tsx
  const TABS = [
    { key: 'a', label: 'Alpha' },
    { key: 'b', label: 'Beta' },
    { key: 'c', label: 'Gamma' },
    { key: 'd', label: 'Delta' },
  ];

  // DO — in src/constants/foo-tabs.ts
  export const fooTabs = [ … ];

  // …and in Foo.tsx
  import { fooTabs } from '@/constants';

Small (<4 item) lists and primitive constants can stay inline.`,
  },

  {
    name: 'interface_over_extraction',
    when: () => {
      if (!isInterfaceFile) return false;
      // Only fire on Write (new file). Editing an existing file is usually
      // a refactor; we don't want to nag on every save.
      if (toolName !== 'Write') return false;
      const match = filePath.match(/\/src\/(interfaces\/i-[a-z0-9-]+)\.ts$/);
      if (!match) return false;
      const importPath = `@/${match[1]}`;
      return countImporters(importPath) < 2;
    },
    msg: `New 'src/interfaces/i-*.ts' file has fewer than 2 importers — the shape is
unique to a single consumer and should stay inline.

CLAUDE.md "Types and interfaces" — the shared or scoped nuance:
  - A type/interface used in ONE place stays inline in that file. The Props
    interface is the canonical example, but the rule generalises: any local
    helper interface that no sibling needs lives where it's used.
  - Promote to 'src/interfaces/' the moment a SECOND file needs the same
    shape. Until then, the redirection adds noise.

  // DON'T — for a one-component shape
  // src/interfaces/i-row.ts  (only imported by FooTable.tsx)
  export interface IRow { … }

  // DO — inline in the consumer
  // FooTable.tsx
  interface IRow { … }   // non-exported, local`,
  },

  {
    name: 'type_over_extraction',
    when: () => {
      if (!isTypeFile) return false;
      if (toolName !== 'Write') return false;
      const match = filePath.match(/\/src\/(types\/[a-z0-9-]+-type)\.ts$/);
      if (!match) return false;
      const importPath = `@/${match[1]}`;
      return countImporters(importPath) < 2;
    },
    msg: `New 'src/types/*-type.ts' file has fewer than 2 importers — the type is
unique to a single consumer and should stay inline.

CLAUDE.md "Types and interfaces" — the shared or scoped nuance:
  - Move to 'src/types/' once a SECOND file needs the same union/alias.
  - Until then, declare it inline in the single consumer file. The extra file
    adds an import indirection with no payoff.

  // DON'T — for a single-consumer union
  // src/types/foo-status-type.ts  (only imported by Foo.tsx)
  export type FooStatus = 'idle' | 'busy' | 'done';

  // DO — inline in the consumer
  // Foo.tsx (top of file)
  type FooStatus = 'idle' | 'busy' | 'done';   // local`,
  },

  // ============================================================
  // 5. ATS safety in templates
  // ============================================================
  {
    name: 'multi_column_template_layout',
    when: () => {
      if (!isTemplate) return false;
      // Top-level multi-column layouts in template files — ATS-hostile.
      return (
        /\bgrid-cols-[2-9]\b/.test(content) ||
        /\bcolumns-[2-9]\b/.test(content) ||
        /\bflex-row\b/.test(content) ||
        /flexDirection:\s*['"]row['"]/.test(content)
      );
    },
    msg: `Multi-column layout detected in a template file. Per ATS-COMPLIANCE.md R2,
all exported PDFs must be single-column top-to-bottom — multi-column layouts
fail ~28% of legacy ATS parsers (Taleo, iCIMS).

If you need side-by-side display of related fields (e.g. dates next to a
role), use inline text formatting within a single column, not a column split.

This rule blocks the most common ATS regression in resume builders. If you
believe a specific case is safe, escalate to a product-level decision — do
not relax the rule locally.`,
  },

  // ============================================================
  // 6. Test hygiene
  // ============================================================
  {
    name: 'test_only_or_skip',
    when: () => isTest && /\b(?:it|test|describe)\.(?:only|skip)\(/.test(content),
    msg: `'.only' or '.skip' in a test file. Remove before merging — '.only' will
silently skip every other test in the suite; '.skip' hides a regression
behind a green CI light.

If a test is genuinely unfixable right now, mark it with a comment that
references an issue and an owner, and unskip-or-delete on next sprint.`,
  },

  {
    name: 'blanket_eslint_disable',
    when: () => isSrc && /^\s*\/\*\s*eslint-disable\s*\*\//m.test(content),
    msg: `Blanket '/* eslint-disable */' at file scope disables every rule for the
whole file — almost always too broad. Disable only the specific rule on the
specific line and add a one-line justification.

If 5+ lines in the file need disabling, the file probably needs refactoring.`,
  },
];

const match = RULES.find((rule) => {
  try {
    return rule.when();
  } catch {
    return false;
  }
});
if (!match) process.exit(0);

const key = `${filePath}:${match.name}`;
if (shown.has(key)) process.exit(0);

shown.add(key);
try {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify([...shown]));
} catch {
  /* state-write failure is non-fatal */
}

process.stderr.write(`[resume-builder-quality:${match.name}]\n${match.msg}\n`);
process.exit(2);
