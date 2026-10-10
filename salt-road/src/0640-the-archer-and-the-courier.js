  // ================================================================== THE ARCHER AND THE COURIER
  // A love story with Rook, built on his bonds. Five quiet scenes at the fire. If Sable gives him her whistle
  // before the marsh, the whistle is how she finds him inside Old Gulp, and he lives. Otherwise he dies as before,
  // and the ending remembers who leaves the arrows on his grave.
  const love = () => G.flags.love || {};
  const setLove = o => { G.flags.love = { ...love(), ...o }; save(); };
  const loveOn = () => love().n > 0 && !love().declined;
  const rookSavable = () => love().token && loveOn() && G.members.includes("rook");
  const HEARTS = [
    { id: "h1", title: "Night Watch", when: () => G.stage >= 4 && (G.flags.bonds || {}).rook >= 1, lines: [
      [null, "(It's Rook's watch, but he hasn't moved from the fire in an hour.)"],
      ["rook", "Can I ask you something? Why a courier? You're fast, you're stubborn, you can take a hit. The Guild would have paid you triple."],
      ["sable", "Nadia found me on a rock in the salt when I was two. No name, no letter. Just a tin whistle on a string round my wrist. Everything else in the world seemed to have somewhere it was going. Letters always do."],
      ["rook", "(He's quiet for a while.) Voss found me when I was ten. You were found at two. I think you got the better finder."]],
      opts: [["\"Sit with me till your watch ends.\"", true, "(He moves over to make room on the warm salt. Neither of you says anything else.)", null],
        ["\"Get some sleep, Rook.\"", false, "(He nods. He's still awake when you close your eyes.)", null]] },
    { id: "h2", title: "The Blue Thread", when: () => G.stage >= 5 && (G.flags.bonds || {}).rook >= 2, lines: [
      [null, "(Rook is fletching arrows. The thread is blue, the same blue as your scarf, which tore on a pillar in the Cathedral. He doesn't mention it.)"],
      ["rook", "Ilse told me about the medicine. The girl in the storm. (He doesn't look up.) You carry everybody's letters, and you carry that too. Who carries yours?"]],
      opts: [["\"Maybe you could.\"", true, "(He doesn't answer. He finishes the arrow, and puts it in your quiver instead of his.)", null],
        ["\"Nobody. That's the job.\"", false, "Then it's a bad job. (He goes back to his fletching.)", "rook"]] },
    { id: "h3", title: "Lanterns over Oru", when: () => G.stage >= 7 && (G.flags.bonds || {}).rook >= 3 && !G.flags.gulpDead, lines: [
      [null, "(The roof tiles are still warm from the day. You and Rook sit with your legs over the edge, watching the lanterns climb.)"],
      ["rook", "Never thought I'd see them from up here. From the high streets. We always figured the people up here didn't look."],
      ["rook", "I can't stay in Oru, after. They hang Guild deserters in that square. I was thinking of Kessa. (A pause.) If there's room."]],
      opts: [["\"There's room. Stay.\"", true, "(He lets out a breath he's been holding since the Grove. His hand finds yours on the tiles, and stays there.)", null],
        ["\"Ask me again when the Bell is home.\"", true, "(He nods slowly.) When the Bell is home. ...I'll ask.", "rook"],
        ["\"Kessa takes anyone in. It took me. You'll have friends there.\"", "decline", "(A pause. Then he bumps your shoulder with his.) Friends. That's more than a man like me gets to expect. ...Thank you, courier.", "rook"]] },
    { id: "h4", title: "The Whistle", when: () => G.stage >= 7 && !G.flags.gulpDead && loveOn() && love().h3, lines: [
      [null, "(The marsh is close. You can smell it. You take the tin whistle from around your neck: the one you were found with. The only thing that was ever yours before you were anybody.)"],
      ["sable", "Couriers use these in salt-storms. Three short notes. I've never lost a letter, Rook. I always find where things are going. If you're ever lost, blow it, and I'll come."],
      ["rook", "(He turns it over in his fingers.) And if I'm somewhere you can't follow?"]],
      opts: [["\"Then blow it anyway.\"", true, "(He doesn't thank you. In the orphanage they thanked the Guild for everything, every meal and every beating. He just puts the cord over his head, and tucks the whistle inside his shirt.)", null]],
      done: () => ({ token: true }) },
    { id: "h5", title: "Down There", when: () => G.stage >= 9 && G.flags.rookSaved && G.members.includes("rook"), lines: [
      [null, "(Rook's hands still shake. He shoots anyway. Tonight he's holding a cup of tea with both of them, and not drinking it.)"],
      ["rook", "When I was inside it, in the dark, with the others... I kept thinking about Aba. The way he looked at me. And I thought: that's fair. That's where I belong. Down here, with the ones I let die."],
      ["rook", "Then I heard you coming."]],
      opts: [["\"Nobody belongs down there. Not even you.\"", true, "(He looks at you for a long time. Then he leans his forehead against yours, and stays there until the fire burns down.)", null],
        ["(Say nothing. Take his hands until they stop shaking.)", true, "(It takes a long time. When they're still, he doesn't let go.)", null]] },
  ];
  // each option: [text, warm (true, false or "decline"), reply, who speaks the reply (null for a stage direction)]
  HEARTS.forEach(h => buildTalk(`love_${h.id}_`, h.lines, "(What do you say?)", h.opts.map(([t, warm, reply, who]) => ({ t, who, reply, act: () => {
    const l = love(); setLove({ [h.id]: true, n: (l.n || 0) + (warm === true ? 1 : 0), declined: l.declined || warm === "decline", ...(h.done ? h.done() : {}) });
    updateHud();
  } }))));
  const heartReady = () => G.members.includes("rook") && !love().declined && HEARTS.find(h => !love()[h.id] && h.when());
  REST_SCENES.push({ id: "rook", prio: () => beforeGulp() ? 70 : 40,
    run: () => { const h = heartReady(); if (!h) return false; cardThen("By the fire", h.title, "Rook", `love_${h.id}_0`); return true; } });
  let nudgeT = 0;
  const _updateL = update;
  update = function (dt) {   // a nudge, once per scene, so a player who never rests doesn't miss it; checked every few seconds
    _updateL(dt);
    if (mode !== "play" || !G || !G.stage || (nudgeT -= dt) > 0) return;
    nudgeT = 3;
    const h = heartReady(); if (h && love().nudged !== h.id) { setLove({ nudged: h.id }); setTimeout(() => toast("Rook has been quiet all day. Maybe rest at a fire tonight."), 1500); }
  };

  // ---- Old Gulp: the whistle
  Object.assign(D, {
    gulp_love0: say(null, "(From inside Old Gulp: three short notes of a courier's whistle. Weaker now.)", "gulp_love1"),
    gulp_love1: say(null, "(You don't wait for it to finish dying. You go in through the throat sac with a knife and both arms, into the heat and the acid and the faces, and you find a hand holding a tin whistle, and you pull.)", "gulp_love2"),
    gulp_love2: say("rook", "(He comes out burned white, bow snapped, coughing black water. Alive.) ...Told you I could make the shot. Didn't say from which side.", "gulp_love3"),
    gulp_love3: say("sable", "You blew it. I said I'd come.", "gulp_love4"),
    gulp_love4: say("rook", "You said anyway. (He turns his head, and finds Ilse.) Ilse. I held the torch, that night on the Flats. I never said sorry properly. I'm saying it now. I'll keep saying it. Turns out I get to.", "gulp_love5"),
    gulp_love5: say("ilse", "(Ilse sits down hard in the mud next to him, and puts her ruined hand on his chest, over the whistle, to feel it rise and fall.) ...Say it tomorrow, archer. Say it every day. I'll get sick of it eventually.", null, () => {
      G.flags.rookSaved = true; const h = G.party.rook; if (h) { h.hp = Math.max(1, Math.round(h.maxHp * 0.3)); h.maxHp = Math.max(10, h.maxHp - 4); }
      save(); updateHud();
      cardThen("He lives", "Rook", "His hands shake now, and there are white burns up both his arms that will never fade. He wears your whistle on its cord and does not take it off. When anyone asks about the scars, he says somebody came back for him, and leaves it at that.", "warden2_love");
    }),
    warden2_love: say("warden2", "(The ground trembles. The Warden walks out of the rain, crystal steaming, and looks at Rook alive in the mud, and then at the burns on your arms.) Four hundred years ago, a king went down into the water after his people. He did not come back up. ...You did. Remember that, courier, when you meet him.", "warden2_1"),
  });
  // if love was spoken but the whistle never given, he still dies, and knows it
  Object.assign(D, {
    gulp_after3l: { who: "rook", text: "(His hand finds yours. It is already cold.) Would there have been room? In Kessa. ...Tell me there would. It doesn't have to be true.", choices: [
      { t: "\"There was always room.\"", go: "rook_diel" }, { t: "\"It's true, Rook. That's the worst part.\"", go: "rook_diel" } ] },
    rook_diel: say("ilse", "(Ilse kneels and closes his eyes with her ruined hands. She doesn't say anything clever. After a while she says:) We'll carry your bow, archer.", null, () => rookDies()),
  });
  const _openDialogL = openDialog;
  openDialog = function (id) {
    if (id === "gulp_after" && rookSavable()) id = "gulp_love0";
    return _openDialogL(id);
  };
  D.gulp_after2.go = () => loveOn() ? "gulp_after3l" : "gulp_after3";

  // ---- Aba's widow: if he lives, he carries his own letter
  Object.assign(D, {
    rookaba_0: say(null, "(Rook stops at the widow's door for a long time. Then he knocks, and when she opens it, he kneels in the salt.)", "rookaba_1"),
    rookaba_1: say("rook", "My name is Rook. I was Voss's archer. I held the torch on the Flats the night your husband died. He threw your grandson onto a rock and then he looked at me. I have a letter, but I thought... he looked at me. You should get to, too.", "rookaba_2"),
    rookaba_2: say("abawidow", "(She looks at him for a long, long time, exactly the way Aba must have.) ...The boy says a man in a Guild coat carried him to Kessa on his back, the next morning. Wouldn't give his name. Was that you?", "rookaba_3"),
    rookaba_3: say("rook", "(He can't answer. He nods.)", "rookaba_4"),
    rookaba_4: say("abawidow", "Then get up off my step. I'm not going to forgive you today. Come back next year, and the year after, and bring your courier, and we'll see.", null, () => { G.flags.rookAba = true; save(); updateHud(); toast("Rook will come back next year. And the year after."); }),
  });
  const _dialogForL = dialogFor;
  dialogFor = function (n) {
    if (n.id === "abawidow" && G.flags.rookSaved && G.members.includes("rook") && G.flags.rookLetter && !G.flags.rookAba) return "rookaba_0";
    return _dialogForL(n);
  };

  // ---- pixel cinema: lanterns over Oru, and the whistle in the dark
  const ROOK_L = () => HEROES.rook.look, SABLE_L = () => HEROES.sable.look;
  PX.lanterns = (g2, t, n = 22) => { for (let i = 0; i < n; i++) { const life = (t * 0.07 + hash(i, 41)) % 1, x = (hash(i, 43) * VIEW_W + Math.sin(t + i) * 6) | 0, y = 170 - life * 190; PR(g2, x - 1, y - 1, 5, 6, "#3a1a10"); PR(g2, x, y, 3, 4, i % 3 ? "#ffcf4a" : "#ff9a3a"); PR(g2, x + 1, y + 1, 1, 2, "#fff4c8"); } };
  const LANTERNS = [
    { dur: 5.0, fadeIn: 0.8, line: [null, "The night the gates open, the poor quarter of Oru lets paper lanterns go, one for everyone the gate kept out."], draw: (g2, t) => {
      nightBg(g2, t); PX.moon(g2, 60, 30, 10); PX.lanterns(g2, t);
      PX.village(g2, 150, "#141024"); PR(g2, 0, 152, VIEW_W, 40, "#1a1430");
      PR(g2, 110, 132, 120, 22, "#2a2040"); for (let x = 110; x < 230; x += 6) PR(g2, x, 132, 5, 2, "#3a2e58");   // the roof ridge
      chibi(g2, SABLE_L(), { dir: "up" }, 2, 150, 150); chibi(g2, ROOK_L(), { dir: "up" }, 2, 186, 150);
    } },
    { dur: 4.4, line: ["Rook", "I grew up four streets that way. We used to count the lanterns from the orphanage and guess who they were for."], draw: portraitShot(HEROES.rook.look, { eyes: "down", light: "#ffcf4a", lightFrom: "left" }, (g2, t) => { nightBg(g2, t); PX.lanterns(g2, t, 14); }) },
  ];
  const WHISTLE = [
    { dur: 4.2, fadeIn: 0.5, sound: "hit", line: [null, "Old Gulp shudders and goes still."], draw: (g2, t) => { AREA_BG.marsh(g2, t); PX.rain(g2, t, 90); monster(g2, "gulp", 1, 160, 176, { hurt: t < 0.6 }); } },
    { dur: 4.0, line: [null, "And from somewhere inside it, faint and wet: three short notes of a courier's whistle."], draw: (g2, t) => {
      AREA_BG.marsh(g2, t); monster(g2, "gulp", 1, 160, 176);
      for (let i = 0; i < 3; i++) { const a = t - i * 0.7; if (a > 0) drawEmote(g2, 150 + i * 12, 96 - a * 10, "note", Math.max(0, 1 - a / 3)); }
    } },
    { dur: 3.6, shake: 2, line: ["Sable", "(You don't wait for it to finish dying.)"], draw: portraitShot(HEROES.sable.look, { brows: "fierce", mouth: "grit", smudge: true }, AREA_BG.marsh) },
    { dur: 4.4, fadeOut: 1.0, line: [null, "You drag him out into the rain. He is burned white, and his bow is snapped, and he is breathing."], draw: (g2, t) => {
      AREA_BG.marsh(g2, t); PX.rain(g2, t, 140);
      chibi(g2, ROOK_L(), { rot: 1 }, 2, 176, 176); chibi(g2, SABLE_L(), { dir: "left" }, 2, 204, 172);
    } },
  ];
  CINE_BEFORE.love_h3_0 = { shots: LANTERNS, music: "cine_lullaby" };
  CINE_BEFORE.gulp_love0 = { shots: WHISTLE, music: "cine_storm" };

  // ---- the journal, the Chronicle and the ending
  const _extraJournalL = extraJournalHtml;
  extraJournalHtml = function () {
    const l = love(); if (!l.n && !l.declined) return _extraJournalL();
    const seen = HEARTS.filter(h => l[h.id]).map(h => h.title);
    const state = l.declined ? "A friend. He'll come to Kessa." : G.flags.rookSaved ? "He wears your whistle. His hands shake. He shoots anyway." : G.flags.rookDead ? "There would have been room." : l.token ? "He wears your whistle, under his shirt." : l.h3 ? "He asked if there was room in Kessa." : "Some nights he doesn't wake you for your watch.";
    return _extraJournalL() + `<h3>Rook</h3><p>${state}</p><p class="dim" style="font-size:13px">${seen.join(" · ")}</p>`;
  };
  const _chronicleL = chronicle;
  chronicle = function () {
    const P = _chronicleL(), l = love();
    if (l.n >= 2 && !l.declined) P.splice(P.length - 1, 0, ["The Archer and the Courier", G.flags.rookSaved
      ? "Before the marsh, the courier gave the archer the tin whistle she had been found with. When Old Gulp swallowed him, he blew it from inside the dark, and she went in after him. Of everything in this chronicle, it is the only time I know of that someone went back down into the water for another, and came up again."
      : G.flags.rookDead ? "The archer asked the courier if there was room for him in Kessa. He died in the marsh before he could find out. Every spring there is a new arrow on his grave at Reedholm, fletched with blue thread. Everyone knows who leaves them."
      : "Somewhere between the Grove and the gate, the courier and the archer stopped sitting on opposite sides of the fire. Nobody remarked on it."]);
    return P;
  };
  const _extraFatesL = extraFates;
  extraFates = function (k) {
    const out = _extraFatesL(k), l = love(); if (l.declined || !(l.n >= 2)) return out;
    if (G.flags.rookSaved && G.members.includes("rook")) out.push({
      ring: "Rook comes to Kessa. He re-hangs the bell-rope Lio died holding, and teaches the village children to shoot at targets and never at people. Some evenings he and Sable walk out to the edge of the salt and don't say much.",
      sleep: "Rook comes to Kessa. Every year he and Sable carry a letter to Aba's widow, and every year she lets him a little further past the door.",
      keeper: "Rook lives out his life in a hut at the end of Nell's pier. On quiet nights he sits with his feet in the water, so that someone below knows someone above is still there.",
      crown: "Rook goes under with everyone else, the tin whistle still round his neck. In the perfectly silent kingdom nothing is ever lost again, and nothing is ever found.",
      seat: "Rook leaves the high ground the week Sable takes the Guild's seat. He grew up in a Guild orphanage; he knows what that chair does to people. He leaves the whistle on her desk.",
    }[k] || "Rook comes to Kessa.");
    else if (G.flags.rookDead) out.push("Every spring there is a new arrow on Rook's grave at Reedholm, fletched with blue thread. Everyone knows who leaves them.");
    return out;
  };
  // his epitaph and the dream remember the whistle, if it was given
  const _rookDiesL = rookDies;
  rookDies = function () { _rookDiesL(); if (loveOn()) G.flags.epitaphs = { ...(G.flags.epitaphs || {}), rook: "Rook, the deserter archer. Held the torch on the Flats; made the shot from inside the Bog King. There would have been room." }; save(); };
  ACHIEVEMENTS.push(["lanterns", "Lanterns over Oru", "Answer Rook's question on the rooftop.", () => !!(G.flags.love && G.flags.love.h3 && !G.flags.love.declined)],
    ["whistle", "Somebody Came Back", "Save Rook from inside Old Gulp.", () => !!G.flags.rookSaved]);

