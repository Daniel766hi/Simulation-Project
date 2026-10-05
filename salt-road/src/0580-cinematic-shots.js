  // ================================================================== CINEMATIC SHOTS
  // Full-screen illustrated shots for the moments that matter: close-ups of hands and faces, the knife on the
  // rope, the fall, the Bell ringing. Each shot draws itself for its time t (0..dur); shots cut, flash or fade.
  let cine = null;
  function playCine(shots, done) {
    if (!shots.length) { if (done) done(); return; }
    cine = { shots, i: 0, t: 0, done, prev: mode, fade: 1, flash: 0 };
    $("toast").hidden = true;
    mode = "cine"; sceneHud(true); enterShot();
  }
  function enterShot() {
    const s = cine.shots[cine.i]; cine.t = 0;
    if (s.flash) cine.flash = 1;
    if (s.sound) Music.sound(s.sound);
    if (s.shake) shake = Math.max(shake, s.shake);
    if (s.line) { const [who, text] = s.line; banterEl.innerHTML = `${who ? `<b style="color:var(--scarf)">${who}:</b> ` : ""}${text}`; banterEl.hidden = false; } else if (!s.keepLine) banterEl.hidden = true;
  }
  const _toastCine = toast;
  toast = function (text) { if (cine) { const tx = text; const wait = () => { if (cine) setTimeout(wait, 400); else _toastCine(tx); }; setTimeout(wait, 400); return; } _toastCine(text); };
  function endCine() { const c = cine; cine = null; banterEl.hidden = true; sceneHud(!!scene); mode = c.prev === "cine" ? "play" : c.prev; if (c.done) c.done(); }
  const _updateCine = update;
  update = function (dt) {
    _updateCine(dt);
    if (!cine || mode !== "cine" || paused) return;
    const s = cine.shots[cine.i]; cine.t += dt; cine.flash = Math.max(0, cine.flash - dt * 2.5);
    if (cine.t >= s.dur) { cine.i++; if (cine.i >= cine.shots.length) return endCine(); enterShot(); }
  };
  addEventListener("keydown", e => { if (!cine || mode !== "cine") return; const k = e.key.toLowerCase(); if (k === "escape" || k === "e" || k === "enter" || k === " ") { e.stopImmediatePropagation(); e.preventDefault(); cine.i = cine.shots.length; endCine(); } }, true);
  const _renderCine = render;
  render = function () {
    if (!cine || battle) return _renderCine();
    const s = cine.shots[cine.i]; if (!s) return;
    const k = Math.min(1, cine.t / s.dur);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const sx = shake && !REDUCED && SETTINGS.shake ? Math.round(rand(-1, 1) * shake) : 0, sy = shake && !REDUCED && SETTINGS.shake ? Math.round(rand(-1, 1) * shake) : 0;
    g.translate(sx, sy); g.imageSmoothingEnabled = false; g.fillStyle = "#000"; g.fillRect(0, 0, VIEW_W, VIEW_H);
    s.draw(g, cine.t, k);
    g.restore();
    const fin = s.fadeIn ? Math.max(0, 1 - cine.t / s.fadeIn) : 0, fout = s.fadeOut ? Math.max(0, 1 - (s.dur - cine.t) / s.fadeOut) : 0, f = Math.max(fin, fout);
    if (f > 0) { g.fillStyle = `rgba(0,0,0,${f})`; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    if (cine.flash > 0) { g.fillStyle = `rgba(255,255,255,${cine.flash})`; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    g.fillStyle = "#000"; g.fillRect(0, 0, VIEW_W, 18); g.fillRect(0, VIEW_H - 18, VIEW_W, 18);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(buf, 0, 0, canvas.width, canvas.height); HI.length = 0; $("minimap").hidden = true;
  };
  const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const wrap = (v, m) => ((v % m) + m) % m;
  shake = shake || 0;
  // ---------------------------------------------------------------- pixel-art shot kit
  // Every shot is built from the game's own art: dialogue portraits (drawBust) and chibi sprites (drawPerson),
  // enlarged by whole numbers only, plus detail art drawn on a coarse pixel grid. Nothing anti-aliased.
  const offC = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.imageSmoothingEnabled = false; return [c, x]; };
  const [DC, dc] = offC(80, 48);      // detail grid, shown at x4 (fills the 320x192 frame)
  const [BC, bcx] = offC(48, 48);     // one portrait
  const [SC, scx] = offC(48, 48);     // one chibi sprite
  const PR = (c2, x, y, w, h, col) => { c2.fillStyle = col; c2.fillRect(Math.round(x), Math.round(y), w, h); };
  const PO = (c2, x, y, w, h, col) => { PR(c2, x - 1, y - 1, w + 2, h + 2, OUT); PR(c2, x, y, w, h, col); };
  const blit = (g2, c, dx, dy, k, sw = c.width, sh = c.height) => { g2.imageSmoothingEnabled = false; g2.drawImage(c, 0, 0, sw, sh, Math.round(dx), Math.round(dy), sw * k, sh * k); };
  const detail = (g2, fn, t) => { dc.clearRect(0, 0, 80, 48); fn(dc, t); blit(g2, DC, 0, 0, 4); };
  // portrait with an expression painted in the portrait's own 48x48 grid
  function portrait(look, ex = {}, t = 0) {
    bcx.clearRect(0, 0, 48, 48); drawBust(bcx, look);
    const sk = look.skin, skD = shadeHex(sk, -0.2), R = (x, y, w, h, c) => PR(bcx, x, y, w, h, c);
    if (ex.bg === false) { /* keep the portrait background */ }
    if (ex.brows === "worried") { R(17, 19, 6, 1, sk); R(26, 19, 6, 1, sk); R(17, 19, 2, 1, "#2b1a1a"); R(19, 18, 2, 1, "#2b1a1a"); R(21, 17, 2, 1, "#2b1a1a"); R(30, 19, 2, 1, "#2b1a1a"); R(28, 18, 2, 1, "#2b1a1a"); R(26, 17, 2, 1, "#2b1a1a"); }
    if (ex.brows === "fierce") { R(17, 19, 6, 1, sk); R(26, 19, 6, 1, sk); R(17, 17, 2, 1, "#2b1a1a"); R(19, 18, 2, 1, "#2b1a1a"); R(21, 19, 2, 1, "#2b1a1a"); R(30, 17, 2, 1, "#2b1a1a"); R(28, 18, 2, 1, "#2b1a1a"); R(26, 19, 2, 1, "#2b1a1a"); }
    if (ex.eyes === "closed") { R(17, 20, 6, 3, sk); R(26, 20, 6, 3, sk); R(17, 22, 6, 1, "#2b1a1a"); R(26, 22, 6, 1, "#2b1a1a"); }
    if (ex.eyes === "wide") { R(17, 19, 6, 1, "#f4f0ea"); R(26, 19, 6, 1, "#f4f0ea"); R(20, 21, 1, 1, "#111"); R(28, 21, 1, 1, "#111"); }
    if (ex.eyes === "down") { R(19, 20, 3, 3, "#f4f0ea"); R(27, 20, 3, 3, "#f4f0ea"); R(19, 21, 3, 2, look.style && look.style.eye || "#3a2a1a"); R(27, 21, 3, 2, look.style && look.style.eye || "#3a2a1a"); }
    if (ex.mouth === "open") { R(21, 28, 7, 3, "#5a0f18"); R(22, 28, 5, 1, "#f4f0ea"); }
    if (ex.mouth === "shout") { R(20, 27, 9, 5, OUT); R(21, 28, 7, 3, "#5a0f18"); R(21, 28, 7, 1, "#f4f0ea"); R(23, 30, 3, 1, "#c84a5a"); }
    if (ex.mouth === "grit") { R(20, 28, 9, 3, OUT); R(21, 29, 7, 1, "#f4f0ea"); }
    if (ex.mouth === "smile") { R(21, 29, 7, 1, sk); R(20, 28, 1, 1, "#8a3a3a"); R(21, 29, 7, 1, "#8a3a3a"); R(28, 28, 1, 1, "#8a3a3a"); }
    if (ex.mouth === "sad") { R(21, 29, 7, 2, sk); R(21, 30, 1, 1, "#8a3a3a"); R(22, 29, 5, 1, "#8a3a3a"); R(27, 30, 1, 1, "#8a3a3a"); }
    if (ex.crown) { for (let i = 0; i < 6; i++) { const x = 13 + i * 4; R(x - 1, 1, 4, 8, OUT); R(x, 2, 2, 6, "#8ab0b8"); R(x, 2, 2, 1, "#c8d8e0"); } R(12, 7, 24, 4, OUT); R(13, 8, 22, 2, "#c9a227"); R(13, 8, 22, 1, "#ffe08a"); R(23, 8, 2, 2, "#3ee0e8"); }
    if (ex.smudge) { R(29, 25, 3, 2, "rgba(40,24,24,.45)"); R(16, 14, 2, 3, "rgba(40,24,24,.35)"); }
    if (ex.tears) { const d = Math.floor((t * 6) % 8); for (const x of [19, 28]) { R(x, 23, 1, 3 + d % 5, "#9ad8ff"); R(x, 26 + d % 5, 2, 1, "#c8ecff"); } }
    if (ex.light) { bcx.fillStyle = ex.light; for (let x = 0; x < 20; x++) { bcx.globalAlpha = 0.03 * (20 - x) / 20 * 10; bcx.fillRect(ex.lightFrom === "right" ? 47 - x : x, 0, 1, 48); } bcx.globalAlpha = 1; }
    return BC;
  }
  function drawPortrait3(g2, look, ex, t, x, y, k = 3) {   // a framed portrait at x3 (144 px)
    portrait(look, ex, t); const s = 48 * k;
    PR(g2, x - 3, y - 3, s + 6, s + 6, "#0e0b1e"); PR(g2, x - 2, y - 2, s + 4, s + 4, "#5e5680"); PR(g2, x - 1, y - 1, s + 2, s + 2, "#0e0b1e");
    blit(g2, BC, x, y, k);
  }
  // a chibi sprite, optionally posed, drawn at a whole-number scale with its feet at (x, y)
  function chibi(g2, look, o, k, x, y) {
    scx.clearRect(0, 0, 48, 48); drawPerson(scx, 24, 40, { dir: "down", walking: false, walk: 0, bob: 0, ...look, ...o });
    if (o.pose === "hang") {   // arms up, holding a rope above the head
      scx.clearRect(24 - 8, 40 - 13, 3, 9); scx.clearRect(24 + 5, 40 - 13, 3, 9);
      const sl = look.robe; PO(scx, 24 - 6, 40 - 36, 2, 24, sl); PO(scx, 24 + 4, 40 - 36, 2, 24, sl); PR(scx, 24 - 6, 40 - 38, 2, 3, look.skin); PR(scx, 24 + 4, 40 - 38, 2, 3, look.skin);
    }
    if (o.pose === "reach") { scx.clearRect(24 + 5, 40 - 13, 3, 9); PO(scx, 24 + 4, 40 - 22, 2, 11, look.robe); PR(scx, 24 + 4, 40 - 24, 2, 3, look.skin); }
    g2.save(); g2.imageSmoothingEnabled = false;
    if (o.rot) { g2.translate(Math.round(x), Math.round(y - 20 * k)); g2.rotate(o.rot * Math.PI / 2); g2.drawImage(SC, -24 * k, -20 * k, 48 * k, 48 * k); }
    else g2.drawImage(SC, Math.round(x - 24 * k), Math.round(y - 40 * k), 48 * k, 48 * k);
    g2.restore();
  }
  const PX = {
    bands(g2, cols, y0 = 0, y1 = VIEW_H) { const h = (y1 - y0) / cols.length; cols.forEach((c, i) => PR(g2, 0, y0 + Math.floor(i * h), VIEW_W, Math.ceil(h) + 1, c)); },
    stars(g2, t, n = 50, h = 100) { for (let i = 0; i < n; i++) if (Math.sin(t * 2 + i * 1.7) > -0.3) PR(g2, (hash(i, 91) * VIEW_W) | 0, (hash(i, 93) * h) | 0, 1, 1, i % 7 ? "#c8c2e0" : "#ffffff"); },
    moon(g2, x, y, r) { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); PR(g2, x - w, y + dy, w * 2, 1, "#f2e6c0"); } PR(g2, x - 3, y - 2, 2, 2, "#d8ccaa"); PR(g2, x + 2, y + 3, 3, 2, "#d8ccaa"); },
    fire(g2, x, y, w, h, t) { for (let i = 0; i < w; i += 2) { const f = Math.abs(Math.sin(t * 8 + i * 0.9)), fh = Math.round(h * (0.45 + 0.55 * f)); PR(g2, x + i, y - fh, 2, fh, "#c8341e"); PR(g2, x + i, y - Math.round(fh * 0.7), 2, Math.round(fh * 0.7), "#ff8a3a"); PR(g2, x + i, y - Math.round(fh * 0.35), 2, Math.round(fh * 0.35), "#ffe08a"); } },
    embers(g2, t, x0, x1, y0, h, n = 26, up = true) { for (let i = 0; i < n; i++) { const ph = (t * (0.25 + hash(i, 5) * 0.3) + hash(i, 7)) % 1; PR(g2, x0 + hash(i, 3) * (x1 - x0) + Math.round(Math.sin(t * 2 + i) * 3), up ? y0 - ph * h : y0 + ph * h, 1, 1, ph < 0.5 ? "#ffcf4a" : "#ff6a3a"); } },
    rain(g2, t, n = 120) { for (let i = 0; i < n; i++) { const x = wrap(hash(i, 41) * (VIEW_W + 40) - t * 40, VIEW_W + 40) - 20, y = wrap(hash(i, 43) * VIEW_H + t * 240, VIEW_H + 10) - 5; PR(g2, x, y, 1, 4, "#b8cef0"); } },
    village(g2, y, col) { for (const [x, w, h] of [[-4, 44, 20], [36, 34, 28], [66, 30, 18], [214, 40, 24], [250, 38, 30], [286, 40, 20]]) { PR(g2, x, y - h, w, h, col); for (let s = 0; s < 8; s++) PR(g2, x - 2 + s, y - h - s, w + 4 - s * 2, 1, col); } },
    tower(g2, x, y, t, o = {}) {   // the Kessa bell tower, pixel art, feet at (x, y)
      PR(g2, x - 12, y - 70, 24, 70, "#15102a"); PR(g2, x - 11, y - 70, 22, 70, "#2a2244"); for (let r = 0; r < 70; r += 7) PR(g2, x - 11, y - 70 + r, 22, 1, "#1e1836"); PR(g2, x - 3, y - 12, 6, 12, "#0e0b1e");
      PR(g2, x - 14, y - 90, 28, 3, "#15102a"); PR(g2, x - 13, y - 90, 3, 20, "#15102a"); PR(g2, x + 10, y - 90, 3, 20, "#15102a"); PR(g2, x - 14, y - 72, 28, 3, "#15102a");
      for (let s = 0; s < 10; s++) PR(g2, x - 15 + s, y - 91 - s, 30 - s * 2, 1, "#3a1a24");
      if (o.fire) { PR(g2, x - 10, y - 87, 20, 15, "rgba(255,120,40,.25)"); PX.fire(g2, x - 10, y - 72, 20, 14, t); }
      if (o.bell) { const sx = Math.round(Math.sin(t * 1.6) * 2); for (let r = 0; r < 11; r++) { const w = 4 + Math.round(r * 0.55) + (r > 8 ? 2 : 0); PR(g2, x - w + sx, y - 86 + r, w * 2, 1, r === 0 ? "#b8902a" : "#e8b83a"); } PR(g2, x - 2 + sx, y - 84, 1, 7, "#ffe08a"); }
    },
    fist(c2, x, y, skin) {   // a small clenched hand on the detail grid, 11x8
      PR(c2, x - 1, y - 1, 13, 10, OUT); PR(c2, x, y, 11, 8, skin); const d = shadeHex(skin, -0.28);
      for (let r = 1; r < 8; r += 2) PR(c2, x + 3, y + r, 8, 1, d); PR(c2, x + 9, y + 1, 1, 1, "#ffffff"); PR(c2, x + 9, y + 3, 1, 1, "#ffffff"); PR(c2, x + 9, y + 5, 1, 1, "#ffffff");
      PR(c2, x - 2, y + 2, 3, 5, OUT); PR(c2, x - 1, y + 3, 2, 3, shadeHex(skin, 0.1));
    },
    rope(c2, x, y0, y1, w, t) { PR(c2, x, y0, w, y1 - y0, "#6b5a44"); for (let y = y0; y < y1; y++) if ((y + Math.floor(t * 6)) % 3 === 0) PR(c2, x + ((y >> 1) % 2), y, w - 1, 1, "#8a7a5a"); PR(c2, x + w - 1, y0, 1, y1 - y0, "#4a3a2a"); },
  };
  const LIO_LOOK_C = { robe: "#4a7a9a", hair: "#3a2a1e", skin: "#d9a070", style: { hair: "fringe", eye: "#3a6a8a" } };
  const LIMP_LOOK_C = { robe: "#c9a227", hair: "#5a3a2a", skin: "#b88a64", style: { hair: "hood", hood: "#3a2a1e", coat: true, beard: true, eye: "#5a4a3a" } };
  const GUILD_LOOK_C = { robe: "#3a2a1e", hair: "#1b1633", skin: "#c98d63", style: { hair: "hood", hood: "#2a2a2a", coat: true } };
  const MOTHER_LOOK_C = { robe: "#2a2240", hair: "#3a2a2a", skin: "#e8b48a", hero: true, style: { hair: "long", dress: true, eye: "#3a6a8a" } };
  const nadiaLook = () => (NPCS.find(n => n.id === "nadia") || {}).look || { robe: "#3b2f7a", hair: "#d8d0c0", skin: "#8a5a33", style: { hair: "bun" } };
  const fireBg = (g2, t) => { PX.bands(g2, ["#1a0a10", "#2a0e12", "#3e1614", "#5a2014", "#7a2e16"]); for (let i = 0; i < 12; i++) { const s = 3 + (i % 3) * 2, a = Math.sin(t * 3 + i) > 0; PR(g2, (hash(i, 61) * VIEW_W) | 0, (hash(i, 63) * VIEW_H) | 0, s, s, a ? "#b8541e" : "#8a3a18"); } PX.embers(g2, t, 0, VIEW_W, 196, 190, 30); };
  const nightBg = (g2, t) => { PX.bands(g2, ["#06050f", "#0a0818", "#120e24", "#1a1432", "#241c40"], 0, 150); PX.stars(g2, t, 70, 110); };
  const portraitShot = (look, ex, bg, x = 88) => (g2, t) => { bg(g2, t); drawPortrait3(g2, look, ex, t, x, 24); };

  // ---------------------------------------------------------------- the night of the theft
  const THEFT_ARRIVE = [
    { dur: 4.4, fadeIn: 0.8, line: [null, "Torches on the tower. Men in Guild coats are hauling the Rain Bell down on ropes."], draw: (g2, t, k) => {
      const pan = Math.round(-24 + k * 24);
      PX.bands(g2, ["#0a0618", "#160a20", "#2a1026", "#3e1624", "#58201e"], 0, 176); PX.stars(g2, t, 40, 70);
      g2.save(); g2.translate(0, pan);
      PX.village(g2, 176, "#120c22"); PX.tower(g2, 160, 176, t, { fire: true });
      const bx = 188 + Math.round(Math.sin(t * 1.5) * 3), by = 96; for (let i = 0; i < 18; i++) PR(g2, 170 + Math.round(i * (bx - 170) / 18), 88 + Math.round(i * (by - 88) / 18), 1, 1, "#8a7a5a");
      for (let r = 0; r < 12; r++) { const w = 4 + Math.round(r * 0.6) + (r > 9 ? 2 : 0); PR(g2, bx - w, by + r, w * 2, 1, "#e8b83a"); }
      chibi(g2, GUILD_LOOK_C, { dir: "down" }, 1, 150, 104); chibi(g2, GUILD_LOOK_C, { dir: "down" }, 1, 172, 104);
      PX.fire(g2, 156, 84, 3, 6, t); PX.fire(g2, 178, 84, 3, 6, t + 1);
      PR(g2, 160, 88, 1, 34, "#8a7a5a"); chibi(g2, LIO_LOOK_C, { pose: "hang" }, 1, 160, 150);
      PX.embers(g2, t, 130, 200, 110, 90, 30);
      g2.restore(); PR(g2, 0, 176, VIEW_W, 16, "#1a1422");
    } },
    { dur: 3.6, line: ["Lio", "SABLE! I'm holding on! I'm holding on like a courier!"], sound: "encounter", draw: (g2, t, k) => {
      fireBg(g2, t);
      detail(g2, (c2, tt) => { PX.rope(c2, 37, 0, 48, 6, tt); const slip = Math.min(3, Math.floor(k * 4)); PX.fist(c2, 34, 11 + slip, "#d9a070"); PX.fist(c2, 34, 22 + slip, "#d9a070"); PR(c2, 33, 31 + slip, 13, 6, OUT); PR(c2, 34, 32 + slip, 11, 5, "#4a7a9a"); PR(c2, 34, 32 + slip, 11, 1, "#6a9aba"); if (Math.sin(tt * 5) > 0.5) PR(c2, 47, 18 + slip, 1, 2, "#9ad8ff"); }, t);
    } },
    { dur: 3.8, line: ["The limping man", "(Tiredly. Almost gently.) Let go of the rope, boy. It isn't yours."], draw: portraitShot(LIMP_LOOK_C, { brows: "worried", eyes: "down", light: "#ff9a4a" }, fireBg) },
    { dur: 3.4, line: ["Lio", "It IS mine! I'm going to ring it at the first rain! For everyone!"], draw: portraitShot(LIO_LOOK_C, { brows: "fierce", mouth: "grit", tears: true, smudge: true, light: "#ff9a4a", lightFrom: "right" }, fireBg) },
    { dur: 2.6, flash: true, shake: 3, line: [null, "Two starved jackals in Guild collars come snarling down the stairs."], draw: (g2, t, k) => {
      PX.bands(g2, ["#0a0612", "#140a1a", "#221020", "#2e1422"]); for (let i = 0; i < 8; i++) PR(g2, 20 + i * 16, 150 - i * 14, 300 - i * 16, 14, i % 2 ? "#1e1832" : "#241c3a");
      drawBattleMonster(g2, { sprite: "jackal", hurt: 0, st: {} }, 120 + Math.round(k * 16), 150); drawBattleMonster(g2, { sprite: "jackal", hurt: 0, st: {} }, 210 - Math.round(k * 16), 124);
      for (let i = 0; i < 20; i++) { const a = hash(i, 11) * Math.PI * 2, r = 70 + ((t * 160 + i * 17) % 50); PR(g2, 160 + Math.cos(a) * r, 96 + Math.sin(a) * r * 0.6, 2, 2, "rgba(255,255,255,.35)"); }
    } },
  ];
  const THEFT_FALL = [
    { dur: 3.6, fadeIn: 0.4, line: [null, "You reach the foot of the tower as the Bell swings out over the dark. The limping man looks straight at you."], draw: (g2, t) => {
      PX.bands(g2, ["#0a0618", "#160a20", "#2a1026", "#3e1624", "#58201e"], 0, 176); PX.stars(g2, t, 30, 50);
      PX.tower(g2, 160, 176, t, { fire: true }); chibi(g2, LIMP_LOOK_C, { dir: "down" }, 1, 166, 104); PX.fire(g2, 172, 84, 3, 6, t);
      if (Math.sin(t * 6) > 0.3) PR(g2, 174, 94, 3, 1, "#ffffff");
      PR(g2, 160, 88, 1, 34, "#8a7a5a"); chibi(g2, LIO_LOOK_C, { pose: "hang" }, 1, 160, 150);
      chibi(g2, HEROES.sable.look, { dir: "up", hero: true }, 3, 160, 206);
      PX.embers(g2, t, 120, 210, 120, 110, 30); PR(g2, 0, 176, VIEW_W, 16, "#1a1422");
    } },
    { dur: 2.6, sound: "crit", line: [null, "Then he cuts the bell-rope."], draw: (g2, t, k) => {
      fireBg(g2, t);
      detail(g2, c2 => {
        const cut = k > 0.6, gap = cut ? Math.min(14, Math.floor((k - 0.6) * 50)) : 0;
        PX.rope(c2, 37, 0, 22 - gap, 6, 0); PX.rope(c2, 37, 25 + gap, 48, 6, 0);
        if (!cut) PX.rope(c2, 37, 22, 25, 6, 0); else for (let i = 0; i < 6; i++) { PR(c2, 37 + i, 22 - gap, 1, 2 + (i % 3), "#8a7a5a"); PR(c2, 37 + i, 23 + gap - (i % 2), 1, 2, "#8a7a5a"); }
        const kx = Math.round(4 + Math.min(k, 0.6) / 0.6 * 30); PR(c2, kx - 1, 21, 12, 5, OUT); PR(c2, kx, 22, 10, 3, "#6b3f24"); PR(c2, kx + 10, 21, 16, 5, OUT); PR(c2, kx + 10, 22, 15, 3, "#c8c8d8"); PR(c2, kx + 10, 22, 15, 1, "#ffffff"); PR(c2, kx + 25, 23, 1, 1, "#c8c8d8");
      }, t);
      if (k > 0.6 && k < 0.7) PR(g2, 0, 0, VIEW_W, VIEW_H, "rgba(255,255,255,.5)");
    } },
    { dur: 2.8, flash: true, line: ["Sable", "LIO!"], draw: (g2, t, k) => {
      PX.bands(g2, ["#2a0a10", "#3e1212", "#5a1c14", "#7a2c16", "#9a3e18"]); PX.embers(g2, t, 0, VIEW_W, 196, 200, 40);
      for (let i = 0; i < 40; i++) PR(g2, (hash(i, 17) * VIEW_W) | 0, wrap(hash(i, 19) * 240 - t * 500, 240) - 30, 1, 12 + (i % 3) * 6, "rgba(255,220,200,.45)");
      const y = Math.round(-10 + ease(k) * 150); chibi(g2, LIO_LOOK_C, { rot: Math.floor(t * 3) % 4 === 0 ? 0 : 1 }, 3, 150, y + 60);
      for (let i = 0; i < 30; i++) PR(g2, 150 + Math.round(Math.sin(i * 0.4 + t * 4) * 3), y - 20 - i * 2, 1, 2, "#8a7a5a");
      chibi(g2, HEROES.sable.look, { dir: "up", hero: true, pose: "reach" }, 3, 250, 206);
    } },
    { dur: 1.3, shake: 6, sound: "defeat", draw: (g2, t) => { PR(g2, 0, 0, VIEW_W, VIEW_H, "#000"); for (let i = 0; i < 16; i++) { const a = hash(i, 71) * Math.PI; PR(g2, 160 + Math.cos(a) * t * 70, 150 - Math.sin(a) * t * 30, 3, 3, `rgba(200,190,170,${Math.max(0, 0.6 - t * 0.5)})`); } } },
    { dur: 4.6, fadeIn: 0.8, line: [null, "You don't remember crossing the square. You remember that he was still holding the rope."], draw: (g2, t) => {
      detail(g2, (c2, tt) => {
        for (let y = 0; y < 48; y += 4) for (let x = (y / 4) % 2 ? -3 : 0; x < 80; x += 7) { PR(c2, x, y, 7, 4, "#1c1624"); PR(c2, x + 1, y + 1, 5, 2, "#302838"); }
        PR(c2, 0, 18, 30, 12, OUT); PR(c2, 0, 19, 29, 10, "#4a7a9a"); PR(c2, 0, 19, 29, 1, "#6a9aba"); PR(c2, 26, 19, 3, 10, "#3a6a8a");
        PR(c2, 29, 17, 12, 13, OUT); PR(c2, 30, 18, 10, 11, "#d9a070"); PR(c2, 30, 26, 10, 3, shadeHex("#d9a070", -0.15));
        PX.rope(c2, 44, 0, 48, 4, 0); for (let f = 0; f < 4; f++) { PR(c2, 39, 18 + f * 3, 8, 3, OUT); PR(c2, 40, 19 + f * 3, 6, 1, "#d9a070"); PR(c2, 44, 19 + f * 3, 2, 1, shadeHex("#d9a070", -0.25)); }
        for (let i = 0; i < 14; i++) { const ph = (tt * (0.15 + hash(i, 5) * 0.2) + hash(i, 7)) % 1; PR(c2, hash(i, 3) * 80, ph * 48, 1, 1, ph < 0.6 ? "#ffcf4a" : "#ff6a3a"); }
        c2.fillStyle = `rgba(255,140,60,${0.08 + 0.05 * Math.sin(tt * 6)})`; c2.fillRect(0, 0, 80, 48);
      }, t);
    } },
    { dur: 4.6, fadeOut: 1, line: [null, "They go north into the dark with the Bell on a pole between them. The limping man looks back, once."], draw: (g2, t, k) => {
      nightBg(g2, t); PX.moon(g2, 250, 36, 9);
      for (let x = 0; x < VIEW_W; x++) { const h = Math.round(136 + Math.sin(x * 0.02) * 6 + Math.sin(x * 0.07) * 2); PR(g2, x, h, 1, VIEW_H - h, "#0f0a1c"); }
      const x = Math.round(210 - k * 80);
      chibi(g2, GUILD_LOOK_C, { dir: "left", walking: true, walk: t * 1.2 }, 2, x - 16, 140); chibi(g2, GUILD_LOOK_C, { dir: "left", walking: true, walk: t * 1.2 + 0.5 }, 2, x + 16, 140);
      PR(g2, x - 26, 104, 52, 2, "#3a2a1e"); for (let r = 0; r < 9; r++) { const w = 3 + Math.round(r * 0.5); PR(g2, x - w, 106 + r, w * 2, 1, "#e8b83a"); }
      chibi(g2, LIMP_LOOK_C, { dir: k > 0.55 && k < 0.8 ? "right" : "left", walking: !(k > 0.55 && k < 0.8), walk: t }, 2, x + 50, 140); PX.fire(g2, x + 58, 110, 3, 6, t);
    } },
  ];
  // ---------------------------------------------------------------- the salt child (cold open)
  const SALT_CHILD = [
    { dur: 4.4, fadeIn: 1.2, line: [null, "Twenty years ago. The last dry night of the year."], draw: (g2, t) => {
      nightBg(g2, t); PX.moon(g2, 240, 40, 12); PR(g2, 0, 140, VIEW_W, 52, "#c8c2d8"); for (let i = 0; i < 30; i++) PR(g2, (hash(i, 51) * VIEW_W) | 0, 142 + ((hash(i, 53) * 48) | 0), 4 + (i % 3) * 3, 1, "#e0dcea");
      const x = Math.round(40 + t * 14); chibi(g2, MOTHER_LOOK_C, { dir: "right", walking: true, walk: t * 1.1 }, 3, x, 160); PR(g2, x + 6, 118, 8, 6, OUT); PR(g2, x + 7, 119, 6, 4, "#e8e2d0");
    } },
    { dur: 4.4, line: [null, "She sets the child down on a rock and wraps her scarf around the small neck. Twice. Tight."], draw: (g2, t, k) => {
      detail(g2, c2 => {
        PR(c2, 0, 0, 80, 34, "#120e26"); PR(c2, 0, 34, 80, 14, "#c8c2d8"); PR(c2, 64, 5, 5, 5, "#f2e6c0");
        PR(c2, 22, 30, 36, 9, OUT); PR(c2, 23, 31, 34, 7, "#857ea5"); PR(c2, 23, 31, 34, 1, "#a8a0c8");
        PR(c2, 30, 20, 20, 11, OUT); PR(c2, 31, 21, 18, 9, "#e8e2d0"); PR(c2, 35, 16, 10, 8, OUT); PR(c2, 36, 17, 8, 6, "#e8b48a"); PR(c2, 36, 16, 8, 2, "#1a1020");
        PR(c2, 37, 20, 2, 1, "#2b1a1a"); PR(c2, 41, 20, 2, 1, "#2b1a1a"); PR(c2, 39, 22, 2, 1, "#c07878");
        const w = Math.min(2, k * 2.6); PR(c2, 33, 23, Math.round(14 * Math.min(1, w)), 2, "#3ee0e8"); if (w > 1) PR(c2, 33, 25, Math.round(14 * (w - 1)), 2, "#1fb8c2");
        const hx = Math.round(56 - k * 6); PR(c2, hx - 1, 10, 10, 9, OUT); PR(c2, hx, 11, 8, 7, "#e8b48a"); PR(c2, hx + 8, 8, 14, 7, OUT); PR(c2, hx + 9, 9, 13, 5, "#2a2240");
      }, t);
    } },
    { dur: 4.4, line: ["A woman in a cyan scarf", "Stay on the rock, love. Someone will come. Someone always comes for the ones who stay on the rock."], draw: portraitShot(MOTHER_LOOK_C, { brows: "worried", mouth: "smile", tears: true, light: "#c8d0ff" }, (g2, t) => { nightBg(g2, t); PX.moon(g2, 40, 40, 16); PR(g2, 0, 150, VIEW_W, 42, "#141030"); }) },
    { dur: 4.6, line: [null, "She walks on into the dark alone. The child doesn't cry. The child watches her go."], draw: (g2, t, k) => {
      nightBg(g2, t); PX.moon(g2, 240, 40, 12); PR(g2, 0, 140, VIEW_W, 52, "#c8c2d8");
      g2.globalAlpha = Math.max(0, 1 - k * 1.1); chibi(g2, MOTHER_LOOK_C, { dir: "up", walking: true, walk: t }, 2, Math.round(170 + k * 20), Math.round(150 - k * 16)); g2.globalAlpha = 1;
      PR(g2, 48, 162, 44, 10, OUT); PR(g2, 49, 163, 42, 8, "#857ea5"); PR(g2, 58, 148, 24, 15, OUT); PR(g2, 59, 149, 22, 13, "#e8e2d0"); PR(g2, 63, 144, 14, 10, OUT); PR(g2, 64, 145, 12, 8, "#e8b48a"); PR(g2, 64, 144, 12, 3, "#1a1020"); PR(g2, 61, 153, 18, 3, "#3ee0e8");
      PR(g2, 66, 148, 2, 2, "#2b1a1a"); PR(g2, 72, 148, 2, 2, "#2b1a1a"); if (Math.sin(t * 2) > 0) PR(g2, 82, 144, 3, 4, "#e8b48a");
    } },
    { dur: 5, fadeOut: 1.2, line: [null, "In the morning, the village of Kessa found her. They named her Sable, for the colour of the night she was left in."], draw: (g2, t) => {
      PX.bands(g2, ["#e8a878", "#f0b88a", "#f4c8a0", "#f8dcc0"], 0, 140); PX.village(g2, 140, "#b89090"); PR(g2, 0, 140, VIEW_W, 52, "#e8e0f0");
      PR(g2, 138, 162, 44, 10, OUT); PR(g2, 139, 163, 42, 8, "#857ea5"); PR(g2, 148, 148, 24, 15, OUT); PR(g2, 149, 149, 22, 13, "#e8e2d0"); PR(g2, 151, 153, 18, 3, "#3ee0e8"); PR(g2, 154, 144, 12, 8, "#e8b48a");
      chibi(g2, { ...nadiaLook(), hair: "#5a3a2a" }, { dir: "right" }, 2, 118, 172); chibi(g2, { robe: "#6a5a4a", hair: "#3a2a1e", skin: "#c98d63" }, { dir: "left" }, 2, 206, 170); chibi(g2, { robe: "#5a6a4a", hair: "#1a1020", skin: "#a8784e", style: { hair: "cap" } }, { dir: "left" }, 2, 236, 174);
      PX.fire(g2, 216, 128, 3, 6, t);
    } },
  ];
  // ---------------------------------------------------------------- the Bell rings (homecoming)
  const bellShot = n => ({ dur: 2.2, shake: 3 + n, sound: "victory", flash: n === 3, line: [null, n === 3 ? "DONG. ...and the sky answers." : "DONG."], draw: (g2, t, k) => {
    PX.bands(g2, n === 3 ? ["#4a5a78", "#5a6a88", "#6a7a98", "#7a8aa8"] : ["#5a5a6a", "#6a6a7a", "#7a7a88", "#8a8a96"]);
    const sx = Math.round(Math.sin(t * 3) * 10 * (1 - k * 0.4));
    PR(g2, 158, 0, 4, 26, "#6b5a44"); for (let r = 0; r < 70; r++) { const w = 18 + Math.round(r * 0.28) + (r > 60 ? 8 : 0); PR(g2, 160 - w - 1 + sx, 26 + r, w * 2 + 2, 1, OUT); PR(g2, 160 - w + sx, 26 + r, w * 2, 1, r < 3 ? "#b8902a" : "#e8b83a"); } PR(g2, 148 + sx, 34, 5, 56, "#ffe08a"); PR(g2, 154 + sx, 98, 12, 8, "#8a6a2a");
    for (let rr = 0; rr < 3; rr++) { const R2 = Math.round(26 + k * 170 + rr * 22); for (let a = 0; a < 64; a++) PR(g2, 160 + Math.cos(a / 64 * 6.283) * R2, 70 + Math.sin(a / 64 * 6.283) * R2 * 0.6, 2, 2, `rgba(255,240,200,${0.7 * (1 - k)})`); }
    if (n === 3) PX.rain(g2, t, Math.floor(k * 140));
  } });
  const HOMECOMING_BELL = [
    { dur: 3.6, fadeIn: 0.6, line: [null, "Nadia's hands on the new rope. Old hands. They don't shake."], draw: (g2, t, k) => {
      PX.bands(g2, ["#5a5a6a", "#6a6a7a", "#7a7a88"]);
      detail(g2, c2 => { PX.rope(c2, 37, 0, 48, 6, t * 0.3); const d = Math.round(k * 5); PX.fist(c2, 34, 10 - d, "#8a5a33"); PX.fist(c2, 34, 21 - d, "#8a5a33"); PR(c2, 33, 30 - d, 13, 8, OUT); PR(c2, 34, 31 - d, 11, 7, "#3b2f7a"); }, t);
    } },
    bellShot(1), bellShot(2), bellShot(3),
    { dur: 4.2, line: [null, "The rain comes down on the black tower, on the salt, on a small pair of shoes on the bottom step."], draw: (g2, t) => {
      detail(g2, (c2, tt) => {
        PR(c2, 0, 0, 80, 30, "#5a6a80"); PR(c2, 0, 30, 80, 18, "#4a4250"); PR(c2, 0, 28, 80, 3, "#6a6270");
        for (const x of [28, 42]) { PR(c2, x - 1, 22, 12, 7, OUT); PR(c2, x, 23, 10, 5, "#6b3f24"); PR(c2, x, 23, 3, 2, "#8a5a33"); PR(c2, x, 27, 11, 1, "#3a2414"); PR(c2, x + 4, 24, 1, 1, "#e8e2d0"); PR(c2, x + 6, 24, 1, 1, "#e8e2d0"); PR(c2, x + 8, 23, 1, 1, "#9ad8ff"); }
        for (let i = 0; i < 8; i++) { const ph = (tt * 1.2 + i / 8) % 1, w = Math.round(ph * 6); PR(c2, (hash(i, 7) * 76) | 0, 36 + ((hash(i, 9) * 10) | 0), w, 1, `rgba(200,220,255,${1 - ph})`); }
        for (let i = 0; i < 40; i++) PR(c2, wrap(hash(i, 41) * 90 - tt * 10, 90) - 5, wrap(hash(i, 43) * 50 + tt * 60, 50), 1, 2, "#b8cef0");
      }, t);
    } },
    { dur: 4.2, fadeOut: 0.8, line: [null, "Kessa comes out into it with their faces turned up, mouths open, laughing, crying, drinking the sky."], draw: (g2, t) => {
      PX.bands(g2, ["#4a5a70", "#5a6a80", "#6a7a90"]);
      const faces = [["abawidow", { eyes: "closed", mouth: "smile" }], ["tam", { mouth: "open", tears: true }], ["odo", { mouth: "shout", eyes: "wide" }]];
      faces.forEach(([id, ex], i) => { const n = NPCS.find(q => q.id === id); if (n) drawPortrait3(g2, n.look, ex, t + i, 16 + i * 102, 48, 2); });
      PX.rain(g2, t, 160);
    } },
  ];

  // No trees in the road: a palm with road on two sides becomes grass, so paths and boardwalks stay clear.
  const _buildMapR = buildMap;
  buildMap = function () {
    _buildMapR();
    const road = new Set([T.PATH, T.DECK, T.BRIDGE, T.COBBLE]);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (get(x, y) !== T.PALM) continue;
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => road.has(get(x + dx, y + dy))).length;
      if (n >= 2) set(x, y, T.GRASS);
    }
  };
