# Getting started

## Install

```sh
npm install inkmath
```

inkmath depends on MathLive, which npm installs with it. It runs in the browser only.

## An editor

```html
<div id="editor"></div>
```

```js
import { createInkMath } from 'inkmath';
import 'inkmath/style.css';

const editor = await createInkMath(document.getElementById('editor'), {
  value: '\\frac{a}{b}',
  font: 'caveat',
  onChange: (latex) => save(latex),
});
```

`createInkMath` is async: it loads the pen-stroke samples and the font before drawing, so the first formula appears already in
handwriting. It puts a toolbar and the editing field into the container. Pass `toolbar: false` for the field alone.

Read and write the formula as LaTeX:

```js
editor.getValue();            // '\\frac{a}{b}'
editor.setValue('x^{2}+1');
```

When the editor goes away (a closed dialog, a route change), call `editor.destroy()` to remove it and its listeners.

## A formula on its own

To show a formula without editing it, for example in a list or a saved document:

```js
import { renderLatex } from 'inkmath';
import 'inkmath/style.css';

await renderLatex(document.getElementById('formula'), '\\sum_{n=1}^{\\infty}\\frac{1}{n^{2}}=\\frac{\\pi^{2}}{6}', {
  display: true,
});
```

`display: true` gives a centred block with full-size limits; leave it out for a formula inside a line of text. The formula
takes its size from the element's `font-size` and its colour from `color`, and redraws itself when its size changes.

## Without a bundler

`dist/inkmath.bundle.js` is a single ES module with MathLive included, and `dist/inkmath.css` holds every style:

```html
<link rel="stylesheet" href="/node_modules/inkmath/dist/inkmath.css">
<div id="editor"></div>
<script type="module">
  import { createInkMath } from '/node_modules/inkmath/dist/inkmath.bundle.js';
  await createInkMath(document.getElementById('editor'));
</script>
```

The page must be served over HTTP (not opened as a file), because the fonts and pen strokes are fetched at run time.

## Next

- [Editing](editing.md) for what your users can type.
- [Styling](styling.md) to match your colours and pick a font.
- [Assets and bundlers](assets.md) if fonts or strokes do not show up, or with Vite.
