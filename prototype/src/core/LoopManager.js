import { persistentMemory } from './PersistentMemory.js';
import { legendState } from './LegendStateManager.js';

export class LoopManager {
  constructor({gameState,worldRouter,controller,uiManager}){
    Object.assign(this,{gameState,worldRouter,controller,uiManager});
  }

  triggerBed33Override(){
    persistentMemory.recordOverride('BED33');
    legendState.override('LEGEND_BED33');
    this.controller.enabled=false;
    this.uiManager.playBed33Override(()=>this.softResetTo1700());
  }

  softResetTo1700(){
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
