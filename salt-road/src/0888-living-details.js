  // ================================================================== LIVING DETAILS: WIND, A BATTLE'S OPENING, IDLE HANDS
  // Grass and reeds lean in a wind that travels across them in waves. A battle opens with a sweep of dark bars drawn
  // back like a curtain (a boss's are blood-red and slower). Someone left standing looks about them, and the courier,
  // left long enough, looks round and then thinks about something; townsfolk turn their heads now and then.
  // Reduced motion keeps all of it still: no wind, a plain fade into battle, no fidgeting.
  const _groundFxWind = groundFx;
  groundFx = function (g2, ox, oy) {
    _groundFxWind(g2, ox, oy);
    if (REDUCED || !G) return;
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE), gust = 0.6 + Math.sin(time * 0.35) * 0.4;
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE) + 1; tx++) {
      const t = get(tx, ty); if (t !== T.GRASS && t !== T.REEDS) continue;
      const X = tx * TILE - ox, Y = ty * TILE - oy;
      const n = t === T.GRASS ? 2 : 3;
      for (let k = 0; k < n; k++) {
        const bx = 2 + Math.floor(hash(tx * 3 + k, ty * 5 + 7) * 12), by = 5 + Math.floor(hash(tx * 7 + k, ty * 3 + 1) * 9);
        const phase = time * 1.7 - (tx * TILE + bx) * 0.045 - (ty * TILE + by) * 0.02, lean = Math.round(Math.sin(phase) * 1.2 * gust);
        if (t === T.GRASS) { g2.fillStyle = "#3f7f47"; g2.fillRect(X + bx, Y + by - 1, 1, 2); g2.fillStyle = "#6fbf6a"; g2.fillRect(X + bx + lean, Y + by - 3, 1, 2); }
        else { g2.fillStyle = "#7a8a4a"; g2.fillRect(X + bx, Y + by - 4, 1, 4); g2.fillStyle = "#6a4a2a"; g2.fillRect(X + bx + lean, Y + by - 7, 1, 3); }
      }
    }
  };
  // ---- a battle's opening
  let introAt = -9, introBoss = false;
  const _startBattleIntro = startBattle;
  startBattle = function (group, opts) { introAt = performance.now() / 1000; introBoss = !!(opts && opts.boss); return _startBattleIntro.apply(this, arguments); };
  const _renderBattleIntro = renderBattle;
  renderBattle = function () {
    _renderBattleIntro();
    if (SIM.fast) return;
    const dur = introBoss ? 1.0 : 0.6, k = (performance.now() / 1000 - introAt) / dur; if (k < 0 || k >= 1) return;
    if (REDUCED) { g.fillStyle = `rgba(6,4,16,${1 - k})`; g.fillRect(0, 0, VIEW_W, VIEW_H); return; }
    // diagonal bars drawn back from the centre, the outer ones first; an ease-out so the last of the dark lingers
    const e = 1 - Math.pow(1 - k, 3), bars = 9, w = (VIEW_W + VIEW_H) / bars + 2;
    g.save(); g.fillStyle = introBoss ? "#2a060c" : "#0a0818";
    for (let i = 0; i < bars; i++) {
      const centre = Math.abs(i - (bars - 1) / 2) / ((bars - 1) / 2), open = Math.min(1, Math.max(0, e * 1.6 - (1 - centre) * 0.6));
      const half = w * (1 - open) / 2; if (half <= 0) continue;
      const cx = i * w - VIEW_H * 0.5 + w / 2;
      g.beginPath(); g.moveTo(cx - half, -10); g.lineTo(cx + half, -10); g.lineTo(cx + half + VIEW_H * 0.6, VIEW_H + 10); g.lineTo(cx - half + VIEW_H * 0.6, VIEW_H + 10); g.closePath(); g.fill();
    }
    if (introBoss && k < 0.5) { g.fillStyle = `rgba(200,16,46,${0.25 * (1 - k * 2) * (SETTINGS.flashes === "soft" ? 0.3 : 1)})`; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    g.restore();
  };
  // ---- idle hands
  let idleT = 0;
  const _updateIdle = update;
  update = function (dt) { _updateIdle(dt); idleT = G && mode === "play" && !player.moving ? idleT + dt : 0; };
  const idleLook = () => {   // after six seconds still: look left, then right, then a thought, on a nine-second round
    if (REDUCED || idleT < 6) return null;
    const c = (idleT - 6) % 9;
    return c < 1.1 ? { dir: "left" } : c < 2.2 ? { dir: "right" } : c < 3 ? { dir: "up" } : c > 6 && c < 7.6 ? { think: true } : null;
  };
  const _drawPersonIdle = drawPerson;
  drawPerson = function (g2, x, y, o) {
    if (o && !o.dead && !o.walking && !battle && G && mode === "play" && g2 === g && !REDUCED) {
      if (o.hero && o.dir === player.dir) {
        const a = idleLook();
        if (a && a.dir) o = { ...o, dir: a.dir };
        const r = _drawPersonIdle(g2, x, y, o);
        if (a && a.think) drawEmote(g2, x + 8, y - 30, "dots");
        return r;
      }
      if (!o.hero && (o.dir || "down") === "down") {   // townsfolk glance aside now and then, each on their own clock
        const seed = (o.bob || 0) * 7.3 + x * 0.01, c = (time + seed) % 11;
        if (c < 1.3) o = { ...o, dir: hash(Math.floor((time + seed) / 11), Math.round(seed * 10)) < 0.5 ? "left" : "right" };
      }
    }
    return _drawPersonIdle(g2, x, y, o);
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { living: () => ({ idle: idleT, look: idleLook(), intro: performance.now() / 1000 - introAt }) }), 0);
