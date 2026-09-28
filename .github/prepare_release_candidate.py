from pathlib import Path
import subprocess
import textwrap

# Apply only the previously reviewed eight-file patch, with exact-match guards.
source = Path('.github/workflows/repair-workspace-export.yml').read_text()
command = source.split('      - name: Apply guarded targeted repairs\n', 1)[1].split('        run: |\n', 1)[1].split('      - name: Build and verify candidate geometry\n', 1)[0]
subprocess.run(['bash', '-e', '-c', textwrap.dedent(command)], check=True)

p = Path('prototype/scripts/test-b2-fail-forward.mjs')
s = p.read_text()
helper = """
// Observe the real state outside render-frame polling. Keep the same predicates
// and deadlines; slow WebGL frames must not hide an already-visible dialogue.
async function waitForPageCondition(predicate, arg, {timeout=30000}={}) {
  const deadline=Date.now()+timeout;
  do {
    if(await page.evaluate(predicate,arg))return;
    await new Promise(resolve=>setTimeout(resolve,100));
  } while(Date.now()<deadline);
  throw new Error(`B2 state condition timed out after ${timeout}ms`);
}
"""
assert 'async function waitForPageCondition' not in s
assert '\ntry {\n' in s
s = s.replace('\ntry {\n', '\n' + helper + '\ntry {\n', 1)
s = s.replace('await page.waitForFunction(', 'await waitForPageCondition(')
s = s.replace('  report.errors.push(error.stack || error.message);', "  report.errors.push(error.stack || error.message);\n  report.failureState=await page.evaluate(()=>({snapshot:window.__storyQA.snapshot(),dialogue:!!window.__storyQA.uiManager.dialogueSequence,cinematic:window.__storyQA.cinematicDirector.activeId,subtitle:document.getElementById('subtitle-text').textContent}));")
p.write_text(s)

p = Path('prototype/scripts/test-story-playthrough.mjs')
s = p.read_text()
start = s.index("  await interact({id:'B2_ARCHIVE_TERMINAL'});")
end = s.index('  s=await snap();', start)
s = s[:start] + """  // Fire recap is mandatory on first contact; identity comparison is second.
  await interact({id:'B2_ARCHIVE_TERMINAL'});
  await waitForPageCondition(page,()=>document.getElementById('b2-fire-recap')?.classList.contains('active'),30000);
  for(let i=0;i<24;i++){
    if(await q(()=>window.__storyQA.gameState.getFlag('B2_FIRE_RECAP_SEEN')))break;
    await page.waitForTimeout(360);await page.keyboard.press('E');
  }
  await waitForPageCondition(page,()=>window.__storyQA.gameState.getFlag('B2_FIRE_RECAP_SEEN')===true,30000);
  await interact({id:'B2_ARCHIVE_TERMINAL'});
  await waitForPageCondition(page,()=>document.getElementById('identity-matrix-modal')?.classList.contains('active'),30000);
  await domClick('#identity-candidate-ZHANG_SHOUHENG');
  await waitForPageCondition(page,()=>window.__storyQA.gameState.getFlag('M7_B2_RESOLVED')===true,30000);
  await domClick('#btn-close-identity-matrix');
""" + s[end:]
p.write_text(s)

notes = Path('docs/releases/2026-09-28.md')
notes.parent.mkdir(parents=True, exist_ok=True)
notes.write_text('''# DutyNight 2026.09.28 — 修正發布

- 護理站首次與回溯報到皆使用中性稱呼；HUD 不顯示第一線值班。
- 21:17 值班紀錄移至桌面左側，保留鍵盤、咖啡與電話的空間。
- 第一院區 2F 安全梯門與西牆門洞貼合，門把與標示朝向走廊，補齊門框上方牆體。
- 保留 Patientization 記憶錨點、M1 物品櫃、M2 報到與 M4 病人評估回溯流程。
- B2 不論辨識結果皆需完成文史室七頁核對，才開啟 316 末四碼驗證。
- 驗收改用實際病房感應門及先火災回放、後身分矩陣的現行流程；未放寬故事條件。

測試紀錄及發布 SHA 以本次 Release 附件與 GitHub Actions 記錄為準。
''')
