import type { MathfieldElement } from 'mathlive';

export interface FontInfo {
  id: string;
  label: string;
  /** Share of Greek letters the font covers itself (the rest fall back to LXGW WenKai). */
  greek: number;
}

/** A font of your own, added to (or replacing, by id) the bundled ones. */
export interface CustomFont {
  id: string;
  label?: string;
  /** URL of a .ttf / .woff / .woff2 file. */
  url: string;
  greek?: number;
}

/** Toolbar template: [latex, name]. `#@` takes the current selection, `#?` is an empty slot. */
export type Template = [latex: string, name: string];

export interface StructureGroup {
  id: string;
  label: string;
  /** LaTeX shown on the group button. */
  icon: string;
  items: Template[];
  /** MathLive commands shown under the gallery, e.g. ['addRowAfter', '下方加一行']. */
  actions?: [command: string, name: string][];
}

export interface SymbolGroup {
  id: string;
  label: string;
  items: string[];
}

/** The toolbar's own words. */
export interface ToolbarLabels {
  structures: string;
  symbols: string;
  undo: string;
  redo: string;
  /** Text before the matrix row/column buttons; '' for none. */
  matrixActions: string;
}

export interface ToolbarOptions {
  /** The Structures tab; [] hides the tab. Default STRUCTURES. */
  structures?: StructureGroup[];
  /** The Symbols tab; [] hides the tab. Default SYMBOLS. */
  symbols?: SymbolGroup[];
  labels?: Partial<ToolbarLabels>;
  /** Show undo / redo. Default true. */
  edit?: boolean;
  /** Put the toolbar in this element instead of above the field. */
  container?: HTMLElement;
}

/** Translations for translateToolbar(); anything left out stays English. */
export interface ToolbarStrings {
  labels?: Partial<ToolbarLabels>;
  /** Structure group id -> label. */
  structures?: Record<string, string>;
  /** Symbol group id -> label. */
  symbols?: Record<string, string>;
  /** Template -> gallery name. */
  items?: Record<string, string>;
  /** MathLive command -> button text (the matrix actions). */
  actions?: Record<string, string>;
}

export interface ToolbarConfig {
  structures: StructureGroup[];
  symbols: SymbolGroup[];
  labels: ToolbarLabels;
}

/** Where the caret is and what can be done there, for enabling a custom toolbar's buttons. */
export interface EditorContext {
  focused: boolean;
  hasSelection: boolean;
  /** The caret is inside a matrix (row/column commands apply). */
  inMatrix: boolean;
  canUndo: boolean;
  canRedo: boolean;
  /** A LaTeX command is being typed. */
  latexMode: boolean;
}

export interface StrokeStyle {
  /** Stroke width as a fraction of the font size. Default 0.06. */
  thickness?: number;
  /** How hand-drawn bars, arrows and radicals look: 0 clean straight lines, 1 default, higher is looser. */
  roughness?: number;
  /** Which handwriting sample each symbol uses; change it for a different look. */
  seed?: number;
}

export interface CommonOptions extends StrokeStyle {
  /** Font id, see `listFonts()`. Default 'caveat'. */
  font?: string;
  /** Where glyphs.json, fonts.json and the font files live. Defaults to the package's own assets/ folder. */
  assetsUrl?: string | URL;
  fonts?: CustomFont[];
}

export interface EditorOptions extends CommonOptions {
  /** Initial LaTeX. */
  value?: string;
  /** The Word-style toolbar: true (default), false for none, or its configuration. */
  toolbar?: boolean | ToolbarOptions;
  readOnly?: boolean;
  onChange?: (latex: string) => void;
  onContextChange?: (context: EditorContext) => void;
}

export interface InkMathEditor {
  /** The root element inserted into the container. */
  readonly element: HTMLDivElement;
  /** The underlying MathLive field, for anything this API does not cover. */
  readonly mathfield: MathfieldElement;
  readonly fonts: FontInfo[];
  getValue(): string;
  setValue(latex: string): void;
  /** Insert a template at the caret; `#@` wraps the current selection. */
  insert(template: string): void;
  /** Run a MathLive command, e.g. 'undo', 'redo', 'addRowAfter', 'removeColumn'. */
  command(command: string | [string, ...unknown[]]): void;
  getContext(): EditorContext;
  /** Listen for changes; returns a function that stops listening. */
  on(event: 'change', listener: (latex: string) => void): () => void;
  on(event: 'context', listener: (context: EditorContext) => void): () => void;
  on(event: 'font', listener: (fontId: string) => void): () => void;
  /** HTML for a button showing `latex` (slots drawn as □) in the current handwriting font. */
  renderIcon(latex: string): string;
  focus(): void;
  getFont(): string;
  setFont(id: string): void;
  getStyle(): Required<StrokeStyle>;
  setStyle(style: StrokeStyle): void;
  /** Pick different handwriting samples. */
  reseed(): void;
  redraw(): void;
  destroy(): void;
}

export interface RenderOptions extends CommonOptions {
  /** Display style (centred block, full-size limits) instead of inline. */
  display?: boolean;
}

export interface RenderedFormula {
  readonly element: HTMLSpanElement;
  redraw(): void;
  destroy(): void;
}

export function createInkMath(container: HTMLElement, options?: EditorOptions): Promise<InkMathEditor>;
export function renderLatex(target: HTMLElement, latex: string, options?: RenderOptions): Promise<RenderedFormula>;
export function listFonts(options?: { assetsUrl?: string | URL; fonts?: CustomFont[] }): Promise<FontInfo[]>;

/** The default (English) toolbar. */
export const STRUCTURES: StructureGroup[];
export const SYMBOLS: SymbolGroup[];
export const LABELS: ToolbarLabels;
/** The default toolbar with its words replaced, ready for the `toolbar` option. */
export function translateToolbar(strings?: ToolbarStrings): ToolbarConfig;
