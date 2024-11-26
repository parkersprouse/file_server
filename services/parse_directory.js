import fs from 'node:fs/promises';
import path from 'node:path';

import { XMLParser } from 'fast-xml-parser';

import {
  formatDuration,
  formatLastUpdated,
  getDuration,
  getLastUpdated,
  strip,
  toQuery,
} from '../lib/index.js';

import { getType } from './content_type.js';

const archive_types = Object.freeze(['x-7z-compressed', 'x-rar', 'x-tar', 'x-xz', 'zip']);
function isArchive(subtype) {
  if (!subtype) return false;
  return archive_types.includes(subtype);
}

async function handleFile(request, file) {
  const { request_path, root_path } = request;
  const { file_path } = file;
  const ext = path.extname(file_path).toLowerCase();
  const determined_type = await getType(file_path);
  const [type, subtype] = determined_type?.split('/').map((part) => part.toLowerCase()) ?? {};

  const output = {};
  if (ext === '.url') {
    output.icon = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-square-arrow-out-up-right'><path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6'/><path d='m21 3-9 9'/><path d='M15 3h6v6'/></svg>";
    const lines = (await fs.readFile(file_path)).toString('utf8').split('\n');
    for (const line of lines) {
      if (line.trim().toLowerCase().startsWith('url=')) output.external_url = line.split('=')[1];
    }
  } else if (subtype === 'xml') {
    try {
      const data = await fs.readFile(file_path);
      const parser = new XMLParser({
        ignoreDeclaration: true,
        trimValues: true,
      });
      const parsed = parser.parse(data);
      const url = parsed?.plist?.dict?.string;
      if (url) {
        output.external_url = url;
        output.icon = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-square-arrow-out-up-right'><path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6'/><path d='m21 3-9 9'/><path d='M15 3h6v6'/></svg>";
      } else {
        throw new Error('Could not find URL in XML file - falling back to standard XML file treatment');
      }
    } catch (e) {
      console.error('Failed to parse XML from .xml file:', e.message);
      output.icon = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-file-code'><path d='M10 12.5 8 15l2 2.5'/><path d='m14 12.5 2 2.5-2 2.5'/><path d='M14 2v4a2 2 0 0 0 2 2h4'/><path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z'/></svg>";
    }
  } else if (type === 'image') {
    output.icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
    output.type = 'image';
    output.src = `/f/${strip(request_path)}/${file.name}`;
  } else if (type === 'video' || (determined_type === 'application/octet-stream' && ext === '.mp4')) {
    const dur = await getDuration(file_path);
    output.icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>';
    output.type = 'video';
    output.duration = formatDuration(dur);
    output.raw_duration = dur;

    const thumbnail_file = file.name.replace(path.extname(file.name), '.png');
    const thumbnail_path = path.join(root_path, '.thumbnails', request_path, thumbnail_file);

    try {
      await fs.stat(thumbnail_path);
      output.thumbnail = `/f/.thumbnails/${strip(request_path)}/${strip(encodeURIComponent(thumbnail_file))}`;
    } catch { /* no thumbnail available for this video */ }
  } else if (type === 'audio') {
    const dur = await getDuration(file_path);
    output.icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    output.type = 'audio';
    output.duration = formatDuration(dur);
    output.raw_duration = dur;
  } else if (type === 'text') {
    output.icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>';
    output.type = 'text';
  } else if (subtype === 'pdf') {
    output.icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-type"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 13v-1h6v1"/><path d="M12 12v6"/><path d="M11 18h2"/></svg>';
    output.type = 'pdf';
  } else if (isArchive(subtype)) {
    output.icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-archive"><path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v18"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="20" r="2"/><path d="M10 7V6"/><path d="M10 12v-1"/><path d="M10 18v-2"/></svg>';
    output.type = 'archive';
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
      icon: dir
        ? '<svg class="lucide lucide-folder" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>'
        : '<svg class="lucide lucide-file" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
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
