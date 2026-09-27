import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const output = process.argv[2] || 'qa-results/distant-landscape-current';
const base = process.argv[3] || 'http://127.0.0.1:4173/';
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(`${base}?qa=story`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__storyQA?.worldRouter?.activeZoneInstance, null, { timeout: 120000 });
  await page.evaluate(async () => {
    await window.__storyQA.prefetch({ zoneId: 'skybridge' });
    await window.__storyQA.load('skybridge', 'm7_skybridge_mid');
    window.__storyQA.controller.teleport(33.5, 1.7, 1);
    window.__storyQA.lookAt([30, -1.3, -21]);
    for (const id of ['modeling-qa-panel', 'task-panel', 'interaction-prompt', 'subtitle-box']) {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    }
  });
  for (const [time, file] of [['20:00', 'outbound-dusk.png'], ['02:17', 'return-deep-night.png'], ['03:30', 'predawn.png']]) {
    await page.evaluate(value => window.__storyQA.gameState.setGameTime(value), time);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${output}/${file}` });
  }
} finally {
  await browser.close();
}
