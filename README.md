# Resume Builder

A free, no-account, privacy-first web app for building **100% ATS-friendly** resumes that look professional.

> All your resume data stays on your device. No signup, no email-gate, no watermark.

## Architecture Docs

Start here, in order:

1. **[PRD.md](./PRD.md)** — Product Requirements Document (vision, goals, user stories, scope).
2. **[PRODUCT.md](./PRODUCT.md)** — Strategic / brand direction (register, users, anti-references, design principles).
3. **[DESIGN.md](./DESIGN.md)** — The complete visual system (color, type, spacing, motion, surfaces, design moments).
4. **[CLAUDE.md](./CLAUDE.md)** — Coding rules, SOLID + separation of concerns, hooks/effects discipline.
5. **[SPEC.md](./SPEC.md)** — Technical architecture, tech stack, file structure, data flow.
6. **[DATA-MODEL.md](./DATA-MODEL.md)** — The canonical `Resume` schema (JSON Resume superset).
7. **[ATS-COMPLIANCE.md](./ATS-COMPLIANCE.md)** — The non-negotiable export contract (rules R1–R12).
8. **[TEMPLATES.md](./TEMPLATES.md)** — The template catalog and authoring contract.
9. **[ROADMAP.md](./ROADMAP.md)** — Phased delivery plan from M0 to v2.0.
10. **[PLAN.md](./PLAN.md)** — Locked v1.0 decisions.

## Tech Stack at a Glance

| Layer | Choice |
|---|---|
| Build | Vite 7 + React 19 + TypeScript 5.7 |
| UI | shadcn/ui + Tailwind v4 |
| State | Zustand + Immer + zundo |
| Persistence | Dexie 4 (IndexedDB) |
| Routing | TanStack Router |
| Editor | Tiptap 2 (ProseMirror) |
| PDF | @react-pdf/renderer |
| DOCX | docx (Dolan Miu) |
| Fonts | Fontsource |
| Hosting | Cloudflare Pages |

## Quick Start (once scaffolded)

```bash
pnpm install
pnpm dev             # http://localhost:5173
pnpm test            # vitest
pnpm e2e             # playwright
pnpm build           # production build → dist/
```

## Project Status

**v1.0 in active development.** The editor product is shipping: dashboard at `/app`, editor at `/editor/$resumeId` with sections/template/theme/export tabs, autosave to IndexedDB, undo/redo, Tiptap-based bullet RTE with markdown round-trip, 6 templates (Modern Minimal, Classic Serif, Tech Sans, Executive, Compact, Editorial), vector-PDF + DOCX + JSON Resume export, clickable PDF contact links, custom MonthPicker, and a 24-rule ATS check with numeric scoring (0–100), JD keyword matching, and a ~510-entry canonical skill taxonomy. See [ROADMAP.md](./ROADMAP.md) for what's left before public launch.
