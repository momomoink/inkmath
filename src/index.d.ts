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
  /** Show the Word-style toolbar. Default true. */
  toolbar?: boolean;
  readOnly?: boolean;
  structures?: StructureGroup[];
  symbols?: SymbolGroup[];
  onChange?: (latex: string) => void;
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

export const STRUCTURES: StructureGroup[];
export const SYMBOLS: SymbolGroup[];
