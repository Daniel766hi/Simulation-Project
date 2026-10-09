  // ================================================================== PAUSE MENU
  let pausedFrom = "play", quitArmed = false;
  const fmtTime = s2 => { s2 = Math.floor(s2 || 0); const h = Math.floor(s2 / 3600), m = Math.floor(s2 / 60) % 60; return h ? `${h}h ${m}m` : `${m}m ${s2 % 60}s`; };
  function pauseGame() {
    if (paused || !G) return;
    paused = true; pausedFrom = mode; quitArmed = false;
    Music.volumes(); Music.sound("click");
    const t = goal();
    $("pauseStats").textContent = `${t.ch || "The Salt Road"} · played ${fmtTime(G.stats && G.stats.time)} · ${(G.stats && G.stats.wins) || 0} battles won · ${(G.stats && G.stats.defeats) || 0} defeats`;
    const inPlay = pausedFrom === "play";
    for (const b of $("pauseMain").querySelectorAll("button")) if (["party", "journal", "slots", "map"].includes(b.dataset.a)) b.disabled = !inPlay && b.dataset.a !== "map";
    showPauseMain(); $("pauseUI").hidden = false;
    $("pauseMain").querySelector("button").focus({ preventScroll: true });
  }
  function resumeGame() { paused = false; $("pauseUI").hidden = true; Music.volumes(); Music.sound("click"); last = performance.now(); }
  function showPauseMain() { $("pauseMain").hidden = false; $("pausePanel").hidden = true; $("pauseTitle").textContent = "Paused"; }
  function showPanel(title, html) { $("pauseMain").hidden = true; $("pausePanel").hidden = false; $("pauseTitle").textContent = title; $("pausePanel").innerHTML = html + `<button class="pbtn close" type="button" data-a="back" style="margin-top:12px;width:100%;justify-content:center">Back <small style="margin-left:8px">Esc</small></button>`; const f = $("pausePanel").querySelector("button,input"); if (f) f.focus({ preventScroll: true }); }
  function pauseKey(k) {
    const btns = [...$("pauseUI").querySelectorAll("button:not([disabled]), input")].filter(b => b.offsetParent !== null);
    const i = btns.indexOf(document.activeElement);
    if (["arrowdown", "s", "arrowright", "d"].includes(k) && document.activeElement.type !== "range") { (btns[(i + 1) % btns.length] || btns[0]).focus(); Music.sound("click"); }
    if (["arrowup", "w", "arrowleft", "a"].includes(k) && document.activeElement.type !== "range") { (btns[(i - 1 + btns.length) % btns.length] || btns[0]).focus(); Music.sound("click"); }
    if ((k === "e" || k === " ") && document.activeElement && document.activeElement.tagName === "BUTTON") document.activeElement.click();
    if (k === "q") { if (!$("pausePanel").hidden) showPauseMain(); else resumeGame(); }
  }
  $("pauseBtn").addEventListener("click", () => { Music.init(); paused ? resumeGame() : pauseGame(); });
  $("pauseUI").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    const a = b.dataset.a; Music.sound("click");
    if (a === "resume") resumeGame();
    else if (a === "back") showPauseMain();
    else if (a === "party") { resumeGame(); openRoster(); }
    else if (a === "journal") { resumeGame(); openJournal(); }
    else if (a === "map") showWorldMap();
    else if (a === "slots") showSlots();
    else if (a === "settings") showSettings();
    else if (a === "controls") showControls();
    else if (a === "quit") {
      if (!quitArmed) { quitArmed = true; b.innerHTML = `Really quit? <small>progress is autosaved at every rest and story step</small>`; return; }
      save(); location.reload();
    }
    else if (a === "save") { saveSlot(Number(b.dataset.slot)); showSlots(); }
    else if (a === "load") { if (loadSlot(Number(b.dataset.slot))) resumeGame(); }
    else if (b.dataset.set) { SETTINGS[b.dataset.set] = b.dataset.v === "true" ? true : b.dataset.v === "false" ? false : b.dataset.v; saveSettings(); if (b.dataset.set === "screen") resize(); showSettings(b.dataset.set); }
    else if (b.dataset.diff) { difficulty = b.dataset.diff; try { localStorage.setItem("salt-road-diff", difficulty); } catch { /* storage unavailable */ } renderDiff(); showSettings("diff"); }
  });
  $("pauseUI").addEventListener("input", e => {
    const r = e.target; if (!r.dataset.vol) return;
    SETTINGS[r.dataset.vol] = Number(r.value) / 100; r.parentElement.querySelector("output").textContent = r.value + "%";
    Music.volumes(); saveSettings(); if (r.dataset.vol === "sfx") Music.sound("hit");
  });
  function saveSettings() { try { localStorage.setItem("salt-road-settings", JSON.stringify(SETTINGS)); } catch { /* storage unavailable */ } }
  function showSettings(focusKey) {
    const seg = (key, opts) => `<div class="seg">${opts.map(([v, l]) => `<button type="button" data-set="${key}" data-v="${v}" class="${String(SETTINGS[key]) === String(v) ? "on" : ""}">${l}</button>`).join("")}</div>`;
    const vol = (key, label) => `<label class="setrow"><span>${label}</span><input type="range" min="0" max="100" step="5" value="${Math.round(SETTINGS[key] * 100)}" data-vol="${key}" aria-label="${label}"><output>${Math.round(SETTINGS[key] * 100)}%</output></label>`;
    showPanel("Settings", `
      <h3>Sound</h3>${vol("music", "Music volume")}${vol("sfx", "Sound effects")}
      <div class="setrow"><span>Music</span>${`<div class="seg"><button type="button" data-a="musictoggle" class="${Music.on ? "on" : ""}">${Music.on ? "On" : "Off"}</button></div>`}<span></span></div>
      <h3>Game</h3>
      <div class="setrow"><span>Text speed</span>${seg("text", [["slow", "Slow"], ["normal", "Normal"], ["instant", "Instant"]])}<span></span></div>
      <div class="setrow"><span>Battle speed</span>${seg("battle", [["normal", "Normal"], ["fast", "Fast"]])}<span></span></div>
      <div class="setrow"><span>Screen shake</span>${seg("shake", [["true", "On"], ["false", "Off"]])}<span></span></div>
      <div class="setrow"><span>Difficulty</span><div class="seg">${["story", "normal", "hard"].map(d => `<button type="button" data-diff="${d}" class="${difficulty === d ? "on" : ""}">${d[0].toUpperCase() + d.slice(1)}</button>`).join("")}</div><span></span></div>
      <p class="dim" style="font-size:12px;margin-top:6px">${DIFFS[difficulty].note} Difficulty applies from the next battle.</p>`);
    const mt = $("pausePanel").querySelector('[data-a="musictoggle"]'); if (mt) mt.addEventListener("click", ev => { ev.stopPropagation(); toggleMusic(); showSettings(); });
    if (focusKey) { const f = $("pausePanel").querySelector(`[data-set="${focusKey}"].on, [data-diff].on`); if (f) f.focus({ preventScroll: true }); }
  }
  function showControls() {
    showPanel("Controls", `<div class="keys">
      <span><kbd>WASD</kbd> <kbd>Arrows</kbd></span><span>Move, and choose in menus</span>
      <span><kbd>Shift</kbd> or <kbd>K</kbd></span><span>Dash (hold to run). Dash into a monster to ambush it. If tapping Shift brings up Windows' Sticky Keys box, use K.</span>
      <span><kbd>E</kbd> <kbd>Space</kbd></span><span>Talk, rest, read, confirm</span>
      <span><kbd>Q</kbd></span><span>Back</span>
      <span><kbd>P</kbd></span><span>Party: choose fighters, equip relics, talk with companions</span>
      <span><kbd>J</kbd></span><span>Journal: story, tasks, bonds, letters, bestiary</span>
      <span><kbd>M</kbd></span><span>Show or hide the minimap</span>
      <span><kbd>N</kbd></span><span>Music on or off</span>
      <span><kbd>Esc</kbd></span><span>Pause, anytime, even mid-battle</span>
      <span><kbd>1</kbd>–<kbd>9</kbd></span><span>Pick a dialogue or battle option</span></div>
      <p class="dim" style="font-size:12px;margin-top:10px">On a phone: the stick moves, ACT talks or confirms, DASH dashes, and ❚❚ pauses.</p>`);
  }
  // ---- save slots
  const slotKey = n => `salt-road-slot-${n}`;
  function readSlot(n) { try { return JSON.parse(localStorage.getItem(slotKey(n))); } catch { return null; } }
  function saveSlot(n) {
    const t = goal();
    try { localStorage.setItem(slotKey(n), JSON.stringify({ when: Date.now(), label: t.ch || "Prologue", party: G.members.map(id => G.party[id].name + " " + G.party[id].level).join(", "), time: (G.stats && G.stats.time) || 0, G })); toast(`Saved to slot ${n}.`); Music.sound("item"); }
    catch { toast("Couldn't save: storage is unavailable in this browser."); }
  }
  function loadSlot(n) {
    const d = readSlot(n); if (!d || !d.G) return false;
    loadState(d.G); toast(`Loaded slot ${n}: ${d.label}.`); return true;
  }
  function showSlots() {
    const rows = [1, 2, 3].map(n => { const d = readSlot(n);
      return `<div class="slot"><div><b>Slot ${n}</b> ${d ? `<small>${d.label} · ${fmtTime(d.time)} played · ${new Date(d.when).toLocaleString()}</small><small>${d.party}</small>` : `<small>Empty</small>`}</div>
        <button type="button" class="pbtn" data-a="save" data-slot="${n}">Save</button><button type="button" class="pbtn" data-a="load" data-slot="${n}" ${d ? "" : "disabled"}>Load</button></div>`; }).join("");
    showPanel("Save and load", `<p class="dim" style="font-size:13px;margin:0 0 6px">The game also autosaves at every rest, story step and battle. Slots let you keep a point to come back to, for example before a hard choice.</p>${rows}`);
  }
  function loadState(saved) {
    if (battle) return;
    newGame(false); Object.assign(G, JSON.parse(JSON.stringify(saved)));
    if (!G.active || !G.active.length) G.active = G.members.slice(0, 4);
    applyWorldState(); miniDirty = true; spawnField(); region = "";
    camX = G.px - VIEW_W / 2; camY = G.py - VIEW_H / 2; player.scarf = [];
    $("dialog").hidden = true; $("card").hidden = true; dlg = null; mode = "play";
    save(); updateHud();
  }
  // ---- world map
  const MAP_LABELS = [["Kessa", 14, 42], ["The Glass Flats", 18, 22], ["Well of Nine", 36, 26], ["Salt Cathedral", 34, 11], ["Drowned Grove", 60, 42], ["Gates of Oru", 60, 13],
    ["Oru", 89, 20], ["Guild Hall", 84, 7], ["Drowning Marsh", 20, 70], ["Reedholm", 37, 67], ["Bog Heart", 13, 84], ["Wreck Coast", 95, 66], ["Lighthouse", 121, 59],
    ["Storm Road", 116, 46], ["Storm Spire", 118, 16], ["The Deep", 89, 44]];
  function showWorldMap() {
    showPanel("World map", `<canvas id="worldMap" width="${W * 4}" height="${H * 4}" aria-label="World map"></canvas>
      <div class="maplegend"><span><i style="background:#3ee0e8"></i>You</span><span><i style="background:#ffcf4a"></i>Goal</span><span><i style="background:#fff"></i>Open passage</span><span><i style="background:#c8102e"></i>Monsters</span><span><i style="background:#9ef0f5"></i>Unread tablet</span></div>`);
    drawMinimap();
    const c = $("worldMap"), m = c.getContext("2d"), S = 4, fog = G.flags.fog || "";
    m.imageSmoothingEnabled = false; m.drawImage(miniOff, 0, 0, W, H, 0, 0, W * S, H * S);
    const seen = (x, y) => fog[Math.floor(y / FOG) * FW + Math.floor(x / FOG)] === "1";
    m.fillStyle = "#c8102e"; for (const f of field) if (seen(f.px / TILE, f.py / TILE)) m.fillRect(Math.floor(f.px / TILE) * S, Math.floor(f.py / TILE) * S, S, S);
    m.fillStyle = "#9ef0f5"; for (const l of LORE) if (seen(l.x, l.y) && !(G.flags.lore || []).includes(l.id)) m.fillRect(l.x * S, l.y * S, S, S);
    m.fillStyle = "#fff"; for (const w of WARPS) if (seen(w.x, w.y) && (!w.req || w.req())) m.fillRect(w.x * S - 1, w.y * S - 1, S + 2, S + 2);
    m.font = canvasFont(11); m.textAlign = "center";
    // place names never sit on each other, on you or on the goal ring: each takes the first free spot around its place
    const gl = goal(), pX = Math.floor(G.px / TILE) * S, pY = Math.floor(G.py / TILE) * S, taken = [{ x: pX - 5, y: pY - 5, w: 14, h: 14 }];
    if (gl.text) taken.push({ x: gl.x * S - 7, y: gl.y * S - 7, w: 18, h: 18 });
    const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    for (const [n, x, y] of MAP_LABELS) if (seen(x, y)) {
      const w2 = m.measureText(n).width + 8;
      const spot = [[0, 0], [0, -15], [0, 15], [w2 / 2 + 4, 0], [-w2 / 2 - 4, 0], [0, -30], [0, 30]].map(([dx, dy]) => ({ x: clamp(x * S + dx - w2 / 2, 0, W * S - w2), y: clamp(y * S + dy - 10, 0, H * S - 14), w: w2, h: 14 }))
        .find(b => !taken.some(o => hit(b, o)));
      if (!spot) continue;
      taken.push(spot);
      m.fillStyle = "rgba(12,10,24,.75)"; m.fillRect(spot.x, spot.y, w2, 14); m.fillStyle = "#f3efe6"; m.fillText(n, spot.x + w2 / 2, spot.y + 11);
    }
    const t = gl; if (t.text) { m.strokeStyle = "#ffcf4a"; m.lineWidth = 2; m.beginPath(); m.arc(t.x * S + 2, t.y * S + 2, 7, 0, Math.PI * 2); m.stroke(); m.fillStyle = "#ffcf4a"; m.fillRect(t.x * S, t.y * S, S, S); }
    const px = Math.floor(G.px / TILE), py = Math.floor(G.py / TILE); m.fillStyle = "#0c0a18"; m.fillRect(px * S - 3, py * S - 3, S + 6, S + 6); m.fillStyle = "#3ee0e8"; m.fillRect(px * S - 2, py * S - 2, S + 4, S + 4);
    const pct = Math.round(fog.split("").filter(ch => ch === "1").length / (FW * FH) * 100);
    $("pausePanel").querySelector(".maplegend").insertAdjacentHTML("beforeend", `<span>Explored: ${pct}%</span>`);
  }

