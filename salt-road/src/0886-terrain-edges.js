  // ================================================================== TERRAIN EDGES: GROUND THAT MEETS GROUND
  // Where two kinds of open ground meet, the stronger one creeps a few ragged pixels over the weaker, so grass frays onto
  // a path and snow drifts onto the lake ice instead of stopping at a straight tile line. Each edge is the neighbour's own
  // texture cut through a hand-jagged mask, cached once per ground kind, side and mask, so it costs a few draws a tile.
  const EDGE_RANK = { [T.SALT]: 1, [T.ICE]: 1, [T.SAND]: 2, [T.PATH]: 3, [T.MUD]: 4, [T.REEDS]: 5, [T.GRASS]: 6, [T.SNOW]: 6 };
  const edgeCache = new Map();
  function edgeSprite(nt, side, m) {   // side: 0 top, 1 right, 2 bottom, 3 left (the side of THIS tile the neighbour is on)
    const key = nt * 100 + side * 10 + m; if (edgeCache.has(key)) return edgeCache.get(key);
    const c = document.createElement("canvas"); c.width = c.height = TILE;
    const g2 = c.getContext("2d");
    g2.drawImage(tileCanvas(nt, m % (VARIANTS[nt] || 1)), 0, 0);
    // the mask: along the shared side, a ragged band one to three pixels deep, with loose pixels past it
    const mk = document.createElement("canvas"); mk.width = mk.height = TILE; const mg = mk.getContext("2d"); mg.fillStyle = "#000";
    for (let i = 0; i < TILE; i++) {
      const ph = m * 2.1 + side * 1.3 + nt * 0.7, r = hash(i * 7 + m * 31 + nt, side * 13 + 5);   // a slow wave with a little grain, so the edge wanders instead of stippling
      const d = Math.max(1, Math.min(3, Math.round(1.6 + Math.sin(i * 0.55 + ph) * 0.9 + Math.sin(i * 1.7 + ph * 2) * 0.35 + (r - 0.5) * 0.5)));
      const loose = hash(i * 3 + side, m * 11 + nt) < 0.12 ? d + 1 : 0;
      const put = (along, depth) => { if (side === 0) mg.fillRect(along, depth, 1, 1); else if (side === 2) mg.fillRect(along, TILE - 1 - depth, 1, 1); else if (side === 3) mg.fillRect(depth, along, 1, 1); else mg.fillRect(TILE - 1 - depth, along, 1, 1); };
      for (let k = 0; k < d; k++) put(i, k);
      if (loose) put(i, loose);
    }
    g2.globalCompositeOperation = "destination-in"; g2.drawImage(mk, 0, 0);
    edgeCache.set(key, c); return c;
  }
  // corners: c is 0 top-left, 1 top-right, 2 bottom-right, 3 bottom-left. "inner" is a small tuft where only the diagonal
  // neighbour is stronger; "outer" rounds the corner where both sides are the same stronger ground, so it curves
  function cornerSprite(nt, c, m, outer) {
    const key = 100000 + nt * 1000 + c * 100 + m * 10 + (outer ? 1 : 0); if (edgeCache.has(key)) return edgeCache.get(key);
    const cv = document.createElement("canvas"); cv.width = cv.height = TILE; const g2 = cv.getContext("2d");
    g2.drawImage(tileCanvas(nt, m % (VARIANTS[nt] || 1)), 0, 0);
    const mk = document.createElement("canvas"); mk.width = mk.height = TILE; const mg = mk.getContext("2d"); mg.fillStyle = "#000";
    const R = outer ? 5 : 2.6 + hash(nt + m, c) * 1.2;
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) {
      const inside = outer ? (x < 3 || y < 3 || (x - 2.5) ** 2 + (y - 2.5) ** 2 < 2.2) && x + y < R + 1.5 : x * x + y * y < R * R;
      if (!inside) continue;
      const px = c === 1 || c === 2 ? TILE - 1 - x : x, py = c >= 2 ? TILE - 1 - y : y; mg.fillRect(px, py, 1, 1);
    }
    g2.globalCompositeOperation = "destination-in"; g2.drawImage(mk, 0, 0);
    edgeCache.set(key, cv); return cv;
  }
  let edgesOn = true;
  const _groundFxEdges = groundFx;
  groundFx = function (g2, ox, oy) {
    if (edgesOn) {
      const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE);
      for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE) + 1; tx++) {
        const t = get(tx, ty), rk = EDGE_RANK[t]; if (rk === undefined) continue;
        const X = tx * TILE - ox, Y = ty * TILE - oy, m = Math.floor(hash(tx * 5 + 1, ty * 7 + 3) * 3);
        const ns = [get(tx, ty - 1), get(tx + 1, ty), get(tx, ty + 1), get(tx - 1, ty)];
        for (let s = 0; s < 4; s++) { const n = ns[s], nr = EDGE_RANK[n]; if (nr !== undefined && nr > rk) g2.drawImage(edgeSprite(n, s, m), X, Y); }
        for (let c = 0; c < 4; c++) {   // the two sides meeting at this corner, and the diagonal between them
          const s1 = c === 0 || c === 1 ? 0 : 2, s2 = c === 0 || c === 3 ? 3 : 1, a1 = ns[s1], a2 = ns[s2], r1 = EDGE_RANK[a1], r2 = EDGE_RANK[a2];
          if (a1 === a2 && r1 !== undefined && r1 > rk) { g2.drawImage(cornerSprite(a1, c, m, true), X, Y); continue; }
          if ((r1 !== undefined && r1 > rk) || (r2 !== undefined && r2 > rk)) continue;
          const d = get(tx + (c === 1 || c === 2 ? 1 : -1), ty + (c >= 2 ? 1 : -1)), dr = EDGE_RANK[d];
          if (dr !== undefined && dr > rk) g2.drawImage(cornerSprite(d, c, m, false), X, Y);
        }
      }
    }
    _groundFxEdges(g2, ox, oy);
  };
  // ---- reflections: someone standing at the water's edge, or in the shallows, shows in it, faint and wavering
  const REFLECTS = new Set([T.WATER, T.SHALLOW]);
  let reflecting = false;
  const _drawPersonRefl = drawPerson;
  drawPerson = function (g2, x, y, o) {
    if (o && !o.dead && !reflecting && G && !battle && g2 === g && (mode === "play" || mode === "dialog")) {
      const wx = x + camX, wy = y + camY, below = get(Math.floor(wx / TILE), Math.floor((wy + 10) / TILE));
      if (REFLECTS.has(below)) {
        reflecting = true;
        const top = Math.max(Math.round(y) + 1, Math.floor((wy + 10) / TILE) * TILE - Math.round(camY));   // only on the water itself
        g2.save(); g2.beginPath(); g2.rect(Math.round(x) - 14, top, 28, Math.round(y) + 31 - top); g2.clip();
        g2.globalAlpha = below === T.SHALLOW ? 0.22 : 0.3;
        g2.translate(Math.round(x + Math.sin(time * 2.4 + wy * 0.05) * 0.8), Math.round(y) + 2); g2.scale(1, -0.9);
        try { _drawPersonRefl(g2, 0, 0, { ...o, walking: false }); } finally { reflecting = false; g2.restore(); }
        g2.fillStyle = "rgba(230,250,255,0.18)"; for (let k = 0; k < 3; k++) g2.fillRect(Math.round(x) - 6 + ((time * 6 + k * 5) % 12), Math.round(y) + 5 + k * 6, 4, 1);   // light on the ripples
      }
    }
    return _drawPersonRefl(g2, x, y, o);
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { edges: on => { if (on !== undefined) edgesOn = !!on; return { on: edgesOn, cached: edgeCache.size }; } }), 0);
