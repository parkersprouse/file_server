import fs from 'node:fs';
import path from 'node:path';
import { fileTypeFromFile } from 'file-type';
import { cloneDeep, orderBy } from 'lodash-es';
import qs from 'qs';
import { formatDuration, getVideoDuration } from '../lib/index.js';

/**
 * @param {RequestObject} request - The request object sent to the server.
 * @param {Object} h - The Hapi server instance.
 * @param {String} root_path - The absolute system path to the root directory being served.
 * @param {String} local_path - The absolute system path to the directory.
 * @param {String} req_path - The URL path being requested.
 * @returns {ResponseObject}
 */
async function handleDirectory(request, h, root_path, local_path, req_path) {
  const show_grid = request.query.view === 'grid';
  const sort_by_duration = request.query.sort === 'duration';
  const files = fs.readdirSync(local_path, { withFileTypes: true });

  // We don't want to serve any directories under our thumbnail folder
  if (req_path.startsWith('/.thumbnails')) return h.view('404').code(404);

  let parsed = [];
  for (let i = 0; i < files.length; i += 1) {
    const f = files[i];
    const dir = f.isDirectory();

    // We don't want the thumbnail folder to be listed
    if (f.name === '.thumbnails') continue;

    const encoded_name = encodeURIComponent(f.name);
    const encoded_local_path = path.join(local_path, encoded_name);
    const encoded_root_path = path.relative(root_path, encoded_local_path);
    const output = {
      name: f.name,
      path: `${encoded_root_path}?${qs.stringify(request.query)}`,
      icon: dir ? 'ri-folder-line' : 'ri-file-line',
      type: dir ? 'folder' : 'file',
    };

    if (!dir) {
      const file_path = path.join(local_path, f.name);

      const determined_type = await fileTypeFromFile(file_path);
      if (determined_type?.mime?.startsWith('image')) {
        output.icon = 'ri-image-2-line';
        output.type = 'image';
        if (show_grid) output.src = path.join(req_path, f.name);
      } else if (determined_type?.mime?.startsWith('video')) {
        output.icon = 'ri-vidicon-line';
        output.type = 'video';

        const dur = await getVideoDuration(file_path);
        output.duration = formatDuration(dur);
        output.raw_duration = dur;

        const thumbnail_file = f.name.replace(path.extname(f.name), '.png');
        const thumbnail_path = path.join(root_path, '.thumbnails', req_path, thumbnail_file);
        if (fs.existsSync(thumbnail_path)) output.thumbnail = path.join('/.thumbnails', req_path, thumbnail_file);
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

  parsed = sortEntries(parsed, sort_by_duration);

  const root_url = `/?${qs.stringify(request.query)}`;
  const previous_url = request.path === '/' ? null : `${path.join(req_path, '..')}?${qs.stringify(request.query)}`;
  return h.view('page', {
    files: parsed,
    previous_url,
    root_url,
    show_grid,
    sort_by_duration,
    list_view_url: generateUrl(req_path, request.query, 'view', 'list'),
    grid_view_url: generateUrl(req_path, request.query, 'view', 'grid'),
    duration_sort_url: generateUrl(req_path, request.query, 'sort', 'duration'),
    name_sort_url: generateUrl(req_path, request.query, 'sort', 'name'),
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
 * @param {String} path - The URL path that will be the base of the generated URL.
 * @param {String} query - The existing query string that we'll use as a base to update.
 * @param {String} attr - The query string attribute we want to add / update.
 * @param {String} value - The value we want to give to the query string attribute.
 * @returns {String} - The newly-built URL path with query string.
 */
function generateUrl(path, query, attr, value) {
  const new_query = cloneDeep(query);
  new_query[attr] = value;
  return `${path}?${qs.stringify(new_query)}`;
}

/**
 * Sorts the provided array by putting folders on top, followed by files with non-alphanumeric characters.
 * If `sort_by_duration` is true, then the remaining files will be sorted by duration (applies to videos).
 * If false, then do a standard alphabetical sort.
 * @param {Array} arr - The array of files we want to sort.
 * @param {Boolean} sort_by_duration - Whether we're sorting by duration or not.
 * @returns {Array} - The sorted array that will be used to build the front-end.
 */
function sortEntries(arr, sort_by_duration) {
  const iteratees = [
    (i) => i.type === 'folder',
    (i) => i.name.match(/^\W+/) === null,
    (i) => i.name.toLowerCase(),
  ];
  const orders = ['desc', 'asc', 'asc'];
  if (sort_by_duration) {
    iteratees.splice(1, 0, (i) => i.raw_duration || 0);
    orders.splice(1, 0, 'desc');
  }
  return orderBy(arr, iteratees, orders);
}

/**
 * GET /*
 */
export default {
  method: 'GET',
  path: '/{any*}',
  handler: function (request, h) {
    try {
      const { root_path } = h.request.server.settings.app;
      const req_path = decodeURIComponent(request.path);
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
