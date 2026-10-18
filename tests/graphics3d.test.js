import test from 'node:test';
import assert from 'node:assert/strict';
import {FIGHTERS} from '../fighters.js';
import {makeCreature,animateCreature} from '../creatures3d.js';
import {makeWorld} from '../worlds3d.js';
import {combatPosition,poseFor,previewAngle,WORLD_PALETTES} from '../scene-data.js';
function finiteObject(root){root.updateMatrixWorld(true);root.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite),`${o.type} has an invalid transform`);});}
test('all 30 original 3D sculptures have real geometry and animate without invalid transforms',()=>{
  for(const spec of FIGHTERS){const model=makeCreature(spec);let meshes=0;model.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>20,spec.name);for(const pose of ['idle','walk','guard','ko','heavy','super']){animateCreature(model,pose,2500,pose==='heavy'?{age:12,active:16,duration:40}:null,false,false);finiteObject(model);}assert.equal(model.userData.spec.id,spec.id);}
});
test('every 3D world has distinct geometry, a lit platform, and valid animated weather',()=>{
  for(const id of Object.keys(WORLD_PALETTES)){const w=makeWorld(id);let meshes=0,lights=0;w.scene.traverse(o=>{if(o.isMesh)meshes++;if(o.isLight)lights++;});assert.ok(meshes>30,id);assert.ok(lights>=3,id);w.animate(12500,false);finiteObject(w.scene);assert.ok(w.fighters.isGroup);assert.ok(w.fx.isGroup);w.dispose();}
});
test('3D fight coordinates preserve movement distance and jumping height',()=>{
  assert.deepEqual(combatPosition({x:600,y:0}),{x:0,y:0,z:0});assert.equal(combatPosition({x:638,y:-76}).x,1);assert.equal(combatPosition({x:638,y:-76}).y,2);
  const f={hp:100,vx:0};assert.equal(poseFor(f),'idle');assert.equal(poseFor({...f,vx:4}),'walk');assert.equal(poseFor({...f,blocking:true}),'guard');assert.equal(poseFor({...f,attack:{kind:'special'}}),'special');assert.equal(poseFor({...f,hp:0,attack:{kind:'special'}}),'ko');
});
test('preview rotation responds to drag and respects reduced motion',()=>{
  assert.ok(Math.abs(previewAngle(1,3000,true)-1.36)<1e-12);assert.equal(previewAngle(1,0,true),previewAngle(1,20000,true));assert.notEqual(previewAngle(0,0),previewAngle(0,3000));
});
