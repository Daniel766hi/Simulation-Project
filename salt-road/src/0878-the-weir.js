  // ================================================================== ACT III, PART 2: THE WEIR (rows 190-239)
  // Saint Isolde let the Rime go, and the meltwater came down the old riverbed, the way it had not come in four
  // generations. A season later it stopped. Below the Rime a company of new men in the Guild's old coats has built a
  // weir across the riverbed and sells the river back by the cup to the people camped in the dry bed below it. Isolde
  // warned that someone else would stand up in the same coat. Opens once Isolde has let go.
  const WEIR = { y0: 190, y1: 239, gate: [100, 187], land: [100, 193], yard: { x0: 80, y0: 198, x1: 96, y1: 214 }, crest: 206, wall: [207, 208], sluice: { x: 128, y: 205 },
    camp: { x0: 30, y0: 216, x1: 62, y1: 232 }, reeds: { x0: 140, y0: 212, x1: 166, y1: 237 }, lake: { cx: 128, cy: 199, rx: 30, ry: 7 }, stream: [127, 129] };
  const weirOpen = () => G.stage >= 10 && !!G.flags.rimeDone;
  const wf = () => G.flags;
  Object.assign(T, { REEDS: 42, WEIRSTONE: 43 });
  SOLID.add(T.WEIRSTONE);
  Object.assign(VARIANTS, { [T.REEDS]: 3, [T.WEIRSTONE]: 2 });
  Object.assign(MINI, { [T.REEDS]: "#7a8a4a", [T.WEIRSTONE]: "#8a8478" });
  const _tileCanvasWeir = tileCanvas;
  tileCanvas = function (t, v) {
    if (t !== T.REEDS && t !== T.WEIRSTONE) return _tileCanvasWeir(t, v);
    const key = t * 10 + v; if (tileCache.has(key)) return tileCache.get(key);
    const c = document.createElement("canvas"); c.width = c.height = TILE;
    const g = c.getContext("2d"), px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); }, r = i => hash(t * 89 + v * 17 + i, i * 5 + v);
    if (t === T.REEDS) {   // reeds standing in a hand of water: green-gold stalks, brown heads, the water showing between
      px(0, 0, 16, 16, "#5a7a6a"); px(0, 12, 16, 4, "#4a6a5e");
      for (let i = 0; i < 7; i++) { const x = Math.floor(r(i) * 15), h = 7 + Math.floor(r(i + 7) * 7); px(x, 16 - h, 1, h, i % 2 ? "#a8a858" : "#7a8a4a"); if (r(i + 3) < 0.5) px(x, 15 - h, 1, 3, "#6a4a2a"); }
      if (v === 1) px(3, 13, 4, 1, "#8ab4b4"); if (v === 2) px(9, 14, 5, 1, "#8ab4b4");
    } else {   // the weir's new stone: cut blocks, mortar still white, a seep of water at the joints
      px(0, 0, 16, 16, "#8a8478"); px(0, 0, 16, 1, "#a8a294");
      for (const y of [5, 11]) px(0, y, 16, 1, "#d8d4c8");
      for (const [x, y] of v ? [[4, 0], [12, 6], [6, 12]] : [[9, 0], [2, 6], [13, 12]]) px(x, y, 1, 5, "#d8d4c8");
      px(v ? 5 : 10, 6, 1, 5, "#5a7a8a"); px(v ? 5 : 10, 11, 1, 1, "#8ab4c4");
      for (let i = 0; i < 4; i++) px(Math.floor(r(i) * 16), Math.floor(r(i + 4) * 16), 1, 1, "#6a6458");
    }
    tileCache.set(key, c); return c;
  };
  // ---- the land: the dry riverbed, the reservoir behind the weir, the Company's yard, Lowwater camp, the reeds
  const weirRnd = (a, b) => { let h = Math.imul(a ^ 0x2c1b3c6d, 0x297a2d39) ^ Math.imul(b + 0x7f4a7c15, 0x9e3779b1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
  const inLake = (x, y) => { const L = WEIR.lake, dx = (x - L.cx) / L.rx, dy = (y - L.cy) / L.ry; return dx * dx + dy * dy < 1 + (weirRnd(x, y) - 0.5) * 0.1; };
  const _buildMapWeir = buildMap;
  buildMap = function () {
    _buildMapWeir();
    const Y0 = WEIR.y0, Y1 = WEIR.y1;
    rect(0, Y0, W - 1, Y1, T.CLIFF);
    for (let y = Y0 + 1; y < Y1; y++) for (let x = 1; x < W - 1; x++) set(x, y, T.SAND);   // the riverbed, dry again
    for (let y = Y0 + 1; y <= WEIR.crest; y++) for (let x = 1; x < W - 1; x++) if (inLake(x, y)) set(x, y, T.WATER);         // the water held behind the weir
    for (let y = Y0 + 1; y < 194; y++) for (let x = 123; x <= 133; x++) set(x, y, T.WATER);                                       // where the river comes in from the Rime
    for (let y = Y0 + 1; y <= WEIR.crest; y++) for (let x = 1; x < W - 1; x++) if (get(x, y) !== T.WATER && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => get(x + dx, y + dy) === T.WATER)) set(x, y, T.SHALLOW);
    for (let x = 96; x <= 160; x++) { set(x, WEIR.crest, T.DECK); for (const y of WEIR.wall) set(x, y, T.WEIRSTONE); }               // the crest walk and the wall
    rect(WEIR.sluice.x - 2, WEIR.sluice.y - 1, WEIR.sluice.x + 2, WEIR.sluice.y, T.DECK);                                          // the sluice house's platform
    // below the wall: the old bed, bones of fish that came down with the river and were left when it stopped
    for (let i = 0; i < 90; i++) { const x = 2 + Math.floor(weirRnd(i * 11 + 3, 503) * 164), y = 210 + Math.floor(weirRnd(509, i * 5 + 1) * 28); if (get(x, y) === T.SAND) set(x, y, weirRnd(i, 511) < 0.45 ? T.BONES : T.ROCK); }
    // the reeds in the east, where the wall seeps
    const R2 = WEIR.reeds;
    for (let y = R2.y0; y <= R2.y1; y++) for (let x = R2.x0; x <= R2.x1; x++) { const n = weirRnd(x >> 1, (y >> 1) + 90); set(x, y, n < 0.55 ? T.REEDS : n < 0.8 ? T.SHALLOW : T.SAND); }
    // the Company's yard on the west abutment: a wall, a cobbled yard, the office and the barracks
    const Y = WEIR.yard;
    rect(Y.x0, Y.y0, Y.x1, Y.y1, T.SWALL); rect(Y.x0 + 1, Y.y0 + 1, Y.x1 - 1, Y.y1 - 1, T.COBBLE);
    house2(Y.x0 + 2, Y.y0 + 2, 6); house2(Y.x0 + 9, Y.y0 + 2, 5); house2(Y.x0 + 2, Y.y0 + 9, 5);
    for (const y of [Y.y0, Y.y1]) set(88, y, T.COBBLE);
    set(Y.x1, WEIR.crest, wf && G && G.flags && G.flags.weirGate ? T.COBBLE : T.GDOOR);
    // Lowwater: the camp of the people who planted on the new banks, now waiting below a wall for their cups
    const C = WEIR.camp;
    rect(C.x0, C.y0, C.x1, C.y1, T.PATH);
    house2(33, 218, 5); house2(40, 218, 5); house2(52, 218, 6); house2(33, 226, 5); house2(55, 226, 5);
    for (let x = C.x0 + 3; x <= C.x1 - 3; x += 4) set(x, C.y1 + 2, T.GRASS);   // a row of seedlings, dry
    // roads: from the stair down past the yard, south to Lowwater, and east along the bed to the reeds
    carve([[WEIR.land[0], WEIR.land[1]], [WEIR.land[0], 195], [88, 195], [88, WEIR.yard.y0]], T.PATH);
    carve([[88, WEIR.yard.y1], [88, 224], [C.x1, 224]], T.PATH);
    carve([[88, 224], [R2.x0 + 2, 224], [R2.x0 + 2, 230]], T.PATH);
    carve([[88, 224], [88, 236], [120, 236]], T.PATH);
    // the way down from the Rime
    carve([[100, 182], [WEIR.gate[0], WEIR.gate[1]]], T.PATH);
    fixSpots();
  };
  // the river, once the wheel is decided: a stream down the old bed (bridged where the roads cross), and with the gates
  // thrown open the reservoir goes down to a wide shallow and the wall has a breach in it
  function weirWater() {
    if (!G || !G.flags.weirDone) return;
    const free = G.flags.weirChoice === "free", [s0, s1] = WEIR.stream;
    for (let y = WEIR.wall[1] + 1; y < WEIR.y1; y++) for (let x = s0 - (free ? 1 : 0); x <= s1 + (free ? 1 : 0); x++) set(x, y, (y === 224 || y === 236) ? T.BRIDGE : (x === s0 - 1 || x === s1 + 1) ? T.SHALLOW : T.WATER);
    if (free) {
      for (let y = WEIR.y0 + 1; y < WEIR.crest; y++) for (let x = 1; x < W - 1; x++) if (get(x, y) === T.WATER && !(x >= 123 && x <= 133)) set(x, y, T.SHALLOW);
      for (let x = s0 - 1; x <= s1 + 1; x++) for (const y of WEIR.wall) set(x, y, T.WATER);
      set(s0 - 2, WEIR.crest, T.BRIDGE); for (let x = s0 - 1; x <= s1 + 1; x++) set(x, WEIR.crest, T.BRIDGE);
    }
  }
  const _applyWorldWeir = applyWorldState;
  applyWorldState = function () {
    _applyWorldWeir();
    if (!G) return;
    if (G.flags.fog && G.flags.fog.length < FW * FH) G.flags.fog = G.flags.fog.padEnd(FW * FH, "0");   // older saves knew a smaller world
    set(WEIR.yard.x1, WEIR.crest, G.flags.weirGate ? T.COBBLE : T.GDOOR);
    weirWater();
  };
  WARPS.push({ x: WEIR.gate[0], y: WEIR.gate[1], to: WEIR.land, req: weirOpen, msg: "A cut in the Rime's south wall where the meltwater went down. The water's gone from it now: only a wet stair and, far below, the sound of a wall with a river behind it. (After the Rime)" },
    { x: WEIR.land[0], y: WEIR.land[1] - 1, to: [WEIR.gate[0], WEIR.gate[1] - 1] });
  const _noRainWeir = noRainAt;   // the Rime keeps the rain off the riverbed: whatever water it gets comes down from the ice
  noRainAt = (tx, ty) => (ty >= WEIR.y0 && ty <= WEIR.y1) || _noRainWeir(tx, ty);
  const _regionOfWeir = regionOf;
  regionOf = function (x, y) { return y >= WEIR.y0 ? "weir" : _regionOfWeir(x, y); };
  REGION_LINKS.weir = { rime: [WEIR.land[0], WEIR.land[1] - 1] }; REGION_LINKS.rime.weir = WEIR.gate;
  REGIONS.unshift({ name: "Lowwater", x0: WEIR.camp.x0, y0: WEIR.camp.y0, x1: WEIR.camp.x1, y1: WEIR.camp.y1 + 2, music: "village" },
    { name: "The Company Yard", x0: WEIR.yard.x0, y0: WEIR.yard.y0, x1: WEIR.yard.x1, y1: WEIR.yard.y1, music: "city" },
    { name: "The Weir", x0: 96, y0: WEIR.crest - 2, x1: 160, y1: WEIR.wall[1], music: "deep" },
    { name: "The Reeds", x0: WEIR.reeds.x0, y0: WEIR.reeds.y0, x1: WEIR.reeds.x1, y1: WEIR.reeds.y1, music: "marsh" },
    { name: "The Old Riverbed", x0: 1, y0: 191, x1: 168, y1: 238, music: "flats" });
  MAP_LABELS.push(["Lowwater", 46, 214], ["Company Yard", 88, 196], ["The Weir", 128, 210], ["The Reeds", 153, 238], ["Old Riverbed", 110, 228]);
  const _areaAtWeir = areaAt;
  areaAt = function (tx, ty, f) { return ty >= WEIR.y0 ? (ty <= WEIR.wall[1] && tx >= 96 && tx <= 160 ? "weir" : "river") : _areaAtWeir(tx, ty, f); };
  SKIES2.river = ["#3a2a2a", "#d8a878"]; SKIES2.weir = ["#1a2230", "#6a7a8a"];
  const _bgWeir = drawBattleBg2b;
  drawBattleBg2b = function (g, area) {
    if (area !== "river" && area !== "weir") return _bgWeir(g, area);
    const t = time;
    if (area === "river") {   // the dry bed under a hot sky: cracked mud, fish bones, the wall far off upstream
      g.fillStyle = "#f2d8a8"; g.beginPath(); g.arc(250, 40, 14, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#8a8478"; g.fillRect(-10, 92, VIEW_W + 20, 14); g.fillStyle = "#a8a294"; g.fillRect(-10, 92, VIEW_W + 20, 2);
      g.fillStyle = "#d8d4c8"; for (let x = 0; x < VIEW_W; x += 22) g.fillRect(x, 96, 1, 10);
      g.fillStyle = "#b08a5a"; g.beginPath(); g.moveTo(-10, 112); for (let x = -10; x <= VIEW_W + 10; x += 8) g.lineTo(x, 108 + Math.sin(x * 0.05) * 3); g.lineTo(VIEW_W + 10, 112); g.fill();
      g.fillStyle = "#c8a070"; g.fillRect(-10, 112, VIEW_W + 20, 90);
      g.strokeStyle = "#8a6a44"; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const x = (i * 47) % VIEW_W, y = 120 + (i * 13) % 70; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 3); g.lineTo(x + 12, y - 2); g.lineTo(x + 20, y + 1); g.stroke(); }
      g.fillStyle = "#e8e0cc"; for (let i = 0; i < 6; i++) { const x = 20 + i * 52, y = 150 + (i * 19) % 30; g.fillRect(x, y, 12, 1); for (let k = 0; k < 4; k++) g.fillRect(x + 2 + k * 3, y - 2, 1, 5); }
    } else {   // on the crest: grey sky, the held water on one side, the drop on the other, the great wheel turning
      g.fillStyle = "#4a6a7a"; g.fillRect(-10, 60, VIEW_W + 20, 44); g.fillStyle = "#6a8a9a"; for (let i = 0; i < 12; i++) g.fillRect((i * 37 + t * 6) % (VIEW_W + 20) - 10, 66 + (i * 7) % 30, 18, 1);
      const wx = 270, wy = 70, a = t * 0.6; g.strokeStyle = "#3a3026"; g.lineWidth = 3; g.beginPath(); g.arc(wx, wy, 26, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 8; k++) { const ang = a + k * Math.PI / 4; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(ang) * 26, wy + Math.sin(ang) * 26); g.stroke(); }
      g.fillStyle = "#8a8478"; g.fillRect(-10, 104, VIEW_W + 20, 98); g.fillStyle = "#a8a294"; g.fillRect(-10, 104, VIEW_W + 20, 3);
      g.fillStyle = "#d8d4c8"; for (let r2 = 0; r2 < 6; r2++) { g.fillRect(-10, 118 + r2 * 14, VIEW_W + 20, 1); for (let x = (r2 % 2) * 16; x < VIEW_W; x += 32) g.fillRect(x, 104 + r2 * 14, 1, 14); }
      if (!REDUCED) { g.fillStyle = "rgba(168,212,236,.55)"; for (let i = 0; i < 18; i++) { const x = 20 + (i * 53) % (VIEW_W - 40), y = (t * 40 + i * 23) % 90 + 108; g.fillRect(x, y, 1, 5); } }   // the seeps
    }
    return true;
  };
  // ---- the riverbed's creatures and the Company's men
  RAMP.silt = ["#1a140e", "#3a2c1e", "#6a5236", "#9a7e56", "#c8aa7c", "#ecdcb8"];
  RAMP.reed = ["#141a0e", "#2e3a1a", "#4e6028", "#7a8a4a", "#a8a858", "#dcd8a0"];
  Object.assign(REG_ART, {
    silteel: { w: 58, h: 38, ramps: ["ink", "silt", "leech", "bone", "glowy"], paint(K, ph) {
      const w = Math.sin(ph * Math.PI * 2);
      K.E(87, 104, 70, 8, "rgba(58,44,30,0.55)");   // the mud it rises from
      // a long body in a coil, slick with silt, half out of the ground
      const pts = []; for (let i = 0; i <= 12; i++) { const a = i / 12; pts.push([20 + a * 120, 98 - Math.sin(a * Math.PI) * 60 + Math.sin(a * 9 + w * 2) * 8]); }
      K.S(pts, 22, "#3a2c1e"); K.S(pts, 16, "#6a5236"); K.S(pts.map(([x, y]) => [x - 2, y - 4]), 5, "#9a7e56");
      for (let i = 1; i < 12; i += 2) K.E(pts[i][0], pts[i][1] + 4, 3, 2, "#c8aa7c");
      for (let i = 2; i < 11; i++) K.P([[pts[i][0] - 3, pts[i][1] - 9], [pts[i][0], pts[i][1] - 18 - (i % 3) * 2], [pts[i][0] + 3, pts[i][1] - 9]], "#3a2c1e");   // a fin like a torn sail
      const [hx, hy] = pts[12]; K.vol(hx + 4, hy - 6, 16, 12, ["#9a7e56", "#6a5236", "#1a140e"]);
      K.E(hx + 12, hy - 2, 9, 6, "#1a140e"); K.teeth(hx + 4, hy - 4, 5, 3, 5, "#ecdcb8"); K.eye(hx, hy - 12, 2.6, "#f6e07a");
      K.Q([[hx + 16, hy - 8], [hx + 30, hy - 20], [hx + 34, hy - 6]], 1.4, "#3a2c1e"); K.Q([[hx + 16, hy - 4], [hx + 32, hy + 2], [hx + 30, hy + 12]], 1.4, "#3a2c1e");   // barbels
      for (let i = 0; i < 10; i++) K.drip(24 + K.rng() * 120, 70 + K.rng() * 26, 4 + K.rng() * 8, 1.4, "#3a2c1e");
    } },
    reedlurk: { w: 44, h: 62, ramps: ["ink", "reed", "bone", "silt", "glowc"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, cx = 66;
      // a thing made of reeds tied round a drowned man's bones; it stands in the water and waits
      for (let i = 0; i < 26; i++) { const x = cx - 40 + K.rng() * 80, top = 20 + K.rng() * 40 + b; K.S([[x, 180], [x + (K.rng() - 0.5) * 10, top]], 2 + K.rng() * 2, K.rng() < 0.5 ? "#4e6028" : "#7a8a4a"); if (K.rng() < 0.4) K.E(x, top - 4, 2.4, 6, "#6a4a2a"); }
      K.P([[cx - 26, 60 + b], [cx + 26, 60 + b], [cx + 34, 150], [cx - 32, 152]], K.LG(cx - 30, 0, cx + 30, 0, [[0, "#2e3a1a"], [0.5, "#7a8a4a"], [1, "#2e3a1a"]]));
      for (let r = 0; r < 5; r++) K.S([[cx - 22, 76 + r * 14 + b], [cx + 22, 76 + r * 14 + b]], 2.4, "#dcd8a0");   // ribs showing through
      for (let r = 0; r < 5; r++) K.S([[cx - 28, 72 + r * 15 + b], [cx + 28, 74 + r * 15 + b]], 1.2, "#6a4a2a");     // the twine
      K.vol(cx, 44 + b, 15, 17, ["#ecdcb8", "#a8a294", "#3a3026"]);                                         // a skull under a reed hood
      K.E(cx - 6, 42 + b, 4, 5, "#07060c"); K.E(cx + 6, 42 + b, 4, 5, "#07060c"); K.eye(cx - 6, 42 + b, 1.8, "#9ef0f5", null); K.eye(cx + 6, 42 + b, 1.8, "#9ef0f5", null);
      K.teeth(cx - 8, 52 + b, 5, 2.6, 4, "#ecdcb8");
      K.P([[cx - 22, 40 + b], [cx - 10, 14 + b], [cx + 10, 14 + b], [cx + 22, 40 + b], [cx + 14, 34 + b], [cx, 26 + b], [cx - 14, 34 + b]], "#4e6028");
      for (const s of [-1, 1]) { K.S([[cx + s * 26, 70 + b], [cx + s * 46, 108], [cx + s * 40, 146]], 5, "#4e6028"); for (let f = 0; f < 3; f++) K.S([[cx + s * 40, 146], [cx + s * (36 + f * 5), 160]], 1.6, "#dcd8a0"); }
      K.E(cx, 176, 50, 6, "rgba(90,122,106,0.6)");
    } },
    bailiff: { w: 40, h: 72, ramps: ["ink", "cloth", "leather", "gold", "flesh", "rust", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.2, cx = 60;
      // a Company bailiff: oilcloth coat, a brass gauge on the chest, a pike marked off in cups
      for (const s of [-1, 1]) { K.S([[cx + s * 10, 150], [cx + s * 12, 200]], 9, "#2a2a36"); K.E(cx + s * 13, 204, 8, 4, "#1a140e"); }
      K.P([[cx - 24, 70 + b], [cx + 24, 70 + b], [cx + 34, 172], [cx - 34, 172]], K.LG(cx - 34, 0, cx + 34, 0, [[0, "#1e2a2a"], [0.4, "#3e5a56"], [1, "#16201e"]]));
      K.S([[cx, 74 + b], [cx, 170]], 1.4, "#0e1414"); for (let i = 0; i < 4; i++) K.E(cx + 4, 86 + i * 18 + b, 1.6, 1.6, "#d8b440");
      K.vol(cx - 10, 100 + b, 8, 8, ["#f6e07a", "#b08a28", "#2e1e06"]); K.S([[cx - 10, 100 + b], [cx - 6, 96 + b]], 1.2, "#9a1224");   // the gauge, its needle near empty
      K.S([[cx - 24, 120 + b], [cx + 24, 120 + b]], 4, "#523828"); K.R(cx - 4, 117 + b, 8, 6, "#b08a28");
      K.S([[cx + 24, 76 + b], [cx + 36, 110 + b], [cx + 40, 130 + b]], 7, "#2e403a"); K.vol(cx + 40, 132 + b, 5, 5, ["#e2b394", "#ad7058", "#4a2226"]);
      K.S([[cx + 42, 20], [cx + 40, 206]], 3, "#523828");   // the pike, notched in cups
      for (let i = 0; i < 9; i++) K.S([[cx + 38, 40 + i * 18], [cx + 44, 40 + i * 18]], 1.2, "#d8b440");
      K.P([[cx + 34, 22], [cx + 42, 0], [cx + 50, 22]], "#c8bca2");
      K.S([[cx - 24, 76 + b], [cx - 32, 112 + b], [cx - 26, 136 + b]], 7, "#2e403a"); K.vol(cx - 26, 138 + b, 5, 5, ["#e2b394", "#ad7058", "#4a2226"]);
      K.vol(cx, 52 + b, 13, 15, ["#e2b394", "#ad7058", "#4a2226"]);
      K.P([[cx - 20, 44 + b], [cx + 20, 44 + b], [cx + 14, 30 + b], [cx - 14, 30 + b]], "#1e2a2a"); K.P([[cx - 26, 46 + b], [cx + 26, 46 + b], [cx + 20, 42 + b], [cx - 20, 42 + b]], "#16201e");   // a brimmed hat
      K.R(cx - 9, 50 + b, 18, 4, "#07060c"); K.E(cx - 4, 52 + b, 1.4, 1.4, "#f6e07a"); K.E(cx + 4, 52 + b, 1.4, 1.4, "#f6e07a");
      K.S([[cx - 6, 62 + b], [cx + 6, 62 + b]], 1.6, "#4a2226");
    } },
    lockhound: { w: 54, h: 42, ramps: ["ink", "gold", "rust", "ice", "glowy"], paint(K, ph) {
      const run = Math.sin(ph * Math.PI * 2), cx = 80;
      // a hound of riveted brass with a sluice-wheel turning in its chest; it pants steam and drips
      for (const [x, d] of [[44, 1], [60, -1], [104, 1], [118, -1]]) { const sw = run * d * 6; K.S([[x, 76], [x + sw * 0.5, 96], [x + sw, 116]], 7, "#5a3c0e"); K.S([[x, 78], [x + sw * 0.5, 96]], 2.4, "#d8b440"); K.E(x + sw, 118, 6, 3, "#2e1e06"); }
      K.vol(cx, 68, 50, 22, ["#f6e07a", "#b08a28", "#2e1e06"]);
      for (let i = 0; i < 10; i++) K.E(cx - 44 + i * 10, 50, 1.4, 1.4, "#2e1e06");
      const a = ph * Math.PI * 2; K.E(cx - 4, 72, 14, 14, "#2e1e06"); for (let k = 0; k < 6; k++) { const ang = a + k * Math.PI / 3; K.S([[cx - 4, 72], [cx - 4 + Math.cos(ang) * 12, 72 + Math.sin(ang) * 12]], 2, "#d8b440"); }
      K.E(cx - 4, 72, 3, 3, "#f6e07a");
      K.Q([[30, 60], [16, 44 + run * 4], [10, 28]], 4, "#86621a");
      K.vol(130, 52, 20, 15, ["#f6e07a", "#b08a28", "#2e1e06"]); K.P([[132, 58], [156, 62], [152, 70], [130, 68]], "#86621a"); K.teeth(134, 62, 6, 3, 4, "#e0f4ff");
      K.P([[118, 40], [120, 24], [128, 38]], "#86621a"); K.eye(128, 48, 3, "#ff9a3d", null);
      for (let i = 0; i < 6; i++) K.drip(70 + K.rng() * 40, 88, 6 + K.rng() * 10, 1.4, "#6aa0c8");
      for (let i = 0; i < 4; i++) K.E(160 + i * 5, 56 - i * 6 - run * 2, 3 + i, 2 + i, "rgba(224,244,255,0.45)");   // steam
    } },
  });
  Object.assign(MONSTERS, {
    silteel: { name: "Silt Eel", hp: 72, atk: 20, def: 5, spd: 12, xp: 56, coin: [5, 9], sprite: "silteel",
      moves: [{ name: "Mud Coil", w: 3, power: 1.0, stunChance: 0.2 }, { name: "Thrash", w: 2, power: 0.7, hits: 2 }, { name: "Silt Cloud", w: 1, weakAll: 2 }] },
    reedlurk: { name: "Reed Lurker", hp: 80, atk: 21, def: 6, spd: 7, xp: 60, coin: [6, 10], sprite: "reedlurk",
      moves: [{ name: "Snare", w: 3, power: 0.85, stunChance: 0.3 }, { name: "Rattle", w: 1, guard: true, heal: 12 }, { name: "Drag Under", w: 1, charge: true, power: 1.6 }] },
    bailiff: { name: "Company Bailiff", hp: 92, atk: 21, def: 10, spd: 9, xp: 62, coin: [10, 16], sprite: "bailiff",
      moves: [{ name: "Levy", w: 3, power: 1.1 }, { name: "Writ of Seizure", w: 2, power: 0.8, weakOne: 2 }, { name: "Hold the Line", w: 1, guard: true, heal: 14 }] },
    lockhound: { name: "Lock Hound", hp: 76, atk: 22, def: 8, spd: 15, xp: 58, coin: [6, 11], sprite: "lockhound",
      moves: [{ name: "Brass Bite", w: 3, power: 1.0, bleed: [3, 2] }, { name: "Pressure Burst", w: 2, power: 0.75, all: true }] },
    merrow: { name: "Provost Merrow of the Sluice Company", hp: 800, atk: 21, def: 10, spd: 9, xp: 520, coin: [220, 220], sprite: "merrow", boss: true, music: "boss", tall: true,
      moves: [{ name: "The Tariff", w: 3, power: 1.3, weakOne: 2 }, { name: "Open One Gate", w: 3, power: 0.85, all: true }, { name: "Read the Ledger", w: 2, weakAll: 2, heal: 24 },
        { name: "Drown the Debt", w: 0, charge: true, power: 1.85, all: true },
        { name: "Call the Bailiffs", w: 0, summonKind: "bailiff", summonText: "Merrow raps the rail with his key. Two bailiffs come up the crest steps at a run." }] },
  });
  Object.assign(BESTIARY, {
    silteel: "Eels that came down with the river and stayed when it stopped. They live in the mud now and are angry about it.",
    reedlurk: "Reeds that grew round something drowned and learned to stand up. Its pull builds slowly; break it before it drags someone under.",
    bailiff: "The Company's men. They are paid in cups, like everyone else below the wall, and they count the cups very carefully.",
    lockhound: "Brass dogs the Company built to guard the sluices. The wheel in the chest is the heart; when it spins up, everything near it gets wet and hurt.",
    merrow: "Provost of the Sluice Company, in a Guild coat cut down to fit. He says the river is a hazard and he is keeping everyone safe from it, at a price.",
  });
  FIELD.push(
    { id: "w1", x: 108, y: 214, group: ["bailiff", "lockhound"], minStage: 10 }, { id: "w2", x: 70, y: 206, group: ["lockhound", "lockhound"], minStage: 10 },
    { id: "w3", x: 150, y: 220, group: ["reedlurk", "reedlurk"], minStage: 10 }, { id: "w4", x: 118, y: 230, group: ["silteel", "reedlurk"], minStage: 10 },
    { id: "w5", x: 44, y: 204, group: ["bailiff", "bailiff", "lockhound"], minStage: 10, elite: true }, { id: "w6", x: 104, y: 234, group: ["silteel", "silteel"], minStage: 10 },
    { id: "w7", x: 148, y: 222, group: ["reedlurk", "silteel", "silteel"], minStage: 10, elite: true },
  );
  LORE.push(
    { id: 26, x: 86, y: 215, title: "The Company's Notice", text: "Painted on the yard wall in fresh white: \"THE RIVER IS A HAZARD. THE SLUICE COMPANY HOLDS IT FOR YOUR SAFETY. ONE CUP PER HEAD PER DAY, AT THE GATE, AT DAWN. RATES AS POSTED.\" The rates have been painted over three times." },
    { id: 27, x: 60, y: 233, title: "A Row of Seedlings", text: "Willow cuttings stuck in the dry bed, each with a stone beside it and a name scratched on the stone. Somebody has been carrying them water in their own cup. The ones at the end of the row are dead." },
    { id: 28, x: 146, y: 213, title: "Kelda's Word, Carried", text: "A strip of birch bark tied to a reed, the writing small and careful: \"From the Rime. She let it go slowly so that it would reach you. Plant on the banks. Don't sell the cups. — Hild.\"" },
  );
  RELICS.sluicekey = { name: "The Sluice Key", from: "merrow", desc: "The key to the weir's wheel. +2 attack, +2 speed, and 3 health back each turn.", atk: 2, spd: 2, regen: 3 };
  // ---- the people of the riverbed
  const WEIR_LOOK = {
    tull: { robe: "#7a5a3a", hair: "#d8d4c8", skin: "#8a5a3a", style: { hair: "bun", dress: true, eye: "#3a2a1a" } },
    dace: { robe: "#3e5a56", hair: "#3a2a1a", skin: "#c98d63", style: { hair: "cap", eye: "#2a3a3a" } },
    pip: { robe: "#c8a070", hair: "#6a3a1a", skin: "#a87a5a", style: { hair: "fringe", eye: "#3a2a1a" } },
    hale: { robe: "#5a6a3a", hair: "#2a1a10", skin: "#6a4a30", style: { hair: "hood", hood: "#3a4a2a", eye: "#2a2a1a" } },
  };
  npc2({ id: "tull", name: "Gran Tull", x: 46, y: 224, look: WEIR_LOOK.tull, show: weirOpen });
  npc2({ id: "dace", name: "Dace the Sluice-hand", x: 93, y: 205, look: WEIR_LOOK.dace, show: weirOpen });
  npc2({ id: "pip", name: "Pip", x: 58, y: 230, look: WEIR_LOOK.pip, show: weirOpen });
  npc2({ id: "hale", name: "Brother Hale", x: 38, y: 222, look: WEIR_LOOK.hale, show: weirOpen });
  for (const id of ["tull", "dace", "pip", "hale"]) SPEAKERS[id] = NPCS.find(n => n.id === id).name;
  SPEAKERS.merrow = "Provost Merrow";
  Object.assign(ACTS, {
    tull: { draw: (P, t) => { P(9, -20, 2, 20, "#6b5a44"); P(8, -22, 4, 2, "#d8b440"); } },
    dace: { draw: (P, t) => { const a = Math.sin(t * 1.6) * 2; P(-12, -16 + a, 7, 7, "#b08a28"); P(-10, -14 + a, 3, 3, "#2e1e06"); } },
    pip: { pace: 16, draw: (P, t, n, g2, x, y) => { P(8, -8, 5, 2, "#e8e0cc"); if (!n.walking && Math.sin(t * 1.1) > 0.75) drawEmote(g2, x + 8, y - 30, "drop"); } },
    hale: { draw: (P, t) => { P(8, -12, 6, 7, "#ddd4b0"); P(9, -11, 4, 1, "#5a6a3a"); } },
  });
  const weirKept = () => G.flags.rimeChoice === "keep";
  Object.assign(D, {
    weir_arrive: say(null, "The wet stair comes out on the old riverbed. Upstream, where the meltwater from the Rime should be running, there is a wall of new stone across the bed, and behind it a grey lake, held. Below the wall the bed is dry again. Fish bones. Somebody's washing laid out on the rocks, stiff. A camp to the south-west.", null, () => { wf().weirArrived = true; save(); }),
    tull_0: { who: "tull", text: "You came down the Rime stair. Then you've seen her, the saint, and you know the water's real. ...Sit, if there's anywhere to sit. I'm Tull. This is Lowwater. It wasn't called that in the spring.", choices: [
      { t: "\"What happened in the spring?\"", go: "tull_1" }, { t: "\"Another time.\"", go: null }] },
    tull_1: say("tull", "The river came. Down the old bed, all the way from the Rime, slow, like somebody had asked it to be careful. We'd been dry three generations. We came out of Tamar's Rest and the salt camps and planted willows on the banks. My grandson caught a fish. A real one, with a face.", "tull_2"),
    tull_2: say("tull", "Then in the summer the men came in the coats. They built the wall in eight weeks, which tells you how long they'd been planning it. Now the water stands behind it, and every dawn we line up at the gate for one cup each, at the rate as posted. The willows get what we don't drink.", "tull_3"),
    tull_3: { who: "tull", text: "The Provost says it's for our safety. A river is a hazard, he says. Courier, you carry things. Will you carry a word up to the wall for us? Tell him the river was given. It wasn't his to catch.", choices: [
      { t: "\"I'll go up to the wall.\"", go: "tull_yes" }, { t: "\"Is he wrong? A river can drown people.\"", go: "tull_hazard" }] },
    tull_hazard: say("tull", "So can a wall, when it goes. And thirst kills slower but it kills more. The saint let it go slowly so nobody would drown. He's not keeping us safe from the water. He's keeping the water safe from us.", "tull_yes"),
    tull_yes: say("tull", "The crest of the wall is shut by a gate in the Company yard. Dace keeps it. He turns the sluice wheel, and he's from here, from before; his little sister's buried under the willows. Talk to him. He might open it for you, if you give him a reason he can live with.", null, () => { wf().weirQuest = true; save(); toast("Gran Tull asks you to carry Lowwater's word to the weir. Dace in the Company yard keeps the gate to the crest."); }),
    tull_wait: say("tull", "Dace is in the yard, up the road on the west side of the wall. If they stop you at the yard gate, say you've come for your cup. Everyone says that."),
    tull_after: say("tull", "", null),
    dace_0: say("dace", "(A young man in a Company coat, oiling a brass key the length of his arm.) If you're here for your cup it's dawn, not now. ...You're not from the bed. You came down the Rime stair. People don't, much."),
    dace_q: { who: "dace", text: "(He doesn't look up from the key.) Tull sent you. She sends everyone. I turn the wheel, courier. One notch at dawn, one cup a head, and the Provost pays me three cups instead of one. My mother drinks one of them. I'm not proud. I'm thirsty.", choices: [
      { t: "\"Isolde let the water go so it would reach you. She asked them to plant, not sell the cups.\"", go: "dace_isolde" },
      { t: "\"Your sister's under the willows. They're dying.\"", go: "dace_willows" }] },
    dace_isolde: say("dace", "(He stops oiling.) ...We heard a saint had done it, up in the ice. I thought it was a story they told so we'd be grateful to someone. She asked for that? Not to sell it?", "dace_open"),
    dace_willows: say("dace", "(He is quiet for a long time.) I water hers out of my third cup. Every day. I thought nobody saw.", "dace_open"),
    dace_open: say("dace", "(He stands up and unhooks a ring of keys from his belt.) The crest gate's at the end of the yard, on the water side. The Provost's in the sluice house in the middle of the wall. He'll have his bailiffs, and his hounds, and the ledger. I'll say you forced the gate. Don't make me a liar.", null, () => { wf().weirGate = true; applyWorldState(); miniDirty = true; save(); toast("Dace opens the gate to the crest of the weir. The sluice house is in the middle of the wall."); }),
    dace_wait: say("dace", "The gate's open. Go on, before somebody counts the keys."),
    dace_after: say("dace", "", null),
    pip_0: say("pip", "I collect fish bones. This one's a whole fish, see, from nose to tail. It came down with the river and then the river went away and it didn't. Gran says don't feel sorry for the fish, feel sorry for the willows. I feel sorry for both."),
    pip_after: say("pip", "", null),
    hale_0: { who: "hale", text: "(A lay brother of no order you've heard of, with a cart of jars.) Salves, tonics, salts. And a place to lie down that isn't the riverbed. I charge what the jars cost me; the Company charges me for the water I mix them with.", choices: [
      { t: "Salve (heal 22): 6 coin", go: "hale_0", act: () => buy("salve"), req: () => G.coins >= 6, reqText: "6 coin" },
      { t: "Bitter Tonic: 5 coin", go: "hale_0", act: () => buy("tonic"), req: () => G.coins >= 5, reqText: "5 coin" },
      { t: "Smelling Salts: 10 coin", go: "hale_0", act: () => buy("salts"), req: () => G.coins >= 10, reqText: "10 coin" },
      { t: "Rest in the cart's shade", go: "hale_rest" }, { t: "That's all", go: null }] },
    hale_rest: say(null, "You lie down in the shade of Brother Hale's cart while he hums something tuneless. Everyone is fully healed, and your progress is saved.", null, () => restParty()),
    merrow_0: say("merrow", "(The sluice house is a brass booth in the middle of the wall, with a wheel the height of two men. Behind the glass, a man in a Guild coat cut down to fit him looks up from a ledger.) A courier. On my crest. Dace has never been good at keys.", "merrow_1"),
    merrow_1: { who: "merrow", text: "Let me guess. The river was given. It wasn't mine to catch. Tull has a way with a sentence. Did she tell you what a river does when nobody's holding it? What it did to the caravan road the last time the Rime let go?", choices: [
      { t: "\"Isolde let it go slowly. Nobody drowned. You built this wall after.\"", go: "merrow_2" },
      { t: "\"Then hold it, and give it away. Why the cups?\"", go: "merrow_2b" }] },
    merrow_2: say("merrow", "After. Yes. Somebody had to think about after. The saint thinks in generations; she'll be asleep for the next flood. I think in ledgers. A ledger is a promise that someone will remember.", "merrow_3"),
    merrow_2b: say("merrow", "Because a thing that is given away is a thing that nobody looks after. The cup is the looking-after. The price is how you know the water is worth the wall.", "merrow_3"),
    merrow_3: say("merrow", "(He closes the ledger and lifts a brass key twin to Dace's.) The Guild fell, courier. I was in it, and I watched it fall, and I learned the only lesson there was to learn: build the wall first. Now get off my crest, or I open a gate on you.", null, () => startBattle(["merrow"], { boss: "merrow", area: "weir" })),
    merrow_after: { who: "merrow", text: "(He is on his knees by the wheel, the key across his lap. The water behind the wall is very loud.) You could open it. All of it, now, and break the wheel, and the wall would be a ruin by spring. Or you could give the key to somebody. Choose. I find I'm tired of choosing.", choices: [
      { t: "Throw open every gate and break the wheel. Let the river run to the Dry Sea.", go: "merrow_free" },
      { t: "Give the key to Lowwater. Let them keep the wall and give the water out themselves.", go: "merrow_commons" }] },
    merrow_free: say("merrow", "(You put your shoulder to the wheel. It turns, and turns, and something in the wall gives with a sound like a bell cracking. Water goes past you in a white roar, down the old bed, toward the Dry Sea.) ...It'll flood the low camps in spring. You know that. ...Tell them to plant higher.", null, () => weirDone("free")),
    merrow_commons: say("merrow", "(You hold out your hand for the key. He looks at it for a long time, then gives it to you.) Lowwater, with a wall. They'll argue about every notch. They'll keep a ledger, in the end; you'll see. ...I hope it's a better one than mine.", null, () => weirDone("commons")),
  });
  function weirDone(choice) {
    wf().weirChoice = choice; wf().weirDone = true; applyWorldState(); miniDirty = true; save(); updateHud();
    setTimeout(() => card("Act III · The Weir", choice === "free" ? "The River Runs" : "Lowwater Keeps the Wheel",
      choice === "free" ? "The wall breaks over a winter. The river runs down the old bed into the Dry Sea, louder than Isolde meant it to, and Lowwater moves its camp up the bank and plants the willows higher. In spring the low ground floods. By summer it is green." :
        "Dace teaches the wheel to anyone who wants to learn it. Lowwater keeps the wall and gives the water out from it, one notch for the willows before one for the people, and argues about every notch. Tull starts a ledger. It has names in it, not prices."), 600);
  }
  D.tull_after.text = "Every morning I go and look at the water to be sure it's still there. It's a foolish thing to do. I do it anyway.";
  D.dace_after.text = "My sister's willow put out a leaf this morning. I told nobody. I'm telling you.";
  D.pip_after.text = "I'm not collecting bones anymore. I'm collecting fish that are still alive. I have two. They're in a bucket. Gran says that isn't collecting, it's keeping, and keeping's how the trouble started. I'm going to put them back. Probably.";
  const _dialogForWeir = dialogFor;
  dialogFor = function (n) {
    if (n.id === "tull") return wf().weirDone ? "tull_after" : wf().weirQuest ? "tull_wait" : "tull_0";
    if (n.id === "dace") return wf().weirDone ? "dace_after" : wf().weirGate ? "dace_wait" : wf().weirQuest ? "dace_q" : "dace_0";
    if (n.id === "pip") return wf().weirDone ? "pip_after" : "pip_0";
    if (n.id === "hale") return "hale_0";
    return _dialogForWeir(n);
  };
  // the crest: the gate opens for Dace's keys; in the middle of the wall, the sluice house and its Provost
  const _interactWeir = interact;
  interact = function () {
    const S2 = WEIR.sluice;
    if (weirOpen() && mode === "play" && near({ x: S2.x * TILE + 8, y: S2.y * TILE + 8 }, 40) && !wf().merrowDead) { openDialog("merrow_0"); return true; }
    if (weirOpen() && mode === "play" && !wf().weirGate && near({ x: WEIR.yard.x1 * TILE + 8, y: WEIR.crest * TILE + 8 }, 26)) { D.__weirgate = say(null, "An iron gate onto the crest of the wall, chained, with a Company padlock the size of a fist. Through the bars: the walkway, the held water, and in the middle of the wall a brass booth with a wheel. (Whoever keeps the keys might open it.)"); openDialog("__weirgate"); return true; }
    return _interactWeir();
  };
  const _addProp2Weir = addProp2;
  addProp2 = () => {
    _addProp2Weir();
    addProp("sign", 101, 196, { text: "A Company post, new paint: THE OLD RIVERBED. SLUICE COMPANY HOLDINGS. DRAWING WATER ABOVE THE WALL IS THEFT. Under it, scratched with a knife: SO IS THE WALL." });
    addProp("campfire", 46, 228); addProp("barrel", 50, 223); addProp("cart", 40, 223); addProp("flowers", 59, 234);
    addProp("banner", 88, 199); addProp("crate", 84, 211); addProp("crate", 93, 211); addProp("lamp", 90, 205);
    addProp("pillar", WEIR.sluice.x - 2, WEIR.sluice.y - 1); addProp("pillar", WEIR.sluice.x + 2, WEIR.sluice.y - 1); addProp("chains", WEIR.sluice.x, WEIR.sluice.y - 1);
    for (const [x, y] of [[144, 218], [150, 228], [160, 222], [146, 234]]) addProp("reeds", x, y);
  };
  // the first steps on the bed, and a word in the Rime once Isolde has let go
  const _updateWeir = update;
  let weirTick = 0;
  update = function (dt) {
    _updateWeir(dt);
    if (!G || mode !== "play" || (weirTick -= dt) > 0) return; weirTick = 1;
    const ty = Math.floor(G.py / TILE);
    if (weirOpen() && ty >= WEIR.y0 && !wf().weirArrived) openDialog("weir_arrive");
    else if (weirOpen() && !wf().weirHint && regionOf(Math.floor(G.px / TILE), ty) === "rime") { wf().weirHint = true; toast(weirKept() ? "Brannoc says the meltwater that went south down the Rime stair stopped a week ago, all at once, like a door shut on it." : "Wynn says the river that went down the Rime stair has stopped. She skated down to look. There's a wall."); }
  };
  const _bossEndWeir = act2BossEndB;
  act2BossEndB = function (boss) { _bossEndWeir(boss); if (boss === "merrow") { wf().merrowDead = true; save(); setTimeout(() => openDialog("merrow_after"), 300); } };
  // his second form: he throws the great wheel and rides the open sluice, and the engine of the wall rises behind him
  PHASE2.merrow = ["Then have it! Have ALL of it at once!", "#6aa0c8"];
  P2NAME.merrow = "Merrow at the Open Sluice";
  const merrowBody = (K, ph, open) => {
    const b = Math.sin(ph * Math.PI * 2) * 2, W2 = 288, cx = W2 / 2;
    K.E(cx, 344, 120, 10, "rgba(7,6,12,0.4)");
    // the sluice wheel behind him, and in his second form the gates open and white water pouring through
    const a = ph * Math.PI * 2 * (open ? 2 : 0.5);
    K.E(cx, 150, 112, 112, "#2e1e06"); K.E(cx, 150, 100, 100, open ? "#3a6a90" : "#3a3026");
    for (let k = 0; k < 12; k++) { const ang = a + k * Math.PI / 6; K.S([[cx, 150], [cx + Math.cos(ang) * 100, 150 + Math.sin(ang) * 100]], 6, "#86621a"); K.P([[cx + Math.cos(ang) * 96, 150 + Math.sin(ang) * 96], [cx + Math.cos(ang + 0.18) * 112, 150 + Math.sin(ang + 0.18) * 112], [cx + Math.cos(ang - 0.08) * 112, 150 + Math.sin(ang - 0.08) * 112]], "#b08a28"); }
    K.E(cx, 150, 18, 18, K.RG(cx - 4, 146, 2, 20, [[0, "#f6e07a"], [0.6, "#b08a28"], [1, "#2e1e06"]]));
    if (open) for (let i = 0; i < 30; i++) { const x = cx - 130 + K.rng() * 260, y = (K.rng() * 340 + ph * 300) % 340; K.S([[x, y], [x + (x < cx ? -3 : 3), y + 14]], 2, K.rng() < 0.5 ? "rgba(224,244,255,0.85)" : "rgba(106,160,200,0.7)"); }
    // the man: a Guild coat cut down to fit, gold braid gone green, a ledger chained to his belt
    for (const s of [-1, 1]) { K.S([[cx + s * 14, 260 + b], [cx + s * 16, 330]], 13, "#1e1a24"); K.E(cx + s * 17, 334, 12, 5, "#0e0a10"); }
    K.P([[cx - 40, 150 + b], [cx + 40, 150 + b], [cx + 62, 300], [cx + 30, 290], [cx, 300], [cx - 30, 290], [cx - 62, 300]], K.LG(cx - 62, 0, cx + 62, 0, [[0, "#3a1a10"], [0.35, "#8a3a20"], [0.6, "#6a2a18"], [1, "#2a120a"]]));
    for (const s of [-1, 1]) { K.S([[cx + s * 6, 152 + b], [cx + s * 14, 290]], 3, "#6a7a3a"); for (let i = 0; i < 6; i++) K.E(cx + s * 12, 170 + i * 20 + b, 3, 3, "#8a9a4a"); }   // tarnished braid
    K.P([[cx - 22, 236 + b], [cx + 6, 236 + b], [cx + 6, 268 + b], [cx - 22, 268 + b]], "#2e1e06"); K.P([[cx - 19, 239 + b], [cx + 3, 239 + b], [cx + 3, 265 + b], [cx - 19, 265 + b]], "#ddd4b0");
    for (let l = 0; l < 5; l++) K.S([[cx - 16, 244 + l * 5 + b], [cx, 244 + l * 5 + b]], 0.8, l === 2 ? "#9a1224" : "#6a6250");
    for (let i = 0; i < 4; i++) K.E(cx + 10 + i * 5, 226 + i * 4 + b, 2, 2, "#848498");   // the chain
    K.vol(cx, 176 + b, 34, 22, ["#a84a2a", "#6a2a18", "#2a120a"]);   // shoulders, epaulettes
    for (const s of [-1, 1]) { K.E(cx + s * 38, 166 + b, 14, 7, "#8a9a4a"); for (let f = 0; f < 5; f++) K.S([[cx + s * (30 + f * 4), 170 + b], [cx + s * (30 + f * 4), 180 + b]], 1.4, "#6a7a3a"); }
    if (open) {   // both hands on the great key, thrown over his head
      for (const s of [-1, 1]) K.S([[cx + s * 34, 176 + b], [cx + s * 40, 130 + b], [cx + s * 16, 92 + b]], 11, "#6a2a18");
      K.S([[cx - 70, 88 + b], [cx + 70, 88 + b]], 7, "#b08a28"); K.E(cx + 74, 88 + b, 12, 12, "#f6e07a"); K.E(cx + 74, 88 + b, 5, 5, "#2e1e06");
    } else {
      K.S([[cx + 34, 176 + b], [cx + 52, 224 + b], [cx + 60, 252 + b]], 11, "#6a2a18"); K.vol(cx + 60, 256 + b, 8, 8, ["#e2b394", "#ad7058", "#4a2226"]);
      K.S([[cx + 62, 150 + b], [cx + 60, 330]], 5, "#b08a28"); K.E(cx + 62, 146 + b, 10, 10, "#f6e07a"); K.E(cx + 62, 146 + b, 4, 4, "#2e1e06");   // the key as a staff
      K.S([[cx - 34, 176 + b], [cx - 46, 220 + b], [cx - 30, 240 + b]], 11, "#6a2a18"); K.vol(cx - 28, 242 + b, 8, 8, ["#e2b394", "#ad7058", "#4a2226"]);
    }
    // the face: lean, shaved, spectacles with the lamp in them; in the second form, soaked and laughing
    K.vol(cx, 128 + b, 22, 27, ["#ecc8a8", "#ad7058", "#4a2226"]);
    for (const s of [-1, 1]) { K.E(cx + s * 9, 124 + b, 7, 6, "#e0f4ff"); K.rim([[cx + s * 9 - 7, 124 + b], [cx + s * 9, 118 + b], [cx + s * 9 + 7, 124 + b], [cx + s * 9, 130 + b]], "#86621a", 1.4); K.E(cx + s * 9, 124 + b, 2, 2, open ? "#07060c" : "#3a4a5a"); }
    K.S([[cx - 2, 124 + b], [cx + 2, 124 + b]], 1.4, "#86621a");
    if (open) { K.E(cx, 144 + b, 9, 6, "#1e0306"); K.teeth(cx - 7, 140 + b, 6, 2.4, 3, "#ecdcb8"); for (let i = 0; i < 8; i++) K.drip(cx - 18 + i * 5, 104 + b, 10 + (i % 3) * 8, 1.4, "#6aa0c8"); }
    else K.S([[cx - 8, 144 + b], [cx + 8, 143 + b]], 2, "#4a2226");
    K.P([[cx - 24, 108 + b], [cx - 20, 98 + b], [cx + 20, 98 + b], [cx + 24, 108 + b]], "#3a3026");   // hair, slicked
    K.P([[cx - 30, 104 + b], [cx - 26, 70 + b], [cx + 26, 70 + b], [cx + 30, 104 + b]], "#1e1a24"); K.S([[cx - 36, 104 + b], [cx + 36, 104 + b]], 5, "#1e1a24"); K.S([[cx - 26, 96 + b], [cx + 26, 96 + b]], 3, "#8a3a20");   // a tall hat with a Guild band
  };
  BOSS_ART.merrow = { w: 96, h: 118, ramps: ["ink", "gold", "rust", "flesh", "paper", "night", "ice", "cloth"], paint(K, ph) { merrowBody(K, ph, false); } };
  P2ART.merrow = { w: 96, h: 118, ramps: ["ink", "gold", "rust", "flesh", "paper", "night", "ice", "cloth"], paint(K, ph) { merrowBody(K, ph, true); } };
  // the journal, the Chronicle and the endings remember the weir
  const _renderJournalWeir = renderJournal;
  renderJournal = function () {
    _renderJournalWeir();
    if (!weirOpen() || !(wf().weirArrived || wf().weirQuest)) return;
    const h = [...$("journalBody").querySelectorAll("h3")].find(x => x.textContent === "Side quests"), ul = h && h.nextElementSibling; if (!ul) return;
    const done = !!wf().weirDone, t = done ? `Act III, the Weir: ${wf().weirChoice === "free" ? "the wheel is broken and the river runs to the Dry Sea" : "Lowwater keeps the wheel and gives the water out itself"}.` :
      wf().weirGate ? "Act III, the Weir: Dace opened the crest gate. Find Provost Merrow in the sluice house in the middle of the wall." :
        wf().weirQuest ? "Act III, the Weir: ask Dace in the Company yard, on the west side of the wall, to open the gate to the crest." : "Act III, the Weir: find out who has walled up the river below the Rime.";
    ul.querySelector("li.dim") && ul.querySelector("li.dim").remove();
    ul.insertAdjacentHTML("afterbegin", `<li class="${done ? "done" : ""}">${done ? "✓ " : ""}${t}</li>`);
  };
  const _chronicleWeir = chronicle;
  chronicle = function () {
    const P = _chronicleWeir();
    if (wf().weirDone) P.splice(Math.max(0, P.length - 1), 0, ["The Weir", wf().weirChoice === "free" ? "Below the Rime, a Provost of a new company had walled up the river the saint let go, and sold it back by the cup. The courier broke his wheel. The river runs to the Dry Sea now, and Lowwater plants higher." : "Below the Rime, a Provost of a new company had walled up the river the saint let go, and sold it back by the cup. The courier gave his key to the camp below the wall. Lowwater gives the water out now, one notch for the willows first."]);
    return P;
  };
  const _extraFatesWeir = extraFates;
  extraFates = function (k) { const out = _extraFatesWeir(k); if (wf().weirDone) out.push(wf().weirChoice === "free" ? "The weir below the Rime is a ruin with willows growing out of it. The river reached the Dry Sea." : "Lowwater keeps the weir below the Rime. Its ledger has names in it, not prices."); return out; };
  ACHIEVEMENTS.push(["weir", "Not His to Catch", "Settle the weir below the Rime.", () => G.flags.weirDone]);
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { weir: () => ({ ...WEIR, flags: { arrived: !!wf().weirArrived, quest: !!wf().weirQuest, gate: !!wf().weirGate, done: !!wf().weirDone, choice: wf().weirChoice || null } }) }), 0);
