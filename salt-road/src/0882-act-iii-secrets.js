  // ================================================================== ACT III: SECRETS, FAVOURS AND FISH
  // Once each part of Act III is settled, its region keeps something for players who look: a hidden boss (the White
  // Hart in the Rime's pines at night, Old Silt in the reeds below the weir, the First Clerk behind the ledger vault),
  // a favour for one of its people (Brannoc's father's pick, a living fish for Pip, the tank-hall lamps for Wick), and
  // fish of its own: through a hole in the Rime's lake ice, in the reservoir behind the weir, in the cistern's canal.
  const XS = {
    hart: { x: 158, y: 176, area: "rime" }, silt: { x: 160, y: 230, area: "river" }, clerk: { x: 21, y: 276, area: "vault" },
    pick: { x: 12, y: 183 }, lamps: [[131, 249], [143, 249], [157, 249]],
  };
  const xf = () => G.flags;
  // clear a little ground round each secret so it can be reached whatever the scatter of pines, reeds and bones put there
  const _buildMapXS = buildMap;
  buildMap = function () {
    _buildMapXS();
    const clear = (x0, y0, r, t) => { for (let y = y0 - r; y <= y0 + r; y++) for (let x = x0 - r; x <= x0 + r; x++) set(x, y, t); };
    clear(XS.hart.x, XS.hart.y, 2, T.SNOW); carve([[XS.hart.x - 2, XS.hart.y], [140, XS.hart.y], [140, 182]], T.SNOW);
    clear(XS.silt.x, XS.silt.y, 2, T.SHALLOW); carve([[XS.silt.x - 2, XS.silt.y], [WEIR.reeds.x0 + 2, XS.silt.y]], T.SHALLOW);
    clear(XS.pick.x, XS.pick.y, 1, T.SNOW); carve([[XS.pick.x + 1, XS.pick.y], [24, XS.pick.y], [24, 168]], T.SNOW);
    for (const [x, y] of XS.lamps) set(x, y, T.FLAG);
  };
  // ---- the hidden bosses
  Object.assign(MONSTERS, {
    hart: { name: "The White Hart of the Rime", hp: 940, atk: 22, def: 9, spd: 14, xp: 620, coin: [180, 180], sprite: "hart", boss: true, music: "boss", tall: true,
      moves: [{ name: "Antler Rake", w: 3, power: 1.2, bleed: [4, 2] }, { name: "Hoarfrost Breath", w: 2, power: 0.8, all: true, weakAll: 1 }, { name: "Vanish into Snow", w: 1, guard: true, heal: 40 },
        { name: "The Long Night", w: 0, charge: true, power: 1.9, all: true }] },
    silt: { name: "Old Silt, Mother of Eels", hp: 1120, atk: 22, def: 8, spd: 8, xp: 640, coin: [190, 190], sprite: "silt", boss: true, music: "boss", tall: true,
      moves: [{ name: "Coil and Crush", w: 3, power: 1.3, stunChance: 0.25 }, { name: "Brood", w: 2, power: 0.7, hits: 3 }, { name: "Mud Wallow", w: 1, guard: true, heal: 36 },
        { name: "Drag to the Bottom", w: 0, charge: true, power: 1.9, all: true },
        { name: "Call the Brood", w: 0, summonKind: "silteel", summonText: "The reeds thrash. Two of her children come up out of the mud." }] },
    firstclerk: { name: "The First Clerk", hp: 1000, atk: 23, def: 11, spd: 10, xp: 660, coin: [240, 240], sprite: "firstclerk", boss: true, music: "boss", tall: true,
      moves: [{ name: "Entry in Red", w: 3, power: 1.25, weakOne: 2 }, { name: "Carry the Sum", w: 2, power: 0.85, all: true }, { name: "Strike a Line", w: 2, power: 1.0, bleed: [4, 2] },
        { name: "Close the Book", w: 0, charge: true, power: 2.0, all: true },
        { name: "Summon the Staff", w: 0, summonKind: "tallyman", summonText: "The First Clerk taps the desk twice. Two tallymen push their chairs back." }] },
  });
  Object.assign(BESTIARY, {
    hart: "A deer of ice that walks the Rime's dead pines on the longest nights. Kelda says it was the saint's before it was anyone's, and that it never forgave her for staying inside.",
    silt: "The eel that mothered every eel in the riverbed. She came down with the first river three generations ago and has been waiting in the mud ever since for the second.",
    firstclerk: "The cistern's first clerk, who wrote the first line in the first ledger: who owns the water. He has been sitting behind the vault wall since, waiting for somebody to dispute it.",
  });
  PHASE2.hart = ["The night is long. I am longer.", "#e0f4ff"]; P2NAME.hart = "The Hart of the Long Night";
  PHASE2.silt = ["Down. DOWN. Where it's soft.", "#9a7e56"]; P2NAME.silt = "Old Silt, Uncoiled";
  PHASE2.firstclerk = ["Objection noted. Objection overruled.", "#9a1224"]; P2NAME.firstclerk = "The First Clerk, in Red";
  RELICS.hartcrown = { name: "The Hart's Crown", from: "hart", desc: "A tine of the White Hart's antler. +3 speed, +10% critical chance, and stuns don't take.", spd: 3, crit: 0.1, noStun: true };
  RELICS.siltpearl = { name: "Silt Pearl", from: "silt", desc: "Grown round a grain of the first river's mud. Regenerate 5 health each turn, +2 defence.", regen: 5, def: 2 };
  RELICS.firstpen = { name: "The First Pen", from: "firstclerk", desc: "The pen that wrote the first line. +4 attack, +2 SP each turn.", atk: 4, spRegen: 2 };
  const hartBody = (K, ph, night) => {
    const b = Math.sin(ph * Math.PI * 2) * 2, W2 = 288, cx = W2 / 2;
    K.E(cx, 344, 120, 10, "rgba(7,6,12,0.4)");
    if (night) K.E(cx, 140, 140, 140, K.RG(cx, 140, 10, 140, [[0, "rgba(224,244,255,0.35)"], [1, "rgba(224,244,255,0)"]]));
    // legs, long and fine, hooves of black ice
    for (const [x, d] of [[cx - 50, 1], [cx - 30, -1], [cx + 34, 1], [cx + 54, -1]]) { const sw = Math.sin(ph * Math.PI * 2 + d) * 3; K.S([[x, 230], [x + sw, 280], [x + sw * 2, 330]], 9, "#b4bccc"); K.S([[x - 2, 232], [x + sw - 2, 280]], 3, "#ffffff"); K.E(x + sw * 2, 334, 7, 4, "#0e1a2e"); }
    K.vol(cx, 210 + b, 80, 36, ["#ffffff", "#dce2ec", "#7a8496"]);   // the body
    for (let i = 0; i < 14; i++) K.S([[cx - 70 + i * 10, 186 + b], [cx - 66 + i * 10, 236 + b]], 1, "rgba(122,132,150,0.35)");
    K.P([[cx + 60, 196 + b], [cx + 88, 150 + b], [cx + 104, 152 + b], [cx + 82, 210 + b]], "#dce2ec");   // the neck
    K.vol(cx + 104, 140 + b, 20, 16, ["#ffffff", "#dce2ec", "#7a8496"], -0.4);   // the head
    K.P([[cx + 112, 148 + b], [cx + 136, 160 + b], [cx + 128, 168 + b], [cx + 108, 160 + b]], "#dce2ec");
    K.eye(cx + 108, 136 + b, 3.4, night ? "#3ee0e8" : "#9ef0f5", null);
    // antlers of ice, branching; at night they are lit from inside and frost runs off them
    const tine = (x, y, a, len, depth) => { if (depth > 3) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; K.S([[x, y], [x2, y2]], 5 - depth, night ? "#e0f4ff" : "#a8d4ec"); tine(x2, y2, a - 0.45, len * 0.65, depth + 1); tine(x2, y2, a + 0.35, len * 0.6, depth + 1); };
    tine(cx + 98, 126 + b, -1.9, 46, 0); tine(cx + 110, 124 + b, -1.2, 46, 0);
    if (night) for (let i = 0; i < 24; i++) K.R(cx - 40 + K.rng() * 200, 20 + K.rng() * 140, 1.8, 1.8, "rgba(255,255,255,0.85)");
    K.Q([[cx - 78, 200 + b], [cx - 96, 188 + b], [cx - 92, 176 + b]], 6, "#ffffff");   // the tail
  };
  BOSS_ART.hart = { w: 96, h: 118, ramps: ["ink", "frost", "ice", "glowc", "night"], paint(K, ph) { hartBody(K, ph, false); } };
  P2ART.hart = { w: 96, h: 118, ramps: ["ink", "frost", "ice", "glowc", "night"], paint(K, ph) { hartBody(K, ph, true); } };
  const siltBody = (K, ph, loose) => {
    const w = Math.sin(ph * Math.PI * 2), W2 = 288, cx = W2 / 2;
    K.E(cx, 330, 140, 18, "rgba(58,44,30,0.7)");   // her wallow
    // a vast coil rising out of the mud; uncoiled, she stands up out of it to her full length
    const top = loose ? 40 : 120, pts = []; for (let i = 0; i <= 18; i++) { const a = i / 18; pts.push([cx + Math.sin(a * Math.PI * (loose ? 1.4 : 3) + w * 0.6) * (loose ? 70 : 90) * (1 - a * 0.5), 330 - a * (330 - top)]); }
    K.S(pts, 54, "#3a2c1e"); K.S(pts, 44, "#6a5236"); K.S(pts.map(([x, y]) => [x - 8, y - 4]), 12, "#9a7e56");
    for (let i = 1; i < 18; i += 2) K.E(pts[i][0] + 10, pts[i][1], 4, 3, "#c8aa7c");
    for (let i = 3; i < 17; i++) K.P([[pts[i][0] - 20, pts[i][1]], [pts[i][0] - 34, pts[i][1] - 6 - (i % 3) * 4], [pts[i][0] - 22, pts[i][1] - 10]], "#3a2c1e");
    const [hx, hy] = pts[18]; K.vol(hx, hy, 36, 26, ["#9a7e56", "#6a5236", "#1a140e"]);
    K.E(hx + 18, hy + 10, 22, loose ? 18 : 10, "#1a140e"); K.teeth(hx + 2, hy + 4, 8, 4, 8, "#ecdcb8"); if (loose) K.teeth(hx + 2, hy + 24, 8, 4, -7, "#ecdcb8");
    K.eye(hx - 10, hy - 10, 5, "#f6e07a"); K.eye(hx + 8, hy - 14, 3.6, "#f6e07a");
    for (let i = 0; i < 4; i++) K.Q([[hx + 30, hy], [hx + 54 + i * 6, hy - 30 + i * 12], [hx + 62 + i * 8, hy - 10 + i * 14]], 2.4, "#3a2c1e");   // barbels like roots
    for (let i = 0; i < 10; i++) { const x = cx - 120 + K.rng() * 240; K.vol(x, 316 + K.rng() * 10, 8, 5, ["#9a7e56", "#6a5236", "#1a140e"]); }   // her brood in the mud
    for (let i = 0; i < 16; i++) K.drip(cx - 80 + K.rng() * 160, 200 + K.rng() * 100, 6 + K.rng() * 14, 2, "#3a2c1e");
  };
  BOSS_ART.silt = { w: 96, h: 118, ramps: ["ink", "silt", "leech", "bone", "glowy"], paint(K, ph) { siltBody(K, ph, false); } };
  P2ART.silt = { w: 96, h: 118, ramps: ["ink", "silt", "leech", "bone", "glowy"], paint(K, ph) { siltBody(K, ph, true); } };
  const clerkBody = (K, ph, red) => {
    const b = Math.sin(ph * Math.PI * 2) * 1.5, W2 = 288, cx = W2 / 2;
    K.E(cx, 344, 120, 10, "rgba(7,6,12,0.4)");
    // the desk he has never left, the first ledger open on it, the high stool
    K.P([[cx - 120, 250], [cx + 120, 250], [cx + 110, 340], [cx - 110, 340]], K.LG(0, 250, 0, 340, [[0, "#5a3a1a"], [1, "#2a180a"]])); K.R(cx - 124, 244, 248, 10, "#6a4a24");
    K.P([[cx - 70, 236], [cx, 246], [cx + 70, 236], [cx + 70, 214], [cx, 222], [cx - 70, 214]], "#f4eed6"); K.S([[cx, 222], [cx, 246]], 2, "#5a1a12");
    for (let l = 0; l < 4; l++) { K.S([[cx - 62, 220 + l * 5], [cx - 8, 226 + l * 5]], 1, l === 0 ? "#9a1224" : "#6a6250"); K.S([[cx + 8, 226 + l * 5], [cx + 62, 220 + l * 5]], 1, "#6a6250"); }
    // the clerk: tall, thin as a quill, in black gone green, sleeve-guards, and an ink-pot heart that beats
    K.P([[cx - 34, 110 + b], [cx + 34, 110 + b], [cx + 44, 246], [cx - 44, 246]], K.LG(cx - 44, 0, cx + 44, 0, [[0, "#0e1414"], [0.5, red ? "#4a1212" : "#2a3a32"], [1, "#0a0e0e"]]));
    K.E(cx, 170 + b, 14, 16, red ? "#9a1224" : "#07060c"); K.E(cx - 4, 164 + b, 4, 4, "rgba(255,255,255,0.3)");
    for (const s of [-1, 1]) { K.S([[cx + s * 34, 120 + b], [cx + s * 66, 170 + b], [cx + s * 56, 216 + b]], 10, red ? "#4a1212" : "#2a3a32"); K.R(cx + s * 56 - 10, 196 + b, 20, 18, "#ddd4b0"); K.vol(cx + s * 56, 222 + b, 8, 7, ["#b8c0a8", "#7e8a74", "#2e3a2a"]); }
    K.S([[cx + 56, 222 + b], [cx + 78, 160 + b]], 3, "#f4eed6"); K.P([[cx + 76, 166 + b], [cx + 86, 130 + b], [cx + 82, 168 + b]], "#ddd4b0");   // the first pen, a long quill
    K.vol(cx, 82 + b, 22, 28, ["#b8c0a8", "#7e8a74", "#2e3a2a"]);
    K.P([[cx - 24, 72 + b], [cx - 20, 48 + b], [cx + 20, 48 + b], [cx + 24, 72 + b]], "#0e1414");
    for (const s of [-1, 1]) { K.E(cx + s * 9, 82 + b, 6, 5, "#ddd4b0"); K.E(cx + s * 9, 82 + b, 2, 2, red ? "#ff2d2d" : "#07060c"); }
    K.S([[cx - 3, 82 + b], [cx + 3, 82 + b]], 1.2, "#b08a28");
    for (let i = 0; i < (red ? 8 : 3); i++) K.drip(cx - 8 + i * 2.4, 98 + b, 10 + (i % 3) * 8, 1.4, red ? "#9a1224" : "#07060c");
    if (red) for (let i = 0; i < 18; i++) { const a = ph * Math.PI * 2 + i * 0.35, r = 90 + (i % 3) * 20; K.S([[cx + Math.cos(a) * r, 140 + Math.sin(a) * r * 0.6], [cx + Math.cos(a) * (r + 12), 140 + Math.sin(a) * (r + 12) * 0.6]], 3, "#9a1224"); }   // red lines struck through the air
  };
  BOSS_ART.firstclerk = { w: 96, h: 118, ramps: ["ink", "paper", "corpse", "cloth", "gold", "blood"], paint(K, ph) { clerkBody(K, ph, false); } };
  P2ART.firstclerk = { w: 96, h: 118, ramps: ["ink", "paper", "corpse", "cloth", "gold", "blood"], paint(K, ph) { clerkBody(K, ph, true); } };
  const hiddenReady = {
    hart: () => !!xf().rimeDone && !xf().hartDead && isNight(),
    silt: () => !!xf().weirDone && !xf().siltDead,
    clerk: () => !!xf().cisDone && !xf().firstclerkDead,
  };
  Object.assign(D, {
    hart_0: say(null, "(Between the dead pines, where there were only your own tracks a moment ago, there are other tracks: split hooves, wider than your hand. At the end of them a white deer stands looking at you. Its antlers are ice, and lit from inside.) It lowers its head.", null, () => startBattle(["hart"], { boss: "hart", area: "rime" })),
    hart_day: say(null, "Split-hoof tracks in the snow between the pines, wider than your hand, frozen hard. They come from nowhere and go nowhere. (Wynn says the White Hart walks here on the long nights.)"),
    silt_0: say(null, "(The reeds here have been flattened into a great slow spiral. In the middle the mud breathes. Then it opens one yellow eye, and then another, and keeps opening.)", null, () => startBattle(["silt"], { boss: "silt", area: "river" })),
    clerk_0: say(null, "(Behind the last pedestal, a seam in the vault wall that isn't masonry: it's a door, painted to look like wall. Behind it, a desk, a lamp that has never gone out, and a very old clerk who looks up and dips his pen.) Dispute? At last. State your claim. The first line reads: THE WATER BELONGS TO THE ONE WHO WRITES IT DOWN.", null, () => startBattle(["firstclerk"], { boss: "firstclerk", area: "vault" })),
  });
  const _interactXS = interact;
  interact = function () {
    if (mode === "play") {
      if (xf().rimeDone && !xf().hartDead && near({ x: XS.hart.x * TILE + 8, y: XS.hart.y * TILE + 8 }, 30)) { openDialog(hiddenReady.hart() ? "hart_0" : "hart_day"); return true; }
      if (hiddenReady.silt() && near({ x: XS.silt.x * TILE + 8, y: XS.silt.y * TILE + 8 }, 30)) { openDialog("silt_0"); return true; }
      if (hiddenReady.clerk() && near({ x: XS.clerk.x * TILE + 8, y: XS.clerk.y * TILE + 8 }, 30)) { openDialog("clerk_0"); return true; }
      if (xf().pickQuest && !xf().pickFound && near({ x: XS.pick.x * TILE + 8, y: XS.pick.y * TILE + 8 }, 26)) { xf().pickFound = true; save(); Music.sound("item"); toast("Half out of the thawing quarry ice: an ice pick with a bone handle, worn to the shape of a hand. Brannoc's father's."); return true; }
      if (xf().lampQuest && !xf().lampsDone) for (let i = 0; i < XS.lamps.length; i++) { const [x, y] = XS.lamps[i]; if (near({ x: x * TILE + 8, y: y * TILE + 8 }, 22) && !(xf().lampsLit || []).includes(i)) {
        xf().lampsLit = [...(xf().lampsLit || []), i]; if (xf().lampsLit.length >= XS.lamps.length) xf().lampsDone = true; save(); Music.sound("item");
        toast(xf().lampsDone ? "The last of the tank-hall lamps catches. The brass shines all the way down the hall. (Tell Wick.)" : `You light a tank-hall lamp with Wick's taper. (${xf().lampsLit.length} of ${XS.lamps.length})`); return true; } }
    }
    return _interactXS();
  };
  const _bossEndXS = act2BossEndB;
  act2BossEndB = function (boss) {
    _bossEndXS(boss);
    const f = xf(), msg = { hart: "The Hart goes down onto its knees in the snow and is snow. In the morning there are no tracks at all.", silt: "Old Silt sinks back into her wallow, slowly, and the mud closes over her. Her children stay down. The reeds stand up again.", firstclerk: "The First Clerk puts down his pen, turns the ledger round so that it faces you, and draws one line through the first line. Then he blows out his lamp." }[boss];
    if (!msg) return;
    f[boss + "Dead"] = true; save(); setTimeout(() => toast(msg), 600);
  };
  // the hart's lamp-lit tracks, the silt-spiral, and the painted door
  const _addProp2XS = addProp2;
  addProp2 = () => {
    _addProp2XS();
    addProp("cairn", XS.hart.x + 2, XS.hart.y - 2); addProp("whirlpool", XS.silt.x, XS.silt.y); addProp("candles", XS.clerk.x, XS.clerk.y - 1);
    for (const [x, y] of XS.lamps) addProp("lamp", x, y - 1);
  };
  // ---- favours: Brannoc's father's pick, a living fish for Pip, the tank-hall lamps for Wick
  const reward = (coins, items) => { G.coins += coins; for (const [k, n] of Object.entries(items)) G.items[k] = (G.items[k] || 0) + n; Music.sound("victory"); save(); updateHud();
    toast(`+${coins} coin${Object.entries(items).map(([k, n]) => `, ${ITEMS[k].name} ×${n}`).join("")}`); };
  const weirFish = () => ["trout", "weirpike"].some(k => (xf().fishLog || {})[k]);
  Object.assign(D, {
    brannoc_pick0: { who: "brannoc", text: "With the ice going, the quarry's giving things back. Boots. A cup. ...My father's pick went into the ice the winter he froze; bone handle, his hand wore it to a grip. If you're down the quarry, south-west, would you look? I can't go. I've tried.", choices: [
      { t: "\"I'll look.\"", go: "brannoc_pick1" }, { t: "\"Not now.\"", go: null }] },
    brannoc_pick1: say("brannoc", "South-west corner of the quarry, where the blocks are cut deepest. Thank you.", null, () => { xf().pickQuest = true; save(); }),
    brannoc_pickwait: say("brannoc", "South-west corner of the quarry. The deepest cuts."),
    brannoc_pickdone: say("brannoc", "(He takes the pick in both hands and doesn't say anything for a while.) ...It's warm. It shouldn't be warm, it's been in the ice nine years. Here. Take what I've put by. I was saving it for something and this is the something.", null, () => { xf().pickDone = true; reward(160, { gsalve: 2 }); }),
    pip_fish0: { who: "pip", text: "Will you catch me a fish? A live one, not bones. From the water behind the wall, now anybody can fish there. I'll keep it in Gran's bucket. (Old Hake in Kessa lends rods, if you haven't got one.)", choices: [
      { t: "\"I'll catch you one.\"", go: "pip_fish1" }, { t: "\"Maybe later.\"", go: null }] },
    pip_fish1: say("pip", "A live one! With a face!", null, () => { xf().fishQuest = true; save(); }),
    pip_fishwait: say("pip", "Behind the wall, in the held water. A live one, with a face."),
    pip_fishdone: say("pip", "(Pip looks into the bucket for a long time.) It's looking at me. ...I'm going to call it Tull, after Gran. Don't tell her. Here, you can have my bone collection. And Gran's coin jar. She said I could. She didn't say I could.", null, () => { xf().fishDone = true; reward(140, { ether: 2 }); }),
    wick_lamp0: { who: "wick", text: "The three lamps on the top row of the tank hall went out and Grandad's knees won't do the ladder any more. I'm not allowed up the ladder. You're allowed. Will you light them? Here's my taper.", choices: [
      { t: "\"Give me the taper.\"", go: "wick_lamp1" }, { t: "\"Another time.\"", go: null }] },
    wick_lamp1: say("wick", "The top row, between the tanks. Three. Don't let the taper go out, it's my good one.", null, () => { xf().lampQuest = true; save(); }),
    wick_lampwait: say("wick", "The top row of the tank hall. You can see which ones are dark."),
    wick_lampdone: say("wick", "You lit them! I could see them all the way from here. Grandad cried a bit but he said it was the smoke. Here. It's Grandad's lamp-oil money. He said it's yours now, because you did the lamps, and the lamps are the job.", null, () => { xf().lampDone = true; reward(200, { phoenix: 1 }); }),
  });
  const _dialogForXS = dialogFor;
  dialogFor = function (n) {
    const f = xf();
    if (n.id === "brannoc" && f.rimeDone && !f.pickDone) return f.pickFound ? "brannoc_pickdone" : f.pickQuest ? "brannoc_pickwait" : "brannoc_pick0";
    if (n.id === "pip" && f.weirDone && !f.fishDone) return f.fishQuest && weirFish() ? "pip_fishdone" : f.fishQuest ? "pip_fishwait" : "pip_fish0";
    if (n.id === "wick" && f.cisDone && !f.lampDone) return f.lampsDone ? "wick_lampdone" : f.lampQuest ? "wick_lampwait" : "wick_lamp0";
    return _dialogForXS(n);
  };
  // the people who know about the secrets say so, once their part is settled
  D.wynn_after.text += " ...Mother Hild says not to go out to the east pines on the long nights. Because of the Hart. She says it like she's seen it.";
  D.tull_after.text += " Pip says something big lives in the reeds where the wall seeps, something that breathes. Pip says a lot of things. I've stopped letting the goats graze there.";
  D.marta_after.text += " Odd thing: the vault's west wall measures a pace short on the inside. I've measured it three times.";
  // the journal's side quests
  const _renderJournalXS = renderJournal;
  renderJournal = function () {
    _renderJournalXS();
    const h = [...$("journalBody").querySelectorAll("h3")].find(x => x.textContent === "Side quests"), ul = h && h.nextElementSibling; if (!ul) return;
    const f = xf(), rows = [];
    if (f.pickQuest) rows.push([f.pickDone, f.pickDone ? "Brannoc's father's pick is home." : f.pickFound ? "You found the bone-handled pick. Take it to Brannoc in Kelda." : "Find Brannoc's father's pick in the south-west corner of the Rime's quarry."]);
    if (f.fishQuest) rows.push([f.fishDone, f.fishDone ? "Pip has a fish called Tull." : weirFish() ? "You caught a fish from the reservoir. Bring Pip the news in Lowwater." : "Catch a fish from the water behind the weir for Pip."]);
    if (f.lampQuest) rows.push([f.lampDone, f.lampDone ? "The tank-hall lamps are lit." : f.lampsDone ? "All three lamps are lit. Tell Wick." : `Light the three dark lamps on the top row of the tank hall (${(f.lampsLit || []).length} of 3).`]);
    if (!rows.length) return;
    ul.querySelector("li.dim") && ul.querySelector("li.dim").remove();
    for (const [done, t] of rows.reverse()) ul.insertAdjacentHTML("afterbegin", `<li class="${done ? "done" : ""}">${done ? "✓ " : ""}Act III: ${t}</li>`);
  };
  // ---- fish: through a hole in the Rime's lake ice, behind the weir, in the cistern's canal
  Object.assign(FISH, {
    smelt: { name: "Frost Smelt", where: "rime", rare: 0, pay: 6, lore: "Thin as a knife and nearly see-through. Kelda's children catch them through holes in the lake ice and eat them frozen, like sweets." },
    saintchar: { name: "Saint's Char", where: "rime", rare: 2, pay: 22, lore: "Silver-blue with a pale ring on each side, like a halo. Kelda says they swam in the lake before the saint froze it and waited under the ice for her to let go." },
    trout: { name: "Reservoir Trout", where: "weir", rare: 0, pay: 6, lore: "Fat from a summer of held water. The Company counted them as stock. They did not count themselves as anything." },
    weirpike: { name: "Weir Pike", where: "weir", rare: 1, pay: 12, lore: "It waits at the foot of the wall where the seep comes through, and eats whatever the wall lets through. Lowwater calls it the Provost." },
    lampeel: { name: "Lamp Eel", where: "cistern", rare: 1, pay: 14, lore: "Its belly glows faintly, enough to read by. Ivo says the lamplighters used to keep one in a jar for when the oil ran out." },
    goldfish: { name: "Guild Goldfish", where: "cistern", rare: 2, pay: 26, lore: "Somebody's ornamental fish from the vault's fountain, three generations on: big as a cat and the colour of an old coin. It has outlived the Guild that bought it." },
  });
  FISH_IDS.push("smelt", "saintchar", "trout", "weirpike", "lampeel", "goldfish");
  WATERY.add(T.ICE);
  ACHIEVEMENTS.push(["act3secrets", "What the River Left", "Find all three of Act III's hidden foes.", () => G.flags.hartDead && G.flags.siltDead && G.flags.firstclerkDead],
    ["act3favours", "Small Favours", "Do Brannoc, Pip and Wick a favour each.", () => G.flags.pickDone && G.flags.fishDone && G.flags.lampDone]);
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), { act3secrets: () => ({ spots: XS, ready: { hart: hiddenReady.hart(), silt: hiddenReady.silt(), clerk: hiddenReady.clerk() }, fish: Object.keys(FISH).filter(k => ["rime", "weir", "cistern"].includes(FISH[k].where)) }) }), 0);
