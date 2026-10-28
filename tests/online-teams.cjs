const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs/promises');
const {chromium}=require('playwright'),{serve}=require('./server.cjs'),peer=require('./rtc-peer.cjs');
(async()=>{const site=await serve(path.resolve(__dirname,'..')),browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:1100,height:800}}),errors=[],requests=[];
 await context.route('**/vendor/peerjs.min.js',r=>r.fulfill({contentType:'text/javascript',body:peer}));
 await context.route('**/app.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:await response.text()+`\nwindow.__test={state:()=>match,knockout:i=>{match.fighters[i].hp=0;},drop:()=>net.conn.close(),send:m=>net.send(m)};`});});
 const host=await context.newPage(),guest=await context.newPage();
 for(const p of [host,guest]){p.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.message);});p.on('request',r=>requests.push(r.url()));}
 await host.goto(site.url);await host.locator('#mode-pvp').click();await host.locator('#stage-screen').waitFor();
 const code=(await host.locator('#lobby-code').textContent()).trim();assert.equal(code.length,8);
 await guest.goto(site.url+'?room='+code);await guest.locator('#mode-pvp').click();await guest.locator('#stage-screen').waitFor();
 await host.locator('[data-stage="water"]').click();await guest.locator('[data-stage="water"]').click();
 for(const [p,ids]of [[host,['ashfang','reefclaw','glaciop']],[guest,['thornox','kilnback','hexeye']]]){for(const id of ids)await p.locator('[data-id="'+id+'"]').click();assert.equal(await p.locator('.fighter-card.on-team').count(),3);await p.locator('#lock-team').click();}
 await Promise.all([host.locator('#battle-screen').waitFor(),guest.locator('#battle-screen').waitFor()]);
 await host.waitForFunction(()=>window.__test.state()?.phase==='fight');
 const s=await host.evaluate(()=>window.__test.state());assert.equal(s.format,'team');assert.equal(s.teams[0].members.length,3);assert.equal(s.teams[1].members.length,3);
 // A guest cannot choose the host's reserve or edit the authoritative HP.
 await guest.evaluate(()=>window.__test.send({type:'replacement',id:'reefclaw',player:0,hp:9999}));
 await host.evaluate(()=>window.__test.knockout(1));await guest.locator('[data-replace="kilnback"]').waitFor();
 assert.equal(await guest.locator('[data-replace]').count(),2);assert.match(await host.locator('#fight-overlay').textContent(),/RIVAL IS CHOOSING/);
 const survivorHP=await host.evaluate(()=>window.__test.state().fighters[0].hp);
 await guest.locator('[data-replace="kilnback"]').click();await host.waitForFunction(()=>window.__test.state().fighters[1].id==='kilnback');
 assert.equal(await host.evaluate(()=>window.__test.state().fighters[0].hp),survivorHP);
 await host.waitForFunction(()=>window.__test.state().phase==='fight');
 // Rejoin with the same seat token; the battle, bench and active pick survive.
 await host.evaluate(()=>window.__test.drop());await host.locator('#pause-overlay').waitFor();
 await host.waitForFunction(()=>document.querySelector('#pause-overlay').hidden,{},{timeout:15000});
 await guest.waitForFunction(()=>window.__test.state().fighters[1].id==='kilnback');
 await host.evaluate(()=>window.__test.knockout(0));await host.locator('[data-replace="reefclaw"]').click();
 await guest.waitForFunction(()=>window.__test.state().fighters[0].id==='reefclaw');
 await host.waitForFunction(()=>window.__test.state().phase==='fight');await host.evaluate(()=>window.__test.knockout(1));await guest.locator('[data-replace="hexeye"]').click();
 await host.waitForFunction(()=>window.__test.state().phase==='fight');await host.evaluate(()=>window.__test.knockout(1));
 await host.waitForFunction(()=>window.__test.state().phase==='finished');await guest.waitForFunction(()=>window.__test.state().phase==='finished');
 assert.equal(await host.evaluate(()=>window.__test.state().winner),0);await host.waitForFunction(()=>document.querySelector('#fight-overlay').textContent.includes('YOU OWN'));await guest.waitForFunction(()=>document.querySelector('#fight-overlay').textContent.includes('BITES BACK'));
 assert.equal(requests.some(u=>/three|graphics3d|creatures3d|worlds3d/.test(u)),false);assert.deepEqual(errors,[]);
 if(process.env.BEAST_SCREENSHOTS){await fs.mkdir(process.env.BEAST_SCREENSHOTS,{recursive:true});await host.screenshot({path:path.join(process.env.BEAST_SCREENSHOTS,'online-team-finished.png')});}
 await context.close();console.log('PASS real RTCDataChannel online team draft, authoritative replacement, health carryover, reconnect, full elimination, mirrored results; no Three.js loaded');
}finally{await browser.close();site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
