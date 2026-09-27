import { chromium } from 'playwright';
import { preview } from 'vite';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const output = process.argv[2] || 'qa-results/distant-landscape-current';
const base = process.argv[3] || 'http://localhost:4173/';
await mkdir(output, { recursive: true });
const server = process.argv[3] ? null : await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const report = { sourceSha:process.env.GITHUB_SHA || 'local-working-tree', errors:[], states:[] };

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  page.on('pageerror', error => report.errors.push(error.message));
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
    const state = await page.evaluate(value => {
      const qa=window.__storyQA;
      qa.gameState.setGameTime(value);
      qa.setFlag('M4_CHEST_RESOLVED',value!=='20:00');
      qa.setFlag('M5_BRIDGE_COMMITTED',value!=='20:00');
      const zone=qa.worldRouter.activeZoneInstance;
      zone.update(qa.controller.camera,.1);
      const landscape=zone.zoneGroup.getObjectByName('DistantNightLandscape');
      const names=[], forbidden=[];
      landscape?.traverse(o=>{names.push(o.name);if(o.isReflector||/Annie/i.test(o.name)||o.userData.interactable||o.userData.collider||o.userData.walkable||o.userData.storyTrigger)forbidden.push(o.name);});
      return {time:value,names,forbidden,registeredZones:Object.keys(qa.worldRouter.zones)};
    }, time);
    for(const name of ['Distant pond water','Distant pond boardwalk','Distant hillside silhouette','Distant hillside trail'])assert(state.names.includes(name),name);
    assert.equal(state.forbidden.length,0);
    assert(!state.registeredZones.includes('ecology_pond')&&!state.registeredZones.includes('hillside_route'));
    report.states.push(state);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${output}/${file}` });
  }
  assert.deepEqual(report.errors,[]);
  report.verdict='PASS';
  await writeFile(`${output}/result.json`,JSON.stringify(report,null,2));
} finally {
  await browser.close();
  if(server)await new Promise(resolve=>server.httpServer.close(resolve));
}
