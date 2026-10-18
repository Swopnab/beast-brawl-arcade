import {START_SECONDS} from './flow.js?v=6';
import { fighter } from './fighters.js?v=5';
export const FPS = 60;
export const PACE=Object.freeze({run:1.18,jump:1.1,gravity:.72,light:{duration:17,active:5},heavy:{duration:28,active:10},special:{duration:46,active:12},finisher:{duration:66,active:17}});
export function hurtbox(f){const spec=fighter(f.id),height=Math.max(64,Math.min(205,spec.anatomy.bodyHeight*spec.anatomy.scale*38));return {top:f.y-height,bottom:f.y-(spec.anatomy.floating?20:8)};}
export function strikeBand(f,attack){
  if(attack.kind==='super')return {top:f.y-240,bottom:f.y+30};
  if(attack.kind==='low')return {top:f.y-48,bottom:f.y+1};
  if(['rising','launcher'].includes(attack.kind))return {top:f.y-205,bottom:f.y-25};
  if(attack.kind==='air')return {top:f.y-80,bottom:f.y+110};
  if(['special','chain'].includes(attack.kind)&&fighter(f.id).kind==='slam')return {top:-70,bottom:15};
  if(['special','chain'].includes(attack.kind)&&fighter(f.id).kind==='uppercut')return {top:f.y-210,bottom:f.y-25};
  return {top:f.y-100,bottom:f.y-45};
}
const verticalOverlap=(a,b)=>a.top<=b.bottom&&a.bottom>=b.top;
export const ROUND_FRAMES = 60 * FPS;
export const ACTIONS = ['q','e','r','space'];
export const emptyInput = () => ({left:false,right:false,jump:false,block:false});
function makeFighter(id, index) {
  const spec = fighter(id);
  return {id:spec.id,x:index ? 950 : 250,y:0,vx:0,vy:0,facing:index ? -1 : 1,hp:spec.hp,maxHp:spec.hp,
    energy:0,stun:0,invulnerable:0,attack:null,cooldown:0,blocking:false,queue:[],sequence:[],
    combo:0,comboAge:0,hitFlash:0,walk:0,lastMove:'',roundWins:0};
}
export function createMatch(p1,p2,{mode='bot',difficulty='rival',stageId='volcano',seed=157,matchId='match'}={}) {
  return {id:matchId,stageId,phase:'briefing',phaseTimer:START_SECONDS*FPS,frame:0,round:1,time:ROUND_FRAMES,mode,difficulty,
    fighters:[makeFighter(p1,0),makeFighter(p2,1)],projectiles:[],effects:[],events:[],nextId:1,seed,
    lastRoundWinner:null,winner:null,shake:0,flash:0};
}
function random(s) { s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0; return s.seed/4294967296; }
function event(s,type,data={}) { s.events.push({id:s.nextId++,type,frame:s.frame,...data}); s.events=s.events.slice(-20); }
export function queueAction(s,index,action,input=emptyInput()) {
  if (s.phase!=='fight' || !ACTIONS.includes(action) || !s.fighters[index]) return false;
  const f=s.fighters[index];
  if (f.queue.length>=3) return false;
  f.queue.push({action,at:s.frame,context:{jump:!!input.jump,block:!!input.block,moving:!!(input.left||input.right)}});
  return true;
}
function beginAttack(s,index,entry) {
  const f=s.fighters[index],spec=fighter(f.id),action=entry.action;
  if (action==='space' && f.energy<100) { event(s,'empty-energy',{player:index}); return; }
  f.sequence=f.sequence.filter(v=>s.frame-v.at<=150);
  f.sequence.push({action,at:s.frame}); f.sequence=f.sequence.slice(-3);
  const sequence=f.sequence.map(v=>v.action).join('');
  let kind=action==='q'?'jab':action==='e'?'heavy':action==='r'?'special':'super';
  let damage=action==='q'?40:action==='e'?78:action==='r'?spec.specialDamage:200;
  let range=action==='q'?spec.reach:action==='e'?spec.reach+30:spec.reach+50;
  const timing=action==='q'?PACE.light:action==='e'?PACE.heavy:action==='r'?PACE.special:PACE.finisher;
  let duration=timing.duration;
  let active=timing.active;
  let move=spec.moves[kind],launch=false,unblockable=false,chip=.24;
  if (action==='q' && entry.context.block) { kind='low'; move=spec.moves.low; range+=12; damage=34; chip=.5; }
  if (action==='e' && f.y<-35) { kind='air'; move=spec.moves.air; damage=90; f.vy=Math.max(f.vy,7); }
  else if (action==='e' && entry.context.jump) { kind='rising'; move=spec.moves.rising; damage=84; f.vy=-11;launch=true;range+=20; }
  else if (action==='e' && entry.context.moving) { kind='moving'; move=spec.moves.moving; damage=68;f.vx=f.facing*10;range+=30; }
  if (sequence==='qqe') { kind='launcher';move=spec.moves.launcher;damage=124;launch=true;range+=40;f.sequence=[]; }
  if (sequence==='qer') { kind='chain';move=spec.moves.chain;damage=spec.specialDamage*1.45;range+=35;f.sequence=[]; }
  if (sequence==='eeq') { kind='breaker';move=spec.moves.breaker;damage=88;unblockable=true;range+=25;f.sequence=[]; }
  if (action==='space') { f.energy=0; range=250; s.flash=12; event(s,'super',{player:index,name:move}); }
  f.lastMove=move;
  f.attack={kind,action,age:0,duration,active,damage:Math.round(damage*spec.power),range,move,launch,unblockable,chip,hit:false,spawned:false};
  f.cooldown=duration; f.blocking=false;
  event(s,'attack',{player:index,kind,move});
}
function hit(s,attackerIndex,damage,knockback,launch,unblockable=false,chip=.24,sourceX=null) {
  const a=s.fighters[attackerIndex],d=s.fighters[1-attackerIndex];
  if (d.hp<=0 || d.invulnerable>0) return false;
  const direction=sourceX===null?a.facing:(d.x>=sourceX?1:-1);
  const guarding=d.blocking && !unblockable && d.facing===-direction;
  const amount=Math.max(1,Math.round(damage*(guarding?chip:1)));
  d.hp=Math.max(0,d.hp-amount);d.hitFlash=8;d.vx=direction*(guarding?2:knockback);d.stun=guarding?7:Math.min(28,8+damage/16);
  if (launch&&!guarding) d.vy=-11;
  d.invulnerable=guarding?5:10;
  a.energy=Math.min(100,a.energy+(guarding?4:10));d.energy=Math.min(100,d.energy+amount*.12);
  a.combo=a.comboAge>0?a.combo+1:1;a.comboAge=85;
  s.shake=guarding?3:damage>=130?13:6;
  const color=fighter(a.id).color;
  s.effects.push({id:s.nextId++,type:guarding?'guard':'hit',x:d.x,y:(hurtbox(d).top+hurtbox(d).bottom)/2,age:0,life:22,color,amount});
  if (damage>=130&&!guarding) s.flash=4;
  event(s,guarding?'guard':'hit',{player:attackerIndex,damage:amount,combo:a.combo});
  if (fighter(a.id).kind==='drain'&&a.attack&&['special','chain','super'].includes(a.attack.kind)) a.hp=Math.min(a.maxHp,a.hp+Math.round(amount*.3));
  return true;
}
function spawn(s,index,attack) {
  const f=s.fighters[index],spec=fighter(f.id),superMove=attack.kind==='super';
  const kind=spec.kind;
  if (kind==='projectile'||kind==='wave'||kind==='trap') {
    const trap=kind==='trap';
    s.projectiles.push({id:s.nextId++,owner:index,x:trap?s.fighters[1-index].x:f.x+f.facing*55,
      y:kind==='wave'||trap?-22:f.y-83,vx:trap?0:f.facing*(superMove?17:12+spec.index%4),
      radius:superMove?44:kind==='wave'?26:17,damage:attack.damage,life:trap?100:130,age:0,
      warmup:trap?(superMove?18:24):0,color:spec.color,kind,superMove});
    return true;
  }
  return false;
}
function updateAttack(s,index) {
  const f=s.fighters[index],a=f.attack;
  if (!a) return;
  const spec=fighter(f.id),target=s.fighters[1-index];a.age++;
  if (['special','chain','super'].includes(a.kind)) {
    if (spec.kind==='dash' && a.age<a.active+5) f.vx=f.facing*(a.kind==='super'?19:13);
    if (spec.kind==='uppercut' && a.age===a.active-7) f.vy=-12;
    if (spec.kind==='slam' && a.age===4) f.vy=-9;
  }
  if (a.age===a.active && ['special','chain','super'].includes(a.kind)) a.spawned=spawn(s,index,a);
  if (a.age>=a.active && a.age<a.active+10 && !a.hit && !a.spawned) {
    const dx=target.x-f.x;
    let reach=a.range;
    if (['special','chain','super'].includes(a.kind)&&spec.kind==='burst') reach=a.kind==='super'?290:205;
    const facingTarget=dx*f.facing>=-35 || ['burst','slam'].includes(spec.kind)&&['special','chain','super'].includes(a.kind);
    if (Math.abs(dx)<reach+25 && verticalOverlap(strikeBand(f,a),hurtbox(target)) && facingTarget) {
      a.hit=hit(s,index,a.damage,a.kind==='jab'?4:9,a.launch||spec.kind==='uppercut'&&['special','super','chain'].includes(a.kind),a.unblockable,a.chip);
    }
  }
  if (a.age>=a.duration) f.attack=null;
}
function botInput(s) {
  const f=s.fighters[1],op=s.fighters[0],dx=op.x-f.x,d=Math.abs(dx);
  const input=emptyInput();
  const hard=s.difficulty==='nemesis',easy=s.difficulty==='rookie';
  const period=hard?13:easy?37:23;
  if (s.phase!=='fight') return input;
  if (d>105) { input.left=dx<0;input.right=dx>0; }
  if (d<70 && s.frame%90<25) {input.left=dx>0;input.right=dx<0;}
  input.block=op.attack && d<190 && s.frame%100<(hard?68:easy?13:38) && !f.attack;
  input.jump=(s.projectiles.some(p=>p.owner===0&&Math.abs(p.x-f.x)<240)||s.frame%227<8)&&f.y===0;
  if (s.frame%period===0 && !f.attack) {
    const r=random(s);
    const action=f.energy>=100&&d<330?'space':d>200?'r':r<.45?'q':r<.8?'e':'r';
    if (d<175||action==='r'||action==='space') queueAction(s,1,action,input);
  }
  return input;
}
function finishRound(s) {
  const [a,b]=s.fighters;
  const ah=a.hp/a.maxHp,bh=b.hp/b.maxHp;
  const winner=ah===bh?null:ah>bh?0:1;
  if (winner!==null) s.fighters[winner].roundWins++;
  s.lastRoundWinner=winner;
  event(s,'round-end',{winner});
  if (s.round>=3||s.fighters.some(f=>f.roundWins>=2)) {
    s.phase='finished';s.winner=a.roundWins===b.roundWins?null:a.roundWins>b.roundWins?0:1;
    event(s,'match-end',{winner:s.winner});
  } else {s.phase='roundover';s.phaseTimer=240;}
}
function nextRound(s) {
  s.round++;s.time=ROUND_FRAMES;s.phase='countdown';s.phaseTimer=180;s.projectiles=[];s.effects=[];
  s.fighters=s.fighters.map((old,i)=>({...makeFighter(old.id,i),roundWins:old.roundWins}));
}
export function step(s,inputs=[emptyInput(),emptyInput()]) {
  if (s.phase==='finished') return;
  s.frame++;s.shake=Math.max(0,s.shake-1);s.flash=Math.max(0,s.flash-1);
  if (s.phase!=='fight') {
    s.phaseTimer--;
    if (s.phaseTimer<=0) {
      if (s.phase==='roundover') nextRound(s);
      else {s.phase='fight';event(s,'fight');}
    }
    return;
  }
  s.time--;
  const commands=[inputs[0]||emptyInput(),s.mode==='bot'?botInput(s):inputs[1]||emptyInput()];
  for (let i=0;i<2;i++) {
    const f=s.fighters[i],op=s.fighters[1-i],spec=fighter(f.id),input=commands[i];
    f.hitFlash=Math.max(0,f.hitFlash-1);f.stun=Math.max(0,f.stun-1);f.invulnerable=Math.max(0,f.invulnerable-1);
    f.cooldown=Math.max(0,f.cooldown-1);f.comboAge=Math.max(0,f.comboAge-1);if(!f.comboAge)f.combo=0;
    f.energy=Math.min(100,f.energy+.035);
    if (!f.attack) f.facing=op.x>=f.x?1:-1;
    f.blocking=!!input.block&&!f.attack&&f.stun===0&&f.y===0;
    f.queue=f.queue.filter(q=>s.frame-q.at<=16);
    if (f.stun===0) {
      if (!f.cooldown&&f.queue.length) beginAttack(s,i,f.queue.shift());
      if (!f.attack) {
        const direction=(input.right?1:0)-(input.left?1:0);
        f.vx=direction*spec.speed*PACE.run*(f.blocking ? 0.3 : 1);if(direction)f.walk++;
        if (input.jump&&f.y===0&&!f.blocking) f.vy=-spec.jump*PACE.jump;
      }
    }
    updateAttack(s,i);
    f.x=Math.max(60,Math.min(1140,f.x+f.vx));f.vx*=.82;
    f.y+=f.vy;f.vy+=PACE.gravity;if(f.y>=0){f.y=0;f.vy=0;}
  }
  const [a,b]=s.fighters;
  const gap=b.x-a.x;
  if(Math.abs(gap)<82&&Math.abs(a.y-b.y)<100){const push=(82-Math.abs(gap))/2;const sign=gap>=0?1:-1;a.x=Math.max(60,a.x-push*sign);b.x=Math.min(1140,b.x+push*sign);}
  for(const p of s.projectiles){p.age++;p.life--;if(p.age>p.warmup)p.x+=p.vx;
    const target=s.fighters[1-p.owner];
    if(p.age>=p.warmup&&Math.abs(target.x-p.x)<p.radius+35&&verticalOverlap({top:p.y-p.radius,bottom:p.y+p.radius},hurtbox(target))){
      if(hit(s,p.owner,p.damage,p.superMove?13:6,false,false,.25,p.x-p.vx)){p.life=0;}
    }
  }
  s.projectiles=s.projectiles.filter(p=>p.life>0&&p.x>-80&&p.x<1280);
  s.effects.forEach(e=>e.age++);s.effects=s.effects.filter(e=>e.age<e.life);
  if(a.hp<=0||b.hp<=0||s.time<=0)finishRound(s);
}
export function rewardFor(s,index) {
  if(s.phase!=='finished')return null;
  const won=s.winner===index,draw=s.winner===null;
  return {won,draw,xp:won?120:draw?65:45,shards:won?50:draw?25:15};
}
