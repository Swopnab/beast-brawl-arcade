import * as T from './vendor/three.module.js';
import {fighter,ARENAS} from './fighters.js?v=9';
import {makeCreature,animateCreature} from './creatures3d.js?v=9';
import {makeWorld} from './worlds3d.js?v=9';
import {combatPosition,poseFor,previewAngle} from './scene-data.js?v=9';
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export function createGraphics3D(){
  const renders=[];
  function renderer(alpha=false){const r=new T.WebGLRenderer({alpha,antialias:true,powerPreference:'high-performance'});renders.push(r);r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.25;return r;}
  let background,preview,battle;
  try{background=renderer();preview=renderer(true);battle=renderer();}catch(e){renders.forEach(r=>r.dispose());throw e;}
  function mount(r,id){const original=document.getElementById(id);for(const a of original.attributes)r.domElement.setAttribute(a.name,a.value);original.replaceWith(r.domElement);r.domElement.addEventListener('webglcontextlost',()=>{document.getElementById('render-status').textContent='Graphics paused. Reload to resume.';});}
  mount(background,'scene-background');mount(preview,'preview-canvas');mount(battle,'arena');
  const worlds=new Map();function world(id){if(!worlds.has(id))worlds.set(id,makeWorld(id));return worlds.get(id);}
  const bgCamera=new T.PerspectiveCamera(47,16/9,.1,180);bgCamera.position.set(11,9,27);bgCamera.lookAt(0,4,-16);
  const battleCamera=new T.PerspectiveCamera(39,16/9,.1,180);battleCamera.position.set(0,7,25);battleCamera.lookAt(0,2.1,0);
  const previewScene=new T.Scene(),previewCamera=new T.PerspectiveCamera(32,1,.1,70);previewCamera.position.set(0,4.8,16);previewCamera.lookAt(0,2.7,0);
  previewScene.add(new T.HemisphereLight(0xf1f7ff,0x41445a,3));const key=new T.DirectionalLight(0xffe3bb,4);key.position.set(-5,8,8);key.castShadow=true;previewScene.add(key);const rim=new T.DirectionalLight(0xb6dfff,3);rim.position.set(5,5,-5);previewScene.add(rim);
  const podium=new T.Mesh(new T.CylinderGeometry(2.45,2.65,.28,48),new T.MeshStandardMaterial({color:0x273b4a,roughness:.45,metalness:.5}));podium.position.y=-.12;podium.receiveShadow=true;previewScene.add(podium);
  const halo=new T.Mesh(new T.TorusGeometry(2.48,.025,6,64),new T.MeshBasicMaterial({color:0xffb26e}));halo.rotation.x=Math.PI/2;halo.position.y=.04;previewScene.add(halo);
  let chosen=null,model=null,drag=0,pointer=null,lastX=0;
  const canvas=preview.domElement;canvas.addEventListener('pointerdown',e=>{pointer=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(pointer);});canvas.addEventListener('pointermove',e=>{if(pointer===e.pointerId){drag+=(e.clientX-lastX)*.012;lastX=e.clientX;}});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>pointer=null);
  document.getElementById('rotate-left').addEventListener('click',()=>drag-=Math.PI/6);document.getElementById('rotate-right').addEventListener('click',()=>drag+=Math.PI/6);document.getElementById('rotate-reset').addEventListener('click',()=>drag=0);
  const portraits=new Map();const rosterModels=new Map();function sculpture(id){if(!rosterModels.has(id))rosterModels.set(id,makeCreature(fighter(id)));return rosterModels.get(id);}
  const positions=[null,null],battleModels=[null,null];let matchId='';
  const fxGeo=new T.IcosahedronGeometry(1,1),fxBall=new T.SphereGeometry(1,10,7),fxCone=new T.ConeGeometry(1,1,6),fxBeam=new T.CylinderGeometry(1,1,1,6),fxRing=new T.TorusGeometry(1,.07,5,36),fxMaterial=new T.MeshBasicMaterial({color:0xffd982,transparent:true,opacity:.85}),fxPool=[];
  function effect(w,index,color,x,y,z,size,opacity=1){let m=fxPool[index];if(!m){m=new T.Mesh(fxGeo,fxMaterial.clone());fxPool[index]=m;}if(m.parent!==w.fx)w.fx.add(m);m.geometry=fxGeo;m.quaternion.identity();m.material.blending=T.NormalBlending;m.visible=true;m.material.color.set(color);m.material.opacity=opacity;m.position.set(x,y,z);m.scale.setScalar(size);return m;}
  function fit(r,camera){const width=Math.max(1,r.domElement.clientWidth||r.domElement.width),height=Math.max(1,r.domElement.clientHeight||r.domElement.height);const ratio=width/height;if(r.domElement.width!==Math.round(width*r.getPixelRatio())||r.domElement.height!==Math.round(height*r.getPixelRatio()))r.setSize(width,height,false);camera.aspect=ratio;camera.updateProjectionMatrix();}
  document.body.classList.add('graphics-3d');document.getElementById('edition-name').textContent='3D ARCADE EDITION';document.getElementById('render-status').textContent='3D WORLDS / ORIGINAL CREATURES';
  return {
    setMotion(enabled){reduced=!enabled;},
    background(id,now){const w=world(id);w.fighters.visible=false;w.fx.visible=false;w.animate(now,reduced);if(!reduced){bgCamera.position.x=11+Math.sin(now/9000)*1.3;bgCamera.lookAt(0,4,-16);}fit(background,bgCamera);background.render(w.scene,bgCamera);},
    card(canvas,id,now){const w=world(id);w.fighters.visible=false;w.fx.visible=false;w.animate(now,reduced);fit(background,bgCamera);background.render(w.scene,bgCamera);const ctx=canvas.getContext('2d');const src=background.domElement,ratio=canvas.width/canvas.height,srcRatio=src.width/src.height;let sx=0,sy=0,sw=src.width,sh=src.height;if(ratio<srcRatio){sw=sh*ratio;sx=(src.width-sw)/2;}else{sh=sw/ratio;sy=(src.height-sh)/2;}ctx.drawImage(src,sx,sy,sw,sh,0,0,canvas.width,canvas.height);},
    thumbnail(canvas,id){if(!portraits.has(id)){const temp=sculpture(id);if(model)previewScene.remove(model);previewScene.add(temp);animateCreature(temp,'idle',1500,null,false,true);temp.scale.multiplyScalar(1.15);temp.rotation.set(0,temp.userData.spec.anatomy.legs===4?.95:.36,0);temp.position.set(0,0,0);halo.material.color.set(fighter(id).color);const savedPosition=previewCamera.position.clone(),savedTarget=new T.Vector3(0,2.7,0),bounds=new T.Box3().setFromObject(temp),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),distance=Math.max(size.x,size.y)*2.05;previewCamera.position.set(0,center.y+distance*.08,distance);previewCamera.lookAt(0,center.y,0);preview.setSize(128,128,false);previewCamera.aspect=1;previewCamera.updateProjectionMatrix();preview.render(previewScene,previewCamera);const image=document.createElement('canvas');image.width=128;image.height=128;image.getContext('2d').drawImage(preview.domElement,0,0,128,128);portraits.set(id,image);previewCamera.position.copy(savedPosition);previewCamera.lookAt(savedTarget);previewScene.remove(temp);if(model)previewScene.add(model);}const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(portraits.get(id),0,0,canvas.width,canvas.height);},
    preview(id,now){if(chosen!==id){if(model)previewScene.remove(model);model=sculpture(id);previewScene.add(model);chosen=id;drag=0;halo.material.color.set(fighter(id).color);}animateCreature(model,'idle',now,null,false,reduced);model.scale.multiplyScalar(1.15);model.position.set(0,0,0);model.rotation.set(0,previewAngle(drag,now,reduced)+(model.userData.spec.anatomy.legs===4?.55:0),0);fit(preview,previewCamera);preview.render(previewScene,previewCamera);},
    battle(state,palette,now){const w=world(state.stageId||'volcano');w.fighters.visible=true;w.fx.visible=true;w.animate(now,reduced);w.ring.material.color.set(ARENAS.find(a=>a.id===palette)?.glow||'#f1d8a9');
      if(matchId!==state.id){positions[0]=positions[1]=null;matchId=state.id;}
      state.fighters.forEach((f,i)=>{let m=battleModels[i];if(!m||m.userData.spec.id!==f.id){if(m)m.removeFromParent();m=makeCreature(fighter(f.id));battleModels[i]=m;}if(m.parent!==w.fighters)w.fighters.add(m);const p=combatPosition(f);positions[i]??={...p};positions[i].x+=(p.x-positions[i].x)*.5;positions[i].y+=(p.y-positions[i].y)*.5;m.position.set(positions[i].x,positions[i].y,.15);m.rotation.set(0,f.facing*(m.userData.spec.anatomy.legs===4?1.15:.65),0);animateCreature(m,poseFor(f),now,f.attack,f.hitFlash>0,reduced);});
      fxPool.forEach(m=>m.visible=false);let n=0;
      const beam=(color,a,b,width=.07,opacity=.8)=>{const delta=new T.Vector3(...b).sub(new T.Vector3(...a)),mid=new T.Vector3(...a).addScaledVector(delta,.5),m=effect(w,n++,color,mid.x,mid.y,mid.z,1,opacity);m.geometry=fxBeam;m.scale.set(width,delta.length(),width);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;};
      const ring=(color,x,y,z,radius,opacity=.7)=>{const m=effect(w,n++,color,x,y,z,radius,opacity);m.geometry=fxRing;m.rotation.x=-Math.PI/2;return m;};
      const elemental=(element,x,y,z,power=1,age=0,direction=1)=>{
        const t=now/140;
        if(element==='Ember'){
          const core=effect(w,n++,'#fff4a0',x,y,z,.28*power);core.geometry=fxBall;
          for(let k=0;k<9;k++){const trail=k/8,m=effect(w,n++,k<3?'#ffad30':'#ef4933',x-direction*trail*1.6*power,y+Math.sin(t+k)*.12,z+Math.cos(t+k)*.1,(.38-trail*.28)*power,1-trail*.6);m.rotation.set(t+k,t*.3,0);}
          for(let k=0;k<4;k++){const m=effect(w,n++,'#ffd16c',x-direction*(.6+k*.3)*power,y+Math.sin(k+t)*.5*power,z+.15,.07*power,.8);m.geometry=fxCone;m.rotation.z=-direction*1.1;}
        }else if(element==='Tide'){
          const m=effect(w,n++,'#50cde9',x,y,z,.43*power,.75);m.geometry=fxBall;m.scale.set(1.25*power,.33*power,.33*power);beam('#b0fcff',[x-direction*1.5*power,y,z],[x,y,z],.16*power,.8);
          for(let k=0;k<8;k++){const a=k*Math.PI/4+t;effect(w,n++,'#c4fbff',x-direction*(k%3)*.38,y+Math.sin(a)*.43*power,z+Math.cos(a)*.4*power,.07*power,.8);}
        }else if(element==='Volt'){
          let previous=[x-direction*1.6*power,y,z];for(let k=0;k<7;k++){const point=[x-direction*(1.6-k*.27)*power,y+Math.sin(k*2+Math.floor(now/60))*.27*power,z];beam(k%2?'#fff3b1':'#f7df45',previous,point,.045*power);previous=point;}effect(w,n++,'#fff6ba',x,y,z,.18*power);
        }else if(element==='Wild'){
          for(let k=0;k<7;k++){const a=k*.9+t,m=effect(w,n++,k%2?'#d5f0a1':'#68b76a',x-direction*k*.15,y+Math.sin(a)*.36*power,z+Math.cos(a)*.35*power,.2*power);m.geometry=fxCone;m.scale.set(.13*power,.4*power,.06*power);m.rotation.set(t,a,k);}
        }else if(element==='Void'){
          const m=effect(w,n++,'#352660',x,y,z,.42*power,.9);m.geometry=fxBall;for(let k=0;k<10;k++){const a=k*.63+t;effect(w,n++,k%2?'#c7a6ff':'#efbcf1',x+Math.cos(a)*.55*power,y+Math.sin(a)*.55*power,z+Math.sin(a+t)*.2,.07*power,.9);}
        }else{
          for(let k=0;k<6;k++){const m=effect(w,n++,k%2?'#e1f8ff':'#72c9f2',x-direction*k*.22,y+Math.sin(k*2+t)*.3*power,z+Math.cos(k*2)*.2,.3*power);m.geometry=fxCone;m.scale.set(.13*power,.62*power,.13*power);m.rotation.z=-direction*1.1;}
        }
      };
      for(const p of state.projectiles){const spec=fighter(p.sourceId||state.fighters[p.owner].id),x=(p.x-600)/38,y=-p.y/38,power=p.superMove?1.65:1;if(p.kind==='trap'){const active=p.age>=p.warmup;ring(spec.color,x,.1,0,1.3,active?.8:.25);if(active)for(let k=0;k<5;k++){const m=effect(w,n++,k%2?'#b9f7ff':spec.color,x+(k-2)*.35,.8+Math.sin(k+p.age)*.2,0,.35,.8);m.geometry=fxCone;m.scale.set(.2,1.6,.2);}}else elemental(spec.element,x,y,.2,power,p.age,p.vx>=0?1:-1);}
      for(const e of state.effects){const progress=e.age/e.life;for(let k=0;k<9;k++){const a=k*Math.PI*2/9+e.id;effect(w,n++,k%2?e.color:'#fff3d2',(e.x-600)/38+Math.cos(a)*progress*1.6,-e.y/38+Math.sin(a)*progress*1.6,.2+Math.sin(k)*.3,.07+(1-progress)*.09,1-progress);}if(['parry','reflect','counter'].includes(e.type)){const m=effect(w,n++,'#b4eaff',(e.x-600)/38,-e.y/38,.6,1,.2*(1-progress));m.geometry=fxBall;m.scale.set(.6,1,.3);}}
      // Distinct silhouettes communicate each ultimate's actual combat pattern.
      for(const f of state.fighters){
        const spec=fighter(f.id),x=(f.x-600)/38,y=-f.y/38;
        if(f.parryFrames>0){const m=effect(w,n++,'#c9fbff',x+f.facing*.6,y+1.6,.65,1,.3);m.geometry=fxBall;m.scale.set(.3,1.2,.2);}
        const a=f.attack;if(a?.kind!=='super')continue;
        const t=a.age/12,dir=f.facing,color=spec.color,alpha=.75,style=a.ultimateId;
        if(style==='dragon-dive')for(const side of [-1,1])for(let k=0;k<4;k++)beam(color,[x,y+2,.1],[x+dir*(.5+k*.5),y+2+side*(.8+k*.18),.1],.1,alpha);
        if(style==='furnace-ring')for(let k=0;k<3;k++)ring(k%2?'#fff0a0':color,x,.12+k*.3,0,1.1+k*.7,.7);
        if(style==='pincer-grab')for(const side of [-1,1]){const m=effect(w,n++,color,x+dir*1.4,y+1.3+side*.8*Math.cos(t),.3,.6);m.geometry=fxCone;m.rotation.z=side*Math.PI/2;m.scale.set(.35,1.4,.35);}
        if(style==='tentacle-flurry')for(let k=0;k<6;k++)beam(color,[x,y+.5+k*.3,0],[x+dir*(1.5+Math.sin(t+k)),y+.6+k*.3,.5],.09);
        if(style==='volt-rush')for(let k=0;k<5;k++){const m=effect(w,n++,k%2?'#fff8a6':color,x-dir*k*.55,y+1.1,.05,.7,(5-k)*.12);m.geometry=fxBall;m.scale.set(.3,.65,.3);}
        if(style==='antler-rise')for(let k=-1;k<2;k++)beam(color,[x,y+1.6,.3],[x+dir*(.6+k*.4),y+3.6+Math.sin(t)*.5,.3],.1);
        if(style==='root-charge')for(let k=0;k<4;k++){const m=effect(w,n++,color,x-dir*k*.6,.2,0,.4,.7);m.geometry=fxCone;m.rotation.z=-dir*.7;m.scale.set(.3,.8,.3);}
        if(style==='petal-orbit')for(let k=0;k<9;k++){const theta=k*.7+t,m=effect(w,n++,k%2?'#f5d4ee':color,x+Math.cos(theta)*2.3,y+1.4+Math.sin(theta)*.9,Math.sin(theta)*.6,.3);m.geometry=fxCone;m.rotation.z=theta;}
        if(style==='soul-siphon')for(let k=0;k<3;k++){const phase=(t*.4+k/3)%1;const m=effect(w,n++,color,x+dir*(1-phase)*3,y+1.3+Math.sin(phase*6)*.4,.3,.2);m.geometry=fxBall;beam(color,[x,y+1.8,.3],[m.position.x,m.position.y,.3],.025,.4);}
        if(style==='gravity-well'){const m=effect(w,n++,'#211635',x,y+1.5,.4,.65);m.geometry=fxBall;for(let k=0;k<3;k++){const r=effect(w,n++,color,x,y+1.5,.4,1.1+k*.35,.65);r.geometry=fxRing;r.rotation.set(t+k,k,0);}}
        if(style==='frost-ballet')for(let k=0;k<3;k++){const m=effect(w,n++,color,x-dir*k*.7,y+.6+k*.4,.2,.6,.7-k*.15);m.geometry=fxRing;m.rotation.z=t+k;}
        if(style==='crystal-lock')for(let k=0;k<5;k++){const m=effect(w,n++,k%2?'#f1ffff':color,x+dir*(.5+k*.65),.4+Math.sin(t+k)*.1,.2,.4);m.geometry=fxCone;m.scale.set(.25,.8+(k%3)*.4,.3);}
      }
      for(const f of state.fighters){if(f.attack){const a=f.attack,spec=fighter(f.id),active=Math.abs(a.age-a.active)<10,special=['ranged','super'].includes(a.kind),x=(f.x-600)/38,y=-f.y/38;
        if(active){const power=a.kind==='super'?1.8:special?1.1:.5;elemental(spec.element,x+f.facing*1.25,y+1.7,.3,power,a.age,f.facing);if(special){ring(spec.color,x,.11,0,1+(a.age-a.active+10)*.09,.65);if(spec.element==='Wild'||spec.element==='Frost')for(let k=0;k<5;k++){const m=effect(w,n++,spec.color,x+f.facing*(.6+k*.4),.35+k*.1,0,.3,.8);m.geometry=fxCone;m.scale.set(.17,.7+k*.17,.15);}}}
        else if(special&&a.age<a.active){const charge=a.age/a.active;for(let k=0;k<5;k++){const theta=k*1.25+now/180;effect(w,n++,spec.color,x+Math.cos(theta)*(1-charge*.5),y+1.7+Math.sin(theta)*.6,.3,.06+charge*.06,.7);}}
      }}
      fit(battle,battleCamera);const highest=Math.max(...state.fighters.map((f,i)=>positions[i].y+fighter(f.id).anatomy.bodyHeight*fighter(f.id).anatomy.scale)),targetY=Math.max(2.1,highest*.48),center=Math.max(-6,Math.min(6,(positions[0].x+positions[1].x)/2)),distance=Math.max(16,Math.min(27,15+Math.abs(positions[0].x-positions[1].x)*.55),(highest+1.6)/(2*Math.tan(39*Math.PI/360)))*Math.max(1,1.5/battleCamera.aspect);battleCamera.position.y+=(targetY+4.9-battleCamera.position.y)*.07;battleCamera.position.z+=(distance-battleCamera.position.z)*.04;battleCamera.position.x+=(center-battleCamera.position.x)*.06;if(!reduced&&state.shake)battleCamera.position.x+=Math.sin(now*.1)*state.shake*.008;battleCamera.lookAt(battleCamera.position.x,targetY,0);
      fit(battle,battleCamera);battle.render(w.scene,battleCamera);
    }
  };
}
