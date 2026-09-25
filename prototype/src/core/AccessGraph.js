export const ACCESS_RULES=Object.freeze({
  FIRST_TO_SECOND_BRIDGE:{requires:['SECOND_CAMPUS_ACCESS']},
  SECOND_TO_FIRST_BRIDGE:{requires:['SECOND_CAMPUS_ACCESS']},
  B2_ACCESS:{requires:['SPACE_PROOF','IDENTITY_PROOF','TIME_PROOF','B2_DOOR_READY']}
});

export function canAccess(gameState,ruleId){
  const rule=ACCESS_RULES[ruleId];
  if(!rule)return true;
  return rule.requires.every(flag=>gameState.getFlag(flag));
}
