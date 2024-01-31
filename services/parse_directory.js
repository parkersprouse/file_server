import fs from 'node:fs/promises';
import { getType } from './content_type.js';
import path from 'node:path';
import {
  formatDuration,
  formatLastUpdated,
  getDuration,
  getLastUpdated,
  strip,
  toQuery,
} from '../lib/index.js';

const archive_types = Object.freeze(['x-7z-compressed', 'x-rar', 'x-tar', 'x-xz', 'zip']);
function isArchive(type) {
  if (!type) return false;
  return archive_types.some((t) => type.endsWith(t));
}

async function handleFile(request, file) {
  const { request_path, root_path } = request;
  const { file_path } = file;
  const output = {};
  const determined_type = await getType(file_path);

  if (determined_type?.startsWith('image')) {
    output.icon = 'material-symbols-sharp file_image outlined';
    output.type = 'image';
    output.src = `/f/${strip(request_path)}/${file.name}`;
  } else if (determined_type?.startsWith('video')) {
    const dur = await getDuration(file_path);
    output.icon = 'material-symbols-sharp file_video outlined';
    output.type = 'video';
    output.duration = formatDuration(dur);
    output.raw_duration = dur;

    const thumbnail_file = file.name.replace(path.extname(file.name), '.png');
    const thumbnail_path = path.join(root_path, '.thumbnails', request_path, thumbnail_file);

    try {
      await fs.stat(thumbnail_path);
      output.thumbnail = `/f/.thumbnails/${strip(request_path)}/${strip(encodeURIComponent(thumbnail_file))}`;
    } catch { /* no thumbnail available for this video */ }
  } else if (determined_type?.startsWith('audio')) {
    const dur = await getDuration(file_path);
    output.icon = 'material-symbols-sharp file_audio outlined';
    output.type = 'audio';
    output.duration = formatDuration(dur);
    output.raw_duration = dur;
  } else if (determined_type?.startsWith('text')) {
    output.icon = 'material-symbols-sharp file_text outlined';
    output.type = 'text';
  } else if (determined_type?.endsWith('pdf')) {
    output.icon = 'material-symbols-sharp file_pdf outlined';
    output.type = 'pdf';
  } else if (isArchive(determined_type)) {
    output.icon = 'material-symbols-sharp file_archive outlined';
    output.type = 'archive';
  }

  if (file_path.toLowerCase().endsWith('.url')) {
    output.icon = 'material-symbols-sharp external_link outlined';
    const lines = (await fs.readFile(file_path)).toString('utf8').split('\n');
    for (const line of lines) {
      if (line.trim().toLowerCase().startsWith('url=')) output.external_url = line.split('=')[1];
    }
  }

  return output;
}

export async function parse(files, request) {
  const { local_path, root_path } = request;

  const parsed = [];
  for await (const file of files) {
    // TODO: List symbolic links as special, untraversable entries
    if (file.isSymbolicLink()) continue;
    // We don't want the thumbnail folder to be listed
    if (file.name === '.thumbnails') continue;

    const dir = file.isDirectory();
    file.file_path = path.join(local_path, file.name);

    const encoded_name = encodeURIComponent(file.name);
    const encoded_local_path = path.join(local_path, encoded_name);
    const encoded_root_path = path.relative(root_path, encoded_local_path);

    const last_updated = getLastUpdated(file.file_path);
    const output = {
      icon: dir ? 'material-symbols-sharp folder filled' : 'material-symbols-sharp file_default outlined',
      last_updated: formatLastUpdated(last_updated),
      name: file.name,
      path: `/f/${strip(encoded_root_path)}${toQuery(request.query)}`,
      raw_last_updated: last_updated,
      type: dir ? 'folder' : 'file',
    };

    if (!dir) Object.assign(output, await handleFile(request, file));

    parsed.push(output);
  }

  return parsed;
}

export default {
  parse,
};
