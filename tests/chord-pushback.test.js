import test from 'node:test';
import assert from 'node:assert/strict';
import {createAttackKeys} from '../attack-keys.js';
import {createMatch,queueAction,step,emptyInput,meleeDamage,damageAgainst} from '../combat.js';
import {FIGHTERS} from '../fighters.js';
import {makeCreature,animateCreature} from '../creatures3d.js';
function keys(full=true,emit){const fired=[],timers=new Map();let id=0;const k=createAttackKeys({isFull:()=>full,emit:a=>{fired.push(a);emit?.(a);},setTimer:fn=>{timers.set(++id,fn);return id;},clearTimer:id=>timers.delete(id)});return {k,fired,flush(){const tasks=[...timers.values()];timers.clear();tasks.forEach(fn=>fn());}};}
const orders=[['q','e','space'],['q','space','e'],['e','q','space'],['e','space','q'],['space','q','e'],['space','e','q']];
const idle=()=>[emptyInput(),emptyInput()];
function advance(s,n,input=idle()){for(let i=0;i<n;i++)step(s,input);}
function duel(){const s=createMatch('ashfang','crysteel',{mode:'online'});advance(s,300);s.fighters[0].x=500;s.fighters[1].x=590;return s;}
test('the full-meter ultimate chord works in all key orders without stray normal attacks',()=>{
  for(const order of orders){const t=keys();for(const key of order)t.k.down(key);t.flush();assert.deepEqual(t.fired,['space'],order.join('+'));for(const key of order)t.k.down(key);assert.equal(t.fired.length,1);}
});
test('ordinary attacks remain immediate below full energy and single-key shortcuts still work',()=>{
  const t=keys(false);t.k.down('q');t.k.down('e');assert.deepEqual(t.fired,['q','e']);
  for(const action of ['q','e','space']){const tap=keys();tap.k.down(action);tap.k.up(action);tap.flush();assert.deepEqual(tap.fired,[action]);}
});
test('leaving the game or opening a menu cancels pending inputs; defense remains immediate',()=>{
  const t=keys();t.k.down('q');t.k.reset();t.flush();assert.deepEqual(t.fired,[]);t.k.down('e');t.k.down('r');t.flush();assert.deepEqual(t.fired,['r']);
});
test('a new chord after releasing all three keys fires only once and spends one full meter',()=>{
  const s=duel();s.fighters[0].energy=100;const t=keys(true,a=>queueAction(s,0,a));for(const key of orders[0])t.k.down(key);t.flush();step(s);assert.equal(s.fighters[0].attack.kind,'super');assert.equal(s.projectiles.length,0);assert.equal(s.events.filter(e=>e.type==='super').length,1);assert.ok(s.fighters[0].energy<1);
  const again=keys();for(let n=0;n<2;n++){for(const key of orders[0])again.k.down(key);for(const key of orders[0])again.k.up(key);}again.flush();assert.deepEqual(again.fired,['space','space']);
});
test('two naturally spaced close-combat hits push either opponent back without extra damage',()=>{
  for(const seat of [0,1]){const s=duel(),f=s.fighters[seat],d=s.fighters[1-seat],start=d.x,hp=d.hp;queueAction(s,seat,'e');advance(s,22);queueAction(s,seat,'e');advance(s,22);assert.equal(hp-d.hp,damageAgainst(meleeDamage(f.id),FIGHTERS.find(x=>x.id===f.id).element,d.id)*2);assert.ok(Math.abs(d.x-start)>70);assert.equal(s.events.filter(e=>e.type==='pushback').length,1);}
});
test('missed melee attacks, ranged attacks, and expired pairs cannot award pushback',()=>{
  for(const reset of ['miss','ranged','expired']){const s=duel();queueAction(s,0,'e');advance(s,22);if(reset==='miss'){s.fighters[1].x=1050;queueAction(s,0,'e');advance(s,22);}if(reset==='ranged'){queueAction(s,0,'q');advance(s,44);}if(reset==='expired')advance(s,100);s.fighters[1].x=590;queueAction(s,0,'e');advance(s,22);assert.equal(s.events.some(e=>e.type==='pushback'),false,reset);}
});
test('pushback respects arena edges and remains deterministic after an online snapshot',()=>{
  const s=duel();s.fighters[0].x=1040;s.fighters[1].x=1125;queueAction(s,0,'e');advance(s,22);const snapshot=JSON.parse(JSON.stringify(s));for(const state of [s,snapshot]){queueAction(state,0,'e');advance(state,60);assert.ok(state.fighters[1].x<=1140);assert.ok(state.events.some(e=>e.type==='pushback'));}assert.deepEqual(snapshot,s);
});
test('all creatures have fitted fighting gear that survives movement, ducking, and ultimates',()=>{
  for(const spec of FIGHTERS){const m=makeCreature(spec),gear=m.userData.gear;assert.ok(gear.length>=1,spec.name);for(const g of gear){assert.ok(g.parent);assert.equal(g.userData.equipment,spec.gear.type);assert.equal(g.name,spec.gear.name);}for(const pose of ['idle','walk','duck','deflect','heavy','super']){animateCreature(m,pose,1800,pose==='super'?{kind:'super',age:30,active:spec.ultimate.active,duration:spec.ultimate.duration,ultimateId:spec.ultimate.style}:null);m.updateMatrixWorld(true);for(const g of gear)assert.ok(g.matrixWorld.elements.every(Number.isFinite),spec.name);}}
});
