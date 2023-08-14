import autoprefixer from 'autoprefixer';
import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';

const css_contents = readFileSync('styles.css');
const { css } = await postcss([autoprefixer, postcssPresetEnv()]).process(css_contents);

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
  outdir: 'server',
  sourcemap: true,
};

/**
 * Build CSS
 */

await esbuild.build({
  ...shared,
  stdin: {
    contents: css,
    // These are all optional:
    resolveDir: './server',
    sourcefile: 'styles.css',
    loader: 'css',
  },
  outfile: 'styles.css',
});

/**
 * Build JS
 */
await esbuild.build({
  ...shared,
  entryNames: '[dir]/[name]',
  entryPoints: ['index.js'],
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
  platform: 'node',
});
