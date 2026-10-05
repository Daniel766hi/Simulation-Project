  // ================================================================== A LIVING WORLD: rumours and crowds
  // Townsfolk talk about what has happened lately; their words change as the story moves on.
  const RUMORS = {
    tam: { 3: "They say the Butcher's hooks were full of Kessa men. Mine was one. I'll stop saying that eventually.", 5: "Someone saw lights in the Cathedral. Blue ones. My grandmother said the Warden only glows when it's angry, or when it's remembering.", 7: "Half of Kessa has gone up to Oru. The other half is packing. I'm staying until the water's at my door. Somebody has to water Pell's flowers.", 9: "Nadia came back from Oru with a letter from Reedholm and cried for an hour. Good crying. I didn't know old people did that kind.", 11: "The storms over the Spire sound like singing. I sit on the roof and listen. It helps." },
    beno_after: { 4: "Did you see the farmers come out of the pond? Mum says she remembers being inside the Mother. She says it was warm. She won't talk about it after that.", 7: "Kessa's empty now. I found three lost cats, a clock and a letter from a man to his dead wife. I put the letter back.", 9: "I heard Rook died. He showed me how to hold a bow once. I held it wrong. He said that was the best way to start." },
    bram_news: { 7: "News? The rain tastes of the sea. Fish are swimming up the gutters. And every night at midnight, the puddles ring like bells.", 8: "News? The Iron Clerks stopped moving all at once. Kids climb on them now. One little girl put flowers in a clerk's hands. They're real hands, you know. I think she knew.", 9: "News? Reedholm's sending boats up the flood with fish. First time in fifty years Reedholm's traded with Oru. Nadia's doing, I hear.", 10: "News? Lightning's been hitting the Spire every night. Old storm-singer on the east road says the shrines are waking. I say drink up.", 11: "News? The sea's come back past the wrecks. There's a whirlpool off the pier. Sailors won't go near it. Nell's lot will, I hear. Mad, the lot of them.", 12: "News? Everyone's quiet tonight. Like the whole city's holding its breath. Here: on the house. Whatever you're doing, come back." },
    ines_after: { 8: "The granaries are open. Twelve thousand fed. I've started a list of the debtors whose hands the clerks took. Kest is helping. It's a long list.", 10: "The magistrates want to know who's responsible for the clerks, the ledgers, the gate. I told them: everyone who did nothing. They didn't like that answer.", 12: "Whatever you find down there, courier, come back up and tell us. We've had enough of truths that stay at the bottom." },
    oskar_after: { 9: "The water's still rising, but the dead have stopped walking. We'll build higher. That's what Reedholm does.", 11: "Liv's teaching the Kessa children to swim. Kessa children! In Reedholm! Nadia sends them down every morning in boats. Fifty years, I waited for that." },
    tobin_after: { 8: "I'm going to eat a whole loaf of bread and then write a very long letter to the magistrates.", 10: "I've found three more forged ledgers. And a fourth that isn't forged at all, just evil. It lists the Guild's founding costs. Somebody should look into what 'lowland acquisition' meant." },
    aba_idle: { 1: "My husband drove salt wagons across the Flats for forty years. The jackals got him last year. My grandson says an archer saved him. I'd like to thank one, someday.", 9: "My grandson is fifteen. He climbs every rock on the Flats. He says he's practising for the next time someone throws him onto one." },
    pip_q3: { 8: "We sing every morning now. Loudly. The old people complain. It's the best sound in Oru.", 11: "Sister Ada can't sing any more? Then we'll sing for her. That's what the waking song is for, isn't it? Waking people up when they can't do it themselves." },
    sela_after: { 9: "I baked bread today. For me, this time. It's the first time I haven't burned it.", 12: "I keep his ring on a string around my neck. Some days it's heavy. Some days I forget it's there. I think that's how it's supposed to go." },
  };
  const RUMOR_IDS = { tam: "tam", beno: "beno_after", bram: null, ines: "ines_after", oskar: "oskar_after", tobin: "tobin_after", abawidow: "aba_idle", pip: "pip_q3", sela: "sela_after" };
  function rumorLine(key) { const r = RUMORS[key]; if (!r) return null; let best = null; for (const k of Object.keys(r).map(Number).sort((a, b) => a - b)) if (G.stage >= k) best = r[k]; return best; }
  function rumorFor(n) {
    const f = G.flags;
    if (n.id === "tam" && G.stage >= 3 && !(f.tamQuest && !f.wyrmDead) && !(G.stage >= 3 && !f.tamQuest) && f.tamThanked) { D.__rumor = say("tam", rumorLine("tam")); return "__rumor"; }
    if (n.id === "beno" && f.charmReturned && G.stage >= 4) { D.__rumor = say("beno", rumorLine("beno_after")); return "__rumor"; }
    if (n.id === "ines" && f.quillDead && (!f.corvinLedger || f.apology)) { D.__rumor = say("ines", rumorLine("ines_after")); return "__rumor"; }
    if (n.id === "oskar" && f.gulpDead) { D.__rumor = say("oskar", rumorLine("oskar_after")); return "__rumor"; }
    if (n.id === "tobin" && f.tobinThanked && !(!delivered("bram") && carrying("bram"))) { D.__rumor = say("tobin", rumorLine("tobin_after")); return "__rumor"; }
    if (n.id === "abawidow" && !carrying("rook") && rumorLine("aba_idle")) { D.__rumor = say("abawidow", rumorLine("aba_idle")); return "__rumor"; }
    if (n.id === "pip" && f.choirDone && (f.pipAda || !G.members.includes("ada"))) { D.__rumor = say("pip", rumorLine("pip_q3")); return "__rumor"; }
    if (n.id === "sela" && f.selaDone) { D.__rumor = say("sela", rumorLine("sela_after")); return "__rumor"; }
    return null;
  }
  D.bram_0.choices[1].act = () => { D.bram_news.text = rumorLine("bram_news") || D.bram_news.text; };
  // crowds: refugees in Oru, villagers in Reedholm, and a few souls in Kessa, walking about
  const CROWD_LOOKS = [["#6a5a4a", "#3a2a1e", "#e0a878"], ["#4a5a6a", "#1b1633", "#c98d63"], ["#7a4a3a", "#d8d0c0", "#f0c8a0"], ["#3a5a4a", "#6b3f24", "#8a5a33"], ["#5a3a5a", "#c8a050", "#f2c39a"], ["#6a6a4a", "#2b2350", "#a8744f"]];
  const CROWD_LINES = {
    oru: { 7: ["We walked all night to get here. Now we sleep on the steps of a bank.", "My mother says the Guild built this city. My father says the people built it and the Guild wrote it down.", "They say the courier opened the gates. I'd buy them a drink if I had anything but rain.", "The clerks came for my neighbour's hands. We all watched. None of us moved. I think about that.", "Is it true the grain's locked in the Guild Hall? Twelve thousand hungry people and a locked door."],
           8: ["The granaries are open! My children ate twice today.", "The clerks just stopped. In the middle of the street. One's still holding a man's hat.", "Kest the alchemist walks around at night with a lantern, looking at the stopped clerks. She doesn't look happy.", "They say Reedholm is drowning. My cousin's there. Nobody from Reedholm ever comes up here."],
           10: ["The storm-singers' tower is lit every night. Lightning, but no thunder. It's wrong.", "Fish in the gutters again. My little one caught one with her hands and named it.", "They say the Mayor's making lists of everyone the Guild hurt. My name's on it. I don't know how to feel about that."],
           12: ["Everyone's so quiet tonight.", "If the sea comes all the way up, will the gate hold?", "My grandmother says a king lives under the sea. My grandmother also says the moon is a cheese. But she's been right about more than the moon lately."] },
    reedholm: { 8: ["We build higher. That's what Reedholm does.", "The drowned came right up to the stilts last night. They just stood there, looking up. Like they wanted to come home.", "Oskar hasn't slept in days. Five of ours are still out there."], 9: ["Everyone's home. Everyone who could come home.", "They buried the archer on the highest stilt. The children leave him arrows.", "Kessa people in boats! In Reedholm! My grandmother would've fainted."] },
    kessa: { 1: ["The Bell's gone. Nobody knows what that means yet, but everybody's scared.", "The jackals have been howling all night. They never used to come this close.", "If anyone can get the Bell back, it's the courier. They never drop a package."], 4: ["Half the village is praying. The other half is packing. I'm doing both.", "They say the courier fought a butcher at the Well of Nine and won."], 7: ["The gates are open! We're going up to Oru tomorrow.", "Kessa's emptying. Feels like the end of something."] },
  };
  const WANDERERS = [];
  function addWanderer(id, x, y, box, place) {
    const lk = CROWD_LOOKS[WANDERERS.length % CROWD_LOOKS.length];
    const n = { id, name: ["A refugee", "A townsman", "A tired woman", "An old man", "A dockhand", "A young mother"][WANDERERS.length % 6], x, y, box, place, wander: true, tx: x, ty: y, wait: 0,
      look: { robe: lk[0], hair: lk[1], skin: lk[2], small: WANDERERS.length % 5 === 4, style: { hair: ["tail", "fringe", "bald", "long", "cap", "bun"][WANDERERS.length % 6], dress: WANDERERS.length % 3 === 2 } },
      show: place === "oru" ? () => G.stage >= 7 : place === "reedholm" ? () => G.stage >= 8 : () => G.stage >= 1 && G.stage < 8 };
    npc2(n); WANDERERS.push(NPCS[NPCS.length - 1]); SPEAKERS[id] = n.name;
  }
  [[90, 22], [86, 26], [96, 18], [80, 16], [100, 20], [88, 14], [78, 27], [94, 29]].forEach(([x, y], i) => addWanderer("crowd" + i, x, y, [75, 13, 103, 31], "oru"));
  [[34, 66], [42, 70], [30, 70]].forEach(([x, y], i) => addWanderer("reed" + i, x, y, [29, 63, 45, 71], "reedholm"));
  [[10, 44], [18, 49], [22, 40]].forEach(([x, y], i) => addWanderer("kess" + i, x, y, [4, 38, 24, 50], "kessa"));
  function updateWanderers() {
    const dt = 1 / 60;
    for (const n of WANDERERS) {
      if (!n.show()) continue;
      if (mode !== "play") { n.walking = false; continue; }
      if (n.wait > 0) { n.wait -= dt; n.walking = false; continue; }
      const dx = n.tx * TILE + 8 - n.px, dy = n.ty * TILE + 8 - n.py, d = Math.hypot(dx, dy);
      if (d < 2 || Math.hypot(G.px - n.px, G.py - n.py) < 20) { n.walking = false; if (d < 2) { n.wait = rand(1.5, 5); n.tx = Math.floor(rand(n.box[0], n.box[2])); n.ty = Math.floor(rand(n.box[1], n.box[3])); } continue; }
      const sp = 22 * dt, nx = n.px + dx / d * sp, ny = n.py + dy / d * sp;
      if (SOLID.has(tileAt(nx, ny)) || propAt(nx, ny)) { n.wait = rand(0.5, 2); n.tx = Math.floor(rand(n.box[0], n.box[2])); n.ty = Math.floor(rand(n.box[1], n.box[3])); continue; }
      n.px = nx; n.py = ny; n.walking = true; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      n.x = Math.floor(n.px / TILE); n.y = Math.floor(n.py / TILE);
    }
  }
  const _dialogFor2 = dialogFor;
  dialogFor = function (n) {
    if (n.wander) {
      const pool = CROWD_LINES[n.place]; let lines = null; for (const k of Object.keys(pool).map(Number).sort((a, b) => a - b)) if (G.stage >= k) lines = pool[k];
      D.__crowd = say(n.id, lines ? lines[(hash(n.x * 7 + G.stage, n.y * 3 + Math.floor(time / 8)) * lines.length) | 0] : "..."); return "__crowd";
    }
    return _dialogFor2(n);
  };


