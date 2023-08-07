import * as esbuild from 'esbuild';

// esbuild index.js --bundle --minify --sourcemap --outdir=server

await esbuild.build({
  entryPoints: ['index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'server',
});
