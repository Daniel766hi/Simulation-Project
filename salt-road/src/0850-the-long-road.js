  // ================================================================== THE LONG ROAD: RANK, GIFTS, THE DEEP STAIR, ECHOES, THE WEEKLY TRIAL
  // Reasons to come back, all feeding one bar that lasts across playthroughs:
  //   Courier Rank   renown from battles, the day's tasks, achievements, the Stair and the Hall; every rank pays, and
  //                  ranks 3/6/9/12/15 unlock perks for good.
  //   Welcome back   a gift for each new real day you play, bigger with a visiting streak, a rare one every seventh day.
  //   The Deep Stair an endless descent: floor after floor of harder fights, a boss's echo every fifth floor, and a boon
  //                  to choose between floors. Leave with your spoils whenever you like; a defeat ends the run, gently.
  //   Hall of Echoes any boss you have beaten, again, at three tiers, with relics for clearing enough of them.
  //   Weekly Trial   one boss and one twist each week, scored by how few rounds you need.
  const META_KEY = "salt-road-meta";
  const meta = (() => { try { return Object.assign({ renown: 0, rank: 1, visit: "", streak: 0, bestStreak: 0, deepBest: 0, deepRuns: 0, echoes: {}, beaten: [], weekly: {}, ach: -1 }, JSON.parse(localStorage.getItem(META_KEY) || "{}")); } catch { return { renown: 0, rank: 1, visit: "", streak: 0, bestStreak: 0, deepBest: 0, deepRuns: 0, echoes: {}, beaten: [], weekly: {}, ach: -1 }; } })();
  const saveMeta = () => { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch { /* storage unavailable */ } };
  const rankNeed = r => 60 + 40 * r;
  const PERKS = [
    [3, "Light Pack", "+10% coin from every battle."],
    [6, "Provisioned", "Every Deep Stair run starts with a free Keen Edge boon."],
    [9, "Heavy Purse", "+20% coin from every battle (replaces Light Pack)."],
    [12, "Echo Collector", "Hall of Echoes rewards pay double coin."],
    [15, "Master Courier", "Choose from four boons on the Deep Stair instead of three."],
  ];
  const perk = r => meta.rank >= r;
  const inGame = () => G && mode !== "title" && G.party && G.members;
  function rankReward(r) {   // what a new rank pays into the current game
    const items = r % 5 === 0 ? ["phoenix", "ether", "gsalve"] : r % 2 ? ["salve", "tonic"] : ["gsalve", "salts"];
    const item = items.find(k => ITEMS[k]) || "salve", coins = 25 * r;
    if (inGame()) { G.coins += coins; G.items[item] = (G.items[item] || 0) + 1; save(); updateHud(); }
    return `+${coins} coin, ${ITEMS[item] ? ITEMS[item].name : item}`;
  }
  function renown(n, why) {
    if (!n) return;
    meta.renown += n; let ups = [];
    while (meta.renown >= rankNeed(meta.rank)) { meta.renown -= rankNeed(meta.rank); meta.rank++; const p = PERKS.find(x => x[0] === meta.rank); ups.push(`Courier Rank ${meta.rank}! ${rankReward(meta.rank)}${p ? `. Perk unlocked: ${p[1]}` : ""}.`); }
    saveMeta(); roadNote();
    if (ups.length) { Music.sound("victory"); ups.forEach((u, i) => setTimeout(() => toast(u), 400 + i * 2600)); }
    else if (why && n >= 10) toast(`+${n} renown · ${why}`);
  }
  // ---- welcome back: one gift per real day
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const dayBefore = s => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  function welcomeGift() {
    const t = today(); if (meta.visit === t || !inGame() || G.stage < 1) return;
    meta.streak = meta.visit === dayBefore(t) ? meta.streak + 1 : 1; meta.bestStreak = Math.max(meta.bestStreak, meta.streak); meta.visit = t;
    const s = meta.streak, coins = 20 + 10 * Math.min(s, 7), seventh = s % 7 === 0, item = seventh ? (ITEMS.phoenix ? "phoenix" : "gsalve") : s % 2 ? "salve" : "tonic";
    G.coins += coins; G.items[item] = (G.items[item] || 0) + 1; save(); updateHud(); saveMeta();
    card("Welcome back", s > 1 ? `${s} days on the road` : "A new day on the road",
      `Postmistress Ama kept something for you: ${coins} coin and ${ITEMS[item] ? ITEMS[item].name : item}.${seventh ? " A seventh day: she adds something rare." : ""} Come back tomorrow and it grows (up to 90 coin, and a rare gift every seventh day in a row). Visiting streak: ${s} day${s > 1 ? "s" : ""}.`);
    renown(seventh ? 50 : 10, "welcome back");
  }
  const _startGameR = startGame;
  startGame = function () { _startGameR(); setTimeout(welcomeGift, 900); };
  // ---- renown from battles, tasks and achievements; perks on coin
  const _victoryR = victory;
  victory = function () {
    const before = G.coins, o = battle && battle.opts;
    _victoryR();
    const got = G.coins - before, pct = perk(9) ? 0.2 : perk(3) ? 0.1 : 0;
    if (got > 0 && pct) G.coins += Math.round(got * pct);
    if (o && !o.deep && !o.echo && !o.weekly) renown(o.boss ? 25 : 2, o.boss ? "boss defeated" : "");
    if (o && o.boss && !o.echo && !o.weekly && !meta.beaten.includes(o.boss)) { meta.beaten.push(o.boss); saveMeta(); setTimeout(() => toast(`${MONSTERS[o.boss].name.split(",")[0]} now waits in the Hall of Echoes (Pause > The Long Road).`), 5200); }
  };
  let renownTick = 0;
  const _updateR = update;
  update = function (dt) {
    _updateR(dt);
    if (!inGame() || (renownTick -= dt) > 0) return; renownTick = 1.5;
    const d = G.flags.daily;
    if (d && d.chores) { const n = d.chores.filter(c => c.done).length, key = `${G.day}:${n}`, prev = G.flags.renownDay || "";
      if (key !== prev) { const [pd, pn] = prev.split(":").map(Number); if (pd === G.day && n > pn) renown((n - pn) * 6 + (n === d.chores.length ? 15 : 0), n === d.chores.length ? "a good day's work" : ""); G.flags.renownDay = key; } }
    const a = achGot().length; if (meta.ach < 0) { meta.ach = a; saveMeta(); } else if (a > meta.ach) { const k = a - meta.ach; meta.ach = a; renown(30 * k, "achievement"); }
  };
  // ---- bosses known to the Hall: beaten in this game or any earlier one
  const bossDead = { butcher: "butcherDead", mother: "motherDead", choirmaster: "choirDead", voss: "vossDead", hollis: "hollisDead", wyrm: "wyrmDead", quill: "quillDead", gulp: "gulpDead", maw: "mawDead", colossus: "colossusDead", vela: "velaDead", king: "kingDead", corvin: "corvinDead", ledgertree: "ledgerTreeDead", tollkeeper: "tollDead", oldmouth: "oldmouthDead" };
  const HALL = Object.keys(MONSTERS).filter(id => MONSTERS[id].boss && id !== "houndg" && id !== "king" && (BOSS_ART[id] || BOSS_ART[MONSTERS[id].sprite]))
    .sort((a, b) => MONSTERS[a].xp - MONSTERS[b].xp);
  const bossKnown = id => meta.beaten.includes(id) || (G && G.flags && ((G.flags.kills || {})[id] > 0 || G.flags[bossDead[id]]));
  const partyLevel = () => { const ids = (G.active && G.active.length ? G.active : G.members).slice(0, 4); return ids.reduce((s, id) => s + G.party[id].level, 0) / Math.max(1, ids.length); };
  const bossLevel = id => MONSTERS[id].xp / 25 + 3;
  function scaleFoes(hpK, atkK, defAdd = 0) { if (!battle) return; for (const f of battle.foes) { f.maxHp = f.hp = Math.max(1, Math.round(f.maxHp * hpK)); f.atk = Math.max(1, Math.round(f.atk * atkK)); f.def += defAdd; } }
  const catchUp = id => { const gap = Math.max(0, partyLevel() - bossLevel(id)); return [1 + gap * 0.09, 1 + gap * 0.05]; };   // an early boss fought late still bites
  // ---- the Deep Stair
  const DEEP_POOL = ["jackal", "ghoul", "leech", "choir", "wraith", "crawler", "drowned", "clerk", "thug", "bogghoul", "toad", "dvillager", "crab", "sailor", "eel", "harpy", "spark", "singer", "priest", "angler", "saltworm", "minerghoul", "sluicer", "rootbound", "ledgercrow", "scorpion", "dunewraith", "mirage"].filter(id => MONSTERS[id]);
  const BOONS = {
    keen: { name: "Keen Edge", desc: "Monsters on the Stair have 12% less health (stacks)." },
    ward: { name: "Salt Ward", desc: "Monsters on the Stair hit 10% softer (stacks)." },
    breath: { name: "Second Breath", desc: "The party recovers half its health and SP now." },
    gild: { name: "Gilded Road", desc: "+50% coin at the end of every floor (stacks)." },
    scholar: { name: "Scholar's Lamp", desc: "+40% bonus experience after every floor (stacks)." },
    slow: { name: "Heavy Air", desc: "Monsters on the Stair lose 1 speed (stacks)." },
    ember: { name: "Kindling", desc: "Every fight on the Stair starts with 20 Fury (stacks)." },
    bleed: { name: "Salt Wounds", desc: "Monsters start every fight bleeding." },
    crack: { name: "Cracked Shells", desc: "Monsters start every fight with broken armour." },
    mend: { name: "Mending Song", desc: "After each floor the party recovers a fifth of its health (stacks)." },
    shard: { name: "Shard Seam", desc: "+2 salt shards after each floor, for the anvil or Kessa's builders (stacks)." },
    glass: { name: "Glass Pact", desc: "Monsters have 30% less health but hit 20% harder (stacks).", rare: true },
  };
  // the Stair goes down through five places, five floors each, then round again, deeper and harder
  const BIOMES = [
    { name: "The Salt Steps", area: "deep", pool: ["jackal", "ghoul", "choir", "wraith", "crawler", "mirage", "scorpion", "dunewraith", "saltworm"], note: "" },
    { name: "The Drowned Galleries", area: "marsh", pool: ["leech", "drowned", "bogghoul", "toad", "dvillager", "eel", "crab", "angler"], note: "Monsters here have a fifth more health.", mod: () => scaleFoes(1.2, 1) },
    { name: "The Counting Vaults", area: "oru", pool: ["clerk", "thug", "ledgercrow", "sluicer", "minerghoul", "saltworm"], note: "Monsters here have +2 defence.", mod: () => { for (const f of battle.foes) f.def += 2; } },
    { name: "The Storm Shaft", area: "spire", pool: ["harpy", "spark", "singer", "wraith", "ledgercrow"], note: "Monsters here are faster: +2 speed.", mod: () => { for (const f of battle.foes) f.spd += 2; } },
    { name: "The Sunken Choir", area: "cathedral", pool: ["priest", "choir", "singer", "angler", "wraith", "sailor"], note: "Monsters here hit a tenth harder.", mod: () => scaleFoes(1, 1.1) },
  ];
  const biomeOf = floor => BIOMES[Math.floor((floor - 1) / 5) % BIOMES.length];
  // the Daily Descent: one run a day whose floors and boon offers are the same for everyone that day
  const seeded = (seed, fn) => {
    const keep = Math.random; let a = Math.floor(seed * 4294967296) >>> 0 || 1;
    Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try { return fn(); } finally { Math.random = keep; }
  };
  const daySeed = (day, floor, salt) => hash(Number(String(day).replace(/-/g, "")) % 1000003, floor * 31 + salt);
  Object.assign(RELICS, {
    stairlamp: { name: "Stair Lantern", from: "_stair10", desc: "Floor 10 of the Deep Stair. +1 SP each turn, +5% critical chance.", spRegen: 1, crit: 0.05 },
    stairheart: { name: "Heart of the Galleries", from: "_stair20", desc: "Floor 20 of the Deep Stair. +2 defence, +2 health each turn.", def: 2, regen: 2 },
    staireye: { name: "Eye of the Deep", from: "_stair30", desc: "Floor 30 of the Deep Stair. +2 speed, +10% critical chance.", spd: 2, crit: 0.1 },
  });
  const deepRun = () => G.flags.deep && G.flags.deep.active ? G.flags.deep : null;
  function deepGroup(floor) {   // on a daily run every roll here, the boss's echo included, comes from the day's seed
    const run = deepRun();
    return run && run.daily ? seeded(daySeed(run.daily, floor, 7), () => rollGroup(floor)) : rollGroup(floor);
  }
  function rollGroup(floor) {
    if (floor % 5 === 0) {   // an echo of a boss, the strongest one the party should be able to face
      const known = HALL.filter(bossKnown), band = known.filter(id => bossLevel(id) <= partyLevel() + floor / 5);
      const pickB = (band.length ? band : known.length ? known : HALL.slice(0, 2)); return { group: [pickB[Math.min(pickB.length - 1, Math.floor(floor / 5) - 1 + Math.floor(Math.random() * 2))] || pickB[0]], boss: true };
    }
    const target = Math.max(10, partyLevel() * 5) + floor * 4, n = floor < 3 ? 2 : floor < 9 ? 3 : 3 + (Math.random() < 0.5 ? 1 : 0);
    const pool = biomeOf(floor).pool.filter(id => MONSTERS[id]), from = pool.length >= 3 ? pool : DEEP_POOL;
    const near = from.map(id => [id, Math.abs(MONSTERS[id].xp - target)]).sort((a, b) => a[1] - b[1]).slice(0, 4).map(x => x[0]);
    return { group: Array.from({ length: n }, () => pick(near)), boss: false };
  }
  function deepStart(daily) {
    G.flags.deep = { active: true, floor: 0, boons: perk(6) ? { keen: 1 } : {}, coins: 0, xp: 0, daily: daily ? today() : null };
    if (daily) { meta.dailyDeep = { day: today(), floor: 0 }; saveMeta(); }
    meta.deepRuns++; saveMeta(); save(); deepNext();
  }
  function deepNext() {
    const run = deepRun(); if (!run) return;
    run.floor++; save();
    const { group, boss } = deepGroup(run.floor), b = run.boons, B = biomeOf(run.floor);
    const begin = () => startBattle(group, { deep: run.floor, area: B.area, boss: boss ? group[0] : undefined });
    if (run.daily) seeded(daySeed(run.daily, run.floor, 19), begin); else begin();   // champions too are the same for everyone on a daily run
    if (!battle) return;
    const extra = Math.max(0, run.floor - 8) * 0.07, [ch, ca] = boss ? catchUp(group[0]) : [1, 1];
    scaleFoes((1 + extra) * ch * Math.pow(0.88, b.keen || 0) * Math.pow(0.7, b.glass || 0), (1 + extra * 0.6) * ca * Math.pow(0.9, b.ward || 0) * Math.pow(1.2, b.glass || 0), Math.floor(run.floor / 6));
    if (B.mod) B.mod();
    if (b.slow) for (const f of battle.foes) f.spd = Math.max(1, f.spd - b.slow);
    if (b.ember) addFury(20 * b.ember);
    if (b.bleed) for (const f of battle.foes) f.st.bleed = { dmg: 3 + Math.floor(run.floor / 3), turns: 3 };
    if (b.crack) for (const f of battle.foes) f.st.brk = 3;
    blog(`${run.daily ? "Today's Descent" : "The Deep Stair"}, floor ${run.floor}: ${B.name}${boss ? ". An echo waits on the landing" : ""}.`);
    if (run.floor % 5 === 1) setTimeout(() => toast(`${B.name}${B.note ? `. ${B.note}` : ""}`), 900);
  }
  function deepEnd(fell) {
    const run = deepRun(); if (!run) return;
    const cleared = fell ? run.floor - 1 : run.floor;
    run.active = false; const best = cleared > meta.deepBest; meta.deepBest = Math.max(meta.deepBest, cleared);
    meta.deepLog = [{ d: today(), f: cleared, daily: !!run.daily }, ...(meta.deepLog || [])].slice(0, 6);
    if (run.daily) { meta.dailyDeep = { day: run.daily, floor: cleared }; meta.dailyBest = Math.max(meta.dailyBest || 0, cleared); }
    saveMeta();
    if (fell) for (const id of G.members) { const h = G.party[id]; h.hp = Math.max(h.hp, Math.ceil(h.maxHp * 0.5)); h.sp = Math.max(h.sp, Math.ceil(h.maxSp * 0.5)); }
    save(); updateHud();
    card("The Deep Stair", fell ? `Carried back up from floor ${run.floor}` : `You climb out from floor ${run.floor}`,
      `${run.daily ? "Today's Descent: " : ""}${cleared} floor${cleared === 1 ? "" : "s"} cleared this run${best ? ", a new best" : ""} (best: ${meta.deepBest}). Spoils kept: ${run.coins} coin and ${run.xp} bonus experience from boons, plus everything the fights paid.${fell ? " Someone always comes down for you." : ""}`);
  }
  function deepBoon() {
    const run = deepRun(); if (!run) return;
    const bonusC = Math.round((10 + run.floor * 6) * (1 + 0.5 * (run.boons.gild || 0))), bonusX = Math.round((6 + run.floor * 5) * 0.4 * (run.boons.scholar || 0));
    G.coins += bonusC; run.coins += bonusC;
    if (bonusX) { run.xp += bonusX; for (const id of G.members) { const h = G.party[id]; h.xp += bonusX; while (h.xp >= xpNeed(h.level)) { h.xp -= xpNeed(h.level); levelUp(h); toast(`${h.name} reaches level ${h.level}`); } } }
    renown(3 * run.floor, run.floor % 5 === 0 ? "an echo on the Stair" : "");
    if (run.floor > meta.deepBest) { meta.deepBest = run.floor; saveMeta(); }
    if (run.daily && meta.dailyDeep && meta.dailyDeep.day === run.daily) { meta.dailyDeep.floor = Math.max(meta.dailyDeep.floor, run.floor); saveMeta(); }
    if (run.boons.mend) for (const id of G.members) { const h = G.party[id]; if (h.hp > 0) h.hp = Math.min(h.maxHp, h.hp + Math.ceil(h.maxHp * 0.2 * run.boons.mend)); }
    if (run.boons.shard) spoils().shards += 2 * run.boons.shard;
    for (const [n, r] of [[10, "stairlamp"], [20, "stairheart"], [30, "staireye"]]) if (run.floor >= n && !(G.relics || []).includes(r)) setTimeout(() => giveRelic(r), 1800);
    save(); updateHud();
    const offer = () => Object.keys(BOONS).filter(k => !BOONS[k].rare || Math.random() < 0.2).sort(() => Math.random() - 0.5).slice(0, perk(15) ? 4 : 3);
    const keys = run.daily ? seeded(daySeed(run.daily, run.floor, 13), offer) : offer();
    const hpNow = G.members.map(id => `${G.party[id].name} ${G.party[id].hp}/${G.party[id].maxHp}`).join(" · ");
    D.__deepBoon = { who: null, text: `Floor ${run.floor} cleared: +${bonusC} coin${bonusX ? `, +${bonusX} experience` : ""}. The stair winds on down. Next: floor ${run.floor + 1}, ${biomeOf(run.floor + 1).name}. Choose a boon for the way (best: floor ${meta.deepBest}). ${hpNow}`,
      choices: [...keys.map(k => ({ t: `${BOONS[k].rare ? "★ " : ""}${BOONS[k].name}: ${BOONS[k].desc}${run.boons[k] ? ` (have ${run.boons[k]})` : ""}`, go: null, act: () => { if (k === "breath") for (const id of G.members) { const h = G.party[id]; if (h.hp > 0) { h.hp = Math.min(h.maxHp, h.hp + Math.ceil(h.maxHp / 2)); h.sp = Math.min(h.maxSp, h.sp + Math.ceil(h.maxSp / 2)); } } else run.boons[k] = (run.boons[k] || 0) + 1; save(); setTimeout(deepNext, 250); } })),
        { t: `Climb out with your spoils (${run.coins} coin so far).`, go: null, act: () => setTimeout(() => deepEnd(false), 150) }] };
    const open = () => { if (!deepRun()) return; if (mode !== "play" || dlg) return setTimeout(open, 400); openDialog("__deepBoon"); };   // after any card or scene that got there first
    open();
  }
  // ---- Hall of Echoes
  const TIERS = [[1.0, 1.0, 0], [1.4, 1.15, 2], [1.9, 1.3, 4]];
  const echoTotal = () => Object.values(meta.echoes).reduce((s, t) => s + t, 0);
  Object.assign(RELICS, {
    echofork: { name: "Echo Fork", from: "_echo3", desc: "Three echoes cleared. +2 SP each turn, +1 speed.", spRegen: 2, spd: 1 },
    echoshard: { name: "Bell-Shard of Echoes", from: "_echo8", desc: "Eight echoes cleared. +3 attack, +3 defence.", atk: 3, def: 3 },
    echocrown: { name: "Crown of Echoes", from: "_echo15", desc: "Fifteen echoes cleared. +3 speed, +10% critical chance, +2 SP each turn.", spd: 3, crit: 0.1, spRegen: 2 },
  });
  function echoStart(id, tier) {
    startBattle([id], { echo: tier, boss: id, area: "hall" });
    if (!battle) return;
    const [h, a, d] = TIERS[tier - 1], [ch, ca] = catchUp(id); scaleFoes(h * ch, a * ca, d);
    blog(`An echo of ${MONSTERS[id].name.split(",")[0]}, tier ${"I".repeat(tier)}.`);
  }
  function echoWon(id, tier) {
    const had = meta.echoes[id] || 0, first = tier > had;
    if (first) meta.echoes[id] = tier;
    const coins = (first ? 40 : 10) * tier * (perk(12) ? 2 : 1); G.coins += coins; saveMeta(); save(); updateHud();
    renown(first ? 30 * tier : 4, first ? `echo tier ${"I".repeat(tier)}` : "");
    const tot = echoTotal();
    for (const [n, r] of [[3, "echofork"], [8, "echoshard"], [15, "echocrown"]]) if (tot >= n && !(G.relics || []).includes(r)) setTimeout(() => giveRelic(r), 2200);
    setTimeout(() => toast(`${first ? "Echo cleared" : "Echo repeated"}: ${MONSTERS[id].name.split(",")[0]} ${"I".repeat(tier)}. +${coins} coin. Echoes: ${tot}.`), 600);
  }
  // ---- the Weekly Trial: the same boss and twist for everyone this week
  const weekNo = () => Math.floor((Date.now() / 86400000 + 3) / 7);   // weeks since a Monday
  const TWISTS = [
    { id: "glass", name: "Glass", desc: "It has 30% less health but hits half again as hard.", apply: () => scaleFoes(0.7, 1.5) },
    { id: "iron", name: "Iron", desc: "It has twice the health.", apply: () => scaleFoes(2, 1) },
    { id: "swarm", name: "Swarm", desc: "Two of its creatures fight beside it.", add: 2 },
    { id: "haste", name: "Haste", desc: "It moves first and fast: +4 speed.", apply: () => { for (const f of battle.foes) f.spd += 4; } },
  ];
  function weeklyPlan() {
    const w = weekNo(), known = HALL.filter(bossKnown); if (!known.length) return null;
    const h = hash(w, 77), h2 = hash(w, 131);
    return { w, boss: known[Math.floor(h * known.length)], twist: TWISTS[Math.floor(h2 * TWISTS.length)] };
  }
  function weeklyStart() {
    const P = weeklyPlan(); if (!P) return;
    const grp = [P.boss]; if (P.twist.add) for (let i = 0; i < P.twist.add; i++) grp.push(pick(DEEP_POOL.slice(0, 10)));
    startBattle(grp, { weekly: P.w, boss: P.boss, area: "spire" });
    if (!battle) return;
    const [ch, ca] = catchUp(P.boss); scaleFoes(TIERS[1][0] * ch, TIERS[1][1] * ca, TIERS[1][2]); if (P.twist.apply) P.twist.apply();
    blog(`Weekly Trial: ${MONSTERS[P.boss].name.split(",")[0]}, ${P.twist.name}. Fewer rounds, better score.`);
  }
  function weeklyWon(rounds) {
    const P = weeklyPlan(); if (!P) return;
    const rec = meta.weekly.w === P.w ? meta.weekly : { w: P.w, best: 0, cleared: false }, better = !rec.best || rounds < rec.best, firstClear = !rec.cleared;
    rec.cleared = true; if (better) rec.best = rounds; meta.weekly = rec; saveMeta();
    if (firstClear) { const item = ITEMS.phoenix ? "phoenix" : "gsalve"; G.coins += 100; G.items[item] = (G.items[item] || 0) + 1; save(); updateHud(); renown(60, "weekly trial"); }
    else if (better) renown(15, "a better weekly score");
    setTimeout(() => toast(`Weekly Trial won in ${rounds} rounds${better ? " (your best this week)" : ` (best: ${rec.best})`}.${firstClear ? " +100 coin and a rare item." : ""}`), 700);
  }
  // ---- how the three challenge kinds finish: none of them touches the story, and none sends you back to a checkpoint
  const _endBattleR = endBattle;
  endBattle = function (result, boss) {
    const o = battle && battle.opts, rounds = battle ? battle.round : 0;
    if (!o || !(o.deep || o.echo || o.weekly)) return _endBattleR(result, boss);
    if (result === "lost") for (const id of G.members) { const h = G.party[id]; h.hp = Math.max(1, Math.ceil(h.maxHp * 0.5)); h.sp = Math.ceil(h.maxSp * 0.5); }
    _endBattleR(result === "lost" ? "fled" : result, null);
    if (o.deep) { if (result === "won") setTimeout(deepBoon, 300); else setTimeout(() => deepEnd(true), 300); }
    else if (o.echo && result === "won") echoWon(o.boss, o.echo);
    else if (o.weekly && result === "won") weeklyWon(rounds);
    else if (result === "lost") toast("The echo fades, and so do you. The party wakes in the Hall, half rested.");
  };
  // ---- the menu: Pause > The Long Road
  const roadBtn = document.createElement("button"); roadBtn.type = "button"; roadBtn.dataset.a = "road"; roadBtn.innerHTML = `The Long Road <small>★</small>`;
  const todayBtn = $("pauseMain").querySelector('[data-a="today"]'); if (todayBtn) todayBtn.after(roadBtn); else $("pauseMain").prepend(roadBtn);
  const roadCss = document.createElement("style");
  roadCss.textContent = `.road h3{margin:14px 0 4px}.road .bar{height:8px;background:#0e0b1e;border:1px solid #5e5680;margin:4px 0 2px}.road .bar i{display:block;height:100%;background:linear-gradient(90deg,#c86a1a,#ffcf4a)}
  .road ul{list-style:none;padding:0;margin:4px 0;display:grid;gap:4px}.road li{font-size:13px}.road li.off{opacity:.55}.road .echoes{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:6px}
  .road .echo{display:flex;align-items:center;gap:6px;justify-content:space-between;border:1px solid #3b2f7a;padding:4px 6px;font-size:12px}.road .echo b{font-weight:600}.road .echo .t{display:flex;gap:3px}
  .road .echo button{min-width:30px;padding:2px 6px}.road .echo button.clr{color:var(--gold)}.road .row2{display:flex;gap:8px;flex-wrap:wrap}.road .row2 .pbtn{flex:1 1 160px}#roadNote{margin:4px auto 0;font-size:12px;color:var(--muted);text-align:center;max-width:92%}`;
  document.head.appendChild(roadCss);
  function roadHtml() {
    const canFight = pausedFrom === "play", need = rankNeed(meta.rank), run = deepRun(), P = weeklyPlan(), wk = P && meta.weekly.w === P.w ? meta.weekly : null;
    const lock = canFight ? "" : "disabled title='Only from the open road, not during a scene or battle'";
    const known = HALL.filter(bossKnown);
    return `<div class="road"><p class="dim" style="font-size:13px;margin:0">Courier Rank <b>${meta.rank}</b> · ${meta.renown}/${need} renown to the next rank. Everything you do earns renown, in every playthrough.</p>
      <div class="bar"><i style="width:${Math.round(meta.renown / need * 100)}%"></i></div>
      <ul>${PERKS.map(([r, n, d]) => `<li class="${perk(r) ? "" : "off"}">${perk(r) ? "✓" : "🔒"} <b>Rank ${r} · ${n}</b>: ${d}</li>`).join("")}</ul>
      <p class="dim" style="font-size:12px;margin:2px 0 0">Visiting streak: ${meta.streak} day${meta.streak === 1 ? "" : "s"} (best ${meta.bestStreak}). Come back tomorrow for a bigger gift.</p>
      <h3>The Deep Stair</h3><p class="dim" style="font-size:12px;margin:0 0 6px">An endless descent under the salt, through ${BIOMES.map(B => B.name.replace(/^The /, "")).join(", ")}, five floors each, then round again, deeper. An echo of a boss every fifth floor, a boon between floors, relics at floors 10, 20 and 30. Your health carries from floor to floor. Best: floor ${meta.deepBest} · runs: ${meta.deepRuns}.${G.stage < 1 ? " Opens after the prologue." : ""}</p>
      <div class="row2">${run ? `<button type="button" class="pbtn" data-road="deepgo" ${lock}>Go down to floor ${run.floor + 1} (${biomeOf(run.floor + 1).name.replace(/^The /, "")})</button><button type="button" class="pbtn" data-road="deepout" ${lock}>Climb out (floor ${run.floor})</button>`
        : `<button type="button" class="pbtn" data-road="deep" ${G.stage < 1 ? "disabled" : lock}>Descend the Deep Stair</button>${meta.dailyDeep && meta.dailyDeep.day === today()
          ? `<button type="button" class="pbtn" disabled>Today's Descent: floor ${meta.dailyDeep.floor}. A new one tomorrow</button>`
          : `<button type="button" class="pbtn" data-road="deepdaily" ${G.stage < 1 ? "disabled" : lock}>Today's Descent (one try a day)</button>`}`}</div>
      ${(meta.deepLog || []).length ? `<p class="dim" style="font-size:12px;margin:6px 0 0">Recent runs: ${meta.deepLog.map(r => `${r.daily ? "★ " : ""}floor ${r.f} (${r.d.slice(5)})`).join(" · ")}${meta.dailyBest ? ` · best Daily Descent: floor ${meta.dailyBest}` : ""}</p>` : ""}
      <h3>Weekly Trial</h3>${P ? `<p class="dim" style="font-size:12px;margin:0 0 6px">This week: <b>${MONSTERS[P.boss].name.split(",")[0]}</b> at tier II, twist <b>${P.twist.name}</b>: ${P.twist.desc} ${wk && wk.cleared ? `Your best: ${wk.best} rounds.` : "First clear: 100 coin, a rare item and 60 renown."} A new trial every Monday.</p>
        <div class="row2"><button type="button" class="pbtn" data-road="weekly" ${lock}>Take the trial</button></div>` : `<p class="dim" style="font-size:12px;margin:0">Beat your first boss to open the Weekly Trial.</p>`}
      <h3>Hall of Echoes</h3><p class="dim" style="font-size:12px;margin:0 0 6px">Fight any boss you have beaten again, at three tiers. Echoes cleared: ${echoTotal()} of ${HALL.length * 3}. Relics at 3, 8 and 15.</p>
      ${known.length ? `<div class="echoes">${known.map(id => `<div class="echo"><b>${MONSTERS[id].name.split(",")[0]}</b><span class="t">${[1, 2, 3].map(t => `<button type="button" class="pbtn${(meta.echoes[id] || 0) >= t ? " clr" : ""}" data-road="echo" data-id="${id}" data-tier="${t}" ${lock} aria-label="Tier ${t}">${"I".repeat(t)}${(meta.echoes[id] || 0) >= t ? "★" : ""}</button>`).join("")}</span></div>`).join("")}</div>` : `<p class="dim" style="font-size:12px;margin:0">No echoes yet. Beat a boss in the story and it waits here.</p>`}
    </div>`;
  }
  $("pauseUI").addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.a === "road") showPanel("The Long Road", roadHtml()); });
  $("pausePanel").addEventListener("click", e => {
    const b = e.target.closest("button[data-road]"); if (!b || b.disabled) return;
    e.stopPropagation();
    const act = b.dataset.road, go = f => { resumeGame(); setTimeout(f, 80); };
    if (act === "deep") go(() => deepStart(false));
    if (act === "deepdaily") go(() => deepStart(true));
    if (act === "deepgo") go(deepNext);
    if (act === "deepout") go(() => deepEnd(false));
    if (act === "weekly") go(weeklyStart);
    if (act === "echo") { const id = b.dataset.id, t = +b.dataset.tier; go(() => echoStart(id, t)); }
  }, true);
  // ---- the title screen shows the road so far
  const roadEl = document.createElement("div"); roadEl.id = "roadNote";
  $("newBtn").insertAdjacentElement("afterend", roadEl);
  function roadNote() {
    const bits = [`Courier Rank ${meta.rank} (${meta.renown}/${rankNeed(meta.rank)})`];
    if (meta.deepBest) bits.push(`Deep Stair best: floor ${meta.deepBest}`);
    if (echoTotal()) bits.push(`Echoes ${echoTotal()}`);
    if (meta.streak) bits.push(meta.visit === today() ? `Visiting streak ${meta.streak}` : `Gift waiting (streak ${meta.visit === dayBefore(today()) ? meta.streak + 1 : 1})`);
    roadEl.textContent = bits.join(" · ");
  }
  roadNote();
  const _extraJournalR = extraJournalHtml;
  extraJournalHtml = function () { return _extraJournalR() + `<h3>The Long Road</h3><ul><li>Courier Rank ${meta.rank}: ${meta.renown}/${rankNeed(meta.rank)} renown. Deep Stair best: floor ${meta.deepBest}. Echoes cleared: ${echoTotal()}. (Pause > The Long Road)</li></ul>`; };
  ACHIEVEMENTS.push(
    ["deep10", "Ten Floors Down", "Clear ten floors of the Deep Stair in one run.", () => meta.deepBest >= 10],
    ["echo3", "It Remembers You", "Clear an echo at tier III.", () => Object.values(meta.echoes).some(t => t >= 3)],
    ["rank10", "A Name on Every Road", "Reach Courier Rank 10.", () => meta.rank >= 10],
    ["weekly", "Seven Days' Work", "Win a Weekly Trial.", () => !!(meta.weekly && meta.weekly.cleared)]);

  // ================================================================== MONSTER STRENGTH: MONSTERS KEEP UP WITH THE PARTY
  // Heroes grow every level and with gear, forge, temper and talents; a monster's numbers were fixed, so from the
  // fourth chapter on fights ended in a round or two. Each kind of monster now grows with the party level expected
  // where it lives (its first chapter on the map; the five Act I kinds are placed by hand), one step per chapter, so the
  // first monsters are unchanged and going back to an early road stays easy. The steps were fitted with the
  // balance simulation below: ordinary fights take about three rounds, bosses six to nine, and a party that never shops
  // can still win. The King is tuned on his own (THE LAST TIDE).
  const STRENGTH = {   // by home chapter 0..12: regular health and attack; each main boss its own; other bosses by chapter
    hp: [1.0, 2.03, 1.2, 1.97, 2.67, 2.72, 4.48, 3.5, 3.32, 2.83, 4.4, 2.94, 2.94],
    atk: [1.0, 1.43, 1.83, 1.77, 2.22, 2.89, 3.55, 3.61, 3.31, 2.04, 1.78, 2.84, 3.62],
    bossHp: [1.0, 1.74, 1.73, 1.75, 2.35, 2.57, 2.45, 3.34, 2.46, 2.53, 2.77, 3.13, 3.41],
    bossAtk: [1.0, 0.96, 0.97, 1.1, 1.31, 1.22, 1.14, 1.81, 1.41, 1.49, 1.6, 1.4, 1.17],
    boss: { butcher: [1.59, 0.92], mother: [1.58, 1.21], choirmaster: [2.5, 1.31], voss: [3.06, 1.2], hollis: [2.12, 0.85], quill: [3.58, 1.81], gulp: [2.02, 1.28], colossus: [2.32, 1.96], maw: [3.02, 1.79], vela: [3.21, 1.45], corvin: [3.12, 1.47],
      wyrm: [1.54, 0.96], tollkeeper: [1.81, 1.08], ledgertree: [1.63, 1.0] },   // optional bosses: already strong by nature, so a gentler step
  };

  const ELITES = new Set(["rotfang", "widow", "pincer"]);   // bounty elites are strong by nature too: a smaller step than their chapter's

  const EXPECT_LV = [2, 4, 5, 7, 8, 10, 12, 14, 15, 17, 19, 21, 22];   // party level a typical player has, chapter by chapter
  const HOME = { jackal: 0, ghoul: 1, leech: 2, spawn: 2, choir: 3 };
  for (const f of FIELD) if (f.minStage) for (const id of f.group) if (HOME[id] === undefined || HOME[id] > f.minStage) HOME[id] = f.minStage;
  const BOSS_HOME = { butcher: 2, mother: 3, wyrm: 4, choirmaster: 4, voss: 5, hollis: 6, moonmother: 6, quill: 7, tollkeeper: 7, gulp: 8, ledgertree: 9, oldmouth: 9, colossus: 10, maw: 10, vela: 11, corvin: 12, king: 12 };
  function strengthOf(id, boss) {
    const S = (typeof SIM !== "undefined" && SIM.strength) || STRENGTH;
    const h = Math.max(0, Math.min(12, (boss ? BOSS_HOME[id] : undefined) ?? HOME[id] ?? (G.stage || 0)));
    if (boss) return (S.boss && S.boss[id]) || [S.bossHp[h], S.bossAtk[h]];
    return ELITES.has(id) ? [1 + (S.hp[h] - 1) * 0.7, 1 + (S.atk[h] - 1) * 0.6] : [S.hp[h], S.atk[h]];
  }
  const strHome = (id, boss) => Math.max(0, Math.min(12, (boss ? BOSS_HOME[id] : undefined) ?? HOME[id] ?? 6));
  const _unitFromMonsterS = unitFromMonster;
  unitFromMonster = function (id, i, n) {
    const u = _unitFromMonsterS(id, i, n);
    if (G.stage === 0 && !(G.ng > 0)) return u;   // the prologue keeps its hand-tuned tutorial numbers
    const [hk, ak] = strengthOf(id, u.boss);
    u.maxHp = u.hp = Math.max(1, Math.round(u.maxHp * hk)); u.atk = Math.max(1, Math.round(u.atk * ak));
    return u;
  };

  // ================================================================== BALANCE SIMULATION (tests only)
  // window.__saltRoad.sim(...) fights battles with no waiting and an automatic player, with a party built the way a
  // typical player would have it at a given chapter (who has joined, level, gear, forge, temper, talents), and
  // reports rounds, wins and health left. Nothing here runs in normal play.
  const SIM_JOIN = { sable: 0, ilse: 1, maru: 3, rook: 4, ada: 5, ren: 6, kest: 7, warden: 9, nell: 10 };
  const SIM_BOSS_STAGE = { butcher: 2, mother: 3, wyrm: 4, choirmaster: 4, voss: 5, hollis: 6, moonmother: 6, quill: 7, tollkeeper: 7, gulp: 8, ledgertree: 9, oldmouth: 9, colossus: 10, maw: 10, vela: 11, corvin: 12, king: 12 };
  let simAuto = false;
  function simAct(u) {
    const h = u.ref, foes = battle.foes.filter(f => !f.dead), allies = battle.heroes.filter(alive), fallen = battle.heroes.filter(x => !alive(x));
    const skills = HEROES[u.id].skills.filter(s => (!s.lvl || h.level >= s.lvl) && h.sp >= s.cost);
    const weakest = foes.slice().sort((a, b) => a.hp - b.hp)[0];
    if (!weakest) return { kind: "guard" };
    if (battle.fury >= 100) return { kind: "chain", unit: weakest };
    if (fallen.length) {
      const s = skills.find(x => x.reviveAll || x.target === "fallen"); if (s) return { kind: "skill", skill: s, unit: s.target === "fallen" ? fallen[0] : u };
      if ((G.items.salts || 0) > 0) return { kind: "item", item: "salts", unit: fallen[0] };
    }
    const low = allies.filter(a => a.ref.hp < a.ref.maxHp * 0.45).sort((a, b) => a.ref.hp / a.ref.maxHp - b.ref.hp / b.ref.maxHp);
    if (low.length) {
      const heal = (low.length >= 2 && skills.find(x => x.healAll && !x.power)) || skills.find(x => x.heal && x.target === "ally") || skills.find(x => x.healAll && !x.power);
      if (heal) return { kind: "skill", skill: heal, unit: heal.target === "ally" ? low[0] : u };
      if (low[0].ref.hp < low[0].ref.maxHp * 0.25 && (G.items.salve || 0) > 0) return { kind: "item", item: "salve", unit: low[0] };
    }
    const dmg = skills.filter(x => x.power && ["enemy", "allEnemies", "random3", "random5"].includes(x.target));
    const healer = HEROES[u.id].skills.some(x => x.heal || x.healAll), reserve = healer ? 4 : 0;   // a healer keeps a little SP back
    const usable = dmg.filter(x => h.sp - x.cost >= reserve);
    if (usable.length) {
      const aoe = usable.filter(x => x.target !== "enemy").sort((a, b) => b.power - a.power), one = usable.filter(x => x.target === "enemy").sort((a, b) => b.power - a.power);
      const s = foes.length >= 2 && aoe.length ? aoe[0] : one[0] || aoe[0];
      return { kind: "skill", skill: s, unit: s.target === "enemy" ? weakest : u };
    }
    return { kind: "attack", unit: weakest };
  }
  const _heroChooseSim = heroChoose;
  heroChoose = function (u) { if (!simAuto || !battle) return _heroChooseSim(u); return Promise.resolve(simAct(u)); };
  // expected party level at a chapter: XP from most of the map's fights (each is fought once) plus the main bosses,
  // for a player who does some but not all of the optional regions
  const simLevelAt = st => EXPECT_LV[Math.max(0, Math.min(12, st))];
  function simParty(st, P) {
    G.stage = st; G.party = {}; G.members = []; G.gear = {}; G.temper = {}; G.talents = {}; G.equip = {}; G.forge = {};
    const L = Math.max(1, (P.level || simLevelAt(st)) + (P.levelDelta || 0));
    for (const id of Object.keys(SIM_JOIN)) if (SIM_JOIN[id] <= st && HEROES[id]) { const h = makeHero(id); for (let i = 1; i < L; i++) levelUp(h); G.party[id] = h; G.members.push(id); }
    G.active = (P.team || ["sable", "ilse", "maru", "rook", "ada", "ren", "kest", "nell", "warden"]).filter(id => G.members.includes(id)).slice(0, 4);
    const ft = P.forge === false ? 0 : Math.min(4, st >= 10 ? 4 : st >= 7 ? 3 : st >= 5 ? 2 : st >= 3 ? 1 : 0);
    G.forge = { atk: ft, def: ft }; for (const id of G.members) for (const k of ["atk", "def"]) applyForge(G.party[id], k, ft);
    if (P.gear !== false) for (const id of G.active) for (const slot of ["weapon", "armor"]) {
      const t = Math.max(1, shopTier() - (P.gearLag || 0)), key = `${slot === "weapon" ? "w" : "a"}_${slot === "weapon" ? WCLASS[id] : ACLASS[id]}_${t}`;
      if (GEAR[key]) { applyGear(G.party[id], key, 1); (G.gear[id] = G.gear[id] || {})[slot] = key; }
    }
    if (P.temper) for (const id of G.active) for (const slot of ["weapon", "armor"]) { const lv = Math.min(shopTier(), P.temper); if (lv > 0) { applyTemper(id, G.party[id], slot, lv); (G.temper[id] = G.temper[id] || {})[slot] = lv; } }
    if (P.talents !== false) G.members.forEach((id, i) => { G.talents[id] = {}; TALENTS.forEach((T, tier) => { if (L >= T.lvl) G.talents[id][tier] = Object.keys(T.opts)[(i + tier) % 2]; }); });
    for (const id of G.members) { const h = G.party[id]; h.hp = h.maxHp; h.sp = h.maxSp; }
    G.items = { salve: 3, tonic: 1, salts: 1, fire: 0 };
    return L;
  }
  const simEnd = () => { battle = null; menuState = null; resolveChoice = null; $("battleUI").hidden = true; mode = "play"; };
  async function simFight(group, opts, st, P) {
    const keep = JSON.stringify(G), dk = difficulty;
    try {
      if (P.difficulty) difficulty = P.difficulty;
      const L = simParty(st, P);
      startBattle(group, { ...opts });
      const B = battle; if (!B) return null;
      const t0 = performance.now();
      while (battle === B && !B.waitingContinue && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 0));
      const heroes = B.heroes, alive2 = heroes.filter(alive);
      const res = { win: B.foes.every(f => f.dead), rounds: B.round, hp: alive2.reduce((a, x) => a + x.ref.hp / x.ref.maxHp, 0) / heroes.length, ko: heroes.length - alive2.length, level: L, champs: B.foes.filter(f => f.champ).length, timeout: !B.waitingContinue };
      simEnd(); return res;
    } catch (e) { simEnd(); return { error: String(e && e.message || e) }; }
    finally { const saved = JSON.parse(keep); for (const k of Object.keys(G)) if (!(k in saved)) delete G[k]; Object.assign(G, saved); difficulty = dk; }
  }
  async function simRun(spec) {   // spec: { fights: [{ group, opts, stage }], n, profile }
    SIM.fast = true; simAuto = true; SIM.noChamp = !!(spec.profile || {}).noChamp; SIM.strength = (spec.profile || {}).strength || null; SIM.kingTide = (spec.profile || {}).kingTide || null; SIM.kingDuel = (spec.profile || {}).kingDuel || null; const out = [];
    try {
      for (const f of spec.fights) {
        const rs = []; for (let i = 0; i < (spec.n || 10); i++) rs.push(await simFight(f.group, f.opts || {}, f.stage, spec.profile || {}));
        const ok = rs.filter(r => r && !r.error), avg = k => ok.length ? ok.reduce((a, r) => a + r[k], 0) / ok.length : null;
        out.push({ label: f.label || f.group.join("+"), stage: f.stage, level: ok[0] && ok[0].level, n: ok.length, win: avg("win"), rounds: avg("rounds"), hp: avg("hp"), ko: avg("ko"), timeouts: ok.filter(r => r.timeout).length, errors: rs.filter(r => r && r.error).map(r => r.error).slice(0, 2) });
      }
    } finally { SIM.fast = false; simAuto = false; SIM.noChamp = false; SIM.strength = null; SIM.kingTide = null; SIM.kingDuel = null; }
    return out;
  }
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), {
    simRun: spec => simRun(spec),
    strHome: (ids, boss) => ids.map(id => strHome(id, boss)),
    strength: () => JSON.parse(JSON.stringify(STRENGTH)),
    simLevels: () => Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => [s, simLevelAt(s)])),
    simData: () => ({ bosses: Object.fromEntries(Object.keys(SIM_BOSS_STAGE).filter(id => MONSTERS[id]).map(id => [id, { stage: SIM_BOSS_STAGE[id], xp: MONSTERS[id].xp, hp: MONSTERS[id].hp, atk: MONSTERS[id].atk, def: MONSTERS[id].def }])),
      field: FIELD.map(f => ({ id: f.id, group: f.group, minStage: f.minStage || 0, elite: !!f.elite, xp: f.group.reduce((a, id) => a + (MONSTERS[id] ? MONSTERS[id].xp : 0), 0), area: f.area || null })) }),
  }), 0);

  // ================================================================== BATTLE EVENTS: ONE PLACE FOR RULES TO HOOK IN
  // Newer battle rules (champion powers, runes, talents) used to each wrap damage() and attackRoll() again, so every
  // rule sat inside every other one and one rule's mistake could break a fight. They now register handlers here:
  //   attack (ctx)     before a blow is rolled: ctx.att, ctx.target, ctx.power (may be changed), ctx.o
  //   hit (ctx, r)     after it: r is attackRoll's result
  //   damage (ctx)     before damage lands: ctx.target, ctx.amount (may be changed); set ctx.cancel to a number to stop it
  //   damaged (ctx, d) after it lands, d is what was dealt
  //   turn (u)         a hero's turn begins;   acted (u, act) a hero's action is over
  //   round (f)        a foe picks its move at the start of a round
  //   won (B)          a battle is won (after the usual rewards)
  // A handler that throws is logged and skipped, and a turn that throws ends that turn only: the fight goes on.
  const htmlEsc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);   // for the later modules' pages
  const BEV = { attack: [], hit: [], damage: [], damaged: [], turn: [], acted: [], round: [], won: [] };
  const onBattle = (ev, fn) => { BEV[ev].push(fn); };
  function battleError(e, where) {
    const msg = `${where}: ${(e && e.message) || e}`, list = window.__saltRoadErrors;
    if (list && !list.includes(msg)) list.push(msg);
    console.error("Salt Road battle rule failed (the fight goes on):", where, e);
  }
  function fireB(ev, ...a) { for (const fn of BEV[ev]) { try { fn(...a); } catch (e) { battleError(e, ev); } } }
  const _attackRollE = attackRoll;
  attackRoll = function (att, target, power, o = {}) {
    if (!battle || !att || !target) return _attackRollE(att, target, power, o);
    const ctx = { att, target, power: power || 1, o };
    fireB("attack", ctx);
    const r = _attackRollE(att, target, ctx.power, o);
    fireB("hit", ctx, r);
    return r;
  };
  const _damageE = damage;
  damage = function (target, amount, o = {}) {
    if (!battle || !target) return _damageE(target, amount, o);
    const ctx = { target, amount, o, cancel: null };
    fireB("damage", ctx);
    if (ctx.cancel !== null) return ctx.cancel;
    const d = _damageE(target, ctx.amount, o);
    fireB("damaged", ctx, d);
    return d;
  };
  const _heroChooseE = heroChoose;
  heroChoose = function (u) { if (battle && u) fireB("turn", u); return _heroChooseE(u); };
  const _chooseIntentE = chooseIntent;
  chooseIntent = function (f) { if (battle && f) fireB("round", f); return _chooseIntentE(f); };
  const _victoryE = victory;
  victory = function () { const B = battle; const r = _victoryE(); if (B && battle === B) fireB("won", B); return r; };
  const _doHeroE = doHero;
  doHero = async function (u, act) {
    try { return await _doHeroE(u, act); }
    catch (e) { battleError(e, `${u && u.name}'s turn`); }
    finally { if (battle && u) fireB("acted", u, act); }
  };
  const _doFoeE = doFoe;
  doFoe = async function (f) {
    try { return await _doFoeE(f); }
    catch (e) { battleError(e, `${f && f.name}'s turn`); }
  };
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), {
    ruleFault: () => { onBattle("hit", () => { throw new Error("test fault in a rule"); }); return BEV.hit.length; },   // for the resilience test
  }), 0);

