  // ================================================================== PROPS
  // Hand-placed and scattered scenery. Solid props block movement; placement avoids paths and story spots.
  const PROPS = [];
  const propSolid = new Set();
  const PROP_SOLID = new Set(["stall", "cart", "deadtree", "pillar", "statue", "barrel", "cairn", "tower", "campfire", "crate"]);
  function addProp(type, x, y, extra = {}) { PROPS.push({ type, x, y, px: x * TILE + 8, py: y * TILE + 8, seed: hash(x * 3 + 1, y * 5 + 2), ...extra }); if (PROP_SOLID.has(type)) propSolid.add(x + "," + y); }
  let addProp2 = () => {};
  function buildProps() {
    PROPS.length = 0; propSolid.clear();
    // Kessa: lamps along the streets, a market by Odo, crates and barrels by the houses
    for (const [x, y] of [[9, 38], [14, 41], [10, 46], [16, 48], [20, 41], [24, 46], [12, 36], [6, 42]]) addProp("lamp", x, y);
    addProp("stall", 24, 42, { color: "#c8102e" }); addProp("stall", 20, 44, { color: "#3b4f9a" }); addProp("stall", 24, 40, { color: "#c9a227" });
    for (const [x, y, t] of [[4, 38, "barrel"], [11, 38, "crate"], [22, 38, "barrel"], [23, 38, "crate"], [3, 47, "barrel"], [9, 47, "crate"], [22, 48, "barrel"]]) addProp(t, x, y);
    addProp("sign", 12, 32, { text: "A salt-bleached signpost. North: THE WELL OF NINE. North-west: nothing but bones. Someone has added in charcoal: DON'T." });
    addProp("sign", 42, 21, { text: "A signpost. North-east: THE GATES OF ORU. South-east: THE DROWNED GROVE (the word GROVE is crossed out and replaced with HUNGRY)." });
    addProp("sign", 47, 30, { text: "A palm-wood sign nailed to a post: KEEP OUT. POND IS SICK. ASK FOR BENO." });
    addProp("sign", 51, 15, { text: "A Guild notice, freshly painted: THE GATES OF ORU ARE CLOSED THIS SEASON BY ORDER OF GUILD MASTER HOLLIS. TRESPASSERS WILL BE DROWNED." });
    // the flats: wrecked carts, dead trees, salt pillars, the courier's cairn and a ruined watchtower
    for (const [x, y] of [[14, 24], [30, 33], [50, 26], [8, 20]]) addProp("cart", x, y);
    addProp("cairn", 66, 22); for (const [x, y] of [[64, 20], [65, 21], [67, 21], [66, 20], [65, 23], [67, 23]]) addProp("grave", x, y);
    addProp("tower", 5, 9);
    addProp("campfire", 56, 15); addProp("campfire", 60, 45);   // beside the gate road, not on it
    const busy = (x, y) => [...NPCS.map(n => [n.x, n.y]), ...CHESTS.map(c => [c.x, c.y]), ...LORE.map(l => [l.x, l.y]), ...SHARDS.map(c => [c.x, c.y]), ...FIELD.map(f => [f.x, f.y]),
      [11, 15], [34, 20], [36, 29], [62, 43], [61, 12], [58, 12], [40, 17], [12, 42], [7, 11], [6, 12], [8, 12]].some(([a, b]) => Math.abs(a - x) + Math.abs(b - y) < 3);
    const nearPath = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ([T.PATH, T.BRIDGE, T.DOOR, T.LDOOR, T.GATE].includes(get(x + dx, y + dy))) return true; return false; };
    for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) {
      const t = get(x, y), r = hash(x * 7 + 3, y * 11 + 5);
      if (busy(x, y) || nearPath(x, y) || propSolid.has(x + "," + y)) continue;
      if ((t === T.SALT || t === T.BONES) && y < 31 && !(x >= 23 && x <= 45 && y <= 20) && !(x >= 50 && y <= 16)) {
        if (r < 0.018) addProp("deadtree", x, y); else if (r < 0.034) addProp("pillar", x, y); else if (r < 0.05) addProp("skulls", x, y);
      } else if (t === T.GRASS && x >= 52) {
        const byWater = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => get(x + dx, y + dy) === T.WATER);
        if (byWater && r < 0.7) addProp("reeds", x, y); else if (r < 0.05) addProp("mushrooms", x, y);
      } else if (t === T.DARK) {
        if (r < 0.03 && y !== 11 && (x === 25 || x === 43 || y === 4 || y === 18)) addProp("statue", x, y);
        else if (r < 0.06) addProp("candles", x, y); else if (r < 0.08) addProp("chains", x, y);
      } else if (t === T.SAND && r < 0.02) addProp("flowers", x, y);
    }
    for (let x = 53; x <= 68; x += 3) addProp("banner", x, 10, { flat: true });
    addProp2();
  }
  const propAt = (x, y) => propSolid.has(Math.floor(x / TILE) + "," + Math.floor(y / TILE));

