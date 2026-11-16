import puppeteer from 'puppeteer-core';
import fs from 'fs';

const authUser1 = JSON.parse(
  fs.readFileSync('C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\6bd416d4-dac5-414d-9031-e6408b682501\\scratch\\auth_session.json', 'utf8')
);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((auth) => {
    localStorage.setItem('tpb_token', auth.token);
    localStorage.setItem('tpb_user', JSON.stringify(auth.user));
  }, authUser1);
  await page.goto('http://localhost:5173/assessment?stage=pre&mode=take', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  for (const vp of [{ w: 1366, h: 768 }, { w: 1093, h: 614 }]) {
    await page.setViewport({ width: vp.w, height: vp.h });
    await new Promise((r) => setTimeout(r, 500));

    const breakdown = await page.evaluate(() => {
      function info(el) {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height),
          width: Math.round(r.width)
        };
      }

      const navbar = document.querySelector('nav, .navbar');
      const pageContent = document.querySelector('.page-content');
      const header = document.querySelector('.assessment-sticky-header');
      const headerWrap = document.querySelector('.assessment-header-content-wrap');
      const titlePane = document.querySelector('.assessment-header-title-pane');
      const progPane = document.querySelector('.assessment-header-progress-pane');
      const stepper = document.querySelector('.assessment-stepper-grid');
      const scenarioCard = document.querySelector('.assessment-split-scenario-card');
      const imgPane = document.querySelector('.scenario-left-illustration-pane');
      const img = document.querySelector('.scenario-left-illustration-pane img');
      const rightContent = document.querySelector('.scenario-right-content-pane');
      const questionCard = document.querySelector('.assessment-question-card-elevated');

      return {
        navbar: info(navbar),
        pageContent: info(pageContent),
        header: info(header),
        headerWrap: info(headerWrap),
        titlePane: info(titlePane),
        progPane: info(progPane),
        stepper: info(stepper),
        scenarioCard: info(scenarioCard),
        imgPane: info(imgPane),
        img: info(img),
        rightContent: info(rightContent),
        questionCard: info(questionCard)
      };
    });

    console.log(`\nBreakdown at ${vp.w}x${vp.h}:`, JSON.stringify(breakdown, null, 2));
  }

  await browser.close();
}

inspect().catch(console.error);
