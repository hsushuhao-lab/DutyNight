import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { fileURLToPath } from 'node:url';

const output = process.argv[2] || 'qa-results/registration-scene';
await mkdir(output, { recursive: true });
const server = await preview({ root: fileURLToPath(new URL('..', import.meta.url)), preview: { port: 4173, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://localhost:4173/?qa=story');
  await page.waitForFunction(() => window.__storyQA?.worldRouter?.activeZoneInstance);
  const capture = async name => {
    await page.evaluate(() => window.__storyQA.captureView({
      position: [15.2, 1.7, -6.2], target: [13, 1.18, -8.55], anchorName: 'ER_GhostRegistrationTerminal'
    }));
    await page.waitForTimeout(160);
    await page.screenshot({ path: `${output}/${name}.png` });
  };
  await page.evaluate(() => window.__storyQA.load('first_campus_2f', 'm4_2f_er_triage'));
  await capture('before');
  const before = await page.evaluate(() => ({
    paperVisible: window.__storyQA.worldRouter.activeZoneInstance.ghostRegistrationSlip.visible,
    interactable: window.__storyQA.worldRouter.activeZoneInstance.ghostRegistrationTerminal.userData.interactable
  }));
  await page.evaluate(() => window.__storyQA.setFlag('GHOST_REGISTRATION_AVAILABLE', true));
  await page.evaluate(() => window.__storyQA.worldRouter.activeZoneInstance.syncStoryState());
  await capture('after');
  const after = await page.evaluate(() => {
    const zone = window.__storyQA.worldRouter.activeZoneInstance;
    const image = zone.ghostRegistrationScreen.material.map.image;
    const context = image.getContext('2d');
    const pixels = context.getImageData(0, 0, image.width, image.height).data;
    let variance = 0;
    let sum = 0;
    for (let i = 0; i < pixels.length; i += 4) sum += pixels[i] + pixels[i + 1] + pixels[i + 2];
    const mean = sum / (pixels.length / 4 * 3);
    for (let i = 0; i < pixels.length; i += 4) {
      const value = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      variance += (value - mean) ** 2;
    }
    return {
      paperVisible: zone.ghostRegistrationSlip.visible,
      interactable: zone.ghostRegistrationTerminal.userData.interactable,
      screenVariance: variance / (pixels.length / 4),
      textureNeedsUpdate: zone.ghostRegistrationScreen.material.map.version > 0
    };
  });
  assert.deepEqual(before, { paperVisible: false, interactable: false });
  assert.equal(after.paperVisible, true);
  assert.equal(after.interactable, true);
  assert.ok(after.screenVariance > 100);
  assert.equal(after.textureNeedsUpdate, true);
  assert.deepEqual(errors, []);
  const report = { verdict: 'PASS', before, after, errors, screenshots: ['before.png', 'after.png'] };
  await writeFile(`${output}/result.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
