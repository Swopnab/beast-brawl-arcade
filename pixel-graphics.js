import {fighter,ARENAS} from './fighters.js?v=12';
import {sprite,loadSprites} from './pixel-sprites.js?v=12';
import {drawWorld,drawWeather,pixelRect as rect} from './pixel-worlds.js?v=12';
export const SPRITE_WORLD_SIZE=145;
export function battleCamera(s,width,height){
 const [a,b]=s.fighters,span=Math.abs(a.x-b.x),jump=Math.max(0,-a.y,-b.y),ground=height-30,hud=height<240?58:68;
 const scale=Math.max(.1,Math.min(1.05,width/(span+310),(ground-hud)/(140+jump))),visible=width/scale,mid=(a.x+b.x)/2;
 const left=visible>=1200?(1200-visible)/2:Math.max(0,Math.min(1200-visible,mid-visible/2));
 return {left,scale,ground,hud,x:value=>Math.round((value-left)*scale),y:value=>Math.round(ground+value*scale)};
}
export function arenaPixels(width,height){
 const ratio=Math.max(.3,width/Math.max(1,height)),w=ratio<1?240:Math.min(640,Math.round(270*ratio));
 return {width:w,height:Math.round(w/ratio)};
}
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function present(target,source){const c=target.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,target.width,target.height);c.drawImage(source,0,0,target.width,target.height);}
export function createPixelGraphics(){
 let motion=true;const ready=loadSprites(),worlds=new Map(),off=canvas(480,270),ctx=off.getContext('2d'),portrait=canvas(112,112),pc=portrait.getContext('2d');document.body.classList.add('pixel-mode');
 function background(id,w,h,time){
  const key=`${id}-${w}-${h}`;let base=worlds.get(key);
  if(!base){base=canvas(w,h);drawWorld(base.getContext('2d'),id,w,h,0);worlds.set(key,base);if(worlds.size>12)worlds.delete(worlds.keys().next().value);}
  if(off.width!==w||off.height!==h){off.width=w;off.height=h;}
  ctx.imageSmoothingEnabled=false;ctx.drawImage(base,0,0);if(motion)drawWeather(ctx,id,w,h,time);
 }
 function drawPortrait(target,id,time=0){pc.clearRect(0,0,112,112);sprite(pc,fighter(id),56,105,1.1,{frame:Math.floor(time/16),motion});present(target,portrait);}
 function effect(e,camera){
  const x=camera.x(e.x),y=camera.y(e.y),r=4+Math.floor(e.age/3),color=e.color||'#ffe0a7';
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,-.7]]){rect(ctx,'#172638',x+dx*r-1,y+dy*r-1,4,4);rect(ctx,color,x+dx*r,y+dy*r,2,2);}
  if(e.amount&&e.age<18){ctx.font='14px RPGPixel';ctx.textAlign='center';ctx.fillStyle='#142331';ctx.fillText(e.amount,x+1,y-10-Math.floor(e.age/2)+1);ctx.fillStyle='#fff0c7';ctx.fillText(e.amount,x,y-10-Math.floor(e.age/2));}
 }
 return {ready,setMotion(value){motion=value;},background(id,time){background(id,640,360,time);present(document.getElementById('scene-background'),off);},card(target,id,time){background(id,480,270,time);present(target,off);},thumbnail(target,id){drawPortrait(target,id);},preview(id,time){drawPortrait(document.getElementById('preview-canvas'),id,time);},battle(s,skin,time){
  const target=document.getElementById('arena'),dims=arenaPixels(target.clientWidth,target.clientHeight);
  if(target.width!==dims.width||target.height!==dims.height){target.width=dims.width;target.height=dims.height;}
  background(s.stageId,dims.width,dims.height,time);
  const camera=battleCamera(s,dims.width,dims.height),cosmetic=ARENAS.find(a=>a.id===skin);
  target.dataset.fighterPixels=String(Math.round(120*camera.scale*target.clientHeight/dims.height));
  if(skin!=='neon'&&cosmetic)rect(ctx,cosmetic.glow,0,camera.ground+2,dims.width,1);
  for(const f of s.fighters){
   const x=camera.x(f.x-f.facing*18),y=camera.y(f.y),size=SPRITE_WORLD_SIZE*camera.scale;
   rect(ctx,'#10252e77',x-size*.3,camera.ground+1,size*.6,3);
   let pose=f.hp<=0?'ko':f.hitFlash>0?'hit':f.ducking?'duck':Math.abs(f.vx)>1?'walk':'idle';
   if(f.attack&&f.attack.age>=Math.max(1,f.attack.active-3))pose=f.attack.kind;
   sprite(ctx,fighter(f.id),x,y,size/96,{facing:f.facing,pose,frame:s.frame,flash:f.hitFlash>4,motion});
   if(f.attack?.kind==='super'){const color=fighter(f.id).color;for(let k=0;k<10;k++){const phase=s.frame/8+k*.63,r=30+(k%3)*6;rect(ctx,color,x+Math.cos(phase)*r,y-size*.4+Math.sin(phase)*r,2+k%2,2+k%2);}}
   if(f.parryFrames>0){const edge=x+f.facing*48*camera.scale;for(let i=0;i<6;i++)rect(ctx,i%2?'#c0e8d1':'#74b6c0',edge+(i%2)*f.facing*2,y-65*camera.scale+i*8,2,5);}
  }
  for(const p of s.projectiles){
   const x=camera.x(p.x),y=camera.y(p.y),r=Math.max(3,Math.round(p.radius*camera.scale)),dir=Math.sign(p.vx),spec=fighter(p.sourceId);
   rect(ctx,spec.dark,x-r,y-r+2,r*2,r*2-4);rect(ctx,p.color,x-r+2,y-r,r*2-4,r*2);rect(ctx,'#fff0bf',x-2,y-2,4,4);
   for(let k=1;k<4;k++)rect(ctx,k%2?spec.dark:p.color,x-dir*(r+k*4),y+(k%2?2:-3),4-k,2);
  }
  for(const e of s.effects)effect(e,camera);
  present(target,off);
 }};
}
