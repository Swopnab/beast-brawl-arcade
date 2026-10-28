import {validTeam} from './balance.js?v=12';
export const START_SECONDS=5;
export function canStartOnline(lobby,connected){return !!(connected&&lobby?.stage==='lobby'&&lobby.teams?.length===2&&lobby.teams.every(validTeam)&&lobby.ready?.[0]===true&&lobby.ready?.[1]===true);}
