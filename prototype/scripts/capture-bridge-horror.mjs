import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const out = process.argv[2] || 'qa-results/bridge-horror';
await mkdir(out, { recursive: true });
const publicUrl=process.argv[3];
const base=publicUrl||'http://localhost:4173/';
const server = publicUrl?null:await preview({ root: fileURLToPath(new URL('..', import.meta.url)), preview: { port: 4173, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = {errors:[],sourceSha:process.env.GITHUB_SHA||'working-tree'};
try {
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)report.errors.push(`${response.status()} ${response.url()}`);});
  report.build=await (await page.request.get(new URL('build-info.json',base).href)).json();
  if(process.env.GITHUB_SHA)assert.equal(report.build.commit,process.env.GITHUB_SHA);
  await page.goto(base+'?qa=story');
  await page.waitForFunction(() => !!window.__storyQA);
  await page.evaluate(() => window.__storyQA.prefetch({ zoneId: 'skybridge' }));
  for (const [name, returnTrip, looks] of [['outbound', false, 0], ['return-stage-1', true, 0], ['return-stage-2', true, 1], ['return-stage-3', true, 2]]) {
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
    await page.waitForFunction(()=>{
      const surfaces=window.__materialAudit().materials.filter(item=>['wall','wallDark','floor','floorTile','floorWood','doorWood','ceiling','handrail','terrainGrass','pathGravel'].includes(item.materialName.slice(9)));
      return surfaces.length>0&&surfaces.every(item=>item.flatMeshCount===0&&item.pbrMeshCount===item.meshCount&&item.mapImageWidth>0);
    },null,{timeout:300000});
    report[name].materials=await page.evaluate(()=>window.__materialAudit());
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${name}.png` });
  }
  assert.equal(report.outbound.fogDensity, 0);
  assert.equal(report.outbound.tiltedFixtures, 0);
  assert(report['return-stage-1'].fogDensity > 0);
  assert(report['return-stage-3'].fogDensity > report['return-stage-1'].fogDensity);
  assert(report['return-stage-3'].tiltedFixtures >= 3);
  assert(report.outbound.starOpacity > .5);
  assert.deepEqual(report.errors,[]);
  report.verdict = 'PASS';
} catch (error) {
  report.verdict = 'FAIL';
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  await writeFile(`${out}/result.json`, JSON.stringify(report, null, 2));
  await browser.close();
  if(server)await new Promise(resolve => server.httpServer.close(resolve));
}
console.log(JSON.stringify(report));
