import { Hono } from 'hono';
import Database from 'better-sqlite3';

interface Quote {
  id: number;
  text: string;
  author: string;
}

export function quotesRouter(db: InstanceType<typeof Database>) {
  const router = new Hono();

  router.get('/', (c) => {
    const author = c.req.query('author');
    const limitRaw = c.req.query('limit');
    const offsetRaw = c.req.query('offset');

    const limit = limitRaw !== undefined ? Number(limitRaw) : undefined;
    const offset = offsetRaw !== undefined ? Number(offsetRaw) : 0;

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
      return c.json(
        { error: { code: 'INVALID_INPUT', message: 'limit must be an integer between 1 and 100' } },
        400,
      );
    }
    if (!Number.isInteger(offset) || offset < 0) {
      return c.json(
        { error: { code: 'INVALID_INPUT', message: 'offset must be a non-negative integer' } },
        400,
      );
    }

    if (author !== undefined) {
      if (typeof author !== 'string' || author.trim() === '') {
        return c.json(
          { error: { code: 'INVALID_INPUT', message: 'author query param must not be empty' } },
          400,
        );
      }
      const pattern = `%${author.trim()}%`;
      const quotes =
        limit !== undefined
          ? (db
              .prepare('SELECT * FROM quotes WHERE author LIKE ? ORDER BY id LIMIT ? OFFSET ?')
              .all(pattern, limit, offset) as Quote[])
          : (db
              .prepare('SELECT * FROM quotes WHERE author LIKE ? ORDER BY id')
              .all(pattern) as Quote[]);
      return c.json({ data: quotes });
    }

    const quotes =
      limit !== undefined
        ? (db
            .prepare('SELECT * FROM quotes ORDER BY id LIMIT ? OFFSET ?')
            .all(limit, offset) as Quote[])
        : (db.prepare('SELECT * FROM quotes ORDER BY id').all() as Quote[]);
    return c.json({ data: quotes });
  });

  router.get('/count', (c) => {
    const row = db.prepare('SELECT COUNT(*) AS count FROM quotes').get() as { count: number };
    return c.json({ data: { count: row.count } });
  });

  router.get('/random', (c) => {
    const quote = db.prepare('SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1').get() as
      | Quote
      | undefined;
    if (!quote) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'No quotes available' } }, 404);
    }
    return c.json({ data: quote });
  });

  router.post('/', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        { error: { code: 'INVALID_INPUT', message: 'Request body must be valid JSON' } },
        400,
      );
    }

    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as Record<string, unknown>).text !== 'string' ||
      typeof (body as Record<string, unknown>).author !== 'string'
    ) {
      return c.json(
        { error: { code: 'INVALID_INPUT', message: 'text and author are required strings' } },
        400,
      );
    }

    const { text, author } = body as { text: string; author: string };

    if (!text.trim() || !author.trim()) {
      return c.json(
        { error: { code: 'INVALID_INPUT', message: 'text and author must not be empty' } },
        400,
      );
    }

    const result = db
      .prepare('INSERT INTO quotes (text, author) VALUES (?, ?)')
      .run(text.trim(), author.trim());
    const quote = db
      .prepare('SELECT * FROM quotes WHERE id = ?')
      .get(result.lastInsertRowid) as Quote;
    return c.json({ data: quote }, 201);
  });

  router.delete('/:id', (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json(
        { error: { code: 'INVALID_INPUT', message: 'id must be a positive integer' } },
        400,
      );
    }
    const result = db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
    if (result.changes === 0) {
      return c.json({ error: { code: 'NOT_FOUND', message: `Quote ${id} not found` } }, 404);
    }
    return c.json({ data: { id } });
  });

  return router;
}
