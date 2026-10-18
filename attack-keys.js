// A short chord window at full energy prevents Q/E from firing before the ultimate.
// Ordinary attacks stay immediate when the energy meter is not full.
export function createAttackKeys({emit,isFull,setTimer=setTimeout,clearTimer=clearTimeout,grace=90}){
  const held=new Set();let pending=[],timer=null,latched=false;
  const chordKeys=['q','e','space'];
  function cancel(){if(timer!==null)clearTimer(timer);timer=null;pending=[];}
  function flush(){const actions=pending;pending=[];timer=null;if(actions.includes('space'))emit('space');else actions.forEach(action=>emit(action));}
  return {
    down(action){
      if(held.has(action))return;held.add(action);
      if(chordKeys.includes(action)){
        if(latched)return;
        if(isFull()){
          if(chordKeys.every(key=>held.has(key))){cancel();latched=true;emit('space');return;}
          pending.push(action);if(timer===null)timer=setTimer(flush,grace);return;
        }
      }
      // A defensive tap should never wait behind an incomplete attack chord.
      if(action==='r')cancel();emit(action);
    },
    up(action){held.delete(action);if(chordKeys.every(key=>!held.has(key)))latched=false;},
    reset(){cancel();held.clear();latched=false;}
  };
}
