import { execa } from 'execa';
import ffprobe from '@ffprobe-installer/ffprobe';

/**
 * Returns a promise that will be resolved with the duration of given video in seconds.
 * @param {String} input - Stream or URL or path to file to be used as input for `ffprobe`.
 * @returns {Promise} - A `child_process` instance, which is enhanced to also be a `Promise`
 *   for a result Object with stdout and stderr properties.
 */
function executeProbe(input) {
  const params = ['-v', 'error', '-show_format', '-show_streams'];
  if (typeof input === 'string') return execa(ffprobe.path, [...params, input]);
  throw new Error('Given input was not a string');
}

/**
 * Returns a promise that will be resolved with the duration of given video in seconds.
 * @param {String} input - Stream or URL or path to file to be used as input for `ffprobe`.
 * @returns {Promise<Float>} - Promise that will be resolved with given video duration in seconds.
 */
export async function getVideoDuration(input) {
  const { stdout } = await executeProbe(input);
  const matched = stdout.match(/duration="?(\d*\.\d*)"?/);
  if (matched && matched[1]) return parseFloat(matched[1]);
  throw new Error('No duration found!');
}

/**
 * Returns a promise that will be resolved with the duration of given video in seconds.
 * @param {Integer} full_seconds - The number of seconds we want to format as HH:MM:SS.
 * @returns {String} - Seconds formatted as an HH:MM:SS string.
 */
export function formatDuration(full_seconds) {
  return new Date(1000 * full_seconds).toISOString().substring(11, 19);
}

export default {
  formatDuration,
  getVideoDuration,
};
