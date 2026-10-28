import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {Room} from '../network.js';
class Connection extends EventEmitter{open=true;sent=[];send(message){this.sent.push(message);}close(){this.open=false;this.emit('close');}}
test('the host accepts the new duck and deflect commands and filters untrusted fields',()=>{
  const received=[],room=new Room({message:m=>received.push(m)}),conn=new Connection();room.host=true;room.accept(conn);
  try{conn.emit('data',{type:'join',version:3,token:'a'.repeat(72),name:'Ashfang'});assert.equal(room.connected,true);
    conn.emit('data',{type:'input',input:{left:1,jump:0,duck:true,block:true,hp:99999}});assert.deepEqual(received[0],{type:'input',input:{left:true,right:false,jump:false,duck:true}});
    for(const action of ['r','e','q','space'])conn.emit('data',{type:'action',action});assert.deepEqual(received.slice(1).map(m=>m.action),['r','e','q','space']);
    conn.emit('data',{type:'action',action:'unlimited-damage'});assert.equal(received.length,5);
  }finally{room.close();}
});
test('old combat clients are rejected before taking a multiplayer seat',()=>{
  const room=new Room(),conn=new Connection();room.host=true;room.accept(conn);
  try{conn.emit('data',{type:'join',version:1,token:'a'.repeat(72),name:'Old client'});assert.equal(room.connected,false);assert.ok(conn.sent.some(m=>m.type==='error'&&m.message.includes('Reload')));}finally{room.close();}
});

test('network filters oversized teams, duplicates, and replacement identity fields',()=>{
 const received=[],room=new Room({message:m=>received.push(m)}),conn=new Connection();room.host=true;room.accept(conn);
 try{conn.emit('data',{type:'join',version:3,token:'a'.repeat(72)});for(const ids of [[],['a','a'],['a','b','c','d'],[{}]])conn.emit('data',{type:'team',ids});assert.equal(received.length,0);
 conn.emit('data',{type:'team',ids:['ashfang','reefclaw','glaciop'],hp:99999});assert.deepEqual(received.pop(),{type:'team',ids:['ashfang','reefclaw','glaciop']});
 conn.emit('data',{type:'replacement',id:'reefclaw',player:0,hp:99999});assert.deepEqual(received.pop(),{type:'replacement',id:'reefclaw'});
 }finally{room.close();}
});
