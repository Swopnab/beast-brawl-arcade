export function joystickVector(dx,dy,radius=46){
  if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(radius)||radius<=0)return {x:0,y:0,left:false,right:false,jump:false,duck:false};
  const length=Math.hypot(dx,dy),scale=length>radius?radius/length:1,x=dx*scale/radius,y=dy*scale/radius;
  return {x,y,left:x<-.22,right:x>.22,jump:y<-.55,duck:y>.55};
}
export function attachJoystick(base,onInput){
  const knob=base.querySelector('.joystick-knob'),status=document.getElementById('joystick-status');let pointer=null;
  function update(event){const r=base.getBoundingClientRect(),radius=r.width*.29;const v=joystickVector(event.clientX-r.left-r.width/2,event.clientY-r.top-r.height/2,radius);knob.style.transform=`translate(${v.x*radius}px,${v.y*radius}px)`;onInput(v);if(status)status.textContent=[v.left?'Left':v.right?'Right':'',v.jump?'Jump':v.duck?'Duck':''].filter(Boolean).join(' + ')||'Ready';}
  function release(){pointer=null;knob.style.transform='translate(0px,0px)';base.classList.remove('engaged');onInput(joystickVector(0,0));if(status)status.textContent='Ready';}
  base.addEventListener('pointerdown',event=>{if(pointer!==null)return;event.preventDefault();pointer=event.pointerId;base.setPointerCapture(pointer);base.classList.add('engaged');update(event);});
  base.addEventListener('pointermove',event=>{if(event.pointerId===pointer){event.preventDefault();update(event);}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>base.addEventListener(type,event=>{if(event.pointerId===pointer)release();}));
  window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);return release;
}
