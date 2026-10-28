import test from 'node:test';
import assert from 'node:assert/strict';
import {canStartOnline,START_SECONDS} from '../flow.js';
import {createMatch,step,queueAction,emptyInput} from '../combat.js';
import {readFileSync} from 'node:fs';
test('online starts only when both characters are chosen and both devices are connected',()=>{
  const lobby={ids:['ashfang','hexeye'],teams:[['ashfang'],['hexeye']],ready:[false,false],stage:'lobby'};
  assert.equal(canStartOnline(lobby,true),false);lobby.ready[0]=true;assert.equal(canStartOnline(lobby,true),false);lobby.ready[1]=true;assert.equal(canStartOnline(lobby,false),false);assert.equal(canStartOnline(lobby,true),true);lobby.stage='battle';assert.equal(canStartOnline(lobby,true),false);
});
test('bot and online character choices lead to exactly five seconds before combat',()=>{
  assert.equal(START_SECONDS,5);for(const mode of ['bot','online']){const s=createMatch('inkveil','crysteel',{mode});for(let i=0;i<299;i++)step(s,[emptyInput(),emptyInput()]);assert.equal(s.phase,'briefing');assert.equal(queueAction(s,0,'q'),false);step(s);assert.equal(s.phase,'fight');assert.equal(s.time,3600);}
});
test('the entry page contains mode-first options and no name or final setup form',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/data-screen="mode"/);assert.match(html,/id="mode-pvp"/);assert.match(html,/id="mode-bot"/);assert.doesNotMatch(html,/id="alias"|id="match-dialog"|id="confirm-fighter"/);assert.ok(html.indexOf('id="mode-screen"')<html.indexOf('id="stage-screen"'));assert.ok(html.indexOf('id="stage-screen"')<html.indexOf('id="select-screen"'));
});
