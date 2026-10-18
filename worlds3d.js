import * as T from './vendor/three.module.js';
import {WORLD_PALETTES} from './scene-data.js?v=8';
const box=new T.BoxGeometry(1,1,1),rock=new T.DodecahedronGeometry(1,0),cone=new T.ConeGeometry(1,1,7),cylinder=new T.CylinderGeometry(1,1,1,12),ball=new T.SphereGeometry(1,16,10);
export function makeWorld(id){
  const p=WORLD_PALETTES[id]||WORLD_PALETTES.volcano,scene=new T.Scene();scene.background=new T.Color(p.sky);scene.fog=new T.Fog(p.fog,45,145);
  const env=new T.Group(),motion=[],materials=new Map();scene.add(env);
  function material(color,glow=false,opacity=1){const k=`${color}/${glow}/${opacity}`;if(!materials.has(k))materials.set(k,new T.MeshStandardMaterial({color,roughness:id==='rain'?.26:.86,metalness:id==='rain'?.22:.02,flatShading:true,emissive:color,emissiveIntensity:glow?1.5:0,transparent:opacity<1,opacity}));return materials.get(k);}
  function mesh(geo,color,x,y,z,sx,sy,sz,glow=false){const m=new T.Mesh(geo,material(color,glow));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=!glow;m.receiveShadow=!glow;env.add(m);return m;}
  function block(color,x,y,z,sx,sy,sz,glow=false){return mesh(box,color,x,y,z,sx,sy,sz,glow);}
  const hemi=new T.HemisphereLight(p.light,0x252033,2.1);scene.add(hemi);
  const sun=new T.DirectionalLight(p.light,3.1);sun.position.set(-14,25,18);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-16;sun.shadow.normalBias=.06;scene.add(sun);
  const rim=new T.DirectionalLight(p.accent,2.1);rim.position.set(8,8,-12);scene.add(rim);
  block(p.ground,0,-1.2,-10,180,2,160);
  // A real raised fighting platform gives the camera visible depth and contact shadows.
  block(id==='desert'?0xb88150:id==='water'?0x617981:0x313542,0,-.46,0,32,.9,9);
  block(id==='desert'?0xe4bb7a:0x758084,0,-.02,0,31.8,.14,8.8);
  for(let x=-15;x<=15;x+=3)block(id==='desert'?0xc79762:0x57606c,x,.06,0,.025,.012,8.6);
  for(const z of [-3.7,3.7])block(p.accent,0,.065,z,30,.025,.05,true);
  const ring=new T.Mesh(new T.RingGeometry(3.7,3.75,64),new T.MeshBasicMaterial({color:p.accent,transparent:true,opacity:.45,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.075;env.add(ring);
  function stones(color,count,zmin=-15){for(let i=0;i<count;i++){const x=Math.sin(i*13.1)*42,z=zmin-Math.abs(Math.cos(i*2.32))*45,r=1+(i%5)*.8;const m=mesh(rock,color,x,r*.4-1,z,r,r*.8,r);m.rotation.set(i*.2,i*.5,.3);}}
  function columns(color,x,z,h=8){block(color,x,h/2-1,z,1.15,h,1.15);block(color,x,-.45,z,2,.6,2);block(color,x,h-1,z,1.8,.65,1.8);}
  if(id==='volcano'){
    stones(0x33313b,28);
    const mountain=mesh(new T.CylinderGeometry(4.8,19,23,12,1,true),0x423941,-4,10.5,-36,1,1,1);mountain.rotation.y=.15;
    const rim=mesh(new T.TorusGeometry(4.8,.65,7,18),0x322e38,-4,22,-36,1,1,1);rim.rotation.x=Math.PI/2;
    const crater=mesh(cylinder,0xff632b,-4,21.8,-36,4.35,.25,4.35,true);
    for(let i=0;i<6;i++){const a=-1.15+i*.4,points=[];for(let k=0;k<7;k++){const y=21.8-k*3.4,r=5+(21.8-y)*.62;points.push(new T.Vector3(-4+Math.sin(a+Math.sin(k+i)*.035)*r,y,-36+Math.cos(a)*r));}const path=new T.CatmullRomCurve3(points);mesh(new T.TubeGeometry(path,30,.16+i%2*.09,6,false),i%2?0xff6d2b:0xffb13f,0,0,0,1,1,1,true);}
    for(let i=0;i<7;i++){const cloud=mesh(rock,0x55464d,-4+Math.sin(i)*2,24+i*1.9,-36,2+i*.35,1+i*.3,2);cloud.material=material(0x55464d,false,.3);motion.push({mesh:cloud,kind:'smoke',seed:i});}
    block(0xfd5526,1,-.23,-14,70,.15,5,true);block(0xffaf45,-2,-.18,-14,65,.05,.6,true);
    for(const x of [-20,20])columns(0x3c3746,x,-10,11);
    const glow=new T.PointLight(0xff6822,85,50);glow.position.set(0,2,-11);scene.add(glow);
    for(let i=0;i<22;i++){const m=mesh(ball,0xffb66a,Math.sin(i*19)*24,2+i%9,-8-Math.cos(i*3)*15,.06,.06,.06,true);motion.push({mesh:m,kind:'ember',seed:i});}
    motion.push({mesh:crater,kind:'glow',seed:1});
  }else if(id==='water'){
    block(0x328c9e,0,-.55,-27,130,.1,95);
    for(const x of [-14,14]){mesh(rock,0x577e86,x,6,-25,7,15,6);mesh(rock,0x739a92,x,12,-25,8,5,7);const falls=mesh(box,0xa9f0f0,x,5.2,-18.7,4.5,14,.22,true);falls.material=material(0xa5e8ee,false,.65);motion.push({mesh:falls,kind:'waterfall',seed:x});}
    for(const x of [-14,14])for(let i=0;i<12;i++){const foam=mesh(ball,0xd1fdff,x+Math.sin(i*4)*2,-.2,-18.4+Math.cos(i)*1.2,.3,.09,.3);foam.material=material(0xd1fdff,false,.55);motion.push({mesh:foam,kind:'foam',seed:i});}
    for(let i=0;i<20;i++){const line=block(0x90e5e9,Math.sin(i*9)*38,-.34,-7-i*2,5+i%7,.025,.06);motion.push({mesh:line,kind:'ripple',seed:i});}
    for(const x of [-18,18]){columns(0xb9ccbc,x,-5,7);block(0x9bbca8,x,7,-5,4,.6,3);}
    mesh(ball,0xffefbe,17,24,-55,4.5,4.5,4.5,true);stones(0x699b9b,12,-28);
  }else if(id==='rain'){
    for(let i=0;i<24;i++){const x=(i-12)*5,h=7+(i*7%16),z=-24-(i%3)*9;block(0x26354d,x,h/2-1,z,4,h,4);for(let row=0;row<h-2;row+=2)for(let col=0;col<2;col++){if((i+row+col)%3!==0)block(i%2?0x708eae:0xa389b5,x-1+col*2,row+1,z+2.03,.55,.7,.03,true);}}
    for(const x of [-20,20]){block(0x23314b,x,3,-8,9,8,7);block(x<0?0xbd82ed:0x7ad4ec,x,5.1,-4.4,6,1.2,.2,true);for(let j=0;j<5;j++)block(0x182237,x-3+j*1.5,2,-4.3,.6,2.6,.2);}
    block(0x303d53,0,5,-18,70,.7,2);for(let i=-30;i<35;i+=10)block(0x334055,i,1,-18,.7,8,.8);
    const train=block(0x465572,-10,6.5,-18,19,2.2,2.8);motion.push({mesh:train,kind:'train',seed:0});
    const vertices=[];for(let i=0;i<650;i++){const x=Math.sin(i*12.34)*45,y=(i*1.733)%25,z=Math.cos(i*7.7)*40;vertices.push(x,y,z,x-.1,y-.75,z);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));const rain=new T.LineSegments(geo,new T.LineBasicMaterial({color:0xa8c9e5,transparent:true,opacity:.33}));scene.add(rain);motion.push({mesh:rain,kind:'rain',seed:0});
    for(let i=0;i<12;i++){const m=block(i%2?0xb79aff:0x73d6e9,Math.sin(i*4)*18,.085,-3+i*.5,1,.01,.23);m.material=material(i%2?0xb79aff:0x73d6e9,false,.2);}
  }else if(id==='desert'){
    mesh(ball,0xffefac,-19,27,-58,6,6,6,true);
    for(let i=0;i<9;i++){const x=(i-4)*17,h=6+i%4*3;block(0xa86f50,x,h/2-1,-36-i%3*7,12,h,11);block(0xc88e60,x,h-1,-36-i%3*7,14,2,12);}
    for(let i=0;i<10;i++){const dune=mesh(ball,0xd3a166,Math.sin(i*6)*48,-2,-14-i*6,14,5+i%4,12);dune.rotation.z=.12;}
    for(const x of [-18,18]){columns(0xdfb77d,x,-6,9);block(0xe7c38a,x,7,-6,2.3,.3,2.3);}
    for(const x of [-26,23]){block(0x50634a,x,1.5,-12,.6,5,.65);block(0x50634a,x+1.2,1.7,-12,2.3,.5,.55);block(0x50634a,x+2.1,2.3,-12,.5,1.5,.5);}
    stones(0xb98658,12,-24);
  }else{
    for(let i=0;i<5;i++)block(0x64735a,0,i*.7-.5,-20,15-i*2,.7,12-i*1.5);
    block(0x566952,0,6,-21,7,7,6);block(0x344f44,0,5,-17.9,2.4,4,.2);block(0x9ba87c,0,9.8,-21,10,.8,8);
    for(const x of [-18,18])columns(0x7d8e6b,x,-7,10);
    for(let i=0;i<22;i++){const x=Math.sin(i*13.5)*49,z=-10-Math.abs(Math.cos(i*4))*44,h=12+i%6*2;mesh(cylinder,0x30483e,x,h/2-1,z,.8+i%3*.2,h,.8);for(let j=0;j<3;j++)mesh(rock,j%2?0x3e6953:0x53805a,x+(j-1)*2,h-1+j%2,z,6,4,6);}
    stones(0x637d59,20,-13);
    for(let i=0;i<30;i++){const m=mesh(ball,0xd0f594,Math.sin(i*12)*27,1+i%6,-3-Math.abs(Math.cos(i*9))*20,.045,.045,.045,true);motion.push({mesh:m,kind:'firefly',seed:i});}
    for(let i=0;i<12;i++){const x=(i-6)*4;mesh(cone,0x547c4f,x,.8,-7-Math.abs(Math.sin(i))*6,1.5,3,.8);}
  }
  for(const x of [-16.5,16.5]){block(id==='desert'?0xcba269:0x52625d,x,1.3,4.5,1.2,2.8,1.2);block(p.accent,x,2.75,4.5,1.4,.13,1.4,true);}
  const fighters=new T.Group();scene.add(fighters);const fx=new T.Group();scene.add(fx);
  return {scene,fighters,fx,ring,palette:p,animate(time,reduced){const t=reduced?0:time/1000;for(const item of motion){const {mesh:m,kind,seed}=item;if(kind==='smoke'){m.position.x=-4+Math.sin(t*.3+seed)*2;m.position.y=24+seed*1.9+Math.sin(t*.4+seed)*.6;}if(kind==='foam'){m.scale.setScalar(.25+Math.sin(t*3+seed)*.1);}if(kind==='rain')m.position.y=-(t*12)%5;if(kind==='train')m.position.x=(t*3)%100-50;if(kind==='ripple')m.position.x=Math.sin(t*.6+seed)*2+Math.sin(seed*9)*38;if(kind==='ember')m.position.y=(t*(1+seed%3)+seed)%13;if(kind==='firefly'){m.position.y=2+seed%6+Math.sin(t+seed)*.6;m.material.emissiveIntensity=.7+Math.sin(t*2+seed)*.6;}if(kind==='waterfall')m.scale.x=4.5+Math.sin(t*3)*.1;}},dispose(){scene.traverse(o=>{if(o.geometry&&!([box,rock,cone,cylinder,ball].includes(o.geometry)))o.geometry.dispose();});materials.forEach(m=>m.dispose());}}
}
