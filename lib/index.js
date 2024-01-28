import { execa } from 'execa';
import ffprobe from '@ffprobe-installer/ffprobe';
import fs from 'node:fs';
import qs from 'qs';
import { cloneDeep, isEmpty, orderBy } from 'lodash-es';
import { DateTime, Duration } from 'luxon';

export function atRoot(path) {
  return path === '/' || path === '/f';
}

/**
 * Returns a promise that will be resolved with the duration of given video in seconds.
 * @param {String} input - Stream or URL or path to file to be used as input for `ffprobe`.
 * @returns {Promise} - A `child_process` instance, which is enhanced to also be a `Promise`
 *   for a result Object with stdout and stderr properties.
 */
function executeProbe(input) {
  const probe_parameters = ['-v', 'error', '-show_format', '-show_streams', input];
  if (typeof input !== 'string') throw new Error('Given input was not a string');
  return execa(ffprobe.path, probe_parameters);
}

/**
 * Returns a promise that will be resolved with the duration of given video in seconds.
 * @param {Integer} full_seconds - The number of seconds we want to format as HH:MM:SS.
 * @returns {String} - Seconds formatted as an HH:MM:SS string.
 */
export function formatDuration(full_seconds) {
  const units = ['minutes', 'seconds'];
  let d = Duration.fromMillis(1000 * full_seconds).rescale().set({ milliseconds: 0 });
  if (d.hours > 0) units.splice(0, 0, 'hours');
  d = d.shiftTo(...units);
  return {
    long: d.toHuman(),
    short: d.toFormat('hh:mm:ss'),
  };
}

export function formatLastUpdated(epoch) {
  const dt = DateTime.fromMillis(epoch);
  return {
    absolute: dt.toLocaleString({
      day: 'numeric',
      hour: '2-digit',
      hour12: true,
      minute: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    relative: dt.toRelative({
      locale: 'en-US',
      style: 'long',
    }),
  };
}

/**
 * Returns a promise that will be resolved with the duration of given video in seconds.
 * @param {String} input - Stream or URL or path to file to be used as input for `ffprobe`.
 * @returns {Promise<Float>} - Promise that will be resolved with given video duration in seconds.
 */
export async function getDuration(input) {
  try {
    const { stdout } = await executeProbe(input);
    const matched = stdout.match(/duration="?(\d*\.\d*)"?/);
    if (matched?.at(1)) return Number.parseFloat(matched[1]);
    throw new Error('No duration found!');
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export function getLastUpdated(input) {
  try {
    if (typeof input === 'string') return fs.statSync(input).mtimeMs || -1;
    return input?.mtimeMs || -1;
  } catch (error) {
    console.error(error);
    return -1;
  }
}

/**
 * @param {String} path - The URL path that will be the base of the generated URL.
 * @param {String} query - The existing query string that we'll use as a base to update.
 * @param {String} attr - The query string attribute we want to add / update.
 * @param {String} value - The value we want to give to the query string attribute.
 * @returns {String} - The newly-built URL path with query string.
 */
export function generateUrl(path, query, attr, value) {
  const new_query = cloneDeep(query);
  new_query[attr] = value;
  return `/f/${strip(path)}${toQuery(new_query)}`;
}

export function toQuery(query) {
  if (isEmpty(query)) return '';
  return `?${qs.stringify(query)}`;
}

/**
 * Sorts the provided array by putting folders on top, followed by files with non-alphanumeric characters.
 * If `sort_by_duration` is true, then the remaining files will be sorted by duration (applies to videos).
 * If false, then do a standard alphabetical sort.
 * @param {Array} arr - The array of files we want to sort.
 * @param {Boolean} sort_by_duration - Whether we're sorting by duration or not.
 * @returns {Array} - The sorted array that will be used to build the front-end.
 */
export function sortEntries(array, sort_parameter, sort_order = 'desc') {
  const iteratees = [
    (i) => i.type === 'folder',
    (i) => i.name.match(/^\W+/) === null,
    (i) => i.name.toLowerCase(),
  ];
  const orders = ['desc', 'asc', 'asc'];

  switch (sort_parameter) {
    case 'duration': {
      iteratees.splice(1, 0, (i) => i.raw_duration || 0);
      orders.splice(1, 0, sort_order);
      break;
    }

    case 'last_updated': {
      iteratees.splice(1, 0, (i) => i.raw_last_updated || -1);
      orders.splice(1, 0, sort_order);
      break;
    }

    default: {
      break;
    }
  }

  return orderBy(array, iteratees, orders);
}

export function strip(route) {
  const cleaned = route.replaceAll(/\/+/g, '/');
  if (cleaned.startsWith('/')) return cleaned.slice(1);
  return cleaned;
}

export function toBreadcrumbs(path, query) {
  const parts = path.split('/').filter(Boolean);
  return [
    {
      label: 'Top',
      skip_link: atRoot(path),
      url: `/f${toQuery(query)}`,
    },
    ...parts.map((label, index) => {
      const url = `/f/${parts.slice(0, index + 1).join('/')}${toQuery(query)}`;
      return {
        label,
        skip_link: index === parts.length - 1,
        url,
      };
    }),
  ];
}

export default {
  atRoot,
  formatDuration,
  formatLastUpdated,
  generateUrl,
  getDuration,
  getLastUpdated,
  sortEntries,
  strip,
  toBreadcrumbs,
  toQuery,
};
