export function cleanAudioSettings(raw={}){const percent=(v,fallback)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):fallback;return {music:percent(raw.music,.35),sfx:percent(raw.sfx,.55),musicEnabled:raw.musicEnabled!==false,sfxEnabled:raw.sfxEnabled!==false,motion:typeof raw.motion==='boolean'?raw.motion:null};}
// An original eight-bar chiptune: melody, counter melody, bass and synthesized drums.
const melody=[
 [76,0,79,83,81,79,76,0,74,76,79,0,83,81,79,0],
 [74,0,77,81,79,77,74,0,72,74,77,0,81,79,77,0],
 [72,0,76,79,83,0,81,79,76,79,84,0,83,79,76,0],
 [71,0,74,78,81,78,74,0,76,78,83,0,81,78,74,0],
 [88,0,83,79,81,83,86,0,88,86,83,81,79,0,76,0],
 [86,0,81,77,79,81,84,0,86,84,81,79,77,0,74,0],
 [84,83,79,76,79,81,83,0,88,0,86,83,84,83,79,0],
 [83,0,81,78,79,78,74,0,76,0,79,83,88,0,0,0]
];
const roots=[40,38,36,35,40,38,36,35];
export function createGameAudio(initial){
  let settings=initial,ctx,musicBus,sfxBus,noise,next=0,step=0,timer,unlocked=false,hidden=false;
  const freq=n=>440*2**((n-69)/12);
  function tone(bus,n,time,duration=.12,volume=.1,type='square',slide=0){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq(n),time);if(slide)o.frequency.exponentialRampToValueAtTime(freq(n+slide),time+duration);g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(volume,time+.008);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(bus);o.start(time);o.stop(time+duration+.02);}
  function percussion(time,snare=false){if(snare){const src=ctx.createBufferSource(),g=ctx.createGain(),filter=ctx.createBiquadFilter();src.buffer=noise;filter.type='highpass';filter.frequency.value=snare===true?1400:6000;g.gain.setValueAtTime(snare===true?.08:.025,time);g.gain.exponentialRampToValueAtTime(.0001,time+.07);src.connect(filter);filter.connect(g);g.connect(musicBus);src.start(time);src.stop(time+.08);}else tone(musicBus,43,time,.14,.18,'sine',-20);}
  function schedule(){if(!ctx||ctx.state!=='running'||hidden)return;const interval=60/128/4;while(next<ctx.currentTime+.14){const bar=Math.floor(step/16)%8,beat=step%16;if(settings.musicEnabled){const note=melody[bar][beat];if(note)tone(musicBus,note,next,interval*.9,.085,'square');if(beat%4===0)tone(musicBus,roots[bar]+(beat===8?7:0),next,interval*2.7,.15,'triangle');if(beat%8===0){for(const offset of [12,15,19])tone(musicBus,roots[bar]+offset,next,.32,.027,'triangle');}if(beat===0||beat===8)percussion(next);if(beat===4||beat===12)percussion(next,true);if(beat%2===0)percussion(next,'hat');}next+=interval;step=(step+1)%128;}}
  function apply(nextSettings){settings=nextSettings;if(ctx){musicBus.gain.setTargetAtTime(settings.musicEnabled?settings.music*.65:0,ctx.currentTime,.04);sfxBus.gain.setTargetAtTime(settings.sfxEnabled?settings.sfx:0,ctx.currentTime,.04);}}
  async function start(){try{if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;ctx=new Audio();musicBus=ctx.createGain();sfxBus=ctx.createGain();const compressor=ctx.createDynamicsCompressor();compressor.connect(ctx.destination);musicBus.connect(compressor);sfxBus.connect(compressor);noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noise.getChannelData(0);let seed=1847;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=seed/2147483648-1;}apply(settings);}if(ctx.state==='suspended')await ctx.resume();if(!unlocked){unlocked=true;next=ctx.currentTime+.04;timer=setInterval(schedule,25);}schedule();}catch{}}
  return {start,apply,playFx(frequency=400,duration=.07,kind='square',volume=.025){if(!ctx||!settings.sfxEnabled||hidden)return;const time=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();o.type=kind;o.frequency.setValueAtTime(frequency,time);o.frequency.exponentialRampToValueAtTime(Math.max(30,frequency*.55),time+duration);g.gain.setValueAtTime(volume,time);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(sfxBus);o.start(time);o.stop(time+duration+.01);},setHidden(value){hidden=value;if(!ctx)return;if(value)ctx.suspend().catch(()=>{});else if(unlocked)ctx.resume().then(()=>{next=ctx.currentTime+.04;}).catch(()=>{});},dispose(){clearInterval(timer);ctx?.close();}};
}
