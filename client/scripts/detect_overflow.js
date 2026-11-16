import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const authUser1 = JSON.parse(
  fs.readFileSync('C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\6bd416d4-dac5-414d-9031-e6408b682501\\scratch\\auth_session.json', 'utf8')
);

const authUser15 = JSON.parse(
  fs.readFileSync('C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\6bd416d4-dac5-414d-9031-e6408b682501\\scratch\\auth_session_user15.json', 'utf8')
);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1093x614', width: 1093, height: 614 },
  { name: '911x512', width: 911, height: 512 },
];

const routes = [
  { name: 'Dashboard', path: '/dashboard', auth: authUser15 },
  { name: 'Assessment-Pre-Take', path: '/assessment?stage=pre&mode=take', auth: authUser1 },
  { name: 'Assessment-Post-Take', path: '/assessment?stage=post&mode=take', auth: authUser15 },
  { name: 'Assessment-Hub', path: '/assessment', auth: authUser15 },
  { name: 'Learning', path: '/interventions', auth: authUser15 },
  { name: 'Feedback', path: '/feedback', auth: authUser15 },
  { name: 'Profile', path: '/profile', auth: authUser15 },
  { name: 'Login', path: '/login', auth: null },
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  let totalIssuesFound = 0;
  const issuesSummary = [];

  for (const vp of viewports) {
    console.log(`\n==================================================`);
    console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`==================================================`);
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const r of routes) {
      if (r.auth) {
        await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
        await page.evaluate((auth) => {
          localStorage.setItem('tpb_token', auth.token);
          localStorage.setItem('tpb_user', JSON.stringify(auth.user));
        }, r.auth);
      } else {
        await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
          localStorage.clear();
        });
      }

      const url = `http://localhost:5173${r.path}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
      } catch (e) {
        await new Promise((res) => setTimeout(res, 1200));
      }
      await new Promise((res) => setTimeout(res, 800));

      const overflowData = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const winWidth = window.innerWidth;
        const hasDocOverflow = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;

        const culprits = [];

        function getSelector(el) {
          if (!el) return '';
          let s = el.tagName.toLowerCase();
          if (el.id) {
            s += '#' + el.id;
            return s;
          }
          if (el.className && typeof el.className === 'string') {
            const classes = el.className.trim().split(/\s+/).filter(c => c && !c.includes(':')).slice(0, 3);
            if (classes.length) s += '.' + classes.join('.');
          }
          if (el.parentElement && el.parentElement !== document.body) {
            return getSelector(el.parentElement) + ' > ' + s;
          }
          return s;
        }

        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          // Skip scripts, styles, SVGs defs/paths
          const tag = el.tagName.toLowerCase();
          if (['script', 'style', 'path', 'defs', 'clippath', 'g', 'svg'].includes(tag)) continue;

          const rect = el.getBoundingClientRect();
          const clientW = el.clientWidth;
          const scrollW = el.scrollWidth;

          // Check if right edge overflows viewport
          const exceedsRight = rect.right > winWidth + 1;
          // Check if scrollWidth exceeds clientWidth significantly
          const overflowsSelf = (scrollW > clientW + 1) && (clientW > 0);

          if (exceedsRight || (overflowsSelf && exceedsRight)) {
            // Get sample text
            let text = (el.innerText || el.textContent || '').trim().slice(0, 40).replace(/\s+/g, ' ');
            culprits.push({
              selector: getSelector(el),
              tag,
              className: el.className || '',
              rectRight: Math.round(rect.right),
              winWidth,
              clientW,
              scrollW,
              diffRight: Math.round(rect.right - winWidth),
              textSample: text
            });
          }
        }

        return {
          docWidth,
          bodyWidth,
          winWidth,
          hasDocOverflow,
          culpritsCount: culprits.length,
          culprits: culprits.slice(0, 25) // top 25
        };
      });

      if (overflowData.hasDocOverflow || overflowData.culpritsCount > 0) {
        console.log(`\n[OVERFLOW DETECTED] Route: ${r.name} (${r.path}) at ${vp.name}`);
        console.log(`  Window: ${overflowData.winWidth}px | Doc scrollWidth: ${overflowData.docWidth}px | Body scrollWidth: ${overflowData.bodyWidth}px`);
        console.log(`  Culprits found: ${overflowData.culpritsCount}`);
        overflowData.culprits.forEach((c, idx) => {
          console.log(`   ${idx + 1}. [${c.tag}] ${c.selector}`);
          console.log(`      right: ${c.rectRight}px (exceeds by ${c.diffRight}px) | clientW: ${c.clientW}px | scrollW: ${c.scrollW}px | class: "${c.className}"`);
          if (c.textSample) console.log(`      text: "${c.textSample}"`);
        });
        totalIssuesFound += overflowData.culpritsCount;
        issuesSummary.push({
          viewport: vp.name,
          route: r.name,
          diff: overflowData.docWidth - overflowData.winWidth,
          culprits: overflowData.culprits
        });
      } else {
        console.log(`[PASS] Route: ${r.name} at ${vp.name} - No overflow (Doc: ${overflowData.docWidth}px, Win: ${overflowData.winWidth}px)`);
      }
    }
  }

  await browser.close();
  console.log(`\n==================================================`);
  console.log(`AUDIT FINISHED. Total culprits reported: ${totalIssuesFound}`);
  console.log(`==================================================\n`);
  return totalIssuesFound;
}

run().catch(console.error);
