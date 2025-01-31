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
    output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" /></svg>';
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
        output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" /></svg>';
      } else {
        throw new Error('Could not find URL in XML file - falling back to standard XML file treatment');
      }
    } catch (e) {
      console.error('Failed to parse XML from .xml file:', e.message);
      output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z" /></svg>';
    }
  } else if (type === 'image') {
    output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z" /></svg>';
    output.type = 'image';
    output.src = `/f/${strip(request_path)}/${file.name}`;
  } else if (type === 'video' || (determined_type === 'application/octet-stream' && ext === '.mp4')) {
    const dur = await getDuration(file_path);
    output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,88h80v80H40Zm96-16V56h32V72Zm-16,0H88V56h32Zm0,112v16H88V184Zm16,0h32v16H136Zm0-16V88h80v80Zm80-96H184V56h32ZM72,56V72H40V56ZM40,184H72v16H40Zm176,16H184V184h32v16Z" /></svg>';
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
    output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M212.92,17.71a7.89,7.89,0,0,0-6.86-1.46l-128,32A8,8,0,0,0,72,56V166.1A36,36,0,1,0,88,196V102.25l112-28V134.1A36,36,0,1,0,216,164V24A8,8,0,0,0,212.92,17.71Z" /></svg>';
    output.type = 'audio';
    output.duration = formatDuration(dur);
    output.raw_duration = dur;
  } else if (type === 'text') {
    output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z" /></svg>';
    output.type = 'text';
  } else if (subtype === 'pdf') {
    output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M224,152a8,8,0,0,1-8,8H192v16h16a8,8,0,0,1,0,16H192v16a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8h32A8,8,0,0,1,224,152ZM92,172a28,28,0,0,1-28,28H56v8a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8H64A28,28,0,0,1,92,172Zm-16,0a12,12,0,0,0-12-12H56v24h8A12,12,0,0,0,76,172Zm88,8a36,36,0,0,1-36,36H112a8,8,0,0,1-8-8V152a8,8,0,0,1,8-8h16A36,36,0,0,1,164,180Zm-16,0a20,20,0,0,0-20-20h-8v40h8A20,20,0,0,0,148,180ZM40,112V40A16,16,0,0,1,56,24h96a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,216,88v24a8,8,0,0,1-16,0V96H152a8,8,0,0,1-8-8V40H56v72a8,8,0,0,1-16,0ZM160,80h28.69L160,51.31Z" /></svg>';
    output.type = 'pdf';
  } else if (isArchive(subtype)) {
    output.icon = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H112V200h8a8,8,0,0,0,0-16h-8V168h8a8,8,0,0,0,0-16h-8V136h8a8,8,0,0,0,0-16h-8v-8a8,8,0,0,0-16,0v8H88a8,8,0,0,0,0,16h8v16H88a8,8,0,0,0,0,16h8v16H88a8,8,0,0,0,0,16h8v16H56V40h88V88a8,8,0,0,0,8,8h48V216Z" /></svg>';
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
        ? '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M232,88V200.89A15.13,15.13,0,0,1,216.89,216H40a16,16,0,0,1-16-16V64A16,16,0,0,1,40,48H93.33a16.12,16.12,0,0,1,9.6,3.2L130.67,72H216A16,16,0,0,1,232,88Z" /></svg>'
        : '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" /></svg>',
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
