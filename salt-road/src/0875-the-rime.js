  // ================================================================== ACT III, PART 1: THE RIME (rows 140-189)
  // South of the Dry Sea, under its rim, the salt turns to ice. Four generations ago the village of Kelda froze its
  // rain in the Ice House so that the Guild could never sell it, and Saint Isolde sang the water still and froze with
  // it. Now the Bell rings again and the ice is answering: it will thaw, and if Isolde lets it all go at once the
  // meltwater will tear down the old riverbed and drown the caravan road. Kelda asks the courier to go down to her.
  // Opens with Chapter X, when the three tones wake; the tones are what let Sable sing to her.
  const RIME = { y0: 140, y1: 189, gate: [100, 138], land: [100, 142], house: { x0: 128, y0: 156, x1: 152, y1: 174 }, door: [140, 175], kelda: { x0: 56, y0: 148, x1: 90, y1: 166 } };
  const rimeOpen = () => G.stage >= 10;
  Object.assign(T, { SNOW: 39, ICE: 40, PINE: 41 });
  SOLID.add(T.PINE);
  Object.assign(VARIANTS, { [T.SNOW]: 3, [T.ICE]: 3, [T.PINE]: 2 });
  Object.assign(MINI, { [T.SNOW]: "#eef4fa", [T.ICE]: "#a8d4ec", [T.PINE]: "#5a7a8a" });
  const _tileCanvasRime = tileCanvas;
  tileCanvas = function (t, v) {
    if (t !== T.SNOW && t !== T.ICE && t !== T.PINE) return _tileCanvasRime(t, v);
    const key = t * 10 + v; if (tileCache.has(key)) return tileCache.get(key);
    const c = document.createElement("canvas"); c.width = c.height = TILE;
    const g = c.getContext("2d"), px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); }, r = i => hash(t * 97 + v * 13 + i, i * 7 + v);
    if (t === T.SNOW) {   // packed snow over salt: blue-white, a few sparkles and footprints of the wind
      px(0, 0, 16, 16, "#e8eef6"); for (let i = 0; i < 6; i++) px(Math.floor(r(i) * 16), Math.floor(r(i + 9) * 16), 1, 1, "#cdd8e6");
      if (v === 1) { px(3, 9, 5, 1, "#d4dfeb"); px(9, 5, 4, 1, "#d4dfeb"); }
      if (v === 2) { px(6, 4, 1, 1, "#ffffff"); px(11, 11, 1, 1, "#ffffff"); px(2, 13, 1, 1, "#ffffff"); }
    } else if (t === T.ICE) {   // the frozen lake: pale blue, glassy streaks and hairline cracks
      px(0, 0, 16, 16, "#a8d4ec"); px(0, 0, 16, 1, "#c8e6f6");
      g.fillStyle = "#d8f0fc"; g.fillRect(2 + v * 3, 3, 6, 1); g.fillRect(8 - v, 10, 5, 1);
      if (v !== 1) { g.strokeStyle = "#7eb4d4"; g.lineWidth = 1; g.beginPath(); g.moveTo(1, 14); g.lineTo(5, 9); g.lineTo(9, 10); g.lineTo(14, 6); g.stroke(); }
    } else {   // a pine killed by the frost, rimed white
      px(0, 0, 16, 16, "#e8eef6"); px(7, 9, 2, 7, "#4a3a2e");
      g.fillStyle = "#3e5a66"; g.beginPath(); g.moveTo(8, 0); g.lineTo(14, 11); g.lineTo(2, 11); g.fill();
      g.fillStyle = "#e8f4fa"; for (const [x, y, w] of [[6, 3, 4], [4, 6, 3], [9, 7, 3], [3, 10, 4], [9, 10, 4]]) g.fillRect(x, y, w, 1);
      if (v) px(5, 5, 1, 1, "#ffffff");
    }
    tileCache.set(key, c); return c;
  };
  // ---- the land: snow, the frozen lake with the Ice House in it, Kelda, the cutters' quarry, dead pines
  const rimeRnd = (a, b) => { let h = Math.imul(a ^ 0x5bd1e995, 0x27d4eb2d) ^ Math.imul(b + 0x165667b1, 0x9e3779b1); h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; return (h >>> 0) / 4294967296; };
  const _buildMapRime = buildMap;
  buildMap = function () {
    _buildMapRime();
    const Y0 = RIME.y0, Y1 = RIME.y1;
    rect(0, Y0, W - 1, Y1, T.CLIFF);
    for (let y = Y0 + 1; y < Y1; y++) for (let x = 1; x < W - 1; x++) set(x, y, T.SNOW);
    for (let y = 148; y <= 182; y++) for (let x = 112; x <= 166; x++) { const dx = (x - 140) / 27, dy = (y - 165) / 17; if (dx * dx + dy * dy < 1 + (rimeRnd(x, y) - 0.5) * 0.12) set(x, y, T.ICE); }   // the lake
    for (let i = 0; i < 140; i++) {   // dead pines in stands, and rock
      const x = 2 + Math.floor(rimeRnd(i * 13 + 1, 401) * 164), y = Y0 + 2 + Math.floor(rimeRnd(403, i * 7 + 2) * 46);
      if (get(x, y) !== T.SNOW) continue;
      if (x >= RIME.kelda.x0 - 2 && x <= RIME.kelda.x1 + 2 && y >= RIME.kelda.y0 - 2 && y <= RIME.kelda.y1 + 2) continue;
      set(x, y, rimeRnd(i, 409) < 0.75 ? T.PINE : T.ROCK);
    }
    // the cutters' quarry in the south-west: blocks of ice cut square out of the frozen ground
    for (let y = 168; y <= 184; y++) for (let x = 8; x <= 40; x++) if (rimeRnd(Math.floor(x / 3), Math.floor(y / 3) + 50) < 0.42) set(x, y, (x + y) % 5 ? T.ICE : T.CRYSTAL);
    // Kelda: a ring wall against the wind, four houses, the hearth, the old frozen well
    const K = RIME.kelda;
    rect(K.x0, K.y0, K.x1, K.y1, T.SWALL); rect(K.x0 + 1, K.y0 + 1, K.x1 - 1, K.y1 - 1, T.COBBLE);
    for (const y of [156, 157, 158]) { set(K.x0, y, T.COBBLE); set(K.x1, y, T.COBBLE); }
    for (const x of [72, 73, 74]) { set(x, K.y0, T.COBBLE); set(x, K.y1, T.COBBLE); }
    house2(59, 150, 6); house2(79, 150, 7); house2(59, 160, 6); house2(80, 160, 6);
    set(73, 154, T.WELL);
    // the Ice House: a hall of salt-glass walls standing in the lake
    const Hh = RIME.house;
    rect(Hh.x0, Hh.y0, Hh.x1, Hh.y1, T.SWALL); rect(Hh.x0 + 1, Hh.y0 + 1, Hh.x1 - 1, Hh.y1 - 1, T.FLOOR);
    for (let x = Hh.x0 + 3; x < Hh.x1 - 2; x += 4) for (const y of [Hh.y0 + 3, Hh.y1 - 3]) set(x, y, T.CRYSTAL);
    set(RIME.door[0], RIME.door[1] - 1, T.FLOOR); set(RIME.door[0], RIME.door[1], G && G.flags && G.flags.rimeGate ? T.FLOOR : T.GDOOR);
    // roads: from the stair down to Kelda, on to the lake shore, and west to the quarry
    carve([[RIME.land[0], RIME.land[1]], [100, 157], [K.x1, 157]], T.PATH);
    carve([[K.x0, 157], [40, 157], [24, 168]], T.PATH);
    carve([[100, 157], [100, 182], [140, 182], [140, RIME.door[1] + 1]], T.PATH);
    // the way down from the Dry Sea
    carve([[RIME.gate[0], 114], [RIME.gate[0], RIME.gate[1]]], T.PATH);
    fixSpots();
  };
  const _applyWorldRime = applyWorldState;
  applyWorldState = function () {
    _applyWorldRime();
    if (!G) return;
    if (G.flags.fog && G.flags.fog.length < FW * FH) G.flags.fog = G.flags.fog.padEnd(FW * FH, "0");   // older saves knew a smaller world
    set(RIME.door[0], RIME.door[1], G.flags.rimeGate ? T.FLOOR : T.GDOOR);
  };
  WARPS.push({ x: RIME.gate[0], y: RIME.gate[1], to: RIME.land, req: rimeOpen, msg: "A stair cut into the south rim of the old seabed, iced over and humming faintly, like a held note. (Chapter X)" },
    { x: RIME.land[0], y: RIME.land[1] - 1, to: [RIME.gate[0], RIME.gate[1] - 1] });
  const _regionOfRime = regionOf;
  regionOf = function (x, y) { return y >= RIME.y0 ? "rime" : _regionOfRime(x, y); };
  REGION_LINKS.rime = { drysea: [RIME.land[0], RIME.land[1] - 1] }; REGION_LINKS.drysea.rime = RIME.gate;
  REGIONS.unshift({ name: "Kelda", x0: RIME.kelda.x0, y0: RIME.kelda.y0, x1: RIME.kelda.x1, y1: RIME.kelda.y1, music: "village" },
    { name: "The Ice House", x0: RIME.house.x0, y0: RIME.house.y0, x1: RIME.house.x1, y1: RIME.house.y1, music: "cathedral" },
    { name: "The Cutters' Quarry", x0: 6, y0: 166, x1: 42, y1: 186, music: "deep" },
    { name: "The Frozen Lake", x0: 110, y0: 146, x1: 168, y1: 184, music: "coast" },
    { name: "The Rime", x0: 1, y0: 141, x1: 168, y1: 188, music: "flats" });
  MAP_LABELS.push(["Kelda", 73, 146], ["The Ice House", 140, 154], ["Frozen Lake", 158, 184], ["Cutters' Quarry", 24, 186], ["The Rime", 100, 146]);
  const _areaAtRime = areaAt;
  areaAt = function (tx, ty, f) { return ty >= RIME.y0 ? "rime" : _areaAtRime(tx, ty, f); };
  SKIES2.rime = ["#0e1a30", "#7a9abe"]; SKIES2.icehouse = ["#06101e", "#1e3a5a"];
  const _bgRime = drawBattleBg2b;
  drawBattleBg2b = function (g, area) {
    if (area !== "rime" && area !== "icehouse") return _bgRime(g, area);
    const t = time;
    if (area === "rime") {
      g.fillStyle = "#d8e6f2"; g.beginPath(); g.arc(70, 50, 12, 0, Math.PI * 2); g.fill();                                          // a white winter sun
      for (const [base, amp, col, sp] of [[88, 12, "#9ab4cc", 0.025], [100, 9, "#c4d6e6", 0.04]]) {                                  // two rows of snow hills
        g.fillStyle = col; g.beginPath(); g.moveTo(-10, 130); for (let x = -10; x <= VIEW_W + 10; x += 6) g.lineTo(x, base + Math.sin(x * sp + base) * amp); g.lineTo(VIEW_W + 10, 130); g.fill();
      }
      g.fillStyle = "#3e5a66"; for (const [x, h] of [[24, 30], [40, 22], [262, 34], [284, 26], [300, 30]]) { g.beginPath(); g.moveTo(x, 112 - h); g.lineTo(x + 8, 112); g.lineTo(x - 8, 112); g.fill(); }
      g.fillStyle = "#e8eef6"; g.fillRect(-10, 114, VIEW_W + 20, 90);
      g.fillStyle = "#cdd8e6"; for (let i = 0; i < 16; i++) { const x = (i * 41) % (VIEW_W + 20) - 10, y = 122 + (i * 17) % 60; g.fillRect(x, y, 18, 1); }
    } else {
      g.fillStyle = "#0e1e32"; g.fillRect(-10, -10, VIEW_W + 20, 130);
      g.fillStyle = "#a8d4ec"; for (let i = 0; i < 14; i++) { const x = i * 24 + 4, h = 10 + (i * 7) % 18; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 5, h); g.lineTo(x + 10, 0); g.fill(); }   // icicles
      g.fillStyle = "#1e3a5a"; for (let i = 0; i < 5; i++) { const x = 18 + i * 66; g.fillRect(x, 30, 14, 88); g.fillStyle = "#3a6a90"; g.fillRect(x + 2, 30, 3, 88); g.fillStyle = "#1e3a5a"; }
      g.fillStyle = "#a8d4ec"; g.fillRect(-10, 116, VIEW_W + 20, 90); g.fillStyle = "#c8e6f6"; for (let i = 0; i < 10; i++) g.fillRect((i * 53) % VIEW_W, 124 + (i * 11) % 50, 26, 1);
      g.fillStyle = "rgba(200,232,248,.18)"; g.fillRect(-10, 116, VIEW_W + 20, 4);
    }
    if (!REDUCED) { g.fillStyle = "rgba(255,255,255,.75)"; for (let i = 0; i < 40; i++) { const x = (hash(i, 31) * (VIEW_W + 20) + Math.sin(t + i) * 6) % (VIEW_W + 20) - 10, y = (hash(i, 37) * 200 + t * (14 + (i % 4) * 4)) % 200 - 4; g.fillRect(x, y, 1 + (i % 3 === 0), 1 + (i % 3 === 0)); } }   // snow falling
    return true;
  };
  // ---- the cold's own creatures
  RAMP.ice = ["#0e1a2e", "#1e3a5a", "#3a6a90", "#6aa0c8", "#a8d4ec", "#e0f4ff"];
  RAMP.frost = ["#2a2e3a", "#4a5262", "#7a8496", "#b4bccc", "#dce2ec", "#ffffff"];
  Object.assign(REG_ART, {
    rimewolf: { w: 52, h: 40, ramps: ["ink", "frost", "ice", "glowc", "blood"], paint(K, ph) {
      const run = Math.sin(ph * Math.PI * 2), cx = 78;
      for (const [x, d] of [[36, 1], [54, -1], [98, 1], [114, -1]]) { const sw = run * d * 7; K.S([[x, 74], [x + sw * 0.4, 92], [x + sw, 112]], 7, "#4a5262"); K.S([[x, 76], [x + sw * 0.4, 92]], 3, "#b4bccc"); K.E(x + sw, 112, 5, 2, "#2a2e3a"); }
      K.vol(cx, 64, 50, 22, ["#ffffff", "#b4bccc", "#4a5262"]);                                   // a lean body under a ruff of frost
      for (let i = 0; i < 9; i++) K.P([[34 + i * 10, 46], [38 + i * 10, 30 - (i % 2) * 6], [42 + i * 10, 46]], i % 2 ? "#dce2ec" : "#a8d4ec");   // icicle hackles
      K.Q([[28, 56], [10, 46 + run * 4], [2, 30]], 6, "#7a8496"); K.Q([[28, 56], [10, 46 + run * 4], [2, 30]], 2, "#e0f4ff");
      K.vol(126, 46, 20, 15, ["#ffffff", "#b4bccc", "#4a5262"]);                                  // the head, low and long
      K.P([[128, 52], [152, 56], [148, 64], [126, 62]], "#dce2ec"); K.teeth(130, 56, 6, 3, 5, "#ffffff");
      K.P([[112, 34], [116, 16], [122, 32]], "#7a8496"); K.P([[124, 32], [130, 14], [134, 32]], "#7a8496");
      K.eye(124, 42, 3.2, "#3ee0e8"); K.E(140, 68, 6, 3, "rgba(158,240,245,0.5)");                  // cold breath
      for (let i = 0; i < 6; i++) K.R(30 + K.rng() * 100, 20 + K.rng() * 20, 1.6, 1.6, "rgba(224,244,255,0.8)");
    } },
    frostwight: { w: 44, h: 60, ramps: ["ink", "frost", "ice", "cloth", "glowc"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, cx = 66;
      // a hooded shape of rime, no feet: the hem frays into falling snow
      K.P([[cx - 30, 70 + b], [cx + 30, 70 + b], [cx + 46, 150 + b], [cx + 22, 172], [cx + 4, 154 + b], [cx - 16, 176], [cx - 34, 152 + b], [cx - 48, 160]], K.LG(cx - 48, 0, cx + 48, 0, [[0, "#4a5262"], [0.5, "#dce2ec"], [1, "#7a8496"]]));
      for (let i = 0; i < 5; i++) K.S([[cx - 20 + i * 10, 84 + b], [cx - 34 + i * 18, 160 + b]], 1.2, "rgba(58,106,144,0.5)");
      K.P([[cx - 32, 76 + b], [cx - 22, 26 + b], [cx, 14 + b], [cx + 22, 26 + b], [cx + 32, 76 + b]], "#b4bccc");   // the hood
      K.E(cx, 56 + b, 18, 22, "#07060c"); K.eye(cx - 7, 52 + b, 3.4, "#9ef0f5", null); K.eye(cx + 7, 52 + b, 3.4, "#9ef0f5", null);
      for (const s of [-1, 1]) { K.S([[cx + s * 26, 84 + b], [cx + s * 48, 106 + b], [cx + s * 54, 128 + b]], 6, "#7a8496"); for (let f = 0; f < 3; f++) K.S([[cx + s * 54, 128 + b], [cx + s * (50 + f * 5), 142 + b]], 2, "#e0f4ff"); }
      K.E(cx, 92 + b, 10, 10, K.RG(cx, 92 + b, 1, 14, [[0, "rgba(158,240,245,0.9)"], [1, "rgba(62,224,232,0)"]]));
      for (let i = 0; i < 12; i++) K.R(cx - 50 + K.rng() * 100, 150 + K.rng() * 26, 1.6, 1.6, "rgba(255,255,255,0.8)");
    } },
    icethrall: { w: 48, h: 62, ramps: ["ink", "ice", "frost", "leather", "pale", "glowc"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.5, cx = 72;
      // an ice-cutter who stayed too long: a man inside a block of ice that walks
      for (const s of [-1, 1]) { K.S([[cx + s * 16, 130], [cx + s * 18, 166]], 12, "#3a6a90"); K.E(cx + s * 18, 170, 10, 4, "#1e3a5a"); }
      K.P([[cx - 40, 50 + b], [cx + 40, 46 + b], [cx + 46, 136], [cx - 44, 138]], K.LG(cx - 44, 0, cx + 46, 0, [[0, "#6aa0c8"], [0.5, "#e0f4ff"], [1, "#3a6a90"]]));
      K.rim([[cx - 40, 50 + b], [cx + 40, 46 + b], [cx + 46, 136], [cx - 44, 138]], "#1e3a5a", 2);
      K.vol(cx, 92 + b, 20, 30, ["#8e6a4c", "#523828", "#1e140e"]);                                  // the frozen man inside
      K.vol(cx, 62 + b, 12, 13, ["#ccccd8", "#848498", "#3a3a4a"]); K.E(cx - 4, 60 + b, 2, 2, "#07060c"); K.E(cx + 4, 60 + b, 2, 2, "#07060c"); K.E(cx, 68 + b, 3, 2, "#07060c");
      for (let i = 0; i < 5; i++) K.crack(cx - 30 + i * 14, 52 + b + (i % 2) * 20, 30, 1.4, "#ffffff", 1.2);
      for (const s of [-1, 1]) { K.S([[cx + s * 42, 70 + b], [cx + s * 56, 110], [cx + s * 54, 138]], 12, "#6aa0c8"); }
      K.P([[cx + 50, 120], [cx + 62, 150], [cx + 46, 154]], "#a8d4ec"); K.S([[cx + 54, 104], [cx + 54, 150]], 3, "#523828");   // an ice pick frozen to the hand
      K.eye(cx - 4, 60 + b, 1.8, "#3ee0e8", null); K.eye(cx + 4, 60 + b, 1.8, "#3ee0e8", null);
    } },
    hoarmoth: { w: 60, h: 46, ramps: ["ink", "frost", "ice", "paper", "glowc"], paint(K, ph) {
      const flap = Math.sin(ph * Math.PI * 2), cx = 90;
      for (const s of [-1, 1]) {   // four pale wings, dusted with frost, eyespots of ice
        const tip = 40 + flap * 14;
        K.P([[cx, 64], [cx + s * 84, tip], [cx + s * 78, 96], [cx + s * 20, 84]], K.LG(cx, 0, cx + s * 84, 0, [[0, "#dce2ec"], [1, "#7a8496"]]));
        K.P([[cx, 80], [cx + s * 66, 112 + flap * 6], [cx + s * 30, 124], [cx, 92]], "#b4bccc");
        K.E(cx + s * 50, 70 + flap * 6, 10, 9, "#3a6a90"); K.E(cx + s * 50, 70 + flap * 6, 5, 5, "#e0f4ff");
        K.S([[cx + s * 6, 66], [cx + s * 80, tip + 4]], 1.2, "#4a5262");
      }
      K.vol(cx, 86, 12, 28, ["#f4eed6", "#bab08e", "#6a6250"]); for (let i = 0; i < 5; i++) K.S([[cx - 10, 72 + i * 9], [cx + 10, 72 + i * 9]], 1.4, "#948a70");
      K.vol(cx, 56, 11, 10, ["#f4eed6", "#bab08e", "#6a6250"]); K.eye(cx - 5, 54, 3, "#9ef0f5"); K.eye(cx + 5, 54, 3, "#9ef0f5");
      K.Q([[cx - 4, 48], [cx - 20, 30], [cx - 30, 30]], 1.6, "#948a70"); K.Q([[cx + 4, 48], [cx + 20, 30], [cx + 30, 30]], 1.6, "#948a70");
      for (let i = 0; i < 16; i++) K.R(cx - 80 + K.rng() * 160, 100 + K.rng() * 38, 1.4, 1.4, "rgba(224,244,255,0.7)");   // the dust it sheds
    } },
  });
  Object.assign(MONSTERS, {
    rimewolf: { name: "Rime Wolf", hp: 70, atk: 19, def: 5, spd: 16, xp: 52, coin: [5, 9], sprite: "rimewolf",
      moves: [{ name: "Frost Bite", w: 3, power: 1.0, bleed: [3, 2] }, { name: "Harry", w: 2, power: 0.65, hits: 2 }, { name: "Howl", w: 1, guard: true }] },
    frostwight: { name: "Frost Wight", hp: 66, atk: 20, def: 4, spd: 10, xp: 56, coin: [6, 10], sprite: "frostwight",
      moves: [{ name: "Rime Breath", w: 2, power: 0.75, all: true }, { name: "Numb", w: 2, power: 0.9, weakOne: 2 }, { name: "The Long Cold", w: 1, charge: true, power: 1.5, all: true }] },
    icethrall: { name: "Ice Thrall", hp: 118, atk: 21, def: 13, spd: 4, xp: 60, coin: [7, 12], sprite: "icethrall",
      moves: [{ name: "Ice Pick", w: 3, power: 1.35, stunChance: 0.25 }, { name: "Set Hard", w: 1, guard: true, heal: 16 }] },
    hoarmoth: { name: "Hoarfrost Moth", hp: 58, atk: 18, def: 3, spd: 13, xp: 50, coin: [5, 9], sprite: "hoarmoth",
      moves: [{ name: "Frost Dust", w: 2, weakAll: 2 }, { name: "Drink Warmth", w: 3, power: 1.0, drain: 0.6 }] },
    isolde: { name: "Saint Isolde, the Rime Keeper", hp: 820, atk: 21, def: 9, spd: 8, xp: 480, coin: [170, 170], sprite: "isolde", boss: true, music: "boss", tall: true,
      moves: [{ name: "Hymn of Ice", w: 3, power: 0.85, all: true, weakAll: 1 }, { name: "Hold Fast", w: 3, power: 1.45, stunChance: 0.3 }, { name: "Frozen Embrace", w: 1, guard: true, heal: 30 },
        { name: "The Long Winter", w: 0, charge: true, power: 1.8, all: true },
        { name: "Call the Faithful", w: 0, summonKind: "icethrall", summonText: "Isolde lifts her hands. Two cutters, frozen at their work, step out of the walls." }] },
  });
  Object.assign(BESTIARY, {
    rimewolf: "Wolves the cold got into and never left. They run in pairs and bite to bleed you; the bleeding is the warm part.",
    frostwight: "Snow that remembers being someone's breath. Its long cold builds slowly; break it while it builds.",
    icethrall: "Ice-cutters who worked one winter too many. Armoured in their own ice: hammers and spears break it; blades skate.",
    hoarmoth: "Moths that drink warmth. Their dust weakens a whole party, and they are thin as paper.",
    isolde: "The saint who sang Kelda's rain still four generations ago, so the Guild could never sell it, and froze with it to keep it.",
  });
  FIELD.push(
    { id: "r1", x: 96, y: 150, group: ["rimewolf", "rimewolf"], minStage: 10 }, { id: "r2", x: 110, y: 145, group: ["hoarmoth", "frostwight"], minStage: 10 },
    { id: "r3", x: 44, y: 150, group: ["rimewolf", "hoarmoth"], minStage: 10 }, { id: "r4", x: 30, y: 176, group: ["icethrall", "frostwight"], minStage: 10 },
    { id: "r5", x: 18, y: 172, group: ["icethrall", "icethrall"], minStage: 10, elite: true }, { id: "r6", x: 104, y: 172, group: ["frostwight", "frostwight", "hoarmoth"], minStage: 10 },
    { id: "r7", x: 124, y: 184, group: ["rimewolf", "rimewolf", "frostwight"], minStage: 10 }, { id: "r8", x: 160, y: 150, group: ["hoarmoth", "hoarmoth", "rimewolf"], minStage: 10, elite: true },
  );
  LORE.push(
    { id: 23, x: 68, y: 147, title: "Kelda's Oath", text: "Carved over the village gate, the letters filled with ice: \"WHAT FALLS ON KELDA IS KELDA'S TO GIVE. NOT TO SELL. NOT TO KEEP. TO GIVE.\" Somebody has scratched a line through KEEP, and then, later, scratched the line out." },
    { id: 24, x: 22, y: 166, title: "A Cutter's Contract", text: "A Guild form nailed to a post, the ink frozen pale: \"The undersigned shall cut ice for the Guild of Oru at one cup of water per block, the cup to be drawn from the block.\"" },
    { id: 25, x: 116, y: 164, title: "The Last Song", text: "Scratched into the lake ice and frozen over a hundred times: \"She said she would hold it until somebody came who could carry it. She said: tell them not to hurry.\"" },
  );
  RELICS.rimeheart = { name: "Isolde's Breath", from: "isolde", desc: "A breath of the saint's cold, still singing. +3 defence, +2 SP each turn, and stuns don't take.", def: 3, spRegen: 2, noStun: true };
  // ---- Kelda's people
  const RIME_LOOK = {
    hild: { robe: "#3a5a7a", hair: "#e8eef6", skin: "#c49a7a", style: { hair: "veil", dress: true, eye: "#3a6a8a" } },
    brannoc: { robe: "#5a4a3a", hair: "#a86a3a", skin: "#e0a878", style: { hair: "cap", eye: "#3a4a5a" } },
    wynn: { robe: "#a8403a", hair: "#2a1a10", skin: "#c98d63", style: { hair: "fringe", eye: "#3a2a1a" } },
    edda: { robe: "#e8eef6", hair: "#6a6a7a", skin: "#a87a5a", style: { hair: "hood", hood: "#3a6a90", eye: "#4a5a6a" } },
  };
  npc2({ id: "hild", name: "Mother Hild", x: 73, y: 156, look: RIME_LOOK.hild, show: rimeOpen });
  npc2({ id: "brannoc", name: "Brannoc the Cutter", x: 64, y: 158, look: RIME_LOOK.brannoc, show: rimeOpen });
  npc2({ id: "wynn", name: "Wynn", x: 84, y: 157, look: RIME_LOOK.wynn, show: rimeOpen });
  npc2({ id: "edda", name: "Sister Edda", x: 62, y: 153, look: RIME_LOOK.edda, show: rimeOpen });
  for (const id of ["hild", "brannoc", "wynn", "edda"]) SPEAKERS[id] = NPCS.find(n => n.id === id).name;
  SPEAKERS.isolde = "Saint Isolde";
  Object.assign(ACTS, {
    hild: { draw: (P, t) => { P(9, -22, 2, 22, "#6b5a44"); P(7, -24, 6, 3, "#a8d4ec"); } },
    brannoc: { draw: (P, t) => { const a = Math.sin(t * 2) * 3; P(-10, -20 + a, 2, 18, "#523828"); P(-13, -22 + a, 8, 3, "#a8d4ec"); } },
    wynn: { pace: 14, draw: (P, t, n, g2, x, y) => { if (!n.walking && Math.sin(t * 1.3) > 0.7) drawEmote(g2, x + 8, y - 30, "note"); } },
    edda: { draw: (P, t) => { P(8, -12, 6, 7, "#e8eef6"); P(9, -11, 4, 1, "#3a6a90"); } },
  });
  const rf = () => G.flags;
  Object.assign(D, {
    rime_arrive: say(null, "The stair comes out under a white sky. Snow, on the salt. Somewhere to the east a sound like a choir holding one note, so long that you stop hearing it and only hear it stop. Smoke rises from a walled village to the west of the road.", null, () => { rf().rimeArrived = true; save(); }),
    hild_0: { who: "hild", text: "A courier. With the three tones on you, I can hear them from here. ...Sit. You've come because of the singing on the lake.", choices: [
      { t: "\"What is it?\"", go: "hild_1" }, { t: "\"Another time.\"", go: null }] },
    hild_1: say("hild", "Four generations ago the Guild came to buy our rain, the way they bought yours. Saint Isolde walked out onto the lake and sang the whole winter's rain still, into one great house of ice, so there would be nothing to buy. Then she stayed inside it, to keep it.", "hild_2"),
    hild_2: say("hild", "Your Bell rang, and the ice heard it. It wants to be water again. If she lets it all go at once, it goes down the old riverbed in one night, through the Dry Sea, over Tamar's Rest and every caravan on the road.", "hild_3"),
    hild_3: { who: "hild", text: "She won't listen to us. We're the ones she's keeping it for. She might listen to someone who carries things for a living. Will you go down to the Ice House and ask her to let go slowly?", choices: [
      { t: "\"I'll go.\"", go: "hild_yes" }, { t: "\"Why not keep it frozen?\"", go: "hild_keep" }] },
    hild_keep: say("hild", "Because water held too long stops being water and becomes a price. Ask Brannoc what the Guild pays him for a block. Then go.", "hild_yes"),
    hild_yes: say("hild", "Take this. It's her own lullaby, the one we sing the children; she'll know it. The door opens for anyone who sings it at the threshold. Go round by the shore road. The wolves don't like the lake.", null, () => { rf().rimeQuest = true; rf().rimeGate = true; applyWorldState(); miniDirty = true; toast("Mother Hild teaches you Isolde's lullaby. The Ice House door will open."); save(); updateHud(); }),
    hild_wait: say("hild", "Go round by the shore road. She has been holding on for four generations; she can hold on until you get there. Don't make her hold on longer than that."),
    hild_after: say("hild", "", null),
    brannoc_0: say("brannoc", "One block of ice, one cup of water, and the cup comes out of the block. The Guild man said it with a straight face. My father signed it. I signed it. If she lets the lake go, there's nothing left to cut, and nothing left to owe. I've been trying to decide if that frightens me."),
    brannoc_after: say("brannoc", "", null),
    wynn_0: say("wynn", "Mother Hild says the saint sings so the ice won't forget how to be ice. I skate out to the house sometimes and sing back. She's never answered. ...Do you think she's lonely? Four generations is a lot of winters."),
    wynn_after: say("wynn", "", null),
    edda_0: { who: "edda", text: "The cold gets into wounds. I keep salves warm by the hearth, and tonics that taste like burnt pine. Rest here too, if you like: the hearth never goes out.", choices: [
      { t: "Salve (heal 22): 6 coin", go: "edda_0", act: () => buy("salve"), req: () => G.coins >= 6, reqText: "6 coin" },
      { t: "Bitter Tonic: 5 coin", go: "edda_0", act: () => buy("tonic"), req: () => G.coins >= 5, reqText: "5 coin" },
      { t: "Smelling Salts: 10 coin", go: "edda_0", act: () => buy("salts"), req: () => G.coins >= 10, reqText: "10 coin" },
      { t: "Rest by the hearth", go: "edda_rest" }, { t: "That's all", go: null }] },
    edda_rest: say(null, "You sit by Kelda's hearth until the cold lets go of your fingers. Everyone is fully healed, and your progress is saved.", null, () => restParty()),
    isolde_0: say("isolde", "(The hall is blue and very quiet. A woman of ice sits on a throne of it, her mouth a little open on one long note. When you sing the lullaby, the note stops.) ...That song. Nobody has sung it to me in a long time. Who sent you?", "isolde_1"),
    isolde_1: { who: "isolde", text: "Hild. Of course. She wants me to let go. They all want me to let go, and the moment I do, the Guild will be at the shore with barrels.", choices: [
      { t: "\"The Guild has fallen. The Bell rings for everyone now.\"", go: "isolde_2" }, { t: "\"Then let it go slowly. I'll carry the word downriver.\"", go: "isolde_2" }] },
    isolde_2: say("isolde", "Fallen. They always say fallen, and then someone else stands up in the same coat. I held this for four generations. I will not open my hands because a stranger says the weather has changed. If you want it, courier... come and take it.", null, () => startBattle(["isolde"], { boss: "isolde", area: "icehouse" })),
    isolde_after: { who: "isolde", text: "(The ice of her body is running now, all over, gently.) You didn't take it. You could have, at the end, and you didn't. ...All right. Tell me how. Quickly, or slowly. Down the river, or kept here for Kelda to give.", choices: [
      { t: "\"Slowly. Down the old riverbed, all the way to the Dry Sea.\"", go: "isolde_river" },
      { t: "\"Keep a little here, for Kelda to give, and let the rest go slowly.\"", go: "isolde_keep" }] },
    isolde_river: say("isolde", "Slowly, then. (She opens her hands. Far off, under the lake, something gives, and goes on giving.) Tell Tamar's people a river is coming, and to plant on its banks, not sell its cups. I'm going to sleep now. Don't wake me unless it's to say the river reached the sea.", null, () => rimeDone("river")),
    isolde_keep: say("isolde", "A little, kept, to give. That's the oath, isn't it? I had forgotten the last word was give. (She lets most of the lake go, slowly, and keeps one bright block in her hands.) I'll stay and keep it. Send me the children who want to learn the song.", null, () => rimeDone("keep")),
  });
  function rimeDone(choice) {
    rf().rimeChoice = choice; rf().rimeDone = true; save(); updateHud();
    setTimeout(() => card("Act III · The Rime", choice === "river" ? "A River Is Coming" : "Kept to Give",
      choice === "river" ? "The ice of the Rime lets go one cup at a time. By spring there is a stream in the old riverbed of the Dry Sea, and by summer Tamar's Rest has a willow. Nobody owns it. Kelda sends its children down to see." :
        "The lake goes down the old riverbed slowly, and one bright block stays in the Ice House with its saint. Kelda's children walk out every winter to learn the lullaby. When anyone in the valley is dry, Kelda gives."), 600);
  }
  D.hild_after.text = "She let go. I felt it in my teeth, the moment it happened, like a held note stopping. Thank you, courier. Kelda will owe you a long time, and we don't mean it the way the Guild means it.";
  D.brannoc_after.text = "No more blocks, no more cups. I've torn my contract into strips and I'm using them to light the hearth. It burns better than I thought it would.";
  D.wynn_after.text = "I sang to the house this morning and someone hummed back! Mother Hild says I imagined it. I didn't imagine it.";
  const _dialogForRime = dialogFor;
  dialogFor = function (n) {
    if (n.id === "hild") return rf().rimeDone ? "hild_after" : rf().rimeQuest ? "hild_wait" : "hild_0";
    if (n.id === "brannoc") return rf().rimeDone ? "brannoc_after" : "brannoc_0";
    if (n.id === "wynn") return rf().rimeDone ? "wynn_after" : "wynn_0";
    if (n.id === "edda") return "edda_0";
    return _dialogForRime(n);
  };
  // the Ice House: the door opens to Hild's lullaby; inside, Isolde waits on her throne
  const RIME_THRONE = { x: 140, y: 160 };
  const _interactRime = interact;
  interact = function () {
    if (rimeOpen() && mode === "play" && near({ x: RIME_THRONE.x * TILE + 8, y: RIME_THRONE.y * TILE + 8 }, 44) && !rf().isoldeDead) { openDialog("isolde_0"); return true; }
    if (rimeOpen() && mode === "play" && !rf().rimeGate && near({ x: RIME.door[0] * TILE + 8, y: RIME.door[1] * TILE + 8 }, 26)) { D.__icedoor = say(null, "A door of clear ice, a hand thick. Through it, far inside, a blue hall and someone sitting very still. It doesn't open to a push. (Kelda's elder may know how.)"); openDialog("__icedoor"); return true; }
    return _interactRime();
  };
  const _addProp2Rime = addProp2;
  addProp2 = () => {
    _addProp2Rime();
    addProp("sign", 101, 144, { text: "A post with a bell frozen silent on it: KELDA, WEST. THE LAKE, EAST: STAY ON THE SHORE ROAD. In fresher paint: THE SAINT IS SLEEPING. DON'T SKATE TO THE HOUSE. (Somebody has written underneath, in a child's hand: SHE ISN'T.)" });
    addProp("campfire", 70, 158); addProp("barrel", 66, 155); addProp("crate", 82, 155); addProp("banner", 73, 149);
    for (const [x, y] of [[26, 170], [34, 182], [12, 180]]) addProp("crate", x, y);
    addProp("statue", RIME_THRONE.x, RIME_THRONE.y - 1);
    for (const [x, y] of [[134, 162], [146, 162], [134, 168], [146, 168]]) addProp("candles", x, y);
  };
  // the first steps on the snow, the boss's end, and a word from Tamar once Chapter X opens the stair
  const _updateRime = update;
  let rimeTick = 0;
  update = function (dt) {
    _updateRime(dt);
    if (!G || mode !== "play" || (rimeTick -= dt) > 0) return; rimeTick = 1;
    const ty = Math.floor(G.py / TILE);
    if (rimeOpen() && ty >= RIME.y0 && !rf().rimeArrived) openDialog("rime_arrive");
    else if (rimeOpen() && !rf().rimeHint && regionOf(Math.floor(G.px / TILE), ty) === "drysea") { rf().rimeHint = true; toast("Tamar's drovers say the stair at the south rim of the Dry Sea has thawed open, and a village down there is asking for a courier."); }
  };
  const _bossEndRime = act2BossEndB;
  act2BossEndB = function (boss) { _bossEndRime(boss); if (boss === "isolde") { rf().isoldeDead = true; save(); setTimeout(() => openDialog("isolde_after"), 300); } };
  // her second form: the ice of her lets go and the water inside her pours out
  PHASE2.isolde = ["Then take it! Take ALL of it!", "#9ef0f5"];
  P2NAME.isolde = "Isolde, the Thaw";
  const isoldeBody = (K, ph, thaw) => {
    const b = Math.sin(ph * Math.PI * 2) * 3, W2 = 288, cx = W2 / 2;
    K.E(cx, 344, 120, 10, "rgba(7,6,12,0.4)");
    // the throne of ice behind her
    K.P([[cx - 100, 340], [cx - 92, 120], [cx - 60, 70], [cx, 50], [cx + 60, 70], [cx + 92, 120], [cx + 100, 340]], K.LG(cx - 100, 0, cx + 100, 0, [[0, "#3a6a90"], [0.5, "#a8d4ec"], [1, "#1e3a5a"]]));
    for (let i = 0; i < 9; i++) K.crack(cx - 80 + i * 20, 90 + (i % 3) * 40, 70, 1.5, thaw ? "#e0f4ff" : "#6aa0c8", 1.4);
    // the saint: a long habit of ice, hands open or closed
    K.P([[cx - 34, 140 + b], [cx + 34, 140 + b], [cx + 60, 330], [cx - 60, 330]], K.LG(cx - 60, 0, cx + 60, 0, [[0, "#6aa0c8"], [0.45, "#e0f4ff"], [1, "#3a6a90"]]));
    for (let i = 0; i < 6; i++) K.S([[cx - 24 + i * 10, 150 + b], [cx - 50 + i * 20, 326]], 1.4, "rgba(30,58,90,0.45)");
    K.P([[cx - 36, 138 + b], [cx + 36, 138 + b], [cx + 26, 176 + b], [cx - 26, 176 + b]], "#dce2ec");
    for (const s of [-1, 1]) {
      if (thaw) { K.S([[cx + s * 30, 150 + b], [cx + s * 80, 140 + b], [cx + s * 112, 112 + b]], 10, "#a8d4ec"); for (let k = 0; k < 4; k++) K.drip(cx + s * (108 - k * 6), 118 + b, 30 + k * 10, 3, "#6aa0c8"); }
      else K.S([[cx + s * 30, 150 + b], [cx + s * 40, 200 + b], [cx + s * 10, 222 + b]], 10, "#a8d4ec");
    }
    if (!thaw) K.E(cx, 222 + b, 16, 12, K.RG(cx, 222 + b, 1, 20, [[0, "#ffffff"], [0.5, "rgba(158,240,245,0.8)"], [1, "rgba(62,224,232,0)"]]));   // the held light
    // the face: closed eyes and an open mouth on the note; in the thaw, the eyes open and the crown runs
    K.vol(cx, 104 + b, 20, 26, ["#ffffff", "#a8d4ec", "#3a6a90"]);
    if (thaw) { K.eye(cx - 8, 98 + b, 4, "#ffffff", null); K.eye(cx + 8, 98 + b, 4, "#ffffff", null); } else for (const s of [-1, 1]) K.S([[cx + s * 3, 98 + b], [cx + s * 12, 97 + b]], 1.6, "#1e3a5a");
    K.E(cx, 118 + b, 5, thaw ? 8 : 6 + Math.sin(ph * 6.28) * 1.2, "#0e1a2e");
    for (let i = 0; i < 7; i++) K.P([[cx - 24 + i * 8, 80 + b], [cx - 20 + i * 8, 54 + b - Math.abs(i - 3) * -4 - (3 - Math.abs(i - 3)) * 6], [cx - 16 + i * 8, 80 + b]], "#e0f4ff");
    if (thaw) { for (let i = 0; i < 9; i++) K.drip(cx - 26 + i * 6.5, 80 + b, 20 + (i % 3) * 14, 1.6, "#6aa0c8"); for (let i = 0; i < 26; i++) { const x = cx - 120 + K.rng() * 240, y = (K.rng() * 340 + ph * 120) % 340; K.S([[x, y], [x, y + 8]], 1.2, "rgba(168,212,236,0.6)"); } }
    else for (let i = 0; i < 18; i++) K.R(cx - 110 + K.rng() * 220, K.rng() * 330, 1.6, 1.6, "rgba(255,255,255,0.8)");
  };
  BOSS_ART.isolde = { w: 96, h: 118, ramps: ["ink", "ice", "frost", "glowc", "night"], paint(K, ph) { isoldeBody(K, ph, false); } };
  P2ART.isolde = { w: 96, h: 118, ramps: ["ink", "ice", "frost", "glowc", "night"], paint(K, ph) { isoldeBody(K, ph, true); } };
  // the journal, the Chronicle and the endings remember the Rime
  const _renderJournalRime = renderJournal;
  renderJournal = function () {
    _renderJournalRime();
    if (!rimeOpen() || !(rf().rimeArrived || rf().rimeQuest)) return;
    const h = [...$("journalBody").querySelectorAll("h3")].find(x => x.textContent === "Side quests"), ul = h && h.nextElementSibling; if (!ul) return;
    const done = !!rf().rimeDone, t = done ? `Act III, the Rime: Saint Isolde let go${rf().rimeChoice === "keep" ? ", keeping a little for Kelda to give" : ", and a river is coming to the Dry Sea"}.` : rf().rimeQuest ? "Act III, the Rime: go round the shore road to the Ice House on the frozen lake and ask Saint Isolde to let go slowly." : "Act III, the Rime: find out what is singing on the frozen lake (ask in Kelda).";
    ul.querySelector("li.dim") && ul.querySelector("li.dim").remove();
    ul.insertAdjacentHTML("afterbegin", `<li class="${done ? "done" : ""}">${done ? "✓ " : ""}${t}</li>`);
  };
  const _chronicleRime = chronicle;
  chronicle = function () {
    const P = _chronicleRime();
    if (rf().rimeDone) P.splice(Math.max(0, P.length - 1), 0, ["The Rime", rf().rimeChoice === "river" ? "South of the Dry Sea, in the Rime, a saint had held a winter's rain frozen for four generations so that no one could sell it. The courier sang her own lullaby back to her, and she let it go, slowly, down the old riverbed. There is a stream at Tamar's Rest now." : "South of the Dry Sea, in the Rime, a saint had held a winter's rain frozen for four generations so that no one could sell it. The courier reminded her that Kelda's oath ends with give. She let the lake go slowly, and kept one block of it, for Kelda to give."]);
    return P;
  };
  const _extraFatesRime = extraFates;
  extraFates = function (k) { const out = _extraFatesRime(k); if (rf().rimeDone) out.push(rf().rimeChoice === "river" ? "A stream runs through the Dry Sea now, out of the Rime. Tamar's Rest planted willows along it. Nobody sells its cups." : "In the Rime, Saint Isolde keeps one block of the old winter. When anyone in the valley is dry, Kelda gives."); return out; };
  ACHIEVEMENTS.push(["rime", "Not to Keep. To Give.", "Ask Saint Isolde to let go.", () => G.flags.rimeDone]);
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { rime: () => ({ ...RIME, flags: { arrived: !!rf().rimeArrived, quest: !!rf().rimeQuest, gate: !!rf().rimeGate, done: !!rf().rimeDone, choice: rf().rimeChoice || null } }) }), 0);

