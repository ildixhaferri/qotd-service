import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';

export function openDb(path: string) {
  if (path !== ':memory:') mkdirSync('./data', { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL
    )
  `);
  return db;
}
