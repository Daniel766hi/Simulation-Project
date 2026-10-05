  // ================================================================== ACT II · THE RAINS
  // Chapters VII-XII. Everything here plugs into the engine through the *Act2 / *2 hooks.
  const palCtx = (g, pal) => new Proxy(g, {
    get(t, k) { const v = t[k]; return typeof v === "function" ? v.bind(t) : v; },
    set(t, k, v) { t[k] = (k === "fillStyle" || k === "strokeStyle") && typeof v === "string" && pal[v] ? pal[v] : v; return true; },
  });
  Object.assign(EXTRA_STYLES, {
    flask: { hair: "goggles", apron: "#5a3a22", eye: "#6a8a3a" },
    cutlass: { hair: "tricorn", coat: true, eye: "#8a5a2a" },
    crystal: { hair: "crystal", armor: false, eye: "#3ee0e8" },
  });
  Object.assign(HEROES, {
    kest: { name: "Kest", role: "Alchemist of Oru", hp: 34, sp: 20, atk: 9, def: 3, spd: 7,
      look: { robe: "#4a6a3a", hair: "#c8a050", skin: "#f0c8a0", extra: "flask" },
      bio: "She built the Iron Clerks to be tireless and incorruptible, and forgot to make them kind. Now she builds cures, and counts the dead she owes.",
      skills: [
        { name: "Acid Flask", cost: 3, target: "enemy", power: 0.9, bleed: [4, 3], brk: 1, desc: "Acid that eats armour. 4 burn a turn for 3 turns." },
        { name: "Elixir", cost: 4, target: "ally", heal: 20, cure: true, strongOne: 2, desc: "Heal an ally 20, cure bleeding and make them strong for 2 turns." },
        { name: "Smoke Bomb", cost: 4, target: "party", veilAll: true, desc: "Thick smoke. Every ally dodges the next attack aimed at them." },
        { name: "Philosopher's Fire", cost: 8, lvl: 12, target: "allEnemies", power: 1.3, bleedAll: [5, 3], desc: "Ultimate. Liquid fire over every enemy: heavy damage and 5 burn for 3 turns." },
      ] },
    nell: { name: "Nell", role: "Smuggler captain", hp: 40, sp: 12, atk: 13, def: 3, spd: 11,
      look: { robe: "#7a2a2a", hair: "#2b1a12", skin: "#c98d63", extra: "cutlass" },
      bio: "Raised on the deck of the Gull by Captain Maw, the kindest liar on the coast. She has never paid a toll in her life, and she has buried everyone who taught her how.",
      skills: [
        { name: "Twin Cutlass", cost: 3, target: "enemy", power: 0.75, hits: 2, desc: "Two quick slashes at one enemy." },
        { name: "Plunder", cost: 3, target: "enemy", power: 0.8, plunder: true, desc: "A cheap shot that steals coin, and sometimes an item." },
        { name: "Broadside", cost: 5, target: "allEnemies", power: 0.95, desc: "Pistols and grapeshot across the whole enemy line." },
        { name: "Cannon Salvo", cost: 7, lvl: 12, target: "random5", power: 0.8, desc: "Ultimate. Five cannonballs at random enemies." },
      ] },
    warden: { name: "The Warden", role: "Keeper of the Cathedral", hp: 76, sp: 10, atk: 10, def: 9, spd: 3,
      look: { robe: "#5e5680", hair: "#9ef0f5", skin: "#aba4c8", extra: "crystal", glowEyes: true },
      bio: "Made from the first rain's salt to remember every storm. Voss shattered its memory; you gave it back. It is still learning whether the thing that remembers is the same thing that forgot.",
      skills: [
        { name: "Crystal Aegis", cost: 3, target: "ally", aegis: true, heal: 10, desc: "Encase an ally in crystal: they take half damage until the Warden's next turn, and heal 10." },
        { name: "Memory Beam", cost: 4, target: "enemy", power: 1.4, weakOne: 2, desc: "A beam of remembered sunlight. The target is weakened for 2 turns." },
        { name: "Tidal Oath", cost: 5, target: "party", oath: true, desc: "Heal the party 10 and draw every attack to the Warden for 2 turns." },
        { name: "Remember", cost: 8, lvl: 12, target: "party", remember: true, desc: "Ultimate. Clears every ailment from the party, heals 24 and restores 4 SP to all." },
      ] },
  });
  Object.assign(ITEMS, {
    gsalve: { name: "Greater Salve", desc: "Heal an ally by 45.", target: "ally", heal: 45, price: 14 },
    ether: { name: "Storm Ether", desc: "Restore 12 SP to an ally.", target: "ally", sp: 12, price: 12 },
    phoenix: { name: "Phoenix Salt", desc: "Revive a fallen ally at full health.", target: "fallen", revive: 1, price: 32 },
  });
  for (const k of ["atk", "def"]) FORGE[k].cost.push(...(k === "atk" ? [190, 260] : [170, 240]));

  // ---- monsters of the rains
  Object.assign(MONSTERS, {
    clerk: { name: "Iron Clerk", hp: 58, atk: 13, def: 9, spd: 4, xp: 34, coin: [6, 10], sprite: "clerk",
      moves: [{ name: "Stamp", w: 3, power: 1.2, stunChance: 0.2 }, { name: "Audit", w: 1, weakAll: 2 }, { name: "Reinforce", w: 1, guard: true, heal: 8 }] },
    thug: { name: "Guild Enforcer", hp: 46, atk: 14, def: 4, spd: 9, xp: 32, coin: [8, 14], sprite: "drowned",
      pal: { "#4a6a7a": "#5a3a2a", "#5a7a8a": "#7a4a3a", "#8ab0b8": "#d9a070", "#2a5a3a": "#3a2a1e", "#857ea5": "#6b3f24", "#b8bccc": "#b8bccc", "#3a8fbf": "#8a1020", "#9ef0f5": "#ff2d2d" },
      moves: [{ name: "Cudgel", w: 3, power: 1.2 }, { name: "Dirty Blade", w: 2, power: 0.9, bleed: [3, 3] }] },
    quill: { name: "Treasurer Quill, Keeper of Ledgers", hp: 380, atk: 15, def: 6, spd: 8, xp: 260, coin: [90, 90], sprite: "quill", boss: true, music: "boss", tall: true,
      moves: [{ name: "Red Ink", w: 3, power: 1.3, bleed: [4, 3] }, { name: "Foreclose", w: 2, power: 0.8, all: true, weakAll: 2 },
              { name: "Compound Interest", w: 0, charge: true, power: 1.6, all: true }, { name: "Call the Auditors", w: 0, summonKind: "clerk", summonText: "Quill rings a little brass bell. Iron Clerks march out of the vault, human hands twitching on their brass arms." }] },
    bogghoul: { name: "Bog Ghoul", hp: 54, atk: 15, def: 4, spd: 6, xp: 36, coin: [5, 9], sprite: "ghoul",
      pal: { "#e8e2f0": "#7a8a5a", "#d8d0e6": "#6a7a4a", "#a3242e": "#3a2a14", "#f2ead8": "#c8c09a", "#5a0f18": "#2a0a0a" },
      moves: [{ name: "Belly Mouth", w: 3, power: 1.2, bleed: [3, 3] }, { name: "Drag Under", w: 2, power: 1.0, stunChance: 0.2 }] },
    toad: { name: "Mire Toad", hp: 60, atk: 14, def: 5, spd: 5, xp: 38, coin: [4, 8], sprite: "toad",
      moves: [{ name: "Tongue Lash", w: 3, power: 1.2, drain: 0.4 }, { name: "Bog Belch", w: 1, power: 0.6, all: true, weakAll: 2 }] },
    dvillager: { name: "Drowned Villager", hp: 50, atk: 15, def: 4, spd: 6, xp: 36, coin: [3, 7], sprite: "drowned",
      pal: { "#4a6a7a": "#5a4a3a", "#5a7a8a": "#6a5a4a", "#8ab0b8": "#a8b0a0", "#857ea5": "#6b3f24", "#b8bccc": "#8a6438" },
      moves: [{ name: "Grasp", w: 3, power: 1.1, stunChance: 0.15 }, { name: "Waterlogged Wail", w: 1, weakAll: 2 }] },
    gulp: { name: "Old Gulp, the Bog King", hp: 540, atk: 17, def: 7, spd: 4, xp: 320, coin: [100, 100], sprite: "gulp", boss: true, music: "boss", tall: true,
      moves: [{ name: "Swallow", w: 2, power: 1.7, drain: 0.5 }, { name: "Belly Flop", w: 2, power: 1.0, all: true, stunChance: 0.25 },
              { name: "Spit Bile", w: 2, power: 0.8, bleed: [5, 3] }, { name: "Croak of the Drowned", w: 0, summonKind: "dvillager", summonText: "Gulp croaks. The swallowed dead crawl back out of its mouth, still wearing their Sunday clothes." }] },
  });
  Object.assign(RELICS, {
    ledger: { name: "Quill's Ledger", from: "quill", desc: "+15% coin from battles, +2 attack.", atk: 2, coinBonus: 0.15 },
    croak: { name: "Gulp's Stone Heart", from: "gulp", desc: "Regenerate 6 health each turn, +2 defence.", regen: 6, def: 2 },
  });
  Object.assign(BESTIARY, {
    clerk: "Kest's masterpiece. Brass, ledgers and, where the brass ran out, the hands of debtors.",
    thug: "Paid by the week, cruel by the hour.", quill: "Hollis's treasurer. He believed a debt outlives the debtor.",
    bogghoul: "Drowned in the marsh, they grew a second mouth where the water got in.", toad: "They eat what the flood brings. The flood brings everything.",
    dvillager: "Reedholm's dead, walking toward the Bog Heart because something there is calling.", gulp: "It swallowed Reedholm's bell a century ago. Now the drowned answer its croak.",
  });

  // ---- people of the rains
  const npc2 = (o) => NPCS.push({ ...o, px: o.x * TILE + 8, py: o.y * TILE + 8, bob: hash(o.x, o.y) * 6 });
  const act = () => G.stage >= 7;
  npc2({ id: "ines", name: "Mayor Ines", x: 92, y: 15, look: { robe: "#3a5aa8", hair: "#5a3a2a", skin: "#c98d63", style: { hair: "bun", dress: true, eye: "#4a3020" } }, show: act });
  npc2({ id: "kest", name: "Kest", x: 84, y: 23, look: HEROES.kest.look, show: () => act() && !G.members.includes("kest") && !(G.flags.fallen || []).includes("kest") });
  npc2({ id: "bram", name: "Bram the Innkeeper", x: 99, y: 14, look: { robe: "#8a5533", hair: "#d8d0c0", skin: "#e0a878", style: { hair: "bald", beard: true, apron: "#e8e2d0" } }, show: act });
  npc2({ id: "yusra", name: "Yusra the Trader", x: 87, y: 19, look: { robe: "#8a2a6a", hair: "#1b1633", skin: "#a8744f", style: { hair: "long", dress: true, eye: "#3a2a1a" } }, show: act });
  npc2({ id: "dov", name: "Dov the Smith", x: 78, y: 23, look: { robe: "#5a4a3a", hair: "#2b2350", skin: "#8a5a33", style: { hair: "fringe", sleeveless: true, apron: "#3a2a1e" } }, show: act });
  npc2({ id: "gguard", name: "Guild Guard", x: 83, y: 12, look: { robe: "#c9a227", hair: "#3a2a1e", skin: "#e0a878", style: { hair: "helm", armor: true } }, show: () => act() && !G.flags.guildOpen });
  npc2({ id: "sela", name: "Sela", x: 94, y: 24, look: { robe: "#a8703f", hair: "#3a2a1e", skin: "#f2c39a", style: { hair: "tail", dress: true } }, show: act });
  npc2({ id: "pip", name: "Pip", x: 80, y: 29, look: { robe: "#d8d4e8", hair: "#c8a050", skin: "#f0c8a0", small: true, style: { hair: "fringe" } }, show: act });
  npc2({ id: "tobin", name: "Tobin the Clerk", x: 79, y: 5, look: { robe: "#5a5a6a", hair: "#8a8a8a", skin: "#d9b090", style: { hair: "bald", beard: false } }, show: () => G.flags.quillDead });
  npc2({ id: "nadia2", name: "Elder Nadia", x: 91, y: 18, look: { robe: "#6a58c0", hair: "#e8e4f0", skin: "#c98d63", extra: "staff" }, show: () => G.flags.quillDead && G.members.includes("kest") && G.stage <= 8 });
  npc2({ id: "oskar", name: "Elder Oskar", x: 37, y: 66, look: { robe: "#4a5a3a", hair: "#bfb8a8", skin: "#c98d63", style: { hair: "bald", beard: true } }, show: () => G.stage >= 8 });
  const LOST = [
    { id: "lost1", name: "Hanne", x: 8, y: 60, look: { robe: "#8a6a4a", hair: "#c8a050", skin: "#f0c8a0", style: { hair: "tail", dress: true } } },
    { id: "lost2", name: "Old Fenn", x: 52, y: 60, look: { robe: "#5a5a4a", hair: "#e8e4f0", skin: "#b8845a", style: { hair: "bald", beard: true } } },
    { id: "lost3", name: "Mira and Moss", x: 56, y: 84, look: { robe: "#3f8a5a", hair: "#3a2a1e", skin: "#e0a878", small: true, style: { hair: "fringe" } } },
    { id: "lost4", name: "Brother Jory", x: 24, y: 86, look: { robe: "#8a6a3a", hair: "#3a2a1e", skin: "#d9a070", style: { hair: "hood", hood: "#6a4a2a" } } },
    { id: "lost5", name: "Liv", x: 40, y: 80, look: { robe: "#a8403a", hair: "#d24a2a", skin: "#f2c39a", style: { hair: "tail" } } },
  ];
  LOST.forEach((l, i) => {
    npc2({ ...l, show: () => G.stage >= 8 && !(G.flags.rescued || []).includes(i) });
    npc2({ ...l, id: "saved" + i, x: [31, 43, 34, 41, 38][i], y: [67, 67, 71, 71, 69][i], show: () => (G.flags.rescued || []).includes(i) });
  });
  npc2({ id: "warden2", name: "The Warden", x: 16, y: 79, look: HEROES.warden.look, show: () => G.flags.gulpDead && !G.members.includes("warden") });
  SPEAKERS.warden2 = "The Warden";

  // ---- party deaths: the fallen leave for good, and the journal remembers them
  const EPITAPHS = {};
  function killMember(id, epitaph) {
    if (!G.members.includes(id)) return;
    G.members = G.members.filter(x => x !== id); G.active = G.active.filter(x => x !== id);
    if (!G.active.length) G.active = G.members.slice(0, 4);
    if (G.equip && G.equip[id]) delete G.equip[id];
    G.flags.fallen = [...(G.flags.fallen || []), id]; G.flags.epitaphs = { ...(G.flags.epitaphs || {}), [id]: epitaph };
    save(); updateHud();
  }

  // ---- dialogue
  Object.assign(D, {
    // the turn of the acts
    act2_1: say(null, "You lift the Rain Bell and ring it once. The note rolls out across the Flats, and with a groan of old iron the great gates of Oru swing open. The people of Kessa start walking toward the high ground.", "act2_2"),
    act2_2: say(null, "Then the ground answers. Far to the south, under the dry sea, something rings back: one deep, drowned note, like a bell struck at the bottom of a well. Every puddle on the salt shivers.", "act2_3"),
    act2_3: say("warden", "(A voice in your head, cold as well water.) Courier. You rang it once. It must be rung three times, or it wakes what the first rain put to sleep. Go into Oru. I will find you.", null, () => {
      advance(7); save();
      card("Act II", "The Rains", "The gates are open and the rain has come, forty years late and tasting of salt. Kessa's people crowd into Oru. And beneath the old sea, something that was a king has opened its eyes.");
      card("Chapter VII", "The Open Gate", "Oru was built for five thousand people. Twelve thousand are sheltering in its streets tonight. The granaries are full, and they are locked.");
    }),
    // ---- Chapter VII
    ines_0: say("ines", "Courier. You're the one who carried the Bell. Look around you: Kessa's people are sleeping in my streets, in the rain, and my granaries are full enough to feed them for a year.", "ines_1"),
    ines_1: say("ines", "Treasurer Quill has sealed the grain inside the Guild Hall. He says it belongs to the Guild until somebody pays Hollis's debts. Hollis is dead. His debts, apparently, are not.", "ines_2"),
    ines_2: { who: "ines", text: "The magistrates won't let me break the Guild's doors without proof that the accounts are forged.", choices: [
      { t: "\"Then we find the proof.\"", go: "ines_3" },
      { t: "\"People are starving and you want paperwork?\"", go: "ines_law" },
    ] },
    ines_law: say("ines", "I want a city that is still a city tomorrow. If I break the law to feed them tonight, Quill breaks it next week to starve them. We do this properly, or we become him.", "ines_3"),
    ines_3: say("ines", "A clerk named Tobin tore three pages from Quill's master ledger before the Iron Clerks took him away. He hid them somewhere in the city. Find them, bring them to me, and I'll sign a writ.", null, () => { G.flags.ledgerQuest = true; toast("New task: find Tobin's three ledger pages"); save(); updateHud(); }),
    ines_wait: say("ines", "Tobin loved hiding places: the north-east rooftops, the south-west alley, the old cistern by the south wall. The clerks patrol all three."),
    ines_give: say("ines", "(Ines reads each page twice. Her hands shake.) False grain weights. Debts invented from nothing. Bribes to the magistrates... and to a Captain Ren, for keeping the gate shut this season.", "ines_give2"),
    ines_give2: say("ren", "(Ren doesn't look away.) It's true. I took his money. I'll stand in front of the magistrates when this is over. Sign your writ, Mayor. Let's open those doors first.", "ines_give3"),
    ines_give3: say("ines", "...Here. My writ. Show it to the guard at the Guild Hall. And Captain: I'll hold you to that.", null, () => { G.flags.writ = true; G.flags.renConfessed = true; toast("You have the Mayor's writ"); save(); updateHud(); }),
    ines_after: say("ines", "The granaries are open. Twelve thousand people are eating tonight. I won't forget who opened them."),
    gguard_0: say("gguard", "Guild property. No entry without a writ from the Mayor. Those are the rules, and the rules are all that's left."),
    gguard_writ: say("gguard", "(He reads the writ, and his shoulders drop as if he's been waiting for permission to stop.) Quill's in the counting room. The clerks won't stop for writs. Don't die on the carpet, it's new.", null, () => { G.flags.guildOpen = true; applyWorldState(); toast("The Guild Hall doors unlock"); save(); updateHud(); }),
    kest_0: say("kest", "(A woman in a scorched apron squints at you through thick goggles.) If you're here to arrest me, get in line. I built the Iron Clerks. Quill paid me to make them tireless, obedient and incorruptible.", "kest_1"),
    kest_1: say("kest", "I forgot to make them kind. When Quill ran out of brass, he started using the hands of people who couldn't pay. I didn't ask where the hands came from. I asked if they were the right size.", "kest_2"),
    kest_2: say("kest", "If you're going after Quill, aim for the brass plate on their chests. It's where I wrote the ledger that tells them what to want."),
    kest_join: say("kest", "(Kest sits among the pieces of a clerk, holding one of its stitched human hands.) I made these. Every one. And a man is dead because he was owed to a machine I built.", "kest_join2"),
    kest_join2: { who: "kest", text: "I can't unmake them. But I can make other things. Let me come with you, and let me be useful for once instead of clever.", choices: [
      { t: "\"We could use someone clever.\"", go: "kest_join3" },
      { t: "\"Being sorry doesn't bring anyone back.\"", go: "kest_sorry" },
    ] },
    kest_sorry: say("kest", "No. It doesn't. Nothing does. That's why it's a debt you can't pay, only carry. Let me carry it somewhere useful.", "kest_join3"),
    kest_join3: say("kest", "I've packed acids, elixirs and something that smells like a burning library. Try not to stand downwind.", null, () => joinParty("kest")),
    bram_0: { who: "bram", text: "Rooms are free for anyone from Kessa, by order of nobody. I just decided. Rest a while?", choices: [
      { t: "Rest at the inn.", go: null, act: () => restParty() },
      { t: "\"Any news?\"", go: "bram_news" },
      { t: "Leave.", go: null },
    ] },
    bram_news: say("bram", "News? The rain tastes of the sea. Fish are swimming up the gutters. And every night at midnight, the puddles ring like bells. My grandmother would call that an omen. My grandmother drowned in a teacup, so I don't listen to her."),
    yusra_0: { who: "yusra", text: "Prices are fair, because I'm the only trader still open. What do you need?", choices: [
      { t: "Greater Salve (heal 45): 14 coin", go: "yusra_0", act: () => buy("gsalve"), req: () => G.coins >= 14, reqText: "14 coin" },
      { t: "Storm Ether (+12 SP): 12 coin", go: "yusra_0", act: () => buy("ether"), req: () => G.coins >= 12, reqText: "12 coin" },
      { t: "Phoenix Salt (revive at full): 32 coin", go: "yusra_0", act: () => buy("phoenix"), req: () => G.coins >= 32, reqText: "32 coin" },
      { t: "Salve (heal 22): 6 coin", go: "yusra_0", act: () => buy("salve"), req: () => G.coins >= 6, reqText: "6 coin" },
      { t: "Oil Bomb (14 to every enemy): 12 coin", go: "yusra_0", act: () => buy("fire"), req: () => G.coins >= 12, reqText: "12 coin" },
      { t: "Leave", go: null },
    ] },
    dov_0: { who: "dov", text: "Ilse's gear? I've read her letters for years. She's the better smith. I'm the one with the bigger forge. Let's see what we can do together.", choices: [
      { t: () => forgeLabel("atk"), go: "dov_0", act: () => forge("atk"), req: () => forgeOk("atk"), reqText: () => forgeReq("atk") },
      { t: () => forgeLabel("def"), go: "dov_0", act: () => forge("def"), req: () => forgeOk("def"), reqText: () => forgeReq("def") },
      { t: "Leave", go: null },
    ] },
    sela_0: say("sela", "We walked through the gate with everything we own on our backs. It started raining the moment we got inside. The old ones say it's the first rain in forty years that tastes of blood as well as salt."),
    pip_0: say("pip", "The Choir kids sleep under the fountain now. Is Sister Ada with you? Tell her Pip still knows all the words. Even the ones for waking up."),
    pip_ada: say("ada", "(Ada kneels in the rain and holds the boy for a long time.) Pip. You grew. ...Keep singing the waking words, little one. The living need them more than the dead."),
    quill_scene: say("quill", "(A thin man in a gold-trimmed coat dips an enormous quill into a pot that is not ink.) The courier. And the smith. Ilse, isn't it? You still owe the Guild for the chains you refused to forge. Hands, as I recall.", "quill_scene2"),
    quill_scene2: say("ilse", "(Ilse's voice is very quiet.) It was you. Voss gave the order. You sent the clerks. You watched.", "quill_scene3"),
    quill_scene3: { who: "quill", text: "Someone has to watch. Someone has to write it down. A debt that isn't written down is just a feeling. Now: your lives should about cover the interest.", choices: [
      { t: "Attack.", go: null, act: () => startBattle(["quill", "clerk"], { boss: "quill", area: "hall" }) },
    ] },
    quill_after: say("quill", "(Quill is on his knees, ink and blood mixing on the new carpet.) The ledger... must balance... Somebody always pays, smith. Somebody always pays.", "quill_choice"),
    quill_choice: { who: "ilse", text: "(Ilse lifts her hammer. Her scarred hands are perfectly steady.) Four months I couldn't hold a spoon. Tell me why I shouldn't.", choices: [
      { t: "\"Do it. He's earned it.\"", go: "quill_kill" },
      { t: "\"Let the city judge him. Don't become his ledger.\"", go: "quill_spare" },
    ] },
    quill_kill: say("ilse", "(The hammer comes down once. Then Ilse stands there, breathing, for a long time.) ...I thought it would feel like something. It feels like hitting an anvil. That's all. That's all it ever was.", null, () => { G.flags.quillFate = "killed"; afterQuill(); }),
    quill_spare: say("ilse", "(The hammer stops a finger's width from his face.) No. You don't get to be the last thing I ever forge. Mayor Ines can have you. I have work to do.", null, () => { G.flags.quillFate = "spared"; afterQuill(); }),
    tobin_0: say("tobin", "(A starved clerk blinks at the lamplight.) They kept me in the vault with the grain. Forty days of looking at food. ...My pages worked? Oh. Oh, good. Take this: I was saving it for a better world. This will have to do.", null, () => { if (!G.flags.tobinThanked) { G.flags.tobinThanked = true; G.coins += 60; G.items.phoenix = (G.items.phoenix || 0) + 1; toast("Tobin gives you 60 coin and a Phoenix Salt"); save(); updateHud(); } }),
    tobin_after: say("tobin", "I'm going to eat a whole loaf of bread and then write a very long letter to the magistrates."),
    nadia2_0: say("nadia2", "Sable! Thank the salt. A boy from Reedholm came up the flood on a raft made of doors. The marsh villages south of Kessa are drowning, and the drowned are walking out of the water.", "nadia2_1"),
    nadia2_1: say("nadia2", "Elder Oskar's people are trapped on their stilt-village. Five went out to cut reeds and never came back. The road south of Kessa is under water, but it's passable if you don't mind the cold, or the things in it.", null, () => {
      advance(8);
      card("Chapter VIII", "The Drowning Marsh", "South of Kessa the land is going back to the sea. Reedholm stands on stilts above the rising water, and something at the Bog Heart is croaking in a hundred drowned voices.");
    }),
    nadia2_wait: say("nadia2", "Take the flooded road south of Kessa, courier. Reedholm is waiting."),
    // ---- Chapter VIII
    oskar_0: say("oskar", "Courier! You came through the flood? Then you're either brave or stupid, and I don't care which. Five of our people went out to cut reeds when the water rose. The drowned came up around them.", "oskar_1"),
    oskar_1: say("oskar", "Hanne, Old Fenn, the twins, Brother Jory. And my Liv. Please. Bring them home. Or bring me something to bury.", null, () => { G.flags.rescueQuest = true; toast("New task: find Reedholm's five missing villagers"); save(); updateHud(); }),
    oskar_rest: { who: "oskar", text: "Rest by our fire. It's the last dry thing in the marsh.", choices: [{ t: "Rest.", go: null, act: () => restParty() }, { t: "Not now.", go: null }] },
    lost1_0: say("lost1", "(Hanne is clinging to a dead tree, lips blue.) You're real? I've been talking to a heron for two days. I can walk. Point me toward the boardwalk and don't let go of my hand.", null, () => rescue(0)),
    lost2_0: say("lost2", "(Old Fenn sits on a grass tussock, reeds in his arms.) My knees are older than the Guild. I wasn't leaving without the reeds; we need them for the roofs. Carry nothing. I'll carry myself.", null, () => rescue(1)),
    lost3_0: say("lost3", "(Two children climb out of a hollow log.) We hid when the big thing went past. It smelled like the bottom of a well. It had faces in its skin, and one of them was Grandpa's.", null, () => rescue(2)),
    lost4_0: say("lost4", "(Brother Jory kneels in the mud, praying.) The drowned stopped to listen to my prayers, courier. They stood around me for a whole night. Then they remembered they were hungry. I don't know which part to thank the gods for.", null, () => rescue(3)),
    lost5_0: say("lost5", "(Liv is sharpening a reed spear.) Dad sent you? Of course he did. The toads out here are bigger than cows, and the biggest one sings. It sang my mother's voice at me last night. I nearly walked into the water.", null, () => rescue(4)),
    oskar_done: say("oskar", "All five, home. Liv... (He can't finish.) Courier, Liv says the drowned are walking west, to the Bog Heart. Old Gulp lives there. It swallowed our first bell a hundred years ago, and now when it croaks, the dead answer.", null, () => { G.flags.gulpQuest = true; save(); updateHud(); }),
    oskar_wait: say("oskar", "The Bog Heart is west of the village. Follow the boardwalk. Don't listen to it when it sings."),
    oskar_after: say("oskar", "The water's still rising, but the dead have stopped walking. We'll build higher. That's what Reedholm does."),
    gulp_scene: say(null, "At the Bog Heart the mud heaves. A toad the size of a house rises out of the black water. Its skin is stretched thin over the things inside it, and through the skin you can see faces. Some of them are still moving their lips.", "gulp_scene2"),
    gulp_scene2: { who: "rook", text: "(Rook nocks an arrow.) Its heart's behind the throat sac. I can make that shot. Keep it looking at you.", choices: [
      { t: "Fight Old Gulp.", go: null, act: () => startBattle(["gulp", "toad"], { boss: "gulp", area: "marsh" }) },
    ] },
    gulp_after: say(null, "Old Gulp shudders and goes still. Then its belly splits open from the inside, and Rook falls out with the swallowed dead, bow snapped, skin blistered white by the acid. It swallowed him in the first minute. He kept shooting from inside.", "gulp_after2"),
    gulp_after2: say("rook", "(Rook laughs, and it turns into coughing blood.) Told you I could make the shot. Didn't say... from which side. Ilse. I held the torch, that night on the Flats. I never said sorry properly.", "gulp_after3"),
    gulp_after3: { who: "rook", text: "(His hand finds yours. It is already cold.) Tell me it was enough. It doesn't have to be true.", choices: [
      { t: "\"It was enough, Rook.\"", go: "rook_die1" },
      { t: "\"You were more than your worst night.\"", go: "rook_die2" },
    ] },
    rook_die1: say("ilse", "(Ilse kneels and closes his eyes with her ruined hands.) It was enough, archer. It was more than enough. Go on. We'll carry your bow.", null, () => rookDies()),
    rook_die2: say("ilse", "(Ilse kneels and closes his eyes with her ruined hands.) Hear that, archer? More than your worst night. That's the only kind of forgiveness there is. Go on. We'll carry your bow.", null, () => rookDies()),
    warden2_0: say("warden2", "(The ground trembles. The Warden walks out of the rain, crystal steaming, and looks at Rook's body for a long moment.) I remember him. He was a child at my steps once. He threw stones at pigeons and apologised to each one.", "warden2_1"),
    warden2_1: say("warden2", "Listen, courier. What you woke is the Drowned King: the first king of Kessa. When the sea dried, his people climbed to the high ground. He refused. He said a king who leaves his drowned is no king. The first rain sang him to sleep beneath it.", "warden2_2"),
    warden2_2: say("warden2", "Your Bell, rung once, is an alarm. Rung three times at the top of the Storm Spire, in the three old tones, it is a lullaby. The tones sleep in three shrines. And the King's heralds are already stirring the wrecks on the coast, east of here.", "warden2_3"),
    warden2_3: { who: "warden2", text: "I remember every rain now, thanks to you. I would rather remember this one standing beside you.", choices: [
      { t: "\"Walk with us, Warden.\"", go: "warden2_join" },
      { t: "\"Are you still the same Warden you were before Voss?\"", go: "warden2_same" },
    ] },
    warden2_same: say("warden2", "I don't know. A river is not the same water from one moment to the next, and we still call it by its name. Perhaps I am what I choose to remember. Perhaps you are too.", "warden2_join"),
    warden2_join: say("warden2", "Then let us go east, to the sea that is coming back.", null, () => {
      joinParty("warden"); advance(9);
      card("Chapter IX", "The Wreck Coast", "Where the old sea floor meets the rising water, a thousand ships lie on their sides like dead whales. The drowned sailors are waking, and a smuggler named Nell is stuck on the sand with the only diving bell on the coast.");
    }),
  });
  SPEAKERS.quill = "Treasurer Quill";
  function afterQuill() {
    G.flags.quillDead = true; save(); updateHud();
    toast("The Iron Clerks fall silent all over the city. Find Kest at her workshop.");
  }
  function rescue(i) {
    G.flags.rescued = [...new Set([...(G.flags.rescued || []), i])];
    Music.sound("item"); toast(`${LOST[i].name} ${i === 2 ? "are" : "is"} heading home to Reedholm (${G.flags.rescued.length}/5)`);
    for (let k = 0; k < 8; k++) burst(LOST[i].x * TILE + 8, LOST[i].y * TILE, "#9ad8e0", 3);
    save(); updateHud();
  }
  function rookDies() {
    killMember("rook", "Rook, the deserter archer. Held the torch on the Flats; made the shot from inside the Bog King. It was enough.");
    G.flags.rookDead = true; save(); updateHud();
    card("In memory", "Rook", "They bury him at Reedholm, on the highest stilt, with his broken bow across his chest. Ilse forges a new arrowhead from the Bog King's teeth and sets it on the grave. Nobody says anything clever. For once, Maru doesn't sing.");
    setTimeout(() => openDialog("warden2_0"), 400);
  }

  // ---- routing: when the goal is in another region, point at the passage that leads toward it
  function regionOf(x, y) {
    if (x < OW && y < OH) return "old";
    if (x >= 130) return "mines";
    if (x >= 74 && x <= 104 && y <= 32) return "oru";
    if (x >= 106 && y <= 54) return "spire";
    if (x >= 74 && x <= 104 && y >= 36 && y <= 53) return "deep";
    return "south";
  }
  const REGION_LINKS = { mines: { old: [133, 16] }, old: { oru: [61, 11], south: [12, 51], mines: [38, 29] }, oru: { old: [89, 31], spire: [104, 17] }, spire: { oru: [108, 50] }, south: { old: [14, 57], deep: [117, 86] }, deep: { south: [89, 52] } };
  function routedGoal() {
    const t = goal(); if (!t.text) return t;
    const from = regionOf(Math.floor(G.px / TILE), Math.floor(G.py / TILE)), to = regionOf(t.x, t.y);
    if (from === to) return t;
    const prev = { [from]: null }, q = [from];
    while (q.length) { const r = q.shift(); for (const nb of Object.keys(REGION_LINKS[r] || {})) if (!(nb in prev)) { prev[nb] = r; q.push(nb); } }
    if (!(to in prev)) return t;
    let step = to; while (prev[step] !== from) step = prev[step];
    const [x, y] = REGION_LINKS[from][step];
    return { ...t, x, y };
  }

  // ---- goals
  const TOBIN_PAGES = [{ x: 102, y: 8 }, { x: 76, y: 30 }, { x: 102, y: 30 }];
  function goalAct2() {
    const f = G.flags, ch = n => ["", "", "", "", "", "", "", "Chapter VII · The Open Gate", "Chapter VIII · The Drowning Marsh", "Chapter IX · The Wreck Coast", "Chapter X · The Three Tones", "Chapter XI · The Storm Spire", "Chapter XII · The Drowned King"][n];
    const G7 = ch(7), G8 = ch(8);
    switch (G.stage) {
      case 7:
        if (!f.ledgerQuest) return { ch: G7, text: "Speak to Mayor Ines in the plaza of Oru.", x: 92, y: 15 };
        if ((f.ledgers || []).length < 3) { const left = TOBIN_PAGES.filter((_, i) => !(f.ledgers || []).includes(i)); const nb = left.reduce((a, b) => Math.hypot(a.x * TILE - G.px, a.y * TILE - G.py) < Math.hypot(b.x * TILE - G.px, b.y * TILE - G.py) ? a : b); return { ch: G7, text: `Find Tobin's ledger pages (${(f.ledgers || []).length}/3). Iron Clerks guard them.`, x: nb.x, y: nb.y }; }
        if (!f.writ) return { ch: G7, text: "Bring the ledger pages to Mayor Ines.", x: 92, y: 15 };
        if (!f.guildOpen) return { ch: G7, text: "Show the Mayor's writ to the Guild guard.", x: 83, y: 12 };
        if (!f.quillDead) return { ch: G7, text: "Confront Treasurer Quill in the Guild Hall.", x: 84, y: 6 };
        if (!G.members.includes("kest")) return { ch: G7, text: "Find Kest at her workshop.", x: 84, y: 23 };
        return { ch: G7, text: "Elder Nadia has arrived in the plaza with news.", x: 91, y: 18 };
      case 8:
        if (!f.rescueQuest) return { ch: G8, text: "Take the flooded road south of Kessa to Reedholm.", x: 37, y: 66 };
        if ((f.rescued || []).length < 5) { const left = LOST.filter((_, i) => !(f.rescued || []).includes(i)); const nb = left.reduce((a, b) => Math.hypot(a.x * TILE - G.px, a.y * TILE - G.py) < Math.hypot(b.x * TILE - G.px, b.y * TILE - G.py) ? a : b); return { ch: G8, text: `Find Reedholm's missing villagers (${(f.rescued || []).length}/5).`, x: nb.x, y: nb.y }; }
        if (!f.gulpQuest) return { ch: G8, text: "Tell Elder Oskar everyone is home.", x: 37, y: 66 };
        if (!f.gulpDead) return { ch: G8, text: "Face Old Gulp at the Bog Heart, west of Reedholm.", x: 13, y: 80 };
        return { ch: G8, text: "Speak with the Warden.", x: 16, y: 79 };
      default: return goalAct2b();
    }
  }

  // ---- who says what
  function dialogForAct2(n) {
    const f = G.flags;
    switch (n.id) {
      case "ines": if (f.quillDead) return "ines_after"; if (f.writ) return "ines_after"; if ((f.ledgers || []).length >= 3) return "ines_give"; return f.ledgerQuest ? "ines_wait" : "ines_0";
      case "kest": return f.quillDead ? "kest_join" : "kest_0";
      case "bram": return "bram_0";
      case "yusra": return "yusra_0";
      case "dov": return "dov_0";
      case "gguard": return f.writ ? "gguard_writ" : "gguard_0";
      case "sela": return "sela_0";
      case "pip": return G.members.includes("ada") ? "pip_ada" : "pip_0";
      case "tobin": return f.tobinThanked ? "tobin_after" : "tobin_0";
      case "nadia2": return G.stage >= 8 ? "nadia2_wait" : "nadia2_0";
      case "oskar": if (f.gulpDead) return "oskar_after"; if (f.gulpQuest) return "oskar_wait"; if ((f.rescued || []).length >= 5) return "oskar_done"; if (f.rescueQuest) return "oskar_rest"; return "oskar_0";
      case "warden2": return "warden2_0";
    }
    if (/^lost\d$/.test(n.id)) return `${n.id}_0`;
    if (/^saved\d$/.test(n.id)) { D.__saved = say(n.id, ["Hanne is wrapped in three blankets, telling everyone about the heron.", "Old Fenn is re-thatching a roof with the reeds he refused to drop.", "The twins are drawing the big toad on a plank. They gave it too many teeth. Or exactly enough.", "Brother Jory is praying again, quieter now.", "Liv is teaching the other children how to throw a reed spear."][Number(n.id.slice(5))]); return "__saved"; }
    return dialogForAct2b(n);
  }
  NPCS.filter(n => /^saved\d$/.test(n.id)).forEach(n => { SPEAKERS[n.id] = n.name; });

  // ---- interactions and triggers
  function interactAct2() {
    for (const pr of PROPS) if (pr.type === "campfire" && G.stage >= 7 && near({ x: pr.px, y: pr.py }, 26) && pr.act2) { openDialog("fire_rest"); return true; }
    return interactAct2b();
  }
  D.fire_rest = say(null, "You rest by the fire while the rain hisses in the coals. Everyone is fully healed, and your progress is saved.", null, () => restParty());
  function act2Triggers() {
    const f = G.flags;
    if (G.stage === 7 && f.ledgerQuest) TOBIN_PAGES.forEach((pg, i) => {
      if ((f.ledgers || []).includes(i) || !near({ x: pg.x * TILE + 8, y: pg.y * TILE + 8 }, 13)) return;
      f.ledgers = [...(f.ledgers || []), i]; Music.sound("item"); burst(pg.x * TILE + 8, pg.y * TILE, "#ffcf4a", 18);
      toast(`Ledger page ${f.ledgers.length}/3. ${["Grain weights, doctored in red ink.", "A list of debtors. Beside some names: 'hands collected'.", "Bribes paid: magistrates, harbour master, Captain Ren."][i]}`); save(); updateHud();
    });
    if (f.guildOpen && !f.quillDead && near({ x: 84 * TILE + 8, y: 6 * TILE + 8 }, 44)) once("quillPrompt", () => openDialog("quill_scene"));
    if (f.gulpQuest && !f.gulpDead && near({ x: 13 * TILE + 8, y: 80 * TILE + 8 }, 34)) once("gulpPrompt", () => openDialog("gulp_scene"));
    act2TriggersB();
  }
  function act2BossEnd(boss) {
    if (boss === "quill") setTimeout(() => openDialog("quill_after"), 300);
    if (boss === "gulp") { G.flags.gulpDead = true; save(); setTimeout(() => openDialog("gulp_after"), 300); }
    if (boss === "hollis") { /* Act II begins through finale_0 */ }
    act2BossEndB(boss);
  }
  function chooseIntent2(f, find) {
    if (f.id === "quill") {
      if (f.hp < f.maxHp * 0.55 && !f.summoned) { f.summoned = true; return { ...find("summonKind") }; }
      if (battle.round % 4 === 0) return find("charge");
    }
    if (f.id === "gulp" && f.hp < f.maxHp * 0.6 && !f.summoned) { f.summoned = true; return { ...find("summonKind") }; }
    return chooseIntent2b(f, find);
  }
  async function act2Skill(u, act, s, name) {
    const liveFoes = () => battle.foes.filter(f => !f.dead);
    if (s.hits) { const parts = []; for (let i = 0; i < s.hits; i++) { const t = act.unit.dead ? liveFoes()[0] : act.unit; if (!t) break; parts.push(attackRoll(u, t, s.power).dmg); await wait(200); } blog(`${name} slashes twice (${parts.join(", ")}).`); return true; }
    if (s.plunder) { const r = attackRoll(u, act.unit, s.power); const c = Math.round(rand(4, 12)); G.coins += c; let extra = ""; if (Math.random() < 0.3) { const it = pick(["salve", "tonic", "gsalve", "ether"]); G.items[it] = (G.items[it] || 0) + 1; extra = ` and a ${ITEMS[it].name}`; } blog(`${name} hits for ${r.dmg} and pockets ${c} coin${extra}.`); return true; }
    if (s.veilAll) { for (const h of battle.heroes) if (alive(h)) { h.st.veil = true; popupText(h, "veiled", "#9ef0f5"); } blog(`${name} smashes a smoke bomb. The party vanishes into grey.`); return true; }
    if (s.strongOne) { const t = act.unit; t.ref.hp = Math.min(t.ref.maxHp, t.ref.hp + s.heal); delete t.st.bleed; t.st.strong = s.strongOne + 1; popupText(t, `+${s.heal}`, "#6bff9a"); Music.sound("heal"); blog(`${name} pours an elixir down ${t.name}'s throat.`); return true; }
    if (s.bleedAll) { flash(0.8); const parts = []; for (const f of liveFoes()) { const r = attackRoll(u, f, s.power, { noCrit: true }); parts.push(r.dmg); if (!f.dead) f.st.bleed = { dmg: s.bleedAll[0], turns: s.bleedAll[1] }; } blog(`${name} throws Philosopher's Fire. Everything burns (${parts.join(", ")}).`); return true; }
    if (s.aegis) { const t = act.unit; t.st.guard = true; t.st.guardSource = u.id; t.ref.hp = Math.min(t.ref.maxHp, t.ref.hp + s.heal); popupText(t, "aegis", "#9ef0f5"); Music.sound("heal"); blog(`${name} encases ${t.name} in singing crystal.`); return true; }
    if (s.oath) { for (const h of battle.heroes) if (alive(h)) { h.ref.hp = Math.min(h.ref.maxHp, h.ref.hp + 10); popupText(h, "+10", "#6bff9a"); } u.st.taunt = 3; Music.sound("heal"); blog(`${name} swears the Tidal Oath. "Strike me. Only me."`); return true; }
    if (s.remember) { for (const h of battle.heroes) if (alive(h)) { for (const k of ["bleed", "stun", "weak"]) delete h.st[k]; h.ref.hp = Math.min(h.ref.maxHp, h.ref.hp + 24); h.ref.sp = Math.min(h.ref.maxSp, h.ref.sp + 4); popupText(h, "+24", "#6bff9a"); } flash(0.9); Music.sound("heal"); blog(`${name} remembers the first morning after the first rain, and shows it to everyone.`); return true; }
    return false;
  }

  // ---- props, monsters and places of the rains
  addProp2 = () => {
    for (const [x, y] of [[33, 72], [84, 78], [110, 47]]) addProp("campfire", x, y, { act2: true });
    addProp("board", 86, 13); addProp("sign", 90, 29, { text: "A carved sign above the south gate: ORU. BUILT FOR FIVE THOUSAND. The number has been scratched out and replaced, in fresh chalk: TWELVE." });
    addProp("stall", 85, 19, { color: "#8a2a6a" }); addProp("stall", 93, 19, { color: "#3a5aa8" });   // at the edge of the plaza, off the main street
    for (const [x, y] of [[80, 5], [88, 5], [80, 8], [88, 8]]) addProp("candles", x, y);
    addProp("sign", 15, 59, { text: "A half-sunk signpost: REEDHOLM, EAST. Someone has nailed a child's shoe to it." });
    for (const [x, y] of [[33, 62], [44, 62], [29, 71], [45, 71]]) addProp("lamp", x, y);
  };
  FIELD.push(
    { id: "oc1", x: 101, y: 10, group: ["clerk"], minStage: 7 }, { id: "oc2", x: 78, y: 29, group: ["clerk", "thug"], minStage: 7 },
    { id: "oc3", x: 100, y: 29, group: ["clerk", "thug"], minStage: 7 }, { id: "oc4", x: 86, y: 9, group: ["clerk", "clerk"], minStage: 7 },
    { id: "m1", x: 20, y: 62, group: ["bogghoul", "bogghoul"], minStage: 8 }, { id: "m2", x: 48, y: 62, group: ["toad", "toad"], minStage: 8 },
    { id: "m3", x: 50, y: 82, group: ["dvillager", "bogghoul"], minStage: 8 }, { id: "m4", x: 26, y: 78, group: ["toad", "dvillager"], minStage: 8 },
    { id: "m5", x: 10, y: 70, group: ["bogghoul", "toad"], minStage: 8 }, { id: "m6", x: 44, y: 84, group: ["dvillager", "dvillager", "toad"], minStage: 8 },
  );
  LORE.push(
    { id: 8, x: 96, y: 30, title: "The Founding Stone of Oru", text: "\"Oru: built by the Guild, for the Guild, above the waterline. Let the valley remember who paid for the high ground.\" Beneath it, older and smaller: \"We paid for it. We carried every stone.\"" },
    { id: 9, x: 101, y: 20, title: "A Clerk's Complaint", text: "Filed with the Guild: \"The new Iron Clerks are faster than us and never sleep. When they took Jonas's hands for his debt, they filed the paperwork perfectly. I have never been so frightened of good handwriting.\"" },
    { id: 10, x: 22, y: 64, title: "The Reedholm Hymn", text: "Carved on a stilt: \"When the water comes, we do not run. We build higher. The sea may take the ground, but it cannot take the up.\"" },
    { id: 11, x: 8, y: 76, title: "The Bog Heart", text: "A bell-rope rotted into the mud, still tied to a post: \"Rung for the drowned, so they know where home is.\" Somebody stopped ringing it a century ago. Something else started croaking." },
  );
  CHAPTER_LOG.push(
    [8, "VII · The Open Gate", "I rang the Bell once and the gates opened, but something under the sea rang back. In Oru we exposed Treasurer Quill's forged ledgers. Ren confessed his bribes. Kest, who built the Iron Clerks, joined us."],
    [9, "VIII · The Drowning Marsh", () => `We brought Reedholm's lost home and killed Old Gulp at the Bog Heart. ${G.flags.rookSaved ? "It swallowed Rook. I heard my whistle from inside it, and went in after him. He came out alive." : "Rook died making the shot from inside it."} The Warden found us, remembering everything, and told us of the Drowned King.`],
  );
  CAMPS.push(
    { id: "camp6", when: () => G.members.includes("kest") && G.stage >= 8, node: "camp6_0" },
    { id: "camp7", when: () => G.flags.rookDead && G.stage >= 9, node: "camp7_0" },
  );
  Object.assign(D, {
    camp6_0: say("kest", "(Kest stares at the fire, turning a brass gear over and over.) My father built clocks. He said a good machine does exactly what you tell it, and that's the danger. People don't tell machines what they mean. They tell them what they said.", "camp6_1"),
    camp6_1: say("ilse", "And people? We do what we're told too, mostly.", "camp6_2"),
    camp6_2: say("kest", "People can refuse. That's the whole difference. That's the only difference I could never build. You refused Voss's chains, smith. Four months without your hands. My clerks would have forged the chains without blinking. They didn't have eyes to blink with.", "camp6_3",
      () => { D.camp6_3.text = G.flags.quillFate === "killed" ? "(Ilse looks at her hands.) I didn't refuse, in the end. Not with Quill. I wanted to feel something and I made a corpse instead." : "(Ilse looks at her hands.) I nearly didn't refuse, with Quill. The hammer was already moving."; }),
    camp6_3: say("ilse", "", "camp6_4"),
    camp6_4: say("kest", "Then you're a person. Welcome. It's terrible here."),
    camp7_0: say("maru", "(Maru hums a tune with no words, very softly, over the fire.) That was Rook's song. He never knew he had one. Everyone does. I hear them.", "camp7_1"),
    camp7_1: say("sable", "What's mine?", "camp7_2"),
    camp7_2: say("maru", "Yours is a road. It keeps going. It's the loneliest song I know, and the bravest.", "camp7_3"),
    camp7_3: say("maru", "(Quieter.) Sable. I heard mine last night, for the first time. It ends at the top of a tower. I'm not frightened. I just wanted someone to know before we get there.", "camp7_4"),
    camp7_4: { who: "sable", text: "(The rain keeps falling.)", choices: [
      { t: "\"Then we don't go to the tower.\"", go: "camp7_5a" },
      { t: "\"I'll be there when it ends.\"", go: "camp7_5b" },
    ] },
    camp7_5a: say("maru", "We have to. That's what the song is about. A song isn't a prison, Sable. It's a shape. I get to decide how I sing it."),
    camp7_5b: say("maru", "I know. I heard that part too. It's the best part."),
  });
  function fallenHtml() {
    const fl = G.flags.fallen || []; if (!fl.length) return "";
    return `<h3>The fallen</h3><ul>${fl.map(id => `<li><b>${HEROES[id].name}</b>. ${(G.flags.epitaphs || {})[id] || ""}</li>`).join("")}</ul>`;
  }
  // ---- Act II drawing: monsters, bosses, places
  const SKIES2 = { oru: ["#1a2238", "#4a5a78"], hall: ["#2a1a10", "#5a3a20"], marsh: ["#1a2418", "#4a5a3a"], coast: ["#1a2a3e", "#5a7a98"],
                   spire: ["#0a0c22", "#2a3060"], spireIn: ["#0c1024", "#1e2440"], deep: ["#02060e", "#0a1830"], shrine: ["#1a1a2e", "#4a4a6a"] };
  function drawBattleBg2(g, area) {
    const t = time;
    const rain = (n, a) => { if (REDUCED) return; g.fillStyle = `rgba(170,200,240,${a})`; for (let i = 0; i < n; i++) { const x = (hash(i, 17) * (VIEW_W + 40) - t * 40 + VIEW_W + 40) % (VIEW_W + 40) - 20, y = (hash(i, 19) * 200 + t * 230) % 200 - 10; g.fillRect(Math.round(x), Math.round(y), 1, 5); } };
    if (area === "oru") {
      g.fillStyle = "#2a3050"; for (let i = 0; i < 9; i++) { const x = i * 38 - 10, h = 40 + (i * 37 % 30); g.fillRect(x, 118 - h, 30, h); g.fillStyle = "#3a5aa8"; g.fillRect(x - 2, 118 - h - 6, 34, 7); g.fillStyle = "#ffd98a"; if (i % 2) g.fillRect(x + 8, 118 - h + 10, 4, 5); g.fillStyle = "#2a3050"; }
      g.fillStyle = "#5a5870"; g.fillRect(-10, 116, VIEW_W + 20, 90); g.fillStyle = "#6a6880"; for (let x = -10; x < VIEW_W + 10; x += 12) for (let y = 120; y < 200; y += 8) g.fillRect(x + (y % 16 ? 6 : 0), y, 10, 1);
      g.fillStyle = "rgba(60,90,140,.35)"; g.fillRect(-10, 150 + Math.sin(t) * 1.5, VIEW_W + 20, 50); rain(60, 0.45); return true;
    }
    if (area === "hall") {
      g.fillStyle = "#3a2414"; g.fillRect(-10, -10, VIEW_W + 20, 130); g.fillStyle = "#c9a227"; for (let i = 0; i < 6; i++) { g.fillRect(20 + i * 56, 20, 12, 98); g.fillRect(16 + i * 56, 16, 20, 5); }
      g.fillStyle = "#6b0f1d"; for (let i = 0; i < 5; i++) { g.fillRect(44 + i * 56, 24, 20, 40); g.fillStyle = "#c9a227"; g.fillRect(52 + i * 56, 34, 4, 4); g.fillStyle = "#6b0f1d"; }
      g.fillStyle = "#8a1020"; g.fillRect(-10, 116, VIEW_W + 20, 90); g.fillStyle = "#c9a227"; g.fillRect(-10, 116, VIEW_W + 20, 2);
      g.fillStyle = "#1b1633"; for (let i = 0; i < 7; i++) { g.fillRect(10 + i * 48, 128 + (i % 2) * 10, 16, 3); g.fillStyle = "#e8e2d0"; g.fillRect(12 + i * 48, 125 + (i % 2) * 10, 10, 3); g.fillStyle = "#1b1633"; }
      g.fillStyle = "#2a0a0a"; g.beginPath(); g.ellipse(VIEW_W / 2 + 20, 150, 40, 5, 0, 0, Math.PI * 2); g.fill(); return true;
    }
    if (area === "marsh") {
      g.fillStyle = "#1a2418"; for (let i = 0; i < 8; i++) { const x = i * 44 - 10; g.fillRect(x + 18, 40, 4, 80); g.fillRect(x + 8, 50 + (i % 3) * 6, 12, 2); g.fillRect(x + 22, 60 - (i % 2) * 8, 10, 2); }
      g.fillStyle = "rgba(180,200,170,.12)"; for (let i = 0; i < 5; i++) g.fillRect(-10, 70 + i * 10 + Math.sin(t + i) * 3, VIEW_W + 20, 4);
      g.fillStyle = "#2a3a2a"; g.fillRect(-10, 114, VIEW_W + 20, 92); g.fillStyle = "#3a5a4a"; g.fillRect(-10, 132, VIEW_W + 20, 70);
      g.fillStyle = "rgba(140,200,190,.35)"; for (let i = 0; i < 12; i++) g.fillRect((i * 29 + t * 6) % (VIEW_W + 20) - 10, 140 + (i % 4) * 12, 14, 1);
      g.fillStyle = "#e8e2d0"; for (const [x, y] of [[30, 150], [260, 160]]) { g.fillRect(x, y, 6, 3); g.fillRect(x + 1, y - 2, 3, 2); }
      rain(50, 0.35); return true;
    }
    return drawBattleBg2b(g, area);
  }
  function drawBattleMonster2(g, u, cx, cy, R, drip, tri, hurt) {
    const t = time, sp = u.sprite;
    if (sp === "clerk") {
      const b = Math.round(Math.sin(t * 3 + cx) * 1);
      R(-14, -58 + b, 28, 50, "#1b1633"); R(-13, -57 + b, 26, 48, "#8a6a2a"); R(-13, -57 + b, 26, 3, "#c9a227"); R(8, -57 + b, 5, 48, "#6a4a1a");
      R(-8, -48 + b, 16, 12, "#e8e2d0"); for (let i = 0; i < 4; i++) R(-6, -46 + i * 3 + b, 12, 1, "#5a4a3a");
      R(-9, -72 + b, 18, 15, "#1b1633"); R(-8, -71 + b, 16, 13, "#a88a3a"); R(-6, -67 + b, 4, 3, "#1b1633"); R(2, -67 + b, 4, 3, "#1b1633"); R(-5, -66 + b, 2, 1, "#ff6b3a"); R(3, -66 + b, 2, 1, "#ff6b3a"); R(-4, -61 + b, 8, 1, "#1b1633");
      for (const [x, d] of [[-22, 1], [16, -1]]) { R(x, -54 + b, 6, 20, "#8a6a2a"); R(x - 1, -35 + b, 8, 8, "#d9a070"); R(x - 1, -35 + b, 8, 1, "#8a1020"); for (let i = 0; i < 4; i++) R(x - 1 + i * 2, -28 + b, 1, 4, "#d9a070"); R(x, -36 + b, 6, 1, "#1b1633"); for (let i = 0; i < 3; i++) R(x + 1 + i * 2, -37 + b, 1, 2, "#1b1633"); }
      R(-10, -8, 7, 8, "#1b1633"); R(3, -8, 7, 8, "#1b1633"); drip(-18, -30 + b, 8); drip(20, -30 + b, 10); drip(-2, -36 + b, 6, "#3a2a1a");
      return;
    }
    if (sp === "quill") {
      const b = Math.round(Math.sin(t * 1.6) * 2);
      R(-12, -86 + b, 24, 80, "#1b1633"); R(-11, -85 + b, 22, 78, "#2a2238"); R(-11, -85 + b, 22, 4, "#c9a227"); R(-3, -80 + b, 6, 70, "#c9a227"); R(-2, -80 + b, 4, 70, "#e8e2d0");
      for (let i = 0; i < 5; i++) R(-9, -70 + i * 12 + b, 18, 1, "#c9a227");
      R(-8, -102 + b, 16, 17, "#1b1633"); R(-7, -101 + b, 14, 15, "#e0c8a8"); R(-7, -101 + b, 14, 3, "#3a3a4a"); R(-5, -95 + b, 4, 2, "#f4f0ea"); R(1, -95 + b, 4, 2, "#f4f0ea"); R(-4, -95 + b, 2, 2, "#3a2a1a"); R(2, -95 + b, 2, 2, "#3a2a1a");
      R(-6, -97 + b, 3, 1, "#1b1633"); R(3, -97 + b, 3, 1, "#1b1633"); R(-2, -92 + b, 4, 1, "#b88a6a"); R(-3, -89 + b, 6, 1, "#5a0f18"); R(-6, -99 + b, 1, 5, "#1b1633"); R(4, -99 + b, 1, 5, "#1b1633");
      R(-5, -93 + b, 1, 1, "#e8ffff"); R(3, -93 + b, 1, 1, "#e8ffff");
      const q = Math.sin(t * 2.5) * 6;
      R(12, -78 + b, 5, 30, "#2a2238"); R(15, -110 + b + q, 2, 70, "#e8e2d0"); for (let i = 0; i < 10; i++) R(17, -110 + b + q + i * 3, 4 - Math.abs(i - 5) / 2, 2, "#d8d0c0"); R(15, -42 + b + q, 2, 6, "#1b1633");
      drip(16, -38 + b + q, 16, "#8a1020"); drip(18, -40 + b + q, 12, "#1b1633");
      R(-18, -78 + b, 5, 26, "#2a2238"); R(-22, -54 + b, 10, 12, "#e8e2d0"); R(-21, -52 + b, 8, 1, "#8a1020"); R(-21, -49 + b, 8, 1, "#5a4a3a"); R(-21, -46 + b, 6, 1, "#5a4a3a");
      R(-9, -8, 7, 8, "#1b1633"); R(2, -8, 7, 8, "#1b1633"); drip(-6, -20 + b, 10, "#1b1633");
      if (u.charged) { g.strokeStyle = `rgba(255,207,74,${0.5 + Math.sin(t * 10) * 0.3})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy - 60, 36 + Math.sin(t * 7) * 3, 0, Math.PI * 2); g.stroke(); }
      return;
    }
    if (sp === "toad") {
      const b = Math.sin(t * 3 + cx) * 2, puff = Math.max(0, Math.sin(t * 2 + cx)) * 4;
      R(-22, -32 + b, 44, 26, "#1b1633"); R(-21, -31 + b, 42, 24, "#5a6a3a"); R(-21, -31 + b, 42, 4, "#7a8a4a");
      for (const [x, y] of [[-14, -24], [4, -28], [12, -18], [-6, -16]]) { R(x, y + b, 5, 4, "#8a7a3a"); R(x + 1, y + b + 1, 2, 2, "#3a3a1a"); }
      R(-14 - puff / 2, -12 + b, 28 + puff, 7, "#c8b87a");
      R(-16, -42 + b, 10, 10, "#1b1633"); R(6, -42 + b, 10, 10, "#1b1633"); R(-15, -41 + b, 8, 8, "#e8c83a"); R(7, -41 + b, 8, 8, "#e8c83a"); R(-12, -39 + b, 2, 5, "#1b1633"); R(10, -39 + b, 2, 5, "#1b1633");
      R(-18, -20 + b, 36, 2, "#2a0a0a"); for (let i = 0; i < 8; i++) R(-16 + i * 4, -20 + b, 1, 2, "#e8e2d0");
      R(-26, -10, 8, 6, "#5a6a3a"); R(18, -10, 8, 6, "#5a6a3a"); drip(0, -18 + b, 10, "#7a8a3a"); drip(-10, -18 + b, 8);
      return;
    }
    if (sp === "gulp") {
      const b = Math.sin(t * 1.2) * 3, puff = Math.max(0, Math.sin(t * 1.5)) * 8, p2 = u.hp < u.maxHp * 0.5;
      g.fillStyle = hurt ? "#fff" : "#1b1633"; g.beginPath(); g.ellipse(cx, cy - 44 + b, 66, 44, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#4a5a2e"; g.beginPath(); g.ellipse(cx, cy - 44 + b, 64, 42, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#6a7a3a"; g.beginPath(); g.ellipse(cx - 10, cy - 60 + b, 44, 18, -0.1, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#c8b88a"; g.beginPath(); g.ellipse(cx, cy - 22 + b, 46 + puff, 16 + puff / 2, 0, 0, Math.PI * 2); g.fill();
      // faces pressed against the inside of the skin
      for (const [x, y, s2] of [[-30, -48, 1], [-8, -58, 1.2], [18, -46, 1], [36, -56, 0.9], [-44, -34, 0.8], [8, -30, 1.1]]) {
        const w = Math.round(8 * s2), h = Math.round(9 * s2), mo = Math.round(Math.sin(t * 2 + x) * 1 + 1);
        R(x - w / 2, y + b - h / 2, w, h, "#d8c8a8"); R(x - w / 2, y + b - h / 2, w, 1, "#e8dcc0");
        R(x - w / 2 + 1, y + b - 2, 2, 2, "#2a1a14"); R(x + w / 2 - 3, y + b - 2, 2, 2, "#2a1a14"); R(x - 1, y + b + 1, 3, 1 + mo, "#5a0f18");
      }
      R(-60, -46 + b, 12, 12, "#1b1633"); R(-59, -45 + b, 10, 10, "#e8c83a"); R(-55, -43 + b, 3, 7, "#1b1633");
      R(48, -46 + b, 12, 12, "#1b1633"); R(49, -45 + b, 10, 10, p2 ? "#ff6b3a" : "#e8c83a"); R(53, -43 + b, 3, 7, "#1b1633");
      R(-50, -30 + b, 100, 3, "#2a0a0a"); for (let i = 0; i < 20; i++) R(-48 + i * 5, -30 + b, 2, 3 + (i % 3), "#e8e2d0");
      R(-8, -12 + b, 16, 3, "#8a3a5a"); R(-4, -9 + b, 10, 2 + Math.round(Math.sin(t * 3) * 2 + 2), "#a84a6a");
      for (const [x, d] of [[-70, 1], [58, -1]]) { R(x, -18, 12, 10, "#4a5a2e"); for (let i = 0; i < 3; i++) R(x + i * 4, -9, 3, 5, "#3a4a1e"); }
      R(-20, -60 + b, 6, 2, "#8a6438"); R(-18, -58 + b, 2, 8, "#8a6438"); R(22, -64 + b, 8, 5, "#c9a227");
      drip(-30, -14 + b, 14, "#7a8a3a"); drip(10, -10 + b, 16); drip(40, -16 + b, 12, "#7a8a3a"); drip(-12, -8 + b, 10);
      return;
    }
    drawBattleMonster2b(g, u, cx, cy, R, drip, tri, hurt);
  }
  function drawFieldMonster2(g, f, lead, x, y, bobv) {
    const P = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
    if (lead === "clerk") { P(-6, -20 - bobv, 12, 18, "#1b1633"); P(-5, -19 - bobv, 10, 16, "#8a6a2a"); P(-3, -16 - bobv, 6, 5, "#e8e2d0"); P(-4, -24 - bobv, 8, 6, "#a88a3a"); P(-2, -22 - bobv, 1, 1, "#ff6b3a"); P(1, -22 - bobv, 1, 1, "#ff6b3a"); P(-8, -14 - bobv, 2, 5, "#d9a070"); P(6, -14 - bobv, 2, 5, "#d9a070"); P(-8, -14 - bobv, 2, 1, "#8a1020"); return true; }
    if (lead === "toad") { P(-8, -9 - bobv, 16, 8, "#1b1633"); P(-7, -8 - bobv, 14, 6, "#5a6a3a"); P(-6, -12 - bobv, 4, 4, "#e8c83a"); P(2, -12 - bobv, 4, 4, "#e8c83a"); P(-5, -11 - bobv, 1, 2, "#1b1633"); P(3, -11 - bobv, 1, 2, "#1b1633"); P(-5, -4 - bobv, 10, 2, "#c8b87a"); return true; }
    return drawFieldMonster2b(g, f, lead, x, y, bobv);
  }
  function drawMiniBoss2(g, x, y, kind) {
    const fl = Math.round(Math.sin(time * 2) * 1), P = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
    const sh = w => { g.fillStyle = "rgba(20,14,40,.35)"; g.beginPath(); g.ellipse(x, y + 1, w, 3, 0, 0, Math.PI * 2); g.fill(); };
    if (kind === "quill") { sh(8); P(-5, -28 + fl, 10, 28, "#1b1633"); P(-4, -27 + fl, 8, 26, "#2a2238"); P(-1, -25 + fl, 2, 22, "#c9a227"); P(-3, -34 + fl, 6, 7, "#e0c8a8"); P(5, -40 + fl + Math.round(Math.sin(time * 3) * 2), 1, 20, "#e8e2d0"); return true; }
    if (kind === "gulp") { sh(18); g.fillStyle = "#1b1633"; g.beginPath(); g.ellipse(x, y - 12, 20, 14, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#4a5a2e"; g.beginPath(); g.ellipse(x, y - 12, 19, 13 + fl, 0, 0, Math.PI * 2); g.fill(); P(-14, -24, 6, 6, "#e8c83a"); P(8, -24, 6, 6, "#e8c83a"); P(-12, -22, 2, 3, "#1b1633"); P(10, -22, 2, 3, "#1b1633"); for (const [a, b] of [[-8, -12], [2, -16], [8, -8]]) { P(a, b, 4, 4, "#d8c8a8"); P(a + 1, b + 1, 1, 1, "#2a1a14"); } return true; }
    return drawMiniBoss2b(g, x, y, kind);
  }
  function act2Actors(actors, ox, oy) {
    if (G.stage >= 7 && !G.flags.quillDead) actors.push({ y: 6 * TILE + 8, draw: () => drawMiniBoss(g, 84 * TILE + 8 - ox, 6 * TILE + 8 - oy, "quill") });
    if (G.stage >= 8 && !G.flags.gulpDead) actors.push({ y: 80 * TILE + 8, draw: () => drawMiniBoss(g, 13 * TILE + 8 - ox, 80 * TILE + 8 - oy, "gulp") });
    if (G.stage === 7 && G.flags.ledgerQuest) TOBIN_PAGES.forEach((pg, i) => { if (!(G.flags.ledgers || []).includes(i)) actors.push({ y: pg.y * TILE, draw: () => drawSparkle(g, pg.x * TILE + 8 - ox, pg.y * TILE + 8 - oy, "#ffcf4a") }); });
    act2ActorsB(actors, ox, oy);
  }
  // ---- Chapters IX-XII plug in here (filled in below as they are written)
  function goalAct2b() { return { ch: "Chapter IX · The Wreck Coast", text: "The story continues soon.", x: 90, y: 72 }; }
  function dialogForAct2b() { return null; }
  function interactAct2b() { return false; }
  function act2TriggersB() {}
  function act2BossEndB() {}
  function chooseIntent2b() { return null; }
  function drawBattleBg2b() { return false; }
  function drawBattleMonster2b() {}
  function drawFieldMonster2b() { return false; }
  function drawMiniBoss2b() { return false; }
  function act2ActorsB() {}

  // ---- Chapters IX-XII
  Object.assign(MONSTERS, {
    crab: { name: "Reef Crab", hp: 70, atk: 17, def: 10, spd: 5, xp: 44, coin: [6, 12], sprite: "crawler",
      pal: { "#f2ead8": "#e0703a", "#c8c2b0": "#b0502a", "#e8e2d0": "#f09a5a", "#ff2d2d": "#ffe03a" },
      moves: [{ name: "Crushing Claw", w: 3, power: 1.3, bleed: [3, 2] }, { name: "Shell Up", w: 1, guard: true, heal: 10 }] },
    sailor: { name: "Drowned Sailor", hp: 58, atk: 17, def: 4, spd: 12, xp: 42, coin: [8, 14], sprite: "wraith",
      pal: { "#7a98b8": "#4a6a5a", "#b8d4f0": "#8ab0a0", "#0d1a2e": "#1a2a1a", "#3ee0e8": "#c8ff6a", "#9ef0f5": "#8ac870" },
      moves: [{ name: "Eel Kiss", w: 3, power: 1.1, drain: 0.5 }, { name: "Sea Shanty", w: 1, weakAll: 2 }, { name: "Boarding Hook", w: 1, power: 0.7, all: true }] },
    eel: { name: "Lamprey Eel", hp: 62, atk: 18, def: 5, spd: 10, xp: 44, coin: [5, 10], sprite: "eel",
      moves: [{ name: "Latch and Suck", w: 3, power: 1.2, bleed: [4, 3], drain: 0.3 }, { name: "Coil", w: 1, power: 0.9, stunChance: 0.3 }] },
    maw: { name: "Captain Maw, the Drowned Father", hp: 660, atk: 19, def: 8, spd: 7, xp: 380, coin: [120, 120], sprite: "maw", boss: true, music: "boss", tall: true,
      moves: [{ name: "Anchor Drop", w: 3, power: 1.5, stunChance: 0.3 }, { name: "Eel Brood", w: 2, power: 0.9, all: true, bleed: [3, 2] },
              { name: "Last Shanty", w: 1, weakAll: 2 }, { name: "Salt the Wound", w: 0, charge: true, power: 1.5, all: true },
              { name: "All Hands!", w: 0, summonKind: "sailor", summonText: "Maw bellows a shanty. His drowned crew claw up through the deck boards." }] },
    harpy: { name: "Storm Harpy", hp: 64, atk: 19, def: 5, spd: 14, xp: 48, coin: [6, 12], sprite: "harpy",
      moves: [{ name: "Talon Rake", w: 3, power: 1.1, hits: 2, bleed: [3, 2] }, { name: "Shriek", w: 1, weakAll: 2 }] },
    spark: { name: "Thunder Wisp", hp: 46, atk: 20, def: 3, spd: 13, xp: 46, coin: [5, 9], sprite: "spark",
      moves: [{ name: "Arc", w: 3, power: 0.8, all: true }, { name: "Overcharge", w: 1, power: 1.5, stunChance: 0.35 }] },
    colossus: { name: "The Salt Colossus", hp: 740, atk: 20, def: 12, spd: 3, xp: 420, coin: [140, 140], sprite: "colossus", boss: true, music: "boss", tall: true,
      moves: [{ name: "Grinding Fist", w: 3, power: 1.5 }, { name: "Salt Quake", w: 2, power: 0.9, all: true, stunChance: 0.2 },
              { name: "Choir of the Buried", w: 1, weakAll: 2, heal: 30, guard: true }, { name: "Collapse", w: 0, charge: true, power: 1.7, all: true }] },
    singer: { name: "Hollow Storm-singer", hp: 70, atk: 19, def: 5, spd: 9, xp: 50, coin: [8, 14], sprite: "choir",
      pal: { "#d8d4e8": "#3a4a7a", "#efeaf8": "#5a6a9a", "#9a94b0": "#2a3a6a", "#c8102e": "#3ee0e8", "#f2e6b0": "#9ef0f5", "#ffcf4a": "#e8ffff" },
      moves: [{ name: "Lightning Hymn", w: 3, power: 1.2 }, { name: "Drowning Note", w: 1, weakAll: 2 }, { name: "Static Choir", w: 1, power: 0.7, all: true }] },
    vela: { name: "Sister Vela, the Storm Tyrant", hp: 720, atk: 21, def: 7, spd: 11, xp: 460, coin: [150, 150], sprite: "vela", boss: true, music: "final", tall: true,
      moves: [{ name: "Thunderhead", w: 3, power: 1.0, all: true }, { name: "Lightning Lash", w: 3, power: 1.6, stunChance: 0.25 },
              { name: "Eye of Silence", w: 1, weakAll: 3 }, { name: "The Last Note", w: 0, charge: true, power: 1.8, all: true }] },
    priest: { name: "Abyssal Priest", hp: 84, atk: 21, def: 6, spd: 8, xp: 56, coin: [10, 16], sprite: "choir",
      pal: { "#d8d4e8": "#1a2a3a", "#efeaf8": "#2a4a5a", "#9a94b0": "#0a1a2a", "#c8102e": "#3ee0e8", "#f2e6b0": "#1fb8c2", "#ffcf4a": "#9ef0f5" },
      moves: [{ name: "Drowning Sermon", w: 2, power: 0.8, all: true, weakAll: 2 }, { name: "Sacrament of Brine", w: 3, power: 1.3, drain: 0.5 }] },
    angler: { name: "Angler Horror", hp: 100, atk: 22, def: 7, spd: 6, xp: 60, coin: [12, 18], sprite: "angler",
      moves: [{ name: "Lure", w: 1, weakAll: 2 }, { name: "Engulf", w: 3, power: 1.5, bleed: [4, 3] }, { name: "Glow", w: 1, guard: true, heal: 14 }] },
    king: { name: "Aurel, the Drowned King", hp: 1000, atk: 22, def: 8, spd: 8, xp: 0, coin: [0, 0], sprite: "king", boss: true, music: "final", tall: true,
      moves: [{ name: "Tide of the Dead", w: 3, power: 1.0, all: true }, { name: "Crown of Hands", w: 3, power: 1.6, drain: 0.5 },
              { name: "Brine Lungs", w: 1, bleedAll: [5, 3] }, { name: "Royal Decree", w: 1, weakAll: 3 },
              { name: "Court of the Drowned", w: 0, summonKind: "priest", summonText: "The King raises a hand of a hundred fused fingers. His drowned court rises from the floor to kneel." },
              { name: "The Last Rain", w: 0, charge: true, power: 1.6, all: true }] },
    rotfang: { name: "Rotfang, the Pack Mother", hp: 260, atk: 18, def: 5, spd: 12, xp: 150, coin: [60, 60], sprite: "jackal",
      pal: { "#a3242e": "#5a3a2a", "#6b0f1d": "#3a1a0a", "#f2ead8": "#c8c0a8" },
      moves: [{ name: "Throat Tear", w: 3, power: 1.4, bleed: [5, 3] }, { name: "Howl", w: 1, weakAll: 2 }, { name: "Pack Frenzy", w: 2, power: 0.7, hits: 3 }] },
    widow: { name: "The Brass Widow", hp: 300, atk: 19, def: 11, spd: 5, xp: 170, coin: [70, 70], sprite: "clerk",
      pal: { "#8a6a2a": "#4a4a5a", "#a88a3a": "#6a6a7a", "#c9a227": "#9a9ab0", "#e8e2d0": "#c8102e", "#ff6b3a": "#9ef0f5" },
      moves: [{ name: "Foreclosure", w: 3, power: 1.5, stunChance: 0.25 }, { name: "Collect", w: 2, power: 1.0, drain: 0.6 }, { name: "Rebuild", w: 1, guard: true, heal: 25 }] },
    pincer: { name: "Old Pincer", hp: 340, atk: 20, def: 14, spd: 4, xp: 190, coin: [80, 80], sprite: "crawler",
      pal: { "#f2ead8": "#c83a2a", "#c8c2b0": "#8a1a1a", "#e8e2d0": "#e05a3a" },
      moves: [{ name: "Crack Bone", w: 3, power: 1.6, bleed: [4, 3] }, { name: "Hide", w: 1, guard: true, heal: 20 }, { name: "Sweep", w: 2, power: 0.9, all: true }] },
  });
  Object.assign(RELICS, {
    compass: { name: "Maw's Compass", from: "maw", desc: "+3 speed, +10% critical chance.", spd: 3, crit: 0.1 },
    saltcrown: { name: "Colossus Heartstone", from: "colossus", desc: "+5 defence. Immune to stun.", def: 5, noStun: true },
    tuningfork: { name: "Vela's Tuning Fork", from: "vela", desc: "+3 extra SP each turn, +2 attack.", spRegen: 3, atk: 2 },
  });
  Object.assign(BESTIARY, {
    crab: "They pick the wrecks clean, and then the sailors.", sailor: "They drowned singing. They're still singing.", eel: "Lampreys that learned to love the taste of the living.",
    maw: "Nell's father. He smuggled children to high ground for free, drowned doing it, and came back wrong.", harpy: "Storm-singers who sang so long in the wind that the wind kept them.",
    spark: "A note of thunder that never finished.", colossus: "Built from the salt-packed bodies of a Choir that sang the first King to sleep.",
    singer: "Voices emptied by the King's song, refilled with lightning.", vela: "Maru's teacher. She heard the last note of the world and fell in love with it.",
    priest: "They preach the gospel of the equal sea.", angler: "It glows like a window at night, so that you swim toward it.",
    king: "Aurel, first king of Kessa. He would not climb while his people drowned, so he stayed below with them for four hundred years.",
    rotfang: "An elite. The mother of every jackal on the Flats.", widow: "An elite. A clerk rebuilt from other clerks, still collecting.", pincer: "An elite. The oldest crab on the coast, carrying a church bell as a shell.",
  });
  npc2({ id: "nell", name: "Nell", x: 81, y: 78, look: HEROES.nell.look, show: () => G.stage >= 9 && !G.members.includes("nell") && !(G.flags.fallen || []).includes("nell") });
  npc2({ id: "hollisghost", name: "Hollis's shade", x: 80, y: 44, look: { robe: "#8a7a3a", hair: "#5a6a6a", skin: "#8ab0b8", glowEyes: true, style: { hair: "bald", beard: false, coat: true } }, show: () => G.stage >= 12 });
  npc2({ id: "rookghost", name: "Rook's shade", x: 86, y: 42, look: { ...HEROES.rook.look, skin: "#9ab8c8", glowEyes: true }, show: () => G.stage >= 12 && G.flags.rookDead });
  SPEAKERS.maw = "Captain Maw"; SPEAKERS.vela = "Sister Vela"; SPEAKERS.king = "Aurel, the Drowned King";
  const PARTS = [{ x: 78, y: 62, name: "a sail" }, { x: 99, y: 68, name: "a rudder" }, { x: 121, y: 59, name: "a pot of tar" }];
  const SHRINES = [
    { id: "tide", x: 69, y: 77, name: "the Tide Shrine", group: ["eel", "crab", "eel"], area: "coast", vision: "tide_v0" },
    { id: "salt", x: 44, y: 48, name: "the Salt Shrine", group: ["colossus"], boss: "colossus", area: "shrine", vision: "salt_v0", pre: "salt_pre" },
    { id: "storm", x: 123, y: 40, name: "the Storm Shrine", group: ["harpy", "spark", "harpy"], area: "spire", vision: "storm_v0" },
  ];
  const tonesDone = () => (G.flags.tones || []).length;

  Object.assign(D, {
    // ---- Chapter IX
    nell_0: say("nell", "(A woman in a salt-stained coat is kicking the hull of a beached ship.) Don't step on the tar. Don't touch the rigging. And if you're here to collect a toll, I'll feed you to the crabs personally.", "nell_1"),
    nell_1: say("nell", "This is the Gull. Best smuggling ship on the coast, stuck in the sand since the sea left forty years ago. Now it's coming back, and I need her floating. She needs a sail, a rudder and a pot of tar. The wrecks have all three, and all three are full of the dead.", "nell_2"),
    nell_2: { who: "nell", text: "My father taught me to sail on this deck. Captain Maw. He smuggled Kessa children up to Oru's high ground for free when the Guild wanted a toll. Drowned doing it, three months ago.", choices: [
      { t: "\"We'll get your parts.\"", go: "nell_3" },
      { t: "\"Why do you need a ship?\"", go: "nell_why" },
    ] },
    nell_why: say("nell", "Because the Gull carries the only diving bell on the coast, and your crystal friend there says you need to go down to the bottom of the sea. Nobody goes down there and comes back. My father did, once, for a bet. He came back quieter.", "nell_3"),
    nell_3: say("nell", "Sail's in the wreck to the north-west. Rudder's in the one to the east. Tar's up by the old lighthouse. Watch the eels. They go for the eyes.", null, () => { G.flags.partsQuest = true; toast("New task: find a sail, a rudder and tar for the Gull"); save(); updateHud(); }),
    nell_wait: say("nell", "Sail, north-west wreck. Rudder, east wreck. Tar, the lighthouse. I'd come with you, but somebody has to stop the crabs eating my boat."),
    nell_parts: say("nell", "(Nell runs her hand along the new sail.) She'll float. ...Courier, there's something I didn't tell you. Every night there's singing from the Great Wreck, north of here. Sea shanties. In my father's voice.", "nell_parts2"),
    nell_parts2: say("nell", "I've been telling myself it's the wind. Come with me. I don't want to find out alone.", null, () => { G.flags.mawQuest = true; save(); updateHud(); }),
    maw_scene: say(null, "In the belly of the Great Wreck, a huge man sits on a throne of barnacled cargo, singing. His coat is rotting off him in strips. Eels move in the sockets where his eyes were, and an anchor chain runs from his spine down through the deck, into the dark.", "maw_scene2"),
    maw_scene2: say("maw", "Nellie! My girl, my girl. Come and see. The King gave me a ship that can't sink, because it's already at the bottom. No tolls down here, Nellie. No Guild. Nobody's poor at the bottom of the sea.", "maw_scene3"),
    maw_scene3: say("nell", "(Nell's cutlass is shaking.) You smuggled children for free, Da. You said a toll on the high ground was a toll on breathing. What did he do to you?", "maw_scene4"),
    maw_scene4: { who: "maw", text: "He showed me the bottom, where everyone is equal. Come down with me. Bring your friends. There's room for everyone below. That's the whole point.", choices: [
      { t: "\"Equal isn't the same as dead.\" (Fight)", go: null, act: () => startBattle(["maw", "sailor"], { boss: "maw", area: "coast" }) },
      { t: "Let Nell answer. (Fight)", go: "maw_nell" },
    ] },
    maw_nell: say("nell", "You taught me the sea is for the living, Da. You were wrong about one thing in your whole life, and it's this. I'm sorry.", null, () => startBattle(["maw", "sailor"], { boss: "maw", area: "coast" })),
    maw_after: say("maw", "(The eels go still. For a moment, the ruined face is only a tired old sailor's.) Nellie? ...Oh. Oh, what did I do. Don't... pay the toll, girl. Not theirs, not his. Not anybody's.", "maw_after2"),
    maw_after2: say(null, "Nell cuts the anchor chain with one stroke. The body of Captain Maw slides through the broken hull into the rising sea, and she doesn't look away until it's gone.", "maw_after3"),
    maw_after3: { who: "nell", text: "(She wipes her face with a tarry sleeve.) Right. The Gull floats. The bell works. And I have nobody left to disappoint. Where are we going, courier?", choices: [
      { t: "\"To the bottom of the sea, eventually.\"", go: "nell_join" },
      { t: "\"You don't have to come.\"", go: "nell_join2" },
    ] },
    nell_join: say("nell", "Good. I've always wanted to see what he saw. Let's make sure we come back quieter, and not wrong.", null, () => nellJoins()),
    nell_join2: say("nell", "I know. That's why I'm coming. Nobody's made me do anything since I was nine. Don't start now.", null, () => nellJoins()),
    // ---- Chapter X
    shrine_intro: say("warden", "The three tones sleep in three shrines: Tide, by the sea south of the wrecks. Salt, in the Flats south of the Well of Nine. Storm, on the mountain road east of Oru. Each has a guardian. Each has a memory. You will not like all of them.", null, () => { G.flags.shrineQuest = true; save(); updateHud(); }),
    shrine_ask: { who: null, text: "An old shrine of salt and coral. Something is waiting inside, keeping the tone.", choices: [
      { t: "Wake the guardian.", go: null, act: () => shrineFight() },
      { t: "Not yet.", go: null },
    ] },
    shrine_done: say(null, "The shrine is quiet now. Its tone rings faintly in the Rain Bell, as if the Bell is remembering how to sing."),
    salt_pre: say("ada", "(Ada stops. Her hand goes to her mouth.) The salt. Look at the salt. Those are faces. That's Sister Hele. That's Mother Iris. That's my whole Choir. They sang the King to sleep four hundred years ago and they were buried standing up, still singing.", "salt_pre2"),
    salt_pre2: say("ada", "Something packed them into a giant. It's using their voices to keep the tone. I have to put them down. Help me put them down gently.", null, () => startBattle(["colossus"], { boss: "colossus", area: "shrine", shrine: "salt" })),
    tide_v0: say(null, "A memory rises from the Tide Shrine: a young king in a plain coat, handing out water in a drought. Every cup the same size. A merchant offers him gold for a bigger cup. The king pours the merchant's water into the sand and gives the empty cup back.", "tide_v1"),
    tide_v1: say(null, "\"Water is not for sale in Kessa,\" says King Aurel. \"Not while I'm king.\" Behind the merchant, men in Guild coats are writing his name in a ledger."),
    salt_v0: say(null, "A memory rises from the Salt Shrine: the first rain. The sea is drying, and the people climb the hills. The King refuses to leave the drowned lowlands where his people's dead are buried. \"A king who leaves his dead behind is no king,\" he says.", "salt_v1"),
    salt_v1: say(null, "The Choir sings him to sleep beneath the rising salt. As he sleeps, he asks one question: \"Who will sing for the ones still below?\" Nobody answers. The Choir is buried where it stands.", "salt_v2"),
    salt_v2: say("ada", "(Ada kneels in the salt, whispering the sleeping-words over each face until it closes its eyes. Her voice cracks and goes.) ...I've sung my last hymn, courier. That's all right. They needed it more than I did.", null, () => { G.flags.adaVoice = true; }),
    storm_v0: say(null, "A memory rises from the Storm Shrine: storm-singers forging a bell from a drowned king's crown. \"When the rain comes,\" says their leader, \"ring it, and everyone climbs to high ground together. A bell for everyone.\"", "storm_v1"),
    storm_v1: say(null, "Years later, a Guild magister buys the bell for the gates of Oru. The gates open only when the bell rings, and the bell rings only when the Guild is paid. The singers weep. The bell becomes a lock."),
    tones_all: say("warden", "All three tones. The Bell remembers its true song. We ring it at the top of the Storm Spire: three times, three tones, and the King sleeps. ...It will cost something. Songs like this always do.", null, () => {
      advance(11);
      card("Chapter XI", "The Storm Spire", "Above Oru, the Storm Spire splits the clouds. The storm-singers who lived there have gone hollow, singing the King's song back to him. At the top waits the woman who taught Maru to hear the weather.");
    }),
    // ---- Chapter XI
    vela_scene: say("vela", "(A woman floats at the top of the Spire, hair crackling with lightning, eyes white as sea-foam.) Maru. My little thunder. You came to hear the last note too?", "vela_scene2"),
    vela_scene2: say("maru", "You taught me every song ends, Sister. You never taught me to want the ending.", "vela_scene3"),
    vela_scene3: say("vela", "I heard the King's song and understood. Every song ends. Every city floods. Every ledger is burned. Why do you cling to the middle of the song, when the last note is so quiet? Let the sea have the valley. Let everyone rest.", "vela_scene4"),
    vela_scene4: { who: "maru", text: "(Maru's blind eyes are wet.) Because the middle is where the people are, Sister. Because the rest isn't rest if nobody's left to wake up.", choices: [
      { t: "Fight for the middle of the song.", go: null, act: () => startBattle(["vela", "singer"], { boss: "vela", area: "spireIn" }) },
    ] },
    vela_after: say("vela", "(The lightning drains from Vela's hair. She falls to her knees, only an old woman in the rain.) Maru... I remember. The Bell needs a singer to hold the storm open while it rings. The song takes everything. That's why I ran from it. That's why I listened to him.", "vela_choice"),
    vela_choice: { who: "sable", text: "(Vela is dying slowly. The storm is waiting.)", choices: [
      { t: "Spare Vela. She may still do some good.", go: "vela_spared" },
      { t: "End her suffering.", go: "vela_ended" },
    ] },
    vela_spared: say("vela", "(She grips Maru's hand.) Then let me pay my debt. I'll sing the storm open. I'm old, and I've been hollow for a year. Let me fill up one last time.", "sing_choice"),
    vela_ended: say("maru", "(Maru holds her teacher as she goes.) Sleep, Sister. The last note's yours. ...Sable. It's me, then. It was always going to be me. I heard it.", "sing_maru"),
    sing_choice: { who: "maru", text: "(Maru looks at you. She can't see you. She always knows exactly where you are.) One of us sings, Sable. You choose. I won't hate you for either.", choices: [
      { t: "\"Vela sings.\" (Maru lives)", go: "sing_vela" },
      { t: "\"This was always your song, Maru.\" (Maru sings)", go: "sing_maru" },
    ] },
    sing_vela: say(null, "Sister Vela rises into the storm and begins to sing. The Bell rings once, twice, three times in the three old tones, and with every note Vela grows fainter, until there is only her voice, and then only the rain.", "sing_vela2", () => { G.flags.velaSang = true; }),
    sing_vela2: say("maru", "(Maru is crying, and smiling.) She sang it beautifully. She got the ending right. ...I heard my song change just now. It doesn't end at a tower anymore. I don't know where it ends. That's terrifying. That's wonderful.", "bell_rung"),
    sing_maru: say("maru", "(Maru steps to the edge of the Spire, lantern in hand.) Don't look so sad. I've known since the marsh. A song isn't a prison, Sable. It's a shape. Watch me sing it well.", "sing_maru2"),
    sing_maru2: say(null, "Maru sings. The storm opens above the Spire like a door. The Bell rings once, twice, three times in the three old tones, and with every note her voice grows brighter and her body fainter, until she is only light, and then only song, and then only rain.", "sing_maru3", () => { mariSings(); }),
    sing_maru3: say("ilse", "(Ilse picks up the blind singer's lantern. It's still lit.) ...She said she'd sing it well. She did. She did.", "bell_rung"),
    bell_rung: say(null, "Far below, under the sea, the King answers. Not with sleep. With a roar that shakes the Spire. The three tones have woken him fully, and he will not be sung to sleep a second time. Out on the coast, the sea opens into a whirlpool.", "bell_rung2"),
    bell_rung2: say("warden", "He refuses the lullaby. Then there is only one road left: down. Nell's diving bell. The throne at the bottom of the sea. Whatever happens there decides who owns the high ground, and whether there is a high ground at all.", null, () => {
      G.flags.bellReady = true; advance(12);
      card("Chapter XII", "The Drowned King", "Nell's diving bell waits at the end of the pier, above the whirlpool. Below it lies the drowned palace of Aurel, first king of Kessa, who has waited four hundred years to ask one question.");
    }),
    // ---- Chapter XII
    hollisghost_0: say("hollisghost", "(The shade of Hollis flickers, gold coat rotting.) Courier. Look at me. I thought if I owned the high ground, I'd never drown. I bargained with him and drowned anyway. I still own nothing. Not even my name.", "hollisghost_1"),
    hollisghost_1: say("hollisghost", "He'll offer you the crown. He offered it to me. The terrible thing is, he means it kindly. Don't take it. Or do. I'm the last person who should tell anyone anything."),
    rookghost_0: say("rookghost", "(Rook's shade leans on a bow of light.) Didn't think you'd get rid of me that easily. The dead can see a long way down here, courier. I can see the whole valley from here.", "rookghost_1"),
    rookghost_1: say("rookghost", "It's not so bad, being part of the sea. But it isn't living. Tell the King that from me. He's been down here so long he forgot the difference."),
    king_scene: say(null, "At the bottom of the sea, on a throne of fused bones, sits a figure made of the drowned: hundreds of bodies woven into one great shape, crowned with hands. In the middle of it all, a young king's face, very tired.", "king_scene2"),
    king_scene2: say("king", "Courier. Four hundred years I waited for someone to answer my question. Who sings for the ones still below? Your Guild built a gate. Your Bell became a lock. The high ground was sold, and the poor were left in the flood.", "king_scene3"),
    king_scene3: say("king", "In the sea, no one owns anything. No one is poor, because no one has anything. No one is left below, because everyone is below. Is that not justice? Is that not the equality your Nadia carved in stone?", "king_scene4"),
    king_scene4: { who: "king", text: "Tell me why I should let the living keep their hills.", choices: [
      { t: "\"Because equal in death isn't justice. It's just silence.\"", go: "king_a1" },
      { t: "\"Because we opened the gates. The high ground is for everyone now.\"", go: "king_a2" },
      { t: "\"You're right about the Guild. You're wrong about the answer.\"", go: "king_a3" },
    ] },
    king_a1: say("king", "Silence. Yes. I have heard nothing else for four centuries. Perhaps I have forgotten there was another sound. Show me, then. Show me with your blades why the living song is worth the pain.", null, () => kingFight()),
    king_a2: say("king", "For now. Until someone builds another gate, writes another ledger, sells another hill. You would bet the whole valley on the goodness of people? Then show me what the goodness of people can do.", null, () => kingFight()),
    king_a3: say("king", "(The tired face almost smiles.) That is the first honest thing a living person has said to me in four hundred years. It will not stop me. Nothing stops the sea. But I will remember it.", null, () => kingFight()),
    king_after: say("king", "(The great shape comes apart, body by body, drifting up toward a surface they will never reach. The young face is the last to go.) Who... sings for the ones below, courier? You still haven't answered.", "king_after2"),
    king_after2: say(null, "The drowned palace begins to collapse. Water thunders through the broken walls, and the great doors of the throne room start to swing shut on their own, pushed by the whole weight of the sea.", "ren_hold"),
    ren_hold: say("ren", "(Ren sets his shield against the doors and braces.) Go. All of you. Somebody has to hold the door, and I've had practice. I kept a gate shut for money once. Let me hold one open for free.", "ren_hold2"),
    ren_hold2: { who: "ren", text: "(The door shudders. Water sprays past his spear.) Go, courier. That's an order. First one I've given that I'm proud of.", choices: [
      { t: "\"Thank you, Captain.\"", go: "ren_die" },
      { t: "\"We're not leaving you!\"", go: "ren_die2" },
    ] },
    ren_die: say(null, "Ren holds the door until the last of you is through. Then the sea comes in, and the door holds, and Ren holds it, and you do not see what happens after that. Somewhere behind you, a spear strikes a shield, once, like a bell.", "final_choice", () => renDies()),
    ren_die2: say("ren", "You are. Tell the magistrates I paid my fine. Tell Ines I kept my word.", "ren_die"),
    final_choice: { who: null, text: "You reach the diving bell with the Rain Bell in your arms. The King's question hangs in the water: who sings for the ones still below? The Bell is waiting for your answer.", choices: [
      { t: "Ring the Bell for everyone. Open every gate, and let the King sleep.", go: null, act: () => ending("ring") },
      { t: "Take the drowned crown. Rule the valley from below, where everyone is equal.", go: null, act: () => ending("crown") },
      { t: "Stay below and sing for them yourself, as the new Keeper of the Deep.", go: null, act: () => ending("keeper"), req: () => G.members.includes("warden"), reqText: "the Warden beside you" },
    ] },
    // ---- bounties
    board_0: { who: null, text: "The Mayor's bounty board. Three notices are pinned under a dripping awning.", choices: [
      { t: () => bountyLine("rotfang"), go: "board_0", act: () => claimBounty("rotfang") },
      { t: () => bountyLine("widow"), go: "board_0", act: () => claimBounty("widow") },
      { t: () => bountyLine("pincer"), go: "board_0", act: () => claimBounty("pincer") },
      { t: "Leave.", go: null },
    ] },
  });
  const BOUNTIES = { rotfang: { where: "the Glass Flats, south of the Well", reward: 120, item: "phoenix" }, widow: { where: "the Storm Road east of Oru", reward: 160, item: "ether" }, pincer: { where: "the Wreck Coast, among the eastern wrecks", reward: 200, item: "gsalve" } };
  const bountyLine = k => { const b = BOUNTIES[k], claimed = (G.flags.bountiesClaimed || []).includes(k), dead = (G.flags.bountiesDead || []).includes(k); return claimed ? `${MONSTERS[k].name}: paid.` : dead ? `${MONSTERS[k].name}: slain! Claim ${b.reward} coin and a ${ITEMS[b.item].name}.` : `WANTED: ${MONSTERS[k].name}, seen in ${b.where}. Reward ${b.reward} coin.`; };
  function claimBounty(k) {
    if (!(G.flags.bountiesDead || []).includes(k) || (G.flags.bountiesClaimed || []).includes(k)) return;
    G.flags.bountiesClaimed = [...(G.flags.bountiesClaimed || []), k]; G.coins += BOUNTIES[k].reward; G.items[BOUNTIES[k].item] = (G.items[BOUNTIES[k].item] || 0) + 1;
    Music.sound("item"); toast(`Bounty paid: ${BOUNTIES[k].reward} coin and a ${ITEMS[BOUNTIES[k].item].name}`); save(); updateHud();
  }
  function nellJoins() {
    joinParty("nell"); G.flags.gullFixed = true; advance(10); save();
    card("Chapter X", "The Three Tones", "The Rain Bell was forged with three tones: tide, salt and storm. Each was hidden in a shrine when the Guild turned the Bell into a lock. Find them, and the Bell can sing the lullaby it was made for.");
    setTimeout(() => openDialog("shrine_intro"), 500);
  }
  function mariSings() {
    killMember("maru", "Maru, the blind storm-singer. She heard her own song end at the top of a tower, and walked there anyway, and sang it well.");
    G.flags.maruDead = true; save();
  }
  function renDies() {
    killMember("ren", "Ren, Captain of Oru. Kept a gate shut for money once; held one open for free at the bottom of the sea.");
    G.flags.renDead = true; save();
  }
  function kingFight() { startBattle(["king"], { boss: "king", area: "deep" }); }
  let pendingShrine = null;
  function shrineFight() {
    const sh = pendingShrine; if (!sh) return;
    if (sh.pre) { openDialog(sh.pre); return; }
    startBattle(sh.group, { boss: sh.boss, area: sh.area, shrine: sh.id });
  }

  goalAct2b = function () {
    const f = G.flags, CH = ["Chapter IX · The Wreck Coast", "Chapter X · The Three Tones", "Chapter XI · The Storm Spire", "Chapter XII · The Drowned King"];
    switch (G.stage) {
      case 9:
        if (!f.partsQuest) return { ch: CH[0], text: "Find the smuggler Nell and her ship on the Wreck Coast, east of the marsh.", x: 81, y: 78 };
        if ((f.parts || []).length < 3) { const left = PARTS.filter((_, i) => !(f.parts || []).includes(i)); const nb = left.reduce((a, b) => Math.hypot(a.x * TILE - G.px, a.y * TILE - G.py) < Math.hypot(b.x * TILE - G.px, b.y * TILE - G.py) ? a : b); return { ch: CH[0], text: `Find parts for the Gull (${(f.parts || []).length}/3): ${nb.name}.`, x: nb.x, y: nb.y }; }
        if (!f.mawQuest) return { ch: CH[0], text: "Bring the parts back to Nell.", x: 81, y: 78 };
        return { ch: CH[0], text: "Follow the singing into the Great Wreck.", x: 111, y: 61 };
      case 10: {
        if (tonesDone() >= 3) return { ch: CH[1], text: "Tell the Warden all three tones are found.", x: Math.floor(G.px / TILE), y: Math.floor(G.py / TILE) };
        const left = SHRINES.filter(s2 => !(f.tones || []).includes(s2.id)); const nb = left.reduce((a, b) => Math.hypot(a.x * TILE - G.px, a.y * TILE - G.py) < Math.hypot(b.x * TILE - G.px, b.y * TILE - G.py) ? a : b);
        return { ch: CH[1], text: `Wake the three shrines (${tonesDone()}/3). Nearest: ${nb.name}.`, x: nb.x, y: nb.y };
      }
      case 11: return { ch: CH[2], text: "Climb the Storm Spire, east of Oru, and face what waits at the top.", x: 118, y: 5 };
      case 12:
        if (!f.kingDead) return { ch: CH[3], text: "Take Nell's diving bell down the whirlpool at the end of the pier, and face the Drowned King.", x: 89, y: 39 };
        return { ch: CH[3], text: "", x: 89, y: 39 };
    }
    return { ch: "", text: "", x: 12, y: 39 };
  };
  dialogForAct2b = function (n) {
    const f = G.flags;
    if (n.id === "nell") { if (f.mawQuest) return "nell_parts2"; if ((f.parts || []).length >= 3) return "nell_parts"; return f.partsQuest ? "nell_wait" : "nell_0"; }
    if (n.id === "hollisghost") return "hollisghost_0";
    if (n.id === "rookghost") return "rookghost_0";
    return null;
  };
  interactAct2b = function () {
    for (const pr of PROPS) if (pr.type === "board" && near({ x: pr.px, y: pr.py }, 24)) { openDialog("board_0"); return true; }
    if (G.stage === 10) for (const sh of SHRINES) if (near({ x: sh.x * TILE + 8, y: sh.y * TILE + 8 }, 24)) {
      pendingShrine = sh; openDialog((f => (f.tones || []).includes(sh.id))(G.flags) ? "shrine_done" : "shrine_ask"); return true;
    }
    if (G.stage === 10 && tonesDone() >= 3) { openDialog("tones_all"); return true; }
    return false;
  };
  act2TriggersB = function () {
    const f = G.flags;
    if (G.stage === 9 && f.partsQuest) PARTS.forEach((pt, i) => {
      if ((f.parts || []).includes(i) || !near({ x: pt.x * TILE + 8, y: pt.y * TILE + 8 }, 13)) return;
      f.parts = [...(f.parts || []), i]; Music.sound("item"); burst(pt.x * TILE + 8, pt.y * TILE, "#ffcf4a", 18); toast(`Found ${pt.name} for the Gull (${f.parts.length}/3)`); save(); updateHud();
    });
    if (G.stage === 9 && f.mawQuest && !f.mawDead && near({ x: 111 * TILE + 8, y: 61 * TILE + 8 }, 40)) once("mawPrompt", () => openDialog("maw_scene"));
    if (G.stage === 10 && tonesDone() >= 3) once("tonesPrompt", () => openDialog("tones_all"));
    if (G.stage === 11 && !f.velaDead && near({ x: 118 * TILE + 8, y: 4 * TILE + 8 }, 44)) once("velaPrompt", () => openDialog("vela_scene"));
    if (G.stage === 12 && !f.kingDead && near({ x: 89 * TILE + 8, y: 39 * TILE + 8 }, 40)) once("kingPrompt", () => openDialog("king_scene"));
  };
  act2BossEndB = function (boss) {
    if (boss === "maw") { G.flags.mawDead = true; save(); setTimeout(() => openDialog("maw_after"), 300); }
    if (boss === "vela") { G.flags.velaDead = true; save(); setTimeout(() => openDialog("vela_after"), 300); }
    if (boss === "king") { G.flags.kingDead = true; save(); setTimeout(() => openDialog("king_after"), 300); }
    const sh = battleShrine; battleShrine = null;
    if (sh) { G.flags.tones = [...new Set([...(G.flags.tones || []), sh])]; save(); const s2 = SHRINES.find(x => x.id === sh); setTimeout(() => openDialog(s2.vision), 300); }
    for (const k of Object.keys(BOUNTIES)) if (lastGroup.includes(k)) { G.flags.bountiesDead = [...new Set([...(G.flags.bountiesDead || []), k])]; toast(`${MONSTERS[k].name} is dead. Claim the bounty at the board in Oru.`); save(); }
  };
  chooseIntent2b = function (f, find) {
    if (f.id === "maw") { if (f.hp < f.maxHp * 0.6 && !f.summoned) { f.summoned = true; return { ...find("summonKind") }; } if (battle.round % 4 === 0) return find("charge"); }
    if (f.id === "colossus" && battle.round % 3 === 0) return find("charge");
    if (f.id === "vela") { if (battle.round % 3 === 0) return find("charge"); if (f.hp < f.maxHp * 0.5 && !f.phase2) { f.phase2 = true; return { ...find("charge"), announce: "Vela screams. The storm answers: every window in the Spire shatters inward." }; } }
    if (f.id === "king") {
      if (f.hp < f.maxHp * 0.75 && !f.summoned) { f.summoned = true; return { ...find("summonKind") }; }
      if (f.hp < f.maxHp * 0.5 && !f.phase2) { f.phase2 = true; return { ...find("bleedAll"), announce: "THE KING RISES. Bodies peel away from his shape and he grows taller, faster, hungrier." }; }
      if (f.hp < f.maxHp * 0.25 && !f.phase3) { f.phase3 = true; return { ...find("charge"), announce: "THE LAST RAIN. The whole sea above leans down to listen." }; }
      if (f.phase3 && battle.round % 3 === 0) return find("charge");
    }
    return null;
  };
  // shrine and bounty bookkeeping: remember which shrine / group a battle came from
  let battleShrine = null, lastGroup = [];
  const _startBattle = startBattle;
  startBattle = function (group, opts = {}) { battleShrine = opts.shrine || null; lastGroup = group.slice(); return _startBattle(group, opts); };
  FIELD.push(
    { id: "c1", x: 80, y: 67, group: ["crab", "crab"], minStage: 9 }, { id: "c2", x: 100, y: 63, group: ["sailor", "crab"], minStage: 9 },
    { id: "c3", x: 118, y: 66, group: ["sailor", "sailor", "eel"], minStage: 9 }, { id: "c4", x: 92, y: 76, group: ["eel", "crab"], minStage: 9 },
    { id: "c5", x: 70, y: 62, group: ["crab", "eel"], minStage: 9 }, { id: "c6", x: 108, y: 72, group: ["sailor", "eel"], minStage: 9 },
    { id: "s1", x: 112, y: 48, group: ["harpy", "harpy"], minStage: 10 }, { id: "s2", x: 120, y: 40, group: ["spark", "harpy"], minStage: 10 },
    { id: "f1", x: 115, y: 26, group: ["singer", "spark"], minStage: 11 }, { id: "f2", x: 121, y: 15, group: ["singer", "singer"], minStage: 11 },
    { id: "f3", x: 123, y: 7, group: ["spark", "spark", "singer"], minStage: 11 }, { id: "f4", x: 114, y: 17, group: ["harpy", "singer"], minStage: 11 },
    { id: "d1", x: 82, y: 46, group: ["priest", "angler"], minStage: 12 }, { id: "d2", x: 97, y: 44, group: ["angler", "angler"], minStage: 12 },
    { id: "d3", x: 86, y: 48, group: ["priest", "priest"], minStage: 12 }, { id: "d4", x: 94, y: 49, group: ["angler", "priest"], minStage: 12 },
    { id: "e1", x: 30, y: 40, group: ["rotfang", "jackal", "jackal"], minStage: 7, elite: true }, { id: "e2", x: 116, y: 46, group: ["widow", "clerk"], minStage: 10, elite: true },
    { id: "e3", x: 102, y: 76, group: ["pincer", "crab"], minStage: 9, elite: true },
  );
  LORE.push(
    { id: 12, x: 88, y: 74, title: "The Gull's Logbook", text: "In Captain Maw's hand: \"Took eleven Kessa kids up the cliff path to Oru tonight. Guild wanted a toll. Told them the toll was paid in full, by the kids being alive. They didn't laugh. I did.\"" },
    { id: 13, x: 124, y: 50, title: "A Storm-singer's Primer", text: "\"Lesson one: every song ends. Lesson two: that is not a reason to stop singing. Most students only remember lesson one.\"" },
    { id: 14, x: 116, y: 28, title: "Vela's Diary", text: "\"The King's song again tonight. It says the last note is peace. It says no one ever has to be afraid of drowning once they've drowned. I am so tired of being afraid.\"" },
    { id: 15, x: 99, y: 40, title: "The King's Epitaph", text: "Carved into the throne-room floor: \"AUREL. HE WOULD NOT CLIMB WHILE ONE OF HIS PEOPLE DROWNED.\" Below it, newer: \"AND SO ALL OF THEM DID.\"" },
  );
  CHAPTER_LOG.push(
    [10, "IX · The Wreck Coast", "We found the Gull's parts. Nell's father, Captain Maw, had come back drowned and wrong. We freed him. Nell joined us with her diving bell."],
    [11, "X · The Three Tones", "The three shrines gave back the Bell's tones, and three memories: a king who would not sell water, a Choir buried singing, and a bell for everyone that became a lock."],
    [12, "XI · The Storm Spire", "Sister Vela had fallen to the King's song. The Bell was rung three times at the top of the Spire, and it cost a singer everything. The King refused to sleep."],
    [13, "XII · The Drowned King", "We went down to the bottom of the sea to answer the King's question."],
  );
  CAMPS.push(
    { id: "camp8", when: () => G.members.includes("nell") && G.stage >= 10, node: "camp8_0" },
    { id: "camp9", when: () => G.flags.adaVoice && G.members.includes("ada") && G.stage >= 10, node: "camp9_0" },
    { id: "camp10", when: () => G.stage >= 12, node: "camp10_0" },
  );
  Object.assign(D, {
    camp8_0: say("nell", "(Nell is carving something into the Gull's rail with her knife.) Da's name. Every captain gets carved on the rail when they die. There are nine names here. His is the tenth.", "camp8_1"),
    camp8_1: say("kest", "Do you hate him? For what he became?", "camp8_2"),
    camp8_2: say("nell", "He became what he was offered. Rest, no tolls, no Guild. That's not a monster's wish. That's a tired man's. (She puts the knife away.) I don't hate him. I hate that the only place anyone offered him equality was at the bottom of the sea."),
    camp9_0: say("ada", "(Ada writes in the dirt with a stick, because her voice is gone.) \"I used to think faith was knowing the answer.\"", "camp9_1"),
    camp9_1: say("warden", "And now?", "camp9_2"),
    camp9_2: say("ada", "(She writes slowly.) \"Now I think faith is singing when you don't. Even if all that comes out is a whisper.\" (She looks up, and smiles, and whispers the waking-words, and everyone around the fire hears them.)"),
    camp10_0: say("ilse", "(The last dry night before the Deep. Nobody is sleeping.) I keep thinking about who we've lost. Rook. " + "", "camp10_1", () => {
      const lost = (G.flags.fallen || []).map(id => HEROES[id].name); D.camp10_0.text = `(The last dry night before the Deep. Nobody is sleeping.) I keep thinking about who we've lost. ${lost.join(", ") || "Nobody, yet."} I keep thinking it should've been me. I'm the one who came for revenge.`;
    }),
    camp10_1: say("warden", "The dead do not keep ledgers, smith. Only the living do that. It was not a trade.", "camp10_2"),
    camp10_2: say("sable", "Tomorrow, whatever happens down there, we decide what the Bell is for. Not the Guild. Not the King. Us.", "camp10_3"),
    camp10_3: say("nell", "Then let's decide well. I've had enough of people deciding badly on my behalf."),
  });
  // an act for later campfire scenes to fix their text at the moment they play
  const _campScene = campScene;
  campScene = function () { if (D.camp10_0 && D.camp10_0.act) { const lost = (G.flags.fallen || []).map(id => HEROES[id].name); D.camp10_0.text = `(The last dry night before the Deep. Nobody is sleeping.) I keep thinking about who we've lost. ${lost.join(", ") || "Nobody, yet."} I keep thinking it should have been me. I'm the one who came for revenge.`; } return _campScene(); };
  const _addProp2 = addProp2;
  addProp2 = () => { _addProp2(); for (const sh of SHRINES) addProp("shrine", sh.x, sh.y - 1); addProp("whirlpool", 117, 88, { flat: true }); };
  // ---- Act II drawing, chapters IX-XII
  drawBattleBg2b = function (g, area) {
    const t = time;
    if (area === "coast") {
      g.fillStyle = "#3a5a7a"; g.fillRect(-10, 70, VIEW_W + 20, 50); g.fillStyle = "rgba(200,230,255,.3)"; for (let i = 0; i < 16; i++) g.fillRect((i * 23 + t * 10) % (VIEW_W + 20) - 10, 80 + (i % 5) * 7, 12, 1);
      g.fillStyle = "#2a1a10"; g.beginPath(); g.moveTo(20, 118); g.lineTo(40, 70); g.lineTo(100, 60); g.lineTo(110, 118); g.fill(); g.fillRect(64, 20, 3, 44); g.fillStyle = "#c8c0a8"; g.fillRect(52, 26, 22, 18);
      g.fillStyle = "#2a1a10"; g.beginPath(); g.moveTo(230, 118); g.lineTo(250, 84); g.lineTo(300, 90); g.lineTo(312, 118); g.fill();
      g.fillStyle = "#d8c89a"; g.fillRect(-10, 116, VIEW_W + 20, 90); g.fillStyle = "#c8b88a"; for (let i = 0; i < 10; i++) g.fillRect(i * 34 - 10, 126 + (i % 3) * 14, 20, 1);
      g.fillStyle = "#f2ead8"; for (const [x, y] of [[40, 150], [220, 165], [150, 138]]) { g.fillRect(x, y, 8, 2); g.fillRect(x + 2, y - 3, 3, 3); }
      return true;
    }
    if (area === "spire" || area === "spireIn") {
      if (area === "spire") { g.fillStyle = "#1a1c34"; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(i * 60 - 20, 118); g.lineTo(i * 60 + 20, 50 + (i % 3) * 14); g.lineTo(i * 60 + 60, 118); g.fill(); } g.fillStyle = "#2a3050"; g.fillRect(150, 10, 20, 108); g.fillStyle = "#3ee0e8"; g.fillRect(158, 20, 4, 6); }
      else { g.fillStyle = "#1e2440"; for (let i = 0; i < 6; i++) { g.fillRect(20 + i * 56, 16, 14, 102); g.fillStyle = "#3ee0e8"; g.fillRect(25 + i * 56, 40 + (i % 2) * 20, 4, 4); g.fillStyle = "#1e2440"; } }
      if (!REDUCED && (t % 3.3) < 0.15) { g.strokeStyle = "rgba(230,245,255,.9)"; g.lineWidth = 2; g.beginPath(); let x = 60 + (Math.floor(t) * 97) % 200, y = 0; g.moveTo(x, y); while (y < 110) { x += rand(-12, 12); y += rand(8, 16); g.lineTo(x, y); } g.stroke(); g.fillStyle = "rgba(220,240,255,.25)"; g.fillRect(-10, -10, VIEW_W + 20, VIEW_H + 20); }
      g.fillStyle = area === "spire" ? "#4a4a5a" : "#2e3658"; g.fillRect(-10, 116, VIEW_W + 20, 90); g.fillStyle = area === "spire" ? "#5a5a6a" : "#3a4468"; for (let x = -10; x < VIEW_W; x += 16) g.fillRect(x, 116, 1, 90);
      return true;
    }
    if (area === "deep") {
      g.fillStyle = "#081424"; g.fillRect(-10, -10, VIEW_W + 20, 130);
      for (let i = 0; i < 30; i++) { const a = Math.max(0, Math.sin(t * 1.5 + i)); g.fillStyle = `rgba(62,224,232,${a * 0.6})`; g.fillRect((hash(i, 3) * VIEW_W + Math.sin(t * .3 + i) * 10) | 0, (hash(i, 5) * 110) | 0, 1, 1); }
      g.fillStyle = "#1a2a4a"; for (let i = 0; i < 5; i++) { g.fillRect(24 + i * 64, 30, 16, 88); g.fillStyle = "#c8506a"; g.fillRect(20 + i * 64, 90, 6, 28); g.fillRect(36 + i * 64, 100, 5, 18); g.fillStyle = "#1a2a4a"; }
      g.fillStyle = "#e8e2d0"; for (let i = 0; i < 12; i++) g.fillRect(i * 28 + 4, 112 + (i % 3), 5, 2);
      g.fillStyle = "#142040"; g.fillRect(-10, 116, VIEW_W + 20, 90);
      g.fillStyle = "rgba(160,220,255,.4)"; for (let i = 0; i < 14; i++) { const y = 190 - ((t * 20 + i * 37) % 190); g.fillRect((i * 23) % VIEW_W, y, 2, 2); }
      return true;
    }
    if (area === "shrine") {
      g.fillStyle = "#2a2a44"; g.fillRect(-10, -10, VIEW_W + 20, 130); g.fillStyle = "#e8e2f0";
      for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(i * 50 - 10, 118); g.lineTo(i * 50 + 10, 30 + (i % 3) * 20); g.lineTo(i * 50 + 30, 118); g.fill(); }
      g.fillStyle = "#c8c0d8"; for (let i = 0; i < 20; i++) { g.fillRect((i * 37) % VIEW_W, 60 + (i * 13) % 50, 4, 5); g.fillStyle = "#2a1a1a"; g.fillRect((i * 37) % VIEW_W + 1, 62 + (i * 13) % 50, 1, 1); g.fillRect((i * 37) % VIEW_W + 3, 62 + (i * 13) % 50, 1, 1); g.fillStyle = "#c8c0d8"; }
      g.fillStyle = "#d8d0e6"; g.fillRect(-10, 116, VIEW_W + 20, 90); return true;
    }
    return false;
  };
  drawBattleMonster2b = function (g, u, cx, cy, R, drip, tri, hurt) {
    const t = time, sp = u.sprite;
    if (sp === "eel") {
      for (let i = 0; i < 12; i++) { const x = Math.sin(t * 3 + i * 0.6 + cx) * 12, y = -10 - i * 5; R(x - 5, y - 3, 10, 6, "#1b1633"); R(x - 4, y - 2, 8, 4, i % 2 ? "#3a4a3a" : "#4a5a4a"); R(x - 4, y - 2, 8, 1, "#6a7a5a"); }
      const hx = Math.sin(t * 3 + 7.2 + cx) * 12;
      R(hx - 8, -76, 16, 14, "#1b1633"); R(hx - 7, -75, 14, 12, "#4a5a4a");
      g.fillStyle = hurt ? "#fff" : "#8a1a2a"; g.beginPath(); g.arc(cx + hx, cy - 69, 6, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; R(hx + Math.cos(a) * 5, -69 + Math.sin(a) * 5, 1, 1, "#f2ead8"); }
      R(hx - 2, -71, 4, 4, "#2a0a0a"); drip(hx - 3, -64, 10); drip(hx + 3, -64, 8);
      return;
    }
    if (sp === "maw") {
      const b = Math.round(Math.sin(t * 1.3) * 2);
      R(-24, -82 + b, 48, 76, "#1b1633"); R(-23, -81 + b, 46, 74, "#3a2a24"); for (let i = 0; i < 6; i++) R(-23 + i * 8, -60 + b + (i % 2) * 6, 3, 50, "#2a1a14");
      R(-18, -70 + b, 36, 30, "#8aa090"); for (const [x, y] of [[-12, -64], [4, -58], [-6, -48]]) { R(x, y + b, 8, 5, "#5a0f18"); R(x + 2, y + b + 5, 2, 4, "#6b0f1d"); }
      R(-4, -70 + b, 8, 34, "#6a7a6a"); for (let i = 0; i < 5; i++) R(-3, -68 + i * 7 + b, 6, 3, "#8a8aa0");
      R(-13, -104 + b, 26, 24, "#1b1633"); R(-12, -103 + b, 24, 22, "#8aa090"); R(-12, -103 + b, 24, 4, "#6a7a6a");
      R(-8, -96 + b, 6, 5, "#0a0a0a"); R(3, -96 + b, 6, 5, "#0a0a0a");
      for (const ex of [-5, 6]) { const w = Math.sin(t * 5 + ex) * 3; R(ex - 1 + w, -94 + b, 2, 8, "#3a4a3a"); R(ex - 2 + w, -88 + b, 4, 3, "#4a5a4a"); R(ex - 1 + w, -87 + b, 1, 1, "#c8102e"); }
      R(-8, -86 + b, 16, 5, "#2a0a0a"); for (let i = 0; i < 6; i++) R(-7 + i * 3, -86 + b, 1, 2, "#c8c0a8");
      R(-9, -82 + b, 18, 8, "#3a4a3a"); for (let i = 0; i < 5; i++) R(-8 + i * 4, -74 + b, 2, 6 + (i % 2) * 4, "#3a4a3a");
      R(-22, -114 + b, 44, 8, "#1b1633"); R(-20, -113 + b, 40, 6, "#2a1a14"); R(-12, -120 + b, 24, 8, "#2a1a14"); R(-20, -108 + b, 40, 1, "#c9a227"); R(-2, -118 + b, 4, 4, "#e8e2d0");
      R(26, -70 + b, 8, 30, "#3a2a24"); R(32, -92 + b, 3, 70, "#5a5a6a"); R(24, -30 + b, 20, 4, "#5a5a6a"); R(22, -34 + b, 4, 6, "#5a5a6a"); R(40, -34 + b, 4, 6, "#5a5a6a"); R(28, -96 + b, 10, 4, "#5a5a6a");
      R(-2, -6, 4, 12, "#5a5a6a"); for (let i = 0; i < 3; i++) R(-3, 2 + i * 4, 6, 2, "#6a6a7a");
      R(-34, -70 + b, 8, 28, "#3a2a24"); R(-36, -44 + b, 10, 8, "#8aa090");
      drip(-14, -40 + b, 14, "#3a8fbf"); drip(12, -44 + b, 12); drip(-4, -80 + b, 8, "#3a8fbf"); drip(34, -24 + b, 10, "#3a8fbf");
      if (u.charged) { g.strokeStyle = `rgba(58,143,191,${0.5 + Math.sin(t * 10) * 0.3})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy - 60, 40, 0, Math.PI * 2); g.stroke(); }
      return;
    }
    if (sp === "colossus") {
      const b = Math.round(Math.sin(t * 0.9) * 2);
      R(-40, -96 + b, 80, 90, "#1b1633"); R(-38, -94 + b, 76, 86, "#d8d0e6"); R(20, -94 + b, 18, 86, "#b8b0c8");
      for (let i = 0; i < 26; i++) { const x = -34 + (i * 13) % 64, y = -88 + Math.floor(i * 13 / 64) * 14 + b, mo = Math.round(Math.sin(t * 2 + i) + 1); R(x, y, 7, 8, "#e8e2f0"); R(x + 1, y + 2, 2, 2, "#2a1a1a"); R(x + 4, y + 2, 2, 2, "#2a1a1a"); R(x + 2, y + 5, 3, mo, "#5a0f18"); }
      R(-20, -120 + b, 40, 26, "#1b1633"); R(-18, -118 + b, 36, 24, "#e8e2f0"); R(-12, -110 + b, 8, 6, "#3ee0e8"); R(4, -110 + b, 8, 6, "#3ee0e8"); R(-8, -100 + b, 16, 3, "#2a1a1a");
      tri(-22, -140 + b, 10, 22, "#9ef0f5"); tri(-4, -146 + b, 10, 28, "#9ef0f5"); tri(14, -138 + b, 10, 20, "#9ef0f5");
      for (const [x] of [[-58], [40]]) { R(x, -86 + b, 18, 50, "#d8d0e6"); R(x - 2, -38 + b, 22, 18, "#c8c0d8"); for (let i = 0; i < 3; i++) R(x + i * 6, -22 + b, 4, 6, "#c8c0d8"); }
      R(-30, -8, 20, 8, "#1b1633"); R(10, -8, 20, 8, "#1b1633");
      drip(-20, -40 + b, 12); drip(10, -30 + b, 14); drip(28, -60 + b, 10);
      if (u.charged) { g.fillStyle = "rgba(232,226,240,.3)"; g.fillRect(cx - 70, cy - 150, 140, 150); }
      return;
    }
    if (sp === "harpy") {
      const b = Math.round(Math.sin(t * 6 + cx) * 4), fl = Math.sin(t * 10 + cx) * 10;
      g.fillStyle = hurt ? "#fff" : "#3a3a5a"; g.beginPath(); g.moveTo(cx - 6, cy - 50 + b); g.lineTo(cx - 40, cy - 60 + b + fl); g.lineTo(cx - 30, cy - 40 + b); g.fill(); g.beginPath(); g.moveTo(cx + 6, cy - 50 + b); g.lineTo(cx + 40, cy - 60 + b + fl); g.lineTo(cx + 30, cy - 40 + b); g.fill();
      R(-7, -56 + b, 14, 22, "#1b1633"); R(-6, -55 + b, 12, 20, "#8a7a9a"); R(-5, -68 + b, 10, 12, "#c8a8a0"); R(-6, -70 + b, 12, 5, "#e8e2f0");
      R(-3, -63 + b, 2, 2, "#3ee0e8"); R(1, -63 + b, 2, 2, "#3ee0e8"); R(-2, -59 + b, 4, 2, "#5a0f18");
      R(-6, -34 + b, 3, 8, "#3a3a2a"); R(3, -34 + b, 3, 8, "#3a3a2a"); for (let i = 0; i < 3; i++) { R(-8 + i * 2, -26 + b, 1, 3, "#e8e2d0"); R(3 + i * 2, -26 + b, 1, 3, "#e8e2d0"); }
      drip(-4, -24 + b, 10); drip(4, -24 + b, 8);
      return;
    }
    if (sp === "spark") {
      const b = Math.sin(t * 7 + cx) * 4;
      for (let i = 0; i < 6; i++) { const a = t * 4 + i; g.strokeStyle = `rgba(158,240,245,${0.6})`; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy - 40 + b); g.lineTo(cx + Math.cos(a) * 22, cy - 40 + b + Math.sin(a) * 22); g.stroke(); }
      g.fillStyle = hurt ? "#fff" : "#e8ffff"; g.beginPath(); g.arc(cx, cy - 40 + b, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#3ee0e8"; g.beginPath(); g.arc(cx, cy - 40 + b, 6, 0, Math.PI * 2); g.fill();
      R(-4, -43 + b, 2, 2, "#0a1a3a"); R(2, -43 + b, 2, 2, "#0a1a3a"); R(-3, -38 + b, 6, 1, "#0a1a3a");
      return;
    }
    if (sp === "vela") {
      const b = Math.round(Math.sin(t * 1.6) * 3), p2 = u.phase2;
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.3, len = 30 + Math.sin(t * 6 + i) * 8; g.strokeStyle = p2 ? "rgba(255,120,120,.8)" : "rgba(158,240,245,.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy - 100 + b); let x = cx, y = cy - 100 + b; for (let k = 0; k < 4; k++) { x += Math.cos(a) * len / 4 + rand(-3, 3); y += Math.sin(a) * len / 4; g.lineTo(x, y); } g.stroke(); }
      R(-14, -86 + b, 28, 70, "#1b1633"); R(-13, -85 + b, 26, 68, "#2a3a6a"); for (let i = 0; i < 5; i++) R(-13 + i * 6, -30 + b, 4, 18 + (i % 2) * 8, "#2a3a6a");
      R(-8, -104 + b, 16, 18, "#1b1633"); R(-7, -103 + b, 14, 16, "#b8b0c8"); R(-5, -97 + b, 4, 3, "#f4f0ff"); R(1, -97 + b, 4, 3, "#f4f0ff"); R(-3, -91 + b, 6, 1, "#5a0f18");
      R(-9, -106 + b, 18, 4, "#e8e4f0"); R(-10, -102 + b, 3, 20, "#e8e4f0"); R(7, -102 + b, 3, 20, "#e8e4f0");
      R(-26, -80 + b, 12, 4, "#2a3a6a"); R(14, -80 + b, 12, 4, "#2a3a6a"); R(-28, -80 + b, 3, 3, "#b8b0c8"); R(25, -80 + b, 3, 3, "#b8b0c8");
      g.fillStyle = "rgba(158,240,245,.7)"; g.beginPath(); g.arc(cx + 28, cy - 80 + b, 4 + Math.sin(t * 8) * 2, 0, Math.PI * 2); g.fill();
      drip(-4, -88 + b, 6, "#3ee0e8"); drip(3, -88 + b, 8, "#3ee0e8");
      if (u.charged) { g.strokeStyle = `rgba(232,255,255,${0.5 + Math.sin(t * 12) * 0.4})`; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy - 70, 46 + Math.sin(t * 9) * 4, 0, Math.PI * 2); g.stroke(); }
      return;
    }
    if (sp === "angler") {
      const b = Math.sin(t * 1.5 + cx) * 3;
      g.fillStyle = hurt ? "#fff" : "#1b1633"; g.beginPath(); g.ellipse(cx, cy - 34 + b, 34, 26, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#2a3a4a"; g.beginPath(); g.ellipse(cx, cy - 34 + b, 32, 24, 0, 0, Math.PI * 2); g.fill();
      R(-26, -30 + b, 52, 20, "#0a0a14"); for (let i = 0; i < 12; i++) { R(-24 + i * 4, -30 + b, 2, 6 + (i % 3) * 3, "#e8e2d0"); R(-24 + i * 4, -16 + b - (i % 2) * 3, 2, 6, "#e8e2d0"); }
      R(12, -48 + b, 8, 8, "#e8e2d0"); R(15, -45 + b, 3, 3, "#0a0a0a");
      g.strokeStyle = "#3a4a5a"; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 4, cy - 56 + b); g.quadraticCurveTo(cx - 10, cy - 90 + b, cx - 30, cy - 80 + b); g.stroke();
      const a = 0.6 + Math.sin(t * 3) * 0.3, gr = g.createRadialGradient(cx - 30, cy - 78 + b, 1, cx - 30, cy - 78 + b, 18); gr.addColorStop(0, `rgba(158,255,220,${a})`); gr.addColorStop(1, "rgba(158,255,220,0)"); g.fillStyle = gr; g.fillRect(cx - 50, cy - 98 + b, 40, 40);
      R(-33, -81 + b, 6, 6, "#d8ffe8");
      drip(-10, -12 + b, 10); drip(10, -12 + b, 8);
      return;
    }
    if (sp === "king") {
      const b = Math.round(Math.sin(t * 1.1) * 3), p2 = u.phase2, p3 = u.phase3;
      // a body made of bodies
      for (let i = 0; i < 40; i++) {
        const row = Math.floor(i / 8), col = i % 8, x = -44 + col * 11 + (row % 2) * 5, y = -40 - row * 16 + b, w = Math.sin(t * 1.5 + i) * 1.5;
        R(x + w, y, 10, 15, "#1b1633"); R(x + w + 1, y + 1, 8, 13, i % 3 ? "#6a8a9a" : "#5a7a8a"); R(x + w + 2, y + 2, 5, 5, "#8ab0b8"); R(x + w + 3, y + 3, 1, 1, "#0a1a2a"); R(x + w + 5, y + 3, 1, 1, "#0a1a2a"); R(x + w + 3, y + 5, 3, 1, "#2a0a1a");
      }
      for (const [x, d] of [[-70, 1], [52, -1]]) { R(x, -110 + b, 18, 60, "#5a7a8a"); for (let i = 0; i < 5; i++) R(x + (d > 0 ? -2 : 16) + i * 0 , -56 + b + i * 3, 4, 2, "#8ab0b8"); for (let i = 0; i < 5; i++) R(x + i * 4, -50 + b, 3, 10, "#8ab0b8"); }
      R(-16, -134 + b, 32, 30, "#1b1633"); R(-15, -133 + b, 30, 28, "#c8d8e0"); R(-15, -133 + b, 30, 3, "#e8f0f4");
      R(-10, -124 + b, 7, 4, "#f4f8ff"); R(3, -124 + b, 7, 4, "#f4f8ff"); R(-7, -124 + b, 3, 4, p3 ? "#ff3a3a" : "#3ee0e8"); R(6, -124 + b, 3, 4, p3 ? "#ff3a3a" : "#3ee0e8");
      R(-2, -118 + b, 4, 6, "#a8b8c0"); R(-6, -110 + b, 12, 2, "#5a3a4a"); R(-12, -128 + b, 6, 1, "#5a6a7a"); R(6, -128 + b, 6, 1, "#5a6a7a");
      for (let i = 0; i < 9; i++) { const x = -18 + i * 4, h = 10 + (i % 2) * 6; R(x, -134 - h + b, 3, h, "#8ab0b8"); R(x, -134 - h + b, 3, 2, "#c8d8e0"); for (let k = 0; k < 2; k++) R(x - 1 + k * 3, -134 - h - 2 + b, 1, 3, "#8ab0b8"); }
      if (p2) for (const [x, h] of [[-40, 30], [34, 26], [-58, 20], [50, 22]]) { tri(x, -150 + b, 10, h, "#3a8fbf"); }
      drip(-30, -20 + b, 14, "#3a8fbf"); drip(20, -30 + b, 16, "#3a8fbf"); drip(-4, -104 + b, 12); drip(40, -60 + b, 10, "#3a8fbf"); drip(-50, -50 + b, 12);
      if (u.charged) { g.strokeStyle = `rgba(158,240,245,${0.5 + Math.sin(t * 10) * 0.4})`; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy - 80, 70 + Math.sin(t * 6) * 5, 0, Math.PI * 2); g.stroke(); }
      return;
    }
  };
  drawFieldMonster2b = function (g, f, lead, x, y, bobv) {
    const P = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
    if (lead === "eel") { for (let i = 0; i < 5; i++) P(Math.round(Math.sin(f.t * 4 + i) * 3) - 2, -4 - i * 3 - bobv, 5, 3, i % 2 ? "#3a4a3a" : "#4a5a4a"); P(-3, -21 - bobv, 6, 5, "#8a1a2a"); P(-1, -19 - bobv, 2, 2, "#2a0a0a"); return true; }
    if (lead === "harpy") { const fl = Math.round(Math.sin(f.t * 12) * 3); P(-10, -18 - bobv + fl, 7, 2, "#3a3a5a"); P(3, -18 - bobv + fl, 7, 2, "#3a3a5a"); P(-3, -20 - bobv, 6, 10, "#8a7a9a"); P(-2, -25 - bobv, 4, 5, "#c8a8a0"); P(-1, -23 - bobv, 1, 1, "#3ee0e8"); return true; }
    if (lead === "spark") { g.fillStyle = "rgba(158,240,245,.5)"; g.beginPath(); g.arc(x, y - 14 - bobv, 7, 0, Math.PI * 2); g.fill(); P(-3, -17 - bobv, 6, 6, "#e8ffff"); return true; }
    if (lead === "angler") { P(-8, -12 - bobv, 16, 10, "#1b1633"); P(-7, -11 - bobv, 14, 8, "#2a3a4a"); P(-6, -7 - bobv, 12, 2, "#e8e2d0"); P(-10, -20 - bobv, 3, 3, "#d8ffe8"); return true; }
    return false;
  };
  drawMiniBoss2b = function (g, x, y, kind) {
    const fl = Math.round(Math.sin(time * 2)), P = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
    if (kind === "maw") { P(-8, -28 + fl, 16, 28, "#1b1633"); P(-7, -27 + fl, 14, 26, "#3a2a24"); P(-5, -34 + fl, 10, 8, "#8aa090"); P(-3, -32 + fl, 2, 2, "#0a0a0a"); P(1, -32 + fl, 2, 2, "#0a0a0a"); P(-8, -38 + fl, 16, 3, "#2a1a14"); P(9, -30 + fl, 2, 30, "#5a5a6a"); return true; }
    if (kind === "vela") { const b = Math.round(Math.sin(time * 1.6) * 2); P(-5, -30 + b, 10, 22, "#2a3a6a"); P(-3, -36 + b, 6, 6, "#b8b0c8"); P(-4, -38 + b, 8, 2, "#e8e4f0"); g.strokeStyle = "rgba(158,240,245,.8)"; g.beginPath(); g.moveTo(x, y - 38 + b); g.lineTo(x - 4, y - 46 + b); g.moveTo(x, y - 38 + b); g.lineTo(x + 5, y - 47 + b); g.stroke(); return true; }
    if (kind === "king") { for (let i = 0; i < 12; i++) P(-12 + (i % 4) * 6, -12 - Math.floor(i / 4) * 8 + fl, 6, 8, i % 2 ? "#6a8a9a" : "#5a7a8a"); P(-5, -38 + fl, 10, 9, "#c8d8e0"); for (let i = 0; i < 5; i++) P(-5 + i * 2, -42 + fl, 1, 4, "#8ab0b8"); P(-3, -35 + fl, 2, 2, "#3ee0e8"); P(1, -35 + fl, 2, 2, "#3ee0e8"); return true; }
    return false;
  };
  act2ActorsB = function (actors, ox, oy) {
    const f = G.flags;
    if (G.stage === 9 && f.partsQuest) PARTS.forEach((pt, i) => { if (!(f.parts || []).includes(i)) actors.push({ y: pt.y * TILE, draw: () => drawSparkle(g, pt.x * TILE + 8 - ox, pt.y * TILE + 8 - oy, "#ffcf4a") }); });
    if (G.stage >= 9 && !f.mawDead) actors.push({ y: 61 * TILE + 8, draw: () => drawMiniBoss(g, 111 * TILE + 8 - ox, 61 * TILE + 8 - oy, "maw") });
    if (G.stage >= 9 && !f.velaDead) actors.push({ y: 4 * TILE + 8, draw: () => drawMiniBoss(g, 118 * TILE + 8 - ox, 4 * TILE + 8 - oy, "vela") });
    if (G.stage >= 9 && !f.kingDead) actors.push({ y: 39 * TILE + 8, draw: () => drawMiniBoss(g, 89 * TILE + 8 - ox, 39 * TILE + 8 - oy, "king") });
  };

