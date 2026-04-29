import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/server/db.ts';
import { createApp } from '../src/server/app.ts';

describe('GET /api/quotes/count', () => {
  let app: ReturnType<typeof createApp>;

  before(() => {
    app = createApp(openDb(':memory:'));
  });

  test('returns { data: { count: number } } with count >= 0 on empty db', async () => {
    const res = await app.request('/api/quotes/count');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { count: number } };
    assert.ok('data' in body, 'response must have a data key');
    assert.ok('count' in body.data, 'data must have a count key');
    assert.equal(typeof body.data.count, 'number');
    assert.ok(body.data.count >= 0, 'count must be >= 0');
  });

  test('count increments after inserting a quote', async () => {
    // Insert one quote
    const postRes = await app.request('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Count me', author: 'Counter' }),
    });
    assert.equal(postRes.status, 201);

    const res = await app.request('/api/quotes/count');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { count: number } };
    assert.ok(body.data.count >= 1, 'count must be >= 1 after insert');
  });
});

describe('GET /api/quotes?author= filtering', () => {
  let app: ReturnType<typeof createApp>;

  before(async () => {
    app = createApp(openDb(':memory:'));

    // Seed two distinct authors
    const seeds = [
      { text: 'To be or not to be', author: 'William Shakespeare' },
      { text: 'Elementary, my dear Watson', author: 'Arthur Conan Doyle' },
      { text: 'All the world is a stage', author: 'William Shakespeare' },
    ];

    for (const seed of seeds) {
      await app.request('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seed),
      });
    }
  });

  test('returns only quotes whose author matches (exact case)', async () => {
    const res = await app.request('/api/quotes?author=William%20Shakespeare');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { author: string }[] };
    assert.ok(Array.isArray(body.data), 'data must be an array');
    assert.equal(body.data.length, 2, 'should return exactly 2 Shakespeare quotes');
    for (const quote of body.data) {
      assert.ok(
        quote.author.toLowerCase().includes('william shakespeare'),
        `unexpected author: ${quote.author}`,
      );
    }
  });

  test('returns only matching quotes using case-insensitive partial match', async () => {
    // Lowercase partial match — "william" should still find "William Shakespeare"
    const res = await app.request('/api/quotes?author=william');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: { author: string }[] };
    assert.ok(Array.isArray(body.data), 'data must be an array');
    assert.ok(body.data.length >= 1, 'should find at least one match');
    for (const quote of body.data) {
      assert.ok(
        quote.author.toLowerCase().includes('william'),
        `author "${quote.author}" does not contain "william"`,
      );
    }
  });

  test('returns { data: [] } when no quotes match the author filter', async () => {
    const res = await app.request('/api/quotes?author=Zaphod%20Beeblebrox');
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: unknown[] };
    assert.ok(Array.isArray(body.data), 'data must be an array');
    assert.deepEqual(body.data, [], 'data must be empty for unknown author');
  });

  test('returns 400 INVALID_INPUT when author param is empty string', async () => {
    const res = await app.request('/api/quotes?author=');
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: { code: string } };
    assert.equal(body.error.code, 'INVALID_INPUT');
  });
});
