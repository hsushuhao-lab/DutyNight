import assert from 'node:assert/strict';
import {SoundManager} from '../src/audio/SoundManager.js';
const originalSet=globalThis.setInterval,originalClear=globalThis.clearInterval;
const timers=new Map();let next=0;
globalThis.setInterval=(fn,ms)=>{assert.equal(ms,4200);timers.set(++next,fn);return next;};
globalThis.clearInterval=id=>timers.delete(id);
try{
 const sound=new SoundManager();let bursts=0,stopped=0;
 sound.startAmbient=()=>{};
 sound.playPhoneRingPattern=()=>{if(sound.ctx?.state==='running')bursts++;};
 sound.startPhoneRing();sound.startPhoneRing();
 assert.equal(timers.size,1);assert.equal(bursts,0);
 sound.ctx={state:'suspended',async resume(){this.state='running';}};
 await sound.ensureRunning();assert.equal(bursts,1);
 await sound.ensureRunning();assert.equal(bursts,1,'Repeated gestures must not restart a burst');
 [...timers.values()][0]();assert.equal(bursts,2);
 sound.ctx.state='suspended';await sound.ensureRunning();assert.equal(bursts,3);
 sound.phoneOscillators.add({stop(){stopped++;}});
 sound.stopPhoneRing();assert.equal(timers.size,0);assert.equal(stopped,1);
 assert.equal(sound.phoneOscillators.size,0);
 await sound.ensureRunning();assert.equal(bursts,3);
 console.log('PASS: pending unlock, recurring ring, idempotence, resume, complete stop');
}finally{globalThis.setInterval=originalSet;globalThis.clearInterval=originalClear;}
