  // ================================================================== SABLE'S DREAMS
  // The courier's own story, told in dreams at rest points as the story moves on.
  const DREAMS = [
    { id: "d1", stage: 2, title: "The Salt Child", scene: "dreamSalt", lines: [
      [null, "You dream of the salt at night. A woman in a cyan scarf is carrying a child across the Flats, singing a song with no words. The child is you. You know it the way you know your own name."],
      [null, "The woman stumbles. Sets you down on a rock. Wraps the scarf around your neck, twice, tight, the way you still wear it. 'Stay here,' she says. 'Someone will come. Someone always comes for the ones who stay on the rock.'"],
      ["nadia", "(Nadia's voice, from the edge of the dream.) We found you in the morning, Sable. Four years old, wrapped in a courier's scarf, on a rock in the middle of the salt. We never found her. I'm sorry. I've been sorry for twenty years."],
    ] },
    { id: "d2", stage: 4, title: "The Oath", scene: "dreamOath", lines: [
      [null, "You dream of the old post house in Kessa, the night you were sworn in. Sixteen, candle in hand, your mother's scarf around your neck."],
      ["sable", "\"I carry what I am given. I do not open it. I do not drop it. I do not ask whose it is. The road is my home and the package is my heart.\""],
      ["nadia", "It's a good oath. It's also a cage. One day, Sable, you'll have to open a letter that isn't yours, or drop a package to catch a person. Good couriers keep the oath. Great ones know when to break it."],
    ] },
    { id: "d3", stage: 6, title: "The Unopened Letter", scene: "dreamLetter", lines: [
      [null, "You dream of Nadia's cedar chest, the one you weren't allowed to open. Inside: a courier's satchel, cracked with salt. Your mother's. And inside that, one letter, still sealed, addressed in a firm hand: TO WHOEVER IS LEFT BELOW."],
      ["sable", "(In the dream you hold it for a long time.) It isn't mine. The oath says I don't open it. The oath says I deliver it. But to who? Who is left below?"],
      [null, "You wake with the King's question in your mouth like salt. Who sings for the ones still below? Somewhere in Kessa, a cedar chest is waiting."],
    ] },
    { id: "d4", stage: 8, title: "The Night I Dropped It", scene: "dreamDrop", lines: [
      [null, "You dream of the one delivery you never talk about. Seventeen. Rain. A glass bottle of fever-medicine for a sick girl in a hut past the Well of Nine. You were running. You were proud of how fast you ran."],
      [null, "You slipped. The bottle broke on the rocks. By the time you'd run back to Kessa for another, and back again, the girl was quiet. Her mother didn't shout. She just thanked you for trying, and closed the door."],
      ["sable", "(You wake shaking.) 'Never dropped a package.' I've said it so many times people believe it. I've said it so many times I almost do. It's not a boast. It's a promise I'm still trying to make true."],
    ] },
    { id: "d5", stage: 10, title: "My Mother's Voice", scene: "dreamVoice", lines: [
      [null, "You dream you are underwater, and it doesn't frighten you. A woman floats in front of you, scarf drifting like weed, face kind and drowned and familiar."],
      [null, "'You think you were cargo,' she says. 'Something I carried and put down. You were never cargo, Sable. You were the letter. You were the thing I was delivering. Look how far you've come.'"],
      ["sable", "(You try to answer, and bubbles come out instead of words. She laughs, the way you laugh.) 'Open it,' she says. 'Open my letter. You're allowed. I'm the one who sent it.'"],
    ] },
    { id: "d6", stage: 12, title: "Opening the Letter", scene: "dreamOpen", lines: [
      [null, "This time it isn't a dream. You went back to Kessa. You opened the cedar chest. You broke the seal of your mother's letter with shaking hands, and you broke your oath, and the world didn't end."],
      [null, "\"To whoever is left below: I am carrying my daughter to the high ground. If I don't make it, she will. Someone always has to stay below so someone else can climb. I'm not sad that it's me. I only hope that one day someone asks why it has to be anyone at all.\""],
      ["sable", "(You fold it and put it in your satchel, next to the Rain Bell.) She answered the King's question four hundred years after he asked it, and she didn't even know. Somebody stays below. Somebody asks why. Maybe I'm supposed to be both."],
    ] },
  ];
  function dreamReady() { const done = G.flags.dreams || []; return DREAMS.find(d => !done.includes(d.id) && G.stage >= d.stage && (d.id !== "d6" || done.includes("d5"))); }
  function playDream(d) {
    G.flags.dreams = [...(G.flags.dreams || []), d.id]; save();
    d.lines.forEach((ln, i) => { D[`dream_${d.id}_${i}`] = say(ln[0], ln[1], i < d.lines.length - 1 ? `dream_${d.id}_${i + 1}` : null, i === d.lines.length - 1 ? () => { if (d.id === "d6") G.flags.motherLetter = true; save(); } : undefined); });
    card("A dream", d.title, "Sable sleeps by the fire, and remembers.");
    const wait2 = () => { if (mode === "card") { setTimeout(wait2, 200); return; } openDialog(`dream_${d.id}_0`); };
    setTimeout(wait2, 200);
  }
  const _campScene2 = campScene;
  campScene = function () { if (_campScene2()) return true; const d = dreamReady(); if (!d) return false; setTimeout(() => playDream(d), 400); return true; };
  Object.assign(SCENE_BY_TITLE, { "The Salt Child": "dreamSalt", "The Oath": "dreamOath", "The Unopened Letter": "dreamLetter", "The Night I Dropped It": "dreamDrop", "My Mother's Voice": "dreamVoice", "Opening the Letter": "dreamOpen" });
  const _paintScene = paintScene;
  paintScene = function () {
    if (!sceneKey || !sceneKey.startsWith("dream") || $("card").hidden) return _paintScene();
    const g = sc2, t = time, Wd = 240, Hd = 100, R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    const sky = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, Hd); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, Wd, Hd); };
    switch (sceneKey) {
      case "dreamSalt": sky("#0a0820", "#2a2050"); for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(t + i) * 0.3})`; g.fillRect((hash(i, 11) * Wd) | 0, (hash(i, 12) * 60) | 0, 1, 1); }
        R(0, 76, Wd, 24, "#c8c2d8"); R(150, 64, 30, 14, "#857ea5"); const x = 60 + ((t * 6) % 40); R(x - 3, 50, 6, 24, "#2a2240"); R(x - 3, 44, 6, 6, "#e8b48a"); R(x - 5, 48, 10, 3, "#3ee0e8"); R(x + 2, 54, 5, 7, "#2a2240"); R(x + 3, 51, 3, 3, "#e8b48a");
        g.strokeStyle = "rgba(62,224,232,.6)"; g.beginPath(); g.moveTo(x - 5, 49); g.quadraticCurveTo(x - 20, 46 + Math.sin(t * 3) * 3, x - 30, 50); g.stroke(); break;
      case "dreamOath": sky("#1a1008", "#3a2414"); R(0, 70, Wd, 30, "#2a1a10"); R(60, 20, 120, 50, "#3a2a1e"); R(64, 24, 112, 42, "#4a3424");
        for (let i = 0; i < 5; i++) R(70 + i * 22, 30, 14, 20, "#2a1a10"); R(116, 56, 8, 14, "#e8e2d0"); const f = Math.sin(t * 9); R(118, 50 + f, 4, 6, "#ffcf4a");
        const gr = g.createRadialGradient(120, 52, 1, 120, 52, 50); gr.addColorStop(0, "rgba(255,190,90,.35)"); gr.addColorStop(1, "rgba(255,190,90,0)"); g.fillStyle = gr; g.fillRect(70, 0, 100, 100);
        R(112, 60, 16, 30, "#3b2f7a"); R(113, 54, 14, 7, "#e8b48a"); R(110, 60, 20, 3, "#3ee0e8"); break;
      case "dreamLetter": sky("#140e1c", "#2a1e30"); R(70, 50, 100, 40, "#6b3f24"); R(70, 44, 100, 8, "#8a5533"); R(76, 52, 88, 32, "#2a1a10");
        R(96, 58, 48, 20, "#e8e2d0"); R(96, 58, 48, 2, "#c8c0a8"); R(117, 64, 6, 6, "#8a1020"); const a = 0.4 + Math.sin(t * 2) * 0.2; g.fillStyle = `rgba(255,240,200,${a})`; g.fillRect(90, 52, 60, 30);
        g.fillStyle = "rgba(62,224,232,.7)"; g.fillRect(80, 80, 30, 3); break;
      case "dreamDrop": sky("#101820", "#2a3440"); for (let i = 0; i < 70; i++) { g.fillStyle = "rgba(180,200,240,.5)"; g.fillRect(((hash(i, 3) * 260 - t * 30 + 260) % 260) | 0, ((hash(i, 4) * 100 + t * 160) % 100) | 0, 1, 4); }
        R(0, 78, Wd, 22, "#3a3a40"); R(100, 74, 40, 6, "#5a5a60"); for (let i = 0; i < 7; i++) R(104 + i * 5, 70 + (i % 3), 3, 2, "rgba(200,240,255,.8)"); R(118, 72, 8, 3, "rgba(120,200,140,.8)");
        R(40, 50, 30, 28, "#1a1a20"); R(48, 58, 6, 8, "#ffcf6a"); break;
      case "dreamVoice": sky("#02101e", "#0a2a40"); const lx = 120, ly = 44 + Math.sin(t) * 3;
        g.fillStyle = "rgba(200,240,255,.12)"; g.beginPath(); g.moveTo(100, 0); g.lineTo(140, 0); g.lineTo(150, 100); g.lineTo(90, 100); g.fill();
        R(lx - 5, ly, 10, 26, "#2a4a5a"); R(lx - 4, ly - 8, 8, 8, "#8ab0b8"); R(lx - 2, ly - 5, 1, 1, "#0a1a2a"); R(lx + 1, ly - 5, 1, 1, "#0a1a2a");
        g.strokeStyle = "rgba(62,224,232,.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(lx - 5, ly + 2); g.bezierCurveTo(lx - 20, ly + Math.sin(t * 2) * 6, lx - 30, ly + 10, lx - 40, ly + 4); g.stroke();
        for (let i = 0; i < 10; i++) { g.fillStyle = "rgba(200,240,255,.5)"; g.fillRect((70 + i * 11) | 0, (100 - ((t * 10 + i * 13) % 100)) | 0, 2, 2); } break;
      case "dreamOpen": sky("#2a2040", "#f0c08a"); const gr2 = g.createRadialGradient(120, 55, 2, 120, 55, 70); gr2.addColorStop(0, "rgba(255,250,220,.9)"); gr2.addColorStop(1, "rgba(255,250,220,0)"); g.fillStyle = gr2; g.fillRect(0, 0, Wd, Hd);
        R(96, 40, 48, 34, "#f4f0e8"); for (let i = 0; i < 6; i++) R(100, 46 + i * 4, 30 + (i % 3) * 4, 1, "#8a7a6a"); R(96, 40, 48, 2, "#d8d0c0"); R(118, 36, 6, 4, "#8a1020");
        for (let i = 0; i < 12; i++) { const a2 = (t * 0.5 + i / 12) % 1; g.fillStyle = `rgba(255,240,180,${1 - a2})`; g.fillRect(120 + Math.cos(i) * a2 * 60, 55 + Math.sin(i * 1.7) * a2 * 40, 1, 1); } break;
    }
  };
  const _extraFates2 = extraFates;
  extraFates = function () { const out = _extraFates2(); if (G.flags.motherLetter) out.push("Sable keeps her mother's letter. On the back, in her own hand, she has written an answer to it: \"Nobody. Everybody. Us.\""); return out; };

