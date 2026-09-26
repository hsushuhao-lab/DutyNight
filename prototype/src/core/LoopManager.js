import { persistentMemory } from './PersistentMemory.js';
import { legendState } from './LegendStateManager.js';

export class LoopManager {
  constructor({gameState,worldRouter,controller,uiManager,prepareLoopReset=null}){
    Object.assign(this,{gameState,worldRouter,controller,uiManager,prepareLoopReset});
    this.loopResetPreparation=Promise.resolve();
  }

  triggerBed33Override(){
    this.triggerLegendOverride('BED33',{legend:'LEGEND 01 — 第 33 床',reason:'你已被收治。'});
  }

  triggerLegendOverride(id,{legend='夜班紀錄已被覆寫',reason='你已被重新分類。'}={}){
    persistentMemory.recordOverride(id);
    if(id==='BED33')legendState.override('LEGEND_BED33');
    this.controller.enabled=false;
    this.loopResetPreparation=Promise.resolve(this.prepareLoopReset?.()).catch(error=>{
      console.warn('[loop] scene asset preparation failed; rebuilding with available assets',error);
    });
    this.uiManager.playLegendOverride({legend,reason},()=>this.softResetTo1700());
  }

  async softResetTo1700(){
    await this.loopResetPreparation;
    legendState.resetRound();
    this.worldRouter.resetTransientState?.();
    this.gameState.resetForLoop();
    persistentMemory.applyToGameState(this.gameState);
    this.worldRouter.loadZone('first_campus_3f','m0_3f_corridor');
    this.controller.enabled=true;
    this.uiManager.resetAfterLoop?.();
    this.uiManager.showLoopWakeup?.(persistentMemory.data.loopCount);
  }
}
