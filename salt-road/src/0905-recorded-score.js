  // ================================================================== THE RECORDED SCORE: FREE-LICENSED MUSIC AND SOUND
  // Next to the page sits salt-road/audio: recorded music and sound effects under free licences (CC0, public domain
  // and CC-BY), listed with their authors in salt-road/audio/manifest.json and CREDITS.md. When the folder is there,
  // Settings > Music style offers "Recorded", and the sound effects can be recorded too. When it isn't (the page
  // opened on its own, or offline), nothing changes: the synthesised score plays as before.
  const REC = { base: "salt-road/audio/", music: {}, sfx: {}, ready: false };
  const RecPlay = { els: {}, cur: null, bufs: {}, loading: {} };
  const REC_GAIN = 0.42, REC_SFX_GAIN = 0.7;
  // the score's own keys for each region, boss and scene; any missing in the folder falls back to the synthesised score
  const recKey = name => {
    if (!name) return null;
    let k = name;
    if (typeof CLASSIC_OF !== "undefined" && CLASSIC_OF[k]) k = CLASSIC_OF[k];
    if (/^mb_/.test(k)) k = "boss";
    if (k === "cine_deep" && !REC.music.cine_deep) k = "deep";
    return REC.music[k] ? k : null;
  };
  function recEl(k) {
    let e = RecPlay.els[k]; if (e) return e;
    const a = new Audio(REC.base + REC.music[k].file); a.loop = true; a.preload = "auto";
    const g = Music.ctx.createGain(); g.gain.value = 0;
    try { Music.ctx.createMediaElementSource(a).connect(g); g.connect(Music.bus); } catch { return null; }
    return (RecPlay.els[k] = { a, g });
  }
  function recFadeOut(k) {
    const o = RecPlay.els[k]; if (!o) return;
    o.g.gain.setTargetAtTime(0, Music.ctx.currentTime, 0.35);
    setTimeout(() => { if (RecPlay.cur !== k) o.a.pause(); }, 2200);
  }
  function recStart(k) {
    if (RecPlay.cur === k) return true;
    const e = recEl(k); if (!e) return false;
    if (RecPlay.cur) recFadeOut(RecPlay.cur);
    RecPlay.cur = k;
    try { e.a.currentTime = 0; } catch { /* not loaded yet */ }
    const p = e.a.play(); if (p && p.catch) p.catch(() => { /* the browser wants a gesture first; the next play() will start it */ });
    e.g.gain.setTargetAtTime(REC_GAIN, Music.ctx.currentTime, 0.25);
    return true;
  }
  function recStop() { if (!RecPlay.cur) return; const k = RecPlay.cur; RecPlay.cur = null; recFadeOut(k); }
  const recOn = () => REC.ready && SETTINGS.musicStyle === "recorded";
  const _playRec = Music.play;
  Music.play = function (name) {
    if (recOn()) {
      const k = recKey(name);
      if (k) {
        this.wanted = name;
        if (!this.ctx) { this.pending = name; return; }
        if (this.ctx.state === "suspended") this.ctx.resume();
        if (recStart(k)) { this.track = "rec:" + k; this.volumes(); return; }
      }
      // nothing recorded for this one: the classic synthesised track, which sits with the recordings better than the modern ones
      recStop();
      const keep = SETTINGS.musicStyle; SETTINGS.musicStyle = "classic";
      try { _playRec.call(this, name); } finally { SETTINGS.musicStyle = keep; this.wanted = name; }
      return;
    }
    recStop();
    return _playRec.call(this, name);
  };
  const _nowPlayingRec = Music.nowPlaying;
  Music.nowPlaying = () => { const k = RecPlay.cur; if (k && REC.music[k]) { const m = REC.music[k]; return { key: "rec:" + k, title: m.title, author: m.author }; } return _nowPlayingRec(); };
  // recorded sound effects: each of the game's sounds can have a recording; the rest stay synthesised
  const SFX_OF = { hit: ["sword-hit", "hit"], crit: ["critical-hit", "heavy-hit"], heal: ["heal"], click: ["menu-move", "click"], miss: ["miss", "whoosh"], step: ["footstep-1", "footstep-2"],
    item: ["item-pickup", "coin"], bleed: ["debuff"], dash: ["whoosh"], guard: ["guard", "block"], buff: ["buff"], magic: ["magic-cast", "magic"], levelup: ["level-up"], death: ["enemy-death"], door: ["door"], chest: ["chest-open"], back: ["menu-back"], confirm: ["menu-confirm"] };
  const sfxRecOn = () => REC.ready && SETTINGS.sfxStyle !== "synth";
  function recBuf(name) {
    if (RecPlay.bufs[name] || RecPlay.loading[name] || !REC.sfx[name] || !Music.ctx) return RecPlay.bufs[name] || null;
    RecPlay.loading[name] = fetch(REC.base + REC.sfx[name].file).then(r => r.arrayBuffer()).then(b => new Promise((res, rej) => Music.ctx.decodeAudioData(b, res, rej)))
      .then(buf => { RecPlay.bufs[name] = buf; }).catch(() => { REC.sfx[name] = null; });
    return null;
  }
  const _soundRec = Music.sound.bind(Music);
  Music.sound = function (kind) {
    if (!this.ctx || !this.on) return;
    if (sfxRecOn()) {
      const names = (SFX_OF[kind] || []).filter(n => REC.sfx[n]);
      if (names.length) {
        const n = names.length > 1 && kind === "step" ? names[Math.floor(Math.random() * names.length)] : names[0], buf = recBuf(n);
        if (buf) { const s = this.ctx.createBufferSource(), g = this.ctx.createGain(); s.buffer = buf; g.gain.value = REC_SFX_GAIN; s.connect(g); g.connect(this.sfx); s.start(); return; }
      }
    }
    return _soundRec(kind);
  };
  // load the folder's list; the first time it is there, the recorded score becomes the default (Settings can switch back)
  try {
    if (location.protocol !== "file:") fetch(REC.base + "manifest.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).then(m => {
      if (!m || !m.music) return;
      REC.music = m.music || {}; REC.sfx = m.sfx || {}; REC.ready = Object.keys(REC.music).length > 0;
      if (!REC.ready) return;
      if (!SETTINGS.recordedOffered) { SETTINGS.recordedOffered = true; SETTINGS.musicStyle = "recorded"; saveSettings(); }
      if (Music.wanted && recOn()) { Music.track = null; Music.play(Music.wanted); }
      if (Music.ctx) for (const n of Object.keys(REC.sfx)) recBuf(n);
    }).catch(() => { /* no folder: the synthesised score it is */ });
  } catch { /* fetch unavailable */ }
  const _initRec = Music.init.bind(Music);
  Music.init = function () { _initRec(); if (REC.ready && this.ctx) for (const n of Object.keys(REC.sfx)) recBuf(n); };
  // Settings: "Recorded" next to Modern and Classic, a choice for the sound effects, and who made what
  const escRec = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const _showSettingsRec = showSettings;
  showSettings = function (focusKey) {
    _showSettingsRec(focusKey);
    if (!REC.ready) return;
    const panel = $("pausePanel"), modern = panel && panel.querySelector('[data-set="musicStyle"][data-v="modern"]'); if (!modern) return;
    const seg = modern.parentNode, on = SETTINGS.musicStyle === "recorded";
    if (on) seg.querySelectorAll("button").forEach(b => b.classList.remove("on"));
    seg.insertAdjacentHTML("afterbegin", `<button type="button" data-set="musicStyle" data-v="recorded" class="${on ? "on" : ""}">Recorded</button>`);
    const row = seg.closest(".setrow"), np = Music.nowPlaying(), note = row && row.nextElementSibling;
    if (note && note.tagName === "P") note.textContent = on ? (np.title ? `Now playing: "${np.title}" by ${np.author}.` : "Recorded: orchestral and ambient music under free licences, credited below. Where a scene has no recording, the classic score plays.") : note.textContent;
    const sfxRow = document.createElement("div");
    sfxRow.innerHTML = `<div class="setrow"><span>Sound effects</span><div class="seg"><button type="button" data-set="sfxStyle" data-v="recorded" class="${SETTINGS.sfxStyle !== "synth" ? "on" : ""}">Recorded</button><button type="button" data-set="sfxStyle" data-v="synth" class="${SETTINGS.sfxStyle === "synth" ? "on" : ""}">Synth</button></div><span></span></div>`;
    (note || row).after(sfxRow);
    const all = [...Object.entries(REC.music).map(([k, m]) => ["Music", k, m]), ...Object.entries(REC.sfx).filter(([, m]) => m).map(([k, m]) => ["Sound", k, m])];
    const cr = document.createElement("details"); cr.className = "credits"; cr.style.margin = "4px 0 10px";
    cr.innerHTML = `<summary>Music and sound credits (${all.length})</summary><ul class="dim" style="font-size:12px;margin:6px 0 0;padding-left:18px">${all.map(([kind, k, m]) =>
      `<li>${kind}, ${escRec(k)}: "${escRec(m.title)}" by ${escRec(m.author)}, ${escRec(m.license)}${m.url ? ` (<a href="${escRec(m.url)}" target="_blank" rel="noopener">source</a>)` : ""}</li>`).join("")}</ul>`;
    sfxRow.after(cr);
    if (focusKey === "musicStyle" || focusKey === "sfxStyle") { const f = panel.querySelector(`[data-set="${focusKey}"].on`); if (f) f.focus({ preventScroll: true }); }
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { recorded: () => ({ ready: REC.ready, music: Object.keys(REC.music), sfx: Object.keys(REC.sfx).filter(k => REC.sfx[k]), playing: RecPlay.cur, style: SETTINGS.musicStyle }) }), 0);
