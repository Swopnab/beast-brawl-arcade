// Build the game's fixed-resolution atlases from the original generated source art.
// Uses the existing browser-test runtime; no image library or online service.
const {chromium}=require('playwright'),{serve}=require('../tests/server.cjs');
const fs=require('node:fs/promises'),path=require('node:path');
(async()=>{const root=path.resolve(__dirname,'..'),server=await serve(root),browser=await chromium.launch();try{
 const p=await browser.newPage();await p.goto(server.url);
 for(const name of ['fighters-ember-tide','fighters-volt-wild','fighters-void-frost']){
  const result=await p.evaluate(async name=>{
   const image=new Image();image.src=`assets/art/source/${name}.png`;await image.decode();
   const source=document.createElement('canvas');source.width=image.width;source.height=image.height;const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(image,0,0);
   const pixels=sc.getImageData(0,0,source.width,source.height).data,frames=[];
   for(let row=0;row<4;row++){
    const cells=[];
    for(let col=0;col<4;col++){
     const x0=Math.round(col*image.width/4),x1=Math.round((col+1)*image.width/4),y0=Math.round(row*image.height/4),y1=Math.round((row+1)*image.height/4);
     let l=x1,t=y1,r=x0,b=y0;
     for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(pixels[(y*image.width+x)*4+3]<170)continue;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
     if(r<=l||b<=t)throw Error(`Empty frame ${name} ${row} ${col}`);
     cells.push({l,t,w:r-l+1,h:b-t+1});
    }
    const factor=Math.min(82/Math.max(...cells.slice(0,3).map(c=>c.h)),92/Math.max(...cells.map(c=>c.w)));
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=96;const c=canvas.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;
    cells.forEach((box,col)=>{const w=Math.round(box.w*factor),h=Math.round(box.h*factor);c.drawImage(image,box.l,box.t,box.w,box.h,col*96+Math.round((96-w)/2),90-h,w,h);});
    const data=c.getImageData(0,0,384,96),hist=new Map();
    for(let i=0;i<data.data.length;i+=4){if(data.data[i+3]<170){data.data[i+3]=0;continue;}data.data[i+3]=255;const rgb=[data.data[i]>>3,data.data[i+1]>>3,data.data[i+2]>>3],key=rgb.join();if(!hist.has(key))hist.set(key,{rgb:rgb.map(v=>v*8+4),n:0});hist.get(key).n++;}
    // Weighted median cut creates one shared 28-color palette for this fighter's four poses.
    const boxes=[[...hist.values()]];
    while(boxes.length<28){let best=-1,score=-1,channel=0;for(let k=0;k<boxes.length;k++){const box=boxes[k];if(box.length<2)continue;for(let ch=0;ch<3;ch++){const range=Math.max(...box.map(p=>p.rgb[ch]))-Math.min(...box.map(p=>p.rgb[ch])),s=range*Math.sqrt(box.reduce((n,p)=>n+p.n,0));if(s>score){score=s;best=k;channel=ch;}}}if(best<0)break;const box=boxes.splice(best,1)[0].sort((a,b)=>a.rgb[channel]-b.rgb[channel]),half=box.reduce((n,p)=>n+p.n,0)/2;let n=0,split=1;for(let j=0;j<box.length-1;j++){n+=box[j].n;if(n>=half){split=j+1;break;}}boxes.push(box.slice(0,split),box.slice(split));}
    const palette=boxes.map(box=>{const n=box.reduce((s,p)=>s+p.n,0);return [0,1,2].map(ch=>Math.round(box.reduce((s,p)=>s+p.rgb[ch]*p.n,0)/n));});
    const lookup=new Map();for(let i=0;i<data.data.length;i+=4){if(!data.data[i+3])continue;const key=[data.data[i]>>3,data.data[i+1]>>3,data.data[i+2]>>3].join();let rgb=lookup.get(key);if(!rgb){rgb=palette.reduce((best,p)=>{const dist=q=>q.reduce((n,v,ch)=>n+(v-data.data[i+ch])**2,0);return dist(p)<dist(best)?p:best;},palette[0]);lookup.set(key,rgb);}data.data[i]=rgb[0];data.data[i+1]=rgb[1];data.data[i+2]=rgb[2];}
    c.putImageData(data,0,0);frames.push(canvas.toDataURL('image/png'));
   }
   const output=document.createElement('canvas');output.width=384;output.height=384;const out=output.getContext('2d');for(let r=0;r<4;r++){const im=new Image();im.src=frames[r];await im.decode();out.drawImage(im,0,r*96);}
   return output.toDataURL('image/png');
  },name);
  const target=path.join(root,'assets/art',name+'.png');await fs.writeFile(target,Buffer.from(result.split(',')[1],'base64'));console.log('Packed',name);
 }
 const hero=await p.evaluate(async()=>{const im=new Image();im.src='assets/art/source/title-key-art.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);return c.toDataURL('image/webp',.88);});
 await fs.writeFile(path.join(root,'assets/art/title-key-art.webp'),Buffer.from(hero.split(',')[1],'base64'));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
