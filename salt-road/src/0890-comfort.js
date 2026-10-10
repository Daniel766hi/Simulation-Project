  // ================================================================== COMFORT: CONTROLLERS, KEYS, TEXT SIZE, FLASHES
  // Everything the game reads arrives as a key it already knows. A remapped key, or a controller button, is turned
  // into that key before any other part of the game sees it, so every screen (the road, menus, battles, dialogue,
  // fishing, scenes) works the same with them. Arrow keys and Esc always keep their meaning.
  const ACTIONS = [
    ["up", "Move up", "w"], ["down", "Move down", "s"], ["left", "Move left", "a"], ["right", "Move right", "d"],
    ["act", "Talk, confirm", "e"], ["back", "Back", "q"], ["dash", "Dash (hold to run)", "k"],
    ["party", "Party", "p"], ["journal", "Journal", "j"], ["map", "Minimap", "m"], ["music", "Music", "n"],
  ];
  const DEFAULT_KEY = Object.fromEntries(ACTIONS.map(([id, , k]) => [id, k]));
  const PRESETS = { qwerty: {}, azerty: { up: "z", left: "q", back: "a" } };
  const boundKey = id => ((SETTINGS.keys || {})[id]) || DEFAULT_KEY[id];
  const keyName = k => ({ " ": "Space", shift: "Shift", enter: "Enter", tab: "Tab", control: "Ctrl", alt: "Alt" })[k] || (k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1));
  let remap = {};   // the key pressed -> the key the game listens for
  function buildRemap() {
    remap = {};
    // a key bound to an action sends that action's own key; on AZERTY, Q means "left" and no longer "back"
    for (const [id] of ACTIONS) { const k = boundKey(id); if (k !== DEFAULT_KEY[id]) remap[k] = DEFAULT_KEY[id]; }
    refreshHelp();
  }
  const fire = (type, key) => { const ev = new KeyboardEvent(type, { key, bubbles: true }); ev._comfort = true; window.dispatchEvent(ev); };
  let rebinding = null;   // the action waiting for its new key in Settings
  for (const type of ["keydown", "keyup"]) addEventListener(type, e => {
    if (e._comfort) return;
    const k = e.key.toLowerCase();
    if (rebinding && type === "keydown") {   // Settings is listening for a key
      e.preventDefault(); e.stopImmediatePropagation();
      if (k !== "escape") {   // a key already in use swaps with this action's old one
        const prev = boundKey(rebinding); SETTINGS.keys = { ...(SETTINGS.keys || {}) };
        for (const [id] of ACTIONS) if (id !== rebinding && boundKey(id) === k) SETTINGS.keys[id] = prev;
        SETTINGS.keys[rebinding] = k; saveSettings(); buildRemap();
      }
      const was = rebinding; rebinding = null; showSettings(); const b = $("pausePanel").querySelector(`[data-rebind="${was}"]`); if (b) b.focus({ preventScroll: true });
      return;
    }
    if (!(k in remap) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement.type !== "range") return;   // typing a save code
    e.preventDefault(); e.stopImmediatePropagation();
    if (type === "keyup" || !e.repeat) fire(type, remap[k]);
  }, true);
  function refreshHelp() {   // the key hints under the game follow the bindings
    const h = $("help"); if (!h) return;
    const k = id => `<kbd>${keyName(boundKey(id))}</kbd>`;
    h.innerHTML = `<span>${k("up")}${k("left")}${k("down")}${k("right")} / <kbd>←↑↓→</kbd> move</span><span>${k("dash")} dash (hold to run)</span><span>${k("act")} talk, rest, confirm</span>`
      + `<span>${k("back")} back</span><span>${k("party")} party</span><span>${k("journal")} journal</span><span>${k("map")} map</span><span>${k("music")} music</span><span><kbd>Esc</kbd> pause</span>`
      + (padOn ? `<span class="padnote">🎮 controller connected</span>` : "");
    const nx = $("next"); if (nx) nx.textContent = `${keyName(boundKey("act"))} / Space to continue`;
  }
  // ---- controllers: the standard layout, polled every frame
  // A / Cross: talk, confirm   B / Circle: back   X / Square: dash, hold to run   Y / Triangle: party
  // Start: pause   Select / View: journal   LB: minimap   D-pad or left stick: move and choose
  let padOn = false;
  const padHeld = {};
  const PAD_BUTTONS = [[0, "act"], [1, "back"], [2, "dash"], [3, "party"], [8, "journal"], [4, "map"]];
  function padKey(id, key, down) {
    if (!!padHeld[id] === down) return;
    padHeld[id] = down; fire(down ? "keydown" : "keyup", key);
  }
  function pollPads() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    const p = pads.find(x => x.mapping === "standard") || pads[0];
    if (!p) { for (const id of Object.keys(padHeld)) if (padHeld[id]) padKey(id, padHeld[id + ":k"] || id, false); return; }
    const btn = i => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5)), ax = i => p.axes[i] || 0;
    const dirs = { arrowup: btn(12) || ax(1) < -0.5, arrowdown: btn(13) || ax(1) > 0.5, arrowleft: btn(14) || ax(0) < -0.5, arrowright: btn(15) || ax(0) > 0.5 };
    for (const [key, on] of Object.entries(dirs)) padKey(key, key, on);
    for (const [i, act] of PAD_BUTTONS) {
      // the title screen and story cards start and continue with Enter; everywhere else A is the game's "E"
      const key = act === "act" && (mode === "title") ? "enter" : DEFAULT_KEY[act];
      if (btn(i) && !padHeld["b" + i]) padHeld["b" + i + ":k"] = key;
      padKey("b" + i, padHeld["b" + i + ":k"] || key, btn(i));
    }
    padKey("start", "escape", btn(9));
  }
  addEventListener("gamepadconnected", e => { padOn = true; refreshHelp(); toast(`Controller connected: ${String((e.gamepad && e.gamepad.id) || "").split("(")[0].trim() || "gamepad"}. A talks, B goes back, X dashes, Start pauses.`); });
  addEventListener("gamepaddisconnected", () => { padOn = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean); refreshHelp(); toast("Controller disconnected."); });
  (function padLoop() { requestAnimationFrame(padLoop); try { if (padOn || (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean))) pollPads(); } catch { /* no controller support here */ } })();
  // ---- text size and softer flashes
  const comfortCss = document.createElement("style");
  comfortCss.textContent = [1.2, 1.4].map((f, i) => {
    const c = `body.text-${i + 1}`;
    return `${c} .dialog .line{font-size:${Math.round(16 * f)}px}${c} .opts button{font-size:${Math.round(15 * f)}px}${c} .toast{font-size:${Math.round(16 * f)}px}${c} .blog{font-size:${Math.round(14 * f)}px}`
      + `${c} .menu button{font-size:${Math.round(15 * f)}px}${c} .menu button small{font-size:${Math.round(11 * f)}px}${c} .card{font-size:${Math.round(12 * f)}px}${c} #cardText{font-size:${Math.round(16 * f)}px}`
      + `${c} .goal{font-size:${Math.round(14 * f)}px}${c} .roster p,${c} .roster button small,${c} .journal p,${c} .journal li{font-size:${Math.round(14 * f)}px}${c} .pmenu button,${c} .pbtn{font-size:${Math.round(15 * f)}px}${c} #cineBox,${c} #banter{font-size:${Math.round(15 * f)}px}`;
  }).join("") + ".keymap{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px;margin:4px 0}.keymap .pbtn{flex-direction:row;align-items:center;justify-content:space-between;gap:8px}.keymap .pbtn kbd{flex:none;font:600 12px var(--font);background:#231d45;border:1px solid var(--edge);border-radius:4px;padding:1px 7px}.keymap .pbtn.wait{border-color:var(--gold);color:var(--gold)}.help .padnote{color:var(--scarf)}";
  document.head.appendChild(comfortCss);
  function applyComfort() { document.body.classList.toggle("text-1", SETTINGS.textSize === "large"); document.body.classList.toggle("text-2", SETTINGS.textSize === "larger"); document.body.classList.toggle("font-pixel", SETTINGS.font === "pixel"); }
  const _flashC = flash;
  flash = function (a) { _flashC(SETTINGS.flashes === "soft" ? a * 0.3 : a); };
  const _saveSettingsC = saveSettings;
  saveSettings = function () { _saveSettingsC(); applyComfort(); };
  // ---- Settings: the new rows and the key map
  const _showSettingsC = showSettings;
  showSettings = function (focusKey) {
    _showSettingsC(focusKey);
    const panel = $("pausePanel"), back = [...panel.querySelectorAll("button")].find(b => /^Back/.test(b.textContent.trim())); if (!back) return;
    const seg = (key, opts, cur) => `<div class="seg">${opts.map(([v, l]) => `<button type="button" data-set="${key}" data-v="${v}" class="${cur === v ? "on" : ""}">${l}</button>`).join("")}</div>`;
    const box = document.createElement("div");
    box.innerHTML = `<h3>Comfort</h3>`
      + `<div class="setrow"><span>Font</span>${seg("font", [["read", "Easy to read"], ["pixel", "Pixel"]], SETTINGS.font === "pixel" ? "pixel" : "read")}<span></span></div>`
      + `<div class="setrow"><span>Cutscene lines</span>${seg("cutPace", [["wait", "Wait for me"], ["auto", "Auto"]], SETTINGS.cutPace === "auto" ? "auto" : "wait")}<span></span></div>`
      + `<p class="dim" style="font-size:12px;margin:0 0 6px">Wait for me: each cutscene line stays until you press ${keyName(boundKey("act"))} or tap. Auto: it moves on by itself, after time to read it.</p>`
      + `<div class="setrow"><span>Text size</span>${seg("textSize", [["normal", "Normal"], ["large", "Large"], ["larger", "Larger"]], SETTINGS.textSize || "normal")}<span></span></div>`
      + `<div class="setrow"><span>Battle flashes</span>${seg("flashes", [["full", "Full"], ["soft", "Soft"]], SETTINGS.flashes || "full")}<span></span></div>`
      + `<h3>Keys</h3><p class="dim" style="font-size:12px;margin:0 0 6px">Choose an action, then press the key you want for it. Arrow keys and Esc always work. A controller works too: A talks, B goes back, X dashes, Y opens the party, Start pauses.</p>`
      + `<div class="keymap">${ACTIONS.map(([id, label]) => `<button type="button" class="pbtn${rebinding === id ? " wait" : ""}" data-rebind="${id}">${label} <kbd>${rebinding === id ? "press a key…" : keyName(boundKey(id))}</kbd></button>`).join("")}</div>`
      + `<div class="savebar"><button type="button" class="pbtn" data-keyset="qwerty">Default keys (WASD)</button><button type="button" class="pbtn" data-keyset="azerty">AZERTY keyboard (ZQSD)</button></div>`;
    back.before(box);
    if (["textSize", "flashes", "font", "cutPace"].includes(focusKey)) { const f = panel.querySelector(`[data-set="${focusKey}"].on`); if (f) f.focus({ preventScroll: true }); }
  };
  $("pausePanel").addEventListener("click", e => {
    const b = e.target.closest("button[data-rebind], button[data-keyset]"); if (!b) return;
    e.stopPropagation(); Music.sound("click");
    if (b.dataset.keyset) { SETTINGS.keys = { ...PRESETS[b.dataset.keyset] }; saveSettings(); buildRemap(); showSettings(); toast(b.dataset.keyset === "azerty" ? "Keys set for an AZERTY keyboard: Z Q S D to move, A to go back." : "Keys back to their defaults."); return; }
    rebinding = rebinding === b.dataset.rebind ? null : b.dataset.rebind; showSettings();
    const w = $("pausePanel").querySelector(`[data-rebind="${b.dataset.rebind}"]`); if (w) w.focus({ preventScroll: true });
  }, true);
  const _resumeC = resumeGame;
  resumeGame = function () { rebinding = null; return _resumeC(); };
  const _showControlsC = showControls;
  showControls = function () {
    _showControlsC();
    const back = [...$("pausePanel").querySelectorAll("button")].find(b => /^Back/.test(b.textContent.trim()));
    if (back) back.insertAdjacentHTML("beforebegin", `<p class="dim" style="font-size:12px;margin-top:8px">These are the default keys${Object.keys(SETTINGS.keys || {}).length ? "; yours are changed" : ""}. Change any of them, or switch to an AZERTY layout, in Settings &gt; Keys. A controller works too: A talks, B goes back, X dashes, Y opens the party, Select the journal, LB the minimap, Start pauses.</p>`);
  };
  buildRemap(); applyComfort();
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { remap: () => ({ ...remap }), padTest: () => { padOn = true; pollPads(); return { ...padHeld }; }, furyFull: () => { if (!battle) return false; addFury(100); renderMenu(); return true; }, cineNext: () => cineNext(), sceneTest: () => playScene([{ line: ["Sable", "The first line of a test scene."] }, { line: [null, "The second line."] }], () => { window.__sceneDone = true; }) }), 0);

