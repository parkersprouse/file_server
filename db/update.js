import { accessSync, constants, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AsyncDatabase } from 'promised-sqlite3';
import config from '../config.js';
import { getDuration, getLastUpdated } from '../lib/index.js';
import { getType } from '../services/content_type.js';

async function parse(dir_name, db) {
  for (const file of readdirSync(dir_name)) {
    const file_path = join(dir_name, file);

    const f = statSync(file_path);
    if (f.isSymbolicLink()) continue;
    else if (f.isDirectory()) {
      try {
        // Ensure we can read the directory before parsing
        accessSync(file_path, constants.R_OK);
        await parse(file_path, db);
      } catch {
        continue;
      }
    } else {
      const row = await db.get('SELECT * FROM files WHERE path = $path', { $path: file_path });
      if (row) continue;
      console.log(`Parsing ${file_path}`);

      const type = await getType(file_path);
      const $duration = (type?.startsWith('audio') || type?.startsWith('video')) ? (await getDuration(file_path)) : null;

      await db.run('INSERT INTO files VALUES ($path, $duration, $last_updated)', {
        $path: file_path,
        $duration,
        $last_updated: getLastUpdated(f),
      });
    }
  }
}

try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const db = await AsyncDatabase.open(join(__dirname, 'files.db'));

  try {
    await db.get('SELECT 1 from files');
  } catch {
    throw new Error('You must create the database first');
  }

  await parse(config.file_source, db);
  await db.close();
} catch (error) {
  console.error('Failed to update file database');
  console.error(error);
}
