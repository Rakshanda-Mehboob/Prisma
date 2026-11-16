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

  for (const vp of [{ w: 1366, h: 768 }, { w: 1093, h: 614 }]) {
    await page.setViewport({ width: vp.w, height: vp.h });
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate((auth) => {
      localStorage.setItem('tpb_token', auth.token);
      localStorage.setItem('tpb_user', JSON.stringify(auth.user));
    }, authUser1);
    await page.goto('http://localhost:5173/assessment?stage=pre&mode=take', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    const metrics = await page.evaluate((vpHeight) => {
      const scenario = document.querySelector('.assessment-split-scenario-card');
      const questionCard = document.querySelector('.assessment-question-card-elevated');
      const questionTitle = document.querySelector('.assessment-question-text-title');
      const options = document.querySelectorAll('.assessment-option-card-premium');

      return {
        scenarioTop: scenario ? Math.round(scenario.getBoundingClientRect().top) : null,
        scenarioBottom: scenario ? Math.round(scenario.getBoundingClientRect().bottom) : null,
        scenarioHeight: scenario ? Math.round(scenario.getBoundingClientRect().height) : null,
        questionCardTop: questionCard ? Math.round(questionCard.getBoundingClientRect().top) : null,
        questionCardBottom: questionCard ? Math.round(questionCard.getBoundingClientRect().bottom) : null,
        questionTitleTop: questionTitle ? Math.round(questionTitle.getBoundingClientRect().top) : null,
        firstOptionTop: options[0] ? Math.round(options[0].getBoundingClientRect().top) : null,
        firstOptionBottom: options[0] ? Math.round(options[0].getBoundingClientRect().bottom) : null,
        optionsCount: options.length,
        isQuestionVisible: questionCard ? questionCard.getBoundingClientRect().top < vpHeight : false,
        isQuestionTitleVisible: questionTitle ? questionTitle.getBoundingClientRect().top < vpHeight : false,
        isFirstOptionVisible: options[0] ? options[0].getBoundingClientRect().top < vpHeight : false,
        optionsVisibleCount: Array.from(options).filter(o => o.getBoundingClientRect().bottom <= vpHeight).length
      };
    }, vp.h);

    console.log(`\nViewport ${vp.w}x${vp.h}:`);
    console.log(`  Scenario Top: ${metrics.scenarioTop}px | Height: ${metrics.scenarioHeight}px | Bottom: ${metrics.scenarioBottom}px`);
    console.log(`  Question Card Top: ${metrics.questionCardTop}px`);
    console.log(`  Question Title Top: ${metrics.questionTitleTop}px (visible? ${metrics.isQuestionTitleVisible})`);
    console.log(`  First Option Top: ${metrics.firstOptionTop}px (visible? ${metrics.isFirstOptionVisible})`);
    console.log(`  Options fully visible without scrolling: ${metrics.optionsVisibleCount} of ${metrics.optionsCount}`);
  }
  await browser.close();
}

inspect().catch(console.error);
