// Local signaling only. Uses real browser RTCDataChannels; no public signaling service.
module.exports = `(()=>{
class Events{constructor(){this.handlers={};}on(n,f){(this.handlers[n]??=[]).push(f);return this;}emit(n,v){for(const f of this.handlers[n]||[])f(v);}}
const signal=new BroadcastChannel('beast-test-signaling');
const gather=pc=>pc.iceGatheringState==='complete'?Promise.resolve():new Promise(resolve=>pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete')resolve();}));
class Link extends Events{
 constructor(pc){super();this.pc=pc;this.open=false;this.ended=false;}
 attach(channel){this.channel=channel;channel.onopen=()=>{this.open=true;this.emit('open');};channel.onmessage=e=>this.emit('data',JSON.parse(e.data));channel.onclose=()=>this.finish();channel.onerror=()=>this.emit('error',{});}
 send(m){this.channel.send(JSON.stringify(m));}
 finish(){if(this.ended)return;this.ended=true;this.open=false;this.emit('close');}
 close(){this.channel?.close();this.pc.close();this.finish();}
}
window.Peer=class Peer extends Events{
 constructor(id){super();this.id=typeof id==='string'?id:crypto.randomUUID();this.links=new Map();this.listener=e=>{const m=e.data;if(m.to===this.id)this.receive(m);};signal.addEventListener('message',this.listener);setTimeout(()=>this.emit('open',this.id),0);}
 connect(to){const pc=new RTCPeerConnection({iceServers:[]}),link=new Link(pc),key=crypto.randomUUID();this.links.set(key,link);link.attach(pc.createDataChannel('game'));(async()=>{await pc.setLocalDescription(await pc.createOffer());await gather(pc);signal.postMessage({from:this.id,to,key,type:'offer',sdp:pc.localDescription.toJSON()});})().catch(e=>this.emit('error',e));return link;}
 async receive(m){if(m.type==='offer'){const pc=new RTCPeerConnection({iceServers:[]}),link=new Link(pc);this.links.set(m.key,link);pc.ondatachannel=e=>link.attach(e.channel);this.emit('connection',link);await pc.setRemoteDescription(m.sdp);await pc.setLocalDescription(await pc.createAnswer());await gather(pc);signal.postMessage({from:this.id,to:m.from,key:m.key,type:'answer',sdp:pc.localDescription.toJSON()});}else if(m.type==='answer'){await this.links.get(m.key).pc.setRemoteDescription(m.sdp);}}
 destroy(){this.destroyed=true;signal.removeEventListener('message',this.listener);for(const l of this.links.values())l.close();}
};})();`;
