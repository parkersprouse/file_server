import autoprefixer from 'autoprefixer';
import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const __root_dir = resolve(__dirname, '..');
const __output_dir = join(__root_dir, 'server');

/**
 * PostCSS
 */
const css_contents = readFileSync(join(__root_dir, 'styles.css'), 'utf8');
const { css } = await postcss([autoprefixer, postcssPresetEnv()]).process(css_contents, { from: join(__root_dir, 'styles.css') });

/**
 * Esbuild - Shared Config Options
 */
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
 * Esbuild - CSS
 */
await esbuild.build({
  ...shared,
  outfile: join(__output_dir, 'styles.css'),
  stdin: {
    contents: css,
    loader: 'css',
    resolveDir: __output_dir,
    sourcefile: join(__root_dir, 'styles.css'),
  },
});

/**
 * Esbuild - JS
 */
await esbuild.build({
  ...shared,
  entryNames: '[dir]/[name]',
  entryPoints: [join(__root_dir, 'index.js')],
  external: [
    '@ffprobe-installer/ffprobe',
    '@hapi/hapi',
    '@hapi/inert',
    '@hapi/log',
    '@hapi/vision',
    'dotenv',
    'execa',
    'file-type',
    'handlebars',
    'lodash-es',
    'qs',
  ],
  format: 'esm',
  outdir: __output_dir,
  platform: 'node',
});
