import { serve } from '@hono/node-server';
import { openDb } from './db.ts';
import { createApp } from './app.ts';

const db = openDb('./data/qotd.db');
const app = createApp(db);

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  process.stderr.write(`Listening on http://localhost:${info.port}\n`);
});
