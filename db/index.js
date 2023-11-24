import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AsyncDatabase } from 'promised-sqlite3';

class Database {
  async init() {
    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      this.instance = await AsyncDatabase.open(join(__dirname, 'db', 'files.db'));
      return this;
    } catch {}
  }
}

const tempdb = new Database();
await tempdb.init();
export const db = tempdb.instance || null;

export default {
  db,
};
