import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { AsyncDatabase } from 'promised-sqlite3';

try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const force = process.argv.includes('-f') || process.argv.includes('--force');
  const db = await AsyncDatabase.open(join(__dirname, 'files.db'));

  let exists = false;
  try {
    await db.get('SELECT 1 FROM files');
    exists = true;
  } catch {}

  if (exists && !force) throw new Error('Database structure already created');

  await db.run('DROP TABLE IF EXISTS files');
  await db.run('CREATE TABLE files (path TEXT PRIMARY KEY, duration INTEGER, last_updated INTEGER NOT NULL)');
  await db.close();
} catch (error) {
  console.error('Failed to initialize database');
  console.error(error);
}
