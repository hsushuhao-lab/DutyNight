import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const out = process.argv[2] || 'qa-results/bridge-horror';
await mkdir(out, { recursive: true });
const server = await preview({ root: fileURLToPath(new URL('..', import.meta.url)), preview: { port: 4173, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = {};
try {
  await page.goto('http://localhost:4173/?qa=story');
  await page.waitForFunction(() => !!window.__storyQA);
  await page.evaluate(() => window.__storyQA.prefetch({ zoneId: 'skybridge' }));
  for (const [name, returnTrip, looks] of [['outbound', false, 0], ['return-stage-1', true, 0], ['return-stage-3', true, 2]]) {
    report[name] = await page.evaluate(({ returnTrip, looks }) => {
      const qa = window.__storyQA;
      qa.gameState.setGameTime('01:45');
      qa.gameState.setFlag('M4_CHEST_RESOLVED', returnTrip);
      qa.gameState.setFlag('M5_BRIDGE_COMMITTED', returnTrip);
      qa.load('skybridge');
      const zone = qa.worldRouter.activeZoneInstance;
      zone.lookbackCount = looks;
      qa.controller.teleport(returnTrip ? 41 : 20, 1.7, 0, 0);
      qa.lookAt([returnTrip ? 22 : 42, 1.7, 0]);
      zone.update(qa.controller.camera, .1);
      const sky = zone.zoneGroup.getObjectByName('Campus atmospheric sky');
      return {
        fogDensity: qa.worldRouter.scene.fog?.density || 0,
        tiltedFixtures: zone.bridgeFixtures.filter(light => Math.abs(light.fixture.rotation.z) > .01).length,
        starOpacity: sky.material.uniforms.starOpacity.value
      };
    }, { returnTrip, looks });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${name}.png` });
  }
  assert.equal(report.outbound.fogDensity, 0);
  assert.equal(report.outbound.tiltedFixtures, 0);
  assert(report['return-stage-1'].fogDensity > 0);
  assert(report['return-stage-3'].fogDensity > report['return-stage-1'].fogDensity);
  assert(report['return-stage-3'].tiltedFixtures >= 3);
  assert(report.outbound.starOpacity > .5);
  report.verdict = 'PASS';
} catch (error) {
  report.verdict = 'FAIL';
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  await writeFile(`${out}/result.json`, JSON.stringify(report, null, 2));
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
console.log(JSON.stringify(report));
