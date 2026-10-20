# Getting started

## Install

```sh
npm install inkmath
```

inkmath depends on MathLive, which npm installs with it. It runs in the browser only.

inkmath is a component, not a page: importing it changes nothing on your page. An editor appears only where you put one, and
its styles are scoped to its own elements.

## An editor, as a tag

```html
<ink-math>\frac{a}{b}</ink-math>
```

```js
import 'inkmath/elements';
import 'inkmath/style.css';

document.querySelector('ink-math').addEventListener('change', (e) => save(e.detail.value));
```

The tag shows a toolbar above the field. To have one toolbar for several formulas, anywhere on the page:

```html
<ink-math-toolbar></ink-math-toolbar>

<ink-math toolbar="none">\frac{a}{b}</ink-math>
<ink-math toolbar="none">x^2 + 1</ink-math>
```

The toolbar serves whichever formula was clicked last. For a Chinese toolbar, add `locale="zh"`. Everything about the toolbar
can be changed: see [The toolbar](toolbar.md).

## An editor, from JavaScript

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

`dist/inkmath.bundle.js` is a single ES module with MathLive included that also defines the tags, and `dist/inkmath.css` holds
every style:

```html
<link rel="stylesheet" href="/node_modules/inkmath/dist/inkmath.css">
<script type="module" src="/node_modules/inkmath/dist/inkmath.bundle.js"></script>

<ink-math>x^2</ink-math>
```

The same module exports the API (`import { createInkMath } from '…/dist/inkmath.bundle.js'`), and `dist/locales/zh.js` is the
Chinese toolbar.

The page must be served over HTTP (not opened as a file), because the fonts and pen strokes are fetched at run time.

## Next

- [Editing](editing.md) for what your users can type.
- [The toolbar](toolbar.md) to change its content, language, look and place, or build your own.
- [Styling](styling.md) to match your colours and pick a font.
- [Assets and bundlers](assets.md) if fonts or strokes do not show up, or with Vite.
