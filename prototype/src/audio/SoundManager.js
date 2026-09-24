// SoundManager.js - Procedural Web Audio synthesizer for hospital ambience and interactions
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.ambientPlaying = false;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.startAmbient();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startAmbient() {
    if (this.ambientPlaying || !this.ctx) return;
    try {
      // Low air conditioning / ventilation hum
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate distant air duct drone (50Hz - 220Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 95;
      filter.Q.value = 1.8;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.08;

      whiteNoise.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      whiteNoise.start();
      this.ambientPlaying = true;
    } catch (e) {
      console.warn('Ambient sound failed:', e);
    }
  }

  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playKeyPickup() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Multiple metal resonance rings
      const freqs = [1800, 2400, 3200];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + Math.random() * 80, now + idx * 0.04);

        gain.gain.setValueAtTime(0.12, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.35);
      });
    } catch (e) {}
  }

  playPaperSign() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI * 4);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2800;
      filter.Q.value = 3.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.3);
    } catch (e) {}
  }

  playElevatorChime() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // First chime: 660 Hz (E5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Second chime: 523.25 Hz (C5)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.4);
      gain2.gain.setValueAtTime(0.25, now + 0.4);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.4);
      osc2.stop(now + 1.4);
    } catch (e) {}
  }

  playElevatorMotor() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.linearRampToValueAtTime(65, now + 1.5);
      osc.frequency.linearRampToValueAtTime(45, now + 3.0);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.1, now + 2.5);
      gain.gain.linearRampToValueAtTime(0.001, now + 3.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2);
    } catch (e) {}
  }

  playComputerBeep() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174.66, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playPhoneRingPattern() {
    if (!this.ctx || this.isMuted) return;
    try {
      const ringAt=(t)=>{
        for(const [freq,offset] of [[440,0],[560,.09]]){
          const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();
          osc.type='sine';osc.frequency.setValueAtTime(freq,t+offset);
          gain.gain.setValueAtTime(.001,t+offset);
          gain.gain.linearRampToValueAtTime(.09,t+offset+.02);
          gain.gain.exponentialRampToValueAtTime(.001,t+offset+.42);
          osc.connect(gain);gain.connect(this.ctx.destination);
          osc.start(t+offset);osc.stop(t+offset+.45);
        }
      };
      const now=this.ctx.currentTime;
      ringAt(now);ringAt(now+.72);ringAt(now+2.95);ringAt(now+3.67);
    } catch (e) {}
  }

  playBed33KnockPattern() {
    if(!this.ctx||this.isMuted)return;
    try{
      const now=this.ctx.currentTime;
      const knockAt=(t)=>{
        const osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();
        osc.type='triangle';osc.frequency.setValueAtTime(92,t);osc.frequency.exponentialRampToValueAtTime(42,t+.08);
        filter.type='lowpass';filter.frequency.value=280;
        gain.gain.setValueAtTime(.13,t);gain.gain.exponentialRampToValueAtTime(.001,t+.11);
        osc.connect(filter);filter.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+.13);
      };
      let t=now;
      for(let i=0;i<4;i++){knockAt(t);t+=.31;}
      t+=1.18;
      for(let i=0;i<9;i++){knockAt(t);t+=.28;}
    }catch(e){}
  }

  playDoorLockClack() {
    if(!this.ctx||this.isMuted)return;
    try{
      const now=this.ctx.currentTime;
      const osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();
      osc.type='triangle';osc.frequency.setValueAtTime(150,now);osc.frequency.exponentialRampToValueAtTime(58,now+.12);
      filter.type='lowpass';filter.frequency.value=620;
      gain.gain.setValueAtTime(.16,now);gain.gain.exponentialRampToValueAtTime(.001,now+.16);
      osc.connect(filter);filter.connect(gain);gain.connect(this.ctx.destination);osc.start(now);osc.stop(now+.18);
    }catch(e){}
  }

  duckAmbient(level=.2,durationMs=4200) {
    if(!this.ctx||!this.ambientGain)return;
    try{
      const now=this.ctx.currentTime,base=.08,target=Math.max(.001,base*level);
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value,now);
      this.ambientGain.gain.linearRampToValueAtTime(target,now+.08);
      this.ambientGain.gain.linearRampToValueAtTime(base,now+durationMs/1000);
    }catch(e){}
  }

  playClick() {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();
