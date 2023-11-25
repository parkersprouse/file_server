import { MongoClient } from 'mongodb';
import { db_host } from '../config.js';

export async function dropDB() {
  const client = new MongoClient(db_host);
  const db = client.db('node_file_browser');
  await db.dropCollection('files');
}

let files;
export function getDB() {
  if (files) return files;
  const client = new MongoClient(db_host);
  const db = client.db('node_file_browser');
  files = db.collection('files', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        title: 'Files Validation',
        required: ['path', 'last_updated'],
        uniqueItems: ['path'],
        properties: {
          duration: {
            bsonType: 'double',
            description: '\'duration\' must be a double if the field exists',
          },
          last_updated: {
            bsonType: 'double',
            description: '\'last_updated\' must be an double and is required',
          },
          path: {
            bsonType: 'string',
            description: '\'path\' must be a string and is required',
          },
        },
      },
    },
  });
  return files;
}

export default {
  dropDB,
  getDB,
};
