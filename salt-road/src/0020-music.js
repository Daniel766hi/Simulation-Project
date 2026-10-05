  // ================================================================== MUSIC
  // Everything is synthesised live with Web Audio: no files. Each track is a 64-step loop.
  const Music = {
    ctx: null, master: null, bus: null, sfx: null, on: true, track: null, step: 0, next: 0, timer: null, pending: null,
    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      try { this.ctx = new AC(); } catch { return; }
      this.master = this.ctx.createGain(); this.master.gain.value = this.on ? 0.55 : 0; this.master.connect(this.ctx.destination);
      this.bus = this.ctx.createGain(); this.bus.gain.value = 0.5 * SETTINGS.music; this.bus.connect(this.master);
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = 0.6 * SETTINGS.sfx; this.sfx.connect(this.master);
      const len = this.ctx.sampleRate; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.timer = setInterval(() => this.tick(), 25);
      if (this.pending) { const p = this.pending; this.pending = null; this.play(p); }
    },
    volumes() { if (!this.ctx) return; this.bus.gain.setTargetAtTime(0.5 * SETTINGS.music * (paused ? 0.35 : 1), this.ctx.currentTime, 0.05); this.sfx.gain.setTargetAtTime(0.6 * SETTINGS.sfx, this.ctx.currentTime, 0.05); },
    toggle() { this.on = !this.on; if (this.master) this.master.gain.setTargetAtTime(this.on ? 0.55 : 0, this.ctx.currentTime, 0.05); try { localStorage.setItem("salt-road-music", this.on ? "1" : "0"); } catch { /* storage unavailable */ } },
    play(name) {
      if (!this.ctx) { this.pending = name; return; }
      if (this.ctx.state === "suspended") this.ctx.resume();
      if (this.track === name) return;
      this.track = name; this.step = 0; this.next = this.ctx.currentTime + 0.08;
    },
    tick() {
      if (!this.track || !TRACKS[this.track]) return;
      const tr = TRACKS[this.track], dur = 60 / tr.bpm / 4;
      while (this.next < this.ctx.currentTime + 0.15) { tr.play(this.step % 64, this.next, dur); this.next += dur; this.step++; }
    },
    tone(freq, t, dur, type = "triangle", vol = 0.12, attack = 0.01, release = 0.2, dest = null, detune = 0) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = freq; o.detune.value = detune;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur + release);
      o.connect(g); g.connect(dest || this.bus); o.start(t); o.stop(t + attack + dur + release + 0.05);
    },
    noise(t, dur, vol = 0.1, freq = 2000, type = "bandpass", dest = null) {
      if (!this.ctx) return;
      const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      s.buffer = this.noiseBuf; f.type = type; f.frequency.value = freq;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(dest || this.bus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    },
    kick(t, vol = 0.5) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + 0.25);
    },
    sound(kind) {
      if (!this.ctx || !this.on) return;
      const t = this.ctx.currentTime + 0.01, S = this.sfx;
      if (kind === "hit") { this.noise(t, 0.12, 0.35, 900, "lowpass", S); this.tone(110, t, 0.04, "square", 0.08, 0.005, 0.08, S); }
      if (kind === "crit") { this.noise(t, 0.2, 0.5, 1400, "lowpass", S); this.tone(880, t, 0.05, "square", 0.08, 0.005, 0.15, S); this.tone(660, t + 0.06, 0.05, "square", 0.08, 0.005, 0.2, S); }
      if (kind === "heal") [523, 659, 784].forEach((f, i) => this.tone(f, t + i * 0.07, 0.08, "sine", 0.1, 0.01, 0.3, S));
      if (kind === "click") this.tone(1200, t, 0.01, "square", 0.04, 0.002, 0.03, S);
      if (kind === "miss") this.noise(t, 0.15, 0.2, 4000, "highpass", S);
      if (kind === "step") this.noise(t, 0.04, 0.05, 700, "lowpass", S);
      if (kind === "dash") { this.noise(t, 0.22, 0.3, 1800, "bandpass", S); this.tone(260, t, 0.06, "sine", 0.06, 0.005, 0.12, S); this.tone(520, t + 0.03, 0.05, "sine", 0.04, 0.005, 0.1, S); }
      if (kind === "item") [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, t + i * 0.06, 0.06, "triangle", 0.1, 0.005, 0.15, S));
      if (kind === "bleed") this.noise(t, 0.25, 0.25, 300, "lowpass", S);
      if (kind === "encounter") { [220, 262, 330, 440].forEach((f, i) => this.tone(f, t + i * 0.05, 0.05, "sawtooth", 0.06, 0.005, 0.1, S)); this.noise(t, 0.4, 0.2, 600, "lowpass", S); }
      if (kind === "victory") [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.12, 0.1, "square", 0.07, 0.005, 0.25, S));
      if (kind === "defeat") [392, 370, 349, 262].forEach((f, i) => this.tone(f, t + i * 0.3, 0.25, "triangle", 0.1, 0.01, 0.5, S));
      if (kind === "boss") { this.kick(t, 0.6); this.tone(55, t, 0.8, "sawtooth", 0.12, 0.01, 1.2, S); this.tone(58, t, 0.8, "sawtooth", 0.12, 0.01, 1.2, S); }
    },
  };
  try { Music.on = localStorage.getItem("salt-road-music") !== "0"; } catch { /* storage unavailable */ }
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);        // MIDI note to frequency
  // chord tables: MIDI note numbers
  const TRACKS = {
    village: { bpm: 92, play(s, t, d) {
      const prog = [[53, 57, 60, 65], [48, 55, 60, 64], [50, 57, 62, 65], [46, 53, 58, 62]];
      const ch = prog[Math.floor(s / 16) % 4];
      if (s % 16 === 0) Music.tone(hz(ch[0] - 12), t, d * 14, "sine", 0.12, 0.02, 0.6);
      if (s % 2 === 0) { const n = ch[(s / 2) % 4]; Music.tone(hz(n + 12), t, d * 1.2, "triangle", 0.07, 0.005, 0.25); }
      const mel = [72, -1, 74, 76, -1, 74, 72, -1, 69, -1, 72, -1, 74, -1, -1, -1];
      if (s >= 32) { const m = mel[s % 16]; if (m > 0) Music.tone(hz(m), t, d * 1.6, "square", 0.025, 0.01, 0.2); }
    } },
    flats: { bpm: 72, play(s, t, d) {
      const prog = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]];
      const ch = prog[Math.floor(s / 16) % 4];
      if (s % 16 === 0) { Music.tone(hz(ch[0] - 12), t, d * 15, "sine", 0.14, 0.2, 0.8); Music.tone(hz(ch[1]), t, d * 15, "triangle", 0.03, 0.5, 1); Music.noise(t, d * 16, 0.02, 500, "lowpass"); }
      if (s % 3 === 0) { const n = ch[(s / 3) % 4] + 12; Music.tone(hz(n), t, d * 2, "triangle", 0.05, 0.01, 0.6); }
      const lead = [74, -1, -1, 77, -1, 76, -1, -1, 74, -1, 72, -1, -1, -1, 69, -1];
      if (s >= 16 && s < 48 && lead[s % 16] > 0) Music.tone(hz(lead[s % 16]), t, d * 3, "sine", 0.04, 0.05, 0.6);
    } },
    cathedral: { bpm: 56, play(s, t, d) {
      if (s % 32 === 0) { Music.tone(hz(38), t, d * 31, "sawtooth", 0.035, 0.8, 1.5); Music.tone(hz(45), t, d * 31, "sine", 0.06, 0.8, 1.5); }
      const chords = [[62, 65, 69], [58, 62, 65], [61, 64, 69], [62, 65, 70]];
      if (s % 16 === 0) for (const n of chords[Math.floor(s / 16) % 4]) Music.tone(hz(n), t, d * 15, "sine", 0.03, 1.2, 1.5, null, rand(-6, 6));
      if (s % 32 === 8) { Music.tone(hz(86), t, d * 0.5, "sine", 0.06, 0.005, 2.5); Music.tone(hz(93), t, d * 0.5, "sine", 0.03, 0.005, 2.2); }
      if (s % 64 === 40) Music.noise(t, d * 12, 0.03, 300, "lowpass");
    } },
    grove: { bpm: 84, play(s, t, d) {
      const prog = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]];
      const ch = prog[Math.floor(s / 16) % 4];
      if (s % 16 === 0) Music.tone(hz(ch[0] - 12), t, d * 15, "sine", 0.13, 0.1, 0.8);
      if (s % 2 === 1) Music.tone(hz(ch[(s >> 1) % 4] + 12), t, d, "triangle", 0.045, 0.005, 0.3);
      if (s % 8 === 4) Music.noise(t, 0.05, 0.05, 5000, "highpass");
      if (s % 16 === 10) Music.tone(hz(ch[2] + 24), t, d * 2, "sine", 0.03, 0.02, 0.8);
    } },
    battle: { bpm: 140, play(s, t, d) {
      if (s % 8 === 0) Music.kick(t, 0.45);
      if (s % 8 === 4) Music.noise(t, 0.12, 0.18, 1800);
      if (s % 2 === 1) Music.noise(t, 0.03, 0.05, 7000, "highpass");
      const bass = [38, 38, 50, 38, 41, 38, 48, 38, 36, 36, 48, 36, 40, 40, 52, 40];
      Music.tone(hz(bass[s % 16] - (Math.floor(s / 16) % 2 ? 2 : 0)), t, d * 0.8, "sawtooth", 0.06, 0.005, 0.08);
      const lead = [62, -1, 65, 62, 69, -1, 67, 65, 64, -1, 62, -1, 60, 62, -1, -1];
      if (s >= 32) { const m = lead[s % 16]; if (m > 0) Music.tone(hz(m + 12), t, d * 1.5, "square", 0.03, 0.005, 0.1); }
    } },
    boss: { bpm: 150, play(s, t, d) {
      if (s % 4 === 0) Music.kick(t, 0.5);
      if (s % 8 === 4) Music.noise(t, 0.16, 0.22, 1500);
      Music.noise(t, 0.02, 0.04, 8000, "highpass");
      const bass = [37, 37, 49, 37, 40, 40, 52, 40, 43, 43, 55, 43, 42, 42, 54, 41];
      Music.tone(hz(bass[s % 16]), t, d * 0.8, "sawtooth", 0.07, 0.005, 0.07);
      const lead = [73, 72, 73, -1, 76, -1, 75, 73, 72, -1, 69, -1, 70, -1, 69, 67];
      if ((s >> 4) % 2 === 1) { const m = lead[s % 16]; if (m > 0) Music.tone(hz(m), t, d * 1.2, "sawtooth", 0.028, 0.005, 0.08); }
      if (s % 32 === 0) Music.tone(hz(25), t, d * 30, "sawtooth", 0.04, 0.3, 0.5);
    } },
    final: { bpm: 160, play(s, t, d) {
      if (s % 4 === 0) Music.kick(t, 0.55); if (s % 4 === 2) Music.kick(t, 0.25);
      if (s % 8 === 4) Music.noise(t, 0.18, 0.25, 1300);
      Music.noise(t, 0.02, 0.05, 9000, "highpass");
      const bass = [34, 34, 46, 34, 37, 37, 49, 37, 39, 39, 51, 39, 41, 40, 39, 37];
      Music.tone(hz(bass[s % 16]), t, d * 0.85, "sawtooth", 0.075, 0.005, 0.07);
      const choir = [[58, 61, 65], [61, 64, 68], [63, 66, 70], [65, 68, 72]];
      if (s % 16 === 0) for (const n of choir[(s >> 4) % 4]) Music.tone(hz(n), t, d * 15, "sine", 0.025, 0.3, 0.4, null, rand(-8, 8));
      const lead = [70, -1, 73, 72, 70, -1, 68, -1, 66, 68, 70, -1, 73, -1, 75, -1];
      if (s >= 32) { const m = lead[s % 16]; if (m > 0) Music.tone(hz(m + 12), t, d * 1.2, "square", 0.028, 0.005, 0.1); }
    } },
    oru: { bpm: 108, play(s, t, d) {
      const prog = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
      const ch = prog[Math.floor(s / 16) % 4];
      if (s % 8 === 0) Music.tone(hz(ch[0] - 12), t, d * 6, "triangle", 0.1, 0.01, 0.3);
      if (s % 8 === 4) Music.tone(hz(ch[0] - 5), t, d * 3, "triangle", 0.07, 0.01, 0.2);
      if (s % 2 === 0) Music.tone(hz(ch[1 + (s / 2) % 3] + 12), t, d, "square", 0.025, 0.005, 0.12);
      const mel = [76, -1, 79, 77, 76, -1, 74, -1, 72, -1, 74, 76, -1, -1, 72, -1];
      if (s >= 16) { const m = mel[s % 16]; if (m > 0) Music.tone(hz(m), t, d * 1.5, "triangle", 0.05, 0.01, 0.25); }
      if (s % 4 === 2) Music.noise(t, 0.03, 0.04, 6000, "highpass");
    } },
    marsh: { bpm: 60, play(s, t, d) {
      if (s % 32 === 0) { Music.tone(hz(33), t, d * 30, "sine", 0.12, 1, 1.5); Music.tone(hz(40), t, d * 30, "triangle", 0.03, 1.5, 1.5); }
      const notes = [57, 60, 64, 63, 60, 57, 55, 57];
      if (s % 6 === 0) Music.tone(hz(notes[(s / 6) % 8] + 12), t, d * 4, "sine", 0.04, 0.2, 1.2, null, rand(-10, 10));
      if (s % 16 === 11) Music.noise(t, d * 6, 0.02, 400, "lowpass");
      if (s % 64 === 40) { Music.tone(hz(45), t, d * 2, "sine", 0.06, 0.01, 0.4); Music.tone(hz(40), t + d * 2, d * 2, "sine", 0.06, 0.01, 0.6); }
    } },
    coast: { bpm: 96, play(s, t, d) {
      const prog = [[50, 57, 62], [48, 55, 60], [46, 53, 58], [45, 52, 57]];
      const ch = prog[Math.floor(s / 12) % 4];
      if (s % 6 === 0) Music.tone(hz(ch[0] - 12), t, d * 4, "triangle", 0.1, 0.01, 0.3);
      if (s % 6 === 3) Music.tone(hz(ch[1]), t, d * 2, "triangle", 0.05, 0.01, 0.2);
      const mel = [74, -1, 74, 72, -1, 69, 70, -1, 72, 74, -1, -1];
      if (s % 48 >= 12) { const m = mel[s % 12]; if (m > 0) Music.tone(hz(m), t, d * 1.6, "square", 0.028, 0.01, 0.2); }
      if (s % 24 === 0) Music.noise(t, d * 18, 0.05, 700, "lowpass");
    } },
    spire: { bpm: 132, play(s, t, d) {
      const prog = [[49, 56, 61, 64], [47, 54, 59, 63], [45, 52, 57, 61], [44, 51, 56, 60]];
      const ch = prog[Math.floor(s / 16) % 4];
      Music.tone(hz(ch[s % 4] + 12 * (1 + (s >> 2) % 2)), t, d * 0.8, "sawtooth", 0.02, 0.003, 0.08);
      if (s % 8 === 0) Music.kick(t, 0.3);
      if (s % 16 === 0) Music.tone(hz(ch[0] - 12), t, d * 15, "sawtooth", 0.05, 0.1, 0.5);
      if (s % 32 === 28) Music.noise(t, d * 8, 0.12, 300, "lowpass");
    } },
    deep: { bpm: 50, play(s, t, d) {
      if (s % 32 === 0) { Music.tone(hz(26), t, d * 31, "sawtooth", 0.035, 1, 2); Music.tone(hz(33), t, d * 31, "sine", 0.08, 1, 2); }
      if (s % 16 === 8) Music.tone(hz([69, 68, 72, 63][(s >> 4) % 4]), t, d * 10, "sine", 0.03, 1.5, 2, null, rand(-15, 15));
      if (s % 8 === 3 && Math.random() < 0.5) Music.tone(hz(84 + Math.floor(Math.random() * 6)), t, d, "sine", 0.015, 0.005, 1.5);
    } },
    ending: { bpm: 66, play(s, t, d) {
      const prog = [[53, 60, 65, 69], [50, 57, 62, 65], [46, 58, 62, 65], [48, 55, 60, 64]];
      const ch = prog[Math.floor(s / 16) % 4];
      if (s % 16 === 0) for (const n of ch) Music.tone(hz(n), t, d * 15, "sine", 0.035, 0.6, 1.2);
      if (s % 4 === 0) Music.tone(hz(ch[(s / 4) % 4] + 12), t, d * 3, "triangle", 0.05, 0.01, 0.9);
      if (s % 32 === 16) Music.tone(hz(84), t, d, "sine", 0.05, 0.005, 3);
    } },
  };

