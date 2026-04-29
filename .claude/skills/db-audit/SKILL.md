---
name: db-audit
description: Audit the SQLite database — schema, row counts, data quality, anomalies. Runs in a forked context so the exploration doesn't pollute the main conversation.
context: fork
---

You are auditing the qotd-service SQLite database at `./data/qotd.db`.

Run the following checks and produce a structured report:

**1. Schema check**
Read `src/server/db.ts` and confirm the live schema matches the code definition.

**2. Row counts**
Call `GET http://localhost:3000/api/quotes` and report the total number of quotes.

**3. Data quality**
- Are there any quotes with empty `text` or `author`?
- Are there duplicate texts?
- Are all `id` values sequential with no gaps?

**4. Random endpoint health**
Call `GET http://localhost:3000/api/quotes/random` three times. Confirm it returns different quotes (or note if the DB is too small to vary).

**5. Summary**
Produce a short report:
- Total quotes
- Any schema drift
- Any data quality issues
- Recommendation (add more seed data / fix issues / all clear)

If the server is not running, note it and perform checks by reading `src/server/db.ts` and the seed script only.
