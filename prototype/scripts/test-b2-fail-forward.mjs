import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';

const output = process.argv[2] || 'qa-results/b2-fail-forward';
await mkdir(output, { recursive: true });

const publicUrl = process.argv[3];
const server = publicUrl ? null : await preview({
  root: fileURLToPath(new URL('..', import.meta.url)),
  preview: { port: 4173, strictPort: true }
});
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const report = { sourceSha: process.env.GITHUB_SHA || 'local-working-tree', started: new Date().toISOString(), verdict: 'FAIL', checkpoints: [], errors: [] };

try {
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(`${publicUrl || 'http://localhost:4173/'}?qa=story`);
  await page.waitForFunction(() => window.__storyQA?.worldRouter?.activeZoneInstance);
  await page.waitForFunction(()=>window.__materialAudit().materials.filter(m=>['hospital/wall','hospital/floorTile','hospital/doorWood'].includes(m.materialName)).every(m=>m.hasMap&&m.hasNormalMap&&m.hasRoughnessMap),null,{timeout:300000});

  await page.evaluate(() => {
    const qa = window.__storyQA;
    qa.load('b2_archive', 'b2_archive_entry');
    qa.interact({ type: 'b2_archive_terminal' });
  });
  await page.waitForFunction(()=>document.getElementById('identity-matrix-modal')?.classList.contains('active'),null,{timeout:30000});
  await page.locator('#identity-candidate-LI_CHENGLI').click();
  const firstAttempt = await page.evaluate(() => ({
    used: window.__storyQA.gameState.getFlag('B2_IDENTITY_ATTEMPT_USED'),
    resolved: window.__storyQA.gameState.getFlag('M7_B2_RESOLVED'),
    disabled: [...document.querySelectorAll('#identity-candidate-grid button')].every(button => button.disabled),
    status: document.querySelector('#identity-matrix-status')?.textContent || ''
  }));
  assert.deepEqual({ used: firstAttempt.used, resolved: firstAttempt.resolved, disabled: firstAttempt.disabled }, { used: true, resolved: false, disabled: true });
  assert.match(firstAttempt.status, /比對失敗|載入事故紀錄/);
  report.checkpoints.push({ id: 'ONE_ATTEMPT_ONLY', ...firstAttempt });
  await page.waitForFunction(()=>document.getElementById('b2-fire-recap')?.classList.contains('active'),null,{timeout:30000});
  for(let i=0;i<6;i++){
    await page.waitForTimeout(360);
    await page.keyboard.press('E');
  }
  await page.waitForFunction(()=>window.__storyQA.gameState.getFlag('B2_FIRE_RECAP_SEEN')===true,null,{timeout:30000});
  const recap=await page.evaluate(()=>({
    seen:window.__storyQA.gameState.getFlag('B2_FIRE_RECAP_SEEN'),
    overwrite:window.__storyQA.gameState.getFlag('RECORD_OVERWRITE_ACTIVE'),
    battle:window.__storyQA.gameState.getFlag('M8_IDENTITY_BATTLE_ACTIVE')
  }));
  assert.deepEqual(recap,{seen:true,overwrite:true,battle:true});
  report.checkpoints.push({id:'B2_FIRE_RECAP_AFTER_FAILED_IDENTITY',...recap});
  await page.screenshot({ path: `${output}/01-attempt-consumed.png` });

  await page.evaluate(() => window.__storyQA.interact({ type: 'b2_archive_terminal' }));
  await page.waitForTimeout(120);
  const retry = await page.evaluate(() => ({
    modalActive: document.querySelector('#identity-matrix-modal')?.classList.contains('active'),
    used: window.__storyQA.gameState.getFlag('B2_IDENTITY_ATTEMPT_USED'),
    subtitle: document.querySelector('#subtitle-text')?.textContent || document.body.textContent || ''
  }));
  assert.equal(retry.used, true);
  assert.equal(retry.modalActive, false);
  assert.match(retry.subtitle, /UNKNOWN SESSION|文史室|單向出口/);
  report.checkpoints.push({ id: 'TERMINAL_AFTER_RECAP_REDIRECTS_TO_HISTORY', ...retry, subtitle: retry.subtitle.slice(0, 180) });

  await page.evaluate(() => window.__storyQA.captureView({position:[0,1.65,-1.5],target:[0,1.2,2],anchorName:'B2_OneWayExitDoor'}));
  await page.evaluate(() => window.__storyQA.interact({ type: 'b2_exit_door' }));
  await page.waitForFunction(() => window.__storyQA.gameState.getFlag('CG_B2_PERMANENT_CLOSURE_ACTIVE'));
  await page.waitForTimeout(650);
  assert.equal(await page.evaluate(() => !!window.__storyQA.gameState.getFlag('CG_B2_PERMANENT_CLOSURE_ACTIVE')),true);
  await page.screenshot({ path: `${output}/02-b2-closure-active.png` });
  await page.waitForFunction(() => window.__storyQA.worldRouter.activeZoneId === 'first_campus_3f', null, { timeout: 15000 });
  const afterExit = await page.evaluate(() => window.__storyQA.snapshot());
  assert.equal(afterExit.flags.B2_EXITED_PERMANENTLY, true);
  assert.equal(afterExit.flags.B2_HISTORY_FALLBACK_ACTIVE, true);
  assert.equal(afterExit.flags.ARCHIVE_PERSONNEL_OBJECTIVE, true);
  assert.equal(afterExit.flags.M8_IDENTITY_BATTLE_ACTIVE, false);
  assert.equal(afterExit.flags.RECORD_OVERWRITE_ACTIVE, true);
  assert.equal(afterExit.flags.HIDDEN_SERVICE_DOOR_DISCOVERED, false);
  assert.equal(afterExit.flags.M7_B2_OPEN, false);
  report.checkpoints.push({ id: 'PERMANENT_EXIT_TO_MANDATORY_HISTORY', zone: afterExit.zone, flags: {
    B2_EXITED_PERMANENTLY: afterExit.flags.B2_EXITED_PERMANENTLY,
    B2_HISTORY_FALLBACK_ACTIVE: afterExit.flags.B2_HISTORY_FALLBACK_ACTIVE,
    M8_IDENTITY_BATTLE_ACTIVE: afterExit.flags.M8_IDENTITY_BATTLE_ACTIVE,
    RECORD_OVERWRITE_ACTIVE: afterExit.flags.RECORD_OVERWRITE_ACTIVE,
    HIDDEN_SERVICE_DOOR_DISCOVERED: afterExit.flags.HIDDEN_SERVICE_DOOR_DISCOVERED,
    M7_B2_OPEN: afterExit.flags.M7_B2_OPEN
  }});

  // Even with a failed B2 identity attempt, the player must complete the
  // post-B2 1998 personnel review before the 316 final authorization can open.
  await page.evaluate(() => window.__storyQA.interact({ id: 'ARCHIVE_PERSONNEL_1998' }));
  await page.waitForFunction(()=>document.getElementById('archive-modal')?.classList.contains('active'),null,{timeout:10000});
  for(let i=0;i<6;i++)await page.locator('#btn-archive-next').click();
  await page.waitForFunction(()=>window.__storyQA.gameState.getFlag('ARCHIVE_PERSONNEL_OBJECTIVE')===false,null,{timeout:10000});
  await page.locator('#btn-close-archive').click();
  const afterHistory=await page.evaluate(()=>window.__storyQA.snapshot());
  assert.equal(afterHistory.flags.HISTORY_PERSONNEL_PROFILES_REVIEWED,true);
  assert.equal(afterHistory.flags.B2_HISTORY_FALLBACK_ACTIVE,false);
  assert.equal(afterHistory.flags.M8_IDENTITY_BATTLE_ACTIVE,true);
  report.checkpoints.push({id:'MANDATORY_HISTORY_REVIEW_COMPLETE',flags:{
    HISTORY_PERSONNEL_PROFILES_REVIEWED:afterHistory.flags.HISTORY_PERSONNEL_PROFILES_REVIEWED,
    B2_HISTORY_FALLBACK_ACTIVE:afterHistory.flags.B2_HISTORY_FALLBACK_ACTIVE,
    M8_IDENTITY_BATTLE_ACTIVE:afterHistory.flags.M8_IDENTITY_BATTLE_ACTIVE
  }});

  await page.evaluate(() => {
    const q=window.__storyQA;
    const screen=q.worldRouter.activeZoneInstance.zoneGroup.getObjectByName('DutyTerminal_316_LegacyScreen');
    screen.updateWorldMatrix(true,false);
    const p=screen.matrixWorld.elements;
    q.controller.teleport(p[12]-1.6,1.7,p[14]);q.lookAt([p[12],p[13],p[14]]);
    window.__recapInputAudit={frames:0,violations:0};
    const audit=()=>{
      if(q.gameState.getFlag('CG_316_TRUE_NAME_FINAL_HANDOFF_ACTIVE')){
        window.__recapInputAudit.frames++;
        if(document.querySelector('#final-handoff-modal')?.classList.contains('active'))window.__recapInputAudit.violations++;
      }
      if(!q.gameState.getFlag('CG_316_TRUE_NAME_FINAL_HANDOFF_PLAYED'))requestAnimationFrame(audit);
    };
    requestAnimationFrame(audit);
    q.interact({type:'workstation'});
  });
  await page.waitForFunction(() => window.__storyQA.gameState.getFlag('CG_316_TRUE_NAME_FINAL_HANDOFF_ACTIVE'));
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(()=>!!window.__storyQA.gameState.getFlag('CG_316_TRUE_NAME_FINAL_HANDOFF_ACTIVE')),true,'capture must occur during the recap');
  await page.screenshot({ path: `${output}/03-316-pre-input-cinematic.png` });
  await page.waitForFunction(()=>window.__storyQA.gameState.getFlag('CG_316_TRUE_NAME_FINAL_HANDOFF_PLAYED'));
  const recapAudit=await page.evaluate(()=>window.__recapInputAudit);
  assert(recapAudit.frames>0,'recap must render active frames');
  assert.equal(recapAudit.violations,0,'identity input must remain closed throughout the active recap');
  report.checkpoints.push({id:'INPUT_LOCKED_DURING_RECAP',...recapAudit});
  while(await page.evaluate(()=>!!window.__storyQA.uiManager.dialogueSequence))await page.keyboard.press('e');
  await page.locator('#final-employee-id').fill('0409');
  await page.locator('#btn-submit-final-handoff').click();
  await page.waitForFunction(() => window.__storyQA.gameState.getFlag('GAME_COMPLETE') === true, null, { timeout: 10000 });
  await page.waitForFunction(() => document.querySelector('#ending-cg-screen')?.classList.contains('active'), null, { timeout: 10000 });
  const final = await page.evaluate(() => ({
    complete: window.__storyQA.gameState.getFlag('GAME_COMPLETE'),
    reconstructed: window.__storyQA.gameState.getFlag('M7_B2_RESOLVED'),
    fireRecapSeen: window.__storyQA.gameState.getFlag('B2_FIRE_RECAP_SEEN'),
    trueName: window.__storyQA.persistentMemory.data.trueName,
    gameComplete: window.__storyQA.persistentMemory.data.gameComplete,
    endingCgActive: document.querySelector('#ending-cg-screen')?.classList.contains('active')
  }));
  assert.deepEqual({ complete: final.complete, reconstructed: final.reconstructed, fireRecapSeen: final.fireRecapSeen, trueName: final.trueName, gameComplete: final.gameComplete }, {
    complete: true,
    reconstructed: true,
    fireRecapSeen: true,
    trueName: '張守恆',
    gameComplete: true
  });
  assert.equal(final.endingCgActive, true);
  report.checkpoints.push({ id: 'FINAL_316_AFTER_B2_FIRE_RECAP', ...final });
  await page.screenshot({ path: `${output}/02-ending-cg.png` });

  assert.deepEqual(report.errors, []);
  report.verdict = 'PASS';
} catch (error) {
  report.errors.push(error.stack || error.message);
  process.exitCode = 1;
} finally {
  report.finished = new Date().toISOString();
  await writeFile(`${output}/result.json`, JSON.stringify(report, null, 2));
  await browser.close();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
}

console.log(JSON.stringify(report));
