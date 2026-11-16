  // ================================================================== AMBIENCE: THE SOUND OF THE PLACE
  // Under the music, recorded ambience from salt-road/audio/ambience (when the folder has it): cold wind in the Rime and
  // on the Spire, the Act II rain where it falls, crickets over grass at night, a campfire's crackle as you near one,
  // running water by a river or the cistern's canal, the sea on a long shore, drips in the cistern, and a village's
  // murmur by day in town. Each fades in and out with where you stand; battles quieten all but the rain. Settings has
  // an Ambience switch, and the effects volume sets its level.
  const AMB = { list: {}, els: {}, want: {}, on: () => SETTINGS.ambience !== "off" };
  const AMB_LEVEL = { wind: 0.5, rain: 0.55, crickets: 0.35, fire: 0.6, stream: 0.4, drips: 0.45, sea: 0.45, town: 0.3 };
  function ambEl(k) {
    let e = AMB.els[k]; if (e) return e;
    if (!Music.ctx || !AMB.list[k]) return null;
    const a = new Audio(REC.base + AMB.list[k].file); a.loop = true; a.preload = "auto";
    const g2 = Music.ctx.createGain(); g2.gain.value = 0;
    try { Music.ctx.createMediaElementSource(a).connect(g2); g2.connect(Music.sfx); } catch { return null; }
    return (AMB.els[k] = { a, g: g2, level: 0 });
  }
  function ambNear(test, r) {   // how much of the ground within r tiles passes the test, 0..1
    const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE); let n = 0, all = 0;
    for (let y = ty - r; y <= ty + r; y += 2) for (let x = tx - r; x <= tx + r; x += 2) { all++; if (test(get(x, y))) n++; }
    return n / all;
  }
  function ambWants() {
    const w = {}; if (!G || mode === "title") return w;
    const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE), reg = regionOf(tx, ty), night = isNight(), out = !OUTDOOR_SKIP.has(tileAt(G.px, G.py)) && reg !== "cistern";
    if (out && (reg === "rime" || reg === "spire")) w.wind = 1;
    if (typeof rainingHere === "function" && rainingHere()) w.rain = 1;
    if (out && night) { const grass = ambNear(t => t === T.GRASS || t === T.REEDS, 6); if (grass > 0.15) w.crickets = Math.min(1, grass * 1.6); }
    let fire = 0; for (const pr of PROPS) if (pr.type === "campfire") { const d = Math.hypot(pr.px - G.px, pr.py - G.py); if (d < 110) fire = Math.max(fire, 1 - d / 110); } if (fire) w.fire = fire;
    const water = ambNear(t => t === T.WATER, 8); if (water > 0.35) w.sea = Math.min(1, (water - 0.2) * 1.5); else if (water > 0.02) w.stream = Math.min(1, water * 5);
    if (reg === "cistern") w.drips = 1;
    const town = REGIONS.find(r => r.music === "village" && tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1); if (town && !night) w.town = 1;
    if (battle) for (const k of Object.keys(w)) if (k !== "rain") w[k] *= 0.3;
    return w;
  }
  setInterval(() => {
    if (!Music.ctx || !REC.ready || !Object.keys(AMB.list).length) return;
    const w = AMB.on() && Music.on && !paused ? ambWants() : {}, t = Music.ctx.currentTime;
    for (const k of new Set([...Object.keys(w), ...Object.keys(AMB.els)])) {
      const target = (w[k] || 0) * (AMB_LEVEL[k] || 0.4) * Math.min(1.6, (AMB.list[k] && AMB.list[k].gain) || 1); if (!target && !AMB.els[k]) continue;
      const e = ambEl(k); if (!e) continue;
      if (target > 0.01 && e.a.paused) { const p = e.a.play(); if (p && p.catch) p.catch(() => { /* waits for a gesture */ }); }
      e.g.gain.setTargetAtTime(target, t, 0.8); e.level = target;
      if (target <= 0.01 && !e.a.paused) setTimeout(() => { if (e.level <= 0.01) e.a.pause(); }, 3000);
    }
  }, 500);
  // the folder's list of loops comes with the manifest the recorded score already loads
  try { if (location.protocol !== "file:") fetch(REC.base + "manifest.json", { cache: "no-cache" }).then(r => r.ok ? r.json() : null).then(m => { if (m && m.ambience) AMB.list = m.ambience; }).catch(() => {}); } catch { /* no fetch */ }
  // Settings: an Ambience switch beside the sound effects, and the loops in the credits
  const _showSettingsAmb = showSettings;
  showSettings = function (focusKey) {
    _showSettingsAmb(focusKey);
    if (!REC.ready || !Object.keys(AMB.list).length) return;
    const panel = $("pausePanel"), sfx = panel && panel.querySelector('[data-set="sfxStyle"]'); if (!sfx) return;
    const row = document.createElement("div"), on = AMB.on();
    row.innerHTML = `<div class="setrow"><span>Ambience</span><div class="seg"><button type="button" data-set="ambience" data-v="on" class="${on ? "on" : ""}">On</button><button type="button" data-set="ambience" data-v="off" class="${on ? "" : "on"}">Off</button></div><span></span></div>`;
    sfx.closest(".setrow").parentNode.after(row);
    const ul = panel.querySelector("details.credits ul");
    if (ul) ul.insertAdjacentHTML("beforeend", Object.entries(AMB.list).map(([k, m]) => `<li>Ambience, ${escRec(k)}: "${escRec(m.title)}" by ${escRec(m.author)}, ${escRec(m.license)}${m.url ? ` (<a href="${escRec(m.url)}" target="_blank" rel="noopener">source</a>)` : ""}</li>`).join(""));
    if (focusKey === "ambience") { const f = panel.querySelector('[data-set="ambience"].on'); if (f) f.focus({ preventScroll: true }); }
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { ambience: () => ({ list: Object.keys(AMB.list), wants: ambWants(), playing: Object.entries(AMB.els).filter(([, e]) => !e.a.paused && e.level > 0.01).map(([k]) => k) }) }), 0);
