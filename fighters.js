export const ELEMENTS = {
  Ember: { color: '#ff855f', dark: '#872b38', icon: '◆' },
  Tide: { color: '#62d9ed', dark: '#185d89', icon: '≋' },
  Volt: { color: '#f5e66a', dark: '#946530', icon: 'ϟ' },
  Wild: { color: '#b2ec73', dark: '#37664a', icon: '✳' },
  Void: { color: '#bd9cff', dark: '#583b8c', icon: '✦' },
  Frost: { color: '#b0ecff', dark: '#4769a2', icon: '❄' }
};
// Every move set is authored for this game. No borrowed creatures or art assets.
const rows = [
  ['ashfang','Ashfang','Ember','drake','THE BACK-ALLEY DRAGON','A hot-headed drake with a fuse shorter than its wings.',1040,4.2,13.8,1.06,'Coal Claw','Magma Hook','Flare Orb','projectile','Dragonfall',100],
  ['kilnback','Kilnback','Ember','turtle','BUILT LIKE A FURNACE','A walking pottery kiln that takes every grudge personally.',1200,3.25,11.7,1.18,'Brick Knuckle','Shell Hammer','Furnace Fall','slam','Core Meltdown',116],
  ['reefclaw','Reefclaw','Tide','crab','PINCH FIRST. ASK NEVER.','A coral-armored crab defending the last good noodle shop.',1180,3.5,11.9,1.16,'Pincer Snap','Coral Crush','Tidal Snare','trap','Reef Wrecker',114],
  ['inkveil','Inkveil','Tide','octopus','SIX ARMS. ZERO MERCY.','A deep-sea octopus that walks on six curling arms and steals momentum.',980,4.5,15,.98,'Sucker Snap','Tentacle Crush','Pressure Cannon','projectile','Ocean Eclipse',88],
  ['zipcat','Zipcat','Volt','cat','BLINK AND GET BONKED','A battery-powered alley cat with no off switch.',900,5.6,15,.92,'Quick Paw','Cable Kick','Flash Step','dash','Nine Lives Overdrive',86],
  ['boltstag','Boltstag','Volt','stag','HIGH VOLTAGE. HIGHER STANDARDS.','A proud stag with antenna antlers and an electric temper.',1080,4.3,14.4,1.08,'Static Jab','Crown Crash','Antler Arc','uppercut','Thunder Coronation',106],
  ['thornox','Thornox','Wild','bull','NATURE HAS HANDS','An overgrown brawler who never learned to knock.',1190,3.6,12.4,1.18,'Root Jab','Oak Horn','Bramble Rush','dash','Forest Stampede',118],
  ['petalmoth','Petalmoth','Wild','moth','DELICATE. DEVASTATING.','A moon-garden moth with razor petals and impeccable taste.',900,5,16,.93,'Petal Tap','Silk Scissor','Pollen Shot','projectile','Bloomstorm',87],
  ['hexeye','Hexeye','Void','jellyfish','DON’T BLINK FIRST.','One watchful eye, a translucent bell, and eight drifting tendrils.',920,5,15.5,.96,'Wisp Lash','Spectral Coil','Phantom Gaze','drain','Soul Parade',91],
  ['nullwyrm','Nullwyrm','Void','wyrm','EXISTENCE IS OPTIONAL','A tiny cosmic serpent with a very large superiority complex.',1020,4.4,14.2,1.08,'Rift Claw','Gravity Lash','Void Rift','wave','Singularity',108],
  ['glaciop','Glaciop','Frost','rabbit','HOP TO IT. REGRET IT.','An ice rabbit with spring-loaded legs and frosty footwork.',900,5.4,16.2,.94,'Frost Tap','Carrot Kick','Snow Kick','uppercut','Avalanche Ballet',90],
  ['crysteel','Crysteel','Frost','golem','DIAMOND HANDS. LITERALLY.','A crystal golem carved from one very stubborn glacier.',1220,3.2,11.6,1.2,'Shard Jab','Glacier Fist','Shatterfall','slam','Absolute Zero',120]
];
export const ANATOMY = Object.freeze({
  ashfang:{form:'Winged biped',size:'Large',scale:.94,bodyHeight:4.5,bodyWidth:4.8,legs:2,tentacles:0,floating:false},
  kilnback:{form:'Four-legged furnace',size:'Heavy',scale:1.02,bodyHeight:2.7,bodyWidth:3.8,legs:4,tentacles:0,floating:false},
  reefclaw:{form:'Six-legged crustacean',size:'Wide',scale:.9,bodyHeight:2.7,bodyWidth:5,legs:6,tentacles:0,floating:false},
  inkveil:{form:'Walking tentacles',size:'Medium',scale:.88,bodyHeight:3.7,bodyWidth:4.6,legs:0,tentacles:6,floating:false},
  zipcat:{form:'Four-legged sprinter',size:'Pocket',scale:.66,bodyHeight:2.7,bodyWidth:2.6,legs:4,tentacles:0,floating:false},
  boltstag:{form:'Four-legged sky stag',size:'Tall',scale:.93,bodyHeight:5.6,bodyWidth:2.8,legs:4,tentacles:0,floating:false},
  thornox:{form:'Four-legged root beast',size:'Colossal',scale:1.08,bodyHeight:3.4,bodyWidth:4.4,legs:4,tentacles:0,floating:false},
  petalmoth:{form:'Floating petal wings',size:'Delicate',scale:.8,bodyHeight:3.9,bodyWidth:5.6,legs:0,tentacles:0,floating:true},
  hexeye:{form:'Floating eye & tendrils',size:'Ethereal',scale:.88,bodyHeight:4.2,bodyWidth:3.4,legs:0,tentacles:8,floating:true},
  nullwyrm:{form:'Floating cosmic serpent',size:'Long',scale:.85,bodyHeight:4.5,bodyWidth:4.2,legs:0,tentacles:0,floating:true},
  glaciop:{form:'Two-legged ice hopper',size:'Small',scale:.7,bodyHeight:4.2,bodyWidth:2,legs:2,tentacles:0,floating:false},
  crysteel:{form:'Two-legged crystal titan',size:'Giant',scale:1.02,bodyHeight:5.7,bodyWidth:4,legs:2,tentacles:0,floating:false}
});
export const FIGHTERS = rows.map((r, index) => {
  const [id,name,element,shape,tagline,bio,hp,speed,jump,power,jab,heavy,special,kind,superName,specialDamage] = r;
  return Object.freeze({id,name,element,shape,tagline,bio,hp,speed,jump,power,index,anatomy:Object.freeze(ANATOMY[id]),
    color:ELEMENTS[element].color,dark:ELEMENTS[element].dark,
    accent:['#fff0b3','#ffe5df','#d8d2ff','#f2fff0','#ffb6cd'][index % 5],
    moves:{jab,heavy,special,super:superName,
      low:jab.split(' ')[0]+' Sweep',air:heavy.split(' ')[0]+' Dive',rising:'Rising '+heavy,
      moving:special.split(' ')[0]+' Shoulder',launcher:heavy.split(' ')[0]+' Skybreaker',chain:special+' EX',breaker:jab.split(' ')[0]+' Guardbreaker'},kind,specialDamage,
    reach:88 + (index % 5) * 5,
    combo:`${jab} → ${jab} → ${heavy}`
  });
});
export const fighter = id => FIGHTERS.find(f => f.id === id) || FIGHTERS[0];
export const MOVE_LIST = [
  ['Q','jab','Quick close-range strike. Builds your combo.'],['E','heavy','Slower strike. More damage and knockback.'],
  ['R','special','Your creature’s signature elemental technique.'],['SPACE','super','Charged finisher. Requires 100 energy.'],
  ['S + Q','low','Low sweep with extra chip damage through guard.'],['W + E','rising','Rising heavy strike. Launches airborne.'],
  ['AIR + E','air','Diving strike. Punish an opponent below you.'],['A/D + E','moving','Forward-moving heavy. Close the distance.'],
  ['Q → Q → E','launcher','Two lights, then heavy: a launching combo finisher.'],
  ['Q → E → R','chain','Light, heavy, special: an empowered elemental attack.'],
  ['E → E → Q','breaker','Two heavies, then light: breaks through guard.']
];
export const ARENAS = [
  {id:'neon',name:'Arcade Lime',cost:0,sky:'#101631',glow:'#c2f85f',accent:'#8b6cf8',description:'The streets are yours.'},
  {id:'moon',name:'Forge Glow',cost:80,sky:'#21132f',glow:'#ff9d67',accent:'#f17dbe',description:'Where stars learn to fight.'},
  {id:'garden',name:'Jade Glow',cost:180,sky:'#10292d',glow:'#80f5b2',accent:'#fc93c5',description:'A garden with a grudge.'},
  {id:'storm',name:'Storm Glow',cost:300,sky:'#171936',glow:'#83cfff',accent:'#c2a2ff',description:'Above the city. Beyond mercy.'}
];
export const TITLES = [{xp:0,name:'Street Rookie'},{xp:120,name:'Combo Kid'},{xp:400,name:'District Rival'},{xp:900,name:'Arena Menace'},{xp:1800,name:'Neon Legend'}];
