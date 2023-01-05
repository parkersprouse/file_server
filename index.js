import fs from 'node:fs';
import path from 'node:path';
import Hapi from '@hapi/hapi';
import inert from '@hapi/inert';
import vision from '@hapi/vision';
import handlebars from 'handlebars';
import qs from 'qs';
import config from './config.js';
import assets_route from './routes/assets.js';
import files_route from './routes/files.js';
import not_found_route from './routes/not_found.js';

async function init() {
  const root_path = config.file_source;
  if (!root_path) throw 'No file source path provided';
  if (!fs.existsSync(root_path) || !fs.statSync(root_path).isDirectory())
    throw 'Invalid file source path provided';

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
  await server.register(vision);

  server.views({
    engines: {
      html: handlebars,
    },
    relativeTo: __dirname,
    path: path.join(__dirname, 'templates'),
    partialsPath: path.join(__dirname, 'templates', 'partials'),
  });

  // Respond with any requested assets
  server.route(assets_route);

  // Attempt to get the requested file from the file system
  server.route(files_route);

  // Anything non-GET is immediately a 404
  server.route(not_found_route);

  await server.start();
  console.log('Server running on %s', server.info.uri);
}

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
