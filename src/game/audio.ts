import { loadAudioPrefs, saveAudioPrefs } from './engine';
import type { AudioPrefs } from './types';

// Procedural Dark Fantasy Web Audio API Engine ported faithfully from rpg-gladiatus-tactical/audio.js
class TacticalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;

  private isMuted = false;
  private isMusicEnabled = true;
  private isMusicPlaying = false;
  private musicSchedulerTimer: ReturnType<typeof setTimeout> | null = null;
  private currentStep = 0;
  private nextStepTime = 0;

  private readonly BPM = 126;
  private readonly STEP_DURATION = 60 / 126 / 2;

  private readonly BASS_PATTERN = [
    38, 38, 50, 38, 45, 38, 48, 45,
    34, 34, 46, 34, 41, 34, 45, 41,
    31, 31, 43, 31, 38, 31, 41, 38,
    33, 33, 45, 40, 43, 40, 37, 40,
  ];

  private readonly CHORD_BARS = [
    [50, 53, 57],
    [46, 50, 53],
    [43, 46, 50],
    [45, 49, 52],
  ];

  private readonly MELODY_EVENTS: Record<number, { note: number; len: number }> = {
    0: { note: 62, len: 3 },
    3: { note: 65, len: 2 },
    5: { note: 64, len: 3 },
    8: { note: 62, len: 4 },
    12: { note: 60, len: 2 },
    14: { note: 58, len: 2 },
    16: { note: 55, len: 4 },
    20: { note: 58, len: 2 },
    22: { note: 62, len: 2 },
    24: { note: 64, len: 4 },
    28: { note: 61, len: 4 },
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const prefs = loadAudioPrefs();
      this.isMusicEnabled = prefs.musicEnabled;
      this.isMuted = prefs.isMuted;
    }
  }

  public getPrefs(): AudioPrefs {
    return {
      musicEnabled: this.isMusicEnabled,
      isMuted: this.isMuted,
    };
  }

  public init(): boolean {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0.0 : 0.92;
        this.masterGain.connect(this.ctx.destination);

        this.reverbNode = this.createImpulseReverb(1.4, 2.8);
        const reverbWet = this.ctx.createGain();
        reverbWet.gain.value = 0.28;
        this.reverbNode.connect(reverbWet);
        reverbWet.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.isMusicEnabled && !this.isMuted ? 0.45 : 0.0;
        this.musicGain.connect(this.masterGain);
        this.musicGain.connect(this.reverbNode);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.95;
        this.sfxGain.connect(this.masterGain);
        this.sfxGain.connect(this.reverbNode);
      }

      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  private runWhenReady(fn: () => void): void {
    if (!this.init() || !this.ctx) return;
    if (this.ctx.state === 'running') {
      fn();
    } else {
      this.ctx
        .resume()
        .then(() => {
          if (this.ctx && this.ctx.state === 'running') {
            fn();
          }
        })
        .catch(() => {
          // Ignore browser autoplay block until next gesture
        });
    }
  }

  private createImpulseReverb(durationSec: number, decay: number): ConvolverNode {
    const ctx = this.ctx!;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  private createNoiseBuffer(durationSec: number): AudioBuffer {
    const ctx = this.ctx!;
    const length = Math.floor(ctx.sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  public playSwordSlash(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const sr = this.ctx.sampleRate;
      const dur = 0.34;
      const len = Math.floor(sr * dur);
      const buf = this.ctx.createBuffer(1, len, sr);
      const out = buf.getChannelData(0);

      const pitchVar = 0.96 + Math.random() * 0.08;
      const bladeModes = [
        { f: 2480 * pitchVar, r: 0.9986, a: 0.018 },
        { f: 3820 * pitchVar, r: 0.9982, a: 0.015 },
        { f: 5390 * pitchVar, r: 0.9976, a: 0.012 },
        { f: 7240 * pitchVar, r: 0.997, a: 0.009 },
      ].map((m) => ({
        ...m,
        c: 2 * m.r * Math.cos((2 * Math.PI * m.f) / sr),
        r2: m.r * m.r,
        y1: 0,
        y2: 0,
      }));

      let lpAir = 0;
      let hpAirPrev = 0;
      let lpCut = 0;
      const sliceStart = Math.floor(0.055 * sr);

      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const white = Math.random() * 2 - 1;

        let airEnv = 0;
        if (t < 0.12) {
          const x = t / 0.12;
          airEnv = Math.sin(Math.PI * Math.pow(x, 0.65)) * 0.65;
        }
        const cutoff = 0.12 + 0.42 * Math.exp(-Math.pow((t - 0.048) / 0.032, 2));
        lpAir += cutoff * (white - lpAir);
        const bpAir = lpAir - hpAirPrev;
        hpAirPrev = lpAir * 0.88;
        const airSample = bpAir * airEnv;

        const scrapeExc = white * (t < 0.09 ? Math.exp(-t * 28) : 0);
        let metalRing = 0;
        for (let m = 0; m < bladeModes.length; m++) {
          const bm = bladeModes[m];
          const y = bm.c * bm.y1 - bm.r2 * bm.y2 + scrapeExc * bm.a;
          bm.y2 = bm.y1;
          bm.y1 = y;
          metalRing += y;
        }

        let cutSample = 0;
        if (i >= sliceStart) {
          const ct = (i - sliceStart) / sr;
          const tearEnv = Math.exp(-ct * 48);
          const grain = Math.sin(ct * 1950) > 0 ? 1.15 : 0.75;
          lpCut += 0.52 * (white * grain - lpCut);
          const crispTear = (white - lpCut * 0.55) * tearEnv * 0.78;
          const thwackEnv = Math.exp(-ct * 68);
          const thwack = Math.sin(2 * Math.PI * 118 * ct * Math.exp(-ct * 12)) * thwackEnv * 0.52;
          cutSample = crispTear + thwack;
        }

        out[i] = Math.tanh((airSample + metalRing + cutSample) * 1.45) * 0.88;
      }

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.sfxGain);
      src.start(this.ctx.currentTime);
    });
  }

  public playParryClang(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const sr = this.ctx.sampleRate;
      const dur = 0.68;
      const len = Math.floor(sr * dur);
      const buf = this.ctx.createBuffer(1, len, sr);
      const out = buf.getChannelData(0);
      const p = 0.97 + Math.random() * 0.06;

      const swordModes = [
        { f: 1085 * p, decay: 9.5, amp: 0.16 },
        { f: 1642 * p, decay: 7.2, amp: 0.24 },
        { f: 1656 * p, decay: 7.8, amp: 0.19 },
        { f: 2490 * p, decay: 6.5, amp: 0.28 },
        { f: 2508 * p, decay: 7.0, amp: 0.21 },
        { f: 3465 * p, decay: 8.5, amp: 0.22 },
        { f: 4580 * p, decay: 11.0, amp: 0.18 },
        { f: 5890 * p, decay: 14.5, amp: 0.14 },
        { f: 7420 * p, decay: 19.0, amp: 0.1 },
        { f: 9380 * p, decay: 26.0, amp: 0.07 },
      ].map((m) => ({
        ...m,
        phase: Math.random() * 0.4,
        w: (2 * Math.PI * m.f) / sr,
      }));

      let scrapeLp = 0;

      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const white = Math.random() * 2 - 1;

        const clackEnv = Math.exp(-t * 210);
        const guardClick =
          (Math.sin(2 * Math.PI * 820 * t) * 0.5 + white * 0.85) * clackEnv * 1.15;

        let scrapeSample = 0;
        if (t >= 0.006 && t < 0.095) {
          const st = t - 0.006;
          const raspMod = 0.65 + 0.35 * Math.sin(2 * Math.PI * 3100 * st);
          scrapeLp += 0.68 * (white * raspMod - scrapeLp);
          const highScrape = white - scrapeLp * 0.6;
          scrapeSample = highScrape * Math.exp(-st * 42) * 0.48;
        }

        let ring = 0;
        if (t >= 0.003) {
          const rt = t - 0.003;
          const impactChirp = 1 + 0.018 * Math.exp(-rt * 180);
          for (let k = 0; k < swordModes.length; k++) {
            const sm = swordModes[k];
            sm.phase += sm.w * impactChirp;
            ring += Math.sin(sm.phase) * sm.amp * Math.exp(-rt * sm.decay);
          }
        }

        out[i] = Math.tanh((guardClick + scrapeSample + ring) * 1.35) * 0.9;
      }

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.sfxGain);
      src.start(this.ctx.currentTime);
    });
  }

  public playHeavySmash(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const sr = this.ctx.sampleRate;
      const dur = 0.58;
      const len = Math.floor(sr * dur);
      const buf = this.ctx.createBuffer(1, len, sr);
      const out = buf.getChannelData(0);

      let lpBoom = 0;
      let lpWind = 0;

      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const white = Math.random() * 2 - 1;

        const swingEnv = t < 0.09 ? Math.sin((Math.PI * t) / 0.09) * 0.6 : 0;
        lpWind += 0.22 * (white - lpWind);
        const heavySwing = lpWind * swingEnv;

        let smash = 0;
        if (t >= 0.06) {
          const it = t - 0.06;
          const bodyPunch =
            Math.sin(2 * Math.PI * (92 * Math.exp(-it * 6) + 34) * it) * Math.exp(-it * 9.5) * 0.95;
          lpBoom += 0.35 * (white - lpBoom);
          const crunch = lpBoom * Math.exp(-it * 24) * 0.85;
          const clang =
            (Math.sin(2 * Math.PI * 1240 * it) * 0.22 + Math.sin(2 * Math.PI * 1980 * it) * 0.16) *
            Math.exp(-it * 11);
          const stunRing =
            (Math.sin(2 * Math.PI * 2860 * it) * 0.09 + Math.sin(2 * Math.PI * 3420 * it) * 0.07) *
            Math.exp(-it * 4.5);
          smash = bodyPunch + crunch + clang + stunRing;
        }

        out[i] = Math.tanh((heavySwing + smash) * 1.4) * 0.92;
      }

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.sfxGain);
      src.start(this.ctx.currentTime);
    });
  }

  public playFootsteps(stepsCount = 2): void {
    if (!this.init() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const count = Math.min(4, Math.max(2, stepsCount));
    const now = this.ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const t = now + i * 0.095;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.07);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 520 + (i % 2) * 140;
      filter.Q.value = 1.6;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
    }
  }

  public playReactionAlert(): void {
    if (!this.init() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 880.0];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.075;
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playCombatStartHorn(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.01;
      this.playWarDrum(now, 1.0, true);
      [146.83, 220.0].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 0.97, now);
        osc.frequency.linearRampToValueAtTime(freq, now + 0.18);
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        filter.frequency.exponentialRampToValueAtTime(1150, now + 0.35);
        filter.frequency.exponentialRampToValueAtTime(450, now + 1.25);
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.3 : 0.16, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now);
        osc.stop(now + 1.35);
      });
    });
  }

  public playTauntShout(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.01;
      this.playWarDrum(now, 1.15, true);
      [130.81, 196.0, 261.63].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 0.92, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + 0.14);
        osc.frequency.linearRampToValueAtTime(freq * 0.96, now + 0.62);
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(380, now + 0.64);
        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.28 : 0.14, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.66);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now);
        osc.stop(now + 0.7);
      });
    });
  }

  public playEvadeWhoosh(): void {
    if (!this.init() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.22);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(1650, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(520, now + 0.22);
    filter.Q.value = 2.2;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  public playArcaneBolt(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.005;

      // Crystalline arcane zip + shimmer
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1320, now);
      osc1.frequency.exponentialRampToValueAtTime(460, now + 0.24);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1980, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.22);

      const g1 = this.ctx.createGain();
      g1.gain.setValueAtTime(0.001, now);
      g1.gain.linearRampToValueAtTime(0.24, now + 0.02);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(g1);
      osc2.connect(g1);
      g1.connect(this.sfxGain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);

      // Impact pop
      const impact = this.ctx.createOscillator();
      impact.type = 'sine';
      impact.frequency.setValueAtTime(640, now + 0.16);
      impact.frequency.exponentialRampToValueAtTime(180, now + 0.34);
      const gi = this.ctx.createGain();
      gi.gain.setValueAtTime(0.001, now + 0.15);
      gi.gain.linearRampToValueAtTime(0.28, now + 0.17);
      gi.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      impact.connect(gi);
      gi.connect(this.sfxGain);
      impact.start(now + 0.15);
      impact.stop(now + 0.38);
    });
  }

  public playArcaneShield(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.005;
      const chord = [440, 554.37, 659.25, 880];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * 0.94, now + idx * 0.035);
        osc.frequency.exponentialRampToValueAtTime(freq, now + idx * 0.035 + 0.16);
        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.001, now + idx * 0.035);
        g.gain.linearRampToValueAtTime(0.14, now + idx * 0.035 + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(now + idx * 0.035);
        osc.stop(now + 0.75);
      });
    });
  }

  public playFireBreath(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.005;

      // Roaring fire noise sweep
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.75);
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(1350, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(340, now + 0.72);
      filter.Q.value = 1.1;

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.58, now + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.74);

      noise.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);

      // Sub rumble ignition
      const sub = this.ctx.createOscillator();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(110, now);
      sub.frequency.exponentialRampToValueAtTime(42, now + 0.52);
      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.value = 260;
      const sg = this.ctx.createGain();
      sg.gain.setValueAtTime(0.001, now);
      sg.gain.linearRampToValueAtTime(0.28, now + 0.05);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.56);
      sub.connect(subFilter);
      subFilter.connect(sg);
      sg.connect(this.sfxGain);
      sub.start(now);
      sub.stop(now + 0.58);
    });
  }

  public playDivineLaser(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // Crisp luminous sacred beam sweep
      const beam = this.ctx.createOscillator();
      beam.type = 'sine';
      beam.frequency.setValueAtTime(1180, now);
      beam.frequency.exponentialRampToValueAtTime(1640, now + 0.07);
      beam.frequency.exponentialRampToValueAtTime(760, now + 0.28);

      const harmonic = this.ctx.createOscillator();
      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(1760, now);
      harmonic.frequency.exponentialRampToValueAtTime(1320, now + 0.24);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24, now + 0.018);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      const hg = this.ctx.createGain();
      hg.gain.setValueAtTime(0.001, now);
      hg.gain.linearRampToValueAtTime(0.11, now + 0.02);
      hg.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      beam.connect(g);
      harmonic.connect(hg);
      g.connect(this.sfxGain);
      hg.connect(this.sfxGain);

      beam.start(now);
      harmonic.start(now);
      beam.stop(now + 0.32);
      harmonic.stop(now + 0.27);
    });
  }

  public playHolyHeal(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      // Ascending warm celestial triad (D5, F#5, A5, D6)
      const notes = [587.33, 739.99, 880.0, 1174.66];
      notes.forEach((freq, i) => {
        const t = now + i * 0.065;
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const shimmer = this.ctx!.createOscillator();
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(freq * 2, t);

        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

        const sg = this.ctx!.createGain();
        sg.gain.setValueAtTime(0.001, t);
        sg.gain.linearRampToValueAtTime(0.045, t + 0.03);
        sg.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

        osc.connect(g);
        shimmer.connect(sg);
        g.connect(this.sfxGain!);
        sg.connect(this.sfxGain!);
        osc.start(t);
        shimmer.start(t);
        osc.stop(t + 0.55);
        shimmer.stop(t + 0.4);
      });
    });
  }

  public playSacredShield(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;
      const chord = [440.0, 659.25, 880.0, 1318.51];
      chord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + 0.55);

        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.13 / (1 + i * 0.25), now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(now);
        osc.stop(now + 0.72);
      });
    });
  }

  public playDaggerThrow(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // Crisp whistling steel zip
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.24);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1600, now);
      bp.frequency.exponentialRampToValueAtTime(4200, now + 0.09);
      bp.frequency.exponentialRampToValueAtTime(1200, now + 0.22);
      bp.Q.value = 3.2;

      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.001, now);
      ng.gain.linearRampToValueAtTime(0.32, now + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

      noise.connect(bp);
      bp.connect(ng);
      ng.connect(this.sfxGain);
      noise.start(now);

      // Sharp metallic blade sting at impact
      const sting = this.ctx.createOscillator();
      sting.type = 'triangle';
      sting.frequency.setValueAtTime(2480, now + 0.14);
      sting.frequency.exponentialRampToValueAtTime(640, now + 0.28);
      const sg = this.ctx.createGain();
      sg.gain.setValueAtTime(0.001, now + 0.13);
      sg.gain.linearRampToValueAtTime(0.22, now + 0.15);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      sting.connect(sg);
      sg.connect(this.sfxGain);
      sting.start(now + 0.13);
      sting.stop(now + 0.32);
    });
  }

  public playStealthVanish(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // Shadowy smoky exhale
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.55);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1800, now);
      lp.frequency.exponentialRampToValueAtTime(260, now + 0.5);

      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.001, now);
      ng.gain.linearRampToValueAtTime(0.34, now + 0.06);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.54);

      noise.connect(lp);
      lp.connect(ng);
      ng.connect(this.sfxGain);
      noise.start(now);

      // Low shadow hum fade
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(98, now + 0.48);
      const og = this.ctx.createGain();
      og.gain.setValueAtTime(0.001, now);
      og.gain.linearRampToValueAtTime(0.18, now + 0.05);
      og.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(og);
      og.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.52);
    });
  }

  public playSprintDash(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.34);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(380, now);
      bp.frequency.exponentialRampToValueAtTime(2400, now + 0.14);
      bp.frequency.exponentialRampToValueAtTime(680, now + 0.32);
      bp.Q.value = 1.8;

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.36, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.33);

      noise.connect(bp);
      bp.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);
    });
  }

  public playCritImpact(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // Crisp blazing metallic crit chime + punchy snap
      const freqs = [1174.66, 1760.0, 2349.32];
      freqs.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.018);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.06, now + i * 0.018 + 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.88, now + i * 0.018 + 0.28);

        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.001, now + i * 0.018);
        g.gain.linearRampToValueAtTime(0.14 / (1 + i * 0.35), now + i * 0.018 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.018 + 0.3);

        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(now + i * 0.018);
        osc.stop(now + i * 0.018 + 0.32);
      });

      const punch = this.ctx.createOscillator();
      punch.type = 'sine';
      punch.frequency.setValueAtTime(165, now);
      punch.frequency.exponentialRampToValueAtTime(52, now + 0.14);
      const pg = this.ctx.createGain();
      pg.gain.setValueAtTime(0.32, now);
      pg.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      punch.connect(pg);
      pg.connect(this.sfxGain);
      punch.start(now);
      punch.stop(now + 0.18);
    });
  }

  public playBackstabCrit(isCritical = false): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime;

      // 1. Phantom shadow dash whoosh (stealth approach)
      const dashNoise = this.ctx.createBufferSource();
      dashNoise.buffer = this.createNoiseBuffer(0.22);
      const dashFilter = this.ctx.createBiquadFilter();
      dashFilter.type = 'bandpass';
      dashFilter.frequency.setValueAtTime(520, now);
      dashFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
      dashFilter.frequency.exponentialRampToValueAtTime(680, now + 0.2);
      dashFilter.Q.value = 2.0;
      const dg = this.ctx.createGain();
      dg.gain.setValueAtTime(0.001, now);
      dg.gain.linearRampToValueAtTime(0.36, now + 0.04);
      dg.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
      dashNoise.connect(dashFilter);
      dashFilter.connect(dg);
      dg.connect(this.sfxGain);
      dashNoise.start(now);

      // 2. Razor dagger plunge + deep X-rip metallic shriek
      const strikeAt = now + 0.055;
      const bladeFreqs = isCritical ? [1960, 2940, 4186, 5200] : [1680, 2540, 3680];
      bladeFreqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, strikeAt + idx * 0.022);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.32, strikeAt + 0.34 + idx * 0.022);

        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.001, strikeAt + idx * 0.022);
        g.gain.linearRampToValueAtTime(
          (isCritical ? 0.22 : 0.17) / (1 + idx * 0.25),
          strikeAt + idx * 0.022 + 0.012
        );
        g.gain.exponentialRampToValueAtTime(0.001, strikeAt + 0.38 + idx * 0.022);

        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(strikeAt + idx * 0.022);
        osc.stop(strikeAt + 0.4 + idx * 0.022);
      });

      // 3. Visceral flesh-tear crisp crackle
      const ripNoise = this.ctx.createBufferSource();
      ripNoise.buffer = this.createNoiseBuffer(0.28);
      const ripFilter = this.ctx.createBiquadFilter();
      ripFilter.type = 'highpass';
      ripFilter.frequency.setValueAtTime(1400, strikeAt);
      ripFilter.frequency.exponentialRampToValueAtTime(420, strikeAt + 0.24);
      const rg = this.ctx.createGain();
      rg.gain.setValueAtTime(0.001, strikeAt);
      rg.gain.linearRampToValueAtTime(isCritical ? 0.48 : 0.36, strikeAt + 0.018);
      rg.gain.exponentialRampToValueAtTime(0.001, strikeAt + 0.26);
      ripNoise.connect(ripFilter);
      ripFilter.connect(rg);
      rg.connect(this.sfxGain);
      ripNoise.start(strikeAt);

      // 4. Heavy devastating sub-bass impact thud
      const sub = this.ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(isCritical ? 170 : 145, strikeAt);
      sub.frequency.exponentialRampToValueAtTime(34, strikeAt + 0.34);
      const sg = this.ctx.createGain();
      sg.gain.setValueAtTime(isCritical ? 0.56 : 0.46, strikeAt);
      sg.gain.exponentialRampToValueAtTime(0.001, strikeAt + 0.36);
      sub.connect(sg);
      sg.connect(this.sfxGain);
      sub.start(strikeAt);
      sub.stop(strikeAt + 0.38);
    });
  }

  public playTankBusterTelegraph(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.01;

      // Aggressive FFXIV-inspired triple lock-on warning pulse + ominous sub swell
      const pulseFreqs = [880, 1174.66, 1567.98];
      pulseFreqs.forEach((freq, idx) => {
        const t = now + idx * 0.12;
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.86, t + 0.11);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq * 1.15;
        filter.Q.value = 3.2;

        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.28, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.sfxGain!);
        osc.start(t);
        osc.stop(t + 0.15);
      });

      // Heavy ominous bass charge swell
      const sub = this.ctx.createOscillator();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(55, now);
      sub.frequency.exponentialRampToValueAtTime(112, now + 0.55);
      sub.frequency.exponentialRampToValueAtTime(42, now + 0.88);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(220, now);
      lp.frequency.exponentialRampToValueAtTime(620, now + 0.5);
      lp.frequency.exponentialRampToValueAtTime(180, now + 0.88);
      const sg = this.ctx.createGain();
      sg.gain.setValueAtTime(0.001, now);
      sg.gain.linearRampToValueAtTime(0.36, now + 0.25);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      sub.connect(lp);
      lp.connect(sg);
      sg.connect(this.sfxGain);
      sub.start(now);
      sub.stop(now + 0.92);
    });
  }

  public playSlimeImpact(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.005;

      // Massive sub-bass crush
      const sub = this.ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(28, now + 0.55);
      const sg = this.ctx.createGain();
      sg.gain.setValueAtTime(0.68, now);
      sg.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      sub.connect(sg);
      sg.connect(this.sfxGain);
      sub.start(now);
      sub.stop(now + 0.62);

      // Viscous squelching acid splatter
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.62);
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(980, now);
      bp.frequency.exponentialRampToValueAtTime(280, now + 0.22);
      bp.frequency.exponentialRampToValueAtTime(1450, now + 0.36);
      bp.frequency.exponentialRampToValueAtTime(340, now + 0.6);
      bp.Q.value = 2.6;
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.001, now);
      ng.gain.linearRampToValueAtTime(0.54, now + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.61);
      noise.connect(bp);
      bp.connect(ng);
      ng.connect(this.sfxGain);
      noise.start(now);
    });
  }

  public playPoisonSizzle(): void {
    if (this.isMuted) return;
    this.runWhenReady(() => {
      if (this.isMuted || !this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + 0.005;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.45);
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.setValueAtTime(2400, now);
      hp.frequency.exponentialRampToValueAtTime(4800, now + 0.16);
      hp.frequency.exponentialRampToValueAtTime(1900, now + 0.42);
      hp.Q.value = 2.4;

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.28, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

      noise.connect(hp);
      hp.connect(g);
      g.connect(this.sfxGain);
      noise.start(now);

      // Bubbling corrosive chirp
      [420, 560, 490].forEach((freq, i) => {
        const t = now + i * 0.09;
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.65, t + 0.07);
        const bg = this.ctx!.createGain();
        bg.gain.setValueAtTime(0.001, t);
        bg.gain.linearRampToValueAtTime(0.11, t + 0.015);
        bg.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(bg);
        bg.connect(this.sfxGain!);
        osc.start(t);
        osc.stop(t + 0.09);
      });
    });
  }

  public playVictoryFanfare(): void {
    if (!this.init() || this.isMuted || !this.ctx || !this.sfxGain) return;
    this.stopBattleMusic();
    const now = this.ctx.currentTime;
    const notes = [293.66, 369.99, 440.0, 587.33];
    notes.forEach((freq, i) => {
      const t = now + i * 0.13;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.24, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + (i === 3 ? 0.95 : 0.38));
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 1.0);
    });
  }

  public playDefeatSound(): void {
    if (!this.init() || this.isMuted || !this.ctx || !this.sfxGain) return;
    this.stopBattleMusic();
    const now = this.ctx.currentTime;
    const notes = [293.66, 277.18, 261.63, 220.0];
    notes.forEach((freq, i) => {
      const t = now + i * 0.22;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 650;
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  private playWarDrum(time: number, accent = 1.0, toSfx = false): void {
    if (!this.ctx || !this.sfxGain || !this.musicGain) return;
    const dest = toSfx ? this.sfxGain : this.musicGain;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(105 * accent, time);
    osc.frequency.exponentialRampToValueAtTime(34, time + 0.24);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55 * accent, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.3);

    const skin = this.ctx.createBufferSource();
    skin.buffer = this.createNoiseBuffer(0.05);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 260;
    const skinGain = this.ctx.createGain();
    skinGain.gain.setValueAtTime(0.22 * accent, time);
    skinGain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    skin.connect(filter);
    filter.connect(skinGain);
    skinGain.connect(dest);
    skin.start(time);
  }

  private playPercTick(time: number, vol = 0.14): void {
    if (!this.ctx || !this.musicGain) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.createNoiseBuffer(0.035);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2200;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.musicGain);
    src.start(time);
  }

  private playSpiccatoStrings(midiNote: number, time: number, duration: number, vel = 0.18): void {
    if (!this.ctx || !this.musicGain) return;
    const freq = this.midiToFreq(midiNote);
    [-6, 6].forEach((detuneCents) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detuneCents;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1450, time);
      filter.frequency.exponentialRampToValueAtTime(420, time + duration);
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.001, time);
      g.gain.linearRampToValueAtTime(vel * 0.5, time + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.musicGain!);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    });
  }

  private playDarkPadChord(midiNotes: number[], time: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    midiNotes.forEach((m) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = this.midiToFreq(m);
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 720;
      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0.001, time);
      g.gain.linearRampToValueAtTime(0.085, time + 0.35);
      g.gain.setValueAtTime(0.075, time + duration - 0.35);
      g.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.musicGain!);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  }

  private playLeadBrass(midiNote: number, time: number, duration: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = this.midiToFreq(midiNote);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, time);
    filter.frequency.linearRampToValueAtTime(1350, time + 0.08);
    filter.frequency.exponentialRampToValueAtTime(600, time + duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.11, time + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + duration + 0.03);
  }

  private scheduleStep(stepIdx: number, time: number): void {
    if (!this.isMusicEnabled || this.isMuted) return;
    const barStep = stepIdx % 8;
    const loopStep = stepIdx % 32;

    if (barStep === 0) this.playWarDrum(time, 1.0);
    else if (barStep === 3) this.playWarDrum(time, 0.68);
    else if (barStep === 4) this.playWarDrum(time, 0.88);
    else if (barStep === 6) this.playWarDrum(time, 0.62);

    if (barStep % 2 === 1) {
      this.playPercTick(time, barStep === 7 ? 0.16 : 0.09);
    }

    const bassNote = this.BASS_PATTERN[loopStep];
    const isAccent = barStep === 0 || barStep === 4 || barStep === 2;
    this.playSpiccatoStrings(bassNote, time, this.STEP_DURATION * 0.9, isAccent ? 0.22 : 0.14);

    if (barStep === 0) {
      const barIndex = Math.floor(loopStep / 8);
      this.playDarkPadChord(this.CHORD_BARS[barIndex], time, this.STEP_DURATION * 7.8);
    }

    const melody = this.MELODY_EVENTS[loopStep];
    if (melody) {
      this.playLeadBrass(melody.note, time, this.STEP_DURATION * melody.len * 0.92);
    }
  }

  private schedulerLoop = (): void => {
    if (!this.isMusicPlaying || !this.ctx) return;
    if (this.ctx.state !== 'running') {
      void this.ctx.resume();
      this.musicSchedulerTimer = setTimeout(this.schedulerLoop, 80);
      return;
    }

    if (this.nextStepTime < this.ctx.currentTime - 0.1) {
      this.nextStepTime = this.ctx.currentTime + 0.05;
    }

    while (this.nextStepTime < this.ctx.currentTime + 0.18) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += this.STEP_DURATION;
      this.currentStep = (this.currentStep + 1) % 32;
    }

    this.musicSchedulerTimer = setTimeout(this.schedulerLoop, 45);
  };

  public startBattleMusic(): void {
    this.runWhenReady(() => {
      if (!this.ctx) return;
      this.stopBattleMusic();
      this.isMusicPlaying = true;
      this.currentStep = 0;
      this.nextStepTime = this.ctx.currentTime + 0.12;
      if (this.musicGain) {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(
          this.isMusicEnabled && !this.isMuted ? 0.45 : 0.0,
          this.ctx.currentTime + 0.6
        );
      }
      this.schedulerLoop();
    });
  }

  public stopBattleMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicSchedulerTimer) {
      clearTimeout(this.musicSchedulerTimer);
      this.musicSchedulerTimer = null;
    }
    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
    }
  }

  public toggleMusic(): AudioPrefs {
    this.init();
    this.isMusicEnabled = !this.isMusicEnabled;
    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.isMusicEnabled && !this.isMuted ? 0.45 : 0.0, now);
    }
    const prefs = this.getPrefs();
    saveAudioPrefs(prefs);
    return prefs;
  }

  public toggleMuteAll(): AudioPrefs {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.92, now);
    }
    const prefs = this.getPrefs();
    saveAudioPrefs(prefs);
    return prefs;
  }
}

export const gameAudio = new TacticalAudioEngine();
