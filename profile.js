import { ARENAS, TITLES } from './fighters.js';
import { rewardFor } from './combat.js';
export function cleanProfile(raw={}) {
  const number=v=>Number.isFinite(v)?Math.max(0,Math.min(1000000000,Math.floor(v))):0;
  const unlocked=['neon',...(Array.isArray(raw.unlocked)?raw.unlocked.filter(id=>ARENAS.some(a=>a.id===id)):[])];
  return {xp:number(raw.xp),shards:number(raw.shards),wins:number(raw.wins),matches:number(raw.matches),
    unlocked:[...new Set(unlocked)],arena:unlocked.includes(raw.arena)?raw.arena:'neon',
    rewarded:Array.isArray(raw.rewarded)?raw.rewarded.filter(id=>typeof id==='string').slice(-100):[]};
}
export const titleFor=profile=>[...TITLES].reverse().find(t=>profile.xp>=t.xp).name;
export function grantReward(profile,match,index){
  const reward=rewardFor(match,index);
  if(!reward||profile.rewarded.includes(match.id))return null;
  profile.xp+=reward.xp;profile.shards+=reward.shards;profile.matches++;if(reward.won)profile.wins++;
  profile.rewarded.push(match.id);profile.rewarded=profile.rewarded.slice(-100);
  return reward;
}
export function equipArena(profile,id){
  const arena=ARENAS.find(a=>a.id===id);if(!arena)return false;
  if(!profile.unlocked.includes(id)){if(profile.shards<arena.cost)return false;profile.shards-=arena.cost;profile.unlocked.push(id);}
  profile.arena=id;return true;
}
