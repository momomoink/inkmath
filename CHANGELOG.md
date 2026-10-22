# Changelog

inkmath follows [semantic versioning](https://semver.org). Before 1.0, a minor version (0.x.0) may change the API; a patch
version (0.x.y) only fixes things.

## Unreleased

- Lowercase π is written as a lowercase π (x-height, overhanging bar, curled right leg); it used to come out like Π.
- ∇ and ℏ are handwritten (MathWriting samples) and ℓ is a pen-drawn cursive l; all three used to show in a typeset font.

## 0.1.1 (2026-10-21)

- `\neg` / `\lnot` (¬) is spaced as an ordinary symbol, as in TeX: in `p\Rightarrow\neg q` it no longer runs into the arrow
  (MathLive files it under relations).
- ¬ is centred in its own slot and looks hand-written: the stroke rises a little, turns down in a rounded corner and thins
  out where the pen lifts. ∀ ∃ ∧ ∨ get the same pen pressure.
- First version published from GitHub Actions with npm Trusted Publishing, with provenance.

## 0.1.0 (2026-10-21)

First release.

- Formula editor that writes in handwriting: a handwriting font for letters and digits (eight bundled), MathWriting pen
  strokes for Greek letters, ∫, ∑, ℝ ℤ ℕ and large brackets, drawn strokes for fraction bars, radicals, arrows, ∞ and logic
  symbols; `\mathcal` in Dancing Script, `\mathscr` in Allura.
- Fast editing with LaTeX commands, Word's Tab order through templates, `dx` after an integral gets its thin space.
- `<ink-math>` and `<ink-math-toolbar>` tags; one toolbar can serve every formula on a page.
- Toolbar in English, Chinese included (`inkmath/locales/zh`); content, words, look and position configurable;
  `translateToolbar()` for other languages.
- Editor API for custom toolbars: `insert`, `command`, `getContext`, `on('change' | 'context' | 'font')`, `renderIcon`.
- `renderLatex()` draws any LaTeX in handwriting without an editor.
