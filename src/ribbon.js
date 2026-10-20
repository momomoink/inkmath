// Word-style equation ribbon: structure galleries + symbol palettes.
// Templates use MathLive tokens: #@ = current selection (or a placeholder when nothing is selected), #? = placeholder.

export const STRUCTURES = [
  { id: 'frac', label: '分式', icon: '\\frac{x}{y}', items: [
    ['\\frac{#@}{#?}', '分式（竖式）'], ['{#@}/{#?}', '分式（斜线）'], ['\\tfrac{#@}{#?}', '小型分式'],
    ['\\dfrac{#@}{#?}', '大型分式'], ['\\binom{#@}{#?}', '组合数'], ['\\frac{d#@}{d#?}', '导数 dy/dx'],
    ['\\frac{\\partial #@}{\\partial #?}', '偏导数'], ['\\frac{\\Delta #@}{\\Delta #?}', '差商'],
  ] },
  { id: 'script', label: '上下标', icon: 'x^{n}', items: [
    ['#@^{#?}', '上标'], ['#@_{#?}', '下标'], ['#@_{#?}^{#?}', '上下标'], ['{}_{#?}^{#?}#@', '左上下标'],
    ['e^{#?}', 'e 的幂'], ['x_{#?}', 'x 下标'], ['#@^{\\prime}', '撇'], ['#@^{2}', '平方'],
  ] },
  { id: 'root', label: '根式', icon: '\\sqrt{x}', items: [
    ['\\sqrt{#@}', '平方根'], ['\\sqrt[#?]{#@}', 'n 次根'], ['\\sqrt[3]{#@}', '立方根'],
    ['\\sqrt{#?^{2}+#?^{2}}', '勾股'], ['\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}', '求根公式'],
  ] },
  { id: 'int', label: '积分', icon: '\\int_{a}^{b}', items: [
    ['\\int_{#?}^{#?}#@', '定积分'], ['\\int #@', '不定积分'], ['\\int_{#?}#@', '积分（下限）'],
    ['\\iint_{#?}#@', '二重积分'], ['\\iiint_{#?}#@', '三重积分'], ['\\oint_{#?}#@', '环路积分'],
    ['\\int_{#?}^{#?}#@\\,d#?', '定积分 + dx'], ['\\int #@\\,d#?', '不定积分 + dx'],
  ] },
  { id: 'bigop', label: '大型运算符', icon: '\\sum_{i}^{n}', items: [
    ['\\sum_{#?}^{#?}#@', '求和'], ['\\sum_{#?}#@', '求和（下标）'], ['\\prod_{#?}^{#?}#@', '连乘'],
    ['\\coprod_{#?}^{#?}#@', '余积'], ['\\bigcup_{#?}^{#?}#@', '并'], ['\\bigcap_{#?}^{#?}#@', '交'],
    ['\\bigvee_{#?}#@', '析取'], ['\\bigwedge_{#?}#@', '合取'], ['\\bigoplus_{#?}#@', '直和'],
  ] },
  { id: 'fence', label: '括号', icon: '\\left(x\\right)', items: [
    ['\\left(#@\\right)', '圆括号'], ['\\left[#@\\right]', '方括号'], ['\\left\\{#@\\right\\}', '花括号'],
    ['\\left|#@\\right|', '绝对值'], ['\\left\\|#@\\right\\|', '范数'], ['\\left\\langle #@\\right\\rangle', '尖括号'],
    ['\\left\\lfloor #@\\right\\rfloor', '下取整'], ['\\left\\lceil #@\\right\\rceil', '上取整'],
    ['\\left\\{#@\\,\\middle|\\,#?\\right\\}', '集合 {x | …}'],
    ['\\begin{cases}#? & #?\\\\ #? & #?\\end{cases}', '分段函数'],
  ] },
  { id: 'func', label: '函数', icon: '\\sin\\theta', items: [
    ['\\sin #@', 'sin'], ['\\cos #@', 'cos'], ['\\tan #@', 'tan'], ['\\cot #@', 'cot'],
    ['\\arcsin #@', 'arcsin'], ['\\arccos #@', 'arccos'], ['\\arctan #@', 'arctan'],
    ['\\sinh #@', 'sinh'], ['\\cosh #@', 'cosh'], ['\\ln #@', 'ln'], ['\\log #@', 'log'],
    ['\\log_{#?}#@', 'log 底数'], ['\\exp #@', 'exp'], ['\\max_{#?}#@', 'max'], ['\\min_{#?}#@', 'min'],
    ['\\det #@', 'det'],
  ] },
  { id: 'accent', label: '重音', icon: '\\vec{a}', items: [
    ['\\vec{#@}', '向量'], ['\\overrightarrow{#@}', '长向量'], ['\\hat{#@}', '尖帽'], ['\\bar{#@}', '横线'],
    ['\\overline{#@}', '上划线'], ['\\underline{#@}', '下划线'], ['\\dot{#@}', '一点'], ['\\ddot{#@}', '两点'],
    ['\\tilde{#@}', '波浪'], ['\\overbrace{#@}^{#?}', '上大括号'], ['\\underbrace{#@}_{#?}', '下大括号'],
  ] },
  { id: 'lim', label: '极限', icon: '\\lim_{n\\to\\infty}', items: [
    ['\\lim_{#?}#@', '极限'], ['\\lim_{n\\to\\infty}#@', 'n → ∞'], ['\\lim_{x\\to 0}#@', 'x → 0'],
    ['\\lim_{x\\to#?}#@', 'x → a'], ['\\limsup_{#?}#@', '上极限'], ['\\liminf_{#?}#@', '下极限'],
  ] },
  { id: 'matrix', label: '矩阵', icon: '\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}', items: [
    ['\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}', '2×2 圆括号'], ['\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}', '2×2 方括号'],
    ['\\begin{vmatrix}#?&#?\\\\#?&#?\\end{vmatrix}', '2×2 行列式'],
    ['\\begin{pmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{pmatrix}', '3×3'],
    ['\\begin{pmatrix}#?\\\\#?\\end{pmatrix}', '列向量'], ['\\begin{pmatrix}#?&#?\\end{pmatrix}', '行向量'],
    ['\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}', '单位矩阵'],
    ['\\begin{pmatrix}a_{11}&\\cdots&a_{1n}\\\\\\vdots&\\ddots&\\vdots\\\\a_{m1}&\\cdots&a_{mn}\\end{pmatrix}', 'm×n'],
  ], actions: [['addRowAfter', '下方加一行'], ['addColumnAfter', '右侧加一列'], ['removeRow', '删除行'], ['removeColumn', '删除列']] },
];

export const SYMBOLS = [
  { id: 'basic', label: '基础', items: ['+', '-', '\\pm', '\\mp', '\\times', '\\div', '\\cdot', '\\ast', '\\circ', '=', '\\ne', '<', '>', '\\le', '\\ge', '\\infty', '\\partial', '\\nabla', '\\prime', '\\%', '!', '\\cdots', '\\ldots', '\\vdots', '\\ddots', '\\degree', '\\hbar', '\\ell'] },
  { id: 'greek', label: '希腊字母', items: ['\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\varepsilon', '\\zeta', '\\eta', '\\theta', '\\vartheta', '\\iota', '\\kappa', '\\lambda', '\\mu', '\\nu', '\\xi', '\\pi', '\\rho', '\\sigma', '\\tau', '\\upsilon', '\\phi', '\\varphi', '\\chi', '\\psi', '\\omega', '\\Gamma', '\\Delta', '\\Theta', '\\Lambda', '\\Xi', '\\Pi', '\\Sigma', '\\Phi', '\\Psi', '\\Omega'] },
  { id: 'rel', label: '关系', items: ['\\approx', '\\equiv', '\\sim', '\\simeq', '\\cong', '\\propto', '\\ll', '\\gg', '\\prec', '\\succ', '\\parallel', '\\perp', '\\mid', '\\nmid', '\\doteq', '\\triangleq', '\\models', '\\vdash'] },
  { id: 'arrow', label: '箭头', items: ['\\to', '\\leftarrow', '\\leftrightarrow', '\\Rightarrow', '\\Leftarrow', '\\Leftrightarrow', '\\mapsto', '\\uparrow', '\\downarrow', '\\longrightarrow', '\\Longrightarrow', '\\Longleftrightarrow', '\\hookrightarrow', '\\rightleftharpoons', '\\nearrow', '\\searrow'] },
  { id: 'set', label: '集合与逻辑', items: ['\\in', '\\notin', '\\ni', '\\subset', '\\supset', '\\subseteq', '\\supseteq', '\\subsetneq', '\\cup', '\\cap', '\\setminus', '\\emptyset', '\\forall', '\\exists', '\\nexists', '\\neg', '\\land', '\\lor', '\\therefore', '\\because', '\\mathbb{R}', '\\mathbb{Z}', '\\mathbb{N}', '\\mathbb{Q}', '\\mathbb{C}', '\\mathbb{P}'] },
  { id: 'script', label: '花体', items: ['\\mathcal{A}', '\\mathcal{B}', '\\mathcal{C}', '\\mathcal{F}', '\\mathcal{L}', '\\mathcal{N}', '\\mathcal{O}', '\\mathcal{P}', '\\mathcal{U}', '\\mathscr{F}', '\\mathscr{L}', '\\mathscr{H}', '\\mathfrak{g}', '\\mathfrak{h}', '\\aleph'] },
];

export const preview = (tpl) => tpl.replace(/#@|#\?/g, '\\square');

// builds the ribbon into `root`; onInsert(latex) inserts a template, onCommand(cmd) runs a MathLive command.
// Returns a function that removes it.
export function buildRibbon(root, { render, onInsert, onCommand, structures = STRUCTURES, symbols = SYMBOLS }) {
  root.innerHTML = '';
  const tabs = document.createElement('div'); tabs.className = 'rb-tabs';
  const body = document.createElement('div'); body.className = 'rb-body';
  const pop = document.createElement('div'); pop.className = 'rb-pop'; pop.hidden = true;
  root.append(tabs, body, pop);
  // never steal focus / selection from the math field
  root.addEventListener('mousedown', (e) => { if (!e.target.closest('input')) e.preventDefault(); });

  const panes = {};
  const tab = (id, label) => {
    const b = document.createElement('button'); b.className = 'rb-tab'; b.textContent = label; b.dataset.tab = id;
    b.onclick = () => show(id); tabs.appendChild(b);
    const p = document.createElement('div'); p.className = 'rb-pane'; p.hidden = true; body.appendChild(p);
    panes[id] = p; return p;
  };
  const show = (id) => {
    for (const [k, p] of Object.entries(panes)) p.hidden = k !== id;
    tabs.querySelectorAll('.rb-tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === id));
    pop.hidden = true;
  };
  const mathBtn = (latex, title, cls) => {
    const b = document.createElement('button'); b.className = cls; b.title = title || latex;
    b.innerHTML = render(preview(latex));
    return b;
  };

  // structures: one big button per group, opening a gallery
  const sp = tab('struct', '结构');
  for (const g of structures) {
    const b = mathBtn(g.icon, g.label, 'rb-group');
    const cap = document.createElement('span'); cap.className = 'rb-cap'; cap.textContent = g.label + ' ▾'; b.appendChild(cap);
    b.onclick = () => {
      if (!pop.hidden && pop.dataset.g === g.id) { pop.hidden = true; return; }
      pop.dataset.g = g.id; pop.innerHTML = '';
      const h = document.createElement('div'); h.className = 'rb-pop-h'; h.textContent = g.label; pop.appendChild(h);
      const grid = document.createElement('div'); grid.className = 'rb-gallery';
      for (const [tpl, name] of g.items) {
        const it = mathBtn(tpl, name, 'rb-item');
        const n = document.createElement('span'); n.className = 'rb-name'; n.textContent = name; it.appendChild(n);
        it.onclick = () => { pop.hidden = true; onInsert(tpl); };
        grid.appendChild(it);
      }
      pop.appendChild(grid);
      if (g.actions) {
        const a = document.createElement('div'); a.className = 'rb-actions';
        a.innerHTML = '<span>光标在矩阵里时：</span>';
        for (const [cmd, name] of g.actions) {
          const ab = document.createElement('button'); ab.textContent = name; ab.onclick = () => { pop.hidden = true; onCommand(cmd); }; a.appendChild(ab);
        }
        pop.appendChild(a);
      }
      const r = b.getBoundingClientRect(), rr = root.getBoundingClientRect();
      pop.hidden = false;
      pop.style.left = Math.max(0, Math.min(r.left - rr.left, rr.width - pop.offsetWidth)) + 'px';
      pop.style.top = (r.bottom - rr.top + 4) + 'px';
    };
    sp.appendChild(b);
  }

  // symbols: sub-tabs with a dense grid
  const yp = tab('sym', '符号');
  const sub = document.createElement('div'); sub.className = 'rb-subtabs';
  const grid = document.createElement('div'); grid.className = 'rb-symgrid';
  yp.append(sub, grid);
  const showSym = (g) => {
    sub.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.g === g.id));
    grid.innerHTML = '';
    for (const s of g.items) {
      const b = mathBtn(s, s, 'rb-sym');
      b.onclick = () => onInsert(s);
      grid.appendChild(b);
    }
  };
  for (const g of symbols) {
    const b = document.createElement('button'); b.textContent = g.label; b.dataset.g = g.id; b.onclick = () => showSym(g);
    sub.appendChild(b);
  }
  if (symbols.length) showSym(symbols[0]);

  // edit actions on the tab bar's right
  const ed = document.createElement('div'); ed.className = 'rb-edit';
  for (const [cmd, name] of [['undo', '↶ 撤销'], ['redo', '↷ 重做']]) {
    const b = document.createElement('button'); b.textContent = name; b.onclick = () => onCommand(cmd); ed.appendChild(b);
  }
  tabs.appendChild(ed);
  const outside = (e) => { if (!root.contains(e.target)) pop.hidden = true; };
  document.addEventListener('mousedown', outside);
  show('struct');
  return () => { document.removeEventListener('mousedown', outside); root.innerHTML = ''; };
}
