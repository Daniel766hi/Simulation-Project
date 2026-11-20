  // ================================================================== HEARTHS, RAIN ON THE GROUND, AND A BATTLE'S WEIGHT
  // Houses breathe: smoke rises from a chimney on many roofs, leaning with the wind, and at night their windows glow.
  // When the Act II rain falls, it lands: small splashes on the ground and rings on the water. In battle, grass and
  // stones in the near foreground frame the fight, a critical blow punches the view in for a moment, and a win lets
  // light down through the scene. Reduced motion keeps the windows and the foreground; no smoke, splashes, punch or rays.
  const ROOFS = new Set([T.ROOF, T.ROOFB]);
  const rainingHere = () => G.stage >= 7 && ![T.DARK, T.ABYSS, T.SPIRE, T.FLOOR].includes(tileAt(G.px, G.py)) && !noRainAt(Math.floor(G.px / TILE), Math.floor(G.py / TILE));
  const _renderWorldHearth = renderWorld;
  renderWorld = function () {
    _renderWorldHearth();
    if (!G) return;
    const ox = Math.round(camX), oy = Math.round(camY), tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE), nt = nightness();
    const wind = Math.sin(time * 0.35) * 0.6 + 0.4;
    for (let ty = ty0 - 1; ty <= ty0 + Math.ceil(VIEW_H / TILE) + 1; ty++) for (let tx = tx0 - 1; tx <= tx0 + Math.ceil(VIEW_W / TILE) + 1; tx++) {
      const t = get(tx, ty), X = tx * TILE - ox, Y = ty * TILE - oy;
      if (t === T.HOUSE && nt > 0.15 && hash(tx * 3, ty * 5) < 0.7) {   // a lit window or two
        g.save(); g.globalCompositeOperation = "lighter";
        for (const wx of [5, 12]) { if (hash(tx + wx, ty) < 0.25) continue; const fl = 0.85 + Math.sin(time * 3 + tx * 1.7 + wx) * 0.08;
          drawGlow(g, "255,200,110", X + wx, Y + 7, 9, 0.55 * nt * fl);
          g.fillStyle = `rgba(255,230,160,${0.8 * nt})`; g.fillRect(X + wx - 1, Y + 6, 2, 2); }
        g.restore();
      }
      const chim = (x, y) => ROOFS.has(get(x, y)) && !ROOFS.has(get(x, y - 1)) && hash(x * 11, y * 13) < 0.22;
      if (!REDUCED && chim(tx, ty) && ![1, 2, 3, 4].some(d => chim(tx - d, ty))) {   // one chimney a stretch of roof   // a chimney's smoke
        const cx = X + 4 + Math.floor(hash(tx, ty * 7) * 8), cy = Y + 2;
        g.fillStyle = "#4a3a32"; g.fillRect(cx - 1, cy - 3, 3, 4); g.fillStyle = "#6a5a4e"; g.fillRect(cx - 1, cy - 3, 3, 1);
        for (let k = 0; k < 6; k++) {
          const ph = (time * 0.35 + k / 6 + hash(tx, ty) ) % 1, r = 1.5 + ph * 4, a = (1 - ph) * 0.35;
          g.fillStyle = nt > 0.5 ? `rgba(120,120,140,${a})` : `rgba(230,226,236,${a})`;
          g.beginPath(); g.arc(cx + ph * 14 * wind + Math.sin(ph * 6 + k) * 1.5, cy - 4 - ph * 26, r, 0, Math.PI * 2); g.fill();
        }
      }
    }
    if (!REDUCED && rainingHere()) {   // the rain lands
      for (let i = 0; i < 26; i++) {
        const per = 0.5 + hash(i, 61) * 0.3, cyc = Math.floor((time + hash(i, 63) * per) / per), ph = ((time + hash(i, 63) * per) % per) / per;
        const x = hash(i * 7 + cyc, 65) * VIEW_W, y = hash(i * 5 + cyc, 67) * VIEW_H, tile = get(Math.floor((x + ox) / TILE), Math.floor((y + oy) / TILE));
        if (SOLID.has(tile) && tile !== T.WATER) continue;
        if (tile === T.WATER || tile === T.SHALLOW) { g.strokeStyle = `rgba(220,240,255,${0.5 * (1 - ph)})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 1 + ph * 5, 0.5 + ph * 2, 0, 0, Math.PI * 2); g.stroke(); }
        else if (ph < 0.4) { const a = 0.6 * (1 - ph / 0.4); g.fillStyle = `rgba(200,220,250,${a})`; g.fillRect(Math.round(x) - 1 - Math.round(ph * 4), Math.round(y) - Math.round(ph * 5), 1, 1); g.fillRect(Math.round(x) + 1 + Math.round(ph * 4), Math.round(y) - Math.round(ph * 5), 1, 1); g.fillRect(Math.round(x), Math.round(y), 1, 1); }
      }
    }
  };
  // ---- battle: a foreground, a punch on a heavy blow, light after a win
  const FORE = { rime: "#cdd8e6", icehouse: "#1e3a5a", river: "#8a6a44", weir: "#5a5662", cistern: "#14141c", vault: "#2a180a", cathedral: "#0c0a1c", grove: "#0f1a14" };
  let punchAt = -9, punchK = 1, winAt = -9;
  const _soundPunch = Music.sound;
  Music.sound = function (kind) { if (battle && !SIM.fast && (kind === "crit" || kind === "boss")) { punchAt = performance.now() / 1000; punchK = kind === "boss" ? 1.6 : 1; } return _soundPunch.apply(this, arguments); };
  const _victoryRays = victory;
  victory = function () { winAt = performance.now() / 1000; return _victoryRays.apply(this, arguments); };
  const _renderBattlePolish = renderBattle;
  renderBattle = function () {
    const now = performance.now() / 1000, pk = now - punchAt;
    const punching = !REDUCED && !SIM.fast && pk >= 0 && pk < 0.28, z = punching ? 1 + Math.sin(pk / 0.28 * Math.PI) * 0.035 * punchK : 1;
    if (punching) { g.save(); g.translate(VIEW_W / 2, VIEW_H * 0.45); g.scale(z, z); g.translate(-VIEW_W / 2, -VIEW_H * 0.45); }
    _renderBattlePolish();
    if (punching) g.restore();
    if (!battle || SIM.fast) return;
    const area = (battle.opts && battle.opts.area) || "flats", col = FORE[area] || "#2a1a3e";
    // near foreground: tufts and stones at the bottom corners, swaying a little, out of focus by being plain and dark
    g.save(); g.globalAlpha = 0.85; g.fillStyle = col;
    for (const [x0, s] of [[-6, 1], [VIEW_W + 6, -1]]) {
      for (let i = 0; i < 7; i++) { const bx = x0 + s * (i * 6 + 2), h = 10 + ((i * 7) % 9), lean = REDUCED ? 0 : Math.sin(time * 1.3 + i) * 2;
        g.beginPath(); g.moveTo(bx - 3, VIEW_H + 2); g.lineTo(bx + lean, VIEW_H - h); g.lineTo(bx + 3, VIEW_H + 2); g.fill(); }
      g.beginPath(); g.ellipse(x0 + s * 16, VIEW_H + 2, 18, 7, 0, Math.PI, 0); g.fill();
    }
    g.restore();
    const wk = now - winAt;
    if (!REDUCED && wk >= 0 && wk < 3) {   // light let down through the scene after a win
      const a = Math.min(1, wk * 3) * Math.max(0, 1 - (wk - 1.8) / 1.2);
      g.save(); g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) { const ang = -0.4 + i * 0.2 + Math.sin(time * 0.4 + i) * 0.04, x = VIEW_W * 0.5 + Math.sin(ang) * 40;
        g.fillStyle = `rgba(255,236,190,${0.035 * a})`; g.beginPath(); g.moveTo(x - 4, -10); g.lineTo(x + 4, -10); g.lineTo(x + Math.sin(ang) * 200 + 12, VIEW_H); g.lineTo(x + Math.sin(ang) * 200 - 12, VIEW_H); g.closePath(); g.fill(); }
      g.restore();
    }
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { polish: () => ({ punch: performance.now() / 1000 - punchAt, win: performance.now() / 1000 - winAt, raining: G ? rainingHere() : null }) }), 0);
