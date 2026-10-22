// Handwriting renderer: reads the layout MathLive produced (static markup or a live <math-field>'s shadow DOM),
// measures the ink box of every glyph, frac line and radical, and draws a handwritten sample (glyphs.json) into it.

const SKIP = '.ML__placeholder, .ML__caret, .ML__text-caret, .ML__latex-caret, .ML__selection, .ML__keyboard-toggle, .ML__virtual-keyboard-toggle, .ML__menu-toggle, .ML__prompt';
let ctx = null;   // created on first use

export async function loadGlyphs(url) {
  return (await fetch(url)).json();
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// ink box of one character: Range gives the em box, canvas metrics give the ink inside it
function charBox(node, i, el) {
  const r = document.createRange();
  r.setStart(node, i); r.setEnd(node, i + 1);
  const rect = r.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  const cs = getComputedStyle(el);
  ctx = ctx || document.createElement('canvas').getContext('2d');
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText(node.data[i]);
  const fh = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
  const k = fh > 0 ? rect.height / fh : 1;
  const base = rect.top + m.fontBoundingBoxAscent * k;
  return {
    x0: rect.left - m.actualBoundingBoxLeft * k, x1: rect.left + m.actualBoundingBoxRight * k,
    y0: base - m.actualBoundingBoxAscent * k, y1: base + m.actualBoundingBoxDescent * k,
    em: parseFloat(cs.fontSize), base,
    // the slot the character takes in the line (the ink box above is from canvas metrics, which miss font-size-adjust)
    left: rect.left, right: rect.right,
  };
}

// parts the handwriting font can't do well (big operators, radicals, blackboard bold, stretched delimiters):
// these are drawn as strokes; everything else is left to the font when strokeSel is given
export const STROKE_PARTS = '.ML__bb, .ML__large-op, .ML__sqrt-sign, [class*="ML__delim-size"], .ML__delim-mult';
const MULT = { '⎛': '(', '⎝': '(', '⎜': '(', '⎞': ')', '⎠': ')', '⎟': ')', '⎡': '[', '⎣': '[', '⎢': '[', '⎤': ']', '⎦': ']', '⎥': ']', '⎧': '{', '⎨': '{', '⎩': '{', '⎪': '{', '⎫': '}', '⎬': '}', '⎭': '}', '∣': '|', '∥': '‖' };

// arrows drawn as pen strokes instead of font glyphs: heads 'end' | 'start' | 'both', double shaft, mapsto bar, direction
const ARROW_CH = {
  '→': { heads: 'end' }, '⟶': { heads: 'end' }, '←': { heads: 'start' }, '⟵': { heads: 'start' },
  '↔': { heads: 'both' }, '⟷': { heads: 'both' },
  '⇒': { heads: 'end', double: true }, '⟹': { heads: 'end', double: true }, '⇐': { heads: 'start', double: true },
  '⟸': { heads: 'start', double: true }, '⇔': { heads: 'both', double: true }, '⟺': { heads: 'both', double: true },
  '↦': { heads: 'end', bar: true }, '⟼': { heads: 'end', bar: true },
  '↑': { heads: 'end', dir: 'up' }, '↓': { heads: 'end', dir: 'down' }, '↗': { heads: 'end', dir: 'ne' }, '↘': { heads: 'end', dir: 'se' },
  '⃗': { heads: 'end', accent: true },   // \vec
};
// characters the fonts draw too neatly: hidden and drawn as pen strokes
// polylines in the glyph's ink box (0..1, y down); one point is a pen dot. Corners are rounded when drawn
const SHAPES = {
  '∀': [[[0, 0], [0.5, 1], [1, 0]], [[0.2, 0.52], [0.82, 0.52]]],
  '∃': [[[0.04, 0], [1, 0], [1, 1], [0.04, 1]], [[0.14, 0.5], [1, 0.5]]],
  '∄': [[[0.04, 0], [1, 0], [1, 1], [0.04, 1]], [[0.14, 0.5], [1, 0.5]], [[0.12, 1.12], [0.9, -0.12]]],
  '¬': [[[0, 0.15], [1, 0.15], [1, 0.8]]],
  '∧': [[[0, 1], [0.5, 0], [1, 1]]],
  '∨': [[[0, 0], [0.5, 1], [1, 0]]],
  '∵': [[[0.12, 0.15]], [[0.88, 0.15]], [[0.5, 0.85]]],
  '∴': [[[0.5, 0.15]], [[0.12, 0.85]], [[0.88, 0.85]]],
  // lowercase π: MathWriting's samples are written like Π, so it is drawn here, x-height tall: the bar starts with a
  // small hook and overhangs both legs, the left leg sweeps out to the left, the right one ends in a curl
  'π': [[[0.06, 0.2], [0.12, 0.06], [0.5, 0.04], [1, 0]], [[0.33, 0.06], [0.31, 0.55], [0.23, 0.88], [0.13, 1]], [[0.69, 0.05], [0.67, 0.62], [0.72, 0.93], [0.84, 1], [0.96, 0.92]]],
  // ℓ: a cursive l, one stroke up into a narrow loop and down to a small hook (no font has it in handwriting)
  'ℓ': [[[0.04, 0.8], [0.5, 0.42], [0.86, 0.12], [0.78, 0.0], [0.56, 0.05], [0.34, 0.42], [0.26, 0.82], [0.44, 1], [0.92, 0.86]]],
};
// size of each shape in em (fallback fonts draw them too large): height, width, and whether it stands on the
// baseline or is centred on the math axis
const SHAPE_BOX = {
  '∀': [0.68, 0.56, 'base'], '∃': [0.68, 0.46, 'base'], '∄': [0.68, 0.46, 'base'], '¬': [0.28, 0.55, 'axis'],
  '∧': [0.55, 0.56, 'axis'], '∨': [0.55, 0.56, 'axis'], '∵': [0.5, 0.56, 'base'], '∴': [0.5, 0.56, 'base'],
  'π': [0.46, 0.5, 'base'], 'ℓ': [0.72, 0.4, 'base'],
};
const PEN_CH = new Set(['∞', ...Object.keys(SHAPES)]);
// Greek, ∇ and ℏ: no handwriting font covers them well, so letters come from the (curated) MathWriting samples
const SAMPLE_CH = new Set([...'αβγδεϵζηθϑικλμνξρσςτυφϕχψωϖΓΔΘΛΞΠΣΥΦΨΩ∇ℏ']);
const OWN_CH = (c) => ARROW_CH[c] || PEN_CH.has(c) || SAMPLE_CH.has(c);
// MathLive's stretchy arrows (\xrightarrow, \overrightarrow, \longrightarrow ...) are SVG slices; recognised by path start
const SLICES = [['M0 241v40h399891', 'end'], ['M400000 241H110', 'start'], ['M399738 392', 'end2'], ['M262 157', 'start2'], ['M40 281 V448H0V74H40V2', 'bar']];

function arrowEnds(spec, b) {
  const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  switch (spec.dir) {
    case 'up': return [[cx, b.y1], [cx, b.y0]];
    case 'down': return [[cx, b.y0], [cx, b.y1]];
    case 'ne': return [[b.x0, b.y1], [b.x1, b.y0]];
    case 'se': return [[b.x0, b.y0], [b.x1, b.y1]];
    default: return [[b.x0, cy], [b.x1, cy]];
  }
}

function stretchyArrows(root, items) {
  const groups = new Set();
  root.querySelectorAll('[class^="slice-"]').forEach((s) => { if (!s.closest(SKIP)) groups.add(s.parentElement); });
  for (const g of groups) {
    const kinds = [];
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const s of g.querySelectorAll(':scope > [class^="slice-"]')) {
      const d = (s.querySelector('path') || {}).getAttribute?.('d') || '';
      const k = SLICES.find(([p]) => d.startsWith(p));
      if (!k) { kinds.length = 0; break; }   // braces, hooks, harpoons: leave MathLive's drawing alone
      kinds.push(k[1]);
      const r = s.getBoundingClientRect();
      x0 = Math.min(x0, r.left); x1 = Math.max(x1, r.right); y0 = Math.min(y0, r.top); y1 = Math.max(y1, r.bottom);
    }
    if (!kinds.length || !kinds.some((k) => k !== 'bar') || x1 - x0 < 1) continue;
    const end = kinds.some((k) => k.startsWith('end')), start = kinds.some((k) => k.startsWith('start'));
    const spec = { heads: end && start ? 'both' : end ? 'end' : 'start', double: kinds.some((k) => k.endsWith('2')), bar: kinds.includes('bar') };
    g.style.color = 'transparent';
    const em = parseFloat(getComputedStyle(g).fontSize) || (y1 - y0) * 2;
    items.push({ arrow: spec, ends: arrowEnds(spec, { x0, x1, y0, y1 }), em });
  }
}

// collect drawable items {key, box, em}; arrows found here are hidden in the markup (drawn by the overlay instead)
export function measure(root, { strokeSel = null } = {}) {
  const items = [];
  stretchyArrows(root, items);
  // an arrow or ∞ sharing a text node with other characters (\lim_{n\to\infty} gives "→∞") gets its own span,
  // so it can be hidden alone
  const mixed = [];
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) if (n.data.trim().length > 1 && [...n.data].some(OWN_CH)) mixed.push(n);
  for (const n of mixed) {
    for (let i = n.data.length - 1; i >= 0; i--) {
      if (!OWN_CH(n.data[i])) continue;
      const r = document.createRange();
      r.setStart(n, i); r.setEnd(n, i + 1);
      r.surroundContents(document.createElement('span'));
    }
  }
  // tall delimiters stacked from pieces: one stretched sample over the whole stack
  root.querySelectorAll('.ML__delim-mult').forEach((el) => {
    if (el.closest(SKIP)) return;
    const r = el.getBoundingClientRect();
    const k = MULT[el.textContent.trim()[0]] || '(';
    items.push({ key: k, ch: k, box: { x0: r.left, x1: r.right, y0: r.top, y1: r.bottom }, em: r.width * 2.5 });
  });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || el.closest(SKIP) || el.closest('.ML__vlist-s') || el.closest('.ML__delim-mult')) continue;
    const t = n.data.trim();
    if (t.length === 1 && ARROW_CH[t] && el.textContent.trim() === t) {
      const b = charBox(n, n.data.indexOf(t), el);
      if (!b || b.x1 - b.x0 <= 0) continue;
      el.style.color = 'transparent';
      const spec = ARROW_CH[t];
      let ends = arrowEnds(spec, b);
      // horizontal arrows sit on the math axis (like fraction bars), slightly inside the fallback glyph's ink
      if (!spec.dir && !spec.accent) {
        const y = b.base - 0.25 * b.em, ins = 0.05 * (b.x1 - b.x0);
        ends = [[b.x0 + ins, y], [b.x1 - ins, y]];
      }
      items.push({ arrow: spec, ends, em: b.em });
      continue;
    }
    if (t.length === 1 && SAMPLE_CH.has(t) && el.textContent.trim() === t) {
      const b = charBox(n, n.data.indexOf(t), el);
      if (!b || b.x1 - b.x0 <= 0) continue;
      el.style.color = 'transparent';
      items.push({ key: t, ch: t, box: b, em: b.em });
      continue;
    }
    if (t.length === 1 && PEN_CH.has(t) && el.textContent.trim() === t) {
      const b = charBox(n, n.data.indexOf(t), el);
      if (!b || b.x1 - b.x0 <= 0) continue;
      el.style.color = 'transparent';
      // ∞ is centred on the math axis, like a typeset one (the fallback font's ∞ sits high); shapes get their own size,
      // centred in the character's slot and no wider than it, so they never reach into a neighbour
      const axis = b.base - 0.25 * b.em;
      let box = b;
      if (t === '∞') box = { ...b, y0: axis - (b.y1 - b.y0) / 2, y1: axis + (b.y1 - b.y0) / 2 };
      else {
        // π sits a little right of centre: the slanted handwriting letters before it lean into its slot
        const cx = (b.left + b.right) / 2 + (t === 'π' ? 0.06 * b.em : 0);
        const [h, w, anchor] = SHAPE_BOX[t], H = h * b.em, W = Math.min(w * b.em, (t === 'π' ? 0.8 : 0.92) * (b.right - b.left));
        const y1 = anchor === 'base' ? b.base : axis + H / 2;
        box = { ...b, x0: cx - W / 2, x1: cx + W / 2, y0: y1 - H, y1 };
      }
      items.push({ pen: t, box, em: b.em });
      continue;
    }
    if (strokeSel && !el.closest(strokeSel)) continue;
    if (el.closest('.ML__sqrt-sign')) continue;   // radicals are drawn whole, below
    const bb = el.closest('.ML__bb, .ML__mathbb') ? '#bb_' : '';
    for (let i = 0; i < n.data.length; i++) {
      const ch = n.data[i];
      if (/\s|​/.test(ch)) continue;
      const b = charBox(n, i, el);
      if (!b || b.x1 - b.x0 <= 0) continue;
      items.push({ key: bb + ch, ch, box: b, em: b.em });
    }
  }
  // radicals: the sign and its vinculum become one item, drawn as a single continuous stroke
  root.querySelectorAll('.ML__sqrt-sign').forEach((el) => {
    if (el.closest(SKIP)) return;
    const s = el.getBoundingClientRect();
    // its own vinculum is the highest .ML__sqrt-line next to it (nested radicals sit lower)
    let line = null;
    el.parentElement.querySelectorAll('.ML__sqrt-line').forEach((l) => {
      const r = l.getBoundingClientRect();
      if (r.width >= 1 && (!line || r.top < line.top)) line = r;
    });
    if (!line) return;
    const em = parseFloat(getComputedStyle(el).fontSize) || s.height;
    items.push({ radical: true, sign: { x0: s.left, x1: s.right, y1: s.bottom }, line: { x1: line.right, y: (line.top + line.bottom) / 2 }, em });
  });
  // fraction lines, over/underlines
  root.querySelectorAll('.ML__frac-line, .ML__overline-line, .ML__underline-line').forEach((el) => {
    if (el.closest(SKIP)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1) return;
    const cy = (r.top + r.bottom) / 2;
    items.push({ key: '#bar', box: { x0: r.left, x1: r.right, y0: cy, y1: cy }, em: parseFloat(getComputedStyle(el).fontSize) || 20, bar: true, vinc: el.classList.contains('ML__sqrt-line') });
  });
  return items;
}

function smoothPath(pts) {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]}L${pts[1][0]},${pts[1][1]}`;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return d + `L${l[0].toFixed(1)},${l[1].toFixed(1)}`;
}

// handwritten double-struck letter: the tallest stroke's left part (the stem, or the left arc of C, O, G)
// drawn a second time a little to the right
function doubleStem(sample) {
  let best = null, bestH = -1;
  for (const s of sample.s) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 1; i < s.length; i += 2) { lo = Math.min(lo, s[i]); hi = Math.max(hi, s[i]); }
    if (hi - lo > bestH) { bestH = hi - lo; best = s; }
  }
  if (!best || best.length < 4) return sample;
  let minx = Infinity, maxx = -Infinity;
  for (let i = 0; i < best.length; i += 2) { minx = Math.min(minx, best[i]); maxx = Math.max(maxx, best[i]); }
  const lim = minx + 0.35 * (maxx - minx) + 0.02;
  // longest run of consecutive points on the left side
  let run = [], cur = [];
  for (let i = 0; i < best.length; i += 2) {
    if (best[i] <= lim) cur.push(best[i] + 0.13, best[i + 1]);
    else { if (cur.length > run.length) run = cur; cur = []; }
  }
  if (cur.length > run.length) run = cur;
  return run.length >= 4 ? { a: sample.a, s: [...sample.s, run] } : sample;
}

// place a normalised sample into the target box; keep part of the writer's own aspect ratio
function place(sample, box, opt) {
  let { x0, x1, y0, y1 } = box;
  let w = Math.max(x1 - x0, 0.5), h = Math.max(y1 - y0, 0.5);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const at = w / h, as = sample.a;
  if (opt.flat) {
    h = Math.min(Math.max(h, w / Math.max(as, 1)), w * 0.15);
  } else if (at < 4 && at > 0.25) {
    const a = Math.exp(0.6 * Math.log(at) + 0.4 * Math.log(as));
    if (a > at) h = w / a; else w = h * a;
  }
  const out = [];
  for (const s of sample.s) {
    const pts = [];
    for (let i = 0; i < s.length; i += 2) pts.push([cx + (s[i] - 0.5) * w, cy + (s[i + 1] - 0.5) * h]);
    if (pts.length === 1) pts.push([pts[0][0] + 0.3, pts[0][1] + 0.3]);
    out.push(pts);
  }
  return out;
}

// items -> SVG path data (in coords relative to origin)
export function render(items, glyphs, { seed = 0, ox = 0, oy = 0, width = 0.075 } = {}) {
  const paths = [], missing = new Set();
  const count = {};
  for (const it of items) {
    if (it.radical) {
      // one stroke: small lead-in tick, down to the foot, long rise to the vinculum, then across the radicand
      const { sign: s, line: l } = it;
      const x0 = s.x0 - ox, x1 = s.x1 - ox, yb = s.y1 - oy, yt = l.y - oy, xe = l.x1 - ox;
      const H = yb - yt, e = it.em;
      // the lead-in tick keeps its size on tall radicals; only the long rise stretches
      const tickH = 0.36 * Math.min(H, 1.1 * e), foot = Math.min(x0 + 0.34 * e, x1 - 0.12 * e);
      const pts = [
        [x0 + 0.02 * e, yb - 0.62 * tickH],
        [x0 + 0.13 * e, yb - tickH],
        [foot, yb - 0.01 * e],
        [x1 - 0.02 * e, yt],
        [xe + 0.06 * e, yt - 0.012 * (xe - x1)],
      ];
      paths.push({ pts, radii: [0.035 * e, 0.025 * e, 0.07 * e], hand: true, kind: 'radical', em: e, w: Math.max(1, width * e), id: `r${count.r = (count.r || 0) + 1}` });
      continue;
    }
    if (it.pen) {
      const e = it.em || 20, b = it.box;
      paths.push({ hand: true, kind: it.pen === '∞' ? 'infty' : 'shape', ch: it.pen, box: { x0: b.x0 - ox, x1: b.x1 - ox, y0: b.y0 - oy, y1: b.y1 - oy }, em: e, w: Math.max(1, width * e), id: `i${count.i = (count.i || 0) + 1}` });
      continue;
    }
    if (it.arrow) {
      const e = it.em || 20;
      const ends = it.ends.map(([x, y]) => [x - ox, y - oy]);
      paths.push({ hand: true, kind: 'arrow', spec: it.arrow, ends, em: e, w: Math.max(1, width * e), id: `a${count.a = (count.a || 0) + 1}` });
      continue;
    }
    const k = it.key;
    // blackboard letters without samples of their own: the plain letter with its main stem doubled
    let bank = glyphs[k], synth = false;
    if (!bank && k.startsWith('#bb_')) { bank = glyphs[k.slice(4)]; synth = true; }
    let box = { x0: it.box.x0 - ox, x1: it.box.x1 - ox, y0: it.box.y0 - oy, y1: it.box.y1 - oy };
    // samples fill their whole ink box, unlike a font's letters; blackboard and Greek letters are narrowed
    // so neighbours don't run into each other
    if (k.startsWith('#bb_') || SAMPLE_CH.has(k)) {
      const c = (box.x0 + box.x1) / 2, hw = 0.34 * (box.x1 - box.x0);
      box = { ...box, x0: c - hw, x1: c + hw };
    }
    const em = it.em || 20;
    if (it.bar) {
      paths.push({ hand: true, kind: 'bar', pts: [[box.x0, box.y0], [box.x1, box.y0]], em, w: Math.max(1, width * em), id: `b${count.b = (count.b || 0) + 1}` });
      continue;
    }
    if (!bank || !bank.length) { missing.add(it.ch || k); paths.push({ text: it.ch, box }); continue; }
    const n = (count[k] = (count[k] || 0) + 1);
    let sample = bank[hash(`${seed}|${k}|${n}`) % bank.length];
    if (synth) sample = doubleStem(sample);
    const flat = /^[−\-=_~¯]$/.test(it.ch || '') || ((box.y1 - box.y0) < 0.12 * em);
    for (const pts of place(sample, box, { flat })) paths.push({ d: smoothPath(pts), w: Math.max(1, width * em) });
  }
  // bars, radicals and arrows take the median glyph stroke width around them
  const ws = paths.filter((p) => p.d).map((p) => p.w).sort((a, b) => a - b);
  if (ws.length) for (const p of paths) if (p.hand) p.w = ws[ws.length >> 1];
  return { paths, missing: [...missing] };
}

function rng(seed) {   // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// polyline with rounded inner corners, sampled densely
function roundedPolyline(pts, radii) {
  const out = [pts[0]];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const isCorner = i < pts.length - 1;
    const r = isCorner ? (radii[i - 1] || 0) : 0;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const c = pts[i + 1];
    const tEnd = isCorner ? Math.max(0, 1 - Math.min(r, 0.45 * len) / len) : 1;
    const n = Math.max(2, Math.ceil(len / 3));
    for (let k = 1; k <= n; k++) out.push(lerp(a, b, (k / n) * tEnd));
    if (isCorner) {
      const len2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1;
      const q0 = out[out.length - 1], q2 = lerp(b, c, Math.min(r, 0.45 * len2) / len2);
      for (let k = 1; k <= 6; k++) {
        const t = k / 6, u = 1 - t;
        out.push([u * u * q0[0] + 2 * u * t * b[0] + t * t * q2[0], u * u * q0[1] + 2 * u * t * b[1] + t * t * q2[1]]);
      }
      pts = pts.slice(); pts[i] = q2;   // next segment starts after the rounded corner
    }
  }
  return out;
}

// low-frequency wobble along the normal: a hand-drawn line, not a jagged one
function wobble(pts, amp, rand) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[L.length - 1] || 1;
  const f1 = 0.7 + rand() * 0.8, f2 = 1.8 + rand() * 1.5, p1 = rand() * 6.28, p2 = rand() * 6.28;
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    const s = L[i] / tot;
    const off = amp * (Math.sin(6.28 * f1 * s + p1) + 0.4 * Math.sin(6.28 * f2 * s + p2));
    return [p[0] - (dy / n) * off, p[1] + (dx / n) * off];
  });
}

function radicalPaths(p, roughness, seed) {
  const base = roundedPolyline(p.pts, p.radii);
  if (roughness <= 0) return [{ d: smoothPath(base), w: p.w }];
  const rand = rng(1 + (hash(`${seed}|${p.id}`) % 2147483646));
  const amp = 0.012 * p.em * roughness;
  const out = [{ d: smoothPath(wobble(base, amp, rand)), w: p.w }];
  return out;
}

const uniform = (rand, a, b) => a + (b - a) * rand();

// a pen line from a to b: slight bow and low-frequency wobble, sampled densely
function handLine(a, b, e, rand, k) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
  const n = Math.max(8, Math.ceil(L / 3));
  const bow = k * uniform(rand, -1, 1) * Math.min(0.016 * L, 0.06 * e);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, off = bow * 4 * t * (1 - t);
    pts.push([a[0] + ux * L * t - uy * off, a[1] + uy * L * t + ux * off]);
  }
  return k > 0 ? wobble(pts, 0.006 * e * k, rand) : pts;
}

// pen pressure along a stroke: lands a little heavy, lifts off thin. k = 0 gives a uniform width
function pressure(t, k) {
  const land = 0.82 + 0.3 * Math.sin(Math.min(t / 0.12, 1) * Math.PI / 2);
  const lift = t > 0.7 ? 1 - 0.5 * Math.pow((t - 0.7) / 0.3, 1.4) : 1;
  return 1 + Math.min(k, 1) * (land * lift - 1);
}

// variable-width stroke as a filled outline with round caps
function outline(pts, w, k) {
  const L = [], left = [], right = [];
  for (let i = 0; i < pts.length; i++) L.push(i ? L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) : 0);
  const tot = L[L.length - 1] || 1;
  const dirAt = (i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    return [dx / n, dy / n];
  };
  const half = pts.map((_, i) => (w * pressure(L[i] / tot, k)) / 2);
  pts.forEach((p, i) => {
    const [ux, uy] = dirAt(i);
    left.push([p[0] - uy * half[i], p[1] + ux * half[i]]);
    right.push([p[0] + uy * half[i], p[1] - ux * half[i]]);
  });
  // semicircular caps: around the end from the left side to the right side, and back around the start
  const cap = (p, [ux, uy], r, sign) => {
    const out = [];
    for (let j = 1; j < 8; j++) {
      const th = (j / 8) * Math.PI, c = Math.cos(th), s = Math.sin(th);
      out.push([p[0] + sign * (-uy * r * c + ux * r * s), p[1] + sign * (ux * r * c + uy * r * s)]);
    }
    return out;
  };
  const last = pts.length - 1;
  const ring = [...left, ...cap(pts[last], dirAt(last), half[last], 1), ...right.reverse(), ...cap(pts[0], dirAt(0), half[0], -1)];
  return 'M' + ring.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('L') + 'Z';
}

// fraction bar / overline: rises a little to the right, starts and ends a bit off the exact width
function barPaths(p, k, rand) {
  const [[x0, y], [x1]] = p.pts, e = p.em, L = x1 - x0;
  if (k <= 0) return [{ d: `M${x0 - 0.02 * L},${y}L${x1 + 0.02 * L},${y}`, w: p.w }];
  const over0 = Math.min(L * uniform(rand, 0, 0.05), 0.12 * e) * Math.min(k, 1.5);
  const over1 = Math.min(L * uniform(rand, 0.01, 0.07), 0.16 * e) * Math.min(k, 1.5);
  const rise = Math.min(Math.tan(uniform(rand, 0.6, 2.4) * Math.PI / 180) * L / 2, 0.07 * e) * Math.min(k, 1.5);
  const pts = handLine([x0 - 0.02 * L - over0, y + rise], [x1 + over1, y - rise], e, rand, k);
  return [{ d: outline(pts, p.w, k), fill: true }];
}

// arrow: shaft(s) like a bar, each head one stroke folding back at the tip like '>'
function arrowPaths(p, k, rand) {
  const { spec, em: e, w } = p;
  let [S, E] = p.ends;
  const L = Math.hypot(E[0] - S[0], E[1] - S[1]) || 1;
  const ux = (E[0] - S[0]) / L, uy = (E[1] - S[1]) / L, nx = -uy, ny = ux;
  const kk = Math.min(k, 1.5);
  const at = (P, du, dn) => [P[0] + ux * du + nx * dn, P[1] + uy * du + ny * dn];
  const out = [];
  const stroke = (pts) => out.push(k > 0 ? { d: outline(pts, w, k * 0.6), fill: true } : { d: smoothPath(pts), w });
  // horizontal arrows rise a little to the right, like the bars
  if (Math.abs(ux) > 0.9 && k > 0 && !spec.accent) {
    const rise = Math.min(0.025 * L, 0.04 * e) * uniform(rand, 0.3, 1) * kk;
    S = [S[0], S[1] + rise]; E = [E[0], E[1] - rise];
  }
  const gap = spec.double ? 0.2 * e : 0;
  const size = (spec.accent ? 0.22 : spec.double ? 0.36 : 0.3) * e;
  const h = Math.min(size, 0.45 * L);
  const phi = (spec.double ? 42 : 30) * Math.PI / 180;
  const heads = spec.heads === 'both' ? [1, -1] : spec.heads === 'start' ? [-1] : [1];
  // shafts: a double shaft stops where it meets the head's barbs
  const inset = gap ? (gap / 2) / Math.tan(phi) : 0;
  const s0 = heads.includes(-1) ? inset : 0, s1 = heads.includes(1) ? inset : 0;
  for (const off of gap ? [-gap / 2, gap / 2] : [0]) {
    const a = at(S, s0 + (k > 0 ? uniform(rand, -0.02, 0.03) * e : 0), off);
    const b = at(S, L - s1 + (k > 0 ? uniform(rand, -0.03, 0.02) * e * kk : 0), off);
    stroke(handLine(a, b, e, rand, k * 0.8));
  }
  for (const dirn of heads) {
    const tip = dirn > 0 ? at(S, L + (k > 0 ? uniform(rand, 0, 0.03) * e : 0), 0) : S;
    const barb = (side) => {
      const ang = phi + (k > 0 ? uniform(rand, -5, 5) * Math.PI / 180 * kk : 0);
      const len = h * (k > 0 ? uniform(rand, 0.85, 1.1) : 1) + (gap ? gap / 2 / Math.sin(phi) * 0.4 : 0);
      return at(tip, -dirn * len * Math.cos(ang), side * len * Math.sin(ang));
    };
    const pts = roundedPolyline([barb(-1), tip, barb(1)], [0.035 * e]);
    stroke(k > 0 ? wobble(pts, 0.005 * e * k, rand) : pts);
  }
  if (spec.bar) {
    const r = 0.22 * e;
    const a = at(S, k > 0 ? uniform(rand, -0.02, 0.02) * e : 0, -r), b = at(S, 0, r);
    stroke(handLine(a, b, e, rand, k * 0.6));
  }
  return out;
}

// ∞ in one stroke (lemniscate of Gerono): from the crossing up into the right loop, through the crossing, round the
// left loop and a little past the crossing again. Loops differ in size, the whole sign leans, the end overshoots
function inftyPaths(p, k, rand) {
  const { x0, x1, y0, y1 } = p.box, e = p.em;
  // written ∞ is flatter than the fonts' and a little narrower, which keeps it off its neighbours
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, A = 0.9 * (x1 - x0) / 2, B = Math.min((y1 - y0) / 2, 0.4 * A);
  const kk = Math.min(k, 1.5);
  const jit = (a, b) => (k > 0 ? uniform(rand, a, b) * kk : 0);
  const wR = 1 + jit(-0.1, 0.1), wL = 1 + jit(-0.12, 0.06), hR = 1 + jit(-0.15, 0.1), hL = 1 + jit(-0.1, 0.15);
  const tilt = jit(-5, 2) * Math.PI / 180, ct = Math.cos(tilt), st = Math.sin(tilt);
  const t0 = -Math.PI / 2 + jit(0, 0.15), t1 = 1.5 * Math.PI + (k > 0 ? uniform(rand, 0.08, 0.3) : 0);
  const n = 72, pts = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n;
    const x = Math.cos(t), y = Math.sin(2 * t);   // x in [-1, 1], y in [-1, 1]; crossing at x = 0
    const X = A * x * (x >= 0 ? wR : wL), Y = B * y * (x >= 0 ? hR : hL);
    pts.push([cx + X * ct - Y * st, cy + X * st + Y * ct]);
  }
  return [{ d: smoothPath(k > 0 ? wobble(pts, 0.008 * e * k, rand) : pts), w: p.w }];
}

// ¬ as written: the stroke rises a little to the right, turns down in a rounded corner and the short tick leans in
function negPoints(p, k, rand) {
  const { x0, x1, y0, y1 } = p.box, e = p.em, W = x1 - x0, H = y1 - y0, kk = Math.min(k, 1.5);
  const y = y0 + 0.15 * H, rise = Math.min(Math.tan(uniform(rand, 1, 3.5) * Math.PI / 180) * W, 0.05 * e) * kk;
  const a = [x0 + uniform(rand, -0.03, 0.04) * W, y + rise / 2];
  const c = [x1 + uniform(rand, -0.04, 0.02) * W, y - rise / 2];
  const end = [c[0] - uniform(rand, 0.03, 0.12) * W * kk, y0 + uniform(rand, 0.72, 0.92) * H];
  return roundedPolyline([a, c, end], [uniform(rand, 0.04, 0.07) * e]);
}

// ∀ ∃ ¬ ∧ ∨ ∵ ∴ π ℓ from SHAPES: points jittered inside the box, inner corners rounded, a little wobble, and the same pen
// pressure as the bars (heavier where the pen lands, thinner where it lifts); dots are tiny ticks
function shapePaths(p, k, rand) {
  const { x0, x1, y0, y1 } = p.box, e = p.em, W = x1 - x0, H = y1 - y0;
  const kk = Math.min(k, 1.5);
  const out = [];
  if (p.ch === '¬' && k > 0) return [{ d: outline(wobble(negPoints(p, k, rand), 0.005 * e * k, rand), p.w, k * 0.7), fill: true }];
  for (const line of SHAPES[p.ch]) {
    const pts = line.map(([u, v]) => [x0 + u * W + (k > 0 ? uniform(rand, -0.04, 0.04) * W * kk : 0), y0 + v * H + (k > 0 ? uniform(rand, -0.04, 0.04) * H * kk : 0)]);
    if (pts.length === 1) {
      const a = uniform(rand, 0, 2 * Math.PI), r = 0.025 * e;
      out.push({ d: `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}l${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`, w: p.w * 1.15 });
      continue;
    }
    const dense = roundedPolyline(pts, pts.slice(1, -1).map(() => 0.06 * e));
    out.push(k > 0 ? { d: outline(wobble(dense, 0.006 * e * k, rand), p.w, k * 0.6), fill: true } : { d: smoothPath(dense), w: p.w });
  }
  return out;
}

function handPaths(p, roughness, seed) {
  if (p.kind === 'radical') return radicalPaths(p, roughness, seed);
  const rand = rng(1 + (hash(`${seed}|${p.id}`) % 2147483646));
  if (p.kind === 'infty') return inftyPaths(p, roughness, rand);
  if (p.kind === 'shape') return shapePaths(p, roughness, rand);
  return p.kind === 'arrow' ? arrowPaths(p, roughness, rand) : barPaths(p, roughness, rand);
}

export function toSVG(svg, paths, color = '#1f2a44', { roughness = 1, seed = 0 } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  svg.replaceChildren();
  const expanded = [];
  for (const p of paths) {
    if (p.hand) for (const q of handPaths(p, roughness, seed)) expanded.push(q);
    else expanded.push(p);
  }
  for (const p of expanded) {
    if (p.text) {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', p.box.x0); t.setAttribute('y', p.box.y1);
      t.setAttribute('fill', '#c2410c'); t.setAttribute('font-size', Math.max(8, p.box.y1 - p.box.y0) * 1.2);
      t.textContent = p.text; svg.appendChild(t);
      continue;
    }
    const e = document.createElementNS(NS, 'path');
    e.setAttribute('d', p.d);
    if (p.fill) { e.setAttribute('fill', color); svg.appendChild(e); continue; }
    e.setAttribute('fill', 'none'); e.setAttribute('stroke', color);
    e.setAttribute('stroke-width', p.w.toFixed(2)); e.setAttribute('stroke-linecap', 'round'); e.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(e);
  }
}
