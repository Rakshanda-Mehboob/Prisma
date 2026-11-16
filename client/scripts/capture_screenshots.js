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
const outputDir = path.resolve('c:\\Users\\lenovo\\OneDrive\\Desktop\\Prisma\\screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const viewports = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1536x864', width: 1536, height: 864 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1093x614_scale125', width: 1093, height: 614 },
  { name: '911x512_scale150', width: 911, height: 512 },
];

const pages = [
  { name: 'Landing', path: '/', auth: null },
  { name: 'Login', path: '/login', auth: null },
  { name: 'Register', path: '/register', auth: null },
  { name: 'Dashboard', path: '/dashboard', auth: authUser15 },
  { name: 'Assessment', path: '/assessment?stage=pre&mode=take', auth: authUser1 },
  { name: 'Learning', path: '/interventions', auth: authUser15 },
  { name: 'Feedback', path: '/feedback', auth: authUser15 },
  { name: 'Profile', path: '/profile', auth: authUser15 },
];

async function run() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const p of pages) {
      // Set auth for the page user
      if (p.auth) {
        await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
        await page.evaluate((auth) => {
          localStorage.setItem('tpb_token', auth.token);
          localStorage.setItem('tpb_user', JSON.stringify(auth.user));
        }, p.auth);
      } else {
        await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
          localStorage.clear();
        });
      }

      const url = `http://localhost:5173${p.path}`;
      console.log(`  Capturing ${p.name} at ${vp.name}...`);
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 });
      } catch (e) {
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Small extra pause for rendering to settle
      await new Promise((r) => setTimeout(r, 800));

      const screenshotFile = path.join(outputDir, `${p.name}_${vp.name}.png`);
      await page.screenshot({ path: screenshotFile, fullPage: false });
      console.log(`    Saved: ${screenshotFile}`);
    }
  }

  await browser.close();
  console.log('\nAll 30 screenshots re-captured with rich unlocked data successfully!');
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
