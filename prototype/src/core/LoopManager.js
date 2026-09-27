import { persistentMemory } from './PersistentMemory.js';
import { legendState } from './LegendStateManager.js';
import {
  getPatientizationRecoveryAnchor,
  applyPatientizationRecoveryAnchor
} from './PatientizationRecovery.js';

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

    const firstPatientization=persistentMemory.data.loopCount===1;
    const recovery=firstPatientization?null:getPatientizationRecoveryAnchor(id);
    const recoveryZone=recovery?.zoneId||'first_campus_3f';

    this.controller.enabled=false;
    this.loopResetPreparation=Promise.resolve(this.prepareLoopReset?.(recoveryZone));
    this.uiManager.playLegendOverride(
      {legend,reason,recovery},
      ()=>recovery?this.recoverToMemoryAnchor(id):this.softResetTo1700()
    );
  }

  async resetLoopBase(){
    await this.loopResetPreparation;
    legendState.resetRound();
    this.worldRouter.resetTransientState?.();
    this.gameState.resetForLoop();
    persistentMemory.applyToGameState(this.gameState);
  }

  async softResetTo1700(){
    await this.resetLoopBase();
    this.worldRouter.loadZone('first_campus_3f','m0_3f_corridor');
    this.controller.enabled=true;
    this.uiManager.resetAfterLoop?.();
    this.uiManager.showLoopWakeup?.(persistentMemory.data.loopCount);
  }

  async recoverToMemoryAnchor(id){
    await this.resetLoopBase();
    const recovery=applyPatientizationRecoveryAnchor(this.gameState,id);
    if(!recovery){
      this.worldRouter.loadZone('first_campus_3f','m0_3f_corridor');
      this.controller.enabled=true;
      this.uiManager.resetAfterLoop?.();
      this.uiManager.showLoopWakeup?.(persistentMemory.data.loopCount);
      return;
    }

    this.worldRouter.loadZone(recovery.zoneId,recovery.spawnId);
    this.worldRouter.activeZoneInstance?.syncStoryState?.();
    this.controller.enabled=true;
    this.uiManager.resetAfterLoop?.();
    this.uiManager.showMemoryAnchorRestored?.(recovery,persistentMemory.data.loopCount);
  }
}
