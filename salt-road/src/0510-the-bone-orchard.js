  // ================================================================== THE BONE ORCHARD (optional region, Chapter IX onward)
  // East of the Wreck Coast, across a rope bridge: the orchard where the Guild buried its debtors with their ledgers.
  // The trees that came up remember. Eat their fruit and you'll know them.
  const ORCH = { x0: 130, y0: 57, x1: 169, y1: 89, boss: { x: 163, y: 81 } };
  const FRUITS = [
    { x: 136, y: 66, who: "Hesk, a tanner", text: "I owed eleven coin. Eleven. I had a daughter who sang in the market. They took the tannery, and then the house, and then there was nothing left to take but me. I am not angry. I am only surprised, still, that eleven coin weighed more than a daughter who sang." },
    { x: 145, y: 74, who: "Ilka, a midwife", text: "I delivered four hundred babies in the lower city. Not one of them could pay. I paid for the linens myself, and the Guild counted it as a debt, because I had borrowed to do it. When they buried me with my ledger, the ledger was mostly names. Babies' names. That is not a debt. That is a list of everything I did right." },
    { x: 154, y: 77, who: "Pell the Elder, a salt-miner", text: "Forty years under the Well. They paid us in salt and charged us for the water. The arithmetic was very simple. It always came out the same. I used to think the Guild was cruel. Now, rooted here, I think they were just very good at arithmetic, and nobody had ever taught them to count the right things." },
    { x: 139, y: 83, who: "a child, name worn away", text: "Mama said we were going to the orchard to pick apples. There weren't any apples then. There were only men with shovels. I don't remember being scared. I remember that she held my hand the whole time, even after. Even now. The roots grew around both our hands, together." },
    { x: 166, y: 74, who: "Oren Vask, a Guild clerk", text: "I kept the ledgers. I wrote the debts that put the others here. Then I made one mistake in a sum, one, and they found I owed the Guild for the error. I am buried with the rest. I have had a long time to think. I would like to say I am sorry to the tanner. His daughter still sings, you know. I can hear her from here, when the wind is right." },
  ];
  const _regionOfO = regionOf;
  regionOf = function (x, y) { return x >= ORCH.x0 && y >= ORCH.y0 ? "orchard" : _regionOfO(x, y); };
  REGION_LINKS.orchard = { south: [130, 70] }; REGION_LINKS.south.orchard = [124, 70];
  REGIONS.splice(REGIONS.length - 1, 0, { name: "The Bone Orchard", x0: ORCH.x0, y0: ORCH.y0, x1: ORCH.x1, y1: ORCH.y1, music: "grove" });
  MAP_LABELS.push(["The Bone Orchard", 148, 72]);
  const _areaAtO = areaAt;
  areaAt = function (tx, ty, f) { return tx >= ORCH.x0 && ty >= ORCH.y0 ? "grove" : _areaAtO(tx, ty, f); };
  const orchardTrees = () => { const out = []; for (const y of [63, 66, 74, 77, 80, 83, 86]) for (let x = 133; x <= 166; x += 3) { if (Math.abs(x - 150) <= 1 || (x >= 155 && y <= 66) || (x >= 159 && y >= 78 && y <= 84)) continue; out.push([x, y]); } return out; };
  const _buildMapO = buildMap;
  buildMap = function () {
    _buildMapO();
    rect(ORCH.x0, ORCH.y0, ORCH.x1, ORCH.y1, T.CLIFF);
    for (let y = ORCH.y0 + 1; y < ORCH.y1; y++) for (let x = ORCH.x0 + 1; x < ORCH.x1; x++) { const n = hash(Math.floor(x / 3) + 700, Math.floor(y / 3)); set(x, y, n < 0.2 ? T.MUD : hash(x * 7, y * 3 + 11) < 0.05 ? T.BONES : T.GRASS); }
    carve([[ORCH.x0, 70], [160, 70]], T.PATH); carve([[150, 59], [150, 87]], T.PATH);
    house(157, 59, 7); carve([[160, 62], [160, 70]], T.PATH);
    rect(160, 79, 166, 84, T.MUD);
    for (let x = 125; x <= 129; x++) set(x, 70, T.BRIDGE);
    fixSpots();
  };
  const _applyWorldO = applyWorldState;
  applyWorldState = function () { _applyWorldO(); if (G) set(126, 70, G.stage >= 9 ? T.BRIDGE : T.DEBRIS); };
  const _addProp2O = addProp2;
  addProp2 = () => { _addProp2O(); for (const [x, y] of orchardTrees()) addProp("deadtree", x, y); addProp("sign", 124, 69, { text: "A sign nailed to the bridge post, the paint almost gone: GUILD ORCHARD. DEBTORS' CEMETERY. NO PICKING." }); };

  Object.assign(MONSTERS, {
    rootbound: { name: "Rootbound Debtor", hp: 92, atk: 20, def: 6, spd: 5, xp: 56, coin: [8, 14], sprite: "drowned",
      pal: { "#4a6a7a": "#3a4a2a", "#5a7a8a": "#4a5a2a", "#8ab0b8": "#9a8a5a", "#2a5a3a": "#5a3a1a", "#857ea5": "#4a3a1a", "#3a8fbf": "#6a1a1a", "#9ef0f5": "#e8c83a" },
      moves: [{ name: "Grasping Roots", w: 3, power: 1.0, stunChance: 0.25 }, { name: "Sap-Bleed", w: 2, power: 0.8, bleed: [4, 3] }, { name: "Take Root", w: 1, guard: true, heal: 12 }] },
    ledgercrow: { name: "Ledger Crow", hp: 58, atk: 21, def: 4, spd: 15, xp: 44, coin: [6, 11], sprite: "harpy",
      moves: [{ name: "Peck the Eyes", w: 3, power: 1.1, weakOne: 2 }, { name: "Scatter Pages", w: 1, power: 0.7, all: true }] },
    ledgertree: { name: "The Ledger Tree, That Which Is Owed", hp: 720, atk: 21, def: 8, spd: 5, xp: 420, coin: [140, 140], sprite: "ledgertree", boss: true, music: "boss", tall: true,
      moves: [{ name: "Compound Interest", w: 3, power: 1.1, all: true }, { name: "Foreclose", w: 3, power: 1.8, drain: 0.4 }, { name: "Recite the Debts", w: 1, weakAll: 2 },
        { name: "Call the Rootbound", w: 1, summonKind: "rootbound", summonText: "The earth splits. Two of the buried claw their way up, still clutching their ledgers." }] },
  });
  BESTIARY.rootbound = "Debtors buried with their ledgers. The roots grew through them and kept them walking. They still reach for anyone who looks like a collector.";
  BESTIARY.ledgercrow = "Crows that nest in the orchard and line their nests with account pages. They have learned to say numbers.";
  BESTIARY.ledgertree = "The first tree of the orchard, grown from the Guild's founding ledger. Every debt in the valley is written somewhere in its bark.";
  FIELD.push(
    { id: "o1", x: 140, y: 70, group: ["rootbound", "rootbound"], minStage: 9 }, { id: "o2", x: 150, y: 65, group: ["ledgercrow", "rootbound"], minStage: 9 },
    { id: "o3", x: 144, y: 80, group: ["rootbound", "ledgercrow", "rootbound"], minStage: 9 }, { id: "o4", x: 157, y: 72, group: ["ledgercrow", "ledgercrow", "ledgercrow"], minStage: 9, elite: true });
  npc2({ id: "sarn", name: "Old Mother Sarn", x: 160, y: 64, look: { robe: "#4a3a2a", hair: "#d8d0c0", skin: "#a8784e", style: { hair: "veil", dress: true, eye: "#5a4a2a" } }, show: () => G.stage >= 9 });

  Object.assign(D, {
    sarn_0: say("sarn", "(An old woman with dirt to her elbows is pruning a tree that has a hand where a branch should be.) Visitors. We don't get visitors. We get deliveries. The Guild used to send them by the cartload.", "sarn_1"),
    sarn_1: say("sarn", "I was their gravedigger. Thirty years. The rule was, you bury a debtor with their ledger, so the debt follows them into the ground. Nobody escapes the Guild, not even by dying. I thought it was only a rule. Then the trees came up.", "sarn_2"),
    sarn_2: say("sarn", "Every tree is somebody. The fruit remembers them. Eat one and you'll know who it was, the way you know a song. I tend them because nobody else will say their names. That's all a grave is for, in the end. Somewhere for the names to go.", "sarn_3"),
    sarn_3: say("sarn", "There's five trees still fruiting. And at the far end, past the mud... the first tree. The Guild's own ledger went into that hole. It isn't a person. It's a debt. And it's hungry. Be careful, courier.", null, () => { G.flags.orchardQuest = true; toast("The Bone Orchard: taste the five fruits, and find the first tree"); save(); updateHud(); }),
    sarn_wait: say("sarn", ""),
    orchard_boss: say(null, "At the heart of the orchard stands a tree that isn't wood. Its trunk is ten thousand account books, swollen with sap and bound with roots. In the knots there are faces, mouths open, reciting numbers. Its fruit are the size of hearts, and they beat.", "orchard_boss2"),
    orchard_boss2: { who: null, text: "The faces turn toward you all at once. \"COURIER. OUTSTANDING BALANCE: ONE MOTHER, ONE LETTER, NEVER DELIVERED.\"", choices: [{ t: "\"I don't owe you anything.\"", go: null, act: () => startBattle(["ledgertree"], { boss: "ledgertree", area: "grove" }) }] },
    orchard_after: say("sable", "(The Ledger Tree splits down the middle with a sound like a book slammed shut forever. Pages rain down over the orchard, blank. Every one of them is blank.)", null, () => { G.flags.ledgerTreeDead = true; save(); updateHud(); }),
    sarn_choice: { who: "sarn", text: "(Sarn stands in a drift of blank pages.) It's gone. The debt's gone. And the trees... are just trees now, I think, with people inside them who don't owe anyone anything. What do we do with them, courier?", choices: [
      { t: "Read every name aloud, one by one.", go: "sarn_named", req: () => (G.flags.fruits || []).length >= 5, reqText: "taste all five fruits first" },
      { t: "Burn the orchard. Let them go.", go: "sarn_burn" },
      { t: "Leave it standing. It's yours to tend.", go: "sarn_keep" } ] },
    sarn_named: say("sarn", "(You read until your voice is gone: Hesk, and Ilka, and Pell the Elder, and a child whose name you give back to her, and Oren Vask, and hundreds more, from the ledgers. Sarn weeps the whole time.) ...That's the first time anyone's said them without a number after. Here. A seed. Plant it somewhere that doesn't need forgiving.", null, () => { G.flags.orchardFate = "named"; giveRelic("seed"); Music.sound("victory"); save(); updateHud(); }),
    sarn_burn: say("sarn", "(Sarn lights the first torch herself.) Thirty years I kept them in the ground. It's time they went up instead. ...Don't look at me like that. I'm not sad. I'm just tired, and so are they. Take this. It's the only coin the Guild ever paid me.", null, () => { G.flags.orchardFate = "burned"; G.coins += 120; Music.sound("item"); save(); updateHud(); }),
    sarn_keep: say("sarn", "Then I'll keep tending. Somebody should. Maybe one day the fruit will just be fruit, and children will come and pick it, and not know. That would be the best ending. Nobody knowing.", null, () => { G.flags.orchardFate = "kept"; G.items.phoenix = (G.items.phoenix || 0) + 2; toast("Sarn gives you two Phoenix Salts, pressed from orchard fruit."); save(); updateHud(); }),
    sarn_after: say("sarn", ""),
  });
  Object.assign(RELICS, { seed: { name: "Orchard Seed", from: "sarn", desc: "+3 defence. Regenerate 3 health each turn.", def: 3, regen: 3 } });
  const _dialogForO = dialogFor;
  dialogFor = function (n) {
    if (n.id !== "sarn") return _dialogForO(n);
    const f = G.flags;
    if (!f.orchardQuest) return "sarn_0";
    if (f.orchardFate) { D.sarn_after.text = { named: "They're just trees now. Good trees. The fruit's sweet this year, for the first time.", burned: "(Sarn is sitting in the ashes, planting ordinary apple seeds.) Starting over. It's allowed.", kept: "Somebody asked me yesterday what the orchard was. I said 'an orchard'. It felt good to say." }[f.orchardFate]; return "sarn_after"; }
    if (f.ledgerTreeDead) return "sarn_choice";
    D.sarn_wait.text = `${(f.fruits || []).length}/5 fruits tasted. ${(f.fruits || []).length >= 5 ? "You know them all now. The first tree is past the mud, south-east." : "Find the fruiting trees. You'll know them. They're the ones that seem to be waiting."}`; return "sarn_wait";
  };
  const _interactO = interact;
  interact = function () {
    if (G.flags.orchardQuest) for (const [i, fr] of FRUITS.entries()) {
      if ((G.flags.fruits || []).includes(i) || !near({ x: fr.x * TILE + 8, y: fr.y * TILE + 8 }, 22)) continue;
      G.flags.fruits = [...(G.flags.fruits || []), i]; save(); updateHud();
      D.__fruit = say(null, `(You bite into the fruit. It tastes of salt and iron, and then you are somebody else: ${fr.who}.) "${fr.text}"`); openDialog("__fruit"); return true;
    }
    return _interactO();
  };
  const _act2TriggersO = act2Triggers;
  act2Triggers = function () {
    _act2TriggersO();
    if (G.flags.orchardQuest && !G.flags.ledgerTreeDead && near({ x: ORCH.boss.x * TILE + 8, y: ORCH.boss.y * TILE + 8 }, 36)) once("ledgerPrompt", () => openDialog("orchard_boss"));
  };
  const _bossEndO = act2BossEndB;
  act2BossEndB = function (boss) { if (boss === "ledgertree") { setTimeout(() => openDialog("orchard_after"), 300); return; } return _bossEndO(boss); };
  const _actorsO = act2ActorsB;
  act2ActorsB = function (actors, ox, oy) {
    _actorsO(actors, ox, oy);
    const f = G.flags;
    if (f.orchardQuest) FRUITS.forEach((fr, i) => { if (!(f.fruits || []).includes(i)) actors.push({ y: fr.y * TILE + 9, draw: () => { drawSparkle(g, fr.x * TILE + 8 - ox, fr.y * TILE - 6 - oy, "#c81a3a"); } }); });
    if (G.stage >= 9 && !f.ledgerTreeDead) actors.push({ y: ORCH.boss.y * TILE + 8, draw: () => drawMiniBoss(g, ORCH.boss.x * TILE + 8 - ox, ORCH.boss.y * TILE + 8 - oy, "ledgertree") });
  };
  const _miniO = drawMiniBoss2b;
  drawMiniBoss2b = function (g2, x, y, kind) {
    if (kind !== "ledgertree") return _miniO(g2, x, y, kind);
    const P = (a, b, w, h, c) => { g2.fillStyle = c; g2.fillRect(x + a, y + b, w, h); };
    for (let i = 0; i < 6; i++) P(-7 + (i % 2), -6 - i * 5, 14, 4, i % 2 ? "#6b3f24" : "#8a5533"), P(-6, -5 - i * 5, 12, 1, "#e8e2d0");
    P(-16, -38, 32, 10, "#2a1a10"); P(-14, -40, 28, 3, "#3a2414");
    for (let i = 0; i < 5; i++) { const b = Math.sin(time * 4 + i) > 0 ? 1 : 0; P(-13 + i * 6, -30 + (i % 2) * 3, 3 + b, 3 + b, "#c81a3a"); }
    P(-3, -20, 2, 2, "#0a0a0a"); P(1, -20, 2, 2, "#0a0a0a"); P(-2, -16, 4, 1 + (Math.sin(time * 6) > 0 ? 1 : 0), "#0a0a0a");
    for (let i = 0; i < 4; i++) P(-12 + i * 7, -1, 5, 2, "#4a2a14");
    return true;
  };
  const _dbm2bO = drawBattleMonster2b;
  drawBattleMonster2b = function (g2, u, cx, cy, R, drip, tri, hurt) {
    if (u.sprite !== "ledgertree") return _dbm2bO(g2, u, cx, cy, R, drip, tri, hurt);
    const t = time, H = c => hurt ? "#ffffff" : c;
    for (let i = 0; i < 7; i++) { const w = Math.sin(t * 1.5 + i) * 3; R(-40 + i * 12 + w, -6, 10, 6, H("#3a2414")); R(-44 + i * 13, -2, 6, 3, H("#2a1a10")); }
    for (let i = 0; i < 11; i++) { const off = (i % 2) * 3 - 1; R(-16 + off, -12 - i * 7, 32, 7, "#1b1633"); R(-15 + off, -11 - i * 7, 30, 5, H(["#6b3f24", "#8a5533", "#5a3a1e"][i % 3])); R(-13 + off, -10 - i * 7, 26, 1, H("#e8e2d0")); }
    for (const [fx, fy, s] of [[-7, -34, 1], [3, -52, 1.2], [-5, -68, 1]]) { R(fx - 1, fy - 1, 9 * s, 9 * s, "#1b1633"); R(fx, fy, 8 * s, 8 * s, H("#d8c8b0")); R(fx + 1, fy + 2, 2, 2, "#0a0a0a"); R(fx + 5 * s, fy + 2, 2, 2, "#0a0a0a"); R(fx + 2, fy + 5 * s, 4 * s, 1 + Math.round(Math.abs(Math.sin(t * 5 + fx)) * 2), "#5a0f18"); }
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45, len = 34 + (i % 2) * 8; for (let k = 0; k < len; k += 4) R(Math.cos(a) * k - 2, -86 + Math.sin(a) * k * 0.6 - 2, 5, 4, H(k > len - 8 ? "#2a1a10" : "#4a2a14")); }
    for (const [bx, by, bw, bh] of [[-46, -94, 30, 18], [-30, -106, 34, 22], [-6, -110, 30, 24], [16, -100, 32, 20], [-20, -90, 44, 14]]) { R(bx - 1, by - 1, bw + 2, bh + 2, "#1b1633"); R(bx, by, bw, bh, H("#2a1810")); R(bx + 2, by + 1, bw - 4, 2, H("#3a2414")); }
    for (let i = 0; i < 9; i++) { const b = Math.sin(t * 3 + i * 1.3) > 0.2 ? 1 : 0; R(-38 + i * 9, -94 + (i % 3) * 5, 6 + b, 6 + b, H("#a3142e")); R(-37 + i * 9, -93 + (i % 3) * 5, 2, 2, "#ff6b7a"); if (i % 3 === 0) drip(-35 + i * 9, -88 + (i % 3) * 5, "#8a1020"); }
    for (let i = 0; i < 5; i++) { const px = -30 + i * 14, py = -72 + Math.sin(t * 2 + i) * 3; R(px, py, 8, 10, H("#e8e2d0")); R(px + 1, py + 2, 6, 1, "#8a7a6a"); R(px + 1, py + 5, 5, 1, "#8a7a6a"); }
  };
  const _extraJournalO = extraJournalHtml;
  extraJournalHtml = function () { const f = G.flags; if (!f.orchardQuest) return _extraJournalO();
    const t = f.orchardFate ? { named: "You read every name aloud.", burned: "The orchard burned, and the dead went up with it.", kept: "The orchard stands, tended by Sarn." }[f.orchardFate] : f.ledgerTreeDead ? "Talk to Sarn about what to do with the orchard." : `Taste the five fruits (${(f.fruits || []).length}/5) and find the first tree in the south-east.`;
    const mem = FRUITS.filter((fr, i) => (f.fruits || []).includes(i)).map(fr => `<li><b>${fr.who}</b>. ${fr.text}</li>`).join("");
    return _extraJournalO() + `<h3>The Bone Orchard</h3><p class="dim" style="font-size:13px">${t}</p>${mem ? `<ul>${mem}</ul>` : ""}`; };
  const _extraFatesO = extraFates;
  extraFates = function () { const out = _extraFatesO(), o = G.flags.orchardFate;
    if (o === "named") out.push("In the Bone Orchard the fruit is sweet now. Sarn reads a page of names every morning. When she runs out, she starts again from the beginning.");
    if (o === "burned") out.push("Where the Bone Orchard stood there is a meadow. Nothing is buried there. Children play in it and don't know why they feel so light.");
    if (o === "kept") out.push("Old Mother Sarn still tends the orchard. Travellers pick the fruit and dream strange, kind dreams of people they never met.");
    return out; };
  const _chronicleO = chronicle;
  chronicle = function () { const P = _chronicleO(), o = G.flags.orchardFate;
    if (G.flags.ledgerTreeDead) P.splice(P.length - 1, 0, ["The Bone Orchard", `East of the Wreck Coast the courier found the orchard where the Guild buried its debtors with their ledgers, and cut down the first tree, grown from the Guild's own founding book. ${{ named: "Then she read every name aloud, without a number after it. It took all night.", burned: "Then the gravedigger burned the orchard, and the dead went up with the smoke, owing nothing.", kept: "The orchard still stands. The fruit remembers. Nobody owes anything any more." }[o] || ""}`]);
    return P; };
  EPI.sarn = () => D.sarn_after.text || "The trees are quiet today.";
  ACHIEVEMENTS.push(["orchard", "Nothing Is Owed", "Fell the Ledger Tree in the Bone Orchard.", () => G.flags.ledgerTreeDead]);

