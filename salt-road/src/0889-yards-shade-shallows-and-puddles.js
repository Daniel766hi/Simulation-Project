  // ================================================================== SHADE, LIGHT IN THE SHALLOWS, PUDDLES, MOTES
  // More depth on the ground. Walls, houses, cliffs and rocks throw a soft shade to their east as well as their foot,
  // and cliffs and stone walls get the foot-shade the houses already had. By day the sun draws moving nets of light
  // on the floor of shallow water. Once the Act II rain has come, puddles lie on paths, cobbles and mud (and, more thinly, on town sand), each catching
  // the sky and ringing with drops. Dust drifts in the sun shafts. Reduced motion keeps the shade, the light and the
  // puddles still; Effects: Light keeps the shade (it is cheap) and skips the rest.
  const TALL = new Set([T.WALL, T.HOUSE, T.ROCK, T.CRYSTAL, T.CITY, T.GATE, T.CLIFF, T.SWALL]);
  const FOOT_DONE = new Set([T.WALL, T.HOUSE, T.ROCK, T.CRYSTAL, T.CITY, T.GATE]);   // these already have a foot-shade from the renderer
  const shadeSide = (() => { const c = document.createElement("canvas"); c.width = 7; c.height = TILE; const g2 = c.getContext("2d");
    const gr = g2.createLinearGradient(0, 0, 7, 0); gr.addColorStop(0, "rgba(20,14,40,0.3)"); gr.addColorStop(1, "rgba(20,14,40,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, 7, TILE); return c; })();
  const shadeFoot = (() => { const c = document.createElement("canvas"); c.width = TILE; c.height = 8; const g2 = c.getContext("2d");
    const gr = g2.createLinearGradient(0, 0, 0, 8); gr.addColorStop(0, "rgba(20,14,40,0.32)"); gr.addColorStop(1, "rgba(20,14,40,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, TILE, 8); return c; })();
  const shadeCorner = (() => { const c = document.createElement("canvas"); c.width = c.height = 7; const g2 = c.getContext("2d");
    const gr = g2.createRadialGradient(0, 0, 0, 0, 0, 7); gr.addColorStop(0, "rgba(20,14,40,0.24)"); gr.addColorStop(1, "rgba(20,14,40,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, 7, 7); return c; })();
  // a tileable net of light, drawn once: bright where two slow ripple fields cross
  const CN = 32, causticSprite = (() => { const c = document.createElement("canvas"); c.width = c.height = CN; const g2 = c.getContext("2d"), im = g2.createImageData(CN, CN);
    for (let y = 0; y < CN; y++) for (let x = 0; x < CN; x++) {
      const u = x / CN * Math.PI * 2, v = y / CN * Math.PI * 2;
      const f = Math.sin(u * 2 + Math.sin(v * 1) * 1.3) + Math.sin(v * 2 + Math.sin(u * 3) * 1.1) + Math.sin((u + v) * 1 + 0.7);
      const k = Math.max(0, 1 - Math.abs(f) * 1.7), i = (y * CN + x) * 4;
      im.data[i] = 235; im.data[i + 1] = 252; im.data[i + 2] = 255; im.data[i + 3] = Math.round(k * k * 255);
    }
    g2.putImageData(im, 0, 0); return c; })();
  let causticPat = null; const shallowTiles = new Int32Array(1024);
  const PUDDLE_ON = new Set([T.PATH, T.COBBLE, T.MUD]);
  const rainHere = () => G.stage >= 7 && !OUTDOOR_SKIP.has(tileAt(G.px, G.py)) && !noRainAt(Math.floor(G.px / TILE), Math.floor(G.py / TILE));
  const _groundFxShade = groundFx;
  groundFx = function (g2, ox, oy) {
    _groundFxShade(g2, ox, oy);
    if (!G || battle) return;
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE), light = fxLight();
    const sun = Math.max(0, Math.sin(Math.PI * 2 * (G.clock ?? 0.3)));
    const wet = !light && rainHere(), shallowsLit = !light && sun > 0.15, sandPools = wet && !SANDY.has(placeAt());   // town sand holds puddles; the deserts drink them
    let caustics = 0, puddles = 0;
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE); tx++) {
      const t = get(tx, ty), X = tx * TILE - ox, Y = ty * TILE - oy;
      if (!SOLID.has(t)) {   // shade from what stands to the west and the north
        const w = TALL.has(get(tx - 1, ty)), n = get(tx, ty - 1);
        if (w) g2.drawImage(shadeSide, X, Y);
        if (TALL.has(n) && !FOOT_DONE.has(n)) g2.drawImage(shadeFoot, X, Y);
        if (!w && !TALL.has(n) && TALL.has(get(tx - 1, ty - 1))) g2.drawImage(shadeCorner, X, Y);
      }
      if (t === T.SHALLOW && shallowsLit) shallowTiles[caustics++] = X * 1000 + Y + 500;
      const pr = hash(tx * 13 + 5, ty * 17 + 3);
      if (wet && ((PUDDLE_ON.has(t) && pr < 0.2) || (t === T.SAND && sandPools && pr < 0.07))) {
        puddles++;
        const px = X + 3 + Math.floor(hash(tx, ty + 31) * 5), py = Y + 5 + Math.floor(hash(tx + 31, ty) * 5), rw = 4 + Math.floor(hash(tx + 7, ty + 7) * 3);
        g2.fillStyle = "rgba(46,62,110,0.42)"; g2.beginPath(); g2.ellipse(px + rw, py + 2, rw, 2.2, 0, 0, Math.PI * 2); g2.fill();
        g2.fillStyle = "rgba(190,210,240,0.35)"; g2.fillRect(px + 2, py + 1, rw - 1, 1);   // the sky in it
        if (!REDUCED) { const ph = (time * 1.3 + hash(tx, ty) * 5) % 1.6; if (ph < 0.6) {   // a drop lands
          g2.strokeStyle = `rgba(220,235,255,${0.5 * (1 - ph / 0.6)})`; g2.lineWidth = 1; g2.beginPath(); g2.ellipse(px + rw, py + 2, 1 + ph * 5, 0.6 + ph * 2, 0, 0, Math.PI * 2); g2.stroke(); } }
      }
    }
    if (caustics) {   // two copies of the net sliding different ways, filled as patterns: two calls a tile
      FXN.caustics++;
      if (!causticPat) causticPat = g2.createPattern(causticSprite, "repeat");
      const a = REDUCED ? 0 : time;
      g2.save(); g2.globalCompositeOperation = "lighter"; g2.globalAlpha = 0.16 * sun; g2.fillStyle = causticPat;
      for (const [dx, dy] of [[a * 5 + ox, a * 3 + oy], [-a * 4 + 11 + ox, a * 6 + 7 + oy]]) {
        causticPat.setTransform(new DOMMatrix([1, 0, 0, 1, Math.round(-dx), Math.round(-dy)]));
        for (let i = 0; i < caustics; i++) { const v = shallowTiles[i], X = Math.floor(v / 1000), Y = v - X * 1000 - 500; g2.fillRect(X, Y, TILE, TILE); }
      }
      g2.restore();
    }
    if (puddles) FXN.puddles++;
  };
  // dust in the sun shafts: specks that drift and catch the light, only where the shafts are
  const _shaftPassMotes = shaftPass;
  shaftPass = function (ox, oy, strength) {
    _shaftPassMotes(ox, oy, strength);
    if (REDUCED) return;
    for (let i = 0; i < 26; i++) {
      const x = (hash(i, 991) * VIEW_W + Math.sin(time * 0.3 + i) * 12 + time * 3) % VIEW_W, y = (hash(i, 993) * VIEW_H + time * (2 + (i % 3)) + Math.cos(time * 0.4 + i * 2) * 6) % VIEW_H;
      const a = Math.max(0, Math.sin(time * 0.9 + i * 2.3)) * strength * 0.7; if (a < 0.08) continue;
      g.fillStyle = `rgba(255,248,220,${a})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  };
