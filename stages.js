export const STAGES = Object.freeze([
  {id:'volcano',name:'Caldera Rift',type:'VOLCANIC',subtitle:'Where the ground fights back.',location:'THE OBSIDIAN RIDGE',accent:'#ff855b',sky:'#211a32',number:'01'},
  {id:'water',name:'Azure Falls',type:'WATER',subtitle:'Still waters. Restless rivals.',location:'THE CELESTIAL COAST',accent:'#70e1ed',sky:'#102b44',number:'02'},
  {id:'rain',name:'Rainline City',type:'RAIN',subtitle:'Every storm needs a showdown.',location:'THE MIDNIGHT DISTRICT',accent:'#b1a0ff',sky:'#171b39',number:'03'},
  {id:'desert',name:'Sunscorch Dunes',type:'SUNNY DESERT',subtitle:'High noon. Higher stakes.',location:'THE AMBER FRONTIER',accent:'#ffd080',sky:'#d78a62',number:'04'},
  {id:'jungle',name:'Verdant Ruins',type:'JUNGLE',subtitle:'The wild has a new champion.',location:'THE FORGOTTEN CANOPY',accent:'#b4e58c',sky:'#173b3e',number:'05'}
]);
export const getStage=id=>STAGES.find(s=>s.id===id)||STAGES[0];
const caches=new Map();
function polygon(c,color,points){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function gradient(c,stops,y1=0,y2=900){const g=c.createLinearGradient(0,y1,0,y2);stops.forEach(([at,color])=>g.addColorStop(at,color));c.fillStyle=g;c.fillRect(0,0,1600,900);}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function moon(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
function rect(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(x,y,w,h);}
function mountain(c,color,x,base,width,height){polygon(c,color,[[x-width*.6,base],[x-width*.27,base-height*.52],[x-width*.16,base-height*.45],[x,base-height],[x+width*.14,base-height*.83],[x+width*.26,base-height*.4],[x+width*.6,base]]);}
function rock(c,x,y,w,h,base,edge){polygon(c,base,[[x-w/2,y],[x-w*.45,y-h*.55],[x-w*.16,y-h],[x+w*.26,y-h*.88],[x+w*.5,y-h*.38],[x+w*.42,y]]);polygon(c,edge,[[x-w*.16,y-h],[x+w*.26,y-h*.88],[x+w*.1,y-h*.3],[x-w*.09,y-h*.15]]);}
function palm(c,x,y,scale,color){c.save();c.translate(x,y);c.scale(scale,scale);polygon(c,color,[[-7,0],[-4,-190],[8,-260],[17,-264],[7,-182],[10,0]]);for(let i=0;i<8;i++){const a=(i-3.5)*.45;const dx=Math.sin(a)*180,dy=-Math.cos(a)*80;polygon(c,color,[[12,-259],[12+dx*.65,-280+dy*.6],[12+dx,-245+dy],[12+dx*.6,-256+dy*.25]]);}c.restore();}
function volcano(c){
  gradient(c,[[0,'#151b32'],[.42,'#775561'],[.75,'#df8c65'],[1,'#211c2d']]);
  glow(c,850,410,540,'#ff9c6744');moon(c,1210,167,55,'#f8c9a688');
  for(let i=0;i<5;i++)mountain(c,i%2?'#685166':'#54475e',i*440,580,520,230+i%3*60);
  mountain(c,'#3b344d',820,655,1000,480);
  polygon(c,'#24273c',[[260,650],[628,273],[738,172],[803,195],[850,164],[985,285],[1390,650]]);
  polygon(c,'#8b4c52',[[738,172],[803,195],[850,164],[985,285],[883,290],[813,230],[722,247],[628,273]]);
  polygon(c,'#ffba76',[[735,190],[799,211],[850,185],[877,225],[822,238],[760,223],[699,242]]);
  glow(c,800,240,220,'#ff99555a');
  for(let i=0;i<5;i++){const x=790+(i-2)*31;polygon(c,i%2?'#fca269':'#e3654d',[[x,220],[x+45,350],[x+27,418],[x+95,558],[x+100,650],[x+115,650],[x+110,550],[x+50,411],[x+61,348],[x+8,220]]);}
  // Angular ash clouds, ruins, and a warm river of lava.
  for(let i=0;i<7;i++){c.globalAlpha=.12+i*.025;moon(c,800+i*25,123-i*23,62+i*10,'#15192b');}c.globalAlpha=1;
  polygon(c,'#3e2d40',[[0,610],[210,550],[480,614],[755,566],[1030,605],[1400,530],[1600,585],[1600,900],[0,900]]);
  polygon(c,'#ec7c55',[[720,620],[873,610],[984,675],[1220,723],[1390,900],[1000,900],[900,748],[767,701],[602,670]]);
  polygon(c,'#ffd08b',[[780,633],[850,628],[927,681],[1158,739],[1250,900],[1150,900],[1060,768],[892,716],[742,677]]);
  glow(c,1000,770,330,'#ff9d5344');
  for(let i=0;i<11;i++)rock(c,(i*173+80)%1700,780+(i%3)*58,130+i%4*27,90+i%3*50,'#292637','#6f4145');
  rect(c,'#5a3a47',120,470,38,218);rect(c,'#b27365',128,472,8,204);rect(c,'#5a3a47',200,505,29,173);rect(c,'#2a263a',104,463,72,16);
  foreground(c,'#292536','#bd7059');
  for(let i=0;i<8;i++){const x=100+i*190;polygon(c,'#f7985f',[[x,810],[x+45,794],[x+70,811],[x+123,793],[x+60,823]]);}
}
function water(c){
  gradient(c,[[0,'#142d4b'],[.4,'#4c87a1'],[.73,'#b1d9cd'],[1,'#143743']]);moon(c,1180,150,66,'#e9f3d0');glow(c,1170,160,280,'#e7f8df33');
  mountain(c,'#387287',230,560,760,310);mountain(c,'#4a8a96',1200,580,900,385);mountain(c,'#27566e',720,590,680,350);
  polygon(c,'#163b50',[[0,350],[230,285],[466,354],[528,500],[450,654],[0,690]]);polygon(c,'#274c5a',[[1180,300],[1400,234],[1600,292],[1600,700],[1118,634]]);
  // Waterfalls drawn in layers of pale ribbons and mist.
  [[235,342,130,310],[1240,320,165,340],[930,432,95,190]].forEach(([x,y,w,h])=>{
    rect(c,'#82d5d7',x,y,w,h);rect(c,'#c4efdd',x+10,y,w*.48,h);rect(c,'#f1f8e0',x+w*.23,y,w*.17,h);rect(c,'#4aa4b6',x+w*.78,y,w*.15,h);
    for(let i=0;i<9;i++)rect(c,'#edf9e34d',x+((i*29)%w),y+((i*43)%h),3,85);
    glow(c,x+w*.5,y+h,100,'#d4fff481');
  });
  rect(c,'#2f7d91',0,630,1600,150);
  for(let i=0;i<45;i++){const x=(i*197)%1600,y=640+i%8*15;rect(c,i%4?'#8fe2db55':'#d6f8e699',x,y,40+i%7*16,2);}
  rock(c,290,720,390,100,'#315c63','#6b9c96');rock(c,1350,730,450,122,'#254b58','#70a7a1');
  for(let i=0;i<7;i++){moon(c,150+i*205,660+(i%3)*14,55,'#c6f8e317');}
  palm(c,70,720,1.4,'#173d4a');palm(c,1490,750,1.05,'#153b46');foreground(c,'#294751','#6faba7');
  for(let i=0;i<14;i++){const x=i*123;rect(c,'#7dd9d344',x,796+i%3*24,60,2);}
}
function rain(c){
  gradient(c,[[0,'#12172e'],[.45,'#394569'],[.8,'#577588'],[1,'#151a34']]);moon(c,1160,145,48,'#c5cbd366');glow(c,1050,400,400,'#8865ef25');
  for(let i=0;i<27;i++){const x=i*67-60,h=110+(i*47)%280;rect(c,i%2?'#25334e':'#283b55',x,570-h,61,h);for(let row=0;row<h/18;row++)for(let col=0;col<3;col++)if((i+col+row)%4)rect(c,(i+col)%3?'#86b8c944':'#d4b2f466',x+9+col*16,580-h+row*18,5,8);}
  rect(c,'#17243c',0,507,1600,213);rect(c,'#596d82',0,512,1600,5);
  for(let i=0;i<17;i++){rect(c,'#111a30',i*105,548,96,31);rect(c,'#617e9555',i*105+7,552,82,20);}
  rect(c,'#172035',0,594,1600,126);rect(c,'#63768d',0,591,1600,4);
  rect(c,'#26314a',75,490,285,222);rect(c,'#151c32',104,576,82,136);rect(c,'#415977',202,575,126,89);
  rect(c,'#15182d',105,457,204,57);rect(c,'#c498e8',105,457,204,3);c.font='bold 29px monospace';c.fillStyle='#d6b5ff';c.textAlign='center';c.fillText('AFTER HOURS',207,496,180);
  rect(c,'#2a2944',1230,435,225,280);rect(c,'#aa80d3',1262,406,48,128);c.save();c.translate(1290,430);c.rotate(Math.PI/2);c.font='bold 21px monospace';c.fillStyle='#22243d';c.fillText('NIGHT',39,7);c.restore();
  for(let i=0;i<7;i++){rect(c,'#182138',1316,450+i*31,120,20);rect(c,'#7a91a755',1323,455+i*31,100,10);}
  // Wires and street lights frame a wet open fighting platform.
  c.strokeStyle='#151b2e';c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(0,320+i*25);c.quadraticCurveTo(800,490+i*20,1600,290+i*30);c.stroke();}
  [[455,440],[1110,393]].forEach(([x,y])=>{rect(c,'#141a30',x,y,9,287);rect(c,'#172039',x-38,y,48,10);rect(c,'#e3caa4',x-37,y+10,35,5);glow(c,x-20,y+25,95,'#edbf8b27');});
  foreground(c,'#1e2c43','#6f8799');
  for(let i=0;i<30;i++){const x=(i*137)%1600,y=745+i%5*27;rect(c,i%2?'#a591cc44':'#75c8d144',x,y,45+i%4*35,2);}
  for(let i=0;i<140;i++)rect(c,'#c9dcf61a',(i*179)%1600,(i*97)%900,1,18+i%5*4);
}
function desert(c){
  gradient(c,[[0,'#d99370'],[.4,'#f0ba83'],[.72,'#f6d29a'],[1,'#8a5a4c']]);glow(c,1100,180,330,'#ffe6af99');moon(c,1100,180,95,'#ffe2a3');
  mountain(c,'#c69574',150,580,800,280);mountain(c,'#d4a37a',1180,550,900,300);
  polygon(c,'#ba7a5c',[[0,540],[340,398],[425,399],[425,470],[520,470],[520,590],[0,690]]);
  polygon(c,'#a86a56',[[1230,600],[1230,440],[1320,440],[1320,360],[1465,360],[1465,510],[1600,535],[1600,700]]);
  c.fillStyle='#d7a577';c.beginPath();c.moveTo(0,620);c.bezierCurveTo(400,440,620,690,1000,574);c.bezierCurveTo(1250,450,1450,535,1600,610);c.lineTo(1600,900);c.lineTo(0,900);c.fill();
  c.fillStyle='#bd835f';c.beginPath();c.moveTo(0,730);c.bezierCurveTo(330,580,540,620,815,715);c.bezierCurveTo(1100,810,1320,590,1600,650);c.lineTo(1600,900);c.lineTo(0,900);c.fill();
  // Sun-bleached columns and a broken stone gate.
  for(const [x,h]of [[244,230],[365,183],[1230,285]]){rect(c,'#94634e',x,715-h,51,h);rect(c,'#e0b080',x+7,715-h+8,15,h-8);rect(c,'#a97253',x-12,706-h,76,16);rect(c,'#754c44',x-15,700,81,15);}
  polygon(c,'#9d6b52',[[238,481],[419,520],[413,542],[242,508]]);
  for(const [x,h]of [[100,100],[1450,140]]){rect(c,'#5c6d52',x,720-h,17,h);rect(c,'#657b55',x-22,750-h,24,16);rect(c,'#657b55',x-24,720-h,11,40);rect(c,'#657b55',x+14,740-h,30,12);rect(c,'#657b55',x+34,710-h,10,39);}
  foreground(c,'#9a6b53','#e2b37f');
  for(let i=0;i<23;i++){const x=(i*191)%1600,y=735+i%6*25;rect(c,'#edc58e55',x,y,30+i%5*17,2);}
  for(let i=0;i<11;i++)rock(c,i*162,770+i%3*40,45+i%4*15,24+i%3*13,'#8c604d','#bf8962');
}
function jungle(c){
  gradient(c,[[0,'#12333a'],[.4,'#426d63'],[.7,'#a0b58c'],[1,'#163c3b']]);glow(c,800,230,350,'#e9e8b84a');
  for(let i=0;i<10;i++){const x=i*190-40;rect(c,'#2a5754',x,110,23,620);polygon(c,'#365f56',[[x-150,190],[x,30+i%3*50],[x+180,180],[x+140,290],[x-110,300]]);}
  // Distant temple, vine-covered stone and hanging canopy.
  for(let i=0;i<5;i++)rect(c,i%2?'#638172':'#547567',640+i*26,428-i*30,320-i*52,263+i*30);
  rect(c,'#314f49',757,443,71,201);rect(c,'#bac19255',702,365,178,6);
  for(let i=0;i<6;i++){rect(c,'#4b6d5b',410+i*130,591,75,124);rect(c,'#8da284',415+i*130,594,8,116);rect(c,'#7b976f',398+i*130,581,100,18);}
  rock(c,1130,740,260,160,'#3a6053','#7b9270');rock(c,440,752,240,115,'#375b4e','#6c8b69');
  for(let i=0;i<14;i++){const x=(i*217)%1600;polygon(c,'#193d3d',[[x-25,735],[x-47,333],[x-20,110],[x+38,80],[x+20,340],[x+47,735]]);}
  for(let i=0;i<17;i++){const x=(i*129)%1700-50;moon(c,x,40+i%3*45,150+i%5*12,i%2?'#173f3a':'#1b473d');}
  c.strokeStyle='#638164';c.lineWidth=6;for(let i=0;i<9;i++){const x=i*187;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+90,250,x+35,430+i%3*80);c.stroke();}
  for(let i=0;i<25;i++){const x=(i*173)%1600;polygon(c,i%2?'#2d5b43':'#3c7050',[[x,738],[x-53,662],[x-9,693],[x-13,635],[x+15,690],[x+65,654],[x+33,723]]);}
  foreground(c,'#304d40','#85996c');
  for(let i=0;i<17;i++){const x=i*105;polygon(c,'#4b6950',[[x,823],[x+80,816],[x+75,900],[x-9,900]]);}
}
function foreground(c,base,edge){polygon(c,base,[[0,726],[180,710],[415,729],[670,715],[950,724],[1230,707],[1600,724],[1600,900],[0,900]]);c.strokeStyle=edge;c.lineWidth=3;c.beginPath();c.moveTo(0,727);for(let i=1;i<=16;i++)c.lineTo(i*100,719+Math.sin(i*1.8)*8);c.stroke();for(let i=0;i<16;i++){const x=i*110;c.strokeStyle='#101c272e';c.lineWidth=2;c.beginPath();c.moveTo(x,741+i%3*12);c.lineTo(x+38,781+i%2*19);c.lineTo(x+13,819);c.stroke();}}
function scene(id){if(caches.has(id))return caches.get(id);const canvas=Object.assign(document.createElement('canvas'),{width:1600,height:900}),c=canvas.getContext('2d');({volcano,water,rain,desert,jungle}[getStage(id).id])(c);caches.set(id,canvas);return canvas;}
export function drawStage(ctx,id,width,height,time=0,motion=true){
  const stage=getStage(id),scale=Math.max(width/1600,height/900),ox=(width-1600*scale)/2,oy=(height-900*scale)/2;
  ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.drawImage(scene(stage.id),0,0);
  if(motion&&stage.id==='rain'){ctx.strokeStyle='#d0e2ff38';ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<85;i++){const x=(i*199-time*.035)%1700,y=(i*127+time*.55)%980-60;ctx.moveTo(x,y);ctx.lineTo(x-9,y+37);}ctx.stroke();}
  if(motion&&stage.id==='volcano'){for(let i=0;i<34;i++){const x=(i*193+Math.sin(time/1500+i)*32)%1600,y=900-(i*89+time*.045)%1000;ctx.fillStyle=i%3?'#ffb17888':'#ffe3a0bb';ctx.fillRect(x,y,2+i%3,2+i%3);}}
  if(motion&&stage.id==='water'){ctx.strokeStyle='#b8fff34d';ctx.lineWidth=2;for(let i=0;i<14;i++){const x=(i*137+time*.023)%1600;ctx.beginPath();ctx.ellipse(x,660+i%3*18,25+(time/70+i*5)%32,3,0,0,Math.PI*2);ctx.stroke();}}
  if(motion&&stage.id==='jungle'){for(let i=0;i<25;i++){const x=(i*173+Math.sin(time/2100+i)*18)%1600,y=220+(i*83)%510+Math.cos(time/1300+i)*12;ctx.fillStyle=`rgba(220,244,143,${.25+Math.sin(time/900+i)*.2})`;ctx.fillRect(x,y,3,3);}}
  if(motion&&stage.id==='desert'){ctx.strokeStyle='#f5d5a34a';ctx.lineWidth=1;for(let i=0;i<12;i++){const x=(i*183+time*.05)%1700;ctx.beginPath();ctx.moveTo(x,635+i%4*31);ctx.lineTo(x+50,633+i%4*31);ctx.stroke();}}
  ctx.restore();
}
