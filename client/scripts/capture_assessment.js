import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const authUser1 = JSON.parse(
  fs.readFileSync('C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\6bd416d4-dac5-414d-9031-e6408b682501\\scratch\\auth_session.json', 'utf8')
);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('c:\\Users\\lenovo\\OneDrive\\Desktop\\Prisma\\screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const prefix = process.argv[2] || 'before';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  const viewports = [
    { name: '1366x768', width: 1366, height: 768 },
    { name: '1093x614', width: 1093, height: 614 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });

    // Login user 1
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate((auth) => {
      localStorage.setItem('tpb_token', auth.token);
      localStorage.setItem('tpb_user', JSON.stringify(auth.user));
    }, authUser1);

    await page.goto('http://localhost:5173/assessment?stage=pre&mode=take', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Viewport screenshot (what user sees without scrolling)
    const vpShot = path.join(outputDir, `${prefix}_assessment_${vp.name}_viewport.png`);
    await page.screenshot({ path: vpShot, fullPage: false });
    console.log(`Saved: ${vpShot}`);

    // Full page screenshot
    const fullShot = path.join(outputDir, `${prefix}_assessment_${vp.name}_full.png`);
    await page.screenshot({ path: fullShot, fullPage: true });
    console.log(`Saved: ${fullShot}`);
  }

  await browser.close();
}

run().catch(console.error);
