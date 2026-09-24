export const NodeState=Object.freeze({
  UNSEEN:'UNSEEN',
  NOTICED:'NOTICED',
  UNDERSTOOD:'UNDERSTOOD',
  RESOLVED:'RESOLVED',
  OVERRIDE:'LEGEND_OVERRIDE'
});

export const LEGEND_BED33={
  id:'LEGEND_BED33',
  semanticAny:['KNOCK_403_49','ARCHIVE_0409'],
  contradictionAny:['BEDBOARD_33_409A','HIS_409_CLOSED','DOOR_409_SEALED']
};

export class LegendStateManager{
  constructor(){this.resetRound();}

  resetRound(){
    this.nodes=new Map([[LEGEND_BED33.id,{state:NodeState.UNSEEN,clues:new Set()}]]);
  }

  node(id){return this.nodes.get(id);}

  registerClue(id,clue){
    const node=this.node(id);if(!node)return null;
    node.clues.add(clue);
    if(node.state===NodeState.UNSEEN)node.state=NodeState.NOTICED;
    if(id===LEGEND_BED33.id&&this.isBed33Understood())node.state=NodeState.UNDERSTOOD;
    return node.state;
  }

  isBed33Understood(){
    const node=this.node(LEGEND_BED33.id);
    if(!node)return false;
    const semantic=LEGEND_BED33.semanticAny.some(x=>node.clues.has(x));
    const contradiction=LEGEND_BED33.contradictionAny.some(x=>node.clues.has(x));
    return semantic&&contradiction;
  }

  resolve(id){const n=this.node(id);if(n)n.state=NodeState.RESOLVED;}
  override(id){const n=this.node(id);if(n)n.state=NodeState.OVERRIDE;}
  getState(id){return this.node(id)?.state||NodeState.UNSEEN;}
}

export const legendState=new LegendStateManager();
