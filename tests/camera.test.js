import test from 'node:test';
import assert from 'node:assert/strict';
import {battleCamera,arenaPixels,SPRITE_WORLD_SIZE} from '../pixel-graphics.js';
import {createMatch} from '../combat.js';
test('the close camera makes fighters substantially larger and leaves headroom for jumps',()=>{
 const s=createMatch(['ashfang'],['reefclaw'],{mode:'online'}),before=structuredClone(s);
 const opening=battleCamera(s,480,270);assert.ok(120*opening.scale/270>.2);
 s.fighters[0].x=500;s.fighters[1].x=590;const close=battleCamera(s,480,270);assert.ok(close.scale>opening.scale);assert.ok(120*close.scale/270>.4);
 for(const [width,height]of [[240,400],[480,270],[640,230]])for(const jump of [0,-80,-180]){
  s.fighters[0].y=jump;const c=battleCamera(s,width,height);
  for(const f of s.fighters){assert.ok(c.x(f.x)>SPRITE_WORLD_SIZE*c.scale/2);assert.ok(c.x(f.x)+SPRITE_WORLD_SIZE*c.scale/2<width);assert.ok(c.y(f.y)-SPRITE_WORLD_SIZE*c.scale*90/96>=c.hud-1);assert.ok(c.y(f.y)<height);}
 }
 assert.deepEqual(before.teams[0].members[0].hp,s.teams[0].members[0].hp);
});
test('portrait and landscape rendering uses the actual canvas aspect without stretching pixels',()=>{
 for(const [w,h]of [[296,281],[360,560],[820,295],[1030,614]]){const p=arenaPixels(w,h);assert.ok(Math.abs(p.width/p.height-w/h)<.012);assert.ok(p.width>=240&&p.width<=640);}
});
