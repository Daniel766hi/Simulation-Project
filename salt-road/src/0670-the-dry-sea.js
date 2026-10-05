  // ================================================================== THE DRY SEA (rows 90-139)
  // The old seabed south of the Glass Flats, where the salt caravans run. Opens after Chapter I.
  const DRY = { y0: 90, y1: 139, gate: [44, 52], land: [44, 92] };
  // an integer-safe hash (the shared one loses precision on large inputs, and changing it would reshuffle the old map)
  const rnd = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  const PANS = [];   // brine pans for salt raking: [x, y] of each pan's top-left corner
  for (let y = 97; y <= 131; y += 7) for (let x = 6; x <= 36; x += 8) PANS.push([x, y]);
  const STAR_STONES = [[10, 100], [30, 135], [121, 95], [163, 131], [104, 135]];
  const _buildMapD = buildMap;
  buildMap = function () {
    _buildMapD();
    const Y0 = DRY.y0;
    rect(0, Y0, W - 1, DRY.y1, T.CLIFF);
    for (let y = Y0 + 1; y < DRY.y1; y++) for (let x = 1; x < W - 1; x++) set(x, y, x <= 44 ? T.SALT : rnd(x * 5 + 3, y * 7 + 1) < 0.03 ? T.BONES : T.SAND);
    for (const [x, y] of PANS) rect(x, y, x + 3, y + 2, T.SHALLOW);                       // brine pans
    for (let i = 0; i < 90; i++) {                                                        // dune ridges in the east
      const x = 100 + Math.floor(rnd(i * 17 + 3, 811) * 64), y = Y0 + 3 + Math.floor(rnd(813, i * 23 + 5) * 44), len = 3 + Math.floor(rnd(i * 7 + 1, 817) * 5), horiz = rnd(819, i * 11 + 2) < 0.6;
      for (let k = 0; k < len; k++) { const tx = horiz ? x + k : x, ty = horiz ? y : y + k; if (Math.abs(ty - 113) > 2 && tx < W - 1 && ty < DRY.y1) set(tx, ty, T.ROCK); }
    }
    carve([[44, Y0 + 1], [44, 113], [166, 113]], T.PATH);                                // the caravan road
    carve([[52, 113], [52, 126]], T.PATH); carve([[152, 113], [152, 104]], T.PATH);
    rect(62, 104, 96, 124, T.WALL); rect(63, 105, 95, 123, T.COBBLE);                    // Tamar's Rest
    for (const y of [112, 113, 114]) { set(62, y, T.COBBLE); set(96, y, T.COBBLE); }
    carve([[62, 113], [96, 113]], T.PATH);
    house(65, 106, 7); house(86, 106, 7); house(65, 118, 6); house(87, 118, 6);
    set(79, 108, T.WELL);
    for (let y = 124; y <= 136; y++) for (let x = 40; x <= 64; x++) if (rnd(Math.floor(x / 2) * 31 + 7, Math.floor(y / 2) * 17 + 3) < 0.5) set(x, y, T.STONE);   // reed-boat ruins
    rect(145, 95, 159, 104, T.WALL); rect(146, 96, 158, 103, T.STONE); set(152, 104, T.PATH);                                  // the tollhouse
    set(DRY.gate[0], DRY.gate[1], T.PATH);                                                 // the way down from the Flats
    carve([[44, 45], [44, 52]], T.PATH);
    fixSpots();
  };
  const _addProp2D = addProp2;
  addProp2 = () => {
    _addProp2D();
    addProp("sign", 45, 51, { text: "A post driven into the salt, hung with bells for the wind: THE CARAVAN ROAD. TAMAR'S REST, TWO DAYS. BEYOND THE CARAVANSERAI THE DUNES BITE. TRAVEL IN COMPANY." });
    for (const [x, y] of [[72, 115], [76, 115], [84, 115]]) addProp("stall", x, y);
    addProp("campfire", 79, 117); addProp("cart", 69, 122); addProp("cart", 90, 122); addProp("barrel", 93, 110); addProp("crate", 64, 110); addProp("banner", 80, 105);
    for (const [x, y] of STAR_STONES) addProp("cairn", x, y);
    for (const [x, y] of [[44, 127], [49, 131], [57, 128], [61, 134], [47, 135]]) addProp("pillar", x, y);
    addProp("statue", 152, 97); addProp("candles", 149, 99); addProp("candles", 155, 99); addProp("chains", 147, 101);
    for (let i = 0; i < 12; i++) addProp("deadtree", 110 + Math.floor(rnd(i, 901) * 55), 94 + Math.floor(rnd(i, 903) * 12));
    addProp("sign", 153, 105, { text: "Brass letters, sanded almost smooth: GUILD TOLLHOUSE No. 4. ALL GOODS DECLARED. ALL TOLLS PAID. ALL DEBTS REMEMBERED." });
  };
  WARPS.push({ x: DRY.gate[0], y: DRY.gate[1], to: DRY.land, req: () => G.stage >= 2, msg: "Dust storms are blowing up from the old seabed. The caravan road opens once the Butcher is dealt with. (After Chapter I)" },
    { x: DRY.land[0], y: DRY.y0 + 1, to: [DRY.gate[0], DRY.gate[1] - 1] });
  const _regionOfD = regionOf;
  regionOf = function (x, y) { return y >= DRY.y0 ? "drysea" : _regionOfD(x, y); };
  REGION_LINKS.drysea = { old: [DRY.land[0], DRY.y0 + 1] }; REGION_LINKS.old.drysea = DRY.gate;
  REGIONS.unshift({ name: "Tamar's Rest", x0: 62, y0: 104, x1: 96, y1: 124, music: "village" }, { name: "The Salt Pans", x0: 1, y0: 91, x1: 44, y1: 138, music: "flats" },
    { name: "The Reed-Boat Ruins", x0: 40, y0: 124, x1: 64, y1: 138, music: "deep" }, { name: "Tollhouse No. 4", x0: 145, y0: 95, x1: 159, y1: 104, music: "deep" },
    { name: "The Dune Sea", x0: 97, y0: 91, x1: 168, y1: 138, music: "coast" }, { name: "The Dry Sea", x0: 45, y0: 91, x1: 96, y1: 138, music: "flats" });
  MAP_LABELS.push(["Tamar's Rest", 79, 102], ["Salt Pans", 22, 94], ["Dune Sea", 135, 120], ["Reed-Boat Ruins", 52, 138], ["Tollhouse", 152, 93]);

  Object.assign(MONSTERS, {
    scorpion: { name: "Dune Scorpion", hp: 64, atk: 15, def: 11, spd: 6, xp: 34, coin: [5, 9], sprite: "crawler",
      moves: [{ name: "Sting", w: 3, power: 1.0, bleed: [3, 3] }, { name: "Pincer", w: 2, power: 1.3 }, { name: "Dig In", w: 1, guard: true, heal: 10 }] },
    dunewraith: { name: "Dune Wraith", hp: 52, atk: 17, def: 3, spd: 11, xp: 36, coin: [4, 8], sprite: "wraith",
      moves: [{ name: "Grave Chill", w: 3, power: 1.0, weakOne: 2 }, { name: "Salt Wail", w: 1, charge: true, power: 1.5, all: true }] },
    mirage: { name: "Mirage Hound", hp: 40, atk: 14, def: 2, spd: 17, xp: 28, coin: [3, 6], sprite: "jackal",
      moves: [{ name: "Flicker", w: 3, power: 0.7, hits: 2 }, { name: "Shimmer Away", w: 1, guard: true }] },
    tollkeeper: { name: "The Tollkeeper, Guild Tollhouse No. 4", hp: 780, atk: 21, def: 9, spd: 7, xp: 400, coin: [160, 160], sprite: "quill", boss: true, music: "boss", tall: true,
      moves: [{ name: "Levy", w: 3, power: 0.9, all: true }, { name: "Seize Goods", w: 3, power: 1.5, drain: 0.5 }, { name: "Recount", w: 1, guard: true, heal: 30 },
        { name: "Final Audit", w: 0, charge: true, power: 1.9, all: true },
        { name: "Call the Collectors", w: 0, summonKind: "scorpion", summonText: "The Tollkeeper stamps a ledger. Two scorpions crawl out of the strongbox, wearing little brass collars." }] },
  });
  BESTIARY.scorpion = "Armoured in salt-crust. Hammers and spears crack them; bare blades skate off.";
  BESTIARY.dunewraith = "The drowned of the old sea, dried to salt. Their wail builds slowly. Hit them hard while it builds, and it breaks.";
  BESTIARY.mirage = "Hounds made of heat and hunger. Fast enough to hit twice; thin enough to kill quickly.";
  BESTIARY.tollkeeper = "Guild Tollhouse No. 4 was buried by a dune a century ago. The toll-collector inside never stopped collecting.";
  FIELD.push(
    { id: "d1", x: 30, y: 104, group: ["jackal", "jackal", "ghoul"], minStage: 2 }, { id: "d2", x: 20, y: 124, group: ["ghoul", "ghoul"], minStage: 2 },
    { id: "d3", x: 58, y: 100, group: ["mirage", "jackal"], minStage: 3 }, { id: "d4", x: 55, y: 130, group: ["dunewraith", "ghoul"], minStage: 4 },
    { id: "d5", x: 110, y: 118, group: ["scorpion", "mirage"], minStage: 5 }, { id: "d6", x: 125, y: 104, group: ["dunewraith", "dunewraith"], minStage: 5 },
    { id: "d7", x: 140, y: 125, group: ["scorpion", "scorpion"], minStage: 6 }, { id: "d8", x: 160, y: 118, group: ["mirage", "mirage", "dunewraith"], minStage: 6, elite: true },
    { id: "d9", x: 132, y: 132, group: ["scorpion", "dunewraith", "mirage"], minStage: 7, elite: true });
  LORE.push(
    { id: 20, x: 50, y: 133, title: "The Reed-Boat City", text: "Scratched on a pillar where the waterline used to be: \"We lived on the water, on boats of reed lashed together, forty thousand of us. When the sea went, the boats sat down on the salt, and we learned to walk.\"" },
    { id: 21, x: 26, y: 112, title: "A Salt-Raker's Count", text: "Rows of marks on a board by the pans: \"One cart of salt, one cup of water from the Guild well. The Guild sets the price of both.\"" },
    { id: 22, x: 158, y: 101, title: "The Tollkeeper's Motto", text: "Stamped on every coin in the strongbox: \"NOTHING PASSES FREE.\" Someone has scratched underneath, very small: \"Not even me.\"" });
  RELICS.tollcoin = { name: "The Last Toll", from: "tollkeeper", desc: "A brass coin that won't be spent. +2 attack, +2 speed, +8% critical chance.", atk: 2, spd: 2, crit: 0.08 };

  // ---- the people of Tamar's Rest, and what they do all day
  const DESERT = { tamar: { robe: "#8a5a2a", hair: "#2a1a10", skin: "#a8703a", style: { hair: "tail", eye: "#3a2a1a" } },
    qasim: { robe: "#5a3a7a", hair: "#1b1633", skin: "#c98d63", style: { hair: "cap", eye: "#4a3020" } },
    idris: { robe: "#2a3a6a", hair: "#e8e4f0", skin: "#8a5a33", style: { hair: "hood", hood: "#1a2a4a", eye: "#8a8ad8" } },
    sefa: { robe: "#d8d0c0", hair: "#6a6a6a", skin: "#b07a4a", style: { hair: "veil", dress: true, eye: "#4a3020" } },
    halvard: { robe: "#6a4a3a", hair: "#c8a050", skin: "#e0a878", style: { hair: "helm", eye: "#3a6a8a" } },
    nima: { robe: "#c8c0e0", hair: "#1b1633", skin: "#c98d63", style: { hair: "fringe", eye: "#3a2a1a" } },
    bako: { robe: "#7a6a4a", hair: "#3a2a1e", skin: "#8a5a33", style: { hair: "cap", eye: "#3a2a1a" } } };
  const dsShow = () => G.stage >= 2;
  npc2({ id: "tamar", name: "Tamar, Caravan Master", x: 74, y: 111, look: DESERT.tamar, show: dsShow });
  npc2({ id: "qasim", name: "Qasim the Trader", x: 76, y: 114, look: DESERT.qasim, show: dsShow });
  npc2({ id: "idris", name: "Idris the Stargazer", x: 91, y: 121, look: DESERT.idris, show: dsShow });
  npc2({ id: "sefa", name: "Old Sefa", x: 36, y: 112, look: DESERT.sefa, show: dsShow });
  npc2({ id: "halvard", name: "Halvard", x: 95, y: 111, look: DESERT.halvard, show: dsShow });
  npc2({ id: "nima", name: "Nima", x: 70, y: 116, look: DESERT.nima, show: dsShow });
  npc2({ id: "caravan", name: "Bako the Drover", x: 96, y: 113, look: DESERT.bako, show: () => !!escort });
  for (const id of ["tamar", "qasim", "idris", "sefa", "halvard", "nima", "caravan"]) SPEAKERS[id] = NPCS.find(n => n.id === id).name;
  Object.assign(ACTS, {
    sefa: { draw: (P, t) => { const a = Math.sin(t * 2.2) * 4; P(9 + a, -18, 2, 18, "#6b3f24"); P(6 + a, -1, 8, 2, "#857ea5"); } },
    qasim: { draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 0.9) > 0.55) drawEmote(g2, x + 8, y - 30, "dots"); } },
    idris: { draw: (P, t, n, g2, x, y) => { P(10, -24, 2, 22, "#3a3450"); P(8, -26, 8, 3, "#9ea8d8"); if (isNight() && Math.sin(t) > 0.3) drawEmote(g2, x + 8, y - 30, "bang"); } },
    halvard: { draw: (P, t) => { P(-10, -26, 2, 28, "#6b3f24"); P(-11, -30, 4, 5, "#c8c8d8"); } },
    nima: { pace: 10, draw: (P, t, n, g2, x, y) => { if (!n.walking && Math.sin(t * 1.4) > 0.6) drawEmote(g2, x + 8, y - 30, "note"); } },
    caravan: { draw: (P, t, n) => { const bob = n.walking ? Math.round(Math.abs(Math.sin(t * 6))) : 0; P(-26, -10 - bob, 16, 9, "#1b1633"); P(-25, -9 - bob, 14, 7, "#c8b08a"); P(-12, -8 - bob, 5, 4, "#c8b08a"); P(-24, -2, 2, 4, "#6b3f24"); P(-15, -2, 2, 4, "#6b3f24"); P(-44, -14, 16, 12, "#1b1633"); P(-43, -13, 14, 9, "#8a6a3a"); P(-43, -4, 3, 3, "#3a2a1e"); P(-32, -4, 3, 3, "#3a2a1e"); } },
  });
  Object.assign(D, {
    tamar_0: { who: "tamar", text: "Salt goes east, water comes west, and the dunes eat whoever travels alone. I need a guard for today's caravan to the east bend. Bako drives; you keep him breathing. Fifty coin.", choices: [
      { t: "\"I'll take it.\"", go: "tamar_go", req: () => escortFree(), reqText: "one caravan a day" },
      { t: "\"Why does the salt go east?\"", go: "tamar_why" }, { t: "\"Not today.\"", go: null } ] },
    tamar_why: say("tamar", "Because the Guild buys it there, for twice what they pay us here, and sells it back to the Flats for four times. I don't make the prices, courier. I just make sure the carts arrive.", "tamar_0"),
    tamar_go: say("tamar", "Good. Stay close to him. Bako stops when you wander off. He's not brave, he's just old enough to know what's out there.", null, () => startEscort()),
    tamar_done: say("tamar", "Bako says you fought like someone who'd done it before. Here. Fifty coin, and the salve the drovers didn't need. Come back tomorrow; there's always another cart.", null),
    qasim_0: { who: "qasim", text: () => `Salt, courier? I buy honest salt at four coin a block. ${saltN() ? `You have ${saltN()}.` : "You have none. Old Sefa at the pans will teach you, if you ask nicely."}`, choices: [
      { t: () => `Sell all your salt (${saltN() * 4} coin).`, go: null, req: () => saltN() > 0, reqText: "salt blocks", act: () => { const n = saltN(); G.coins += n * 4; G.flags.salt = 0; G.flags.saltSold = (G.flags.saltSold || 0) + n; toast(`Sold ${n} salt for ${n * 4} coin.`); Music.sound("item"); save(); updateHud(); } },
      { t: "Buy a Salve (6 coin).", go: null, req: () => G.coins >= 6, reqText: "6 coin", act: () => { G.coins -= 6; G.items.salve = (G.items.salve || 0) + 1; toast("Bought a Salve."); save(); updateHud(); } },
      { t: "Leave.", go: null } ] },
    sefa_0: say("sefa", "(Old Sefa leans on her rake.) The brine sits in the pans all night. In the morning the sun draws the water off and leaves the salt. You rake it when the crust is ready: not too early, not too late. Like bread.", "sefa_1"),
    sefa_1: say("sefa", "Try a pan. Stand by the edge and press to rake when the rake is over the crust. One pan each, each day; the brine needs a night to come back. Qasim will buy what you get.", null, () => { G.flags.sefaTaught = true; save(); }),
    sefa_idle: say("sefa", () => G.flags.saltRaked >= 30 ? "Thirty blocks and more. You have salt-raker's wrists now. They'll ache in the rain. That's how you know." : "The pans don't care who owns them. The Guild does. The pans don't."),
    idris_0: say("idris", () => (G.flags.stars || []).length >= STARS.length ? "The whole chart. You've seen the sky the reed-boat people saw. Most people only ever look down." : isNight() ? "There. Five stones in the Dry Sea, set by the reed-boat people to read the sky. Stand at one after dark and look up. Tell me what you see." : "Come back after dark, courier. The sky is only interesting to people who stay up.", null, () => { if ((G.flags.stars || []).length >= STARS.length && !G.flags.astrolabe) { G.flags.astrolabe = true; giveRelic("astrolabe"); } }),
    halvard_0: say("halvard", () => G.flags.tollDead ? "The tollhouse is quiet. First time in my life I've walked past it without paying. Felt like stealing." : "Past the bend there's an old Guild tollhouse, half under a dune. Something inside still wants its toll. Don't go in until you can take a beating."),
    nima_0: say("nima", () => G.members.includes("maru") && !(G.flags.fallen || []).includes("maru") ? "The blind lady sings better than the drovers! She says I'm flat. I'm not flat. I'm SALTY." : "Did you know the stars have names? Idris knows all of them. He made some up. I can tell."),
  });
  const saltN = () => G.flags.salt || 0;
  Object.assign(RELICS, { astrolabe: { name: "Idris's Astrolabe", from: "_idris", desc: "The five reed-boat stars in brass. +2 SP each turn, +1 speed.", spRegen: 2, spd: 1 } });

  // ---- salt raking: a timing mini-game at the brine pans
  const rakeEl = document.createElement("div");
  rakeEl.id = "rakeUI"; rakeEl.hidden = true;
  rakeEl.innerHTML = `<b>Raking salt</b><div class="rbar"><i class="rzone"></i><i class="rmark"></i></div><p id="rakeMsg"></p><small class="dim">Press E / Space, tap ACT or tap the bar when the rake is over the crust.</small>`;
  $("fishUI").parentElement.appendChild(rakeEl);   // inside the game frame, like the fishing panel
  const rakeCss = document.createElement("style");
  rakeCss.textContent = "#rakeUI{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:8;width:min(340px,86%);background:var(--panel);border:2px solid var(--edge);border-radius:10px;padding:12px 14px;text-align:center;color:var(--text)}#rakeUI .rbar{position:relative;height:22px;margin:10px 0;border:2px solid var(--edge);border-radius:6px;background:#e8e4f0;cursor:pointer}#rakeUI .rzone{position:absolute;top:0;bottom:0;background:#c8a050}#rakeUI .rmark{position:absolute;top:-4px;bottom:-4px;width:4px;background:#1b1633}#rakeUI p{margin:4px 0;min-height:1.4em;font-size:14px}";
  document.head.appendChild(rakeCss);
  let rake = null;
  const panAt = (px, py) => PANS.findIndex(([x, y]) => px >= (x - 1) * TILE && px <= (x + 5) * TILE && py >= (y - 1) * TILE && py <= (y + 4) * TILE);
  function startRake(i) {
    rake = { i, stroke: 0, got: 0, pos: 0, dir: 1, speed: 0.9, zone: 0.35 + rnd(i, G.day || 1) * 0.3, w: 0.2, prev: mode, t0: performance.now() };
    mode = "rake"; rakeEl.hidden = false; drawRake(); $("rakeMsg").textContent = "Five strokes. Wait for the crust...";
  }
  function drawRake() { const z = rakeEl.querySelector(".rzone"), m = rakeEl.querySelector(".rmark"); z.style.left = `${rake.zone * 100}%`; z.style.width = `${rake.w * 100}%`; m.style.left = `calc(${rake.pos * 100}% - 2px)`; }
  function rakeStroke() {
    if (!rake || performance.now() - rake.t0 < 300) return;   // the press that opened the pans isn't a stroke
    const c = rake.zone + rake.w / 2, d = Math.abs(rake.pos - c), hit = d <= rake.w / 2, perfect = d <= rake.w / 6;
    rake.got += perfect ? 2 : hit ? 1 : 0; rake.stroke++; Music.sound(hit ? "item" : "miss");
    $("rakeMsg").textContent = perfect ? "A clean sheet of salt! +2" : hit ? "Good crust. +1" : "Too soon, or too late. Mud.";
    rake.speed += 0.18; rake.w = Math.max(0.1, rake.w - 0.02); rake.zone = 0.1 + rnd(rake.stroke * 13 + rake.i, G.day || 1) * 0.7;
    if (rake.stroke >= 5) setTimeout(endRake, 500);
  }
  function endRake() {
    if (!rake) return;
    const r = rake; rake = null; rakeEl.hidden = true; mode = "play";
    G.flags.salt = saltN() + r.got; G.flags.saltRaked = (G.flags.saltRaked || 0) + r.got;
    G.flags.raked = { ...(G.flags.raked || {}), [r.i]: G.day || 1 };
    toast(r.got ? `You rake ${r.got} block${r.got > 1 ? "s" : ""} of salt. (${saltN()} carried; Qasim buys them.)` : "Nothing but mud this time. The brine will be back tomorrow.");
    save(); updateHud();
  }
  rakeEl.querySelector(".rbar").addEventListener("pointerdown", e => { e.preventDefault(); if (mode === "rake") rakeStroke(); });
  $("bA").addEventListener("pointerdown", () => { if (mode === "rake") rakeStroke(); });
  addEventListener("keydown", e => { if (mode !== "rake") return; const k = e.key.toLowerCase(); if (["e", " ", "enter"].includes(k)) { e.stopImmediatePropagation(); e.preventDefault(); if (!e.repeat) rakeStroke(); } else if (k === "escape" || k === "q") { e.stopImmediatePropagation(); rake.stroke = 5; endRake(); } }, true);

  // ---- the caravan escort
  let escort = null;
  const ESCORT_PATH = [[96, 113], [112, 113], [128, 113], [144, 113], [160, 113]];
  const AMBUSHES = [[["mirage", "jackal"], ["scorpion"], ["dunewraith", "jackal"]], [["scorpion", "mirage"], ["dunewraith", "mirage"], ["scorpion", "dunewraith"]]];
  const escortFree = () => !escort && G.flags.escortDay !== (G.day || 1);
  function startEscort() {
    escort = { leg: 0, fought: [false, false], waitMsg: 0 };
    const n = NPCS.find(n => n.id === "caravan"); n.px = ESCORT_PATH[0][0] * TILE + 8; n.py = ESCORT_PATH[0][1] * TILE + 8;
    toast("Walk with Bako. He only moves while you're close.");
  }
  function escortStep(dt) {
    const n = NPCS.find(n => n.id === "caravan"); if (!n) return;
    const d = Math.hypot(G.px - n.px, G.py - n.py);
    if (d > 110) { n.walking = false; if ((escort.waitMsg -= dt) <= 0) { escort.waitMsg = 12; toast("Bako has stopped. He won't go on without you."); } return; }
    const tgt = ESCORT_PATH[escort.leg + 1];
    if (!tgt) return finishEscort();
    const tx = tgt[0] * TILE + 8, ty = tgt[1] * TILE + 8, dx = tx - n.px, dy = ty - n.py, dd = Math.hypot(dx, dy), sp = 24 * dt;
    n.walking = true; n.dir = dx > 0 ? "right" : "left";
    if (dd <= sp) { n.px = tx; n.py = ty; escort.leg++;
      const amb = escort.leg === 1 ? 0 : escort.leg === 3 ? 1 : -1;
      if (amb >= 0 && !escort.fought[amb]) { escort.fought[amb] = true; n.walking = false; toast("Ambush on the road!"); const g = AMBUSHES[amb][((G.day || 1) + amb) % 3]; setTimeout(() => { if (mode === "play") startBattle(g, { area: "dunes" }); }, 300); }
    } else { n.px += dx / dd * sp; n.py += dy / dd * sp; }
    n.x = Math.floor(n.px / TILE); n.y = Math.floor(n.py / TILE);
  }
  function finishEscort() {
    escort = null; G.flags.escortDay = G.day || 1; G.flags.escorts = (G.flags.escorts || 0) + 1;
    G.coins += 50; G.items.salve = (G.items.salve || 0) + 1; Music.sound("victory");
    toast(`The caravan reaches the east bend. +50 coin, +1 Salve. (Caravans guarded: ${G.flags.escorts})`); save(); updateHud();
  }

  // ---- stargazing: five stones, five constellations, only after dark
  const STARS = [
    ["The Courier", "A woman with a satchel, striding west. The reed-boat people said she carried the first rain across the sky, and has been walking back for more ever since."],
    ["The Two Brothers", "Two bright stars, one high and one low. They never rise on the same night. The salt-rakers say one climbed and one stayed, and they are still trying to meet."],
    ["The Thumb on the Scale", "The Guild's astronomers named it The Scales. The salt-rakers renamed it. Look closely: one pan hangs lower than the other, and there's a star pressing on it."],
    ["The Reed Boat", "A long curve of faint stars, like a hull. Sailors on the old sea steered by it. It still points to where the water was."],
    ["The Empty Chair", "A ring of seven stars with a gap where an eighth should be. It is for whoever is missing from the table. Everyone who looks at it sees someone different."],
  ];
  const starAt = (px, py) => STAR_STONES.findIndex(([x, y]) => Math.hypot(px - x * TILE - 8, py - y * TILE - 8) < 26);

  // ---- companions at Tamar's Rest: whoever travels with you finds something to do
  const CAMP_ACTS = {
    ilse: [66, 111, ["(Ilse is re-shoeing a drover's ox with borrowed tools.) Oxen don't lie about how they feel. You nail a shoe wrong, they tell you. I like that in a customer.", "(Ilse holds up a horseshoe.) First thing I've made in a year that isn't for hurting something. Feels strange. Feels good."]],
    maru: [82, 118, ["(Maru is teaching the caravan children a song. They are terrible. She is delighted.) Again! And this time, Nima, pretend the note is a friend.", "(Maru hums the four notes, very quietly, and the children hum them back without being told.) ...Everybody knows it. Nobody knows how."]],
    rook: [92, 116, ["(Rook has set up a target on a crate and is showing Nima how to hold a bow.) Elbow up. Breathe out. Don't aim at it; look at it and let your hands work it out.", "(Rook watches Nima's arrow hit the crate.) She's better than I was. Nobody's going to tell her who to shoot, either."]],
    ada: [68, 120, ["(Ada is changing a sick drover's bandages, and humming, so softly you can barely hear it.)", "(Ada writes on her slate for a feverish child: 'You're safe. Sleep.' The child can't read. It works anyway.)"]],
    kest: [88, 110, ["(Kest is boiling something in a borrowed pot that smells like mint and turpentine.) Dune scorpion venom, cut with salt-brine. Heart medicine, if you don't drink the whole cup.", "(Kest hands a drover a small bottle.) For the cough. Not poison. I checked. Twice."]],
    ren: [94, 114, ["(Ren is drilling the caravan guards with Halvard.) Shields up. Together. A wall isn't strong because the stones are strong. It's strong because they don't move away from each other.", "(Ren wipes his face.) Halvard asked if I'd ever held a gate. I said once, for the wrong reasons. He said that counts as practice."]],
    warden: [79, 110, ["(The Warden is hauling water up from the well, bucket after bucket, for every trough in the caravanserai. Nobody asked him to.)", "(The Warden sets down the bucket.) Four hundred years I guarded water from people. It is more pleasant this way round."]],
    nell: [72, 121, ["(Nell is mending a torn cart canvas with a sailmaker's needle.) Sail, tarp, tent, same thing. Stitch it tight and it'll carry you anywhere.", "(Nell squints at the dunes.) Looks like a sea that forgot to be wet. I don't trust it. I want to dive in it anyway."]],
  };
  for (const [id, [x, y, lines]] of Object.entries(CAMP_ACTS)) {
    npc2({ id: "cmp_" + id, name: HEROES[id].name, x, y, look: HEROES[id].look, show: () => G.members.includes(id) && G.stage >= 2 });
    D["cmp_" + id + "_0"] = say(id, () => lines[(G.day || 1) % lines.length]);
    SPEAKERS["cmp_" + id] = HEROES[id].name;
  }
  Object.assign(ACTS, {
    cmp_ilse: { draw: (P, t, n) => { anvil(P, 11); const ph = sparks(P, t, 11, -8, 0.3); P(4, -20 + (ph < 0.12 ? 8 : 0), 2, 8, "#6b3f24"); P(2, -22 + (ph < 0.12 ? 8 : 0), 6, 3, "#857ea5"); n.dir = "right"; } },
    cmp_maru: { draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 1.6) > 0.2) drawEmote(g2, x + 8, y - 30, "note"); } },
    cmp_rook: { draw: (P, t) => { P(14, -16, 10, 12, "#1b1633"); P(15, -15, 8, 10, "#e8e2d0"); P(18, -12, 2, 4, "#c8102e"); } },
    cmp_ada: { draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 0.8) > 0.5) drawEmote(g2, x + 8, y - 30, "heart"); } },
    cmp_kest: { draw: (P, t) => { P(9, -4, 8, 6, "#1b1633"); P(10, -3, 6, 4, "#3a3450"); for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i / 3) % 1; P(11 + i * 2, -6 - ph * 12, 2, 2, ph < 0.5 ? "#8ad08a" : "#cfe8cf"); } } },
    cmp_ren: { draw: (P, t) => { const a = Math.sin(t * 3); P(10, -26 + a * 2, 2, 26, "#6b3f24"); P(9, -30 + a * 2, 4, 5, "#c8c8d8"); } },
    cmp_warden: { draw: (P, t) => { const up = Math.abs(Math.sin(t * 1.2)); P(10, -10 - up * 10, 7, 6, "#1b1633"); P(11, -9 - up * 10, 5, 4, "#3a8fbf"); } },
    cmp_nell: { draw: (P, t) => { const a = Math.sin(t * 4) * 3; P(8, -6, 12, 6, "#c8b08a"); P(12 + a, -10, 1, 6, "#e8e4f0"); } },
  });

  // ---- routing: talk, rake, look up; the tollhouse; and what the region keeps in the journal
  const _dialogForDS = dialogFor;
  dialogFor = function (n) {
    if (n.id.startsWith("cmp_")) return n.id + "_0";
    if (n.id === "tamar") return !escort && G.flags.escortDay === (G.day || 1) && G.flags.escortPaid !== (G.day || 1) ? (G.flags.escortPaid = G.day || 1, "tamar_done") : "tamar_0";
    if (n.id === "sefa") return G.flags.sefaTaught ? "sefa_idle" : "sefa_0";
    if (n.id === "caravan") return (D.__bako = say("caravan", "Stay close, courier. Oxen can smell a scorpion three dunes off. So can I, and I'm not ashamed to say I'd rather not."), "__bako");
    for (const k of ["qasim", "idris", "halvard", "nima"]) if (n.id === k) return k + "_0";
    return _dialogForDS(n);
  };
  const _interactDS = interact;
  interact = function () {
    if (mode === "play" && G.py >= DRY.y0 * TILE) {
      const i = panAt(G.px, G.py);
      if (i >= 0 && !nearestNpc()) {
        if (isNight()) { toast("The brine is still wet. Salt is raked by day."); return true; }
        if ((G.flags.raked || {})[i] === (G.day || 1)) { toast("You've raked this pan today. The brine comes back overnight."); return true; }
        startRake(i); return true;
      }
      const s = starAt(G.px, G.py);
      if (s >= 0 && !nearestNpc()) {
        if (!isNight()) { toast("A ring of old stones, set to face the sky. Nothing to see until dark."); return true; }
        const [name, text] = STARS[s], fresh = !(G.flags.stars || []).includes(s);
        if (fresh) { G.flags.stars = [...(G.flags.stars || []), s]; save(); }
        card("The night sky", name, text + (fresh ? ` (Star chart: ${G.flags.stars.length}/${STARS.length})` : ""));
        return true;
      }
    }
    return _interactDS();
  };
  Object.assign(D, {
    toll_0: say("tollkeeper", "(Inside the buried tollhouse, a figure in a rotted Guild coat sits behind a counter, stamping empty paper. It looks up. Its face is a ledger.) Goods to declare? Everything is goods. Everyone is goods. Nothing passes free.", "toll_1"),
    toll_1: { who: "tollkeeper", text: "Your toll is: everything you carry. Pay, or be counted.", choices: [
      { t: "\"We don't owe you anything.\"", go: "toll_fight" }, { t: "(Back away.)", go: null } ] },
    toll_fight: say("tollkeeper", "Everyone says that. Everyone pays.", null, () => startBattle(["tollkeeper"], { boss: "tollkeeper", area: "hall" })),
    toll_after: say(null, "(The Tollkeeper's ledger-face tears down the middle. Inside, on every page, the same entry, over and over, in a hand that gets shakier as it goes: PAID. PAID. PAID. PAID. Then, on the last page: I would like to go home now.)", null, () => { G.flags.tollDead = true; save(); updateHud(); }),
  });
  SPEAKERS.tollkeeper = "The Tollkeeper";
  const _act2BossEndDS = act2BossEndB;
  act2BossEndB = function (boss) { _act2BossEndDS(boss); if (boss === "tollkeeper") setTimeout(() => openDialog("toll_after"), 300); };
  const _updateDS = update;
  update = function (dt) {
    _updateDS(dt);
    if (mode !== "play" || !G) return;
    if (escort) escortStep(dt);
    if (G.stage >= 6 && !G.flags.tollDead && Math.hypot(G.px - (152 * TILE + 8), G.py - (99 * TILE + 8)) < 30) once("tollPrompt", () => openDialog("toll_0"));
  };
  const _updateRake = update;
  update = function (dt) { _updateRake(dt); if (mode === "rake" && rake) { rake.pos += rake.dir * rake.speed * dt; if (rake.pos > 1) { rake.pos = 1; rake.dir = -1; } if (rake.pos < 0) { rake.pos = 0; rake.dir = 1; } drawRake(); } };
  const _extraJournalDS = extraJournalHtml;
  extraJournalHtml = function () {
    const f = G.flags; if (G.stage < 2) return _extraJournalDS();
    const bits = [`Salt raked: ${f.saltRaked || 0} (${saltN()} carried)`, `Caravans guarded: ${f.escorts || 0}`, `Star chart: ${(f.stars || []).length}/${STARS.length}`];
    const names = (f.stars || []).map(i => STARS[i][0]);
    return _extraJournalDS() + `<h3>The Dry Sea</h3><p>${bits.join(" · ")}</p>${names.length ? `<p class="dim" style="font-size:13px">Stars seen: ${names.join(", ")}.</p>` : ""}`;
  };
  ACHIEVEMENTS.push(["salt30", "Salt-Raker's Wrists", "Rake 30 blocks of salt in the Dry Sea.", () => (G.flags.saltRaked || 0) >= 30],
    ["escort3", "Safe Passage", "Guard three caravans to the east bend.", () => (G.flags.escorts || 0) >= 3],
    ["stars", "The Reed-Boat Sky", "See all five constellations from the star stones.", () => (G.flags.stars || []).length >= 5],
    ["toll", "Nothing Passes Free", "Defeat the Tollkeeper.", () => !!G.flags.tollDead]);

  // ---- Aba's last run: the drover's letter, left at Tamar's table, finally carried home
  D.tamar_0.choices.splice(2, 0, { t: () => G.flags.abaLetter ? "\"About Aba's letter...\"" : "\"I'm Kessa's courier.\"", go: () => G.flags.abaLetter ? "tamar_aba_after" : "tamar_aba0" });
  Object.assign(D, {
    tamar_aba0: say("tamar", "(Tamar goes still.) Kessa's courier. Then you knew Aba. The old drover. He ran salt for me forty years, and never once lost a cart.", "tamar_aba1"),
    tamar_aba1: say("tamar", "The morning of his last run he left this on my table. Folded twice, the way he did everything. He said, 'If I'm late, give it to my wife.' (She holds it out.) He was late. And I'm a caravan master, not a courier. I never knew how to walk into that village with it.", "tamar_aba2"),
    tamar_aba2: { who: "sable", text: "(The letter is soft from being carried. On the outside, in careful capitals: FOR MY WIFE, IN KESSA.)", choices: [
      { t: "\"I'll take it to her.\"", go: "tamar_aba3" } ] },
    tamar_aba3: say("tamar", "Thank you. Tell her... no. Don't tell her anything from me. Just give her his.", null, () => { G.flags.abaLetter = "carry"; save(); updateHud(); toast("You carry Aba's last letter, for his wife in Kessa."); }),
    tamar_aba_after: say("tamar", () => G.flags.abaLetter === "delivered" ? "You gave it to her. (She nods, and looks at the road east for a while.) Good. Forty years he never lost a cart. I'm glad the last thing he sent didn't get lost either." : "Kiraz. That's her name. She lives by the west edge of Kessa. Go when you're ready; it's waited a year, it can wait for you to be ready.", "tamar_0"),
    abaletter_0: say(null, "(You hold out the letter. The widow knows the handwriting before she has it in her hands.)", "abaletter_1"),
    abaletter_1: say("abawidow", "(She reads it aloud, slowly, like she is walking beside him.) 'Kiraz. The salt is good this year, better than the Guild deserves. I'll bring figs from Tamar's. If I'm late, it's the dunes, not the jackals, so don't worry, and don't let the boy climb the rocks looking for me.'", "abaletter_2"),
    abaletter_2: say("abawidow", "(She laughs, and then she doesn't.) He climbs every rock on the Flats. Every single one. I thought he was practising for the next time someone throws him to safety. He was looking for his grandfather. Of course he was.", "abaletter_3"),
    abaletter_3: say("abawidow", "(She folds the letter twice, the way it came.) Thank you, courier. A year late, and it still came. Here. The lead goat's bell. He hung it on the cart so I could hear him coming from the edge of the salt. I don't need to hear that any more. You might.", null, () => {
      G.flags.abaLetter = "delivered"; giveRelic("goatbell"); save(); updateHud();
      if (G.members.includes("rook") && !G.flags.rookDead) setTimeout(() => openDialog("abaletter_rook"), 400);
    }),
    abaletter_rook: say(null, "(Rook doesn't say anything on the walk back through Kessa. At the well he stops, asks you to wait, and goes back to her door alone. He is there a long time. When he comes back, his eyes are red, and he says only: \"She said the boy has his grandfather's hands.\")", null, () => { G.flags.rookHeardAba = true; save(); }),
  });
  RELICS.goatbell = { name: "Aba's Goat Bell", from: "_aba", desc: "A dented brass bell from a salt cart. +2 defence, and heal 2 health at the start of each turn.", def: 2, regen: 2 };
  const _dialogForAL = dialogFor;
  dialogFor = function (n) { if (n.id === "abawidow" && G.flags.abaLetter === "carry") return "abaletter_0"; return _dialogForAL(n); };
  const _extraFatesAL = extraFates;
  extraFates = function (k) {
    const out = _extraFatesAL(k);
    if (G.flags.abaLetter !== "delivered") return out;
    const archer = out.findIndex(t => t.startsWith("In Kessa, an old widow keeps an archer's letter"));   // Rook's letter was delivered too
    const line = archer >= 0 ? "In Kessa, an old widow keeps two letters over her heart, an archer's and a drover's. The tall boy who used to climb every rock on the Flats drives salt for Tamar now, and he never loses a cart."
      : "In Kessa, a widow keeps a letter folded twice in her apron. The tall boy who used to climb every rock on the Flats drives salt for Tamar now, and he never loses a cart.";
    if (archer >= 0) out[archer] = line; else out.push(line);
    return out;
  };
  const _extraJournalAL = extraJournalHtml;
  extraJournalHtml = function () {
    const a = G.flags.abaLetter;
    return _extraJournalAL() + (a ? `<h3>Aba's last run</h3><p>${a === "carry" ? "A letter from the drover Aba, folded twice, for his wife in Kessa. Tamar kept it a year." : "Delivered, a year late. It still came."}</p>` : "");
  };

