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
  await page.setViewport({ width: 1093, height: 614 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((auth) => {
    localStorage.setItem('tpb_token', auth.token);
    localStorage.setItem('tpb_user', JSON.stringify(auth.user));
  }, authUser1);
  await page.goto('http://localhost:5173/assessment?stage=pre&mode=take', { waitUntil: 'networkidle2', timeout: 15000 });
  console.log('Page URL:', page.url());
  try {
    await page.waitForSelector('.assessment-split-scenario-card', { timeout: 5000 });
  } catch (e) {
    console.log('Timeout waiting for .assessment-split-scenario-card');
  }

  const details = await page.evaluate(() => {
    const header = document.querySelector('.assessment-sticky-header');
    const stepper = document.querySelector('.assessment-stepper-grid');
    const card = document.querySelector('.assessment-split-scenario-card');
    const leftPane = document.querySelector('.scenario-left-illustration-pane');
    const img = document.querySelector('.scenario-left-illustration-pane img');
    const rightPane = document.querySelector('.scenario-right-content-pane');
    const desc = document.querySelector('.scenario-description-container');
    const paras = Array.from(document.querySelectorAll('.scenario-description-para')).map((p) => ({
      h: Math.round(p.getBoundingClientRect().height),
      text: p.innerText.slice(0, 30),
    }));

    return {
      headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
      headerTop: header ? Math.round(header.getBoundingClientRect().top) : null,
      stepperH: stepper ? Math.round(stepper.getBoundingClientRect().height) : null,
      stepperTop: stepper ? Math.round(stepper.getBoundingClientRect().top) : null,
      cardH: card ? Math.round(card.getBoundingClientRect().height) : null,
      cardTop: card ? Math.round(card.getBoundingClientRect().top) : null,
      leftPaneH: leftPane ? Math.round(leftPane.getBoundingClientRect().height) : null,
      imgH: img ? Math.round(img.getBoundingClientRect().height) : null,
      rightPaneH: rightPane ? Math.round(rightPane.getBoundingClientRect().height) : null,
      descH: desc ? Math.round(desc.getBoundingClientRect().height) : null,
      paras,
    };
  });

  console.log('1093x614 details:', details);
  await browser.close();
}

inspect().catch(console.error);
