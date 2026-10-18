import test from 'node:test';
import assert from 'node:assert/strict';
import {joystickVector} from '../joystick.js';
import {STAGES,getStage} from '../stages.js';
import {createMatch,step,emptyInput} from '../combat.js';
test('joystick dead zone, four directions, and diagonals map to game commands',()=>{
  for(const [dx,dy,expected] of [[0,0,[]],[5,-5,[]],[-30,0,['left']],[30,0,['right']],[0,-40,['jump']],[0,40,['duck']],[40,-40,['right','jump']],[-40,40,['left','duck']]]){
    const v=joystickVector(dx,dy);assert.deepEqual(['left','right','jump','duck'].filter(k=>v[k]),expected);
  }
});
test('joystick clamps distant drags radially and invalid input resets safely',()=>{
  const v=joystickVector(10000,-10000);assert.ok(Math.abs(Math.hypot(v.x,v.y)-1)<1e-12);assert.equal(v.right,true);assert.equal(v.jump,true);
  for(const args of [[NaN,0],[0,Infinity],[1,2,0]])assert.deepEqual(joystickVector(...args),joystickVector(0,0));
});
test('five unique stages are available and an invalid stage has a safe fallback',()=>{
  assert.deepEqual(STAGES.map(s=>s.id),['volcano','water','rain','desert','jungle']);assert.equal(new Set(STAGES.map(s=>s.name)).size,5);assert.equal(getStage('missing').id,'volcano');
});
test('chosen background survives briefing, rounds, and online snapshots',()=>{
  for(const stage of STAGES){
    const s=createMatch('ashfang','zipcat',{mode:'online',stageId:stage.id});
    for(let n=0;n<4500;n++)step(s,[emptyInput(),emptyInput()]);
    assert.ok(s.round>1);assert.equal(s.stageId,stage.id);assert.equal(JSON.parse(JSON.stringify(s)).stageId,stage.id);
  }
});
