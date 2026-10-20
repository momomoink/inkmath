# API

```js
import { createInkMath, renderLatex, listFonts, STRUCTURES, SYMBOLS } from 'inkmath';
```

TypeScript types ship with the package (`src/index.d.ts`).

## createInkMath(container, options?)

Puts an editor into `container` and resolves to an editor object once the fonts and pen strokes have loaded.

| Option | Default | |
|---|---|---|
| `value` | `''` | Initial LaTeX |
| `font` | `'caveat'` | Handwriting font id; see [fonts](styling.md#fonts) or `listFonts()` |
| `toolbar` | `true` | Show the toolbar |
| `readOnly` | `false` | Show the formula without letting it be edited (no toolbar either) |
| `thickness` | `0.06` | Width of the drawn strokes, as a fraction of the font size |
| `roughness` | `1` | How hand-drawn fraction bars, arrows and radicals look: `0` is clean and straight, higher is looser |
| `seed` | `0` | Which pen-stroke sample each symbol uses; another number gives another hand |
| `fonts` | `[]` | Fonts of your own, `{ id, label, url }`. The same id as a bundled font replaces it |
| `structures` | `STRUCTURES` | The Structures tab of the toolbar |
| `symbols` | `SYMBOLS` | The Symbols tab of the toolbar |
| `assetsUrl` | the package's `assets/` | Where fonts and strokes are loaded from; see [Assets and bundlers](assets.md) |
| `onChange` | – | Called with the LaTeX after every change |

### The editor object

| | |
|---|---|
| `getValue()` | The formula as LaTeX |
| `setValue(latex)` | Replace the formula |
| `insert(template)` | Insert at the caret, as a toolbar click does. `#?` is an empty slot, `#@` takes the selection: `insert('\\sqrt{#@}')` |
| `focus()` | Focus the field |
| `getFont()`, `setFont(id)` | The current font |
| `getStyle()`, `setStyle({ thickness, roughness, seed })` | The stroke style; pass only what changes |
| `reseed()` | Use different pen-stroke samples (adds 1 to `seed`) |
| `redraw()` | Redraw now. Rarely needed: the editor redraws on every change and resize |
| `destroy()` | Remove the editor and its listeners |
| `element` | The editor's root element (`div.inkmath`) |
| `mathfield` | The MathLive `<math-field>`, for anything this API does not cover |
| `fonts` | The fonts available, `{ id, label, greek }` |

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

`STRUCTURES` and `SYMBOLS` are the default toolbar. Pass changed copies as `structures` and `symbols` to reorder, rename,
translate or remove groups.

A structure group opens a gallery of templates:

```js
{
  id: 'frac',
  label: 'Fraction',                 // button caption
  icon: '\\frac{x}{y}',              // LaTeX drawn on the button
  items: [                           // [template, name]
    ['\\frac{#@}{#?}', 'Stacked'],
    ['{#@}/{#?}', 'Slashed'],
  ],
  actions: [['addRowAfter', 'Add row']],  // optional: MathLive commands under the gallery
}
```

In a template, `#@` takes the current selection (an empty slot when nothing is selected) and `#?` is an empty slot.

A symbol group is a palette:

```js
{ id: 'greek', label: 'Greek', items: ['\\alpha', '\\beta', '\\gamma'] }
```

For example, an English toolbar with fewer groups:

```js
import { createInkMath, STRUCTURES, SYMBOLS } from 'inkmath';

const names = { frac: 'Fraction', script: 'Script', root: 'Radical', int: 'Integral', matrix: 'Matrix' };
const structures = STRUCTURES.filter((g) => names[g.id]).map((g) => ({ ...g, label: names[g.id] }));
await createInkMath(el, { structures, symbols: SYMBOLS.slice(0, 2) });
```
