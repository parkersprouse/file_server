import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite from 'sqlite3';

try {
  sqlite.verbose();
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const db = new sqlite.Database(join(__dirname, 'files.db'), function (error) {
    if (error) throw error;
    this.run('DROP TABLE IF EXISTS files');
  });

  db.serialize(() => {
    db.run('CREATE TABLE files (path TEXT, duration INTEGER, last_updated INTEGER)');

    db.run('INSERT INTO files VALUES ($path, $duration, $last_updated)', {
      $path: join(__dirname, 'files.db'),
      $duration: 600,
      $last_updated: 1_695_579_746_770,
    });

    db.each('SELECT path, duration, last_updated FROM files', (error, row) => {
      if (error) console.error(error);
      else console.log(`Name: ${row.path}\nDuration: ${row.duration}\nLast Updated: ${row.last_updated}`);
      console.log('--------------------------------');
    });
  });

  db.close();
} catch (error) {
  console.error('Failed to initialize file database');
  console.error(error);
}