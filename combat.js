import {START_SECONDS} from './flow.js?v=9';
import {fighter} from './fighters.js?v=9';
export const FPS=60, ROUND_FRAMES=60*FPS;
export const PACE=Object.freeze({run:1.18,jump:1.1,gravity:.72,melee:{duration:22,active:6},ranged:{duration:44,active:12},deflect:{duration:18,window:8,cooldown:40},finisher:{duration:66,active:17}});
export const ACTIONS=['q','e','r','space'];
export const emptyInput=()=>({left:false,right:false,jump:false,duck:false});
// Multiples of four make the ranged/melee damage ratio exact, even after rounding.
export const meleeDamage=id=>Math.round(80*fighter(id).power/4)*4;
export function hurtbox(f){const spec=fighter(f.id),standing=Math.max(64,Math.min(205,spec.anatomy.bodyHeight*spec.anatomy.scale*38)),height=f.ducking?Math.min(standing*.42,48):standing;return {top:f.y-height,bottom:f.y-(spec.anatomy.floating&&!f.ducking?20:8)};}
export function strikeBand(f,a){
  if(a.kind==='super')return {top:f.y-240,bottom:f.y+60};
  if(a.kind==='low'||a.kind==='breaker')return {top:f.y-48,bottom:f.y+1};
  if(a.kind==='rising'||a.kind==='launcher')return {top:f.y-205,bottom:f.y-20};
  if(a.kind==='air')return {top:f.y-80,bottom:f.y+110};
  return {top:f.y-100,bottom:f.y-24};
}
const verticalOverlap=(a,b)=>a.top<=b.bottom&&a.bottom>=b.top;
function makeFighter(id,index){const spec=fighter(id);return {id:spec.id,x:index?880:320,y:0,vx:0,vy:0,facing:index?-1:1,hp:spec.hp,maxHp:spec.hp,energy:0,stun:0,invulnerable:0,attack:null,cooldown:0,ducking:false,parryFrames:0,deflectCooldown:0,counterWindow:0,queue:[],sequence:[],combo:0,comboAge:0,hitFlash:0,walk:0,lastMove:'',meleeStreak:0,lastMeleeHit:-9999,roundWins:0};}
export function createMatch(p1,p2,{mode='bot',difficulty='rival',stageId='volcano',botPolicy='classic',seed=157,matchId='match'}={}){return {id:matchId,stageId,phase:'briefing',phaseTimer:START_SECONDS*FPS,frame:0,round:1,time:ROUND_FRAMES,mode,difficulty,botPolicy,fighters:[makeFighter(p1,0),makeFighter(p2,1)],projectiles:[],effects:[],events:[],nextId:1,seed,lastRoundWinner:null,winner:null,shake:0,flash:0};}
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function event(s,type,data={}){s.events.push({id:s.nextId++,type,frame:s.frame,...data});s.events=s.events.slice(-20);}
export function queueAction(s,index,action,input=emptyInput()){
  if(s.phase!=='fight'||!ACTIONS.includes(action)||!s.fighters[index])return false;
  const f=s.fighters[index];if(f.queue.length>=3)return false;
  f.queue.push({action,at:s.frame,context:{jump:!!input.jump,duck:!!input.duck,moving:!!(input.left||input.right)}});return true;
}
function beginAttack(s,index,entry){
  const f=s.fighters[index],spec=fighter(f.id),action=entry.action;
  if(action==='space'&&f.energy<100){event(s,'empty-energy',{player:index});return;}
  if(action==='r'&&f.deflectCooldown>0)return;
  const base=meleeDamage(f.id);
  let kind=action==='q'?'ranged':action==='e'?'heavy':action==='r'?'deflect':'super';
  let damage=action==='q'?base*.25:action==='e'?base:action==='r'?0:base*3;
  let range=spec.reach+15,launch=false;
  const timing=action==='q'?PACE.ranged:action==='e'?PACE.melee:action==='r'?PACE.deflect:spec.ultimate;
  let duration=timing.duration,active=timing.active||1,move=spec.moves[kind==='heavy'?'heavy':kind];
  if(action==='e'){
    f.sequence=f.sequence.filter(v=>s.frame-v.at<=150);f.sequence.push({at:s.frame});f.sequence=f.sequence.slice(-3);
    if(f.counterWindow>0){kind='counter';move=spec.moves.counter;damage=base*1.5;active=3;range+=25;f.counterWindow=0;f.sequence=[];}
    else if(f.y<-35){kind='air';move=spec.moves.air;damage=base*1.1;f.vy=Math.max(f.vy,7);}
    else if(entry.context.duck){kind=f.sequence.length===3?'breaker':'low';move=spec.moves[kind];damage=base*(kind==='breaker'?1.4:.9);}
    else if(entry.context.jump){kind='rising';move=spec.moves.rising;damage=base*1.05;f.vy=-11;launch=true;range+=20;}
    else if(f.sequence.length===3){kind='launcher';move=spec.moves.launcher;damage=base*1.4;launch=true;range+=20;}
    else if(entry.context.moving){kind='moving';move=spec.moves.moving;f.vx=f.facing*8;range+=20;}
    if(f.sequence.length===3)f.sequence=[];
  }else{f.sequence=[];f.meleeStreak=0;}
  if(action==='r'){f.parryFrames=PACE.deflect.window;f.deflectCooldown=PACE.deflect.cooldown;f.vx=0;}
  if(action==='space'){f.energy=0;range=spec.ultimate.range;launch=!!spec.ultimate.launch;s.flash=8;event(s,'super',{player:index,name:move});}
  f.lastMove=move;f.ducking=action==='e'&&entry.context.duck;
  f.attack={kind,action,age:0,duration,active,damage:action==='q'?damage:Math.round(damage),range,move,launch,hitPulses:[],spawned:false,ultimateId:action==='space'?spec.ultimate.style:null};
  f.cooldown=duration;event(s,'attack',{player:index,kind,move});
}
function hit(s,index,damage,knockback,launch,{projectile=null,ultimate=null,counter=false,melee=false}={}){
  const a=s.fighters[index],d=s.fighters[1-index];if(d.hp<=0||d.invulnerable>0)return false;
  const direction=projectile?(projectile.vx>=0?1:-1):a.facing;
  if(d.parryFrames>0&&d.facing===-direction){
    d.parryFrames=0;d.counterWindow=45;d.attack=null;d.cooldown=0;d.energy=Math.min(100,d.energy+8);
    if(projectile){projectile.owner=1-index;projectile.vx=-projectile.vx;projectile.x=d.x+d.facing*56;projectile.reflected=true;}
    else{a.attack=null;a.queue=[];a.meleeStreak=0;a.cooldown=22;a.stun=22;a.vx=-direction*3;}
    s.effects.push({id:s.nextId++,type:projectile?'reflect':'parry',x:d.x,y:d.y-65,age:0,life:26,color:'#abf6ff',amount:0});
    event(s,projectile?'reflect':'parry',{player:1-index});return 'deflected';
  }
  const armored=d.attack?.kind==='super'&&['furnace-ring','root-charge'].includes(d.attack.ultimateId);
  let pushback=false;
  if(melee){a.meleeStreak=s.frame-a.lastMeleeHit<=90?a.meleeStreak+1:1;a.lastMeleeHit=s.frame;if(a.meleeStreak>=2){pushback=true;knockback=22;a.meleeStreak=0;a.lastMove=fighter(a.id).moves.pushback;}}
  const amount=Math.max(1,Math.round(damage*(armored?.5:1)));
  d.hp=Math.max(0,d.hp-amount);d.hitFlash=8;d.vx=direction*knockback;d.stun=armored?0:Math.min(28,8+damage/16);
  if(ultimate?.freeze)d.stun+=ultimate.freeze;
  if(pushback&&!armored)d.stun=Math.max(d.stun,22);
  if(launch&&!armored)d.vy=-11;
  d.invulnerable=10;
  // Successful hits interrupt ordinary moves. Armored ultimates can trade blows.
  if(!armored){d.attack=null;d.parryFrames=0;d.queue=[];d.sequence=[];d.meleeStreak=0;d.cooldown=0;}
  a.energy=Math.min(100,a.energy+(projectile?2:12));d.energy=Math.min(100,d.energy+amount*.08);
  a.combo=a.comboAge>0?a.combo+1:1;a.comboAge=85;
  s.shake=projectile?2:damage>=130?13:6;
  s.effects.push({id:s.nextId++,type:pushback?'pushback':counter?'counter':'hit',x:d.x,y:(hurtbox(d).top+hurtbox(d).bottom)/2,age:0,life:22,color:fighter(a.id).color,amount});
  if(damage>=130)s.flash=4;
  if(ultimate?.heal)a.hp=Math.min(a.maxHp,a.hp+Math.round(amount*ultimate.heal));
  event(s,counter?'counter':'hit',{player:index,damage:amount,combo:a.combo,ranged:!!projectile});if(pushback)event(s,'pushback',{player:index});return true;
}
function updateUltimate(s,f,a,target){
  const age=a.age,style=a.ultimateId,active=a.active;
  if(style==='dragon-dive'){if(age===2)f.vy=-8;if(age<active)f.vx=f.facing*5;if(age===active-3)f.vy=10;}
  if(style==='furnace-ring')f.vx=0;
  if(style==='pincer-grab'&&age===active)target.vx=0;
  if(style==='tentacle-flurry'&&age>=active&&Math.abs(target.x-f.x)<195)target.vx*=.25;
  if(style==='volt-rush'&&age<active+50)f.vx=f.facing*5;
  if(style==='antler-rise'){if(age===active-7)f.vy=-10;if(age<active)f.vx=f.facing*3;}
  if(style==='root-charge'&&age<active+9)f.vx=f.facing*9;
  if(style==='petal-orbit')f.vx=0;
  if(style==='soul-siphon'&&age>=active)f.vx*=.3;
  if(style==='gravity-well'&&age<active&&Math.abs(target.x-f.x)<310)target.vx=Math.sign(f.x-target.x)*5;
  if(style==='frost-ballet'&&age>=active-4&&age<=active+24){if((age-active+4)%12===0)f.vy=-5;f.vx=f.facing*4;}
  if(style==='crystal-lock')f.vx=0;
}
function updateAttack(s,index){
  const f=s.fighters[index],a=f.attack;if(!a)return;
  const spec=fighter(f.id),target=s.fighters[1-index];a.age++;
  if(a.kind==='super')updateUltimate(s,f,a,target);
  if(a.kind==='ranged'&&a.age===a.active){
    s.projectiles.push({id:s.nextId++,owner:index,sourceId:f.id,x:f.x+f.facing*50,y:f.y-83,vx:f.facing*13,radius:17,damage:a.damage,life:42,age:0,warmup:0,color:spec.color,kind:'projectile'});a.spawned=true;
  }
  if(!['ranged','deflect'].includes(a.kind)&&a.age>=a.active){
    const ultimate=a.kind==='super'?spec.ultimate:null,interval=12,pulse=Math.floor((a.age-a.active)/interval),hits=ultimate?.hits||1;
    if(pulse<hits&&(a.age-a.active)%interval<6&&!a.hitPulses.includes(pulse)){
      const dx=target.x-f.x,facingTarget=dx*f.facing>=-35||ultimate?.radial;
      if(Math.abs(dx)<a.range+25&&verticalOverlap(strikeBand(f,a),hurtbox(target))&&facingTarget){
        const perHit=Math.round(a.damage/hits),last=pulse===hits-1;
        const result=hit(s,index,perHit,last?(a.action==='e'?2:7):1,a.launch&&last,{ultimate:ultimate?{...ultimate,freeze:last?ultimate.freeze:0}:null,counter:a.kind==='counter',melee:a.action==='e'});
        if(result)a.hitPulses.push(pulse);
      }
    }
  }
  if(a.age>=a.duration&&f.attack===a){if(a.action==='e'&&!a.hitPulses.length)f.meleeStreak=0;f.attack=null;}
}
function botInput(s){
  const f=s.fighters[1],op=s.fighters[0],dx=op.x-f.x,d=Math.abs(dx),input=emptyInput();
  if(s.phase!=='fight')return input;
  const hard=s.difficulty==='nemesis',easy=s.difficulty==='rookie',period=hard?23:easy?38:29;
  if(d>100){input.left=dx<0;input.right=dx>0;}
  const incoming=s.projectiles.find(p=>p.owner===0&&Math.abs(p.x-f.x)<120&&p.vx*(f.x-p.x)>0);
  if(incoming&&s.frame%100<(hard?70:easy?15:40))input.duck=true;
  if(!f.attack&&!f.stun&&!f.cooldown){
    const threat=incoming||op.attack&&d<165&&op.attack.age>=op.attack.active-5;
    if(threat&&!f.deflectCooldown&&random(s)<(hard?.6:easy?.08:.24))queueAction(s,1,'r',input);
    else if(f.counterWindow>0&&d<165)queueAction(s,1,'e',input);
    else if(s.frame%period===0){
      const roll=random(s),action=f.energy>=100&&d<190?'space':d<155?'e':d>260&&roll<.2?'q':null;
      if(action){if(action==='e'&&roll<.14)input.duck=true;queueAction(s,1,action,input);}
    }
  }
  input.jump=!!incoming&&!input.duck&&s.frame%100<20&&f.y===0;return input;
}
function finishRound(s){
  const [a,b]=s.fighters,ah=a.hp/a.maxHp,bh=b.hp/b.maxHp,winner=ah===bh?null:ah>bh?0:1;
  if(winner!==null)s.fighters[winner].roundWins++;
  s.lastRoundWinner=winner;event(s,'round-end',{winner});
  if(s.round>=3||s.fighters.some(f=>f.roundWins>=2)){s.phase='finished';s.winner=a.roundWins===b.roundWins?null:a.roundWins>b.roundWins?0:1;event(s,'match-end',{winner:s.winner});}
  else{s.phase='roundover';s.phaseTimer=240;}
}
function nextRound(s){s.round++;s.time=ROUND_FRAMES;s.phase='countdown';s.phaseTimer=180;s.projectiles=[];s.effects=[];s.fighters=s.fighters.map((old,i)=>({...makeFighter(old.id,i),roundWins:old.roundWins}));}
export function step(s,inputs=[emptyInput(),emptyInput()],botController=null){
  if(s.phase==='finished')return;
  s.frame++;s.shake=Math.max(0,s.shake-1);s.flash=Math.max(0,s.flash-1);
  if(s.phase!=='fight'){if(--s.phaseTimer<=0){if(s.phase==='roundover')nextRound(s);else{s.phase='fight';event(s,'fight');}}return;}
  s.time--;
  const commands=[inputs[0]||emptyInput(),s.mode==='bot'?(botController?botController(s):botInput(s)):inputs[1]||emptyInput()];
  // Resolve both players' defensive inputs before either player's hit detection.
  for(let i=0;i<2;i++){
    const f=s.fighters[i],op=s.fighters[1-i],spec=fighter(f.id),input=commands[i];
    for(const key of ['hitFlash','stun','invulnerable','cooldown','comboAge','parryFrames','deflectCooldown','counterWindow'])f[key]=Math.max(0,f[key]-1);
    if(!f.comboAge)f.combo=0;
    f.energy=Math.min(100,f.energy+.015);
    if(!f.attack)f.facing=op.x>=f.x?1:-1;
    f.ducking=!!input.duck&&f.y===0&&f.stun===0&&(!f.attack||['low','breaker','deflect'].includes(f.attack.kind));
    f.queue=f.queue.filter(q=>s.frame-q.at<=16);
    if(!f.stun){
      if(!f.cooldown&&f.queue.length)beginAttack(s,i,f.queue.shift());
      if(!f.attack){const direction=(input.right?1:0)-(input.left?1:0);f.vx=direction*spec.speed*PACE.run*(f.ducking?.3:1);if(direction)f.walk++;if(input.jump&&f.y===0&&!f.ducking)f.vy=-spec.jump*PACE.jump;}
    }
  }
  for(let i=0;i<2;i++){
    const f=s.fighters[i];updateAttack(s,i);f.x=Math.max(60,Math.min(1140,f.x+f.vx));f.vx*=.82;f.y+=f.vy;f.vy+=PACE.gravity;if(f.y>=0){f.y=0;f.vy=0;}
  }
  const [a,b]=s.fighters,gap=b.x-a.x;
  if(Math.abs(gap)<82&&Math.abs(a.y-b.y)<100){const push=(82-Math.abs(gap))/2,sign=gap>=0?1:-1;a.x=Math.max(60,Math.min(1140,a.x-push*sign));b.x=Math.max(60,Math.min(1140,b.x+push*sign));}
  for(const p of s.projectiles){
    p.age++;p.life--;if(p.age>p.warmup)p.x+=p.vx;
    const target=s.fighters[1-p.owner];
    if(p.age>=p.warmup&&Math.abs(target.x-p.x)<p.radius+35&&verticalOverlap({top:p.y-p.radius,bottom:p.y+p.radius},hurtbox(target))){
      const result=hit(s,p.owner,p.damage,3,false,{projectile:p});if(result===true)p.life=0;
    }
  }
  s.projectiles=s.projectiles.filter(p=>p.life>0&&p.x>-80&&p.x<1280);
  s.effects.forEach(e=>e.age++);s.effects=s.effects.filter(e=>e.age<e.life);
  if(a.hp<=0||b.hp<=0||s.time<=0)finishRound(s);
}
export function rewardFor(s,index){if(s.phase!=='finished')return null;const won=s.winner===index,draw=s.winner===null;return {won,draw,xp:won?120:draw?65:45,shards:won?50:draw?25:15};}
