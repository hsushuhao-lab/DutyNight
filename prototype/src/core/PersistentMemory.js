const STORAGE_KEY='DutyNight_PersistentData';

const defaults=()=>({
  version:1,
  loopCount:0,
  hasSeenOverride_Bed33:false,
  knownCodes:{
    pass_1700:false,
    pass_3082:false,
    code_0217:false,
    code_0316:false,
    code_0409:false
  },
  survivalRules:{
    neverSignBed33:false,
    neverCreateGhostRecord:false,
    neverLookBackOnBridge:false,
    ignorePondReflection:false
  },
  trueNameFragments:{
    frag_surname:null,
    frag_givenName_1:null,
    frag_givenName_2:null,
    frag_title:null
  },
  journalNotes:[]
});

const memoryStore={value:null};

function getStorage(){
  try{
    if(typeof window!=='undefined'&&window.localStorage)return window.localStorage;
  }catch(e){}
  return {
    getItem:key=>key===STORAGE_KEY?memoryStore.value:null,
    setItem:(key,value)=>{if(key===STORAGE_KEY)memoryStore.value=value;},
    removeItem:key=>{if(key===STORAGE_KEY)memoryStore.value=null;}
  };
}

function merge(base,loaded){
  return {
    ...base,...loaded,
    knownCodes:{...base.knownCodes,...loaded?.knownCodes},
    survivalRules:{...base.survivalRules,...loaded?.survivalRules},
    trueNameFragments:{...base.trueNameFragments,...loaded?.trueNameFragments},
    journalNotes:Array.isArray(loaded?.journalNotes)?[...loaded.journalNotes]:[]
  };
}

export class PersistentMemory {
  constructor(storage=getStorage()){
    this.storage=storage;
    this.data=this.load();
  }

  load(){
    try{
      const raw=this.storage.getItem(STORAGE_KEY);
      return raw?merge(defaults(),JSON.parse(raw)):defaults();
    }catch(e){
      return defaults();
    }
  }

  save(){
    try{this.storage.setItem(STORAGE_KEY,JSON.stringify(this.data));}catch(e){}
    return this.data;
  }

  reset(){
    this.data=defaults();
    try{this.storage.removeItem(STORAGE_KEY);}catch(e){}
  }

  learnCode(code){
    if(!(code in this.data.knownCodes))return false;
    if(this.data.knownCodes[code])return false;
    this.data.knownCodes[code]=true;this.save();return true;
  }

  learnRule(rule){
    if(!(rule in this.data.survivalRules))return false;
    if(this.data.survivalRules[rule])return false;
    this.data.survivalRules[rule]=true;this.save();return true;
  }

  setTrueNameFragment(key,value){
    if(!(key in this.data.trueNameFragments))return false;
    this.data.trueNameFragments[key]=value;this.save();return true;
  }

  addJournalNote(id,text){
    if(this.data.journalNotes.some(n=>n.id===id))return false;
    this.data.journalNotes.push({id,text,loop:this.data.loopCount});
    this.save();return true;
  }

  recordOverride(id){
    this.data.loopCount+=1;
    if(id==='BED33'){
      this.data.hasSeenOverride_Bed33=true;
      this.data.survivalRules.neverSignBed33=true;
      this.data.knownCodes.code_0409=true;
      this.addJournalNote('RULE_BED33','不要簽 409A 的床位。');
      this.addJournalNote('CODE_0409','04:09 不是時間，是 409。');
      this.addJournalNote('IDENTITY_DOCTOR','如果我被登記成病人，另一個「李醫師」就會接手我的工作。');
    }
    this.save();
  }

  applyToGameState(gameState){
    gameState.setFlag('LOOP_COUNT',this.data.loopCount);
    gameState.setFlag('MEMORY_PASS_1700',this.data.knownCodes.pass_1700);
    gameState.setFlag('MEMORY_PASS_3082',this.data.knownCodes.pass_3082);
    gameState.setFlag('MEMORY_CODE_0217',this.data.knownCodes.code_0217);
    gameState.setFlag('MEMORY_CODE_0316',this.data.knownCodes.code_0316);
    gameState.setFlag('MEMORY_CODE_0409',this.data.knownCodes.code_0409);
    gameState.setFlag('MEMORY_NEVER_SIGN_BED33',this.data.survivalRules.neverSignBed33);
  }
}

export const persistentMemory=new PersistentMemory();
