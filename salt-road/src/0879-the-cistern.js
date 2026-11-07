  // ================================================================== ACT III, PART 3: THE CISTERN (rows 240-289)
  // Below Lowwater the old riverbed ends in a sinkhole, and the river the saint let go runs down into it. Under the Dry
  // Sea the first Guild cut a cistern the size of a town, to keep the valley's water where only they could reach it.
  // The Guild fell, but the cistern kept its keepers: an old lamplighter, a surveyor who measured it for the Sluice
  // Company, and in the ledger vault the one who paid for the weir, Proprietor Vane, who has been buying the river
  // a cup at a time and pouring it into the Guild's old tanks. Opens once the weir is settled; ends Act III.
  const CIS = { y0: 240, y1: 289, gate: [110, 238], land: [104, 244], camp: { x0: 8, y0: 244, x1: 40, y1: 262 }, nave: { x0: 60, y0: 254, x1: 150, y1: 278 },
    tanks: { x0: 128, y0: 242, x1: 166, y1: 252 }, vault: { x0: 18, y0: 266, x1: 54, y1: 286 }, door: [54, 272], throne: { x: 34, y: 278 }, canal: [109, 111] };
  const cisOpen = () => G.stage >= 10 && !!G.flags.weirDone;
  const cf = () => G.flags;
  Object.assign(T, { COLUMN: 44, TANK: 45 });
  SOLID.add(T.COLUMN); SOLID.add(T.TANK);
  Object.assign(VARIANTS, { [T.COLUMN]: 2, [T.TANK]: 2 });
  Object.assign(MINI, { [T.COLUMN]: "#4a4652", [T.TANK]: "#8a6a2a" });
  const _tileCanvasCis = tileCanvas;
  tileCanvas = function (t, v) {
    if (t !== T.COLUMN && t !== T.TANK) return _tileCanvasCis(t, v);
    const key = t * 10 + v; if (tileCache.has(key)) return tileCache.get(key);
    const c = document.createElement("canvas"); c.width = c.height = TILE;
    const g = c.getContext("2d"), px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    if (t === T.COLUMN) {   // a cistern column: dressed stone, a waterline, moss where the damp sits
      px(0, 0, 16, 16, "#2a2830"); px(3, 0, 10, 16, "#5a5662"); px(3, 0, 2, 16, "#7a7682"); px(11, 0, 2, 16, "#3e3a46");
      px(2, 0, 12, 2, "#6a6672"); px(2, 14, 12, 2, "#4a4652");
      px(3, v ? 9 : 10, 10, 1, "#3a5a6a"); px(5, 12, 3, 2, "#4a6a3a");
    } else {   // a Guild tank: riveted brass gone green, a gauge, a valve wheel
      px(0, 0, 16, 16, "#5a4a1e"); px(1, 1, 14, 14, "#8a6a2a"); px(1, 1, 14, 2, "#b08a3a");
      for (const x of [2, 13]) for (const y of [3, 7, 11]) px(x, y, 1, 1, "#d8b440");
      px(4, 10, 8, 3, "#4a7a5a"); px(v ? 5 : 9, 5, 3, 3, "#2e1e06"); px(v ? 6 : 10, 6, 1, 1, "#f6e07a");
    }
    tileCache.set(key, c); return c;
  };
  // ---- the land: halls cut in the rock under the Dry Sea, the canal the river runs down, the camp, the tanks, the vault
  const cisRnd = (a, b) => { let h = Math.imul(a ^ 0x1b873593, 0x2c1b3c6d) ^ Math.imul(b + 0x68e31da4, 0x9e3779b1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
  const _buildMapCis = buildMap;
  buildMap = function () {
    _buildMapCis();
    rect(0, CIS.y0, W - 1, CIS.y1, T.CLIFF);
    rect(1, CIS.y0 + 1, W - 2, CIS.y1 - 1, T.ROCK);
    const hall = (x0, y0, x1, y1) => rect(x0, y0, x1, y1, T.FLOOR);
    hall(94, 241, 126, 252);                                   // the entry hall, under the sinkhole
    hall(CIS.nave.x0, CIS.nave.y0, CIS.nave.x1, CIS.nave.y1);  // the great nave
    hall(CIS.camp.x0, CIS.camp.y0, CIS.camp.x1, CIS.camp.y1);  // the lampkeepers' alcove
    hall(CIS.tanks.x0, CIS.tanks.y0, CIS.tanks.x1, CIS.tanks.y1 + 12);   // the tank hall
    for (let y = 253; y <= 254; y++) for (let x = 100; x <= 120; x++) set(x, y, T.FLOOR);
    for (let x = 41; x < CIS.nave.x0; x++) for (const y of [257, 258, 259]) set(x, y, T.FLOOR);            // corridor west to the camp
    for (let x = CIS.vault.x1; x < CIS.nave.x0; x++) for (const y of [271, 272, 273]) set(x, y, T.FLOOR);   // and south-west to the vault
    // columns down the nave, in rows, clear of the roads
    for (let y = CIS.nave.y0 + 2; y <= CIS.nave.y1 - 2; y += 4) for (let x = CIS.nave.x0 + 3; x <= CIS.nave.x1 - 3; x += 6) if (![258, 266, 272].some(r => Math.abs(y - r) < 2) && Math.abs(x - 110) > 4) set(x, y, T.COLUMN);
    for (const [x, y] of [[98, 245], [122, 245], [98, 250], [122, 250]]) set(x, y, T.COLUMN);
    // the tanks: three rows of the Guild's brass
    for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 5; tx++) { const x = CIS.tanks.x0 + 3 + tx * 7, y = CIS.tanks.y0 + 2 + ty * 7; if (y + 2 <= CIS.tanks.y1 + 1) rect(x, y, x + 3, y + 2, T.TANK); }
    // the river comes down the sinkhole as a fall and runs south in a cut canal, bridged where the roads cross
    for (let y = 241; y <= 243; y++) for (let x = 107; x <= 113; x++) set(x, y, T.WATER);
    for (let y = 244; y <= CIS.nave.y1; y++) for (let x = CIS.canal[0]; x <= CIS.canal[1]; x++) set(x, y, [258, 266, 272].includes(y) ? T.BRIDGE : T.WATER);
    for (let x = CIS.canal[0] - 1; x <= CIS.canal[1] + 1; x++) set(x, CIS.nave.y1 + 1, T.WATER);
    // puddles and fallen stone
    for (let i = 0; i < 70; i++) { const x = 2 + Math.floor(cisRnd(i * 7 + 1, 601) * 164), y = 242 + Math.floor(cisRnd(607, i * 3 + 2) * 46); if (get(x, y) === T.FLOOR && Math.abs(x - 110) > 3) set(x, y, cisRnd(i, 611) < 0.6 ? T.SHALLOW : T.BONES); }
    // the lampkeepers' alcove: lean-tos against the wall, a well of clean water they guard
    const C = CIS.camp; house2(C.x0 + 2, C.y0 + 1, 5); house2(C.x0 + 9, C.y0 + 1, 5); house2(C.x0 + 22, C.y0 + 1, 6); set(C.x0 + 11, C.y0 + 6, T.WELL);
    // the ledger vault: a masonry room, the door of the Guild's counting house
    const V = CIS.vault; rect(V.x0, V.y0, V.x1, V.y1, T.SWALL); rect(V.x0 + 1, V.y0 + 1, V.x1 - 1, V.y1 - 1, T.FLOOR);
    for (let x = V.x0 + 3; x <= V.x1 - 3; x += 4) for (const y of [V.y0 + 2, V.y1 - 2]) set(x, y, T.PEDESTAL);
    set(CIS.door[0], CIS.door[1], G && G.flags && G.flags.cisGate ? T.FLOOR : T.GDOOR);
    // roads
    carve([[CIS.land[0], CIS.land[1]], [104, 258], [CIS.nave.x0 - 19, 258]], T.PATH);
    carve([[104, 258], [136, 258], [136, 249], [150, 249]], T.PATH);
    carve([[96, 258], [96, 272], [CIS.vault.x1 + 1, 272]], T.PATH);
    carve([[104, 266], [120, 266], [120, 272], [96, 272]], T.PATH);
    for (const y of [258, 266, 272]) for (let x = CIS.canal[0]; x <= CIS.canal[1]; x++) if (get(x, y) !== T.ROCK) set(x, y, T.BRIDGE);
    // the way down from the riverbed
    carve([[110, 236], [CIS.gate[0], CIS.gate[1]]], T.PATH);
    fixSpots();
  };
  // once the cistern is decided: opened, the tanks stand empty and the river runs out under the Dry Sea; kept in trust,
  // the tanks stay full and the vault stands open for anyone to read the names in the ledgers
  function cisWater() {
    if (!G || !G.flags.cisDone) return;
    if (G.flags.cisChoice === "open") for (let y = CIS.tanks.y0; y <= CIS.tanks.y1 + 12; y++) for (let x = CIS.tanks.x0; x <= CIS.tanks.x1; x++) if (get(x, y) === T.TANK && (x + y) % 3 === 0) set(x, y, T.DEBRIS);
  }
  const _applyWorldCis = applyWorldState;
  applyWorldState = function () {
    _applyWorldCis();
    if (!G) return;
    if (G.flags.fog && G.flags.fog.length < FW * FH) G.flags.fog = G.flags.fog.padEnd(FW * FH, "0");   // older saves knew a smaller world
    set(CIS.door[0], CIS.door[1], G.flags.cisGate ? T.FLOOR : T.GDOOR);
    cisWater();
  };
  WARPS.push({ x: CIS.gate[0], y: CIS.gate[1], to: CIS.land, req: cisOpen, msg: "A sinkhole at the end of the old bed, with iron rungs down the side, and far below the sound of water falling into a very large room. (After the weir)" },
    { x: CIS.land[0], y: CIS.land[1] - 1, to: [CIS.gate[0], CIS.gate[1] - 1] });
  const _noRainCis = noRainAt;   // underground
  noRainAt = (tx, ty) => ty >= CIS.y0 || _noRainCis(tx, ty);
  const _regionOfCis = regionOf;
  regionOf = function (x, y) { return y >= CIS.y0 ? "cistern" : _regionOfCis(x, y); };
  REGION_LINKS.cistern = { weir: [CIS.land[0], CIS.land[1] - 1] }; REGION_LINKS.weir.cistern = CIS.gate;
  REGIONS.unshift({ name: "The Lampkeepers' Alcove", x0: CIS.camp.x0, y0: CIS.camp.y0, x1: CIS.camp.x1, y1: CIS.camp.y1, music: "village" },
    { name: "The Ledger Vault", x0: CIS.vault.x0, y0: CIS.vault.y0, x1: CIS.vault.x1, y1: CIS.vault.y1, music: "cathedral" },
    { name: "The Tank Hall", x0: CIS.tanks.x0, y0: CIS.tanks.y0, x1: CIS.tanks.x1, y1: CIS.tanks.y1 + 12, music: "city" },
    { name: "The Cistern", x0: 1, y0: 241, x1: 168, y1: 288, music: "deep" });
  MAP_LABELS.push(["Lampkeepers", 24, 242], ["Ledger Vault", 36, 288], ["Tank Hall", 147, 241], ["The Cistern", 105, 280]);
  const _areaAtCis = areaAt;
  areaAt = function (tx, ty, f) { return ty >= CIS.y0 ? (tx <= CIS.vault.x1 && ty >= CIS.vault.y0 ? "vault" : "cistern") : _areaAtCis(tx, ty, f); };
  SKIES2.cistern = ["#08080e", "#2a2a3a"]; SKIES2.vault = ["#140c06", "#4a3a1a"];
  const _bgCis = drawBattleBg2b;
  drawBattleBg2b = function (g, area) {
    if (area !== "cistern" && area !== "vault") return _bgCis(g, area);
    const t = time;
    if (area === "cistern") {   // arches going back into the dark, a lamp on each column, black water
      g.fillStyle = "#0a0a12"; g.fillRect(-10, -10, VIEW_W + 20, 130);
      for (let i = 0; i < 6; i++) { const x = i * 64 - 8; g.fillStyle = "#2a2830"; g.fillRect(x, 20, 16, 100); g.fillStyle = "#3e3a46"; g.fillRect(x + 2, 20, 4, 100);
        g.strokeStyle = "#2a2830"; g.lineWidth = 6; g.beginPath(); g.arc(x + 40, 26, 32, Math.PI, 0); g.stroke();
        const fl = 0.7 + Math.sin(t * 7 + i) * 0.15; g.fillStyle = `rgba(255,190,90,${0.18 * fl})`; g.beginPath(); g.arc(x + 8, 50, 16, 0, Math.PI * 2); g.fill(); g.fillStyle = "#ffcc66"; g.fillRect(x + 6, 46, 4, 5); }
      g.fillStyle = "#1a1a24"; g.fillRect(-10, 116, VIEW_W + 20, 90); g.fillStyle = "#24242e"; for (let r = 0; r < 6; r++) g.fillRect(-10, 124 + r * 12, VIEW_W + 20, 1);
      g.fillStyle = "#0e1a24"; g.fillRect(-10, 112, VIEW_W + 20, 6); g.fillStyle = "rgba(106,160,200,.35)"; for (let i = 0; i < 10; i++) g.fillRect((i * 37 + t * 10) % (VIEW_W + 20) - 10, 114, 14, 1);
    } else {   // the vault: shelves of ledgers to the roof, gold lamplight, a long counting table
      g.fillStyle = "#140c06"; g.fillRect(-10, -10, VIEW_W + 20, 130);
      for (let s = 0; s < 5; s++) { g.fillStyle = "#3a2410"; g.fillRect(-10, 14 + s * 20, VIEW_W + 20, 3);
        for (let x = 0; x < VIEW_W; x += 5) { const h = 10 + ((x * 7 + s * 13) % 7); g.fillStyle = ["#5a1a12", "#2a3a1a", "#3a2a4a", "#6a4a1a"][(x + s) % 4]; g.fillRect(x, 14 + s * 20 - h, 4, h); } }
      g.fillStyle = "rgba(246,224,122,.08)"; g.fillRect(-10, -10, VIEW_W + 20, 130);
      g.fillStyle = "#3a2410"; g.fillRect(-10, 116, VIEW_W + 20, 90); g.fillStyle = "#4a3018"; for (let r = 0; r < 6; r++) g.fillRect(-10, 120 + r * 14, VIEW_W + 20, 2);
      if (!REDUCED) { g.fillStyle = "rgba(246,224,122,.6)"; for (let i = 0; i < 14; i++) { const x = (hash(i, 41) * VIEW_W + Math.sin(t * 0.7 + i) * 8) % VIEW_W, y = (hash(i, 43) * 110 + t * 4) % 110; g.fillRect(x, y, 1, 1); } }   // dust in the lamplight
    }
    return true;
  };
  // ---- the cistern's creatures and the Proprietor's clerks
  RAMP.lamp = ["#140c06", "#3a2410", "#7a4a1a", "#d88a2a", "#ffcc66", "#fff4d0"];
  RAMP.cave = ["#0a0a12", "#1e1e2a", "#3e3a46", "#6a6672", "#a8a4b0", "#e8e4f0"];
  Object.assign(REG_ART, {
    lampwight: { w: 40, h: 60, ramps: ["ink", "lamp", "cave", "cloth", "bone"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, cx = 60, fl = 1 + Math.sin(ph * Math.PI * 4) * 0.15;
      // a lamplighter who went on lighting lamps after he died: a long coat of soot, a pole, a lantern for a head
      K.E(cx, 60 + b, 34 * fl, 34 * fl, K.RG(cx, 60 + b, 2, 34, [[0, "rgba(255,204,102,0.55)"], [1, "rgba(255,204,102,0)"]]));
      K.P([[cx - 20, 84 + b], [cx + 20, 84 + b], [cx + 30, 166], [cx + 10, 176], [cx, 160], [cx - 12, 178], [cx - 30, 164]], K.LG(cx - 30, 0, cx + 30, 0, [[0, "#0a0a12"], [0.5, "#3e3a46"], [1, "#1e1e2a"]]));
      for (let i = 0; i < 6; i++) K.drip(cx - 26 + i * 10, 166 + (i % 2) * 6, 4 + K.rng() * 8, 1.6, "#1e1e2a");
      K.S([[cx - 20, 90 + b], [cx - 34, 120 + b], [cx - 40, 150 + b]], 6, "#1e1e2a");
      K.S([[cx - 44, 10], [cx - 40, 178]], 3, "#7a4a1a"); K.S([[cx - 44, 10], [cx - 30, 4]], 2, "#d88a2a");   // the lighting pole, a wick at its hook
      K.E(cx - 29, 5, 2.4, 3 * fl, "#ffcc66");
      K.S([[cx + 20, 90 + b], [cx + 30, 120 + b], [cx + 26, 140 + b]], 6, "#1e1e2a");
      K.P([[cx - 14, 40 + b], [cx + 14, 40 + b], [cx + 16, 80 + b], [cx - 16, 80 + b]], "#3a2410");   // the lantern head
      K.R(cx - 11, 46 + b, 22, 28, K.RG(cx, 60 + b, 1, 16, [[0, "#fff4d0"], [0.4, "#ffcc66"], [1, "#d88a2a"]]));
      for (const x of [cx - 4, cx + 4]) K.S([[x, 44 + b], [x, 76 + b]], 1.4, "#3a2410");
      K.P([[cx - 18, 40 + b], [cx, 26 + b], [cx + 18, 40 + b]], "#3a2410"); K.E(cx, 24 + b, 3, 3, "#3a2410");
      K.E(cx - 5, 58 + b, 2.6, 3.4, "#140c06"); K.E(cx + 5, 58 + b, 2.6, 3.4, "#140c06");   // a face in the flame
    } },
    tallyman: { w: 40, h: 70, ramps: ["ink", "paper", "corpse", "cloth", "gold", "leather"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.5, cx = 60;
      // a Guild clerk who never left his desk: sleeve-guards, an abacus grown into his arms, ink for blood
      for (const s of [-1, 1]) { K.S([[cx + s * 10, 150], [cx + s * 11, 198]], 8, "#2a2a36"); K.E(cx + s * 12, 202, 8, 4, "#140c06"); }
      K.P([[cx - 22, 70 + b], [cx + 22, 70 + b], [cx + 28, 160], [cx - 28, 160]], K.LG(cx - 28, 0, cx + 28, 0, [[0, "#1e1a24"], [0.5, "#3a3442"], [1, "#16121c"]]));
      K.P([[cx - 8, 72 + b], [cx + 8, 72 + b], [cx + 4, 120 + b], [cx - 4, 120 + b]], "#ddd4b0");
      for (const s of [-1, 1]) { K.S([[cx + s * 22, 78 + b], [cx + s * 30, 110 + b]], 8, "#3a3442"); K.R(cx + s * 30 - 6, 104 + b, 12, 12, "#ddd4b0"); }   // sleeve-guards
      K.R(cx - 36, 116 + b, 72, 30, "#5a3c0e"); K.R(cx - 33, 119 + b, 66, 24, "#2e1e06");   // the abacus held across him
      for (let r = 0; r < 4; r++) { K.S([[cx - 33, 123 + r * 6 + b], [cx + 33, 123 + r * 6 + b]], 1, "#b08a28"); for (let k = 0; k < 6; k++) K.E(cx - 26 + ((k * 11 + r * 7 + Math.floor(ph * 8)) % 52), 123 + r * 6 + b, 2.6, 2.4, k % 2 ? "#ddd4b0" : "#9a1224"); }
      K.vol(cx, 52 + b, 13, 16, ["#b8c0a8", "#7e8a74", "#2e3a2a"]);   // grey-green, long dead
      K.E(cx - 5, 50 + b, 4, 3, "#ddd4b0"); K.E(cx + 5, 50 + b, 4, 3, "#ddd4b0"); K.S([[cx - 9, 50 + b], [cx + 9, 50 + b]], 1, "#b08a28");   // spectacles
      K.E(cx - 5, 50 + b, 1.4, 1.4, "#07060c"); K.E(cx + 5, 50 + b, 1.4, 1.4, "#07060c");
      K.drip(cx - 2, 60 + b, 14, 1.4, "#07060c"); K.drip(cx + 3, 60 + b, 9, 1.2, "#07060c");   // ink from the mouth
      K.P([[cx - 14, 40 + b], [cx - 10, 32 + b], [cx + 10, 32 + b], [cx + 14, 40 + b]], "#3a3442");
    } },
    drainspider: { w: 56, h: 40, ramps: ["ink", "gold", "rust", "ice", "glowy"], paint(K, ph) {
      const w = Math.sin(ph * Math.PI * 2), cx = 84;
      // a spider of pipe and valve, built to crawl the drains and clear them; it clears anything
      for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const a = (i - 1.5) * 0.4, k = w * (i % 2 ? 1 : -1) * 4, x0 = cx + s * 14, y0 = 64 + i * 4;
        K.S([[x0, y0], [x0 + s * (34 + i * 4), 34 + i * 6 + k], [x0 + s * (52 + i * 6), 112 + k * 0.5]], 5, "#5a3c0e"); K.S([[x0, y0], [x0 + s * (34 + i * 4), 34 + i * 6 + k]], 1.6, "#d8b440"); K.E(x0 + s * (34 + i * 4), 34 + i * 6 + k, 3.6, 3.6, "#86621a"); }
      K.vol(cx, 70, 26, 20, ["#f6e07a", "#b08a28", "#2e1e06"]); K.vol(cx, 92, 18, 14, ["#d8b440", "#86621a", "#2e1e06"]);
      K.E(cx, 70, 10, 10, "#2e1e06"); for (let k = 0; k < 4; k++) { const a = ph * Math.PI * 2 + k * Math.PI / 2; K.S([[cx, 70], [cx + Math.cos(a) * 9, 70 + Math.sin(a) * 9]], 2, "#d8b440"); }   // the valve wheel on its back
      for (let i = 0; i < 6; i++) K.eye(cx - 12 + (i % 3) * 12, 52 + Math.floor(i / 3) * 6, 2.2, "#3ee0e8", null);
      for (let i = 0; i < 5; i++) K.drip(cx - 14 + i * 7, 100, 6 + K.rng() * 10, 1.4, "#6aa0c8");
    } },
    blindfish: { w: 60, h: 40, ramps: ["ink", "pale", "corpse", "blood", "bone"], paint(K, ph) {
      const w = Math.sin(ph * Math.PI * 2), cx = 90;
      // a cave fish grown huge in the dark: no eyes, pale as dough, and it walks on its fins
      K.E(cx, 112, 70, 7, "rgba(7,6,12,0.45)");
      for (const [x, d] of [[60, 1], [76, -1], [108, 1], [124, -1]]) { const sw = w * d * 5; K.P([[x, 84], [x + sw - 8, 112], [x + sw + 10, 112]], "#c8b8b0"); }
      K.vol(cx, 70, 66, 28, ["#f4ece8", "#c8b8b0", "#6a5a58"]);
      for (let i = 0; i < 12; i++) K.S([[cx - 50 + i * 9, 54], [cx - 46 + i * 9, 84]], 1, "rgba(106,90,88,0.4)");   // the ghost of scales
      K.P([[cx - 62, 70], [cx - 92, 46 + w * 6], [cx - 86, 70], [cx - 92, 96 - w * 6]], "#c8b8b0");   // the tail
      for (let i = 0; i < 6; i++) K.P([[cx - 30 + i * 12, 46], [cx - 26 + i * 12, 30 - (i % 2) * 6], [cx - 22 + i * 12, 46]], "#e8dcd8");
      K.E(cx + 58, 74, 14, 11, "#4a1a1e"); K.teeth(cx + 48, 66, 6, 3, 7, "#f4ece8"); K.teeth(cx + 48, 82, 6, 3, -6, "#f4ece8");
      K.E(cx + 44, 60, 4, 3, "#e0d4d0"); K.S([[cx + 41, 60], [cx + 47, 60]], 1, "#a89894");   // where an eye would be, skinned over
      for (let i = 0; i < 5; i++) K.Q([[cx + 60, 64], [cx + 70 + i * 4, 40 + i * 4], [cx + 76 + i * 5, 50 + i * 6]], 1, "#c8b8b0");   // feelers
    } },
  });
  Object.assign(MONSTERS, {
    lampwight: { name: "Lampwight", hp: 74, atk: 22, def: 4, spd: 12, xp: 60, coin: [6, 10], sprite: "lampwight",
      moves: [{ name: "Wick Burn", w: 3, power: 1.0, bleed: [4, 2] }, { name: "Gutter", w: 2, weakAll: 2 }, { name: "Last Light", w: 1, charge: true, power: 1.5, all: true }] },
    tallyman: { name: "Tallyman", hp: 98, atk: 21, def: 11, spd: 6, xp: 64, coin: [12, 18], sprite: "tallyman",
      moves: [{ name: "Strike Off", w: 3, power: 1.15 }, { name: "Audit", w: 2, power: 0.6, weakOne: 2 }, { name: "Balance the Books", w: 1, guard: true, heal: 16 }] },
    drainspider: { name: "Drain Spider", hp: 70, atk: 23, def: 7, spd: 16, xp: 60, coin: [6, 11], sprite: "drainspider",
      moves: [{ name: "Valve Bite", w: 3, power: 1.0, bleed: [3, 2] }, { name: "Pipe Web", w: 2, power: 0.7, stunChance: 0.3 }, { name: "Flush", w: 1, power: 0.75, all: true }] },
    blindfish: { name: "Blind Fish", hp: 112, atk: 22, def: 7, spd: 5, xp: 66, coin: [7, 12], sprite: "blindfish",
      moves: [{ name: "Gulp", w: 3, power: 1.4 }, { name: "Thrash", w: 2, power: 0.75, all: true }, { name: "Slick", w: 1, guard: true, heal: 18 }] },
    vane: { name: "Proprietor Vane", hp: 820, atk: 21, def: 10, spd: 9, xp: 560, coin: [260, 260], sprite: "vane", boss: true, music: "boss", tall: true,
      moves: [{ name: "Foreclose", w: 3, power: 1.3, weakOne: 2 }, { name: "Dividend", w: 3, power: 0.85, all: true }, { name: "Compound Interest", w: 2, weakAll: 2, heal: 26 },
        { name: "The Final Reckoning", w: 0, charge: true, power: 1.9, all: true },
        { name: "Call the Tallymen", w: 0, summonKind: "tallyman", summonText: "Vane rings a little brass bell. Two clerks rise from the ledger tables, still holding their pens." }] },
  });
  Object.assign(BESTIARY, {
    lampwight: "The cistern's lamplighters, still at their rounds. Their flame burns what it touches and their last light goes out all at once; break it before it does.",
    tallyman: "Guild clerks who were told to stay at their desks until the books balanced. The books never balanced.",
    drainspider: "Built to crawl the Guild's drains and clear them. It does not know the difference between a blockage and a person.",
    blindfish: "Fish that came down with the first river, three generations back, and grew huge and blind in the dark. Slow, heavy, hungry.",
    vane: "Proprietor of the old Guild's last account. She paid for the weir and bought the river's cups from Merrow, and poured them into tanks nobody can reach but her.",
  });
  FIELD.push(
    { id: "c1", x: 100, y: 248, group: ["lampwight", "lampwight"], minStage: 10 }, { id: "c2", x: 80, y: 262, group: ["blindfish", "drainspider"], minStage: 10 },
    { id: "c3", x: 132, y: 270, group: ["drainspider", "drainspider", "lampwight"], minStage: 10 }, { id: "c4", x: 74, y: 276, group: ["tallyman", "lampwight"], minStage: 10 },
    { id: "c5", x: 140, y: 262, group: ["tallyman", "tallyman", "drainspider"], minStage: 10, elite: true }, { id: "c6", x: 116, y: 276, group: ["blindfish", "blindfish"], minStage: 10 },
    { id: "c7", x: 144, y: 256, group: ["blindfish", "lampwight", "drainspider"], minStage: 10, elite: true },
  );
  LORE.push(
    { id: 29, x: 112, y: 247, title: "The Guild's Seal, Under Water", text: "Carved over the fall, where the river comes in: \"HERE IS KEPT THE VALLEY'S WATER, AGAINST THE DAY OF NEED.\" Somebody has carved, much smaller, underneath: \"WHOSE NEED?\"" },
    { id: 30, x: 30, y: 262, title: "Ivo's Lamp Book", text: "A book of lamps lit and lamps out, forty years of them in one careful hand. The last page: \"Today the river came back. I lit every lamp in the nave so it could see where it was going.\"" },
    { id: 31, x: 146, y: 254, title: "A Surveyor's Sum", text: "Chalk on a tank: \"Capacity: one winter of the Rime. Paid for at one cup per head per day at the Lowwater gate: 41 years. Proprietor's note: acceptable.\"" },
  );
  RELICS.abacus = { name: "Vane's Abacus", from: "vane", desc: "The Proprietor's counting frame. +10% critical chance, +2 defence, +1 SP each turn.", crit: 0.1, def: 2, spRegen: 1 };
  // ---- the people under the Dry Sea
  const CIS_LOOK = {
    ivo: { robe: "#3a2410", hair: "#d8d4c8", skin: "#a87a5a", style: { hair: "bald", eye: "#3a2a1a" } },
    noor: { robe: "#2a3a4a", hair: "#1a1a1a", skin: "#8a5a3a", style: { hair: "veil", dress: true, eye: "#2a2a1a" } },
    marta: { robe: "#5a5662", hair: "#8a4a2a", skin: "#e0a878", style: { hair: "tail", eye: "#3a4a5a" } },
    wick: { robe: "#7a4a1a", hair: "#3a2a1a", skin: "#c98d63", style: { hair: "fringe", eye: "#3a2a1a" } },
  };
  npc2({ id: "ivo", name: "Old Ivo", x: 24, y: 253, look: CIS_LOOK.ivo, show: cisOpen });
  npc2({ id: "noor", name: "Sister Noor", x: 14, y: 256, look: CIS_LOOK.noor, show: cisOpen });
  npc2({ id: "wick", name: "Wick", x: 33, y: 259, look: CIS_LOOK.wick, show: cisOpen });
  npc2({ id: "marta", name: "Marta Fenn, Surveyor", x: 151, y: 248, look: CIS_LOOK.marta, show: cisOpen });
  for (const id of ["ivo", "noor", "wick", "marta"]) SPEAKERS[id] = NPCS.find(n => n.id === id).name;
  SPEAKERS.vane = "Proprietor Vane";
  Object.assign(ACTS, {
    ivo: { draw: (P, t) => { P(9, -26, 2, 26, "#7a4a1a"); const f = Math.sin(t * 8) > 0 ? "#ffcc66" : "#d88a2a"; P(10, -29, 3, 3, f); } },
    noor: { draw: (P, t) => { P(8, -12, 6, 7, "#ddd4b0"); P(9, -11, 4, 1, "#2a3a4a"); } },
    wick: { pace: 12, draw: (P, t) => { P(7, -14, 4, 5, "#3a2410"); P(8, -13, 2, 3, Math.sin(t * 9) > 0 ? "#ffcc66" : "#fff4d0"); } },
    marta: { draw: (P, t) => { P(-11, -12, 8, 10, "#ddd4b0"); P(-10, -10, 6, 1, "#5a5662"); P(-10, -7, 6, 1, "#5a5662"); } },
  });
  Object.assign(D, {
    cis_arrive: say(null, "The rungs end on wet stone. You are standing in a hall the size of Kessa, under the Dry Sea, with the river falling past you out of the dark and running away south in a canal cut straight as a rule. Columns go back further than the light. Somewhere to the west, someone is singing to themselves, and a lamp comes on.", null, () => { cf().cisArrived = true; save(); }),
    ivo_0: { who: "ivo", text: "(An old man on a ladder, lighting a lamp with a long pole.) Mind the canal, it's deeper than it looks. ...You came down the sinkhole. Nobody comes down the sinkhole. I'm Ivo. I light the lamps. I've lit them for forty years for nobody, and this spring the river came back, so now I light them for the river.", choices: [
      { t: "\"Who built all this?\"", go: "ivo_1" }, { t: "\"Another time.\"", go: null }] },
    ivo_1: say("ivo", "The Guild. The first one, before your grandmother's grandmother. They cut it to keep the valley's water against the day of need, and the day of need was every day the price went up. When the Guild fell they forgot us down here: me, and the clerks at their desks, and the tanks.", "ivo_2"),
    ivo_2: say("ivo", "Not everybody forgot. There's a woman in the ledger vault who says the cistern's account was never closed, so it's still open, so it's hers. Proprietor Vane. She paid for that wall upstream. Every cup Merrow sold at the Lowwater gate, she bought, and poured into her tanks.", "ivo_3"),
    ivo_3: { who: "ivo", text: "Forty-one years, the surveyor worked out, to fill them. She says that's acceptable. Courier, the vault's shut with a counting-house lock and only the surveyor has the tally key. Will you go and talk to her? Marta, in the tank hall, east.", choices: [
      { t: "\"I'll find her.\"", go: "ivo_yes" }, { t: "\"Why not just let the tanks fill? It's water kept for drought.\"", go: "ivo_keep" }] },
    ivo_keep: say("ivo", "Kept for whose drought? A store is a fine thing with a door anybody can open. This one has a door with a price on it. Go and see the surveyor's sums, and then tell me it's for drought.", "ivo_yes"),
    ivo_yes: say("ivo", "Take Wick's lamp, it's better than mine. And go round by the nave; the fish don't like the light.", null, () => { cf().cisQuest = true; save(); toast("Old Ivo asks you to find Marta Fenn, the surveyor, in the tank hall to the east. She holds the tally key to the ledger vault."); }),
    ivo_wait: say("ivo", "East, through the nave, past the canal. The surveyor sits on top of a tank doing sums. You'll hear the chalk before you see her."),
    ivo_after: say("ivo", "", null),
    noor_0: { who: "noor", text: "(A woman in a grey veil, with a basket of bottles that clink.) Ivo keeps the lamps, I keep the people. There are four of us down here now and I keep all of us. Salves, tonics, salts. And the alcove's warm, if you want to rest.", choices: [
      { t: "Salve (heal 22): 6 coin", go: "noor_0", act: () => buy("salve"), req: () => G.coins >= 6, reqText: "6 coin" },
      { t: "Bitter Tonic: 5 coin", go: "noor_0", act: () => buy("tonic"), req: () => G.coins >= 5, reqText: "5 coin" },
      { t: "Smelling Salts: 10 coin", go: "noor_0", act: () => buy("salts"), req: () => G.coins >= 10, reqText: "10 coin" },
      { t: "Rest in the alcove", go: "noor_rest" }, { t: "That's all", go: null }] },
    noor_rest: say(null, "You sleep in the alcove under one of Ivo's lamps. When you wake, Sister Noor has re-bound everybody's wounds. Everyone is fully healed, and your progress is saved.", null, () => restParty()),
    wick_0: say("wick", "I light the little lamps and Grandad lights the big ones. When I'm big I'll light the big ones and somebody little can light the little ones. ...There isn't anybody little. There's just me. Grandad says the river might bring somebody."),
    wick_after: say("wick", "", null),
    marta_0: say("marta", "(A woman sitting on top of a brass tank, chalking sums on its side.) If you're from the Company, the numbers are on the tank. If you're not from the Company, you shouldn't be down here, and neither should I."),
    marta_q: { who: "marta", text: "Ivo sent you. (She rubs out a sum with her sleeve.) I measured this place for the Company. Every tank, every channel. The Proprietor asked me how long, and I told her, and she said 'acceptable'. I've been sitting on this tank since, doing the sum again in case I was wrong. I wasn't.", choices: [
      { t: "\"Forty-one years of Lowwater's cups. You can stop it.\"", go: "marta_stop" },
      { t: "\"The saint let the water go so nobody would own it.\"", go: "marta_saint" }] },
    marta_stop: say("marta", "I can open a door. That's all a surveyor can do. ...It's enough, isn't it? It's always been enough. That's why they pay us so carefully.", "marta_open"),
    marta_saint: say("marta", "I heard. I measured the meltwater coming down the Rime stair, the day it came. It was the most water I've ever measured and I sat down in it and cried and then I wrote down the number. That's the kind of person I've been.", "marta_open"),
    marta_open: say("marta", "(She takes a brass rod notched like a ruler from round her neck.) The tally key. The vault's south-west, down the corridor past the canal. She'll have the clerks with her. They don't stop until the books balance. Make them balance.", null, () => { cf().cisGate = true; applyWorldState(); miniDirty = true; save(); toast("Marta gives you the tally key. The ledger vault is to the south-west, past the canal."); }),
    marta_wait: say("marta", "South-west, past the canal. I'll be here, doing a new sum. I don't know what it's of yet."),
    marta_after: say("marta", "", null),
    vane_0: say("vane", "(The vault is lined with ledgers to the ceiling. At a long table, under one lamp, a woman in a Guild officer's coat with all the braid unpicked is writing. She does not look up.) Courier. You're the Bell girl. The one who ended the Guild. Sit down; I've been meaning to open an account in your name.", "vane_1"),
    vane_1: { who: "vane", text: "You think I'm Merrow. Merrow wanted a wall. I don't want anything. I keep the account. The water came into the valley and someone has to write down where it went. That someone owns it. That is all ownership has ever been.", choices: [
      { t: "\"The saint let it go. It isn't an account. It's a gift.\"", go: "vane_2" },
      { t: "\"Then I'll close the account.\"", go: "vane_2b" }] },
    vane_2: say("vane", "A gift is an account nobody bothered to write down. I am bothering. In forty-one years these tanks will hold the whole of the Rime and the valley will need it, and they will come to this table and ask, and I will be kind. I will set a fair price.", "vane_3"),
    vane_2b: say("vane", "Closed accounts are the most valuable kind. They can't be argued with.", "vane_3"),
    vane_3: say("vane", "(She closes the ledger and stands. The clerks at the other tables stand with her, very slowly, pens still in their hands.) You've already spent a great deal getting here, courier. Let's see what you have left.", null, () => startBattle(["vane"], { boss: "vane", area: "vault" })),
    vane_after: { who: "vane", text: "(She is sitting on the floor among her ledgers, a pen still in her hand. The clerks have sat down too, and are, for the first time in a long time, not writing.) Well. The account is yours, then. It always passes to whoever is left standing. What will you write in it?", choices: [
      { t: "Open the tanks. Let the river run on under the Dry Sea and come up where it likes.", go: "vane_open" },
      { t: "Keep the cistern for drought, held in trust by Kelda, Lowwater and Tamar's Rest, with the ledgers open to anyone.", go: "vane_trust" }] },
    vane_open: say("vane", "(You turn the valves, one after another down the tank hall, and the brass sings. The water goes out of the tanks into the canal and away south into the dark, under the Dry Sea.) ...It'll come up somewhere. Springs, in the salt. Nobody will know whose they are. (She laughs, once.) Nobody will be able to find out.", null, () => cisDone("open")),
    vane_trust: say("vane", "(You take the pen out of her hand and write on the first clean page: HELD FOR THE VALLEY. OPEN TO ANYONE. Then three names: Kelda, Lowwater, Tamar's Rest.) Three villages arguing over one store. ...They'll keep it better than I would have. I'd have kept it perfectly.", null, () => cisDone("trust")),
  });
  function cisDone(choice) {
    cf().cisChoice = choice; cf().cisDone = true; applyWorldState(); miniDirty = true; save(); updateHud();
    const rime = cf().rimeChoice === "keep" ? "Kelda keeps a block of the old winter to give" : "the Rime's water ran down to the Dry Sea", weir = cf().weirChoice === "commons" ? "Lowwater keeps the wheel" : "the weir is a ruin with willows on it";
    setTimeout(() => card("Act III · The Cistern", choice === "open" ? "Springs in the Salt" : "Held for the Valley",
      choice === "open" ? "The tanks empty into the dark. By midsummer there are springs in the Dry Sea that were never there before, small and cold, and nobody can say whose they are. Tamar's people build a wall round the first one, then think better of it and take it down." :
        "The cistern stays full, and its ledgers stand open on Ivo's table for anyone who comes down the rungs. When the next dry year comes, Kelda, Lowwater and Tamar's Rest meet in the nave and argue for a week, and then open the tanks, a notch at a time."), 600);
    setTimeout(() => card("Act III ends", "The Water Goes Where It Was Given", `The saint let go; ${rime}. ${weir}. And under the Dry Sea, ${choice === "open" ? "the old Guild's water runs free in the dark" : "three villages hold the old Guild's store in trust"}. Ivo still lights the lamps. Wick has somebody little to teach now: one of Tull's grandchildren came down the rungs to see the river, and stayed.`), 900);
  }
  D.ivo_after.text = "I lit every lamp in the nave again tonight. Not for the river this time. For the people coming down to look at it. We get visitors now. I've had to learn their names.";
  D.wick_after.text = "There's somebody little now! She came down from Lowwater to see the river. I'm teaching her the little lamps. She's bad at it. I was bad at it.";
  D.marta_after.text = "I did a new sum. How many people one cistern can keep alive through a dry year, if nobody charges for it. It's a big number. I'm going to carve it over the door.";
  const _dialogForCis = dialogFor;
  dialogFor = function (n) {
    if (n.id === "ivo") return cf().cisDone ? "ivo_after" : cf().cisQuest ? "ivo_wait" : "ivo_0";
    if (n.id === "noor") return "noor_0";
    if (n.id === "wick") return cf().cisDone ? "wick_after" : "wick_0";
    if (n.id === "marta") return cf().cisDone ? "marta_after" : cf().cisGate ? "marta_wait" : cf().cisQuest ? "marta_q" : "marta_0";
    return _dialogForCis(n);
  };
  const _interactCis = interact;
  interact = function () {
    const Th = CIS.throne;
    if (cisOpen() && mode === "play" && near({ x: Th.x * TILE + 8, y: Th.y * TILE + 8 }, 44) && !cf().vaneDead) { openDialog("vane_0"); return true; }
    if (cisOpen() && mode === "play" && !cf().cisGate && near({ x: CIS.door[0] * TILE + 8, y: CIS.door[1] * TILE + 8 }, 26)) { D.__cisdoor = say(null, "A counting-house door of black wood bound in brass, with a lock shaped like a ruler's slot. Behind it, the scratch of many pens. (The surveyor in the tank hall may have the key.)"); openDialog("__cisdoor"); return true; }
    return _interactCis();
  };
  const _addProp2Cis = addProp2;
  addProp2 = () => {
    _addProp2Cis();
    addProp("sign", 103, 246, { text: "A Guild plate, green with age: CISTERN OF THE VALLEY. AUTHORISED PERSONS ONLY. Scratched into the verdigris: WHO AUTHORISED THEM?" });
    for (const [x, y] of [[96, 247], [124, 247], [66, 256], [90, 256], [130, 256], [66, 276], [90, 276], [130, 276]]) addProp("lamp", x, y);
    addProp("campfire", 24, 257); addProp("barrel", 12, 252); addProp("crate", 36, 252); addProp("candles", 20, 260);
    addProp("chains", 146, 250); addProp("crate", 160, 262); addProp("lamp", 152, 258);
    addProp("statue", CIS.throne.x, CIS.throne.y + 3); for (const [x, y] of [[26, 274], [42, 274], [26, 282], [42, 282]]) addProp("candles", x, y);
  };
  const _updateCis = update;
  let cisTick = 0;
  update = function (dt) {
    _updateCis(dt);
    if (!G || mode !== "play" || (cisTick -= dt) > 0) return; cisTick = 1;
    const ty = Math.floor(G.py / TILE);
    if (cisOpen() && ty >= CIS.y0 && !cf().cisArrived) openDialog("cis_arrive");
    else if (cisOpen() && !cf().cisHint && regionOf(Math.floor(G.px / TILE), ty) === "weir") { cf().cisHint = true; toast("Pip says the river goes down a hole at the far end of the bed, and that a light comes on down there at night. Gran Tull says it doesn't. Pip says it does."); }
  };
  const _bossEndCis = act2BossEndB;
  act2BossEndB = function (boss) { _bossEndCis(boss); if (boss === "vane") { cf().vaneDead = true; save(); setTimeout(() => openDialog("vane_after"), 300); } };
  // her second form: the ledgers rise round her and the account opens like a mouth
  PHASE2.vane = ["Every page. EVERY name. All of it mine!", "#f6e07a"];
  P2NAME.vane = "Vane, the Open Account";
  const vaneBody = (K, ph, open) => {
    const b = Math.sin(ph * Math.PI * 2) * 2, W2 = 288, cx = W2 / 2;
    K.E(cx, 344, 120, 10, "rgba(7,6,12,0.4)");
    K.E(cx, 170, 130, 150, K.RG(cx, 160, 10, 150, [[0, open ? "rgba(246,224,122,0.35)" : "rgba(246,224,122,0.15)"], [1, "rgba(246,224,122,0)"]]));
    // ledgers: stacked behind her, and in her second form flying round her, open, pages turning
    if (open) for (let i = 0; i < 10; i++) { const a = ph * Math.PI * 2 + i * Math.PI / 5, x = cx + Math.cos(a) * 110, y = 160 + Math.sin(a) * 70;
      K.P([[x - 16, y - 10], [x, y - 4], [x + 16, y - 10], [x + 16, y + 10], [x, y + 16], [x - 16, y + 10]], "#ddd4b0"); K.S([[x, y - 4], [x, y + 16]], 1.4, "#5a1a12");
      for (let l = 0; l < 3; l++) { K.S([[x - 13, y - 4 + l * 5], [x - 3, y - 1 + l * 5]], 0.8, "#6a6250"); K.S([[x + 3, y - 1 + l * 5], [x + 13, y - 4 + l * 5]], 0.8, "#6a6250"); } }
    else for (let s = 0; s < 4; s++) for (let i = 0; i < 9; i++) K.R(cx - 120 + i * 27, 80 + s * 52, 22, 46, ["#5a1a12", "#2a3a1a", "#3a2a4a", "#6a4a1a"][(i + s) % 4]);
    // the officer's coat with the braid unpicked: you can see where it was
    for (const s of [-1, 1]) { K.S([[cx + s * 14, 266 + b], [cx + s * 16, 330]], 12, "#1e1a24"); K.E(cx + s * 17, 334, 11, 5, "#0e0a10"); }
    K.P([[cx - 38, 150 + b], [cx + 38, 150 + b], [cx + 58, 310], [cx - 58, 310]], K.LG(cx - 58, 0, cx + 58, 0, [[0, "#14141e"], [0.4, "#2e2e42"], [1, "#0e0e16"]]));
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) K.S([[cx + s * 10, 162 + i * 18 + b], [cx + s * 18, 166 + i * 18 + b]], 1.2, "rgba(216,180,64,0.35)");   // needle holes where the braid was
    K.vol(cx, 172 + b, 30, 18, ["#3a3a52", "#2e2e42", "#0e0e16"]);
    if (open) {   // arms flung out, pen in one hand, the ledger open in the other
      K.S([[cx - 32, 172 + b], [cx - 80, 140 + b], [cx - 110, 104 + b]], 10, "#2e2e42"); K.vol(cx - 112, 100 + b, 8, 8, ["#f4e4d4", "#c8a890", "#4a2a26"]);
      K.S([[cx - 112, 100 + b], [cx - 126, 74 + b]], 3, "#07060c");
      K.S([[cx + 32, 172 + b], [cx + 80, 140 + b], [cx + 104, 116 + b]], 10, "#2e2e42");
      K.P([[cx + 84, 100 + b], [cx + 108, 112 + b], [cx + 132, 100 + b], [cx + 132, 136 + b], [cx + 108, 148 + b], [cx + 84, 136 + b]], "#f4eed6"); K.S([[cx + 108, 112 + b], [cx + 108, 148 + b]], 2, "#5a1a12");
    } else {
      K.S([[cx - 32, 172 + b], [cx - 44, 216 + b], [cx - 16, 236 + b]], 10, "#2e2e42"); K.S([[cx + 32, 172 + b], [cx + 44, 216 + b], [cx + 16, 236 + b]], 10, "#2e2e42");
      K.P([[cx - 22, 226 + b], [cx + 22, 226 + b], [cx + 22, 256 + b], [cx - 22, 256 + b]], "#5a1a12"); K.P([[cx - 19, 229 + b], [cx + 19, 229 + b], [cx + 19, 253 + b], [cx - 19, 253 + b]], "#ddd4b0");   // a ledger held to her chest
      K.vol(cx - 14, 238 + b, 7, 7, ["#f4e4d4", "#c8a890", "#4a2a26"]); K.vol(cx + 14, 238 + b, 7, 7, ["#f4e4d4", "#c8a890", "#4a2a26"]);
    }
    // the face: pale, exact, grey hair pinned flat; in the second form, ink running from the eyes like tally marks
    K.vol(cx, 128 + b, 21, 26, ["#f4e4d4", "#c8a890", "#4a2a26"]);
    K.P([[cx - 22, 120 + b], [cx - 20, 100 + b], [cx, 94 + b], [cx + 20, 100 + b], [cx + 22, 120 + b], [cx + 14, 108 + b], [cx - 14, 108 + b]], "#8a8494");
    for (const s of [-1, 1]) { K.E(cx + s * 8, 126 + b, 4, open ? 4 : 2, open ? "#f6e07a" : "#2a2a36"); if (open) for (let k = 0; k < 4; k++) K.S([[cx + s * (6 + k * 2), 132 + b], [cx + s * (6 + k * 2), 146 + b + k * 3]], 1.2, "#07060c"); }
    K.S([[cx - 7, 144 + b], [cx + 7, 144 + b]], 1.8, "#7a4a46");
    K.E(cx + 18, 132 + b, 4, 4, "#f6e07a"); K.S([[cx + 18, 136 + b], [cx + 18, 150 + b]], 0.8, "#b08a28");   // a monocle on a chain
  };
  BOSS_ART.vane = { w: 96, h: 118, ramps: ["ink", "gold", "paper", "flesh", "night", "cloth", "blood"], paint(K, ph) { vaneBody(K, ph, false); } };
  P2ART.vane = { w: 96, h: 118, ramps: ["ink", "gold", "paper", "flesh", "night", "cloth", "blood"], paint(K, ph) { vaneBody(K, ph, true); } };
  // the journal, the Chronicle and the endings remember the cistern
  const _renderJournalCis = renderJournal;
  renderJournal = function () {
    _renderJournalCis();
    if (!cisOpen() || !(cf().cisArrived || cf().cisQuest)) return;
    const h = [...$("journalBody").querySelectorAll("h3")].find(x => x.textContent === "Side quests"), ul = h && h.nextElementSibling; if (!ul) return;
    const done = !!cf().cisDone, t = done ? `Act III, the Cistern: ${cf().cisChoice === "open" ? "the tanks are open and the water runs on under the Dry Sea" : "the cistern is held in trust for the valley, its ledgers open"}.` :
      cf().cisGate ? "Act III, the Cistern: Marta gave you the tally key. Find Proprietor Vane in the ledger vault, south-west past the canal." :
        cf().cisQuest ? "Act III, the Cistern: find Marta Fenn, the surveyor, in the tank hall east of the nave. She holds the key to the ledger vault." : "Act III, the Cistern: find out where the river goes under the Dry Sea.";
    ul.querySelector("li.dim") && ul.querySelector("li.dim").remove();
    ul.insertAdjacentHTML("afterbegin", `<li class="${done ? "done" : ""}">${done ? "✓ " : ""}${t}</li>`);
  };
  const _chronicleCis = chronicle;
  chronicle = function () {
    const P = _chronicleCis();
    if (cf().cisDone) P.splice(Math.max(0, P.length - 1), 0, ["The Cistern", cf().cisChoice === "open" ? "Under the Dry Sea, the old Guild's last proprietor had been buying the river a cup at a time and pouring it into tanks only she could open. The courier opened them. There are springs in the salt now, and nobody can say whose they are." : "Under the Dry Sea, the old Guild's last proprietor had been buying the river a cup at a time and pouring it into tanks only she could open. The courier wrote three villages' names in her ledger instead. The cistern is held for the valley now, and anyone may read the books."]);
    return P;
  };
  const _extraFatesCis = extraFates;
  extraFates = function (k) { const out = _extraFatesCis(k); if (cf().cisDone) out.push(cf().cisChoice === "open" ? "Under the Dry Sea the old Guild's tanks stand empty, and there are springs in the salt that nobody owns." : "The cistern under the Dry Sea is held in trust by Kelda, Lowwater and Tamar's Rest. Ivo keeps the ledgers open on his table."); return out; };
  ACHIEVEMENTS.push(["cistern", "Whose Need?", "Settle the cistern under the Dry Sea.", () => G.flags.cisDone], ["act3", "Where It Was Given", "Finish Act III: the Rime, the Weir and the Cistern.", () => G.flags.rimeDone && G.flags.weirDone && G.flags.cisDone]);
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { cistern: () => ({ ...CIS, flags: { arrived: !!cf().cisArrived, quest: !!cf().cisQuest, gate: !!cf().cisGate, done: !!cf().cisDone, choice: cf().cisChoice || null } }) }), 0);
