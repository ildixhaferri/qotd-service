import { openDb } from '../server/db.ts';

const db = openDb('./data/qotd.db');
const { count } = db.prepare('SELECT COUNT(*) as count FROM quotes').get() as { count: number };

if (count === 0) {
  const insert = db.prepare('INSERT INTO quotes (text, author) VALUES (?, ?)');
  const quotes: [string, string][] = [
    ['The only way to do great work is to love what you do.', 'Steve Jobs'],
    ['In the middle of every difficulty lies opportunity.', 'Albert Einstein'],
    ['It does not matter how slowly you go as long as you do not stop.', 'Confucius'],
    ["Life is what happens when you're busy making other plans.", 'John Lennon'],
    ['The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt'],
  ];
  for (const [text, author] of quotes) {
    insert.run(text, author);
  }
  process.stderr.write(`Seeded ${quotes.length} quotes.\n`);
} else {
  process.stderr.write(`Skipped: ${count} quote(s) already exist.\n`);
}
