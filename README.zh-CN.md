<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/inkmath-dark.svg">
    <img src="brand/inkmath.svg" alt="inkmath" width="220">
  </picture>
</p>

<h1 align="center">inkmath</h1>

<p align="center">写出来是手写体，打起来像 LaTeX 一样快。</p>

<p align="center"><a href="https://momomoink.github.io/inkmath/"><b>在浏览器里试试 →</b></a></p>

English: [README.md](README.md) · 详细文档（英文）：[docs/](docs/README.md) · Logo 与配色：[brand/](brand/README.md)

inkmath 是一个网页公式编辑器，主要做两件事。

**一、生成手写体公式。** 输入的公式不是印刷体，而是像在纸上手写出来的：

- 字母、数字用手写字体（8 种可选）；
- 希腊字母、积分号、求和号、ℝ ℤ ℕ、大括号用真人笔迹（MathWriting 数据集）；
- 根号、分数线、箭头、∞、∀ ∃ ∧ ∨ ∵ ∴ 由程序画成手写笔画，略有起伏，落笔处更重；
- `\mathcal` 用 Dancing Script，`\mathscr` 用 Allura。

不需要编辑时，`renderLatex()` 可以把任意现成的 LaTeX 公式直接画成同样的手写体。

**二、支持 LaTeX 命令快速编辑。** 打 `\frac`、`\int`、`\alpha` 加空格，结构或符号立刻出现；Tab 按 Word 的顺序在空位间跳转（积分、求和是下限 → 上限 → 主体）；积分后打 `dx` 会自动加小空格。不会 LaTeX 的用户也可以用 Word 式工具栏点选结构和符号，先选中内容再点模板，内容会被套进去。无论哪种方式，得到的都是标准 LaTeX，可以保存、搜索，或拿去别处排版。

编辑部分基于 [MathLive](https://github.com/arnog/mathlive)。

## 安装

```sh
npm install inkmath
```

## 用法

```js
import { createInkMath, renderLatex } from 'inkmath';
import 'inkmath/style.css';

const editor = await createInkMath(document.getElementById('editor'), {
  value: '\\int_{0}^{1} x^{2}\\,dx',
  font: 'caveat',
  onChange: (latex) => console.log(latex),
});

editor.getValue();               // 当前 LaTeX
editor.setValue('\\frac{a}{b}');
editor.setFont('kalam');
editor.setStyle({ thickness: 0.07, roughness: 1.5 });
editor.reseed();                 // 换一组笔迹样本
editor.destroy();

// 只显示
await renderLatex(document.getElementById('formula'), 'e^{i\\pi}+1=0');
await renderLatex(el, '\\sum_{n=1}^{\\infty}\\frac{1}{n^{2}}', { display: true, font: 'patrick' });
```

不用打包工具时，直接引入打包好的单文件：

```html
<link rel="stylesheet" href="node_modules/inkmath/dist/inkmath.css">
<script type="module">
  import { createInkMath } from './node_modules/inkmath/dist/inkmath.bundle.js';
</script>
```

## 选项

`createInkMath(container, options)`：

| 选项 | 默认 | 说明 |
|---|---|---|
| `value` | `''` | 初始 LaTeX |
| `font` | `'caveat'` | 字体 id，见下表或 `listFonts()` |
| `toolbar` | `true` | 是否显示工具栏 |
| `readOnly` | `false` | 只读 |
| `thickness` | `0.06` | 笔画粗细（相对字号） |
| `roughness` | `1` | 分数线、箭头、根号的手绘程度：0 是干净的直线，1 默认，越大越随意 |
| `seed` | `0` | 每个符号选用哪个笔迹样本 |
| `fonts` | `[]` | 自己的字体 `{ id, label, url }`，id 相同会覆盖内置字体 |
| `structures` / `symbols` | 内置 | 自定义工具栏内容，格式见 `STRUCTURES` / `SYMBOLS` |
| `assetsUrl` | 包内 `assets/` | 字体和笔迹数据的位置，见下文 |
| `onChange` | – | 内容变化时回调，参数是 LaTeX |

`renderLatex(target, latex, options)` 接受 `font`、`display`、`thickness`、`roughness`、`seed`、`fonts`、`assetsUrl`。

样式用 CSS 变量调整：`--inkmath-ink`（墨水色）、`--inkmath-paper`（编辑框底色）、`--inkmath-line`、`--inkmath-accent`、`--inkmath-font-size`（编辑框字号，默认 40px）等。默认配色是 inkmath 的品牌色：蓝黑墨水 `#1D2B4A`、纸色 `#FBFCF8`、绿色强调 `#2F6F4F`。完整变量表和深色模式写法见 [docs/styling.md](docs/styling.md)。

## 内置字体

均为 SIL Open Font License 1.1：

| id | 字体 |
|---|---|
| `caveat` | Caveat |
| `kalam` | Kalam |
| `patrick` | Patrick Hand |
| `architects` | Architects Daughter |
| `shadows` | Shadows Into Light Two |
| `gochi` | Gochi Hand |
| `nanumpen` | Nanum Pen Script |
| `wenkai` | 霞鹜文楷 LXGW WenKai |

字体缺的希腊字母和集合符号由霞鹜文楷补上。

## 资源文件（assetsUrl）

运行时会加载 `assets/` 下的 `glyphs.json`（笔迹，约 1.5 MB）、`fonts.json` 和字体文件。默认按 `import.meta.url` 找包内的 `assets/`，原生 ES 模块和 webpack 5 可以直接用。

Vite 开发模式会预打包依赖，相对路径会失效，任选一种：

- `vite.config.js` 里加 `optimizeDeps: { exclude: ['inkmath'] }`；
- 或把 `node_modules/inkmath/assets` 复制到 `public/inkmath/`，然后传 `assetsUrl: '/inkmath/'`。

## 许可

代码：MIT。笔迹数据和字体各有许可，见 [NOTICE.md](NOTICE.md)。**注意：笔迹数据 `assets/glyphs.json` 来自 MathWriting，许可为 CC BY-NC-SA 4.0，不能用于商业用途。**
