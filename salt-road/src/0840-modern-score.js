  // ================================================================== MODERN SCORE
  // Every region and every boss gets its own track in a modern style: lo-fi and boom-bap hip-hop, trap and drill,
  // soul, funk, rock, metal, reggae/dub, drum & bass, synthwave and darkwave, blues, afrobeat, grime, trip-hop. It is
  // all still synthesised live (no recordings, no vocals): a small drum kit, 808s, electric piano, organ, distorted
  // guitar, brass, pads and a bell, driven by genre pattern generators. Settings → Music style switches back to the
  // original score at any time.
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const CH = { m7: [0, 3, 7, 10], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m9: [0, 3, 7, 10, 14], m: [0, 3, 7], M: [0, 4, 7], "5": [0, 7, 12], sus: [0, 5, 7, 10], dim: [0, 3, 6, 9], "9": [0, 4, 7, 10, 14], add9: [0, 4, 7, 14] };
  const SCALE = { minp: [0, 3, 5, 7, 10], majp: [0, 2, 4, 7, 9], dor: [0, 2, 3, 5, 7, 9, 10], phr: [0, 1, 3, 5, 7, 8, 10], blues: [0, 3, 5, 6, 7, 10], hm: [0, 2, 3, 5, 7, 8, 11] };
  const hsh = (a, b) => { let x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  Object.assign(Music, {
    fx() {   // a distortion bus for guitars and a dub delay, made on first use
      if (this.dist || !this.ctx) return;
      const c = this.ctx, ws = c.createWaveShaper(), cv = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; cv[i] = Math.tanh(x * 6) * 0.9; }
      ws.curve = cv; const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3400; const g = c.createGain(); g.gain.value = 0.35;
      ws.connect(lp); lp.connect(g); g.connect(this.bus); this.dist = ws;
      const dl = c.createDelay(1), fb = c.createGain(), wet = c.createGain(); dl.delayTime.value = 0.32; fb.gain.value = 0.38; wet.gain.value = 0.5;
      dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(this.bus); this.delay = dl;
    },
    syn(freq, t, dur, o = {}) {   // one filtered oscillator note
      if (!this.ctx) return;
      const c = this.ctx, osc = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
      osc.type = o.type || "sawtooth"; osc.frequency.setValueAtTime(freq, t); if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + (o.glideT || dur * 0.6)); osc.detune.value = o.detune || 0;
      f.type = "lowpass"; f.frequency.setValueAtTime(o.cut || 2400, t); if (o.cutEnd) f.frequency.exponentialRampToValueAtTime(o.cutEnd, t + dur); f.Q.value = o.q || 0.8;
      const v = o.vol || 0.06, a = o.a || 0.005, r = o.r || 0.08;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.setValueAtTime(v, t + Math.max(a, dur * (o.hold || 0.6))); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + r);
      osc.connect(f); f.connect(g); g.connect(o.dest || this.bus); if (o.send) g.connect(o.send);
      osc.start(t); osc.stop(t + dur + r + 0.05);
    },
    k808(freq, t, dur, vol = 0.34, glide) { this.syn(freq * 2.2, t, 0.03, { type: "sine", vol: vol * 0.7, r: 0.02, cut: 800 }); this.syn(freq, t, dur, { type: "sine", vol, a: 0.004, r: 0.18, cut: 900, hold: 0.3, glide, glideT: dur * 0.5 }); },
    kickT(t, vol = 0.45) { this.kick(t, vol); },
    snare(t, vol = 0.16, tail = 0.16) { this.noise(t, tail, vol, 1900, "bandpass"); this.tone(190, t, 0.03, "triangle", vol * 0.5, 0.002, 0.08); },
    clap(t, vol = 0.14) { for (let i = 0; i < 3; i++) this.noise(t + i * 0.011, 0.05 + (i === 2 ? 0.12 : 0), vol, 1250, "bandpass"); },
    hat(t, vol = 0.035, open = false) { this.noise(t, open ? 0.24 : 0.035, vol, 8200, "highpass"); },
    rim(t, vol = 0.05) { this.tone(1750, t, 0.008, "square", vol, 0.001, 0.02); },
    crash(t, vol = 0.07) { this.noise(t, 1.2, vol, 5200, "highpass"); },
    crackle(t, d) { for (let i = 0; i < 3; i++) if (Math.random() < 0.5) this.noise(t + Math.random() * d * 4, 0.006, 0.02 + Math.random() * 0.03, 3000, "highpass"); },
    ep(notes, t, dur, vol = 0.05) { for (const n of notes) { this.syn(NOTE(n), t, dur, { type: "sine", vol, a: 0.004, r: 0.5, cut: 3000, hold: 0.2 }); this.syn(NOTE(n) * 2, t, dur * 0.4, { type: "sine", vol: vol * 0.3, r: 0.2, cut: 4000, hold: 0.1 }); } },
    organ(notes, t, dur, vol = 0.03) { for (const n of notes) for (const [m, v] of [[1, 1], [2, 0.5], [3, 0.3]]) this.syn(NOTE(n) * m, t, dur, { type: "sine", vol: vol * v, a: 0.01, r: 0.08, cut: 5000, hold: 0.95 }); },
    pad(notes, t, dur, vol = 0.022, cut = 1400) { for (const n of notes) for (const dt of [-9, 9]) this.syn(NOTE(n), t, dur, { vol, a: dur * 0.3, r: dur * 0.3, cut, detune: dt, hold: 0.8 }); },
    guitar(notes, t, dur, vol = 0.05) { this.fx(); for (const n of notes) { this.syn(NOTE(n), t, dur, { vol, cut: 5000, dest: this.dist, hold: 0.8, r: 0.05 }); this.syn(NOTE(n) * 1.003, t, dur, { vol: vol * 0.7, cut: 5000, dest: this.dist, hold: 0.8, r: 0.05, type: "square" }); } },
    brass(notes, t, dur, vol = 0.035) { for (const n of notes) this.syn(NOTE(n), t, dur, { vol, a: 0.02, cut: 700, cutEnd: 3200, hold: 0.7, r: 0.1 }); },
    bell(n, t, dur, vol = 0.045) { this.syn(NOTE(n), t, dur, { type: "sine", vol, r: 0.9, cut: 6000, hold: 0.05 }); this.syn(NOTE(n) * 2.76, t, dur * 0.5, { type: "sine", vol: vol * 0.35, r: 0.4, cut: 8000, hold: 0.05 }); },
    pluck(n, t, vol = 0.05, send) { this.syn(NOTE(n), t, 0.08, { type: "triangle", vol, r: 0.18, cut: 3000, cutEnd: 600, hold: 0.1, send }); },
    reese(n, t, dur, vol = 0.05) { for (const dt of [-14, 14]) this.syn(NOTE(n), t, dur, { vol, cut: 420, q: 3, detune: dt, hold: 0.9, r: 0.06 }); },
    sqbass(n, t, dur, vol = 0.07) { this.syn(NOTE(n), t, dur, { type: "square", vol, cut: 900, cutEnd: 300, hold: 0.5, r: 0.04 }); },
    bass(n, t, dur, vol = 0.1, o = {}) { this.syn(NOTE(n), t, dur, { type: o.type || "triangle", vol, cut: o.cut || 700, hold: 0.7, r: 0.06, glide: o.glide }); },
  });
  const chordOf = (spec, bar) => { const [r, q] = spec.prog[bar % spec.prog.length]; return CH[q].map(i => r + i); };
  // a melody drawn from the track's scale, the same every loop
  function lead(spec, s, t, d, inst, dens = 0.22, oct = 24, len = 2) {
    const b = s % 16; if (hsh(spec.seed, s) > dens || (spec.leadBars && !spec.leadBars.includes(Math.floor(s / 16) % 4))) return;
    const sc = SCALE[spec.scale || "minp"], n = spec.key + oct + sc[Math.floor(hsh(spec.seed + 7, s) * sc.length)] + (hsh(spec.seed + 3, b) > 0.8 ? 12 : 0);
    const v = spec.leadVol || 1;
    if (inst === "bell") Music.bell(n, t, d * len, 0.04 * v); else if (inst === "ep") Music.ep([n], t, d * len, 0.05 * v); else if (inst === "organ") Music.organ([n], t, d * len, 0.03 * v);
    else if (inst === "guitar") Music.guitar([n], t, d * len, 0.035 * v); else if (inst === "square") Music.syn(NOTE(n), t, d * len * 0.6, { type: "square", vol: 0.03 * v, cut: 2400, hold: 0.5 });
    else if (inst === "flute") Music.syn(NOTE(n), t, d * len, { type: "sine", vol: 0.045 * v, a: 0.03, cut: 4000 }); else Music.syn(NOTE(n), t, d * len, { vol: 0.03 * v, cut: 2200, a: 0.01 });
  }
  const GENRE = {
    lofi(sp, s, t0, d) { const b = s % 16, bar = Math.floor(s / 16), sw = b % 2 ? d * 0.22 : 0, t = t0 + sw, ch = chordOf(sp, bar);
      if ([0, 7, 10].includes(b) && !(b === 7 && bar % 2 === 0)) Music.kickT(t, 0.34);
      if (b === 4 || b === 12) { Music.snare(t, 0.08, 0.12); Music.clap(t, 0.05); }
      if (b % 2 === 0 && hsh(sp.seed, s) > 0.12) Music.hat(t, 0.022);
      if (b === 0) { Music.ep(ch, t, d * 13, 0.035); Music.crackle(t, d); Music.bass(ch[0] - 12, t, d * 6, 0.1); }
      if (b === 10) { Music.ep(ch.slice(1), t, d * 4, 0.022); Music.bass(ch[0] - 5, t, d * 4, 0.08); }
      lead(sp, s, t, d, sp.leadInst || "ep", 0.16, 12); },
    boombap(sp, s, t0, d) { const b = s % 16, bar = Math.floor(s / 16), t = t0 + (b % 2 ? d * 0.14 : 0), ch = chordOf(sp, bar);
      if ([0, 7, 10].includes(b)) { Music.kickT(t, 0.5); Music.bass(ch[0] - 12, t, d * 2.5, 0.12); }
      if (b === 4 || b === 12) Music.snare(t, 0.2, 0.2);
      if (b % 2 === 0) Music.hat(t, b % 4 === 2 ? 0.04 : 0.028);
      if ((b === 0 || b === 6) && bar % 2 === 0) (sp.stab === "ep" ? Music.ep(ch, t, d * 3, 0.04) : Music.brass(ch, t, d * 2, 0.03));
      if (b === 14 && bar === 3) Music.noise(t, d * 2, 0.06, 1400, "bandpass");
      lead(sp, s, t, d, sp.leadInst || "ep", 0.12, 12); },
    trap(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      const kicks = sp.kicks || [0, 7, 10];
      if (kicks.includes(b)) Music.k808(NOTE(ch[0] - 24 + (b === 10 && bar % 2 ? 3 : 0)), t, d * (b === 0 ? 6 : 3), 0.32);
      if (b === 8) Music.clap(t, 0.15);
      if (bar % 2 === 1 && b >= 14) for (let k = 0; k < 3; k++) Music.hat(t + k * d / 3, 0.03); else Music.hat(t, b % 2 ? 0.02 : 0.034);
      if (b === 6 && bar % 2 === 0) Music.hat(t, 0.03, true);
      if (b === 0) Music.pad(ch, t, d * 15, 0.016, sp.dark ? 800 : 1400);
      lead(sp, s, t, d, sp.leadInst || "bell", sp.dens || 0.24, 24); },
    drill(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      const hits = [0, 3, 6, 10, 13];
      if (hits.includes(b)) { const n = ch[0] - 24 + [0, 0, -2, 3, 0][hits.indexOf(b)]; Music.k808(NOTE(n), t, d * 2.6, 0.3, b === 6 ? NOTE(n + 5) : undefined); }
      if (b === 8 || (b === 14 && bar % 2)) Music.snare(t, 0.16, 0.14);
      if (b % 3 === 0 || (bar === 3 && b > 12)) Music.hat(t, 0.028);
      if (b === 0) { Music.pad(ch, t, d * 15, 0.014, 900); }
      if (b % 4 === 0) Music.syn(NOTE(ch[(b / 4) % ch.length] + 12), t, d * 3, { type: "triangle", vol: 0.028, cut: 1800, r: 0.2 });
      lead(sp, s, t, d, sp.leadInst || "bell", 0.18, 24); },
    soul(sp, s, t0, d) { const b = s % 16, bar = Math.floor(s / 16), t = t0 + (b % 2 ? d * 0.1 : 0), ch = chordOf(sp, bar);
      if ([0, 8, 10].includes(b)) Music.kickT(t, 0.42);
      if (b === 4 || b === 12) Music.snare(t, 0.17, 0.16);
      if (b % 2 === 0) Music.noise(t, 0.05, 0.028, 6500, "bandpass");
      if (b === 0) Music.organ(ch, t, d * 15, 0.02);
      if (b % 4 === 0) { const walk = [ch[0], ch[2], ch[0] + 12, ch[0] + (b === 12 ? 11 : 7)]; Music.bass(walk[b / 4] - 12, t, d * 3, 0.12); }
      if (b === 14 && bar % 2) Music.brass(chordOf(sp, bar + 1).slice(0, 3), t, d * 2, 0.03);
      lead(sp, s, t, d, sp.leadInst || "ep", 0.2, 12); },
    funk(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if ([0, 3, 10].includes(b)) Music.kickT(t, 0.46);
      if (b === 4 || b === 12) Music.snare(t, 0.18, 0.15); if (b === 7 || b === 14) Music.snare(t, 0.04, 0.05);
      Music.hat(t, b % 2 ? 0.018 : 0.03);
      const sl = { 0: 0, 2: 12, 3: 0, 6: 7, 8: 0, 10: 12, 11: 10, 14: 0 }; if (sl[b] !== undefined) Music.syn(NOTE(ch[0] - 12 + sl[b]), t, d * 0.8, { type: "sawtooth", vol: 0.07, cut: 1400, cutEnd: 400, hold: 0.3, r: 0.03 });
      if ([2, 6, 10, 14].includes(b)) for (const n of ch.slice(1)) Music.pluck(n + 12, t, 0.022);
      if ((b === 0 && bar === 0) || (b === 12 && bar === 2)) Music.brass(ch.slice(0, 3).map(n => n + 12), t, d * 2, 0.034);
      lead(sp, s, t, d, sp.leadInst || "square", 0.1, 24); },
    rock(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if (b === 0 || b === 8 || (b === 10 && bar % 2)) Music.kickT(t, 0.5);
      if (b === 4 || b === 12) Music.snare(t, 0.22, 0.2);
      if (b % 2 === 0) Music.hat(t, 0.03); if (b === 0 && bar % 2 === 0) Music.crash(t, 0.06);
      if (b % 2 === 0) Music.guitar([ch[0], ch[0] + 7, ch[0] + 12], t, d * 1.7, 0.03);
      if (b % 2 === 0) Music.bass(ch[0] - 12, t, d * 1.6, 0.11, { type: "sawtooth", cut: 600 });
      if (sp.pad && b === 0) Music.pad(ch, t, d * 15, 0.014, 1600);
      lead(sp, s, t, d, sp.leadInst || "guitar", 0.26, 12, 2); },
    metal(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if (bar >= 2 || [0, 3, 8, 11].includes(b)) Music.kickT(t, bar >= 2 ? 0.34 : 0.48);
      if (b === 4 || b === 12) Music.snare(t, 0.24, 0.18);
      if (b % 4 === 0) Music.hat(t, 0.03); if (b === 0 && bar % 2 === 0) Music.crash(t, 0.07);
      if ([0, 1, 3, 4, 6, 8, 9, 11, 14].includes(b)) Music.guitar([ch[0] - 12, ch[0] - 5], t, d * 0.55, 0.034);
      if (b === 0 && bar === 3) Music.guitar([ch[0], ch[0] + 7, ch[0] + 12], t, d * 7, 0.03);
      if (b % 2 === 0) Music.bass(ch[0] - 24, t, d * 0.9, 0.1, { type: "sawtooth", cut: 500 });
      if (sp.organ && b === 0) Music.organ(ch, t, d * 15, 0.014);
      lead(sp, s, t, d, sp.leadInst || "guitar", sp.dens || 0.16, 12, 1.5); },
    dub(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar); Music.fx();
      if (b === 8) { Music.kickT(t, 0.5); Music.rim(t, 0.07); } if (b === 8 && bar === 3) Music.snare(t, 0.12, 0.3);
      if (b % 2 === 0) Music.hat(t, b % 4 === 2 ? 0.026 : 0.014);
      if (b === 4 || b === 12) for (const n of ch) Music.pluck(n + 12, t, 0.03, Music.delay);
      const bl = { 2: 0, 3: 0, 6: 7, 8: 5, 10: 3, 14: 0 }; if (bl[b] !== undefined) Music.bass(ch[0] - 12 + bl[b], t, d * 1.6, 0.14, { type: "sine", cut: 400 });
      if (b === 0 && bar % 2) Music.organ(ch, t, d * 2, 0.012);
      lead(sp, s, t, d, sp.leadInst || "flute", 0.1, 12); },
    dnb(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if (b === 0 || b === 10) Music.kickT(t, 0.46); if (b === 4 || b === 12) Music.snare(t, 0.2, 0.14);
      Music.hat(t, b % 2 ? 0.016 : 0.026); if (b === 7 || b === 15) Music.snare(t, 0.03, 0.04);
      if (b === 0) { Music.reese(ch[0] - 24, t, d * 7, 0.045); Music.ep(ch, t, d * 14, 0.026); } if (b === 8) Music.reese(ch[0] - 24 + (bar % 2 ? 3 : 0), t, d * 7, 0.045);
      lead(sp, s, t, d, sp.leadInst || "bell", 0.12, 24, 3); },
    synthwave(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if (b % 4 === 0) Music.kickT(t, 0.44); if (b === 4 || b === 12) Music.snare(t, 0.18, 0.28); if (b % 4 === 2) Music.hat(t, 0.03);
      if (b % 2 === 0) Music.syn(NOTE(ch[0] - 12 + (b % 4 ? 12 : 0)), t, d * 1.6, { vol: 0.055, cut: 900, cutEnd: 500, hold: 0.5 });
      if (b === 0) Music.pad(ch, t, d * 15, 0.018, sp.dark ? 900 : 2200);
      lead(sp, s, t, d, sp.leadInst || "saw", 0.28, 24, 2); },
    darkwave(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if (b % 4 === 0) Music.kickT(t, 0.44); if (b === 4 || b === 12) { Music.snare(t, 0.16, 0.3); Music.clap(t, 0.06); } if (b % 2 === 1) Music.hat(t, 0.02);
      Music.syn(NOTE(ch[0] - 12), t, d * 0.8, { vol: 0.045, cut: 700, hold: 0.4 });
      if (b === 0) { for (const n of ch) Music.syn(NOTE(n + 12), t, d * 15, { type: "sine", vol: 0.018, a: d * 5, r: d * 3, cut: 3000, hold: 0.8 }); }
      lead(sp, s, t, d, sp.leadInst || "organ", 0.18, 12, 2); },
    blues(sp, s, t0, d) { const b = s % 16, bar = Math.floor(s / 16), t = t0 + (b % 2 ? d * 0.33 : 0), ch = chordOf(sp, bar);
      if (b === 0 || b === 8) Music.kickT(t, 0.46); if (b === 4 || b === 12) Music.snare(t, 0.17, 0.16); if (b % 2 === 0) Music.hat(t, 0.028);
      if (b % 2 === 0) { const boog = [0, 4, 7, 9, 10, 9, 7, 4][(b / 2) % 8]; Music.bass(ch[0] - 12 + boog, t, d * 1.5, 0.11); Music.guitar([ch[0], ch[0] + ((b / 2) % 2 ? 9 : 7)], t, d * 1.2, 0.022); }
      if (bar >= 2 && hsh(sp.seed, s) < 0.22) { const n = sp.key + 24 + SCALE.blues[Math.floor(hsh(sp.seed + 1, s) * 6)]; Music.syn(NOTE(n - 1), t, d * 2, { vol: 0.03, cut: 3000, dest: (Music.fx(), Music.dist), glide: NOTE(n), glideT: d * 0.5 }); } },
    afro(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if ([0, 7, 8].includes(b)) Music.kickT(t, 0.42); if ([3, 6, 10, 12].includes(b)) Music.rim(t, 0.06); if (b === 12) Music.clap(t, 0.08);
      Music.noise(t, 0.03, b % 2 ? 0.016 : 0.026, 7000, "bandpass");
      if ([0, 3, 6, 10, 12].includes(b)) { const n = ch[0] - 12 + [0, 0, 7, 5, 3][[0, 3, 6, 10, 12].indexOf(b)]; Music.syn(NOTE(n + 12), t, d * 1.2, { type: "sine", vol: 0.1, glide: NOTE(n), glideT: d * 0.3, cut: 800, hold: 0.3 }); }
      Music.pluck(ch[b % ch.length] + 24, t, 0.02);
      lead(sp, s, t, d, sp.leadInst || "flute", 0.12, 24); },
    grime(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if (b === 0 || b === 10) Music.kickT(t, 0.48); if (b === 8) Music.snare(t, 0.2, 0.12); if (b % 2 === 0) Music.hat(t, 0.024);
      if ([0, 3, 6].includes(b) || (b === 11 && bar % 2)) Music.sqbass(ch[0] - 12, t, d * 1.2, 0.06);
      if (hsh(sp.seed, s) < 0.34) { const n = sp.key + 24 + SCALE[sp.scale || "phr"][Math.floor(hsh(sp.seed + 2, s) * SCALE[sp.scale || "phr"].length)]; Music.syn(NOTE(n), t, d * 0.5, { type: "square", vol: 0.026, cut: 3000, hold: 0.3 }); } },
    triphop(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);
      if ([0, 7, 11].includes(b)) Music.kickT(t, 0.5); if (b === 8) Music.snare(t, 0.16, 0.4); if (b % 2 === 0) Music.hat(t, 0.02);
      if (b === 0) { Music.pad(ch, t, d * 15, 0.02, 900); Music.crackle(t, d); Music.bass(ch[0] - 12, t, d * 8, 0.12, { type: "sine" }); }
      lead(sp, s, t, d, sp.leadInst || "bell", 0.1, 24, 3); },
    epic(sp, s, t, d) { const b = s % 16, bar = Math.floor(s / 16), ch = chordOf(sp, bar);   // the last fights: trap drums under rock, organ and brass
      if ([0, 7, 10].includes(b)) Music.k808(NOTE(ch[0] - 24), t, d * 3, 0.3); if (b === 0 || b === 8) Music.kickT(t, 0.4);
      if (b === 4 || b === 12) { Music.snare(t, 0.2, 0.2); Music.clap(t, 0.08); } if (bar % 2 && b >= 14) for (let k = 0; k < 3; k++) Music.hat(t + k * d / 3, 0.03); else Music.hat(t, b % 2 ? 0.018 : 0.03);
      if (b === 0) { Music.organ(ch, t, d * 15, 0.016); if (bar % 2 === 0) Music.crash(t, 0.06); }
      if (b % 2 === 0) Music.guitar([ch[0], ch[0] + 7], t, d * 1.6, 0.022);
      if ((b === 0 || b === 6 || b === 10) && bar >= 2) Music.brass(ch.slice(0, 3).map(n => n + 12), t, d * 1.5, 0.028);
      lead(sp, s, t, d, sp.leadInst || "saw", 0.22, 24, 2); },
  };
  // the tracks: genre, tempo, key, four-bar progression (MIDI root, chord), melody seed and instrument
  const MS = (genre, bpm, key, prog, o = {}) => ({ genre, bpm, key, prog, seed: o.seed || key * 7 + bpm, ...o });
  const MODERN = {
    m_kessa: MS("lofi", 78, 53, [[53, "maj7"], [52, "m7"], [50, "m7"], [48, "maj7"]], { scale: "majp", leadInst: "ep" }),
    m_flats: MS("trap", 136, 50, [[50, "m9"], [46, "maj7"], [43, "m7"], [45, "7"]], { leadInst: "bell", dens: 0.18 }),
    m_well: MS("soul", 98, 48, [[48, "m7"], [53, "m7"], [46, "7"], [51, "maj7"]], { scale: "dor" }),
    m_cathedral: MS("darkwave", 112, 45, [[45, "m"], [41, "M"], [48, "M"], [40, "M"]], { scale: "hm", leadInst: "organ" }),
    m_grove: MS("lofi", 84, 51, [[51, "maj7"], [50, "m7"], [48, "m9"], [46, "7"]], { scale: "dor", leadInst: "flute", seed: 91 }),
    m_gates: MS("boombap", 92, 43, [[43, "m7"], [43, "m7"], [48, "m7"], [50, "7"]], { stab: "brass" }),
    m_oru: MS("funk", 106, 40, [[40, "9"], [40, "9"], [45, "7"], [47, "7"]], { scale: "dor", leadInst: "square" }),
    m_guild: MS("trap", 140, 42, [[42, "m"], [38, "M"], [47, "m"], [49, "M"]], { leadInst: "bell", dens: 0.3, seed: 17 }),
    m_marsh: MS("blues", 92, 40, [[40, "7"], [45, "7"], [40, "7"], [47, "7"]]),
    m_reedholm: MS("afro", 102, 45, [[45, "m7"], [50, "7"], [45, "m7"], [52, "m7"]], { scale: "dor" }),
    m_bog: MS("metal", 70, 40, [[40, "5"], [41, "5"], [40, "5"], [43, "5"]], { dens: 0.08 }),
    m_coast: MS("dub", 76, 43, [[43, "m"], [48, "m"], [43, "m"], [50, "M"]]),
    m_road: MS("rock", 132, 45, [[45, "5"], [43, "5"], [38, "5"], [40, "5"]], { scale: "minp" }),
    m_spire: MS("synthwave", 118, 50, [[50, "m"], [46, "M"], [41, "M"], [48, "M"]], { dark: true }),
    m_deep: MS("dnb", 172, 41, [[41, "m9"], [37, "maj7"], [39, "m7"], [36, "7"]], { leadInst: "bell" }),
    m_orchard: MS("triphop", 84, 48, [[48, "m"], [44, "M"], [41, "m"], [43, "M"]]),
    m_drysea: MS("trap", 138, 40, [[40, "m"], [36, "M"], [45, "m"], [47, "7"]], { scale: "phr", leadInst: "flute", dens: 0.2, dark: true }),
    m_tamar: MS("afro", 108, 48, [[48, "M"], [53, "M"], [55, "M"], [53, "M"]], { scale: "majp", seed: 5 }),
    m_pans: MS("soul", 90, 46, [[46, "M"], [51, "M"], [53, "7"], [51, "M"]], { scale: "majp", leadInst: "organ" }),
    m_dunes: MS("drill", 142, 42, [[42, "m"], [42, "m"], [38, "M"], [40, "M"]], { scale: "phr" }),
    m_ruins: MS("triphop", 80, 45, [[45, "m9"], [41, "maj7"], [43, "m7"], [40, "7"]], { seed: 44 }),
    m_tollhouse: MS("grime", 140, 44, [[44, "m"], [44, "m"], [40, "M"], [42, "M"]]),
    m_vault: MS("boombap", 86, 41, [[41, "m7"], [41, "m7"], [37, "maj7"], [36, "7"]], { stab: "ep", leadInst: "organ" }),
    m_galleries: MS("triphop", 78, 50, [[50, "m"], [46, "M"], [48, "M"], [45, "m"]], { seed: 71, leadInst: "ep" }),
    m_sluice: MS("metal", 120, 38, [[38, "5"], [38, "5"], [41, "5"], [39, "5"]], { dens: 0.1 }),
    m_battle: MS("drill", 150, 45, [[45, "m"], [41, "M"], [43, "M"], [40, "M"]], { scale: "minp" }),
    m_boss: MS("metal", 168, 40, [[40, "5"], [43, "5"], [45, "5"], [47, "5"]], { dens: 0.2 }),
    mb_butcher: MS("metal", 176, 40, [[40, "5"], [41, "5"], [43, "5"], [40, "5"]], { dens: 0.18, seed: 3 }),
    mb_mother: MS("trap", 130, 41, [[41, "m"], [42, "M"], [41, "m"], [40, "M"]], { scale: "phr", leadInst: "bell", dens: 0.3, dark: true, seed: 66 }),
    mb_choirmaster: MS("metal", 150, 45, [[45, "m"], [41, "M"], [44, "M"], [40, "M"]], { organ: true, scale: "hm", leadInst: "organ" }),
    mb_voss: MS("drill", 144, 44, [[44, "m"], [40, "M"], [44, "m"], [43, "M"]], { scale: "hm", seed: 29 }),
    mb_hollis: MS("funk", 124, 43, [[43, "9"], [46, "9"], [43, "9"], [48, "7"]], { leadInst: "saw" }),
    mb_quill: MS("trap", 146, 44, [[44, "m"], [40, "M"], [37, "M"], [39, "M"]], { leadInst: "bell", dens: 0.34, seed: 12 }),
    mb_gulp: MS("metal", 96, 38, [[38, "5"], [39, "5"], [38, "5"], [41, "5"]], { dens: 0.12, seed: 8 }),
    mb_maw: MS("rock", 184, 43, [[43, "5"], [46, "5"], [48, "5"], [41, "5"]], { seed: 38 }),
    mb_colossus: MS("rock", 140, 47, [[47, "5"], [43, "5"], [45, "5"], [42, "5"]], { pad: true, seed: 51 }),
    mb_vela: MS("synthwave", 150, 49, [[49, "m"], [45, "M"], [47, "M"], [44, "M"]], { dark: true, seed: 23 }),
    mb_king: MS("epic", 150, 41, [[41, "m"], [37, "M"], [39, "M"], [36, "M"]], { scale: "hm", seed: 77 }),
    mb_corvin: MS("boombap", 88, 38, [[38, "m7"], [43, "m7"], [38, "m7"], [45, "7"]], { stab: "brass", leadInst: "organ", seed: 61 }),
    mb_ledgertree: MS("triphop", 90, 42, [[42, "m"], [38, "M"], [45, "M"], [37, "M"]], { leadInst: "bell", seed: 97 }),
    mb_wyrm: MS("metal", 164, 42, [[42, "5"], [43, "5"], [45, "5"], [40, "5"]], { dens: 0.2, seed: 14 }),
    mb_tollkeeper: MS("grime", 144, 46, [[46, "m"], [42, "M"], [46, "m"], [44, "M"]], { seed: 33 }),
    mb_oldmouth: MS("dub", 82, 38, [[38, "m"], [43, "m"], [38, "m"], [45, "M"]], { seed: 87, leadInst: "bell" }),
    mb_houndg: MS("drill", 148, 40, [[40, "m"], [40, "m"], [36, "M"], [38, "M"]], { seed: 19 }),
  };
  for (const [k, sp] of Object.entries(MODERN)) TRACKS[k] = { bpm: sp.bpm, genre: sp.genre, play: (s, t, d) => GENRE[sp.genre](sp, s, t, d) };
  // which region plays what, and each boss its own fight
  const REGION_TRACK = { "Kessa": "m_kessa", "The Glass Flats": "m_flats", "The Well of Nine": "m_well", "The Salt Cathedral": "m_cathedral", "The Drowned Grove": "m_grove", "Gates of Oru": "m_gates",
    "Oru": "m_oru", "The Guild Hall": "m_guild", "The Drowning Marsh": "m_marsh", "Reedholm": "m_reedholm", "The Bog Heart": "m_bog", "The Wreck Coast": "m_coast", "The Storm Road": "m_road",
    "The Storm Spire": "m_spire", "The Deep": "m_deep", "The Bone Orchard": "m_orchard", "The Dry Sea": "m_drysea", "Tamar's Rest": "m_tamar", "The Salt Pans": "m_pans", "The Dune Sea": "m_dunes",
    "The Reed-Boat Ruins": "m_ruins", "Tollhouse No. 4": "m_tollhouse", "Corvin's Vault": "m_vault", "The Salt Galleries": "m_galleries", "The Sluice Works": "m_sluice" };
  const CLASSIC_OF = {}, MODERN_OF = { flats: "m_flats", cathedral: "m_cathedral", deep: "m_deep", village: "m_kessa", grove: "m_grove", oru: "m_oru", marsh: "m_marsh", coast: "m_coast", spire: "m_spire", battle: "m_battle", boss: "m_boss", final: "mb_king" };
  for (const r of REGIONS) { const m = REGION_TRACK[r.name]; if (m) { CLASSIC_OF[m] = r.music; r.music = m; } }
  for (const [id, M] of Object.entries(MONSTERS)) if (M.boss && MODERN["mb_" + id]) { CLASSIC_OF["mb_" + id] = M.music || "boss"; M.music = "mb_" + id; }
  CLASSIC_OF.m_battle = "battle"; CLASSIC_OF.m_boss = "boss";
  if (!SETTINGS.musicStyle) SETTINGS.musicStyle = "modern";
  const _playStyle = Music.play.bind(Music);
  Music.play = function (name) {
    this.wanted = name;
    if (name) name = SETTINGS.musicStyle === "classic" ? (CLASSIC_OF[name] || name) : (MODERN_OF[name] || name);
    return _playStyle(name);
  };
  // level each genre to roughly the same loudness (measured from offline renders)
  const GENRE_GAIN = { lofi: 1.5, trap: 0.7, drill: 0.7, soul: 1.05, darkwave: 1.4, boombap: 1.35, funk: 1.6, blues: 1.15, afro: 1.6, metal: 0.95, dub: 1.15, rock: 0.8, synthwave: 1.35, dnb: 1.3, triphop: 1.15, grime: 1.6, epic: 0.7 };
  const _volumesM = Music.volumes.bind(Music);
  Music.volumes = function () { _volumesM(); if (!this.ctx) return; const sp = MODERN[this.track], k = sp ? GENRE_GAIN[sp.genre] || 1 : 1; this.bus.gain.setTargetAtTime(0.5 * SETTINGS.music * (paused ? 0.35 : 1) * k, this.ctx.currentTime, 0.05); };
  const _playLevel = Music.play; Music.play = function (name) { _playLevel.call(this, name); this.volumes(); };
  Music.nowPlaying = () => { const k = Music.track; const sp = MODERN[k]; return sp ? { key: k, genre: sp.genre, bpm: sp.bpm } : { key: k }; };
  const GENRE_NAME = { lofi: "lo-fi hip-hop", boombap: "boom-bap", trap: "trap", drill: "drill", soul: "soul", funk: "funk", rock: "rock", metal: "metal", dub: "reggae / dub", dnb: "drum & bass", synthwave: "synthwave", darkwave: "darkwave", blues: "blues rock", afro: "afrobeat", grime: "grime", triphop: "trip-hop", epic: "trap-rock hybrid" };
  // Settings: the music style, and what is playing now
  const _showSettingsM = showSettings;
  showSettings = function (focusKey) {
    _showSettingsM(focusKey);
    const panel = $("pausePanel"), sound = panel && [...panel.querySelectorAll("h3")].find(h => h.textContent === "Game"); if (!sound) return;
    const np = Music.nowPlaying(), row = document.createElement("div");
    row.innerHTML = `<div class="setrow"><span>Music style</span><div class="seg"><button type="button" data-set="musicStyle" data-v="modern" class="${SETTINGS.musicStyle !== "classic" ? "on" : ""}">Modern</button><button type="button" data-set="musicStyle" data-v="classic" class="${SETTINGS.musicStyle === "classic" ? "on" : ""}">Classic</button></div><span></span></div>`
      + `<p class="dim" style="font-size:12px;margin:2px 0 6px">${np.genre ? `Now playing: ${GENRE_NAME[np.genre]}, ${np.bpm} bpm.` : "Modern: every region and boss has its own track (hip-hop, trap, soul, rock, funk, dub and more). Classic: the original score."}</p>`;
    sound.parentNode.insertBefore(row, sound);
  };
  const _saveSettingsM = saveSettings;
  let styleWas = SETTINGS.musicStyle;
  saveSettings = function () { _saveSettingsM(); if (SETTINGS.musicStyle !== styleWas) { styleWas = SETTINGS.musicStyle; if (Music.wanted) { Music.track = null; Music.play(Music.wanted); } } };

