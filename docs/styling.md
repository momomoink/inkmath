# Styling

## Colours

Everything inkmath draws uses CSS custom properties, set on `.inkmath` (the editor) and `.inkmath-static` (`renderLatex`):

| Property | Default | |
|---|---|---|
| `--inkmath-ink` | `#1d2b4a` | Ink: the formula, strokes and toolbar text |
| `--inkmath-paper` | `#fbfcf8` | Background of the editing field |
| `--inkmath-surface` | `#fff` | Toolbar buttons and galleries |
| `--inkmath-line` | `#d7ddd3` | Borders |
| `--inkmath-muted` | `#5d6b63` | Captions in the toolbar |
| `--inkmath-accent` | `#2f6f4f` | Caret, hovered buttons, the active tab |
| `--inkmath-selection` | `#d5e6dc` | Selected part of the formula |
| `--inkmath-focus` | `#a9cdb9` | Focus ring around the field |
| `--inkmath-font-size` | `40px` | Size of the formula in the editor |

The defaults are the inkmath palette (blue-black ink on pale paper, green accent; see [brand](../brand/README.md)). Override
them on any ancestor:

```css
.my-notes .inkmath, .my-notes .inkmath-static {
  --inkmath-ink: #222;
  --inkmath-accent: #c2410c;
  --inkmath-font-size: 28px;
}
```

For `renderLatex`, the formula's size is the target's `font-size`.

### Dark mode

inkmath has no dark theme of its own, so it fits whatever your page does. A dark set matching the palette:

```css
@media (prefers-color-scheme: dark) {
  .inkmath, .inkmath-static {
    --inkmath-ink: #e6eadf;
    --inkmath-paper: #18211c;
    --inkmath-surface: #1f2a24;
    --inkmath-line: #2c3a32;
    --inkmath-muted: #95a39a;
    --inkmath-accent: #7fc4a0;
    --inkmath-selection: #2a4a3a;
    --inkmath-focus: #3f6b55;
  }
}
```

## Fonts

| id | Font |
|---|---|
| `caveat` (default) | Caveat |
| `kalam` | Kalam |
| `patrick` | Patrick Hand |
| `architects` | Architects Daughter |
| `shadows` | Shadows Into Light Two |
| `gochi` | Gochi Hand |
| `nanumpen` | Nanum Pen Script |
| `wenkai` | LXGW WenKai (霞鹜文楷) |

Greek letters and set symbols a font lacks come from LXGW WenKai. Choose with the `font` option or `editor.setFont(id)`.

To add your own, pass its file:

```js
await createInkMath(el, {
  font: 'mine',
  fonts: [{ id: 'mine', label: 'My hand', url: '/fonts/my-hand.woff2' }],
});
```

Fonts used for letters should be handwriting; the drawn strokes (bars, radicals, ∫, Greek) are matched to the font size, not
to a particular font.

## Strokes

Three numbers control the drawn parts, as options or later with `editor.setStyle()`:

- `thickness` (default `0.06`): stroke width as a fraction of the font size. `0.05` is a fine pen, `0.08` a marker.
- `roughness` (default `1`): how much fraction bars, radicals and arrows wobble and tilt. `0` gives straight, clean lines,
  `2` a hasty hand.
- `seed` (default `0`): which of the recorded pen samples each symbol uses. Any integer; the same seed always draws the same.
  `editor.reseed()` moves to the next.
