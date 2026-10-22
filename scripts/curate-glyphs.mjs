// assets/glyphs.json = the MathWriting symbol samples (extracted from MathWriting's symbols.jsonl) minus the ones that read as a
// different symbol or are malformed (picked by eye from contact sheets, index = position in the original list).
// Usage: node scripts/curate-glyphs.mjs <uncurated glyphs.json>
import { readFileSync, writeFileSync } from 'node:fs';

const DROP = {
  'α': [0], 'γ': [1, 2, 3], 'δ': [1], 'ε': [2, 3], 'ϵ': [2, 3], 'η': [4], 'θ': [4, 5], 'ϑ': [3],
  'μ': [0, 2], 'ν': [0], 'ξ': [3, 5], 'π': [0, 1, 2], 'τ': [1, 3], 'φ': [2, 3], 'ϖ': [1],
  'Λ': [4], 'Υ': [4, 5], 'Φ': [1], 'Ψ': [4], '∇': [5], 'ℏ': [0, 3],
};

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/curate-glyphs.mjs <uncurated glyphs.json>'); process.exit(1); }
const glyphs = JSON.parse(readFileSync(src, 'utf8'));
let dropped = 0;
for (const [ch, idx] of Object.entries(DROP)) {
  if (!glyphs[ch]) throw new Error(`no samples for ${ch}`);
  const keep = glyphs[ch].filter((_, i) => !idx.includes(i));
  dropped += glyphs[ch].length - keep.length;
  glyphs[ch] = keep;
}
writeFileSync('assets/glyphs.json', JSON.stringify(glyphs));
console.log(`assets/glyphs.json: dropped ${dropped} samples from ${Object.keys(DROP).length} symbols`);
