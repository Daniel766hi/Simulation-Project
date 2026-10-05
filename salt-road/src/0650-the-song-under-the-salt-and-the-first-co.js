  // ================================================================== THE SONG UNDER THE SALT, AND THE FIRST COURIER
  // Four notes run through the valley: Ilse's "forging song", the tune Ada's grandmother hummed, what Maru hears
  // under the salt. They are the drowned asking their question. At the King's throne the player hears where they come from.
  BANTER.push(
    { id: "s1", need: ["maru"], where: "old", night: true, when: () => G.stage >= 3, lines: [["maru", "Sable. Stop walking a moment. ...There. Under the salt. Do you hear it?"], ["sable", "The wind."], ["maru", "Four notes, over and over. The same as Ilse's forging song. But it isn't forging. It goes up at the end, like a question nobody's answering."]] },
    { id: "s2", need: ["ada"], when: () => G.flags.choirDead, lines: [["ada", "(Ada writes on her slate: 'The Choirmaster's hymn had no words. But I knew the tune. My grandmother hummed it doing the washing.')"], ["sable", "Four notes? Ilse hums it too."], ["ada", "(She rubs it out and writes: 'Everybody hums it. Nobody knows where it came from.')"]] },
    { id: "s3", need: ["warden", "ilse"], when: () => G.stage >= 9, lines: [["warden", "Smith. The four notes you hum. Where did you learn them?"], ["ilse", "My father. He said they came up out of the anvil if you struck it right."], ["warden", "They came up out of the ground. I heard them when I was built, under the water. Many voices at once. It is not a forging song. It is a question, and the living have been humming it for four hundred years without knowing they were asked."]] },
    { id: "s4", need: ["rook", "ilse"], when: () => G.flags.rookSaved, lines: [["rook", "(Rook is humming. He stops when he notices.) ...Inside the toad. They were all doing it. The dead. Four notes."], ["ilse", "My song."], ["rook", "I don't think it was ever yours, smith."]] },
  );
  const heardSong = () => (G.flags.banter || []).some(id => ["b1", "s1", "s2", "s3", "s4"].includes(id)) || (G.flags.fallen || []).includes("maru");
  const kingText = D.king_scene.text;
  D.king_scene.text = () => kingText + (heardSong()
    ? " And all of them, every drowned mouth, are humming. Four notes, rising at the end, never answered. Ilse's forging song. Ada's grandmother's washing song. It was never theirs."
    : " And all of them, every drowned mouth, are humming four notes, rising at the end, never answered.");
  const _extraFatesS = extraFates;
  extraFates = function (k) {
    const out = _extraFatesS(k);
    if ((k === "ring" || k === "sleep") && heardSong()) out.push("Children in Kessa still hum the four notes. They have added a fifth, now, at the end. It goes down instead of up. It sounds like an answer.");
    return out;
  };

  // ---- Teodor carried Aurel's refusal to the Guild, and sold it
  Object.assign(D, {
    hermit5_1b: say("hermit5", "I was a courier, before the valley had a word for it. Aurel gave me his answer to carry to the Guild council: he would not sell the lowlands. Corvin met me on the road, before the council ever sat. He asked what I was carrying.", "hermit5_1c"),
    hermit5_1c: say("hermit5", "He offered me a house on the hill for the letter. Dry ground, for me and mine, forever. I gave it to him. The council never read it. Three weeks later Corvin opened the sluice, and my brother went down into the water with his people, still waiting for an answer I had sold.", "hermit5_1d"),
    hermit5_1d: say("hermit5", "The first time we met, I asked you what a courier carries. I have known the answer for four hundred years. Everything. A courier carries everything, and sets none of it down.", "hermit5_2"),
  });
  D.corvin_scene2.go = "corvin_scene2b";
  D.corvin_scene2b = say("corvin", "Aurel sent his refusal by courier, you know. His own brother, a boy with a satchel. I met him on the road and offered him a house on the hill for it. He took it. Couriers are the most reasonable people in the world. They know exactly what everything weighs.", "corvin_scene3");
  const cairn = LORE.find(l => l.id === 6);
  if (cairn) { const t0 = cairn.text; cairn.text = () => t0 + (G && G.flags.hermitDone ? " At the very bottom, under all the others, is the oldest stone. Someone has finally scratched a name into it: TEODOR." : ""); }

  // ---- the memorial remembers what the courier chose: a few quiet lines between the farewells and her last words
  const BELOW_AT_MEMORIAL = {
    nobody: "(You think about the questions around the fires. You'd answer most of them differently now. Not the last one. Nobody stays below. It stops here.)",
    me: "(You think about the questions around the fires. You said you'd be the one who stays below. You still would. It's quieter than you expected, being ready.)",
    climbers: "(You think about the questions around the fires. Whoever reaches the high ground goes back down. You did. You'd do it again.)",
  };
  const _memorialDialogR = memorialDialog;
  memorialDialog = function () {
    _memorialDialogR();
    const lines = [
      heardSong() && (endKindOf() === "ring" || endKindOf() === "sleep") ? "(Across the square, a child is humming while she works. Four notes, and then a fifth, going down.)" : "",
      G.flags.hermitDone === "rest" ? "(On the rim of the well, where you always sit, there is a small salt stone. You don't remember putting it there.)" : "",
      G.flags.hermitDone === "down" ? "(Far out on the water, just for a moment, you think you see two figures walking together, one of them very old.)" : "",
      BELOW_AT_MEMORIAL[(G.flags.creed || {}).below] || "",
    ].filter(Boolean);
    if (!lines.length) return;
    lines.forEach((text, i) => { D[`memorial_r${i}`] = say(null, text, i < lines.length - 1 ? `memorial_r${i + 1}` : "memorial_last"); });
    for (const k of Object.keys(D)) if (/^memorial_fw\d+$/.test(k) && D[k].go === "memorial_last") D[k].go = "memorial_r0";
  };
  const endKindOf = () => G.flags.epilogue;
  const _finalCreditsR = finalCredits;
  finalCredits = function () {
    _finalCreditsR();
    const n = Object.keys(G.flags.creed || {}).length;
    const el = $("cardText"), end = "Thank you for carrying it all the way.";
    if (n) el.textContent = el.textContent.replace(end, `The Courier's Creed: ${n} of ${QUESTIONS.length} questions answered. ${end}`);
  };

  // ---- Aurel's letter: the delivery Teodor sold, finished four hundred years late by another courier
  D.corvin_after.go = "corvin_letter";
  Object.assign(D, {
    corvin_letter: { who: null, text: "(Under the ledger is a letter, folded small, sealed in green wax with a king's crown. It is addressed TO THE GUILD COUNCIL OF ORU. The seal has never been broken. Aurel's refusal. The letter Teodor carried, and sold, and Corvin kept.)", choices: [
      { t: "Take it. Late is still delivered.", go: null, act: () => { G.flags.aurelLetter = "carry"; save(); updateHud(); toast("You carry Aurel's letter to the council of Oru, four hundred years late."); } },
      { t: "Leave it with the dead.", go: null } ] },
    ines_aurel: say("sable", "(You hold out the green-sealed letter.) One more thing. This was addressed to the council of Oru. It never arrived. The courier who carried it sold it on the road.", "ines_aurel2"),
    ines_aurel2: say("ines", "(She breaks the seal herself, very carefully, as if it might still be warm.) 'To the Guild: I will not sell the lowlands. My people's dead are buried there, and the dead do not move for money. Do what you will. I will not leave them. Aurel.'", "ines_aurel3"),
    ines_aurel3: say("ines", "(For a long moment she says nothing.) I am the council. So it's arrived. (She takes up her pen again, and under the king's name, in small plain letters, writes: Received. We are sorry.) Take them down together, courier. His letter, and our answer.", "ines_ledger3", () => { G.flags.aurelLetter = "answered"; save(); }),
    king_teodor: say("king", "My letter. (The young face looks at it for a long time.) I gave it to my brother. Teodor. He was the fastest runner in the lowlands. I waited for the answer, courier. I waited until the water was at my chin.", "king_teodor2"),
    king_teodor2: { who: "sable", text: "(What do you tell him?)", choices: [
      { t: "\"He sold it. And he spent four hundred years on the salt, asking questions, because of it. He's at rest now.\"", go: "king_teodor_rest", req: () => G.flags.hermitDone === "rest", reqText: "Teodor laid to rest" },
      { t: "\"He sold it. He's on his way down to you now. He wanted to say he was sorry.\"", go: "king_teodor_down", req: () => G.flags.hermitDone === "down", reqText: "Teodor gone to the sea" },
      { t: "\"It was never delivered. Now it is.\"", go: "king_teodor_late" } ] },
    king_teodor_rest: say("king", "(The drowned shape shivers, all of it at once.) Then he was below too, all this time. In his own way. ...Good. Somebody in my family should rest.", "king_apology3"),
    king_teodor_down: say("king", "(Something in the young face gives way.) Then I will wait a little longer. I have had practice.", "king_apology3"),
    king_teodor_late: say("king", "Late. (Almost a laugh.) You couriers. Late is still delivered, is it? ...Yes. I suppose it is.", "king_apology3"),
  });
  D.ines_ledger2.go = () => G.flags.aurelLetter === "carry" ? "ines_aurel" : "ines_ledger3";
  const apologyText = D.king_apology.text;
  D.king_apology.text = () => apologyText + (G.flags.aurelLetter === "answered" ? " Folded inside it is a second letter, older, its green seal broken at last: his own refusal, and under his name, in small plain letters, the council's answer. 'Received. We are sorry.'" : "");
  D.king_apology2.go = () => G.flags.aurelLetter === "answered" ? "king_teodor" : "king_apology3";
  const _extraFatesA = extraFates;
  extraFates = function (k) {
    const out = _extraFatesA(k);
    if (G.flags.aurelLetter === "answered" && G.flags.apologyRead) out.push("Aurel's letter hangs in the council chamber of Oru, beside its answer. Couriers touch the frame for luck before a long run.");
    return out;
  };
  const _extraJournalA = extraJournalHtml;
  extraJournalHtml = function () {
    const a = G.flags.aurelLetter;
    return _extraJournalA() + (a ? `<h3>Aurel's letter</h3><p>${a === "carry" ? "Sealed in green wax, addressed to the council of Oru. Four hundred years late. Take it to Mayor Ines." : G.flags.apologyRead ? "Delivered, answered, and read aloud at the bottom of the sea." : "Delivered. Answered. It goes down to the King with the Apology."}</p>` : "");
  };

