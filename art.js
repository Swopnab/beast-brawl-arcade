import {drawStage} from './stages.js';
import { fighter, ARENAS } from './fighters.js?v=9';
let scratch;
const rect=(c,color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
function poly(c,color,points){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function creaturePixels(c,s,pose,time){
  const ink='#171b30',body=s.color,shade=s.dark,light=s.accent;
  const walk=pose==='walk'?Math.sin(time/75)*2:0,bob=pose==='walk'?Math.abs(walk):Math.sin(time/280)*.5;
  c.translate(7,6-Math.round(bob));
  const r=(color,x,y,w,h)=>rect(c,color,x,y,w,h);
  const p=(color,points)=>poly(c,color,points);
  const attacking=['jab','heavy','ranged','super','low','air','rising','moving','launcher','counter','breaker'].includes(pose);
  const shape=s.shape;
  if(['octopus','jellyfish'].includes(shape)){
    const jelly=shape==='jellyfish';
    for(let i=0;i<(jelly?8:6);i++){const x=6+i*(jelly?5:6),wave=Math.sin(time/240+i)*2;r(ink,x,27,4,10+i%3*3);r(body,x+1,27,2,9+i%3*3);r(body,x+wave,36+i%3*3,5,3);}
    r(ink,9,10,31,19);r(body,11,8,27,19);r(light,16,5,17,5);r(shade,12,24,26,5);
    if(jelly){r(ink,18,13,14,13);r('#fff4df',20,15,10,9);r(shade,24,15,4,9);}else{for(const x of [17,29]){r('#fff4df',x,17,7,6);r(ink,x+3,17,3,6);}}
    return;
  }
  // Back appendages define the silhouette before the shared face/body anatomy.
  if(['drake','wyrm'].includes(shape)){
    p(ink,[[15,22],[1,10],[3,31],[16,30]]);p(shade,[[13,23],[3,14],[5,28],[15,28]]);
    p(body,[[15,34],[2,32],[0,26],[3,28],[5,29],[16,29]]);
  }
  if(['fox','wolf','cat','ghostcat','otter','gecko','pangolin','monkey'].includes(shape)){
    p(ink,[[15,27],[5,24],[2,15],[0,17],[2,32],[14,38],[21,32]]);
    p(shape==='fox'?light:shade,[[14,28],[6,27],[3,19],[4,31],[14,35],[20,31]]);
    if(shape==='fox'){p(body,[[15,25],[5,16],[7,8],[11,20],[20,26]]);p(light,[[7,9],[9,13],[7,15]]);p(body,[[13,29],[1,26],[0,20],[7,25],[19,29]]);}
    if(shape==='monkey'){r(body,0,15,3,10);r(body,0,13,8,3);r(body,6,13,3,5);}
    if(shape==='gecko'){r(light,2,20,3,6);r(light,4,29,6,2);}
    if(shape==='pangolin')p(body,[[19,30],[3,26],[0,30],[9,36],[20,38]]);
  }
  if(['moth','bee','ray','owl','raven'].includes(shape)){
    const wing=shape==='moth'||shape==='ray'?light:shade;
    p(ink,[[17,18],[4,9],[0,15],[5,31],[17,34],[31,34],[45,25],[44,12],[35,18]]);
    p(wing,[[17,21],[5,12],[3,16],[7,29],[19,31],[31,31],[42,24],[41,16],[33,21]]);
    if(shape==='moth'){r(shade,7,18,7,7);r(body,8,19,4,4);r(shade,34,20,5,6);r(body,35,21,3,3);}
    if(shape==='bee'){r('#e6efff',4,10,9,7);r('#e6efff',33,10,9,7);}
  }
  if(shape==='serpent'){
    p(ink,[[18,17],[31,16],[38,24],[35,31],[22,32],[17,35],[30,37],[42,35],[40,42],[12,43],[5,38],[9,30],[25,27],[25,24],[17,23]]);
    p(body,[[18,19],[29,18],[35,24],[32,29],[20,30],[13,35],[16,39],[30,40],[39,37],[38,40],[12,41],[8,37],[12,32],[28,29],[29,23],[18,22]]);
  }else if(shape==='urchin'){
    for(let i=0;i<12;i++){const a=i*Math.PI/6;p(ink,[[23+Math.cos(a-.3)*13,25+Math.sin(a-.3)*13],[23+Math.cos(a)*23,25+Math.sin(a)*23],[23+Math.cos(a+.3)*13,25+Math.sin(a+.3)*13]]);p(light,[[23+Math.cos(a-.2)*13,25+Math.sin(a-.2)*13],[23+Math.cos(a)*20,25+Math.sin(a)*20],[23+Math.cos(a+.2)*13,25+Math.sin(a+.2)*13]]);}
  }
  // Pixel-stepped torso, arms, and feet.
  const broad=['golem','yak','bull','panda','turtle','crab','boar'].includes(shape);
  const left=broad?10:14,width=broad?28:21;
  if(!['serpent','ray','urchin','ghostcat'].includes(shape)){
    r(ink,left-2,24,width+4,14);r(ink,left+1,37,width-2,6);
    r(shade,left,26,width,12);r(body,left+2,23,width-4,13);r(light,left+8,28,width-14,8);
    r(ink,left-2,37+walk,11,7);r(ink,left+width-8,37-walk,11,7);
    r(shade,left,38+walk,8,4);r(body,left+width-7,38-walk,8,4);
    r(light,left,42+walk,7,2);r(light,left+width-6,42-walk,7,2);
  }
  if(shape==='ghostcat'){p(ink,[[13,24],[34,24],[38,37],[32,34],[29,43],[23,37],[15,44],[16,36],[9,37]]);p(body,[[15,25],[32,25],[35,34],[29,32],[28,39],[23,34],[17,40],[19,33],[12,34]]);}
  if(shape==='ray'){p(body,[[10,22],[24,12],[36,23],[31,33],[23,38],[15,31]]);p(shade,[[23,32],[27,32],[36,43],[29,42]]);}
  if(shape==='urchin'){r(ink,8,14,30,23);r(ink,13,9,20,32);r(body,10,15,26,20);r(body,15,11,16,28);r(shade,12,31,23,6);}
  if(shape==='mantis'){r(ink,18,24,13,17);r(body,20,23,9,15);r(shade,13,38,6,7);r(shade,29,38,6,7);}
  if(shape==='turtle'){r(ink,7,20,25,19);r(shade,9,20,22,17);r('#e7a94b',12,22,14,12);r('#f4d582',16,24,6,8);r(ink,19,21,2,15);r(ink,11,28,16,2);}
  if(shape==='bee'){r(ink,15,26,19,4);r(ink,15,33,18,4);p(ink,[[16,38],[23,47],[27,38]]);}
  if(shape==='pangolin'){for(let row=0;row<3;row++)for(let col=0;col<4;col++)p(shade,[[12+col*6,24+row*5],[16+col*6,29+row*5],[19+col*6,24+row*5]]);}
  if(['bull','boar','yak'].includes(shape)){for(let i=0;i<5;i++)p(shade,[[10+i*6,23],[12+i*6,39],[16+i*6,23]]);}
  const headY=shape==='rabbit'?12:shape==='crab'?18:shape==='golem'?10:10;
  if(shape!=='serpent'){
    r(ink,15,headY,21,19);r(ink,12,headY+4,27,11);r(body,16,headY+2,18,16);r(body,14,headY+5,23,9);
    r(shade,16,headY+14,18,3);r(light,19,headY+2,9,3);
  }else{r(ink,14,10,22,15);r(body,16,12,20,11);r(light,17,19,18,4);}
  // Species-specific ears, horns, frills, masks, muzzles and weapons.
  if(['fox','cat','ghostcat','wolf'].includes(shape)){
    p(ink,[[13,15],[12,0],[23,10],[29,10],[37,1],[38,17]]);
    p(body,[[15,13],[15,4],[23,12],[29,12],[35,5],[36,15]]);
    p(shade,[[16,5],[16,11],[20,12]]);p(shade,[[34,6],[30,12],[35,12]]);
    r(body,17,13,18,8);if(shape==='wolf'){r(ink,31,19,11,8);r(light,32,20,10,5);p(light,[[16,25],[9,28],[17,31],[20,26]]);}
  }
  if(shape==='drake'){p(ink,[[15,12],[15,2],[22,11],[29,10],[35,0],[35,15]]);p(light,[[17,9],[17,4],[21,11]]);p(light,[[30,11],[34,4],[33,14]]);r(body,30,18,11,8);r(ink,33,25,7,2);r(light,35,24,2,2);}
  if(shape==='wyrm'){p(light,[[13,12],[8,4],[18,9],[24,0],[28,9],[39,4],[35,15]]);r(shade,16,11,19,3);r(light,21,20,3,3);r(light,29,20,3,3);}
  if(shape==='rabbit'){r(ink,14,-4,8,20);r(ink,28,-6,8,22);r(body,16,-2,4,18);r(body,30,-4,4,19);r(shade,17,1,2,12);r(shade,31,-1,2,12);r(light,22,24,10,4);}
  if(['ram','yak','bull','stag'].includes(shape)){
    if(shape==='stag'){r(ink,14,-2,4,17);r(ink,30,-3,4,17);r(light,15,-2,2,16);r(light,31,-3,2,16);r(light,9,3,8,3);r(light,31,1,10,3);r(light,10,-1,2,6);r(light,38,-3,2,7);}
    else{p(ink,[[17,13],[5,9],[5,0],[12,5],[20,8],[29,8],[38,1],[42,2],[41,11],[34,16]]);p(light,[[17,11],[8,7],[7,3],[12,8],[20,11]]);p(light,[[30,11],[38,5],[40,4],[38,10],[33,13]]);}
    if(shape==='ram'){r(shade,11,11,7,12);r(light,11,12,4,9);}
    if(shape==='yak'){for(let i=0;i<6;i++)p(light,[[12+i*4,10],[16+i*4,22],[19+i*4,10]]);r(shade,18,24,16,7);}
    if(shape==='bull'){r(shade,20,24,14,7);r('#f5d56d',25,28,5,4);r(shade,26,28,3,2);}
  }
  if(shape==='shark'){p(ink,[[14,11],[21,0],[25,10],[33,13],[43,21],[37,27],[25,24]]);p(body,[[17,11],[21,4],[24,12],[32,15],[40,21],[36,24],[24,22]]);r(light,20,23,18,6);for(let i=0;i<4;i++)p(ink,[[23+i*4,24],[25+i*4,27],[27+i*4,24]]);}
  if(shape==='axolotl'){for(const side of [-1,1]){const x=side===-1?8:38;r(ink,x,11,5,19);r(light,x-4,11,12,3);r(light,x-5,18,13,3);r(light,x-3,25,11,3);r(shade,x,13,3,12);}r(light,17,24,15,4);}
  if(shape==='crab'){r(ink,17,9,4,10);r(ink,30,8,4,11);r(light,17,9,4,5);r(light,30,8,4,5);for(const x of [0,38]){r(ink,x,20,12,16);r(body,x+2,21,8,12);r(ink,x+5,20,3,7);}r(shade,9,36,28,4);}
  if(shape==='gecko'){r(light,12,13,9,8);r(light,29,13,10,8);r(shade,19,24,12,4);for(let i=0;i<3;i++){r(light,10+i*3,39+i%2,2,5);r(light,32+i*3,39+i%2,2,5);}}
  if(shape==='panda'){r(ink,11,6,10,9);r(ink,29,6,10,9);r(shade,14,15,10,8);r(shade,29,15,9,8);r(light,20,24,12,5);r(ink,25,24,4,3);}
  if(shape==='monkey'){r(ink,8,14,8,10);r(ink,35,13,8,11);r(light,10,16,6,6);r(light,35,15,6,7);r(light,17,16,17,11);r(shade,21,24,8,2);p(body,[[19,11],[20,5],[26,8],[28,3],[30,12]]);}
  if(shape==='boar'){r(shade,25,20,16,9);r(body,32,22,9,6);p(light,[[29,28],[24,19],[24,29]]);p(light,[[36,28],[40,20],[40,30]]);p(shade,[[14,9],[16,0],[21,12]]);}
  if(['owl','raven'].includes(shape)){
    if(shape==='owl'){r(light,14,14,24,12);r(shade,15,14,10,11);r(shade,27,14,10,11);p(body,[[12,14],[9,4],[23,12]]);p(body,[[27,12],[40,5],[38,17]]);}
    p('#f0c36a',[[29,22],[42,20],[34,27]]);if(shape==='raven')p(shade,[[14,13],[13,3],[21,9],[27,5],[35,12]]);
  }
  if(['moth','bee','mantis'].includes(shape)){r(ink,17,2,3,10);r(ink,31,1,3,12);r(light,15,0,5,4);r(light,31,-1,5,4);if(shape==='mantis'){p(ink,[[13,28],[2,22],[0,31],[8,35],[5,29],[15,33]]);p(light,[[12,28],[4,25],[2,30],[8,32],[7,28],[14,30]]);}}
  if(shape==='golem'){p(light,[[14,13],[13,3],[22,7],[28,0],[35,8],[39,17]]);r(shade,8,26,10,15);r(light,9,26,7,12);r(shade,32,26,12,17);r(light,34,27,8,14);r(ink,21,25,8,8);r(light,23,27,4,4);}
  if(shape==='otter'){r(light,18,22,17,8);r(ink,25,22,4,3);r(light,8,24,8,1);r(light,34,24,9,1);r(light,8,27,8,1);r(light,34,27,9,1);r(shade,16,7,6,5);r(shade,30,7,6,5);}
  if(shape==='turtle'){r(body,31,13,11,14);r(light,34,22,8,4);}
  // Eyes: bright whites, forward pupils, a stubborn brow, and occasional blinks.
  const blink=Math.floor(time/100)%45===0;
  const ey=shape==='crab'?10:19;
  if(shape!=='crab'){
    r(ink,19,ey-2,7,2);r(ink,29,ey-2,7,2);
    r('#fff8e2',19,ey,6,blink?1:4);r('#fff8e2',29,ey,6,blink?1:4);
    if(!blink){r(ink,23,ey,2,4);r(ink,33,ey,2,4);}
  }else{r(ink,19,11,2,3);r(ink,32,10,2,3);}
  if(!['crab','serpent','ray','urchin'].includes(shape)){
    const extension=attacking?10:0;
    r(ink,30,28,10+extension,7);r(shade,31,29,8+extension,5);r(body,36+extension,27,7,7);r(light,38+extension,28,3,2);
    r(ink,10,28,7,8);r(shade,11,29,5,5);
  }
  // Matching equipment remains visible in the illustrated fallback.
  if(['ashfang','glaciop','crysteel','zipcat','kilnback'].includes(s.id)){
    const glove=s.id==='crysteel'?'#488dd4':s.id==='glaciop'?'#e879a5':'#e34f4c',extension=attacking?10:0;
    r('#fff3dd',12,28,6,3);r(glove,10,31,10,8);r('#fff3dd',36+extension,27,7,3);r(glove,36+extension,30,11,9);
  }else if(s.id==='reefclaw'){r('#de6857',5,22,9,6);r('#fff3dd',6,22,7,2);r('#de6857',39,21,9,6);}
  else if(s.id==='inkveil'){for(const x of [12,22,33,42]){r('#248ab0',x,41,5,4);r('#ffedc9',x,41,5,1);}}
  else if(['boltstag','thornox'].includes(s.id)){r('#ce6d45',12,3,5,6);r('#fff0c8',12,8,5,2);r('#ce6d45',36,3,5,6);}
  else if(s.id==='petalmoth'){r('#eea0b7',4,18,5,12);r('#fff2cd',4,22,5,2);r('#eea0b7',44,18,5,12);}
  else if(s.id==='hexeye'){for(const x of [6,43]){r('#f0d0ff',x,27,7,7);r('#7c59b6',x+1,28,5,5);}}
  else if(s.id==='nullwyrm'){r('#b884c7',7,36,9,7);r('#ffe7b5',8,37,7,2);}
  if(pose==='guard'||pose==='deflect'){r(light,34,16,4,20);r(shade,30,20,8,7);}
}
export function drawCreature(ctx,spec,x,y,scale=3,pose='idle',time=0,facing=1,flash=false){
  scratch??=Object.assign(document.createElement('canvas'),{width:72,height:64});
  const c=scratch.getContext('2d');c.clearRect(0,0,72,64);c.save();c.translate(3,8);creaturePixels(c,spec,pose,time);c.restore();
  if(flash){c.globalCompositeOperation='source-atop';c.fillStyle='#fff';c.globalAlpha=.72;c.fillRect(0,0,72,64);c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(facing,1);ctx.imageSmoothingEnabled=false;
  if(['duck','low','breaker'].includes(pose))ctx.scale(1.08,.42);
  if(pose==='ko'){ctx.rotate(-.85);ctx.scale(1,.6);}
  ctx.drawImage(scratch,-36*scale,-57*scale,72*scale,64*scale);ctx.restore();
}
export function thumbnail(canvas,spec,scale=1.7){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);drawCreature(ctx,spec,canvas.width/2,canvas.height-10,scale,'idle',1500);}
const backgrounds=new Map();
const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function background(arena){
  if(backgrounds.has(arena.id))return backgrounds.get(arena.id);
  const canvas=Object.assign(document.createElement('canvas'),{width:1200,height:675}),c=canvas.getContext('2d');
  c.fillStyle=arena.sky;c.fillRect(0,0,1200,675);
  const gradient=c.createLinearGradient(0,0,0,540);gradient.addColorStop(0,arena.sky);gradient.addColorStop(1,arena.accent+'55');c.fillStyle=gradient;c.fillRect(0,0,1200,540);
  for(let i=0;i<55;i++)rect(c,i%3===0?arena.glow:'#6e759c',(i*197)%1200,(i*73)%290,2,2);
  c.fillStyle=arena.id==='moon'?'#ffb9c3':'#d6e5ce';c.beginPath();c.arc(900,125,arena.id==='moon'?62:36,0,Math.PI*2);c.fill();
  c.fillStyle=arena.sky+'bb';c.beginPath();c.arc(920,115,34,0,Math.PI*2);c.fill();
  for(let i=0;i<19;i++){
    const h=90+(i*47)%180,x=i*70-30;rect(c,'#11182d',x,330-h,64,h+70);rect(c,'#1d2940',x+4,330-h+5,55,5);
    for(let row=0;row<Math.floor(h/15);row++)for(let col=0;col<4;col++)if((row*3+col+i)%4!==0)rect(c,(row+col)%3?arena.accent+'77':arena.glow+'88',x+8+col*13,340-h+row*15,5,7);
  }
  rect(c,'#0f1424',0,350,1200,190);rect(c,'#33435a',0,351,1200,3);
  // Elevated train, lit ramen shop, rooftop ducts and a giant neon sign.
  rect(c,'#26374c',90,290,1000,55);rect(c,'#60728a',92,289,996,4);
  for(let i=0;i<16;i++){rect(c,'#111d31',104+i*60,300,48,28);rect(c,i%4?arena.glow+'55':'#f9b58188',108+i*60,303,40,20);}
  rect(c,'#111827',0,394,1200,140);
  rect(c,'#25334b',25,388,240,132);rect(c,arena.accent,25,387,240,5);rect(c,'#151b2f',45,418,90,99);rect(c,'#f0ac6777',151,418,94,60);
  rect(c,'#352640',56,344,160,38);rect(c,arena.glow,56,344,160,3);c.font='bold 23px monospace';c.fillStyle=arena.glow;c.fillText(arena.id==='garden'?'JADE GARDEN':'MIDNIGHT RAMEN',65,372,145);
  for(let i=0;i<5;i++){rect(c,'#e98564',40+i*45,399,20,14);rect(c,'#ffcc85',44+i*45,402,12,6);}
  rect(c,'#1c2941',960,370,190,152);rect(c,'#596880',970,380,28,95);rect(c,'#334159',1004,410,131,45);
  for(let i=0;i<5;i++)rect(c,'#0c1524',1011+i*24,416,11,31);
  c.textAlign='center';c.font='900 92px sans-serif';c.fillStyle='#0c132488';c.fillText('BRAWL',600,440);c.strokeStyle=arena.accent+'66';c.lineWidth=1;c.strokeText('BRAWL',600,440);
  rect(c,'#1c223a',0,532,1200,143);rect(c,'#444c65',0,534,1200,4);rect(c,arena.glow,0,539,1200,2);
  for(let i=0;i<13;i++){c.strokeStyle='#52647b66';c.beginPath();c.moveTo(600+(i-6)*70,541);c.lineTo(600+(i-6)*170,675);c.stroke();}
  [562,598,648].forEach(y=>rect(c,'#56607855',0,y,1200,1));
  rect(c,arena.glow+'55',60,595,175,3);rect(c,arena.accent+'88',960,613,170,3);
  if(arena.id==='garden'){for(let i=0;i<8;i++){poly(c,'#183f3c',[[i*180-80,535],[i*180+20,310],[i*180+70,535]]);rect(c,'#f6b0cf',i*180,330,45,5);}}
  if(arena.id==='storm'){for(let i=0;i<90;i++)rect(c,'#bddaff22',(i*163)%1200,(i*87)%530,1,18);}
  backgrounds.set(arena.id,canvas);return canvas;
}
const positions=[{x:250,y:0},{x:950,y:0}];let lastMatch='';
export function renderArena(canvas,state,arenaId='neon',now=performance.now(),stageId='volcano'){
  const ctx=canvas.getContext('2d'),arena=ARENAS.find(a=>a.id===arenaId)||ARENAS[0];ctx.imageSmoothingEnabled=false;
  ctx.save();ctx.clearRect(0,0,1200,675);
  if(state?.shake&&!reducedMotion){ctx.translate(Math.sin(now*2.1)*state.shake*.5,Math.cos(now*1.7)*state.shake*.3);}
  drawStage(ctx,stageId,1200,675,now,!reducedMotion);ctx.strokeStyle=arena.glow+'44';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(600,579,480,31,0,0,Math.PI*2);ctx.stroke();
  if(!state){ctx.restore();return;}
  if(lastMatch!==state.id){lastMatch=state.id;state.fighters.forEach((f,i)=>{positions[i]={x:f.x,y:f.y};});}
  state.fighters.forEach((f,i)=>{
    const pos=positions[i];pos.x+=(f.x-pos.x)*.5;pos.y+=(f.y-pos.y)*.5;
    ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(pos.x,549,68,10,0,0,Math.PI*2);ctx.fill();
    let pose=f.hp<=0?'ko':f.attack?.kind||(f.ducking?'duck':Math.abs(f.vx)>1?'walk':'idle');
    if(f.attack)pose=f.attack.kind;
    if(f.hp<=0)pose='ko';
    const spec=fighter(f.id);
    if(f.energy>=99){ctx.globalAlpha=.2+Math.sin(now/140)*.1;ctx.fillStyle=spec.color;ctx.beginPath();ctx.ellipse(pos.x,475+pos.y,75,95,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    drawCreature(ctx,spec,pos.x,540+pos.y,3.05,pose,now,f.facing,f.hitFlash>0);
    if(f.attack&&f.attack.age>=f.attack.active-3&&f.attack.age<f.attack.active+8){
      ctx.save();ctx.translate(pos.x+f.facing*60,465+pos.y);ctx.scale(f.facing,1);
      const special=['ranged','super'].includes(f.attack.kind);
      ctx.strokeStyle=special?spec.color:'#f8f0d3';ctx.lineWidth=f.attack.kind==='super'?14:5;ctx.globalAlpha=.7;
      ctx.beginPath();ctx.arc(0,0,special?75:48,-1.1,1.1);ctx.stroke();ctx.globalAlpha=.25;ctx.lineWidth=18;ctx.stroke();ctx.restore();
    }
    if(f.combo>=2&&f.comboAge>0){ctx.textAlign=i?'right':'left';ctx.fillStyle=spec.color;ctx.font='italic 900 34px sans-serif';ctx.fillText(`${f.combo} HIT`,i?1120:80,220);ctx.font='11px monospace';ctx.fillText('COMBO',i?1120:80,238);}
  });
  state.projectiles.forEach(p=>{
    const y=540+p.y,warning=p.age<p.warmup;
    ctx.save();ctx.translate(p.x,y);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=20;
    if(p.kind==='trap'){ctx.globalAlpha=warning?.35:.9;ctx.fillRect(-38,0,76,7);if(!warning){poly(ctx,p.color,[[-30,0],[-20,-100],[0,-45],[20,-120],[35,0]]);}}
    else{const r=p.radius;poly(ctx,p.color,[[-r-8,0],[-r*.5,-r],[r*.6,-r],[r+9,0],[r*.6,r],[-r*.5,r]]);rect(ctx,'#fff4df',-r*.2,-r*.4,r*.8,r*.8);ctx.globalAlpha=.3;ctx.fillRect(-p.vx*6-r,-r*.5,Math.abs(p.vx*6),r);}
    ctx.restore();
  });
  state.effects.forEach(e=>{ctx.save();ctx.translate(e.x,540+e.y);ctx.globalAlpha=1-e.age/e.life;const r=12+e.age*3;
    if(['parry','reflect'].includes(e.type)){ctx.strokeStyle='#aeeaff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r,-1.8,1.8);ctx.stroke();}
    else{for(let i=0;i<8;i++){const a=i*Math.PI/4+e.id;rect(ctx,i%2?'#fff6d5':e.color,Math.cos(a)*r,Math.sin(a)*r,4+i%3,4+i%3);}ctx.fillStyle='#fff3ce';ctx.font='bold 22px monospace';ctx.textAlign='center';ctx.fillText(e.amount,0,-e.age*2-20);}
    ctx.restore();});
  if(state.flash&&!reducedMotion){ctx.fillStyle=`rgba(255,248,230,${Math.min(.3,state.flash*.025)})`;ctx.fillRect(0,0,1200,675);}
  ctx.restore();
}
