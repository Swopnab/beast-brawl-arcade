import test from 'node:test';
import assert from 'node:assert/strict';
import {FIGHTERS,MOVE_LIST,fighter} from '../fighters.js';
import {createMatch,step,queueAction,emptyInput,rewardFor} from '../combat.js';
import {cleanProfile,grantReward,equipArena,titleFor} from '../profile.js';
const idle=()=>[emptyInput(),emptyInput()];
function advance(s,frames,inputs=idle()){for(let n=0;n<frames;n++)step(s,inputs);}
function fight(a='ashfang',b='zipcat'){const s=createMatch(a,b,{mode:'online',matchId:'test-match'});advance(s,360);s.fighters[0].x=500;s.fighters[1].x=590;return s;}
test('30 original fighters have distinct identities and complete move lists',()=>{
  assert.equal(FIGHTERS.length,30);assert.equal(new Set(FIGHTERS.map(f=>f.id)).size,30);assert.equal(new Set(FIGHTERS.map(f=>f.shape)).size,30);
  for(const f of FIGHTERS){for(const [,key]of MOVE_LIST)assert.ok(f.moves[key],`${f.name} missing ${key}`);assert.ok(f.hp>=900&&f.hp<=1250);}
  assert.equal(new Set(FIGHTERS.map(f=>f.moves.special)).size,30);
});
test('six-second briefing blocks attacks, then starts exactly on schedule',()=>{
  const s=createMatch('ashfang','zipcat');assert.equal(queueAction(s,0,'q'),false);advance(s,359);assert.equal(s.phase,'briefing');step(s);assert.equal(s.phase,'fight');assert.equal(s.time,3600);
});
test('movement, jump, and arena bounds work',()=>{
  const s=fight();advance(s,60,[{left:true,jump:true},emptyInput()]);assert.ok(s.fighters[0].x<500);assert.ok(s.fighters[0].y<0);
  advance(s,600,[{left:true},emptyInput()]);assert.equal(s.fighters[0].x,60);assert.equal(s.fighters[0].y,0);
});
test('Q light hits exactly once and builds energy',()=>{
  const s=fight(),before=s.fighters[1].hp;assert.equal(queueAction(s,0,'q'),true);advance(s,30);
  assert.equal(before-s.fighters[1].hp,Math.round(40*fighter('ashfang').power));assert.ok(s.fighters[0].energy>=10);assert.ok(s.fighters[1].energy>0);
});
test('distance and guarding prevent a full hit',()=>{
  const miss=fight();miss.fighters[1].x=1050;queueAction(miss,0,'e');advance(miss,45);assert.equal(miss.fighters[1].hp,miss.fighters[1].maxHp);
  const block=fight(),before=block.fighters[1].hp;queueAction(block,0,'e');advance(block,45,[emptyInput(),{block:true}]);assert.ok(before-block.fighters[1].hp<30);assert.ok(before-block.fighters[1].hp>0);
});
test('Q Q E creates the unique launcher and launches the opponent',()=>{
  const s=fight();queueAction(s,0,'q');advance(s,24);s.fighters[1].x=590;
  queueAction(s,0,'q');advance(s,24);s.fighters[1].x=590;
  queueAction(s,0,'e');advance(s,17);assert.equal(s.fighters[0].attack.kind,'launcher');assert.equal(s.fighters[0].lastMove,fighter('ashfang').moves.launcher);assert.ok(s.fighters[1].y<0);
});
test('Q E R produces an empowered signature move',()=>{
  const s=fight();queueAction(s,0,'q');advance(s,24);queueAction(s,0,'e');advance(s,41);queueAction(s,0,'r');step(s);
  assert.equal(s.fighters[0].attack.kind,'chain');assert.ok(s.fighters[0].attack.damage>fighter('ashfang').specialDamage);assert.equal(s.fighters[0].lastMove,'Flare Rush EX');
});
test('E E Q produces an unblockable guardbreaker',()=>{
  const s=fight();queueAction(s,0,'e');advance(s,41);queueAction(s,0,'e');advance(s,41);queueAction(s,0,'q');step(s);
  assert.equal(s.fighters[0].attack.kind,'breaker');assert.equal(s.fighters[0].attack.unblockable,true);
});
test('directional and aerial attacks have different properties',()=>{
  const low=fight();queueAction(low,0,'q',{block:true});step(low);assert.equal(low.fighters[0].attack.kind,'low');
  const rising=fight();queueAction(rising,0,'e',{jump:true});step(rising);assert.equal(rising.fighters[0].attack.kind,'rising');assert.ok(rising.fighters[0].vy<0);
  const moving=fight();queueAction(moving,0,'e',{right:true});step(moving);assert.equal(moving.fighters[0].attack.kind,'moving');assert.ok(moving.fighters[0].x>500);
  const air=fight();air.fighters[0].y=-100;queueAction(air,0,'e');step(air);assert.equal(air.fighters[0].attack.kind,'air');assert.ok(air.fighters[0].vy>0);
});
test('all 30 signature specials can damage a reachable rival',()=>{
  for(const f of FIGHTERS){const s=fight(f.id,'crysteel'),before=s.fighters[1].hp;queueAction(s,0,'r');advance(s,100);assert.ok(s.fighters[1].hp<before,`${f.name} special failed`);}
});
test('Space requires a full meter and consumes it',()=>{
  const s=fight();queueAction(s,0,'space');step(s);assert.equal(s.fighters[0].attack,null);assert.ok(s.events.some(e=>e.type==='empty-energy'));
  s.fighters[0].energy=100;queueAction(s,0,'space');step(s);assert.equal(s.fighters[0].attack.kind,'super');assert.ok(s.fighters[0].energy<1);
});
test('invalid actions and excessive queued inputs are rejected',()=>{
  const s=fight();assert.equal(queueAction(s,2,'q'),false);assert.equal(queueAction(s,0,'delete'),false);
  for(let n=0;n<3;n++)assert.equal(queueAction(s,0,'q'),true);assert.equal(queueAction(s,0,'q'),false);
});
test('three timed-out draw rounds end in a draw without negative health',()=>{
  const s=createMatch('ashfang','zipcat',{mode:'online'});advance(s,13000);assert.equal(s.phase,'finished');assert.equal(s.round,3);assert.equal(s.winner,null);assert.deepEqual(rewardFor(s,0),{won:false,draw:true,xp:65,shards:25});
});
test('a bot approaches, fights, and can complete a match without a human opponent',()=>{
  const s=createMatch('ashfang','zipcat',{mode:'bot',seed:400});advance(s,14000);assert.equal(s.phase,'finished');assert.equal(s.winner,1);assert.ok(s.fighters[1].roundWins>=2);
});
test('completed match rewards cannot be claimed twice on reconnect',()=>{
  const p=cleanProfile(),s=fight();assert.equal(grantReward(p,s,0),null);s.phase='finished';s.winner=0;
  assert.deepEqual(grantReward(p,s,0),{won:true,draw:false,xp:120,shards:50});assert.equal(grantReward(p,s,0),null);assert.equal(p.wins,1);assert.equal(titleFor(p),'Combo Kid');
});
test('arena purchases debit once, remain unlocked, and reject insufficient shards',()=>{
  const p=cleanProfile();assert.equal(equipArena(p,'moon'),false);p.shards=100;assert.equal(equipArena(p,'moon'),true);assert.equal(p.shards,20);assert.equal(p.arena,'moon');
  equipArena(p,'neon');equipArena(p,'moon');assert.equal(p.shards,20);assert.equal(equipArena(p,'bogus'),false);
});
test('corrupt local profiles fall back to safe defaults',()=>{
  const p=cleanProfile({xp:NaN,shards:-100,arena:'unknown',unlocked:['unknown'],rewarded:[23]});assert.equal(p.xp,0);assert.equal(p.shards,0);assert.equal(p.arena,'neon');assert.deepEqual(p.rewarded,[]);
});
