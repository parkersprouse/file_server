import { copyFile, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import autoprefixer from 'autoprefixer';
import { build } from 'esbuild';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import { PurgeCSS } from 'purgecss';

const __dirname = dirname(fileURLToPath(import.meta.url));
const __root_dir = resolve(__dirname, '..');
const __public_dir = join(__root_dir, 'public');
const __output_dir = join(__root_dir, 'server');

const source_styles = join(__root_dir, 'styles.css');
const output_styles = join(__output_dir, 'styles.css');

/* Esbuild - Shared Config Options */
const shared = {
  bundle: true,
  loader: {
    '.eot': 'copy',
    '.svg': 'copy',
    '.ttf': 'copy',
    '.woff': 'copy',
    '.woff2': 'copy',
  },
  minify: true,
  sourcemap: true,
};

/**
 * [Step 1] Clean Old Files
 */
console.log('[Step 1] Clean Old Files');
const old_files = await readdir(__output_dir, { withFileTypes: true });
for (const file of old_files) {
  if (file.isDirectory() || file.isSymbolicLink()) continue;
  const file_path = join(__output_dir, file.name);
  console.log(`Cleaning ${file_path}`);
  await rm(file_path, { force: true });
}

/**
 * [Step 2] PostCSS
 */
console.log('[Step 2] PostCSS');
const css_contents = await readFile(source_styles, 'utf8');
const css_processor = postcss([autoprefixer, postcssPresetEnv()]);
const { css } = await css_processor.process(css_contents, { from: source_styles });

/**
 * [Step 3] esbuild - CSS
 */
console.log('[Step 3] esbuild - CSS');
await build({
  ...shared,
  outfile: output_styles,
  stdin: {
    contents: css,
    loader: 'css',
    resolveDir: __output_dir,
    sourcefile: source_styles,
  },
  write: true,
});

/**
 * [Step 4] PurgeCSS
 */
console.log('[Step 4] PurgeCSS');
const purged_css_results = (await new PurgeCSS().purge({
  content: [
    join(__root_dir, '**', '*.html'),
    join(__root_dir, 'lib', '**', '*.js'),
    join(__root_dir, 'routes', '**', '*.js'),
    join(__root_dir, 'services', '**', '*.js'),
  ],
  css: [output_styles],
  sourceMap: { to: output_styles },
}))[0];
await writeFile(purged_css_results.file, purged_css_results.css, {
  encoding: 'utf8',
  flag: 'w',
});
await writeFile(join(__output_dir, 'styles.css.map'), purged_css_results.sourceMap, {
  encoding: 'utf8',
  flag: 'w',
});

/**
 * [Step 5] esbuild - JS
 */
console.log('[Step 5] esbuild - JS & additional CSS');
await build({
  ...shared,
  entryNames: '[dir]/[name]',
  entryPoints: [
    join(__root_dir, 'index.js'),
    join(__root_dir, 'lib.css'),
  ],
  external: [
    '@ffprobe-installer/ffprobe',
    '@hapi/hapi',
    '@hapi/inert',
    '@hapi/log',
    '@hapi/vision',
    '@picturae/mmmagic',
    'execa',
    'file-type',
    'handlebars',
    'lodash-es',
    'qs',
  ],
  format: 'esm',
  outdir: __output_dir,
  platform: 'node',
  write: true,
});

/**
 * [Step 6] Copy public files
 */
console.log('[Step 6] Copy public files');
const public_files = await readdir(__public_dir, { withFileTypes: true });
for (const file of public_files) {
  if (file.isDirectory() || file.isSymbolicLink()) continue;
  const src_file_path = join(__public_dir, file.name);
  const dest_file_path = join(__output_dir, file.name);
  console.log(`Copying "${src_file_path}" to "${dest_file_path}"`);
  await copyFile(src_file_path, dest_file_path);
}
