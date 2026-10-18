import {canStartOnline,START_SECONDS} from './flow.js?v=6';
import {cleanAudioSettings,createGameAudio} from './audio.js?v=5';
let graphics3D=null;
try{const {createGraphics3D}=await import('./graphics3d.js?v=5');graphics3D=createGraphics3D();}catch(error){console.warn('3D unavailable; using the original illustrated renderer.',error.message);for(const id of ['scene-background','preview-canvas','arena']){const old=document.getElementById(id),fresh=document.createElement('canvas');for(const a of old.attributes)fresh.setAttribute(a.name,a.value);old.replaceWith(fresh);}document.body.classList.remove('graphics-3d');document.getElementById('render-status').textContent='ILLUSTRATED MODE / 3D UNAVAILABLE';}
import {STAGES,getStage,drawStage} from './stages.js';
import {attachJoystick} from './joystick.js';
import {FIGHTERS,ELEMENTS,MOVE_LIST,ARENAS,TITLES,fighter} from './fighters.js?v=5';
import {createMatch,step,queueAction,emptyInput,FPS} from './combat.js?v=6';
import {drawCreature,thumbnail,renderArena} from './art.js?v=5';
import {Room,parseCode} from './network.js?v=6';
import {cleanProfile,titleFor,grantReward,equipArena} from './profile.js';
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storage={get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
let profile;try{profile=cleanProfile(JSON.parse(storage.get('bbarcade-profile')||'{}'));}catch{profile=cleanProfile();}
let gameMode='bot',fighterLocked=false;
let selected=fighter(storage.get('bbarcade-fighter')||'ashfang').id,filter='All',match=null,net=null,lobby=null,busy=false;
let inputs=[emptyInput(),emptyInput()],overlayKey='',lastEvent=0,lastSnapshot=0,lastFrame=performance.now(),accumulator=0;
let toastTimer,inputTrail=[],trailAt=0,awarded=null;
let chosenStage=getStage(storage.get('bbarcade-stage')||'volcano').id,hoverStage=chosenStage,lastScene=0,cardsDirty=true;
let reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastChatKey='',lastChatAt=[-Infinity,-Infinity],previewTime=0;
const myIndex=()=>net&&!net.host?1:0;
function text(id,value){const el=$(id);if(el.textContent!==String(value))el.textContent=value;}
function saveProfile(){storage.set('bbarcade-profile',JSON.stringify(profile));renderProfile();}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,3500);}
function status(message){$('network-status').textContent=message;$('network-status').hidden=!message;}
let preferences;try{preferences=cleanAudioSettings(JSON.parse(storage.get('bbarcade-settings')||'{}'));}catch{preferences=cleanAudioSettings();}
const gameAudio=createGameAudio(preferences);
if(preferences.motion!==null)reducedMotion=!preferences.motion;
graphics3D?.setMotion(!reducedMotion);
function beep(...args){gameAudio.playFx(...args);}
function wakeAudio(){gameAudio.start();}
document.addEventListener('pointerdown',wakeAudio,{once:true});document.addEventListener('keydown',wakeAudio,{once:true});
document.addEventListener('visibilitychange',()=>gameAudio.setHidden(document.hidden));
function renderSettings(){
  $('music-enabled').checked=preferences.musicEnabled;$('sfx-enabled').checked=preferences.sfxEnabled;$('motion-enabled').checked=!reducedMotion;
  $('music-volume').value=Math.round(preferences.music*100);$('sfx-volume').value=Math.round(preferences.sfx*100);text('music-value',`${Math.round(preferences.music*100)}%`);text('sfx-value',`${Math.round(preferences.sfx*100)}%`);
}
function saveSettings(){storage.set('bbarcade-settings',JSON.stringify(preferences));gameAudio.apply(preferences);renderSettings();}
$('settings-open').addEventListener('click',()=>{renderSettings();$('settings-dialog').showModal();gameAudio.start();});
for(const [id,key] of [['music-volume','music'],['sfx-volume','sfx']])$(id).addEventListener('input',()=>{preferences[key]=Number($(id).value)/100;saveSettings();});
for(const [id,key] of [['music-enabled','musicEnabled'],['sfx-enabled','sfxEnabled']])$(id).addEventListener('change',()=>{preferences[key]=$(id).checked;saveSettings();});
$('motion-enabled').addEventListener('change',()=>{preferences.motion=$('motion-enabled').checked;reducedMotion=!preferences.motion;graphics3D?.setMotion(preferences.motion);saveSettings();});
async function toggleFullscreen(){try{if(document.fullscreenElement||document.webkitFullscreenElement){await(document.exitFullscreen?.()||document.webkitExitFullscreen?.());}else{const el=document.documentElement;if(el.requestFullscreen)await el.requestFullscreen();else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();else toast('Fullscreen is unavailable in this browser.');}}catch(error){console.warn('Fullscreen request:',error.message);toast('Fullscreen could not start. Try opening the game in a browser tab.');}}
function updateFullscreen(){const on=!!(document.fullscreenElement||document.webkitFullscreenElement);$('fullscreen-toggle').setAttribute('aria-label',on?'Exit fullscreen':'Enter fullscreen');text('fullscreen-toggle',on?'⊡':'⛶');text('settings-fullscreen',on?'EXIT FULLSCREEN ⊡':'ENTER FULLSCREEN ⛶');}
$('fullscreen-toggle').addEventListener('click',toggleFullscreen);$('settings-fullscreen').addEventListener('click',toggleFullscreen);document.addEventListener('fullscreenchange',updateFullscreen);document.addEventListener('webkitfullscreenchange',updateFullscreen);
$('chat-toggle').addEventListener('click',()=>$('chat-dialog').showModal());
function renderProfile(){
  text('profile-title',titleFor(profile).toUpperCase());text('profile-stats',`LEVEL ${1+Math.floor(profile.xp/150)} · ${profile.xp} XP · ${profile.wins} WINS`);
  $('profile-progress').style.width=`${profile.xp%150/150*100}%`;text('shards-nav',`${profile.shards} ◆`);
}
renderProfile();
function renderFilters(){
  $('filters').innerHTML=['All',...Object.keys(ELEMENTS)].map(e=>`<button class="${filter===e?'active':''}" aria-pressed="${filter===e}" data-filter="${e}">${e}</button>`).join('');
  $('filters').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;renderFilters();renderRoster();}));
}
function renderRoster(){
  const list=FIGHTERS.filter(f=>filter==='All'||f.element===filter);
  $('roster').innerHTML=list.map(f=>`<button class="fighter-card ${f.id===selected?'selected':''}" data-id="${f.id}" style="--creature:${f.color}" aria-label="Choose ${f.name}, ${f.element}" aria-pressed="${f.id===selected}"><canvas width="100" height="95" aria-hidden="true"></canvas><strong>${f.name.toUpperCase()}</strong><span></span></button>`).join('');
  $('roster').querySelectorAll('button').forEach(b=>{if(graphics3D)graphics3D.thumbnail(b.querySelector('canvas'),b.dataset.id);else thumbnail(b.querySelector('canvas'),fighter(b.dataset.id),1.48);b.addEventListener('pointerenter',()=>select(b.dataset.id));b.addEventListener('focus',()=>select(b.dataset.id));b.addEventListener('click',()=>select(b.dataset.id,true));});
}
function select(id,commit=false){
  if(fighterLocked||match)return;
  selected=fighter(id).id;storage.set('bbarcade-fighter',selected);renderSelected();
  $('roster').querySelectorAll('button').forEach(b=>{const on=b.dataset.id===selected;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
  if(!commit)return;
  beep(520,.035,'triangle');
  if(gameMode==='bot'){startBot();return;}
  if(!net||!lobby){toast('Connect to a room first.');return;}
  fighterLocked=true;
  if(net.host){lobby.ids[0]=selected;lobby.names[0]=fighter(selected).name;lobby.ready[0]=true;publishLobby();maybeStartOnline();}
  else{net.send({type:'select',id:selected});net.send({type:'ready',ready:true});renderLobby();}
}
function renderSelected(){
  const f=fighter(selected);document.querySelector('.fighter-preview').style.setProperty('--fighter-color',f.color);
  $('selected-element').textContent=`${ELEMENTS[f.element].icon} ${f.element.toUpperCase()}`;
  text('selected-form',`${f.anatomy.size.toUpperCase()} / ${f.anatomy.form.toUpperCase()}`);text('selected-name',f.name.toUpperCase());text('selected-tagline',f.tagline);text('selected-bio',f.bio);text('selected-number',`NO. ${String(f.index+1).padStart(3,'0')}`);
  $('preview-canvas').setAttribute('aria-label',`Original creature ${f.name}`);
  $('selected-special').innerHTML=`${esc(f.moves.special)} <span>R</span>`;
  $('selected-stats').innerHTML=[['VITALITY',f.hp/1250*100,f.hp],['SPEED',f.speed/6*100,f.speed.toFixed(1)],['POWER',f.power/1.3*100,f.power.toFixed(2)]].map(([label,value,number])=>`<div class="stat"><span>${label}</span><div class="stat-track"><i style="width:${value}%"></i></div><strong>${number}</strong></div>`).join('');
}
renderFilters();renderRoster();renderSelected();
function showMoves(id=selected){const f=fighter(id);text('moves-title',`${f.name.toUpperCase()} / MOVE LIST`);$('move-list').innerHTML=MOVE_LIST.map(([command,key,description])=>`<div class="move-row"><kbd>${command}</kbd><div><strong>${esc(f.moves[key])}</strong><p>${description}</p></div></div>`).join('');$('moves-dialog').showModal();}
$('moves-open').addEventListener('click',()=>showMoves());$('battle-moves').addEventListener('click',()=>showMoves(match?.fighters[myIndex()].id||selected));
$('controls-open').addEventListener('click',()=>$('controls-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
function showRewards(){renderRewards();$('rewards-dialog').showModal();}
$('rewards-open').addEventListener('click',showRewards);$('battle-rewards').addEventListener('click',showRewards);
function renderRewards(){
  text('reward-balance',`${profile.shards} ◆ SHARDS / ${profile.xp} XP`);
  $('arena-shop').innerHTML=ARENAS.map(a=>{const unlocked=profile.unlocked.includes(a.id),equipped=profile.arena===a.id;return `<div class="arena-item" style="--arena-sky:${a.sky};--arena-accent:${a.accent};--arena-glow:${a.glow}"><h4>${a.name.toUpperCase()}</h4><p>${a.description}</p><button data-arena="${a.id}" class="${equipped?'selected':''}" ${!unlocked&&profile.shards<a.cost?'disabled':''}>${equipped?'EQUIPPED ✓':unlocked?'Equip arena':`Unlock · ${a.cost} ◆`}</button></div>`;}).join('');
  $('arena-shop').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(equipArena(profile,b.dataset.arena)){saveProfile();renderRewards();toast(`${ARENAS.find(a=>a.id===b.dataset.arena).name} equipped.`);if(match)text('arena-name',getStage(chosenStage).name.toUpperCase());}}));
  $('title-list').innerHTML=TITLES.map(t=>`<div class="title-item ${profile.xp>=t.xp?'unlocked':''}"><span>${t.name}</span><span>${profile.xp>=t.xp?'UNLOCKED ✓':`${t.xp} XP`}</span></div>`).join('');
}
function setBusy(value,message=''){busy=value;['mode-pvp','mode-bot','join-room'].forEach(id=>$(id).disabled=value);text('setup-error',message);}
function showSelect(){
  $('mode-screen').hidden=true;$('stage-screen').hidden=true;document.body.dataset.screen='fighter';setSteps('fighter');$('select-screen').hidden=false;$('battle-screen').hidden=true;$('match-actions').hidden=true;$('chat-panel').hidden=!net;$('chat-toggle').hidden=!net;
  overlayKey='';clearInputs();renderLobby();
}
function showBattle(state){
  $('mode-screen').hidden=true;$('stage-screen').hidden=true;document.body.dataset.screen='battle';setSteps('battle');applyStage(state.stageId||chosenStage);
  match=state;fighterLocked=false;selected=match.fighters[myIndex()].id;overlayKey='';lastEvent=0;awarded=null;inputs=[emptyInput(),emptyInput()];accumulator=0;lastFrame=performance.now();
  $('selection-wait').hidden=true;$('select-screen').hidden=true;$('battle-screen').hidden=false;$('chat-panel').hidden=!net;$('chat-toggle').hidden=!net;
  const names=state.fighters.map(f=>fighter(f.id).name);
  text('arena-name',getStage(chosenStage).name.toUpperCase());text('battle-mode',net?'PLAYER VS PLAYER':'PLAYER VS BOT');
  text('battle-room-code',net?`ROOM ${net.code}`:'');text('p1-alias',names[0]+(myIndex()===0?' / YOU':''));text('p2-alias',names[1]+(net?myIndex()===1?' / YOU':'':' / BOT'));
  text('p1-name',names[0].toUpperCase());text('p2-name',names[1].toUpperCase());
  text('battle-tip',net?'Host keeps this tab open and visible.':'Q → Q → E: Skybreaker combo');text('last-move','A / D MOVE · W JUMP · S GUARD');renderHud();
}
function startBot(){
  if(busy||net||match)return;
  const options=FIGHTERS.filter(f=>f.id!==selected),rival=options[crypto.getRandomValues(new Uint8Array(1))[0]%options.length].id;
  showBattle(createMatch(selected,rival,{mode:'bot',stageId:chosenStage,difficulty:'rival',seed:crypto.getRandomValues(new Uint32Array(1))[0],matchId:crypto.randomUUID()}));beep(300,.2);
}
function renderLobby(){
  $('room-strip').hidden=!net;document.body.classList.toggle('in-room',!!net);$('selection-wait').hidden=!fighterLocked;document.querySelectorAll('.selection-shell>section').forEach(el=>el.inert=fighterLocked);
  if(!net||!lobby)return;
  text('lobby-code',net.code);
  if(!net.host&&lobby.arenaId)applyStage(lobby.arenaId);
  const other=net.host?1:0,otherReady=lobby.ready[other];
  text('room-status',!net.connected?'Share the invite with a friend.':otherReady?`${lobby.names[other]} is ready.`:'Rival is choosing a fighter.');
  text('waiting-name',fighter(selected).name.toUpperCase()+' IS READY.');text('waiting-detail',!net.connected?'Share the invite above. Your rival can join from another device.':'The five-second countdown starts when your rival chooses a fighter.');
  updateStageChoices();renderChat();
}
function publishLobby(){if(!net?.host||!lobby)return;net.broadcast({type:'lobby',lobby});renderLobby();}
function maybeStartOnline(){if(net?.host&&!match&&canStartOnline(lobby,net.connected))beginOnline();}
async function openRoom(host){
  if(busy)return;setBusy(true);gameMode='online';fighterLocked=false;const name=fighter(selected).name,requested=parseCode($('room-code').value);
  if(!host&&!/^[A-HJ-NP-Z2-9]{8}$/.test(requested)){setBusy(false,'Enter an 8-character room code or invite link.');return;}
  lobby=host?{names:[name,'Rival'],ids:[selected,'zipcat'],ready:[false,false],messages:[],stage:'lobby',arenaId:chosenStage}:null;
  lastChatKey='';lastChatAt=[-Infinity,-Infinity];
  const room=new Room({status,
    join:({rejoin})=>{if(!lobby)return;if(!rejoin)lobby.ready[1]=false;publishLobby();$('pause-overlay').hidden=true;},
    disconnect:()=>{inputs[1]=emptyInput();if(lobby&&!match)lobby.ready[1]=false;renderLobby();},
    connected:()=>{if(!match)room.send({type:'select',id:selected});},message:handleMessage});
  net=room;
  try{await room.open(host,name,requested);if(net!==room)return;setBusy(false);status('');
    const url=new URL(location.href);url.searchParams.set('room',room.code);history.replaceState(null,'',url);
    if(!match)showStages();renderLobby();
  }catch(error){if(net===room){room.close();net=null;lobby=null;renderLobby();showModes();setBusy(false,error.message);status('');}}
}
$('join-form').addEventListener('submit',e=>{e.preventDefault();openRoom(false);});
const initialCode=parseCode(new URL(location.href).searchParams.get('room'));if(/^[A-HJ-NP-Z2-9]{8}$/.test(initialCode)){$('room-code').value=initialCode;text('pvp-description','Your friend invited you. Join their room.');}
function handleMessage(message){
  if(!net)return;
  if(net.host){
    if(message.type==='input')inputs[1]=message.input;
    else if(message.type==='action'&&match)queueAction(match,1,message.action,inputs[1]);
    else if(message.type==='select'&&(!match||match.phase==='finished')&&FIGHTERS.some(f=>f.id===message.id)){if(match)returnToLobby();lobby.ids[1]=message.id;lobby.names[1]=fighter(message.id).name;lobby.ready[1]=false;publishLobby();}
    else if(message.type==='ready'&&!match){lobby.ready[1]=message.ready;publishLobby();maybeStartOnline();}
    else if(message.type==='chat')addChat(1,message.text);
    else if(message.type==='lobby-request'&&match?.phase==='finished')returnToLobby();
  }else if(message.type==='lobby'&&message.lobby){
    lobby=message.lobby;
    if(lobby.stage==='lobby'&&match){match=null;fighterLocked=false;selected=lobby.ids[1];showSelect();renderSelected();renderRoster();}
    renderLobby();
  }else if(message.type==='snapshot'&&message.state?.fighters?.length===2){if(!match||match.id!==message.state.id)showBattle(message.state);else match=message.state;}
}
function beginOnline(){
  if(!net?.host||!lobby||!canStartOnline(lobby,net.connected)||match)return;
  net.locked=true;lobby.stage='battle';publishLobby();
  const state=createMatch(lobby.ids[0],lobby.ids[1],{mode:'online',stageId:lobby.arenaId||chosenStage,seed:crypto.getRandomValues(new Uint32Array(1))[0],matchId:crypto.randomUUID()});
  showBattle(state);net.broadcast({type:'snapshot',state});
}
async function copyRoom(){if(!net)return;const url=new URL(location.href);url.searchParams.set('room',net.code);try{await navigator.clipboard.writeText(url.href);toast('Invite link copied. Your rival’s excuses are over.');}catch{toast(`Share room code ${net.code} and this page’s URL.`);}}
$('copy-room').addEventListener('click',copyRoom);
function leaveRoom(){
  $('chat-dialog').close();$('chat-toggle').hidden=true;net?.close();net=null;lobby=null;match=null;fighterLocked=false;status('');setBusy(false);const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);$('room-code').value='';text('pvp-description','Create a room and invite a friend.');renderLobby();showModes();renderSelected();renderRoster();
}
$('leave-room').addEventListener('click',leaveRoom);
function returnToLobby(){
  if(!net){match=null;fighterLocked=false;showSelect();renderSelected();renderRoster();return;}
  if(!net.host){net.send({type:'lobby-request'});return;}
  match=null;fighterLocked=false;net.locked=false;delete net.cache.snapshot;lobby.stage='lobby';lobby.ready=[false,false];showSelect();publishLobby();renderSelected();renderRoster();
}
function requestExit(){if(match&&match.phase!=='finished'){$('exit-detail').textContent=net?'Leaving disconnects this match. If you are hosting, the room closes for both players. Unfinished matches earn no rewards.':'Unfinished matches earn no rewards. Your completed-match rewards are already saved.';$('exit-dialog').showModal();}else leaveRoom();}
$('exit-battle').addEventListener('click',requestExit);
$('confirm-exit').addEventListener('click',()=>{$('exit-dialog').close();leaveRoom();});
document.querySelector('.brand').addEventListener('click',e=>{if(match||net){e.preventDefault();requestExit();}});
$('choose-again').addEventListener('click',returnToLobby);
$('rematch').addEventListener('click',()=>{if(net){returnToLobby();}else{const old=match;showBattle(createMatch(old.fighters[0].id,old.fighters[1].id,{mode:'bot',stageId:old.stageId||chosenStage,difficulty:old.difficulty,seed:crypto.getRandomValues(new Uint32Array(1))[0],matchId:crypto.randomUUID()}));}});
function addChat(index,raw){
  if(!lobby||typeof raw!=='string'||raw.length>180)return false;
  const message=raw.replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').trim();
  if(!message)return false;
  if(Date.now()-lastChatAt[index]<1000){if(index===myIndex())toast('Give your last message a second to land.');return false;}
  lastChatAt[index]=Date.now();lobby.messages.push({index,name:lobby.names[index],text:message,id:crypto.randomUUID()});lobby.messages=lobby.messages.slice(-50);publishLobby();return true;
}
function renderChat(){
  if(!lobby)return;const key=JSON.stringify(lobby.messages);if(key===lastChatKey)return;lastChatKey=key;
  const log=$('chat-log'),stick=log.scrollHeight-log.scrollTop-log.clientHeight<50;
  if(!lobby.messages.length){log.innerHTML='<p class="chat-empty">Your rival is suspiciously quiet.</p>';return;}
  const existing=new Set(Array.from(log.querySelectorAll('[data-message]'),el=>el.dataset.message));log.querySelector('.chat-empty')?.remove();
  const keep=new Set(lobby.messages.map(m=>m.id));log.querySelectorAll('[data-message]').forEach(el=>{if(!keep.has(el.dataset.message))el.remove();});
  for(const m of lobby.messages){if(existing.has(m.id))continue;const el=document.createElement('div');el.dataset.message=m.id;el.className=`chat-message ${m.index===myIndex()?'mine':''}`;const name=document.createElement('b');name.textContent=m.name;el.append(name,document.createTextNode(m.text));log.append(el);}
  if(stick)log.scrollTop=log.scrollHeight;
}
$('chat-form').addEventListener('submit',e=>{e.preventDefault();const input=$('chat-input'),message=input.value.trim();if(!net||!message)return;if(net.host){if(addChat(0,message))input.value='';}else{net.send({type:'chat',text:message});input.value='';}});
function clearInputs(){releaseJoystick();inputs[myIndex()]=emptyInput();document.querySelectorAll('.touch-controls .active').forEach(b=>b.classList.remove('active'));if(net&&!net.host)net.send({type:'input',input:inputs[1]});}
function move(key,value){if(!match)return;inputs[myIndex()][key]=value;if(net&&!net.host)net.send({type:'input',input:inputs[1]});}
function attack(action){
  if(!match||match.phase!=='fight'||net&&!net.connected)return;
  const index=myIndex();if(net&&!net.host)net.send({type:'action',action});else queueAction(match,index,action,inputs[index]);
  if(performance.now()-trailAt>2000)inputTrail=[];inputTrail.push(action==='space'?'SP':action.toUpperCase());inputTrail=inputTrail.slice(-3);trailAt=performance.now();text('input-trail',inputTrail.join(' › '));
}
const releaseJoystick=attachJoystick($('glass-joystick'),v=>{for(const key of ['left','right','jump','block'])move(key,v[key]);});
if(navigator.maxTouchPoints>0)document.body.classList.add('has-touch');
const moveKeys={KeyA:'left',KeyD:'right',KeyW:'jump',KeyS:'block'},attackKeys={KeyQ:'q',KeyE:'e',KeyR:'r',Space:'space'};
document.addEventListener('keydown',e=>{
  if(!match||$('battle-screen').hidden||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;
  if(moveKeys[e.code]){e.preventDefault();move(moveKeys[e.code],true);}
  else if(attackKeys[e.code]){e.preventDefault();if(!e.repeat)attack(attackKeys[e.code]);}
});
document.addEventListener('keyup',e=>{if(moveKeys[e.code])move(moveKeys[e.code],false);});window.addEventListener('blur',clearInputs);
document.querySelectorAll('[data-move]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('active');move(b.dataset.move,true);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>b.addEventListener(name,()=>{b.classList.remove('active');move(b.dataset.move,false);}));
});
document.querySelectorAll('[data-action]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('active');attack(b.dataset.action);});['pointerup','pointercancel','lostpointercapture'].forEach(name=>b.addEventListener(name,()=>b.classList.remove('active')));});
function renderHud(){
  if(!match)return;
  for(let i=0;i<2;i++){const f=match.fighters[i],prefix=`p${i+1}`;$(prefix+'-health').style.transform=`scaleX(${f.hp/f.maxHp})`;text(prefix+'-hp',`${Math.ceil(f.hp)} / ${f.maxHp}`);$(prefix+'-energy').style.width=`${f.energy}%`;text(prefix+'-energy-label',f.energy>=100?'SPACE / FINISHER READY':`ENERGY ${Math.floor(f.energy)}%`);$(prefix+'-energy-label').classList.toggle('full',f.energy>=100);text(prefix+'-rounds','●'.repeat(f.roundWins)+'○'.repeat(Math.max(0,2-f.roundWins)));}
  text('round-label',`ROUND ${match.round}`);text('fight-timer',Math.ceil(match.time/FPS));
  const mine=match.fighters[myIndex()];if(mine.lastMove)text('last-move',mine.lastMove.toUpperCase());
  if(performance.now()-trailAt>2200&&inputTrail.length){inputTrail=[];text('input-trail','');}
  $('pause-overlay').hidden=!(net&&!net.connected);
  for(const event of match.events){if(event.id<=lastEvent)continue;lastEvent=event.id;if(match.frame-event.frame>12)continue;if(event.type==='hit')beep(event.combo>2?220:100,.07,'triangle',.055);else if(event.type==='super')beep(90,.35,'sawtooth',.04);else if(event.type==='fight')beep(650,.12);else if(event.type==='empty-energy'&&event.player===myIndex())toast('Build 100% energy to use your finisher.');}
  const key=`${match.id}-${match.phase}-${match.round}`;
  if(key!==overlayKey){overlayKey=key;renderOverlay();}
  if(match.phase==='briefing'){text('briefing-seconds',`${Math.ceil(match.phaseTimer/FPS)}s`);$('briefing-progress').style.width=`${match.phaseTimer/(START_SECONDS*FPS)*100}%`;}
  else if(match.phase==='countdown')text('count-number',Math.max(1,Math.ceil(match.phaseTimer/FPS)));
}
function renderOverlay(){
  const overlay=$('fight-overlay');overlay.className=`fight-overlay ${match.phase}`;overlay.replaceChildren();$('match-actions').hidden=match.phase!=='finished';
  if(match.phase==='briefing'){
    overlay.innerHTML=`<div class="ready-countdown"><p>${fighter(match.fighters[0].id).name.toUpperCase()} <em>VS</em> ${fighter(match.fighters[1].id).name.toUpperCase()}</p><strong id="briefing-seconds">5s</strong><h2>GET READY.</h2><p class="ready-controls">WASD MOVE / JUMP / GUARD<br>Q LIGHT · E HEAVY · R SPECIAL · SPACE FINISHER</p><div class="briefing-meter"><i id="briefing-progress"></i></div></div>`;
  }else if(match.phase==='countdown'){overlay.innerHTML='<div id="count-number" class="count-number">3</div><div class="count-caption">NEXT ROUND. SAME GRUDGE.</div>';}
  else if(match.phase==='roundover'){
    const winner=match.lastRoundWinner;const name=winner===null?'ROUND DRAW':`${fighter(match.fighters[winner].id).name.toUpperCase()} WINS`;
    overlay.innerHTML=`<div class="round-result">${name}</div><p class="round-result-sub">${match.fighters.some(f=>f.hp<=0)?'K.O. / ':''}NEXT ROUND STARTS IN A MOMENT.</p>`;
  }else if(match.phase==='finished'){
    awarded=grantReward(profile,match,myIndex());if(awarded)saveProfile();
    const won=match.winner===myIndex(),draw=match.winner===null;const title=draw?'HONORABLE DRAW':won?'YOU OWN THE STREET.':'THE STREET BITES BACK.';
    const winner=draw?'RUN IT BACK. SETTLE IT.':`${fighter(match.fighters[match.winner].id).name.toUpperCase()} WINS THE MATCH`;
    const reward=awarded||(won?{xp:120,shards:50}:draw?{xp:65,shards:25}:{xp:45,shards:15});
    overlay.innerHTML=`<div class="round-result">${title}</div><p class="round-result-sub">${winner}</p><span class="reward-chip">+${reward.xp} XP &nbsp; / &nbsp; +${reward.shards} ◆ SHARDS</span>`;
    $('rematch').disabled=!!net&&(!net.host||!net.connected);$('rematch').innerHTML=net&&!net.host?'WAITING FOR HOST':'REMATCH <span>↯</span>';
  }
}
function frame(now){
  if(now-lastScene>50){if(cardsDirty&&document.body.dataset.screen==='stage'){paintCards(now);cardsDirty=false;}else if(document.body.dataset.screen==='stage'){paintCard(hoverStage,now);}if(graphics3D){if(document.body.dataset.screen!=='battle')graphics3D.background(document.body.dataset.screen==='stage'?hoverStage:chosenStage,now);}else drawStage($('scene-background').getContext('2d'),document.body.dataset.screen==='stage'?hoverStage:chosenStage,1600,900,reducedMotion?1500:now,!reducedMotion);lastScene=now;}
  const elapsed=Math.min(100,now-lastFrame);lastFrame=now;
  if(match&&!$('battle-screen').hidden){
    if(!net||net.host){if((!net||net.connected)&&!(!net&&document.querySelector('dialog[open]'))){accumulator+=elapsed;while(accumulator>=1000/FPS){step(match,inputs);accumulator-=1000/FPS;}}else accumulator=0;
      if(net&&now-lastSnapshot>65){net.broadcast({type:'snapshot',state:match});lastSnapshot=now;}
    }
    if(graphics3D)graphics3D.battle(match,profile.arena,now);else renderArena($('arena'),match,profile.arena,now,match.stageId||chosenStage);renderHud();
  }else if(document.body.dataset.screen==='fighter'&&now-previewTime>33){if(graphics3D){graphics3D.preview(selected,now);previewTime=now;requestAnimationFrame(frame);return;}const ctx=$('preview-canvas').getContext('2d');ctx.clearRect(0,0,960,900);drawCreature(ctx,fighter(selected),455,865,15,'idle',reducedMotion?1500:now);previewTime=now;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
setInterval(()=>{if(net&&!net.host&&net.connected&&match)net.send({type:'input',input:inputs[1]});},80);
document.addEventListener('visibilitychange',()=>{clearInputs();lastFrame=performance.now();accumulator=0;});

function setSteps(active){for(const name of ['mode','stage','fighter','battle'])$('step-'+name).classList.toggle('active',name===active);}
function applyStage(id){const stage=getStage(id);chosenStage=stage.id;hoverStage=stage.id;document.documentElement.style.setProperty('--stage-accent',stage.accent);$('stage-summary').innerHTML=stage.name.toUpperCase()+' <i>／</i> '+stage.type;storage.set('bbarcade-stage',stage.id);}
function chooseStage(id){if(net&&!net.host&&lobby?.arenaId&&id!==lobby.arenaId)return;applyStage(id);if(net?.host&&lobby){lobby.arenaId=chosenStage;publishLobby();}showSelect();}
function stageHover(id){hoverStage=getStage(id).id;document.documentElement.style.setProperty('--stage-accent',getStage(id).accent);document.querySelectorAll('.stage-card').forEach(b=>b.classList.toggle('active',b.dataset.stage===hoverStage));}
function paintCard(id,now){const button=document.querySelector('[data-stage="'+id+'"]');if(!button)return;const canvas=button.querySelector('canvas'),rect=button.getBoundingClientRect(),w=Math.max(300,Math.round(rect.width*1.6)),h=Math.max(180,Math.round(rect.height*1.6));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}if(graphics3D)graphics3D.card(canvas,id,now);else drawStage(canvas.getContext('2d'),id,w,h,reducedMotion?1500:now,!reducedMotion&&id===hoverStage);}
function paintCards(now){for(const stage of STAGES)paintCard(stage.id,now);}
function updateStageChoices(){const guest=net&&!net.host;document.querySelectorAll('.stage-card').forEach(b=>b.disabled=!!(guest&&lobby?.arenaId&&b.dataset.stage!==lobby.arenaId));if(guest&&lobby?.arenaId)stageHover(lobby.arenaId);text('stage-help',guest?'Your friend is hosting. Choose their highlighted arena to continue.':'Pick the place. Bring the fight.');}
function showStages(){if(match)return;fighterLocked=false;$('selection-wait').hidden=true;$('mode-screen').hidden=true;document.body.dataset.screen='stage';setSteps('stage');$('stage-screen').hidden=false;$('select-screen').hidden=true;$('battle-screen').hidden=true;$('chat-panel').hidden=!net;$('chat-toggle').hidden=!net;text('mode-summary',gameMode==='bot'?'PLAYER VS BOT':'PLAYER VS PLAYER');stageHover(chosenStage);updateStageChoices();cardsDirty=true;}
function showModes(){document.body.dataset.screen='mode';setSteps('mode');$('mode-screen').hidden=false;$('stage-screen').hidden=true;$('select-screen').hidden=true;$('battle-screen').hidden=true;$('selection-wait').hidden=true;$('join-form').hidden=true;$('chat-toggle').hidden=true;fighterLocked=false;}
function renderModeArt(){for(const [id,ids] of [['pvp-art',['glaciop','crysteel']],['bot-art',['ashfang','hexeye']]]){const c=$(id),ctx=c.getContext('2d');ids.forEach((id,i)=>{const portrait=document.createElement('canvas');portrait.width=200;portrait.height=200;if(graphics3D)graphics3D.thumbnail(portrait,id);else thumbnail(portrait,fighter(id),3);ctx.drawImage(portrait,60+i*220,0,200,220);});ctx.fillStyle='#f2d5a7';ctx.font='italic 900 34px sans-serif';ctx.textAlign='center';ctx.fillText('VS',270,120);}}

$('stage-options').innerHTML=STAGES.map((s,i)=>'<button class="stage-card '+(s.id===chosenStage?'active':'')+'" data-stage="'+s.id+'" style="--card-color:'+s.accent+'" aria-label="Choose '+s.name+', '+s.type.toLowerCase()+' background"><canvas width="420" height="600" aria-hidden="true"></canvas><div class="stage-card-top"><span class="stage-card-number">'+s.number+' / STAGE</span><span class="stage-card-sigil" aria-hidden="true">'+['△','≋','ϟ','☼','✳'][i]+'</span></div><div class="stage-card-copy"><span class="stage-card-type">'+s.type+'</span><h2>'+s.name.toUpperCase()+'</h2><p>'+s.subtitle+'</p></div><span class="stage-card-arrow" aria-hidden="true">↗</span></button>').join('');
document.querySelectorAll('.stage-card').forEach(button=>{button.addEventListener('pointerenter',()=>stageHover(button.dataset.stage));button.addEventListener('focus',()=>stageHover(button.dataset.stage));button.addEventListener('click',()=>chooseStage(button.dataset.stage));});
$('change-stage').addEventListener('click',()=>{if(net?.host&&lobby){lobby.ready[0]=false;publishLobby();}else net?.send({type:'ready',ready:false});showStages();});
$('change-mode').addEventListener('click',leaveRoom);
$('mode-bot').addEventListener('click',()=>{if(busy)return;gameMode='bot';showStages();});
$('mode-pvp').addEventListener('click',()=>openRoom(!/^[A-HJ-NP-Z2-9]{8}$/.test(parseCode($('room-code').value))));
$('show-join').addEventListener('click',()=>{$('join-form').hidden=false;$('room-code').focus();});$('cancel-join').addEventListener('click',()=>{$('join-form').hidden=true;});
$('change-fighter').addEventListener('click',()=>{fighterLocked=false;if(net?.host&&lobby){lobby.ready[0]=false;publishLobby();}else net?.send({type:'ready',ready:false});renderLobby();});
$('random-fighter').addEventListener('click',()=>{const choices=FIGHTERS.filter(f=>f.id!==selected);select(choices[crypto.getRandomValues(new Uint8Array(1))[0]%choices.length].id,true);});
window.addEventListener('resize',()=>{cardsDirty=true;});window.visualViewport?.addEventListener('resize',()=>{cardsDirty=true;});
document.addEventListener('keydown',e=>{if(match||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const screen=document.body.dataset.screen;if(!['stage','fighter'].includes(screen))return;const direction=e.code==='ArrowLeft'?-1:e.code==='ArrowRight'?1:0;if(direction){e.preventDefault();if(screen==='stage'){const i=STAGES.findIndex(s=>s.id===hoverStage);const next=STAGES[(i+direction+STAGES.length)%STAGES.length];stageHover(next.id);document.querySelector('[data-stage="'+next.id+'"]').focus({preventScroll:true});}else{const list=FIGHTERS.filter(f=>filter==='All'||f.element===filter);const i=list.findIndex(f=>f.id===selected);select(list[(i+direction+list.length)%list.length].id);}}else if(e.code==='Enter'&&e.target.tagName!=='BUTTON'&&e.target.tagName!=='A'){e.preventDefault();if(screen==='stage')chooseStage(hoverStage);else select(selected,true);}});
applyStage(chosenStage);renderModeArt();showModes();
