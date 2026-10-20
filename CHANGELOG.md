# Changelog

inkmath follows [semantic versioning](https://semver.org). Before 1.0, a minor version (0.x.0) may change the API; a patch
version (0.x.y) only fixes things.

## 0.1.0 (unreleased)

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
