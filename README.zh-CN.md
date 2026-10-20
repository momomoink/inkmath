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

inkmath 是基于 [MathLive](https://github.com/arnog/mathlive) 的 JavaScript 公式编辑器，致力于渲染漂亮的手写体公式，支持丰富的 LaTeX 命令。

## Features

- **手写体渲染：** 字母和数字提供 8 种手写字体；希腊字母、积分号、求和号、集合符号和大括号使用 MathWriting 数据集的真人笔迹；分数线、根号和箭头以手绘笔画呈现。
- **花体样式：** `\mathcal` 使用 Dancing Script，`\mathscr` 使用 Allura。
- **丰富的 LaTeX 输入：** 输入 `\frac`、`\int`、`\alpha` 等命令后按空格，即可插入结构和符号。Tab 按 Word 的顺序在空位间跳转，积分后输入 `dx` 会自动加小空格。
- **Word 式工具栏：** 点击即可插入结构和符号，也可以先选中内容，再用模板包裹。
- **标准 LaTeX 输出：** 公式可以保存、搜索，或用于其他地方的排版。
- **独立渲染：** 无需编辑器，使用 `renderLatex()` 即可将现成的 LaTeX 公式渲染为同样的手写体。

## 安装

```sh
npm install inkmath
```

## 用法

inkmath 是一个组件，不是一整个页面：引入它不会改动你的页面，编辑器只出现在你放的位置，样式也只作用在它自己的元素上。

最简单的用法是放标签：

```html
<ink-math-toolbar locale="zh"></ink-math-toolbar>
<ink-math toolbar="none">\int_{0}^{1} x^{2}\,dx</ink-math>

<script type="module">
  import 'inkmath/elements';
  import 'inkmath/style.css';
</script>
```

`<ink-math-toolbar>` 可以放在页面任何地方，服务最近点过的那个公式框，一个工具栏可以管多个公式（像 Word）。不放它的话，每个 `<ink-math>` 上方自带一个工具栏。

### 工具栏改成中文

工具栏默认是英文，中文在包里单独一个文件：

```js
import { createInkMath } from 'inkmath';
import zh from 'inkmath/locales/zh';

await createInkMath(el, { toolbar: zh });
```

用标签时加 `locale="zh"`（`<ink-math-toolbar locale="zh">` 或 `<ink-math locale="zh">`）。不用打包工具时是 `dist/locales/zh.js`。`zh` 是一份完整的工具栏配置，可以和其他设置合在一起：`{ ...zh, edit: false }`。想要别的语言，照着 [`src/locales/zh.js`](src/locales/zh.js) 翻译一份，传给 `translateToolbar()`。

### 定制工具栏

工具栏的按钮、文字、样式、位置都能改，也可以完全自己做界面，用编辑器的 `insert`、`command`、`getContext`、`on('context')`、`renderIcon` 实现。详见 [docs/toolbar.md](docs/toolbar.md)。

### 用 JavaScript

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

不用打包工具时，直接引入打包好的单文件（它同时定义了标签）：

```html
<link rel="stylesheet" href="node_modules/inkmath/dist/inkmath.css">
<script type="module" src="node_modules/inkmath/dist/inkmath.bundle.js"></script>
<ink-math locale="zh">x^2</ink-math>
```

## 选项

`createInkMath(container, options)`：

| 选项 | 默认 | 说明 |
|---|---|---|
| `value` | `''` | 初始 LaTeX |
| `font` | `'caveat'` | 字体 id，见下表或 `listFonts()` |
| `toolbar` | `true` | `true` 默认工具栏，`false` 不要，或一份工具栏配置 `{ structures, symbols, labels, edit, container }`（见 [docs/toolbar.md](docs/toolbar.md)） |
| `readOnly` | `false` | 只读 |
| `thickness` | `0.06` | 笔画粗细（相对字号） |
| `roughness` | `1` | 分数线、箭头、根号的手绘程度：0 是干净的直线，1 默认，越大越随意 |
| `seed` | `0` | 每个符号选用哪个笔迹样本 |
| `fonts` | `[]` | 自己的字体 `{ id, label, url }`，id 相同会覆盖内置字体 |
| `assetsUrl` | 包内 `assets/` | 字体和笔迹数据的位置，见下文 |
| `onChange` | – | 内容变化时回调，参数是 LaTeX |
| `onContextChange` | – | 光标位置、能否撤销等变化时回调，给自己做的工具栏用 |

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
