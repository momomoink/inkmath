// <ink-math> and <ink-math-toolbar>: the editor and its toolbar as HTML tags. Importing this file defines them.
//   <ink-math-toolbar></ink-math-toolbar>              one toolbar for the field that has focus
//   <ink-math value="x^2" toolbar="none"></ink-math>
import { createInkMath } from './index.js';
import { buildRibbon } from './ribbon.js';
import zh from './locales/zh.js';

const LOCALES = { zh };

// the <ink-math> the shared toolbars follow: the last one focused, else the first one on the page
const fields = new Set();
let active = null;
const followers = new Set();
function setActive(el) {
  if (active === el) return;
  active = el;
  for (const fn of followers) fn();
}

const num = (v) => (v === null || v === '' ? undefined : +v);

export class InkMathElement extends HTMLElement {
  static observedAttributes = ['value', 'font', 'thickness', 'roughness', 'seed'];

  /** Resolves to the editor (see createInkMath) once the field is drawn. */
  ready = null;
  /** The editor, once ready. */
  editor = null;
  /** Toolbar configuration for this field's own toolbar (set before the element is added to the page). */
  toolbarConfig = null;

  connectedCallback() {
    if (this.ready) return;
    this.ready = this.#mount();
  }

  async #mount() {
    const a = (n) => this.getAttribute(n);
    // the formula can be the element's text: <ink-math>\frac{a}{b}</ink-math>
    const value = a('value') ?? this.textContent.trim();
    this.textContent = '';
    const own = a('toolbar') === 'none' ? false : this.toolbarConfig || LOCALES[a('locale')] || true;
    const editor = await createInkMath(this, {
      value,
      font: a('font') || undefined,
      thickness: num(a('thickness')),
      roughness: num(a('roughness')),
      seed: num(a('seed')),
      readOnly: this.hasAttribute('readonly'),
      assetsUrl: a('assets-url') || undefined,
      toolbar: own,
      onChange: (latex) => this.dispatchEvent(new CustomEvent('change', { detail: { value: latex }, bubbles: true })),
    });
    if (!this.isConnected) { editor.destroy(); return null; }
    this.editor = editor;
    fields.add(this);
    // pointerdown too: MathLive moves focus a moment after the click, and a quick toolbar click must not go to the old field
    this.addEventListener('focusin', this.#onFocus);
    this.addEventListener('pointerdown', this.#onFocus);
    if (!active) setActive(this);
    else for (const fn of followers) fn();
    this.dispatchEvent(new CustomEvent('ready'));
    return editor;
  }

  #onFocus = () => setActive(this);

  disconnectedCallback() {
    // moved within the page: connectedCallback runs again right after, so wait a tick before tearing down
    queueMicrotask(() => {
      if (this.isConnected || !this.ready) return;
      this.ready.then((ed) => ed && ed.destroy());
      this.ready = null; this.editor = null;
      fields.delete(this);
      this.removeEventListener('focusin', this.#onFocus);
      this.removeEventListener('pointerdown', this.#onFocus);
      if (active === this) setActive(fields.values().next().value || null);
    });
  }

  attributeChangedCallback(name, old, v) {
    const ed = this.editor;
    if (!ed || old === v) return;
    if (name === 'value') { if (v !== ed.getValue()) ed.setValue(v || ''); } else if (name === 'font') ed.setFont(v);
    else ed.setStyle({ [name]: num(v) });
  }

  /** The formula as LaTeX. */
  get value() { return this.editor ? this.editor.getValue() : this.getAttribute('value') || ''; }
  set value(latex) { if (this.editor) this.editor.setValue(latex); else this.setAttribute('value', latex); }
}

export class InkMathToolbarElement extends HTMLElement {
  static observedAttributes = ['for', 'locale'];

  #panel = null;
  #remove = () => {};
  #target = null;
  #config = null;

  /** Toolbar configuration: { structures, symbols, labels, edit }. Overrides the locale attribute. */
  get config() { return this.#config; }
  set config(c) { this.#config = c; this.#attach(true); }

  connectedCallback() {
    if (this.#panel) return;
    const host = document.createElement('div'); host.className = 'inkmath inkmath-toolbar';
    this.#panel = document.createElement('div'); this.#panel.className = 'inkmath-tb';
    host.append(this.#panel);
    this.append(host);
    followers.add(this.#follow);
    this.#attach();
  }

  disconnectedCallback() {
    followers.delete(this.#follow);
    this.#remove(); this.#remove = () => {};
    this.replaceChildren(); this.#panel = null; this.#target = null;
  }

  attributeChangedCallback() { if (this.#panel) this.#attach(true); }

  #follow = () => { if (!this.getAttribute('for')) this.#attach(); };

  async #attach(force = false) {
    if (!this.#panel) return;
    const id = this.getAttribute('for');
    const el = id ? document.getElementById(id) : active;
    if (!el || !(el instanceof InkMathElement)) return;
    if (el === this.#target && !force) return;
    this.#target = el;
    const editor = await el.ready;
    if (!editor || this.#target !== el || !this.#panel) return;
    this.#remove();
    const config = this.#config || LOCALES[this.getAttribute('locale')] || {};
    this.#remove = buildRibbon(this.#panel, editor, config);
    // the buttons are drawn in the editor's font; redraw them when it changes
    const offFont = editor.on('font', () => { if (this.#target === el) this.#attach(true); });
    const removeRibbon = this.#remove;
    this.#remove = () => { offFont(); removeRibbon(); };
  }
}

if (!customElements.get('ink-math')) customElements.define('ink-math', InkMathElement);
if (!customElements.get('ink-math-toolbar')) customElements.define('ink-math-toolbar', InkMathToolbarElement);
