  // ================================================================== NPC SIDE QUESTS
  Object.assign(MONSTERS, {
    jonas: { name: "Jonas, With Brass Hands", hp: 220, atk: 18, def: 6, spd: 6, xp: 120, coin: [0, 0], sprite: "drowned",
      pal: { "#4a6a7a": "#4a4a3a", "#5a7a8a": "#5a5a4a", "#8ab0b8": "#a8b0a0", "#2a5a3a": "#8a6a2a", "#857ea5": "#c9a227", "#b8bccc": "#c9a227" },
      moves: [{ name: "Brass Grip", w: 3, power: 1.4, stunChance: 0.2 }, { name: "Her Name", w: 1, weakAll: 2 }, { name: "Drag Down", w: 2, power: 1.0, bleed: [3, 3] }] },
  });
  BESTIARY.jonas = "Sela's husband. The clerks took his hands for a debt. The marsh took the rest. The brass hands came with him.";
  Object.assign(ITEMS, { echo: { name: "Thunder Echo", desc: "20 damage to every enemy, 35% chance to stun each.", target: "allEnemiesItem", dmg: 20, stunChance: 0.35, price: 0 } });
  Object.assign(RELICS, {
    choirbell: { name: "The Orphans' Bell", from: "_choir", desc: "+2 extra SP each turn, +1 speed.", spRegen: 2, spd: 1 },
    lullaby: { name: "A Mother's Lullaby", from: "_suri", desc: "Regenerate 5 health each turn, +2 defence.", regen: 5, def: 2 },
    lamp: { name: "The Keeper's Lamp", from: "_ansel", desc: "+12% critical chance, +2 attack.", crit: 0.12, atk: 2 },
  });
  function giveRelic(id) { if ((G.relics || []).includes(id)) return; G.relics = [...(G.relics || []), id]; toast(`Relic received: ${RELICS[id].name}. Equip it from the party screen (P).`); save(); }
  const KIDS = [{ x: 95, y: 8, name: "Dilly" }, { x: 103, y: 24, name: "Wren" }, { x: 76, y: 18, name: "Bo" }, { x: 86, y: 30, name: "Tansy" }];
  KIDS.forEach((k, i) => npc2({ id: "kid" + i, name: k.name, x: k.x, y: k.y, look: { robe: ["#d8d4e8", "#c8c0e0", "#e0d8f0", "#d0c8e8"][i], hair: ["#3a2a1e", "#c8a050", "#1b1633", "#a8403a"][i], skin: ["#f0c8a0", "#c98d63", "#e0a878", "#f2c39a"][i], small: true, style: { hair: i % 2 ? "tail" : "fringe" } }, show: () => G.flags.choirQuest && !(G.flags.kidsFound || []).includes(i) }));
  npc2({ id: "abawidow", name: "Widow Aba", x: 7, y: 41, look: { robe: "#5a4a6a", hair: "#d8d0c0", skin: "#8a5a33", style: { hair: "veil", dress: true } }, show: () => G.stage >= 1 });
  npc2({ id: "ansel", name: "Ansel the Lighthouse Keeper", x: 121, y: 60, look: { robe: "#3a4a6a", hair: "#d8d0c0", skin: "#b8c8d0", style: { hair: "bald", beard: true, coat: true } }, show: () => G.stage >= 9 && !G.flags.anselRest });
  npc2({ id: "orla", name: "Orla the Hermit", x: 124, y: 51, look: { robe: "#4a4a6a", hair: "#e8e4f0", skin: "#a8744f", extra: "staff", style: { hair: "long", dress: true } }, show: () => G.stage >= 10 });
  npc2({ id: "suri", name: "A drowned mother", x: 96, y: 50, look: { robe: "#4a6a6a", hair: "#2a4a4a", skin: "#8ab0b8", glowEyes: true, style: { hair: "long", dress: true } }, show: () => G.stage >= 12 && !G.flags.suriRest });
  for (const id of ["abawidow", "ansel", "orla", "suri"]) SPEAKERS[id] = NPCS.find(n => n.id === id).name;
  KIDS.forEach((k, i) => { SPEAKERS["kid" + i] = k.name; });
  const JORY_GRAVES = [{ x: 18, y: 74 }, { x: 44, y: 58 }, { x: 30, y: 85 }];
  const OIL = [{ x: 80, y: 63 }, { x: 101, y: 69 }];
  const TOY = { x: 78, y: 40 };
  FIELD.push({ id: "jonas", x: 52, y: 76, group: ["jonas"], minStage: 8, req: () => G.flags.selaQuest && !G.flags.jonasDead, area: "marsh" });
  Object.assign(D, {
    // Pip and the choir orphans
    pip_q0: say("pip", "Courier? The other Choir kids went hiding when the clerks came, and they won't come out. Dilly, Wren, Bo and Tansy. They think anyone in a coat is a clerk. Will you find them? Tell them Pip says it's safe. Tell them the song-word: 'morning'.", null, () => { G.flags.choirQuest = true; toast("Side quest: find the four hidden Choir orphans in Oru"); save(); updateHud(); }),
    pip_q1: say("pip", "Still hiding: some of them. Say 'morning'. It's the waking word. They'll know."),
    pip_q2: say("pip", "(Pip counts the children three times.) All four. All four! ...Sister Ada left this bell with us when she was sent away. We rang it every morning to wake the Choir. You should have it. You're the one who woke us up.", null, () => { G.flags.choirDone = true; giveRelic("choirbell"); Music.sound("victory"); save(); updateHud(); }),
    pip_q3: say("pip", "We sing every morning now. Loudly. The old people complain. It's the best sound in Oru."),
    kid0_0: say("kid0", "(A small girl behind a barrel.) ...Morning? Pip sent you? Is it really safe? Okay. Okay. I'm going to go stand next to Pip and not let go of him ever again.", null, () => kidFound(0)),
    kid1_0: say("kid1", "(A boy on a roof ledge.) You said the word. Nobody says the word unless Pip told them. ...The clerk that took my dad had hands like a person. Did you know that? I climbed up here so I couldn't see any hands.", null, () => kidFound(1)),
    kid2_0: say("kid2", "(A tiny boy in a drain.) Morning! I win hide-and-seek. I've been winning for nine days. I'm very hungry.", null, () => kidFound(2)),
    kid3_0: say("kid3", "(A girl clutching a hymn book.) I kept singing the sleeping song so the clerks would sleep. They never did. I'll try the waking one now.", null, () => kidFound(3)),
    // Sela and Jonas
    sela_q0: say("sela", "(Sela catches your sleeve.) Courier. My husband Jonas couldn't pay the Guild. They took... they took his hands. He ran into the marsh with the bandages still on. That was spring. I keep telling myself he's fishing somewhere, in a hut, too proud to come home.", "sela_q1"),
    sela_q1: { who: "sela", text: "If you go south, would you look for him? Tall, stooped, a laugh like a donkey. You'll know him because he'll be the one trying to fish without hands, and swearing about it.", choices: [
      { t: "\"I'll look for him.\"", go: "sela_q2" }, { t: "\"The marsh is full of the drowned, Sela.\"", go: "sela_q2b" } ] },
    sela_q2: say("sela", "Thank you. Thank you. If he's angry, tell him I burned the bread. He always laughs at that.", null, () => { G.flags.selaQuest = true; spawnField(); toast("Side quest: find Sela's husband Jonas in the marsh"); save(); updateHud(); }),
    sela_q2b: say("sela", "I know. I know what's in the marsh. Look anyway. Please. I'd rather know than keep baking bread for nobody.", null, () => { G.flags.selaQuest = true; spawnField(); toast("Side quest: find Sela's husband Jonas in the marsh"); save(); updateHud(); }),
    sela_wait: say("sela", "He'd be somewhere south-east in the marsh. He always liked the east. He said the sunrise there was worth drowning for. He was joking. He was always joking."),
    jonas_after: say(null, "The drowned man with brass hands sinks to his knees in the shallows. The brass fingers open. In one palm, green with marsh-water, is a silver wedding ring engraved J and S. His lips move. It might be her name. It might be the water.", null, () => { G.flags.jonasFound = true; toast("You carry Jonas's wedding ring. Take it back to Sela."); save(); updateHud(); }),
    sela_ring: { who: "sela", text: "(Sela sees the ring in your hand before you can speak. Her face goes very still.) Tell me. Tell me how he was.", choices: [
      { t: "Tell her the truth.", go: "sela_truth" },
      { t: "Tell her he died peacefully, fishing, a free man.", go: "sela_lie" } ] },
    sela_truth: say("sela", "(She listens to all of it. She doesn't look away once.) The brass hands. Of course. They couldn't even let him drown with his own. ...Thank you for not lying to me. Everybody lies to widows. I'd rather hold the true thing, even if it cuts.", null, () => selaEnd("truth")),
    sela_lie: say("sela", "(She closes her eyes and smiles, very carefully.) Fishing. Swearing at the fish, I bet. Thank you, courier. ...I know you're lying. I know what's in the marsh. Thank you for lying so kindly. I'll pretend with you, just for tonight.", null, () => selaEnd("lie")),
    sela_after: say("sela", "I baked bread today. For me, this time. It's the first time I haven't burned it."),
    // Ansel the lighthouse keeper
    ansel_0: say("ansel", "(An old man in a sea-coat taps the dead lantern of the lighthouse.) The light's out. Been out a while, I think. My boy's boat is due in. He can't find the channel without the light. Would you bring me oil? The wrecks have barrels. Two should do.", null, () => { G.flags.anselQuest = true; toast("Side quest: bring two barrels of oil to the lighthouse"); save(); updateHud(); }),
    ansel_wait: say("ansel", "Two barrels. The wreck to the north-west, and the one to the east. My boy's boat is due in any minute now. Any minute."),
    ansel_1: say("ansel", "(He pours the oil, strikes a flint, and the great lamp roars into light. He stands in it, and you can see the wall through him.) There. There she is. He'll see that from ten miles out.", "ansel_2"),
    ansel_2: say("ansel", "(He looks at his hands, at the light shining through them.) ...Oh. How long has it been out? Forty years? The sea left forty years ago. His boat... his boat never came in, did it. I've been waiting for a boat on dry sand.", "ansel_3"),
    ansel_3: { who: "ansel", text: "(He turns to you, fading, and he's smiling.) But the sea's coming back now. Somebody's boat will need the light. Somebody's boy. That's enough. That's plenty. Take my lamp-glass. It burned for forty years without me knowing why.", choices: [
      { t: "\"Rest, keeper. The light's lit.\"", go: null, act: () => { G.flags.anselRest = true; giveRelic("lamp"); G.coins += 60; save(); updateHud(); } } ] },
    // Brother Jory
    jory_q0: say("saved3", "(Brother Jory sits apart from the others, turning three smooth stones in his hands.) The drowned stood around me for a night, listening to me pray. Then they tried to eat me. I've been asking the gods what that means. They're not answering.", "jory_q1"),
    jory_q1: say("saved3", "These are prayer-stones. Reedholm puts one on each drowned grave so the dead know they're remembered. Three graves out in the marsh have none. Would you place them? I can't go back out there. I'm... I'm not brave. I thought I was holy. It turns out those are different things.", null, () => { G.flags.joryQuest = true; toast("Side quest: place Jory's three prayer-stones on the marsh graves"); save(); updateHud(); }),
    jory_wait: say("saved3", "Three graves: north-west of the village, north-east near the reeds, and far south. You'll know them by the leaning posts."),
    jory_done: say("saved3", "(Jory listens to you describe each grave.) You put them down gently? ...I think I understand now. The drowned didn't listen to my prayers because I was holy. They listened because someone was talking to them like they still mattered. The hunger was theirs. The listening was theirs too. Both.", "jory_done2"),
    jory_done2: say("saved3", "I don't know if the gods are there. But I know the dead like to be spoken to, and the living do too. That's enough religion for one frightened monk. Bless you. I mean that in the plainest way.", null, () => { G.flags.joryDone = true; for (const id of G.members) { G.party[id].maxHp += 8; G.party[id].hp += 8; } toast("Jory's blessing: +8 max health for the whole party."); Music.sound("heal"); save(); updateHud(); }),
    jory_after: say("saved3", "I spoke to the drowned graves this morning. Nothing answered. It was lovely."),
    // Orla the hermit
    orla_0: say("orla", "(An old woman sits on a rock in the rain, eyes closed, humming.) The shrines are waking. I can hear them. I taught Vela, you know. And Vela taught little Maru. I'm the last storm-singer who didn't go hollow, because I left before the King started singing."),
    orla_1: say("orla", "Bring me the echo of each shrine when you wake it. Just stand near me with the tone still in the Bell. I'll catch the echoes and teach them to your weapons. Thunder remembers a good teacher.", null, () => { G.flags.orlaQuest = true; save(); updateHud(); }),
    orla_give: say("orla", "(She holds her hands out to the Bell and the rain bends toward her.) Ah. There it is. A good tone. Take these. Each one is a thunderclap in a shell. Throw it and the storm remembers.", null, () => { const n = (G.flags.tones || []).length - (G.flags.orlaGiven || 0); G.flags.orlaGiven = (G.flags.orlaGiven || 0) + n; G.items.echo = (G.items.echo || 0) + n * 2; toast(`Orla gives you ${n * 2} Thunder Echo${n * 2 > 1 ? "es" : ""}.`); Music.sound("item"); save(); updateHud(); }),
    orla_maru: say("orla", "(Orla turns her blind face toward Maru's lantern in Ilse's hands.) She sang it well, didn't she. I heard it from here. Every storm-singer in history heard it. Put the lantern down on this rock, smith. I'll keep it lit. That's what we do for each other."),
    orla_idle: say("orla", "Every song ends. That's not a reason to stop singing. Most students only remember the first half. You look like you remember both."),
    // the drowned mother
    suri_0: say("suri", "(A drowned woman searches the floor of the palace, touching every stone.) My daughter's boat. She made it herself, out of reed and wax. She put it in my hand when they dragged me down. I've lost it. I can't sleep without it. I can't sleep."),
    suri_1: say("suri", "It's small. It's somewhere here, in the west of the hall. Please. The King says sleep is coming for everyone. I want to be holding it when it comes.", null, () => { G.flags.suriQuest = true; save(); updateHud(); }),
    suri_toy: say("suri", "(She takes the little reed boat in both hands, and for a moment her face is only a face.) She made the sail from her own hair ribbon. She was so proud. ...I can sleep now. Tell Liv... tell her I'm not afraid of the water either.", null, () => { G.flags.suriRest = true; giveRelic("lullaby"); save(); updateHud(); }),
  });
  function kidFound(i) {
    G.flags.kidsFound = [...new Set([...(G.flags.kidsFound || []), i])];
    toast(`${KIDS[i].name} runs back to Pip (${G.flags.kidsFound.length}/4)`); Music.sound("item"); save(); updateHud();
  }
  function selaEnd(kind) { G.flags.selaDone = kind; G.flags.jonasFound = false; G.coins += 30; toast("Sela's story is finished."); save(); updateHud(); }
  function sideQuestDialog(n) {
    const f = G.flags;
    switch (n.id) {
      case "pip": if (G.stage < 7) return null; if (f.choirDone) return G.members.includes("ada") && !f.pipAda ? (f.pipAda = true, "pip_ada") : "pip_q3"; if (!f.choirQuest) return "pip_q0"; return (f.kidsFound || []).length >= 4 ? "pip_q2" : "pip_q1";
      case "sela": if (G.stage < 8) return null; if (f.selaDone) return "sela_after"; if (f.jonasFound) return "sela_ring"; if (f.selaQuest) return "sela_wait"; return "sela_q0";
      case "ansel": if (!f.anselQuest) return "ansel_0"; return (f.oil || []).length >= 2 ? "ansel_1" : "ansel_wait";
      case "saved3": if (G.stage < 9) return null; if (f.joryDone) return "jory_after"; if (!f.joryQuest) return "jory_q0"; return (f.stones || []).length >= 3 ? "jory_done" : "jory_wait";
      case "orla": if (f.maruDead && !f.orlaMaru) { f.orlaMaru = true; return "orla_maru"; } if (!f.orlaQuest) return "orla_0"; if ((f.tones || []).length > (f.orlaGiven || 0)) return "orla_give"; return "orla_idle";
      case "suri": if (!f.suriQuest) return "suri_0"; return f.toyFound ? "suri_toy" : "suri_1";
      case "abawidow": return "aba_idle";
    }
    if (/^kid\d$/.test(n.id)) return `${n.id}_0`;
    return null;
  }
  D.aba_idle = say("abawidow", "(An old woman mending a child's coat.) My husband drove salt wagons across the Flats for forty years. The jackals got him last year. My grandson says an archer saved him. I don't know any archers. I'd like to thank one, someday.");
  D.orla_0.go = "orla_1"; D.suri_0.go = "suri_1";
  const _dialogFor = dialogFor;
  dialogFor = function (n) { return letterDialog(n) || sideQuestDialog(n) || _dialogFor(n); };
  const _act2Triggers = act2Triggers;
  act2Triggers = function () {
    _act2Triggers();
    const f = G.flags;
    if (f.joryQuest && !f.joryDone) JORY_GRAVES.forEach((gv, i) => { if ((f.stones || []).includes(i) || !near({ x: gv.x * TILE + 8, y: gv.y * TILE + 8 }, 14)) return; f.stones = [...(f.stones || []), i]; Music.sound("heal"); toast(`You set a prayer-stone on the grave (${f.stones.length}/3). ${["Someone has carved a fish on the post.", "The name has worn away. You say 'remembered' out loud anyway.", "A child's grave. Someone left a reed boat here, long ago."][i]}`); save(); updateHud(); });
    if (f.anselQuest && !f.anselRest) OIL.forEach((o, i) => { if ((f.oil || []).includes(i) || !near({ x: o.x * TILE + 8, y: o.y * TILE + 8 }, 13)) return; f.oil = [...(f.oil || []), i]; Music.sound("item"); toast(`A barrel of lamp oil (${f.oil.length}/2)`); save(); updateHud(); });
    if (f.suriQuest && !f.toyFound && near({ x: TOY.x * TILE + 8, y: TOY.y * TILE + 8 }, 13)) { f.toyFound = true; Music.sound("item"); toast("A tiny reed boat, its sail a hair ribbon."); save(); updateHud(); }
    if (G.flags.rookDead && G.flags.rookLetter && !carrying("rook") && !delivered("rook")) { G.flags.carry = [...(G.flags.carry || []), "rook"]; save(); setTimeout(() => toast("In Rook's quiver: his letter to Aba's widow in Kessa. Courier's honour."), 1500); }
  };
  const _act2BossEndB = act2BossEndB;
  act2BossEndB = function (boss) {
    _act2BossEndB(boss);
    if (lastGroup.includes("jonas") && !G.flags.jonasDead) { G.flags.jonasDead = true; save(); setTimeout(() => openDialog("jonas_after"), 300); }
  };
  const _act2ActorsB = act2ActorsB;
  act2ActorsB = function (actors, ox, oy) {
    _act2ActorsB(actors, ox, oy);
    const f = G.flags, sp = (x, y, c) => actors.push({ y: y * TILE, draw: () => drawSparkle(g, x * TILE + 8 - ox, y * TILE + 8 - oy, c) });
    if (f.joryQuest && !f.joryDone) JORY_GRAVES.forEach((gv, i) => { if (!(f.stones || []).includes(i)) sp(gv.x, gv.y, "#e8e4f0"); });
    if (f.anselQuest && !f.anselRest) OIL.forEach((o, i) => { if (!(f.oil || []).includes(i)) sp(o.x, o.y, "#ffcf4a"); });
    if (f.suriQuest && !f.toyFound) sp(TOY.x, TOY.y, "#9ad8e0");
  };
  const _addProp2b = addProp2;
  addProp2 = () => { _addProp2b(); for (const gv of JORY_GRAVES) addProp("grave", gv.x, gv.y - 1); };
  // extra endings lines
  function extraFates() {
    const f = G.flags, out = [];
    if (f.selaDone === "truth") out.push("Sela plants a garden on the hill and names the tallest tree Jonas. She tells the true story to anyone who asks.");
    if (f.selaDone === "lie") out.push("Sela tells everyone her husband died fishing, a free man. Only she and the courier know better, and they never say.");
    if (f.choirDone) out.push("The Choir orphans ring their bell every morning in Oru. The old people still complain. It is the best sound in the valley.");
    if (f.anselRest) out.push("The lighthouse on the Wreck Coast burns every night. Nobody tends it. Nobody needs to.");
    if (f.joryDone) out.push("Brother Jory talks to the drowned graves every morning, and doesn't wait for answers.");
    if (f.suriRest) out.push("Liv throws her reed spear further every year. Some mornings she swims out and sings to the water, and the water is calm.");
    if (delivered("rook")) out.push("In Kessa, an old widow keeps an archer's letter over her heart, and a tall boy climbs every rock on the Flats.");
    if (delivered("odo")) out.push("Odo walks up the hill to Oru with his cart, and his daughter keeps his room.");
    if (delivered("oskar")) out.push("Kessa and Reedholm become one village with a marsh in the middle, as Nadia said fifty years ago.");
    const bonded = Object.entries(f.bonds || {}).filter(([, n]) => n >= 3).map(([id]) => HEROES[id].name);
    if (bonded.length) out.push(`${bonded.join(", ")} ${bonded.length > 1 ? "never forget" : "never forgets"} the nights by the fire when they told Sable who they really were.`);
    return out;
  }
  function extraJournalHtml() {
    const f = G.flags, li = (done, t) => `<li class="${done ? "done" : ""}">${done ? "✓ " : ""}${t}</li>`;
    const bonds = G.members.filter(id => BONDS[id]).map(id => { const n = bondLevel(id); return li(n >= 3, `<b>${HEROES[id].name}</b>: ${n}/3 ${n < 3 ? (bondAvailable(id) ? "· a new conversation is waiting (party screen)" : "· more to say later in the story") : "· bonded"}${n ? ` <span class="dim">(${BONDS[id].talks.slice(0, n).map(t => t.title).join(", ")})</span>` : ""}`); }).join("");
    const letters = LETTERS.filter(L => carrying(L.id) || delivered(L.id)).map(L => li(delivered(L.id), delivered(L.id) ? `Delivered: letter to ${L.toName}.` : `Carrying a letter to ${L.toName}.`)).join("") || `<li class="dim">Nobody has asked you to carry a letter yet. People might, if you talk to them.</li>`;
    const sq = [
      [f.choirQuest, f.choirDone, `Pip's choir orphans (${(f.kidsFound || []).length}/4 found in Oru).`],
      [f.selaQuest, f.selaDone, f.jonasFound ? "Take Jonas's ring back to Sela in Oru." : "Find Sela's husband Jonas in the south-east marsh."],
      [f.joryQuest, f.joryDone, `Brother Jory's prayer-stones (${(f.stones || []).length}/3 graves).`],
      [f.anselQuest, f.anselRest, `Oil for the lighthouse keeper (${(f.oil || []).length}/2 barrels).`],
      [f.orlaQuest, false, `Bring shrine echoes to Orla on the Storm Road (${f.orlaGiven || 0}/3 given).`],
      [f.suriQuest, f.suriRest, f.toyFound ? "Give the reed boat to the drowned mother." : "Find the drowned mother's reed boat in the west of the Deep."],
    ].filter(([on]) => on).map(([, done, t]) => li(done, t)).join("") || `<li class="dim">No side quests yet. People in Oru, Reedholm and beyond may need help.</li>`;
    return `<h3>Bonds</h3><ul>${bonds || '<li class="dim">No companions yet.</li>'}</ul><h3>Letters</h3><ul>${letters}</ul><h3>Side quests</h3><ul>${sq}</ul>`;
  }

