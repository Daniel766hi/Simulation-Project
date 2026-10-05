  // ================================================================== DAMAGE TYPES AND WEAKNESSES
  // Who hits what matters: each hero strikes with a type, some skills and items override it, and monster
  // families are weak (x1.5) or resistant (x0.6) to some types. You learn an affinity by hitting with it;
  // what you know shows on the enemy's card and in the journal.
  const HERO_TYPE = { sable: "blade", ilse: "blunt", maru: "storm", rook: "pierce", ada: "light", ren: "pierce", kest: "poison", nell: "blade", warden: "blunt" };
  const SKILL_TYPE = { "Acid Flask": "poison", "Philosopher's Fire": "fire", "Broadside": "fire", "Cannon Salvo": "fire", "Memory Beam": "light", "Lantern Flare": "light", "Last Rites": "light" };
  const ITEM_TYPE = { fire: "fire" };
  const AF = (weak, resist = []) => ({ weak, resist });
  const UNDEAD = AF(["light"], ["poison"]), HOLLOW = AF(["light"], ["blade", "pierce"]), SHELL = AF(["blunt"], ["blade", "pierce"]),
    BRINE = AF(["storm", "fire"], ["blunt"]), BRASS = AF(["storm"], ["blade", "pierce", "poison"]), CRYSTAL = AF(["blunt"], ["blade"]), WOOD = AF(["fire"], []);
  const AFFINITY = {
    jackal: AF(["fire"]), rotfang: AF(["fire"]), houndg: AF([]), mirage: AF(["light"], ["poison"]),
    ghoul: UNDEAD, bogghoul: UNDEAD, minerghoul: UNDEAD, dvillager: UNDEAD, corvin: AF(["blunt"], ["poison"]),
    wraith: HOLLOW, nightwraith: HOLLOW, dunewraith: HOLLOW, choir: HOLLOW, singer: HOLLOW, priest: HOLLOW, moonmother: HOLLOW, angler: AF(["light"]),
    leech: BRINE, spawn: BRINE, toad: BRINE, eel: BRINE, mother: BRINE, gulp: BRINE,
    crawler: SHELL, scorpion: SHELL, crab: SHELL, pincer: SHELL,
    clerk: BRASS, sluicer: BRASS, widow: BRASS, tollkeeper: AF(["storm"], ["blade"]), jonas: BRASS,
    colossus: CRYSTAL, wyrm: CRYSTAL, voss: AF(["blunt"], ["blade"]), saltworm: CRYSTAL,
    drowned: AF(["storm"]), sailor: AF(["storm"]), maw: AF(["storm"], ["poison"]), hollis: AF(["storm"], ["poison"]), quill: AF(["storm"]),
    harpy: AF(["pierce"]), spark: AF(["blunt"], ["storm"]), vela: AF(["pierce"], ["storm"]),
    rootbound: WOOD, ledgertree: AF(["fire"], ["pierce"]), ledgercrow: AF(["pierce", "fire"]),
    butcher: AF(["pierce"]), choirmaster: AF(["light"]), thug: AF([]), king: AF([], ["poison"]), oldmouth: AF(["storm"]),
  };
  const affOf = (id, type) => { const a = AFFINITY[id]; return !a || !type ? 1 : a.weak.includes(type) ? 1.5 : a.resist.includes(type) ? 0.6 : 1; };
  const typeOf = att => {
    if (!att || att.side !== "hero") return null;
    if (battle && battle.forceType) return battle.forceType;   // a technique that strikes with a set type (Powder Keg: fire)
    const a = battle && battle.act;
    if (a && a.u === att && a.skill && SKILL_TYPE[a.skill.name]) return SKILL_TYPE[a.skill.name];
    return HERO_TYPE[att.id] || null;
  };
  function heroType(id) { return HERO_TYPE[id] || "plain"; }
  function skillTypeTag(id, s) { const dmg = s.power || s.dmg || s.execute; return dmg ? `[${SKILL_TYPE[s.name] || heroType(id)}] ` : ""; }
  function learnAffinity(id, type, mult) {
    const known = G.flags.aff || (G.flags.aff = {}), k = known[id] || (known[id] = { weak: [], resist: [] });
    const list = mult > 1 ? k.weak : k.resist;
    if (!list.includes(type)) { list.push(type); if (!G.flags.affTip) { G.flags.affTip = true; setTimeout(() => toast("Tip: some enemies are WEAK to a kind of hit (blade, blunt, pierce, storm, light, poison, fire) and take 50% more; others resist. What you learn shows on their card."), 900); } }
  }
  const _doHeroA = doHero;
  doHero = async function (u, act) {
    if (battle) battle.act = { u, skill: act && act.skill, item: act && act.kind === "item" ? act.item : null };
    try { return await _doHeroA(u, act); } finally { if (battle) battle.act = null; }
  };
  const _attackRollA = attackRoll;
  attackRoll = function (att, target, power, o) {
    if (battle) battle.curAtt = att;
    try { return _attackRollA(att, target, power, o); } finally { if (battle) battle.curAtt = null; }
  };
  const _damageA = damage;
  damage = function (target, amount, o = {}) {
    if (!battle || target.side !== "foe") return _damageA(target, amount, o);
    const a = battle.act, type = battle.curAtt ? typeOf(battle.curAtt) : a && a.item ? ITEM_TYPE[a.item] : null;
    const m = affOf(target.id, type);
    if (m === 1) return _damageA(target, amount, o);
    learnAffinity(target.id, type, m);
    const dealt = _damageA(target, Math.max(1, Math.round(amount * m)), o);
    popupText(target, m > 1 ? `WEAK: ${type}` : `resists ${type}`, m > 1 ? "#ffcf4a" : "#9a94b8");
    return dealt;
  };
  const knownAff = id => { const k = (G.flags.aff || {})[id]; if (!k) return ""; const parts = []; if (k.weak.length) parts.push(`weak ${k.weak.join("/")}`); if (k.resist.length) parts.push(`resists ${k.resist.join("/")}`); return parts.join(" · "); };
  function affShort(id) { const k = (G.flags.aff || {})[id]; return k ? [...k.weak.map(t => "+" + t), ...k.resist.map(t => "-" + t)].join(" ") : ""; }
  const _extraJournalA2 = extraJournalHtml;
  extraJournalHtml = function () {
    const rows = Object.keys(G.flags.aff || {}).filter(id => MONSTERS[id] && knownAff(id)).map(id => `<li><b>${MONSTERS[id].name.split(",")[0]}</b>: ${knownAff(id)}</li>`);
    return _extraJournalA2() + (rows.length ? `<h3>Weaknesses learned</h3><ul>${rows.join("")}</ul>` : "");
  };
  ACHIEVEMENTS.push(["weak20", "Know Your Enemy", "Learn twenty weaknesses or resistances.", () => Object.values(G.flags.aff || {}).reduce((s, k) => s + k.weak.length + k.resist.length, 0) >= 20]);

