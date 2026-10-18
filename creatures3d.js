import * as T from './vendor/three.module.js';
// Twelve independent anatomies: no shared humanoid body underneath the creatures.
const sphere=new T.SphereGeometry(1,12,8),box=new T.BoxGeometry(1,1,1),cone=new T.ConeGeometry(1,1,7),cylinder=new T.CylinderGeometry(1,1,1,8),crystal=new T.OctahedronGeometry(1),torus=new T.TorusGeometry(1,.2,7,18);
const materials=new Map();
function material(color,glow=0,opacity=1){const k=`${color}/${glow}/${opacity}`;if(!materials.has(k))materials.set(k,new T.MeshStandardMaterial({color,roughness:.6,metalness:.12,flatShading:true,emissive:color,emissiveIntensity:glow,transparent:opacity<1,opacity,depthWrite:opacity===1,side:opacity<1?T.DoubleSide:T.FrontSide}));return materials.get(k);}
function part(parent,geo,color,p,s,r=[0,0,0],glow=0,opacity=1){const m=new T.Mesh(geo,material(color,glow,opacity));m.position.set(...p);m.scale.set(...s);m.rotation.set(r[0]||0,r[1]||0,r[2]||0);m.castShadow=opacity===1;m.receiveShadow=true;parent.add(m);return m;}
function link(parent,color,a,b,r=.12){const av=new T.Vector3(...a),v=new T.Vector3(...b).sub(av),m=part(parent,cylinder,color,a,[r,v.length(),r]);m.position.addScaledVector(v,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
function group(parent,p=[0,0,0]){const g=new T.Group();g.position.set(...p);parent.add(g);return g;}
function eye(parent,x,y,z,color='#fff8db',scale=.24){part(parent,sphere,'#162135',[x,y,z],[scale*1.22,scale*1.13,scale*.55]);part(parent,sphere,color,[x,y,z+scale*.32],[scale,scale*.91,scale*.4]);part(parent,sphere,'#101c30',[x+.035,y,z+scale*.66],[scale*.4,scale*.65,scale*.19]);part(parent,sphere,'#fffaf0',[x-.055,y+.07,z+scale*.8],[scale*.16,scale*.16,scale*.1]);}
function ribbon(parent,color,points,width=.18,opacity=1){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return part(parent,new T.TubeGeometry(path,20,width,6,false),color,[0,0,0],[1,1,1],[],0,opacity);}
export function makeCreature(spec){
  const root=new T.Group(),body=group(root),legs=[],arms=[],tails=[],wings=[],tentacles=[];
  const c=spec.color,d=spec.dark,a=spec.accent,ink='#172236';let head=body;
  const ell=(parent,col,p,s,r=[],glow=0,opacity=1)=>part(parent,sphere,col,p,s,r,glow,opacity);
  const spike=(parent,col,p,s,r=[],glow=0)=>part(parent,cone,col,p,s,r,glow);
  function foot(parent,p,col=c){const g=group(parent,p);ell(g,col,[0,-.26,.12],[.33,.46,.4]);ell(g,d,[0,-.58,.3],[.37,.18,.5]);legs.push(g);return g;}
  function quad(length=1.2,height=1.3,width=.65){for(const x of [-width,width])for(const z of [-length,length])foot(body,[x,height,z]);}
  function tail(points,col=c,width=.2){const g=group(body);ribbon(g,col,points,width);tails.push(g);return g;}
  if(spec.id==='ashfang'){
    ell(body,d,[0,1.85,-.08],[.92,1.25,.72]);ell(body,c,[0,2.05,.1],[.8,1.1,.72]);ell(body,a,[0,1.95,.69],[.48,.76,.13]);
    head=group(body,[0,3.25,.12]);ell(head,c,[0,0,0],[.87,.65,.7]);ell(head,c,[0,-.2,.67],[.67,.3,.64]);for(const s of [-1,1]){eye(head,s*.42,.15,.57,a,.19);spike(head,a,[s*.64,.74,-.25],[.17,1.05,.22],[.2,0,s*-.23]);spike(head,a,[s*.43,-.39,1],[.09,.24,.1],[Math.PI,0,0]);const w=group(body,[s*.65,2.7,-.38]);part(w,cone,d,[s*1.2,.27,-.05],[1.55,2.3,.12],[0,0,s*-1.03]);link(w,a,[0,0,0],[s*2.3,1.1,-.03],.07);wings.push(w);const arm=group(body,[s*.85,2.3,.25]);ell(arm,c,[0,-.35,.1],[.26,.52,.28]);ell(arm,d,[0,-.67,.3],[.32,.27,.34]);arms.push(arm);foot(body,[s*.5,.9,0]);}
    tail([[0,1.5,-.5],[0,.65,-1.7],[.6,.4,-2.5],[1.2,.7,-2.8]],d,.26);for(let i=0;i<4;i++)spike(body,a,[0,2.7-i*.45,-.6-i*.16],[.16,.4,.25],[-.5,0,0]);
  }else if(spec.id==='kilnback'){
    quad(1.05,.8,.92);ell(body,d,[0,1.15,-.15],[1.5,.9,1.8]);ell(body,'#493c4c',[0,1.52,-.2],[1.43,1,1.65]);
    for(let i=0;i<8;i++){const t=i*Math.PI/4;part(body,box,'#98684d',[Math.cos(t)*1.15,1.7,Math.sin(t)*1.3-.2],[.56,.38,.57],[0,-t,0]);}
    for(const z of [-.8,.45]){part(body,cylinder,d,[0,2.35,z],[.34,.8,.34]);part(body,cylinder,'#ff9a42',[0,2.77,z],[.23,.04,.23],[],1.8);}
    head=group(body,[0,1.1,1.55]);ell(head,c,[0,0,0],[.66,.44,.78]);for(const s of [-1,1])eye(head,s*.35,.08,.64,'#ffcf75',.15);part(head,box,ink,[0,-.19,.74],[.47,.09,.13]);for(let i=0;i<4;i++)part(body,box,'#ff8438',[(i-1.5)*.28,1.52,1.4],[.1,.4,.05],[],1.3);
  }else if(spec.id==='reefclaw'){
    ell(body,d,[0,1.15,0],[1.5,.6,.95]);part(body,crystal,c,[0,1.5,0],[1.5,.85,1.1]);
    for(const s of [-1,1]){for(let i=0;i<3;i++){const g=group(body,[s*1,1.05,(i-1)*.7]);link(g,d,[0,0,0],[s*.85,-.1,.15],.13);link(g,c,[s*.85,-.1,.15],[s*1.05,-.9,.5],.11);legs.push(g);}const claw=group(body,[s*1.15,1.4,.6]);link(claw,d,[0,0,0],[s*.55,.35,.45],.2);ell(claw,c,[s*.65,.3,.8],[.65,.48,.52]);for(const n of [-1,1])spike(claw,a,[s*.65+n*.28,.75,.85],[.23,.75,.25],[0,0,n*-.2]);arms.push(claw);link(body,c,[s*.55,1.6,.45],[s*.65,2.35,.6],.1);eye(body,s*.65,2.35,.64,a,.2);}
    for(let i=0;i<4;i++)spike(body,a,[(i-1.5)*.55,1.98,-.15],[.17,.45,.19],[0,0,(i-1.5)*.2]);
  }else if(spec.id==='inkveil'){
    head=group(body,[0,2.3,0]);ell(head,c,[0,.2,-.1],[.85,1.1,.77]);ell(head,d,[0,-.5,.15],[1,.35,.8]);for(const s of [-1,1])eye(head,s*.39,-.12,.69,a,.22);
    for(let i=0;i<6;i++){const t=i*Math.PI/3,g=group(body,[0,1.65,0]);const x=Math.cos(t),z=Math.sin(t);ribbon(g,d,[[x*.45,0,z*.45],[x*1.2,-.8,z*1.2],[x*1.8,-1.38,z*1.8],[x*2.15,-1.15,z*2.15],[x*2.05,-.85,z*2.05]],.2);for(let k=0;k<4;k++)ell(g,a,[x*(.85+k*.3),-.65-k*.2,z*(.85+k*.3)],[.11,.06,.11]);tentacles.push(g);}
    for(const s of [-1,1])part(head,cone,c,[s*.88,.28,-.1],[.3,1.1,.16],[0,0,s*-1.2]);
  }else if(spec.id==='zipcat'){
    ell(body,d,[0,1,-.12],[.6,.62,1.1]);ell(body,c,[0,1.12,.05],[.56,.52,1]);quad(.72,.66,.42);
    head=group(body,[0,1.5,1.05]);ell(head,c,[0,0,0],[.67,.57,.53]);for(const s of [-1,1]){spike(head,c,[s*.43,.58,0],[.27,.8,.3],[0,0,s*-.12]);spike(head,d,[s*.43,.61,.18],[.12,.42,.08]);eye(head,s*.28,.02,.47,'#fff4bc',.17);link(head,a,[s*.37,-.2,.45],[s*.8,-.15,.52],.025);}
    tail([[0,1.1,-.9],[.6,1.7,-1.4],[.3,2,-1.7],[.9,2.3,-1.9]],c,.13);spike(body,a,[.95,2.35,-1.88],[.21,.6,.12],[0,0,-.5],.4);
  }else if(spec.id==='boltstag'){
    ell(body,d,[0,2.05,-.12],[.7,.79,1.3]);ell(body,c,[0,2.2,.1],[.6,.62,1.13]);for(const x of [-.44,.44])for(const z of [-.8,.8]){const g=group(body,[x,1.65,z]);link(g,c,[0,0,0],[0,-1.15,.1],.16);ell(g,ink,[0,-1.42,.18],[.24,.2,.32]);legs.push(g);}
    ell(body,c,[0,2.9,.92],[.42,.9,.44],[.35,0,0]);head=group(body,[0,3.5,1.2]);ell(head,c,[0,0,0],[.49,.48,.67]);ell(head,d,[0,-.2,.58],[.39,.25,.36]);for(const s of [-1,1]){eye(head,s*.28,.09,.53,'#d9fcff',.14);spike(head,a,[s*.63,.2,-.03],[.22,.65,.11],[0,0,s*-1.1]);link(head,a,[s*.3,.35,-.2],[s*.55,1.6,-.35],.1);for(let i=0;i<3;i++)link(head,a,[s*(.35+i*.07),.7+i*.27,-.25],[s*(.8+i*.13),.9+i*.3,-.27],.07);}
    tail([[0,2.3,-1.1],[0,2.6,-1.6]],a,.17);
  }else if(spec.id==='thornox'){
    ell(body,d,[0,1.5,0],[1.15,1.05,1.65]);ell(body,c,[0,2.1,-.15],[1.18,.75,1.5]);quad(1.02,1.05,.83);
    for(let i=0;i<8;i++){const x=Math.sin(i*2)*.85,z=Math.cos(i*2)*1.1;part(body,crystal,'#4c8852',[x,2.5,z],[.55,.6,.6]);}
    head=group(body,[0,1.6,1.5]);ell(head,d,[0,0,0],[.95,.77,.69]);ell(head,c,[0,-.25,.56],[.9,.45,.55]);for(const s of [-1,1]){eye(head,s*.55,.18,.54,'#e1ffac',.17);spike(head,a,[s*.86,.62,.02],[.28,1.5,.28],[.3,0,s*-.6]);link(head,'#3d583a',[s*.7,-.36,.57],[s*.85,-.77,.45],.14);}
    tail([[0,1.65,-1.4],[.4,1.2,-2.1],[.3,.8,-2.4]],d,.17);
  }else if(spec.id==='petalmoth'){
    ell(body,d,[0,2.4,0],[.28,.85,.32]);ell(body,c,[0,2.6,.05],[.2,.6,.28]);head=group(body,[0,3.2,0]);ell(head,a,[0,0,0],[.4,.37,.3]);for(const s of [-1,1]){eye(head,s*.19,.02,.24,'#b5ffcb',.12);link(head,d,[s*.14,.25,0],[s*.44,.82,-.03],.035);ell(head,c,[s*.44,.82,-.03],[.09,.12,.09]);const w=group(body,[s*.18,2.7,-.06]);ell(w,c,[s*1.2,.6,0],[1.35,.95,.1],[0,0,s*.5],.1,.85);ell(w,a,[s*.95,-.65,0],[.95,.8,.09],[0,0,s*-.4],0,.8);ell(w,d,[s*1.28,.57,.1],[.53,.55,.04]);ell(w,'#e9f9bb',[s*1.28,.57,.15],[.25,.3,.025],[],.25);wings.push(w);ribbon(body,a,[[s*.1,2.1,0],[s*.5,1.55,.1],[s*.6,1.2,.2]],.035);}
  }else if(spec.id==='hexeye'){
    head=group(body,[0,3.05,0]);ell(head,c,[0,.13,-.05],[1.18,.85,1.05],[],.12,.44);part(head,torus,a,[0,-.35,0],[1.12,1.12,1.12],[Math.PI/2,0,0],.2);eye(head,0,-.05,.85,'#ffcc88',.62);ell(head,d,[0,.66,-.1],[.32,.14,.34],[],.2);
    for(let i=0;i<8;i++){const t=i*Math.PI/4,g=group(body,[Math.cos(t)*.77,2.7,Math.sin(t)*.77]);ribbon(g,i%2?a:c,[[0,0,0],[Math.cos(t)*.35,-.6,Math.sin(t)*.25],[Math.cos(t+.7)*.55,-1.2,Math.sin(t+.7)*.5],[Math.cos(t+1.2)*.7,-1.8,Math.sin(t+1.2)*.6]],i%2?.055:.085,.75);tentacles.push(g);}
  }else if(spec.id==='nullwyrm'){
    ribbon(body,d,[[-1.8,1.1,-.5],[-.9,1.25,-.9],[.7,1.7,-.7],[.4,2.4,0],[0,3,.15]],.38);ribbon(body,c,[[-1.8,1.22,-.31],[-.9,1.37,-.65],[.7,1.82,-.46],[.4,2.52,.2],[0,3.1,.3]],.19);
    head=group(body,[0,3.4,.2]);ell(head,d,[0,0,0],[.64,.5,.71]);ell(head,c,[0,.18,-.08],[.62,.35,.5]);for(const s of [-1,1]){part(head,box,'#e2c3ff',[s*.33,.06,.62],[.29,.09,.08],[],1);spike(head,a,[s*.58,.58,-.13],[.16,1.1,.17],[.2,0,s*-.5],.15);ribbon(head,a,[[s*.48,-.2,.45],[s*1.3,-.45,.5],[s*1.5,-.1,.5]],.04);}
    for(let i=0;i<5;i++)part(body,crystal,a,[-1.55+i*.46,1.45+i*.21,-.48],[.16,.4,.12],[],.25);const orbit=group(body,[0,2.2,0]);part(orbit,new T.TorusGeometry(1,.035,6,36),c,[0,0,0],[1.7,1.7,1.7],[.7,.2,0],.3);tails.push(orbit);
  }else if(spec.id==='glaciop'){
    ell(body,c,[0,1.3,-.1],[.53,.7,.52]);ell(body,a,[0,1.3,.4],[.32,.44,.11]);for(const s of [-1,1]){const g=group(body,[s*.4,.72,0]);ell(g,d,[0,-.05,.02],[.38,.42,.42]);ell(g,c,[0,-.39,.45],[.33,.19,.76]);legs.push(g);const arm=group(body,[s*.47,1.7,.1]);ell(arm,c,[0,-.3,.13],[.16,.37,.18]);arms.push(arm);}
    head=group(body,[0,2.15,.1]);ell(head,c,[0,0,0],[.67,.58,.53]);for(const s of [-1,1]){ell(head,c,[s*.35,.97,-.1],[.22,.95,.19],[0,0,s*-.12]);ell(head,d,[s*.35,.99,.06],[.09,.64,.045],[0,0,s*-.12]);eye(head,s*.28,.06,.47,a,.15);}ell(head,'#f8b9df',[0,-.15,.6],[.1,.08,.06]);ell(body,a,[0,1.3,-.67],[.3,.32,.3]);
  }else if(spec.id==='crysteel'){
    part(body,crystal,d,[0,2.8,0],[1.2,1.55,.8]);part(body,crystal,c,[0,3,.2],[1,1.35,.65]);part(body,crystal,a,[0,2.9,.8],[.35,.53,.18],[],.65);
    for(const s of [-1,1]){const g=group(body,[s*.62,1.3,0]);part(g,box,d,[0,-.3,0],[.7,1.25,.72]);part(g,crystal,c,[0,-.67,.32],[.57,.44,.73]);legs.push(g);const arm=group(body,[s*1.12,3.5,0]);part(arm,crystal,a,[s*.14,.12,0],[.7,.9,.66]);part(arm,box,d,[s*.18,-.7,0],[.55,1.25,.6]);part(arm,crystal,c,[s*.24,-1.4,.2],[.7,.74,.64]);arms.push(arm);}
    head=group(body,[0,4.3,0]);part(head,crystal,c,[0,0,0],[.76,.92,.65]);for(const s of [-1,1])part(head,box,'#f1fdff',[s*.29,.04,.55],[.3,.1,.08],[0,0,s*.1],1.2);for(let i=0;i<3;i++)part(head,crystal,a,[(i-1)*.4,.7+(.2-Math.abs(i-1)*.1),-.05],[.27,.8,.3],[],.2);
  }
  const gear=[];
  function equipment(parent,p){const g=group(parent,p);g.name=spec.gear.name;g.userData.equipment=spec.gear.type;gear.push(g);return g;}
  function glove(parent,p,size,color,side=1){const g=equipment(parent,p);g.scale.setScalar(size);ell(g,color,[0,0,.08],[.46,.4,.5]);ell(g,color,[side*.3,-.13,.3],[.22,.24,.28]);ell(g,'#fff3dd',[0,.3,0],[.37,.13,.36]);part(g,box,'#29354a',[0,.31,.34],[.35,.12,.06]);for(const x of [-.13,0,.13])part(g,box,'#fff3dd',[x,.32,.38],[.035,.15,.035]);return g;}
  if(['ashfang','glaciop','crysteel'].includes(spec.id))arms.forEach((arm,i)=>{const titan=spec.id==='crysteel',small=spec.id==='glaciop';glove(arm,[titan?(i?1:-1)*.24:0,titan?-1.4:small?-.55:-.68,titan?.24:small?.22:.34],titan?1.45:small?.64:.95,titan?'#488dd4':small?'#e879a5':'#e34f4c',i?1:-1);});
  if(['zipcat','kilnback'].includes(spec.id))legs.filter(l=>l.position.z>0).forEach((leg,i)=>glove(leg,[0,-.48,.35],spec.id==='zipcat'?.7:1.05,spec.id==='zipcat'?'#d59b35':'#bb6244',i?1:-1));
  if(spec.id==='reefclaw')arms.forEach((arm,i)=>{const side=i?1:-1,g=equipment(arm,[side*.65,.3,.8]);ell(g,'#de6857',[0,-.02,0],[.72,.42,.57]);part(g,torus,'#fff3dd',[0,.07,.47],[.52,.37,.3]);});
  if(spec.id==='inkveil')tentacles.forEach((tentacle,i)=>{const t=i*Math.PI/3,g=equipment(tentacle,[Math.cos(t)*1.85,-1.23,Math.sin(t)*1.85]);ell(g,'#248ab0',[0,0,0],[.32,.24,.32]);part(g,torus,'#ffedc9',[0,.05,0],[.28,.28,.28],[Math.PI/2,0,0]);});
  if(spec.id==='boltstag')for(const side of [-1,1]){const g=equipment(head,[side*.53,1.3,-.34]);ell(g,'#ce9a31',[0,0,0],[.22,.39,.24]);part(g,torus,'#fff4ce',[0,-.2,0],[.2,.2,.2],[Math.PI/2,0,0]);}
  if(spec.id==='thornox')for(const side of [-1,1]){const g=equipment(head,[side*1.14,1.1,-.12]);ell(g,'#ce6d45',[0,0,0],[.35,.52,.35],[0,0,-side*.6]);part(g,torus,'#fff0c8',[0,-.18,0],[.33,.33,.33],[Math.PI/2,0,0]);}
  if(spec.id==='petalmoth')wings.forEach((wing,i)=>{const side=i?1:-1;for(const y of [.6,-.65]){const g=equipment(wing,[side*(y>0?2.1:1.65),y,.08]);ell(g,'#eea0b7',[0,0,0],[.23,.5,.22],[0,0,-side*.3]);part(g,box,'#fff2cd',[0,0,.2],[.27,.13,.08]);}});
  if(spec.id==='hexeye')for(const side of [-1,1]){const g=equipment(body,[side*1.38,2.65,.25]);ell(g,'#7c59b6',[0,0,0],[.4,.42,.4],[],.2);part(g,torus,'#f0d0ff',[0,0,.08],[.43,.43,.43],[0,.3,0],.3);}
  if(spec.id==='nullwyrm'){const g=equipment(body,[-1.8,1.12,-.48]);ell(g,'#b884c7',[0,0,0],[.53,.42,.45]);part(g,torus,'#ffe7b5',[0,0,.1],[.47,.37,.37]);for(const side of [-1,1])spike(g,'#ffe7b5',[side*.4,.2,0],[.16,.4,.15],[0,0,-side*.8]);}
  root.userData={spec,body,head,legs,arms,tails,wings,tentacles,gear,rest:body.position.clone()};root.scale.setScalar(spec.anatomy.scale);return root;
}
export function animateCreature(root,pose,time,attack=null,hit=false,reduced=false){
  const {spec,body,head,legs,arms,tails,wings,tentacles}=root.userData,t=reduced?0:time/1000,walking=pose==='walk',ko=pose==='ko',guard=pose==='deflect'||pose==='guard',duck=pose==='duck'||pose==='low'||pose==='breaker',floating=spec.anatomy.floating;
  body.position.y=floating?.15+Math.sin(t*2.3)*.16:Math.sin(t*2)*.025;body.rotation.z=ko?-1.22:guard?-.09:0;body.rotation.y=attack?Math.sin(attack.age/attack.duration*Math.PI)*.15:0;
  legs.forEach((l,i)=>{l.rotation.x=walking?Math.sin(t*10+(legs.length===4?[0,Math.PI,Math.PI,0][i]:i%2*Math.PI))*.38:0;});
  arms.forEach((arm,i)=>{arm.rotation.x=guard?-1:attack?-Math.sin(Math.min(1,attack.age/attack.active)*Math.PI/2)*1.2:Math.sin(t*2+i)*.07;});
  wings.forEach((w,i)=>{w.rotation.y=Math.sin(t*(floating?5:2.5))* (floating?.25:.1)*(i?1:-1);});
  tentacles.forEach((g,i)=>{g.rotation.z=Math.sin(t*2+i)*.1;g.rotation.x=Math.cos(t*2.5+i)*.09+(attack?Math.sin(attack.age/attack.duration*Math.PI)*-.45:0);});
  tails.forEach((g,i)=>{g.rotation.y=Math.sin(t*2+i)*.08;});
  root.scale.setScalar(spec.anatomy.scale*(hit?1.025:1));
  if(duck){root.scale.y*=.42;root.scale.x*=1.08;}
  if(attack?.kind==='super'){
    const progress=attack.age/attack.duration,pulse=Math.sin(progress*Math.PI);
    if(attack.ultimateId==='dragon-dive')body.rotation.z=-pulse*.5;
    if(attack.ultimateId==='furnace-ring')body.rotation.y=progress*Math.PI*2;
    if(attack.ultimateId==='pincer-grab')arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*pulse*.8);
    if(attack.ultimateId==='tentacle-flurry')tentacles.forEach((g,i)=>g.rotation.x=-.8*Math.sin(attack.age*.25+i));
    if(attack.ultimateId==='volt-rush')legs.forEach((l,i)=>l.rotation.x=Math.sin(attack.age*.7+i)*.7);
    if(attack.ultimateId==='antler-rise')body.rotation.z=pulse*.3;
    if(attack.ultimateId==='root-charge')body.rotation.z=-pulse*.25;
    if(attack.ultimateId==='petal-orbit')wings.forEach((w,i)=>w.rotation.y=(i?1:-1)*Math.sin(attack.age*.3)*.8);
    if(attack.ultimateId==='soul-siphon')tentacles.forEach((g,i)=>g.rotation.z=Math.sin(attack.age*.2+i)*.4);
    if(attack.ultimateId==='gravity-well')body.rotation.y=progress*Math.PI*4;
    if(attack.ultimateId==='frost-ballet')legs.forEach((l,i)=>l.rotation.x=Math.sin(attack.age*.4+i*Math.PI)*1.1);
    if(attack.ultimateId==='crystal-lock')arms.forEach(arm=>arm.rotation.x=-pulse*2.3);
  }
}
