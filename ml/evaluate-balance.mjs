// Symmetric scripted-coach smoke test. This is not human balance/playtest evidence.
import fs from 'node:fs';
import {FIGHTERS} from '../fighters.js';
import {createMatch,step,queueAction,emptyInput} from '../combat.js';
import {coach} from './coach.js';
const rows=[],stats=Object.fromEntries(FIGHTERS.map(f=>[f.id,{wins:0,losses:0,draws:0}]));
for(const a of FIGHTERS)for(const b of FIGHTERS){if(a.id===b.id)continue;
 const s=createMatch([a.id],[b.id],{mode:'online',seed:551,matchId:`${a.id}-${b.id}`});let inputs=[emptyInput(),emptyInput()],ticks=0;
 while(s.phase!=='finished'&&ticks<5800){
  if(s.phase==='fight'&&s.frame%8===0){inputs=[0,1].map(i=>{const action=coach(s,i),f=s.fighters[i],dx=s.fighters[1-i].x-f.x,input=emptyInput();if(action==='approach'||action==='retreat'){const dir=Math.sign(dx)*(action==='retreat'?-1:1);input.left=dir<0;input.right=dir>0;}input.duck=action==='duck';input.jump=action==='jump';const command={strike:'e',ranged:'q',deflect:'r',ultimate:'space'}[action];if(command)queueAction(s,i,command,input);return input;});}
  step(s,inputs);ticks++;
 }
 if(s.phase!=='finished')throw new Error('Unfinished bout');
 const ids=[a.id,b.id];if(s.winner===null)ids.forEach(id=>stats[id].draws++);else{stats[ids[s.winner]].wins++;stats[ids[1-s.winner]].losses++;}
 rows.push({left:a.id,right:b.id,winner:s.winner,ticks,health:s.fighters.map(f=>f.hp)});
}
const report={method:'132 ordered single-fighter bouts. Both sides use the same scripted coach every eight ticks; each pairing runs in both seats. Includes elemental matchups. A deterministic smoke test, not human balance evidence or a competitive win rate.',stats,runs:rows};
fs.writeFileSync(new URL('../evaluation/roster-balance.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.table(stats);
