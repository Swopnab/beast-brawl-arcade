import {fighter,ARENAS} from './fighters.js?v=10';
import {sprite} from './pixel-sprites.js?v=10';
const W=320,H=180;
const palettes={volcano:['#27213d','#59405b','#8b5060','#312e43','#ff8754'],water:['#77bfd3','#426f90','#547d91','#344e67','#9ee9de'],rain:['#191b36','#303550','#434b70','#272a43','#bda7e2'],desert:['#efd19a','#c79877','#a36b68','#705b66','#f4dd9b'],jungle:['#b0cda6','#54877a','#326559','#263f47','#a3c878']};
function rect(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
export function drawPixelWorld(c,id='volcano',tick=0){
 const [sky,far,near,floor,accent]=palettes[id]||palettes.volcano;
 rect(c,sky,0,0,W,H);
 // Stepped silhouettes rather than smoothed polygons or 3D meshes.
 for(let x=0;x<W;x+=4){const ridge=70+Math.round((Math.sin(x*.023)+Math.sin(x*.051))*12);rect(c,far,x,ridge,4,100-ridge);}
 if(id==='rain'){
  for(let x=0;x<W;x+=23){const h=42+(x*17%43);rect(c,near,x,120-h,19,h);for(let y=125-h;y<112;y+=10)for(let xx=x+4;xx<x+16;xx+=7)if((xx+y)%3)rect(c,accent,xx,y,2,3);}
  for(let i=0;i<34;i++){const x=(i*37+Math.floor(tick/120))%W,y=(i*29+Math.floor(tick/50))%150;rect(c,'#65788e',x,y,1,4);}
 }else if(id==='water'){
  rect(c,near,0,102,W,43);for(const x of [22,132,256]){rect(c,'#8dcbd1',x,80,17,65);for(let k=0;k<5;k++)rect(c,accent,x+2+k*3,82+(Math.floor(tick/90)+k*13)%60,2,9);}
  for(let i=0;i<16;i++)rect(c,accent,(i*23+Math.floor(tick/160))%W,125+i%4*5,11,1);
 }else if(id==='jungle'){
  for(const x of [6,55,124,210,290]){rect(c,'#3c5446',x,65,8,84);rect(c,near,x-15,45,38,26);rect(c,near,x-23,58,50,20);rect(c,'#558a66',x-10,42,24,12);rect(c,'#244b48',x+15,75,2,45);}
 }else if(id==='desert'){
  for(const x of [8,92,220]){rect(c,near,x,96,55,49);rect(c,near,x+8,82,36,20);rect(c,'#d29b7c',x+8,82,36,3);}
  rect(c,'#537b64',282,113,4,32);rect(c,'#537b64',275,120,8,4);rect(c,'#537b64',275,113,3,10);
 }else{
  for(let x=30;x<170;x+=3){const y=100-Math.round((1-Math.abs(x-100)/70)*55);rect(c,near,x,y,3,140-y);if(x>92&&x<109)rect(c,accent,x,y+2,3,10);}
  rect(c,'#a04d56',0,132,W,16);for(let i=0;i<25;i++)rect(c,accent,(i*17+Math.floor(tick/260))%W,135+i%3*4,8,2);
 }
 rect(c,floor,0,147,W,33);rect(c,accent,0,147,W,2);rect(c,'#191c30',0,150,W,2);
 for(let y=158;y<H;y+=9)for(let x=(y%2)*11;x<W;x+=23)rect(c,'#ffffff0d',x,y,12,1);
 for(let i=0;i<18;i++)rect(c,'#11132744',i*19,152+i%4*6,3,2);
}
function buffer(){const c=document.createElement('canvas');c.width=W;c.height=H;return c;}
function present(target,source){const c=target.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,target.width,target.height);c.drawImage(source,0,0,target.width,target.height);}
export function createPixelGraphics(){
 let motion=true;const off=buffer(),ctx=off.getContext('2d');document.body.classList.add('pixel-mode');
 const world=(id,time)=>drawPixelWorld(ctx,id,motion?time:0);
 function portrait(target,id,time=0,large=false){const p=document.createElement('canvas');p.width=large?96:48;p.height=large?90:48;const c=p.getContext('2d');sprite(c,fighter(id),p.width/2,p.height-(large?6:5),large?3:1,{frame:motion?Math.floor(time/16):0});present(target,p);}
 return {setMotion(value){motion=value;},background(id,time){world(id,time);present(document.getElementById('scene-background'),off);},card(target,id,time){world(id,time);present(target,off);},thumbnail(target,id){portrait(target,id);},preview(id,time){portrait(document.getElementById('preview-canvas'),id,time,true);},battle(s,skin,time){
  world(s.stageId,time);const cosmetic=ARENAS.find(a=>a.id===skin);if(skin!=='neon'&&cosmetic)rect(ctx,cosmetic.glow,0,149,W,1);const scale=W/1200,ground=147;
  for(const f of s.fighters){const x=Math.round(f.x*scale),y=Math.round(ground+f.y*scale);rect(ctx,'#11132788',x-11,148,22,3);sprite(ctx,fighter(f.id),x,y,1,{facing:f.facing,pose:f.hp<=0?'ko':f.attack?.kind||(f.ducking?'duck':Math.abs(f.vx)>1?'walk':'idle'),frame:s.frame,flash:f.hitFlash>0});
   if(f.parryFrames>0){rect(ctx,'#b8fff3',x+f.facing*13,y-25,2,23);rect(ctx,'#b8fff3',x+f.facing*11,y-27,3,2);}
  }
  for(const p of s.projectiles){const x=p.x*scale,y=ground+p.y*scale;rect(ctx,p.color,x-3,y-3,6,6);rect(ctx,'#fff4c8',x-1,y-1,2,2);rect(ctx,p.color,x-Math.sign(p.vx)*8,y-1,4,2);}
  for(const e of s.effects){const x=Math.round(e.x*scale),y=Math.round(ground+e.y*scale),r=3+Math.floor(e.age/4);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])rect(ctx,e.color,x+dx*r,y+dy*r,2,2);}
  present(document.getElementById('arena'),off);
 }};
}
