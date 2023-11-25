import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

export const db_host = process.env.DB_HOST;
export const file_source = process.env.FILE_SERVER_FILES_SOURCE;
export const host = process.env.FILE_SERVER_HOST || '0.0.0.0';
export const port = process.env.FILE_SERVER_PORT || 3000;

export default {
  db_host,
  file_source,
  host,
  port,
};
