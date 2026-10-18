import * as T from './vendor/three.module.js';
// Original procedural sculptures. Separate limbs allow poses without loading models.
const sphere=new T.SphereGeometry(1,10,7),cube=new T.BoxGeometry(1,1,1),cone=new T.ConeGeometry(1,1,7),cylinder=new T.CylinderGeometry(1,1,1,8),torus=new T.TorusGeometry(1,.22,6,14);
const materials=new Map();
function mat(color,glow=false,opacity=1){const key=`${color}/${glow}/${opacity}`;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.68,metalness:.06,flatShading:true,emissive:color,emissiveIntensity:glow?.45:0,transparent:opacity<1,opacity}));return materials.get(key);}
function part(parent,geo,color,pos,scale,rotation=[0,0,0],glow=false,opacity=1){const m=new T.Mesh(geo,mat(color,glow,opacity));m.position.set(...pos);m.scale.set(...scale);m.rotation.set(rotation[0]||0,rotation[1]||0,rotation[2]||0);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function limb(parent,color,x,y,z,sx,sy,sz){const g=new T.Group();g.position.set(x,y,z);parent.add(g);part(g,sphere,color,[0,-sy*.48,0],[sx,sy*.6,sz]);return g;}
function branch(parent,color,a,b,r=.1){const dir=new T.Vector3(...b).sub(new T.Vector3(...a));const m=part(parent,cylinder,color,a,[r,dir.length(),r]);m.position.addScaledVector(dir,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m;}
export function makeCreature(spec){
  const root=new T.Group(),body=new T.Group();root.add(body);const color=spec.color,dark=spec.dark,cream=spec.accent,ink='#172032',shape=spec.shape;
  const broad=['golem','yak','bull','panda','turtle','crab','boar','urchin'].includes(shape),width=broad?1.1:.8;
  const torso=part(body,sphere,color,[0,1.8,0],[width,1.12,.66]);
  part(body,sphere,cream,[0,1.7,.51],[width*.61,.73,.2]);
  const head=new T.Group();head.position.set(0,3.16,.05);body.add(head);
  part(head,sphere,color,[0,0,0],[1,.86,.77]);part(head,sphere,dark,[0,-.53,.04],[.79,.22,.56]);
  // Sculpted eyes sit on the face, with a dark brow and forward pupils.
  for(const side of [-1,1]){
    part(head,sphere,ink,[side*.4,.09,.646],[.34,.33,.17]);
    part(head,sphere,'#fff9e9',[side*.4,.1,.76],[.25,.25,.1]);
    part(head,sphere,ink,[side*.4+.045,.08,.846],[.11,.17,.04]);
    part(head,cube,dark,[side*.4,.38,.74],[.57,.12,.15],[0,0,side*-.16]);
  }
  part(head,sphere,ink,[0,-.24,.84],[.14,.1,.08]);
  part(head,cube,cream,[0,-.43,.69],[.43,.08,.14]);
  const legs=[-1,1].map(side=>{const l=limb(body,dark,side*.52,.9,.05,.35,.83,.39);part(l,sphere,color,[0,-.58,.2],[.43,.28,.59]);part(l,cube,cream,[0,-.67,.53],[.5,.12,.16]);return l;});
  const arms=[-1,1].map(side=>{const a=limb(body,color,side*(width+.05),2.35,.05,.33,.88,.35);part(a,sphere,dark,[0,-.64,.12],[.39,.35,.4]);return a;});
  const animated=[];
  function ears(long=false){for(const side of [-1,1])part(head,cone,color,[side*.68,long?1.12:.79,0],[long?.31:.42,long?1.65:.95,.37],[0,0,side*-.16]);for(const side of [-1,1])part(head,cone,cream,[side*.68,long?1.13:.79,.25],[long?.14:.21,long?1.13:.54,.1],[0,0,side*-.16]);}
  function horns(){for(const side of [-1,1])part(head,cone,cream,[side*.87,.75,-.06],[.28,1.3,.28],[0,0,side*-.4]);}
  function tail(count=1,flat=false){for(let n=0;n<count;n++){const g=new T.Group();g.position.set((n-(count-1)/2)*.4,1.3,-.48);g.rotation.set(-.6,(n-(count-1)/2)*.5,0);body.add(g);branch(g,dark,[0,0,0],[0,-.25,-1.3],flat?.18:.25);part(g,cone,color,[0,-.06,-1.56],[flat?.6:.35,1.4,flat?.12:.35],[-Math.PI/2-.5,0,0]);part(g,sphere,cream,[0,.05,-1.8],[.25,.23,.36]);animated.push(g);}}
  function wings(large=false,glow=false){for(const side of [-1,1]){const g=new T.Group();g.position.set(side*.65,2.55,-.4);body.add(g);part(g,cone,glow?cream:dark,[side*1,.15,0],[large?1.5:1.05,2,.17],[0,0,side*-1.05],glow,glow?.82:1);branch(g,color,[0,0,.1],[side*1.9,.9,0],.08);animated.push(g);}}
  function snout(){part(head,sphere,dark,[0,-.26,.7],[.65,.37,.56]);part(head,sphere,ink,[0,-.15,1.16],[.26,.15,.12]);}
  if(['cat','fox','wolf','ghostcat','drake','wyrm'].includes(shape))ears();
  if(['cat','wolf','otter','gecko','pangolin'].includes(shape))tail();
  if(shape==='fox')tail(3);
  if(shape==='drake'||shape==='wyrm'){horns();wings(shape==='wyrm');tail();for(let i=0;i<3;i++)part(body,cone,cream,[0,2.5-i*.42,-.59],[.2,.5,.32],[-.6,0,0]);}
  if(shape==='turtle'){part(body,sphere,dark,[0,1.95,-.5],[1.25,1.3,.6]);for(let i=0;i<7;i++){const a=i*Math.PI*2/6;part(body,sphere,'#f1ae55',[Math.cos(a)*.72,1.95+Math.sin(a)*.82,-.96],[.42,.46,.14]);}part(head,sphere,cream,[0,-.33,.66],[.8,.25,.35]);}
  if(shape==='monkey'){tail();for(const s of [-1,1]){part(head,sphere,dark,[s*1,0,0],[.43,.48,.26]);part(head,sphere,cream,[s*1,.02,.18],[.26,.29,.12]);}part(head,cone,color,[.1,.96,0],[.32,.7,.3],[0,0,-.4]);}
  if(shape==='ram'){for(const s of [-1,1])part(head,torus,cream,[s*.94,.2,-.05],[.53,.65,.5],[0,Math.PI/2,0]);}
  if(['bull','boar','yak','wolf','otter'].includes(shape))snout();
  if(shape==='bull'||shape==='yak')horns();
  if(shape==='boar'){for(const s of [-1,1])part(head,cone,cream,[s*.55,-.42,.93],[.15,.76,.17],[0,0,s*-.3]);part(head,sphere,color,[0,-.26,1.16],[.43,.24,.17]);for(const s of [-1,1])part(head,cone,dark,[s*.64,.74,0],[.33,.76,.3]);}
  if(shape==='yak'){for(let i=0;i<9;i++)part(head,cone,cream,[(i-4)*.2,.42,.6],[.23,1.02,.2],[Math.PI,0,0]);}
  if(shape==='shark'){part(head,cone,color,[0,-.1,1.02],[.73,1.05,.6],[Math.PI/2,0,0]);part(body,cone,dark,[0,2.7,-.7],[.4,1.4,.55],[-.6,0,0]);for(const s of [-1,1]){part(body,cone,color,[s*1.15,1.9,0],[.38,1.2,.4],[0,0,s*1.1]);for(let i=0;i<3;i++)part(head,cone,cream,[s*(.13+i*.16),-.44,1.02],[.09,.28,.1],[Math.PI,0,0]);}}
  if(shape==='axolotl'){for(const s of [-1,1])for(let i=0;i<3;i++)branch(head,cream,[s*.8,(i-1)*.32,0],[s*(1.4-Math.abs(i-1)*.1),(i-1)*.62,.05],.12);}
  if(shape==='crab'){head.scale.set(1.1,.65,.9);for(const s of [-1,1]){branch(head,dark,[s*.5,.3,0],[s*.65,1,0],.13);part(head,sphere,cream,[s*.65,1,0],[.25,.27,.25]);const arm=arms[s===-1?0:1];part(arm,sphere,color,[s*.25,-.15,.45],[.6,.48,.5]);for(const a of [-1,1])part(arm,cone,cream,[s*.25+a*.24,.18,.45],[.2,.65,.26],[0,0,a*-.25]);}}
  if(shape==='serpent'){torso.scale.set(.6,1,.6);legs.forEach(l=>l.visible=false);for(let i=0;i<3;i++)part(body,torus,color,[0,.35+i*.32,-.1],[1.15-i*.18,1.15-i*.18,1.2],[Math.PI/2,0,0]);tail();}
  if(shape==='ray'){wings(true);legs.forEach(l=>l.visible=false);arms.forEach(l=>l.visible=false);body.scale.set(1.1,.7,1);tail(1,true);}
  if(['bee','moth','owl','raven'].includes(shape))wings(shape==='moth',shape==='bee'||shape==='moth');
  if(shape==='bee'){for(let i=0;i<3;i++)part(body,torus,ink,[0,1.3+i*.35,0],[.81,.68,.8],[Math.PI/2,0,0]);part(body,cone,cream,[0,.5,0],[.2,.65,.2],[Math.PI,0,0]);}
  if(['bee','moth','mantis'].includes(shape)){for(const s of [-1,1]){branch(head,dark,[s*.4,.6,0],[s*.7,1.3,0],.06);part(head,sphere,cream,[s*.7,1.3,0],[.16,.18,.16],[],true);}}
  if(shape==='stag'){for(const s of [-1,1]){branch(head,cream,[s*.55,.5,0],[s*.85,1.9,-.15],.12);for(let n=0;n<3;n++)branch(head,cream,[s*(.63+n*.08),.9+n*.33,-.05],[s*(1.15+n*.12),1.15+n*.36,0],.08);}}
  if(shape==='gecko'){for(let i=0;i<6;i++)part(body,cone,cream,[0,1+i*.33,-.55],[.25,.45,.29],[-.5,0,0]);}
  if(shape==='panda'){for(const s of [-1,1]){part(head,sphere,dark,[s*.75,.68,0],[.4,.4,.3]);part(head,torus,dark,[s*.4,.08,.68],[.35,.37,.3]);}}
  if(shape==='moth'){for(const s of [-1,1])part(body,sphere,color,[s*1.65,2.85,-.3],[.4,.55,.2],[],true);}
  if(shape==='pangolin'){for(let y=0;y<4;y++)for(let x=0;x<3;x++)part(body,cone,dark,[(x-1)*.52,1.1+y*.45,-.57],[.4,.65,.28],[Math.PI,0,0]);}
  if(shape==='owl'){for(const s of [-1,1])part(head,torus,cream,[s*.4,.08,.7],[.43,.47,.26]);ears();}
  if(shape==='raven'||shape==='owl')part(head,cone,'#f2c56a',[0,-.2,1],[.29,.6,.23],[Math.PI/2,0,0]);
  if(shape==='mantis'){torso.scale.x=.5;for(const a of arms)part(a,cone,cream,[0,-.7,.4],[.21,1.4,.5],[.5,0,-.6]);head.scale.y=.65;}
  if(shape==='ghostcat'){legs.forEach(l=>l.visible=false);tail(2);for(let i=0;i<4;i++)part(body,cone,color,[(i-1.5)*.35,.65,0],[.3,.9,.4],[Math.PI,0,0]);}
  if(shape==='rabbit')ears(true);
  if(shape==='golem'){for(const [x,y,z,sy] of [[0,4.2,0,1.4],[-.7,3.8,0,.9],[.7,3.8,0,.9],[-1.1,2.5,0,1],[1.1,2.5,0,1]])part(body,cone,cream,[x,y,z],[.44,sy,.4],[],true);part(body,sphere,cream,[0,1.9,.68],[.34,.46,.16],[],true);}
  if(shape==='otter'){for(const s of [-1,1]){part(head,sphere,dark,[s*.66,.66,0],[.27,.28,.22]);for(let i=0;i<3;i++)branch(head,cream,[s*.48,-.25,.95],[s*1.13,-.16-i*.14,.95],.025);}tail(1,true);}
  if(shape==='urchin'){head.position.y=2.1;torso.visible=false;legs.forEach(l=>l.visible=false);arms.forEach(l=>l.visible=false);head.scale.setScalar(1.32);for(let i=0;i<14;i++){const a=i*Math.PI*2/14;part(head,cone,cream,[Math.cos(a)*1.04,Math.sin(a)*1.04,-.1],[.22,.95,.26],[0,0,a-Math.PI/2],true);}}
  root.userData={spec,body,head,legs,arms,animated};return root;
}
export function animateCreature(root,pose,time,attack=null,hit=false,reduced=false){
  const {body,head,legs,arms,animated,spec}=root.userData,t=reduced?0:time/1000;
  const walking=pose==='walk',ko=pose==='ko',guard=pose==='guard';
  body.position.y=ko?.3:Math.sin(t*3)*.045+(spec.shape==='ghostcat'||spec.shape==='ray'? .2+Math.sin(t*3)*.12:0);
  body.rotation.z=ko?-1.35:guard?-.08:0;head.rotation.y=ko?0:Math.sin(t*.9)*.035;
  legs.forEach((leg,i)=>{leg.rotation.x=walking?Math.sin(t*11+i*Math.PI)*.48:0;});
  arms.forEach((arm,i)=>{arm.rotation.x=guard?-1.15:walking?Math.sin(t*11+i*Math.PI)*-.45:-.15;arm.rotation.z=i?-.12:.12;});
  if(attack){const wind=Math.sin(Math.min(1,attack.age/Math.max(1,attack.active))*Math.PI/2),recover=Math.max(0,1-Math.max(0,attack.age-attack.active)/(attack.duration-attack.active));arms[1].rotation.x=-1.65*wind*recover;arms[1].rotation.z=-.3;body.rotation.y=Math.sin(attack.age/attack.duration*Math.PI)*.25;if(['heavy','air','launcher','super'].includes(pose))legs[1].rotation.x=-.8*wind*recover;}else body.rotation.y=0;
  animated.forEach((g,i)=>{g.rotation.z=Math.sin(t*3+i)*.08;});
  root.scale.setScalar(hit?.82:.8);
}
