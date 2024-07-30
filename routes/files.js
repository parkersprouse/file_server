/* eslint-disable no-param-reassign */
import { statSync } from 'node:fs';
import { opendir } from 'node:fs/promises';
import path from 'node:path';

import {
  atRoot,
  generateUrl,
  sortEntries,
  toBreadcrumbs,
  toQuery,
} from '../lib/index.js';
import { parse } from '../services/parse_directory.js';

const valid_views = Object.freeze(['list_compact', 'list_block', 'grid']);
const valid_sorts = Object.freeze(['name', 'duration', 'last_updated']);

/**
 * @param {RequestObject} request - The request object sent to the server.
 * @param {Object} hapi - The Hapi server instance.
 * @returns {ResponseObject}
 */
async function handleDirectory(request, hapi) {
  const { local_path, request_path, query } = request;

  // We don't want to serve any directories under our thumbnail folder
  if (request_path.startsWith('/.thumbnails')) return hapi.view('404').code(404);

  const view_parameter = valid_views.includes(query.view?.toLowerCase()) ? query.view.toLowerCase() : 'list_compact';
  const sort_parameter = valid_sorts.includes(query.sort?.toLowerCase()) ? query.sort.toLowerCase() : 'name';

  const files = await opendir(local_path, {
    bufferSize: 512,
    recursive: false,
  });
  let parsed = await parse(files, request);
  parsed = sortEntries(parsed, sort_parameter);

  return hapi.view('page', {
    at_root: atRoot(request_path),
    breadcrumbs: toBreadcrumbs(request_path, query),
    duration_sort_url: generateUrl(request_path, query, 'sort', 'duration'),
    files: parsed,
    grid_view_url: generateUrl(request_path, query, 'view', 'grid'),
    last_updated_sort_url: generateUrl(request_path, query, 'sort', 'last_updated'),
    list_block_view_url: generateUrl(request_path, query, 'view', 'list_block'),
    list_compact_view_url: generateUrl(request_path, query, 'view', 'list_compact'),
    name_sort_url: generateUrl(request_path, query, 'sort', 'name'),
    root_url: `/f${toQuery(query)}`,
    sort_param: sort_parameter,
    view_param: view_parameter,
  });
}

/**
 * @param {RequestObject} request - The request object sent to the server.
 * @param {Object} hapi - The Hapi server instance.
 * @returns {ResponseObject}
 */
function handleFile(request, hapi) {
  return hapi.file(request.local_path, {
    confine: false,
    etagMethod: 'simple',
    mode: 'inline',
  }).code(200);
}

/**
 * GET /f/*
 */
export default {
  handler(request, hapi) {
    try {
      const { root_path } = hapi.request.server.settings.app;
      const request_path = decodeURIComponent(request.path).replace(/^\/f/, '').replaceAll(/\/+/g, '/') || '/';
      const local_path = path.join(root_path, request_path);
      const stats = statSync(local_path);
      request.root_path = root_path;
      request.local_path = local_path;
      request.request_path = request_path;
      if (stats.isDirectory()) return handleDirectory(request, hapi);
      if (stats.isFile()) return handleFile(request, hapi);
      return hapi.view('404').code(200);
    } catch (error) {
      console.log(error);
      return hapi.view('404').code(200);
    }
  },
  method: 'GET',
  path: '/f/{any*}',
};
