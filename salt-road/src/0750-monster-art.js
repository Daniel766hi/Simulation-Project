  // ================================================================== MONSTER ART: THE REST OF THE BESTIARY
  // The same fine pixels for every regular monster. Thirteen bodies; the monsters that share a body get their own
  // colour shift (and named elites a bigger frame), so a Bog Ghoul is not a grey Salt Ghoul painted green by rule.
  const REG_ART = {
    jackal: { w: 50, h: 38, ramps: ["ink", "blood", "flesh", "bone", "rust", "glowr"], paint(K, ph) {
      const run = Math.sin(ph * Math.PI * 2), W = 150, H = 114;
      // legs, running: flayed and sinewy
      for (const [x, d] of [[34, 1], [52, -1], [96, 1], [112, -1]]) { const sw = run * d * 7; K.S([[x, 70], [x + sw * 0.4, 88], [x + sw, 108]], 7, "#6a0c18"); K.S([[x, 72], [x + sw * 0.4, 88]], 3, "#c8182e"); K.E(x + sw, 108, 5, 2.4, "#1e0306"); }
      // body: skinless ribs over a hollow belly, a stripe of spine
      K.vol(74, 62, 50, 22, ["#ee3a46", "#9a1224", "#1e0306"]);
      for (let i = 0; i < 7; i++) K.Q([[48 + i * 9, 48], [52 + i * 9, 62], [48 + i * 9, 76]], 2.4, "#e8e0cc");
      for (let i = 0; i < 10; i++) K.E(34 + i * 9, 42 + Math.sin(i) * 1.5, 3, 3.4, "#c8bca2");
      K.Q([[26, 50], [8, 40 + run * 4], [2, 26]], 4, "#9a1224"); K.Q([[26, 50], [8, 40 + run * 4], [2, 26]], 1.4, "#e8e0cc");
      // skull head: bare bone, a hanging jaw
      K.vol(124, 42, 18, 15, ["#e8e0cc", "#a2957c", "#4a4238"]);
      K.P([[126, 50], [148, 52], [146, 60], [124, 58]], "#c8bca2"); K.P([[122, 56], [144, 62 + run * 2], [140, 70 + run * 3], [120, 64]], "#a2957c");
      K.teeth(126, 52, 6, 3, 5, "#ffffff"); K.teeth(124, 64 + run * 2, 5, 3, -4, "#e8e0cc");
      K.E(120, 38, 5, 4, ink); K.E(120, 38, 1.6, 1.6, "#ff2d2d"); K.P([[110, 30], [116, 16], [120, 30]], "#766a58");
      K.drip(132, 68 + run * 3, 10, 1.6, "#9a1224"); K.drip(70, 82, 8, 1.6, "#6a0c18");
    } },
    ghoul: { w: 42, h: 56, ramps: ["ink", "pale", "blood", "bone", "corpse", "glowr"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 126, H = 168, cx = 63;
      for (const s of [-1, 1]) { K.S([[cx + s * 12, 118], [cx + s * 16, 140], [cx + s * 12, 162]], 7, "#5e5e70"); K.E(cx + s * 14, 164, 7, 3, "#3a3a4a"); }
      // hunched, rib-starved torso covered in salt-cracked skin
      K.vol(cx, 92 + b, 30, 38, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      for (let i = 0; i < 5; i++) K.Q([[cx - 22, 80 + i * 9 + b], [cx, 76 + i * 9 + b], [cx + 22, 80 + i * 9 + b]], 2, "#5e5e70");
      K.crack(cx - 10, 70 + b, 20, 1.2, "#848498"); K.crack(cx + 14, 96 + b, 16, 2, "#848498");
      // long arms, knuckles dragging, black claws
      for (const s of [-1, 1]) { K.S([[cx + s * 24, 72 + b], [cx + s * 40, 100 + b], [cx + s * 44, 136]], 7, "#a8a8ba"); for (let f = 0; f < 3; f++) K.S([[cx + s * 44, 136], [cx + s * (42 + f * 4), 150]], 2, "#07060c"); }
      // head thrust forward, jaw unhinged
      K.vol(cx + 4, 48 + b, 20, 20, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      K.E(cx - 4, 44 + b, 6, 7, ink); K.E(cx + 12, 44 + b, 6, 7, ink); K.E(cx - 4, 45 + b, 1.8, 1.8, "#ff2d2d"); K.E(cx + 12, 45 + b, 1.8, 1.8, "#ff2d2d");
      K.P([[cx - 8, 58 + b], [cx + 18, 58 + b], [cx + 14, 82 + b], [cx - 4, 82 + b]], "#1e0306"); K.teeth(cx - 6, 58 + b, 7, 3, 6, "#e8e0cc"); K.teeth(cx - 4, 80 + b, 6, 3, -5, "#c8bca2");
      K.drip(cx + 4, 82 + b, 16, 1.6, "#9a1224"); K.drip(cx - 30, 120, 8, 1.4, "#6a0c18");
    } },
    leech: { w: 36, h: 58, ramps: ["ink", "leech", "blood", "bone"], paint(K, ph) {
      const W = 108, H = 174, cx = 54;
      // a standing leech, segmented and wet, swaying
      for (let i = 0; i < 9; i++) { const sw = Math.sin(ph * Math.PI * 2 + i * 0.6) * (i * 1.2), y = 160 - i * 15, r = 26 - Math.abs(i - 3) * 2.2; K.vol(cx + sw, y, r, 11, ["#e0a0bc", "#7a3060", "#1e0a18"]); K.S([[cx + sw - r, y + 4], [cx + sw + r, y + 4]], 1.2, "rgba(30,10,24,0.6)"); }
      const tx = cx + Math.sin(ph * Math.PI * 2 + 5.4) * 10;
      K.E(tx, 30, 22, 18, "#3a1230"); K.E(tx, 30, 16, 13, "#1e0306");
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; K.P([[tx + Math.cos(a) * 16, 30 + Math.sin(a) * 13], [tx + Math.cos(a + 0.2) * 16, 30 + Math.sin(a + 0.2) * 13], [tx + Math.cos(a + 0.1) * 8, 30 + Math.sin(a + 0.1) * 6]], "#e8e0cc"); }
      K.E(tx, 30, 4, 3, "#c8182e"); K.E(tx - 12, 22, 5, 3, "rgba(255,255,255,0.35)");
      for (let i = 0; i < 4; i++) K.drip(cx - 18 + i * 12, 160, 8 + i * 3, 1.8, "#3a1230");
    } },
    choir: { w: 32, h: 54, ramps: ["ink", "cloth", "pale", "blood", "bone", "glowy"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 96, H = 162, cx = 48;
      // a hollow child in a drowned choir robe, floating an inch above the floor
      K.P([[cx - 16, 70 + b], [cx + 16, 70 + b], [cx + 28, 150 + b], [cx + 12, 142 + b], [cx, 154 + b], [cx - 12, 142 + b], [cx - 28, 150 + b]], K.LG(cx - 28, 0, cx + 28, 0, [[0, "#141222"], [0.5, "#332c52"], [1, "#07060c"]]));
      K.P([[cx - 18, 70 + b], [cx + 18, 70 + b], [cx + 12, 90 + b], [cx - 12, 90 + b]], "#ececf2"); K.S([[cx - 12, 90 + b], [cx + 12, 90 + b]], 1.4, "#848498");
      for (const s of [-1, 1]) { K.S([[cx + s * 16, 78 + b], [cx + s * 22, 110 + b]], 5, "#221e38"); K.E(cx + s * 22, 112 + b, 3.6, 3.6, "#a8a8ba"); }
      K.P([[cx - 8, 104 + b], [cx + 8, 102 + b], [cx + 10, 124 + b], [cx - 6, 126 + b]], "#523828"); K.S([[cx - 4, 108 + b], [cx + 6, 107 + b]], 1, "#ddd4b0");
      // head: too big, eyes empty, mouth sewn into a smile, candle wax crown
      K.vol(cx, 48 + b, 18, 20, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      K.E(cx - 7, 44 + b, 5, 6, ink); K.E(cx + 7, 44 + b, 5, 6, ink);
      K.Q([[cx - 9, 58 + b], [cx, 64 + b], [cx + 9, 58 + b]], 1.8, "#40070e"); for (let k = 0; k < 5; k++) K.S([[cx - 8 + k * 4, 57 + b + Math.sin(k / 4 * Math.PI) * 4], [cx - 8 + k * 4, 63 + b + Math.sin(k / 4 * Math.PI) * 4]], 1, "#1e0306");
      K.drip(cx - 7, 50 + b, 12, 1.2, "#40070e"); K.drip(cx + 7, 50 + b, 9, 1.2, "#40070e");
      for (let i = 0; i < 3; i++) { const x = cx - 10 + i * 10; K.R(x - 2, 20 + b, 4, 10, "#ddd4b0"); K.E(x, 17 + b + Math.sin(ph * 12 + i), 2, 3.4, "#ff9a3d"); }
    } },
    wraith: { w: 38, h: 56, ramps: ["ink", "brine", "pale", "storm", "glowc"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 114, H = 168, cx = 57;
      // a drowned shape of rags and water, tails of shroud instead of legs
      for (let i = 0; i < 6; i++) { const x = cx - 26 + i * 10, sw = Math.sin(ph * Math.PI * 2 + i) * 6; K.Q([[x, 110 + b], [x + sw, 136 + b], [x - sw * 0.5, 164]], 6 - Math.abs(i - 2.5), "#28626e"); }
      K.P([[cx - 24, 60 + b], [cx + 24, 60 + b], [cx + 34, 130 + b], [cx - 34, 130 + b]], K.LG(cx - 34, 0, cx + 34, 0, [[0, "#10283a"], [0.45, "#3f8a90"], [1, "#08141e"]]));
      for (let i = 0; i < 5; i++) K.S([[cx - 16 + i * 8, 66 + b], [cx - 22 + i * 11, 128 + b]], 1.2, "rgba(166,226,220,0.35)");
      for (const s of [-1, 1]) { K.Q([[cx + s * 22, 70 + b], [cx + s * 44, 86 + b], [cx + s * 48, 110 + b]], 7, "#1a4252"); for (let f = 0; f < 4; f++) K.S([[cx + s * 48, 110 + b], [cx + s * (46 + f * 3), 126 + b]], 1.8, "#a8a8ba"); }
      // hooded head, a face that is only two lights and a mouth running with brine
      K.P([[cx - 26, 70 + b], [cx - 20, 22 + b], [cx, 12 + b], [cx + 20, 22 + b], [cx + 26, 70 + b]], "#10283a");
      K.vol(cx, 48 + b, 14, 17, ["#a8a8ba", "#5e5e70", "#08141e"]);
      K.eye(cx - 6, 44 + b, 3.2, "#3ee0e8", null); K.eye(cx + 6, 44 + b, 3.2, "#3ee0e8", null);
      K.E(cx, 58 + b, 4, 6, ink); K.drip(cx - 1, 62 + b, 18, 1.6, "#6cb8b8");
    } },
    crawler: { w: 54, h: 36, ramps: ["ink", "bone", "blood", "rust", "pale"], paint(K, ph) {
      const W = 162, H = 108, cx = 81, sk = Math.sin(ph * Math.PI * 2);
      // legs: six jointed spikes of bone
      for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const x0 = cx + s * (16 + i * 12), sw = Math.sin(ph * Math.PI * 2 + i + (s > 0 ? 1.5 : 0)) * 4; K.S([[x0, 70], [x0 + s * (26 + i * 6), 54 + sw], [x0 + s * (36 + i * 8), 102]], 4.4, "#766a58"); K.S([[x0, 70], [x0 + s * (26 + i * 6), 54 + sw]], 1.6, "#e8e0cc"); }
      // carapace: a ribcage worn like a shell
      K.vol(cx, 70, 44, 22, ["#e8e0cc", "#a2957c", "#4a4238"]);
      for (let i = 0; i < 7; i++) K.Q([[cx - 38 + i * 12, 56], [cx - 34 + i * 12, 72], [cx - 38 + i * 12, 88]], 3, "#766a58");
      K.E(cx, 80, 30, 8, "rgba(30,3,6,0.5)");
      // pincers: jaws of a human skull split in two
      for (const s of [-1, 1]) { K.S([[cx + s * 38, 62], [cx + s * 58, 40 - sk * 3]], 6, "#a2957c"); K.P([[cx + s * 56, 44 - sk * 3], [cx + s * 78, 20], [cx + s * 70, 42]], "#e8e0cc"); K.P([[cx + s * 58, 42 - sk * 3], [cx + s * 80, 50 + sk * 4], [cx + s * 66, 52]], "#c8bca2"); K.teeth(cx + s * 60 - (s > 0 ? 0 : 10), 42, 3, 3, 4, "#ffffff"); }
      // eyes on stalks
      for (const s of [-1, 1]) { K.S([[cx + s * 8, 58], [cx + s * 12, 40]], 2, "#766a58"); K.eye(cx + s * 12, 38, 3.4, "#ff2d2d", null); }
      K.drip(cx - 10, 88, 10, 1.4, "#6a0c18");
    } },
    drowned: { w: 36, h: 60, ramps: ["ink", "corpse", "brine", "rust", "bone", "blood", "rot", "leather"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.5, W = 108, H = 180, cx = 54;
      for (const s of [-1, 1]) { K.S([[cx + s * 10, 128], [cx + s * 12, 150], [cx + s * 10, 172]], 8, "#2e403a"); K.E(cx + s * 11, 174, 8, 3, "#1e140e"); }
      // waterlogged guard's coat, bloated and pale beneath
      K.P([[cx - 22, 64 + b], [cx + 22, 64 + b], [cx + 28, 134], [cx - 28, 134]], K.LG(cx - 28, 0, cx + 28, 0, [[0, "#1e2a26"], [0.4, "#5e7466"], [1, "#1e2a26"]]));
      for (let i = 0; i < 5; i++) K.vol(cx, 74 + i * 12 + b, 2.6, 2.6, ["#d8b440", "#86621a", "#2e1e06"]);
      for (let i = 0; i < 5; i++) K.Q([[cx - 24 + i * 10, 80 + b], [cx - 26 + i * 11 + Math.sin(ph * 6.28 + i) * 2, 110], [cx - 24 + i * 10, 136]], 2, "#465228");
      K.vol(cx - 14, 104, 4, 4, ["#e8e0cc", "#a2957c", "#4a4238"]); K.vol(cx + 12, 90, 3, 3, ["#e8e0cc", "#a2957c", "#4a4238"]);
      // one arm hangs, one holds a rusted halberd
      K.S([[cx - 22, 72 + b], [cx - 30, 104], [cx - 30, 124]], 7, "#44584e"); K.vol(cx - 30, 128, 5, 5, ["#a4b8a6", "#5e7466", "#1e2a26"]);
      K.S([[cx + 34, 10], [cx + 34, 176]], 3.4, "#523828"); K.P([[cx + 34, 12], [cx + 50, 22], [cx + 34, 34]], "#9a5226"); K.P([[cx + 34, 12], [cx + 22, 4], [cx + 34, 0]], "#76381a");
      K.S([[cx + 22, 72 + b], [cx + 34, 92]], 7, "#44584e"); K.vol(cx + 34, 94, 5, 5, ["#a4b8a6", "#5e7466", "#1e2a26"]);
      // a face swollen with the sea, eyes milk-white
      K.vol(cx, 44 + b, 17, 20, ["#cad8c8", "#7e9484", "#2e403a"]);
      K.E(cx - 7, 40 + b, 4.4, 4, "#ececf2"); K.E(cx + 7, 40 + b, 4.4, 4, "#ececf2"); K.E(cx - 7, 40 + b, 1.4, 1.4, "#848498"); K.E(cx + 7, 40 + b, 1.4, 1.4, "#848498");
      K.E(cx, 54 + b, 6, 3.4, "#1e0306"); K.drip(cx - 2, 56 + b, 12, 1.4, "#3f8a90");
      K.P([[cx - 19, 34 + b], [cx - 16, 22 + b], [cx + 16, 22 + b], [cx + 19, 34 + b]], "#36241a"); K.S([[cx - 19, 34 + b], [cx + 19, 34 + b]], 2, "#9a5226");
      for (let i = 0; i < 4; i++) K.drip(cx - 18 + i * 12, 134, 6 + i * 2, 1.4, "#3f8a90");
    } },
    clerk: { w: 42, h: 76, ramps: ["ink", "gold", "rust", "flesh", "paper", "blood", "glowy", "leather"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.2, W = 126, H = 228, cx = 63;
      // an automaton of brass and ledgers, and, where the brass ran out, hands
      for (const s of [-1, 1]) { K.S([[cx + s * 14, 160], [cx + s * 16, 196], [cx + s * 14, 222]], 9, "#5a3c0e"); K.S([[cx + s * 14, 160], [cx + s * 16, 196]], 3, "#d8b440"); K.vol(cx + s * 16, 190, 6, 6, ["#f6e07a", "#b08a28", "#2e1e06"]); }
      K.P([[cx - 30, 70 + b], [cx + 30, 70 + b], [cx + 28, 166], [cx - 28, 166]], K.LG(cx - 30, 0, cx + 30, 0, [[0, "#5a3c0e"], [0.35, "#d8b440"], [0.6, "#b08a28"], [1, "#2e1e06"]]));
      for (let i = 0; i < 12; i++) K.E(cx - 26 + (i % 2) * 52, 76 + Math.floor(i / 2) * 16 + b, 1.6, 1.6, "#2e1e06");
      // the ledger in its chest, pages turning by themselves
      K.P([[cx - 20, 90 + b], [cx + 20, 90 + b], [cx + 20, 134 + b], [cx - 20, 134 + b]], "#2e1e06"); K.P([[cx - 17, 93 + b], [cx + 17, 93 + b], [cx + 17, 131 + b], [cx - 17, 131 + b]], "#ddd4b0");
      for (let l = 0; l < 7; l++) K.S([[cx - 14, 98 + l * 5 + b], [cx + 14, 98 + l * 5 + b]], 0.8, l === 3 ? "#9a1224" : "#6a6250");
      const pg = (ph * 4) % 1; K.P([[cx, 93 + b], [cx + 17 - pg * 30, 91 + b - pg * 6], [cx + 17 - pg * 30, 129 + b], [cx, 131 + b]], "#f4eed6");
      // arms ending in stolen human hands, stitched on at the wrist
      for (const s of [-1, 1]) { K.S([[cx + s * 30, 78 + b], [cx + s * 40, 116 + b], [cx + s * 38, 144 + b]], 8, "#86621a"); K.S([[cx + s * 30, 78 + b], [cx + s * 40, 116 + b]], 2.4, "#f6e07a");
        K.vol(cx + s * 38, 152 + b, 8, 9, ["#e2b394", "#ad7058", "#4a2226"]); K.stitch(cx + s * 32, 145 + b, cx + s * 44, 145 + b, 3, "#40070e", 1); for (let f = 0; f < 4; f++) K.S([[cx + s * 38, 158 + b], [cx + s * (34 + f * 3), 170 + b]], 2, "#ad7058"); K.drip(cx + s * 40, 146 + b, 10, 1.2, "#9a1224"); }
      // head: a brass bell-jar with two furnace eyes
      K.vol(cx, 44 + b, 20, 24, ["#f6e07a", "#b08a28", "#2e1e06"]);
      K.R(cx - 16, 38 + b, 32, 10, "#2e1e06"); K.eye(cx - 8, 43 + b, 3.4, "#ff9a3d", null); K.eye(cx + 8, 43 + b, 3.4, "#ff9a3d", null);
      for (let i = 0; i < 5; i++) K.S([[cx - 10 + i * 5, 56 + b], [cx - 10 + i * 5, 62 + b]], 1.4, "#2e1e06");
      K.S([[cx, 20 + b], [cx, 8 + b]], 2, "#86621a"); K.E(cx, 6 + b, 3, 3, "#ff9a3d");
    } },
    toad: { w: 50, h: 36, ramps: ["ink", "rot", "corpse", "blood", "glowy", "bone"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 150, H = 108, cx = 75;
      for (const s of [-1, 1]) { K.vol(cx + s * 54, 86, 20, 16, ["#84904e", "#465228", "#1c2012"]); for (let t = 0; t < 3; t++) K.E(cx + s * (48 + t * 8), 104, 5, 2.4, "#2e361c"); }
      K.vol(cx, 70, 60, 34 + b, ["#a8b068", "#465228", "#1c2012"]);
      for (let i = 0; i < 24; i++) K.vol(cx - 52 + K.rng() * 104, 50 + K.rng() * 40, 2 + K.rng() * 3, 2 + K.rng() * 2, ["#a8b068", "#62703a", "#2e361c"]);
      K.vol(cx, 88, 44, 14, ["#cad8c8", "#7e9484", "#2e403a"]);
      K.Q([[cx - 58, 70], [cx, 84 + b], [cx + 58, 70]], 4, "#1c2012"); K.E(cx + 40 * Math.sin(ph * 6.28) * 0.2, 80 + b, 6, 3, "#9a1224");
      for (const s of [-1, 1]) { K.vol(cx + s * 30, 42, 13, 12, ["#a8b068", "#465228", "#1c2012"]); K.E(cx + s * 30, 42, 8, 8, "#ffcf4a"); K.E(cx + s * 30, 42, 2, 7, ink); }
      for (let i = 0; i < 3; i++) K.vol(cx - 14 + i * 14, 58, 4, 3, ["#e8e0cc", "#a2957c", "#4a4238"]);
      for (let i = 0; i < 4; i++) K.drip(cx - 30 + i * 20, 90 + b, 6 + K.rng() * 6, 1.6, "#62703a");
    } },
    eel: { w: 30, h: 62, ramps: ["ink", "brine", "corpse", "blood", "bone", "glowc"], paint(K, ph) {
      const W = 90, H = 186, cx = 45;
      // a lamprey rearing out of the floor, a disc of teeth for a face
      const pts = []; for (let i = 0; i <= 14; i++) { const t2 = i / 14; pts.push([cx + Math.sin(t2 * 7 + ph * 6.28) * 14 * (1 - t2 * 0.5), 180 - t2 * 150]); }
      for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], r = 11 - i * 0.2; K.vol(x, y, r, 7, ["#6cb8b8", "#28626e", "#08141e"]); K.S([[x - r, y + 3], [x + r, y + 3]], 1, "rgba(8,20,30,0.6)"); }
      for (let i = 2; i < pts.length; i += 2) K.E(pts[i][0] + 7, pts[i][1], 1.4, 1.4, "#9ef0f5");
      const [hx, hy] = pts[pts.length - 1];
      K.E(hx, hy - 6, 17, 17, "#10283a"); K.E(hx, hy - 6, 13, 13, "#1e0306");
      for (let r = 0; r < 2; r++) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + r * 0.26, R = 13 - r * 5; K.P([[hx + Math.cos(a) * R, hy - 6 + Math.sin(a) * R], [hx + Math.cos(a + 0.24) * R, hy - 6 + Math.sin(a + 0.24) * R], [hx + Math.cos(a + 0.12) * (R - 5), hy - 6 + Math.sin(a + 0.12) * (R - 5)]], r ? "#c8bca2" : "#e8e0cc"); }
      K.E(hx, hy - 6, 3, 3, "#9a1224");
    } },
    harpy: { w: 58, h: 52, ramps: ["ink", "storm", "pale", "blood", "bone", "cloth", "glowy"], paint(K, ph) {
      const f = Math.sin(ph * Math.PI * 2), W = 174, H = 156, cx = 87;
      // wings of torn skin on finger bones, beating
      for (const s of [-1, 1]) { const tip = [cx + s * 84, 26 - f * 20], mid = [cx + s * 48, 34 - f * 10];
        K.P([[cx + s * 10, 52], mid, tip, [cx + s * 76, 66 - f * 8], [cx + s * 56, 58 - f * 4], [cx + s * 40, 70], [cx + s * 20, 68]], "#2a3a66");
        for (let k = 0; k < 4; k++) K.S([[cx + s * 10, 52], [mid[0] + s * k * 8, mid[1] + k * 8], [tip[0] - s * k * 10, tip[1] + 12 + k * 10]], 2, "#a8a8ba");
        K.S([[cx + s * 10, 52], mid, tip], 3, "#ccccd8"); }
      // body: a gaunt woman's torso with feathers of rust
      K.vol(cx, 64, 14, 20, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      for (let i = 0; i < 4; i++) K.Q([[cx - 10, 60 + i * 5], [cx, 58 + i * 5], [cx + 10, 60 + i * 5]], 1.2, "#5e5e70");
      K.P([[cx - 14, 76], [cx + 14, 76], [cx + 10, 100], [cx, 110], [cx - 10, 100]], "#9a5226");
      for (const s of [-1, 1]) { K.S([[cx + s * 6, 104], [cx + s * 8, 122]], 3, "#766a58"); for (let t = 0; t < 3; t++) K.S([[cx + s * 8, 122], [cx + s * (4 + t * 4), 130]], 1.6, "#07060c"); }
      // head: hair of wet black cord, a beak grown out of a human mouth
      K.vol(cx, 38, 11, 12, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      for (let i = 0; i < 7; i++) K.Q([[cx - 10 + i * 3, 28], [cx - 14 + i * 4, 44], [cx - 16 + i * 5 + f * 2, 62]], 1.6, "#07060c");
      K.E(cx - 4, 36, 2.6, 2.6, "#ffcf4a"); K.E(cx + 4, 36, 2.6, 2.6, "#ffcf4a");
      K.P([[cx - 4, 42], [cx + 4, 42], [cx, 54]], "#766a58");
    } },
    spark: { w: 28, h: 40, ramps: ["ink", "storm", "glowc", "salt"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 4, W = 84, H = 120, cx = 42, cy = 44 + b;
      // a knot of lightning with a screaming face at its heart
      K.E(cx, cy, 30, 30, K.RG(cx, cy, 2, 32, [[0, "rgba(255,255,255,0.95)"], [0.35, "rgba(158,240,245,0.8)"], [1, "rgba(62,224,232,0)"]]));
      for (let i = 0; i < 9; i++) { let x = cx, y = cy; const a0 = i / 9 * Math.PI * 2 + ph * 3; const pts = [[x, y]]; for (let k = 0; k < 4; k++) { x += Math.cos(a0 + (K.rng() - 0.5) * 1.4) * 8; y += Math.sin(a0 + (K.rng() - 0.5) * 1.4) * 8; pts.push([x, y]); } K.S(pts, 2.4, "#7a9ad8"); K.S(pts, 1, "#ffffff"); }
      K.vol(cx, cy, 11, 12, ["#ffffff", "#9ef0f5", "#3ee0e8"]);
      K.E(cx - 4, cy - 3, 2.4, 3, ink); K.E(cx + 4, cy - 3, 2.4, 3, ink); K.E(cx, cy + 5, 3, 4 + b * 0.3, ink);
      K.E(cx, 112, 14, 3, "rgba(62,224,232,0.35)");
    } },
    angler: { w: 54, h: 50, ramps: ["ink", "brine", "corpse", "bone", "blood", "glowc", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 162, H = 150, cx = 81;
      // the lure, swinging on its stalk
      const lx = cx - 30 + Math.sin(ph * Math.PI * 2) * 8, ly = 18 + b;
      K.Q([[cx - 10, 60], [cx - 34, 20], [lx, ly]], 2.4, "#28626e");
      K.E(lx, ly, 16, 16, K.RG(lx, ly, 1, 16, [[0, "rgba(255,255,255,0.95)"], [0.4, "rgba(158,240,245,0.7)"], [1, "rgba(62,224,232,0)"]])); K.E(lx, ly, 4, 4, "#ffffff");
      // body: a bloated deep-sea thing, most of it mouth
      K.vol(cx + 6, 96 + b, 60, 42, ["#28626e", "#10283a", "#08141e"]);
      K.dots(40, cx - 50, 60, cx + 60, 130, "rgba(108,184,184,0.35)", 1.1);
      for (const s of [0]) { K.P([[cx - 56, 102 + b], [cx + 30, 70 + b], [cx + 30, 136 + b]], "#1e0306"); }
      for (let i = 0; i < 9; i++) { const t2 = i / 8, x = cx - 50 + t2 * 76, y0 = 102 + b - t2 * 32, y1 = 102 + b + t2 * 34; K.P([[x, y0], [x + 7, y0 - 2], [x + 4, y0 + 14 + (i % 2) * 6]], "#e8e0cc"); K.P([[x, y1], [x + 7, y1 + 2], [x + 4, y1 - 12 - (i % 2) * 5]], "#c8bca2"); }
      K.eye(cx + 24, 76 + b, 5, "#9ef0f5", ink);
      for (const s of [-1, 1]) K.Q([[cx + 60, 96 + b], [cx + 76, 96 + b + s * 16], [cx + 70, 96 + b + s * 30]], 5, "#1a4252");
      for (let i = 0; i < 3; i++) K.E(cx - 20 + i * 24, 140, 3, 2, "rgba(158,240,245,0.4)");
    } },
  };
  // three that used to be recoloured guards, now their own people
  const REG_ART_ID = {
    thug: { w: 46, h: 60, ramps: ["ink", "gold", "leather", "flesh", "blood", "rust", "cloth", "bone"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.2, cx = 62;
      // a Guild Enforcer: a big man in a gold-trimmed coat, face behind a toll-mask, an iron-banded cudgel
      for (const s of [-1, 1]) { K.S([[cx + s * 12, 126], [cx + s * 14, 150], [cx + s * 13, 172]], 10, "#36241a"); K.E(cx + s * 14, 174, 10, 4, "#120f1c"); }
      K.P([[cx - 30, 66 + b], [cx + 30, 66 + b], [cx + 34, 134], [cx - 34, 134]], K.LG(cx - 34, 0, cx + 34, 0, [[0, "#120f1c"], [0.4, "#332c52"], [1, "#07060c"]]));
      K.S([[cx - 30, 66 + b], [cx - 34, 134]], 3, "#b08a28"); K.S([[cx + 30, 66 + b], [cx + 34, 134]], 3, "#b08a28");
      K.P([[cx - 30, 66 + b], [cx + 30, 66 + b], [cx + 22, 84 + b], [cx - 22, 84 + b]], "#523828");
      for (let i = 0; i < 3; i++) K.vol(cx - 16 + i * 16, 100 + b, 4, 4, ["#f6e07a", "#b08a28", "#2e1e06"]);
      K.S([[cx - 34, 114], [cx + 34, 114]], 5, "#523828"); K.vol(cx, 114, 6, 5, ["#f6e07a", "#b08a28", "#2e1e06"]);
      // arms thick as posts; the cudgel studded with nails
      K.S([[cx - 30, 72 + b], [cx - 42, 104], [cx - 40, 128]], 12, "#221e38"); K.vol(cx - 40, 132, 8, 8, ["#e2b394", "#ad7058", "#4a2226"]);
      K.S([[cx + 30, 72 + b], [cx + 46, 92], [cx + 50, 76]], 12, "#221e38"); K.vol(cx + 50, 72, 8, 8, ["#e2b394", "#ad7058", "#4a2226"]);
      K.S([[cx + 50, 72], [cx + 58, 12]], 10, "#523828"); for (let i = 0; i < 3; i++) K.S([[cx + 47 + i * 1.3, 58 - i * 18], [cx + 61 + i * 1.3, 60 - i * 18]], 3, "#76381a");
      for (let i = 0; i < 6; i++) K.P([[cx + 51 + (i % 2) * 8, 20 + i * 7], [cx + 46 + (i % 2) * 18, 18 + i * 7], [cx + 51 + (i % 2) * 8, 24 + i * 7]], "#a6aac2");
      K.drip(cx + 56, 32, 10, 1.6, "#9a1224");
      // head: bull neck, a brass toll-mask with a coin slot for a mouth, eyes behind it
      K.vol(cx, 44 + b, 20, 22, ["#e2b394", "#8e5444", "#2a1418"]);
      K.P([[cx - 18, 34 + b], [cx + 18, 34 + b], [cx + 16, 58 + b], [cx, 64 + b], [cx - 16, 58 + b]], K.LG(cx - 18, 0, cx + 18, 0, [[0, "#86621a"], [0.45, "#f6e07a"], [1, "#5a3c0e"]]));
      K.E(cx - 7, 42 + b, 4, 2.6, ink); K.E(cx + 7, 42 + b, 4, 2.6, ink); K.E(cx + 7, 42 + b, 1.2, 1.2, "#ff2d2d");
      K.R(cx - 6, 52 + b, 12, 2.4, ink); K.crack(cx + 10, 36 + b, 16, 1.7, "#2e1e06", 1);
      K.P([[cx - 20, 30 + b], [cx + 20, 30 + b], [cx + 14, 16 + b], [cx - 14, 16 + b]], "#1d1830"); K.R(cx - 24, 28 + b, 48, 4, "#b08a28");
    } },
    dvillager: { w: 38, h: 58, ramps: ["ink", "corpse", "brine", "rot", "paper", "bone", "pale", "wood"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.5, cx = 57;
      // a drowned villager: a woman still carrying her fish basket, hair gone to weed, a fishing net trailing
      K.P([[cx - 22, 66 + b], [cx + 22, 66 + b], [cx + 34, 168], [cx - 34, 168]], K.LG(cx - 34, 0, cx + 34, 0, [[0, "#2e403a"], [0.45, "#7e9484"], [1, "#1e2a26"]]));
      for (let i = 0; i < 7; i++) K.P([[cx - 34 + i * 10, 164], [cx - 30 + i * 10, 172 + (i % 2) * 4], [cx - 26 + i * 10, 164]], "#1e2a26");
      K.P([[cx - 24, 110], [cx + 24, 110], [cx + 30, 150], [cx - 30, 150]], "rgba(186,176,142,0.55)");
      for (let i = 0; i < 6; i++) K.S([[cx - 26 + i * 10, 112], [cx - 30 + i * 12, 150]], 0.8, "#6a6250");
      // the net, dragged behind, full of small bones
      K.Q([[cx + 30, 130], [cx + 52, 150], [cx + 46, 176]], 1.4, "#948a70"); for (let i = 0; i < 5; i++) K.S([[cx + 34 + i * 3, 136 + i * 7], [cx + 50 - i * 2, 146 + i * 6]], 0.8, "#948a70");
      K.vol(cx + 44, 162, 3, 2, ["#e8e0cc", "#a2957c", "#4a4238"]); K.vol(cx + 38, 170, 2.6, 2, ["#e8e0cc", "#a2957c", "#4a4238"]);
      // arms: one clutching the basket to her hip
      K.S([[cx - 20, 74 + b], [cx - 32, 100], [cx - 26, 116]], 7, "#5e7466"); K.vol(cx - 26, 118, 5, 5, ["#cad8c8", "#7e9484", "#2e403a"]);
      K.P([[cx - 44, 110], [cx - 14, 110], [cx - 18, 134], [cx - 40, 134]], "#78502a"); for (let i = 0; i < 4; i++) K.S([[cx - 44, 114 + i * 5], [cx - 14, 114 + i * 5]], 1.4, "#3a2616");
      K.P([[cx - 40, 108], [cx - 30, 100], [cx - 20, 108]], "#a4b8a6"); K.E(cx - 32, 104, 2, 1.4, ink);
      K.S([[cx + 20, 74 + b], [cx + 30, 102], [cx + 32, 124]], 7, "#5e7466"); K.vol(cx + 32, 128, 5, 5, ["#cad8c8", "#7e9484", "#2e403a"]);
      // head: swollen, mouth open on water, hair a curtain of weed
      K.vol(cx, 46 + b, 17, 20, ["#cad8c8", "#7e9484", "#2e403a"]);
      for (let i = 0; i < 11; i++) K.Q([[cx - 18 + i * 3.6, 26 + b], [cx - 22 + i * 4.4 + Math.sin(ph * 6.28 + i) * 2, 60 + b], [cx - 24 + i * 4.8, 92 + b]], 2.2, i % 2 ? "#465228" : "#62703a");
      K.E(cx - 6, 44 + b, 3.4, 3, "#ececf2"); K.E(cx + 6, 44 + b, 3.4, 3, "#ececf2");
      K.E(cx, 56 + b, 5, 6, "#1e0306"); K.drip(cx, 60 + b, 16, 1.6, "#3f8a90"); K.drip(cx - 4, 58 + b, 10, 1.2, "#3f8a90");
    } },
    rootbound: { w: 44, h: 60, ramps: ["ink", "wood", "rot", "pale", "paper", "blood", "glowr"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1, cx = 66;
      // a Rootbound Debtor: a man grown into the Ledger Tree's roots, chained by his own pages
      for (let i = 0; i < 6; i++) { const x1 = cx - 50 + i * 20; K.Q([[cx - 10 + i * 4, 130], [(cx + x1) / 2, 150], [x1, 178]], 7, "#3a2616"); K.Q([[cx - 10 + i * 4, 130], [(cx + x1) / 2, 150], [x1, 178]], 2.4, "#58391e"); }
      K.P([[cx - 20, 70 + b], [cx + 20, 70 + b], [cx + 26, 138], [cx - 26, 138]], K.LG(cx - 26, 0, cx + 26, 0, [[0, "#3a2616"], [0.4, "#78502a"], [1, "#1e140c"]]));
      for (let i = 0; i < 8; i++) K.Q([[cx - 20 + i * 5, 74 + b], [cx - 22 + i * 6, 104], [cx - 24 + i * 7, 138]], 1.4, "rgba(30,20,12,0.7)");
      // what is left of him: a pale chest, ribs, one hand free
      K.vol(cx - 2, 92 + b, 13, 16, ["#ccccd8", "#848498", "#3a3a4a"]); for (let i = 0; i < 4; i++) K.Q([[cx - 12, 86 + i * 6 + b], [cx - 2, 83 + i * 6 + b], [cx + 8, 86 + i * 6 + b]], 1.2, "#5e5e70");
      K.S([[cx - 20, 78 + b], [cx - 36, 104], [cx - 42, 126]], 7, "#848498"); for (let f = 0; f < 4; f++) K.S([[cx - 42, 126], [cx - 48 + f * 4, 138]], 1.8, "#a8a8ba");
      K.S([[cx + 20, 78 + b], [cx + 34, 94], [cx + 48, 86], [cx + 58, 70]], 8, "#58391e"); for (let f = 0; f < 4; f++) K.S([[cx + 58, 70], [cx + 54 + f * 4, 56 - (f % 2) * 4]], 3, "#3a2616");
      // chains of ledger pages across him
      for (const [y, d] of [[80, 1], [110, -1]]) for (let i = 0; i < 6; i++) { const x = cx - 26 + i * 10; K.P([[x, y + b + i * d * 3], [x + 9, y + b + i * d * 3 - 2], [x + 10, y + b + i * d * 3 + 8], [x + 1, y + b + i * d * 3 + 10]], "#ddd4b0"); K.S([[x + 2, y + b + i * d * 3 + 4], [x + 8, y + b + i * d * 3 + 3]], 0.7, "#9a1224"); }
      // head: bark creeping over half the face, the other half still begging
      K.vol(cx, 48 + b, 16, 19, ["#ccccd8", "#848498", "#3a3a4a"]);
      K.P([[cx, 28 + b], [cx + 18, 36 + b], [cx + 16, 66 + b], [cx, 68 + b]], "#58391e"); for (let i = 0; i < 4; i++) K.S([[cx + 3 + i * 4, 32 + b], [cx + 2 + i * 4, 64 + b]], 1, "#3a2616");
      K.E(cx - 7, 46 + b, 3.4, 3, ink); K.E(cx - 7, 46 + b, 1.2, 1.2, "#ff2d2d"); K.eye(cx + 8, 46 + b, 2.6, "#ff2d2d", null);
      K.E(cx - 5, 58 + b, 4, 3.4, "#1e0306"); K.drip(cx - 9, 50 + b, 10, 1.2, "#848498");
      for (let i = 0; i < 5; i++) K.S([[cx + 4 + i * 5, 28 + b], [cx + 8 + i * 7, 10 - (i % 2) * 4]], 2.4, "#3a2616");
    } },
  };

  REG_ART.leechling = { ...REG_ART.leech };
  // colour variants (hue in degrees, saturation and lightness multipliers) and frame size for the monsters that share a body
  const VARIANT = {
    spawn: { scale: 0.58 }, bogghoul: { hue: 88, sat: 3.2, lum: 0.78, set: true }, minerghoul: { hue: 28, sat: 2.2, lum: 0.66, set: true }, nightwraith: { hue: 215, sat: 1.4, lum: 0.8, set: true },
    moonmother: { hue: 45, sat: 0.6, lum: 1.05, set: true, scale: 1.3 }, saltworm: { hue: 0, sat: 0.15, lum: 1.25 }, singer: { hue: 200, sat: 1.2, lum: 1 }, priest: { hue: 170, sat: 1.5, lum: 0.7 },
    sailor: { hue: -25, sat: 0.9, lum: 1 }, dunewraith: { hue: 35, sat: 0.9, lum: 1.2, set: true }, crab: { hue: 18, sat: 2.6, lum: 0.9, set: true }, pincer: { hue: 0, sat: 3, lum: 0.75, set: true, scale: 1.3 },
    scorpion: { hue: 38, sat: 1.8, lum: 1.05, set: true }, thug: { hue: 28, sat: 1.6, lum: 0.82, set: true }, dvillager: { hue: 200, sat: 0.9, lum: 1.0, set: true }, jonas: { hue: 42, sat: 1.4, lum: 1, scale: 1.25 },
    rootbound: { hue: 92, sat: 2.2, lum: 0.72, set: true }, widow: { hue: -25, sat: 1, lum: 0.85, scale: 1.3 }, sluicer: { hue: 170, sat: 0.6, lum: 0.9 },
    rotfang: { hue: 0, sat: 0.7, lum: 0.65, scale: 1.35 }, mirage: { hue: 20, sat: 1, lum: 1.1, ghost: true }, ledgercrow: { hue: 20, sat: 0.4, lum: 0.7 },
  };
  const toHSL = (r, g2, b2) => { r /= 255; g2 /= 255; b2 /= 255; const mx = Math.max(r, g2, b2), mn = Math.min(r, g2, b2), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? (g2 - b2) / d + (g2 < b2 ? 6 : 0) : mx === g2 ? (b2 - r) / d + 2 : (r - g2) / d + 4; return [h * 60, s, l]; };
  const toRGB = (h, s, l) => { h = ((h % 360) + 360) % 360 / 360; if (!s) return [l * 255, l * 255, l * 255]; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]; };
  function recolour(c, w, h, v) {   // shift every painted pixel before the palette pass; the variant's palette is built from the result
    const img = c.getImageData(0, 0, w, h), d = img.data, cols = new Set();
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 110) continue; let [hh, s, l] = toHSL(d[i], d[i + 1], d[i + 2]); hh = v.set ? v.hue + (hh - 0) * 0.08 : hh + v.hue; s = Math.min(1, s * v.sat); l = Math.min(1, l * v.lum); const [r, g2, b2] = toRGB(hh, s, l); d[i] = r; d[i + 1] = g2; d[i + 2] = b2; if (v.ghost) d[i + 3] = 200; }
    c.putImageData(img, 0, 0);
  }
  // a variant's palette: its own ramps shifted the same way, so the dither lands on colours of that creature
  const variantRamps = (ramps, v) => { const key = "v" + JSON.stringify(v) + ramps.join(); if (!RAMP[key]) { const shifted = ramps.flatMap(r => RAMP[r]).map(hx => { let [hh, s, l] = toHSL(...hexRGB(hx)); hh = v.set ? v.hue + hh * 0.08 : hh + v.hue; const [r, g2, b2] = toRGB(hh, Math.min(1, s * v.sat), Math.min(1, l * v.lum)); return "#" + [r, g2, b2].map(n => Math.round(n).toString(16).padStart(2, "0")).join(""); }); RAMP[key] = [...new Set([...shifted, ...RAMP.ink])]; } return [key]; };

  // ---- boss paintings, third pass: the story's villains repainted with real anatomy, costume and a readable silhouette
  const H3 = {
    // a tapered, lit limb: highlight on the up-left edge, a joint at the far end
    limb(K, x0, y0, x1, y1, w0, w1, r, joint = true) {
      const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a), s = nx + ny < 0 ? 1 : -1;
      const A = [x0 + nx * w0 * s, y0 + ny * w0 * s], B = [x0 - nx * w0 * s, y0 - ny * w0 * s];
      K.P([A, [x1 + nx * w1 * s, y1 + ny * w1 * s], [x1 - nx * w1 * s, y1 - ny * w1 * s], B], K.LG(A[0], A[1], B[0], B[1], [[0, r[0]], [0.35, r[1]], [1, r[2]]]));
      if (joint) K.E(x1, y1, w1 * 1.02, w1 * 1.02, K.RG(x1 - w1 * 0.3, y1 - w1 * 0.3, 0.5, w1 * 1.3, [[0, r[0]], [0.5, r[1]], [1, r[2]]]));
    },
    // sinew lines along a limb
    sinew(K, x0, y0, x1, y1, w, n, col) {
      const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
      for (let i = 0; i < n; i++) { const o = (i / (n - 1) - 0.5) * w * 1.4; K.Q([[x0 + nx * o, y0 + ny * o], [(x0 + x1) / 2 + nx * o * 1.15, (y0 + y1) / 2 + ny * o * 1.15], [x1 + nx * o * 0.8, y1 + ny * o * 0.8]], 0.9, col); }
    },
    // a salt crystal: three lit faces
    shard(K, x, y, h, a, glow) {
      const w = h * 0.3, tip = [x + Math.cos(a) * h, y + Math.sin(a) * h], l = [x + Math.cos(a - 1.57) * w, y + Math.sin(a - 1.57) * w], r = [x + Math.cos(a + 1.57) * w, y + Math.sin(a + 1.57) * w];
      K.P([l, tip, r], "#a6aac2"); K.P([l, tip, [x, y]], "#f0f4ff"); K.P([r, tip, [x + Math.cos(a) * h * 0.2, y + Math.sin(a) * h * 0.2]], "#7e829c");
      if (glow) K.S([[x + Math.cos(a) * h * 0.15, y + Math.sin(a) * h * 0.15], [tip[0] - Math.cos(a) * 2, tip[1] - Math.sin(a) * 2]], 1, "#9ef0f5");
    },
    // light rays from a point, soft and translucent
    rays(K, x, y, n, r0, r1, col, a0 = 0, spread = Math.PI * 2) {
      for (let i = 0; i < n; i++) { const a = a0 + (i + 0.5) / n * spread, d = 0.05 + K.rng() * 0.05; K.P([[x + Math.cos(a - d) * r0, y + Math.sin(a - d) * r0], [x + Math.cos(a) * r1 * (0.7 + K.rng() * 0.3), y + Math.sin(a) * r1 * (0.7 + K.rng() * 0.3)], [x + Math.cos(a + d) * r0, y + Math.sin(a + d) * r0]], col); }
    },
    coin(K, x, y, r, tilt = 0.55) {
      K.E(x, y + r * 0.18, r, r * tilt, "#5a3c0e"); K.E(x, y, r, r * tilt, K.RG(x - r * 0.4, y - r * 0.3, 0.3, r * 1.2, [[0, "#f6e07a"], [0.5, "#d8b440"], [1, "#86621a"]]));
      K.E(x, y, r * 0.62, r * 0.62 * tilt, "rgba(90,60,14,0.45)"); K.E(x - r * 0.35, y - r * tilt * 0.35, r * 0.25, r * 0.12, "rgba(255,250,210,0.8)");
    },
    // cloth folds: soft dark curves from a top edge to a bottom edge
    folds(K, top, bot, n, col, sway = 0) {
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x0 = top[0] + (top[1] - top[0]) * t, x1 = bot[0] + (bot[1] - bot[0]) * t, y0 = top[2], y1 = bot[2];
        K.Q([[x0, y0], [(x0 + x1) / 2 + Math.sin(i * 2.1) * 6 + sway, (y0 + y1) / 2], [x1, y1]], 2 + (i % 3), col); }
    },
    bubble(K, x, y, r) { K.E(x, y, r, r, "rgba(166,226,220,0.35)"); K.S([[x - r * 0.5, y - r * 0.2], [x - r * 0.2, y - r * 0.6]], 1, "rgba(255,255,255,0.8)"); },
  };
  Object.assign(BOSS_ART, {
    // Magister Voss, the Salt-Flayed: a magister's robe hanging open on a flayed body, the Rain Bell grown into his chest
    voss: { w: 84, h: 116, ramps: ["ink", "blood", "flesh", "salt", "glowc", "gold", "bone", "cloth", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 252, cx = W / 2, pulse = 0.75 + 0.25 * Math.sin(ph * Math.PI * 2);
      const RAW = ["#ee3a46", "#9a1224", "#40070e"], ROBE = ["#141222", "#332c52", "#07060c"];
      // the high collar, fanned behind the head like a judge's
      K.P([[cx - 46, 126], [cx - 58, 60], [cx - 30, 34], [cx, 26], [cx + 30, 34], [cx + 58, 60], [cx + 46, 126]], K.LG(cx - 58, 0, cx + 58, 0, [[0, "#07060c"], [0.5, "#332c52"], [1, "#07060c"]]));
      K.S([[cx - 46, 126], [cx - 58, 60], [cx - 30, 34], [cx, 26], [cx + 30, 34], [cx + 58, 60], [cx + 46, 126]], 2.4, "#b08a28");
      for (let i = 0; i < 7; i++) K.S([[cx, 110], [cx - 48 + i * 16, 40 + Math.abs(i - 3) * 6]], 1, "rgba(106,95,154,0.5)");
      // salt erupting from the shoulders like epaulettes
      for (const [x, y, h, a] of [[cx - 50, 122, 42, -2.5], [cx - 44, 116, 30, -2.0], [cx - 56, 132, 26, -2.9], [cx + 50, 120, 46, -0.6], [cx + 44, 114, 30, -1.1], [cx + 58, 132, 28, -0.2]]) H3.shard(K, x, y, h + b, a, h > 35);
      // the robe's back and sides, hem torn
      K.P([[cx - 48, 118], [cx + 48, 118], [cx + 88, 250], [cx + 104, 334], [cx + 88, 344], [cx + 76, 330], [cx + 60, 346], [cx + 40, 336], [cx - 40, 336], [cx - 56, 346], [cx - 74, 332], [cx - 90, 344], [cx - 104, 330], [cx - 88, 250]],
        K.LG(cx - 104, 0, cx + 104, 0, [[0, ROBE[2]], [0.3, ROBE[1]], [0.6, ROBE[0]], [1, ROBE[2]]]));
      H3.folds(K, [cx - 44, cx - 20, 130], [cx - 100, cx - 44, 332], 4, "rgba(7,6,12,0.6)", b); H3.folds(K, [cx + 20, cx + 44, 130], [cx + 44, cx + 100, 332], 4, "rgba(7,6,12,0.6)", -b);
      // crimson lining down the open front
      for (const s of [-1, 1]) K.P([[cx + s * 30, 122], [cx + s * 44, 124], [cx + s * 58, 336], [cx + s * 36, 336]], K.LG(0, 120, 0, 336, [[0, "#9a1224"], [1, "#40070e"]]));
      for (const s of [-1, 1]) K.S([[cx + s * 44, 124], [cx + s * 58, 336]], 2, "#d8b440");
      // legs: raw muscle, knees of salt, taloned feet
      for (const s of [-1, 1]) {
        H3.limb(K, cx + s * 14, 222, cx + s * 20, 276, 15, 11, RAW); H3.limb(K, cx + s * 20, 276, cx + s * 18, 326, 11, 8, RAW, false);
        H3.sinew(K, cx + s * 14, 226, cx + s * 20, 272, 12, 5, "rgba(30,3,6,0.5)"); H3.sinew(K, cx + s * 20, 280, cx + s * 18, 322, 9, 4, "rgba(30,3,6,0.5)");
        H3.shard(K, cx + s * 20, 278, 12, s < 0 ? -2.4 : -0.7, false);
        K.E(cx + s * 20, 330, 12, 6, "#40070e"); for (let f = 0; f < 3; f++) H3.shard(K, cx + s * (12 + f * 7), 332, 9, 1.3 + s * 0.4 - f * 0.25 * s, false);
      }
      K.P([[cx - 30, 214], [cx + 30, 214], [cx + 24, 248], [cx, 262], [cx - 24, 248]], "#221e38"); K.R(cx - 30, 212, 60, 5, "#b08a28"); H3.coin(K, cx, 214, 7, 0.9);
      // the flayed torso: pectorals, abdominals, striations
      K.P([[cx - 42, 122], [cx + 42, 122], [cx + 34, 170], [cx + 26, 216], [cx - 26, 216], [cx - 34, 170]], K.RG(cx - 12, 140, 6, 90, [[0, "#ee3a46"], [0.5, "#9a1224"], [1, "#40070e"]]));
      for (const s of [-1, 1]) { K.E(cx + s * 20, 140, 20, 14, "rgba(238,58,70,0.45)", s * 0.25); for (let i = 0; i < 7; i++) K.Q([[cx + s * 4, 128 + i * 4], [cx + s * 22, 134 + i * 3], [cx + s * 40, 128 + i * 5]], 0.8, "rgba(30,3,6,0.45)"); }
      for (let r = 0; r < 3; r++) for (const s of [-1, 1]) { K.E(cx + s * 9, 180 + r * 12, 8, 5.5, "rgba(238,58,70,0.35)"); K.S([[cx + s * 1, 175 + r * 12], [cx + s * 16, 175 + r * 12]], 0.9, "rgba(30,3,6,0.55)"); }
      // the chest opened like two doors of rib, and the Bell inside, alive
      K.E(cx, 150, 24, 30, "#1e0306");
      K.E(cx, 150, 44 * pulse, 48 * pulse, K.RG(cx, 150, 2, 50, [[0, "rgba(158,240,245,0.7)"], [0.5, "rgba(62,224,232,0.2)"], [1, "rgba(62,224,232,0)"]]));
      H3.rays(K, cx, 150, 9, 16, 70 * pulse, "rgba(158,240,245,0.16)", -Math.PI * 0.95, Math.PI * 0.9);
      K.P([[cx - 9, 130], [cx + 9, 130], [cx + 13, 156], [cx + 21, 170], [cx - 21, 170], [cx - 13, 156]], K.LG(cx - 21, 0, cx + 21, 0, [[0, "#5a3c0e"], [0.35, "#f6e07a"], [0.65, "#b08a28"], [1, "#2e1e06"]]));
      K.E(cx, 130, 9, 3, "#d8b440"); K.E(cx, 170, 21, 4, "#86621a"); K.E(cx, 174, 4, 4, "#86621a"); K.crack(cx - 3, 136, 26, 1.4, "#2e1e06", 1.2);
      for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { const y = 128 + i * 10; K.Q([[cx + s * 3, y], [cx + s * (24 + i), y - 6], [cx + s * (34 + i * 1.5), y + 2]], 3, "#e8e0cc"); K.Q([[cx + s * 3, y + 1], [cx + s * (24 + i), y - 5], [cx + s * (34 + i * 1.5), y + 3]], 1, "#a2957c"); }
      K.S([[cx, 124], [cx, 128]], 4, "#e8e0cc");
      // arms: the left a salt claw, the right holding the magister's staff with a little bell in its cage
      H3.limb(K, cx - 46, 128, cx - 66, 178, 13, 10, RAW); H3.limb(K, cx - 66, 178, cx - 76, 222, 10, 8, RAW, false); H3.sinew(K, cx - 48, 132, cx - 76, 220, 9, 5, "rgba(30,3,6,0.5)");
      for (let f = 0; f < 5; f++) H3.shard(K, cx - 78 + f * 3, 222, 20 + (f === 2 ? 8 : 0), 1.35 + (f - 2) * 0.22, f === 2);
      K.drip(cx - 76, 244, 10 + b * 2, 1.4, "#9a1224");
      K.S([[cx + 82, 20], [cx + 86, 338]], 5, "#36241a"); K.S([[cx + 81, 20], [cx + 84, 338]], 1.4, "#6e4e38");
      K.E(cx + 82, 22, 12, 14, "rgba(62,224,232,0.25)"); K.S([[cx + 72, 26], [cx + 82, 8], [cx + 92, 26], [cx + 90, 36], [cx + 74, 36], [cx + 72, 26]], 2, "#b08a28");
      K.P([[cx + 78, 18], [cx + 86, 18], [cx + 88, 32], [cx + 76, 32]], "#d8b440"); H3.shard(K, cx + 82, 8, 16, -1.57, true);
      H3.limb(K, cx + 46, 128, cx + 66, 170, 13, 10, RAW); H3.limb(K, cx + 66, 170, cx + 82, 190, 10, 8, RAW, false);
      K.vol(cx + 84, 192, 8, 8, ["#ee3a46", "#9a1224", "#40070e"]); for (let f = 0; f < 3; f++) K.S([[cx + 78, 188 + f * 4], [cx + 90, 188 + f * 4]], 2.4, "#6a0c18");
      // the head: half a gaunt face, half skinned to the skull; a crown of salt grows out of it
      const hy = 84 + b;
      K.vol(cx, hy, 22, 28, ["#e2b394", "#ad7058", "#4a2226"]);
      K.P([[cx + 1, hy - 28], [cx + 22, hy - 16], [cx + 24, hy + 8], [cx + 16, hy + 26], [cx + 1, hy + 30]], K.LG(cx, 0, cx + 24, 0, [[0, "#c8182e"], [1, "#40070e"]]));
      for (let i = 0; i < 5; i++) K.S([[cx + 3 + i * 4, hy - 24], [cx + 4 + i * 4, hy + 26]], 0.8, "rgba(30,3,6,0.55)");
      K.P([[cx + 4, hy - 4], [cx + 20, hy - 8], [cx + 18, hy + 6], [cx + 6, hy + 4]], "#e8e0cc"); K.E(cx + 12, hy - 1, 6, 5, ink); K.eye(cx + 12, hy - 1, 3.4, "#9ef0f5", null);
      K.E(cx - 9, hy - 2, 6, 4, "#4a2226"); K.eye(cx - 9, hy - 1, 2.6, "#e8e0cc", ink); K.S([[cx - 16, hy - 8], [cx - 3, hy - 6]], 1.6, "#4a2226");
      K.S([[cx - 2, hy + 4], [cx - 5, hy + 12], [cx, hy + 13]], 1, "#6e3a34");
      K.P([[cx - 10, hy + 17], [cx, hy + 18], [cx + 18, hy + 14], [cx + 16, hy + 22], [cx - 8, hy + 22]], "#1e0306"); K.teeth(cx + 1, hy + 14, 6, 2.6, 5, "#e8e0cc"); K.teeth(cx + 1, hy + 23, 6, 2.6, -4, "#c8bca2");
      K.S([[cx - 10, hy + 17], [cx - 2, hy + 16]], 1.4, "#6e3a34");
      for (const [x, h, a] of [[cx - 14, 20, -2.1], [cx - 6, 30, -1.8], [cx + 4, 38, -1.5], [cx + 12, 26, -1.2], [cx + 20, 18, -0.8]]) H3.shard(K, x, hy - 24, h + b, a, h > 25);
      // salt dust falling
      for (let i = 0; i < 18; i++) { const x = K.rng() * W, y = (K.rng() * 340 + ph * 60) % 340; K.R(x, y, 1.6, 1.6, "rgba(232,236,248,0.7)"); }
    } },
    // Guild Master Hollis, the Tide-Eater: a merchant prince gone to drowned fat, rising out of the flood
    hollis: { w: 100, h: 116, ramps: ["ink", "gold", "corpse", "brine", "bone", "blood", "rot", "glowy", "leech"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 300, cx = W / 2, FLESH = ["#a4b8a6", "#5e7466", "#1e2a26"];
      // arms first: huge sleeves, bloated hands
      // the body: a coat of gold brocade that no longer closes over a drowned belly
      K.P([[cx - 40, 92], [cx + 40, 92], [cx + 92, 118], [cx + 118, 170], [cx + 126, 240], [cx + 114, 310], [cx - 114, 310], [cx - 126, 240], [cx - 118, 170], [cx - 92, 118]], "#2e1e06");
      K.vol(cx, 214, 124, 118, ["#f6e07a", "#d8b440", "#5a3c0e"]); K.vol(cx, 128, 94, 42, ["#f6e07a", "#d8b440", "#86621a"]);
      for (let y = 104; y < 310; y += 11) for (let x = cx - 120; x < cx + 120; x += 11) { const ox = Math.round(y / 11) % 2 ? 5.5 : 0, dx = (x + ox - cx) / 124, dy = (y - 214) / 118; if (dx * dx + dy * dy < 0.92 || (y < 150 && Math.abs(x + ox - cx) < 88)) K.P([[x + ox, y - 2.6], [x + ox + 2.6, y], [x + ox, y + 2.6], [x + ox - 2.6, y]], "rgba(90,60,14,0.32)"); }
      K.E(cx + 70, 250, 50, 60, "rgba(46,30,6,0.35)");
      // the belly, grey-green and stretched, bursting the coat open
      K.P([[cx - 30, 108], [cx + 30, 108], [cx + 58, 180], [cx + 62, 250], [cx + 44, 312], [cx - 44, 312], [cx - 62, 250], [cx - 58, 180]], K.RG(cx - 16, 190, 8, 120, [[0, "#cad8c8"], [0.45, "#7e9484"], [1, "#2e403a"]]));
      for (const [x, y, a] of [[cx - 34, 170, 0.5], [cx + 30, 268, -0.4], [cx - 24, 286, 0.3]]) K.E(x, y, 12, 2, "rgba(30,42,38,0.35)", a);
      K.E(cx - 20, 150, 20, 26, "rgba(236,240,236,0.18)");
      for (let i = 0; i < 4; i++) K.Q([[cx - 40 + i * 26, 206], [cx - 36 + i * 26, 218], [cx - 42 + i * 26, 232]], 0.8, "rgba(40,98,110,0.5)");
      for (const s of [-1, 1]) { K.P([[cx + s * 28, 100], [cx + s * 62, 104], [cx + s * 78, 180], [cx + s * 62, 312], [cx + s * 46, 312], [cx + s * 60, 180]], K.LG(cx + s * 28, 0, cx + s * 78, 0, [[0, "#1a4252"], [1, "#08141e"]])); K.S([[cx + s * 30, 102], [cx + s * 60, 180], [cx + s * 46, 312]], 2, "#d8b440"); }
      for (let i = 0; i < 6; i++) { const y = 132 + i * 28; for (const s of [-1, 1]) K.S([[cx + s * (54 - i), y], [cx + s * (68 - i), y + 3]], 1.2, "#2e1e06"); if (i !== 3) H3.coin(K, cx - 62 + i * 0.5, y + 1, 5, 1); }
      K.S([[cx + 62, 216], [cx + 72, 238]], 0.8, "#2e1e06"); H3.coin(K, cx + 72, 242, 5, 1);
      // the sleeves hang over the coat's sides
      for (const s of [-1, 1]) { H3.limb(K, cx + s * 96, 124, cx + s * 124, 196, 26, 22, ["#f6e07a", "#b08a28", "#2e1e06"]); H3.limb(K, cx + s * 124, 196, cx + s * 114, 244, 22, 21, ["#d8b440", "#86621a", "#2e1e06"], false); K.E(cx + s * 114, 246, 23, 9, "#1a4252"); K.S([[cx + s * 92, 246], [cx + s * 136, 246]], 2, "#d8b440");
        K.vol(cx + s * 108, 150, 32, 40, ["#f6e07a", "#d8b440", "#5a3c0e"], s * 0.3); K.vol(cx + s * 120, 212, 26, 30, ["#f6e07a", "#b08a28", "#2e1e06"], s * 0.1); K.Q([[cx + s * 92, 176], [cx + s * 118, 186], [cx + s * 136, 176]], 1.6, "rgba(46,30,6,0.6)"); }
      // the left hand grips a sack of coins that leaks; eels spill out of the sleeve
      K.vol(cx - 116, 262, 17, 15, FLESH); for (let f = 0; f < 4; f++) K.vol(cx - 128 + f * 7, 272, 4.5, 6, FLESH); K.E(cx - 122, 273, 2.6, 2, "#d8b440");
      K.vol(cx - 118, 298, 22, 20, ["#8e6a4c", "#523828", "#1e140e"]); K.S([[cx - 128, 280], [cx - 108, 280]], 3, "#36241a");
      for (let i = 0; i < 4; i++) H3.coin(K, cx - 126 + i * 6, 318 + (i % 2) * 5 + ((ph * 30 + i * 9) % 12), 3.4);
      for (let e = 0; e < 3; e++) { const w2 = Math.sin(ph * 6.28 + e * 2) * 8; K.Q([[cx - 104, 250], [cx - 92 + w2, 276 + e * 6], [cx - 80 - e * 10, 300 + e * 10]], 6 - e * 1.4, e % 2 ? "#28626e" : "#1a4252"); K.E(cx - 80 - e * 10, 300 + e * 10, 3.4, 2.6, "#3f8a90"); K.E(cx - 79 - e * 10, 299 + e * 10, 0.9, 0.9, "#ffcf4a"); }
      // the right hand plants a barbed gaff in the water
      K.S([[cx + 134, 40], [cx + 124, 336]], 5, "#3a2616"); K.S([[cx + 133, 40], [cx + 123, 336]], 1.4, "#78502a");
      K.Q([[cx + 134, 42], [cx + 156, 30], [cx + 150, 8]], 5, "#848498"); K.Q([[cx + 134, 42], [cx + 155, 30], [cx + 149, 9]], 1.4, "#ececf2"); K.P([[cx + 150, 8], [cx + 158, 20], [cx + 152, 18]], "#a8a8ba");
      K.vol(cx + 122, 258, 17, 15, FLESH); for (let f = 0; f < 4; f++) K.S([[cx + 112 + f * 2, 250 + f * 5], [cx + 134, 250 + f * 5]], 5, "#7e9484"); for (let f = 0; f < 3; f++) K.E(cx + 128, 254 + f * 5, 2.6, 2, "#d8b440");
      // the navel has become a second mouth
      K.E(cx, 236, 16, 22, "#1e0306"); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; K.P([[cx + Math.cos(a) * 16, 236 + Math.sin(a) * 22], [cx + Math.cos(a + 0.19) * 16, 236 + Math.sin(a + 0.19) * 22], [cx + Math.cos(a + 0.1) * 9, 236 + Math.sin(a + 0.1) * 13]], "#e8e0cc"); } K.E(cx, 238, 6, 9, "#9a1224");
      // the chain of office and its seal
      K.Q([[cx - 62, 104], [cx, 184], [cx + 62, 104]], 5, "#86621a"); for (let i = 0; i <= 12; i++) { const t = i / 12, x = (1 - t) * (1 - t) * (cx - 62) + 2 * t * (1 - t) * cx + t * t * (cx + 62), y = (1 - t) * (1 - t) * 104 + 2 * t * (1 - t) * 184 + t * t * 104; K.E(x, y, 3.6, 2.6, "#d8b440"); }
      K.vol(cx, 150, 13, 13, ["#f6e07a", "#d8b440", "#5a3c0e"]); K.E(cx, 148, 3, 3, ink); K.P([[cx - 2, 150], [cx + 2, 150], [cx + 3, 157], [cx - 3, 157]], ink);
      // barnacles and weed where the coat meets the water
      for (let i = 0; i < 30; i++) { const x = cx - 110 + K.rng() * 220, y = 266 + K.rng() * 40; K.vol(x, y, 3.4, 3, ["#e8e0cc", "#a2957c", "#4a4238"]); K.E(x, y - 0.6, 1, 1, ink); }
      for (let i = 0; i < 10; i++) { const x = cx - 100 + i * 22; K.Q([[x, 250 + (i % 3) * 14], [x + 6 + b, 286], [x - 3, 316]], 2.4, i % 2 ? "#465228" : "#62703a"); }
      // the head, sunk between the shoulders: coins pressed into the eyes, a lamprey's round mouth for a face, laughing
      const hy = 70 + b * 0.4;
      K.vol(cx, hy, 44, 40, ["#cad8c8", "#7e9484", "#2e403a"]);
      K.E(cx, hy + 36, 52, 14, "#5e7466"); K.E(cx, hy + 40, 46, 9, "#44584e");
      for (let i = 0; i < 6; i++) K.Q([[cx - 34 + i * 13, hy - 36], [cx - 40 + i * 14, hy - 18], [cx - 44 + i * 16, hy + 4]], 1.8, "#465228");
      for (const s of [-1, 1]) { K.E(cx + s * 17, hy - 14, 11, 9, "#2e403a"); H3.coin(K, cx + s * 17, hy - 14, 8.5, 0.95); K.S([[cx + s * 22, hy - 24], [cx + s * 10, hy - 22]], 2, "#2e403a"); }
      K.E(cx, hy + 14, 25, 20, "#44584e");
      K.E(cx, hy + 14, 21, 17, "#1e0306");
      for (const [rr, col] of [[21, "#e8e0cc"], [14, "#c8bca2"], [8, "#a2957c"]]) for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + rr; K.P([[cx + Math.cos(a) * rr, hy + 14 + Math.sin(a) * rr * 0.8], [cx + Math.cos(a + 0.17) * rr, hy + 14 + Math.sin(a + 0.17) * rr * 0.8], [cx + Math.cos(a + 0.09) * (rr - 5), hy + 14 + Math.sin(a + 0.09) * (rr - 5) * 0.8]], col); }
      K.E(cx, hy + 15, 4, 3.5, "#9a1224");
      for (let i = 0; i < 5; i++) K.drip(cx - 16 + i * 8, hy + 30, 6 + K.rng() * 10 + b, 1.6, "#3f8a90");
      // the flood he stands in
      K.P([[0, 300], [W, 300], [W, 348], [0, 348]], "rgba(16,40,58,0.82)");
      for (let i = 0; i < 6; i++) { const y = 302 + i * 7, o = Math.sin(ph * 6.28 + i) * 10; K.Q([[10 + o, y], [cx, y + 4 - (i % 2) * 6], [W - 10 - o, y]], 1.4, i < 2 ? "rgba(166,226,220,0.7)" : "rgba(63,138,144,0.5)"); }
      K.E(cx, 302, 130, 6, "rgba(166,226,220,0.35)");
      for (let i = 0; i < 6; i++) H3.bubble(K, cx - 90 + i * 36, 296 - ((ph * 40 + i * 13) % 40), 2.4 + (i % 3));
    } },
    // Aurel, the Drowned King: a tired young king on a throne woven of his drowned subjects, under an arch of them
    king: { w: 112, h: 118, ramps: ["ink", "corpse", "brine", "pale", "bone", "glowc", "gold", "night", "rot"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, H = 354, cx = W / 2;
      // the deep behind him, and light falling from far above
      K.P([[cx - 128, 354], [cx - 128, 150], [cx - 100, 70], [cx, 22], [cx + 100, 70], [cx + 128, 150], [cx + 128, 354]], K.LG(0, 22, 0, 354, [[0, "#1a4252"], [0.5, "#10283a"], [1, "#08141e"]]));
      for (let i = 0; i < 4; i++) { const x = cx - 50 + i * 34 + Math.sin(ph * 6.28 + i) * 4; K.P([[x - 6, 30], [x + 6, 30], [x + 26, 320], [x - 20, 320]], "rgba(108,184,184,0.1)"); }
      // the arch: the drowned, laid body over body along its curve, arms reaching in
      const arch = t => { const a = Math.PI * (1 - t); return [cx + Math.cos(a) * 142, 170 - Math.sin(a) * 150 * (t > 0 && t < 1 ? 1 : 1)]; };
      const drownedBody = (x, y, a, s, reach) => {
        const dx = Math.cos(a) * 26 * s, dy = Math.sin(a) * 26 * s;
        K.S([[x - dx, y - dy], [x + dx, y + dy]], 14 * s, "#1e2a26"); K.S([[x - dx, y - dy], [x + dx, y + dy]], 11 * s, "#5e7466"); K.S([[x - dx * 0.8, y - dy * 0.8 - 2 * s], [x + dx * 0.8, y + dy * 0.8 - 2 * s]], 3.5 * s, "#a4b8a6");
        const hx = x + dx * 1.2, hy = y + dy * 1.2; K.vol(hx, hy, 7 * s, 8 * s, ["#cad8c8", "#7e9484", "#2e403a"]); K.E(hx - 2.4 * s, hy - 1, 1.5 * s, 1.8 * s, ink); K.E(hx + 2.4 * s, hy - 1, 1.5 * s, 1.8 * s, ink); K.E(hx, hy + 3.4 * s, 1.6 * s, 2 * s, ink);
        if (reach) { const ra = a + reach, ex = x + Math.cos(ra) * 24 * s, ey = y + Math.sin(ra) * 24 * s; K.S([[x, y], [ex, ey]], 4 * s, "#7e9484"); for (let f = 0; f < 4; f++) K.S([[ex, ey], [ex + Math.cos(ra + (f - 1.5) * 0.35) * 7 * s, ey + Math.sin(ra + (f - 1.5) * 0.35) * 7 * s]], 1.4 * s, "#a4b8a6"); }
      };
      for (const side of [-1, 1]) for (let i = 0; i < 6; i++) drownedBody(cx + side * (128 + (i % 2) * 8), 340 - i * 34, -Math.PI / 2 + side * 0.15 + (i % 2 ? 0.25 : -0.2), 1.15, side * (i % 2 ? 1.6 : -1.6));
      for (let i = 0; i <= 12; i++) { const t = i / 12; const [x, y] = arch(t); const a = Math.atan2(y - arch(Math.min(1, t + 0.01))[1], x - arch(Math.min(1, t + 0.01))[0]) + Math.PI; drownedBody(x, y, a + (i % 2 ? 0.2 : -0.2), 1.1, i % 3 === 1 ? Math.PI / 2 : 0); }
      K.vol(cx, 22, 16, 18, ["#cad8c8", "#7e9484", "#2e403a"]); K.E(cx - 5, 20, 3, 4, ink); K.E(cx + 5, 20, 3, 4, ink); K.E(cx, 30, 4, 5, ink);
      // the dais and the throne's seat, of bone
      K.E(cx, 336, 118, 18, "#1e2a26"); K.E(cx, 332, 112, 14, "#2e403a"); K.E(cx, 310, 90, 14, "#44584e"); K.E(cx, 306, 86, 10, "#5e7466");
      for (let i = 0; i < 9; i++) { const x = cx - 80 + i * 20; K.vol(x, 322 + (i % 2) * 6, 7, 6, ["#e8e0cc", "#a2957c", "#4a4238"]); K.E(x - 2, 322 + (i % 2) * 6, 1.4, 1.8, ink); K.E(x + 2, 322 + (i % 2) * 6, 1.4, 1.8, ink); }
      // armrests: great skulls, his hands on them
      for (const s of [-1, 1]) { K.vol(cx + s * 76, 232, 20, 18, ["#e8e0cc", "#a2957c", "#4a4238"]); K.E(cx + s * 70, 230, 5, 6, ink); K.E(cx + s * 82, 230, 5, 6, ink); K.E(cx + s * 76, 240, 3, 3, ink); K.teeth(cx + s * 76 - 9, 244, 6, 3, 4, "#c8bca2"); }
      // the robe of weed, spilling down the dais
      K.P([[cx - 38, 150], [cx + 38, 150], [cx + 58, 230], [cx + 96, 312], [cx - 96, 312], [cx - 58, 230]], K.LG(cx - 96, 0, cx + 96, 0, [[0, "#08141e"], [0.35, "#1a4252"], [0.55, "#28626e"], [1, "#08141e"]]));
      for (let i = 0; i < 14; i++) { const x0 = cx - 34 + i * 5, x1 = cx - 92 + i * 14; K.Q([[x0, 156], [(x0 + x1) / 2 + Math.sin(ph * 6.28 + i) * 5, 240], [x1, 312 + (i % 3) * 5]], 2, i % 3 ? "rgba(108,184,184,0.35)" : "rgba(98,112,58,0.6)"); }
      for (const s of [-1, 1]) K.E(cx + s * 24, 256, 20, 10, "rgba(108,184,184,0.18)");
      // his chest: a boy's thin chest, a necklace of tiny bells
      K.P([[cx - 22, 150], [cx + 22, 150], [cx + 14, 196], [cx - 14, 196]], K.LG(cx - 22, 0, cx + 22, 0, [[0, "#a8a8ba"], [1, "#5e5e70"]]));
      K.Q([[cx - 22, 152], [cx, 176], [cx + 22, 152]], 1.4, "#b08a28"); for (let i = 0; i < 5; i++) { const x = cx - 14 + i * 7, y = 160 + Math.sin(i / 4 * Math.PI) * 12; K.P([[x - 2, y], [x + 2, y], [x + 3, y + 5], [x - 3, y + 5]], "#d8b440"); }
      // arms along the armrests, long pale fingers over the skulls
      for (const s of [-1, 1]) { H3.limb(K, cx + s * 32, 160, cx + s * 52, 210, 9, 7, ["#ccccd8", "#848498", "#3a3a4a"]); H3.limb(K, cx + s * 52, 210, cx + s * 74, 216, 7, 6, ["#ccccd8", "#848498", "#3a3a4a"], false);
        for (let f = 0; f < 4; f++) K.S([[cx + s * 74, 214 + f * 1.4], [cx + s * (80 + f), 222 + f * 3]], 1.6, "#a8a8ba"); K.vol(cx + s * 38, 158, 12, 10, ["#28626e", "#1a4252", "#08141e"]); }
      // the head: young, tired, pale; hair drifting upward in the water; a crown of the hands of the drowned
      const hy = 116 + b;
      for (let i = 0; i < 12; i++) { const x0 = cx - 18 + i * 3.3, sw = Math.sin(ph * 6.28 + i * 0.7) * 6; K.Q([[x0, hy - 10], [x0 + sw - (i - 6) * 1.5, hy - 34], [x0 + sw * 1.6 - (i - 6) * 3, hy - 56 - (i % 3) * 6]], 2.2, i % 2 ? "#1a4252" : "#28626e"); }
      for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.14 + i * 0.09), x = cx + Math.cos(a) * 20, y = hy - 12 + Math.sin(a) * 14, x2 = cx + Math.cos(a) * 42, y2 = hy - 12 + Math.sin(a) * 38;
        K.S([[x, y], [x2, y2]], 5, "#7e9484"); K.S([[x, y], [x2, y2]], 2, "#a4b8a6"); K.E(x2, y2, 3.4, 3, "#a4b8a6"); for (let f = 0; f < 4; f++) K.S([[x2, y2], [x2 + Math.cos(a + (f - 1.5) * 0.28) * 10, y2 + Math.sin(a + (f - 1.5) * 0.28) * 10]], 1.6, "#cad8c8"); }
      K.vol(cx, hy, 21, 27, ["#ececf2", "#a8a8ba", "#5e5e70"]);
      K.P([[cx - 21, hy - 6], [cx - 18, hy - 22], [cx, hy - 28], [cx + 18, hy - 22], [cx + 21, hy - 6], [cx + 12, hy - 14], [cx, hy - 16], [cx - 12, hy - 14]], "#1a4252");
      for (const s of [-1, 1]) { K.E(cx + s * 8, hy + 1, 6, 4, "#3a3a4a"); K.E(cx + s * 8, hy + 1.4, 2.4, 1.8, "#9ef0f5"); K.S([[cx + s * 14, hy - 5], [cx + s * 3, hy - 4]], 1.2, "#3a3a4a"); K.Q([[cx + s * 13, hy + 6], [cx + s * 8, hy + 8], [cx + s * 3, hy + 6]], 1, "rgba(58,58,74,0.6)"); }
      K.S([[cx - 1, hy + 4], [cx - 2, hy + 12], [cx + 1, hy + 13]], 1, "#848498"); K.S([[cx - 6, hy + 19], [cx + 6, hy + 19]], 1.6, "#5e5e70");
      K.S([[cx - 9, hy + 4], [cx - 10, hy + 16]], 1, "rgba(62,224,232,0.7)");
      // bubbles and pale lights rising
      for (let i = 0; i < 12; i++) { const x = cx - 120 + i * 22, y = 340 - ((ph * 220 + i * 41) % 320); if (i % 2) H3.bubble(K, x, y, 2 + (i % 3)); else K.E(x, y, 3, 3, K.RG(x, y, 0, 4, [[0, "rgba(158,240,245,0.9)"], [1, "rgba(62,224,232,0)"]])); }
    } },
    // Corvin, the First Guildmaster: a gilded mummy enthroned on the Guild's first hoard, still writing
    corvin: { w: 104, h: 118, ramps: ["ink", "gold", "bone", "cloth", "blood", "pale", "paper", "glowy", "leather"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.5, W = 312, cx = W / 2, WRAP = ["#e8e0cc", "#a2957c", "#4a4238"];
      // a halo of coins behind him, a gilded saint's
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + ph * 0.6, x = cx + Math.cos(a) * 62, y = 86 + Math.sin(a) * 50; H3.coin(K, x, y, 5, 0.9); }
      K.E(cx, 86, 58, 46, K.RG(cx, 86, 10, 64, [[0, "rgba(255,207,74,0.3)"], [1, "rgba(255,207,74,0)"]]));
      // the hoard: a hill of coins, ledgers and an open chest
      K.P([[0, 354], [0, 316], [60, 276], [cx - 30, 250], [cx + 30, 250], [W - 60, 276], [W, 316], [W, 354]], K.LG(0, 250, 0, 354, [[0, "#b08a28"], [1, "#2e1e06"]]));
      for (let i = 0; i < 110; i++) { const x = K.rng() * W, top = 256 + Math.abs(x - cx) * 0.36; H3.coin(K, x, top + K.rng() * (354 - top), 4 + K.rng() * 3); }
      for (const [x, y, a] of [[30, 318, -0.2], [82, 296, 0.1], [W - 96, 300, -0.12], [W - 40, 322, 0.2]]) { K.P([[x - 20, y], [x + 20, y - 4 * a * 10], [x + 22, y + 12], [x - 18, y + 16]], "#523828"); K.P([[x - 18, y + 2], [x + 18, y - 2], [x + 19, y + 9], [x - 16, y + 12]], "#ddd4b0"); K.S([[x - 20, y], [x - 18, y + 16]], 3, "#6a0c18"); }
      K.P([[W - 70, 266], [W - 22, 262], [W - 18, 290], [W - 68, 294]], "#36241a"); K.P([[W - 72, 266], [W - 22, 262], [W - 30, 240], [W - 66, 244]], "#523828"); K.S([[W - 72, 266], [W - 18, 262]], 2, "#d8b440");
      for (let i = 0; i < 5; i++) H3.coin(K, W - 62 + i * 9, 262 - (i % 2) * 3, 4.4);
      // the robe of office pooled over the hoard, heavy with chains and padlocks
      K.P([[cx - 44, 118], [cx + 44, 118], [cx + 74, 200], [cx + 98, 290], [cx + 60, 300], [cx, 292], [cx - 60, 300], [cx - 98, 290], [cx - 74, 200]], K.LG(cx - 98, 0, cx + 98, 0, [[0, "#141222"], [0.4, "#463e6e"], [0.6, "#332c52"], [1, "#07060c"]]));
      H3.folds(K, [cx - 40, cx + 40, 130], [cx - 94, cx + 94, 292], 8, "rgba(7,6,12,0.45)");
      for (const s of [-1, 1]) K.S([[cx + s * 44, 118], [cx + s * 74, 200], [cx + s * 98, 290]], 3, "#d8b440");
      for (let i = 0; i < 14; i++) { const x = cx - 90 + i * 13.5, y = 290 + (i % 2) * 5; K.P([[x - 4, y], [x + 4, y], [x + 2, y + 6], [x - 2, y + 6]], "#b08a28"); }
      // the ermine mantle, gone yellow, and the chains
      K.P([[cx - 58, 116], [cx + 58, 116], [cx + 50, 150], [cx, 162], [cx - 50, 150]], K.LG(0, 116, 0, 162, [[0, "#e8e0cc"], [1, "#a2957c"]]));
      for (let i = 0; i < 12; i++) K.P([[cx - 48 + i * 8.5, 124 + (i % 2) * 12], [cx - 46 + i * 8.5, 130 + (i % 2) * 12], [cx - 50 + i * 8.5, 130 + (i % 2) * 12]], ink);
      for (const [y0, sag] of [[150, 40], [160, 64], [170, 88]]) { for (let i = 0; i <= 14; i++) { const t = i / 14, x = cx - 60 + 120 * t, y = y0 + Math.sin(t * Math.PI) * sag * 0.6; K.E(x, y, 3.2, 2.2, i % 2 ? "#86621a" : "#d8b440"); } }
      for (const [x, y] of [[cx - 30, 196], [cx + 34, 184], [cx + 2, 212]]) { K.S([[x - 5, y - 4], [x - 5, y - 10], [x + 5, y - 10], [x + 5, y - 4]], 2, "#86621a"); K.P([[x - 7, y - 4], [x + 7, y - 4], [x + 7, y + 8], [x - 7, y + 8]], K.LG(x - 7, 0, x + 7, 0, [[0, "#f6e07a"], [1, "#5a3c0e"]])); K.E(x, y + 2, 1.6, 2.2, ink); }
      // the ledger open on his lap, and the quill still writing in it
      K.P([[cx - 56, 232], [cx, 238], [cx + 56, 232], [cx + 60, 262], [cx, 268], [cx - 60, 262]], "#523828");
      K.P([[cx - 52, 230], [cx - 2, 236], [cx - 2, 262], [cx - 54, 258]], "#f4eed6"); K.P([[cx + 2, 236], [cx + 52, 230], [cx + 54, 258], [cx + 2, 262]], "#ddd4b0");
      for (let l = 0; l < 7; l++) { K.S([[cx - 48, 236 + l * 3.4], [cx - 6, 240 + l * 3.2]], 0.7, "#6a6250"); K.S([[cx + 6, 240 + l * 3.2], [cx + 48 - (l === 6 ? 20 : 0), 236 + l * 3.4]], 0.7, l === 6 ? "#9a1224" : "#6a6250"); }
      // gaunt arms bound in yellowed wrappings; scales in the left hand
      const wrap = (x0, y0, x1, y1, w0, w1) => { H3.limb(K, x0, y0, x1, y1, w0, w1, WRAP); const n = 7; for (let i = 1; i < n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2 + 0.4, w = w0 + (w1 - w0) * t; K.S([[x - Math.cos(a) * w, y - Math.sin(a) * w], [x + Math.cos(a) * w, y + Math.sin(a) * w]], 0.9, "rgba(74,66,56,0.7)"); } };
      K.vol(cx - 50, 130, 16, 14, ["#463e6e", "#221e38", "#07060c"]); wrap(cx - 54, 136, cx - 86, 186, 9, 7); wrap(cx - 86, 186, cx - 96, 146, 7, 6);
      for (let f = 0; f < 4; f++) K.S([[cx - 96, 146], [cx - 100 + f * 3, 134 - (f % 2) * 3]], 1.8, "#a2957c");
      K.S([[cx - 98, 136], [cx - 98, 104]], 2, "#b08a28"); K.S([[cx - 128, 108], [cx - 68, 100]], 2.4, "#d8b440");
      for (const [x, y, d] of [[cx - 128, 108, 14], [cx - 68, 100, 4]]) { K.S([[x, y], [x - 9, y + d + 10], [x + 9, y + d + 10], [x, y]], 1, "#86621a"); K.E(x, y + d + 10, 11, 3.4, "#b08a28"); }
      H3.coin(K, cx - 131, 130, 4); H3.coin(K, cx - 125, 129, 4);
      K.vol(cx + 50, 130, 16, 14, ["#463e6e", "#221e38", "#07060c"]); wrap(cx + 54, 136, cx + 70, 190, 9, 7); wrap(cx + 70, 190, cx + 34, 234, 7, 6);
      for (let f = 0; f < 4; f++) K.S([[cx + 34, 234], [cx + 26 - f * 2, 238 + f]], 1.8, "#a2957c");
      K.S([[cx + 30, 240], [cx + 58, 196]], 1.6, "#e8e0cc"); for (let i = 0; i < 8; i++) K.S([[cx + 34 + i * 3.2, 234 - i * 5], [cx + 40 + i * 3.2, 232 - i * 5]], 1.4, "#f4eed6"); K.drip(cx + 29, 241, 6, 1.2, "#9a1224");
      // the head: a gold mask, cracked, over a dried face; one eye still lit; the tall mitre of office
      const hy = 90 + b;
      K.vol(cx, hy, 25, 30, ["#c8bca2", "#766a58", "#2e1e06"]);
      K.P([[cx - 22, hy - 20], [cx + 22, hy - 20], [cx + 21, hy + 10], [cx + 8, hy + 26], [cx - 8, hy + 26], [cx - 21, hy + 10]], K.LG(cx - 22, 0, cx + 22, 0, [[0, "#86621a"], [0.35, "#f6e07a"], [0.7, "#b08a28"], [1, "#5a3c0e"]]));
      K.S([[cx - 20, hy - 6], [cx - 6, hy - 9]], 1, "#5a3c0e"); K.S([[cx + 20, hy - 6], [cx + 6, hy - 9]], 1, "#5a3c0e"); K.S([[cx, hy - 4], [cx, hy + 10]], 1, "#86621a");
      K.P([[cx + 4, hy - 2], [cx + 22, hy - 10], [cx + 21, hy + 10], [cx + 10, hy + 22], [cx + 8, hy + 6]], "#766a58"); K.crack(cx + 4, hy - 18, 40, 1.6, "#2e1e06", 1.6);
      for (let i = 0; i < 4; i++) K.S([[cx + 10 + i * 3, hy + 4], [cx + 11 + i * 3, hy + 16]], 1.8, "#e8e0cc");
      K.E(cx - 9, hy - 2, 5, 3, ink); K.E(cx + 13, hy - 1, 5, 4, "#2e1e06"); K.E(cx + 13, hy - 1, 2.2, 2.2, "#ffcf4a"); K.E(cx + 13, hy - 1, 6, 6, "rgba(255,207,74,0.3)");
      K.R(cx - 10, hy + 13, 12, 2.4, ink);
      K.P([[cx - 25, hy - 18], [cx + 25, hy - 18], [cx + 18, hy - 70], [cx, hy - 90], [cx - 18, hy - 70]], K.LG(cx - 25, 0, cx + 25, 0, [[0, "#86621a"], [0.4, "#f6e07a"], [1, "#5a3c0e"]]));
      K.S([[cx, hy - 86], [cx, hy - 20]], 2.2, "#6a0c18"); K.S([[cx - 22, hy - 44], [cx + 22, hy - 44]], 2.2, "#6a0c18");
      K.vol(cx, hy - 44, 8, 8, ["#f6e07a", "#d8b440", "#5a3c0e"]); K.E(cx, hy - 44, 3.4, 2, ink); K.E(cx, hy - 44, 1.2, 1.2, "#ffcf4a");
      K.R(cx - 26, hy - 20, 52, 5, "#6a0c18"); for (let i = 0; i < 5; i++) K.E(cx - 20 + i * 10, hy - 17.5, 2, 2, "#d8b440");
      for (const s of [-1, 1]) { K.P([[cx + s * 16, hy - 16], [cx + s * 24, hy - 16], [cx + s * 26, hy + 30], [cx + s * 16, hy + 34]], "#6a0c18"); K.P([[cx + s * 16, hy + 34], [cx + s * 26, hy + 30], [cx + s * 21, hy + 40]], "#d8b440"); }
      // moths
      for (let i = 0; i < 6; i++) { const a = ph * 6.28 * (1 + i % 2) + i * 1.1, x = cx + Math.cos(a) * (70 + i * 6), y = 60 + i * 14 + Math.sin(a * 2) * 10; K.E(x - 2, y, 2.4, 1.4, "#c8bca2", -0.5); K.E(x + 2, y, 2.4, 1.4, "#a2957c", 0.5); }
    } },
    // Treasurer Quill (and the Tollkeeper): a stooped clerk, all neck and fingers, quills growing from his back
    quill: { w: 64, h: 116, ramps: ["ink", "cloth", "pale", "paper", "gold", "blood", "bone", "night", "rust"], paint(K, ph, v) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 192, cx = W / 2 + 4, toll = v === "tollkeeper";
      const COAT = toll ? ["#d8b440", "#86621a", "#2e1e06"] : ["#463e6e", "#221e38", "#07060c"], SKIN = toll ? ["#d8b440", "#86621a", "#2e1e06"] : ["#ececf2", "#a8a8ba", "#3a3a4a"];
      // the fan of quills, each a real feather
      for (let i = 0; i < 15; i++) { const a = -Math.PI * (0.18 + i * 0.047), x0 = cx - 4 + (i - 7) * 2.4, y0 = 132, L = 54 + ((i * 37) % 11) * 4 + (i === 7 ? 18 : 0), x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L;
        const mx = x0 + (x1 - x0) * 0.62, my = y0 + (y1 - y0) * 0.62; K.E(mx, my, L * 0.33, 4.4, toll ? "#bab08e" : "#ddd4b0", a); K.E(mx, my, L * 0.33, 1.6, toll ? "#948a70" : "#f4eed6", a);
        K.S([[x0, y0], [x1, y1]], 1.4, "#6a6250"); K.S([[x1 - Math.cos(a) * 6, y1 - Math.sin(a) * 6], [x1, y1]], 2, i % 3 ? "#07060c" : "#9a1224"); }
      // stilt legs in stockings, buckled shoes
      for (const s of [-1, 1]) { H3.limb(K, cx + s * 10, 262, cx + s * 14, 330, 5, 3.4, ["#5e5e70", "#3a3a4a", "#07060c"]); K.P([[cx + s * 14 - 7, 330], [cx + s * 14 + 9 * s, 330], [cx + s * 14 + 11 * s, 340], [cx + s * 14 - 7, 340]], "#07060c"); K.R(cx + s * 14 - 3, 331, 6, 3, "#d8b440"); }
      // the long coat, tails split behind, stooped forward
      K.P([[cx - 22, 126], [cx + 26, 120], [cx + 36, 200], [cx + 30, 272], [cx + 10, 300], [cx + 2, 272], [cx - 8, 304], [cx - 32, 280], [cx - 34, 200]], K.LG(cx - 34, 0, cx + 36, 0, [[0, COAT[2]], [0.4, COAT[0]], [0.7, COAT[1]], [1, COAT[2]]]));
      H3.folds(K, [cx - 18, cx + 22, 134], [cx - 30, cx + 30, 280], 5, "rgba(7,6,12,0.5)");
      K.P([[cx - 6, 128], [cx + 12, 126], [cx + 6, 210], [cx - 2, 212]], toll ? "#5a3c0e" : "#07060c"); for (let i = 0; i < 6; i++) K.E(cx + 4 - i * 0.5, 138 + i * 12, 2, 2, "#d8b440");
      // the ledger chained across his chest
      K.P([[cx - 28, 162], [cx + 22, 156], [cx + 26, 220], [cx - 24, 226]], "#523828"); K.P([[cx - 24, 164], [cx + 18, 159], [cx + 22, 216], [cx - 20, 221]], "#ddd4b0");
      for (let l = 0; l < 10; l++) K.S([[cx - 18, 170 + l * 5], [cx + 16, 165 + l * 5]], 0.8, l === 6 ? "#9a1224" : "#6a6250");
      for (const [x0, y0, x1, y1] of [[cx - 30, 150, cx + 30, 236], [cx + 30, 150, cx - 30, 236]]) for (let i = 0; i <= 10; i++) { const t = i / 10; K.E(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 2.8, 2, i % 2 ? "#76381a" : "#9a5226"); }
      if (toll) for (let i = 0; i < 16; i++) H3.coin(K, cx - 30 + K.rng() * 60, 236 + K.rng() * 50, 3.6);
      else { K.P([[cx - 30, 240], [cx - 18, 240], [cx - 17, 256], [cx - 31, 256]], "#1d1830"); K.E(cx - 24, 240, 6, 2, "#07060c"); K.drip(cx - 26, 256, 8 + b, 1.2, "#07060c"); }
      // arms that reach the knees; the right holds a quill as long as a sword, dripping red
      H3.limb(K, cx - 26, 134, cx - 40, 196, 6, 5, COAT); H3.limb(K, cx - 40, 196, cx - 46, 250, 5, 4, COAT, false); K.E(cx - 46, 252, 5, 3, "#07060c");
      for (let f = 0; f < 4; f++) K.Q([[cx - 46, 254], [cx - 50 + f * 3, 270], [cx - 54 + f * 4, 290 + (f % 2) * 4]], 1.6, SKIN[1]);
      H3.limb(K, cx + 26, 128, cx + 44, 180, 6, 5, COAT); H3.limb(K, cx + 44, 180, cx + 50, 226, 5, 4, COAT, false);
      for (let f = 0; f < 4; f++) K.S([[cx + 46, 228 + f * 3], [cx + 58, 226 + f * 4]], 1.6, SKIN[1]);
      K.S([[cx + 40, 290], [cx + 70, 110]], 2, "#6a6250"); K.E(cx + 62, 150, 30, 6, "#f4eed6", -1.4); K.E(cx + 62, 150, 30, 2, "#ddd4b0", -1.4); K.S([[cx + 40, 290], [cx + 44, 270]], 2.4, "#07060c"); K.drip(cx + 40, 292, 10 + b * 2, 1.6, "#9a1224");
      // the head craned forward on a long neck: spectacles, an ink-black mouth; the Tollkeeper has a coin slot
      const hx = cx + 6, hy = 96 + b;
      K.Q([[cx - 2, 128], [cx + 4, 116], [hx, hy + 18]], 8, SKIN[1]);
      K.vol(hx, hy, 17, 23, SKIN);
      K.E(hx - 10, hy + 6, 4, 8, "rgba(58,58,74,0.45)"); K.E(hx + 10, hy + 6, 4, 8, "rgba(58,58,74,0.45)");
      for (const x of [-7, 7]) { K.E(hx + x, hy - 2, 6.4, 6, "rgba(158,240,245,0.3)"); K.S([[hx + x - 6.4, hy - 2], [hx + x - 4.4, hy - 6.4], [hx + x, hy - 8], [hx + x + 4.4, hy - 6.4], [hx + x + 6.4, hy - 2], [hx + x + 4.4, hy + 2.4], [hx + x, hy + 4], [hx + x - 4.4, hy + 2.4], [hx + x - 6.4, hy - 2]], 1.2, "#b08a28"); K.E(hx + x + 1, hy - 1, 1.6, 1.6, "#9a1224"); }
      K.S([[hx - 3, hy - 3], [hx + 7, hy + 3]], 0.8, "#ececf2"); K.S([[hx - 1, hy - 2], [hx + 1, hy - 2]], 1.4, "#b08a28");
      if (toll) { K.R(hx - 10, hy + 13, 20, 3.4, "#07060c"); H3.coin(K, hx, hy + 11, 4, 1); }
      else { K.E(hx, hy + 14, 7, 3.4, "#07060c"); K.drip(hx - 2, hy + 16, 16 + b * 2, 2, "#07060c"); K.drip(hx + 4, hy + 16, 9, 1.4, "#07060c"); }
      K.P([[hx - 19, hy - 16], [hx + 19, hy - 16], [hx + 14, hy - 40], [hx - 14, hy - 40]], toll ? "#5a3c0e" : "#141222"); K.R(hx - 22, hy - 18, 44, 4, toll ? "#86621a" : "#221e38");
      if (toll) { K.R(hx - 12, hy - 34, 24, 10, "#ddd4b0"); K.S([[hx - 8, hy - 29], [hx + 8, hy - 29]], 1.4, "#9a1224"); }
      // loose pages drifting
      for (let i = 0; i < 4; i++) { const x = 20 + i * 44, y = (40 + i * 70 + ph * 80) % 330; K.P([[x, y], [x + 9, y - 2], [x + 10, y + 8], [x + 1, y + 10]], "#ddd4b0"); }
    } },
    // Sister Vela, the Storm Tyrant: a nun become the storm, veil streaming, lightning pouring from her hands
    vela: { w: 96, h: 118, ramps: ["ink", "storm", "cloth", "pale", "glowc", "blood", "night", "salt"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 4, W = 288, H = 354, cx = W / 2, flick = Math.floor(ph * 6) % 3;
      // a halo of broken light behind her
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r0 = 44, r1 = 58 + ((i + flick) % 3) * 8; K.S([[cx + Math.cos(a) * r0, 86 + b + Math.sin(a) * r0], [cx + Math.cos(a + 0.1) * r1, 86 + b + Math.sin(a + 0.1) * r1]], 2, "rgba(200,216,255,0.55)"); }
      K.E(cx, 86 + b, 48, 48, K.RG(cx, 86 + b, 10, 60, [[0, "rgba(200,216,255,0.35)"], [1, "rgba(122,154,216,0)"]]));
      // the veil, torn into streamers by the wind
      for (let i = 0; i < 5; i++) { const y0 = 74 + i * 10 + b, sw = Math.sin(ph * 6.28 + i) * 10; K.Q([[cx + 14, y0], [cx + 70 + sw, y0 + 10 + i * 6], [cx + 128 + sw * 1.4, y0 + 30 + i * 16]], 10 - i, i % 2 ? "#221e38" : "#141222"); K.Q([[cx + 14, y0 - 2], [cx + 70 + sw, y0 + 8 + i * 6], [cx + 124 + sw * 1.4, y0 + 28 + i * 16]], 1.4, "rgba(122,154,216,0.6)"); }
      // lightning hair escaping the coif
      for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.15 + i * 0.09); let x = cx, y = 66 + b; const pts = [[x, y]]; for (let k = 0; k < 5; k++) { x += Math.cos(a + (K.rng() - 0.5) * 1) * 13; y += Math.sin(a + (K.rng() - 0.5) * 1) * 13; pts.push([x, y]); } K.S(pts, 3.4, "#4a64a0"); K.S(pts, 1.2, (i + flick) % 3 === 0 ? "#ffffff" : "#c8d8ff"); }
      // the storm she rides instead of feet
      for (let i = 0; i < 9; i++) { const x = cx - 100 + i * 25, y = 318 + Math.sin(i * 1.7 + ph * 6.28) * 6; K.vol(x, y, 32, 20, ["#4a64a0", "#2a3a66", "#141222"]); }
      for (let i = 0; i < 3; i++) { let x = cx - 70 + i * 60, y = 300; const pts = [[x, y]]; for (let k = 0; k < 4; k++) { x += (K.rng() - 0.5) * 30; y += 12; pts.push([x, y]); } if ((i + flick) % 2) { K.S(pts, 2.4, "#7a9ad8"); K.S(pts, 1, "#ffffff"); } }
      // the habit, blown sideways, hem shredded into the cloud
      K.P([[cx - 26, 118 + b], [cx + 26, 118 + b], [cx + 50, 180 + b], [cx + 84, 250 + b], [cx + 112, 300], [cx + 80, 296], [cx + 70, 318], [cx + 44, 300], [cx + 20, 324], [cx, 300], [cx - 22, 320], [cx - 40, 298], [cx - 62, 312], [cx - 56, 250 + b], [cx - 44, 180 + b]],
        K.LG(cx - 60, 0, cx + 110, 0, [[0, "#07060c"], [0.3, "#2a3a66"], [0.55, "#1a2440"], [1, "#07060c"]]));
      for (let i = 0; i < 7; i++) K.Q([[cx - 18 + i * 6, 132 + b], [cx - 20 + i * 14 + b, 220], [cx - 44 + i * 22, 304]], 1.6, "rgba(122,154,216,0.4)");
      K.P([[cx - 30, 118 + b], [cx + 30, 118 + b], [cx + 22, 156 + b], [cx, 164 + b], [cx - 22, 156 + b]], "#ececf2"); K.S([[cx - 22, 156 + b], [cx, 164 + b], [cx + 22, 156 + b]], 1.4, "#a8a8ba");
      K.S([[cx, 164 + b], [cx, 200 + b]], 2, "#c8d8ff"); K.S([[cx - 8, 176 + b], [cx + 8, 176 + b]], 2, "#c8d8ff");
      // arms flung up, sleeves falling back, lightning pouring out of the palms
      for (const s of [-1, 1]) {
        K.P([[cx + s * 24, 124 + b], [cx + s * 44, 118 + b], [cx + s * 72, 70 + b], [cx + s * 56, 64 + b]], s < 0 ? "#221e38" : "#141222");
        H3.limb(K, cx + s * 62, 68 + b, cx + s * 84, 30 + b, 5, 4, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
        for (let f = 0; f < 4; f++) K.S([[cx + s * 84, 30 + b], [cx + s * (86 + f * 3), 16 + b + f * 2]], 1.6, "#ccccd8");
        K.E(cx + s * 86, 22 + b, 14, 14, K.RG(cx + s * 86, 22 + b, 1, 16, [[0, "rgba(255,255,255,0.95)"], [1, "rgba(122,154,216,0)"]]));
        for (let k = 0; k < 2; k++) { let x = cx + s * 86, y = 22 + b; const pts = [[x, y]]; for (let j = 0; j < 5; j++) { x += s * (6 + K.rng() * 10); y -= 4 + K.rng() * 6 - k * 8; pts.push([x, y]); } K.S(pts, 3, "#7a9ad8"); K.S(pts, 1.2, "#ffffff"); }
      }
      // the face in the coif: white eyes, the mouth's stitches torn open in a scream
      const hy = 84 + b;
      K.P([[cx - 24, hy + 26], [cx - 22, hy - 18], [cx - 10, hy - 28], [cx + 10, hy - 28], [cx + 22, hy - 18], [cx + 24, hy + 26]], "#141222");
      K.E(cx, hy, 19, 25, "#ececf2");
      K.vol(cx, hy + 1, 15, 21, ["#ececf2", "#a8a8ba", "#5e5e70"]);
      for (const s of [-1, 1]) { K.E(cx + s * 6.4, hy - 4, 4.4, 3.4, "#3a3a4a"); K.E(cx + s * 6.4, hy - 4, 3.2, 2.4, "#ffffff"); K.E(cx + s * 6.4, hy - 4, 6, 5, "rgba(200,216,255,0.4)"); K.drip(cx + s * 6.4, hy - 1, 16, 1.2, "#c8d8ff"); K.S([[cx + s * 12, hy - 10], [cx + s * 3, hy - 7]], 1.4, "#3a3a4a"); }
      K.E(cx, hy + 11, 6, 8.5, "#1e0306"); K.E(cx, hy + 14, 3, 3.4, "#6a0c18");
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { K.S([[cx + s * 5, hy + 6 + k * 4], [cx + s * 11, hy + 4 + k * 4]], 1, "#40070e"); K.S([[cx + s * 11, hy + 4 + k * 4], [cx + s * 13, hy + 6 + k * 4]], 0.8, "#848498"); }
      // rain, slanting with the wind
      for (let i = 0; i < 30; i++) { const x = K.rng() * W, y = (K.rng() * H + ph * H) % H; K.S([[x, y], [x - 5, y + 11]], 1, "rgba(200,216,255,0.5)"); }
    } },
  });
  // faceted salt: each face lit by how much it turns toward the light (up and to the left)
  H3.SALT = ["#565a74", "#7e829c", "#a6aac2", "#cacee0", "#e8ecf8", "#ffffff"];
  H3.facet = (K, pts, ramp = H3.SALT, bias = 0) => {
    const cx0 = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy0 = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b2 = pts[(i + 1) % pts.length], mx = (a[0] + b2[0]) / 2 - cx0, my = (a[1] + b2[1]) / 2 - cy0, L = Math.hypot(mx, my) || 1;
      const lit = (-mx / L * 0.7 - my / L * 0.7) * 0.5 + 0.5 + bias, k = Math.max(0, Math.min(ramp.length - 1, Math.round(lit * (ramp.length - 1))));
      K.P([[cx0, cy0], a, b2], ramp[k]);
    }
    K.P(pts.map(([x, y]) => [cx0 + (x - cx0) * 0.45, cy0 + (y - cy0) * 0.45]), ramp[Math.min(ramp.length - 1, Math.round((0.62 + bias) * (ramp.length - 1)))]);
  };
  H3.rock = (K, x, y, rx, ry, n = 7, rot = 0) => { const pts = []; for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2, r = 0.8 + K.rng() * 0.3; pts.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]); } return pts; };
  Object.assign(BOSS_ART, {
    // the Salt Wyrm: a serpent of salt plates rearing out of its own coil, a crystal skull for a head
    wyrm: { w: 112, h: 96, ramps: ["ink", "salt", "pale", "bone", "blood", "glowc", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2), W = 336, cx = W / 2;
      // the spine: a coil on the ground, then a rearing S up to the head
      const pts = []; for (let i = 0; i <= 34; i++) { const t = i / 34; let x, y;
        if (t < 0.45) { const a = t / 0.45 * Math.PI * 1.6 + 0.4; x = cx + 70 + Math.cos(a) * 70; y = 236 + Math.sin(a) * 30; }
        else { const u = (t - 0.45) / 0.55; x = cx + 70 + Math.cos(0.4 + Math.PI * 1.6) * 70 - u * 170 + Math.sin(u * Math.PI * 2 + ph * 6.28) * 14; y = 236 + Math.sin(0.4 + Math.PI * 1.6) * 30 - u * 150 + Math.sin(u * Math.PI) * 30; }
        pts.push([x, y]); }
      K.E(cx + 50, 262, 130, 16, "rgba(7,6,12,0.35)");
      for (let i = 0; i < pts.length - 1; i++) {
        const [x, y] = pts[i], [x2, y2] = pts[i + 1], a = Math.atan2(y2 - y, x2 - x), r = 24 - i * 0.28, nx = -Math.sin(a), ny = Math.cos(a), top = ny > 0 ? -1 : 1;
        // a plate: a six-sided slab across the body
        const P6 = [[x + nx * r, y + ny * r], [x + Math.cos(a) * r * 0.5 + nx * r * 0.8, y + Math.sin(a) * r * 0.5 + ny * r * 0.8], [x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6],
          [x + Math.cos(a) * r * 0.5 - nx * r * 0.8, y + Math.sin(a) * r * 0.5 - ny * r * 0.8], [x - nx * r, y - ny * r], [x - Math.cos(a) * r * 0.4, y - Math.sin(a) * r * 0.4]];
        H3.facet(K, P6, H3.SALT, i % 2 ? -0.05 : 0.05);
        // belly scutes, darker, on the underside
        K.S([[x - nx * top * r * 0.9, y - ny * top * r * 0.9], [x2 - nx * top * r * 0.9, y2 - ny * top * r * 0.9]], 3, "#565a74");
        // spines along the back
        if (i % 2 === 0) H3.shard(K, x + nx * top * r * 0.8, y + ny * top * r * 0.8, 14 + (i > 12 ? 10 : 4) + (i % 4) * 3, Math.atan2(ny * top, nx * top) - 0.4 * Math.sign(Math.cos(a) || 1), i % 6 === 0);
        if (i % 5 === 2) K.crack(x, y, r * 0.8, a + 1, "#565a74", 1);
      }
      // the head: an angular skull of salt, jaw hanging open, the throat lit from inside
      const [hx, hy0] = pts[pts.length - 1], hy = hy0 - 6 + b * 3;
      H3.facet(K, [[hx - 50, hy - 4], [hx - 30, hy - 26], [hx + 8, hy - 34], [hx + 36, hy - 22], [hx + 40, hy + 2], [hx + 10, hy + 8], [hx - 40, hy + 8]], H3.SALT, 0.08);
      H3.facet(K, [[hx - 56, hy + 14 + b * 4], [hx - 6, hy + 10], [hx + 34, hy + 10], [hx + 24, hy + 34 + b * 6], [hx - 30, hy + 36 + b * 6]], H3.SALT, -0.1);
      K.P([[hx - 46, hy + 7], [hx + 30, hy + 8], [hx + 22, hy + 22 + b * 6], [hx - 40, hy + 22 + b * 6]], "#1e0306");
      K.E(hx - 6, hy + 16 + b * 3, 26, 8, K.RG(hx - 6, hy + 16, 1, 28, [[0, "rgba(158,240,245,0.9)"], [0.5, "rgba(62,224,232,0.35)"], [1, "rgba(62,224,232,0)"]]));
      for (let i = 0; i < 10; i++) { const x = hx - 44 + i * 7.4; K.P([[x, hy + 7], [x + 5, hy + 7], [x + 2.5, hy + 16 + (i % 3) * 3]], "#f0f4ff"); K.P([[x + 1, hy + 22 + b * 6], [x + 5, hy + 22 + b * 6], [x + 3, hy + 14 + b * 6 - (i % 2) * 3]], "#cacee0"); }
      for (const s of [0, 1]) { const ex = hx - 16 + s * 26, ey = hy - 12; K.P([[ex - 9, ey - 2], [ex + 7, ey - 6], [ex + 8, ey + 3], [ex - 6, ey + 4]], "#07060c"); K.E(ex, ey - 1, 4, 2.6, "#3ee0e8"); K.E(ex, ey - 1, 8, 5, "rgba(62,224,232,0.35)"); }
      H3.shard(K, hx + 18, hy - 28, 46, -1.0, true); H3.shard(K, hx - 4, hy - 30, 38, -1.5, true); H3.shard(K, hx + 34, hy - 16, 26, -0.4, false); H3.shard(K, hx - 26, hy - 22, 22, -2.0, false);
      K.S([[hx - 50, hy - 4], [hx - 58, hy - 2]], 2, "#a6aac2");
      // a breath of salt dust
      for (let i = 0; i < 16; i++) { const t = (ph + i / 16) % 1, x = hx - 60 - t * 90 + Math.sin(i) * 8, y = hy + 18 + t * 30 + Math.cos(i * 2) * 10 * t; K.E(x, y, 1.6 + t * 3, 1.6 + t * 3, `rgba(232,236,248,${(0.7 * (1 - t)).toFixed(2)})`); }
    } },
    // the Salt Colossus: dead choir-sisters packed into a giant of salt, their faces still singing in its body
    colossus: { w: 112, h: 118, ramps: ["ink", "salt", "pale", "blood", "glowc", "night", "bone"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, cx = W / 2;
      K.E(cx, 344, 140, 10, "rgba(7,6,12,0.4)");
      // legs: stacked boulders
      for (const s of [-1, 1]) { H3.facet(K, H3.rock(K, cx + s * 44, 270, 34, 30, 7, 0.3)); H3.facet(K, H3.rock(K, cx + s * 50, 320, 38, 24, 8, 0.1)); for (let t = 0; t < 3; t++) H3.shard(K, cx + s * (32 + t * 14), 338, 12, Math.PI / 2 + s * 0.3, false); }
      // the arms, hanging almost to the ground, fists of crystal
      for (const s of [-1, 1]) {
        H3.facet(K, H3.rock(K, cx + s * 118, 136, 40, 34, 7, 0.5));
        H3.facet(K, H3.rock(K, cx + s * 130, 200, 30, 36, 6, 0.2));
        H3.facet(K, H3.rock(K, cx + s * 132, 268, 36, 32, 7, 0.9));
        for (let t = 0; t < 4; t++) H3.shard(K, cx + s * (112 + t * 12), 290, 16, Math.PI / 2 + s * (0.5 - t * 0.25), t === 1);
      }
      // the body: one great mass of salt, cracked, with the choir inside
      H3.facet(K, [[cx - 96, 110], [cx - 40, 86], [cx + 40, 84], [cx + 98, 108], [cx + 104, 190], [cx + 80, 256], [cx + 20, 272], [cx - 40, 270], [cx - 88, 250], [cx - 106, 180]], H3.SALT, 0.02);
      for (let i = 0; i < 7; i++) K.crack(cx - 80 + i * 26, 100 + (i % 3) * 20, 60, 1.3 + (i % 2) * 0.5, "#565a74", 1.2);
      // a hollow in the chest where the tone lives
      K.E(cx, 176, 24, 30, "#07060c"); K.E(cx, 176, 40, 44, K.RG(cx, 176, 2, 46, [[0, "rgba(158,240,245,0.8)"], [0.5, "rgba(62,224,232,0.25)"], [1, "rgba(62,224,232,0)"]]));
      for (let i = 0; i < 5; i++) H3.shard(K, cx - 20 + i * 10, 150 - (i % 2) * 4, 12, Math.PI / 2 + (i - 2) * 0.3, true);
      // faces: sunk into the salt, eyes closed or hollow, mouths open on the note
      const faces = [[cx - 64, 128, 1], [cx - 30, 118, 0.9], [cx + 32, 120, 1], [cx + 66, 134, 0.95], [cx - 72, 184, 1.05], [cx + 70, 190, 1], [cx - 48, 230, 0.95], [cx - 6, 238, 0.9], [cx + 42, 232, 1]];
      faces.forEach(([x, y, s], i) => {
        K.E(x, y + 2, 13 * s, 16 * s, "#565a74");
        K.E(x, y, 11 * s, 14 * s, K.RG(x - 3, y - 4, 1, 16 * s, [[0, "#ececf2"], [0.6, "#a8a8ba"], [1, "#5e5e70"]]));
        if (i % 3 === 0) { K.S([[x - 6 * s, y - 3 * s], [x - 2 * s, y - 2 * s]], 1.2, "#3a3a4a"); K.S([[x + 2 * s, y - 2 * s], [x + 6 * s, y - 3 * s]], 1.2, "#3a3a4a"); }
        else { K.E(x - 4 * s, y - 3 * s, 2.4 * s, 3 * s, "#07060c"); K.E(x + 4 * s, y - 3 * s, 2.4 * s, 3 * s, "#07060c"); }
        K.E(x, y + 6 * s, 3 * s, (4 + Math.sin(ph * 6.28 + i) * 1.4) * s, "#07060c");
        K.S([[x - 12 * s, y - 12 * s], [x - 2 * s, y - 15 * s], [x + 10 * s, y - 12 * s]], 2, "#221e38");
        if (i % 4 === 1) K.drip(x + 3 * s, y + 10 * s, 12 + b, 1.4, "#9a1224");
      });
      // shoulders bristling with crystal
      for (const [x, y, h, a] of [[cx - 96, 104, 40, -2.4], [cx - 80, 92, 30, -2.0], [cx + 96, 102, 44, -0.7], [cx + 82, 90, 28, -1.1], [cx - 110, 130, 26, -2.9], [cx + 112, 128, 26, -0.2]]) H3.shard(K, x, y, h, a, h > 35);
      // the head: a small cluster of salt with one face in it, and a crown of shards
      H3.facet(K, H3.rock(K, cx, 64 + b, 34, 30, 8, 0.2), H3.SALT, 0.06);
      K.E(cx, 68 + b, 14, 17, K.RG(cx - 3, 62 + b, 1, 18, [[0, "#ececf2"], [0.6, "#a8a8ba"], [1, "#5e5e70"]]));
      for (const s of [-1, 1]) { K.E(cx + s * 6, 64 + b, 3.4, 3, "#07060c"); K.E(cx + s * 6, 64 + b, 1.6, 1.4, "#3ee0e8"); }
      K.E(cx, 76 + b, 4, 5.4, "#07060c");
      for (let i = 0; i < 7; i++) H3.shard(K, cx - 24 + i * 8, 40 + b + Math.abs(i - 3) * 3, 16 + (3 - Math.abs(i - 3)) * 7, -Math.PI / 2 + (i - 3) * 0.16, i === 3);
      // salt sifting off it
      for (let i = 0; i < 14; i++) { const x = cx - 110 + K.rng() * 220, y = (K.rng() * 300 + ph * 90) % 330; K.R(x, y, 1.6, 1.6, "rgba(232,236,248,0.6)"); }
    } },
  });
  BOSS_ART.tollkeeper = { ...BOSS_ART.quill, variant: "tollkeeper" };
