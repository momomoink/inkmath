// dist/inkmath.css: MathLive's static + font CSS (font URLs pointed at assets/) followed by inkmath's own styles.
// dist/inkmath.bundle.js: everything in one ES module, for pages without a bundler; dist/locales/*.js: toolbar translations.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const fix = (css) => css.replace(/url\(fonts\//g, 'url(../assets/mathlive-fonts/');
mkdirSync('dist', { recursive: true });
writeFileSync('dist/inkmath.css', [
  // MathLive's static CSS (it includes the font faces); its one page-wide rule is scoped to formulas
  fix(readFileSync('node_modules/mathlive/mathlive-static.css', 'utf8')).replace('[data-href]{', '.ML__latex [data-href]{'),
  readFileSync('src/inkmath.css', 'utf8'),
].join('\n'));

await build({
  entryPoints: ['src/bundle.js'],
  outfile: 'dist/inkmath.bundle.js',
  bundle: true, format: 'esm', minify: true, target: 'es2020',
  legalComments: 'eof',
});
await build({
  entryPoints: ['src/locales/zh.js'],
  outfile: 'dist/locales/zh.js',
  bundle: true, format: 'esm', minify: true, target: 'es2020',
});
console.log('built dist/inkmath.css, dist/inkmath.bundle.js, dist/locales/zh.js');
