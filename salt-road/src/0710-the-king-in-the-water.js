  // ================================================================== THE KING IN THE WATER: FORESHADOWING
  // Three rest-dreams in the first half show a man standing in dark water, handing out cups all the same size,
  // long before anyone says the name Aurel. The Tide Shrine and the King himself recognise them later.
  const KDREAMS = [
    { n: 1, stage: 1, title: "A Dream of Water", lines: [[null, "(Dark water to your waist, warm as blood. A man in a plain coat stands in it, handing cups to people you can't see. Every cup is the same size. He looks up at you as if you're late.)"],
      ["sable", "(You wake with salt on your lips. Just a dream. The Flats give everyone dreams.)"]] },
    { n: 2, stage: 3, title: "The Low Note", lines: [[null, "(The dark water again, at his chest now. He is still handing out cups. Behind him a bell hangs from nothing, and it rings once, very low, from under the water. Every cup in the valley shivers.)"],
      [() => inParty("maru") ? "maru" : "sable", () => inParty("maru") ? "(In the morning Maru turns her blind face toward you.) You were humming in your sleep, courier. A drowned note, a low one. Where did you learn a note like that?" : "(You wake humming a note you've never heard, low as the bottom of a well.)"]] },
    { n: 3, stage: 5, title: "The Question", lines: [[null, "(The water is at his throat. The cups are gone. His eyes are closed, and somewhere above him a choir is singing him down, gently, the way you sing a child to sleep. He opens his mouth to ask you something.)"],
      ["sable", "(You wake before you hear it. All day you can't shake the feeling that the question was addressed to you, by name.)"]] },
  ];
  KDREAMS.forEach(d => d.lines.forEach(([who, text], i) => {
    const id = `kd${d.n}_${i}`, last = i === d.lines.length - 1;
    D[id] = { get who() { return typeof who === "function" ? who() : who; }, text, go: last ? null : `kd${d.n}_${i + 1}`, act: last ? () => { G.flags.kdreams = Math.max(G.flags.kdreams || 0, d.n); save(); } : undefined };
  }));
  const kingDreamReady = () => G.stage < 8 && KDREAMS.find(d => G.stage >= d.stage && (G.flags.kdreams || 0) === d.n - 1);
  REST_SCENES.push({ id: "kingdreams", prio: () => kingDreamReady() ? 58 : 0,
    run: () => { const d = kingDreamReady(); if (!d) return false; cardThen("A dream", d.title, "You sleep by the fire. The salt gives everyone dreams. This one is the same as before, only deeper.", `kd${d.n}_0`); return true; } });
  Object.assign(D, {
    kd_recog: say("sable", "(You know that face. The plain coat, the cups all the same size. The man in the water. You have been dreaming him since Kessa, and now you know his name.)"),
    kd_king: say("king", "...You. I know your face. You kept wading into my dreams, courier, always late, always standing at the edge of the water. I thought you were one of mine.", () => G.flags.ledgerFate ? "led_king" : "king_scene3"),
    led_king: say("king", () => ({ burned: "And they burned the Guild's ledger up there. My name was the first line in it. I felt it go, like a stone lifted off my chest.",
      returned: "And the Guild's ledger has been cut into pages and handed back to the people it names. Mine too, I suppose. There is no one left alive to take it.",
      council: "And the Guild's ledger sits in a council's hands now. The same pen, a kinder hand. We will see what it writes." })[G.flags.ledgerFate] || "", "king_scene3"),
  });
  D.tide_v1.go = () => (G.flags.kdreams || 0) >= 2 ? "kd_recog" : null;
  D.king_scene2.go = () => (G.flags.kdreams || 0) >= 2 ? "kd_king" : G.flags.ledgerFate ? "led_king" : "king_scene3";

