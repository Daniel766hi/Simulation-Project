  // ================================================================== INPUT
  const keys = {};
  const stick = { x: 0, y: 0 };
  addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    if (e.repeat) return;
    keys[k] = true;
    Music.init();
    if (k === "n") { toggleMusic(); return; }
    if (k === "escape" && mode !== "title" && !(mode === "card" && $("cardBtn").dataset.ending)) {
      if (paused) { if (!$("pausePanel").hidden) showPauseMain(); else resumeGame(); } else if (mode === "roster") closeRoster(); else if (mode === "journal") closeJournal(); else pauseGame();
      return;
    }
    if (paused) { pauseKey(k); return; }
    if (mode === "card") { if (k === "e" || k === "enter" || k === " ") $("cardBtn").click(); return; }
    if (mode === "journal") { if (k === "j" || k === "escape" || k === "q" || k === "e") closeJournal(); return; }
    if (mode === "roster") { if (k === "p" || k === "escape" || k === "q" || k === "e") closeRoster(); return; }
    if (mode === "dialog") {
      if (k === "e" || k === " " || k === "enter") dialogAdvance();
      if (["arrowup", "w"].includes(k)) moveSel(-1);
      if (["arrowdown", "s"].includes(k)) moveSel(1);
      if (/^[1-9]$/.test(k)) pickChoice(Number(k) - 1);
      return;
    }
    if (mode === "battle") { battleKey(k); return; }
    if (mode === "title") { if (k === "enter" || k === " ") startGame(); return; }
    if (mode !== "play") return;
    if (k === "e" || k === "enter" || k === " ") interact();
    if (k === "m") showMap = !showMap;
    if (k === "shift" || k === "k") dash();
    if (k === "p") openRoster();
    if (k === "j") openJournal();
  });
  addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
  addEventListener("blur", () => { for (const k in keys) keys[k] = false; if (mode === "play" || mode === "battle") pauseGame(); });
  addEventListener("pointerdown", () => Music.init(), { once: true });
  const stickEl = $("stick"), knob = $("knob");
  let stickId = null;
  function stickMove(e) {
    const r = stickEl.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const max = r.width / 2 - 10, d = Math.hypot(dx, dy);
    if (d > max) { dx *= max / d; dy *= max / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    stick.x = Math.abs(dx) > 8 ? dx / max : 0; stick.y = Math.abs(dy) > 8 ? dy / max : 0;
  }
  // Fingers drive the stick through touch events, mouse and pen through pointer events. On phones a second finger
  // (tapping DASH) can make the browser cancel the first finger's *pointer* while the finger is still down; the stick
  // used to reset and ignore that thumb, and Sable stopped dead until it was lifted. Touches keep being tracked.
  stickEl.addEventListener("pointerdown", e => { if (e.pointerType === "touch") return; stickId = e.pointerId; stickEl.setPointerCapture(e.pointerId); stickMove(e); });
  stickEl.addEventListener("pointermove", e => { if (e.pointerType !== "touch" && e.pointerId === stickId) stickMove(e); });
  let stickTouch = null;
  stickEl.addEventListener("touchstart", e => { e.preventDefault(); if (stickTouch === null) { const t = e.changedTouches[0]; stickTouch = t.identifier; stickMove(t); } }, { passive: false });
  stickEl.addEventListener("touchmove", e => {
    e.preventDefault();
    for (const t of e.changedTouches) { if (stickTouch === null) stickTouch = t.identifier; if (t.identifier === stickTouch) stickMove(t); }   // a lost thumb is picked up again
  }, { passive: false });
  const stickTouchEnd = e => { for (const t of e.changedTouches) if (t.identifier === stickTouch) { stickTouch = null; stickId = null; stick.x = stick.y = 0; knob.style.transform = ""; } };
  stickEl.addEventListener("touchend", stickTouchEnd); stickEl.addEventListener("touchcancel", stickTouchEnd);
  const stickEnd = () => { stickId = null; stick.x = stick.y = 0; knob.style.transform = ""; };
  stickEl.addEventListener("pointerup", e => { if (e.pointerType !== "touch") stickEnd(); }); stickEl.addEventListener("pointercancel", e => { if (e.pointerType !== "touch") stickEnd(); });
  $("bA").addEventListener("pointerdown", e => {   // on touch, ACT moves a scene or cinematic on by one line, where E on a keyboard skips it
     e.preventDefault(); Music.init(); if (mode === "scene" && scene) scene.t = 1e9; else if (mode === "cine" && cine) cine.t = cine.shots[cine.i].dur; else if (mode === "dialog") dialogAdvance(); else if (mode === "play") interact(); else if (mode === "title") startGame(); else if (mode === "card") $("cardBtn").click(); });
  $("dialog").addEventListener("pointerdown", e => { if (mode === "dialog" && !e.target.closest("button")) { e.preventDefault(); dialogAdvance(); } });
  // a held finger on the controls must stay a game input: no long-press menu, no text selection, no pinch zoom
  for (const el of [$("bA"), $("bB"), stickEl]) { el.addEventListener("contextmenu", e => e.preventDefault()); el.addEventListener("touchstart", e => e.preventDefault(), { passive: false }); }
  addEventListener("gesturestart", e => e.preventDefault());
  const dashPress = () => { Music.init(); player.sprintTouch = true; if (mode === "play") dash(); $("bB").style.borderColor = "var(--gold)"; };
  const runEnd = () => { player.sprintTouch = false; $("bB").style.borderColor = ""; };
  $("bB").addEventListener("pointerdown", e => { e.preventDefault(); if (e.pointerType !== "touch") dashPress(); });
  $("bB").addEventListener("touchstart", e => { e.preventDefault(); dashPress(); }, { passive: false });
  $("bB").addEventListener("touchend", runEnd); $("bB").addEventListener("touchcancel", runEnd);
  for (const ev of ["pointerup", "pointercancel", "pointerleave"]) $("bB").addEventListener(ev, e => { if (e.pointerType !== "touch") runEnd(); });
  function toggleMusic() { Music.init(); Music.toggle(); $("musicBtn").textContent = Music.on ? "♪ Music on" : "♪ Music off"; }
  $("musicBtn").addEventListener("click", toggleMusic);
  $("musicBtn").textContent = Music.on ? "♪ Music on" : "♪ Music off";
  $("partyBtn").addEventListener("click", () => { if (mode === "play") openRoster(); });

