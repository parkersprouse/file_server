/* eslint-disable unicorn/no-process-exit */
import { accessSync, constants, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { file_source } from '../config.js';
import { getDuration, getLastUpdated } from '../lib/index.js';
import { getType } from '../services/content_type.js';
import { dropDB, getDB } from './index.js';

async function parse(dir_name) {
  for (const file of readdirSync(dir_name)) {
    const file_path = join(dir_name, file);

    const f = statSync(file_path);
    if (f.isSymbolicLink()) continue;
    else if (f.isDirectory()) {
      try {
        // Ensure we can read the directory before parsing
        accessSync(file_path, constants.R_OK);
        await parse(file_path);
      } catch {
        continue;
      }
    } else {
      const row = await getDB().findOne({ path: file_path });
      if (row) continue;
      console.log(`Parsing ${file_path}`);

      const type = await getType(file_path);
      const duration = (type?.startsWith('audio') || type?.startsWith('video')) ? (await getDuration(file_path)) : null;

      await getDB().insertOne({
        duration,
        path: file_path,
        last_updated: getLastUpdated(f),
      });
    }
  }
}

try {
  if (process.argv.includes('-c') || process.argv.includes('--clean')) await dropDB();
  await parse(file_source);
  process.exit(0);
} catch (error) {
  console.error('Failed to update file database');
  console.error(error);
}
