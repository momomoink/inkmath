// inkmath: a Word-style formula editor (MathLive) whose output is drawn in handwriting.
// Letters, digits, Greek and operators use a handwriting font inside the editor; big operators, radicals,
// fraction bars, \mathbb and stretched delimiters are hidden and redrawn as pen strokes in an SVG overlay.
import { MathfieldElement, convertLatexToMarkup } from 'mathlive';
import { buildRibbon, preview, STRUCTURES, SYMBOLS, LABELS, translateToolbar } from './ribbon.js';
import { loadGlyphs, measure, render, toSVG, STROKE_PARTS } from './hw.js';

export { STRUCTURES, SYMBOLS, LABELS, translateToolbar };

const DEFAULT_ASSETS = new URL('../assets/', import.meta.url).href;
const FALLBACK = "'inkmath-wenkai'";   // full Greek / set-symbol coverage for fonts that lack them

// ---- assets: glyph samples and the font list, fetched once per base URL
const cache = new Map();
const once = (key, f) => { if (!cache.has(key)) cache.set(key, f()); return cache.get(key); };
const slash = (u) => (u.endsWith('/') ? u : u + '/');
// options left undefined keep their defaults
const given = (opts) => Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined));

function loadAssets(assetsUrl, extraFonts = []) {
  const base = slash(new URL(assetsUrl, document.baseURI).href);
  const glyphs = once('g:' + base, () => loadGlyphs(base + 'glyphs.json'));
  const fonts = once('f:' + base, () => fetch(base + 'fonts.json').then((r) => r.json())
    .then((list) => list.map((f) => ({ id: f.id, label: f.label, url: new URL(f.file, base).href, greek: f.greek ?? 1 }))));
  return Promise.all([glyphs, fonts]).then(([g, f]) => {
    const all = [...f];
    for (const x of extraFonts) {
      const font = { id: x.id, label: x.label || x.id, url: new URL(x.url, document.baseURI).href, greek: x.greek ?? 1 };
      const i = all.findIndex((y) => y.id === font.id);
      if (i >= 0) all[i] = font; else all.push(font);
    }
    registerFaces(all);
    registerFaces([{ id: 'cal', url: base + 'fonts/dancing.ttf' }, { id: 'scr', url: base + 'fonts/allura.ttf' }]);
    return { base, glyphs: g, fonts: all };
  });
}

// every font as an @font-face (the browser only downloads the ones in use)
const registered = new Set();
function registerFaces(fonts) {
  const css = fonts.filter((f) => !registered.has(f.id + '|' + f.url)).map((f) => {
    registered.add(f.id + '|' + f.url);
    return `@font-face{font-family:"inkmath-${f.id}";src:url("${f.url}");font-display:block}`;
  });
  if (!css.length) return;
  const st = document.createElement('style');
  st.dataset.inkmath = 'fonts';
  st.textContent = css.join('\n');
  document.head.appendChild(st);
}

function pickFont(fonts, id) {
  if (fonts.some((f) => f.id === id)) return id;
  if (id) console.warn(`inkmath: unknown font "${id}", using "${fonts[0].id}"`);
  return fonts[0].id;
}

const fontVar = (id) => `"inkmath-${id}"`;
const loadFont = (id) => document.fonts.load(`40px ${fontVar(id)}`).catch(() => {});

function overlaySVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'inkmath-overlay');
  svg.setAttribute('aria-hidden', 'true');
  return svg;
}

// draw the handwriting overlay for the MathLive markup under `content`, positioned relative to `frame`
function draw(content, frame, svg, glyphs, color, s) {
  const fr = frame.getBoundingClientRect();
  svg.setAttribute('width', fr.width); svg.setAttribute('height', fr.height);
  svg.style.width = fr.width + 'px'; svg.style.height = fr.height + 'px';
  const items = content ? measure(content, { strokeSel: STROKE_PARTS }) : [];
  const { paths } = render(items, glyphs, { seed: s.seed, ox: fr.left, oy: fr.top, width: s.thickness });
  toSVG(svg, paths, color, { roughness: s.roughness, seed: s.seed });
}

// inside the editor's shadow DOM: letters, digits, Greek, operators, small delimiters in the handwriting font;
// \mathcal in Dancing Script, \mathscr in Allura, \mathfrak keeps KaTeX's; stroke-drawn parts are hidden (drawn by the overlay)
const SHADOW_CSS = `
.ML__mathit, .ML__cmr, .ML__mathrm, .ML__mathbf, .ML__boldsymbol, .ML__small-delim, .ML__op-symbol:not(.ML__large-op), .ML__text {
  font-family: var(--hw-font), ${FALLBACK}, KaTeX_Main, serif !important; font-style: normal !important; font-size-adjust: ex-height 0.46; }
.ML__mathbf, .ML__boldsymbol { font-weight: 700; }
.ML__cal { font-family: 'inkmath-cal', KaTeX_Caligraphic, serif !important; font-style: normal !important; font-size-adjust: cap-height 0.7; }
.ML__script { font-family: 'inkmath-scr', KaTeX_Script, serif !important; font-style: normal !important; font-size-adjust: cap-height 0.7; }
${STROKE_PARTS} { color: transparent !important; }
.ML__frac-line, .ML__sqrt-line, .ML__overline-line, .ML__underline-line { border-color: transparent !important; background: transparent !important; color: transparent !important; }
`;

// big operators typed as a bare command get a template with placeholders (lower / upper / body)
const TEMPLATES = {
  '\\int': '\\int_{#?}^{#?}#?', '\\iint': '\\iint_{#?}#?', '\\oint': '\\oint_{#?}#?',
  '\\sum': '\\sum_{#?}^{#?}#?', '\\prod': '\\prod_{#?}^{#?}#?', '\\lim': '\\lim_{#?}#?',
  '\\bigcup': '\\bigcup_{#?}^{#?}#?', '\\bigcap': '\\bigcap_{#?}^{#?}#?',
};
const BB = { '\\R': '\\mathbb{R}', '\\Z': '\\mathbb{Z}', '\\N': '\\mathbb{N}', '\\Q': '\\mathbb{Q}', '\\C': '\\mathbb{C}' };
// MathLive files \neg and \lnot under relations, so in p\Rightarrow\neg q the arrow and ¬ touched and a wide space
// followed ¬; in TeX they are ordinary symbols
const MACROS = {
  R: '\\mathbb{R}', Z: '\\mathbb{Z}', N: '\\mathbb{N}', Q: '\\mathbb{Q}', C: '\\mathbb{C}',
  neg: '\\mathord{\\char"AC}', lnot: '\\mathord{\\char"AC}',
};
// commands that need an argument or limits are intercepted *before* MathLive commits them from LaTeX mode:
// MathLive would leave e.g. an empty \vec{} selected (the next key replaces it) or put \int's limits in its own order
const ARG = Object.fromEntries(['sqrt', 'vec', 'hat', 'bar', 'dot', 'ddot', 'tilde', 'overline', 'underline',
  'overrightarrow', 'widehat', 'widetilde'].map((c) => ['\\' + c, `\\${c}{#?}`]));
const PRE = { ...TEMPLATES, ...ARG, ...BB };
// font-switch commands (\mathbb \mathcal \mathscr \mathfrak \mathrm \mathbf) committed without an argument:
// the next letter typed gets that font
const FONT_CMDS = ['\\mathbb', '\\mathcal', '\\mathscr', '\\mathfrak', '\\mathrm', '\\mathbf'];

// d + letter after an integral sign at the same level (and no = in between) becomes a differential with a thin space:
// \int_0^1 x^2 dx -> \int_0^1 x^2\,dx. MathLive's own dx/dy/dt shortcuts (upright d, no space, unrelated to \int) are dropped.
function differential(field, s) {
  if (!/^d[a-zA-Z]$/.test(s)) return '';
  const model = field.model, d = model && model.at(model.position);
  if (!d || !d.parent) return '';
  for (let a = d.leftSibling; a && a.type !== 'first'; a = a.leftSibling) {
    if (a.type === 'mrel') return '';
    if (/int$/.test(a.command || '') || /[∫∬∭∮]/.test(a.value || '')) return `\\,d${s[1]}`;
  }
  return '';
}

/**
 * Mount an editor into `container`.
 * Options: value, font, toolbar, readOnly, thickness, roughness, seed, assetsUrl, fonts, onChange, onContextChange.
 * `toolbar` is true (the default toolbar), false (none) or { structures, symbols, labels, edit, container }.
 */
export async function createInkMath(container, options = {}) {
  const o = {
    value: '', font: 'caveat', toolbar: true, readOnly: false,
    thickness: 0.06, roughness: 1, seed: 0, assetsUrl: DEFAULT_ASSETS, fonts: [],
    onChange: null, onContextChange: null, ...given(options),
  };
  const { base, glyphs, fonts } = await loadAssets(o.assetsUrl, o.fonts);
  MathfieldElement.fontsDirectory = base + 'mathlive-fonts';
  MathfieldElement.soundsDirectory = null;
  const style = { thickness: o.thickness, roughness: o.roughness, seed: o.seed };
  let fontId = pickFont(fonts, o.font);
  const tb = o.toolbar && !o.readOnly ? (o.toolbar === true ? {} : o.toolbar) : null;

  const root = document.createElement('div'); root.className = 'inkmath';
  const ribbonEl = document.createElement('div'); ribbonEl.className = 'inkmath-tb';
  const wrap = document.createElement('div'); wrap.className = 'inkmath-field';
  const mf = new MathfieldElement();
  const overlay = overlaySVG();
  wrap.append(mf, overlay);
  // a toolbar placed elsewhere still sits in an .inkmath element, so the --inkmath-* colours reach it
  let ribbonHost = null;
  if (tb && tb.container) {
    ribbonHost = document.createElement('div'); ribbonHost.className = 'inkmath inkmath-toolbar';
    ribbonHost.append(ribbonEl); tb.container.appendChild(ribbonHost);
  } else if (tb) root.append(ribbonEl);
  root.append(wrap);
  container.appendChild(root);

  // events for custom toolbars: 'change' (latex), 'context' (where the caret is, what can be undone), 'font' (font id)
  const listeners = { change: new Set(), context: new Set(), font: new Set() };
  if (o.onChange) listeners.change.add(o.onChange);
  if (o.onContextChange) listeners.context.add(o.onContextChange);
  const on = (type, fn) => {
    if (!listeners[type]) throw new Error(`inkmath: unknown event "${type}" (use 'change', 'context' or 'font')`);
    listeners[type].add(fn);
    return () => listeners[type].delete(fn);
  };
  function getContext() {
    const model = mf._mathfield && mf._mathfield.model;
    let inMatrix = false;
    if (model) for (let a = model.at(mf.position); a; a = a.parent) if (a.type === 'array') { inMatrix = true; break; }
    return {
      focused: mf.hasFocus(), hasSelection: !mf.selectionIsCollapsed, inMatrix,
      canUndo: mf.canUndo(), canRedo: mf.canRedo(), latexMode: mf.mode === 'latex',
    };
  }
  let lastContext = '';
  const emitContext = () => {
    const c = getContext(), key = JSON.stringify(c);
    if (key === lastContext) return;
    lastContext = key;
    for (const fn of listeners.context) fn(c);
  };

  mf.smartFence = true;
  mf.mathVirtualKeyboardPolicy = 'manual';
  mf.menuItems = [];
  mf.readOnly = !!o.readOnly;
  mf.macros = { ...mf.macros, ...MACROS };
  const shortcuts = { ...mf.inlineShortcuts };
  for (const k of ['dx', 'dy', 'dt']) delete shortcuts[k];
  mf.inlineShortcuts = shortcuts;
  mf.onInlineShortcut = differential;

  function injectShadowCSS() {
    const sr = mf.shadowRoot;
    if (!sr || sr.getElementById('inkmath-css')) return;
    const st = document.createElement('style');
    st.id = 'inkmath-css'; st.textContent = SHADOW_CSS; sr.appendChild(st);
  }

  let raf = 0;
  const update = () => {
    injectShadowCSS();
    draw(mf.shadowRoot && mf.shadowRoot.querySelector('.ML__content'), wrap, overlay, glyphs, getComputedStyle(mf).color, style);
    emitContext();
  };
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };

  // Word order inside a big-operator template: lower limit -> upper limit -> body (MathLive's own order is upper first)
  let opSession = null;
  let pendingFont = null;
  let latexBuf = null;

  function insertPre(tpl) {
    mf.executeCommand(['complete', 'reject']);
    mf.insert(tpl, { selectionMode: tpl.includes('#?') ? 'placeholder' : 'after', format: 'latex' });
    opSession = null;
    if (/_\{#\?\}\^\{#\?\}/.test(tpl)) { mf.executeCommand('moveToOpposite'); opSession = { stage: 'lower', upper: true }; }
    else if (/_\{#\?\}/.test(tpl)) opSession = { stage: 'lower', upper: false };
    schedule();
  }

  // Tab: template order first, then next placeholder, otherwise leave the current sub/superscript or fraction
  mf.addEventListener('keydown', (e) => {
    if (e.key === '\\' && mf.mode !== 'latex') latexBuf = '\\';
    else if (mf.mode === 'latex' && latexBuf !== null) {
      if (e.key === ' ' || e.key === 'Enter') {
        const tpl = PRE[latexBuf]; latexBuf = null;
        if (tpl) { e.preventDefault(); e.stopPropagation(); insertPre(tpl); return; }
      } else if (e.key === 'Backspace') latexBuf = latexBuf.length > 1 ? latexBuf.slice(0, -1) : null;
      else if (e.key.length === 1) latexBuf += e.key;
      else if (e.key === 'Escape') latexBuf = null;
    }
    if (pendingFont && e.key.length === 1 && /[A-Za-z]/.test(e.key) && !e.ctrlKey && !e.metaKey && mf.mode !== 'latex') {
      e.preventDefault(); e.stopPropagation();
      const cmd = pendingFont; pendingFont = null;
      mf.insert(`${cmd}{${e.key}}`, { format: 'latex' });
      return;
    }
    if (e.key !== 'Tab') { if (/^Arrow|Escape/.test(e.key)) opSession = null; return; }
    if (mf.mode === 'latex') return;
    if (opSession && !e.shiftKey) {
      e.preventDefault(); e.stopPropagation();
      if (opSession.stage === 'lower' && opSession.upper) { mf.executeCommand('moveToOpposite'); opSession.stage = 'upper'; }
      else { mf.executeCommand('moveAfterParent'); mf.executeCommand('moveToNextPlaceholder'); opSession = null; }
      return;
    }
    e.preventDefault(); e.stopPropagation();
    try { if (e.shiftKey) mf.executeCommand('moveBeforeParent'); else tabStep(); } catch (err) { console.error('inkmath tabStep', err); }
  }, true);

  // Tab leaves the innermost structure, Word-style: numerator -> denominator, matrix cell -> next cell,
  // empty subscript of x_□^□ -> its superscript, anything else -> just after the structure.
  // Uses MathLive's internal model (atom.parent / atom.parentBranch).
  function tabStep() {
    const model = mf._mathfield && mf._mathfield.model;
    if (!model) { mf.executeCommand('moveAfterParent'); return; }
    const at = (i) => model.at(i);
    const pos = mf.position, cur = at(pos), par = cur.parent, br = cur.parentBranch;
    // top level: next placeholder if any (MathLive's command would otherwise move focus out of the field)
    if (!par || par.type === 'root') {
      if (/placeholder|#\?/.test(mf.getValue(pos, mf.lastOffset, 'latex'))) mf.executeCommand('moveToNextPlaceholder');
      return;
    }
    const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    // offsets belonging to branch `want` of `par`
    const branchOffsets = (want) => {
      const out = [];
      for (let i = 0; i <= mf.lastOffset; i++) { const a = at(i); if (a.parent === par && same(a.parentBranch, want)) out.push(i); }
      return out;
    };
    // go into a branch: select its placeholder if it's empty, else put the caret at its end
    const enter = (want) => {
      const offs = branchOffsets(want);
      if (!offs.length) return false;
      const first = offs[0], last = offs[offs.length - 1];
      if (at(first + 1) && at(first + 1).type === 'placeholder' && at(first + 1).parent === par) mf.selection = { ranges: [[first, first + 1]] };
      else mf.position = last;
      return true;
    };
    if (br === 'above' && enter('below')) return;
    if (Array.isArray(br)) {
      // next cell in reading order
      const cells = [];
      for (let i = 0; i <= mf.lastOffset; i++) { const a = at(i); if (a.parent === par && Array.isArray(a.parentBranch) && !cells.some((c) => same(c, a.parentBranch))) cells.push(a.parentBranch); }
      cells.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      const k = cells.findIndex((c) => same(c, br));
      if (k >= 0 && k + 1 < cells.length && enter(cells[k + 1])) return;
    }
    if (br === 'subscript') {
      const sup = branchOffsets('superscript');
      if (sup.length && at(sup[0] + 1) && at(sup[0] + 1).type === 'placeholder' && enter('superscript')) return;
    }
    mf.position = model.offsetOf(par);
  }

  // ribbon: insert a template at the caret; the selection (if any) goes into #@
  function insertTemplate(tpl) {
    mf.focus();
    const [a, b] = mf.selection.ranges[0];
    const t = a === b ? tpl.replace(/#@/g, '#?') : tpl;
    mf.insert(t, { selectionMode: 'placeholder', format: 'latex' });
    // big operator with both limits: Word order (lower first)
    opSession = null;
    if (/^\\[a-z]+_\{#\?\}\^\{#\?\}/.test(t)) { mf.executeCommand('moveToOpposite'); opSession = { stage: 'lower', upper: true }; }
    else if (/^\\[a-z]+_\{#\?\}/.test(t)) opSession = { stage: 'lower', upper: false };
    schedule();
    emitChange();
  }
  function command(cmd) { mf.focus(); mf.executeCommand(cmd); schedule(); emitChange(); }
  // 'change' fires for typing, toolbar inserts and commands, once per actual change; not for setValue()
  let lastValue = '';
  function emitChange() {
    const v = mf.value;
    if (v === lastValue) return;
    lastValue = v;
    for (const fn of listeners.change) fn(v);
  }
  // a template or symbol as button markup, in the current handwriting font
  const renderIcon = (latex) =>
    `<span class="inkmath-icon" style="--hw-font:'inkmath-${fontId}'">${convertLatexToMarkup(preview(latex), { macros: MACROS })}</span>`;

  mf.addEventListener('input', (e) => {
    // a font command typed in LaTeX mode with no argument
    const d = e.data || '';
    if (FONT_CMDS.includes(d.trim())) pendingFont = d.trim();
    schedule();
    emitChange();
  });
  mf.addEventListener('selection-change', schedule);
  mf.addEventListener('pointerdown', () => { opSession = null; pendingFont = null; });
  mf.addEventListener('focus', schedule); mf.addEventListener('blur', schedule);
  window.addEventListener('resize', schedule);
  const ro = new ResizeObserver(schedule);
  ro.observe(mf);

  let removeRibbon = () => {};
  // the built-in toolbar draws its buttons in the current font, so it is rebuilt when the font changes
  const buildToolbar = () => { removeRibbon(); if (tb) removeRibbon = buildRibbon(ribbonEl, editor, tb); };

  function setFont(id) {
    const changed = pickFont(fonts, id) !== fontId;
    fontId = pickFont(fonts, id);
    root.style.setProperty('--hw-font', fontVar(fontId));
    loadFont(fontId).then(schedule);
    if (changed) { buildToolbar(); for (const fn of listeners.font) fn(fontId); }
    schedule();
  }

  const editor = {
    element: root,
    mathfield: mf,
    fonts: fonts.map(({ id, label, greek }) => ({ id, label, greek })),
    getValue: () => mf.value,
    setValue(latex) { mf.value = latex; lastValue = mf.value; schedule(); },
    insert: insertTemplate,
    command,
    getContext,
    on,
    renderIcon,
    focus: () => mf.focus(),
    getFont: () => fontId,
    setFont,
    setStyle(s) {
      for (const k of ['thickness', 'roughness', 'seed']) if (s && s[k] !== undefined) style[k] = +s[k];
      schedule();
    },
    getStyle: () => ({ ...style }),
    reseed() { style.seed++; schedule(); },
    redraw: update,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
      removeRibbon();
      for (const set of Object.values(listeners)) set.clear();
      if (ribbonHost) ribbonHost.remove();
      root.remove();
    },
  };

  mf.value = o.value;
  lastValue = mf.value;
  root.style.setProperty('--hw-font', fontVar(fontId));
  await customElements.whenDefined('math-field');
  await loadFont(fontId);
  await document.fonts.ready;
  buildToolbar();
  injectShadowCSS();
  update();
  return editor;
}

/**
 * Render `latex` into `target` in handwriting, without an editor.
 * Options: font, display, thickness, roughness, seed, assetsUrl, fonts.
 */
export async function renderLatex(target, latex, options = {}) {
  const o = { font: 'caveat', display: false, thickness: 0.06, roughness: 1, seed: 0, assetsUrl: DEFAULT_ASSETS, fonts: [], ...given(options) };
  const { base, glyphs, fonts } = await loadAssets(o.assetsUrl, o.fonts);
  MathfieldElement.fontsDirectory = base + 'mathlive-fonts';
  const fontId = pickFont(fonts, o.font);
  const style = { thickness: o.thickness, roughness: o.roughness, seed: o.seed };

  const host = document.createElement('span');
  host.className = 'inkmath-static' + (o.display ? ' inkmath-display' : '');
  host.style.setProperty('--hw-font', fontVar(fontId));
  const math = document.createElement('span'); math.className = 'inkmath-static-math';
  math.innerHTML = convertLatexToMarkup(latex, { macros: MACROS, defaultMode: o.display ? 'math' : 'inline-math' });
  const svg = overlaySVG();
  host.append(math, svg);
  target.replaceChildren(host);

  const redraw = () => draw(math, host, svg, glyphs, getComputedStyle(host).color, style);
  await loadFont(fontId);
  await document.fonts.ready;
  redraw();
  const ro = new ResizeObserver(redraw);
  ro.observe(host);
  return { element: host, redraw, destroy() { ro.disconnect(); host.remove(); } };
}

/** The fonts available from `assetsUrl` (bundled ones plus `extra`). */
export async function listFonts({ assetsUrl = DEFAULT_ASSETS, fonts = [] } = {}) {
  return (await loadAssets(assetsUrl, fonts)).fonts.map(({ id, label, greek }) => ({ id, label, greek }));
}
