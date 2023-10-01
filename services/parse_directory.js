import fs from 'node:fs';
import path from 'node:path';
import {
  formatDuration,
  formatLastUpdated,
  getLastUpdated,
  getDuration,
  toQuery,
  strip,
} from '../lib/index.js';
import { getType } from './content_type.js';

async function handleFile(request, file, view_parameter) {
  const { request_path, root_path } = request;
  const { file_path } = file;
  const output = {};
  const determined_type = await getType(file_path);

  if (determined_type?.startsWith('image')) {
    output.icon = 'fa-sharp fa-light fa-image';
    output.type = 'image';
    if (view_parameter === 'grid') output.src = `/f/${strip(request_path)}/${file.name}`;
  } else if (determined_type?.startsWith('video')) {
    const dur = await getDuration(file_path);
    output.icon = 'fa-sharp fa-light fa-film';
    output.type = 'video';
    output.duration = formatDuration(dur);
    output.raw_duration = dur;

    const thumbnail_file = file.name.replace(path.extname(file.name), '.png');
    const thumbnail_path = path.join(root_path, '.thumbnails', request_path, thumbnail_file);
    if (fs.existsSync(thumbnail_path)) {
      output.thumbnail = `/f/.thumbnails/${strip(request_path)}/${strip(encodeURIComponent(thumbnail_file))}`;
    }
  } else if (determined_type?.startsWith('audio')) {
    const dur = await getDuration(file_path);
    output.icon = 'fa-sharp fa-light fa-music';
    output.type = 'audio';
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

  return output;
}

export async function parse(files, request, view_parameter) {
  const { local_path, root_path } = request;

  const parsed = [];
  for (const file of files) {
    // TODO: List symbolic links as special, untraversable entries
    if (file.isSymbolicLink()) continue;
    const dir = file.isDirectory();

    // We don't want the thumbnail folder to be listed
    if (file.name === '.thumbnails') continue;
    file.file_path = path.join(local_path, file.name);

    const encoded_name = encodeURIComponent(file.name);
    const encoded_local_path = path.join(local_path, encoded_name);
    const encoded_root_path = path.relative(root_path, encoded_local_path);

    const last_updated = getLastUpdated(file.file_path);
    const output = {
      icon: dir ? 'fa-sharp fa-solid fa-folder' : 'fa-sharp fa-light fa-file-circle-question',
      last_updated: formatLastUpdated(last_updated),
      name: file.name,
      path: `/f/${strip(encoded_root_path)}${toQuery(request.query)}`,
      raw_last_updated: last_updated,
      type: dir ? 'folder' : 'file',
    };

    if (!dir) Object.assign(output, await handleFile(request, file, view_parameter));

    parsed.push(output);
  }

  return parsed;
}

export default {
  parse,
};
