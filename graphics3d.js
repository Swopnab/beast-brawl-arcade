import * as T from './vendor/three.module.js';
import {fighter,ARENAS} from './fighters.js';
import {makeCreature,animateCreature} from './creatures3d.js';
import {makeWorld} from './worlds3d.js';
import {combatPosition,poseFor,previewAngle} from './scene-data.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export function createGraphics3D(){
  const renders=[];
  function renderer(alpha=false){const r=new T.WebGLRenderer({alpha,antialias:true,powerPreference:'high-performance'});renders.push(r);r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.25;return r;}
  let background,preview,battle;
  try{background=renderer();preview=renderer(true);battle=renderer();}catch(e){renders.forEach(r=>r.dispose());throw e;}
  function mount(r,id){const original=document.getElementById(id);for(const a of original.attributes)r.domElement.setAttribute(a.name,a.value);original.replaceWith(r.domElement);r.domElement.addEventListener('webglcontextlost',()=>{document.getElementById('render-status').textContent='Graphics paused. Reload to resume.';});}
  mount(background,'scene-background');mount(preview,'preview-canvas');mount(battle,'arena');
  const worlds=new Map();function world(id){if(!worlds.has(id))worlds.set(id,makeWorld(id));return worlds.get(id);}
  const bgCamera=new T.PerspectiveCamera(47,16/9,.1,180);bgCamera.position.set(15,10,28);bgCamera.lookAt(0,4,-13);
  const battleCamera=new T.PerspectiveCamera(39,16/9,.1,180);battleCamera.position.set(0,7,25);battleCamera.lookAt(0,2.1,0);
  const previewScene=new T.Scene(),previewCamera=new T.PerspectiveCamera(32,1,.1,70);previewCamera.position.set(0,4,12.4);previewCamera.lookAt(0,2.8,0);
  previewScene.add(new T.HemisphereLight(0xf1f7ff,0x41445a,3));const key=new T.DirectionalLight(0xffe3bb,4);key.position.set(-5,8,8);key.castShadow=true;previewScene.add(key);const rim=new T.DirectionalLight(0xb6dfff,3);rim.position.set(5,5,-5);previewScene.add(rim);
  const podium=new T.Mesh(new T.CylinderGeometry(1.8,2,.28,48),new T.MeshStandardMaterial({color:0x273b4a,roughness:.45,metalness:.5}));podium.position.y=-.12;podium.receiveShadow=true;previewScene.add(podium);
  const halo=new T.Mesh(new T.TorusGeometry(1.83,.025,6,64),new T.MeshBasicMaterial({color:0xffb26e}));halo.rotation.x=Math.PI/2;halo.position.y=.04;previewScene.add(halo);
  let chosen=null,model=null,drag=0,pointer=null,lastX=0;
  const canvas=preview.domElement;canvas.addEventListener('pointerdown',e=>{pointer=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(pointer);});canvas.addEventListener('pointermove',e=>{if(pointer===e.pointerId){drag+=(e.clientX-lastX)*.012;lastX=e.clientX;}});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>pointer=null);
  document.getElementById('rotate-left').addEventListener('click',()=>drag-=Math.PI/6);document.getElementById('rotate-right').addEventListener('click',()=>drag+=Math.PI/6);document.getElementById('rotate-reset').addEventListener('click',()=>drag=0);
  const portraits=new Map();const rosterModels=new Map();function sculpture(id){if(!rosterModels.has(id))rosterModels.set(id,makeCreature(fighter(id)));return rosterModels.get(id);}
  const positions=[null,null],battleModels=[null,null];let matchId='';
  const fxGeo=new T.IcosahedronGeometry(1,1),fxMaterial=new T.MeshBasicMaterial({color:0xffd982,transparent:true,opacity:.85}),fxPool=[];
  function effect(w,index,color,x,y,z,size,opacity=1){let m=fxPool[index];if(!m){m=new T.Mesh(fxGeo,fxMaterial.clone());fxPool[index]=m;}if(m.parent!==w.fx)w.fx.add(m);m.visible=true;m.material.color.set(color);m.material.opacity=opacity;m.position.set(x,y,z);m.scale.setScalar(size);return m;}
  function fit(r,camera){const width=Math.max(1,r.domElement.clientWidth||r.domElement.width),height=Math.max(1,r.domElement.clientHeight||r.domElement.height);const ratio=width/height;if(r.domElement.width!==Math.round(width*r.getPixelRatio())||r.domElement.height!==Math.round(height*r.getPixelRatio()))r.setSize(width,height,false);camera.aspect=ratio;camera.updateProjectionMatrix();}
  document.body.classList.add('graphics-3d');document.getElementById('edition-name').textContent='3D ARCADE EDITION';document.getElementById('render-status').textContent='3D WORLDS / ORIGINAL CREATURES';
  return {
    background(id,now){const w=world(id);w.fighters.visible=false;w.fx.visible=false;w.animate(now,reduced);fit(background,bgCamera);background.render(w.scene,bgCamera);},
    card(canvas,id,now){const w=world(id);w.fighters.visible=false;w.fx.visible=false;w.animate(now,reduced);fit(background,bgCamera);background.render(w.scene,bgCamera);const ctx=canvas.getContext('2d');const src=background.domElement,ratio=canvas.width/canvas.height,srcRatio=src.width/src.height;let sx=0,sy=0,sw=src.width,sh=src.height;if(ratio<srcRatio){sw=sh*ratio;sx=(src.width-sw)/2;}else{sh=sw/ratio;sy=(src.height-sh)/2;}ctx.drawImage(src,sx,sy,sw,sh,0,0,canvas.width,canvas.height);},
    thumbnail(canvas,id){if(!portraits.has(id)){const temp=sculpture(id);if(model)previewScene.remove(model);previewScene.add(temp);animateCreature(temp,'idle',1500,null,false,true);temp.scale.multiplyScalar(1.4);temp.rotation.set(0,.36,0);temp.position.set(0,0,0);halo.material.color.set(fighter(id).color);preview.setSize(128,128,false);previewCamera.aspect=1;previewCamera.updateProjectionMatrix();preview.render(previewScene,previewCamera);const image=document.createElement('canvas');image.width=128;image.height=128;image.getContext('2d').drawImage(preview.domElement,0,0,128,128);portraits.set(id,image);previewScene.remove(temp);if(model)previewScene.add(model);}const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(portraits.get(id),0,0,canvas.width,canvas.height);},
    preview(id,now){if(chosen!==id){if(model)previewScene.remove(model);model=sculpture(id);previewScene.add(model);chosen=id;drag=0;halo.material.color.set(fighter(id).color);}animateCreature(model,'idle',now,null,false,reduced);model.scale.multiplyScalar(1.4);model.position.set(0,0,0);model.rotation.set(0,previewAngle(drag,now,reduced),0);fit(preview,previewCamera);preview.render(previewScene,previewCamera);},
    battle(state,palette,now){const w=world(state.stageId||'volcano');w.fighters.visible=true;w.fx.visible=true;w.animate(now,reduced);w.ring.material.color.set(ARENAS.find(a=>a.id===palette)?.glow||'#f1d8a9');
      if(matchId!==state.id){positions[0]=positions[1]=null;matchId=state.id;}
      state.fighters.forEach((f,i)=>{let m=battleModels[i];if(!m||m.userData.spec.id!==f.id){if(m)m.removeFromParent();m=makeCreature(fighter(f.id));battleModels[i]=m;}if(m.parent!==w.fighters)w.fighters.add(m);const p=combatPosition(f);positions[i]??={...p};positions[i].x+=(p.x-positions[i].x)*.5;positions[i].y+=(p.y-positions[i].y)*.5;m.position.set(positions[i].x,positions[i].y,.15);m.rotation.set(0,f.facing*.65,0);animateCreature(m,poseFor(f),now,f.attack,f.hitFlash>0,reduced);});
      fxPool.forEach(m=>m.visible=false);let n=0;
      for(const p of state.projectiles){const m=effect(w,n++,p.color,(p.x-600)/38,-p.y/38,.2,Math.max(.22,p.radius/38),p.age<p.warmup?.25:.85);m.rotation.set(now/200,now/160,0);if(p.kind==='trap'){m.position.y=.3;m.scale.set(1.2,p.age<p.warmup?.2:1.8,.5);}else effect(w,n++,0xfff3d1,(p.x-600)/38,-p.y/38,.3,.18);}
      for(const e of state.effects){const progress=e.age/e.life;for(let k=0;k<7;k++){const a=k*Math.PI*2/7+e.id;effect(w,n++,k%2?e.color:'#fff3d2',(e.x-600)/38+Math.cos(a)*progress*1.6,-e.y/38+Math.sin(a)*progress*1.6,.2+Math.sin(k)*.3,.07+(1-progress)*.09,1-progress);}}
      for(const f of state.fighters){if(f.attack&&Math.abs(f.attack.age-f.attack.active)<8){const a=f.attack,progress=(a.age-a.active+8)/16;for(let k=0;k<6;k++){const angle=-1.1+k*.44;effect(w,n++,fighter(f.id).color,(f.x-600)/38+f.facing*(1+Math.cos(angle)*progress*1.5),-f.y/38+1.7+Math.sin(angle)*progress*1.5,.4,.13);}}}
      const center=Math.max(-6,Math.min(6,(positions[0].x+positions[1].x)/2)),distance=Math.max(16,Math.min(27,15+Math.abs(positions[0].x-positions[1].x)*.55));battleCamera.position.z+=(distance-battleCamera.position.z)*.04;battleCamera.position.x+=(center-battleCamera.position.x)*.06;if(!reduced&&state.shake)battleCamera.position.x+=Math.sin(now*.1)*state.shake*.008;battleCamera.lookAt(battleCamera.position.x,2.1,0);
      fit(battle,battleCamera);battle.render(w.scene,battleCamera);
    }
  };
}
