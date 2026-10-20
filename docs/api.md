# API

```js
import { createInkMath, renderLatex, listFonts, STRUCTURES, SYMBOLS, LABELS, translateToolbar } from 'inkmath';
import 'inkmath/elements';        // <ink-math> and <ink-math-toolbar>
import zh from 'inkmath/locales/zh';
```

TypeScript types ship with the package.

## Tags

`import 'inkmath/elements'` (or loading `dist/inkmath.bundle.js`) defines two elements. They are a thin layer over
`createInkMath`.

### `<ink-math>`

```html
<ink-math value="x^2" font="kalam"></ink-math>
<ink-math>\frac{a}{b}</ink-math>
```

| Attribute | |
|---|---|
| `value` | The formula. Without it, the element's text is used |
| `font`, `thickness`, `roughness`, `seed` | As the options below; changing them later updates the field |
| `readonly` | Show the formula without editing |
| `toolbar="none"` | No toolbar of its own (for a shared `<ink-math-toolbar>` or your own) |
| `locale` | Language of its own toolbar, e.g. `zh` |
| `assets-url` | See [Assets and bundlers](assets.md) |

| Property / event | |
|---|---|
| `.value` | The formula as LaTeX, read and write |
| `.editor` | The editor object (below), once ready |
| `.ready` | Promise of the editor |
| `.toolbarConfig` | Configuration of its own toolbar; set before the element is added to the page |
| `change` event | `event.detail.value` is the LaTeX, after every edit |
| `ready` event | The field is drawn |

### `<ink-math-toolbar>`

```html
<ink-math-toolbar locale="zh"></ink-math-toolbar>
<ink-math-toolbar for="eq1"></ink-math-toolbar>
```

Without `for`, it serves the `<ink-math>` last clicked or focused (the first one on the page until then). `locale` picks its
language; its `.config` property takes a full configuration (see [The toolbar](toolbar.md)).

## createInkMath(container, options?)

Puts an editor into `container` and resolves to an editor object once the fonts and pen strokes have loaded.

| Option | Default | |
|---|---|---|
| `value` | `''` | Initial LaTeX |
| `font` | `'caveat'` | Handwriting font id; see [fonts](styling.md#fonts) or `listFonts()` |
| `toolbar` | `true` | `true` for the default toolbar, `false` for none, or a toolbar configuration (below) |
| `readOnly` | `false` | Show the formula without letting it be edited (no toolbar either) |
| `thickness` | `0.06` | Width of the drawn strokes, as a fraction of the font size |
| `roughness` | `1` | How hand-drawn fraction bars, arrows and radicals look: `0` is clean and straight, higher is looser |
| `seed` | `0` | Which pen-stroke sample each symbol uses; another number gives another hand |
| `fonts` | `[]` | Fonts of your own, `{ id, label, url }`. The same id as a bundled font replaces it |
| `assetsUrl` | the package's `assets/` | Where fonts and strokes are loaded from; see [Assets and bundlers](assets.md) |
| `onChange` | – | Same as `editor.on('change', …)` |
| `onContextChange` | – | Same as `editor.on('context', …)` |

### Toolbar configuration

| Field | Default | |
|---|---|---|
| `structures` | `STRUCTURES` | The galleries of the first tab; `[]` hides the tab |
| `symbols` | `SYMBOLS` | The palettes of the second tab; `[]` hides the tab |
| `labels` | `LABELS` | `{ structures, symbols, undo, redo, matrixActions }`: the toolbar's own words |
| `edit` | `true` | Show undo and redo |
| `container` | – | Put the toolbar in this element instead of above the field |

`zh` from `inkmath/locales/zh` and the result of `translateToolbar()` are such configurations.

### The editor object

| | |
|---|---|
| `getValue()` | The formula as LaTeX |
| `setValue(latex)` | Replace the formula (fires no `change`) |
| `insert(template)` | Insert at the caret. `#?` is an empty slot, `#@` takes the selection: `insert('\\sqrt{#@}')` |
| `command(name)` | Run a MathLive command: `'undo'`, `'redo'`, `'addRowAfter'`, `'removeColumn'`, … |
| `getContext()` | `{ focused, hasSelection, inMatrix, canUndo, canRedo, latexMode }` |
| `on(event, fn)` | `'change'` (LaTeX), `'context'` (the above), `'font'` (font id). Returns a function that stops listening |
| `renderIcon(latex)` | HTML for a button: `latex` in the current handwriting, slots as □ |
| `focus()` | Focus the field |
| `getFont()`, `setFont(id)` | The current font |
| `getStyle()`, `setStyle({ thickness, roughness, seed })` | The stroke style; pass only what changes |
| `reseed()` | Use different pen-stroke samples (adds 1 to `seed`) |
| `redraw()` | Redraw now. Rarely needed: the editor redraws on every change and resize |
| `destroy()` | Remove the editor, its toolbar and its listeners |
| `element` | The editor's root element (`div.inkmath`) |
| `mathfield` | The MathLive `<math-field>`, for anything this API does not cover |
| `fonts` | The fonts available, `{ id, label, greek }` |

`change` fires once per actual change, for typing as well as `insert` and `command`; not for `setValue`.

## renderLatex(target, latex, options?)

Draws `latex` in handwriting into `target`, replacing what was there. Resolves to `{ element, redraw, destroy }`.

Options: `font`, `thickness`, `roughness`, `seed`, `fonts`, `assetsUrl` as above, and `display` (`false`): `true` for a centred
block with full-size limits, as in `$$…$$`.

The formula takes its size from `target`'s `font-size` and its ink from `color`, and redraws when its size changes. Call
`destroy()` when you remove it.

## listFonts(options?)

Resolves to the fonts available, `[{ id, label, greek }]`: the bundled ones plus any in `options.fonts`. `greek` is the share
of Greek letters the font has itself; the rest come from LXGW WenKai. Takes `assetsUrl` too.

## Toolbar data

`STRUCTURES` and `SYMBOLS` are the default toolbar content (English), `LABELS` its own words. A structure group opens a gallery
of templates:

```js
{
  id: 'frac',
  label: 'Fraction',                 // button caption
  icon: '\\frac{x}{y}',              // LaTeX drawn on the button
  items: [                           // [template, name]
    ['\\frac{#@}{#?}', 'Stacked fraction'],
    ['{#@}/{#?}', 'Slashed fraction'],
  ],
  actions: [['addRowAfter', 'Add row below']],  // optional: MathLive commands under the gallery
}
```

In a template, `#@` takes the current selection (an empty slot when nothing is selected) and `#?` is an empty slot.

A symbol group is a palette:

```js
{ id: 'greek', label: 'Greek', items: ['\\alpha', '\\beta', '\\gamma'] }
```

`translateToolbar({ labels, structures, symbols, items, actions })` returns the default toolbar with its words replaced: group
labels by id, gallery names by template, matrix actions by command. See [The toolbar](toolbar.md#3-its-language).
