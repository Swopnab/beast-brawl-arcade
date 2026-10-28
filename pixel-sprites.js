// Four authored poses per fighter, packed into 96×96 native cells with 28 colors.
import {sprite as fallbackSprite} from './legacy-pixel-sprites.js?v=12';
export const CELL=96;
export const SPRITES=Object.freeze(Object.fromEntries([
 ['fighters-ember-tide',['ashfang','kilnback','reefclaw','inkveil']],
 ['fighters-volt-wild',['zipcat','boltstag','thornox','petalmoth']],
 ['fighters-void-frost',['hexeye','nullwyrm','glaciop','crysteel']]
].flatMap(([sheet,ids])=>ids.map((id,row)=>[id,Object.freeze({sheet,row})]))));
export const POSE_COLUMNS=Object.freeze({idle:0,walk:0,duck:0,deflect:0,ranged:1,heavy:1,moving:1,counter:1,launcher:1,rising:1,low:1,air:1,breaker:1,super:1,hit:2,ko:3});
const sheets=new Map(),frames=new Map();let loading;
export function loadSprites(){
 if(!loading)loading=Promise.all([...new Set(Object.values(SPRITES).map(s=>s.sheet))].map(sheet=>new Promise(resolve=>{
  const im=new Image();im.onload=()=>{sheets.set(sheet,im);resolve(true);};im.onerror=()=>resolve(false);im.src=new URL(`./assets/art/${sheet}.png?v=12`,import.meta.url).href;
 })));
 return loading;
}
export function spriteFrame(id,pose='idle',flash=false){
 const meta=SPRITES[id],image=sheets.get(meta?.sheet);if(!image)return null;
 const col=POSE_COLUMNS[pose]??0,key=`${id}-${col}-${flash}`;if(frames.has(key))return frames.get(key);
 const canvas=document.createElement('canvas');canvas.width=CELL;canvas.height=CELL;
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,col*CELL,meta.row*CELL,CELL,CELL,0,0,CELL,CELL);
 if(flash){c.globalCompositeOperation='source-atop';c.fillStyle='#fff6d9bb';c.fillRect(0,0,CELL,CELL);}
 frames.set(key,canvas);return canvas;
}
export function sprite(ctx,spec,x,ground,scale=1,{facing=1,pose='idle',frame=0,flash=false,motion=true}={}){
 const image=spriteFrame(spec.id,pose,flash);
 if(!image){fallbackSprite(ctx,spec,Math.round(x),Math.round(ground),Math.max(1,Math.round(scale*3)),{facing,pose,frame,flash});return;}
 const size=Math.max(1,Math.round(CELL*scale)),duck=pose==='duck',height=duck?Math.round(size*.65):size;
 const bob=motion&&['idle','walk'].includes(pose)?(Math.floor(frame/(pose==='walk'?6:32))%2)*Math.max(1,Math.round(scale)):0;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(ground)-bob);ctx.scale(facing,1);
 ctx.drawImage(image,-Math.round(size/2),-Math.round(height*90/CELL),size,height);ctx.restore();
}
