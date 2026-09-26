import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { fileURLToPath } from 'node:url';

const server = await preview({
  root: fileURLToPath(new URL('..', import.meta.url)),
  preview: { port: 4173, strictPort: true }
});
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:4173/?qa=story');
  await page.waitForFunction(() => window.__storyQA?.cinematicDirector);

  const result = await page.evaluate(async () => {
    const qa = window.__storyQA;
    const start = { yaw: qa.controller.yaw, pitch: qa.controller.pitch };
    let cueCount = 0;
    const played = await qa.cinematicDirector.play({
      id: 'QA_DIRECTOR_RESTORE',
      durationMs: 180,
      keyframes: [{ at: .5, yaw: .12, pitch: .04 }, { at: 1, yaw: 0, pitch: 0 }],
      cues: [{ at: .3, run: () => { cueCount += 1; } }]
    });
    const after = {
      enabled: qa.controller.enabled,
      yaw: qa.controller.yaw,
      pitch: qa.controller.pitch,
      played: qa.gameState.getFlag('CG_QA_DIRECTOR_RESTORE_PLAYED'),
      active: qa.gameState.getFlag('CG_QA_DIRECTOR_RESTORE_ACTIVE')
    };
    const replayed = await qa.cinematicDirector.play({ id: 'QA_DIRECTOR_RESTORE', durationMs: 50 });
    return { start, after, played, replayed, cueCount };
  });

  assert.equal(result.played, true);
  assert.equal(result.replayed, false);
  assert.equal(result.cueCount, 1);
  assert.equal(result.after.enabled, true);
  assert.equal(result.after.played, true);
  assert.equal(result.after.active, false);
  assert.ok(Math.abs(result.after.yaw - result.start.yaw) < 1e-8);
  assert.ok(Math.abs(result.after.pitch - result.start.pitch) < 1e-8);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ verdict: 'PASS', ...result, errors }));
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
