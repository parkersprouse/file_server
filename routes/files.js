import fs from 'node:fs';
import path from 'node:path';
import {
  atRoot,
  formatDuration,
  formatLastUpdated,
  generateUrl,
  getLastUpdated,
  getDuration,
  toQuery,
  sortEntries,
  strip,
  toBreadcrumbs,
} from '../lib/index.js';
import { getType } from '../services/content_type.js';

const valid_views = Object.freeze(['list', 'grid']);
const valid_sorts = Object.freeze(['name', 'duration', 'last_updated']);

/**
 * @param {RequestObject} request - The request object sent to the server.
 * @param {Object} hapi - The Hapi server instance.
 * @param {String} root_path - The absolute system path to the root directory being served.
 * @param {String} local_path - The absolute system path to the directory.
 * @param {String} req_path - The URL path being requested.
 * @returns {ResponseObject}
 */
async function handleDirectory(request, hapi, root_path, local_path, request_path) {
  const view_parameter = valid_views.includes(request.query.view?.toLowerCase()) ? request.query.view.toLowerCase() : 'list';
  const sort_parameter = valid_sorts.includes(request.query.sort?.toLowerCase()) ? request.query.sort.toLowerCase() : 'name';

  const files = fs.readdirSync(local_path, { withFileTypes: true });

  // We don't want to serve any directories under our thumbnail folder
  if (request_path.startsWith('/.thumbnails')) return hapi.view('404').code(404);

  let parsed = [];
  for (const file of files) {
    // TODO: List symbolic links as special, untraversable entries
    if (file.isSymbolicLink()) continue;
    const dir = file.isDirectory();

    // We don't want the thumbnail folder to be listed
    if (file.name === '.thumbnails') continue;

    const encoded_name = encodeURIComponent(file.name);
    const encoded_local_path = path.join(local_path, encoded_name);
    const encoded_root_path = path.relative(root_path, encoded_local_path);

    const file_path = path.join(local_path, file.name);
    const last_updated = getLastUpdated(file_path);
    const output = {
      icon: dir ? 'fa-sharp fa-solid fa-folder' : 'fa-sharp fa-light fa-file-circle-question',
      last_updated: formatLastUpdated(last_updated),
      name: file.name,
      path: `/f/${strip(encoded_root_path)}${toQuery(request.query)}`,
      raw_last_updated: last_updated,
      type: dir ? 'folder' : 'file',
    };

    if (!dir) {
      const determined_type = await getType(file_path);
      if (determined_type?.startsWith('image')) {
        output.icon = 'fa-sharp fa-light fa-image';
        output.type = 'image';
        if (view_parameter === 'grid') output.src = `/f/${strip(request_path)}/${file.name}`;
      } else if (determined_type?.startsWith('video')) {
        output.icon = 'fa-sharp fa-light fa-film';
        output.type = 'video';

        const dur = await getDuration(file_path);
        output.duration = formatDuration(dur);
        output.raw_duration = dur;

        const thumbnail_file = file.name.replace(path.extname(file.name), '.png');
        const thumbnail_path = path.join(root_path, '.thumbnails', request_path, thumbnail_file);
        if (fs.existsSync(thumbnail_path)) {
          output.thumbnail = `/f/.thumbnails/${strip(request_path)}/${strip(encodeURIComponent(thumbnail_file))}`;
        }
      } else if (determined_type?.startsWith('audio')) {
        output.icon = 'fa-sharp fa-light fa-music';
        output.type = 'audio';

        const dur = await getDuration(file_path);
        output.duration = formatDuration(dur);
        output.raw_duration = dur;
      } else if (determined_type?.startsWith('text')) {
        output.icon = 'fa-sharp fa-light fa-file-alt';
        output.type = 'text';
      }

      if (file_path.toLowerCase().endsWith('.url')) {
        output.icon = 'fa-sharp fa-light fa-external-link';
        const lines = fs.readFileSync(file_path).toString('utf8').split('\n');
        for (const line in lines) {
          if (line.trim().startsWith('URL=')) output.external_url = line.split('=')[1];
        }
      }
    }

    parsed.push(output);
  }

  parsed = sortEntries(parsed, sort_parameter);

  const { query } = request;
  const breadcrumbs = toBreadcrumbs(request_path, query);

  return hapi.view('page', {
    at_root: atRoot(request_path),
    breadcrumbs,
    duration_sort_url: generateUrl(request_path, query, 'sort', 'duration'),
    files: parsed,
    grid_view_url: generateUrl(request_path, query, 'view', 'grid'),
    last_updated_sort_url: generateUrl(request_path, query, 'sort', 'last_updated'),
    list_view_url: generateUrl(request_path, query, 'view', 'list'),
    name_sort_url: generateUrl(request_path, query, 'sort', 'name'),
    root_url: `/f${toQuery(query)}`,
    sort_param: sort_parameter,
    view_param: view_parameter,
  });
}

/**
 * @param {Object} hapi - The Hapi server instance.
 * @param {String} local_path - The absolute system path to the file.
 * @returns {ResponseObject}
 */
function handleFile(hapi, local_path) {
  return hapi.file(local_path, { confine: false, mode: 'inline', etagMethod: 'simple' }).code(200);
}

/**
 * GET /*
 */
export default {
  method: 'GET',
  path: '/f/{any*}',
  handler(request, hapi) {
    try {
      const { root_path } = hapi.request.server.settings.app;
      const request_path = decodeURIComponent(request.path).replace(/^\/f/, '').replaceAll(/\/+/, '/') || '/';
      const local_path = path.join(root_path, request_path);
      const stats = fs.statSync(local_path);
      if (stats.isDirectory()) return handleDirectory(request, hapi, root_path, local_path, request_path);
      if (stats.isFile()) return handleFile(hapi, local_path);
      return hapi.view('404').code(404);
    } catch {
      return hapi.view('404').code(404);
    }
  },
};
