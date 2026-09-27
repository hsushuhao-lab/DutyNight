// FinalSuccessDirector.js
// Perfect-ending recap shown only after the correct final 316 authorization.

const SUCCESS_BEATS=Object.freeze([
  Object.freeze({
    stamp:'1998.10.12 · 16:39',
    place:'3F 行政辦公室',
    title:'有人改過值班名冊',
    body:'謝玉琴整理原始紙本名冊時，第一線欄位仍然存在。李承禮之後以紅筆修改資料；同一批照片中，張守恆的身影又被從沖洗後補片刮除。',
    evidence:'真相不是「沒有這個人」，而是有人讓紀錄看起來像他從未存在。',
    visual:'roster', cue:'paper'
  }),
  Object.freeze({
    stamp:'20:13–20:16',
    place:'2F 急診',
    title:'劉志遠不是無名氏',
    body:'燒焦吊牌確認他是工務機電技師劉志遠 ENG-860214。他反覆提到 6F、B-Panel、紫色備援與排煙；張守恆則拒絕在身分尚未確認時建立新的病歷。',
    evidence:'劉志遠留下的是工程警告，不是一筆可以被抹去的匿名掛號。',
    visual:'er', cue:'beep'
  }),
  Object.freeze({
    stamp:'00:50–00:54',
    place:'第二院區值班室',
    title:'周啟文的警告沒有送達',
    body:'周啟文寫了一張以「守恆」開頭的便條。張守恆在另一端等待；陳柏勳仍在處理跨院區文件。便條最後掉在門邊，被鞋底踩過。',
    evidence:'有人察覺事情不對，但警告晚了一步。',
    visual:'note', cue:'paper'
  }),
  Object.freeze({
    stamp:'01:36–01:43',
    place:'夜間警衛系統',
    title:'B-Panel 與紫色備援確實存在',
    body:'王世榮把 B-Panel 十字鑰匙掛回警衛台。劉志遠要求解除地下排煙通道門禁，但夜間規章要求書面批示；幾分鐘後，他改搭電梯前往被現行院圖刪掉的六樓。',
    evidence:'門禁、排煙與六樓不是傳說，而是事故前真正存在的系統。',
    visual:'panel', cue:'lock'
  }),
  Object.freeze({
    stamp:'01:42 之後',
    place:'6F 臨床技能教學室',
    title:'被抹去的樓層仍留下影像',
    body:'監控拍到劉志遠進入 6F。損壞錄影裡，Annie 仍躺在技能教學床；走廊外的劉志遠反覆指向配電方向，嘴型像在說「排煙」。',
    evidence:'六樓被從院圖移除，但影像、器材與 Annie 都留下了它曾存在的證據。',
    visual:'skills', cue:'beep'
  }),
  Object.freeze({
    stamp:'02:16:48–02:17:00',
    place:'第一院區 1F 警衛台',
    title:'所有線索在 02:17 交會',
    body:'王世榮、周啟文、張守恆與李承禮的動線在警衛台附近收束。409-A 仍被系統當成有效病床；02:17:00，監控突然全黑。',
    evidence:'21:17、316、409 最後都指向同一件事：紀錄與真實空間已經不再一致。',
    visual:'blackout', cue:'phone'
  }),
  Object.freeze({
    stamp:'火災後封存底稿',
    place:'最後位置',
    title:'八個名字終於被放回同一張圖',
    body:'張守恆：4F 409-A；李承禮：1F B-Panel；周啟文：1F–3F 逃生梯；王世榮：1F 警衛台；陳柏勳：天橋中段；林婉真：4F 護理站；謝玉琴：3F 文史室；劉志遠：B2 地下排煙道通風口。',
    evidence:'八名罹難者都屬於同一場夜班事故，沒有任何一個人應該被匿名化或從紀錄中消失。',
    visual:'map', cue:'knock'
  }),
  Object.freeze({
    stamp:'現在',
    place:'316 舊終端',
    title:'覆寫完成',
    body:'你用真正的姓名與員編把錯誤病歷鏈反向覆寫。409-A 不再是你的唯一身分；張守恆 MED-870409 被重新寫回原始夜班紀錄，八名罹難者姓名也一併恢復。',
    evidence:'你不是從醫院裡逃出去；你把被改寫的紀錄改回了正確的樣子。',
    visual:'restore', cue:'beep'
  })
]);

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export class FinalSuccessDirector{
  constructor({soundManager=null}={}){
    this.soundManager=soundManager;
    this.active=false;
    this.advanceResolve=null;
    this.choiceVisible=false;
    this.root=this.#build();
    this.keyHandler=event=>this.#onKey(event);
    document.addEventListener('keydown',this.keyHandler,true);
  }

  #build(){
    const style=document.createElement('style');
    style.id='final-success-recap-style';
    style.textContent=[
      '.final-success-recap{position:fixed;inset:0;z-index:26100;display:none;background:radial-gradient(circle at 72% 17%,rgba(224,177,112,.16),transparent 28%),linear-gradient(180deg,#0d1517 0%,#182424 48%,#42382e 100%);color:#eee7d8;font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;overflow:hidden}',
      '.final-success-recap.active{display:block}',
      '.fsr-vignette{position:absolute;inset:0;box-shadow:inset 0 0 190px rgba(0,0,0,.82);pointer-events:none}',
      '.fsr-stage{position:absolute;inset:0;display:grid;grid-template-columns:minmax(280px,.9fr) minmax(500px,1.5fr);gap:5vw;align-items:center;padding:7vh 8vw;opacity:0;transform:translateY(12px);transition:opacity .34s ease,transform .52s ease}',
      '.fsr-stage.visible{opacity:1;transform:translateY(0)}',
      '.fsr-visual{height:min(52vh,510px);border:1px solid rgba(227,215,185,.25);background:rgba(10,16,15,.46);position:relative;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,.38)}',
      '.fsr-visual::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 3px,rgba(255,255,255,.022) 3px 4px);pointer-events:none}',
      '.fsr-visual .tag{position:absolute;left:22px;top:18px;color:#b6cbbd;font:13px monospace;letter-spacing:.08em}',
      '.fsr-visual .big{position:absolute;left:22px;right:22px;bottom:28px;font:600 clamp(28px,3.1vw,48px) Georgia,"Noto Serif TC",serif;line-height:1.18;color:#eee4d0}',
      '.fsr-visual .line{position:absolute;height:2px;background:rgba(180,205,189,.38);left:12%;right:12%}',
      '.fsr-visual .box{position:absolute;border:1px solid rgba(188,207,193,.38);background:rgba(78,99,84,.14)}',
      '.fsr-visual.restore{background:radial-gradient(circle at 50% 50%,rgba(94,150,116,.24),transparent 36%),rgba(10,22,17,.72)}',
      '.fsr-visual.blackout{background:#050705}.fsr-visual.blackout .big{color:#9bb09e}',
      '.fsr-copy .stamp{font:600 16px monospace;color:#a8c0af;letter-spacing:.06em;margin-bottom:8px}',
      '.fsr-copy .place{font-size:14px;color:#b4aa9b;letter-spacing:.14em;margin-bottom:22px}',
      '.fsr-copy h1{font-family:Georgia,"Noto Serif TC","PMingLiU",serif;font-weight:500;font-size:clamp(34px,4.2vw,68px);line-height:1.15;margin:0 0 24px}',
      '.fsr-copy .body{font-size:clamp(17px,1.4vw,23px);line-height:1.95;color:#d8d3c8}',
      '.fsr-copy .evidence{margin-top:28px;border-left:3px solid #bd9b69;background:rgba(96,72,48,.18);padding:16px 20px;color:#e1c99f;font-family:Georgia,"Noto Serif TC",serif;line-height:1.75}',
      '.fsr-progress{position:absolute;left:8vw;right:8vw;bottom:5vh;display:flex;gap:7px}.fsr-dot{height:3px;flex:1;background:#30403a}.fsr-dot.done{background:#829b8b}.fsr-dot.current{background:#d2ac70}',
      '.fsr-help{position:absolute;right:8vw;bottom:2.2vh;color:#879087;font:12px monospace;letter-spacing:.08em}',
      '.fsr-choice{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8vh 8vw}',
      '.fsr-choice.visible{display:flex}.fsr-choice .stamp{font:600 16px monospace;color:#b7ceb9;letter-spacing:.08em;margin-bottom:14px}',
      '.fsr-choice h2{font-family:Georgia,"Noto Serif TC","PMingLiU",serif;font-size:clamp(40px,5vw,78px);font-weight:500;margin:0 0 18px;letter-spacing:.04em}',
      '.fsr-choice p{max-width:860px;font-size:clamp(17px,1.4vw,23px);line-height:1.9;color:#d7d1c5;margin:0 0 30px}',
      '.fsr-buttons{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}.fsr-buttons button{min-width:min(340px,80vw);padding:17px 22px;border:1px solid rgba(224,212,186,.32);background:#18221d;color:#eee8da;font-size:17px;cursor:pointer;transition:.18s ease}.fsr-buttons button:hover{transform:translateY(-2px);border-color:#d0aa6f;background:#202c25}',
      '.fsr-buttons .perfect{color:#f0d4a5;border-color:rgba(213,170,104,.58)}.fsr-buttons .replay{color:#c7dfcd;border-color:rgba(124,168,138,.48)}',
      '.fsr-final{font-family:Georgia,"Noto Serif TC",serif;font-size:clamp(27px,3vw,48px);line-height:1.6;white-space:pre-line}',
      '@media(max-width:780px){.fsr-stage{grid-template-columns:1fr;gap:3vh;padding:6vh 7vw}.fsr-visual{height:30vh}}'
    ].join('\n');
    document.head.appendChild(style);

    const root=document.createElement('div');
    root.id='final-success-recap';
    root.className='final-success-recap';
    root.innerHTML=[
      '<div class="fsr-vignette"></div>',
      '<div class="fsr-stage"></div>',
      '<div class="fsr-progress"></div>',
      '<div class="fsr-help">E / SPACE：繼續</div>',
      '<div class="fsr-choice"></div>'
    ].join('');
    document.body.appendChild(root);
    return root;
  }

  #onKey(event){
    if(!this.active||this.choiceVisible)return;
    if(!['KeyE','Space','Enter'].includes(event.code)||event.repeat)return;
    event.preventDefault();
    event.stopImmediatePropagation?.();
    this.advanceResolve?.();
  }

  #playCue(cue){
    const s=this.soundManager;
    if(!s)return;
    if(cue==='paper')s.playPaperSign?.();
    else if(cue==='beep')s.playComputerBeep?.();
    else if(cue==='phone')s.playPhoneRingPattern?.();
    else if(cue==='lock')s.playDoorLockClack?.();
    else if(cue==='knock')s.playBed33KnockPattern?.(.055);
  }

  #buildVisual(beat){
    const visual=document.createElement('div');
    visual.className='fsr-visual '+(beat.visual||'');
    const tag=document.createElement('div');tag.className='tag';tag.textContent=beat.place.toUpperCase();
    const big=document.createElement('div');big.className='big';
    const labels={
      roster:'ROSTER / REDACTION',
      er:'ENG-860214',
      note:'守恆',
      panel:'B-PANEL',
      skills:'6F / SKILL LAB',
      blackout:'02:17:00 / SIGNAL LOST',
      map:'8 NAMES / FINAL LOCATIONS',
      restore:'RECORD RESTORED'
    };
    big.textContent=labels[beat.visual]||beat.title;
    visual.append(tag,big);
    for(let i=0;i<4;i++){
      const line=document.createElement('span');line.className='line';line.style.top=(24+i*13)+'%';line.style.opacity=String(.55-i*.08);visual.appendChild(line);
    }
    if(['roster','er','panel','map'].includes(beat.visual)){
      for(let i=0;i<3;i++){
        const box=document.createElement('span');box.className='box';box.style.left=(13+i*25)+'%';box.style.top=(43+(i%2)*9)+'%';box.style.width='18%';box.style.height=(18+i*4)+'%';visual.appendChild(box);
      }
    }
    return visual;
  }

  async #showBeat(beat,index,total){
    const stage=this.root.querySelector('.fsr-stage');
    const progress=this.root.querySelector('.fsr-progress');
    progress.replaceChildren();
    for(let i=0;i<total;i++){
      const dot=document.createElement('span');
      dot.className='fsr-dot '+(i<index?'done':i===index?'current':'');
      progress.appendChild(dot);
    }

    stage.className='fsr-stage';
    stage.replaceChildren();
    stage.appendChild(this.#buildVisual(beat));

    const copy=document.createElement('div');copy.className='fsr-copy';
    const stamp=document.createElement('div');stamp.className='stamp';stamp.textContent=beat.stamp;
    const place=document.createElement('div');place.className='place';place.textContent=beat.place;
    const title=document.createElement('h1');title.textContent=beat.title;
    const body=document.createElement('div');body.className='body';body.textContent=beat.body;
    const evidence=document.createElement('div');evidence.className='evidence';evidence.textContent=beat.evidence;
    copy.append(stamp,place,title,body,evidence);
    stage.appendChild(copy);

    this.#playCue(beat.cue);
    void stage.offsetWidth;stage.classList.add('visible');
    await new Promise(resolve=>{
      const timer=setTimeout(resolve,3900);
      this.advanceResolve=()=>{clearTimeout(timer);resolve();};
    });
    this.advanceResolve=null;
    stage.classList.remove('visible');
    await wait(220);
  }

  #showChoice({onPerfect,onReplay}){
    this.choiceVisible=true;
    const choice=this.root.querySelector('.fsr-choice');
    this.root.querySelector('.fsr-stage')?.classList.remove('visible');
    this.root.querySelector('.fsr-progress')?.replaceChildren();
    this.root.querySelector('.fsr-help').textContent='選擇結局';
    choice.replaceChildren();

    const stamp=document.createElement('div');stamp.className='stamp';stamp.textContent='316 / WRITE COMPLETE';
    const title=document.createElement('h2');title.textContent='紀錄已經改回來了。';
    const body=document.createElement('p');body.textContent='409-A 的錯誤病人紀錄已失效，張守恆與另外七名罹難者重新回到原始夜班紀錄。你可以把這次覆寫視為真正的結束，也可以重新從 17:00 再走一次整個夜班。';
    const buttons=document.createElement('div');buttons.className='fsr-buttons';
    const perfect=document.createElement('button');perfect.className='perfect';perfect.textContent='已覆寫紀錄（完美結束）';
    const replay=document.createElement('button');replay.className='replay';replay.textContent='再體驗一次';

    perfect.addEventListener('click',async()=>{
      buttons.querySelectorAll('button').forEach(button=>button.disabled=true);
      this.#playCue('beep');
      title.textContent='PERFECT ENDING — RECORD RESTORED';
      body.className='fsr-final';
      body.textContent='張守恆　MED-870409\nIDENTITY RESTORED\n409-A RECORD INVALIDATED\n8 NAMES RESTORED';
      this.root.querySelector('.fsr-help').textContent='完美結束';
      await wait(1900);
      choice.classList.remove('visible');this.root.classList.remove('active');this.choiceVisible=false;this.active=false;
      onPerfect?.();
    },{once:true});

    replay.addEventListener('click',async()=>{
      buttons.querySelectorAll('button').forEach(button=>button.disabled=true);
      this.#playCue('paper');
      title.textContent='17:00';
      body.className='fsr-final';
      body.textContent='值班重新開始。\n這一次，你已經知道該注意什麼。';
      this.root.querySelector('.fsr-help').textContent='重新載入夜班…';
      await wait(1400);
      onReplay?.();
    },{once:true});

    buttons.append(perfect,replay);
    choice.append(stamp,title,body,buttons);
    choice.classList.add('visible');
  }

  async play({onPerfect,onReplay}={}){
    if(this.active)return false;
    this.active=true;this.choiceVisible=false;
    document.exitPointerLock?.();
    this.root.classList.add('active');
    this.root.querySelector('.fsr-choice')?.classList.remove('visible');
    this.root.querySelector('.fsr-help').textContent='E / SPACE：繼續';

    for(let i=0;i<SUCCESS_BEATS.length;i++)await this.#showBeat(SUCCESS_BEATS[i],i,SUCCESS_BEATS.length);
    this.#showChoice({onPerfect,onReplay});
    return true;
  }

  destroy(){
    document.removeEventListener('keydown',this.keyHandler,true);
    this.root?.remove();
    document.getElementById('final-success-recap-style')?.remove();
  }
}

export {SUCCESS_BEATS};
