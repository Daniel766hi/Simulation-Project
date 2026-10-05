  // ================================================================== MAP
  const T = { SALT: 0, SAND: 1, GRASS: 2, WATER: 3, PALM: 4, WALL: 5, HOUSE: 7, ROOF: 8, DOOR: 9, PATH: 10,
              ROCK: 11, BRIDGE: 12, CRYSTAL: 13, DARK: 14, LOCKED: 15, WELL: 16, GATE: 17, LDOOR: 18, CITY: 19, PEDESTAL: 20, BONES: 21, MUD: 22,
              COBBLE: 23, SHALLOW: 24, DECK: 25, HULL: 26, ABYSS: 27, CORAL: 28, CLIFF: 29, STONE: 30, SPIRE: 31, SWALL: 32, ROOFB: 33, FOUNTAIN: 34, FLOOR: 35, GDOOR: 36, DEBRIS: 37, STAIRS: 38 };
  const SOLID = new Set([T.WATER, T.PALM, T.WALL, T.HOUSE, T.ROOF, T.ROCK, T.CRYSTAL, T.LOCKED, T.WELL, T.GATE, T.CITY, T.DOOR, T.PEDESTAL,
                         T.HULL, T.CORAL, T.CLIFF, T.SWALL, T.ROOFB, T.FOUNTAIN, T.GDOOR, T.DEBRIS]);
  const map = new Uint8Array(W * H);
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.ROCK : map[y * W + x];
  const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) map[y * W + x] = t; };
  const rect = (x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  const outline = (x0, y0, x1, y1, t) => { for (let x = x0; x <= x1; x++) { set(x, y0, t); set(x, y1, t); } for (let y = y0; y <= y1; y++) { set(x0, y, t); set(x1, y, t); } };
  const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967296; };
  function path(points) {
    for (let i = 1; i < points.length; i++) {
      let [x, y] = points[i - 1]; const [tx, ty] = points[i];
      const paint = (a, b) => { if ([T.SALT, T.SAND, T.GRASS, T.BONES, T.MUD].includes(get(a, b))) set(a, b, T.PATH); };
      while (x !== tx || y !== ty) { paint(x, y); if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y); }
      paint(tx, ty);
    }
  }
  function house(x, y, w) { rect(x, y, x + w - 1, y + 1, T.ROOF); rect(x, y + 2, x + w - 1, y + 2, T.HOUSE); set(x + Math.floor(w / 2), y + 2, T.DOOR); }
  function buildMap() {
    map.fill(T.CLIFF);
    rect(0, 0, OW - 1, OH - 1, T.SALT);
    outline(0, 0, OW - 1, OH - 1, T.ROCK); outline(1, 1, OW - 2, OH - 2, T.ROCK);
    for (let i = 0; i < 70; i++) { const x = 2 + Math.floor(hash(i, 7) * (OW - 4)), y = 2 + Math.floor(hash(i, 11) * (OH - 4)); if (hash(i, 3) < .5 && (x < 5 || y < 4 || x > OW - 6 || y > OH - 5)) set(x, y, T.ROCK); }
    for (let i = 0; i < 40; i++) { const x = 3 + Math.floor(hash(i, 41) * (OW - 6)), y = 3 + Math.floor(hash(i, 43) * 28); if (get(x, y) === T.SALT) set(x, y, T.BONES); }
    rect(3, 33, 25, 51, T.SAND);
    house(5, 35, 6); house(15, 35, 7); house(4, 44, 5); house(17, 45, 5);
    set(12, 42, T.WELL);
    rect(31, 22, 41, 30, T.GRASS); rect(34, 25, 38, 27, T.WATER);
    for (const [x, y] of [[32, 23], [40, 23], [32, 29], [40, 29], [36, 22]]) set(x, y, T.PALM);
    // the Drowned Grove: palms, mud and a black pond
    rect(52, 32, 68, 50, T.GRASS); rect(58, 38, 63, 42, T.WATER);
    for (let i = 0; i < 40; i++) { const x = 52 + Math.floor(hash(i, 21) * 17), y = 32 + Math.floor(hash(i, 23) * 19); if (get(x, y) === T.GRASS && Math.abs(x - 55) + Math.abs(y - 36) > 3) set(x, y, T.PALM); }
    for (let i = 0; i < 30; i++) { const x = 56 + Math.floor(hash(i, 61) * 10), y = 36 + Math.floor(hash(i, 63) * 10); if (get(x, y) === T.GRASS) set(x, y, T.MUD); }
    rect(48, 2, 49, 30, T.WATER); set(48, 14, T.BRIDGE); set(49, 14, T.BRIDGE);
    outline(24, 3, 44, 19, T.WALL); rect(25, 4, 43, 18, T.DARK);
    for (let x = 25; x <= 43; x++) set(x, 11, T.WALL);
    set(34, 11, T.LOCKED); set(34, 19, T.LDOOR);
    for (const [x, y] of [[27, 13], [31, 16], [38, 13], [41, 16], [29, 6], [39, 6], [26, 9], [42, 9]]) set(x, y, T.CRYSTAL);
    set(34, 5, T.PEDESTAL);
    rect(52, 2, 69, 9, T.CITY); rect(52, 10, 69, 10, T.WALL); set(61, 10, T.GATE);
    path([[12, 34], [12, 29], [30, 29], [30, 26], [31, 26]]);
    path([[36, 22], [36, 21], [34, 21], [34, 20]]);
    path([[36, 21], [46, 21], [46, 14], [47, 14]]);
    path([[50, 14], [61, 14], [61, 11]]);
    path([[41, 28], [47, 28], [47, 32], [52, 32], [55, 35]]);
    path([[55, 35], [55, 44], [62, 44]]);
    // keep story spots walkable
    for (const [x, y] of [[66, 48], [66, 34], [65, 48], [66, 47], [65, 34], [66, 44], [65, 44], [67, 44], [61, 43], [62, 43], [63, 43], [61, 44], [62, 44], [63, 44], [64, 44]])
      if (SOLID.has(get(x, y))) set(x, y, T.GRASS);
    for (const [x, y] of [[4, 50], [45, 5], [37, 29], [35, 29], [30, 17], [29, 17], [31, 17], [58, 12], [8, 24], [20, 6], [60, 24], [51, 18], [11, 15], [20, 20], [44, 24],
    [12, 30], [22, 26], [16, 18], [26, 22], [8, 13], [44, 30], [54, 24], [40, 40], [44, 9], [18, 8], [53, 15], [54, 12], [46, 17],
    [6, 30], [27, 24], [44, 40], [60, 34], [28, 16], [45, 12], [66, 22], [3, 41], [56, 14], [57, 15], [64, 20], [65, 21], [67, 21], [66, 20], [66, 21], [65, 23], [67, 23], [7, 11], [6, 11], [8, 11], [6, 12], [7, 12], [8, 12], [7, 10], [20, 14], [38, 36], [14, 10], [58, 28], [10, 6]]) if (SOLID.has(get(x, y))) set(x, y, y > 31 ? T.GRASS : T.SALT);
    set(12, 51, T.PATH); set(12, 50, T.PATH); set(44, 48, T.SALT); set(44, 49, T.SALT); set(43, 49, T.SALT); set(45, 49, T.SALT);
    buildAct2();
  }
  // ------------------------------------------------------------------ ACT II REGIONS
  function house2(x, y, w) { rect(x, y, x + w - 1, y + 1, T.ROOFB); rect(x, y + 2, x + w - 1, y + 2, T.HOUSE); set(x + Math.floor(w / 2), y + 2, T.DOOR); }
  function wreck(x0, y0, w, h, openX) { rect(x0, y0, x0 + w - 1, y0 + h - 1, T.DECK); outline(x0, y0, x0 + w - 1, y0 + h - 1, T.HULL); set(openX, y0 + h - 1, T.DECK); for (let x = x0 + 2; x < x0 + w - 2; x += 3) set(x, y0 + 2, T.HULL); }
  function carve(points, t, width = 0) {
    for (let i = 1; i < points.length; i++) {
      let [x, y] = points[i - 1]; const [tx, ty] = points[i];
      const paint = (a, b) => { for (let dy = -width; dy <= width; dy++) for (let dx = -width; dx <= width; dx++) set(a + dx, b + dy, t); };
      while (x !== tx || y !== ty) { paint(x, y); if (x !== tx) x += Math.sign(tx - x); else y += Math.sign(ty - y); }
      paint(tx, ty);
    }
  }
  function buildAct2() {
    // Oru, the city behind the gate
    rect(74, 2, 104, 32, T.COBBLE); outline(74, 2, 104, 32, T.WALL); set(89, 32, T.GATE); set(104, 17, T.PATH);
    outline(77, 3, 91, 11, T.WALL); rect(78, 4, 90, 10, T.FLOOR); set(84, 11, T.GDOOR);
    for (const [x, y] of [[80, 6], [88, 6], [80, 9], [88, 9]]) set(x, y, T.WALL);
    house2(94, 4, 5); house2(99, 4, 4); house2(96, 11, 7); house2(95, 21, 5); house2(98, 26, 5); house2(93, 26, 4);
    house2(76, 20, 5); house2(76, 25, 6); house2(82, 25, 5); house2(82, 20, 4);
    rect(84, 13, 94, 19, T.PATH);
    carve([[89, 31], [89, 13]], T.PATH); carve([[75, 17], [103, 17]], T.PATH); carve([[84, 12], [84, 13]], T.PATH);
    set(87, 15, T.FOUNTAIN); set(91, 15, T.FOUNTAIN); // the plaza fountains, fed by the old canals (the paths above would cover a centre one)
    // the Drowning Marsh: shallow water, grass islands, mud and a village on stilts
    for (let y = 56; y <= 88; y++) for (let x = 3; x <= 60; x++) {
      const n = hash(Math.floor(x / 3), Math.floor(y / 3) + 500), m = hash(x, y + 900);
      set(x, y, n < 0.38 ? T.GRASS : n < 0.52 ? T.MUD : n > 0.93 ? T.WATER : T.SHALLOW);
      if (m < 0.05 && get(x, y) === T.GRASS) set(x, y, T.PALM);
    }
    rect(28, 62, 46, 72, T.DECK); house(30, 63, 5); house(38, 63, 6); house(31, 68, 4); house(40, 68, 5);
    rect(6, 78, 20, 87, T.MUD); rect(11, 81, 14, 82, T.WATER);
    carve([[14, 57], [14, 66], [28, 66]], T.DECK); carve([[46, 67], [60, 67], [60, 71]], T.DECK); carve([[37, 72], [37, 80], [14, 80], [14, 79]], T.DECK);
    carve([[8, 60], [14, 60]], T.GRASS); carve([[52, 60], [52, 66]], T.GRASS); carve([[56, 84], [56, 72]], T.GRASS); carve([[24, 86], [24, 80]], T.GRASS); carve([[40, 80], [40, 75]], T.GRASS);
    for (let y = 70; y <= 73; y++) set(61, y, T.DEBRIS);
    // the Wreck Coast: beach, sea, ship hulls, a lighthouse, the Gull and the pier over the whirlpool
    for (let y = 56; y <= 88; y++) for (let x = 62; x <= 127; x++) {
      const shore = 80 + Math.round(Math.sin(x * 0.35) * 1.5 + Math.sin(x * 0.11) * 2);
      set(x, y, (y > shore || x > 124) ? T.WATER : T.SAND);
    }
    for (let y = 70; y <= 73; y++) { set(62, y, T.SAND); set(61, y, get(61, y)); }
    wreck(74, 60, 10, 6, 78); wreck(95, 66, 10, 6, 99); wreck(104, 57, 16, 10, 111);
    rect(107, 60, 116, 64, T.FLOOR);
    wreck(78, 72, 8, 5, 81);
    rect(119, 56, 124, 61, T.STONE); set(122, 57, T.WALL);
    carve([[116, 76], [116, 86]], T.DECK); carve([[117, 76], [117, 86]], T.DECK);
    carve([[62, 71], [80, 71], [100, 74], [112, 74]], T.PATH);
    for (const [x, y] of [[68, 78], [69, 78], [70, 78], [68, 77], [69, 77]]) set(x, y, T.SAND);
    // the Storm Spire and its mountain road
    rect(107, 33, 127, 53, T.STONE); outline(106, 32, 128, 54, T.CLIFF);
    for (let y = 34; y <= 52; y++) for (let x = 108; x <= 126; x++) if (hash(x * 3, y * 7 + 77) < 0.22) set(x, y, T.CLIFF);
    carve([[108, 50], [114, 50], [114, 44], [120, 44], [120, 38], [118, 38], [118, 33]], T.STONE, 1);
    carve([[120, 42], [123, 42], [123, 40]], T.STONE);
    rect(121, 46, 125, 50, T.STONE); rect(122, 47, 124, 49, T.WATER); // a storm pool, fed by the rain off the Spire
    rect(110, 1, 126, 31, T.SPIRE); outline(110, 1, 126, 31, T.SWALL);
    for (let x = 110; x <= 126; x++) { set(x, 11, T.SWALL); set(x, 21, T.SWALL); }
    for (const [x, y] of [[125, 23], [111, 13]]) set(x, y, T.STAIRS);
    for (const [x, y] of [[125, 19], [111, 9]]) set(x, y, T.STAIRS);
    for (let i = 0; i < 18; i++) { const x = 112 + Math.floor(hash(i, 301) * 13), y = [24, 27, 14, 17, 4, 7][i % 6]; if (Math.abs(x - 118) > 1) set(x, y, T.SWALL); }
    // the Deep: a drowned palace under the old sea
    rect(75, 37, 103, 52, T.ABYSS); outline(74, 36, 104, 53, T.CORAL);
    for (let i = 0; i < 40; i++) { const x = 76 + Math.floor(hash(i, 401) * 27), y = 39 + Math.floor(hash(i, 403) * 12); if (Math.abs(x - 89) > 2) set(x, y, T.CORAL); }
    carve([[89, 52], [89, 38]], T.ABYSS, 1); rect(86, 37, 92, 40, T.ABYSS);
    // The Hollow Beneath: salt mines under the Well of Nine
    carve([[133, 16], [140, 16], [140, 8], [150, 8], [150, 14], [158, 14], [158, 4], [167, 4]], T.DARK, 1);
    carve([[145, 8], [145, 3]], T.DARK, 1); carve([[154, 14], [154, 17]], T.DARK, 1); rect(143, 2, 148, 4, T.DARK); rect(136, 10, 139, 13, T.DARK);
    for (const [x, y] of [[141, 7], [149, 15], [157, 5], [146, 2]]) set(x, y, T.CRYSTAL);
    carve([[165, 22], [167, 22]], T.DARK); carve([[165, 22], [160, 22], [160, 25]], T.DARK, 1); rect(146, 24, 160, 32, T.DARK);
    rect(147, 28, 159, 29, T.WATER); set(153, 28, T.BRIDGE); set(153, 29, T.BRIDGE); carve([[146, 31], [140, 31], [140, 34], [133, 34]], T.DARK, 1);
    for (const x of [148, 151, 155, 158]) set(x, 25, T.WALL);
    carve([[133, 40], [140, 40], [140, 47], [145, 47]], T.DARK, 1);
    outline(145, 41, 165, 53, T.WALL); rect(146, 42, 164, 52, T.FLOOR); set(145, 47, T.FLOOR);
    for (const [x, y] of [[148, 44], [148, 50], [162, 44], [162, 50]]) set(x, y, T.WALL);
    for (const [x, y] of [[166, 4], [167, 22], [134, 34], [133, 40], [133, 16]]) set(x, y, T.STAIRS);
    fixSpots();
  }
  // Keep every story spot in the new regions standing on floor
  function floorFor(x, y) { if (x >= 130) return T.DARK; const r = x >= 74 && x <= 104 && y <= 32 ? T.COBBLE : x >= 106 && y <= 31 ? T.SPIRE : x >= 106 && y <= 54 ? T.STONE : x >= 74 && x <= 104 && y >= 36 && y <= 53 ? T.ABYSS : y >= 55 && x <= 61 ? T.GRASS : T.SAND; return r; }
  function fixSpots() {
    const spots = [...NPCS, ...FIELD, ...LORE, ...(typeof PARTS !== "undefined" ? PARTS : []), ...(typeof SHRINES !== "undefined" ? SHRINES : []), ...TOBIN_PAGES];
    for (const sp of spots) if ((sp.x >= OW || sp.y >= OH) && SOLID.has(get(sp.x, sp.y))) set(sp.x, sp.y, floorFor(sp.x, sp.y));
  }
  // Doors, gates and passages that change as the story moves on
  function applyWorldState() {
    if (!G) return;
    if (G.flags.unlocked) set(34, 11, T.DARK);
    if (G.stage >= 9) for (let y = 70; y <= 73; y++) set(61, y, T.SHALLOW);
    if (G.flags.guildOpen) set(84, 11, T.FLOOR);
    if (G.flags.minesOpen) set(38, 29, T.STAIRS);
    miniDirty = true;
  }

  const tileCache = new Map();
  function tileCanvas(t, v) {
    const key = t * 10 + v;
    if (tileCache.has(key)) return tileCache.get(key);
    const c = document.createElement("canvas"); c.width = c.height = TILE;
    const g = c.getContext("2d");
    const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const rnd = i => hash(t * 97 + v * 13 + i, i * 7 + v);
    switch (t) {
      case T.SALT: px(0, 0, 16, 16, "#e3dde9"); for (let i = 0; i < 6; i++) px(Math.floor(rnd(i) * 16), Math.floor(rnd(i + 9) * 16), 1, 1, "#cbc3da");
        if (v === 1) { g.strokeStyle = "#c8bfd8"; g.beginPath(); g.moveTo(2, 9); g.lineTo(6, 6); g.lineTo(11, 7); g.lineTo(14, 3); g.stroke(); }
        if (v === 2) { px(5, 5, 2, 2, "#ffffff"); px(10, 11, 1, 1, "#ffffff"); } break;
      case T.BONES: px(0, 0, 16, 16, "#e3dde9"); px(3, 9, 8, 2, "#f6f2e8"); px(2, 8, 2, 4, "#f6f2e8"); px(10, 8, 2, 4, "#f6f2e8"); px(9, 3, 4, 4, "#f6f2e8"); px(10, 4, 1, 1, "#3a2a2a"); px(12, 4, 1, 1, "#3a2a2a"); px(5, 12, 3, 1, "#7a1a22"); break;
      case T.SAND: px(0, 0, 16, 16, "#e6c98f"); for (let i = 0; i < 7; i++) px(Math.floor(rnd(i) * 16), Math.floor(rnd(i + 5) * 16), 1, 1, i % 2 ? "#d4b374" : "#f2dca8"); break;
      case T.GRASS: px(0, 0, 16, 16, "#4f9a57"); for (let i = 0; i < 8; i++) px(Math.floor(rnd(i) * 15), Math.floor(rnd(i + 3) * 14), 1, 2, "#6fbf62"); if (v === 2) { px(4, 6, 2, 2, "#ffd24a"); px(11, 10, 2, 2, "#ff8ab0"); } break;
      case T.MUD: px(0, 0, 16, 16, "#4a4a3a"); for (let i = 0; i < 6; i++) px(Math.floor(rnd(i) * 14), Math.floor(rnd(i + 3) * 14), 3, 1, "#3a3a2c"); px(5 + v, 9, 3, 2, "#6b2a5a"); break;
      case T.WATER: px(0, 0, 16, 16, "#2a7fae"); px(0, 0, 16, 3, "#3593c4"); px(2 + v * 3, 6, 5, 1, "#7fd0f0"); px(8 - v, 11, 4, 1, "#7fd0f0"); break;
      case T.PALM: px(0, 0, 16, 16, "#4f9a57"); px(7, 6, 2, 10, "#8a5a33");
        g.fillStyle = "#2a6f40"; [[1, 5, 6, 2], [9, 5, 6, 2], [3, 2, 4, 2], [9, 2, 4, 2], [6, 1, 4, 3]].forEach(r => g.fillRect(...r)); px(7, 4, 2, 2, "#8a5a33"); break;
      case T.WALL: px(0, 0, 16, 16, "#5e5680"); px(0, 0, 16, 2, "#7c74a2"); for (let y = 4; y < 16; y += 5) px(0, y, 16, 1, "#433d63"); px(v * 4 + 2, 5, 1, 4, "#433d63"); px(11 - v, 10, 1, 5, "#433d63"); if (v === 2) px(3, 12, 2, 3, "#6b0f1d"); break;
      case T.DARK: px(0, 0, 16, 16, "#332e4f"); px(0, 0, 16, 1, "#2c2845"); px(0, 0, 1, 16, "#2c2845"); if (v === 1) { px(6, 7, 4, 2, "#5a1020"); px(8, 9, 2, 1, "#5a1020"); } break;
      case T.HOUSE: px(0, 0, 16, 16, "#d9a86c"); px(0, 0, 16, 2, "#b98a52"); px(3, 5, 4, 4, "#5b4a8a"); px(4, 6, 2, 2, "#ffd98a"); px(10, 5, 4, 4, "#5b4a8a"); px(11, 6, 2, 2, "#ffd98a"); break;
      case T.ROOF: px(0, 0, 16, 16, "#a8403a"); for (let y = 2; y < 16; y += 4) px(0, y, 16, 1, "#7f2a24"); px(0, 0, 16, 1, "#c8605a"); break;
      case T.DOOR: px(0, 0, 16, 16, "#d9a86c"); px(4, 2, 8, 14, "#6b3f24"); px(5, 3, 6, 13, "#8a5533"); px(9, 9, 1, 1, "#ffd24a"); break;
      case T.PATH: px(0, 0, 16, 16, "#d3c1a3"); for (let i = 0; i < 5; i++) px(Math.floor(rnd(i) * 14), Math.floor(rnd(i + 2) * 14), 2, 1, "#bfa985"); break;
      case T.ROCK: px(0, 0, 16, 16, "#e3dde9"); g.fillStyle = "#857ea5"; g.beginPath(); g.moveTo(1, 15); g.lineTo(4, 4); g.lineTo(9, 1); g.lineTo(14, 6); g.lineTo(15, 15); g.fill(); px(5, 5, 3, 2, "#aba4c8"); px(3, 13, 12, 2, "#5e5680"); break;
      case T.BRIDGE: px(0, 0, 16, 16, "#2a7fae"); px(0, 2, 16, 12, "#9a6a3e"); for (let x = 0; x < 16; x += 4) px(x, 2, 1, 12, "#7a4f2b"); px(0, 2, 16, 1, "#c08a55"); break;
      case T.CRYSTAL: px(0, 0, 16, 16, "#332e4f"); g.fillStyle = "#9ef0f5"; g.beginPath(); g.moveTo(8, 1); g.lineTo(12, 8); g.lineTo(8, 15); g.lineTo(4, 8); g.fill(); px(7, 4, 2, 6, "#e8ffff"); px(10, 9, 3, 5, "#5fc7d6"); break;
      case T.LOCKED: px(0, 0, 16, 16, "#5e5680"); px(3, 1, 10, 15, "#4a3a22"); px(4, 2, 8, 13, "#7a5a2e"); px(6, 7, 4, 4, "#ffcf4a"); px(7, 8, 2, 2, "#2b2350"); break;
      case T.LDOOR: px(0, 0, 16, 16, "#5e5680"); px(3, 1, 10, 15, "#120f24"); px(4, 1, 8, 2, "#2b2350"); px(6, 6, 4, 4, "#8a1020"); px(7, 7, 2, 2, "#ffcf4a"); break;
      case T.WELL: px(0, 0, 16, 16, "#e6c98f"); px(2, 5, 12, 10, "#857ea5"); px(4, 7, 8, 6, "#2a7fae"); px(2, 2, 2, 8, "#6b3f24"); px(12, 2, 2, 8, "#6b3f24"); px(2, 1, 12, 2, "#a8403a"); break;
      case T.GATE: px(0, 0, 16, 16, "#5e5680"); px(2, 0, 12, 16, "#3a2a1e"); for (let x = 3; x < 14; x += 3) px(x, 0, 1, 16, "#ffcf4a"); break;
      case T.CITY: px(0, 0, 16, 16, "#3b4f9a"); px(2 + v * 2, 3, 4, 13, "#5a70c0"); px(9, 6 - v, 5, 10, "#4a60b0"); px(3 + v * 2, 5, 2, 2, "#ffd98a"); px(10, 8, 2, 2, "#ffd98a"); px(0, 0, 16, 2, "#2a3a78"); break;
      case T.COBBLE: px(0, 0, 16, 16, "#8a8498"); for (let y = 0; y < 16; y += 4) for (let x = (y / 4 % 2) * 4; x < 16; x += 8) { px(x, y, 7, 3, v === 1 ? "#a09aae" : "#9a94a8"); px(x, y, 7, 1, "#b0aabe"); }
        if (v === 2) px(9, 6, 2, 2, "#6fbf62"); break;
      case T.SHALLOW: px(0, 0, 16, 16, "#4f98a4"); px(0, 0, 16, 2, "#5aa8b4"); px(2 + v * 3, 7, 4, 1, "#9ad8e0"); px(9 - v, 12, 3, 1, "#9ad8e0"); if (v === 2) { px(12, 3, 1, 4, "#3a7a3a"); px(13, 4, 1, 3, "#3a7a3a"); } break;
      case T.DECK: px(0, 0, 16, 16, "#8a5a33"); for (let y = 0; y < 16; y += 4) { px(0, y, 16, 1, "#6b3f24"); px((y * 3) % 16, y + 1, 1, 3, "#6b3f24"); } px(0, 2, 16, 1, "#a8703f"); break;
      case T.HULL: px(0, 0, 16, 16, "#3a2418"); for (let x = 0; x < 16; x += 4) px(x, 0, 1, 16, "#2a180e"); px(0, 0, 16, 2, "#5a3a24"); px(0, 13, 16, 1, "#6b4a2a"); break;
      case T.ABYSS: px(0, 0, 16, 16, "#142040"); px(0, 0, 16, 1, "#101a34"); if (v === 1) { px(4, 5, 8, 1, "#24406a"); px(7, 3, 2, 5, "#24406a"); } else { px(10, 11, 2, 2, "#1e3458"); } break;
      case T.CORAL: px(0, 0, 16, 16, "#142040"); { const c = ["#c8506a", "#e08a4a", "#9a4aa8"][v]; px(3, 6, 3, 10, c); px(9, 3, 3, 13, c); px(1, 8, 4, 2, c); px(11, 6, 4, 2, c); px(6, 10, 4, 2, c); px(9, 3, 1, 13, "#ffb0c0"); } break;
      case T.CLIFF: px(0, 0, 16, 16, "#2a2438"); px(0, 0, 16, 3, "#3a3450"); px(2 + v * 3, 5, 5, 2, "#433c5c"); px(9 - v, 11, 5, 1, "#1e1a2c"); px(1, 13, 14, 3, "#1e1a2c"); break;
      case T.STONE: px(0, 0, 16, 16, "#7a7488"); for (let i = 0; i < 6; i++) px(Math.floor(rnd(i) * 15), Math.floor(rnd(i + 4) * 15), 2, 1, i % 2 ? "#6a6478" : "#8a8498"); break;
      case T.SPIRE: px(0, 0, 16, 16, "#3a4468"); px(0, 0, 16, 1, "#2e3658"); px(0, 0, 1, 16, "#2e3658"); px(7, 6, 2, 1, "#5a6aa8"); px(8, 7, 1, 3, "#5a6aa8"); break;
      case T.SWALL: px(0, 0, 16, 16, "#1e2440"); px(0, 0, 16, 2, "#2e3660"); for (let y = 4; y < 16; y += 5) px(0, y, 16, 1, "#161a30"); px(6, 7, 3, 3, "#3ee0e8"); px(7, 8, 1, 1, "#e8ffff"); break;
      case T.ROOFB: px(0, 0, 16, 16, "#3a5aa8"); for (let y = 2; y < 16; y += 4) px(0, y, 16, 1, "#2a4078"); px(0, 0, 16, 1, "#5a7ac8"); break;
      case T.FOUNTAIN: px(0, 0, 16, 16, "#8a8498"); px(1, 4, 14, 11, "#aba4c8"); px(3, 6, 10, 7, "#2a7fae"); px(7, 1, 2, 8, "#aba4c8"); px(6, 0, 4, 2, "#c8c2e0"); px(4 + v, 8, 3, 1, "#9ad8f0"); break;
      case T.FLOOR: px(0, 0, 16, 16, "#a07a4a"); for (let y = 0; y < 16; y += 4) px(0, y, 16, 1, "#8a6438"); px(4, 1, 1, 3, "#8a6438"); px(11, 5, 1, 3, "#8a6438"); px(7, 9, 1, 3, "#8a6438"); px(2, 13, 1, 3, "#8a6438"); break;
      case T.GDOOR: px(0, 0, 16, 16, "#5e5680"); px(2, 1, 12, 15, "#6b4a1a"); px(3, 2, 10, 13, "#c9a227"); px(7, 2, 2, 13, "#8a6a2a"); px(5, 8, 2, 2, "#1b1633"); px(9, 8, 2, 2, "#1b1633"); break;
      case T.DEBRIS: px(0, 0, 16, 16, "#4f98a4"); px(1, 4, 14, 3, "#6b4a2a"); px(0, 8, 12, 3, "#5a3a20"); px(4, 12, 12, 3, "#6b4a2a"); px(2, 5, 12, 1, "#8a6438"); px(6, 1, 3, 3, "#3a7a3a"); break;
      case T.STAIRS: px(0, 0, 16, 16, "#3a4468"); for (let i = 0; i < 4; i++) { px(2, 2 + i * 3, 12, 2, "#c8c2e0"); px(2, 4 + i * 3, 12, 1, "#7a7488"); } break;
      case T.PEDESTAL: px(0, 0, 16, 16, "#332e4f"); px(3, 9, 10, 6, "#857ea5"); px(4, 8, 8, 2, "#aba4c8"); px(5, 14, 6, 2, "#5a1020"); break;
    }
    tileCache.set(key, c);
    return c;
  }
  const VARIANTS = { [T.SALT]: 3, [T.GRASS]: 3, [T.WATER]: 3, [T.WALL]: 3, [T.DARK]: 2, [T.CITY]: 3, [T.SAND]: 2, [T.MUD]: 2, [T.COBBLE]: 3, [T.SHALLOW]: 3, [T.ABYSS]: 2, [T.CLIFF]: 3, [T.STONE]: 2, [T.CORAL]: 3 };

