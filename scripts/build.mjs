// dist/inkmath.css: MathLive's static + font CSS (font URLs pointed at assets/) followed by inkmath's own styles.
// dist/inkmath.bundle.js: everything in one ES module, for pages without a bundler.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const fix = (css) => css.replace(/url\(fonts\//g, 'url(../assets/mathlive-fonts/');
mkdirSync('dist', { recursive: true });
writeFileSync('dist/inkmath.css', [
  fix(readFileSync('node_modules/mathlive/mathlive-fonts.css', 'utf8')),
  fix(readFileSync('node_modules/mathlive/mathlive-static.css', 'utf8')),
  readFileSync('src/inkmath.css', 'utf8'),
].join('\n'));

await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/inkmath.bundle.js',
  bundle: true, format: 'esm', minify: true, target: 'es2020',
  legalComments: 'eof',
});
console.log('built dist/inkmath.css, dist/inkmath.bundle.js');
