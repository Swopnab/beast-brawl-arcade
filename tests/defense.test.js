import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,step,queueAction,emptyInput,meleeDamage,PACE,damageAgainst} from '../combat.js';
import {FIGHTERS} from '../fighters.js';
const idle=()=>[emptyInput(),emptyInput()];
function advance(s,n,input=idle()){for(let i=0;i<n;i++)step(s,input);}
function duel(a='ashfang',b='crysteel'){const s=createMatch(a,b,{mode:'online'});advance(s,300);s.fighters[0].x=500;s.fighters[1].x=590;return s;}
test('all anatomies duck under Q, but S does not give passive damage reduction',()=>{
  for(const spec of FIGHTERS){const s=duel('ashfang',spec.id),hp=s.fighters[1].hp;queueAction(s,0,'q');advance(s,50,[emptyInput(),{duck:true}]);assert.equal(s.fighters[1].hp,hp,spec.name);assert.equal(s.fighters[1].ducking,true);}
  const s=duel(),hp=s.fighters[1].hp;queueAction(s,0,'e');advance(s,8,[emptyInput(),{duck:true}]);assert.equal(hp-s.fighters[1].hp,damageAgainst(meleeDamage('ashfang'),'Ember','crysteel'));
});
test('both seats can parry an incoming melee hit with no damage and punish recovery',()=>{
  for(const defender of [0,1]){const s=duel(),attacker=1-defender,hp=s.fighters[defender].hp;queueAction(s,attacker,'e');queueAction(s,defender,'r');advance(s,6);assert.equal(s.fighters[defender].hp,hp);assert.ok(s.fighters[defender].counterWindow>0);assert.equal(s.fighters[attacker].attack,null);assert.ok(s.fighters[attacker].stun>0);assert.ok(s.events.some(e=>e.type==='parry'&&e.player===defender));}
});
test('a reflected projectile switches owner and returns its original quarter damage',()=>{
  const s=duel(),hp=s.fighters[0].hp,d=s.fighters[1];queueAction(s,1,'r');s.projectiles.push({id:50,sourceId:'ashfang',owner:0,x:d.x-15,y:-83,vx:13,radius:17,damage:meleeDamage('ashfang')/4,life:42,age:0,warmup:0});step(s);
  assert.equal(s.projectiles[0].owner,1);assert.equal(s.projectiles[0].vx,-13);assert.equal(d.hp,d.maxHp);advance(s,5);assert.equal(hp-s.fighters[0].hp,damageAgainst(meleeDamage('ashfang')/4,'Ember','ashfang'));assert.ok(s.events.some(e=>e.type==='reflect'));
});
test('successful deflect followed by E gives a stronger counter; waiting loses the bonus',()=>{
  for(const wait of [0,46]){const s=duel(),hp=s.fighters[0].hp;queueAction(s,0,'e');queueAction(s,1,'r');advance(s,6+wait);queueAction(s,1,'e');advance(s,7);assert.equal(hp-s.fighters[0].hp,damageAgainst(meleeDamage('crysteel')*(wait?1:1.5),'Frost','ashfang'));assert.equal(s.events.some(e=>e.type==='counter'),!wait);}
});
test('mistimed R is punishable, cannot be held, and cannot be spammed',()=>{
  const s=duel(),hp=s.fighters[1].hp;queueAction(s,1,'r');advance(s,PACE.deflect.window+1);queueAction(s,0,'e');advance(s,7);assert.equal(hp-s.fighters[1].hp,damageAgainst(meleeDamage('ashfang'),'Ember','crysteel'));assert.equal(s.fighters[1].counterWindow,0);
  const cooldown=duel();queueAction(cooldown,0,'r');advance(cooldown,20);queueAction(cooldown,0,'r');step(cooldown);assert.equal(cooldown.fighters[0].attack,null);assert.equal(cooldown.fighters[0].parryFrames,0);
});
test('melee builds its ultimate much faster than ranged pokes',()=>{
  const energy={};for(const action of ['q','e']){const s=duel();queueAction(s,0,action);advance(s,50);energy[action]=s.fighters[0].energy;}assert.ok(energy.e>energy.q*4);
});
test('bot approaches melee range and overwhelmingly chooses E over Q',()=>{
  const s=createMatch('crysteel','zipcat',{mode:'bot',seed:400});let melee=0,ranged=0,seen=0;for(let i=0;i<1800&&s.phase!=='finished';i++){step(s);for(const e of s.events){if(e.id<=seen)continue;seen=e.id;if(e.type==='attack'&&e.player===1){if(e.kind==='ranged')ranged++;if(['heavy','moving','launcher','low','breaker','rising'].includes(e.kind))melee++;}}}assert.ok(melee>10);assert.ok(melee>ranged*4);
});
test('network snapshots preserve duck, reflected shots, and counter timing',()=>{
  const s=duel();queueAction(s,0,'e');queueAction(s,1,'r');advance(s,6);const clone=JSON.parse(JSON.stringify(s));queueAction(s,1,'e');queueAction(clone,1,'e');for(let i=0;i<80;i++){step(s);step(clone);}assert.deepEqual(clone,s);
});
test('ultimate hit patterns and healing match each creature’s rules',()=>{
  for(const spec of FIGHTERS){const s=duel(spec.id),f=s.fighters[0];f.hp-=200;f.energy=100;queueAction(s,0,'space');advance(s,100);const hits=s.events.filter(e=>e.type==='hit'&&e.player===0);assert.equal(hits.length,spec.ultimate.hits,spec.name);if(spec.ultimate.heal)assert.ok(f.hp>spec.hp-200);else assert.equal(f.hp,spec.hp-200);}
});
test('armored ultimates halve damage; gravity pulls; crystal hits freeze',()=>{
  for(const id of ['kilnback','thornox']){const s=duel(id),hp=s.fighters[0].hp;s.fighters[0].energy=100;queueAction(s,0,'space');queueAction(s,1,'e');advance(s,7);assert.equal(hp-s.fighters[0].hp,damageAgainst(meleeDamage('crysteel'),'Frost',id,.5));assert.equal(s.fighters[0].attack.kind,'super');}
  const pull=duel('nullwyrm');pull.fighters[1].x=770;pull.fighters[0].energy=100;const distance=()=>Math.abs(pull.fighters[1].x-pull.fighters[0].x),before=distance();queueAction(pull,0,'space');advance(pull,20);assert.ok(distance()<before-50);
  const freeze=duel('crysteel');freeze.fighters[0].energy=100;queueAction(freeze,0,'space');advance(freeze,34);assert.ok(freeze.fighters[1].stun>=22);
});
test('unique ultimate poses remain finite through their complete animations',async()=>{
  const {makeCreature,animateCreature}=await import('../creatures3d.js');
  for(const spec of FIGHTERS){const model=makeCreature(spec);for(let age=0;age<=spec.ultimate.duration;age+=4){animateCreature(model,'super',age*17,{kind:'super',age,active:spec.ultimate.active,duration:spec.ultimate.duration,ultimateId:spec.ultimate.style});model.updateMatrixWorld(true);model.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite),spec.name));}}
});
