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
      }
    }
    _groundFxEdges(g2, ox, oy);
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { edges: on => { if (on !== undefined) edgesOn = !!on; return { on: edgesOn, cached: edgeCache.size }; } }), 0);
