// Layered, textured side-view environments on an integer pixel grid.
const P={
 jungle:{sky:'#9cc6ae',mist:'#74a59a',far:'#346967',deep:'#193f48',bark:['#263e3f','#3c5145','#655e45','#9a8b60'],leaf:['#173f42','#245c50','#397957','#65a466','#9bc073'],ground:['#62604b','#77705a','#9a8d66','#c4ae7d'],grass:'#89b565'},
 water:{sky:'#a5ccd0',mist:'#7aabb5',far:'#4d7d94',deep:'#285568',bark:['#2a4a55','#426a6a','#62847a','#91aa8a'],leaf:['#22525c','#376f6c','#559283','#7aae95','#afd2ae'],ground:['#435d63','#668080','#899b8d','#bec3a5'],grass:'#8ac7aa'},
 volcano:{sky:'#51374d',mist:'#7e4c61',far:'#6a4053',deep:'#342b43',bark:['#322b40','#4c3747','#6c4a51','#a06b61'],leaf:['#302d40','#4d3b4b','#6e4c54','#956760','#b5866d'],ground:['#302c3e','#423748','#624750','#8c655e'],grass:'#d17d58'},
 desert:{sky:'#e6c995',mist:'#d5a77e',far:'#ba8a71',deep:'#92646a',bark:['#6a514e','#8e6a59','#ba8a69','#e0b58a'],leaf:['#385d53','#56795a','#799560','#a4af79','#c8c78f'],ground:['#997459','#b78e67','#cfaa79','#edce98'],grass:'#b3b67d'},
 rain:{sky:'#252b49',mist:'#3b4c66',far:'#334058',deep:'#202d43',bark:['#20293e','#38435a','#546075','#7a8797'],leaf:['#1a3541','#294d54','#3f6a67','#628b7b','#8eac91'],ground:['#293346','#3c4a5b','#596779','#7a8793'],grass:'#789e94'}
};
export function pixelRect(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
const hash=(x,y,seed=0)=>{let n=Math.imul(x+seed*137,374761393)^Math.imul(y+31,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0;};
function poly(c,color,points){
 const min=Math.ceil(Math.min(...points.map(p=>p[1]))),max=Math.floor(Math.max(...points.map(p=>p[1])));
 for(let y=min;y<=max;y++){const hits=[];for(let i=0;i<points.length;i++){const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))hits.push(x1+(y-y1)*(x2-x1)/(y2-y1));}hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2)pixelRect(c,color,Math.ceil(hits[i]),y,Math.floor(hits[i+1])-Math.ceil(hits[i])+1,1);}
}
function blob(c,color,x,y,rx,ry){for(let yy=-ry;yy<=ry;yy++){const half=Math.floor(rx*Math.sqrt(1-(yy*yy)/(ry*ry)));pixelRect(c,color,x-half,y+yy,half*2+1,1);}}
function leaves(c,x,y,r,p,seed){
 blob(c,p[0],x,y,r,Math.round(r*.58));
 for(let i=0;i<r*2;i++){const dx=hash(i,1,seed)%(r*2)-r,dy=hash(i,2,seed)%Math.max(2,Math.round(r*.9))-r*.5;if(dx*dx/r**2+dy*dy/(r*.6)**2>1)continue;const col=p[1+hash(i,3,seed)%3];pixelRect(c,col,x+dx,y+dy,4+hash(i,4,seed)%8,2+hash(i,5,seed)%4);if(i%3===0)pixelRect(c,p[4],x+dx,y+dy,3,1);}
}
function tree(c,x,ground,height,p,seed,front=false){
 const width=front?23:13,top=ground-height;
 poly(c,p.bark[0],[[x-width,ground],[x-width/2,top+30],[x-4,top],[x+5,top],[x+width/2,top+35],[x+width,ground]]);
 poly(c,p.bark[1],[[x-width+4,ground],[x-2,top+20],[x+4,top+30],[x+width-5,ground]]);
 for(let k=0;k<height/7;k++){const yy=top+20+k*7;pixelRect(c,p.bark[2],x-5+hash(k,2,seed)%11,yy,2,3+hash(k,3,seed)%7);if(k%3===0)pixelRect(c,p.bark[3],x-4,yy,2,3);}
 for(const side of [-1,1]){poly(c,p.bark[0],[[x,top+65],[x+side*37,top+30],[x+side*44,top+21],[x+side*36,top+46],[x+side*5,top+83]]);poly(c,p.bark[0],[[x-width,ground],[x-38,ground+5],[x-12,ground-20],[x+width,ground],[x+35,ground+4]]);}
 leaves(c,x-25,top+13,48,p.leaf,seed);leaves(c,x+28,top+4,53,p.leaf,seed+1);leaves(c,x,top-18,49,p.leaf,seed+2);
}
function stone(c,x,y,w,h,p,seed){
 poly(c,p[0],[[x+3,y],[x+w-3,y],[x+w,y+3],[x+w-2,y+h],[x,y+h-2],[x,y+3]]);
 pixelRect(c,p[1],x+2,y+2,w-5,h-4);pixelRect(c,p[2],x+3,y+2,w-7,2);pixelRect(c,p[3],x+4,y+2,Math.max(1,w-10),1);
 for(let i=0;i<w*h/22;i++){const px=x+3+hash(i,1,seed)%Math.max(1,w-6),py=y+4+hash(i,2,seed)%Math.max(1,h-6);pixelRect(c,i%3?p[0]:p[2],px,py,2,1);}
}
function ruins(c,x,g,p,seed){
 for(const xx of [x,x+58])for(let k=0;k<5;k++)stone(c,xx,g-20-k*17,18,16,p.ground,seed+k);
 for(let k=0;k<4;k++)stone(c,x+4+k*17,g-104+Math.abs(k-1.5)*5,18,16,p.ground,seed+k+4);
 pixelRect(c,p.grass,x-1,g-86,21,3);pixelRect(c,p.grass,x+57,g-69,19,2);
 for(let k=0;k<9;k++)pixelRect(c,p.leaf[1],x+4,g-80+k*6,2,7);
}
function ground(c,w,h,g,p,id){
 pixelRect(c,p.ground[0],0,g,w,h-g);
 for(let y=g+3;y<h;y+=12)for(let x=-(Math.floor((y-g)/12)%2)*18;x<w;x+=34)stone(c,x,y,33,11,p.ground,hash(x,y));
 pixelRect(c,p.ground[2],0,g,w,3);
 for(let x=0;x<w;x+=3){const n=hash(x,g,8);pixelRect(c,p.grass,x,g-1-(n%4),2,2+n%4);if(n%3===0)pixelRect(c,p.leaf[4],x,g-2,1,2);}
 if(id==='desert'){for(let i=0;i<w/3;i++){const x=hash(i,2)%w,y=g+hash(i,3)%Math.max(1,h-g);pixelRect(c,i%2?p.ground[3]:p.ground[1],x,y,2,1);}}
}
export function drawWorld(c,id='jungle',w=480,h=270,tick=0){
 const p=P[id]||P.jungle,g=h-30,horizon=Math.max(65,g-88);
 pixelRect(c,p.sky,0,0,w,h);
 for(let i=0;i<8;i++){const x=(i*97)%w,y=28+hash(i,7,4)%Math.max(1,horizon-30);blob(c,p.mist,x,y,55,8);}
 for(let x=0;x<w;x+=2){const y=horizon-28+Math.sin(x*.013)*18+Math.sin(x*.031)*9;pixelRect(c,p.far,x,y,2,g-y);}
 if(id==='jungle'||id==='water'){
  for(let i=0;i<8;i++){const x=i*w/7-15;tree(c,x,g-13,100+hash(i,2)%55,{...p,bark:[p.deep,p.far,p.far,p.mist],leaf:[p.deep,p.far,p.far,p.far,p.mist]},i+80);}
  if(id==='water'){
   for(const x of [w*.16,w*.66]){poly(c,p.deep,[[x-30,g-7],[x-20,horizon-40],[x+33,horizon-30],[x+45,g]]);pixelRect(c,'#74bdca',x,horizon-36,22,g-horizon+30);for(let i=0;i<11;i++)pixelRect(c,i%2?'#c6e5d7':'#a0d8d6',x+2+i%5*4,horizon-30+i*8,2,12);blob(c,'#a0d8d6',x+10,g-8,30,4);}
   ruins(c,w*.43,g,p,6);
  }else{ruins(c,w*.64,g-2,p,12);tree(c,28,g,Math.min(g+20,220),p,12,true);tree(c,w-21,g,Math.min(g,210),p,29,true);}
 }else if(id==='volcano'){
  const mx=w*.48;poly(c,p.deep,[[mx-140,g],[mx-48,horizon-53],[mx-12,horizon-76],[mx+15,horizon-65],[mx+42,horizon-47],[mx+145,g]]);
  poly(c,'#b45e58',[[mx-35,horizon-60],[mx-8,horizon-68],[mx+19,horizon-58],[mx+32,horizon-32],[mx+10,horizon-39],[mx+7,g],[mx-7,g],[mx-14,horizon-40]]);
  pixelRect(c,'#ed975c',mx-6,horizon-48,7,g-horizon+40);pixelRect(c,'#ffce86',mx-3,horizon-48,2,g-horizon+40);
  for(let i=0;i<5;i++){const x=i*w/4;for(let y=g-16;y>g-80-(i%2)*22;y-=15)stone(c,x,y,28,15,p.ground,i+y);}
  pixelRect(c,'#a64c4e',0,g-12,w,12);for(let i=0;i<w/12;i++)pixelRect(c,i%2?'#f2a466':'#d77555',i*17%w,g-8+i%3,10,2);
 }else if(id==='desert'){
  for(let i=0;i<5;i++){const x=i*w/4-30,top=horizon-20-i%2*15;poly(c,i%2?p.deep:p.far,[[x-25,g],[x-5,top+12],[x+9,top+12],[x+9,top],[x+67,top],[x+67,top+20],[x+83,g]]);for(let k=0;k<4;k++)pixelRect(c,p.mist,x+12,top+8+k*9,48-k*4,2);}
  ruins(c,w*.67,g,p,40);
  for(const x of [w*.08,w*.89]){pixelRect(c,p.leaf[0],x,g-65,13,65);pixelRect(c,p.leaf[2],x+3,g-65,5,65);pixelRect(c,p.leaf[0],x-14,g-49,14,7);pixelRect(c,p.leaf[0],x-14,g-61,6,18);pixelRect(c,p.leaf[0],x+13,g-34,14,7);pixelRect(c,p.leaf[0],x+21,g-48,6,19);}
 }else{
  for(let i=0;i<9;i++){const x=i*65-10,top=g-90-hash(i,7)%65;pixelRect(c,p.deep,x,top,51,g-top);pixelRect(c,p.far,x+2,top+5,46,g-top-5);pixelRect(c,p.deep,x-3,top-4,58,6);for(let y=top+12;y<g-10;y+=17)for(let xx=x+9;xx<x+48;xx+=13){pixelRect(c,p.deep,xx-2,y-2,9,12);pixelRect(c,(hash(xx,y)%4===0)?'#ddb985':'#55778b',xx,y,5,8);pixelRect(c,p.deep,xx+2,y,1,8);}}
  for(const x of [w*.08,w*.9]){pixelRect(c,'#182d3c',x,g-92,4,92);pixelRect(c,'#182d3c',x-8,g-94,21,5);pixelRect(c,'#e1bc87',x-5,g-89,15,13);pixelRect(c,'#f8d9a2',x-2,g-88,8,8);pixelRect(c,'#182d3c',x+1,g-90,2,15);}
 }
 ground(c,w,h,g,p,id);
 for(let i=0;i<w/24;i++){
  const x=hash(i,4,32)%w;
  if(id==='jungle'||id==='water'){leaves(c,x,g+17,11,p.leaf,i);if(i%3===0){pixelRect(c,'#c77a9b',x,g+6,4,3);pixelRect(c,'#f3c7b0',x+1,g+6,1,1);}}
  else if(i%3===0)stone(c,x,g+11,9,6,p.ground,i);
 }
}
export function drawWeather(c,id,w,h,tick){
 const g=h-30,horizon=Math.max(65,g-88);
 // Weather remains decorative; it never changes collision or damage.
 if(tick&&id==='rain')for(let i=0;i<65;i++){const x=(i*43+Math.floor(tick/130))%w,y=(i*37+Math.floor(tick/35))%g;pixelRect(c,'#8eb3ba66',x,y,1,5);}
 if(tick&&id==='volcano')for(let i=0;i<12;i++){const x=(i*53)%w,y=g-((Math.floor(tick/85)+i*17)%80);pixelRect(c,i%2?'#f6ca83':'#e78761',x,y,1,2);}
 if(tick&&id==='jungle')for(let i=0;i<9;i++){const x=(i*71+Math.floor(tick/440))%w,y=horizon+20+i%4*16;pixelRect(c,'#dbd88e',x,y,1,1);}
}
