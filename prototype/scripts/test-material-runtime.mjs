import { chromium } from 'playwright';
import { preview } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import assert from 'node:assert/strict';

const output = process.argv[2] || 'qa-results/material-runtime.json';
const publicUrl = process.argv[3];
const server = publicUrl ? null : await preview({ root: fileURLToPath(new URL('..', import.meta.url)), preview: { port: 4173, strictPort: true } });
const url = publicUrl || 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const zones = [
  'first_campus_3f', 'first_campus_4f', 'first_campus_2f', 'first_campus_1f',
  'first_campus_8f', 'skybridge', 'second_campus_2f', 'second_campus_5f',
  'phantom_6f', 'b2_archive'
];
const results=[];const errors=[];const started=Date.now();let page;
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(`${url}${url.includes('?') ? '&' : '?'}debug=1`);
  await page.waitForFunction(() => window.worldRouter?.activeZoneInstance && typeof window.__materialAudit === 'function');
  await page.waitForFunction(() => window.__materialAudit().materials.some(item => item.materialName === 'hospital/wall' && item.hasMap), null, { timeout: publicUrl ? 300000 : 120000 });
  for (const zone of [...zones, 'first_campus_3f']) {
    await page.evaluate(zoneId => window.worldRouter.loadZone(zoneId), zone);
    await page.waitForFunction(zoneId => {
      const audit = window.__materialAudit();
      if (audit.zoneId !== zoneId) return false;
      return audit.materials
        .filter(item => ['wall', 'wallDark', 'floor', 'floorTile', 'floorWood', 'doorWood', 'ceiling', 'handrail', 'terrainGrass', 'pathGravel'].includes(item.materialName.slice(9)))
        .every(item => item.hasMap && item.hasNormalMap && item.hasRoughnessMap && item.mapImageWidth > 0 && item.mapImageHeight > 0);
    }, zone, { timeout: publicUrl ? 300000 : 120000 });
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
  await writeFile(output, JSON.stringify({ verdict: 'PASS', elapsedMs:Date.now()-started, results, errors }, null, 2));
  console.log(`MATERIAL RUNTIME PASS: ${results.length} zone visits`);
} catch(error) {
  await mkdir(dirname(output),{recursive:true});
  const current=page?await page.evaluate(()=>window.__materialAudit?.()).catch(()=>null):null;
  await writeFile(output,JSON.stringify({verdict:'FAIL',elapsedMs:Date.now()-started,results,current,errors:[...errors,error.message]},null,2));
  throw error;
} finally {
  await browser.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
}
