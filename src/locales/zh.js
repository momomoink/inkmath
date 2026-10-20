// Chinese toolbar: import zh from 'inkmath/locales/zh'; createInkMath(el, { toolbar: zh }).
// Also a template for other languages: copy this file, translate the strings, pass the result of translateToolbar.
import { translateToolbar } from '../ribbon.js';

export const strings = {
  labels: { structures: '结构', symbols: '符号', undo: '↶ 撤销', redo: '↷ 重做', matrixActions: '光标在矩阵里时：' },
  structures: {
    frac: '分式', script: '上下标', root: '根式', int: '积分', bigop: '大型运算符', fence: '括号',
    func: '函数', accent: '重音', lim: '极限', matrix: '矩阵',
  },
  symbols: { basic: '基础', greek: '希腊字母', rel: '关系', arrow: '箭头', set: '集合与逻辑', script: '花体' },
  items: {
    '\\frac{#@}{#?}': '分式（竖式）', '{#@}/{#?}': '分式（斜线）', '\\tfrac{#@}{#?}': '小型分式',
    '\\dfrac{#@}{#?}': '大型分式', '\\binom{#@}{#?}': '组合数', '\\frac{d#@}{d#?}': '导数 dy/dx',
    '\\frac{\\partial #@}{\\partial #?}': '偏导数', '\\frac{\\Delta #@}{\\Delta #?}': '差商',
    '#@^{#?}': '上标', '#@_{#?}': '下标', '#@_{#?}^{#?}': '上下标', '{}_{#?}^{#?}#@': '左上下标',
    'e^{#?}': 'e 的幂', 'x_{#?}': 'x 下标', '#@^{\\prime}': '撇', '#@^{2}': '平方',
    '\\sqrt{#@}': '平方根', '\\sqrt[#?]{#@}': 'n 次根', '\\sqrt[3]{#@}': '立方根',
    '\\sqrt{#?^{2}+#?^{2}}': '勾股', '\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}': '求根公式',
    '\\int_{#?}^{#?}#@': '定积分', '\\int #@': '不定积分', '\\int_{#?}#@': '积分（下限）',
    '\\iint_{#?}#@': '二重积分', '\\iiint_{#?}#@': '三重积分', '\\oint_{#?}#@': '环路积分',
    '\\int_{#?}^{#?}#@\\,d#?': '定积分 + dx', '\\int #@\\,d#?': '不定积分 + dx',
    '\\sum_{#?}^{#?}#@': '求和', '\\sum_{#?}#@': '求和（下标）', '\\prod_{#?}^{#?}#@': '连乘',
    '\\coprod_{#?}^{#?}#@': '余积', '\\bigcup_{#?}^{#?}#@': '并', '\\bigcap_{#?}^{#?}#@': '交',
    '\\bigvee_{#?}#@': '析取', '\\bigwedge_{#?}#@': '合取', '\\bigoplus_{#?}#@': '直和',
    '\\left(#@\\right)': '圆括号', '\\left[#@\\right]': '方括号', '\\left\\{#@\\right\\}': '花括号',
    '\\left|#@\\right|': '绝对值', '\\left\\|#@\\right\\|': '范数', '\\left\\langle #@\\right\\rangle': '尖括号',
    '\\left\\lfloor #@\\right\\rfloor': '下取整', '\\left\\lceil #@\\right\\rceil': '上取整',
    '\\left\\{#@\\,\\middle|\\,#?\\right\\}': '集合 {x | …}', '\\begin{cases}#? & #?\\\\ #? & #?\\end{cases}': '分段函数',
    '\\log_{#?}#@': 'log 底数',
    '\\vec{#@}': '向量', '\\overrightarrow{#@}': '长向量', '\\hat{#@}': '尖帽', '\\bar{#@}': '横线',
    '\\overline{#@}': '上划线', '\\underline{#@}': '下划线', '\\dot{#@}': '一点', '\\ddot{#@}': '两点',
    '\\tilde{#@}': '波浪', '\\overbrace{#@}^{#?}': '上大括号', '\\underbrace{#@}_{#?}': '下大括号',
    '\\lim_{#?}#@': '极限', '\\limsup_{#?}#@': '上极限', '\\liminf_{#?}#@': '下极限',
    '\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}': '2×2 圆括号', '\\begin{bmatrix}#?&#?\\\\#?&#?\\end{bmatrix}': '2×2 方括号',
    '\\begin{vmatrix}#?&#?\\\\#?&#?\\end{vmatrix}': '2×2 行列式', '\\begin{pmatrix}#?\\\\#?\\end{pmatrix}': '列向量',
    '\\begin{pmatrix}#?&#?\\end{pmatrix}': '行向量', '\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}': '单位矩阵',
  },
  actions: { addRowAfter: '下方加一行', addColumnAfter: '右侧加一列', removeRow: '删除行', removeColumn: '删除列' },
};

/** The whole toolbar in Chinese: { structures, symbols, labels }. */
export default translateToolbar(strings);
