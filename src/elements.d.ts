import type { InkMathEditor, ToolbarOptions } from './index.js';

/** <ink-math>: attributes value, font, thickness, roughness, seed, readonly, toolbar="none", locale, assets-url. */
export class InkMathElement extends HTMLElement {
  /** Resolves to the editor once the field is drawn. */
  ready: Promise<InkMathEditor | null> | null;
  /** The editor, once ready. */
  editor: InkMathEditor | null;
  /** This field's own toolbar; set before the element is added to the page. */
  toolbarConfig: Omit<ToolbarOptions, 'container'> | null;
  /** The formula as LaTeX. */
  value: string;
}

/** <ink-math-toolbar>: attributes for (id of an <ink-math>; without it, follows the focused field) and locale. */
export class InkMathToolbarElement extends HTMLElement {
  /** { structures, symbols, labels, edit }; overrides the locale attribute. */
  config: Omit<ToolbarOptions, 'container'> | null;
}

declare global {
  interface HTMLElementTagNameMap {
    'ink-math': InkMathElement;
    'ink-math-toolbar': InkMathToolbarElement;
  }
  interface HTMLElementEventMap {
    change: Event | CustomEvent<{ value: string }>;
  }
}
