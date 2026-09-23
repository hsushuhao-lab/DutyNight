import { gameState } from './GameState.js';

export const GamePhase = Object.freeze({
  FIRST_ARRIVAL: 'Phase0_1700_FirstArrival',
  AFTER_ARCHIVE: 'Phase1_1715_AfterArchive',
  ELEVATOR_GLITCH: 'Phase2_2040_ElevatorGlitch',
  NIGHT_PATROL: 'Phase3_2117_NightPatrol'
});

export class FloorStateManager {
  constructor(state=gameState){this.state=state;}

  get phase(){return this.state.getGamePhase?.() || GamePhase.FIRST_ARRIVAL;}

  setPhase(phase){
    if(!Object.values(GamePhase).includes(phase))throw new Error('Unknown game phase: '+phase);
    this.state.setGamePhase(phase);
  }

  apply(zoneId,zone){
    zone?.applyGamePhase?.(this.phase,this.state);
    return this.phase;
  }
}

export const floorStateManager=new FloorStateManager();
