/**
 * audit_css_dupes.js
 * Reads index.css and reports every selector that appears more than once,
 * with all line numbers where it is defined.
 * Also reports approximate line counts per logical section.
 *
 * Run from Prisma root: node client/scripts/audit_css_dupes.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const cssPath = resolve('client/src/index.css');
const src = readFileSync(cssPath, 'utf8');
const lines = src.split('\n');

// ── 1. Parse selectors and their line numbers ──────────────────────────────
// We collect the top-level selector string (before the first '{') of each rule.
// We skip @media / @keyframes blocks' own "header" lines but do track rules inside them.

const selectorMap = {}; // selector -> [{line, context}]

let depth = 0;        // brace depth
let inAtBlock = false;
let atBlockLabel = '';
let currentSelector = '';
let selectorLine = 0;

for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const trimmed = raw.trim();

  // Count braces in this line
  const opens = (raw.match(/{/g) || []).length;
  const closes = (raw.match(/}/g) || []).length;

  if (depth === 0) {
    // At top level — look for a new rule starting
    if (trimmed.startsWith('@media') || trimmed.startsWith('@keyframes') ||
        trimmed.startsWith('@font-face') || trimmed.startsWith('@layer') ||
        trimmed.startsWith('@supports')) {
      inAtBlock = true;
      atBlockLabel = trimmed.split('{')[0].trim();
      depth += opens;
      depth -= closes;
      if (depth <= 0) { inAtBlock = false; depth = 0; }
      continue;
    }

    if (opens > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
      // This line starts a rule
      currentSelector = trimmed.split('{')[0].trim();
      selectorLine = i + 1;
      if (currentSelector) {
        if (!selectorMap[currentSelector]) selectorMap[currentSelector] = [];
        selectorMap[currentSelector].push({ line: selectorLine, context: 'root' });
      }
      depth += opens;
      depth -= closes;
      if (depth <= 0) depth = 0;
    }
  } else {
    // Inside a block
    if (opens > 0 && depth === 1 && inAtBlock) {
      // This is a rule inside @media/@keyframes
      currentSelector = trimmed.split('{')[0].trim();
      selectorLine = i + 1;
      if (currentSelector && !currentSelector.startsWith('@') &&
          !currentSelector.startsWith('from') && !currentSelector.startsWith('to') &&
          !currentSelector.startsWith('0%') && !currentSelector.startsWith('100%') &&
          !currentSelector.match(/^\d/)) {
        const key = `${currentSelector}  [in: ${atBlockLabel}]`;
        if (!selectorMap[key]) selectorMap[key] = [];
        selectorMap[key].push({ line: selectorLine, context: atBlockLabel });
      }
    }
    depth += opens;
    depth -= closes;
    if (depth <= 0) {
      depth = 0;
      if (inAtBlock) inAtBlock = false;
      currentSelector = '';
    }
  }
}

// ── 2. Find duplicates ─────────────────────────────────────────────────────
const dupes = Object.entries(selectorMap)
  .filter(([, locs]) => locs.length > 1)
  .sort((a, b) => a[0].localeCompare(b[0]));

// ── 3. Summary by section (approximate) ───────────────────────────────────
// Detect section comments like /* ── Section ── */
const sections = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/\/\*\s*[─\-=]{2,}.*[─\-=]{2,}\s*\*\//);
  if (m) sections.push({ line: i + 1, text: lines[i].trim() });
}

// ── 4. Output ──────────────────────────────────────────────────────────────
const totalDupeSelectors = dupes.length;
const totalExtraOccurrences = dupes.reduce((s, [, locs]) => s + locs.length - 1, 0);

let report = `CSS DUPLICATE SELECTOR AUDIT\n`;
report += `Generated: ${new Date().toISOString()}\n`;
report += `File: client/src/index.css  (${lines.length} lines)\n`;
report += `\nTOTAL duplicate selectors: ${totalDupeSelectors}\n`;
report += `Total extra (redundant) blocks: ${totalExtraOccurrences}\n`;
report += `\n${'─'.repeat(80)}\n`;
report += `SECTION MARKERS (${sections.length} found)\n`;
report += `${'─'.repeat(80)}\n`;
sections.forEach(s => { report += `  L${String(s.line).padStart(5)}: ${s.text}\n`; });

report += `\n${'─'.repeat(80)}\n`;
report += `DUPLICATE SELECTORS (each defined 2+ times)\n`;
report += `${'─'.repeat(80)}\n`;

dupes.forEach(([sel, locs]) => {
  report += `\n[${locs.length}x] ${sel}\n`;
  locs.forEach(l => { report += `       L${l.line}  (${l.context})\n`; });
});

const outPath = resolve('client/scripts/css_dupes_report.txt');
writeFileSync(outPath, report, 'utf8');
console.log(report);
console.log(`\nReport saved to: ${outPath}`);
