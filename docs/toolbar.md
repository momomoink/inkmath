# The toolbar

An app that uses a formula editor nearly always wants the toolbar its own way: other buttons, its own language, its own look,
in its own place on the page. inkmath supports that at four levels, from a one-line change to a toolbar you build yourself.

## 1. Where it goes

By default each editor has its toolbar right above the field. To put it somewhere else, give it a container:

```js
await createInkMath(fieldEl, { toolbar: { container: document.querySelector('#my-header') } });
```

With tags, a `<ink-math-toolbar>` can sit anywhere on the page. Without a `for` attribute it serves whichever `<ink-math>` was
last clicked or focused, so one toolbar can serve every formula on a page, as in Word:

```html
<ink-math-toolbar></ink-math-toolbar>

<ink-math toolbar="none">\frac{a}{b}</ink-math>
<ink-math toolbar="none">x^2 + 1</ink-math>
```

`<ink-math-toolbar for="eq1">` serves only the `<ink-math id="eq1">`. `toolbar="none"` keeps a field from showing its own.

## 2. What is on it

The toolbar is plain data: `STRUCTURES` (the galleries on the first tab) and `SYMBOLS` (the palettes on the second). Pass your
own, built from them or from scratch:

```js
import { createInkMath, STRUCTURES, SYMBOLS } from 'inkmath';

const keep = ['frac', 'root', 'int', 'matrix'];
await createInkMath(el, {
  toolbar: {
    structures: STRUCTURES.filter((g) => keep.includes(g.id)),
    symbols: [
      { id: 'mine', label: 'Common', items: ['\\pi', '\\infty', '\\le', '\\ge', '\\ne'] },
      ...SYMBOLS.filter((g) => g.id === 'greek'),
    ],
    edit: false,        // no undo / redo buttons
  },
});
```

A structure group is `{ id, label, icon, items: [[template, name], …], actions? }`; a symbol group is `{ id, label, items }`.
In a template, `#@` takes the selection (an empty slot when nothing is selected) and `#?` is an empty slot. `[]` for
`structures` or `symbols` hides that tab. The full format is in the [API](api.md#toolbar-data).

On a tag, set the same object as a property:

```js
document.querySelector('ink-math-toolbar').config = { structures: …, symbols: … };
```

## 3. Its language

The toolbar is in English. A Chinese version ships with the package:

```js
import { createInkMath } from 'inkmath';
import zh from 'inkmath/locales/zh';

await createInkMath(el, { toolbar: zh });
```

```html
<ink-math-toolbar locale="zh"></ink-math-toolbar>
<ink-math locale="zh"></ink-math>
```

`zh` is a complete toolbar configuration, so it combines with the rest: `{ ...zh, edit: false }`.

For another language, translate the strings and pass them to `translateToolbar`; anything you leave out stays English.
[`src/locales/zh.js`](../src/locales/zh.js) is the template to copy:

```js
import { translateToolbar } from 'inkmath';

const fr = translateToolbar({
  labels: { structures: 'Structures', symbols: 'Symboles', undo: '↶ Annuler', redo: '↷ Rétablir', matrixActions: 'Dans une matrice :' },
  structures: { frac: 'Fraction', root: 'Racine', int: 'Intégrale' },      // group id -> label
  symbols: { greek: 'Grec' },
  items: { '\\frac{#@}{#?}': 'Fraction', '\\sqrt{#@}': 'Racine carrée' },  // template -> name
  actions: { addRowAfter: 'Ajouter une ligne' },                          // matrix command -> name
});
await createInkMath(el, { toolbar: fr });
```

## 4. Its look

Everything in the toolbar has a stable class name, all under `.inkmath-tb`, and takes its colours from the `--inkmath-*`
variables ([Styling](styling.md)).

| Class | Part |
|---|---|
| `.inkmath-tb` | The whole toolbar |
| `.inkmath-tb-tabs`, `.inkmath-tb-tab` (`.on` when selected) | The tab bar and its tabs |
| `.inkmath-tb-edit` | Undo and redo, at the right of the tab bar |
| `.inkmath-tb-pane` | A tab's content |
| `.inkmath-tb-group`, `.inkmath-tb-caption` | A structure button and its caption |
| `.inkmath-tb-popup`, `.inkmath-tb-popup-title` | The gallery that opens under a structure button |
| `.inkmath-tb-gallery`, `.inkmath-tb-item`, `.inkmath-tb-item-name` | The templates in a gallery |
| `.inkmath-tb-actions` | Matrix row/column buttons under the matrix gallery |
| `.inkmath-tb-subtabs`, `.inkmath-tb-symbols`, `.inkmath-tb-symbol` | Symbol groups, the symbol grid, one symbol |
| `.inkmath-icon` | The handwritten formula on any button |

Buttons that can't be used right now (undo with nothing to undo, matrix actions outside a matrix) are `disabled`.

```css
.inkmath-tb-group { border-radius: 0; min-width: 64px; height: 64px; font-size: 16px; }
.inkmath-tb-tab.on { border-bottom-color: hotpink; }
.inkmath-tb-caption { display: none; }
```

## 5. Your own toolbar

When restyling isn't enough, build the toolbar yourself, in your framework, with `toolbar: false` (or `toolbar="none"` on the
tag). The editor gives you everything the built-in one uses:

| | |
|---|---|
| `editor.insert(template)` | Insert a template or symbol at the caret, wrapping the selection into `#@` |
| `editor.command(name)` | `'undo'`, `'redo'`, `'addRowAfter'`, `'addColumnAfter'`, `'removeRow'`, `'removeColumn'`, or any [MathLive command](https://cortexjs.io/mathfield/reference/commands/) |
| `editor.getContext()` | `{ focused, hasSelection, inMatrix, canUndo, canRedo, latexMode }` |
| `editor.on('context', fn)` | Called when any of those change: enable and disable your buttons here |
| `editor.on('change', fn)` | Called with the LaTeX after every edit |
| `editor.renderIcon(latex)` | HTML showing a template in the editor's handwriting, empty slots as □, for your buttons |
| `editor.on('font', fn)` | The font changed: redraw your icons |
| `STRUCTURES`, `SYMBOLS` | The default content, if you want to start from it |

```js
const editor = await createInkMath(fieldEl, { toolbar: false });

for (const tpl of ['\\frac{#@}{#?}', '\\sqrt{#@}', '#@^{#?}', '\\int_{#?}^{#?}#@']) {
  const b = document.createElement('button');
  b.innerHTML = editor.renderIcon(tpl);
  b.onmousedown = (e) => e.preventDefault();   // keep the caret in the formula
  b.onclick = () => editor.insert(tpl);
  myBar.append(b);
}

const undo = myBar.appendChild(document.createElement('button'));
undo.textContent = 'Undo';
undo.onmousedown = (e) => e.preventDefault();
undo.onclick = () => editor.command('undo');
editor.on('context', (c) => { undo.disabled = !c.canUndo; });
```

`onmousedown = preventDefault` matters: without it, clicking the button takes focus away from the formula and the selection
is lost before `insert` runs.

A working page with a shared toolbar and a custom one is [`demo/elements.html`](../demo/elements.html).
