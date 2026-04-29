import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import Database from 'better-sqlite3';
import { quotesRouter } from './routes/quotes.ts';

export function createApp(db: InstanceType<typeof Database>) {
  const app = new Hono();

  app.onError((err, c) => {
    process.stderr.write(`[error] ${err.message}\n`);
    return c.json({ error: { code: 'INTERNAL', message: 'Internal server error' } }, 500);
  });

  app.route('/api/quotes', quotesRouter(db));
  app.use('/*', serveStatic({ root: './public' }));

  return app;
}
