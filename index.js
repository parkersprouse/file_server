import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import Hapi from '@hapi/hapi';
import inert from '@hapi/inert';
import logger from '@hapi/log';
import vision from '@hapi/vision';
import handlebars from 'handlebars';
import qs from 'qs';
import config from './config.js';
import { initTemplateEngine } from './lib/init_template_engine.js';
import assets_route from './routes/assets.js';
import files_route from './routes/files.js';
import not_found_route from './routes/not_found.js';

async function init() {
  const root_path = config.file_source;
  if (!root_path) throw new Error('No file source path provided');
  if (!fs.existsSync(root_path) || !fs.statSync(root_path).isDirectory()) {
    throw new Error('Invalid file source path provided');
  }

  initTemplateEngine(handlebars);

  const __dirname = path.resolve('.');
  const server = Hapi.server({
    app: {
      __dirname,
      config,
      root_path,
    },
    port: config.port,
    host: config.host,
    router: {
      stripTrailingSlash: true,
    },
    routes: {
      files: {
        relativeTo: root_path,
      },
    },
    query: {
      parser: (query) => qs.parse(query),
    },
  });

  await server.register(inert);
  await server.register(logger);
  await server.register(vision);

  server.plugins.log.setLevel('notice');

  server.views({
    engines: {
      html: handlebars,
    },
    relativeTo: __dirname,
    path: path.join(__dirname, 'server', 'templates'),
    partialsPath: path.join(__dirname, 'server', 'templates', 'partials'),
  });

  server.ext('onRequest', (request, hapi) => {
    if (request.path === '/') request.setUrl('/f');
    return hapi.continue;
  });

  // Attempt to get the requested file from the file system
  server.route(files_route);

  // Respond with any requested assets
  server.route(assets_route);

  // Anything non-GET is immediately a 404
  server.route(not_found_route);

  await server.start();
  server.log('info', `Server running on ${server.info.uri}`);
}

process.on('unhandledRejection', (error) => {
  console.error(error);
  process.exit(1);
});

await init();
