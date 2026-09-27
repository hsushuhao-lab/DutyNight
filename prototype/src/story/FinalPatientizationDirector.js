// FinalPatientizationDirector.js
// Final-failure-only cinematic: reveal the documented 1998 chain, then let the player
// choose permanent hospitalization or one more attempt to overwrite the active record.
// This director does not replace ordinary loop Patientization used elsewhere.

const HISTORY_BEATS=Object.freeze([
  Object.freeze({
    stamp:'1998.10.12 · 16:39',
    place:'3F 行政辦公室',
    title:'值班名冊被改動',
    body:'謝玉琴正在整理紙本名冊。李承禮以紅筆修改第一線欄位；同一批照片裡，一名年輕白袍醫師後來被從影像上刮除。',
    evidence:'不是「沒有這個人」，而是原始資料曾經有他。',
    cue:'paper'
  }),
  Object.freeze({
    stamp:'20:13–20:16',
    place:'2F 急診',
    title:'劉志遠帶著工務警告出現',
    body:'燒焦吊牌確認病人是工務機電技師劉志遠 ENG-860214。他反覆提到 6F、B-Panel、紫色備援與排煙；張守恆拒絕在身分未確認前建立新的病歷。',
    evidence:'「先確認他是誰。」',
    cue:'beep'
  }),
  Object.freeze({
    stamp:'00:50–00:54',
    place:'第二院區值班室',
    title:'周啟文的警告沒有送達',
    body:'周啟文急著寫下一張以「守恆」開頭的便條；張守恆在天橋方向等候，陳柏勳仍在核對跨院區文件。便條掉在門邊，最後被踩過。',
    evidence:'有人試圖警告張守恆，但那張紙沒有到他手上。',
    cue:'paper'
  }),
  Object.freeze({
    stamp:'01:36–01:43',
    place:'夜間警衛系統',
    title:'B-Panel 鑰匙仍在警衛端',
    body:'王世榮把 B-Panel 十字鑰匙掛回金屬鑰匙櫃。劉志遠要求解除地下排煙通道門禁；王世榮依夜間規章要求書面批示，沒有交付機房鑰匙。',
    evidence:'紫色備援與門禁不是傳說，而是當晚真正存在的設備。',
    cue:'lock'
  }),
  Object.freeze({
    stamp:'01:42 之後',
    place:'6F 臨床技能教學室',
    title:'現行樓層圖不存在的六樓',
    body:'監控拍到劉志遠提著工具箱進入電梯，樓層顯示「6」。受損教學錄影中，Annie 仍躺在技能教學床；走廊外的劉志遠指向配電方向，嘴型反覆像在說「排煙」。',
    evidence:'六樓曾經存在；後來才從現行院圖與日常紀錄中消失。',
    cue:'beep'
  }),
  Object.freeze({
    stamp:'02:16:48–02:16:58',
    place:'第一院區 1F 警衛台',
    title:'所有人最後一次被監控拍到',
    body:'王世榮仍在值勤簿前。周啟文衝入要求解除門禁；張守恆帶著病歷追上，系統仍把 409-A 當成有效病床紀錄；李承禮則翻開舊版緊急工務手冊。',
    evidence:'他們的最後位置已經開始分開。',
    cue:'phone'
  }),
  Object.freeze({
    stamp:'02:17:00',
    place:'B-Panel / 全院監控',
    title:'畫面全黑',
    body:'警衛監控在 02:17:00 瞬間中斷。留下來的資料只證明：舊手冊、B-Panel、排煙、409-A 與門禁異常在同一段時間交會。',
    evidence:'之後發生的事，只剩封存資料與最後位置能拼回來。',
    cue:'lock'
  }),
  Object.freeze({
    stamp:'火災後封存底稿',
    place:'罹難者位置圖',
    title:'八個人都沒有離開那一晚',
    body:'張守恆最後位置：4F 409-A；李承禮：1F B-Panel；周啟文：1F–3F 逃生梯；王世榮：1F 警衛台；陳柏勳：天橋中段；林婉真：4F 護理站；謝玉琴：3F 文史室；劉志遠：B2 地下排煙道通風口。',
    evidence:'共八名罹難者。沒有人從那一晚活著離開。',
    cue:'knock'
  }),
  Object.freeze({
    stamp:'現在',
    place:'409-A',
    title:'你為什麼又成了病人',
    body:'錯誤權限讓系統沿用當年的病歷邏輯：值班醫師身分被覆寫，409-A 的臨時病人紀錄反而成為唯一有效身分。你記得自己是醫師；系統卻只承認「病人」。',
    evidence:'如果不再改寫紀錄，這一次重演就會在這裡結束。',
    cue:'beep'
  })
]);

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export class FinalPatientizationDirector{
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
    style.id='final-patientization-history-style';
    style.textContent=[
      '.final-patient-history{position:fixed;inset:0;z-index:26000;display:none;background:radial-gradient(circle at 50% 20%,rgba(86,105,90,.13),transparent 28%),linear-gradient(180deg,#090c0a 0%,#131612 46%,#070806 100%);color:#e6e1d5;font-family:"Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;overflow:hidden}',
      '.final-patient-history.active{display:block}',
      '.final-patient-history::before{content:"";position:absolute;inset:-12%;background:repeating-linear-gradient(0deg,rgba(220,235,222,.025) 0 1px,transparent 1px 4px);opacity:.65;animation:fph-drift 8s linear infinite;pointer-events:none}',
      '@keyframes fph-drift{to{transform:translateY(16px)}}',
      '.fph-vignette{position:absolute;inset:0;box-shadow:inset 0 0 190px rgba(0,0,0,.9);pointer-events:none}',
      '.fph-stage{position:absolute;inset:0;display:grid;grid-template-columns:minmax(220px,.8fr) minmax(480px,1.55fr);gap:5vw;align-items:center;padding:7vh 8vw;opacity:0;transform:translateY(10px);transition:opacity .36s ease,transform .5s ease}',
      '.fph-stage.visible{opacity:1;transform:translateY(0)}',
      '.fph-left{border-right:1px solid rgba(186,204,190,.18);padding-right:4vw}',
      '.fph-stamp{font:600 clamp(16px,1.5vw,22px) monospace;color:#9ab6a3;letter-spacing:.06em;margin-bottom:10px}',
      '.fph-place{font-size:clamp(14px,1.15vw,18px);color:#b1aaa0;letter-spacing:.12em}',
      '.fph-count{margin-top:30px;font:14px monospace;color:#707b72}',
      '.fph-title{font-family:Georgia,"Noto Serif TC","PMingLiU",serif;font-weight:500;font-size:clamp(34px,4.3vw,70px);line-height:1.13;margin:0 0 24px;letter-spacing:.04em}',
      '.fph-body{font-size:clamp(17px,1.45vw,24px);line-height:2;color:#d8d4ca;max-width:900px}',
      '.fph-evidence{margin-top:28px;padding:17px 20px;border-left:3px solid #8e7155;background:rgba(73,55,42,.17);color:#d9c3a6;font-family:Georgia,"Noto Serif TC",serif;font-size:clamp(16px,1.3vw,21px);line-height:1.75}',
      '.fph-progress{position:absolute;left:8vw;right:8vw;bottom:5vh;display:flex;gap:7px}',
      '.fph-dot{height:3px;flex:1;background:#28312b}.fph-dot.done{background:#819989}.fph-dot.current{background:#c2a276}',
      '.fph-help{position:absolute;right:8vw;bottom:2.3vh;color:#6f7972;font:12px monospace;letter-spacing:.08em}',
      '.fph-choice{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;padding:8vh 8vw;text-align:center}',
      '.fph-choice.visible{display:flex}',
      '.fph-choice h2{font-family:Georgia,"Noto Serif TC","PMingLiU",serif;font-size:clamp(38px,5vw,76px);font-weight:500;letter-spacing:.05em;margin:0 0 18px}',
      '.fph-choice p{max-width:850px;font-size:clamp(17px,1.4vw,23px);line-height:1.9;color:#cbc8bf;margin:0 0 30px}',
      '.fph-buttons{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}',
      '.fph-buttons button{min-width:min(330px,78vw);padding:16px 20px;border:1px solid rgba(210,211,195,.32);background:#1b211d;color:#eee8dc;font-size:17px;cursor:pointer;transition:.18s ease}',
      '.fph-buttons button:hover{transform:translateY(-2px);border-color:#b99b70;background:#252923}',
      '.fph-buttons .accept{border-color:rgba(161,94,80,.45);color:#d8b4aa}',
      '.fph-buttons .escape{border-color:rgba(111,159,128,.48);color:#bfe0c8}',
      '.fph-final{font-family:Georgia,"Noto Serif TC",serif;font-size:clamp(26px,3vw,48px);line-height:1.65;white-space:pre-line}',
      '@media(max-width:760px){.fph-stage{grid-template-columns:1fr;gap:3vh;padding:7vh 7vw}.fph-left{border-right:0;border-bottom:1px solid rgba(186,204,190,.18);padding:0 0 2vh}.fph-count{margin-top:12px}}'
    ].join('\n');
    document.head.appendChild(style);

    const root=document.createElement('div');
    root.id='final-patientization-history';
    root.className='final-patient-history';
    root.innerHTML=[
      '<div class="fph-vignette"></div>',
      '<div class="fph-stage"></div>',
      '<div class="fph-progress"></div>',
      '<div class="fph-help">E / SPACE：繼續</div>',
      '<div class="fph-choice"></div>'
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
    else if(cue==='knock')s.playBed33KnockPattern?.(.07);
  }

  async #showBeat(beat,index,total){
    const stage=this.root.querySelector('.fph-stage');
    const progress=this.root.querySelector('.fph-progress');
    progress.replaceChildren();
    for(let i=0;i<total;i++){
      const dot=document.createElement('span');
      dot.className='fph-dot '+(i<index?'done':i===index?'current':'');
      progress.appendChild(dot);
    }

    stage.className='fph-stage';
    stage.replaceChildren();

    const left=document.createElement('div');left.className='fph-left';
    const stamp=document.createElement('div');stamp.className='fph-stamp';stamp.textContent=beat.stamp;
    const place=document.createElement('div');place.className='fph-place';place.textContent=beat.place;
    const count=document.createElement('div');count.className='fph-count';count.textContent=String(index+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');
    left.append(stamp,place,count);

    const right=document.createElement('div');
    const title=document.createElement('h1');title.className='fph-title';title.textContent=beat.title;
    const body=document.createElement('div');body.className='fph-body';body.textContent=beat.body;
    const evidence=document.createElement('div');evidence.className='fph-evidence';evidence.textContent=beat.evidence;
    right.append(title,body,evidence);

    stage.append(left,right);
    this.#playCue(beat.cue);
    void stage.offsetWidth;stage.classList.add('visible');

    await new Promise(resolve=>{
      const timer=setTimeout(resolve,3600);
      this.advanceResolve=()=>{clearTimeout(timer);resolve();};
    });
    this.advanceResolve=null;
    stage.classList.remove('visible');
    await wait(220);
  }

  #showChoice({onAccept,onEscape}){
    this.choiceVisible=true;
    const choice=this.root.querySelector('.fph-choice');
    const stage=this.root.querySelector('.fph-stage');
    const progress=this.root.querySelector('.fph-progress');
    const help=this.root.querySelector('.fph-help');
    stage.classList.remove('visible');
    progress.replaceChildren();
    help.textContent='選擇將改變這次重演的結局';
    choice.replaceChildren();

    const kicker=document.createElement('div');kicker.className='fph-stamp';kicker.textContent='409-A｜PATIENT RECORD ACTIVE';
    const title=document.createElement('h2');title.textContent='你已經知道當年發生了什麼。';
    const body=document.createElement('p');
    body.textContent='現在系統只承認你是 409-A 的病人。你可以接受這份紀錄，讓這次重演永遠停在病房；也可以利用床旁仍在線的舊終端，嘗試覆寫自己的病歷欄位，重新打開 316 的權限驗證。';

    const buttons=document.createElement('div');buttons.className='fph-buttons';
    const accept=document.createElement('button');accept.className='accept';accept.textContent='從此住院（結束遊戲）';
    const escape=document.createElement('button');escape.className='escape';escape.textContent='嘗試逃離（嘗試覆寫紀錄）';

    accept.addEventListener('click',()=>{
      this.#playCue('lock');
      onAccept?.();
      buttons.remove();
      title.textContent='病歷已封存。';
      body.className='fph-final';
      body.textContent='PATIENT 409-A\nIDENTITY: UNVERIFIED\nSTATUS: LONG-TERM ADMISSION\n\n你的名字從值班名冊消失了。\n這一次，沒有人再回到 316。';
      help.textContent='ENDING — HOSPITALIZED';
    },{once:true});

    escape.addEventListener('click',async()=>{
      buttons.querySelectorAll('button').forEach(button=>button.disabled=true);
      this.#playCue('beep');
      title.textContent='TEMPORARY PATIENT RECORD — WRITE ACCESS';
      body.textContent='床旁終端仍保留舊系統連線。你把「已確認病人」改回「身分待核」，讓 316 的權限驗證重新開啟。';
      help.textContent='正在嘗試覆寫紀錄……';
      await wait(1900);
      choice.classList.remove('visible');
      this.root.classList.remove('active');
      this.choiceVisible=false;
      this.active=false;
      onEscape?.();
    },{once:true});

    buttons.append(accept,escape);
    choice.append(kicker,title,body,buttons);
    choice.classList.add('visible');
  }

  async play({fullRecap=true,onAccept,onEscape}={}){
    if(this.active)return false;
    this.active=true;
    this.choiceVisible=false;
    document.exitPointerLock?.();
    this.root.classList.add('active');
    this.root.querySelector('.fph-choice')?.classList.remove('visible');
    this.root.querySelector('.fph-help').textContent='E / SPACE：繼續';

    const beats=fullRecap?HISTORY_BEATS:[
      Object.freeze({
        stamp:'記錄已回復',
        place:'409-A',
        title:'你已經看過那一晚的最後紀錄',
        body:'八名罹難者、02:17 的斷訊、B-Panel、排煙與 409-A 已經對上。這次錯誤權限仍把你重新分類為病人。',
        evidence:'要離開，就只能再嘗試覆寫目前這筆病歷紀錄。',
        cue:'beep'
      })
    ];

    for(let i=0;i<beats.length;i++)await this.#showBeat(beats[i],i,beats.length);
    this.#showChoice({onAccept,onEscape});
    return true;
  }

  destroy(){
    document.removeEventListener('keydown',this.keyHandler,true);
    this.root?.remove();
    document.getElementById('final-patientization-history-style')?.remove();
  }
}

export {HISTORY_BEATS};
