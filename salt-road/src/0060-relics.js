  // ================================================================== RELICS
  // Bosses drop relics. Each can be worn by one hero (party screen). Bonuses apply in battle.
  const RELICS = {
    hook: { name: "Butcher's Hook", from: "butcher", desc: "+3 attack. Plain attacks make the target bleed 2 for 2 turns.", atk: 3, bleedHit: true },
    pearl: { name: "Mother's Pearl", from: "mother", desc: "Regenerate 4 health at the start of each turn.", regen: 4 },
    baton: { name: "Choirmaster's Baton", from: "choirmaster", desc: "+2 extra SP each turn, +1 speed.", spRegen: 2, spd: 1 },
    shard: { name: "Voss's Salt Heart", from: "voss", desc: "+3 defence. Immune to stun.", def: 3, noStun: true },
    fang: { name: "Wyrm Fang", from: "wyrm", desc: "+15% critical chance, +2 speed.", crit: 0.15, spd: 2 },
  };
  const relicOf = u => u.side === "hero" && G.equip && G.equip[u.id] ? RELICS[G.equip[u.id]] : null;
  const rstat = (u, k) => { const r = relicOf(u); return r && r[k] ? r[k] : 0; };
  function grantRelic(boss) {
    const id = Object.keys(RELICS).find(k => RELICS[k].from === boss);
    if (!id || (G.relics || []).includes(id)) return;
    G.relics = [...(G.relics || []), id]; save();
    setTimeout(() => toast(`Relic found: ${RELICS[id].name}. Equip it from the party screen (P).`), 900);
  }
  const DIFFS = { story: { hp: 0.75, dmg: 0.7, note: "Story: gentler monsters. For enjoying the tale." }, normal: { hp: 1.45, dmg: 1.4, note: "Normal: hard but fair. Read their moves, break their charges, guard and heal." }, hard: { hp: 1.8, dmg: 1.7, note: "Hard: monsters hit much harder and last longer. Every turn counts." } };
  let difficulty = "normal";
  try { difficulty = localStorage.getItem("salt-road-diff") || "normal"; } catch { /* storage unavailable */ }
  if (!DIFFS[difficulty]) difficulty = "normal";
  const BESTIARY = {
    jackal: "They followed the caravans for scraps. Now they lead them.", ghoul: "A driver who died of thirst, still walking toward water.",
    leech: "Brine leeches swell in the salt pools and wait for anything warm.", spawn: "The Mother's young. They never stop being hungry.",
    choir: "The Choir's youngest, singing a song they no longer understand.", wraith: "What is left when the salt dries a soul out completely.",
    crawler: "Ribcages of drowned oxen, walking sideways on borrowed legs.", drowned: "Hollis's guards, who marched into the moat and came back.",
    butcher: "Voss's hangman at the Well of Nine.", mother: "Something old from the bottom of the grove pond.", choirmaster: "Sold his choir's voices to Voss.",
    voss: "Magister of the Guild. Cut the Bell loose and paid for it with his skin.", wyrm: "Older than the Guild, older than Kessa. It sleeps under the watchtower.",
    hollis: "Guild Master. He bargained with the thing under the gatehouse and lost.",
  };

