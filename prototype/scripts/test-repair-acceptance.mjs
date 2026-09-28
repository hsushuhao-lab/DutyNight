import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {preview} from 'vite';

const output=process.argv[2]||'qa-results/repair-acceptance';
const supplied=process.argv[3];
await mkdir(output,{recursive:true});
const server=supplied?null:await preview({root:fileURLToPath(new URL('..',import.meta.url)),preview:{port:4173,strictPort:true}});
const base=(supplied||'http://localhost:4173/').replace(/\/+$/,'')+'/';
const browser=await chromium.launch({headless:true});
const report={sourceSha:process.env.GITHUB_SHA||'working-tree',base,method:'Production build with explicit QA fixtures; real raycast/E input, measured scene bounds and PNG captures.',checks:[],errors:[],screenshots:[]};

async function open(zone,spawn,flags={}){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'?qa=story',{waitUntil:'load',timeout:120000});
  await page.waitForFunction(()=>window.__storyQA?.worldRouter?.activeZoneInstance);
  await page.waitForTimeout(1300);
  await page.evaluate(async({zone,spawn,flags})=>{
    const q=window.__storyQA;
    await q.prefetch({zoneId:zone});
    for(const task of ['DUTY_LOG','E_HANDOFF','WARD_ENTRY'])q.task(task);
    for(const [key,value] of Object.entries(flags))q.setFlag(key,value);
    q.load(zone,spawn);
  },{zone,spawn,flags});
  return page;
}
async function pressReader(page,doorId){
  const aim=await page.evaluate(id=>{
    const q=window.__storyQA,door=q.worldRouter.activeZoneInstance.accessDoors[id];
    const p=door.readerSensor.getWorldPosition(q.controller.position.clone());
    q.controller.teleport(p.x,1.7,p.z+1.2);
    return q.lookAt(p.toArray());
  },doorId);
  assert.equal(aim.current,doorId+'_reader_sensor');
  await page.keyboard.press('e');
  return aim;
}
async function capture(page,file,view){
  if(view)await page.evaluate(v=>window.__storyQA.captureView(v),view);
  await page.screenshot({path:output+'/'+file,timeout:45000});
  report.screenshots.push(file);
}
async function check(name,fn){
  try{const detail=await fn();report.checks.push({name,status:'PASS',...detail});}
  catch(e){report.checks.push({name,status:'FAIL',error:e.stack});console.error(name,e.stack);}
  await writeFile(output+'/result.json',JSON.stringify(report,null,2));
}
try{
  for(const repeat of [false,true])await check('4F anonymous '+(repeat?'repeat':'first')+' report',async()=>{
    const page=await open('first_campus_4f','m3_4f_ward_gate',{FAST_PATH_3F:repeat});
    try{
      await pressReader(page,'first_ward');
      assert.equal(await page.evaluate(()=>window.__storyQA.gameState.isTaskComplete('P1_4F_REPORT')),false,'no card must not count as report');
      await page.evaluate(()=>window.__storyQA.task('KEY_PICKUP'));
      await pressReader(page,'first_ward');
      const result=await page.evaluate(()=>({reported:window.__storyQA.gameState.isTaskComplete('P1_4F_REPORT'),subtitle:document.getElementById('subtitle-text').textContent,hud:document.getElementById('hospital-hud-bar').textContent}));
      assert(result.reported);
      assert.doesNotMatch(result.subtitle,/張醫師|張守恆|守恆/);
      assert.doesNotMatch(result.hud,/第一線|一線|張守恆/);
      await capture(page,repeat?'4f-report-repeat.png':'4f-report-first.png');
      return result;
    }finally{await page.close();}
  });

  await check('21:17 completed record clears desk props',async()=>{
    const page=await open('first_campus_4f','m2_4f_duty_room');
    try{
      const view={anchorName:'Workstation_duty_desk',position:[-10,1.7,4.2],target:[-10.08,.9,3.08]};
      await capture(page,'duty-desk-before.png',view);
      await page.evaluate(()=>{const q=window.__storyQA;q.setFlag('BOOTSTRAP_2117_RESOLVED',true);q.setFlag('POST_2117_RETURN_TO_DUTY_ROOM',true);q.gameState.setGameTime('21:17');});
      await page.waitForFunction(()=>window.__storyQA.gameState.getFlag('PHONE_CALL_KIND')==='ER_GHOST_0033',null,{timeout:45000});
      await capture(page,'duty-desk-after.png',view);
      const bounds=await page.evaluate(()=>{
        const q=window.__storyQA,z=q.worldRouter.activeZoneInstance,ws=z.workstations.find(w=>w.id==='duty_desk');
        const box=o=>{
          if(!o)throw Error('Required desk prop missing');
          const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
          o.updateWorldMatrix(true,true);
          o.traverse(m=>{if(!m.geometry)return;m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;
            for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
              const p=q.controller.position.clone().set(x,y,z).applyMatrix4(m.matrixWorld).toArray();
              p.forEach((v,i)=>{min[i]=Math.min(min[i],v);max[i]=Math.max(max[i],v);});
            }
          });return {min,max};
        };
        const keyboard=ws.screen.children.find(o=>{if(!o.geometry)return false;o.geometry.computeBoundingBox();return Math.abs(o.geometry.boundingBox.max.x-o.geometry.boundingBox.min.x-.43)<.001;});
        return {paper:box(z.zoneGroup.getObjectByName('DutyRoom_2117_RecapRecord')),desk:box(ws.desk),keyboard:box(keyboard),coffee:box(ws.screen.getObjectByName('WorkstationCoffeeCup')),handle:box(ws.screen.getObjectByName('WorkstationCoffeeHandle')),phone:box(z.dutyPhone)};
      });
      const p=bounds.paper,d=bounds.desk;
      for(const axis of [0,2])assert(p.min[axis]>=d.min[axis]&&p.max[axis]<=d.max[axis],'paper must remain on the desktop');
      assert(p.min[1]>=d.max[1]&&p.max[1]-d.max[1]<.012,'paper must sit flat on the desktop');
      for(const name of ['keyboard','coffee','handle','phone']){
        const b=bounds[name];
        const overlap=[0,2].every(i=>Math.min(p.max[i],b.max[i])>Math.max(p.min[i],b.min[i]));
        assert(!overlap,'paper must not cover '+name);
      }
      return {bounds};
    }finally{await page.close();}
  });

  await check('2F escape door front, side and E interaction',async()=>{
    const page=await open('first_campus_2f','first_2f_stairs');
    try{
      const anchorName='StairDoorAssembly_first_campus_2f';
      await capture(page,'2f-stairs-front.png',{anchorName,position:[-13.7,1.7,7.5],target:[-16,1.45,7.5]});
      await capture(page,'2f-stairs-side.png',{anchorName,position:[-14.7,1.7,9.4],target:[-16,1.5,7.5]});
      const aim=await page.evaluate(()=>{const q=window.__storyQA;q.controller.teleport(-14.3,1.7,7.5);return q.lookAt([-16,1.18,7.5]);});
      assert.equal(aim.current,'first_campus_2f_stairs');
      await page.keyboard.press('e');
      await page.waitForFunction(()=>document.querySelector('#elevator-cutscene.active [data-floor]'));
      assert.match(await page.locator('#elevator-status-text').innerText(),/安全梯/);
      return {aim};
    }finally{await page.close();}
  });

  for(const door of ['second_ward','second_ward_inner','second_ward_glass'])await check('M4 report via '+door,async()=>{
    const page=await open('second_campus_5f','m8_second_campus_std',{BOOTSTRAP_2117_RESOLVED:true,POST_2117_DUTY_CALL_DONE:true,M3_316_DECODED:true,SECOND_CAMPUS_ACCESS:true,SECOND_CAMPUS_OBJECTIVE_ACTIVE:true});
    try{
      await page.evaluate(()=>{window.__storyQA.task('KEY_PICKUP');window.__storyQA.gameState.setGameTime('01:15');});
      assert.equal(await page.evaluate(()=>window.__storyQA.gameState.getFlag('SECOND_CAMPUS_5F_REPORTED')),false);
      const aim=await pressReader(page,door);
      const result=await page.evaluate(()=>({reported:window.__storyQA.gameState.getFlag('SECOND_CAMPUS_5F_REPORTED'),tasks:document.getElementById('task-panel').innerText}));
      assert(result.reported);assert.match(result.tasks,/504B[\s\S]*陳怡君/);
      await pressReader(page,door);
      assert.equal(await page.evaluate(()=>window.__storyQA.persistentMemory.data.journalNotes.filter(n=>n.id==='SECOND_5F_REPORT').length),1,'closing the gate must not create a second report');
      if(door==='second_ward')await capture(page,'m4-5f-door-report.png');
      return {aim,...result};
    }finally{await page.close();}
  });
  report.verdict=report.checks.every(c=>c.status==='PASS')&&report.errors.length===0?'PASS':'FAIL';
  if(report.verdict!=='PASS')process.exitCode=1;
}finally{
  await writeFile(output+'/result.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
  await browser.close();if(server)await new Promise(r=>server.httpServer.close(r));
}
