// Shared rendering coordinates keep 3D animation aligned with the existing rules.
export const WORLD_SCALE=38;
export function combatPosition(f){return {x:(f.x-600)/WORLD_SCALE,y:-f.y/WORLD_SCALE||0,z:0};}
export function poseFor(f){return f.hp<=0?'ko':f.attack?.kind||(f.blocking?'guard':Math.abs(f.vx)>1?'walk':'idle');}
export const WORLD_PALETTES={
  volcano:{sky:0x241d32,fog:0x4a2c39,ground:0x302d38,accent:0xff692d,light:0xffa46b},
  water:{sky:0x8bc8d8,fog:0x86bac7,ground:0x718f9a,accent:0x53edff,light:0xddfaff},
  rain:{sky:0x111c37,fog:0x202d49,ground:0x252e44,accent:0xb79aff,light:0xa6c9ff},
  desert:{sky:0xedb478,fog:0xe0ab7a,ground:0xc89561,accent:0xffd17c,light:0xffe5a9},
  jungle:{sky:0x284f4c,fog:0x427065,ground:0x435c49,accent:0xc4ed7c,light:0xd5f5a9}
};
export function previewAngle(drag=0,time=0,reduced=false){return .36+drag+(reduced?0:Math.sin(time/2400)*.1);}
