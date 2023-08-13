import fs from 'fs';
import path from 'path';
import { fileTypeFromFile } from 'file-type';
import qs from 'qs';
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

const valid_views = Object.freeze(['list', 'grid']);
const valid_sorts = Object.freeze(['name', 'duration', 'last_updated']);

/**
 * @param {RequestObject} request - The request object sent to the server.
 * @param {Object} h - The Hapi server instance.
 * @param {String} root_path - The absolute system path to the root directory being served.
 * @param {String} local_path - The absolute system path to the directory.
 * @param {String} req_path - The URL path being requested.
 * @returns {ResponseObject}
 */
async function handleDirectory(request, h, root_path, local_path, req_path) {
  const view_param = valid_views.includes(request.query.view?.toLowerCase()) ? request.query.view.toLowerCase() : 'list';
  const sort_param = valid_sorts.includes(request.query.sort?.toLowerCase()) ? request.query.sort.toLowerCase() : 'name';

  const files = fs.readdirSync(local_path, { withFileTypes: true });

  // We don't want to serve any directories under our thumbnail folder
  if (req_path.startsWith('/.thumbnails')) return h.view('404').code(404);

  let parsed = [];
  for (let i = 0; i < files.length; i += 1) {
    const f = files[i];
    if (f.isSymbolicLink()) continue; // TODO: List symbolic links as special, untraversable entries
    const dir = f.isDirectory();

    // We don't want the thumbnail folder to be listed
    if (f.name === '.thumbnails') continue;

    const encoded_name = encodeURIComponent(f.name);
    const encoded_local_path = path.join(local_path, encoded_name);
    const encoded_root_path = path.relative(root_path, encoded_local_path);

    const file_path = path.join(local_path, f.name);
    const last_updated = getLastUpdated(file_path);
    const output = {
      icon: dir ? 'ri-folder-fill' : 'ri-file-line',
      last_updated: formatLastUpdated(last_updated),
      name: f.name,
      path: `/f/${strip(encoded_root_path)}${toQuery(request.query)}`,
      raw_last_updated: last_updated,
      type: dir ? 'folder' : 'file',
    };

    if (!dir) {
      const determined_type = await fileTypeFromFile(file_path);
      if (determined_type?.mime?.startsWith('image')) {
        output.icon = 'ri-image-2-line';
        output.type = 'image';
        if (view_param === 'grid') output.src = `/f/${strip(req_path)}/${f.name}`;
      } else if (determined_type?.mime?.startsWith('video')) {
        output.icon = 'ri-film-line';
        output.type = 'video';

        const dur = await getDuration(file_path);
        output.duration = formatDuration(dur);
        output.raw_duration = dur;

        const thumbnail_file = f.name.replace(path.extname(f.name), '.png');
        const thumbnail_path = path.join(root_path, '.thumbnails', req_path, thumbnail_file);
        if (fs.existsSync(thumbnail_path)) {
          output.thumbnail = `/f/.thumbnails/${strip(req_path)}/${strip(encodeURIComponent(thumbnail_file))}`;
        }
      } else if (determined_type?.mime?.startsWith('audio')) {
        output.icon = 'ri-headphone-line';
        output.type = 'audio';

        const dur = await getDuration(file_path);
        output.duration = formatDuration(dur);
        output.raw_duration = dur;
      }

      if (file_path.toLowerCase().endsWith('.url')) {
        output.icon = 'ri-external-link-line';
        fs.readFileSync(file_path).toString('utf8').split('\n').forEach((line) => {
          if (line.trim().startsWith('URL=')) output.external_url = line.split('=')[1];
        });
      }
    }

    parsed.push(output);
  }
  parsed = sortEntries(parsed, sort_param);

  const query = qs.stringify(request.query);
  const breadcrumbs = toBreadcrumbs(req_path, query);

  return h.view('page', {
    at_root: atRoot(req_path),
    breadcrumbs,
    duration_sort_url: generateUrl(req_path, request.query, 'sort', 'duration'),
    files: parsed,
    grid_view_url: generateUrl(req_path, request.query, 'view', 'grid'),
    last_updated_sort_url: generateUrl(req_path, request.query, 'sort', 'last_updated'),
    list_view_url: generateUrl(req_path, request.query, 'view', 'list'),
    name_sort_url: generateUrl(req_path, request.query, 'sort', 'name'),
    root_url: `/f${toQuery(query)}`,
    sort_param,
    view_param,
  });
}

/**
 * @param {Object} h - The Hapi server instance.
 * @param {String} local_path - The absolute system path to the file.
 * @returns {ResponseObject}
 */
function handleFile(h, local_path) {
  return h.file(local_path, { confine: false, mode: 'inline', etagMethod: 'simple' }).code(200);
}

/**
 * GET /*
 */
export default {
  method: 'GET',
  path: '/f/{any*}',
  handler: function (request, h) {
    try {
      const { root_path } = h.request.server.settings.app;
      const req_path = decodeURIComponent(request.path).replace(/^\/f/, '').replace(/\/+/g, '/') || '/';
      const local_path = path.join(root_path, req_path);
      const stats = fs.statSync(local_path);
      if (stats.isDirectory()) return handleDirectory(request, h, root_path, local_path, req_path);
      if (stats.isFile()) return handleFile(h, local_path);
      return h.view('404').code(404);
    } catch (e) {
      return h.view('404').code(404);
    }
  },
};
