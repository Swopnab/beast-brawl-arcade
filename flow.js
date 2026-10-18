export const START_SECONDS=5;
export function canStartOnline(lobby,connected){return !!(connected&&lobby?.stage==='lobby'&&lobby.ids?.length===2&&lobby.ready?.[0]===true&&lobby.ready?.[1]===true);}
