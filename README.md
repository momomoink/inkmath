<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/inkmath-dark.svg">
    <img src="brand/inkmath.svg" alt="inkmath" width="220">
  </picture>
</p>

<h1 align="center">inkmath</h1>

<p align="center">Formulas that look handwritten, typed as fast as LaTeX.</p>

inkmath is a formula editor for the web that does two things.

**1. It writes formulas in handwriting.** What you enter comes out as if written by hand on paper, not typeset:

- letters and digits use a handwriting font (eight to choose from);
- Greek letters, ∫, ∑, ℝ ℤ ℕ and large brackets use real pen strokes from the MathWriting dataset;
- fraction bars, radicals, arrows, ∞ and ∀ ∃ ∧ ∨ ∵ ∴ are drawn as pen strokes, slightly uneven, heavier where the pen lands;
- `\mathcal` uses Dancing Script, `\mathscr` uses Allura.

`renderLatex()` draws any LaTeX formula in the same handwriting without an editor, for showing formulas you already have.

**2. You edit it with LaTeX commands.** Type `\frac`, `\int`, `\alpha` and a space and the structure or symbol appears at once;
Tab moves through the empty slots in Word's order. For people who don't know LaTeX, a Word-style toolbar inserts the same
structures and symbols with a click. Either way, the result is ordinary LaTeX, so it can be stored, searched or typeset
elsewhere.

Editing is built on [MathLive](https://github.com/arnog/mathlive).

## Install

```sh
npm install inkmath
```

## Quick start

```js
import { createInkMath, renderLatex } from 'inkmath';
import 'inkmath/style.css';

const editor = await createInkMath(document.getElementById('editor'), {
  value: '\\int_{0}^{1} x^{2}\\,dx',
  onChange: (latex) => console.log(latex),
});

await renderLatex(document.getElementById('formula'), 'e^{i\\pi}+1=0');
```

Without a bundler, use the single-file build:

```html
<link rel="stylesheet" href="node_modules/inkmath/dist/inkmath.css">
<script type="module">
  import { createInkMath } from './node_modules/inkmath/dist/inkmath.bundle.js';
  await createInkMath(document.getElementById('editor'));
</script>
```

Using Vite? Read [Assets and bundlers](docs/assets.md) first: Vite's dev server needs one line of config.

## Typing formulas

| Type | You get |
|---|---|
| `\alpha` + space (or just `alpha`) | α, and every other Greek letter |
| `\frac` + space, or `/` | a fraction; Tab moves from numerator to denominator |
| `\int`, `\sum` + space | a template with empty slots; Tab goes lower limit → upper limit → body, as in Word |
| `dx` after an integral | `\,dx`, with the thin space in front |
| `\sqrt`, `\vec` + space | a radical or vector with the caret inside |
| `\R`, `\Z`, `\N` + space | ℝ ℤ ℕ (or `\mathbb` + space + a letter) |
| `^`, `_` | superscript, subscript; space, → or Tab leaves it |
| select, then click a toolbar template | the selection goes inside the template |

More in [Editing](docs/editing.md).

## Docs

- [Getting started](docs/getting-started.md)
- [Editing](docs/editing.md): keyboard, toolbar, Tab order
- [API](docs/api.md): `createInkMath`, `renderLatex`, `listFonts`, the toolbar data
- [Styling](docs/styling.md): colours, fonts, stroke thickness and roughness, dark mode
- [Assets and bundlers](docs/assets.md): where the fonts and pen strokes are loaded from
- [Brand](brand/README.md): logo files and colour palette

## Licence

The code is MIT. The package also ships fonts (SIL Open Font License 1.1) and pen-stroke samples from MathWriting, which are
**CC BY-NC-SA 4.0: not for commercial use**. See [NOTICE.md](NOTICE.md).

中文说明：[README.zh-CN.md](README.zh-CN.md)
