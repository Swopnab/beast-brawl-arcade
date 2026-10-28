import test from 'node:test';
import assert from 'node:assert/strict';
import {FIGHTERS,fighter} from '../fighters.js';
import {BALANCE,TYPE_CHART,typeMultiplier} from '../balance.js';
import {createMatch,step,queueAction,emptyInput,validTeam,selectReplacement,resolveTeamKnockout,damageAgainst,livingMembers,TEAM_BOUT_FRAMES} from '../combat.js';
import {cleanProfile,grantReward} from '../profile.js';
import {SPRITES,CELL,POSE_COLUMNS} from '../pixel-sprites.js';
import {readFileSync} from 'node:fs';
const teams=[['ashfang','reefclaw','glaciop'],['thornox','kilnback','hexeye']];
function battle(mode='online'){const s=createMatch(...teams,{mode});for(let i=0;i<300;i++)step(s);return s;}
function ko(s,index){s.fighters[index].hp=0;resolveTeamKnockout(s);}
test('every fighter spends exactly ten points with real attack, defense, and speed tradeoffs',()=>{
 for(const f of FIGHTERS){const b=BALANCE[f.id];assert.equal(b.attack+b.defense+b.mobility,10);assert.equal(f.hp,1000);assert.equal(f.reach,103);}
 assert.ok(fighter('ashfang').power>fighter('kilnback').power);assert.ok(fighter('kilnback').defense>fighter('ashfang').defense);assert.ok(fighter('zipcat').speed>fighter('ashfang').speed);
 assert.ok(damageAgainst(100,'Void','kilnback')<damageAgainst(100,'Void','ashfang'));
});
test('the six-element chart gives every element two strengths, two resistances and reciprocal matchups',()=>{
 for(const a of Object.keys(TYPE_CHART)){const values=Object.values(TYPE_CHART[a]);assert.equal(values.filter(v=>v===2).length,2);assert.equal(values.filter(v=>v===.5).length,2);assert.equal(typeMultiplier(a,a),1);for(const b of Object.keys(TYPE_CHART))assert.equal(typeMultiplier(a,b)*typeMultiplier(b,a),1);}
 assert.equal(typeMultiplier('Ember','Wild'),2);assert.equal(typeMultiplier('Ember','Tide'),.5);
 assert.equal(damageAgainst(100,'Ember','thornox'),Math.round(200/fighter('thornox').defense));assert.equal(damageAgainst(100,'Ember','reefclaw'),40);
});
test('teams accept one to three distinct registered fighters, reject malformed/duplicate/unknown picks',()=>{
 for(const ids of [[],['bad'],['ashfang','ashfang'],[...teams[0],'hexeye'],null,'ashfang']){assert.equal(validTeam(ids),false);if(Array.isArray(ids))assert.throws(()=>createMatch(ids,teams[1]));}
 for(const n of [1,2,3])assert.equal(validTeam(teams[0].slice(0,n)),true);
});
test('KO pauses damage and timers until the owner chooses a living reserve; health carries over',()=>{
 const s=battle();s.fighters[1].hp=427;s.fighters[1].energy=63;ko(s,0);assert.equal(s.phase,'replacement');const frame=s.frame,time=s.time;
 for(let i=0;i<300;i++)step(s);assert.equal(s.frame,frame);assert.equal(s.time,time);assert.equal(queueAction(s,0,'e'),false);
 assert.equal(selectReplacement(s,1,'kilnback'),false);assert.equal(selectReplacement(s,0,'ashfang'),false);assert.equal(selectReplacement(s,0,'hexeye'),false);assert.equal(selectReplacement(s,3,'reefclaw'),false);
 assert.equal(selectReplacement(s,0,'glaciop'),true);assert.equal(s.phase,'countdown');assert.equal(s.fighters[1].hp,427);assert.equal(s.fighters[1].energy,63);assert.equal(s.fighters[0].hp,1000);assert.equal(s.time,TEAM_BOUT_FRAMES);
 for(let i=0;i<120;i++)step(s);assert.equal(s.phase,'fight');assert.equal(s.teams[0].active,2);
});
test('a team wins only when all opposing fighters are eliminated, and receives rewards once',()=>{
 const s=battle(),profile=cleanProfile();
 for(const reserve of ['reefclaw','glaciop']){ko(s,0);assert.equal(grantReward(profile,s,1),null);selectReplacement(s,0,reserve);for(let i=0;i<120;i++)step(s);}
 ko(s,0);assert.equal(s.phase,'finished');assert.equal(s.winner,1);assert.equal(livingMembers(s,0).length,0);assert.equal(grantReward(profile,s,1).won,true);assert.equal(grantReward(profile,JSON.parse(JSON.stringify(s)),1),null);
});
test('simultaneous KO waits for both sides, timeout eliminates lower health percentage, last-double-KO draws',()=>{
 const s=battle();s.fighters.forEach(f=>f.hp=0);resolveTeamKnockout(s);assert.deepEqual(s.needsReplacement,[true,true]);selectReplacement(s,0,'reefclaw');assert.equal(s.phase,'replacement');selectReplacement(s,1,'kilnback');assert.equal(s.phase,'countdown');
 const t=battle();t.time=0;t.fighters[0].hp=300;t.fighters[1].hp=700;resolveTeamKnockout(t);assert.deepEqual(t.needsReplacement,[true,false]);assert.equal(t.fighters[0].hp,0);
 const d=createMatch(['ashfang'],['reefclaw'],{mode:'online'});d.phase='fight';d.fighters.forEach(f=>f.hp=0);resolveTeamKnockout(d);assert.equal(d.phase,'finished');assert.equal(d.winner,null);
});
test('CPU chooses a surviving reserve automatically and waits if the human also needs one',()=>{
 const s=battle('bot');ko(s,1);step(s);assert.equal(s.phase,'countdown');assert.equal(s.fighters[1].id,'hexeye');
 const d=battle('bot');d.fighters.forEach(f=>f.hp=0);resolveTeamKnockout(d);step(d);assert.equal(d.phase,'replacement');assert.deepEqual(d.needsReplacement,[true,false]);selectReplacement(d,0,'reefclaw');assert.equal(d.phase,'countdown');
});
test('serialized team snapshots simulate identically through replacements and subsequent damage',()=>{
 const a=battle();a.fighters[0].hp=51;const b=JSON.parse(JSON.stringify(a));
 for(const s of [a,b]){s.fighters[0].hp=0;step(s);selectReplacement(s,0,'reefclaw');for(let i=0;i<120;i++)step(s);s.fighters[0].x=500;s.fighters[1].x=590;queueAction(s,0,'e');for(let i=0;i<25;i++)step(s);}
 assert.deepEqual(a,b);assert.equal(b.teams[1].members[0].hp,b.fighters[1].hp);
});
test('twelve detailed fighters have unique atlas rows, four combat poses, and native transparent sprite cells',()=>{
 assert.equal(CELL,96);assert.equal(Object.keys(SPRITES).length,12);assert.equal(new Set(Object.values(SPRITES).map(s=>`${s.sheet}-${s.row}`)).size,12);
 for(const f of FIGHTERS){const m=SPRITES[f.id];assert.ok(m);assert.ok(m.row>=0&&m.row<4);const data=readFileSync(new URL(`../assets/art/${m.sheet}.png`,import.meta.url));assert.equal(data.readUInt32BE(16),CELL*4);assert.equal(data.readUInt32BE(20),CELL*4);assert.equal(data[25],6,'RGBA preserves transparency');assert.ok(data.length>10000);}
 assert.equal(POSE_COLUMNS.idle,0);assert.equal(POSE_COLUMNS.heavy,1);assert.equal(POSE_COLUMNS.hit,2);assert.equal(POSE_COLUMNS.ko,3);
});

test('a final simultaneous active KO awards victory to the team with a living bench fighter',()=>{
 const s=createMatch(['ashfang'],['reefclaw','glaciop'],{mode:'online'});s.phase='fight';s.fighters.forEach(f=>f.hp=0);resolveTeamKnockout(s);assert.equal(s.winner,1);assert.equal(s.phase,'finished');assert.equal(s.fighters[1].id,'glaciop');assert.ok(s.fighters[1].hp>0);
});
