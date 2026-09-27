import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = process.argv[2] || 'qa-results/LOADING_PERFORMANCE_V2.csv';
const publicUrl = process.argv[3];
const server = publicUrl ? null : await preview({ root: fileURLToPath(new URL('..', import.meta.url)), preview: { port: 4173, strictPort: true } });
const url = publicUrl || 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const routes = [
  ['first_campus_3f', 'first_campus_4f'],
  ['first_campus_4f', 'first_campus_2f'],
  ['first_campus_2f', 'first_campus_3f'],
  ['first_campus_3f', 'first_campus_1f'],
  ['second_campus_5f', 'second_campus_2f']
];
const rows = [];
const errors = [];
let activeSample = null;

async function saveResults(verdict) {
  const fields = ['fromZone','toZone','coldOrWarm','sourcePreparationMs','essentialBytes','optionalBytes','elevatorAnimationMs','extraWaitMs','totalTransitionMs','transitionStart','essentialReady','zoneBuilt','transitionEnd','status'];
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, [fields.join(','), ...rows.map(row => fields.map(field => row[field] ?? '').join(','))].join('\n') + '\n');
  await writeFile(output.replace(/\.csv$/, '.json'), JSON.stringify({ verdict: errors.length ? 'FAIL' : verdict, url, activeSample, rows, errors, browser: browser.version() }, null, 2));
}


async function visit(page, fromZone, toZone, coldOrWarm) {
  console.log(`Measuring ${coldOrWarm} ${fromZone} → ${toZone}`);
  activeSample.phase = 'source-material-readiness';
  await saveResults('IN_PROGRESS');
  const sourcePreparationStart = Date.now();
  await page.evaluate(zone => window.__storyQA.load(zone), fromZone);
  await page.waitForFunction(zone => {
    const audit = window.__materialAudit();
    const surfaces = audit.materials.filter(item => ['wall', 'wallDark', 'floor', 'floorTile', 'floorWood', 'doorWood', 'ceiling', 'handrail'].includes(item.materialName.slice(9)));
    return audit.zoneId === zone && surfaces.length > 0 && surfaces.every(item => item.hasMap && item.hasNormalMap && item.hasRoughnessMap && item.mapImageWidth > 0);
  }, fromZone, { timeout: 300000 });
  const sourcePreparationMs = Date.now() - sourcePreparationStart;
  await page.evaluate(zone => {
    const qa = window.__storyQA;
    qa.setFlag('STAFF_ACCESS_CARD', true);
    for (const task of ['KEY_PICKUP', 'DUTY_LOG', 'E_HANDOFF']) qa.task(task);
    const router = qa.worldRouter;
    const loadZone = router.loadZone.bind(router);
    router.loadZone = (...args) => {
      window.__perfEssentialReady = performance.now();
      const result = loadZone(...args);
      window.__perfZoneBuilt = performance.now();
      return result;
    };
    qa.interact({ type: 'elevator' });
  }, fromZone);
  const button = page.locator(`button[data-floor="${toZone}"]`);
  await button.waitFor();
  if (await button.isDisabled()) throw new Error(`${fromZone} → ${toZone} is locked`);
  await page.evaluate(toZone => {
    document.querySelector(`button[data-floor="${toZone}"]`).addEventListener('click', () => {
      window.__perfTransitionStart = performance.now();
    }, { capture: true, once: true });
  }, toZone);
  activeSample.phase = 'destination-transition';
  await saveResults('IN_PROGRESS');
  await button.click();
  try {
    await page.waitForFunction(toZone => window.worldRouter.activeZoneId === toZone && document.querySelector('#elevator-cutscene')?.classList.contains('active') === false, toZone, { timeout: 300000 });
  } catch (error) {
    const state = await page.evaluate(() => ({ zone: window.worldRouter.activeZoneId, transition: document.querySelector('#elevator-cutscene')?.className, status: document.querySelector('#elevator-status-text')?.textContent,
      transitionStart: window.__perfTransitionStart, essentialReady: window.__perfEssentialReady, zoneBuilt: window.__perfZoneBuilt, transitionEnd: performance.now() }));
    errors.push(`${fromZone} → ${toZone} ${coldOrWarm}: transition unresolved after 300 seconds; ${JSON.stringify(state)}`);
    rows.push({ fromZone, toZone, coldOrWarm, sourcePreparationMs, essentialBytes: 0, optionalBytes: 0, elevatorAnimationMs: 1700,
      extraWaitMs: '', totalTransitionMs: state.transitionEnd - state.transitionStart,
      transitionStart: state.transitionStart, essentialReady: state.essentialReady,
      zoneBuilt: state.zoneBuilt, transitionEnd: state.transitionEnd, status: 'TIMEOUT' });
    return false;
  }
  const data = await page.evaluate(() => {
    const start = window.__perfTransitionStart;
    const ready = window.__perfEssentialReady;
    const built = window.__perfZoneBuilt;
    const end = performance.now();
    const resources = performance.getEntriesByType('resource').filter(resource => resource.startTime >= start && resource.startTime <= end);
    const bytes = list => list.reduce((sum, item) => sum + (item.transferSize || 0), 0);
    return { transitionStart: start, essentialReady: ready, zoneBuilt: built, transitionEnd: end,
      essentialBytes: bytes(resources.filter(item => item.startTime <= ready)),
      optionalBytes: bytes(resources.filter(item => item.startTime > ready)),
      elevatorAnimationMs: 1700, extraWaitMs: Math.max(0, ready - start - 1700), totalTransitionMs: end - start };
  });
  if (data.totalTransitionMs >= 10000) errors.push(`${fromZone} → ${toZone} ${coldOrWarm}: ${Math.round(data.totalTransitionMs)}ms`);
  rows.push({ fromZone, toZone, coldOrWarm, sourcePreparationMs, ...data });
  return true;
}

try {
  for (const [fromZone, toZone] of routes) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const coldOrWarm of ['cold', 'warm']) {
      activeSample = { fromZone, toZone, coldOrWarm, phase: 'boot' };
      await saveResults('IN_PROGRESS');
      const bootStart = Date.now();
      await page.goto(`${url}${url.includes('?') ? '&' : '?'}qa=story`, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForFunction(() => window.__storyQA?.worldRouter?.activeZoneInstance, null, { timeout: 120000 });
      if (fromZone === 'first_campus_3f' && toZone === 'first_campus_4f') {
        rows.push({ fromZone: 'BOOT', toZone: 'first_campus_3f', coldOrWarm,
          essentialBytes: await page.evaluate(() => performance.getEntriesByType('resource').reduce((sum, item) => sum + (item.transferSize || 0), 0)),
          optionalBytes: 0, elevatorAnimationMs: 0, extraWaitMs: 0, totalTransitionMs: Date.now() - bootStart });
      }
      const completed = await visit(page, fromZone, toZone, coldOrWarm);
      await saveResults('IN_PROGRESS');
      if (!completed) break; // An unfinished cold run cannot establish a warm cache.
    }
    await context.close();
  }
  await saveResults('PASS');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`LOADING PERFORMANCE ${errors.length ? 'BASELINE FAIL' : 'PASS'}: ${rows.length} cold/warm route samples, ${errors.length} errors`);
} catch (error) {
  errors.push(`${JSON.stringify(activeSample)}: ${error.stack || error.message}`);
  await saveResults('FAIL');
  throw error;
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
}
