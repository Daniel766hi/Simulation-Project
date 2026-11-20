  // ================================================================== FOG, FOAM, FRONDS, LEAVES, SAND AND EMBERS
  // More of the world moving on its own. Fog banks lie in the marshes and the grove, and come in off the Wreck Coast at
  // dusk, night and dawn. Foam runs in and out along every shore. Palm fronds lift in the wind. Leaves fall in the green
  // country, sand blows across the Dry Sea and the dunes, and sparks rise from campfires. Reduced motion keeps the fog
  // still and drops the rest.
  const placeAt = () => { const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE); const r = REGIONS.find(r => tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1); return r ? r.name : ""; };
  const FOGGY = new Set(["The Drowning Marsh", "Reedholm", "The Bog Heart", "The Drowned Grove", "The Reeds"]);
  const SANDY = new Set(["The Dry Sea", "The Dune Sea", "The Salt Pans"]);
  const fogBlob = (() => { const c = document.createElement("canvas"); c.width = c.height = 96; const g2 = c.getContext("2d");
    for (const [x, y, r] of [[48, 48, 34], [26, 52, 22], [70, 50, 24], [48, 34, 20]]) { const gr = g2.createRadialGradient(x, y, r * 0.15, x, y, r); gr.addColorStop(0, "rgba(220,226,236,0.55)"); gr.addColorStop(1, "rgba(220,226,236,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, 96, 96); }
    return c; })();
  function fogPass(ox, oy, amount) {   // banks on a loose grid that drifts east, so every view gets its share
    const drift = REDUCED ? 0 : time * 4, cell = 120;
    g.save(); g.globalAlpha = amount;
    const cx0 = Math.floor((ox - drift) / cell) - 1, cy0 = Math.floor(oy / cell) - 1;
    for (let cy = cy0; cy <= cy0 + Math.ceil(VIEW_H / cell) + 2; cy++) for (let cx = cx0; cx <= cx0 + Math.ceil(VIEW_W / cell) + 2; cx++) {
      if (hash(cx * 3 + 7, cy * 5 + 11) < 0.35) continue;
      const s = 110 + hash(cx, cy + 40) * 90, x = cx * cell + hash(cx + 9, cy) * cell + drift - ox, y = cy * cell + hash(cx, cy + 9) * cell - oy + (REDUCED ? 0 : Math.sin(time * 0.2 + cx) * 6);
      g.drawImage(fogBlob, x - s / 2, y - s * 0.3, s, s * 0.6);
    }
    g.restore();
  }
  // shore foam: a light line that runs in and out along water that meets land, each stretch on its own beat
  function foamPass(ox, oy) {
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE), LAND = t => t !== T.WATER && t !== T.BRIDGE && t !== T.SHALLOW;
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE); tx++) {
      if (get(tx, ty) !== T.WATER) continue;
      const X = tx * TILE - ox, Y = ty * TILE - oy, ph = time * 1.4 + (tx + ty) * 0.6, inn = 2 + Math.round((Math.sin(ph) + 1) * 1.5), a = 0.35 + Math.sin(ph) * 0.2;
      g.fillStyle = `rgba(240,250,255,${a})`;
      if (LAND(get(tx, ty - 1))) for (let x = 0; x < TILE; x += 2) g.fillRect(X + x, Y + inn + ((x * 7 + tx) % 3 === 0 ? 1 : 0), 2, 1);
      if (LAND(get(tx, ty + 1))) for (let x = 0; x < TILE; x += 2) g.fillRect(X + x, Y + TILE - 1 - inn, 2, 1);
      if (LAND(get(tx - 1, ty))) for (let y = 0; y < TILE; y += 2) g.fillRect(X + inn, Y + y, 1, 2);
      if (LAND(get(tx + 1, ty))) for (let y = 0; y < TILE; y += 2) g.fillRect(X + TILE - 1 - inn, Y + y, 1, 2);
    }
  }
  // palm fronds lift and fall with the wind
  function frondPass(ox, oy) {
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE), gust = 0.6 + Math.sin(time * 0.35) * 0.4;
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE); tx++) {
      if (get(tx, ty) !== T.PALM) continue;
      const X = tx * TILE - ox + 8, Y = ty * TILE - oy + 3, s = Math.sin(time * 1.6 + tx * 0.7) * gust;
      g.fillStyle = "#3f8a4a";
      for (const d of [-1, 1]) { const lift = Math.round(s * 1.5 * d); g.fillRect(X + d * 4 - (d < 0 ? 2 : 0), Y + 1 - lift, 3, 1); g.fillRect(X + d * 6 - (d < 0 ? 1 : 0), Y + 2 - lift, 2, 1); }
      g.fillStyle = "#6fbf6a"; g.fillRect(X + Math.round(s), Y - 1, 1, 1);
    }
  }
  // particles: leaves in green country, sand on the dry sea, sparks above fires
  const motes = [];
  function moteTick(dt, place, ox, oy) {
    const green = get(Math.floor(G.px / TILE), Math.floor(G.py / TILE)) === T.GRASS || place === "The Drowned Grove", sandy = SANDY.has(place);
    if (green && motes.length < 18 && Math.random() < dt * 2.2) motes.push({ k: "leaf", x: ox + Math.random() * VIEW_W, y: oy - 6, vx: 6 + Math.random() * 6, vy: 10 + Math.random() * 8, ph: Math.random() * 6, age: 0, life: 9, col: ["#c8782a", "#a8a858", "#6f9a4a", "#d8a040"][Math.floor(Math.random() * 4)] });
    if (sandy && motes.length < 60 && Math.random() < dt * 30) motes.push({ k: "sand", x: ox - 8, y: oy + Math.random() * VIEW_H, vx: 70 + Math.random() * 60, vy: (Math.random() - 0.5) * 6, age: 0, life: 6 });
    for (const pr of PROPS) if (pr.type === "campfire" && Math.abs(pr.px - G.px) < VIEW_W && Math.abs(pr.py - G.py) < VIEW_H && Math.random() < dt * 3 && motes.length < 80)
      motes.push({ k: "ember", x: pr.px + (Math.random() - 0.5) * 6, y: pr.py - 10, vx: (Math.random() - 0.5) * 6, vy: -18 - Math.random() * 14, age: 0, life: 1.6 + Math.random() });
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i]; m.age += dt;
      if (m.k === "leaf") { m.x += (m.vx + Math.sin(time * 2 + m.ph) * 10) * dt; m.y += m.vy * dt; }
      else { m.x += m.vx * dt; m.y += m.vy * dt; if (m.k === "ember") m.vx += Math.sin(time * 4 + i) * dt * 8; }
      if (m.age > m.life || m.y > oy + VIEW_H + 10 || m.x > ox + VIEW_W + 20) motes.splice(i, 1);
    }
  }
  function motePass(ox, oy) {
    for (const m of motes) {
      const x = Math.round(m.x - ox), y = Math.round(m.y - oy), a = Math.max(0, 1 - m.age / m.life);
      if (m.k === "leaf") { g.fillStyle = m.col; const flip = Math.sin(time * 5 + m.ph) > 0; g.fillRect(x, y, flip ? 2 : 1, flip ? 1 : 2); }
      else if (m.k === "sand") { g.fillStyle = `rgba(226,200,150,${0.5 * a})`; g.fillRect(x, y, 3, 1); }
      else { g.fillStyle = `rgba(255,${150 + Math.round(80 * a)},80,${a})`; g.fillRect(x, y, 1, 1); }
    }
  }
  let wwLast = 0;
  const _renderWorldWW = renderWorld;
  renderWorld = function () {
    _renderWorldWW();
    if (!G) return;
    const now = performance.now() / 1000, dt = Math.min(0.1, wwLast ? now - wwLast : 0.016); wwLast = now;
    const ox = Math.round(camX), oy = Math.round(camY), place = placeAt();
    const c = G.clock ?? 0.3, lowSun = c < 0.12 || c > 0.55;
    if (!REDUCED) { foamPass(ox, oy); frondPass(ox, oy); moteTick(dt, place, ox, oy); motePass(ox, oy); }
    if (FOGGY.has(place)) fogPass(ox, oy, 0.55);
    else if (place === "The Wreck Coast" && lowSun) fogPass(ox, oy, 0.4);
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { weather: () => ({ place: G ? placeAt() : null, motes: motes.length, kinds: [...new Set(motes.map(m => m.k))] }) }), 0);
