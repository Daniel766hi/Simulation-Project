  // ================================================================== EPILOGUE: WALK HOME
  // After "A Bell for Everyone" or "The Last King Sleeps", Sable can walk the valley once more before the credits.
  const MEMORIAL = { x: 16, y: 47 }, GRAVE_ROW = [[14, 50], [17, 50], [19, 50]];
  const EPI_INTRO = {
    ring: "The gates of Oru stand open. Rain falls on the Glass Flats: soft, ordinary rain, the kind that grows things. You walk home the long way. For the first time in your life you aren't carrying anything.",
    sleep: "The King sleeps. The sea goes quiet and stays quiet. The drowned have stopped singing; they don't need to any more. You walk home through a valley that is no longer afraid of water.",
  };
  const EPI = {
    nadia: () => "(Nadia is planting something by the well. Her hands are muddy to the elbow.) Beans. Can you believe it? Forty years I've rationed water in this village and now I'm planting beans. ...Your mother would be proud. I'm allowed to say that now. I'm old.",
    nadia2: () => "(Nadia is sitting on the edge of Oru's fountain with her shoes off.) The council offered me a seat. I told them I'd rather sit here. It's the first time I've ever been anywhere without a list.",
    odo: () => "(Odo has a new cart, painted bright red.) Business is terrible! Everyone has water! Nobody needs to buy anything from a man with a cart! ...I've never been happier. I'm going to sell flowers, I think. Ridiculous things. Useless. Wonderful.",
    tam: () => G.flags.wyrmDead ? "(Tam is wearing Pell's old satchel.) I'm going to be a courier. Don't laugh. Somebody has to carry the letters now that people have things to say again." : "I keep looking north at the old tower. One day I'll go and find out what happened to my brother. Not today. Today I'm going to sit in the rain.",
    abawidow: () => "(Aba is scrubbing her husband's name onto a stone with charcoal, so the rain won't wash it off.) I used to curse the rain. Now I think it's just trying to help. It doesn't know how. Neither did I.",
    beno: () => "(Beno is repairing the grove fence.) The leeches are gone. The pond is just a pond. I keep waiting for something to go wrong. My wife says that's what peace feels like at first.",
    ines: () => G.flags.apologyRead ? "(Ines has the Apology of Oru framed on the wall of the hall.) I read it to the council every morning, before we do anything else. It makes the meetings shorter. Hard to argue about grain after that." : "The gates are open and the granary is empty and I have never been so busy. Let the lower city in, you said. Well. They're in. They're loud. Good.",
    bram: () => "(Bram is pouring drinks and not charging for them.) On the house. All of it. I kept the ledger for the Guild for eleven years. I'm burning it tonight, page by page, one per drink.",
    yusra: () => delivered("odo") ? "(Yusra has two cups on the table.) He's coming up the hill tomorrow. The stubborn old goat. I've made his room up three times. ...Thank you, courier. For not opening it." : "Trade's strange now. Nobody's desperate. You'd think that would be bad for a trader. It's the best thing that ever happened to me.",
    dov: () => "(Dov is hammering a plough.) No more Guild blades. No more chains. Ilse was right. A forge is for making the world softer.",
    sela: () => G.flags.selaDone === "truth" ? "(Sela has planted a tree by her door.) Jonas. I call it Jonas. He'd laugh at me. It's the ugliest tree in Oru and I love it." : G.flags.selaDone ? "(Sela smiles at you. It doesn't reach her eyes, and then, slowly, it does.) He died a free man, fishing. That's the story. Thank you for keeping it." : "I still bake for two. One day I'll stop.",
    pip: () => G.flags.choirDone ? "(The Choir orphans are ringing their bell, badly and enthusiastically.) We're practising! Ada said we can sing at the harvest! There IS going to be a harvest! We've never had one!" : "The rain's nice. I still don't like singing, though.",
    tobin: () => "(Tobin is writing in a fresh ledger with a clean spine.) A new book. The first line reads: 'The Year the Gates Opened.' I think it's going to be a history. I think, for once, it's going to be a good one.",
    oskar: () => "(Oskar is lowering the stilts of Reedholm, one house at a time.) Liv made me promise. 'Build lower, Dad. The water's not our enemy any more.' Hardest thing I've ever done, trusting the water.",
    lost5: () => G.flags.suriRest ? "(Liv is standing in the shallows, spear resting on her shoulder.) I talk to Mum in the mornings. She doesn't answer. She doesn't need to. She's sleeping." : "(Liv throws her spear into the reeds.) I'm going to be the best hunter in Reedholm. And I'm going to learn to swim properly. Both.",
    lost4: () => "Brother Jory is teaching the Reedholm children to read the old graves. 'So you know who they were,' he tells them. 'So you know you're allowed to remember.'",
    orla: () => "(Orla is listening to the storm, which isn't a storm any more, just weather.) Hear that? That's the sky with nothing to prove. Took it four hundred years. Took you less than a season.",
    tamsin: () => "(Tamsin is sitting at the top of the mine stairs, in the sun.) Forty years down there. I forgot what warm felt like on my face. Don't mind me. I'm going to sit here until I remember.",
    hake: () => G.flags.hakeDone ? "(Hake hums and lets a carp go.) See? Same pool. Same old man. But I'm not waiting for anything now. That's the difference. That's all the difference in the world." : "(Hake doesn't look up.) The water's calm. Maybe my boy's resting too. Maybe that's enough.",
    gguard: () => "(The guard has taken off his Guild tabard and is using it as a rain hood.) I'm a gatekeeper now, not a guard. The job's the same. I just have to say 'come in' instead of 'go away'. Harder than you'd think.",
  };
  const MEMORY = {
    rook: "Rook, who said there was no revenge worth the bullet, and then spent the bullet anyway, saving you. You remember him laughing at Ilse's cooking, and you remember that he always ate every bite.",
    maru: "Maru, who hated singing and sang anyway, at the top of the Storm Spire, until her voice gave out and the storm listened. You remember that she was frightened and that she did it frightened.",
    ren: "Ren, who opened the gate of Oru with his own body behind it. A magistrate's son who spent his whole life paying fines that weren't his. You remember that he apologised to you once, for nothing, just in case.",
  };
  const FAREWELL = {
    ilse: "Ilse: \"I'm going back to Kessa to make ploughs. Only ploughs. If anyone asks me to make a sword, I'll tell them to talk to you. That should scare them off.\"",
    maru: "Maru: \"I'll sing at the harvest. Badly. On purpose. Somebody has to keep the gods humble.\"",
    ada: "Ada: (She writes on her slate, and then, because she can, says it out loud, in a whisper.) \"Thank you for listening when I couldn't talk.\"",
    ren: "Ren: \"No more fines. No more debts. I'm going to find out what I'm like when I don't owe anybody anything. Probably insufferable.\"",
    kest: "Kest: \"I'm opening an apothecary in Oru. Real medicine. No poisons, no Guild contracts. You'll get a discount. Fifty percent. Don't tell anyone.\"",
    warden: "The Warden: \"Four hundred years I guarded a door. Now there is no door. I think I'll learn to garden. Grass is patient. So am I.\"",
    rook: () => loveOn() ? "Rook: (He doesn't make a speech. He sits down next to you, close enough that your shoulders touch, and stays there.)" : "Rook: \"Kessa, if there's still room. I'll carry water up from the well for Aba's widow. It's a start.\"",
    nell: "Nell: \"I'm building a new diving bell. Not for fighting. For looking. There's a whole drowned city down there, courier, and for the first time nobody's asking it for anything.\"",
  };
  let epiEnding = null;
  function epiGraves() { const f = G.flags.fallen || []; return f.slice(0, GRAVE_ROW.length).map((id, i) => ({ id, x: GRAVE_ROW[i][0], y: GRAVE_ROW[i][1] })); }
  function addEpilogueProps() {
    if (PROPS.some(p => p.epilogue)) return;
    addProp("cairn", MEMORIAL.x, MEMORIAL.y, { epilogue: true });
    for (const gv of epiGraves()) addProp("grave", gv.x, gv.y - 1, { epilogue: true });
  }
  const _addProp2E = addProp2;
  addProp2 = () => { _addProp2E(); if (G && G.flags && G.flags.epilogue) { addProp("cairn", MEMORIAL.x, MEMORIAL.y, { epilogue: true }); for (const gv of epiGraves()) addProp("grave", gv.x, gv.y - 1, { epilogue: true }); } };
  function resetCardButtons() { for (const id of ["cardBtn2", "cardBtn3"]) { const b = $(id); if (b) b.hidden = true; } delete $("cardBtn").dataset.ending; $("cardBtn").onclick = null; $("cardBtn").textContent = "Continue"; }
  function startEpilogue(kind) {
    resetCardButtons(); $("card").hidden = true;
    G.flags.epilogue = kind; G.px = 12 * TILE + 8; G.py = 45 * TILE + 8; G.checkpoint = { x: G.px, y: G.py };
    for (const id of G.members) { G.party[id].hp = G.party[id].maxHp; G.party[id].sp = G.party[id].maxSp; }
    field = []; addEpilogueProps(); miniDirty = true; region = ""; mode = "play"; save(); updateHud();
    card("Epilogue", "The Walk Home", EPI_INTRO[kind]);
  }
  function showEpilogueBtn(kind) {
    if (!EPI_INTRO[kind] || G.flags.epilogue) return;
    let b3 = $("cardBtn3");
    if (!b3) { b3 = document.createElement("button"); b3.id = "cardBtn3"; b3.className = "ghost"; $("card").appendChild(b3); }
    b3.textContent = "Walk home: an epilogue (talk to everyone, then rest at the memorial)"; b3.hidden = false;
    b3.onclick = () => startEpilogue(kind);
  }
  const _endingE = ending;
  ending = function (kind) { _endingE(kind); showEpilogueBtn(kind); };
  const _showNextCardE = showNextCard;
  showNextCard = function () { const b3 = $("cardBtn3"); if (b3) b3.hidden = true; _showNextCardE(); };
  const _spawnFieldE = spawnField;
  spawnField = function () { _spawnFieldE(); if (G.flags.epilogue) field = []; };
  const _goalE = goal;
  goal = function () { if (G.flags.epilogue) return { ch: "Epilogue", text: "Walk home. Talk to the people whose lives you changed. When you're ready, rest at the memorial by Kessa's well.", x: MEMORIAL.x, y: MEMORIAL.y + 1 }; return _goalE(); };
  const _dialogForE = dialogFor;
  dialogFor = function (n) {
    if (G.flags.epilogue && EPI[n.id]) { D.__epi = say(n.id, EPI[n.id]()); return "__epi"; }
    return _dialogForE(n);
  };
  Object.assign(D, {
    memorial_0: { who: null, text: "", choices: [
      { t: "Rest here. It's over.", go: "memorial_rest" },
      { t: "Not yet. There are people I haven't seen.", go: null } ] },
    memorial_rest: say("sable", "(You sit with your back to the stone. The rain is warm. One by one, the others sit down beside you.)", "memorial_fw0"),
  });
  function memorialDialog() {
    const fallen = (G.flags.fallen || []).map(id => HEROES[id].name);
    D.memorial_0.text = `A new cairn by the well. Someone has carved it carefully: THE SALT ROAD. FOR THOSE WHO CARRIED IT. ${fallen.length ? `Below, the names: ${fallen.join(", ")}.` : "There are no names below it. Someone has carved instead: EVERYONE CAME HOME."} Fresh flowers. A reed boat. A broken arrow. A single tin cup.`;
    const alive = G.members.filter(id => id !== "sable" && FAREWELL[id]);
    alive.forEach((id, i) => { D[`memorial_fw${i}`] = say(id, FAREWELL[id], i < alive.length - 1 ? `memorial_fw${i + 1}` : "memorial_last"); });
    if (!alive.length) D.memorial_fw0 = say("sable", "(Nobody sits down beside you. You were alone at the start, too. It's different now. You're alone the way a letter is, once it's been delivered.)", "memorial_last");
    D.memorial_last = say("sable", G.flags.motherLetter ? "Somebody always has to stay below so somebody else can climb. That's what she wrote. ...Not any more, Mum. Nobody stays below. Everybody climbs." : "I used to think a courier's job was to never drop the package. I think it's to know who it's for.", null, () => setTimeout(finalCredits, 300));
    openDialog("memorial_0");
  }
  function finalCredits() {
    const f = G.flags, st = G.stats || {};
    const bonds = Object.values(f.bonds || {}).filter(n => n >= 3).length, fish = FISH_IDS.filter(k => (f.fishLog || {})[k]).length;
    const lines = [`Played ${fmtTime(st.time)}. ${st.wins || 0} battles won.`, `${(f.lore || []).length}/${LORE.length} salt tablets read. ${LETTERS.filter(L => delivered(L.id)).length}/${LETTERS.length} letters delivered. ${bonds} companions known by heart. ${fish}/${FISH_IDS.length} kinds of fish.`,
      (f.fallen || []).length ? `Remembered: ${(f.fallen || []).map(id => HEROES[id].name).join(", ")}.` : "Everyone came home.", "Thank you for carrying it all the way."];
    mode = "card"; setScene(f.epilogue === "sleep" ? "The Last King Sleeps" : "A Bell for Everyone");
    $("cardKicker").textContent = "The End"; $("cardTitle").textContent = "The Salt Road"; $("cardText").textContent = lines.join(" ");
    $("cardBtn").textContent = "Play again"; $("cardBtn").dataset.ending = "1"; $("card").hidden = false;
    $("cardBtn").onclick = () => { resetCardButtons(); $("card").hidden = true; newGame(); startGame(); };
    try { localStorage.removeItem(SAVE_KEY); } catch { /* storage unavailable */ }
    f.creditsSeen = true; checkAchievements(); showNGPlus();
  }
  const _interactE = interact;
  interact = function () {
    if (G.flags.epilogue) {
      if (near({ x: MEMORIAL.x * TILE + 8, y: MEMORIAL.y * TILE + 8 }, 22)) { memorialDialog(); return true; }
      for (const gv of epiGraves()) if (near({ x: gv.x * TILE + 8, y: (gv.y - 1) * TILE + 8 }, 20)) {
        const others = G.members.filter(id => id !== "sable"), who = others.length ? others[Math.floor(Math.random() * others.length)] : null;
        D.__grave = say(null, `${(G.flags.epitaphs || {})[gv.id] || HEROES[gv.id].name} ${MEMORY[gv.id] || ""}`, who ? "__grave2" : null);
        if (who) D.__grave2 = say(who, pick(["(They stand beside you for a while and say nothing. It's the right thing to say.)", "I still set out a cup for them at supper. Is that strange? ...Good.", "They'd hate this. All of us standing around being sad. Let's go and eat something.", "I think about the last thing I said to them. It was something stupid. I hope they knew what I meant."]));
        openDialog("__grave"); return true;
      }
    }
    return _interactE();
  };
  ACHIEVEMENTS.push(["home", "The Walk Home", "Finish the epilogue.", () => G.flags.creditsSeen]);

