const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const cleanName=value=>String(value||'Fighter').replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim().slice(0,18)||'Fighter';
export function parseCode(value){let code=String(value||'').trim();if(/^https?:\/\//i.test(code)){try{code=new URL(code).searchParams.get('room')||'';}catch{return '';}}return code.toUpperCase().replace(/[\s-]/g,'');}
function tokenFor(code){const key=`bbarcade-seat-${code}`;try{let token=sessionStorage.getItem(key);if(!token){token=crypto.randomUUID()+crypto.randomUUID();sessionStorage.setItem(key,token);}return token;}catch{return crypto.randomUUID()+crypto.randomUUID();}}
export class Room {
  constructor(callbacks={}){this.callbacks=callbacks;this.peer=null;this.conn=null;this.host=false;this.connected=false;this.closed=false;this.code='';this.locked=false;this.guestToken=null;this.cache={};this.attempts=0;this.timers=new Set();}
  status(text){this.callbacks.status?.(text);}
  later(fn,ms){const id=setTimeout(()=>{this.timers.delete(id);fn();},ms);this.timers.add(id);return id;}
  send(message){if(this.conn?.open){try{this.conn.send(message);}catch{}}}
  broadcast(message){if(message.type==='lobby'||message.type==='snapshot')this.cache[message.type]=message;this.send(message);}
  async open(host,name,requestedCode=''){
    if(typeof window.Peer!=='function')throw new Error('Multiplayer couldn’t load. Reload the page and try again.');
    this.host=host;this.name=cleanName(name);this.code=host?Array.from(crypto.getRandomValues(new Uint8Array(8)),v=>alphabet[v%alphabet.length]).join(''):parseCode(requestedCode);
    if(!/^[A-HJ-NP-Z2-9]{8}$/.test(this.code))throw new Error('Enter an 8-character room code or paste an invite link.');
    this.token=tokenFor(this.code);
    return new Promise((resolve,reject)=>{
      let settled=false;
      const ready=()=>{if(settled)return;settled=true;clearTimeout(timeout);resolve(this);};
      const fail=message=>{if(settled){this.status(message);return;}settled=true;this.close();reject(new Error(message));};
      this.ready=ready;this.fail=fail;
      const timeout=this.later(()=>fail('Couldn’t reach the room. Check your connection and the host’s room code.'),15000);
      this.status(host?'Opening your arena…':'Connecting to the arena…');
      try{this.peer=host?new window.Peer(`bbrawl-arcade-v3-${this.code}`,{debug:0}):new window.Peer({debug:0});}
      catch{fail('This browser does not support peer connections. Try a current Chrome, Safari, Edge, or Firefox.');return;}
      this.peer.on('open',()=>{if(this.closed)return;if(host){this.status('');ready();}else this.connect();});
      this.peer.on('connection',conn=>{if(host)this.accept(conn);else conn.close();});
      this.peer.on('disconnected',()=>{if(this.closed)return;this.status('Room discovery is reconnecting.');this.later(()=>{if(!this.closed&&this.peer?.disconnected){try{this.peer.reconnect();}catch{}}},1800);});
      this.peer.on('error',error=>{
        if(this.closed)return;
        if(error.type==='unavailable-id')fail('That room code was just taken. Please create a room again.');
        else if(error.type==='peer-unavailable'){if(!settled)fail('That room is unavailable. Ask the host to keep their tab open.');else this.reconnect();}
        else if(!settled&&!['network','disconnected'].includes(error.type))fail('The room service couldn’t connect. Please try again.');
        else if(!this.connected)this.status('Network interrupted. Reconnecting…');
      });
    });
  }
  accept(conn){
    let accepted=false;
    const deadline=this.later(()=>{if(!accepted)conn.close();},8000);
    conn.on('data',message=>{
      if(this.closed||!message||typeof message!=='object')return;
      if(!accepted){
        if(message.type!=='join')return;
        const reject=reason=>{try{conn.send({type:'error',message:reason});}catch{}this.later(()=>conn.close(),250);};
        if(message.version!==1)return reject('Reload the page to update your game.');
        if(typeof message.token!=='string'||!/^[a-f0-9-]{72}$/.test(message.token))return reject('Invalid seat. Please open a new tab.');
        if(this.guestToken&&this.guestToken!==message.token&&(this.connected||this.locked))return reject('This arena already has two fighters. Create another room.');
        if(this.locked&&!this.guestToken)return reject('A match is already running.');
        const rejoin=this.guestToken===message.token;
        const previous=this.conn;this.conn=conn;this.guestToken=message.token;this.connected=true;accepted=true;clearTimeout(deadline);
        if(previous&&previous!==conn)previous.close();
        this.send({type:'welcome',code:this.code});this.status('');
        this.callbacks.join?.({name:cleanName(message.name),rejoin});
        if(this.cache.lobby)this.send(this.cache.lobby);if(this.cache.snapshot)this.send(this.cache.snapshot);
        return;
      }
      if(this.conn!==conn)return;
      if(message.type==='input'){
        const i=message.input;if(!i||typeof i!=='object')return;
        this.callbacks.message?.({type:'input',input:{left:!!i.left,right:!!i.right,jump:!!i.jump,block:!!i.block}});
      }else if(message.type==='action'&&['q','e','r','space'].includes(message.action))this.callbacks.message?.({type:'action',action:message.action});
      else if(message.type==='select'&&typeof message.id==='string'&&message.id.length<25)this.callbacks.message?.(message);
      else if(message.type==='ready')this.callbacks.message?.({type:'ready',ready:message.ready===true});
      else if(message.type==='chat'&&typeof message.text==='string'&&message.text.length<=180)this.callbacks.message?.(message);
      else if(message.type==='lobby-request')this.callbacks.message?.({type:'lobby-request'});
      else if(message.type==='leave')conn.close();
    });
    conn.on('close',()=>{clearTimeout(deadline);if(this.closed||this.conn!==conn)return;this.connected=false;this.callbacks.disconnect?.();this.status('Your rival disconnected. The match is paused until they rejoin.');});
    conn.on('error',()=>conn.close());
  }
  connect(){
    if(this.closed||this.host||this.connected)return;
    if(this.peer?.disconnected){try{this.peer.reconnect();}catch{}this.reconnect();return;}
    this.attempts++;const conn=this.peer.connect(`bbrawl-arcade-v3-${this.code}`,{reliable:true,serialization:'json'});this.conn=conn;
    conn.on('open',()=>this.send({type:'join',version:1,token:this.token,name:this.name}));
    conn.on('data',message=>{
      if(this.closed||this.conn!==conn||!message||typeof message!=='object')return;
      if(message.type==='welcome'){this.connected=true;this.attempts=0;this.status('');this.ready();this.callbacks.connected?.();}
      else if(message.type==='error'){this.fail(String(message.message).slice(0,200));}
      else if(message.type==='ended'){this.connected=false;this.closed=true;this.status('The host closed the room. Leave and create another arena.');this.callbacks.disconnect?.();}
      else if(['lobby','snapshot'].includes(message.type)){this.callbacks.message?.(message);}
    });
    conn.on('close',()=>{if(this.closed||this.conn!==conn)return;this.connected=false;this.callbacks.disconnect?.();this.reconnect();});
    conn.on('error',()=>{if(!this.closed)this.reconnect();});
    this.later(()=>{if(!this.closed&&!this.connected&&this.conn===conn){conn.close();this.reconnect();}},10000);
  }
  reconnect(){
    if(this.closed||this.host||this.connected)return;
    clearTimeout(this.retry);
    if(this.attempts>=6){this.status('The host is unavailable. Leave this room, then join again when they return.');return;}
    this.status('Connection interrupted. Rejoining your seat…');this.retry=this.later(()=>this.connect(),Math.min(5000,1200+this.attempts*700));
  }
  close(){
    if(this.closed&&this.peer?.destroyed)return;
    this.send({type:this.host?'ended':'leave'});this.closed=true;this.connected=false;this.timers.forEach(clearTimeout);this.timers.clear();clearTimeout(this.retry);this.conn?.close();this.peer?.destroy();
  }
}
