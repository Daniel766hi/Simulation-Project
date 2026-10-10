  // ================================================================== THE HOLLOW BENEATH (optional dungeon) and THE TRUTH PATH
  Object.assign(MONSTERS, {
    saltworm: { name: "Salt Worm", hp: 70, atk: 17, def: 6, spd: 6, xp: 46, coin: [5, 10], sprite: "leech",
      pal: { "#6b2a5a": "#d8d0c0", "#7d3468": "#e8e2d0", "#a0508a": "#f4f0e8", "#5a0f18": "#8a1020", "#c8102e": "#9ef0f5" },
      moves: [{ name: "Burrowing Bite", w: 3, power: 1.2, bleed: [3, 3] }, { name: "Salt Spray", w: 1, power: 0.7, all: true, weakAll: 2 }] },
    minerghoul: { name: "Drowned Miner", hp: 62, atk: 18, def: 5, spd: 7, xp: 48, coin: [8, 14], sprite: "ghoul",
      pal: { "#e8e2f0": "#8a8aa0", "#d8d0e6": "#7a7a90", "#a3242e": "#3a4a5a", "#f2ead8": "#ffcf6a" },
      moves: [{ name: "Pickaxe", w: 3, power: 1.35, bleed: [3, 2] }, { name: "Cave-in", w: 1, power: 0.8, all: true, stunChance: 0.2 }] },
    sluicer: { name: "Sluice Engine", hp: 110, atk: 19, def: 11, spd: 3, xp: 64, coin: [12, 20], sprite: "clerk",
      pal: { "#8a6a2a": "#6a4a3a", "#a88a3a": "#8a5a3a", "#c9a227": "#a86a3a", "#e8e2d0": "#3a8fbf", "#ff6b3a": "#9ef0f5", "#d9a070": "#9a8a7a" },
      moves: [{ name: "Floodgate", w: 3, power: 1.1, all: true }, { name: "Crush", w: 2, power: 1.5, stunChance: 0.25 }] },
    corvin: { name: "Corvin, the First Guildmaster", hp: 760, atk: 20, def: 10, spd: 6, xp: 480, coin: [200, 200], sprite: "corvin", boss: true, music: "boss", tall: true,
      moves: [{ name: "Ledger of Debts", w: 3, power: 1.3, weakAll: 2 }, { name: "Open the Sluice", w: 2, power: 1.0, all: true, bleed: [4, 2] },
              { name: "Salt Preservation", w: 1, guard: true, heal: 40 }, { name: "Forty Thousand", w: 0, charge: true, power: 1.7, all: true },
              { name: "Call the Paid", w: 0, summonKind: "minerghoul", summonText: "Corvin rings a coin against his crystal throne. The miners he paid double crawl out of the walls." }] },
  });
  Object.assign(BESTIARY, {
    saltworm: "They eat salt, and whatever the salt has preserved.", minerghoul: "Miners paid double to dig the sluice. They never came back up to spend it.",
    sluicer: "The machine that opened the sea onto forty thousand people. Still trying to finish the job.",
    corvin: "The first Guildmaster. He ate salt for four hundred years so he would never rot, and never had to answer for anything.",
  });
  Object.assign(RELICS, { corvinseal: { name: "Corvin's Seal", from: "corvin", desc: "+4 attack, +20% coin from battles. It feels heavier than it is.", atk: 4, coinBonus: 0.2 } });
  const _chooseIntent2b = chooseIntent2b;
  chooseIntent2b = function (f, find) {
    if (f.id === "corvin") { if (f.hp < f.maxHp * 0.6 && !f.summoned) { f.summoned = true; return { ...find("summonKind") }; } if (battle.round % 4 === 0) return find("charge"); }
    if (f.id === "king" && f.noSummon) { if (!f.summoned) f.summoned = true; if (f.hp < f.maxHp * 0.5 && !f.phase2) { f.phase2 = true; return { ...find("bleedAll"), announce: "The King rises one last time, not as a flood, but as a man with a sword." }; } if (f.phase2 && battle.round % 3 === 0) return find("charge"); return null; }
    return _chooseIntent2b(f, find);
  };
  FIELD.push(
    { id: "h1", x: 140, y: 12, group: ["saltworm", "saltworm"], minStage: 9, dark: true }, { id: "h2", x: 150, y: 11, group: ["minerghoul", "saltworm"], minStage: 9, dark: true },
    { id: "h3", x: 158, y: 8, group: ["minerghoul", "minerghoul"], minStage: 9, dark: true }, { id: "h4", x: 152, y: 26, group: ["sluicer"], minStage: 9, dark: true },
    { id: "h5", x: 140, y: 32, group: ["minerghoul", "sluicer"], minStage: 9, dark: true }, { id: "h6", x: 140, y: 44, group: ["saltworm", "minerghoul", "saltworm"], minStage: 9, dark: true },
  );
  npc2({ id: "tamsin", name: "Old Tamsin", x: 137, y: 12, look: { robe: "#5a5a6a", hair: "#bfb8a8", skin: "#9ab8c8", glowEyes: true, style: { hair: "cap", coat: true } }, show: () => G.stage >= 9 });
  npc2({ id: "foreman", name: "A salt-preserved foreman", x: 150, y: 23, look: { robe: "#6a5a4a", hair: "#3a2a1e", skin: "#d8d0c0", dead: true }, show: () => G.stage >= 9 });
  SPEAKERS.tamsin = "Old Tamsin"; SPEAKERS.foreman = "The foreman's diary"; SPEAKERS.corvin = "Corvin, the First Guildmaster";
  LORE.push(
    { id: 16, x: 146, y: 3, title: "A Miner's Tally", text: "Scratched into the salt, rows and rows of marks. At the end: \"Double pay for the channel. Nobody asks what the channel is for. I have six children. I don't ask either.\"" },
    { id: 17, x: 158, y: 31, title: "The Sluice Plaque", text: "Brass, polished even now: \"THE ORU IRRIGATION WORKS. PROGRESS FOR THE VALLEY. COMMISSIONED BY GUILDMASTER CORVIN.\" Someone has scratched underneath, with a knife: \"40,000.\"" },
    { id: 18, x: 140, y: 44, title: "Corvin's Motto", text: "Carved over the vault door: \"THE FUTURE IS ALWAYS PAID FOR BY SOMEONE. WISDOM IS CHOOSING WHO.\"" },
    { id: 19, x: 163, y: 51, title: "Aurel's Last Letter", text: "Kept in Corvin's vault, never delivered: \"To the Guild: I will not sell the lowlands. My people's dead are buried there, and the dead do not move for money. Do what you will. I will not leave them. Aurel.\"" },
  );
  Object.assign(D, {
    well_mines: say("warden", "(The Warden stops at the edge of the pool. The rains have shifted the water, and salt steps spiral down into the dark.) I remember men going down these steps with lanterns. I remember the lanterns coming back up. Not always the men.", "well_mines2"),
    well_mines2: { who: null, text: "A cold wind rises from the stairs, smelling of salt and old water.", choices: [
      { t: "Open the way down.", go: null, act: () => { G.flags.minesOpen = true; applyWorldState(); toast("The Hollow Beneath is open: the salt steps by the Well of Nine."); save(); updateHud(); } },
      { t: "Not yet.", go: null } ] },
    tamsin_0: say("tamsin", "(A miner's ghost sits on an upturned cart, turning a coin over and over.) Visitors. Living ones. We don't get many. Corvin paid us double, you know. Double, to dig a channel from the old sea, down to the lowlands where the King's people farmed.", "tamsin_1"),
    tamsin_1: say("tamsin", "We thought it was irrigation. That's what the plaque says. The night he opened the sluice, we were up top, drinking the double pay. We heard it from up there. Forty thousand people. We heard it and we kept drinking. What else was there to do?", "tamsin_2"),
    tamsin_2: { who: "tamsin", text: "Some of us came back down to close it. We never got back up. Tell me, courier: are we murderers, or just men who needed the money?", choices: [
      { t: "\"Both. That's what makes it terrible.\"", go: "tamsin_a" },
      { t: "\"You came back down. That matters.\"", go: "tamsin_b" } ] },
    tamsin_a: say("tamsin", "Both. Yes. I've had four hundred years to think it over and 'both' is the only answer that doesn't slip off. Corvin's down in the vault, at the bottom. He never rotted. He ate the salt. Go and ask him if he thinks it's both.", null, () => { G.flags.minesLore = true; save(); }),
    tamsin_b: say("tamsin", "It matters to me. I don't know if it matters to them. Corvin's down in the vault, at the bottom. He never rotted. He ate the salt. Go and ask him what he thinks matters.", null, () => { G.flags.minesLore = true; save(); }),
    tamsin_after: say("tamsin", "You found his ledger? Then the truth is up there now, in the light. Maybe we can rest. Maybe we just get to stop pretending."),
    foreman_0: say("foreman", "Clutched in the salt-stiff hands of a foreman: \"Corvin says the lowlands will be 'freed for development'. King Aurel will not sell, so the water will buy it. Corvin says in a hundred years no one will remember, and in two hundred they will thank us for the high ground. God help me, I think he's right.\""),
    corvin_scene: say("corvin", "(In the vault, a man sits on a throne of salt crystal. His skin is white and hard as a statue's, his eyes wet and alive. Ledgers are stacked to the ceiling.) Visitors. The first in two centuries. Please, don't be alarmed. I ate the salt so I would never rot. It has worked, mostly.", "corvin_scene2"),
    corvin_scene2: say("corvin", "You've come about the sluice. Everyone who comes down here has. Let me save you the speech: yes. I opened it. Forty thousand people, give or take. Aurel would not sell the lowlands, so the sea bought them for me, and I bought the sea for a very reasonable price.", "corvin_scene3"),
    corvin_scene3: say("corvin", "Look at what grew on that ground. Oru. Kessa. Your roads, your wells, your Bell. Every one of you lives on my high ground, courier. The future is always paid for by someone. I simply chose who. Who are you to judge a price you have already spent?", "corvin_scene4"),
    corvin_scene4: { who: "sable", text: "(Behind you, your companions are silent.)", choices: [
      { t: "\"We didn't choose the price. You did. We're choosing to tell the truth about it.\"", go: "corvin_fight" },
      { t: "\"A future built on a mass grave is still a mass grave.\"", go: "corvin_fight" } ] },
    corvin_fight: say("corvin", "Truth. How expensive. Very well: let us see what the truth costs you.", null, () => startBattle(["corvin", "sluicer"], { boss: "corvin", area: "cathedral" })),
    corvin_after: say("corvin", "(Corvin's crystal skin cracks, and for the first time in four hundred years, he begins to rot. He looks relieved.) Ah. So that's what it feels like. ...The ledger is on the desk. Every name. Every payment. I kept perfect accounts. It was the only honest thing I ever did.", null, () => { G.flags.corvinDead = true; G.flags.corvinLedger = true; toast("You take Corvin's true ledger. Mayor Ines should see this."); save(); updateHud(); }),
    ines_ledger: say("ines", "(Ines reads Corvin's ledger in silence. It takes a long time. When she looks up, she looks older.) Then Oru was built on a massacre. Every stone. My office. The granaries. The gate your captain guarded.", "ines_ledger2"),
    ines_ledger2: say("ines", "We can't give forty thousand people back. We can't give back the lowlands. But we can say it. In writing, out loud, with our names on it. The city of Oru owes an apology to the drowned, four hundred years late.", "ines_ledger3"),
    ines_ledger3: { who: "ines", text: "(She writes, crosses out, writes again, and signs.) Nadia will sign for Kessa. Oskar for Reedholm. Carry it down to the King, courier. It's the most important letter you will ever deliver.", choices: [
      { t: "\"Courier's honour.\"", go: null, act: () => { G.flags.apology = true; G.flags.carry = [...(G.flags.carry || []), "apology"]; toast("You carry the Apology of Oru, signed by Ines, Nadia and Oskar."); Music.sound("item"); save(); updateHud(); } } ] },
    king_apology: say(null, "You unfold the Apology of Oru and read it aloud at the bottom of the sea: the sluice, the forty thousand, Corvin's ledger, the Bell made into a lock. And at the end, three names: Ines of Oru. Nadia of Kessa. Oskar of Reedholm. 'We are sorry. We should have said it four hundred years ago.'", "king_apology2"),
    king_apology2: say("king", "(The great shape of drowned bodies goes very still. The young face in its centre is weeping, though the tears are only seawater among seawater.) Four hundred years I asked who would sing for the ones below. I never thought to ask who would say sorry to them.", "king_apology3"),
    king_apology3: say("king", "It changes nothing. The dead are dead. The lowlands are sea. And it changes everything. ...I will sleep. But let me die on my feet first, as a king, with a sword in my hand, and not as a flood. Grant me that, courier. One honest fight.", null, () => { G.flags.apologyRead = true; G.flags.carry = (G.flags.carry || []).filter(x => x !== "apology"); G.flags.delivered = [...(G.flags.delivered || []), "apology"]; startBattle(["king"], { boss: "king", area: "deep", apology: true }); }),
    king_after_ap: say("king", "(The King lowers his sword. The bodies woven into him loosen and drift upward, one by one, gently, toward a surface they can see now.) Thank you. That was the first living thing I have felt in four centuries. Carve my name somewhere. Not on a throne. Somewhere people walk.", "king_after_ap2"),
    king_after_ap2: say(null, "The Drowned King closes his eyes. The palace does not collapse. The sea above simply exhales, like someone who has held their breath for four hundred years, and lets you go.", "king_after_ap3"),
    king_after_ap3: say("ren", "(Ren lowers his shield, blinking.) ...No door to hold. Huh. I had a whole speech ready. (He laughs, and it comes out shaky.) I'll save it. I think I'd like to be alive for a while, courier.", "final_choice"),
  });
  // the fourth ending, and the King's fourth answer
  D.final_choice.choices.splice(1, 0, { t: "Carve his name above the gate of Oru, ring the Bell for everyone, and let the last King sleep.", go: null, act: () => ending("sleep"), req: () => G.flags.apologyRead, reqText: "the truth said aloud" });
  D.king_scene4.choices.push({ t: "Read him the Apology of Oru.", go: "king_apology", req: () => G.flags.apology, reqText: "the Apology of Oru" });
  const _startBattle2 = startBattle;
  startBattle = function (group, opts = {}) { const r = _startBattle2(group, opts); if (opts.apology && battle) { const k = battle.foes[0]; k.maxHp = k.hp = Math.round(k.maxHp * 0.5); k.noSummon = true; } return r; };
  const _act2BossEndB2 = act2BossEndB;
  act2BossEndB = function (boss) {
    if (boss === "king" && G.flags.apologyRead) { G.flags.kingDead = true; save(); setTimeout(() => openDialog("king_after_ap"), 300); return; }
    _act2BossEndB2(boss);
    if (boss === "corvin") setTimeout(() => openDialog("corvin_after"), 300);
  };
  const _ending = ending;
  ending = function (kind) {
    if (kind !== "sleep") return _ending(kind);
    _ending("ring");
    setScene("The Last King Sleeps");
    $("cardTitle").textContent = "The Last King Sleeps";
    $("cardText").textContent = "The Bell rings three times at the bottom of the sea, and this time it is a lullaby and an apology at once. King Aurel sleeps. Above the gate of Oru, where the Guild's crest used to be, the people carve a new name: AUREL, WHO WOULD NOT LEAVE HIS DEAD. Beneath it, the three signatures of the apology, and beneath those, room for more. The gates stay open. Ren lives to stand beside them, and never closes them again. " + $("cardText").textContent.split(". ").slice(-6).join(". ");
  };
  // mines interactions and triggers
  const _interactAct2b = interactAct2b;
  interactAct2b = function () {
    if (G.stage >= 9 && !G.flags.minesOpen && near({ x: 36 * TILE + 8, y: 28 * TILE + 8 }, 34) && G.members.includes("warden")) { openDialog("well_mines"); return true; }
    return _interactAct2b();
  };
  const _act2Triggers2 = act2Triggers;
  act2Triggers = function () {
    _act2Triggers2();
    if (G.stage >= 9 && !G.flags.corvinDead && near({ x: 155 * TILE + 8, y: 45 * TILE + 8 }, 48)) once("corvinPrompt", () => openDialog("corvin_scene"));
    if (G.stage >= 9 && !G.flags.minesOpen && !G.flags.wellHint && G.members.includes("warden") && near({ x: 36 * TILE + 8, y: 28 * TILE + 8 }, 40)) { G.flags.wellHint = true; openDialog("well_mines"); }
    updateWanderers();
  };
  const _act2ActorsB2 = act2ActorsB;
  act2ActorsB = function (actors, ox, oy) {
    _act2ActorsB2(actors, ox, oy);
    if (G.stage >= 9 && !G.flags.corvinDead) actors.push({ y: 45 * TILE + 8, draw: () => drawMiniBoss(g, 155 * TILE + 8 - ox, 45 * TILE + 8 - oy, "corvin") });
  };
  const _drawMiniBoss2b = drawMiniBoss2b;
  drawMiniBoss2b = function (g, x, y, kind) {
    if (kind === "corvin") { const P = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); }; P(-10, -6, 20, 6, "#9ef0f5"); P(-7, -26, 14, 20, "#e8e2f0"); P(-5, -34, 10, 8, "#f4f0ff"); P(-3, -31, 2, 2, "#8a1020"); P(1, -31, 2, 2, "#8a1020"); P(-12, -30, 3, 24, "#9ef0f5"); P(9, -32, 3, 26, "#9ef0f5"); return true; }
    return _drawMiniBoss2b(g, x, y, kind);
  };
  const _drawBattleMonster2b = drawBattleMonster2b;
  drawBattleMonster2b = function (g, u, cx, cy, R, drip, tri, hurt) {
    if (u.sprite !== "corvin") return _drawBattleMonster2b(g, u, cx, cy, R, drip, tri, hurt);
    const t = time, b = Math.round(Math.sin(t * 0.8) * 1);
    R(-40, -26, 80, 26, "#1b1633"); R(-38, -24, 76, 22, "#9ef0f5"); for (let i = 0; i < 7; i++) tri(-38 + i * 11, -44, 10, 22, "#c8f8fa");
    R(-16, -84 + b, 32, 60, "#1b1633"); R(-15, -83 + b, 30, 58, "#e8e2f0"); for (let i = 0; i < 6; i++) R(-13, -78 + i * 9 + b, 26, 1, "#c8c2d8");
    R(-13, -70 + b, 26, 18, "#2a2238"); R(-11, -68 + b, 22, 14, "#c9a227"); for (let i = 0; i < 4; i++) R(-9, -66 + i * 3 + b, 18, 1, "#8a6a2a");
    R(-11, -104 + b, 22, 22, "#1b1633"); R(-10, -103 + b, 20, 20, "#f4f0ff"); for (let i = 0; i < 5; i++) R(-9 + i * 4, -103 + b, 1, 20, "#d8d0e8");
    R(-7, -96 + b, 5, 4, "#f4f0ea"); R(2, -96 + b, 5, 4, "#f4f0ea"); R(-5, -95 + b, 2, 2, "#3a1a1a"); R(4, -95 + b, 2, 2, "#3a1a1a"); R(-6, -97 + b, 5, 1, "#8a1020"); R(2, -97 + b, 5, 1, "#8a1020");
    R(-4, -88 + b, 8, 2, "#8a1020"); for (let i = 0; i < 4; i++) R(-3 + i * 2, -88 + b, 1, 1, "#f4f0ff");
    tri(-12, -118 + b, 6, 16, "#9ef0f5"); tri(-2, -122 + b, 6, 20, "#9ef0f5"); tri(8, -116 + b, 6, 14, "#9ef0f5");
    for (const [x] of [[-30], [18]]) { R(x, -80 + b, 12, 36, "#e8e2f0"); R(x - 2, -46 + b, 16, 10, "#f4f0ff"); for (let i = 0; i < 4; i++) R(x + i * 3, -36 + b, 2, 5, "#f4f0ff"); }
    R(30, -44 + b, 8, 10, "#e8e2d0"); R(31, -42 + b, 6, 1, "#8a1020"); R(31, -39 + b, 6, 1, "#5a4a3a");
    drip(-8, -86 + b, 10, "#3a8fbf"); drip(6, -86 + b, 12, "#3a8fbf"); drip(-20, -40 + b, 14, "#3a8fbf"); drip(24, -30 + b, 10);
    if (u.charged) { R(-60, -8, 120, 8, "rgba(58,143,191,.6)"); }
  };
  const _sideQuestDialog = sideQuestDialog;
  sideQuestDialog = function (n) {
    if (n.id === "tamsin") return G.flags.corvinLedger ? "tamsin_after" : "tamsin_0";
    if (n.id === "foreman") return "foreman_0";
    if (n.id === "ines" && G.flags.corvinLedger && !G.flags.apology) return "ines_ledger";
    const r = rumorFor(n); if (r) return r;
    return _sideQuestDialog(n);
  };
  const _extraJournalHtml = extraJournalHtml;
  extraJournalHtml = function () {
    const f = G.flags; let h = _extraJournalHtml();
    if (G.stage >= 9) {
      const steps = !f.minesOpen ? "Something is under the Well of Nine. The Warden may sense it." : !f.corvinDead ? "Descend the Hollow Beneath under the Well of Nine and find who opened the sluice." : !f.apology ? "Bring Corvin's ledger to Mayor Ines in Oru." : !f.apologyRead ? "Carry the Apology of Oru to the Drowned King." : "The truth has been said aloud.";
      h += `<h3>The Hollow Beneath</h3><ul><li class="${f.apologyRead ? "done" : ""}">${f.apologyRead ? "✓ " : ""}${steps}</li></ul>`;
    }
    return h;
  };
  const _extraFates = extraFates;
  extraFates = function () { const out = _extraFates(); if (G.flags.corvinDead) out.push("Corvin's ledger is read aloud in the square at Oru, every name, over forty days. People bring flowers to the Well of Nine."); if (G.flags.apologyRead && G.members.includes("ren")) out.push("Ren lives. He keeps the gate of Oru open, and sometimes, on quiet nights, he gives the speech he never had to give."); return out; };

