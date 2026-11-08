  // ================================================================== ATMOSPHERE: TRACKS, WEATHER AND LIGHT
  // Small things that make a place feel lived in. Feet leave prints in snow, sand and salt, and rings on shallow water,
  // that fade. The Rime snows, the dry riverbed shimmers and blows dust, and the cistern is dark but for its lamps,
  // its fires and the courier's own light, with water dripping from the vault. At night, lamps and fires glow warm
  // and flicker everywhere. Reduced motion keeps the light but drops the falling, blowing and dripping.
  const PRINT_ON = new Set([T.SNOW, T.SAND, T.SALT, T.MUD]), RIPPLE_ON = new Set([T.SHALLOW]);
  const marks = [];
  let markT = 0, markSide = 1, lastMark = null;
  const _updateAtmo = update;
  update = function (dt) {
    _updateAtmo(dt);
    if (!G || mode !== "play") return;
    for (let i = marks.length - 1; i >= 0; i--) if ((marks[i].age += dt) > marks[i].life) marks.splice(i, 1);
    if (!player.moving || (markT -= dt) > 0) return;
    const t = tileAt(G.px, G.py), print = PRINT_ON.has(t), ripple = RIPPLE_ON.has(t); if (!print && !ripple) return;
    if (lastMark && Math.hypot(G.px - lastMark[0], G.py - lastMark[1]) < 5) return;
    markT = player.sprint ? 0.12 : 0.2; markSide = -markSide; lastMark = [G.px, G.py];
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[player.dir] || [0, 1];
    marks.push({ x: G.px - d[1] * markSide * 2, y: G.py - 1 + d[0] * markSide * 2, dx: d[0], dy: d[1], kind: ripple ? "ripple" : t === T.SNOW ? "snow" : "sand", age: 0, life: ripple ? 1.2 : t === T.SNOW ? 14 : 8 });
    if (marks.length > 120) marks.shift();
  };
  const _groundFxAtmo = groundFx;
  groundFx = function (g2, ox, oy) {
    _groundFxAtmo(g2, ox, oy);
    for (const m of marks) {
      const x = Math.round(m.x - ox), y = Math.round(m.y - oy), k = 1 - m.age / m.life; if (x < -8 || y < -8 || x > VIEW_W + 8 || y > VIEW_H + 8) continue;
      if (m.kind === "ripple") { const r = 2 + m.age * 7; g2.strokeStyle = `rgba(230,250,255,${0.55 * k})`; g2.lineWidth = 1; g2.beginPath(); g2.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2); g2.stroke(); continue; }
      g2.fillStyle = m.kind === "snow" ? `rgba(120,150,190,${0.45 * k})` : `rgba(90,60,30,${0.3 * k})`;
      if (m.dy) g2.fillRect(x - 1, y - 1, 2, 3); else g2.fillRect(x - 1, y - 1, 3, 2);
    }
  };
  // ---- the light: a dark layer with holes in it, then warm colour where the fires are
  const caveLight = document.createElement("canvas"); caveLight.width = VIEW_W; caveLight.height = VIEW_H;
  const cl = caveLight.getContext("2d");
  const FIRE_LIGHT = { lamp: [46, "255,190,90"], campfire: [58, "255,150,60"], candles: [30, "255,210,130"], shrine: [34, "158,240,245"] };
  const flick = (i, k) => 1 + Math.sin(time * (7 + (i % 3)) + i * 1.7) * 0.05 * k + Math.sin(time * 13 + i) * 0.03 * k;
  function warmGlows(g2, ox, oy, strength) {
    g2.globalCompositeOperation = "lighter";
    PROPS.forEach((pr, i) => {
      const L = FIRE_LIGHT[pr.type]; if (!L) return;
      const x = pr.px - ox, y = pr.py - oy - 10, r = L[0] * 0.7 * flick(i, 1); if (x < -r || y < -r || x > VIEW_W + r || y > VIEW_H + r) return;
      const gr = g2.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(${L[1]},${0.32 * strength})`); gr.addColorStop(1, `rgba(${L[1]},0)`); g2.fillStyle = gr; g2.fillRect(x - r, y - r, r * 2, r * 2);
    });
    g2.globalCompositeOperation = "source-over";
  }
  const inCistern = () => typeof CIS !== "undefined" && Math.floor(G.py / TILE) >= CIS.y0;
  const inRime = () => typeof RIME !== "undefined" && Math.floor(G.py / TILE) >= RIME.y0 && Math.floor(G.py / TILE) <= RIME.y1;
  const inBed = () => typeof WEIR !== "undefined" && Math.floor(G.py / TILE) >= WEIR.y0 && Math.floor(G.py / TILE) <= WEIR.y1;
  function cavePass(g2, ox, oy) {
    cl.globalCompositeOperation = "source-over"; cl.clearRect(0, 0, VIEW_W, VIEW_H); cl.fillStyle = "rgba(6,6,14,0.72)"; cl.fillRect(0, 0, VIEW_W, VIEW_H);
    cl.globalCompositeOperation = "destination-out";
    const hole = (x, y, r, a) => { if (x < -r || y < -r || x > VIEW_W + r || y > VIEW_H + r) return; const gr = cl.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); cl.fillStyle = gr; cl.fillRect(x - r, y - r, r * 2, r * 2); };
    hole(G.px - ox, G.py - oy - 8, 64 * flick(0, 0.6), 0.95);   // Wick's lamp, carried
    PROPS.forEach((pr, i) => { const L = FIRE_LIGHT[pr.type]; if (L) hole(pr.px - ox, pr.py - oy - 10, L[0] * flick(i, 1), 0.9); });
    for (const n of NPCS) if (n.show === undefined || n.show()) hole(n.px - ox, n.py - oy - 10, 16, 0.45);
    // the canal and the fall catch what light there is
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE);
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE) + 1; tx++) if (get(tx, ty) === T.WATER && (tx + ty) % 2 === 0) hole(tx * TILE + 8 - ox, ty * TILE + 8 - oy, 14, 0.25);
    g2.drawImage(caveLight, 0, 0);
    warmGlows(g2, ox, oy, 1.2);
  }
  // ---- weather
  const flakes = Array.from({ length: 90 }, (_, i) => ({ x: hash(i, 501) * VIEW_W, y: hash(i, 503) * VIEW_H, s: 0.5 + hash(i, 505) * 1.2, w: hash(i, 507) * 6.28 }));
  const drips = [];
  function snowPass(g2, dt) {
    const wind = Math.sin(time * 0.3) * 10 - 6;
    for (const f of flakes) {
      f.y += (12 + f.s * 16) * dt; f.x += (wind + Math.sin(time * 1.3 + f.w) * 6) * dt * f.s;
      if (f.y > VIEW_H + 2) { f.y = -2; f.x = Math.random() * VIEW_W; } if (f.x < -2) f.x += VIEW_W + 4; if (f.x > VIEW_W + 2) f.x -= VIEW_W + 4;
      g2.fillStyle = `rgba(255,255,255,${0.55 + f.s * 0.3})`; const sz = f.s > 1.2 ? 2 : 1; g2.fillRect(Math.round(f.x), Math.round(f.y), sz, sz);
    }
  }
  function bedPass(g2, dt) {
    const c = G.clock ?? 0.3, day = Math.sin(Math.PI * 2 * c) > 0.1;
    if (day) { g2.fillStyle = "rgba(255,200,130,0.07)"; g2.fillRect(0, 0, VIEW_W, VIEW_H); }   // the heat over the dry bed
    for (let i = 0; i < 26; i++) {   // dust, lifting and blowing along the bed
      const x = (hash(i, 611) * (VIEW_W + 40) + time * (18 + (i % 5) * 6)) % (VIEW_W + 40) - 20, y = (hash(i, 613) * VIEW_H + Math.sin(time * 0.8 + i) * 8 + VIEW_H) % VIEW_H;
      g2.fillStyle = `rgba(216,180,130,${0.25 + (i % 3) * 0.1})`; g2.fillRect(Math.round(x), Math.round(y), i % 4 ? 1 : 2, 1);
    }
    if ((time % 14) < 2.2) { const k = Math.sin(((time % 14) / 2.2) * Math.PI); g2.fillStyle = `rgba(200,160,110,${0.12 * k})`; g2.fillRect(0, 0, VIEW_W, VIEW_H); }   // a gust now and then
  }
  function cisternPass(g2, ox, oy, dt) {
    // drips from the vault: mostly over the canal, a few anywhere, each with a small splash
    if (Math.random() < dt * 5) drips.push({ x: ox + (Math.random() < 0.6 ? (CIS.canal[0] * TILE + Math.random() * 3 * TILE) : Math.random() * VIEW_W), y: oy - 4, vy: 40, land: oy + 30 + Math.random() * (VIEW_H - 40), t: 0 });
    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i];
      if (d.t > 0) { d.t += dt; const r = d.t * 18; g2.strokeStyle = `rgba(168,212,236,${0.5 * (1 - d.t / 0.5)})`; g2.lineWidth = 1; g2.beginPath(); g2.ellipse(d.x - ox, d.land - oy, r, r * 0.4, 0, 0, Math.PI * 2); g2.stroke(); if (d.t > 0.5) drips.splice(i, 1); continue; }
      d.vy += 260 * dt; d.y += d.vy * dt; if (d.y >= d.land) { d.t = 0.001; continue; }
      g2.fillStyle = "rgba(168,212,236,0.8)"; g2.fillRect(Math.round(d.x - ox), Math.round(d.y - oy), 1, 3);
    }
    PROPS.forEach((pr, i) => {   // motes turning in the lamplight
      if (pr.type !== "lamp" && pr.type !== "campfire") return; const x0 = pr.px - ox, y0 = pr.py - oy - 14; if (x0 < -30 || y0 < -30 || x0 > VIEW_W + 30 || y0 > VIEW_H + 30) return;
      for (let k = 0; k < 4; k++) { const a = time * (0.4 + k * 0.13) + i + k * 1.6, x = x0 + Math.cos(a) * (6 + k * 4), y = y0 + Math.sin(a * 1.3) * (5 + k * 3); g2.fillStyle = "rgba(255,220,150,0.6)"; g2.fillRect(Math.round(x), Math.round(y), 1, 1); }
    });
  }
  let atmoLast = 0;
  const _renderWorldAtmo = renderWorld;
  renderWorld = function () {
    _renderWorldAtmo();
    if (!G) return;
    const now = performance.now() / 1000, dt = Math.min(0.1, atmoLast ? now - atmoLast : 0.016); atmoLast = now;
    const ox = Math.round(camX), oy = Math.round(camY);
    if (inCistern()) { cavePass(g, ox, oy); if (!REDUCED) cisternPass(g, ox, oy, dt); return; }
    const nt = nightness(); if (nt > 0.1) warmGlows(g, ox, oy, nt);
    if (REDUCED) return;
    if (inRime()) snowPass(g, dt);
    else if (inBed()) bedPass(g, dt);
  };
  // a battle out of doors at night is fought at night: the backdrop darkens and the stars come out
  const INDOOR_AREAS = new Set(["cathedral", "icehouse", "cistern", "vault", "deep", "mines", "spire", "hall", "galleries", "vaultc"]);
  const _battleSkyFxAtmo = battleSkyFx;
  battleSkyFx = function (g2, area) {
    _battleSkyFxAtmo(g2, area);
    if (!G || INDOOR_AREAS.has(area) || (battle && battle.opts && battle.opts.boss)) return;
    const nt = nightness(); if (nt < 0.2) return;
    g2.fillStyle = `rgba(8,10,34,${0.5 * nt})`; g2.fillRect(-10, -10, VIEW_W + 20, 220);
    for (let i = 0; i < 30; i++) { const a = (0.35 + 0.35 * Math.sin(time * 1.6 + i * 2.1)) * nt; g2.fillStyle = `rgba(220,230,255,${a})`; g2.fillRect((hash(i, 811) * VIEW_W) | 0, (hash(i, 813) * 80) | 0, 1, 1); }
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { atmo: () => ({ marks: marks.length, kinds: [...new Set(marks.map(m => m.kind))], drips: drips.length, cave: inCistern(), rime: inRime(), bed: inBed() }) }), 0);
