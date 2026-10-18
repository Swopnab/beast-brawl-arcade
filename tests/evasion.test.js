import test from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,step,queueAction,emptyInput,hurtbox,PACE} from '../combat.js';
import {fighter} from '../fighters.js';
const idle=()=>[emptyInput(),emptyInput()];
function advance(s,n,input=idle()){for(let i=0;i<n;i++)step(s,input);}
function duel(){const s=createMatch('ashfang','zipcat',{mode:'online'});advance(s,360);s.fighters[0].x=500;s.fighters[1].x=590;return s;}
test('pressing jump lifts the defender over a low sweep for its entire active window',()=>{
  const s=duel(),before=s.fighters[1].hp;advance(s,6,[emptyInput(),{jump:true}]);assert.ok(s.fighters[1].y<-65);queueAction(s,0,'q',{block:true});advance(s,17);assert.equal(s.fighters[1].hp,before);
});
test('airborne defenders clear ordinary punches but rising strikes still intercept them',()=>{
  for(const antiAir of [false,true]){const s=duel(),d=s.fighters[1],hp=d.hp;d.y=-115;d.vy=-4;queueAction(s,0,antiAir?'e':'q',antiAir?{jump:true}:emptyInput());advance(s,16);assert.equal(d.hp<hp,antiAir);}
});
test('ground waves and fireballs hit grounded rivals and pass below a correctly timed jump',()=>{
  for(const height of [-22,-83])for(const airborne of [false,true]){const s=duel(),d=s.fighters[1],hp=d.hp;if(airborne)d.y=-155;s.projectiles.push({id:50,owner:0,x:d.x,y:height,vx:0,radius:17,damage:55,life:20,age:0,warmup:0,color:'#ff855f',kind:'projectile'});step(s);assert.equal(d.hp<hp,!airborne);}
});
test('movement and attack recovery use the faster arcade pace at a fixed 60 steps',()=>{
  const s=duel(),x=s.fighters[0].x;step(s,[{left:true},emptyInput()]);assert.ok(Math.abs((x-s.fighters[0].x)-fighter('ashfang').speed*PACE.run)<1e-9);
  const hit=duel();queueAction(hit,0,'q');advance(hit,PACE.light.duration);assert.equal(hit.fighters[0].attack,null);assert.ok(PACE.light.duration<23);assert.ok(PACE.heavy.duration<40);
  assert.ok(hurtbox({id:'crysteel',y:0}).top<hurtbox({id:'zipcat',y:0}).top);
});
