import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/server/db.ts';
import { createApp } from '../src/server/app.ts';

describe('quotes API', () => {
  let app: ReturnType<typeof createApp>;
  let insertedId = 0;

  before(() => {
    app = createApp(openDb(':memory:'));
  });

  test('GET /api/quotes returns empty array on fresh db', async () => {
    const res = await app.request('/api/quotes');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: unknown[] };
    assert.deepEqual(body.data, []);
  });

  test('GET /api/quotes/random returns 404 when db is empty', async () => {
    const res = await app.request('/api/quotes/random');
    assert.equal(res.status, 404);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  test('POST /api/quotes creates a quote and returns 201', async () => {
    const res = await app.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello world', author: 'Tester' }),
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as { data: { id: number; text: string; author: string } };
    assert.equal(body.data.text, 'Hello world');
    assert.equal(body.data.author, 'Tester');
    assert.ok(body.data.id > 0);
    insertedId = body.data.id;
  });

  test('POST /api/quotes returns 400 INVALID_INPUT when author is missing', async () => {
    const res = await app.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'No author here' }),
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'INVALID_INPUT');
  });

  test('GET /api/quotes returns the inserted quote', async () => {
    const res = await app.request('/api/quotes');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { id: number }[] };
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].id, insertedId);
  });

  test('GET /api/quotes/random returns a quote after insert', async () => {
    const res = await app.request('/api/quotes/random');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { id: number } };
    assert.equal(body.data.id, insertedId);
  });

  test('DELETE /api/quotes/:id removes the quote', async () => {
    const res = await app.request(`/api/quotes/${insertedId}`, { method: 'DELETE' });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { id: number } };
    assert.equal(body.data.id, insertedId);
  });

  test('DELETE /api/quotes/:id returns 404 for already-deleted quote', async () => {
    const res = await app.request(`/api/quotes/${insertedId}`, { method: 'DELETE' });
    assert.equal(res.status, 404);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  test('GET /api/quotes/count returns 0 on fresh db', async () => {
    const freshApp = createApp(openDb(':memory:'));
    const res = await freshApp.request('/api/quotes/count');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { count: number } };
    assert.equal(body.data.count, 0);
  });

  test('GET /api/quotes/count reflects inserted quotes', async () => {
    const freshApp = createApp(openDb(':memory:'));
    await freshApp.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Quote one', author: 'Alice' }),
    });
    await freshApp.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Quote two', author: 'Bob' }),
    });
    const res = await freshApp.request('/api/quotes/count');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { count: number } };
    assert.equal(body.data.count, 2);
  });

  test('GET /api/quotes?author= filters by partial case-insensitive match', async () => {
    const freshApp = createApp(openDb(':memory:'));
    await freshApp.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Be yourself', author: 'Oscar Wilde' }),
    });
    await freshApp.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'To be or not to be', author: 'Shakespeare' }),
    });
    const res = await freshApp.request('/api/quotes?author=wilde');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { author: string }[] };
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].author, 'Oscar Wilde');
  });

  test('GET /api/quotes?author= returns empty array when no match', async () => {
    const freshApp = createApp(openDb(':memory:'));
    await freshApp.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello', author: 'Someone' }),
    });
    const res = await freshApp.request('/api/quotes?author=zzznomatch');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: unknown[] };
    assert.deepEqual(body.data, []);
  });

  test('GET /api/quotes?author= returns 400 for empty author param', async () => {
    const freshApp = createApp(openDb(':memory:'));
    const res = await freshApp.request('/api/quotes?author=');
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'INVALID_INPUT');
  });
});
