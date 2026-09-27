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

  await page.evaluate(() => {
    const qa = window.__storyQA;
    qa.load('b2_archive', 'b2_archive_entry');
    qa.interact({ type: 'b2_archive_terminal' });
  });
  await page.locator('#identity-candidate-LI_CHENGLI').click();
  const firstAttempt = await page.evaluate(() => ({
    used: window.__storyQA.persistentMemory.data.b2IdentityAttemptUsed,
    resolved: window.__storyQA.gameState.getFlag('M7_B2_RESOLVED'),
    disabled: [...document.querySelectorAll('#identity-candidate-grid button')].every(button => button.disabled),
    status: document.querySelector('#identity-matrix-status')?.textContent || ''
  }));
  assert.deepEqual({ used: firstAttempt.used, resolved: firstAttempt.resolved, disabled: firstAttempt.disabled }, { used: true, resolved: false, disabled: true });
  assert.match(firstAttempt.status, /機會已用盡/);
  report.checkpoints.push({ id: 'ONE_ATTEMPT_ONLY', ...firstAttempt });
  await page.screenshot({ path: `${output}/01-attempt-consumed.png` });

  await page.locator('#btn-close-identity-matrix').click();
  await page.evaluate(() => window.__storyQA.interact({ type: 'b2_archive_terminal' }));
  await page.waitForTimeout(100);
  const retry = await page.evaluate(() => ({
    modalActive: document.querySelector('#identity-matrix-modal')?.classList.contains('active'),
    used: window.__storyQA.persistentMemory.data.b2IdentityAttemptUsed,
    subtitle: document.querySelector('#subtitle-text')?.textContent || document.body.textContent || ''
  }));
  assert.equal(retry.used, true);
  assert.equal(retry.modalActive, false);
  assert.match(retry.subtitle, /永久鎖閉|嘗試已用盡/);
  report.checkpoints.push({ id: 'RETRY_BLOCKED', ...retry, subtitle: retry.subtitle.slice(0, 180) });

  await page.evaluate(() => window.__storyQA.interact({ type: 'b2_exit_door' }));
  await page.locator('#btn-story-primary').click();
  await page.waitForFunction(() => window.__storyQA.gameState.getFlag('CG_B2_PERMANENT_CLOSURE_ACTIVE'));
  await page.screenshot({ path: `${output}/02-b2-closure-active.png` });
  await page.waitForFunction(() => window.__storyQA.worldRouter.activeZoneId === 'first_campus_1f', null, { timeout: 15000 });
  const afterExit = await page.evaluate(() => window.__storyQA.snapshot());
  assert.equal(afterExit.flags.B2_EXITED_PERMANENTLY, true);
  assert.equal(afterExit.flags.B2_HISTORY_FALLBACK_ACTIVE, true);
  assert.equal(afterExit.flags.ARCHIVE_PERSONNEL_OBJECTIVE, true);
  assert.equal(afterExit.flags.HIDDEN_SERVICE_DOOR_DISCOVERED, false);
  assert.equal(afterExit.flags.M7_B2_OPEN, false);
  report.checkpoints.push({ id: 'PERMANENT_EXIT_TO_HISTORY', zone: afterExit.zone, flags: {
    B2_EXITED_PERMANENTLY: afterExit.flags.B2_EXITED_PERMANENTLY,
    B2_HISTORY_FALLBACK_ACTIVE: afterExit.flags.B2_HISTORY_FALLBACK_ACTIVE,
    ARCHIVE_PERSONNEL_OBJECTIVE: afterExit.flags.ARCHIVE_PERSONNEL_OBJECTIVE,
    HIDDEN_SERVICE_DOOR_DISCOVERED: afterExit.flags.HIDDEN_SERVICE_DOOR_DISCOVERED,
    M7_B2_OPEN: afterExit.flags.M7_B2_OPEN
  }});

  await page.evaluate(() => {
    const qa = window.__storyQA;
    qa.load('first_campus_3f', 'first_3f_316');
    qa.interact({ type: 'workstation' });
  });
  const blockedAt316 = await page.evaluate(() => document.querySelector('#final-handoff-modal')?.classList.contains('active'));
  assert.equal(blockedAt316, false);
  report.checkpoints.push({ id: '316_BLOCKED_BEFORE_HISTORY', finalModalActive: blockedAt316 });

  await page.evaluate(() => window.__storyQA.interact({ id: 'ARCHIVE_PERSONNEL_1998' }));
  while (await page.locator('#btn-archive-next').isEnabled()) await page.locator('#btn-archive-next').click();
  await page.locator('#btn-close-archive').click();
  const history = await page.evaluate(() => ({
    reviewed: window.__storyQA.gameState.getFlag('HISTORY_PERSONNEL_PROFILES_REVIEWED'),
    battle: window.__storyQA.gameState.getFlag('M8_IDENTITY_BATTLE_ACTIVE')
  }));
  assert.deepEqual(history, { reviewed: true, battle: true });
  report.checkpoints.push({ id: 'HISTORY_REQUIRED_AND_REVIEWED', ...history });

  await page.evaluate(() => window.__storyQA.interact({ type: 'workstation' }));
  await page.waitForFunction(() => window.__storyQA.gameState.getFlag('CG_316_TRUE_NAME_FINAL_HANDOFF_ACTIVE'));
  await page.screenshot({ path: `${output}/03-316-pre-input-cinematic.png` });
  await page.locator('#final-employee-id').fill('0409');
  await page.locator('#btn-submit-final-handoff').click();
  await page.waitForFunction(() => window.__storyQA.gameState.getFlag('GAME_COMPLETE') === true, null, { timeout: 10000 });
  await page.waitForFunction(() => document.querySelector('#ending-cg-screen')?.classList.contains('active'), null, { timeout: 10000 });
  const final = await page.evaluate(() => ({
    complete: window.__storyQA.gameState.getFlag('GAME_COMPLETE'),
    resolvedAt316: window.__storyQA.gameState.getFlag('M7_IDENTITY_RESOLVED_AT_316'),
    trueName: window.__storyQA.persistentMemory.data.trueName,
    gameComplete: window.__storyQA.persistentMemory.data.gameComplete,
    endingCgActive: document.querySelector('#ending-cg-screen')?.classList.contains('active')
  }));
  assert.deepEqual({ complete: final.complete, resolvedAt316: final.resolvedAt316, trueName: final.trueName, gameComplete: final.gameComplete }, {
    complete: true,
    resolvedAt316: true,
    trueName: '張守恆',
    gameComplete: true
  });
  assert.equal(final.endingCgActive, true);
  report.checkpoints.push({ id: 'FINAL_316_AFTER_HISTORY', ...final });
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
