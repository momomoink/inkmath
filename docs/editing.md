# Editing

inkmath follows the formula editor in Microsoft Word: a toolbar of structures and symbols, LaTeX commands that turn into
symbols as you type, and Tab to move through the empty slots.

## Typing

| Type | You get |
|---|---|
| `\alpha` + space | α. Every Greek letter works, and typing `alpha` without the backslash does too |
| `\frac` + space, or `/` | a fraction. Tab moves from the numerator to the denominator |
| `\int` + space | `\int_{□}^{□}□`. Tab goes lower limit → upper limit → body |
| `\sum`, `\prod`, `\bigcup`, `\bigcap` + space | the same, with lower and upper limits |
| `\iint`, `\oint`, `\lim` + space | a template with a lower limit and a body |
| `dx` after an integral | `\,dx`. Any `d` + letter (`dt`, `dy`, …) after an integral sign on the same level, with no `=` in between, gets the thin space |
| `\sqrt`, `\vec`, `\hat`, `\bar`, `\dot`, `\tilde`, `\overline`, … + space | the structure with the caret inside |
| `\R`, `\Z`, `\N`, `\Q`, `\C` + space | ℝ ℤ ℕ ℚ ℂ |
| `\mathbb`, `\mathcal`, `\mathscr`, `\mathfrak`, `\mathrm`, `\mathbf` + space, then a letter | that letter in that alphabet |
| `^`, `_` | a superscript or subscript |
| space | commits a LaTeX command; inside a superscript or subscript, leaves it |

Backslash starts a LaTeX command; MathLive suggests completions while you type it.

## Moving around

- **Tab** leaves the innermost structure, the way Word does: numerator → denominator, one matrix cell → the next, an empty
  subscript of `x_□^□` → its superscript, anything else → just after the structure.
- In a big-operator template, Tab follows Word's order: lower limit, then upper limit, then the body.
- **Shift+Tab** goes back out before the structure.
- **→** at the end of a slot leaves it, like everywhere in MathLive.

## The toolbar

The toolbar has two tabs.

- **Structures**: fractions, scripts, radicals, integrals, big operators, brackets, functions, accents, limits and matrices.
  Each button opens a gallery. If something is selected when you pick a template, the selection goes inside it: select
  `x+1` and pick √ to get `\sqrt{x+1}`. While the caret is in a matrix, the matrix gallery also offers adding and removing
  rows and columns.
- **Symbols**: basic operators, Greek, relations, arrows, sets and logic, and script letters.

Undo and redo sit at the right end of the tab bar (Ctrl+Z and Ctrl+Y also work).

The toolbar is in English; a Chinese version ships with the package. Its content, words, look and place on the page can all be
changed, or you can build your own: see [The toolbar](toolbar.md).
