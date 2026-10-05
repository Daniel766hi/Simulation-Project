  // ================================================================== REBUILDING KESSA
  // The village that raised Sable has nothing to spare. A board by the well lists six places to rebuild, paid for in
  // coin and salt shards. The builders finish by the next dawn (sleep at a rest point at night to get there sooner),
  // the new building stands on its lot, and it helps the road: better salves, reserves who keep learning, daily
  // supplies, cheaper arms, a head start on Fury, and more coin from every fight. Each place can be raised twice.
  const KESSA = [
    { id: "herbs", name: "The Herb Garden", x: 5, y: 50, who: "Widow Aba's sister comes home to plant it.",
      lv: [{ coin: 60, shards: 3, stage: 1, eff: "Salves heal 30 instead of 22." }, { coin: 180, shards: 10, stage: 5, eff: "Salves heal 40, and Bitter Tonics restore 10 SP." }] },
    { id: "inn", name: "The Salt Bed Inn", x: 23, y: 34, who: "Old Bram's daughter reopens her father's inn.",
      lv: [{ coin: 90, shards: 4, stage: 1, eff: "Companions who sit out a battle earn 75% of its experience instead of half." }, { coin: 240, shards: 12, stage: 5, eff: "Companions who sit out a battle earn all of its experience." }] },
    { id: "market", name: "The Market Hall", x: 25, y: 44, who: "The stallholders who fled to Oru bring their carts back.",
      lv: [{ coin: 80, shards: 4, stage: 2, eff: "Once a day, collect two Salves at the hall." }, { coin: 220, shards: 10, stage: 7, eff: "Once a day, collect two Salves, a Bitter Tonic and one rarer remedy." }] },
    { id: "forge", name: "The Village Forge", x: 25, y: 38, who: "Ilse's old apprentices fire the forge again.",
      lv: [{ coin: 100, shards: 5, stage: 3, eff: "Arms and armour cost 10% less at every smith." }, { coin: 280, shards: 14, stage: 7, eff: "Arms and armour cost 20% less at every smith." }] },
    { id: "yard", name: "The Training Yard", x: 17, y: 50, who: "The village children come to watch, then to train.",
      lv: [{ coin: 70, shards: 4, stage: 2, eff: "Every battle starts with 15 Fury." }, { coin: 200, shards: 12, stage: 6, eff: "Every battle starts with 30 Fury." }] },
    { id: "post", name: "The Courier Post", x: 3, y: 39, who: "Postmistress Ama gets a counter, a stamp and a loft of pigeons.",
      lv: [{ coin: 80, shards: 4, stage: 1, eff: "Battles pay 15% more coin." }, { coin: 220, shards: 12, stage: 6, eff: "Battles pay 30% more coin." }] },
  ];
  const KBOARD = { x: 14, y: 43 };
  const kRec = id => { G.kessa = G.kessa || {}; return G.kessa[id] || (G.kessa[id] = { lv: 0 }); };
  const kLv = id => (G && G.kessa && G.kessa[id] && G.kessa[id].lv) || 0;
  const kBuilding = id => { const r = G && G.kessa && G.kessa[id]; return r && r.ready ? r : null; };
  const kPeople = () => 34 + KESSA.reduce((s, P) => s + kLv(P.id) * 7, 0);
  const kOpen = () => G && G.stage >= 1 && !G.flags.epilogue;
  const kDay = () => G.day || 1;
  // ---- what the buildings do
  const ITEM_BASE = { salveHeal: ITEMS.salve.heal, tonicSp: ITEMS.tonic.sp, salveDesc: ITEMS.salve.desc, tonicDesc: ITEMS.tonic.desc };
  const GEAR_BASE = Object.fromEntries(Object.entries(GEAR).map(([k, g]) => [k, g.price]));
  function applyKessa() {
    const h = kLv("herbs"), f = kLv("forge");
    ITEMS.salve.heal = h >= 2 ? 40 : h >= 1 ? 30 : ITEM_BASE.salveHeal;
    ITEMS.salve.desc = h ? `Heal an ally by ${ITEMS.salve.heal}. (Kessa's herb garden)` : ITEM_BASE.salveDesc;
    ITEMS.tonic.sp = h >= 2 ? 10 : ITEM_BASE.tonicSp;
    ITEMS.tonic.desc = h >= 2 ? "Stop bleeding and restore 10 SP. (Kessa's herb garden)" : ITEM_BASE.tonicDesc;
    for (const [k, p] of Object.entries(GEAR_BASE)) GEAR[k].price = Math.round(p * (1 - 0.1 * f));
    // shop lines that print the salve's strength follow the garden
    for (const node of Object.values(D)) if (node && Array.isArray(node.choices)) for (const c of node.choices) {
      if (typeof c.t !== "string" && !c._kt) continue;
      if (!c._kt && /Salve \(heal 22\)/.test(c.t)) c._kt = c.t;
      if (c._kt) c.t = c._kt.replace("heal 22", `heal ${ITEMS.salve.heal}`);
    }
  }
  const _victoryK = victory;
  victory = function () {
    if (!battle) return _victoryK();
    const fought = new Set(battle.heroes.map(u => u.id)), xp = battle.foes.reduce((s, f) => s + ((MONSTERS[f.id] && MONSTERS[f.id].xp) || 0), 0), c0 = G.coins;
    _victoryK();
    const inn = kLv("inn"), post = kLv("post");
    if (inn && xp) for (const id of G.members) {
      if (fought.has(id)) continue;
      const h = G.party[id]; h.xp += Math.round(xp * 0.25 * inn);
      while (h.xp >= xpNeed(h.level)) { h.xp -= xpNeed(h.level); levelUp(h); }
    }
    const won = G.coins - c0;
    if (post && won > 0) { const extra = Math.max(1, Math.round(won * 0.15 * post)); G.coins += extra; if (battle) blog(`${battle.log || ""} The Courier Post adds ${extra} coin.`.trim()); }
    if (inn || post) { save(); updateHud(); }
  };
  const _startBattleK = startBattle;
  startBattle = function (group, opts) { _startBattleK(group, opts); const y = kLv("yard"); if (battle && y) addFury(15 * y); };
  // ---- the buildings on their lots: a staked plot, scaffolding while the builders work, then the place itself
  function kessaProps() {
    for (let i = PROPS.length - 1; i >= 0; i--) if (PROPS[i].kessa) { propSolid.delete(PROPS[i].x + "," + PROPS[i].y); PROPS.splice(i, 1); }
    applyKessa();   // a new or loaded game starts from its own buildings, not the last game's
    if (!G || G.stage < 1) return;
    addProp("kboard", KBOARD.x, KBOARD.y, { kessa: true }); propSolid.add(KBOARD.x + "," + KBOARD.y);
    for (const P of KESSA) {
      const lv = kLv(P.id), b = kBuilding(P.id);
      addProp("kessa_" + P.id, P.x, P.y, { kessa: true, lv, building: !!b }); propSolid.add(P.x + "," + P.y);
    }
  }
  const _addProp2K = addProp2;
  addProp2 = () => { _addProp2K(); kessaProps(); };
  const _applyWorldK = applyWorldState;
  applyWorldState = function () { _applyWorldK(); kessaProps(); };
  const OUTL = "#1b1633";
  function drawKessaProp(g2, pr, x, y) {
    const R = (dx, dy, w, h, c) => { g2.fillStyle = c; g2.fillRect(x + dx, y + dy, w, h); }, t = time, lv = pr.lv;
    const shadow = w => { g2.fillStyle = "rgba(20,14,40,.28)"; g2.beginPath(); g2.ellipse(x, y + 6, w, 2.6, 0, 0, Math.PI * 2); g2.fill(); };
    const glow = (gx, gy, r, a) => { const gr = g2.createRadialGradient(x + gx, y + gy, 1, x + gx, y + gy, r); gr.addColorStop(0, `rgba(255,200,110,${a})`); gr.addColorStop(1, "rgba(255,200,110,0)"); g2.fillStyle = gr; g2.fillRect(x + gx - r, y + gy - r, r * 2, r * 2); };
    if (pr.type === "kboard") {
      shadow(8); R(-8, -10, 2, 16, "#6b3f24"); R(6, -10, 2, 16, "#6b3f24"); R(-10, -20, 20, 12, OUTL); R(-9, -19, 18, 10, "#b98a52");
      R(-7, -17, 5, 4, "#f2ead8"); R(-1, -18, 4, 5, "#f2ead8"); R(4, -16, 4, 3, "#f2ead8"); R(-6, -12, 7, 1, "#6b3f24"); R(2, -12, 5, 1, "#6b3f24"); R(-10, -21, 20, 2, "#a8403a");
      if (near({ x: pr.px, y: pr.py }, 22) && mode === "play") drawPrompt(g2, x, y - 26);
      return;
    }
    const id = pr.type.slice(6);
    if (!lv && !pr.building) {   // an empty, staked lot
      R(-8, -2, 1, 6, "#6b3f24"); R(7, -2, 1, 6, "#6b3f24"); R(-8, -1, 16, 1, "#d9c9a0"); R(-2, -9, 1, 13, "#6b3f24"); R(-6, -13, 9, 5, OUTL); R(-5, -12, 7, 3, "#d9c9a0"); R(-4, -11, 5, 1, "#8a5533");
      for (const [dx, dy] of [[-5, 2], [3, 3], [5, 0]]) R(dx, dy, 2, 1, "#c9b48a");
      if (near({ x: pr.px, y: pr.py }, 20) && mode === "play" && kOpen()) drawPrompt(g2, x, y - 18);
      return;
    }
    const sc = pr.building;   // scaffolding stands around whatever is being raised
    if (id === "herbs") {
      shadow(11); R(-11, -4, 22, 9, "#5a3a24"); for (let i = 0; i < 3; i++) { R(-10, -3 + i * 3, 20, 1, "#3a2a1e"); for (let j = 0; j < 5; j++) R(-9 + j * 4, -4 + i * 3, 2, 2, ["#4f9a4a", "#6fbf62", "#3a7a3a"][(i + j) % 3]); }
      R(-12, -6, 1, 11, "#8a5533"); R(11, -6, 1, 11, "#8a5533"); R(-12, -6, 24, 1, "#b98a52");
      if (lv >= 2) { R(-8, -20, 16, 14, OUTL); R(-7, -19, 14, 12, "rgba(190,240,230,.55)"); R(-7, -19, 14, 1, "#e8ffff"); R(0, -19, 1, 12, "#8ab8c8"); R(-5, -10, 3, 3, "#ff8ab0"); R(2, -11, 3, 4, "#ffd24a"); }
      else { R(-4, -10, 1, 6, "#6b3f24"); R(-7, -11, 7, 2, "#b98a52"); for (let j = 0; j < 3; j++) R(-7 + j * 2, -9, 1, 3, "#6fbf62"); }
    } else if (id === "inn") {
      shadow(13); R(-12, -26, 24, 32, OUTL); R(-11, -18, 22, 23, "#d9b98a"); R(-13, -28, 26, 11, OUTL); R(-12, -27, 24, 9, "#a8403a"); for (let i = 0; i < 3; i++) R(-12, -25 + i * 3, 24, 1, "#8a3030");
      R(-2, -3, 5, 8, "#5a3a24"); R(1, 0, 1, 1, "#ffcf4a"); const win = lv >= 2 ? "#ffcf4a" : "#3b2f55";
      R(-9, -14, 4, 4, win); R(5, -14, 4, 4, win); R(-9, -6, 4, 3, win); R(5, -6, 4, 3, win);
      R(11, -16, 1, 8, "#6b3f24"); R(12, -16, 6, 1, "#6b3f24"); R(13, -15, 5, 5, OUTL); R(14, -14, 3, 3, "#b98a52");
      if (lv >= 2) { glow(0, -10, 26, 0.18); R(-8, -31, 3, 4, "#6b5a44"); const s2 = (t * 0.6) % 1; R(-8 + Math.round(Math.sin(t * 2) * 2), -34 - s2 * 8, 2, 2, `rgba(220,220,230,${0.6 - s2 * 0.5})`); }
    } else if (id === "market") {
      shadow(13); for (const dx of [-11, 10]) R(dx, -18, 2, 24, "#6b3f24");
      for (let i = 0; i < 8; i++) R(-12 + i * 3, -22, 3, 6, i % 2 ? "#f2ead8" : "#3b4f9a"); R(-12, -16, 24, 1, OUTL);
      R(-9, -2, 7, 6, "#b98a52"); R(-9, -2, 7, 1, "#d9a86c"); R(2, -1, 7, 5, "#8a5533"); R(-8, -4, 2, 2, "#ff8a5c"); R(-5, -4, 2, 2, "#6fbf62"); R(3, -3, 2, 2, "#ffcf4a"); R(6, -3, 2, 2, "#c8102e");
      if (lv >= 2) { for (let i = 0; i < 5; i++) { const sw = Math.round(Math.sin(t * 2 + i) * 1); R(-10 + i * 5, -15 + sw, 2, 3, ["#ffcf4a", "#ff8ab0", "#9ef0f5", "#6fbf62", "#ffcf4a"][i]); } glow(0, -12, 20, 0.14); }
    } else if (id === "forge") {
      shadow(12); R(-11, -12, 22, 18, OUTL); R(-10, -11, 20, 16, "#857ea5"); for (let i = 0; i < 3; i++) R(-10, -8 + i * 5, 20, 1, "#5e5680");
      R(4, -26, 6, 15, OUTL); R(5, -25, 4, 14, "#5e5680"); R(-7, -3, 8, 6, "#1b1633"); const fl = 0.5 + 0.5 * Math.sin(t * 10);
      R(-6, -2, 6, 4, fl > 0.5 ? "#ff8a3c" : "#ffcf4a"); glow(-3, 0, 14 + lv * 3, 0.22 + fl * 0.08);
      R(-12, 2, 6, 2, OUTL); R(-11, 0, 4, 2, "#5e5680");
      if (lv >= 2) { R(3, -30, 8, 5, OUTL); R(4, -29, 6, 3, "#5e5680"); for (let i = 0; i < 2; i++) { const s2 = (t * 1.3 + i * 0.5) % 1; R(-4 + Math.round(Math.sin(t * 7 + i) * 3), -4 - s2 * 10, 1, 1, `rgba(255,190,90,${1 - s2})`); } R(11, -8, 1, 12, "#6b3f24"); R(10, -9, 3, 2, "#cacee0"); R(10, -3, 3, 2, "#cacee0"); }
    } else if (id === "yard") {
      shadow(13); R(-12, 3, 24, 1, "#8a5533"); for (const dx of [-12, -4, 4, 11]) R(dx, -1, 1, 5, "#6b3f24");
      const dummy = (dx, ph) => { const sw = Math.round(Math.sin(t * 1.5 + ph) * 0.6); R(dx, -14, 1, 17, "#6b3f24"); R(dx - 4, -11 + sw, 9, 2, "#b98a52"); R(dx - 2, -15, 5, 8, "#d9c9a0"); R(dx - 1, -19, 3, 4, "#d9c9a0"); R(dx - 2, -13, 5, 1, "#a8403a"); };
      dummy(-6, 0);
      if (lv >= 2) { R(5, -16, 1, 19, "#6b3f24"); R(2, -18, 8, 8, OUTL); R(3, -17, 6, 6, "#f2ead8"); R(4, -16, 4, 4, "#c8102e"); R(5, -15, 2, 2, "#f2ead8"); R(10, -20, 1, 10, "#6b3f24"); R(11, -20, 4, 3, "#3ee0e8"); }
      else dummy(5, 1.5);
    } else if (id === "post") {
      shadow(10); R(-9, -18, 18, 24, OUTL); R(-8, -12, 16, 17, "#c9a070"); R(-10, -20, 20, 8, OUTL); R(-9, -19, 18, 6, "#3b2f7a"); R(-3, -8, 6, 3, OUTL); R(-2, -7, 4, 1, "#ffcf4a");
      R(-6, -2, 4, 7, "#5a3a24"); R(8, -14, 1, 12, "#6b3f24"); R(9, -14, 4, 3, "#c8102e");
      if (lv >= 2) { R(-8, -27, 10, 8, OUTL); R(-7, -26, 8, 6, "#8a5533"); for (let i = 0; i < 3; i++) { const bob = Math.round(Math.sin(t * 4 + i * 2) * 1); R(-6 + i * 3, -29 + bob, 2, 2, "#e8e4f0"); R(-6 + i * 3, -28 + bob, 1, 1, "#857ea5"); } }
    }
    if (sc) { for (const dx of [-13, 12]) R(dx, -30, 1, 36, "#b98a52"); for (const dy of [-22, -12]) R(-13, dy, 26, 1, "#b98a52"); R(-13, -30, 26, 1, "#8a5533");
      R(-1, 0, 6, 3, "#857ea5"); R(-6, 1, 4, 2, "#b98a52"); }
    const near2 = near({ x: pr.px, y: pr.py }, 22) && mode === "play" && kOpen();
    if (near2) drawPrompt(g2, x, y - 36);
  }
  const _drawPropK = drawProp;
  drawProp = function (g2, pr, x, y) { if (!pr.kessa) return _drawPropK(g2, pr, x, y); drawKessaProp(g2, pr, Math.round(x), Math.round(y)); };
  // ---- the board and the lots
  D.kessa_board = { who: null, text: "", choices: [] };
  D.kessa_p = { who: null, text: "", choices: [] };
  let kCur = null;
  const kCost = c => `${c.coin} coin and ${c.shards} salt shard${c.shards === 1 ? "" : "s"}`;
  const kState = P => { const lv = kLv(P.id), b = kBuilding(P.id); return b ? `being built (ready at dawn of day ${b.ready})` : lv >= P.lv.length ? "finished" : lv ? `level ${lv} of ${P.lv.length}` : "empty lot"; };
  function boardNode() {
    const S = spoils(), n = D.kessa_board, done = KESSA.filter(P => kLv(P.id) >= P.lv.length).length;
    n.text = `(Elder Nadia's board by the well.) KESSA, REBUILDING. ${kPeople()} people live here. You carry ${G.coins} coin and ${S.shards} salt shard${S.shards === 1 ? "" : "s"} (won in battle).${done === KESSA.length ? " Every line is crossed out. Somebody has drawn a bell at the bottom." : " Builders finish by the next dawn."}`;
    n.choices = [...KESSA.map(P => ({ t: `${P.name.replace(/^The /, "")}: ${kState(P)}`, go: "kessa_p", act: () => projectNode(P) })), { t: "Leave", go: null }];
  }
  function projectNode(P) {
    kCur = P; const n = D.kessa_p, lv = kLv(P.id), b = kBuilding(P.id), next = P.lv[lv], S = spoils();
    let text = `${P.name}. ${lv ? `Now: ${P.lv[lv - 1].eff}` : P.who}`;
    if (b) text += ` The builders are at work; it will be ready at dawn of day ${b.ready}. Sleep at a rest point at night to get there sooner.`;
    else if (next) text += ` ${lv ? "Raise it further" : "Build it"} for ${kCost(next)}: ${next.eff}${G.stage < next.stage ? ` (The builders can't start this until Chapter ${["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][next.stage]}.)` : ""}`;
    else text += " It is finished. People stop you in the street to say so.";
    n.text = text;
    n.choices = [];
    if (!b && next) n.choices.push({ t: `${lv ? "Raise it" : "Build it"}: ${kCost(next)}`, go: "kessa_p", act: () => { orderBuild(P); projectNode(P); },
      req: () => G.stage >= next.stage && G.coins >= next.coin && spoils().shards >= next.shards, reqText: G.stage < next.stage ? "later in the story" : kCost(next) });
    if (P.id === "market" && lv && !b) n.choices.push({ t: G.flags.kMarketDay === kDay() ? "Today's supplies: already collected" : "Collect today's supplies", go: "kessa_p", act: () => { marketSupplies(); projectNode(P); }, req: () => G.flags.kMarketDay !== kDay(), reqText: "a new day" });
    n.choices.push({ t: "Back to the board", go: "kessa_board", act: boardNode }, { t: "Leave", go: null });
    void S;
  }
  function orderBuild(P) {
    const lv = kLv(P.id), next = P.lv[lv], S = spoils();
    if (!next || kBuilding(P.id) || G.stage < next.stage || G.coins < next.coin || S.shards < next.shards) return;
    G.coins -= next.coin; S.shards -= next.shards; Object.assign(kRec(P.id), { ready: kDay() + 1 });
    Music.sound("item"); toast(`The builders start on ${P.name}. Ready at the next dawn.`);
    kessaProps(); save(); updateHud();
  }
  function marketSupplies() {
    const lv = kLv("market"); if (!lv || G.flags.kMarketDay === kDay()) return;
    G.flags.kMarketDay = kDay(); const got = { salve: 2 };
    if (lv >= 2) { got.tonic = 1; const rare = ["gsalve", "ether", "salts"].filter(k => ITEMS[k]); const r = pick(rare); got[r] = (got[r] || 0) + 1; }
    for (const [k, n] of Object.entries(got)) G.items[k] = (G.items[k] || 0) + n;
    Music.sound("item"); toast(`Supplies from the Market Hall: ${Object.entries(got).map(([k, n]) => `${ITEMS[k].name} ×${n}`).join(", ")}.`); save(); updateHud();
  }
  const _interactK = interact;
  interact = function () {
    if (kOpen() && mode === "play") {
      if (near({ x: KBOARD.x * TILE + 8, y: KBOARD.y * TILE + 8 }, 22)) { boardNode(); openDialog("kessa_board"); return true; }
      for (const P of KESSA) if (near({ x: P.x * TILE + 8, y: P.y * TILE + 8 }, 22)) { projectNode(P); openDialog("kessa_p"); return true; }
    }
    return _interactK();
  };
  // ---- the builders finish at dawn; the first visit after the prologue points at the board
  let kTick = 0;
  const _updateK = update;
  update = function (dt) {
    _updateK(dt);
    if (!G || mode !== "play" || (kTick -= dt) > 0) return; kTick = 1;   // news waits for the open road, never over a dialogue or a battle
    let done = null;
    for (const P of KESSA) { const r = G.kessa && G.kessa[P.id]; if (r && r.ready && kDay() >= r.ready) { r.lv = (r.lv || 0) + 1; delete r.ready; done = P; renown(r.lv * 15, `${P.name} finished`); } }
    if (done) {
      kessaProps(); applyKessa(); save(); updateHud(); Music.sound("victory");
      toast(`${done.name} is finished. ${done.lv[kLv(done.id) - 1].eff}`);
      if (KESSA.every(P => kLv(P.id) >= P.lv.length) && !G.flags.kessaWhole) { G.flags.kessaWhole = true; setTimeout(() => card("Kessa", "Home Again", `Every line on Nadia's board is crossed out. ${kPeople()} people live in Kessa now. Tonight they hang lanterns between the new roofs and eat in the street, and somebody keeps a chair for the courier.`), 1200); }
    }
    if (kOpen() && mode === "play" && !G.flags.kessaHint && Math.hypot(G.px - KBOARD.x * TILE, G.py - KBOARD.y * TILE) < 200) { G.flags.kessaHint = true; toast("Elder Nadia has put up a rebuilding board by the well."); }
  };
  ACHIEVEMENTS.push(
    ["kessa1", "The First Stone", "Rebuild something in Kessa.", () => KESSA.some(P => kLv(P.id) >= 1)],
    ["kessa6", "Home Again", "Raise every place in Kessa to its last level.", () => KESSA.every(P => kLv(P.id) >= P.lv.length)],
  );
  const _extraFatesK = extraFates;
  extraFates = function (k) { const out = _extraFatesK(k), n = KESSA.filter(P => kLv(P.id)).length;
    if (n) out.push(n === KESSA.length ? `Kessa, which had nothing to spare, now has an inn, a market, a forge and a post, and a garden that smells of mint. ${kPeople()} people live there.` : `In Kessa, ${KESSA.filter(P => kLv(P.id)).map(P => P.name.replace(/^The /, "the ")).join(", ")} still stand${n === 1 ? "s" : ""}, built with a courier's coin.`);
    return out; };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), {
    kessa: () => JSON.parse(JSON.stringify(G.kessa || {})),
    kessaBuild: (id, lv) => { const r = kRec(id); r.lv = lv; delete r.ready; kessaProps(); applyKessa(); return r; },
    kessaBoard: () => { boardNode(); openDialog("kessa_board"); return D.kessa_board.choices.map(c => c.t); },
    kessaProject: id => { projectNode(KESSA.find(P => P.id === id)); openDialog("kessa_p"); return { text: D.kessa_p.text, choices: D.kessa_p.choices.map(c => c.t) }; },
  }), 0);

