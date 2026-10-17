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
  ['ashfang','Ashfang','Ember','drake','THE BACK-ALLEY DRAGON','A hot-headed drake with a fuse shorter than its wings.',1040,4.2,13.8,1.06,'Coal Claw','Magma Hook','Flare Rush','dash','Dragonfall',100],
  ['cindervix','Cindervix','Ember','fox','SMALL FOX. BIG PROBLEM.','Three tails, zero patience, and a pocket full of foxfire.',900,5.3,14.5,.94,'Spark Paw','Tail Feint','Foxfire','projectile','Ninefold Blaze',84],
  ['kilnback','Kilnback','Ember','turtle','BUILT LIKE A FURNACE','A walking pottery kiln that takes every grudge personally.',1200,3.25,11.7,1.18,'Brick Knuckle','Shell Hammer','Furnace Fall','slam','Core Meltdown',116],
  ['scorchimp','Scorchimp','Ember','monkey','NO INSIDE VOICE','An acrobat who treats fire safety as a suggestion.',950,5,15.2,.98,'Match Flick','Chimney Kick','Firecracker','uppercut','Rocket Circus',92],
  ['brimram','Brimram','Ember','ram','FULL CONTACT COMBUSTION','A volcanic ram with molten horns and terrible brakes.',1120,3.8,12.6,1.14,'Ember Butt','Forge Horn','Cinder Ring','burst','Caldera Crash',110],
  ['ripjaw','Ripjaw','Tide','shark','THE DEEP END FIGHTS BACK','A street shark that smells weakness and cheap energy drinks.',1070,4.6,12.9,1.07,'Fin Jab','Anchor Bite','Undertow Bite','dash','Abyss Breaker',104],
  ['bubbles','Bubbles','Tide','axolotl','CUTE IS A COMBAT STRATEGY','A smiling axolotl with an alarming grasp of pressure physics.',920,4.6,14.1,.95,'Gill Slap','Bubble Bonk','Pressure Pop','projectile','Bubble Apocalypse',90],
  ['reefclaw','Reefclaw','Tide','crab','PINCH FIRST. ASK NEVER.','A coral-armored crab defending the last good noodle shop.',1180,3.5,11.9,1.16,'Pincer Snap','Coral Crush','Tidal Snare','trap','Reef Wrecker',114],
  ['kelcoil','Kelcoil','Tide','serpent','A CURRENT WITH AN ATTITUDE','A kelp serpent whose patience is measured in milliseconds.',970,4.8,14,1,'Reed Whip','Coil Break','Serpent Surge','wave','Maelstrom Spiral',97],
  ['driftfin','Driftfin','Tide','ray','SILENT. SLIPPERY. PETTY.','A floating ray that steals momentum and occasionally lunch.',980,4.5,15,.98,'Wing Tap','Riptide Flip','Siphon Tide','drain','Ocean Eclipse',88],
  ['zipcat','Zipcat','Volt','cat','BLINK AND GET BONKED','A battery-powered alley cat with no off switch.',900,5.6,15,.92,'Quick Paw','Cable Kick','Flash Step','dash','Nine Lives Overdrive',86],
  ['ampwing','Ampwing','Volt','bee','THE BUZZ IS PERSONAL','A neon hornet who charges extra for bad manners.',910,5.1,15.7,.94,'Needle Tap','Wing Cutter','Sting Circuit','projectile','Hive Voltage',89],
  ['boltstag','Boltstag','Volt','stag','HIGH VOLTAGE. HIGHER STANDARDS.','A proud stag with antenna antlers and an electric temper.',1080,4.3,14.4,1.08,'Static Jab','Crown Crash','Antler Arc','uppercut','Thunder Coronation',106],
  ['coilmaw','Coilmaw','Volt','wolf','THE NEIGHBORHOOD POWER CUT','An electric wolf who can smell a mistimed block.',1010,4.7,13.8,1.03,'Fuse Fang','Breaker Claw','Static Howl','burst','Blackout Protocol',102],
  ['sparko','Sparko','Volt','gecko','STICKS THE LANDING. AND THE SHOCK.','A wall-running gecko with live wires for toes.',930,5.2,15.6,.96,'Toe Zap','Switch Kick','Live Wire','trap','Gridlock',93],
  ['thornox','Thornox','Wild','bull','NATURE HAS HANDS','An overgrown brawler who never learned to knock.',1190,3.6,12.4,1.18,'Root Jab','Oak Horn','Bramble Rush','dash','Forest Stampede',118],
  ['mosscub','Mosscub','Wild','panda','PEACE WAS PLAN A','A sleepy bamboo guardian with surprisingly sharp elbows.',1140,3.7,12.8,1.08,'Leaf Palm','Bamboo Bash','Bamboo Bloom','drain','Ancient Grove',98],
  ['petalmoth','Petalmoth','Wild','moth','DELICATE. DEVASTATING.','A moon-garden moth with razor petals and impeccable taste.',900,5,16,.93,'Petal Tap','Silk Scissor','Pollen Shot','projectile','Bloomstorm',87],
  ['briarhog','Briarhog','Wild','boar','ABSOLUTELY NO CHILL','A bramble boar running entirely on roots and spite.',1160,3.9,11.9,1.15,'Tusk Nudge','Briar Hook','Root Quake','slam','Thornpocalypse',113],
  ['vinetail','Vinetail','Wild','pangolin','ROLL WITH THE PUNCHES','A leaf-scaled pangolin that brings the whole garden.',1060,4.1,13,1.04,'Scale Jab','Fern Flail','Vine Sweep','wave','Emerald Cyclone',103],
  ['nyxowl','Nyxowl','Void','owl','NIGHT SHIFT. FIGHT SHIFT.','An owl that sees every opening and judges every combo.',940,4.7,15.6,.98,'Talon Tap','Moon Wing','Night Feather','projectile','Midnight Parliament',94],
  ['hexraven','Hexraven','Void','raven','BAD OMENS. WORSE COMPANY.','A raven who collects grudges instead of shiny objects.',930,4.8,15.3,.97,'Omen Peck','Eclipse Wing','Hex Mark','trap','Crowd of Curses',96],
  ['duskmant','Duskmant','Void','mantis','THE LAST THING YOU DON’T SEE','A shadow mantis with crescent blades and perfect timing.',960,5.1,14.6,1.05,'Sickle Tap','Dusk Reaper','Crescent Cut','uppercut','Event Horizon',109],
  ['wispurr','Wispurr','Void','ghostcat','HERE FOR YOUR NINE LIVES','A ghost cat that has never respected personal space.',920,5,15.5,.96,'Ghost Paw','Phantom Pounce','Phantom Kiss','drain','Soul Parade',91],
  ['nullwyrm','Nullwyrm','Void','wyrm','EXISTENCE IS OPTIONAL','A tiny cosmic serpent with a very large superiority complex.',1020,4.4,14.2,1.08,'Rift Claw','Gravity Lash','Void Rift','wave','Singularity',108],
  ['tundrusk','Tundrusk','Frost','yak','THE COLD SHOULDER HURTS','A shaggy frost yak that brought winter to a fistfight.',1200,3.3,11.8,1.17,'Snow Knuckle','Tundra Horn','Winter Roar','burst','Whiteout',115],
  ['glaciop','Glaciop','Frost','rabbit','HOP TO IT. REGRET IT.','An ice rabbit with spring-loaded legs and frosty footwork.',900,5.4,16.2,.94,'Frost Tap','Carrot Kick','Snow Kick','uppercut','Avalanche Ballet',90],
  ['crysteel','Crysteel','Frost','golem','DIAMOND HANDS. LITERALLY.','A crystal golem carved from one very stubborn glacier.',1220,3.2,11.6,1.2,'Shard Jab','Glacier Fist','Shatterfall','slam','Absolute Zero',120],
  ['frostter','Frostter','Frost','otter','SLIDE INTO THE FIGHT','A river otter that turns every floor into a skating rink.',980,5.1,14.5,1,'Ice Paw','River Hook','Ice Slide','dash','Polar Express',99],
  ['snowurchin','Snowurchin','Frost','urchin','HUGS ARE NOT ADVISED','A snowball with crystal spikes and something to prove.',1090,3.9,13.1,1.07,'Spike Tap','Icicle Bash','Needle Flurry','projectile','Hail Mary',105]
];
export const FIGHTERS = rows.map((r, index) => {
  const [id,name,element,shape,tagline,bio,hp,speed,jump,power,jab,heavy,special,kind,superName,specialDamage] = r;
  return Object.freeze({id,name,element,shape,tagline,bio,hp,speed,jump,power,index,
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
