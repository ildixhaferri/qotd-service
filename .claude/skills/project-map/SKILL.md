---
name: project-map
description: Architectural map of qotd-service — directory layout, modules, and where to put new code. Load when the user asks about structure, adds a new endpoint, or seems to have lost the layout.
---

# qotd-service — Project map

## Top-level
- `src/server/` — Hono HTTP server; this is where new API endpoints go.
- `src/scripts/` — one-off CLI scripts (seed, migrations).
- `public/` — single `index.html` + vanilla JS. No build step.
- `tests/` — `node:test` files named `<feature>.test.ts`.
- `data/` — runtime SQLite file (`qotd.db`); gitignored.
- `.claude/` — Claude Code project configuration (rules, agents, skills, hooks).

## Module responsibilities
- `src/server/main.ts` — app entry point, mounts routes, starts server.
- `src/server/db.ts` — opens/migrates the SQLite database, exports `db`.
- `src/server/routes/quotes.ts` — all `/api/quotes` route handlers.
- `src/scripts/seed.ts` — populates 5 starter quotes on first boot.
- `public/index.html` — the entire frontend (HTML + inline JS).

## Where to put new code
- New API endpoint → `src/server/routes/` + register in `main.ts`
- New DB migration → `src/server/db.ts` (append to migration array)
- New test → `tests/<feature>.test.ts`
- New CLI script → `src/scripts/<name>.ts`
