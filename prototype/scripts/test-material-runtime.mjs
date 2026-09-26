import { chromium } from 'playwright';
import { preview } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import assert from 'node:assert/strict';

const output = process.argv[2] || 'qa-results/material-runtime.json';
const server = await preview({ root: fileURLToPath(new URL('..', import.meta.url)), preview: { port: 4173, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const zones = [
  'first_campus_3f', 'first_campus_4f', 'first_campus_2f', 'first_campus_1f',
  'first_campus_8f', 'skybridge', 'second_campus_2f', 'second_campus_5f',
  'phantom_6f', 'b2_archive'
];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('http://localhost:4173/?debug=1');
  await page.waitForFunction(() => window.worldRouter?.activeZoneInstance && typeof window.__materialAudit === 'function');
  await page.waitForFunction(() => window.__materialAudit().materials.some(item => item.materialName === 'hospital/wall' && item.hasMap), null, { timeout: 120000 });
  const results = [];
  for (const zone of [...zones, 'first_campus_3f']) {
    await page.evaluate(zoneId => window.worldRouter.loadZone(zoneId), zone);
    const audit = await page.evaluate(() => window.__materialAudit());
    assert.equal(audit.zoneId, zone);
    assert(audit.texturedMeshCount > 0, `${zone}: no textured meshes`);
    for (const item of audit.materials.filter(item => ['wall', 'wallDark', 'floor', 'floorTile', 'floorWood', 'doorWood', 'ceiling', 'handrail', 'terrainGrass', 'pathGravel'].includes(item.materialName.slice(9)))) {
      assert.equal(item.flatMeshCount, 0, `${zone}: ${item.materialName} uses flat meshes`);
      assert.equal(item.pbrMeshCount, item.meshCount, `${zone}: ${item.materialName} lacks PBR channels`);
      assert(item.mapImageWidth > 0 && item.mapImageHeight > 0, `${zone}: ${item.materialName} map not decoded`);
    }
    results.push(audit);
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ verdict: 'PASS', results, errors }, null, 2));
  console.log(`MATERIAL RUNTIME PASS: ${results.length} zone visits`);
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
