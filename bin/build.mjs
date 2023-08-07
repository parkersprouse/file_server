import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import path from 'path';

await esbuild.build({
  bundle: true,
  entryNames: '[dir]/[name]',
  entryPoints: ['index.js', 'styles.scss'],
  external: [
    '@ffprobe-installer/ffprobe',
    '@hapi/hapi',
    '@hapi/inert',
    '@hapi/vision',
    'dotenv',
    'execa',
    'file-type',
    'handlebars',
    'lodash-es',
    'qs',
  ],
  format: 'esm',
  loader: {
    '.eot': 'copy',
    '.svg': 'copy',
    '.ttf': 'copy',
    '.woff': 'copy',
    '.woff2': 'copy',
  },
  minify: true,
  outdir: 'server',
  platform: 'node',
  plugins: [sassPlugin({
    precompile(source, pathname) {
      const basedir = path.dirname(pathname);
      return source.replace(/(url\(['"]?)(\.\.?\/)([^'")]+['"]?\))/g, `$1${basedir}/$2$3`);
    },
  })],
  sourcemap: true,
});
