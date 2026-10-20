# inkmath brand

The logo is a single brush stroke: an infinity sign whose left loop holds an *i* and whose right loop flows into an *m*.

| File | Use |
|---|---|
| `inkmath.svg` | Logo in ink, on light backgrounds |
| `inkmath-dark.svg` | Logo in chalk, on dark backgrounds |
| `inkmath-mono.svg` | Logo in `currentColor`, to colour with CSS |
| `icon.svg`, `icon-512.png`, `icon-192.png`, `icon-32.png`, `icon-16.png` | App icon: chalk logo on an ink rounded square |
| `icon-light.svg` | App icon the other way round, ink on paper |
| `favicon.ico` | 16, 32 and 48 px |
| `inkmath-logo.png` | The original artwork, black on transparent |

The SVGs are traced from `inkmath-logo.png`.

In a README, switch with the colour scheme:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/inkmath-dark.svg">
  <img src="brand/inkmath.svg" alt="inkmath" width="220">
</picture>
```

## Palette

Blue-black ink on engineering-pad paper, with a green accent.

| Name | Light | Dark | |
|---|---|---|---|
| Ink | `#1D2B4A` | `#E6EADF` | Logo, text, formulas |
| Paper | `#FBFCF8` | `#18211C` | Surfaces, the editing field |
| Desk | `#F3F5F1` | `#121815` | Page background |
| Grid | `#D9E6D3` | `#24332B` | Pad grid lines |
| Line | `#D7DDD3` | `#2C3A32` | Borders |
| Muted | `#5D6B63` | `#95A39A` | Captions, secondary text |
| Accent | `#2F6F4F` | `#7FC4A0` | Links, caret, active states |

The editor's default colours are this palette ([Styling](../docs/styling.md)).
