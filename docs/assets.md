# Assets and bundlers

Besides JavaScript and CSS, inkmath loads files at run time from the package's `assets/` folder:

| File | Size | |
|---|---|---|
| `glyphs.json` | about 1.5 MB | Pen strokes for Greek letters, ∫, ∑, ℝ ℤ ℕ, large brackets |
| `fonts.json` | small | The list of bundled fonts |
| `fonts/*.ttf` | 18–150 KB each | Handwriting fonts; the browser downloads only the ones in use |
| `mathlive-fonts/*.woff2` | | MathLive's own fonts, for anything not drawn by hand |

They are fetched once per page and shared by every editor and formula on it.

By default inkmath finds them next to its own code, from `import.meta.url`. That works with native ES modules, with the
single-file `dist/` build and with webpack 5.

## Vite

Vite's dev server pre-bundles dependencies into its cache, so the package's `assets/` is no longer next to the code. Either
keep inkmath out of pre-bundling:

```js
// vite.config.js
export default { optimizeDeps: { exclude: ['inkmath'] } };
```

or serve the assets yourself (next section).

## Serving the assets yourself

Copy `node_modules/inkmath/assets/` to a folder your site serves, for example `public/inkmath/`, and tell inkmath where it is:

```js
await createInkMath(el, { assetsUrl: '/inkmath/' });
await renderLatex(el2, 'x^2', { assetsUrl: '/inkmath/' });
```

The same works for a CDN. Copy the folder again when you upgrade inkmath.

## When something is missing

- **Letters show in a plain serif font, or Greek is missing**: the font files did not load. Check the browser's network tab
  for 404s under `fonts/`, and set `assetsUrl`.
- **Integral signs, radicals or fraction bars are missing**: `glyphs.json` did not load; same fix.
- **Nothing loads from `file://`**: serve the page over HTTP.
