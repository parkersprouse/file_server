import * as esbuild from 'esbuild';
// import autoprefixer from 'autoprefixer';
// import postcssPresetEnv from 'postcss-preset-env';

await esbuild.build({
  bundle: true,
  entryNames: '[dir]/[name]',
  entryPoints: ['index.js', 'styles.css'],
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
  plugins: [
    // async transform(source, resolveDir) {
    //   const { css } = await postcss([autoprefixer, postcssPresetEnv()]).process(source);
    //   return css;
    // }
  ],
  sourcemap: true,
});
