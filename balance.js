// Ten-point attack/defense/mobility budgets; no fighter receives free stats.
export const BALANCE=Object.freeze({
 ashfang:{role:'Glass cannon',attack:5,defense:2,mobility:3},kilnback:{role:'Tank',attack:2,defense:5,mobility:3},
 reefclaw:{role:'Tank',attack:2,defense:5,mobility:3},inkveil:{role:'Striker',attack:4,defense:2,mobility:4},
 zipcat:{role:'Speedster',attack:3,defense:2,mobility:5},boltstag:{role:'Duelist',attack:4,defense:3,mobility:3},
 thornox:{role:'Bruiser',attack:3,defense:4,mobility:3},petalmoth:{role:'Glass cannon',attack:5,defense:2,mobility:3},
 hexeye:{role:'Controller',attack:3,defense:3,mobility:4},nullwyrm:{role:'Striker',attack:4,defense:2,mobility:4},
 glaciop:{role:'Speedster',attack:3,defense:2,mobility:5},crysteel:{role:'Tank',attack:2,defense:5,mobility:3}
});
export const ELEMENT_NAMES={Ember:'Fire',Tide:'Water',Wild:'Grass',Volt:'Electric',Frost:'Ice',Void:'Shadow'};
export const TYPE_CHART=Object.freeze({
 Ember:{Wild:2,Frost:2,Tide:.5,Void:.5},Tide:{Ember:2,Void:2,Wild:.5,Volt:.5},
 Wild:{Tide:2,Volt:2,Ember:.5,Frost:.5},Volt:{Tide:2,Frost:2,Wild:.5,Void:.5},
 Frost:{Wild:2,Void:2,Ember:.5,Volt:.5},Void:{Ember:2,Volt:2,Tide:.5,Frost:.5}
});
export const typeMultiplier=(attack,defense)=>TYPE_CHART[attack]?.[defense]??1;
export const elementName=e=>ELEMENT_NAMES[e]||e;

export function validTeam(ids){return Array.isArray(ids)&&ids.length>=1&&ids.length<=3&&new Set(ids).size===ids.length&&ids.every(id=>typeof id==='string'&&Object.hasOwn(BALANCE,id));}
