import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { DEBUG_SPAWN_POINTS } from '../src/world/shared/DebugSpawnPoints.js';

const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/capture-visual-qa.mjs <output-directory> [spawn-prefix]');
const prefix = process.argv[3] || '';
const server = await preview({ root: fileURLToPath(new URL('..', import.meta.url)), preview: { port: 4173, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const captures = [];
try {
  await mkdir(output, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if(message.type()==='error')errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('http://localhost:4173/');
  await page.waitForFunction(() => window.worldRouter?.activeZoneInstance);
  if (await page.locator('#debug-zone-selector').count()) throw new Error('Public build exposes modeling selector');
  await page.keyboard.press('Backquote');
  if (await page.locator('#debug-panel').isVisible()) throw new Error('Public build exposes debug panel');
  await page.waitForTimeout(8000);
  for (const [id, spawn] of Object.entries(DEBUG_SPAWN_POINTS).filter(([id]) => id.startsWith(prefix))) {
    for (const [view, yawDelta, pitchDelta, fov] of [['entrance', 0, 0, 68], ['mid', .6, 0, 68], ['detail', 0, .12, 36], ['junction', -.55, .32, 68]]) {
      await page.evaluate(({ id, yawDelta, pitchDelta, fov }) => {
        const router = window.worldRouter;
        router.teleportToSpawn(id);
        router.controller.yaw += yawDelta;
        router.controller.pitch += pitchDelta;
        router.controller.updateCameraRotation();
        router.camera.fov = fov;
        router.camera.updateProjectionMatrix();
      }, { id, yawDelta, pitchDelta, fov });
      await page.waitForTimeout(120);
      const filename = `${id}_${view}.png`;
      const bytes = await page.screenshot({ path: `${output}/${filename}` });
      const variation = await page.evaluate(async base64 => {
        const picture = new Image(); picture.src = 'data:image/png;base64,' + base64; await picture.decode();
        const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d'); ctx.drawImage(picture, picture.width*.25, picture.height*.25, picture.width*.5, picture.height*.5, 0, 0, 64, 64);
        const pixels = ctx.getImageData(0,0,64,64).data; let sum=0, squares=0;
        for(let i=0;i<pixels.length;i+=4){const value=(pixels[i]+pixels[i+1]+pixels[i+2])/3;sum+=value;squares+=value*value;}
        return {mean:sum/4096,variance:squares/4096-(sum/4096)**2};
      }, bytes.toString('base64'));
      if(variation.mean<8 || variation.variance<4)errors.push('Blank or severely underexposed render: '+filename);
      captures.push({ id, zone: spawn.zoneId, view, filename, variation });
    }
  }
  await page.goto('http://localhost:4173/?debug=1');
  await page.waitForSelector('#debug-zone-selector');
  await writeFile(`${output}/capture-manifest.json`, JSON.stringify({ browser: browser.version(), captures, errors, productionDebugHidden: true, explicitDebugAvailable: true, note: 'Detail is narrower FOV at identical standing position; junction is rotated camera, not a new collision probe.' }, null, 2));
  if (errors.length) throw new Error(JSON.stringify(errors));
  console.log(JSON.stringify({ captures: captures.length, errors, productionDebugHidden: true }));
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
