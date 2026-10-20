// Word-style equation ribbon: structure galleries + symbol palettes.
// Templates use MathLive tokens: #@ = current selection (or a placeholder when nothing is selected), #? = placeholder.
// The ribbon only talks to the editor through its public API (insert, command, renderIcon, on('context')),
// so a custom toolbar can do everything this one does.

export const STRUCTURES = [
  { id: 'frac', label: 'Fraction', icon: '\\frac{x}{y}', items: [
    ['\\frac{#@}{#?}', 'Stacked fraction'], ['{#@}/{#?}', 'Slashed fraction'], ['\\tfrac{#@}{#?}', 'Small fraction'],
    ['\\dfrac{#@}{#?}', 'Large fraction'], ['\\binom{#@}{#?}', 'Binomial'], ['\\frac{d#@}{d#?}', 'Derivative dy/dx'],
    ['\\frac{\\partial #@}{\\partial #?}', 'Partial derivative'], ['\\frac{\\Delta #@}{\\Delta #?}', 'Difference quotient'],
  ] },
  { id: 'script', label: 'Script', icon: 'x^{n}', items: [
    ['#@^{#?}', 'Superscript'], ['#@_{#?}', 'Subscript'], ['#@_{#?}^{#?}', 'Sub- and superscript'], ['{}_{#?}^{#?}#@', 'Left scripts'],
    ['e^{#?}', 'Power of e'], ['x_{#?}', 'x with subscript'], ['#@^{\\prime}', 'Prime'], ['#@^{2}', 'Square'],
  ] },
  { id: 'root', label: 'Radical', icon: '\\sqrt{x}', items: [
    ['\\sqrt{#@}', 'Square root'], ['\\sqrt[#?]{#@}', 'nth root'], ['\\sqrt[3]{#@}', 'Cube root'],
    ['\\sqrt{#?^{2}+#?^{2}}', 'Pythagoras'], ['\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}', 'Quadratic formula'],
  ] },
  { id: 'int', label: 'Integral', icon: '\\int_{a}^{b}', items: [
    ['\\int_{#?}^{#?}#@', 'Definite integral'], ['\\int #@', 'Indefinite integral'], ['\\int_{#?}#@', 'Integral, lower limit'],
    ['\\iint_{#?}#@', 'Double integral'], ['\\iiint_{#?}#@', 'Triple integral'], ['\\oint_{#?}#@', 'Contour integral'],
    ['\\int_{#?}^{#?}#@\\,d#?', 'Definite integral + dx'], ['\\int #@\\,d#?', 'Indefinite integral + dx'],
  ] },
  { id: 'bigop', label: 'Large operator', icon: '\\sum_{i}^{n}', items: [
    ['\\sum_{#?}^{#?}#@', 'Sum'], ['\\sum_{#?}#@', 'Sum, lower index'], ['\\prod_{#?}^{#?}#@', 'Product'],
    ['\\coprod_{#?}^{#?}#@', 'Coproduct'], ['\\bigcup_{#?}^{#?}#@', 'Union'], ['\\bigcap_{#?}^{#?}#@', 'Intersection'],
    ['\\bigvee_{#?}#@', 'Disjunction'], ['\\bigwedge_{#?}#@', 'Conjunction'], ['\\bigoplus_{#?}#@', 'Direct sum'],
  ] },
  { id: 'fence', label: 'Bracket', icon: '\\left(x\\right)', items: [
    ['\\left(#@\\right)', 'Parentheses'], ['\\left[#@\\right]', 'Square brackets'], ['\\left\\{#@\\right\\}', 'Braces'],
    ['\\left|#@\\right|', 'Absolute value'], ['\\left\\|#@\\right\\|', 'Norm'], ['\\left\\langle #@\\right\\rangle', 'Angle brackets'],
    ['\\left\\lfloor #@\\right\\rfloor', 'Floor'], ['\\left\\lceil #@\\right\\rceil', 'Ceiling'],
    ['\\left\\{#@\\,\\middle|\\,#?\\right\\}', 'Set {x | …}'],
    ['\\begin{cases}#? & #?\\\\ #? & #?\\end{cases}', 'Cases'],
  ] },
  { id: 'func', label: 'Function', icon: '\\sin\\theta', items: [
    ['\\sin #@', 'sin'], ['\\cos #@', 'cos'], ['\\tan #@', 'tan'], ['\\cot #@', 'cot'],
    ['\\arcsin #@', 'arcsin'], ['\\arccos #@', 'arccos'], ['\\arctan #@', 'arctan'],
    ['\\sinh #@', 'sinh'], ['\\cosh #@', 'cosh'], ['\\ln #@', 'ln'], ['\\log #@', 'log'],
    ['\\log_{#?}#@', 'log with base'], ['\\exp #@', 'exp'], ['\\max_{#?}#@', 'max'], ['\\min_{#?}#@', 'min'],
    ['\\det #@', 'det'],
  ] },
  { id: 'accent', label: 'Accent', icon: '\\vec{a}', items: [
    ['\\vec{#@}', 'Vector'], ['\\overrightarrow{#@}', 'Long vector'], ['\\hat{#@}', 'Hat'], ['\\bar{#@}', 'Bar'],
    ['\\overline{#@}', 'Overline'], ['\\underline{#@}', 'Underline'], ['\\dot{#@}', 'Dot'], ['\\ddot{#@}', 'Double dot'],
    ['\\tilde{#@}', 'Tilde'], ['\\overbrace{#@}^{#?}', 'Overbrace'], ['\\underbrace{#@}_{#?}', 'Underbrace'],
  ] },
  { id: 'lim', label: 'Limit', icon: '\\lim_{n\\to\\infty}', items: [
    ['\\lim_{#?}#@', 'Limit'], ['\\lim_{n\\to\\infty}#@', 'n → ∞'], ['\\lim_{x\\to 0}#@', 'x → 0'],
    ['\\lim_{x\\to#?}#@', 'x → a'], ['\\limsup_{#?}#@', 'Limit superior'], ['\\liminf_{#?}#@', 'Limit inferior'],
  ] },
  { id: 'matrix', label: 'Matrix', icon: '\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}', items: [
    ['\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}', '2×2, parentheses'], ['\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}', '2×2, brackets'],
    ['\\begin{vmatrix}#?&#?\\\\#?&#?\\end{vmatrix}', '2×2 determinant'],
    ['\\begin{pmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{pmatrix}', '3×3'],
    ['\\begin{pmatrix}#?\\\\#?\\end{pmatrix}', 'Column vector'], ['\\begin{pmatrix}#?&#?\\end{pmatrix}', 'Row vector'],
    ['\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}', 'Identity matrix'],
    ['\\begin{pmatrix}a_{11}&\\cdots&a_{1n}\\\\\\vdots&\\ddots&\\vdots\\\\a_{m1}&\\cdots&a_{mn}\\end{pmatrix}', 'm×n'],
  ], actions: [['addRowAfter', 'Add row below'], ['addColumnAfter', 'Add column right'], ['removeRow', 'Delete row'], ['removeColumn', 'Delete column']] },
];

export const SYMBOLS = [
  { id: 'basic', label: 'Basic', items: ['+', '-', '\\pm', '\\mp', '\\times', '\\div', '\\cdot', '\\ast', '\\circ', '=', '\\ne', '<', '>', '\\le', '\\ge', '\\infty', '\\partial', '\\nabla', '\\prime', '\\%', '!', '\\cdots', '\\ldots', '\\vdots', '\\ddots', '\\degree', '\\hbar', '\\ell'] },
  { id: 'greek', label: 'Greek', items: ['\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\varepsilon', '\\zeta', '\\eta', '\\theta', '\\vartheta', '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma', '\\tau', '\\upsilon', '\\phi', '\\varphi', '\\chi', '\\psi', '\\omega', '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Phi', '\\Psi', '\\Omega'] },
  { id: 'rel', label: 'Relations', items: ['\\approx', '\\equiv', '\\sim', '\\simeq', '\\cong', '\\propto', '\\ll', '\\gg', '\\prec', '\\succ', '\\parallel', '\\perp', '\\mid', '\\nmid', '\\doteq', '\\triangleq', '\\models', '\\vdash'] },
  { id: 'arrow', label: 'Arrows', items: ['\\to', '\\leftarrow', '\\leftrightarrow', '\\Rightarrow', '\\Leftarrow', '\\Leftrightarrow', '\\mapsto', '\\uparrow', '\\downarrow', '\\longrightarrow', '\\Longrightarrow', '\\Longleftrightarrow', '\\hookrightarrow', '\\rightleftharpoons', '\\nearrow', '\\searrow'] },
  { id: 'set', label: 'Sets and logic', items: ['\\in', '\\notin', '\\ni', '\\subset', '\\supset', '\\subseteq', '\\supseteq', '\\subsetneq', '\\cup', '\\cap', '\\setminus', '\\emptyset', '\\forall', '\\exists', '\\nexists', '\\neg', '\\land', '\\lor', '\\therefore', '\\because', '\\mathbb{R}', '\\mathbb{Z}', '\\mathbb{N}', '\\mathbb{Q}', '\\mathbb{C}', '\\mathbb{P}'] },
  { id: 'script', label: 'Script letters', items: ['\\mathcal{A}', '\\mathcal{B}', '\\mathcal{C}', '\\mathcal{F}', '\\mathcal{L}', '\\mathcal{N}', '\\mathcal{O}', '\\mathcal{P}', '\\mathcal{U}', '\\mathscr{F}', '\\mathscr{L}', '\\mathscr{H}', '\\mathfrak{g}', '\\mathfrak{h}', '\\aleph'] },
];

/** The ribbon's own words. */
export const LABELS = {
  structures: 'Structures', symbols: 'Symbols', undo: '↶ Undo', redo: '↷ Redo', matrixActions: 'With the caret in a matrix:',
};

/**
 * The default toolbar with its words replaced: `t` is { labels, structures, symbols, items, actions }, where
 * structures / symbols map a group id to its label, items map a template to its name and actions a command to its name.
 * Anything not listed keeps its English. Returns fresh { structures, symbols, labels } to use as the `toolbar` option.
 */
export function translateToolbar(t = {}) {
  const pick = (map, key, fallback) => (map && map[key]) || fallback;
  return {
    structures: STRUCTURES.map((g) => ({
      ...g,
      label: pick(t.structures, g.id, g.label),
      items: g.items.map(([tpl, name]) => [tpl, pick(t.items, tpl, name)]),
      ...(g.actions && { actions: g.actions.map(([cmd, name]) => [cmd, pick(t.actions, cmd, name)]) }),
    })),
    symbols: SYMBOLS.map((g) => ({ ...g, label: pick(t.symbols, g.id, g.label), items: [...g.items] })),
    labels: { ...LABELS, ...t.labels },
  };
}

/** A template as shown on a button: empty slots and the selection slot drawn as □. */
export const preview = (tpl) => tpl.replace(/#@|#\?/g, '\\square');

// builds the ribbon into `root` for `editor` (the object createInkMath returns). Returns a function that removes it.
export function buildRibbon(root, editor, { structures = STRUCTURES, symbols = SYMBOLS, labels = {}, edit = true } = {}) {
  labels = { ...LABELS, ...labels };
  root.innerHTML = '';
  const tabs = document.createElement('div'); tabs.className = 'inkmath-tb-tabs';
  const body = document.createElement('div'); body.className = 'inkmath-tb-body';
  const pop = document.createElement('div'); pop.className = 'inkmath-tb-popup'; pop.hidden = true;
  root.append(tabs, body, pop);
  // never steal focus / selection from the math field
  root.addEventListener('mousedown', (e) => { if (!e.target.closest('input')) e.preventDefault(); });

  const panes = {};
  const tab = (id, label) => {
    const b = document.createElement('button'); b.className = 'inkmath-tb-tab'; b.textContent = label; b.dataset.tab = id;
    b.onclick = () => show(id); tabs.appendChild(b);
    const p = document.createElement('div'); p.className = 'inkmath-tb-pane'; p.hidden = true; body.appendChild(p);
    panes[id] = p; return p;
  };
  const show = (id) => {
    for (const [k, p] of Object.entries(panes)) p.hidden = k !== id;
    tabs.querySelectorAll('.inkmath-tb-tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === id));
    pop.hidden = true;
  };
  const mathBtn = (latex, title, cls) => {
    const b = document.createElement('button'); b.className = cls; b.title = title || latex;
    b.innerHTML = editor.renderIcon(latex);
    return b;
  };
  // buttons enabled only in some contexts: undo / redo always, matrix actions while their gallery is open
  const fixed = [];
  let popLive = [];
  const refresh = (c) => { for (const [b, ok] of [...fixed, ...popLive]) b.disabled = !ok(c); };

  // structures: one big button per group, opening a gallery
  const sp = structures.length ? tab('struct', labels.structures) : null;
  for (const g of structures) {
    const b = mathBtn(g.icon, g.label, 'inkmath-tb-group');
    const cap = document.createElement('span'); cap.className = 'inkmath-tb-caption'; cap.textContent = g.label + ' ▾'; b.appendChild(cap);
    b.onclick = () => {
      if (!pop.hidden && pop.dataset.g === g.id) { pop.hidden = true; return; }
      pop.dataset.g = g.id; pop.innerHTML = ''; popLive = [];
      const h = document.createElement('div'); h.className = 'inkmath-tb-popup-title'; h.textContent = g.label; pop.appendChild(h);
      const grid = document.createElement('div'); grid.className = 'inkmath-tb-gallery';
      for (const [tpl, name] of g.items) {
        const it = mathBtn(tpl, name, 'inkmath-tb-item');
        const n = document.createElement('span'); n.className = 'inkmath-tb-item-name'; n.textContent = name; it.appendChild(n);
        it.onclick = () => { pop.hidden = true; editor.insert(tpl); };
        grid.appendChild(it);
      }
      pop.appendChild(grid);
      if (g.actions) {
        const a = document.createElement('div'); a.className = 'inkmath-tb-actions';
        if (labels.matrixActions) { const s = document.createElement('span'); s.textContent = labels.matrixActions; a.appendChild(s); }
        for (const [cmd, name] of g.actions) {
          const ab = document.createElement('button'); ab.textContent = name;
          ab.onclick = () => { pop.hidden = true; editor.command(cmd); };
          a.appendChild(ab);
          popLive.push([ab, (c) => c.inMatrix]);
        }
        pop.appendChild(a);
        refresh(editor.getContext());
      }
      const r = b.getBoundingClientRect(), rr = root.getBoundingClientRect();
      pop.hidden = false;
      pop.style.left = Math.max(0, Math.min(r.left - rr.left, rr.width - pop.offsetWidth)) + 'px';
      pop.style.top = (r.bottom - rr.top + 4) + 'px';
    };
    sp.appendChild(b);
  }

  // symbols: sub-tabs with a dense grid
  if (symbols.length) {
    const yp = tab('sym', labels.symbols);
    const sub = document.createElement('div'); sub.className = 'inkmath-tb-subtabs';
    const grid = document.createElement('div'); grid.className = 'inkmath-tb-symbols';
    yp.append(sub, grid);
    const showSym = (g) => {
      sub.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.g === g.id));
      grid.innerHTML = '';
      for (const s of g.items) {
        const b = mathBtn(s, s, 'inkmath-tb-symbol');
        b.onclick = () => editor.insert(s);
        grid.appendChild(b);
      }
    };
    for (const g of symbols) {
      const b = document.createElement('button'); b.textContent = g.label; b.dataset.g = g.id; b.onclick = () => showSym(g);
      sub.appendChild(b);
    }
    showSym(symbols[0]);
  }

  // edit actions on the tab bar's right
  if (edit) {
    const ed = document.createElement('div'); ed.className = 'inkmath-tb-edit';
    for (const cmd of ['undo', 'redo']) {
      const b = document.createElement('button'); b.textContent = labels[cmd]; b.onclick = () => editor.command(cmd); ed.appendChild(b);
      fixed.push([b, (c) => (cmd === 'undo' ? c.canUndo : c.canRedo)]);
    }
    tabs.appendChild(ed);
  }

  const off = editor.on('context', refresh);
  refresh(editor.getContext());
  const outside = (e) => { if (!root.contains(e.target)) pop.hidden = true; };
  document.addEventListener('mousedown', outside);
  const first = Object.keys(panes)[0];
  if (first) show(first);
  return () => { off(); document.removeEventListener('mousedown', outside); root.innerHTML = ''; };
}
