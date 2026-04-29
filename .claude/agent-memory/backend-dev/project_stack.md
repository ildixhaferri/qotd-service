---
name: Project stack and conventions
description: Core tech stack, file layout, and conventions for qotd-service backend
type: project
---

Stack: Node >= 20, ESM, TypeScript via tsx (no build), Hono, better-sqlite3 (./data/qotd.db), node:test.

Key files:

- src/server/routes/quotes.ts — all quote route handlers live here
- src/server/app.ts — mounts quotesRouter at /api/quotes, serves public/ static
- src/server/db.ts — openDb() creates the quotes table (id, text, author)
- src/server/main.ts — starts the Hono/node-server on port 3000
- tests/quotes.test.ts — integration tests using in-memory DB via createApp(openDb(':memory:'))

**Why:** Single-file route approach with router-per-resource pattern; no schema migration files, DB setup is inline in openDb().

**How to apply:** Add new endpoints directly in quotes.ts. Tests use fresh in-memory DBs per describe block or per test when isolation matters.
