/**
 * dead_css_audit.js
 * Finds CSS class selectors that are defined in index.css but
 * never referenced in any JSX/TSX/JS file under client/src.
 *
 * Run from Prisma root: node client/scripts/dead_css_audit.js
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { resolve, join, extname } from 'path';

const cssPath = resolve('client/src/index.css');
const srcDir = resolve('client/src');

// ── 1. Extract all CSS class names ────────────────────────────────────────
const css = readFileSync(cssPath, 'utf8');
// Match .classname at start of selector (not inside pseudo/attr selectors)
const classRegex = /^\s*\.([a-zA-Z][a-zA-Z0-9_-]*)/gm;
const cssClasses = new Set();
let m;
while ((m = classRegex.exec(css)) !== null) {
  cssClasses.add(m[1]);
}
console.log(`Total unique CSS class selectors: ${cssClasses.size}`);

// ── 2. Collect all JSX/TSX/JS source files ────────────────────────────────
function collectFiles(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectFiles(full, results);
    } else {
      const ext = extname(entry);
      if (['.jsx', '.tsx', '.js', '.ts'].includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}
const srcFiles = collectFiles(srcDir);
console.log(`Source files to scan: ${srcFiles.length}`);

// ── 3. Build a giant blob of all source content ───────────────────────────
let allSrc = '';
for (const f of srcFiles) {
  allSrc += readFileSync(f, 'utf8') + '\n';
}

// ── 4. Check which classes appear in source ────────────────────────────────
const used = new Set();
const unused = new Set();

for (const cls of cssClasses) {
  // Look for className="...cls..." or class="cls" or cn('cls') etc.
  // We use a simple string-contains check (fast and accurate enough)
  if (allSrc.includes(cls)) {
    used.add(cls);
  } else {
    unused.add(cls);
  }
}

console.log(`Used in JSX: ${used.size}`);
console.log(`Potentially unused: ${unused.size}`);

// ── 5. Write report ───────────────────────────────────────────────────────
const lines = [
  `DEAD CSS CLASS AUDIT`,
  `Generated: ${new Date().toISOString()}`,
  `Total CSS classes: ${cssClasses.size}`,
  `Used in JSX/JS: ${used.size}`,
  `Potentially unused: ${unused.size}`,
  ``,
  `NOTE: "unused" means the string does not appear in any .jsx/.tsx/.js file.`,
  `Some may be used dynamically (template literals) — review before deleting.`,
  ``,
  `─`.repeat(60),
  `POTENTIALLY UNUSED CLASSES (${unused.size}):`,
  `─`.repeat(60),
  ...[...unused].sort(),
];

const outPath = resolve('client/scripts/dead_css_report.txt');
writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`\nFull report: ${outPath}`);
console.log('\nTop 50 potentially unused:');
[...unused].sort().slice(0, 50).forEach(c => console.log('  .' + c));
