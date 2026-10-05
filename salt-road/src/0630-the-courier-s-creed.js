  // ================================================================== THE COURIER'S CREED: CAMPFIRE QUESTIONS AND THE SALT HERMIT
  // At rest, the companions argue about a question the road has put to them, each from their own wounds, and
  // Sable decides what she believes. The answers become her creed: in the journal, the Chronicle and the ending.
  const QUESTIONS = [
    { id: "q1", stage: 3, need: ["ilse", "maru"], axis: "mercy", title: "The Debt of the Dead",
      talk: [[null, "(The fire is low. Nobody says anything about the Butcher for a long time. Then Ilse does.)"],
        ["ilse", "He was a man once. He had a name, probably a mother. Something made him into that. And we killed the thing, and the man died too, and I don't know how I feel about it."],
        ["maru", "I heard him humming, at the well. A work song. Men who hum work songs were not born butchers. But the travellers in the palms were not born meat, either."],
        ["ilse", "So which is it, courier? Does what a man suffered pay for what he did? Or does the debt stay, no matter who's to blame?"]],
      ask: "What do you believe?",
      opts: [["justice", "\"He chose what he became, every day he chose it. Understanding him doesn't undo it. Justice isn't cruelty.\"", "maru", "(Maru nods slowly.) Then we owe it to the travellers to remember they were people too. That's what justice is for: the ones who can't speak any more."],
        ["mercy", "\"Something made him. I would rather have saved the man than killed the monster. Next time, I'll try.\"", "ilse", "(Ilse looks at her broken hands for a long while.) If you ever manage it, courier, come and tell me how. I'd like to learn."]] },
    { id: "q2", stage: 4, need: ["rook"], axis: "truth", title: "The Kind Lie",
      talk: [["rook", "Question for you, courier. You've carried letters to dying men, I'd wager."],
        ["rook", "Say a man's dying. He asks if his daughter forgave him. She didn't. She told you so, spat it. Do you tell him the truth? Or do you give him the lie and let him go easy?"],
        ["ilse", "The truth. Always. A lie is just a debt you hand to someone else."],
        ["rook", "Easy to say when you're not the one dying."]],
      ask: "What would you tell him?",
      opts: [["truth", "\"The truth, gently. He deserves to die as himself, not as someone I made up for him.\"", "rook", "(Rook laughs, but it isn't a nice laugh.) Hard woman. ...Good. If it's ever me, don't you dare lie."],
        ["kindness", "\"The lie. Some truths are only cruelty with good manners. Let him go in peace.\"", "rook", "(Rook stares into the fire.) ...Yeah. That's what I'd want. That's exactly what I'd want. Don't tell Ilse."]] },
    { id: "q3", stage: 6, need: ["warden"], axis: "memory", title: "The Ship of Memory",
      talk: [["warden", "Courier. A question that has troubled me since the Cathedral."],
        ["warden", "Voss took my memories. You gave them back, shard by shard. But for a season I was a thing without them, and that thing guarded the door, and did terrible work. Was that me? Am I the same Warden, or a new one wearing his armour?"],
        ["ada", "(Ada writes on her slate and holds it to the firelight: 'I lost my voice. I am still Ada. I think.')"]],
      ask: "What makes someone who they are?",
      opts: [["memory", "\"You are what you remember. They stole you, and we brought you back. The thing without memories wasn't you.\"", "warden", "Then I owe you my self. That is a heavier debt than any the Guild ever wrote. I will carry it gladly."],
        ["choice", "\"You are what you choose now. Memories are just the road behind you. The Warden who walks with us chose to.\"", "warden", "(The great crystal head lowers.) Then I will choose again tomorrow. And the day after. It is lighter, being new every morning."]] },
    { id: "q4", stage: 7, need: ["ren"], axis: "many", title: "The Gate",
      talk: [["ren", "I kept the gate of Oru shut for three years. I told myself: one city fed is better than a valley starving. Numbers. I was good with numbers."],
        ["kest", "And now? Now you know the numbers were people?"],
        ["ren", "Now I don't know anything. If I could kill one man, Hollis, Quill, anyone, and open every granary in the valley... I'd do it. I think. Would you, courier? One life for a thousand?"]],
      ask: "One life for a thousand?",
      opts: [["many", "\"Yes. If there were truly no other way, I'd carry that. Someone has to make the arithmetic hurt.\"", "ren", "(Ren nods.) Then we're the same kind of monster. At least we'll know each other in the dark."],
        ["one", "\"No. The moment you start trading lives, you're the Guild with a kinder face. Every one counts, or none do.\"", "kest", "(Kest smiles crookedly.) Spoken like someone who's never had to mix the dose. ...I hope you never do. I hope you stay exactly this stubborn."]] },
    { id: "q5", stage: 9, need: ["maru"], axis: "duty", title: "The Written Song",
      talk: [["maru", "My mother sang me my song when I was small. Every storm-singer has one. Mine ends at the top of a tower."],
        ["maru", "I could run. Go north, go anywhere, never climb a tower again. Would that make me free? Or would I just be a woman running from a song, which is its own kind of cage?"],
        ["nell", "Burn the song. Sing a different one. Nobody writes my shanties for me."]],
      ask: "Is a foretold fate a prison?",
      opts: [["duty", "\"A song is a shape, not a cage. You don't choose the ending. You choose how well you sing it.\"", "maru", "(Maru is quiet for a long time.) That's what my mother said. I hated her for it. I think I'm starting to forgive her."],
        ["freedom", "\"Break it. No song gets to own you. If the ending is a tower, we'll never go near one.\"", "maru", "(Maru laughs, and it catches.) Oh, courier. You'd fight the sky for me. ...Don't. But thank you. I'll remember you said it."]] },
    { id: "q6", stage: 10, need: ["nell"], axis: "hope", title: "Why Build",
      talk: [["nell", "Here's what I don't get. The sea takes everything, eventually. Boats, towns, people, songs. I've seen whole cities down there. Why build anything at all?"],
        ["warden", "I watched this valley rise and drown and rise again, four times. The builders never stopped. I never understood them."],
        ["nell", "So? Courier? Why bother, if it all goes under?"]],
      ask: "Why build anything the sea will take?",
      opts: [["hope", "\"Because somebody will stand on what we built, even after we're gone. That's enough. That's everything.\"", "nell", "(Nell tosses a pebble into the fire.) Huh. Optimist. ...I'll allow it. Somebody on this crew has to be."],
        ["acceptance", "\"It doesn't matter that it lasts. It mattered while it stood. A song isn't worse because it ends.\"", "warden", "That is the first answer to that question I have heard in four hundred years that did not frighten me. Thank you, courier."]] },
    { id: "q7", stage: 11, need: [], axis: "below", title: "Who Stays Below",
      talk: [[null, "(The last fire before the Deep. Everyone who is left is here. Nobody pretends to sleep.)"],
        ["sable", "The King's question. Who sings for the ones still below? I keep hearing it."],
        [null, "(They all look at you. It's your question now. It always was.)"]],
      ask: "Who should stay below?",
      opts: [["nobody", "\"Nobody. That's the answer. The whole valley was built on someone staying below. It stops with us.\"", null, "(Somewhere out on the dark water, something very old stops singing for a moment, as if it heard.)"],
        ["me", "\"Someone always will. If it has to be someone, let it be someone who chose it. Let it be me.\"", null, "(Nobody argues. That frightens you more than if they had.)"],
        ["climbers", "\"The ones who climbed. Whoever got to the high ground has to go back down for the others. Every time.\"", null, "(Ren, if he is here, laughs softly. The Warden's crystals chime. It sounds like agreement.)"]] },
  ];
  const CREED_TEXT = {
    justice: "that a debt is not erased by the suffering that caused it, and that justice exists for those who can no longer speak",
    mercy: "that behind every monster there was once a person worth trying to save",
    truth: "that people deserve to die as themselves, and that the truth, told gently, is a kind of love",
    kindness: "that some truths are only cruelty with good manners, and that peace is worth a lie",
    memory: "that we are what we remember, and that giving someone back their past gives them back themselves",
    choice: "that we are what we choose each morning, not the road behind us",
    many: "that sometimes one life must be weighed against a thousand, and that the weighing should hurt",
    one: "that every life counts, or none do, and that trading them is how the Guild began",
    duty: "that no one chooses their ending, only how well they sing it",
    freedom: "that no song, no prophecy and no ledger gets to own a person",
    hope: "that we build for the ones who will stand on it after us",
    acceptance: "that a thing is not worth less because it ends",
    nobody: "that nobody should stay below, and that it stops with her",
    me: "that if someone must stay below, it should be someone who chose it",
    climbers: "that whoever reaches the high ground owes a trip back down for everyone else",
  };
  // lines -> Sable's choice -> a reply, each reply running its own act when the talk ends
  function buildTalk(base, lines, ask, choices) {
    lines.forEach(([who, text], i) => { D[base + i] = say(who, text, i < lines.length - 1 ? base + (i + 1) : base + "ask"); });
    D[base + "ask"] = { who: "sable", text: ask, choices: choices.map((c, j) => ({ t: c.t, go: base + "r" + j })) };
    choices.forEach((c, j) => { D[base + "r" + j] = say(c.who, c.reply, null, c.act); });
  }
  QUESTIONS.forEach(q => buildTalk(`cq_${q.id}_`, q.talk, `(${q.ask})`, q.opts.map(([key, t, who, reply]) => ({ t, who, reply, act: () => {
    G.flags.creed = { ...(G.flags.creed || {}), [q.axis]: key }; save(); updateHud(); toast(`The Courier's Creed: "${q.title}" written in the journal.`);
  } }))));
  const questionReady = () => QUESTIONS.find(q => G.stage >= q.stage && !(G.flags.creed || {})[q.axis] && q.need.every(id => G.members.includes(id)));
  // Rest scenes compete for the same fire. Each registers once with a priority; a scene that is about to become
  // impossible (it needs Rook, and Old Gulp is near) jumps the queue, so nothing is silently missed.
  function cardThen(kicker, title, text, node) {
    setTimeout(() => { card(kicker, title, text); const w = () => mode === "card" ? setTimeout(w, 200) : openDialog(node); setTimeout(w, 200); }, 400);
  }
  const beforeGulp = () => G.stage >= 8 && !G.flags.gulpDead;
  const REST_SCENES = [{ id: "story", prio: () => 50, run: campScene }];   // camp talks and dreams, as they were
  campScene = function () { return [...REST_SCENES].sort((a, b) => b.prio() - a.prio()).some(r => r.run()); };
  REST_SCENES.push({ id: "questions", prio: () => { const q = questionReady(); return q && q.need.includes("rook") && beforeGulp() ? 60 : 30; },
    run: () => { const q = questionReady(); if (!q) return false; cardThen("By the fire", q.title, "The road asks a question. Everyone answers it differently.", `cq_${q.id}_0`); return true; } });


  // ---- the Salt Hermit: an old man who only asks questions, and who he turns out to be
  const HERMIT_LOOK = { robe: "#6a6a7a", hair: "#e8e4f0", skin: "#c8a888", style: { hair: "hood", hood: "#4a4a5a", beard: true, eye: "#8a8aa8" } };
  const HERMITS = [
    { n: 1, x: 27, y: 24, stage: 2, q: "Courier. What does a courier carry?", opts: [["\"Whatever I'm given.\"", "And if you are given something terrible? A letter that will break a heart? You carry it anyway? Then you are not a courier. You are a road. Roads do not choose."], ["\"Other people's words.\"", "Words, yes. And the weight of them. You carry the grief in a condolence and the hope in a proposal and you feel none of it? I think you feel all of it. I think that is why you walk so fast."], ["\"Hope, mostly.\"", "Hope. The heaviest thing in the world, and it weighs nothing. Be careful where you set it down, little courier. People build houses on it."]] },
    { n: 2, x: 47, y: 12, stage: 4, q: "Tell me. If a bell rings, and no rain comes, is it still a Rain Bell?", opts: [["\"No. It's just a bell.\"", "Then its meaning is in the rain, not the bronze. And your meaning, courier? Is it in the letters, or in you?"], ["\"Yes. It's a Rain Bell that's still waiting.\"", "A thing is what it is waiting for. How beautiful. And how dangerous: the whole valley is waiting for something, and the Guild sells the waiting by the cup."], ["\"It's whatever the people who ring it need it to be.\"", "Then the Bell is a promise, not an instrument. And promises can be stolen. Ah. Now you understand why someone took it."]] },
    { n: 3, x: 60, y: 20, stage: 7, q: "Oru built walls to keep the water out, and the poor with it. What walls have you built, courier?", opts: [["\"I never let anyone carry things for me.\"", "No. You carry everything yourself, and call it strength. A wall with a scarf on it is still a wall."], ["\"I don't talk about the night I dropped the medicine.\"", "(He is quiet a while.) Then that is the tallest wall in the valley, and you have been living behind it for years. The girl's mother forgave you. Have you?"], ["\"I don't know.\"", "The honest answer. The walls we cannot see are the ones we built first, when we were small and frightened on a rock in the salt."]] },
    { n: 4, x: 108, y: 44, stage: 10, q: "Is it evil to drown a valley, if the valley let your people drown first?", opts: [["\"Yes. Revenge makes you the thing you hated.\"", "Does it? Or does it only make you tired? I have watched a man be right for four hundred years, and it did not make him happy. Only right. Only wet."], ["\"No. It's justice, however terrible.\"", "Then justice and drowning are cousins. Be sure, courier, before you stand in front of him, which of them you have come to bring."], ["\"It's grief. Grief isn't good or evil. It just floods.\"", "(For the first time, he looks straight at you.) ...Yes. Oh, yes. You will understand him. That is either the best thing or the worst thing that could happen."]] },
  ];
  HERMITS.forEach(h => {
    npc2({ id: `hermit${h.n}`, name: "The Salt Hermit", x: h.x, y: h.y, look: HERMIT_LOOK, show: () => G.stage >= h.stage && !(G.flags.hermit || []).includes(h.n) && !G.flags.epilogue });
    D[`hermit${h.n}_q`] = { who: `hermit${h.n}`, text: `(An old man sits cross-legged on the salt, as if he had grown there. He does not look up.) ${h.q}`, choices: h.opts.map(([t], j) => ({ t, go: `hermit${h.n}_a${j}` })) };
    h.opts.forEach(([, reply], j) => { D[`hermit${h.n}_a${j}`] = say(`hermit${h.n}`, reply, `hermit${h.n}_end`); });
    D[`hermit${h.n}_end`] = say(null, "(When you look again, there is only a salt pillar, and footprints that go nowhere.)", null, () => { G.flags.hermit = [...(G.flags.hermit || []), h.n]; save(); updateHud(); });
  });
  npc2({ id: "hermit5", name: "The Salt Hermit", x: 13, y: 45, look: HERMIT_LOOK, show: () => G.flags.kingDead && (G.flags.hermit || []).length >= 4 && !G.flags.hermitDone });
  Object.assign(D, {
    hermit5_0: say("hermit5", "(The old man is sitting by Kessa's well, the way you always do.) You went down. You came back. You answered him. I have waited four hundred years to see someone do that.", "hermit5_1"),
    hermit5_1: say("hermit5", "My name was Teodor. Aurel was my older brother. When the sea came, he stayed below with the ones who couldn't climb, and sang to them. I climbed. I took the high ground with the others, and I did not look back.", "hermit5_1b"),
    hermit5_2: say("hermit5", "I have been asking questions for four hundred years, because I never asked the only one that mattered, while it mattered. Who stays below? I let my brother answer it for me. Everyone did.", "hermit5_3"),
    hermit5_3: { who: "hermit5", text: "(He holds out his hands. They are made of salt, and they are crumbling.) I am tired, courier. Will you let an old coward rest?", choices: [
      { t: "\"You asked every question except one. It's answered now. Rest.\"", go: "hermit5_4" },
      { t: "\"Go down to him. He's asleep now. Tell him you're sorry.\"", go: "hermit5_4b" } ] },
    hermit5_4: say("hermit5", "(He smiles, and the wind takes him, grain by grain, until there is only a small salt stone on the rim of the well.) ...Thank you. Keep this. It is the last question I have. You will know when to ask it.", null, () => { G.flags.hermitDone = "rest"; giveRelic("question"); save(); updateHud(); }),
    hermit5_4b: say("hermit5", "(His face does something it has not done in four centuries: it breaks.) Yes. Yes, I think I will. (He walks away toward the sea, and does not stop at the shore.) Take this, courier. My last question. You'll know when to ask it.", null, () => { G.flags.hermitDone = "down"; giveRelic("question"); save(); updateHud(); }),
  });
  Object.assign(RELICS, { question: { name: "Teodor's Last Question", from: "hermit", desc: "A salt stone that asks, if you hold it: 'And then?' +3 SP each turn, +10% critical chance.", spRegen: 3, crit: 0.1 } });
  const _dialogForH = dialogFor;
  dialogFor = function (n) { const m = /^hermit(\d)$/.exec(n.id); if (m) return m[1] === "5" ? "hermit5_0" : `hermit${m[1]}_q`; return _dialogForH(n); };
  for (let i = 1; i <= 5; i++) SPEAKERS["hermit" + i] = "The Salt Hermit";
  ACTS.hermit1 = ACTS.hermit2 = ACTS.hermit3 = ACTS.hermit4 = ACTS.hermit5 = { draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 0.8) > 0.5) drawEmote(g2, x + 8, y - 30, "dots"); } };

  // the Hermit's reveal: a memory of the night the sea came, in the game's own pixels
  const TEODOR = [
    { dur: 4.6, fadeIn: 0.8, line: [null, "Four hundred years ago, on the last night of the old valley, two brothers stood on a hill while the sea came in."], draw: (g2, t) => {
      nightBg(g2, t); PX.moon(g2, 250, 34, 12);
      PR(g2, 150, 106, 170, 86, "#3a3448"); PR(g2, 150, 106, 170, 2, "#5a5270"); PR(g2, 190, 82, 130, 30, "#3a3448"); PR(g2, 190, 82, 130, 2, "#5a5270");
      const wl = 150 - Math.min(24, t * 5); PR(g2, 0, wl, VIEW_W, VIEW_H - wl, "#1c3a58"); for (let i = 0; i < 16; i++) PR(g2, ((i * 37 + t * 20) % VIEW_W) | 0, wl + 2 + (i % 4) * 9, 8, 1, "#4a7aa8");
      chibi(g2, { ...HERMIT_LOOK, hair: "#3a2a1e", style: { hair: "fringe", eye: "#8a8aa8" } }, { dir: "up", walking: t < 3, walk: t * 6 }, 2, 262, 84 + Math.max(0, 8 - t * 3));
      chibi(g2, { robe: "#2a4a6a", hair: "#2a2030", skin: "#c8a888", style: { hair: "long", eye: "#6a8aa8" } }, { dir: "left" }, 2, 170, 108);
    } },
    { dur: 4.4, line: [null, "The older one turned back toward the water, where people were still calling. The younger one kept climbing, and did not turn around."], draw: (g2, t) => {
      nightBg(g2, t); PR(g2, 0, 120, VIEW_W, 72, "#1c3a58"); for (let i = 0; i < 20; i++) PR(g2, ((i * 29 - t * 14) % VIEW_W + VIEW_W) % VIEW_W | 0, 124 + (i % 5) * 12, 10, 1, "#4a7aa8");
      for (const [x, y] of [[40, 132], [84, 140], [128, 128], [214, 144]]) { const b = Math.round(Math.sin(t * 3 + x) * 2); PR(g2, x, y + b, 6, 6, OUT); PR(g2, x + 1, y + 1 + b, 4, 4, "#c8a888"); PR(g2, x + 7, y - 4 + b, 2, 6, "#c8a888"); }
      chibi(g2, { robe: "#2a4a6a", hair: "#2a2030", skin: "#c8a888", style: { hair: "long", eye: "#6a8aa8" } }, { dir: "down", walking: true, walk: t * 5 }, 2, 160, 118 + Math.min(14, t * 4));
    } },
    { dur: 4.8, line: ["The Salt Hermit", "You went down, courier, and you came back up. I never went down at all."], draw: portraitShot(HERMIT_LOOK, { eyes: "down", brows: "worried", tears: true, light: "#8ab0e8" }, nightBg) },
    { dur: 3.6, fadeOut: 1.0, line: [null, "(In the moonlight, you can see through his hands. They are made of salt.)"], draw: (g2, t) => {
      detail(g2, (c2, tt) => {
        PR(c2, 0, 0, 80, 48, "#0e0c1c"); for (let i = 0; i < 14; i++) PR(c2, (hash(i, 7) * 80) | 0, (hash(i, 9) * 20) | 0, 1, 1, "#8a84a8");
        const eat = Math.min(9, Math.floor(tt * 2.6));   // the fingertips go first
        PR(c2, 30, 48 - 22, 20, 22, OUT); PR(c2, 31, 27, 18, 21, "#c8a888"); PR(c2, 31, 27, 18, 2, "#e0c8a8"); PR(c2, 26, 32, 6, 4, OUT); PR(c2, 27, 33, 5, 2, "#c8a888");
        for (let f = 0; f < 4; f++) { const fx = 31 + f * 5, fl = [9, 12, 11, 8][f], top = 27 - fl + eat; if (top < 27) { PR(c2, fx, top - 1, 4, 27 - top + 1, OUT); PR(c2, fx + 1, top, 2, 27 - top, "#c8a888"); PR(c2, fx + 1, top, 2, 1, "#f2eee6"); } }
        for (let i = 0; i < 40; i++) { const life = (tt * 0.6 + hash(i, 3)) % 1, x = 31 + (hash(i, 5) * 18) | 0; PR(c2, x + Math.round(life * 8), 22 - Math.round(life * 20), 1, 1, life < 0.5 ? "#f2eee6" : "#8a84a8"); }
      }, t);
    } },
  ];
  CINE_BEFORE.hermit5_0 = { shots: TEODOR, music: "cine_grief" };
  // ---- the creed in the journal, the Chronicle and the ending
  function creedLines() { const c = G.flags.creed || {}; return QUESTIONS.filter(q => c[q.axis]).map(q => [q.title, CREED_TEXT[c[q.axis]]]); }
  const _extraJournalC = extraJournalHtml;
  extraJournalHtml = function () {
    const L = creedLines(), hm = (G.flags.hermit || []).length;
    const block = L.length || hm ? `<h3>The Courier's Creed</h3>${L.length ? `<ul>${L.map(([t, x]) => `<li><b>${t}</b>: Sable believes ${x}.</li>`).join("")}</ul>` : ""}${hm ? `<p class="dim" style="font-size:13px">The Salt Hermit has asked you ${hm} question${hm > 1 ? "s" : ""}.${G.flags.hermitDone ? " His name was Teodor." : ""}</p>` : ""}` : "";
    return _extraJournalC() + block;
  };
  const _chronicleC = chronicle;
  chronicle = function () {
    const P = _chronicleC(), L = creedLines();
    if (L.length >= 3) P.splice(P.length - 1, 0, ["What the Courier Believed", `Around the fires, the courier was asked the old questions, and answered them. She came to believe ${L.map(([, x]) => x).join("; ")}. I record these not because they are true, but because she lived by them, and a chronicle is only a record of what people lived by.`]);
    if (G.flags.hermitDone) P.splice(P.length - 1, 0, ["Teodor", `An old man who asked questions on the salt turned out to be Teodor, brother of Aurel, who climbed when his brother stayed below. ${G.flags.hermitDone === "down" ? "He went down to the sea at last, to say he was sorry." : "He was laid to rest by Kessa's well, a small salt stone on its rim."}`]);
    return P;
  };
  const _extraFatesC = extraFates;
  extraFates = function (k) {
    const out = _extraFatesC(k), b = (G.flags.creed || {}).below;
    if (b) out.push({ nobody: "Years later, children in Kessa learn one sentence before they learn to read: nobody stays below. They don't know who said it first.", me: "Years later, Sable still walks down to the shore on the last dry night of every year, and sits a while, in case someone below needs company.", climbers: "Years later, there is a custom in the valley: whoever builds a house on high ground must first carry one stone down to the lowest house they can find." }[b]);
    return out;
  };
  ACHIEVEMENTS.push(["creed", "A Courier's Creed", "Answer every question the road asks by the fire.", () => QUESTIONS.every(q => (G.flags.creed || {})[q.axis])], ["teodor", "Who Stays Below", "Learn the Salt Hermit's name.", () => !!G.flags.hermitDone]);

