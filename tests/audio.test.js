import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanAudioSettings} from '../audio.js';
test('music and effects are enabled by default with independent comfortable volumes',()=>{
  const s=cleanAudioSettings();assert.equal(s.musicEnabled,true);assert.equal(s.sfxEnabled,true);assert.equal(s.music,.35);assert.equal(s.sfx,.55);assert.equal(s.motion,null);
});
test('saved sound settings clamp volume and preserve explicit mute and reduced motion',()=>{
  const s=cleanAudioSettings({music:5,sfx:-4,musicEnabled:false,sfxEnabled:false,motion:false});assert.deepEqual(s,{music:1,sfx:0,musicEnabled:false,sfxEnabled:false,motion:false});assert.equal(cleanAudioSettings({music:NaN}).music,.35);
});
