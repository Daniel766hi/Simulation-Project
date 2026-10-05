  // ================================================================== PROLOGUE: THE LAST DRY DAY
  // A cold open (the salt child), a playable morning in Kessa before the theft, and the night the Bell is taken.
  // Lio, Nadia's grandson, is the heart of it: the player should know him before they lose him.
  const PRO_TOWER = { x: 15, y: 39 };
  PROP_SOLID.add("belltower");
  const bellShown = () => ["morning", "dusk"].includes(G.flags.pro) || ["ring", "sleep"].includes(G.flags.epilogue);
  const _addProp2P = addProp2;
  addProp2 = () => { _addProp2P(); addProp("belltower", PRO_TOWER.x, PRO_TOWER.y); };
  const _drawPropP = drawProp;
  drawProp = function (g2, pr, x, y) {
    if (pr.type !== "belltower") return _drawPropP(g2, pr, x, y);
    x = Math.round(x); y = Math.round(y);
    const R = (dx, dy, w, h, c) => { g2.fillStyle = c; g2.fillRect(x + dx, y + dy, w, h); }, t = time;
    g2.fillStyle = "rgba(20,14,40,.3)"; g2.beginPath(); g2.ellipse(x, y + 6, 12, 3, 0, 0, Math.PI * 2); g2.fill();
    R(-9, -30, 18, 36, "#1b1633"); R(-8, -29, 16, 34, "#a89a80"); for (let i = 0; i < 4; i++) R(-8, -24 + i * 8, 16, 1, "#857a64");
    R(-3, -4, 6, 10, "#3a2a1e"); R(-12, -48, 24, 4, "#1b1633"); R(-11, -47, 22, 3, "#8a3a2a"); R(-9, -44, 2, 14, "#6b5a44"); R(7, -44, 2, 14, "#6b5a44"); R(-10, -30, 20, 2, "#6b5a44");
    R(-13, -54, 26, 6, "#1b1633"); R(-12, -53, 24, 5, "#a8403a"); R(-2, -58, 4, 4, "#a8403a");
    if (bellShown()) { const sw = Math.round(Math.sin(t * 1.2) * 1); R(-5 + sw, -43, 10, 10, "#1b1633"); R(-4 + sw, -42, 8, 9, "#e8b83a"); R(-3 + sw, -41, 2, 6, "#ffe08a"); R(-1 + sw, -33, 2, 2, "#8a6a2a"); }
    else if (G.flags.pro === "night") { for (let i = 0; i < 6; i++) { const f = Math.sin(t * 10 + i * 2); R(-8 + i * 3, -38 - Math.abs(f) * 8, 3, 6 + Math.abs(f) * 6, i % 2 ? "#ff8a3a" : "#ffcf4a"); } R(12, -40 + Math.sin(t * 2) * 3, 1, 40, "#6b5a44"); }
    if (G.flags.lioDead && !bellShown()) R(-1, -32, 2, 12, "#6b5a44");
    if (G.flags.pro === "morning" || G.flags.pro === "dusk") R(-1, -32, 2, 30, "#8a7a5a");
  };
  npc2({ id: "lio", name: "Lio", x: 16, y: 41, look: { robe: "#4a7a9a", hair: "#3a2a1e", skin: "#d9a070", style: { hair: "fringe", eye: "#3a6a8a" } }, show: () => ["morning", "dusk"].includes(G.flags.pro) });
  const abaNpc = NPCS.find(n => n.id === "abawidow"); if (abaNpc) { const s0 = abaNpc.show; abaNpc.show = () => G.flags.pro === "morning" || G.flags.pro === "dusk" || s0(); }
  MONSTERS.houndg = { name: "Guild Hound", hp: 14, atk: 4, def: 0, spd: 7, xp: 20, coin: [4, 6], sprite: "jackal", boss: true, music: "boss",
    moves: [{ name: "Collar-Bite", w: 3, power: 1.0 }, { name: "Snarl", w: 1, power: 0.5 }] };
  BESTIARY.houndg = "Jackals the Guild collars and starves until they'll bite anything they're pointed at. Somebody pointed them at a bell tower full of children's songs.";
  Object.assign(RELICS, { lioknot: { name: "Lio's Knot", from: "lio", desc: "+2 attack, +1 defence. A knot of old bell-rope. He held on.", atk: 2, def: 1 } });
  Object.assign(SCENE_BY_TITLE, { "The Last Dry Day": "bell", "That Night": "bell", "Holding On": "rookGrave" });
  const lk = () => G.flags;
  Object.assign(D, {
    pro_n0: say("nadia", "(Elder Nadia is measuring water into cups, one per family, with a ladle that has a crack in it. She's careful not to spill a drop.) There you are. Three parcels this morning, courier, and then you're done for the year.", "pro_n1"),
    pro_n1: say("nadia", "Widow Aba's water. Ilse's salve from Odo, and don't let her tell you her hands are fine. And the post for Tam.", "pro_n1b"),
    pro_n1b: say("sable", "Is there a letter from Pell this time?", "pro_n1c"),
    pro_n1c: say("nadia", "(Nadia doesn't answer, which is an answer.) ...And Lio's been asking after you since dawn. He's up the bell tower again, polishing the rope ring. That boy thinks the Bell is his.", "pro_n2"),
    pro_n2: say("sable", "It is, a bit.", null, () => { lk().pmStarted = true; toast("Morning round: water for Widow Aba, a salve for Ilse, the post for Tam"); save(); updateHud(); }),
    pro_nwait: say("nadia", "Go on. Aba first, if you can. She won't drink until her goats have."),
    pro_ndusk: say("nadia", "Rest by the well tonight, Sable. Tomorrow it rains. Tomorrow Lio rings the Bell, and nobody in Kessa has to share a cup again."),
    pro_aba: say("abawidow", "(Widow Aba takes the cup of water in both hands, like something alive.) One cup. I'll give half to the goats. They were my husband's. ...Don't look at me like that, Sable. It isn't a sacrifice if you love the thing.", null, () => { lk().pmAba = true; proCheck(); }),
    pro_ilse: say("ilse", "(Ilse flexes her hands. Two of her fingers don't bend the way fingers should.) Odo's salve. He charged you, didn't he? ...Voss's men broke these last year, because I wouldn't forge their chains. I can hold a hammer again. Just not for long. Tell Odo thank you. Don't tell him I said it.", null, () => { lk().pmIlse = true; proCheck(); }),
    pro_tam: { who: "tam", text: "(Tam runs to meet you before you've reached her door.) Anything? From Pell? He went north to the old watchtower eight weeks ago. He said he'd write every week.", choices: [
      { t: "Tell her the truth: nothing again.", go: "pro_tam_t" },
      { t: "Lie: \"The post from the north was delayed.\"", go: "pro_tam_l" } ] },
    pro_tam_t: say("tam", "(Her face does the thing it does every week, and then it stops doing it.) Pell always keeps his word. So something's wrong. Isn't it. ...Thank you for not lying, Sable. Everybody else lies to me now.", null, () => { lk().pmTam = true; proCheck(); }),
    pro_tam_l: say("tam", "(She knows. You can see her know. She says thank you anyway, and goes inside, and doesn't close the door all the way, in case.)", null, () => { lk().pmTam = true; lk().tamLied = true; proCheck(); }),
    pro_lio0: say("lio", "(A boy of eight is sitting on the tower steps, polishing the bell-rope's brass ring with his sleeve.) Sable! SABLE! Did you drop anything today? You didn't, did you. You never do.", "pro_lio1"),
    pro_lio1: say("lio", "Grandma says when the rains come tomorrow, I get to ring it. Me! The first ring. Three times, slow, like the old song. Then everyone comes out and dances in the mud and nobody has to share cups any more. Not Aba. Not anyone.", "pro_lio2"),
    pro_lio2: { who: "lio", text: "When I grow up I'm going to be a courier like you. Will you teach me? I can already run nearly as fast as Tam.", choices: [
      { t: "\"You'd be the best courier in the valley.\"", go: "pro_lio3a" },
      { t: "\"It's lonely work, Lio. All that walking.\"", go: "pro_lio3b" } ] },
    pro_lio3a: say("lio", "(He beams so hard his ears go red.) I'd never drop anything either. Not ever. I'd hold on even if a monster came. Even a big one.", "pro_lio4"),
    pro_lio3b: say("lio", "Not if we go together. Then it's not lonely. Then it's just walking, with someone.", "pro_lio4"),
    pro_lio4: say("lio", "(He ties a knot of old bell-rope around your wrist, very seriously, with his tongue between his teeth.) There. Now you're part of the Bell too. For luck. See you at the first ring, Sable!", null, () => { lk().pro = "dusk"; G.clock = 0.46; toast("Dusk. Rest by the village well for the night."); save(); updateHud(); }),
    pro_sleep: say(null, "You drink your cup and lie down by the well with your scarf over your face, the way you have since you were small. You fall asleep listening to Lio up in the tower, humming the three tones to himself, getting them almost right.", null, () => {
      lk().pro = "night"; G.clock = 0.72; wasNight = true; for (const id of G.members) { G.party[id].hp = G.party[id].maxHp; G.party[id].sp = G.party[id].maxSp; } G.checkpoint = { x: G.px, y: G.py }; save(); updateHud();
      card("That Night", "The Stolen Bell", "You wake to the sound of the Bell. Not three slow tones. Wild, broken clanging, over and over: the way a bell rings when someone is fighting for the rope.");
    }),
    pro_theft0: say(null, "The tower door has been kicked in. At the top: torches, and men in Guild coats hauling the Rain Bell out over the edge on ropes. One of them walks with a limp. And halfway up the tower, a small figure is hanging from the bell-rope with both hands.", "pro_theft1"),
    pro_theft1: say("lio", "SABLE! I'm holding on! I'm holding on like a courier!", "pro_theft2"),
    pro_theft2: { who: null, text: "Two starved jackals in Guild collars come snarling down the tower stairs.", choices: [{ t: "Fight your way up.", go: null, act: () => startBattle(["houndg", "houndg"], { boss: "houndg", area: "flats" }) }] },
    pro_after0: say(null, "You reach the top of the stairs as the Bell swings out over the dark on its ropes. The limping man looks straight at you. He has very tired eyes. Then he cuts the bell-rope. Lio is still holding it.", "pro_after1"),
    pro_after1: say(null, "You don't remember the stairs. You remember the sound. You remember that he was still holding the rope when you found him.", "pro_after2"),
    pro_after2: say("lio", "(Very small. Very quiet.) Did I... did I hold on? I didn't drop it, Sable. I didn't drop it.", "pro_after3"),
    pro_after3: { who: null, text: "", choices: [
      { t: "\"You held on. You were the best courier in the valley.\"", go: "pro_after4" },
      { t: "(Hold him. Don't say anything. There isn't anything to say.)", go: "pro_after4" } ] },
    pro_after4: say("lio", "Tell Grandma... tell her I'm sorry about the cups. I wanted everybody to have enough...", "pro_after5"),
    pro_after5: say(null, "Lio of Kessa, eight years old, bell-ringer, died on the last dry night of the year, holding on. His hand is still wrapped in the rope. It stays that way until morning.", null, () => {
      lk().lioDead = true; lk().pro = "done"; G.clock = 0.04; wasNight = false; giveRelic("lioknot"); save(); updateHud();
      card("Holding On", "Morning", "Nobody in Kessa slept. When the sun came up, the Bell was gone, the tower was black, and out on the salt the jackals had stopped eating carrion and started hunting. Elder Nadia has been sitting on the tower steps all night.");
    }),
    pro_nd0: say("nadia", "(Nadia is sitting on the tower steps with Lio's shoes in her lap.) He polished that brass ring every morning. I told him it was only brass. He said it was the Bell's heart.", "pro_nd1"),
    pro_nd1: say("nadia", "They didn't even want him. They wanted the Bell. He was just... in the way. A child, in the way.", "pro_nd2"),
    pro_nd2: say("nadia", "Without the Bell, Oru won't open its gates when the rains come, and Kessa drowns with the Flats. And the dead have started walking. I should care about that. I'm the Elder. But this morning, God forgive me, I only want one thing. I want it back, and I want it rung. He'd want it rung.", "nadia_2"),
  });
  function proCheck() { const f = lk(); save(); updateHud(); if (f.pmAba && f.pmIlse && f.pmTam && !f.pmDone) { f.pmDone = true; toast("Round done. Lio's waiting for you at the bell tower."); } }
  const _startGameP = startGame;
  startGame = function () {
    const fresh = G.stage === 0 && !G.flags.intro && !G.ng && !/skipprologue/.test(location.search);   // the query flag is for automated tests
    if (fresh) { G.flags.intro = true; G.flags.pro = "morning"; G.clock = 0.12; }
    _startGameP();
    if (fresh) {
      const lastDry = () => card("Prologue", "The Last Dry Day", "Twenty years later. The rains have failed three summers running, and water in Kessa is rationed by the cup. Sable is the village courier now. She carries what she is given, she never opens it, and she has never once dropped a package. Tomorrow the rains are due. Today, Elder Nadia has one last round for her.");
      playCine(SALT_CHILD, lastDry, { music: "cine_lullaby" });
      save();
    }
  };
  $("startBtn").removeEventListener("click", _startGameP); $("startBtn").addEventListener("click", () => startGame());   // the button held the old function
  const _dialogForP = dialogFor;
  dialogFor = function (n) {
    const f = G.flags;
    if (G.stage === 0 && f.pro && f.pro !== "done") {
      if (n.id === "nadia") return !f.pmStarted ? "pro_n0" : f.pro === "dusk" ? "pro_ndusk" : "pro_nwait";
      if (n.id === "lio") { if (!f.pmStarted || !f.pmDone) { D.__lio = say("lio", f.pmStarted ? "Finish your round first! Couriers always finish the round. Then come back, I want to show you something." : "Sable! Grandma's looking for you. By the well! Go on, go on!"); return "__lio"; } return f.pro === "dusk" ? (D.__lio = say("lio", "See you at the first ring! Don't be late! Couriers are never late!"), "__lio") : "pro_lio0"; }
      if (f.pmStarted && f.pro === "morning") {
        if (n.id === "abawidow" && !f.pmAba) return "pro_aba";
        if (n.id === "ilse" && !f.pmIlse) return "pro_ilse";
        if (n.id === "tam" && !f.pmTam) return "pro_tam";
      }
      if (n.id === "ilse") { D.__pro = say("ilse", "Tomorrow it rains. I'm going to stand in it until my hands stop hurting."); return "__pro"; }
    }
    if (G.stage === 0 && f.pro === "done" && n.id === "nadia") return "pro_nd0";
    return _dialogForP(n);
  };
  const _goalP = goal;
  goal = function () {
    const f = G.flags;
    if (G.stage !== 0 || !f.pro) return _goalP();
    const T0 = "Prologue · The Last Dry Day";
    if (f.pro === "morning") {
      if (!f.pmStarted) return { ch: T0, text: "Elder Nadia is handing out the water by the well. Go and see her.", x: 12, y: 39 };
      if (!f.pmAba) return { ch: T0, text: `Morning round (${[f.pmAba, f.pmIlse, f.pmTam].filter(Boolean).length}/3): take Widow Aba her cup of water.`, x: 7, y: 41 };
      if (!f.pmIlse) return { ch: T0, text: `Morning round (${[f.pmAba, f.pmIlse, f.pmTam].filter(Boolean).length}/3): take Ilse her salve.`, x: 19, y: 39 };
      if (!f.pmTam) return { ch: T0, text: `Morning round (${[f.pmAba, f.pmIlse, f.pmTam].filter(Boolean).length}/3): take Tam the post.`, x: 7, y: 48 };
      return { ch: T0, text: "Lio is waiting for you at the bell tower.", x: 16, y: 41 };
    }
    if (f.pro === "dusk") return { ch: T0, text: "Rest by the village well for the night.", x: 12, y: 42 };
    if (f.pro === "night") return { ch: "Prologue · The Stolen Bell", text: "The Bell! Run to the tower!", x: PRO_TOWER.x, y: PRO_TOWER.y + 1 };
    return { ch: "Prologue · The Stolen Bell", text: "Elder Nadia is sitting on the tower steps.", x: G.flags.nadiaAtTower ? 15 : 12, y: G.flags.nadiaAtTower ? 42 : 39 };
  };
  const _interactP = interact;
  interact = function () {
    const f = G.flags;
    if (G.stage === 0 && f.pro === "dusk") { const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE); for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [0, 0]]) if (get(tx + dx, ty + dy) === T.WELL) { openDialog("pro_sleep"); return true; } }
    return _interactP();
  };
  const _act2TriggersP = act2Triggers;
  act2Triggers = function () { _act2TriggersP(); if (G.stage === 0 && G.flags.pro === "night" && !G.flags.houndsDone && near({ x: PRO_TOWER.x * TILE + 8, y: (PRO_TOWER.y + 1) * TILE + 8 }, 40)) once("theftPrompt", () => { if (G.flags.theftSeen) { openDialog("pro_theft2"); return; } G.flags.theftSeen = true; playCine(THEFT_ARRIVE, () => openDialog("pro_theft2"), { music: "cine_dread" }); }); };
  const _bossEndP = act2BossEndB;
  act2BossEndB = function (boss) { if (boss === "houndg") { G.flags.houndsDone = true; save(); setTimeout(() => playCine(THEFT_FALL, () => openDialog("pro_after2"), { music: "cine_grief" }), 400); return; } return _bossEndP(boss); };
  // Lio is remembered everywhere afterwards
  const _chronicleP = chronicle;
  chronicle = function () { const P = _chronicleP(); if (G.flags.lioDead && P[0]) P[0] = ["The Theft", "On the last dry night of the year, men in Guild coats cut the Rain Bell from its tower in Kessa. Lio, the Elder's grandson, eight years old, held on to the bell-rope and would not let go. The village sent its courier, Sable, a foundling of the salt, to bring the Bell home. This history begins with a boy who held on, and a woman who was sent."]; return P; };
  const _extraFatesP = extraFates;
  extraFates = function () { const out = _extraFatesP(); if (G.flags.lioDead) out.unshift("At the first rain, Elder Nadia climbed the black tower and rang the Bell herself: three times, slow, like the old song. For Lio. Then the whole of Kessa went out and danced in the mud, and nobody had to share a cup again."); return out; };
  const _epiNadia = EPI.nadia;
  EPI.nadia = () => G.flags.lioDead ? "(Nadia is planting beans at the foot of the bell tower.) I rang it. The first ring. Three times, slow. I got the tones wrong, the way he always did. ...It sounded right. Your mother would be proud of you, Sable. So would he. He'd tell everyone you taught him." : _epiNadia();
  const _memorialP = memorialDialog;
  memorialDialog = function () { _memorialP(); if (G.flags.lioDead) D.memorial_0.text += " At the very top, older and deeper than the rest, someone has carved a name and three words: LIO. HE HELD ON."; renderDialog(); };
  MIRAGES.unshift({ id: "lio", when: () => G.flags.lioDead, look: { robe: "#4a7a9a", hair: "#3a2a1e", skin: "#d9a070", style: { hair: "fringe" } }, who: "Lio", text: "Did they ring it yet? When it rains? ...I held on, Sable. Like a courier. You can let go now. That's allowed too." });
  BANTER.push(
    { id: "bl1", need: ["ilse"], where: "old", dead: null, lines: [["ilse", "Lio used to bring me the bent nails from the tower to straighten. Said the Bell shouldn't have crooked nails holding it up."], ["sable", "He'd have been a good courier."], ["ilse", "He'd have been a good anything. That's what makes me want to break things."]] },
    { id: "bl2", need: ["maru"], lines: [["maru", "The boy who rang your Bell. I heard him humming the three tones once, at the Well festival."], ["sable", "He never got them right."], ["maru", "He got them almost right. Almost is how everyone sings them, Sable. Only the gods get them right, and nobody wants to dance to the gods."]] },
  );
  BANTER.forEach(b => { if (b.id === "bl1" || b.id === "bl2") b.lio = true; });
  const _banterReadyP = banterReady;
  banterReady = function () { const b = _banterReadyP(); return b && b.lio && !G.flags.lioDead ? null : b; };

