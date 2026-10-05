  // ================================================================== NINE CUPS: THE WELL AT TAMAR'S REST
  // Faith and a social wrong in the same place. The well is failing; its keeper, Brother Oswin, sincerely believes
  // the Nine Sisters' water belongs to the Sisters' faithful, and the Guild still takes a water-tithe from it. The
  // salt-rakers, reed-boat people bound by old Guild salt contracts, pray to the sea and come last in line.
  // Sable can argue from inside Oswin's own faith, pay the tithe, or force the well open; each leaves a different
  // Tamar's Rest behind, and a question for the fire: what is faith for?
  const inParty = id => G.members.includes(id) && !(G.flags.fallen || []).includes(id);
  const adaLine = (spoken, written) => () => G.flags.adaVoice ? `(Ada writes on her slate and holds it up: '${written || spoken}')` : spoken;
  const knowsNine = () => (G.flags.lore || []).includes(1) || inParty("ada") || inParty("maru");
  const cupDone = () => ["open", "paid", "forced"].includes(G.flags.cup);
  const CUP_LOOK = {
    farah: { robe: "#3a6a6a", hair: "#1b1633", skin: "#8a5a33", style: { hair: "veil", dress: true, eye: "#3a2a1a" } },
    oswin: { robe: "#8a8a90", hair: "#5a4a3a", skin: "#d8a878", style: { hair: "hood", hood: "#6a6a70", eye: "#4a4a6a" } },
    hanne: { robe: "#6a5a7a", hair: "#e8e4f0", skin: "#c8a080", style: { hair: "veil", dress: true, eye: "#4a3020" } } };
  npc2({ id: "farah", name: "Farah, Salt-Raker", x: 39, y: 116, look: CUP_LOOK.farah, show: () => G.stage >= 3 });
  npc2({ id: "oswin", name: "Brother Oswin", x: 80, y: 109, look: CUP_LOOK.oswin, show: () => G.stage >= 3 && G.flags.cup !== "forced" });
  npc2({ id: "hanne", name: "Hanne of the Nine", x: 80, y: 109, look: CUP_LOOK.hanne, show: () => G.flags.cup === "forced" });
  for (const id of ["farah", "oswin", "hanne"]) SPEAKERS[id] = NPCS.find(n => n.id === id).name;
  Object.assign(ACTS, {
    farah: { draw: (P, t) => { P(-22, -5, 11, 4, "#c8b08a"); P(-13, -6, 4, 4, "#8a5a33"); if (!cupDone() && Math.sin(t * 0.6) > 0.7) P(-12, -9, 1, 1, "#e8e4f0"); } },   // her boy, asleep in the cart's shade
    oswin: { draw: (P, t, n, g2, x, y) => { P(9, -10, 5, 6, "#6b5a4a"); if (Math.sin(t * 0.9) > 0.6) drawEmote(g2, x + 8, y - 30, "dots"); } },                      // the counting cup
    hanne: { draw: (P) => { P(9, -10, 5, 6, "#6b5a4a"); } },
  });
  const tithe = () => G.flags.tollDead
    ? "The Guild's clerk stopped coming when the tollhouse went quiet. I should feel lighter. I don't. The rope still goes down."
    : "And the Guild still sends a clerk from the tollhouse for its water-tithe, forty cups a week, as if Hollis never died. I pay it, or they close the well.";
  const ninthVoice = () => inParty("maru")
    ? "(Maru steps up to the rim.) The ninth sister kept singing after she gave her voice away, Brother. She became the first storm-singer. My grandmother's grandmother's grandmother. She didn't sing for the faithful. She sang for whoever was on the road when the storm came."
    : inParty("ada") ? adaLine("(Ada puts her hand on the rope.) They gave their voices, Brother. I gave mine too, in the salt, to put my sisters to rest. Nobody asked me whether the dead were faithful. A voice goes where it's needed. That's all a vow is.",
      "They gave their voices. So did I, in the salt. Nobody asked if the dead were faithful. A voice goes where it is needed. That is all a vow is.")()
    : "(You tell him what the tablet on the Flats says: nine sisters, one year of voice each, so that the water would be sweet. Not a word about who was allowed to drink it.)";
  Object.assign(D, {
    farah_0: say("farah", "(A woman rakes the far pan. A boy sleeps in the shade of her cart, lips cracked white.) You're the courier. Then you have water, or you know where it is. The well at Tamar's Rest won't give me any.", "farah_1"),
    farah_1: { who: "farah", text: "Brother Oswin gives the water at dawn: first to whoever says the Vow of the Nine with him. I won't say it. My people prayed to the sea for a thousand years, on boats of reed. The sea left. We still pray to it. I won't stand in front of the Nine and lie to them. Lying to someone's gods in their own house... that's worse than thirst. Isn't it?", choices: [
      { t: "\"I'll talk to Oswin.\"", go: "farah_2" },
      { t: "\"Say the words. Water first, truth later.\"", go: "farah_nope" },
      { t: "Give the boy a Salve.", go: "farah_salve", req: () => (G.items.salve || 0) > 0, reqText: "a Salve" } ] },
    farah_nope: say("farah", "(She looks at you for a long moment.) My grandmother said that when the Guild brought the salt contracts. 'Sign. Bread first, truth later.' We signed. That was sixty years ago. One cart of salt, one cup of water. We're still waiting for later.", "farah_2"),
    farah_salve: say("farah", "(She rubs it on his lips and he stirs, and swallows, and sleeps again.) Thank you. It isn't water. But thank you.", "farah_2", () => { G.items.salve--; save(); updateHud(); }),
    farah_2: say("farah", "He isn't a bad man, Oswin. That's the worst part. He's frightened, and he thinks the Nine are frightened too.", null, () => { if (!G.flags.cup) G.flags.cup = "asked"; save(); updateHud(); }),
    farah_wait: say("farah", "Dawn, dusk, dawn. The boy asks me if the sea is coming back. I tell him yes. I don't know which of us I'm lying to."),
    farah_open: say("farah", "He brought the cup to me himself. Said his prayer over it, quietly, not at me. I said mine over it too. It's the same water. It doesn't mind."),
    farah_paid: say("farah", "We drank this week. Next week, who knows. Charity is a good roof, courier. It's a bad foundation."),
    farah_forced: say("farah", "The boy is better. Oswin is gone. The old women look at me as if I stole something. Maybe I did. It didn't feel like stealing. It didn't feel like justice, either."),

    oswin_pre: say("oswin", "(A thin man in well-keeper's grey draws water, counting cups under his breath.) Nine for the faithful at dawn, nine at dusk. Blessed be the Nine, who gave their voices. Can I help you, traveller?"),
    oswin_0: say("oswin", "(Oswin doesn't stop counting.) You've spoken to Farah. Everyone does, eventually. Then they look at me the way you're looking at me now.", "oswin_1"),
    oswin_1: say("oswin", () => `The well is dying, courier. Every week the rope goes further down. ${tithe()}`, "oswin_2"),
    oswin_2: { who: "oswin", text: "So I asked the Nine what to do, and the answer I heard was: the Sisters' water for the Sisters' people. If I'm wrong, I'm wrong in front of everyone I love. If I'm right, and I pour the Sisters' water for people who mock them... (He stops.) Tell me what you'd do. I mean it. I've run out of people to ask.", choices: [
      { t: "\"The Nine gave their voices to make the water sweet. The tablet doesn't say for whom.\"", go: () => inParty("maru") ? "oswin_a0m" : inParty("ada") ? "oswin_a0a" : "oswin_a0", req: knowsNine, reqText: "the Nine Sisters' tablet, or Ada or Maru with you" },
      { t: "\"Let me pay the tithe for the rakers.\" (40 coin)", go: "oswin_b", req: () => G.coins >= 40, reqText: "40 coin" },
      { t: "\"Open the well to everyone, or I will.\"", go: "oswin_c" },
      { t: "\"I don't know. I'm sorry.\"", go: "oswin_d" } ] },
    oswin_a0m: say("maru", ninthVoice, "oswin_a1"), oswin_a0a: say("ada", ninthVoice, "oswin_a1"), oswin_a0: say(null, ninthVoice, "oswin_a1"),
    oswin_a1: say("oswin", "(Oswin sets the cup down. His hands are shaking.) I've read that tablet a hundred times. I read it as a price: they paid, so the water is theirs to give, and mine to guard. ...You read it as a gift. And a gift you guard isn't a gift any more, is it. It's a ledger.", "oswin_a2"),
    oswin_a2: say("oswin", () => G.flags.tollDead ? "And there's no clerk left to pay. I've been rationing faith because I was afraid of arithmetic." : "The clerk will still come. Then let the clerk come for me. The Sisters didn't give their voices so the Guild could sell the echo.", "oswin_a3"),
    oswin_a3: say(null, "(At dusk Oswin draws the cups himself and walks them down the line: the faithful, the rakers, Farah, the boy. He says the Vow of the Nine over each cup, quietly, to himself. Nobody has to say it back.)", null, () => { G.flags.cup = "open"; Music.sound("item"); toast("The well at Tamar's Rest is open to everyone."); save(); updateHud(); }),
    oswin_b: say("oswin", "(Oswin takes the coins slowly.) This buys the rakers a week. And the Guild a week. (He drops them in the tithe box anyway.) Thank you, courier, truly. But you're buying water for people I decided don't deserve it, from people who decided it's theirs to sell. Tomorrow the rule is still the rule.", null, () => { G.coins -= 40; G.flags.cup = "paid"; save(); updateHud(); }),
    oswin_c: say("oswin", "(Oswin looks at your blade, then at the rope, and steps aside.) Then take it. I won't fight you. I won't fight anyone. (He walks off down the road with his hood up. At the rim, the faithful stare at you, and one of the old women is crying.)", "oswin_c2"),
    oswin_c2: say(null, "(The rakers drink. Farah fills her skin and doesn't meet your eye. \"Thank you,\" she says. \"I think.\" Somebody still has to keep the well tomorrow.)", null, () => { G.flags.cup = "forced"; save(); updateHud(); }),
    oswin_d: say("oswin", "(Oswin nods, as if that were the most honest thing anyone has said to him all week.) Neither do I. Come back if you find out."),
    oswin_open: say("oswin", "Nine cups at dawn, nine at dusk, and as many more as the rope allows. Whoever is in line. The Nine can argue with me about it when I get there. I think they'll lose, and I think they'll be glad."),
    oswin_paid: say("oswin", "The tithe box is heavy this week. Farah drank. The rule stands. I pray about it every night and the answer never changes, and I'm starting to think that's my own voice I hear, not theirs."),
    hanne_0: say("hanne", "Brother Oswin used to count every cup out loud. Now nobody counts. It's fairer. I hate it. Isn't that terrible? (She draws a cup for a raker's child anyway, and says the Vow over it under her breath.)"),
  });
  const _dialogForCup = dialogFor;
  dialogFor = function (n) {
    const c = G.flags.cup;
    if (n.id === "farah") return !c ? "farah_0" : c === "asked" ? "farah_wait" : `farah_${c}`;
    if (n.id === "oswin") return !c ? "oswin_pre" : c === "asked" ? "oswin_0" : c === "open" ? "oswin_open" : "oswin_paid";
    if (n.id === "hanne") return "hanne_0";
    return _dialogForCup(n);
  };
  // the fire's question, once Tamar's Rest has been answered one way or another
  QUESTIONS.push({ id: "q8", get stage() { return cupDone() ? 5 : 99; }, need: ["ada", "maru"], axis: "faith", title: "What Faith Is For",
    talk: [[null, "(Tonight nobody mentions Tamar's Rest. Then Maru does.)"],
      ["maru", "Oswin's Nine are my people's Nine. The first storm-singer was the ninth sister. I grew up singing her songs and never once asked what she believed. Only what she did."],
      ["ada", adaLine("I believed everything they taught me, for twenty years. Then the Choir used its hymns to keep a king asleep and a valley drowning. I don't know what I believe now. I still pray. I don't know to whom.",
        "I believed everything they taught me for twenty years. Then the hymns kept a valley drowning. I still pray. I do not know to whom.")],
      ["maru", "So what is it for, courier? Faith. If it can dig a well and lock it in the same breath."]],
    ask: "What is faith for?",
    opts: [["door", "\"For strangers. The Nine gave their voices to people they'd never meet. Faith that only waters its own is just thirst with a hymn.\"", "maru", "(Maru's fingers find a note on nothing, and hold it.) She'd have liked you, the ninth sister. She'd have made you carry water for a year first. But she'd have liked you."],
      ["question", "\"For the asking. Ada, you pray without knowing who's listening. That isn't less faith. It might be all of it.\"", "ada", adaLine("(Ada is quiet for a long time.) ...Nobody has ever called my doubt a prayer before. Then I'll keep it.", "Nobody has ever called my doubt a prayer before. Then I will keep it.")],
      ["deeds", "\"I can't see what's above us. I can see Oswin walking the cups down the line. Whatever faith is, that's the only part of it I'll ever be able to judge.\"", "maru", "Then judge gently, courier. Most people are carrying more than anyone can see."]] });
  Object.assign(CREED_TEXT, {
    door: "that faith is a door held open for strangers, not a wall around the faithful",
    question: "that doubt kept honestly is a kind of prayer",
    deeds: "that faith is judged by what it does for others, down here where it can be seen",
  });
  { const q = QUESTIONS[QUESTIONS.length - 1];
    buildTalk(`cq_${q.id}_`, q.talk, `(${q.ask})`, q.opts.map(([key, t, who, reply]) => ({ t, who, reply, act: () => {
      G.flags.creed = { ...(G.flags.creed || {}), [q.axis]: key }; save(); updateHud(); toast(`The Courier's Creed: "${q.title}" written in the journal.`);
    } }))); }
  const _extraFatesCup = extraFates;
  extraFates = function (k) {
    const out = _extraFatesCup(k), c = G.flags.cup;
    if (c === "open") out.push("At Tamar's Rest the well still gives nine cups at dawn and nine at dusk, to whoever is in line. The rakers and the faithful argue about theology over it, loudly, and share the rope.");
    if (c === "paid") out.push("The well at Tamar's Rest keeps its rule. Every few months a coin arrives in the tithe box with no name on it, and the rakers drink that week.");
    if (c === "forced") out.push("Brother Oswin never comes back to Tamar's Rest. Hanne keeps the well now. Nobody counts the cups, and nobody says the Vow out loud any more, and she isn't sure that is better.");
    return out;
  };
  const _extraJournalCup = extraJournalHtml;
  extraJournalHtml = function () {
    const c = G.flags.cup, t = { asked: "Farah the salt-raker is refused water at Tamar's Rest because she won't swear the Vow of the Nine. Talk to Brother Oswin at the well.",
      open: "✓ The well at Tamar's Rest is open to everyone. Oswin walks the cups down the line himself.",
      paid: "✓ You paid the Guild's water-tithe so the rakers could drink. The rule still stands.",
      forced: "✓ You forced the well open. The rakers drink; Oswin is gone." }[c];
    return _extraJournalCup() + (t ? `<h3>Nine Cups</h3><ul><li class="${c === "asked" ? "" : "done"}">${t}</li></ul>` : "");
  };
  ACHIEVEMENTS.push(["ninecups", "Nine Cups", "Open the well at Tamar's Rest to everyone, without drawing a blade.", () => G.flags.cup === "open"]);

