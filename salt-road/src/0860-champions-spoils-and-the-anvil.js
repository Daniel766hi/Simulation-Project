  // ================================================================== CHAMPIONS, SPOILS AND THE ANVIL
  // Any ordinary monster can turn up as a champion: tougher, richer, and carrying one or two powers that change how
  // the fight has to be played (a Vampiric one heals from you, a Warded one needs its ward broken first, an Undying
  // one gets up again). Some roam the map already glowing, so you can choose to take them on or walk around.
  // Every win pays spoils beside the coin: salt shards from anything, a champion core from a champion or a boss.
  // At the smiths' anvils (Odo, Dov, Qasim) shards temper each fighter's weapon and armour up to +5, and a core sets
  // a rune in either one. Runes show on the fighter in battle and flare when they fire.
  const AFFIX = {
    vampiric: { name: "Vampiric", col: "#ff3048", desc: "heals from every wound it deals" },
    ironhide: { name: "Ironhide", col: "#c8d4e8", desc: "armoured: more defence, and every blow lands a fifth lighter" },
    swift: { name: "Swift", col: "#6ff0ff", desc: "fast, and often strikes a second time" },
    thorned: { name: "Thorned", col: "#8ee060", desc: "a fifth of every blow it takes comes back at the striker" },
    frenzied: { name: "Frenzied", col: "#ff8a2a", desc: "hits harder every time it is hurt" },
    warded: { name: "Warded", col: "#c9a6ff", desc: "a ward soaks damage first, and returns every third round" },
    undying: { name: "Undying", col: "#f4f0d8", desc: "gets up once after it falls" },
  };
  const AFFIX_KEYS = Object.keys(AFFIX);
  const champHas = (u, k) => !!(u && u.champ && u.champ.includes(k));
  const spoils = () => (G.spoils = G.spoils || { shards: 0, cores: 0, champs: 0 });
  function champChance(o) {
    if (!G || (G.stage === 0 && !(G.ng > 0))) return 0;   // the prologue stays a tutorial
    if (o.boss || o.echo || o.weekly || o.apology) return 0;
    if (o.deep) return Math.min(0.45, 0.12 + 0.02 * o.deep);
    return Math.min(0.2, 0.04 + 0.01 * G.stage + 0.04 * (G.ng || 0));
  }
  function rollAffixes(o) {
    const late = o.deep ? o.deep >= 8 : G.stage >= 8, n = late && Math.random() < 0.35 ? 2 : 1, out = [];
    while (out.length < n) { const k = pick(AFFIX_KEYS); if (!out.includes(k)) out.push(k); }
    return out;
  }
  function makeChampion(u, affixes) {
    if (!u || u.boss || u.champ) return u;
    u.champ = affixes.slice();
    u.maxHp = u.hp = Math.round(u.maxHp * 1.7); u.atk = Math.round(u.atk * 1.15);
    if (champHas(u, "ironhide")) u.def += 5;
    if (champHas(u, "swift")) u.spd += 4;
    if (champHas(u, "warded")) u.ward = u.wardMax = Math.round(u.maxHp * 0.25);
    u.name = `${AFFIX[affixes[0]].name} ${u.name}`;
    return u;
  }
  // rolled while a battle is being set up (not for anything summoned later)
  let champSetup = null;
  const _unitFromMonsterC = unitFromMonster;
  unitFromMonster = function (id, i, n) {
    const u = _unitFromMonsterC(id, i, n), s = champSetup;
    if (!s || u.boss || MONSTERS[id].boss) return u;
    if (s.forced && s.forced.length && i === 0) { makeChampion(u, s.forced); s.count++; return u; }
    if (s.count < s.max && Math.random() < s.chance) { makeChampion(u, rollAffixes(s.opts)); s.count++; }
    return u;
  };
  const _startBattleC = startBattle;
  startBattle = function (group, opts = {}) {
    const o = opts || {}, fieldMon = o.fieldId && typeof field !== "undefined" ? field.find(x => x.id === o.fieldId) : null;
    const chance = champChance(o), max = o.deep ? (o.deep >= 10 ? 3 : 2) : G.stage >= 6 ? 2 : 1;
    champSetup = { opts: o, chance, max, count: 0, forced: fieldMon && fieldMon.champ && !o.boss ? fieldMon.champ : null };
    let r;
    try { r = _startBattleC(group, opts); } finally { champSetup = null; }
    if (battle) {
      const champs = battle.foes.filter(f => f.champ);
      for (const f of champs) {
        const p = unitPos(f); burst(p.x, p.y - 20, AFFIX[f.champ[0]].col, 26, 70);
        setTimeout(() => { if (battle && !f.dead) popupText(f, "CHAMPION", AFFIX[f.champ[0]].col); }, 350);
      }
      if (champs.length) {
        const f = champs[0];
        blog(`A champion! ${f.name.replace(/ [A-C]$/, "")}: ${f.champ.map(k => AFFIX[k].desc).join("; ")}.`);
        if (!G.flags.champTip) { G.flags.champTip = true; setTimeout(() => toast("Champions are tougher and pay better: extra coin, salt shards and a champion core. Take the cores and shards to a smith's anvil to temper gear and set runes."), 0); }
      }
    }
    return r;
  };
  // a few monsters on the map are champions already, glowing so you can see them coming
  const _spawnFieldC = spawnField;
  spawnField = function () {
    _spawnFieldC();
    const ch = champChance({}) * 0.9;
    for (const f of field) {
      const lead = MONSTERS[f.group[0]];
      if (!f.elite && lead && !lead.boss && Math.random() < ch) f.champ = rollAffixes({});
    }
  };
  const _drawFieldMonsterC = drawFieldMonster;
  drawFieldMonster = function (g, f, x, y) {
    if (f.champ) {   // a glow on the ground under it, drawn first so the monster stands in it
      const col = AFFIX[f.champ[0]].col, pulse = 0.5 + 0.5 * Math.sin(time * 4 + f.t);
      g.save(); g.globalAlpha = 0.25 + 0.2 * pulse; g.fillStyle = col; g.beginPath(); g.ellipse(Math.round(x), Math.round(y) + 1, 10, 3.5, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    _drawFieldMonsterC(g, f, x, y);
    if (f.champ) {
      const X = Math.round(x), Y = Math.round(y), bob = Math.round(Math.sin(time * 3 + f.t) * 1.5);
      f.champ.forEach((k, j) => { g.fillStyle = AFFIX[k].col; const cx = X - (f.champ.length - 1) * 3 + j * 6, cy = Y - 29 + bob; g.fillRect(cx - 1, cy - 2, 3, 5); g.fillRect(cx - 2, cy - 1, 5, 3); });
      g.fillStyle = AFFIX[f.champ[0]].col;
      for (let j = 0; j < 3; j++) { const s = (time * 0.7 + j / 3 + f.t) % 1; g.globalAlpha = 1 - s; g.fillRect(X + Math.round(Math.sin(j * 2.1 + time * 2) * 7), Y - Math.round(s * 20), 1, 1); }
      g.globalAlpha = 1;
    }
  };
  // ---- the rules each power adds
  const _foeAtkC = foeAtk;
  foeAtk = function (f) { return _foeAtkC(f) * (1 + 0.08 * (f.frenzy || 0)); };
  const _chooseIntentC = chooseIntent;
  chooseIntent = function (f) {
    if (battle && champHas(f, "warded") && battle.round > 1 && battle.round % 3 === 1 && f.ward < f.wardMax && !f.dead) { f.ward = f.wardMax; popupText(f, "ward returns", AFFIX.warded.col); }
    return _chooseIntentC(f);
  };
  const CH_FX = [];   // rings where a power or a rune fires
  const chRing = (u, col) => { const p = unitPos(u); CH_FX.push({ x: p.x, y: p.y - unitTop(u) * 0.45, col, t0: time }); };
  const _damageC = damage;
  damage = function (target, amount, o = {}) {
    if (!battle || !target) return _damageC(target, amount, o);
    let amt = amount;
    if (target.side === "foe" && target.champ && amt > 0) {
      if (champHas(target, "ironhide")) amt = Math.max(1, Math.round(amt * 0.8));
      if (target.ward > 0) {
        const soak = Math.min(target.ward, amt); target.ward -= soak; amt -= soak;
        popupText(target, target.ward > 0 ? `ward -${soak}` : "WARD BROKEN", AFFIX.warded.col); chRing(target, AFFIX.warded.col);
        if (target.ward <= 0) { shake = Math.max(shake, 5); Music.sound("crit"); }
        if (amt <= 0) { target.hurt = 0.2; return 0; }
      }
    }
    if (target.side === "hero" && amt > 0 && !o.silent && runeOf(target.id, "armor") === "wall") {
      battle.wallUsed = battle.wallUsed || {};
      if (!battle.wallUsed[target.id]) { battle.wallUsed[target.id] = true; amt = Math.max(1, Math.ceil(amt / 2)); popupText(target, "the Wall holds", RUNES.wall.col); chRing(target, RUNES.wall.col); }
    }
    const r = _damageC(target, amt, o);
    if (target.side === "foe" && target.champ) {
      if (champHas(target, "frenzied") && r > 0 && !target.dead && (target.frenzy || 0) < 6) { target.frenzy = (target.frenzy || 0) + 1; if (target.frenzy % 2 === 0) popupText(target, `frenzy +${target.frenzy * 8}%`, AFFIX.frenzied.col); }
      if (target.dead && champHas(target, "undying") && !target.rose) {
        target.rose = true; target.dead = false; target.deathT = 0; target.hp = Math.round(target.maxHp * 0.3); target.st = {};
        setTimeout(() => { if (!battle || target.dead) return; popupText(target, "RISES AGAIN", AFFIX.undying.col); chRing(target, AFFIX.undying.col); const p = unitPos(target); burst(p.x, p.y - 20, AFFIX.undying.col, 30, 80); Music.sound("boss"); shake = Math.max(shake, 8); blog(`${target.name} will not stay down. It rises again!`); }, 250);
      }
    }
    return r;
  };
  // ---- runes, and what champions do when they hit or are hit
  const RUNES = {
    hooks: { slot: "weapon", name: "Rune of Hooks", col: "#ff4a5a", desc: "3 in 10 hits open a wound (bleed 3 for 3 turns)" },
    thirst: { slot: "weapon", name: "Rune of Thirst", col: "#d06bff", desc: "heals the wielder for a fifth of the damage dealt" },
    thunder: { slot: "weapon", name: "Rune of Thunder", col: "#8ec8ff", desc: "1 in 4 hits arcs a spark into another foe for 40%" },
    salt: { slot: "weapon", name: "Rune of Salt", col: "#e8f4ff", desc: "1 in 4 hits cracks the target's armour for two rounds" },
    brambles: { slot: "armor", name: "Rune of Brambles", col: "#8ee060", desc: "a quarter of every blow taken lashes back at the attacker" },
    wells: { slot: "armor", name: "Rune of Wells", col: "#4ae0c0", desc: "heals 6% of max health at the start of each turn" },
    wall: { slot: "armor", name: "Rune of the Wall", col: "#ffcf4a", desc: "the first blow each battle lands at half" },
  };
  const temperRec = id => ((G.temper = G.temper || {})[id] = G.temper[id] || {});
  const temperOf = (id, slot) => ((G.temper || {})[id] || {})[slot] || 0;
  const runeOf = (id, slot) => ((G.temper || {})[id] || {})[slot === "weapon" ? "rw" : "ra"] || null;
  const _attackRollC = attackRoll;
  attackRoll = function (att, target, power, o = {}) {
    const r = _attackRollC(att, target, power, o);
    if (!battle || !att || !target || !r || r.dodged || !(r.dmg > 0)) return r;
    if (att.side === "foe" && target.side === "hero") {
      if (champHas(att, "vampiric") && !att.dead) { const h = Math.max(1, Math.round(r.dmg * 0.35)); att.hp = Math.min(att.maxHp, att.hp + h); popupText(att, `+${h}`, AFFIX.vampiric.col); chRing(att, AFFIX.vampiric.col); }
      if (champHas(att, "swift") && !att.dead && alive(target) && att.swiftRound !== battle.round && Math.random() < 0.4) {
        att.swiftRound = battle.round; att.lunge = 1; popupText(att, "again!", AFFIX.swift.col);
        attackRoll(att, target, (power || 1) * 0.6, { noFury: true });
      }
      if (runeOf(target.id, "armor") === "brambles" && !att.dead) {
        const back = Math.max(1, Math.round(r.dmg * 0.25)); damage(att, back, { noFury: true, silent: true }); popup(att, back, RUNES.brambles.col); chRing(att, RUNES.brambles.col);
      }
    } else if (att.side === "hero" && target.side === "foe") {
      if (champHas(target, "thorned") && alive(att)) {
        const back = Math.min(att.ref.hp - 1, Math.max(1, Math.round(r.dmg * 0.2)));   // thorns sting but never knock a hero out
        if (back > 0) { damage(att, back, { noFury: true, silent: true }); popup(att, back, AFFIX.thorned.col); chRing(att, AFFIX.thorned.col); }
      }
      const wr = runeOf(att.id, "weapon"), R = wr && RUNES[wr];
      if (wr === "hooks" && !target.dead && !target.st.bleed && Math.random() < 0.3) { target.st.bleed = { dmg: 3, turns: 3 }; popupText(target, "hooked", R.col); chRing(target, R.col); }
      if (wr === "thirst" && alive(att) && att.ref.hp < att.ref.maxHp) { const h = Math.max(1, Math.round(r.dmg * 0.2)); att.ref.hp = Math.min(att.ref.maxHp, att.ref.hp + h); popupText(att, `+${h}`, R.col); }
      if (wr === "thunder" && Math.random() < 0.25) {
        const others = battle.foes.filter(f => !f.dead && f !== target), to = others.length ? pick(others) : !target.dead ? target : null;
        if (to) { const d = Math.max(1, Math.round(r.dmg * 0.4)); CH_FX.push({ bolt: true, a: unitPos(target), b: unitPos(to), ta: unitTop(target), tb: unitTop(to), col: R.col, t0: time }); damage(to, d, { noFury: true }); Music.sound("hit"); }
      }
      if (wr === "salt" && !target.dead && Math.random() < 0.25) { target.st.brk = Math.max(target.st.brk || 0, 3); popupText(target, "armour cracks", R.col); chRing(target, R.col); }
    }
    return r;
  };
  const _heroChooseC = heroChoose;
  heroChoose = function (u) {
    if (battle && u && runeOf(u.id, "armor") === "wells" && alive(u) && u.ref.hp < u.ref.maxHp) {
      const h = Math.max(2, Math.round(u.ref.maxHp * 0.06)); u.ref.hp = Math.min(u.ref.maxHp, u.ref.hp + h); popupText(u, `+${h}`, RUNES.wells.col); chRing(u, RUNES.wells.col);
    }
    return _heroChooseC(u);
  };
  // the champion's powers, on the line above it
  const _breakInfoC = breakInfo;
  breakInfo = function (f) {
    const b = _breakInfoC(f); if (!f.champ) return b;
    const tag = "★" + f.champ.map(k => AFFIX[k].name.toUpperCase()).join(" ") + (f.ward > 0 ? ` ${f.ward}` : "") + (f.frenzy ? ` +${f.frenzy * 8}%` : "");
    return b ? `${b} · ${tag}` : tag;
  };
  // ---- spoils
  const _victoryC = victory;
  victory = function () {
    const B = battle; let shards = 0, cores = 0, champs = 0, purse = 0;
    if (B) for (const f of B.foes) {
      if (f.summoned) continue;
      shards += 1 + (Math.random() < 0.35 ? 1 : 0);
      if (f.champ) { champs++; cores++; shards += 3; purse += Math.round(rand(...MONSTERS[f.id].coin) * (1 + f.champ.length * 0.5)); }
      if (f.boss) { shards += 5; cores++; }
    }
    _victoryC();
    if (!B || battle !== B) return;
    const S = spoils(); S.shards += shards; S.cores += cores; S.champs += champs; G.coins += purse;
    blog(`${battle.log} Spoils: +${shards} salt shard${shards === 1 ? "" : "s"}${cores ? `, +${cores} champion core${cores === 1 ? "" : "s"}` : ""}${purse ? `, +${purse} coin from the champion's hoard` : ""}.`);
    save(); updateHud();
  };
  // ---- the anvil: tempering and runes
  const TEMPER_MAX = 5;
  const temperCost = L => ({ shards: 2 * L + 1, coin: 15 * L });   // for going up to level L
  const soft = id => WCLASS[id] === "focus" || WCLASS[id] === "flask";
  const temperStats = (id, slot) => slot === "armor" ? { def: 1, maxHp: 5 } : soft(id) ? { atk: 1, maxSp: 2 } : { atk: 2 };
  function applyTemper(id, h, slot, levels) {
    for (const [k, v] of Object.entries(temperStats(id, slot))) h[k] += v * levels;
    if (slot === "armor") h.hp = levels > 0 ? Math.min(h.maxHp, h.hp + 5 * levels) : Math.max(1, Math.min(h.hp, h.maxHp));
    else if (h.sp > h.maxSp) h.sp = h.maxSp;
  }
  function temper(id, slot) {
    const h = G.party[id], L = temperOf(id, slot) + 1, c = temperCost(L), S = spoils();
    if (!h || L > TEMPER_MAX || L > shopTier() || S.shards < c.shards || G.coins < c.coin) return;
    S.shards -= c.shards; G.coins -= c.coin; temperRec(id)[slot] = L;
    for (const [k, v] of Object.entries(temperStats(id, slot))) h[k] += v;
    if (slot === "armor") h.hp = Math.min(h.maxHp, h.hp + 5);
    Music.sound("crit"); toast(`${h.name}'s ${slot === "weapon" ? "weapon" : "armour"} is tempered to +${L}.`); save(); updateHud();
  }
  function setRune(id, key) {
    const R = RUNES[key], S = spoils(); if (!R || !G.party[id] || S.cores < 1 || G.coins < 25) return;
    S.cores -= 1; G.coins -= 25; temperRec(id)[R.slot === "weapon" ? "rw" : "ra"] = key;
    Music.sound("item"); toast(`${G.party[id].name} now carries the ${R.name}.`); save(); updateHud();
  }
  const slotName = (id, slot) => { const k = gearOf(id)[slot]; return k ? GEAR[k].name : slot === "weapon" ? "weapon" : "armour"; };
  const temperText = (id, slot) => { const st = temperStats(id, slot); return statText(st); };
  D.anvil_0 = { who: "odo", text: "", choices: [] };
  D.anvil_h = { who: "odo", text: "", choices: [] };
  D.anvil_r = { who: "odo", text: "", choices: [] };
  let anvilWho = "odo", anvilBack = "odo_0", anvilHero = null;
  const anvilPurse = () => `You carry ${spoils().shards} salt shard${spoils().shards === 1 ? "" : "s"} and ${spoils().cores} champion core${spoils().cores === 1 ? "" : "s"}.`;
  function anvilMain() {
    const n = D.anvil_0, fighters = (G.active && G.active.length ? G.active : G.members).slice(0, 4).filter(id => WCLASS[id] && G.party[id]);
    n.who = anvilWho; n.choices.length = 0;
    n.text = `${{ odo: "(Odo pumps the bellows of Ilse's old anvil.) Shards from the salt fold into the steel. Cores I don't understand, but the runes take.", dov: "(Dov heats the anvil white.) Salt shards to temper, champion cores to carve a rune. Who's first?", qasim: "(Qasim sets out a caravan anvil and a pot of glowing salt.) The desert sells its shards cheap and its cores dear. Choose." }[anvilWho] || "The anvil is hot."} ${anvilPurse()} Tempering goes to +${Math.min(TEMPER_MAX, shopTier())} for now.`;
    for (const id of fighters) {
      const w = temperOf(id, "weapon"), a = temperOf(id, "armor"), rw = runeOf(id, "weapon"), ra = runeOf(id, "armor");
      n.choices.push({ t: `${G.party[id].name}: weapon +${w}, armour +${a}${rw || ra ? ` · ${[rw, ra].filter(Boolean).map(k => RUNES[k].name.replace("Rune of ", "")).join(" & ")}` : ""}`, go: "anvil_h", act: () => { anvilHero = id; anvilHeroPage(); } });
    }
    if (!fighters.length) n.text += " Nobody fighting needs the anvil.";
    n.choices.push({ t: "That's all", go: anvilBack });
  }
  function anvilHeroPage() {
    const id = anvilHero, n = D.anvil_h, h = G.party[id]; n.who = anvilWho; n.choices.length = 0;
    n.text = `${h.name}. ${anvilPurse()} Tempering adds ${temperText(id, "weapon")} to the weapon and ${temperText(id, "armor")} to the armour for each level, and the smith works it into any new piece you buy. A rune costs a champion core and 25 coin; setting a new one replaces the old.`;
    for (const slot of ["weapon", "armor"]) {
      const L = temperOf(id, slot) + 1, c = temperCost(L);
      if (L > TEMPER_MAX) { n.choices.push({ t: `${slotName(id, slot)}: tempered to +${TEMPER_MAX}, as far as salt can go`, go: "anvil_h", req: () => false, reqText: "nothing more" }); continue; }
      n.choices.push({ t: `Temper the ${slotName(id, slot)} to +${L} (${temperText(id, slot)}) · ${c.shards} shards, ${c.coin} coin`, go: "anvil_h", act: () => { temper(id, slot); anvilHeroPage(); },
        req: () => L <= shopTier() && spoils().shards >= c.shards && G.coins >= c.coin, reqText: L > shopTier() ? "a smith who has seen more of the road (later chapter)" : `${c.shards} shards and ${c.coin} coin` });
    }
    for (const slot of ["weapon", "armor"]) { const cur = runeOf(id, slot); n.choices.push({ t: `${slot === "weapon" ? "Weapon" : "Armour"} rune: ${cur ? RUNES[cur].name : "none"}. Choose a rune…`, go: "anvil_r", act: () => anvilRunePage(slot) }); }
    n.choices.push({ t: "Back", go: "anvil_0", act: anvilMain });
  }
  function anvilRunePage(slot) {
    const id = anvilHero, n = D.anvil_r, h = G.party[id]; n.who = anvilWho; n.choices.length = 0;
    n.text = `Which rune for ${h.name}'s ${slotName(id, slot)}? ${anvilPurse()}`;
    for (const [k, R] of Object.entries(RUNES)) if (R.slot === slot) {
      const cur = runeOf(id, slot) === k;
      n.choices.push({ t: `${R.name}: ${R.desc}${cur ? " (carried now)" : " · 1 core, 25 coin"}`, go: "anvil_h", act: () => { setRune(id, k); anvilHeroPage(); }, req: () => !cur && spoils().cores >= 1 && G.coins >= 25, reqText: cur ? "already set" : "a champion core and 25 coin" });
    }
    n.choices.push({ t: "Back", go: "anvil_h", act: anvilHeroPage });
  }
  const anvilChoice = (who, back) => ({ t: "The anvil: temper gear with salt shards, set runes with champion cores", go: "anvil_0", act: () => { anvilWho = who; anvilBack = back; anvilMain(); } });
  for (const [who, node] of [["odo", "odo_0"], ["dov", "dov_0"], ["qasim", "qasim_0"]]) {
    const N = D[node]; if (N && Array.isArray(N.choices)) N.choices.splice(Math.max(0, N.choices.length - 1), 0, anvilChoice(who, node));
  }
  // New Game+ carries Sable's stats: at an ending the temper comes off with the gear (runes too)
  const _endingC = ending;
  ending = function (kind) {
    for (const [id, t] of Object.entries(G.temper || {})) { const h = G.party[id]; if (!h) continue; for (const slot of ["weapon", "armor"]) if (t[slot]) applyTemper(id, h, slot, -t[slot]); }
    G.temper = {};
    return _endingC(kind);
  };
  // the party screen and the journal show it
  const _renderRosterC = renderRoster;
  renderRoster = function () {
    _renderRosterC();
    const cards = [...$("rosterList").children];
    G.members.forEach((id, i) => {
      const c = cards[i], w = temperOf(id, "weapon"), a = temperOf(id, "armor"), rw = runeOf(id, "weapon"), ra = runeOf(id, "armor");
      if (!c || !(w || a || rw || ra)) return;
      const row = document.createElement("div"); row.className = "bondline";
      row.textContent = `Tempered: weapon +${w}, armour +${a}${rw ? ` · ${RUNES[rw].name}` : ""}${ra ? ` · ${RUNES[ra].name}` : ""}`;
      c.insertBefore(row, c.children[2] || null);
    });
  };
  const _extraJournalCh = extraJournalHtml;
  extraJournalHtml = function () {
    const S = G.spoils; if (!S && !G.temper) return _extraJournalCh();
    const rows = G.members.filter(id => temperOf(id, "weapon") || temperOf(id, "armor") || runeOf(id, "weapon") || runeOf(id, "armor"))
      .map(id => `<li><b>${esc(G.party[id].name)}</b>: weapon +${temperOf(id, "weapon")}, armour +${temperOf(id, "armor")}${[runeOf(id, "weapon"), runeOf(id, "armor")].filter(Boolean).map(k => ` · ${RUNES[k].name} (${RUNES[k].desc})`).join("")}</li>`).join("");
    return _extraJournalCh() + `<h3>Spoils and the anvil</h3><ul><li>${(S || {}).shards || 0} salt shards, ${(S || {}).cores || 0} champion cores. Champions defeated: ${(S || {}).champs || 0}.</li>${rows}</ul>`;
  };
  ACHIEVEMENTS.push(
    ["champ1", "Champion's Bane", "Defeat a champion.", () => (G.spoils || {}).champs >= 1],
    ["champ25", "Hunter of Champions", "Defeat twenty-five champions.", () => (G.spoils || {}).champs >= 25],
    ["temper5", "Salt-Forged", "Temper a weapon or armour to +5.", () => Object.values(G.temper || {}).some(t => (t.weapon || 0) >= 5 || (t.armor || 0) >= 5)],
    ["runes2", "Runesmith", "Give one fighter a weapon rune and an armour rune.", () => Object.values(G.temper || {}).some(t => t.rw && t.ra)],
  );
  // ---- on screen: champions' glow and powers, runes on the fighters, rings and sparks when something fires
  const _drawRigFxC = drawRigFx;
  drawRigFx = function (k) {
    if (battle) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const f of battle.foes) if (f.champ && !f.dead) {
        const p = unitPos(f), top = unitTop(f), X = VP.ox + p.x * k, Yf = VP.oy + p.y * k, pulse = 0.5 + 0.5 * Math.sin(time * 3.5 + f.slot);
        const cols = f.champ.map(a => AFFIX[a].col);
        ctx.globalAlpha = 0.35 + 0.2 * pulse;   // a glowing ring on the ground
        const gr = ctx.createRadialGradient(X, Yf, 2 * k, X, Yf, 22 * k); gr.addColorStop(0, cols[0]); gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gr; ctx.save(); ctx.translate(X, Yf); ctx.scale(1, 0.28); ctx.fillRect(-22 * k, -22 * k, 44 * k, 44 * k); ctx.restore();
        ctx.globalCompositeOperation = "source-over";   // the rest in true colour, so it reads on the pale salt too
        for (let j = 0; j < 12; j++) {   // motes rising through it, one colour per power
          const s = (time * (0.5 + (j % 3) * 0.15) + j / 12) % 1; ctx.globalAlpha = 0.9 * (1 - s); ctx.fillStyle = cols[j % cols.length];
          ctx.fillRect(X + Math.sin(j * 4.7 + time * 1.3) * 16 * k, Yf - s * top * 1.05 * k, 1.5 * k, 1.5 * k);
        }
        if (f.ward > 0) {   // the ward: a shimmering shell, thinner as it is worn down
          const R = top * 0.62 * k, cy = Yf - top * 0.5 * k; ctx.globalAlpha = (0.25 + 0.35 * f.ward / f.wardMax) * (0.8 + 0.2 * pulse);
          ctx.strokeStyle = AFFIX.warded.col; ctx.lineWidth = 1.2 * k; ctx.beginPath();
          for (let a = 0; a <= 6; a++) { const t = a / 6 * Math.PI * 2 + time * 0.4; ctx[a ? "lineTo" : "moveTo"](X + Math.cos(t) * R, cy + Math.sin(t) * R); } ctx.stroke();
          ctx.globalAlpha *= 0.35; ctx.fillStyle = AFFIX.warded.col; ctx.fill();
        }
        if (f.frenzy) {   // flames that climb higher with every stack
          ctx.fillStyle = AFFIX.frenzied.col;
          for (let j = 0; j < f.frenzy * 3; j++) { const s = (time * 1.6 + j / (f.frenzy * 3)) % 1; ctx.globalAlpha = 0.8 * (1 - s); ctx.fillRect(X + Math.sin(j * 3.3) * 12 * k, Yf - (s * (8 + f.frenzy * 5)) * k, 2 * k, 3 * k); }
        }
        if (champHas(f, "undying") && !f.rose) {   // a pale halo it has not spent yet
          ctx.globalAlpha = 0.5 + 0.3 * pulse; ctx.strokeStyle = AFFIX.undying.col; ctx.lineWidth = 1 * k;
          ctx.beginPath(); ctx.ellipse(X, Yf - (top + 6) * k, 8 * k, 2.5 * k, 0, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
      for (const h of battle.heroes) if (alive(h)) {   // runes circle the fighter: the weapon rune at the chest, the armour rune at the feet
        const p = unitPos(h), X = VP.ox + p.x * k, Y = VP.oy + p.y * k;
        [[runeOf(h.id, "weapon"), 26, 1], [runeOf(h.id, "armor"), 4, -1]].forEach(([rk, up, dir]) => {
          if (!rk) return; const col = RUNES[rk].col, a = time * 2.2 * dir + (up > 10 ? 0 : Math.PI);
          for (let j = 0; j < 3; j++) {
            const t = a - j * 0.28, x = X + Math.cos(t) * 13 * k, y = Y - up * k + Math.sin(t) * 3.5 * k;
            ctx.globalAlpha = (Math.sin(t) > 0 ? 0.95 : 0.45) * (1 - j * 0.3); ctx.fillStyle = col;
            const s = (j ? 1.2 : 2) * k;
            if (!j) { ctx.fillStyle = "rgba(20,12,36,0.75)"; ctx.fillRect(x - s / 2 - k * 0.6, y - s - k * 0.6, s + k * 1.2, s * 2 + k * 1.2); ctx.fillRect(x - s - k * 0.6, y - s / 2 - k * 0.6, s * 2 + k * 1.2, s + k * 1.2); ctx.fillStyle = col; }
            ctx.fillRect(x - s / 2, y - s, s, s * 2); ctx.fillRect(x - s, y - s / 2, s * 2, s);
          }
        });
      }
      for (let i = CH_FX.length - 1; i >= 0; i--) {
        const e = CH_FX[i], age = time - e.t0; if (age > 0.6 || age < 0) { CH_FX.splice(i, 1); continue; }
        const u = age / 0.6; ctx.strokeStyle = e.col; ctx.lineWidth = (e.bolt ? 2 : 1.5) * k; ctx.globalAlpha = 1 - u;
        if (e.bolt) {   // a jagged spark from one foe to the next
          const ax = VP.ox + e.a.x * k, ay = VP.oy + (e.a.y - e.ta * 0.5) * k, bx = VP.ox + e.b.x * k, by = VP.oy + (e.b.y - e.tb * 0.5) * k;
          ctx.beginPath(); ctx.moveTo(ax, ay); for (let s = 1; s < 7; s++) { const q = s / 7; ctx.lineTo(ax + (bx - ax) * q + (Math.random() - 0.5) * 10 * k, ay + (by - ay) * q + (Math.random() - 0.5) * 10 * k); } ctx.lineTo(bx, by); ctx.stroke();
        } else { ctx.beginPath(); ctx.arc(VP.ox + e.x * k, VP.oy + e.y * k, (6 + u * 22) * k, 0, Math.PI * 2); ctx.stroke(); }
      }
      ctx.restore();
    }
    _drawRigFxC(k);
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), {   // after BOOT has made the hook object
    champTest(i, affixes) { if (!battle) return null; const f = battle.foes.filter(x => !x.dead && !x.boss)[i || 0]; if (!f) return null; makeChampion(f, affixes || ["warded", "frenzied"]); return { name: f.name, hp: f.hp, ward: f.ward }; },
    champState() { return battle ? battle.foes.map(f => ({ name: f.name, champ: f.champ || null, hp: f.hp, ward: f.ward || 0, frenzy: f.frenzy || 0, dead: f.dead, rose: !!f.rose })) : null; },
    spoils() { return { ...spoils() }; },
    giveSpoils(sh, co) { const S = spoils(); S.shards += sh || 0; S.cores += co || 0; return { ...S }; },
    temperNow(id, slot) { temper(id, slot); return { lvl: temperOf(id, slot), hero: { atk: G.party[id].atk, def: G.party[id].def, maxHp: G.party[id].maxHp } }; },
    runeNow(id, key) { setRune(id, key); return { ...((G.temper || {})[id] || {}) }; },
    anvil(who) { anvilWho = who || "odo"; anvilBack = `${anvilWho}_0`; anvilMain(); openDialog("anvil_0"); return D.anvil_0.choices.map(c => typeof c.t === "function" ? c.t() : c.t); },
    fieldChamps() { return field.filter(f => f.champ).map(f => ({ id: f.id, champ: f.champ, x: f.px, y: f.py })); },
    forceFieldChamp(i) { const f = field.filter(x => !x.elite)[i || 0]; if (f) f.champ = ["vampiric"]; return f ? { id: f.id, x: f.px, y: f.py, group: f.group } : null; },
  }), 0);

