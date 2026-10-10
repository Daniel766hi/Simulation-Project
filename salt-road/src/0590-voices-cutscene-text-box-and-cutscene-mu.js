  // ================================================================== VOICES, CUTSCENE TEXT BOX AND CUTSCENE MUSIC
  // Characters "speak" while their lines type out: each has a voice (pitch, timbre, pace), like the old RPGs.
  // Settings > Voices: voiced (default: every character babbles in a synthesised voice of their own), blips (the old
  // one-note chirps), spoken (the browser reads cutscene and dialogue lines), or off.
  SETTINGS.voice = SETTINGS.voice || "voiced";
  try { const sv = JSON.parse(localStorage.getItem("salt-road-settings") || "{}"); if (sv.voice) SETTINGS.voice = sv.voice; } catch { /* storage unavailable */ }
  const VOICES = {
    sable: { f: 330, w: "triangle", r: 0.12 }, lio: { f: 620, w: "square", r: 0.2 }, nadia: { f: 210, w: "sine", r: 0.08, slow: true }, ilse: { f: 250, w: "square", r: 0.1 },
    maru: { f: 470, w: "sine", r: 0.18 }, rook: { f: 190, w: "sawtooth", r: 0.1 }, ada: { f: 520, w: "sine", r: 0.06 }, ren: { f: 175, w: "triangle", r: 0.08 },
    kest: { f: 400, w: "square", r: 0.16 }, warden: { f: 95, w: "sawtooth", r: 0.04, slow: true }, nell: { f: 360, w: "square", r: 0.22 }, king: { f: 70, w: "sawtooth", r: 0.05, slow: true },
    hollis: { f: 120, w: "sawtooth", r: 0.12 }, limp: { f: 150, w: "triangle", r: 0.06, slow: true }, mother: { f: 440, w: "sine", r: 0.08 }, voss: { f: 110, w: "square", r: 0.1 },
  };
  const voiceFor = who => { if (!who) return null; const k = String(who).toLowerCase(); if (VOICES[k]) return VOICES[k]; if (/limp/.test(k)) return VOICES.limp; if (/woman|mother/.test(k)) return VOICES.mother;
    for (const id of Object.keys(VOICES)) if (k.startsWith(id)) return VOICES[id]; const h = hash(k.length * 7, k.charCodeAt(0) || 1); return { f: 180 + h * 320, w: h > 0.5 ? "triangle" : "square", r: 0.12 }; };
  let blipGate = 0;
  function blip(who, ch) {
    if (SETTINGS.voice !== "blips" || !Music.ctx || !Music.on || !/[a-z0-9]/i.test(ch || "")) return;
    const v = voiceFor(who); if (!v) return;
    const now = Music.ctx.currentTime; if (now < blipGate) return; blipGate = now + (v.slow ? 0.09 : 0.06);
    Music.tone(v.f * (1 + (Math.random() * 2 - 1) * v.r), now + 0.005, 0.025, v.w, v.w === "sine" ? 0.07 : 0.035, 0.004, 0.03, Music.sfx);
  }
  const speakable = t => String(t).replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  function speak(who, text) {
    if (SETTINGS.voice !== "spoken" || !("speechSynthesis" in window)) return;
    const said = speakable(text); if (!said) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(said), P = profileFor(who) || VOICE({ f: 180, tract: 1.05 });
      // a browser voice that fits: a woman's or a child's for small throats, a man's for large ones; monsters pitched right down
      const all = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)), fem = /female|woman|zira|susan|samantha|victoria|karen|moira|tessa|fiona|serena|hazel|libby|sonia|aria|jenny/i;
      const want = P.tract >= 1.04 ? all.filter(v => fem.test(v.name)) : all.filter(v => !fem.test(v.name));
      if (want.length) u.voice = want[Math.floor(hash(String(who).length, String(who).charCodeAt(0)) * want.length)];
      u.pitch = clamp(P.tract >= 1.04 ? 0.6 + (P.f - 170) / 150 : 0.25 + (P.f - 45) / 110, 0.05, 2); u.rate = clamp(0.95 * P.pace, 0.6, 1.4); u.volume = SETTINGS.sfx; speechSynthesis.speak(u); } catch { /* speech unavailable */ }
  }
  // ---- Voiced (the default): a small formant speech synthesiser. Each character babbles the line in their own voice.
  //      The letters of the line become syllables: vowels are vowel sounds (a buzzing throat through three formant
  //      filters), consonants are hisses, pops and hums, and the pitch falls across a sentence, rises on a question
  //      and jumps on a shout. A voice is a throat and a texture: pitch, throat size (small = child, huge = monster),
  //      pace, breath, rasp, growl, a lower octave, a choir of other voices, water in the throat, metal, a mask, an echo.
  const VOICE = (o) => Object.assign({ f: 150, tract: 1, pace: 1, breath: 0.06, rasp: 0, growl: 0, growlHz: 34, sub: 0, choir: null, wet: 0,
    echo: 0.06, ring: 0, ringHz: 70, mask: 0, bell: 0, crackle: 0, lilt: 1, vib: 0, whisper: false, nasal: 0, vol: 1 }, o);
  const VOICE2 = {
    // the party
    sable: VOICE({ f: 205, tract: 1.12, pace: 1.05, breath: 0.12, lilt: 1.1 }),
    lio: VOICE({ f: 310, tract: 1.32, pace: 1.25, breath: 0.05, lilt: 1.6 }),
    nadia: VOICE({ f: 182, tract: 1.07, pace: 0.8, breath: 0.32, vib: 0.7, lilt: 0.8 }),
    ilse: VOICE({ f: 168, tract: 1.04, pace: 0.95, breath: 0.1, rasp: 0.18, lilt: 0.7 }),
    maru: VOICE({ f: 262, tract: 1.2, pace: 1.05, breath: 0.08, vib: 0.5, lilt: 1.7 }),
    rook: VOICE({ f: 112, tract: 0.98, pace: 1.15, breath: 0.2, rasp: 0.12, lilt: 0.7 }),
    ada: VOICE({ f: 232, tract: 1.15, pace: 0.92, breath: 0.28, echo: 0.18, vib: 0.3, lilt: 1.1 }),
    ren: VOICE({ f: 94, tract: 0.93, pace: 0.88, breath: 0.08, rasp: 0.1, lilt: 0.6, sub: 0.12 }),
    kest: VOICE({ f: 222, tract: 1.13, pace: 1.3, breath: 0.07, nasal: 0.4, lilt: 1.3 }),
    nell: VOICE({ f: 172, tract: 1.06, pace: 1.12, breath: 0.22, rasp: 0.3, lilt: 1.0 }),
    // the Warden: built under the water, speaking inside your head
    warden: VOICE({ f: 66, tract: 0.76, pace: 0.72, breath: 0.1, ring: 0.45, ringHz: 83, echo: 0.62, lilt: 0.25, sub: 0.35, vol: 1.1 }),
    // the villains
    butcher: VOICE({ f: 70, tract: 0.7, pace: 0.8, breath: 0.25, rasp: 0.75, growl: 0.8, growlHz: 27, sub: 0.6, lilt: 0.6, vol: 1.1 }),
    voss: VOICE({ f: 92, tract: 0.86, pace: 0.82, breath: 0.2, rasp: 0.45, growl: 0.35, growlHz: 41, bell: 0.6, echo: 0.42, lilt: 1.2, sub: 0.25 }),
    choirmaster: VOICE({ f: 128, tract: 0.95, pace: 0.86, breath: 0.12, vib: 0.6, echo: 0.55, lilt: 1.5,
      choir: [{ r: 0.5, d: -8, g: 0.45 }, { r: 1.5, d: 7, g: 0.3 }, { r: 2, d: -5, g: 0.22 }] }),
    hollis: VOICE({ f: 76, tract: 0.72, pace: 0.9, breath: 0.15, rasp: 0.35, growl: 0.45, growlHz: 23, sub: 0.55, wet: 0.75, echo: 0.2, lilt: 1.3, vol: 1.1 }),
    quill: VOICE({ f: 152, tract: 1.0, pace: 1.25, breath: 0.1, nasal: 0.85, wet: 0.18, lilt: 0.55, rasp: 0.1 }),
    tollkeeper: VOICE({ f: 118, tract: 0.9, pace: 1.0, breath: 0.08, nasal: 0.5, ring: 0.3, ringHz: 211, lilt: 0.4 }),
    maw: VOICE({ f: 84, tract: 0.8, pace: 0.85, breath: 0.2, rasp: 0.45, wet: 0.6, sub: 0.3, echo: 0.3, lilt: 1.1 }),
    vela: VOICE({ f: 238, tract: 1.12, pace: 0.95, breath: 0.16, echo: 0.5, crackle: 0.7, vib: 0.4, lilt: 1.4,
      choir: [{ r: 0.5, d: 10, g: 0.4 }, { r: 2, d: -10, g: 0.18 }] }),
    king: VOICE({ f: 96, tract: 0.86, pace: 0.7, breath: 0.2, wet: 0.45, echo: 0.72, lilt: 0.7, vol: 1.05,
      choir: [{ r: 1, d: 14, g: 0.5, tract: 1.15 }, { r: 1.5, d: -9, g: 0.3, tract: 1.3 }, { r: 0.5, d: 5, g: 0.45 }, { r: 2, d: 20, g: 0.2, tract: 1.4 }] }),
    corvin: VOICE({ f: 100, tract: 0.9, pace: 0.78, breath: 0.45, rasp: 0.45, mask: 0.65, echo: 0.3, lilt: 0.5 }),
    oldmouth: VOICE({ f: 48, tract: 0.58, pace: 0.62, breath: 0.2, growl: 0.7, growlHz: 19, sub: 0.9, wet: 0.85, echo: 0.4, lilt: 0.5, vol: 1.2 }),
    gulp: VOICE({ f: 58, tract: 0.64, pace: 0.7, growl: 0.5, growlHz: 17, sub: 0.7, wet: 0.9, echo: 0.3, lilt: 0.8,
      choir: [{ r: 1.5, d: 12, g: 0.3, tract: 1.2 }, { r: 2, d: -15, g: 0.2, tract: 1.3 }] }),
    colossus: VOICE({ f: 60, tract: 0.6, pace: 0.6, echo: 0.6, sub: 0.6, lilt: 0.3,
      choir: [{ r: 3, d: 8, g: 0.25, tract: 1.2 }, { r: 4, d: -6, g: 0.2, tract: 1.25 }, { r: 3.5, d: 3, g: 0.18, tract: 1.3 }] }),
    ledgertree: VOICE({ f: 62, tract: 0.66, pace: 0.66, breath: 0.4, rasp: 0.6, growl: 0.3, growlHz: 14, echo: 0.35, lilt: 0.4, sub: 0.4 }),
    mother: VOICE({ f: 150, tract: 0.9, pace: 0.9, wet: 0.7, breath: 0.4, echo: 0.3, lilt: 1.2,
      choir: [{ r: 1.06, d: 0, g: 0.4 }, { r: 0.94, d: 0, g: 0.4 }] }),
    wyrm: VOICE({ f: 52, tract: 0.6, pace: 0.6, breath: 0.6, growl: 0.6, growlHz: 22, sub: 0.7, echo: 0.4, lilt: 0.4 }),
    dunewraith: VOICE({ f: 140, tract: 1.0, pace: 0.8, whisper: true, breath: 1, echo: 0.6, lilt: 0.8 }),
    mirage: VOICE({ f: 220, tract: 1.12, pace: 0.9, breath: 0.3, echo: 0.7, vib: 0.8, lilt: 1.2, choir: [{ r: 1.01, d: 0, g: 0.6 }] }),
    scorpion: VOICE({ f: 180, tract: 0.8, pace: 1.3, whisper: true, breath: 1, rasp: 0.4, lilt: 0.6 }),
    // abstract and dream voices
    memory: VOICE({ f: 200, tract: 1.1, pace: 0.85, breath: 0.5, echo: 0.75, vib: 0.4 }),
  };
  for (const k of ["truth", "hope", "justice", "duty", "true", "false", "many", "nobody"]) VOICE2[k] = VOICE2.memory;
  VOICE2.hermit = VOICE({ f: 104, tract: 0.95, pace: 0.8, breath: 0.35, rasp: 0.3, vib: 0.4, lilt: 0.7 });
  const voiceCache = new Map();
  function profileFor(who) {
    if (!who) return null;
    const k = String(who).toLowerCase().replace(/^cmp_/, "");
    if (voiceCache.has(k)) return voiceCache.get(k);
    let P = VOICE2[k];
    if (!P && /ghost$/.test(k) && VOICE2[k.replace(/ghost$/, "")]) { const b = VOICE2[k.replace(/ghost$/, "")]; P = { ...b, echo: 0.7, breath: Math.min(1, b.breath + 0.3), wet: Math.max(b.wet, 0.25) }; }
    if (!P) for (const id of Object.keys(VOICE2)) if (k.startsWith(id)) { P = VOICE2[id]; break; }   // warden2, nadia2, hermit5...
    if (!P) {   // anyone else: read their look and name, then vary by name so no two villagers sound alike
      const n = typeof NPCS !== "undefined" && NPCS.find(x => x.id === k), look = (n && n.look) || {}, st = look.style || {};
      const name = (SPEAKERS[k] || (n && n.name) || k) + "";
      const h = hash(k.length * 31 + k.charCodeAt(0), (k.charCodeAt(k.length - 1) || 7) * 17), h2 = hash(k.charCodeAt(1) || 3, k.length);
      const child = look.small || /^kid\d|^lost3/.test(k), female = st.dress || /bun|long|veil|tail/.test(st.hair || "") || /Mother|Sister|Widow|Mayor|Postmistress|Mistress|Hanne|Liv\b|Tamsin|Sarn|Orla|Aba|Ama|Mora|Farah|Yusra|Sela|Tam\b|Nima|Sefa|Wren/.test(name);
      const old = /Old|Elder|Hermit|Widow|Keeper/.test(name) || /#(e8e4f0|d8d0c0|bfb8a8|c8c8c0|c8c0b0)/i.test(look.hair || ""), ghost = look.glowEyes, dead = look.dead;
      const f = child ? 280 + h * 50 : female ? 188 + h * 45 : 98 + h * 38;
      P = VOICE({ f: old ? f * 0.93 : f, tract: child ? 1.3 : female ? 1.1 + h2 * 0.06 : 0.94 + h2 * 0.08, pace: (old ? 0.82 : 1) * (0.92 + h2 * 0.2),
        breath: (old ? 0.3 : 0.08) + (dead ? 0.4 : 0), rasp: old && !female ? 0.25 : h > 0.8 ? 0.15 : 0, vib: old ? 0.5 : 0, lilt: child ? 1.5 : 0.8 + h * 0.5,
        echo: ghost || dead ? 0.6 : 0.06, wet: ghost ? 0.3 : 0, nasal: h2 > 0.75 ? 0.5 : 0, sub: st.armor && !female ? 0.15 : 0 });
    }
    voiceCache.set(k, P); return P;
  }
  // syllables: onset consonants, a vowel group, a coda, and where the syllable sits in its sentence
  const FORM = { a: [730, 1090, 2440], e: [530, 1840, 2480], i: [300, 2200, 2950], o: [570, 840, 2410], u: [330, 900, 2240], y: [300, 2100, 2800], "@": [500, 1500, 2500] };
  function syllables(text) {
    const out = [], L = text.length, isV = c => /[aeiouy]/.test(c);
    let depth = 0, i = 0;
    while (i < L) {
      const ch = text[i], c = ch.toLowerCase();
      if (c === "(") { depth++; i++; continue; }
      if (c === ")") { depth = Math.max(0, depth - 1); i++; continue; }
      if (depth || !/[a-z]/.test(c)) {   // stage directions in brackets are not spoken; punctuation shapes the last syllable
        const s = out[out.length - 1];
        if (s && !depth) { if (/[,;:—-]/.test(c)) s.pause = Math.max(s.pause, 0.13); if (/[.?!…]/.test(c)) { s.pause = Math.max(s.pause, 0.3); s.end = c === "?" ? "q" : c === "!" ? "x" : s.end || "d"; } }
        i++; continue;
      }
      let j = i; while (j < L && /[a-z']/i.test(text[j])) j++;
      const raw = text.slice(i, j), w = raw.toLowerCase().replace(/'/g, ""), parts = [];
      let k = 0;
      while (k < w.length) {
        let on = ""; while (k < w.length && !isV(w[k])) on += w[k++];
        let v = ""; while (k < w.length && isV(w[k])) v += w[k++];
        v = ({ ee: "i", ea: "i", ie: "i", ei: "ei", oo: "u", ou: "au", ow: "au", ai: "ei", ay: "ei", ey: "ei", oa: "o", ue: "u", ui: "u" })[v] || v;   // spellings to sounds
        if (!v) { if (parts.length) parts[parts.length - 1].coda += on; else parts.push({ on: "", v: "@", coda: on }); break; }
        parts.push({ on, v, coda: "" });
      }
      const last = parts[parts.length - 1];
      if (parts.length > 1 && last.v === "e" && last.on.length === 1 && !last.coda) { parts.pop(); parts[parts.length - 1].coda += last.on; }   // silent e
      const shout = raw.length > 1 && raw === raw.toUpperCase();
      parts.forEach((p, n) => out.push({ at: i + Math.floor((j - i) * n / parts.length), on: p.on, v: p.v, coda: p.coda, ws: n === 0, pause: 0, end: null, shout }));
      i = j;
    }
    let s0 = 0;
    for (let n = 0; n < out.length; n++) if (out[n].end || n === out.length - 1) { for (let m = s0; m <= n; m++) out[m].pos = (m - s0) / Math.max(1, n - s0); s0 = n + 1; }
    return out;
  }
  const Voice = {
    buses: new WeakMap(), irs: new WeakMap(),
    ir(ctx) {   // a stone-room echo, made once per audio context
      let b = this.irs.get(ctx); if (b) return b;
      const n = Math.floor(ctx.sampleRate * 2.4); b = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2) * (i < 400 ? i / 400 : 1); }
      this.irs.set(ctx, b); return b;
    },
    bus(ctx, P, dest) {   // one output chain per voice: mask resonance, metal (ring modulation), echo
      let m = this.buses.get(ctx); if (!m) { m = new Map(); this.buses.set(ctx, m); }
      let b = m.get(P); if (b) return b;
      const input = ctx.createGain(), out = ctx.createGain(); out.gain.value = 0.9 * P.vol; out.connect(dest);
      let head = input;
      if (P.mask) {   // a gold mask over the mouth: a short comb resonance
        const dl = ctx.createDelay(0.05), fb = ctx.createGain(), mix = ctx.createGain();
        dl.delayTime.value = 0.0065; fb.gain.value = 0.55 * P.mask; head.connect(dl); dl.connect(fb); fb.connect(dl);
        const dry = ctx.createGain(); dry.gain.value = 1 - 0.4 * P.mask; head.connect(dry); dry.connect(mix); dl.connect(mix); head = mix;
      }
      if (P.ring) {
        const rg = ctx.createGain(), osc = ctx.createOscillator(), dry = ctx.createGain(), wet = ctx.createGain(), mix = ctx.createGain();
        rg.gain.value = 0; osc.frequency.value = P.ringHz; osc.connect(rg.gain); osc.start();
        dry.gain.value = 1 - P.ring; wet.gain.value = P.ring * 1.4; head.connect(dry); head.connect(rg); rg.connect(wet); dry.connect(mix); wet.connect(mix); head = mix;
      }
      head.connect(out);
      const send = ctx.createGain(); send.gain.value = P.echo * 1.3; head.connect(send);
      const cv = ctx.createConvolver(); cv.buffer = this.ir(ctx); send.connect(cv); cv.connect(out);
      b = { input, out }; m.set(P, b); return b;
    },
    noise(ctx) { return (Music.ctx === ctx && Music.noiseBuf) || this._nb && this._nb.ctx === ctx && this._nb.buf || (this._nb = { ctx, buf: (() => { const nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return nb; })() }).buf; },
    hiss(ctx, dest, t, dur, freq, type, q, vol) {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = this.noise(ctx); f.type = type; f.frequency.value = freq; f.Q.value = q;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(0.012, dur * 0.3)); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.02);
    },
    bellRing(ctx, dest, t, vol) {   // the Rain Bell in Voss's chest, answering him
      [[1, 1], [2.02, 0.55], [2.41, 0.4], [3.0, 0.3], [4.2, 0.22], [5.43, 0.16]].forEach(([r, a]) => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = 146.8 * r;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * a * 0.16, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 / Math.sqrt(r));
        o.connect(g); g.connect(dest); o.start(t); o.stop(t + 2.8);
      });
    },
    // one syllable: t start, dur length, s the syllable, P the voice
    syl(ctx, dest, P, s, t, dur) {
      const tr = P.tract, on = s.on, last = on.slice(-1), first = on[0] || "";
      const v1 = FORM[s.v[0]] || FORM["@"], v2 = FORM[s.v[s.v.length - 1]] || v1;
      // pitch: sentence declination, word stress, question rise, exclamation lift, a little jitter
      const pos = s.pos || 0, L = P.lilt;
      let f = P.f * (1 + L * (0.09 * (1 - pos) - 0.03)) * (s.ws ? 1 + 0.05 * L : 1) * (1 + (Math.random() - 0.5) * 0.05 * L);
      let fEnd = f * (1 - 0.03 * L);
      if (s.end === "q") fEnd = f * (1 + 0.28 * L); else if (s.end === "d") fEnd = f * (1 - 0.14 * L); else if (s.end === "x") { f *= 1 + 0.12 * L; fEnd = f * (1 - 0.1 * L); }
      if (s.shout) { f *= 1.12; fEnd *= 1.12; }
      const loud = (s.ws ? 1 : 0.82) * (s.end === "x" || s.shout ? 1.25 : 1);
      // the consonant in front
      let tv = t;
      const fric = /s|z|c|x|f|v|j|h/.test(first) || /sh|ch|th/.test(on), stop = /[pbtdkgq]/.test(last) && !fric, nas = /[mn]/.test(last), liq = /[lrwy]/.test(last);
      if (fric) {
        const cd = Math.min(0.06, dur * 0.32);
        if (/sh|ch|j/.test(on)) this.hiss(ctx, dest, t, cd, 2600 * tr, "bandpass", 1.6, 0.18);
        else if (/^[sczx]/.test(on)) this.hiss(ctx, dest, t, cd, 5200 * tr, "highpass", 0.7, 0.12);
        else if (first === "h") this.hiss(ctx, dest, t, cd * 0.8, v1[1] * tr, "bandpass", 1.2, 0.1);
        else this.hiss(ctx, dest, t, cd, 6500, "bandpass", 0.6, 0.06);
        tv = t + cd * (/[zvj]/.test(on) ? 0.4 : 0.85);
      } else if (stop) {
        const bf = /[pb]/.test(last) ? 900 : /[td]/.test(last) ? 3900 : 1900;
        this.hiss(ctx, dest, t + 0.012, 0.016, bf * tr, "bandpass", 1.4, /[ptk]/.test(last) ? 0.26 : 0.14);
        tv = t + 0.022;
      }
      const vEnd = t + dur, vd = vEnd - tv; if (vd < 0.03) return;
      // the throat: a buzzing source, maybe a lower octave and a choir, then rasp and growl, then three formants
      const src = ctx.createGain(); src.gain.value = 1;
      const oscs = [];
      const voices = [{ r: 1, d: 0, g: 1 }].concat(P.choir || []);
      for (const cv of voices) {
        const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sawtooth"; o.detune.value = cv.d || 0;
        o.frequency.setValueAtTime(f * cv.r, tv); o.frequency.linearRampToValueAtTime(fEnd * cv.r, vEnd);
        og.gain.value = (cv.g || 1) * (P.whisper ? 0 : 1); o.connect(og); og.connect(src); oscs.push(o);
      }
      if (P.sub) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(f / 2, tv); o.frequency.linearRampToValueAtTime(fEnd / 2, vEnd); og.gain.value = P.sub * 1.4 * (P.whisper ? 0 : 1); o.connect(og); og.connect(src); oscs.push(o); }
      // modulators: vibrato, water in the throat
      const mods = [];
      if (P.vib || P.wet) {
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = P.wet ? 7 + Math.random() * 5 : 5.4;
        lg.gain.value = f * (0.025 * P.vib + 0.1 * P.wet); lfo.connect(lg); oscs.forEach(o => lg.connect(o.frequency)); mods.push(lfo);
      }
      let head = src;
      if (P.rasp) {
        const sh = ctx.createWaveShaper(), k = 1 + P.rasp * 14, n = 256, curve = new Float32Array(n);
        for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; curve[i] = Math.tanh(k * x) / Math.tanh(k); }
        sh.curve = curve; const pre = ctx.createGain(); pre.gain.value = 0.6; head.connect(pre); pre.connect(sh); head = sh;
      }
      if (P.growl) {   // a growl: the voice chopped at a low rate, like vocal fry in a big chest
        const gg = ctx.createGain(), lfo = ctx.createOscillator(), dep = ctx.createGain();
        gg.gain.value = 1 - P.growl * 0.5; lfo.type = "square"; lfo.frequency.value = P.growlHz * (0.9 + Math.random() * 0.2); dep.gain.value = P.growl * 0.5;
        lfo.connect(dep); dep.connect(gg.gain); head.connect(gg); head = gg; mods.push(lfo);
      }
      // breath: noise through the same throat
      let br = null;
      if (P.breath > 0.02) { br = ctx.createBufferSource(); br.buffer = this.noise(ctx); const bg = ctx.createGain(); bg.gain.value = P.whisper ? 1.6 : P.breath * 0.9; br.connect(bg); bg.connect(head === src ? src : head); }
      const env = ctx.createGain(), tone = ctx.createBiquadFilter();
      tone.type = "lowpass"; tone.frequency.value = Math.min(9000, 3600 * tr * (1 + P.nasal * 0.3)); tone.connect(env);
      const fm = liq ? ({ l: [360, 1300, 2700], r: [420, 1250, 1650], w: [300, 700, 2200], y: [280, 2250, 2900] })[last] : null;
      [[0, 1, 11], [1, 0.62, 13], [2, 0.3, 16]].forEach(([n, g, q]) => {
        const bp = ctx.createBiquadFilter(), bg = ctx.createGain(); bp.type = "bandpass"; bp.Q.value = q * (1 + P.nasal * 0.8);
        const a = (fm || v1)[n] * tr, b = v1[n] * tr, c2 = v2[n] * tr * (nas && n === 1 ? 0.8 : 1);
        bp.frequency.setValueAtTime(nas && n === 0 ? 260 * tr : a, tv);
        bp.frequency.linearRampToValueAtTime(b, tv + Math.min(0.05, vd * 0.35));
        bp.frequency.linearRampToValueAtTime(c2, vEnd);
        bg.gain.value = g * (n === 2 && P.nasal ? 1 + P.nasal : 1) * (q / 6); head.connect(bp); bp.connect(bg); bg.connect(tone);
      });
      const peak = 0.34 * loud * (P.whisper ? 0.9 : 1);
      env.gain.setValueAtTime(0.0001, tv); env.gain.linearRampToValueAtTime(peak, tv + 0.014);
      env.gain.setValueAtTime(peak * 0.92, Math.max(tv + 0.015, vEnd - 0.035)); env.gain.linearRampToValueAtTime(0.0001, vEnd);
      env.connect(dest);
      for (const o of oscs.concat(mods)) { o.start(tv); o.stop(vEnd + 0.03); }
      if (br) { br.start(tv, Math.random() * 0.8); br.stop(vEnd + 0.03); }
      // after the vowel
      if (/[sz]$/.test(s.coda)) this.hiss(ctx, dest, vEnd - 0.01, 0.045, 5200 * tr, "highpass", 0.7, 0.1);
      else if (/[ptk]$/.test(s.coda)) this.hiss(ctx, dest, vEnd + 0.01, 0.014, 2600 * tr, "bandpass", 1.2, 0.12);
      if (P.wet && Math.random() < P.wet * 0.45) {   // a bubble rises in the throat
        const o = ctx.createOscillator(), g = ctx.createGain(), bt = tv + Math.random() * vd * 0.7;
        o.type = "sine"; o.frequency.setValueAtTime(260 + Math.random() * 200, bt); o.frequency.exponentialRampToValueAtTime(900 + Math.random() * 600, bt + 0.05);
        g.gain.setValueAtTime(0.0001, bt); g.gain.linearRampToValueAtTime(0.09 * P.wet, bt + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, bt + 0.06);
        o.connect(g); g.connect(dest); o.start(bt); o.stop(bt + 0.08);
      }
      if (P.crackle && Math.random() < P.crackle) for (let i = 0; i < 3; i++) this.hiss(ctx, dest, tv + Math.random() * vd, 0.008, 3500 + Math.random() * 4000, "highpass", 0.5, 0.2 * P.crackle);
    },
    // live speech: follows the typewriter, one syllable at a time, and skips ahead rather than fall behind
    cur: null,
    start(who, text) {
      let P = profileFor(who);
      if (P && P === VOICE2.ada && G.flags && G.flags.adaVoice) P = VOICE2.adaHush || (VOICE2.adaHush = { ...P, whisper: true, breath: 1, vol: 0.8 });   // she gave her voice to the dead in the salt
      this.cur = P && text ? { P, syl: syllables(text), n: 0, next: 0, t0: Music.ctx ? Music.ctx.currentTime : 0, rang: false } : null;
    },
    stop() { this.cur = null; },
    type(typedTo, total) {
      const c = this.cur, ctx = Music.ctx; if (!c || !ctx || !Music.on || SETTINGS.voice !== "voiced") return;
      const now = ctx.currentTime, P = c.P;
      if (P.bell && !c.rang) { c.rang = true; this.bellRing(ctx, this.bus(ctx, P, Music.sfx).input, now + 0.02, P.bell); }
      // where the voice may be: never past the typed text; with instant text, a reading pace
      const reach = SETTINGS.text === "instant" ? Math.min(total, (now - c.t0) * 40) : typedTo;
      let avail = 0; while (avail < c.syl.length && c.syl[avail].at < reach) avail++;
      if (avail - c.n > 3) c.n = avail - 2;   // fell behind: skip ahead, keep the sentence ending
      if (c.n >= avail || now < c.next - 0.03) return;
      const s = c.syl[c.n++], base = 0.105 / P.pace, len = s.v.length > 1 ? 1.25 : 1, dur = base * len * (s.end ? 1.35 : 1) * (0.9 + Math.random() * 0.2);
      const t = Math.max(now + 0.01, c.next);
      this.syl(ctx, this.bus(ctx, P, Music.sfx).input, P, s, t, dur);
      c.next = t + dur + s.pause / P.pace * (typedTo >= total ? 0.5 : 1);
    },
    // offline rendering, for previews: a whole line spoken at its own pace
    async render(who, text, sr = 22050) {
      const P = profileFor(who) || VOICE({}), syl = syllables(text);
      let secs = 0.4; for (const s of syl) secs += 0.105 / P.pace * 1.4 + s.pause / P.pace;
      const oc = new OfflineAudioContext(1, Math.ceil(sr * (secs + 2.6)), sr), dest = this.bus(oc, P, oc.destination).input;
      let t = 0.15; if (P.bell) this.bellRing(oc, dest, 0.05, P.bell);
      for (const s of syl) { const dur = 0.105 / P.pace * (s.v.length > 1 ? 1.25 : 1) * (s.end ? 1.35 : 1) * (0.9 + Math.random() * 0.2); this.syl(oc, dest, P, s, t, dur); t += dur + s.pause / P.pace; }
      return oc.startRendering();
    },
  };
  // Voiced is the new default; anyone still on the old default (blips) moves to it once
  try { const sv = JSON.parse(localStorage.getItem("salt-road-settings") || "{}"); if (!sv.voiceV2) { if (!sv.voice || sv.voice === "blips") SETTINGS.voice = "voiced"; SETTINGS.voiceV2 = true; localStorage.setItem("salt-road-settings", JSON.stringify({ ...sv, voice: SETTINGS.voice, voiceV2: true })); } } catch { if (SETTINGS.voice === "blips") SETTINGS.voice = "voiced"; }
  // dialogue: voice or blip as characters type, speak when a line opens
  let lastDlg = null, lastTyped = 0;
  const _updateV = update;
  update = function (dt) {
    _updateV(dt);
    if (mode === "dialog" && dlg) {
      if (dlg !== lastDlg) { lastDlg = dlg; lastTyped = 0; speak(dlg.who, dlg.text); Voice.start(dlg.who, dlg.text); }
      const n = Math.min(dlg.text.length, Math.floor(typed));
      for (let i = lastTyped; i < n; i++) blip(dlg.who, dlg.text[i]);
      lastTyped = n; Voice.type(n, dlg.text.length);
    } else if (lastDlg) { lastDlg = null; if (mode !== "cine") Voice.stop(); if (SETTINGS.voice === "spoken" && "speechSynthesis" in window && mode !== "cine") try { speechSynthesis.cancel(); } catch { /* ignore */ } }
  };
  // the settings panel gains a Voices row
  const _showSettingsV = showSettings;
  showSettings = function (focusKey) {
    _showSettingsV(focusKey);
    const game = [...$("pausePanel").querySelectorAll("h3")].find(h => h.textContent === "Game"); if (!game) return;
    const row = document.createElement("div"); row.className = "setrow";
    const row2 = document.createElement("div"); row2.className = "setrow";
    row2.innerHTML = `<span>Screen</span><div class="seg">${[["fill", "Fill"], ["exact", "Pixel-perfect"]].map(([v, l]) => `<button type="button" data-set="screen" data-v="${v}" class="${(SETTINGS.screen || "fill") === v ? "on" : ""}">${l}</button>`).join("")}</div><span></span>`;
    game.after(row2);
    row.innerHTML = `<span>Voices</span><div class="seg">${[["voiced", "Voiced"], ["blips", "Blips"], ["spoken", "Spoken"], ["off", "Off"]].map(([v, l]) => `<button type="button" data-set="voice" data-v="${v}" class="${SETTINGS.voice === v ? "on" : ""}">${l}</button>`).join("")}</div><span></span>`;
    game.after(row);
    if (focusKey === "voice") { const f = row.querySelector(".on"); if (f) f.focus({ preventScroll: true }); }
  };

  // the cutscene text box: a pixel-bordered box with a name plate, typed out with voice
  const cbStyle = document.createElement("style");
  cbStyle.textContent = `#cineBox{position:absolute;left:50%;bottom:3%;transform:translateX(-50%);width:min(88%,760px);background:#0e0b1e;border:3px solid #5e5680;box-shadow:0 0 0 3px #0e0b1e;padding:10px 14px 12px;z-index:6;pointer-events:none;image-rendering:pixelated}
  #cineBox .nm{position:absolute;top:-14px;left:14px;background:#3b2f7a;border:2px solid #0e0b1e;color:var(--gold);font:700 13px var(--font);padding:1px 8px;letter-spacing:.04em}
  #cineBox .tx{font:16px/1.4 var(--font);color:#f3efe6;min-height:2.8em}
  #cineBox .tx.narr{color:#d8d0e6;font-style:italic}
  #cineBox .hint{position:absolute;right:10px;bottom:-18px;font:12px var(--font);color:#b3aacb;background:#0e0b1e;border:2px solid #5e5680;padding:0 6px}
  #cineBox.waiting .tx::after,#banter.waiting::after{content:" ▸";color:var(--gold);animation:cbNext 1s steps(2) infinite}
  @keyframes cbNext{50%{opacity:.15}}
  @media (prefers-reduced-motion:reduce){#cineBox.waiting .tx::after,#banter.waiting::after{animation:none}}
  @media (max-width:700px){#cineBox .tx{font-size:14px}#cineBox{padding:8px 10px}}`;
  document.head.appendChild(cbStyle);
  const cineBox = document.createElement("div"); cineBox.id = "cineBox"; cineBox.hidden = true; cineBox.innerHTML = `<div class="nm"></div><div class="tx"></div><div class="hint"></div>`;
  $("toast").parentNode.appendChild(cineBox);
  let cbText = "", cbWho = null, cbTyped = 0;
  function cineSay(who, text) {
    cbText = text || ""; cbWho = who; cbTyped = SETTINGS.text === "instant" ? cbText.length : 0;
    cineBox.hidden = !cbText; cineBox.querySelector(".nm").hidden = !who; cineBox.querySelector(".nm").textContent = who || "";
    cineBox.querySelector(".tx").classList.toggle("narr", !who); cineBox.querySelector(".tx").textContent = "";
    speak(who, text); Voice.start(who, text);
  }
  // route cinematic lines into the box instead of the plain caption
  const _enterShotV = enterShot;
  enterShot = function () { _enterShotV(); banterEl.hidden = true; const s = cine.shots[cine.i]; if (s.line) cineSay(s.line[0], s.line[1]); else if (!s.keepLine) cineSay(null, ""); };
  const _endCineV = endCine;
  endCine = function () { cineBox.hidden = true; cbText = ""; Voice.stop(); if (SETTINGS.voice === "spoken" && "speechSynthesis" in window) try { speechSynthesis.cancel(); } catch { /* ignore */ } _endCineV(); };
  const _updateCB = update;
  update = function (dt) {
    _updateCB(dt);
    if (!cine || mode !== "cine" || !cbText) return;
    const before = Math.floor(cbTyped); cbTyped = Math.min(cbText.length, cbTyped + dt * (SETTINGS.text === "slow" ? 26 : 48));
    const now = Math.floor(cbTyped); for (let i = before; i < now; i++) blip(cbWho, cbText[i]);
    Voice.type(now, cbText.length);
    if (now !== before) cineBox.querySelector(".tx").textContent = cbText.slice(0, now);
    // the line is all there and the picture is holding for it: a blinking arrow, and which key moves on
    cineBox.classList.toggle("waiting", now >= cbText.length && SETTINGS.cutPace !== "auto");
    const hint = `${typeof boundKey === "function" ? keyName(boundKey("act")) : "E"} or tap: next · Esc: skip`, hb = cineBox.querySelector(".hint"); if (hb.textContent !== hint) hb.textContent = hint;
  };
  // cutscene music: each cinematic can bring its own theme and hand the old one back afterwards
  const _playCineV = playCine;
  playCine = function (shots, done, opts = {}) {
    const prev = Music.track;
    if (opts.music) { Music.track = null; Music.play(opts.music); }
    _playCineV(shots, () => { if (opts.music) { Music.track = null; if (prev) Music.play(prev); } if (done) done(); });
  };
  Object.assign(TRACKS, {
    cine_lullaby: { bpm: 76, play(s, t, d) {   // a music box in the night: the salt child
      const mel = [76, -1, 79, 76, -1, 72, 74, -1, 76, -1, 74, 72, -1, 69, 72, -1];
      if (s % 2 === 0 && mel[(s / 2) % 16] > 0) { Music.tone(hz(mel[(s / 2) % 16] + 12), t, d * 1.5, "sine", 0.05, 0.004, 0.9); Music.tone(hz(mel[(s / 2) % 16] + 24), t, d * 0.5, "sine", 0.012, 0.004, 0.5); }
      if (s % 16 === 0) { const b = [45, 41, 43, 40][Math.floor(s / 16) % 4]; Music.tone(hz(b), t, d * 15, "sine", 0.06, 0.4, 1.2); Music.tone(hz(b + 7), t, d * 15, "triangle", 0.015, 0.8, 1.2); }
    } },
    cine_dread: { bpm: 66, play(s, t, d) {   // the theft: a drone, a heartbeat, a bell out of tune
      if (s % 32 === 0) { Music.tone(hz(33), t, d * 31, "sawtooth", 0.05, 1.5, 1.5); Music.tone(hz(34), t, d * 31, "sawtooth", 0.04, 1.5, 1.5); }
      if (s % 8 === 0) Music.kick(t, 0.35); if (s % 8 === 2) Music.kick(t, 0.2);
      if (s % 16 === 12) { Music.tone(hz(74), t, d * 0.5, "triangle", 0.05, 0.003, 1.8, null, 30); Music.tone(hz(80), t, d * 0.5, "sine", 0.03, 0.003, 1.6); }
      if (s % 64 === 40) Music.noise(t, d * 16, 0.04, 400, "lowpass");
    } },
    cine_grief: { bpm: 58, play(s, t, d) {   // after the fall: sparse, falling, unresolved
      const mel = [69, -1, -1, 67, -1, -1, 64, -1, -1, -1, 62, -1, 64, -1, -1, -1];
      if (mel[s % 16] > 0) Music.tone(hz(mel[s % 16]), t, d * 3, "sine", 0.06, 0.02, 1.6);
      if (s % 16 === 0) { const c = [[45, 52, 57], [41, 48, 57], [43, 50, 55], [40, 47, 55]][Math.floor(s / 16) % 4]; for (const n of c) Music.tone(hz(n), t, d * 15, "sine", 0.025, 1.0, 1.4, null, rand(-4, 4)); }
    } },
    cine_bell: { bpm: 84, play(s, t, d) {   // the Bell comes home: a hymn in the rain
      const prog = [[48, 55, 60, 64], [53, 57, 60, 65], [55, 59, 62, 67], [48, 55, 60, 64]], ch = prog[Math.floor(s / 16) % 4];
      if (s % 16 === 0) for (const n of ch) Music.tone(hz(n), t, d * 15, "triangle", 0.035, 0.3, 1.2);
      const mel = [72, -1, 74, 76, -1, 79, 76, -1, 74, -1, 72, -1, 74, -1, -1, -1];
      if (s >= 16 && mel[s % 16] > 0) Music.tone(hz(mel[s % 16]), t, d * 2, "square", 0.03, 0.01, 0.5);
      if (s % 32 === 0) { Music.tone(hz(84), t, d, "sine", 0.05, 0.003, 3); Music.tone(hz(91), t, d, "sine", 0.025, 0.003, 2.5); }
    } },
    cine_storm: { bpm: 96, play(s, t, d) {   // Maru's song
      if (s % 16 === 0) { const b = [50, 46, 48, 45][Math.floor(s / 16) % 4]; Music.tone(hz(b - 12), t, d * 15, "sawtooth", 0.04, 0.5, 1); Music.tone(hz(b + 12), t, d * 15, "sine", 0.03, 1, 1); }
      const mel = [74, 77, 81, -1, 79, 77, 74, -1, 72, 74, 77, -1, 76, -1, 74, -1];
      if (s % 2 === 0 && mel[(s / 2) % 16] > 0) Music.tone(hz(mel[(s / 2) % 16]), t, d * 1.8, "sine", 0.06, 0.03, 0.8);
      if (s % 32 === 20) Music.noise(t, d * 6, 0.08, 1200, "lowpass");
    } },
    cine_deep: { bpm: 50, play(s, t, d) {   // the Drowned King
      if (s % 32 === 0) { Music.tone(hz(26), t, d * 31, "sawtooth", 0.06, 2, 2); Music.tone(hz(38), t, d * 31, "sine", 0.05, 2, 2); }
      if (s % 16 === 8) for (const n of [62, 65, 68]) Music.tone(hz(n), t, d * 6, "sine", 0.02, 1.2, 2, null, rand(-10, 10));
      if (s % 8 === 4) Music.noise(t, d * 2, 0.02, 250, "lowpass");
    } },
  });
