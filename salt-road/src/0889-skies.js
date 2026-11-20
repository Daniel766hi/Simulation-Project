  // ================================================================== SKIES: CLOUD SHADOWS, BIRDS, FIREFLIES, GLINTS, A GRADE
  // The sky shows on the ground. By day, soft cloud shadows drift over the open country with the wind, a flock of birds
  // crosses now and then (gulls by the coast, crows on the salt), and the sun glints on open water. By night, fireflies
  // rise from the grass. Each region has a faint colour grade and a soft vignette: cold blue in the Rime, warm dust on
  // the riverbed, green under the grove's trees, gold in the cistern's lamplight. Reduced motion keeps the grade, the
  // vignette and still shadows, and drops the drifting, flying and twinkling.
  const outdoorsSky = () => !OUTDOOR_SKIP.has(tileAt(G.px, G.py)) && regionOf(Math.floor(G.px / TILE), Math.floor(G.py / TILE)) !== "cistern";
  const daylight = () => { const s = Math.sin(Math.PI * 2 * (G.clock ?? 0.3)); return Math.max(0, Math.min(1, s * 3)); };
  // clouds: big soft shapes laid out in world space, so they slide over the ground as the camera moves, and drift east
  const CLOUDS = Array.from({ length: 14 }, (_, i) => ({ x: hash(i, 901) * W * TILE, y: hash(i, 903) * H * TILE, r: 50 + hash(i, 905) * 70, k: 0.6 + hash(i, 907) * 0.5 }));
  const cloudSprite = (() => {   // one soft blob, drawn once: a few overlapping discs with a feathered edge
    const c = document.createElement("canvas"); c.width = c.height = 128; const g2 = c.getContext("2d");
    for (const [x, y, r] of [[64, 64, 40], [40, 70, 28], [88, 66, 30], [60, 46, 26], [76, 82, 24]]) { const gr = g2.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, "rgba(20,14,40,0.5)"); gr.addColorStop(1, "rgba(20,14,40,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128); }
    return c;
  })();
  function cloudPass(ox, oy) {
    const a = daylight() * 0.4; if (a < 0.05) return;
    const drift = REDUCED ? 0 : time * 7, span = W * TILE + 400;
    g.save(); g.globalAlpha = a;
    for (const c of CLOUDS) {
      const x = ((c.x + drift * c.k) % span) - 200 - ox, y = c.y - oy, s = c.r * 2.2; if (x < -s || x > VIEW_W + s || y < -s || y > VIEW_H + s) continue;
      g.drawImage(cloudSprite, x - s / 2, y - s / 2, s, s * 0.7);
    }
    g.restore();
  }
  // birds: a flock every so often, a loose V of flapping strokes crossing the view
  let flock = null, flockWait = 6;
  function birdPass(dt, reg) {
    if (REDUCED) return;
    if (!flock) { if ((flockWait -= dt) > 0 || daylight() < 0.3) return;
      const dir = Math.random() < 0.5 ? 1 : -1, n = 4 + Math.floor(Math.random() * 5), gull = reg === "south" || reg === "drysea";
      flock = { x: dir > 0 ? -30 : VIEW_W + 30, y: 20 + Math.random() * 70, dir, n, gull, t: 0 }; flockWait = 18 + Math.random() * 25; }
    flock.t += dt; flock.x += flock.dir * 34 * dt;
    g.strokeStyle = flock.gull ? "rgba(240,240,250,0.85)" : "rgba(30,24,40,0.8)"; g.lineWidth = 1;
    for (let i = 0; i < flock.n; i++) {
      const row = Math.ceil(i / 2), side = i % 2 ? -1 : 1, bx = flock.x - flock.dir * row * 9, by = flock.y + (i ? side * row * 5 : 0) + Math.sin(flock.t * 2 + i) * 1.5;
      const flap = Math.sin(flock.t * 11 + i * 1.3) * 2;
      g.beginPath(); g.moveTo(Math.round(bx) - 3, Math.round(by - flap)); g.lineTo(Math.round(bx), Math.round(by)); g.lineTo(Math.round(bx) + 3, Math.round(by - flap)); g.stroke();
    }
    if (flock.x < -80 || flock.x > VIEW_W + 80) flock = null;
  }
  // fireflies: over grass at night, each drifting and pulsing on its own
  const FLIES = Array.from({ length: 22 }, (_, i) => ({ ox: hash(i, 951), oy: hash(i, 953), p: hash(i, 955) * 6.28, s: 0.4 + hash(i, 957) }));
  function fireflyPass(ox, oy, nt) {
    if (REDUCED || nt < 0.4) return;
    g.save(); g.globalCompositeOperation = "lighter";
    for (const f of FLIES) {
      const x = (f.ox * VIEW_W + Math.sin(time * 0.4 * f.s + f.p) * 22 + VIEW_W) % VIEW_W, y = (f.oy * VIEW_H + Math.cos(time * 0.3 * f.s + f.p * 2) * 14 + VIEW_H) % VIEW_H;
      if (get(Math.floor((x + ox) / TILE), Math.floor((y + oy) / TILE)) !== T.GRASS) continue;
      const a = Math.max(0, Math.sin(time * 1.8 * f.s + f.p)) * nt; if (a < 0.05) continue;
      drawGlow(g, "210,255,140", x, y, 5, 0.5 * a);
      g.fillStyle = `rgba(240,255,200,${a})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    g.restore();
  }
  // glints: by day, a few water tiles in view catch the sun for a moment each
  function glintPass(ox, oy) {
    if (REDUCED) return; const d = daylight(); if (d < 0.3) return;
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE);
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE); tx++) {
      if (get(tx, ty) !== T.WATER) continue;
      const ph = (time * 0.7 + hash(tx, ty) * 9) % 3; if (ph > 0.35) continue;
      const a = Math.sin(ph / 0.35 * Math.PI) * d, x = tx * TILE - ox + 3 + Math.floor(hash(ty, tx) * 10), y = ty * TILE - oy + 3 + Math.floor(hash(tx + 7, ty) * 10);
      g.fillStyle = `rgba(255,255,240,${0.9 * a})`; g.fillRect(x, y, 1, 1); g.fillStyle = `rgba(255,255,240,${0.45 * a})`; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3);
    }
  }
  // the grade: a faint wash of each region's own light, and a soft dark at the corners of the view
  const GRADE = { rime: "rgba(150,190,255,0.07)", weir: "rgba(255,190,120,0.06)", cistern: "rgba(255,180,90,0.05)", drysea: "rgba(255,200,140,0.05)", spire: "rgba(120,140,220,0.06)", mines: "rgba(180,150,120,0.05)", orchard: "rgba(200,120,160,0.05)" };
  const vignette = (() => { const c = document.createElement("canvas"); c.width = VIEW_W; c.height = VIEW_H; const g2 = c.getContext("2d");
    const gr = g2.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45, VIEW_W / 2, VIEW_H / 2, VIEW_W * 0.62); gr.addColorStop(0, "rgba(10,6,20,0)"); gr.addColorStop(1, "rgba(10,6,20,0.32)"); g2.fillStyle = gr; g2.fillRect(0, 0, VIEW_W, VIEW_H); return c; })();
  let skyLast = 0, skiesOn = true;
  const _renderWorldSkies = renderWorld;
  renderWorld = function () {
    _renderWorldSkies();
    if (!G || !skiesOn) return;
    const now = performance.now() / 1000, dt = Math.min(0.1, skyLast ? now - skyLast : 0.016); skyLast = now;
    const ox = Math.round(camX), oy = Math.round(camY), reg = regionOf(Math.floor(G.px / TILE), Math.floor(G.py / TILE));
    if (outdoorsSky()) {
      glintPass(ox, oy);
      if (reg !== "rime") cloudPass(ox, oy);   // the Rime is all cloud already
      fireflyPass(ox, oy, nightness());
      if (reg !== "rime") birdPass(dt, reg);
    }
    const tint = GRADE[reg] || (reg === "old" && tileAt(G.px, G.py) === T.GRASS ? "rgba(140,220,140,0.04)" : null);
    if (tint) { g.fillStyle = tint; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    g.drawImage(vignette, 0, 0);
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { skies: on => { if (on !== undefined) skiesOn = !!on; return { on: skiesOn, flock: !!flock, out: G ? outdoorsSky() : null, day: G ? daylight() : null }; } }), 0);
