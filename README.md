<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/inkmath-dark.svg">
    <img src="brand/inkmath.svg" alt="inkmath" width="220">
  </picture>
</p>

<h1 align="center">inkmath</h1>

<p align="center">Formulas that look handwritten, typed as fast as LaTeX.</p>

<p align="center"><a href="https://momomoink.github.io/inkmath/"><b>Try it in your browser →</b></a></p>

inkmath is a JavaScript formula editor built on [MathLive](https://github.com/arnog/mathlive), dedicated to rendering beautiful handwritten formulas with support for a rich set of LaTeX commands.

## Features

- **Handwritten rendering:** Eight handwriting fonts for letters and digits, real pen strokes from the MathWriting dataset for Greek letters, integrals, sums, set symbols and large brackets, and hand-drawn fraction bars, radicals and arrows.
- **Calligraphic styles:** `\mathcal` uses Dancing Script, and `\mathscr` uses Allura.
- **Rich LaTeX input:** Type commands such as `\frac`, `\int` and `\alpha` followed by a space to insert structures and symbols. Tab moves through empty slots in Word's order, and `dx` after an integral gets a thin space automatically.
- **Word-style toolbar:** Insert structures and symbols with a click, or wrap selected content in a template.
- **Standard LaTeX output:** Store, search or typeset your formulas elsewhere.
- **Standalone rendering:** Use `renderLatex()` to display existing LaTeX formulas in the same handwriting without an editor.

## Install

```sh
npm install inkmath
```

## Quick start

inkmath is a component: importing it adds nothing to your page until you place an editor. Put the tags where you want them:

```html
<ink-math-toolbar></ink-math-toolbar>
<ink-math toolbar="none">\int_{0}^{1} x^{2}\,dx</ink-math>

<script type="module">
  import 'inkmath/elements';
  import 'inkmath/style.css';
</script>
```

The toolbar can live anywhere and serves whichever formula was clicked last. Without `<ink-math-toolbar>`, each `<ink-math>`
shows its own toolbar above it.

Or from JavaScript:

```js
import { createInkMath, renderLatex } from 'inkmath';
import 'inkmath/style.css';

const editor = await createInkMath(document.getElementById('editor'), {
  onChange: (latex) => console.log(latex),
});

await renderLatex(document.getElementById('formula'), 'e^{i\\pi}+1=0');   // display only
```

Without a bundler, load `dist/inkmath.bundle.js` and `dist/inkmath.css`; the bundle defines the tags too. Using Vite? Read
[Assets and bundlers](docs/assets.md) first: Vite's dev server needs one line of config.

## Your toolbar

The toolbar is English by default, with Chinese included (`locale="zh"`, or `toolbar: zh` from `inkmath/locales/zh`). Its
buttons, words, look and position can all be changed, and the editor API (`insert`, `command`, `getContext`, `on('context')`,
`renderIcon`) is everything needed to build your own in any framework. See [The toolbar](docs/toolbar.md).

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
- [The toolbar](docs/toolbar.md): position, content, language, look, or your own
- [API](docs/api.md): the tags, `createInkMath`, `renderLatex`, `listFonts`, the toolbar data
- [Styling](docs/styling.md): colours, fonts, stroke thickness and roughness, dark mode
- [Assets and bundlers](docs/assets.md): where the fonts and pen strokes are loaded from
- [Brand](brand/README.md): logo files and colour palette

## Licence

The code is MIT. The package also ships fonts (SIL Open Font License 1.1) and pen-stroke samples from MathWriting, which are
**CC BY-NC-SA 4.0: not for commercial use**. See [NOTICE.md](NOTICE.md).

中文说明：[README.zh-CN.md](README.zh-CN.md)
