import process from 'node:process';

import dotenv from 'dotenv';

dotenv.config();

export default {
  file_source: process.env.FILE_SERVER_FILES_SOURCE,
  host: process.env.FILE_SERVER_HOST || '0.0.0.0',
  port: process.env.FILE_SERVER_PORT || 3000,
};
