  // ================================================================== SECOND PHASES: EVERY BOSS TRANSFORMS
  // At half health each boss becomes something else, with its own shape and character, painted like the first form.
  // The change itself plays out: the old form shakes and flickers white, shards burst, the new form stands in the
  // flash, and a title names what it has become.
  const P2NAME = {
    butcher: "The Unbound Butcher", mother: "The Brood Queen", choirmaster: "The Dead Conductor", voss: "Voss, the Bell Incarnate", hollis: "Hollis Unmasked",
    quill: "The Ledger Made Flesh", gulp: "Gulp, Bloated King", maw: "Maw and the Drowned Ship", colossus: "The Screaming Choir", vela: "Vela, the Storm Itself",
    king: "Aurel, the Deep's Crown", corvin: "Corvin, the Golden Debt", ledgertree: "The Burning Ledger Tree", tollkeeper: "The Toll Engine", oldmouth: "The Abyss Mouth", wyrm: "The Crystal Dragon",
  };
  const fang = (K, x, y, w, h, col = "#e8e0cc", dn = 1) => K.P([[x - w / 2, y], [x + w / 2, y], [x, y + h * dn]], col);
  const eyeGlow = (K, x, y, r, col) => { K.E(x, y, r * 2.2, r * 2.2, K.RG(x, y, 0.5, r * 2.4, [[0, col], [1, "rgba(0,0,0,0)"]])); K.E(x, y, r, r, "#ffffff"); K.E(x, y, r * 0.6, r * 0.6, col); };
  const P2ART = {
    // the hood torn away: a hog's skull, four arms with hooks and cleavers, the gut split into a mouth
    butcher: { w: 100, h: 110, ramps: ["ink", "flesh", "blood", "leather", "rust", "bone", "glowr", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 300, cx = W / 2, SK = ["#e2b394", "#ad7058", "#4a2226"];
      for (const s of [-1, 1]) { H3.limb(K, cx + s * 18, 230, cx + s * 30, 290, 22, 16, SK); H3.limb(K, cx + s * 30, 290, cx + s * 34, 322, 16, 12, SK, false); K.P([[cx + s * 22, 318], [cx + s * 50, 318], [cx + s * 52, 330], [cx + s * 20, 330]], "#1e140e"); }
      for (const [s, y, a] of [[-1, 120, -0.9], [1, 118, -2.2], [-1, 176, 0.5], [1, 172, 2.6]]) {   // four arms
        const ex = cx + s * 92, ey = y + (a < 0 ? -30 : 34) + b, hx = cx + s * 120, hy = y + (a < 0 ? -64 : 70) + b;
        H3.limb(K, cx + s * 52, y, ex, ey, 18, 14, SK); H3.limb(K, ex, ey, hx, hy, 14, 11, SK, false);
        if (a < 0) { K.P([[hx - 14, hy - 4], [hx + 18, hy - 22], [hx + 26, hy - 6], [hx - 4, hy + 10]], K.LG(hx - 14, hy, hx + 26, hy, [[0, "#c8bca2"], [1, "#2a1208"]])); K.drip(hx + 6, hy + 6, 14, 2, "#9a1224"); }
        else { K.Q([[hx, hy], [hx + s * 14, hy + 20], [hx + s * 2, hy + 30]], 5, "#bc7038"); for (let i = 0; i < 6; i++) K.S([[hx - s * i * 6, hy - i * 10], [hx - s * i * 6 - 4, hy - i * 10 - 6]], 3, "#76381a"); }
      }
      K.vol(cx, 170 + b * 0.3, 78, 82, SK); K.dots(120, cx - 70, 100, cx + 70, 240, "rgba(42,20,24,0.5)", 1);
      K.E(cx, 184 + b * 0.3, 40, 54, "#1e0306"); for (let i = 0; i < 9; i++) { fang(K, cx - 34 + i * 8.5, 134 + b * 0.3, 7, 14); fang(K, cx - 34 + i * 8.5, 236 + b * 0.3, 7, 14, "#c8bca2", -1); }
      for (let i = 0; i < 5; i++) K.Q([[cx - 36, 150 + i * 16], [cx, 140 + i * 18], [cx + 36, 150 + i * 16]], 3, "#e8e0cc");
      K.E(cx, 190, 16, 12, "#9a1224");
      K.S([[cx - 60, 100], [cx - 30, 150], [cx + 30, 150], [cx + 60, 100]], 5, "#523828");   // the torn apron straps
      const hy = 66 + b;   // the hog's skull
      K.vol(cx, hy, 42, 38, ["#f0e8d8", "#b8ac94", "#4a4238"]); K.P([[cx - 22, hy + 10], [cx + 22, hy + 10], [cx + 18, hy + 44], [cx - 18, hy + 44]], "#d8ccb4");
      K.E(cx - 8, hy + 34, 5, 7, "#1d1830"); K.E(cx + 8, hy + 34, 5, 7, "#1d1830");
      for (const s of [-1, 1]) { K.Q([[cx + s * 20, hy + 28], [cx + s * 44, hy + 30], [cx + s * 48, hy + 6]], 7, "#e8e0cc"); K.E(cx + s * 18, hy - 6, 11, 9, "#07060c"); eyeGlow(K, cx + s * 18, hy - 6, 4, "#ff2d2d"); K.P([[cx + s * 30, hy - 26], [cx + s * 52, hy - 50], [cx + s * 40, hy - 18]], "#b8ac94"); }
      for (let i = 0; i < 6; i++) K.drip(cx - 16 + i * 6, hy + 44, 8 + K.rng() * 14, 1.6, "#9a1224");
      for (let i = 0; i < 10; i++) { const a = ph * 6.28 * 2 + i * 0.7; K.E(cx + Math.cos(a) * (70 + i * 4), 120 + Math.sin(a * 1.3) * 60, 1.8, 1.4, "#07060c"); }
    } },
    // risen from the mound: a leech-woman as tall as a door, a lamprey mouth for a crown, leechlings for hair
    mother: { w: 104, h: 118, ramps: ["ink", "leech", "blood", "pale", "bone", "glowr", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 312, cx = W / 2, LE = ["#e0a0bc", "#7a3060", "#1e0a18"];
      K.vol(cx, 320, 150, 34, ["#c07098", "#5a1e48", "#1e0a18"]);   // what is left of the mound
      for (let i = 0; i < 12; i++) { const x = cx - 140 + i * 25, w = Math.sin(ph * 6.28 + i) * 6; K.Q([[x, 318], [x + 6 + w, 290], [x + 14, 300 + (i % 3) * 6]], 6, "#5a1e48"); }
      K.P([[cx - 40, 320], [cx - 30, 180], [cx - 50, 120], [cx + 50, 120], [cx + 30, 180], [cx + 40, 320]], K.LG(cx - 50, 0, cx + 50, 0, [[0, LE[2]], [0.4, LE[1]], [0.6, LE[0]], [1, LE[2]]]));   // a long body in rings
      for (let i = 0; i < 12; i++) K.Q([[cx - 38, 140 + i * 15], [cx, 134 + i * 15], [cx + 38, 140 + i * 15]], 2, "rgba(30,10,24,0.55)");
      for (const s of [-1, 1]) { H3.limb(K, cx + s * 44, 140, cx + s * 96, 180 + b, 12, 9, LE); H3.limb(K, cx + s * 96, 180 + b, cx + s * 110, 240 + b, 9, 7, LE, false); for (let f = 0; f < 4; f++) K.S([[cx + s * 110, 240 + b], [cx + s * (104 + f * 5), 262 + b]], 2.4, "#3a1230"); }
      K.vol(cx, 150, 34, 40, ["#ececf2", "#a8a8ba", "#5a1e48"]);   // a pale woman's torso stitched into it
      const hy = 70 + b;
      K.vol(cx, hy, 30, 40, LE);
      K.E(cx, hy + 4, 24, 28, "#1e0306"); for (const [rr, col] of [[24, "#e8e0cc"], [16, "#c8bca2"], [9, "#a2957c"]]) for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28 + rr; K.P([[cx + Math.cos(a) * rr, hy + 4 + Math.sin(a) * rr * 1.1], [cx + Math.cos(a + 0.2) * rr, hy + 4 + Math.sin(a + 0.2) * rr * 1.1], [cx + Math.cos(a + 0.1) * (rr - 6), hy + 4 + Math.sin(a + 0.1) * (rr - 6) * 1.1]], col); }
      K.E(cx, hy + 6, 5, 6, "#ff2d2d");
      for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.05 + i / 13 * 0.9), w = Math.sin(ph * 6.28 + i) * 8, x0 = cx + Math.cos(a) * 30, y0 = hy + Math.sin(a) * 34; const x1 = cx + Math.cos(a) * (70 + (i % 3) * 14) + w, y1 = hy + Math.sin(a) * (80 + (i % 2) * 20); K.Q([[x0, y0], [(x0 + x1) / 2 + w, (y0 + y1) / 2], [x1, y1]], 6 - (i % 2), i % 2 ? "#7a3060" : "#5a1e48"); K.E(x1, y1, 3.4, 3.4, "#9a1224"); }
      for (const s of [-1, 1]) { eyeGlow(K, cx + s * 44, hy + 30, 3, "#ff2d2d"); eyeGlow(K, cx + s * 30, hy + 50, 2.4, "#ff2d2d"); }
    } },
    // the robe falls: a skeleton conducting with its own arm bone, organ pipes grown out of its spine like wings
    choirmaster: { w: 120, h: 118, ramps: ["ink", "bone", "night", "pale", "gold", "glowy", "blood"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 360, cx = W / 2, BN = ["#e8e0cc", "#a2957c", "#4a4238"];
      for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const x = cx + s * (40 + i * 20), h = 150 - i * 14 + Math.sin(i + ph * 6.28) * 4, y = 60 + i * 14; K.P([[x - 7, y + h], [x - 7, y], [x + 7, y], [x + 7, y + h]], K.LG(x - 7, 0, x + 7, 0, [[0, "#86621a"], [0.5, "#f6e07a"], [1, "#5a3c0e"]])); K.E(x, y, 7, 3, "#2e1e06"); K.E(x, y + 10, 4, 5, "#07060c"); const f = 6 + Math.sin(ph * 12 + i) * 2; K.E(x, y - f, 3, f, "#ff9a3d"); }
      K.P([[cx - 70, 330], [cx - 40, 250], [cx + 40, 250], [cx + 70, 330]], "#141222");   // the robe in a heap
      for (let i = 0; i < 8; i++) K.S([[cx, 120 + i * 16], [cx, 128 + i * 16]], 6, BN[1]);   // spine
      for (const s of [-1, 1]) for (let i = 0; i < 6; i++) K.Q([[cx, 130 + i * 14], [cx + s * 30, 124 + i * 14], [cx + s * 36, 140 + i * 14]], 4, BN[0]);
      K.P([[cx - 30, 234], [cx + 30, 234], [cx + 22, 256], [cx - 22, 256]], BN[1]);
      for (const s of [-1, 1]) { H3.limb(K, cx + s * 14, 250, cx + s * 22, 300, 5, 4, BN); H3.limb(K, cx + s * 22, 300, cx + s * 24, 330, 4, 3, BN, false); }
      H3.limb(K, cx - 38, 124, cx - 70, 170, 5, 4, BN); H3.limb(K, cx - 70, 170, cx - 60, 212, 4, 3, BN, false);
      H3.limb(K, cx + 38, 124, cx + 76, 96 + b * 4, 5, 4, BN); H3.limb(K, cx + 76, 96 + b * 4, cx + 110, 60 + b * 6, 4, 3, BN, false); K.S([[cx + 110, 60 + b * 6], [cx + 150, 20 + b * 8]], 3, BN[0]);
      const hy = 80 + b; K.vol(cx, hy, 24, 28, BN); K.E(cx - 9, hy - 2, 7, 8, "#07060c"); K.E(cx + 9, hy - 2, 7, 8, "#07060c"); eyeGlow(K, cx - 9, hy - 2, 2.4, "#ffcf4a"); eyeGlow(K, cx + 9, hy - 2, 2.4, "#ffcf4a");
      K.E(cx, hy + 16, 10, 7 + b, "#07060c"); for (let i = 0; i < 6; i++) fang(K, cx - 9 + i * 3.6, hy + 11, 3, 4, BN[0]);
      for (let i = 0; i < 9; i++) { const a = ph * 6.28 + i * 0.7, x = cx + Math.cos(a) * (110 + (i % 3) * 20), y = 170 + Math.sin(a) * 90; K.vol(x, y, 9, 11, ["#ececf2", "#a8a8ba", "rgba(58,58,74,0.4)"]); K.E(x - 3, y - 2, 2, 2.4, "#07060c"); K.E(x + 3, y - 2, 2, 2.4, "#07060c"); K.E(x, y + 5, 2.4, 3.4, "#07060c"); }
      for (let s = 0; s < 3; s++) for (let l = 0; l < 5; l++) K.Q([[20, 40 + s * 110 + l * 4], [cx, 20 + s * 110 + l * 4 + Math.sin(ph * 6.28 + s) * 10], [W - 20, 40 + s * 110 + l * 4]], 0.8, "rgba(255,207,74,0.35)");
    } },
    // the Bell becomes his head: a body of salt crystal, the Bell ringing where his face was, light in every crack
    voss: { w: 104, h: 120, ramps: ["ink", "salt", "glowc", "gold", "blood", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 312, cx = W / 2, ring = 0.6 + 0.4 * Math.sin(ph * Math.PI * 4);
      K.E(cx, 60, 120 * ring, 90 * ring, K.RG(cx, 60, 10, 130, [[0, "rgba(158,240,245,0.55)"], [1, "rgba(62,224,232,0)"]]));
      for (let r = 0; r < 3; r++) { const s = (ph + r / 3) % 1; K.S([[cx - 140 * s, 60 - 60 * s], [cx, 60 - 90 * s], [cx + 140 * s, 60 - 60 * s]], 1.4, `rgba(158,240,245,${(0.8 * (1 - s)).toFixed(2)})`); }
      for (const s of [-1, 1]) { H3.facet(K, [[cx + s * 16, 240], [cx + s * 48, 244], [cx + s * 44, 300], [cx + s * 20, 300]]); H3.facet(K, [[cx + s * 20, 300], [cx + s * 44, 300], [cx + s * 52, 352], [cx + s * 12, 352]]); }
      H3.facet(K, [[cx - 70, 120], [cx - 30, 100], [cx + 30, 100], [cx + 70, 120], [cx + 56, 200], [cx + 30, 250], [cx - 30, 250], [cx - 56, 200]]);
      for (let i = 0; i < 10; i++) K.crack(cx - 50 + i * 11, 120 + (i % 4) * 22, 50, 1.4 + (i % 2) * 0.4, "#3ee0e8", 1.4);
      K.E(cx, 180, 20, 26, K.RG(cx, 180, 1, 26, [[0, "rgba(255,255,255,0.95)"], [0.4, "rgba(62,224,232,0.8)"], [1, "rgba(62,224,232,0)"]]));
      for (const s of [-1, 1]) { H3.facet(K, H3.rock(K, cx + s * 88, 150, 26, 36, 6, 0.4)); H3.facet(K, H3.rock(K, cx + s * 100, 220, 20, 30, 6, 0.9)); for (let f = 0; f < 4; f++) H3.shard(K, cx + s * (94 + f * 4), 246, 20, Math.PI / 2 + s * (0.3 - f * 0.2), f === 1); }
      for (const [x, y, h, a] of [[cx - 64, 110, 60, -2.4], [cx + 64, 108, 66, -0.7], [cx - 40, 96, 40, -2.0], [cx + 44, 96, 44, -1.1]]) H3.shard(K, x, y, h + b, a, true);
      const hy = 64 + b;   // the Rain Bell, where his head was
      K.P([[cx - 30, hy - 30], [cx + 30, hy - 30], [cx + 40, hy + 20], [cx + 56, hy + 40], [cx - 56, hy + 40], [cx - 40, hy + 20]], K.LG(cx - 56, 0, cx + 56, 0, [[0, "#5a3c0e"], [0.3, "#f6e07a"], [0.6, "#b08a28"], [1, "#2e1e06"]]));
      K.E(cx, hy - 30, 30, 8, "#d8b440"); K.E(cx, hy + 40, 56, 10, "#86621a"); K.E(cx, hy + 40, 44, 6, "#07060c");
      K.vol(cx, hy + 46 + b * 3, 9, 9, ["#f6e07a", "#b08a28", "#2e1e06"]);
      K.crack(cx - 10, hy - 26, 60, 1.3, "#2e1e06", 2); K.E(cx - 14, hy + 4, 10, 5, "rgba(158,240,245,0.8)"); K.E(cx + 14, hy + 4, 10, 5, "rgba(158,240,245,0.8)");
      K.S([[cx, hy - 38], [cx, hy - 60]], 5, "#86621a"); K.E(cx, hy - 62, 8, 6, "#d8b440");
    } },
    // the coat splits and the whole of him becomes a lamprey's mouth on a pillar of flood water, eels for arms
    hollis: { w: 116, h: 120, ramps: ["ink", "gold", "corpse", "brine", "bone", "blood", "glowy"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 348, cx = W / 2;
      K.P([[cx - 70, 360], [cx - 50, 200], [cx + 50, 200], [cx + 70, 360]], K.LG(cx - 70, 0, cx + 70, 0, [[0, "rgba(16,40,58,0.95)"], [0.5, "rgba(63,138,144,0.95)"], [1, "rgba(16,40,58,0.95)"]]));
      for (let i = 0; i < 8; i++) K.Q([[cx - 60 + i * 16, 360], [cx - 56 + i * 16 + Math.sin(ph * 6.28 + i) * 6, 280], [cx - 50 + i * 14, 200]], 2, "rgba(166,226,220,0.5)");
      for (const s of [-1, 1]) for (let e = 0; e < 3; e++) { const w = Math.sin(ph * 6.28 + e * 2) * 12, x0 = cx + s * 80, y0 = 150 + e * 22, x1 = cx + s * (150 + e * 8) + w, y1 = 110 + e * 70 + w; K.Q([[x0, y0], [(x0 + x1) / 2 + s * 10, y0 - 30 + e * 10], [x1, y1]], 12 - e * 2, e % 2 ? "#28626e" : "#1a4252"); K.vol(x1, y1, 8 - e, 7 - e, ["#6cb8b8", "#28626e", "#08141e"]); K.E(x1 + s * 4, y1 - 2, 1.8, 1.8, "#ffcf4a"); K.E(x1 + s * 7, y1 + 2, 3, 2, "#1e0306"); }
      K.vol(cx, 150 + b * 0.4, 96, 100, ["#cad8c8", "#7e9484", "#2e403a"]);   // the body, now all mouth
      for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; K.P([[cx + Math.cos(a) * 92, 150 + Math.sin(a) * 96], [cx + Math.cos(a + 0.22) * 92, 150 + Math.sin(a + 0.22) * 96], [cx + Math.cos(a + 0.11) * 70, 150 + Math.sin(a + 0.11) * 74]], i % 2 ? "#d8b440" : "#86621a"); }   // what is left of the gold coat, in rags round the rim
      K.E(cx, 150 + b * 0.4, 70, 72, "#1e0306");
      for (const [rr, col, n] of [[70, "#f0e8d8", 26], [54, "#d8ccb4", 22], [38, "#b8ac94", 18], [22, "#a2957c", 14]]) for (let k = 0; k < n; k++) { const a = k / n * 6.28 + rr * 0.1 + ph * (rr % 2 ? 1 : -1); K.P([[cx + Math.cos(a) * rr, 150 + Math.sin(a) * rr], [cx + Math.cos(a + 6.28 / n * 0.9) * rr, 150 + Math.sin(a + 6.28 / n * 0.9) * rr], [cx + Math.cos(a + 3.14 / n) * (rr - 13), 150 + Math.sin(a + 3.14 / n) * (rr - 13)]], col); }
      K.E(cx, 150, 12, 12, "#9a1224"); K.E(cx, 150, 6, 6, "#1e0306");
      for (const [x, y] of [[cx - 40, 54], [cx + 40, 56], [cx - 70, 100], [cx + 72, 102]]) { K.vol(x, y, 10, 9, ["#fff4b0", "#d8b440", "#6a4a10"]); K.E(x, y, 4, 4, "rgba(90,60,14,0.6)"); }   // coin eyes, all round
      for (let i = 0; i < 8; i++) H3.bubble(K, cx - 60 + i * 17, 330 - ((ph * 120 + i * 30) % 130), 3 + (i % 3));
    } },
    // unravelling into his own ledger: a book for a chest with eyes on the pages, a fan of quill-arms writing, ink everywhere
    quill: { w: 112, h: 118, ramps: ["ink", "paper", "blood", "cloth", "gold", "pale", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, cx = W / 2;
      for (let i = 0; i < 14; i++) { const a = -Math.PI * (0.05 + i / 13 * 0.9), L = 120 + (i % 3) * 20, x1 = cx + Math.cos(a) * L, y1 = 170 + Math.sin(a) * L * 0.9; K.S([[cx, 170], [x1, y1]], 2.4, "#221e38"); K.E((cx + x1) / 2, (170 + y1) / 2, L * 0.36, 5, "#ddd4b0", a); K.S([[x1, y1], [x1 + Math.cos(a) * 12, y1 + Math.sin(a) * 12]], 3, "#07060c"); K.drip(x1 + Math.cos(a) * 12, y1 + Math.sin(a) * 12, 10 + (i % 4) * 5, 1.6, i % 3 ? "#07060c" : "#9a1224"); }
      K.P([[cx - 20, 260], [cx + 20, 260], [cx + 36, 350], [cx - 36, 350]], "#07060c"); for (let i = 0; i < 6; i++) K.drip(cx - 30 + i * 12, 340, 10, 3, "#07060c");
      K.P([[cx - 80, 140], [cx, 150], [cx + 80, 140], [cx + 84, 262], [cx, 272], [cx - 84, 262]], "#523828");   // the great open ledger
      K.P([[cx - 76, 144], [cx - 4, 154], [cx - 4, 264], [cx - 78, 256]], "#f4eed6"); K.P([[cx + 4, 154], [cx + 76, 144], [cx + 78, 256], [cx + 4, 264]], "#ddd4b0");
      for (let l = 0; l < 14; l++) { K.S([[cx - 70, 156 + l * 7], [cx - 10, 162 + l * 7]], 0.8, l % 5 === 2 ? "#9a1224" : "#6a6250"); K.S([[cx + 10, 162 + l * 7], [cx + 70, 156 + l * 7]], 0.8, l % 4 === 1 ? "#9a1224" : "#6a6250"); }
      for (const [x, y, r] of [[cx - 40, 190, 9], [cx + 42, 186, 10], [cx - 22, 236, 7], [cx + 30, 234, 8]]) { K.E(x, y, r + 3, r, "#ececf2"); K.E(x, y, r * 0.5, r * 0.5, "#9a1224"); K.E(x, y, r * 0.2, r * 0.2, "#07060c"); }
      for (let i = 0; i < 12; i++) { const x = 30 + ((i * 53 + ph * 60) % 280), y = 40 + ((i * 37 + ph * 90) % 280); K.P([[x, y], [x + 12, y - 3], [x + 14, y + 10], [x + 2, y + 13]], "#ddd4b0"); K.S([[x + 3, y + 4], [x + 11, y + 2]], 0.6, "#6a6250"); }
      const hy = 96 + b; K.Q([[cx, 140], [cx + 4, 124], [cx + 6, hy + 20]], 10, "#a8a8ba");
      K.vol(cx + 6, hy, 20, 28, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      for (const x of [-8, 10]) { K.E(cx + 6 + x, hy - 2, 7, 6, "#1d1830"); K.E(cx + 6 + x, hy - 2, 3, 3, "#9a1224"); K.S([[cx + 6 + x - 6, hy - 2], [cx + 6 + x + 6, hy - 2]], 0.8, "#b08a28"); }
      K.E(cx + 6, hy + 16, 12, 6, "#07060c"); for (let i = 0; i < 4; i++) K.drip(cx - 2 + i * 5, hy + 18, 20 + i * 6 + b * 2, 2, "#07060c");
    } },
    // swollen to twice his size, drowned faces pressing out of his back, a crown of reeds lit like marsh-fire, a tongue like a rope
    gulp: { w: 124, h: 104, ramps: ["ink", "rot", "corpse", "bone", "pale", "blood", "glowy"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 372, cx = W / 2, RT = ["#a8b068", "#62703a", "#1c2012"];
      K.vol(cx, 190 + b, 176, 110 - b, RT); K.vol(cx, 238, 150, 60, ["#cad8c8", "#84904e", "#2e361c"]);
      for (let i = 0; i < 40; i++) { const x = cx - 150 + K.rng() * 300, y = 110 + K.rng() * 120; K.vol(x, y, 4 + K.rng() * 5, 4, ["#c8d08a", "#62703a", "#1c2012"]); }
      for (let i = 0; i < 7; i++) { const x = cx - 120 + i * 40, y = 116 + (i % 2) * 20; K.vol(x, y, 11, 13, ["#ececf2", "#a8a8ba", "#3a3a4a"]); K.E(x - 3, y - 2, 2, 2.4, "#07060c"); K.E(x + 3, y - 2, 2, 2.4, "#07060c"); K.E(x, y + 5, 2.4, 3.6 + Math.sin(ph * 6.28 + i), "#07060c"); for (const s of [-1, 1]) K.S([[x + s * 6, y + 6], [x + s * 14, y + 16]], 3, "#a8a8ba"); }
      for (const s of [-1, 1]) { K.vol(cx + s * 150, 280, 44, 26, RT); for (let t = 0; t < 4; t++) K.E(cx + s * (126 + t * 16), 302, 7, 5, "#2e361c"); }
      K.P([[cx - 140, 196], [cx + 140, 196], [cx + 110, 232 + b], [cx - 110, 232 + b]], "#1e0306");
      K.Q([[cx - 20, 226 + b], [cx - 120, 290], [cx - 60, 330]], 16, "#c07098"); K.E(cx - 60, 330, 14, 9, "#9c4a7a");
      for (const s of [-1, 1]) { K.vol(cx + s * 64, 100 + b, 30, 30, ["#ffe08a", "#c86a1a", "#2e1e06"]); K.E(cx + s * 64, 100 + b, 18, 22, "#07060c"); K.P([[cx + s * 64 - 3, 82 + b], [cx + s * 64 + 3, 82 + b], [cx + s * 64 + 3, 118 + b], [cx + s * 64 - 3, 118 + b]], "#ffcf4a"); }
      for (let i = 0; i < 12; i++) { const x = cx - 66 + i * 12, h = 40 + (i % 3) * 16; K.S([[x, 110], [x + Math.sin(ph * 6.28 + i) * 4, 110 - h]], 3, "#62703a"); K.E(x, 110 - h - 4, 3.4, 5, `rgba(255,207,74,${(0.6 + 0.4 * Math.sin(ph * 12 + i)).toFixed(2)})`); }
    } },
    // Maw fused to his wreck: a hull for a torso, the mast as a spine, anchors for hands, rigging and rotten sail behind
    maw: { w: 124, h: 120, ramps: ["ink", "wood", "brine", "corpse", "rust", "bone", "paper", "glowc"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 372, cx = W / 2, WD = ["#9a6c3a", "#58391e", "#1e140c"];
      K.S([[cx, 40], [cx, 250]], 9, "#3a2616"); K.S([[cx - 100, 70], [cx + 100, 70]], 6, "#3a2616");
      K.P([[cx - 96, 74], [cx + 96, 74], [cx + 110 + b * 3, 180], [cx - 104 + b * 3, 176]], K.LG(0, 74, 0, 180, [[0, "#bab08e"], [1, "#6a6250"]]));
      for (let i = 0; i < 6; i++) K.P([[cx - 80 + i * 32, 176], [cx - 70 + i * 32, 210 + (i % 2) * 20], [cx - 60 + i * 32, 178]], "#6a6250");
      for (const [x, y, r] of [[cx - 50, 120, 14], [cx + 30, 140, 20], [cx + 70, 104, 10]]) K.E(x, y, r, r * 0.8, "#1d1830");
      for (let i = 0; i < 8; i++) K.S([[cx, 50], [cx - 120 + i * 34, 300]], 0.8, "rgba(110,78,56,0.7)");
      K.P([[cx - 110, 200], [cx + 110, 200], [cx + 80, 300], [cx, 320], [cx - 80, 300]], K.LG(cx - 110, 0, cx + 110, 0, [[0, WD[2]], [0.4, WD[1]], [0.6, WD[0]], [1, WD[2]]]));   // the hull
      for (let i = 0; i < 5; i++) K.Q([[cx - 104 + i * 6, 216 + i * 18], [cx, 226 + i * 20], [cx + 104 - i * 6, 216 + i * 18]], 2, WD[2]);
      for (const x of [-60, 0, 60]) { K.E(cx + x, 244, 12, 10, "#07060c"); K.E(cx + x, 244, 5, 4, `rgba(158,240,245,${(0.6 + 0.4 * Math.sin(ph * 6.28 + x)).toFixed(2)})`); }
      for (let i = 0; i < 20; i++) { const x = cx - 100 + K.rng() * 200, y = 206 + K.rng() * 100; K.vol(x, y, 3, 2.6, ["#e8e0cc", "#a2957c", "#4a4238"]); }
      for (const s of [-1, 1]) { H3.limb(K, cx + s * 100, 210, cx + s * 150, 250 + b, 14, 11, ["#7e9484", "#44584e", "#1e2a26"]); K.S([[cx + s * 150, 250 + b], [cx + s * 150, 300]], 4, "#76381a"); K.Q([[cx + s * 126, 290], [cx + s * 150, 320], [cx + s * 174, 290]], 6, "#76381a"); K.P([[cx + s * 150 - 6, 318], [cx + s * 150 + 6, 318], [cx + s * 150, 330]], "#9a5226"); }
      const hy = 170 + b;   // his drowned face at the prow
      K.vol(cx, hy, 26, 30, ["#a4b8a6", "#5e7466", "#1e2a26"]); for (let i = 0; i < 10; i++) K.Q([[cx - 20 + i * 4, hy + 14], [cx - 22 + i * 4.4, hy + 30], [cx - 18 + i * 4, hy + 46]], 2, "#2e403a");
      for (const s of [-1, 1]) eyeGlow(K, cx + s * 10, hy - 4, 3, "#3ee0e8");
      K.P([[cx - 30, hy - 26], [cx + 30, hy - 26], [cx + 24, hy - 50], [cx - 24, hy - 50]], "#1d1830"); K.S([[cx - 34, hy - 26], [cx + 34, hy - 26]], 4, "#1d1830");
    } },
    // the boulders fall away: a pillar of the dead choir's faces singing, stones of salt circling it, light pouring from the mouths
    colossus: { w: 112, h: 120, ramps: ["ink", "salt", "pale", "glowc", "night", "blood"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, cx = W / 2;
      K.E(cx, 340, 90, 12, "rgba(7,6,12,0.4)");
      K.P([[cx - 50, 340], [cx - 40, 40], [cx + 40, 40], [cx + 50, 340]], K.LG(cx - 50, 0, cx + 50, 0, [[0, "#565a74"], [0.5, "#cacee0"], [1, "#565a74"]]));
      for (let r = 0; r < 7; r++) for (let q = 0; q < 2; q++) { const x = cx - 18 + q * 36 + (r % 2 ? 6 : -6), y = 70 + r * 40; K.vol(x, y, 15, 18, ["#ececf2", "#a8a8ba", "#5e5e70"]); K.E(x - 5, y - 4, 3, 3.6, "#07060c"); K.E(x + 5, y - 4, 3, 3.6, "#07060c");
        const m = 5 + Math.sin(ph * 6.28 * 2 + r + q) * 2; K.E(x, y + 8, 4, m, "#07060c"); K.E(x, y + 8 + m, 10, 20, K.RG(x, y + 8, 1, 22, [[0, "rgba(158,240,245,0.6)"], [1, "rgba(62,224,232,0)"]])); }
      for (let i = 0; i < 8; i++) { const a = ph * 6.28 + i * 0.785, x = cx + Math.cos(a) * 130, y = 180 + Math.sin(a) * 40, front = Math.sin(a) > 0; H3.facet(K, H3.rock(K, x, y, front ? 22 : 15, front ? 20 : 14, 6, i)); }
      for (let i = 0; i < 7; i++) H3.shard(K, cx - 36 + i * 12, 44, 20 + (3 - Math.abs(i - 3)) * 10, -Math.PI / 2 + (i - 3) * 0.2, true);
      K.E(cx, 30, 80, 20, K.RG(cx, 30, 2, 80, [[0, "rgba(158,240,245,0.4)"], [1, "rgba(62,224,232,0)"]]));
    } },
    // Vela gone into the storm: a whirl of cloud with her face as its eye, lightning for arms, hands made of light
    vela: { w: 124, h: 118, ramps: ["ink", "storm", "pale", "glowc", "salt", "night", "blood"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 372, cx = W / 2, cy = 170;
      for (let r = 0; r < 5; r++) for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + ph * 6.28 * (r % 2 ? 0.5 : -0.4) + r, rr = 60 + r * 26; K.vol(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.55, 30 - r * 2, 18 - r, r % 2 ? ["#7a9ad8", "#2a3a66", "#141222"] : ["#4a64a0", "#1a2440", "#07060c"]); }
      K.E(cx, cy, 70, 44, "#07060c");
      for (let k = 0; k < 6; k++) { let x = cx + (k < 3 ? -60 : 60), y = cy; const pts = [[x, y]]; for (let j = 0; j < 7; j++) { x += (k < 3 ? -1 : 1) * (14 + K.rng() * 10); y += (K.rng() - 0.6) * 30 - (k % 3) * 8; pts.push([x, y]); } K.S(pts, 5, "#7a9ad8"); K.S(pts, 2, "#ffffff");
        if (k % 3 === 0) { K.E(x, y, 14, 14, K.RG(x, y, 1, 16, [[0, "rgba(255,255,255,0.95)"], [1, "rgba(122,154,216,0)"]])); for (let f = 0; f < 4; f++) K.S([[x, y], [x + (k < 3 ? -1 : 1) * (8 + f * 3), y - 10 + f * 6]], 2, "#ffffff"); } }
      K.vol(cx, cy + b, 28, 34, ["#ececf2", "#a8a8ba", "#5e5e70"]);
      K.P([[cx - 34, cy - 20 + b], [cx - 30, cy - 44 + b], [cx, cy - 52 + b], [cx + 30, cy - 44 + b], [cx + 34, cy - 20 + b], [cx + 24, cy - 32 + b], [cx - 24, cy - 32 + b]], "#ececf2");
      for (const s of [-1, 1]) { K.E(cx + s * 11, cy - 4 + b, 7, 5, "#3a3a4a"); eyeGlow(K, cx + s * 11, cy - 4 + b, 3.4, "#c8d8ff"); }
      K.E(cx, cy + 18 + b, 9, 12, "#1e0306"); K.E(cx, cy + 22 + b, 4, 5, "#6a0c18");
      for (let i = 0; i < 30; i++) { const x = K.rng() * W, y = (K.rng() * 350 + ph * 350) % 350; K.S([[x, y], [x - 5, y + 12]], 1, "rgba(200,216,255,0.5)"); }
    } },
    // Aurel rises: a towering figure of sea water with the drowned suspended inside, the crown of hands grown into a halo of arms
    king: { w: 128, h: 120, ramps: ["ink", "brine", "corpse", "pale", "glowc", "gold", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 384, cx = W / 2;
      for (let i = 0; i < 22; i++) { const a = -Math.PI * (0.02 + i / 21 * 0.96), x0 = cx + Math.cos(a) * 70, y0 = 110 + Math.sin(a) * 60, x1 = cx + Math.cos(a) * (150 + (i % 3) * 16), y1 = 110 + Math.sin(a) * (100 + (i % 2) * 14);
        K.S([[x0, y0], [x1, y1]], 8, "#7e9484"); K.S([[x0, y0], [x1, y1]], 3, "#a4b8a6"); for (let f = 0; f < 5; f++) K.S([[x1, y1], [x1 + Math.cos(a + (f - 2) * 0.25) * 14, y1 + Math.sin(a + (f - 2) * 0.25) * 14]], 2.2, "#cad8c8"); }
      K.P([[cx - 110, 360], [cx - 80, 180], [cx - 50, 110], [cx + 50, 110], [cx + 80, 180], [cx + 110, 360]], K.LG(cx - 110, 0, cx + 110, 0, [[0, "rgba(16,40,58,0.92)"], [0.45, "rgba(63,138,144,0.85)"], [0.55, "rgba(108,184,184,0.85)"], [1, "rgba(16,40,58,0.92)"]]));
      for (let i = 0; i < 12; i++) { const x = cx - 80 + (i * 37) % 160, y = 180 + (i * 53) % 160, a = (i % 5) - 2; K.S([[x - 10, y - a * 4], [x + 10, y + a * 4]], 7, "rgba(46,64,58,0.8)"); K.vol(x + 12, y + a * 4, 5, 6, ["rgba(164,184,166,0.9)", "rgba(94,116,102,0.9)", "rgba(30,42,38,0.9)"]); }
      for (let i = 0; i < 10; i++) K.Q([[cx - 90 + i * 20, 360], [cx - 84 + i * 18 + Math.sin(ph * 6.28 + i) * 8, 250], [cx - 60 + i * 12, 130]], 1.6, "rgba(166,226,220,0.45)");
      for (const s of [-1, 1]) { K.Q([[cx + s * 60, 140], [cx + s * 130, 170 + b], [cx + s * 150, 240 + b]], 22, "rgba(40,98,110,0.9)"); K.vol(cx + s * 150, 246 + b, 16, 16, ["#cad8c8", "#7e9484", "#2e403a"]); }
      const hy = 104 + b; K.vol(cx, hy, 26, 32, ["#eef2f6", "#b4c0d8", "#6a6a9a"]);
      for (let i = 0; i < 14; i++) K.Q([[cx - 20 + i * 3, hy - 14], [cx - 24 + i * 4 + Math.sin(ph * 6.28 + i) * 8, hy - 50], [cx - 30 + i * 5, hy - 80]], 2, "rgba(26,66,82,0.9)");
      for (const s of [-1, 1]) eyeGlow(K, cx + s * 10, hy + 2, 3.4, "#9ef0f5");
      K.S([[cx - 7, hy + 20], [cx + 7, hy + 20]], 2, "#6a6a9a"); for (let i = 0; i < 9; i++) H3.bubble(K, cx - 90 + i * 22, 350 - ((ph * 200 + i * 40) % 250), 3 + (i % 3));
    } },
    // the mask falls: Corvin becomes an idol of gold coin, six arms holding scales, quills and keys, a sun of coins behind
    corvin: { w: 120, h: 118, ramps: ["ink", "gold", "blood", "bone", "glowy", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.5, W = 360, cx = W / 2, GD = ["#fff4b0", "#d8b440", "#5a3c0e"];
      for (let r = 0; r < 2; r++) for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28 + ph * (r ? -0.8 : 0.6), R = 120 + r * 30; H3.coin(K, cx + Math.cos(a) * R, 140 + Math.sin(a) * R * 0.8, 7 - r, 0.9); }
      K.E(cx, 140, 110, 90, K.RG(cx, 140, 10, 120, [[0, "rgba(255,207,74,0.4)"], [1, "rgba(255,207,74,0)"]]));
      K.P([[cx - 70, 350], [cx - 50, 220], [cx + 50, 220], [cx + 70, 350]], K.LG(cx - 70, 0, cx + 70, 0, [[0, GD[2]], [0.5, GD[1]], [1, GD[2]]])); for (let i = 0; i < 40; i++) H3.coin(K, cx - 60 + K.rng() * 120, 240 + K.rng() * 110, 5);
      K.vol(cx, 170, 56, 66, GD); for (let i = 0; i < 26; i++) { const a = K.rng() * 6.28, r = K.rng() * 50; H3.coin(K, cx + Math.cos(a) * r, 170 + Math.sin(a) * r * 1.1, 4.5, 0.9); }
      for (const [s, y, item] of [[-1, 120, "scale"], [1, 116, "quill"], [-1, 170, "key"], [1, 168, "ledger"], [-1, 216, "coin"], [1, 214, "coin"]]) {
        const ex = cx + s * 96, ey = y - 18 + b, hx = cx + s * 132, hy = y - 40 + b; H3.limb(K, cx + s * 44, y, ex, ey, 11, 9, GD); H3.limb(K, ex, ey, hx, hy, 9, 7, GD, false);
        if (item === "scale") { K.S([[hx, hy], [hx, hy - 20]], 2, "#86621a"); K.S([[hx - 24, hy - 20], [hx + 24, hy - 20]], 2.4, "#d8b440"); for (const x of [-24, 24]) K.E(hx + x, hy - 6, 10, 3, "#b08a28"); }
        if (item === "quill") { K.S([[hx, hy], [hx + 16, hy - 40]], 2, "#6a6250"); K.E(hx + 10, hy - 26, 18, 4, "#f4eed6", -1.2); }
        if (item === "key") { K.S([[hx, hy], [hx - 20, hy - 20]], 3, "#b08a28"); K.E(hx - 24, hy - 24, 6, 6, "#d8b440"); }
        if (item === "ledger") K.P([[hx - 14, hy - 10], [hx + 14, hy - 14], [hx + 16, hy + 10], [hx - 12, hy + 14]], "#6a0c18");
        if (item === "coin") H3.coin(K, hx, hy, 8, 1);
      }
      const hy = 84 + b; K.vol(cx, hy, 30, 34, GD);
      K.P([[cx - 30, hy - 26], [cx + 30, hy - 26], [cx + 18, hy - 80], [cx, hy - 100], [cx - 18, hy - 80]], K.LG(cx - 30, 0, cx + 30, 0, [[0, "#86621a"], [0.4, "#fff4b0"], [1, "#5a3c0e"]]));
      for (let i = 0; i < 3; i++) { const ex = cx - 16 + i * 16; K.E(ex, hy - 2 + (i === 1 ? -10 : 0), 5, 4, "#07060c"); eyeGlow(K, ex, hy - 2 + (i === 1 ? -10 : 0), 2, "#ffcf4a"); }
      K.P([[cx - 12, hy + 14], [cx + 12, hy + 14], [cx + 6, hy + 22], [cx - 6, hy + 22]], "#07060c"); H3.coin(K, cx, hy + 18, 3.4, 1);
    } },
    // set alight: the tree burns red and gold, its branches have become grasping hands, the debtors in its roots are screaming
    ledgertree: { w: 124, h: 120, ramps: ["ink", "wood", "blood", "glowy", "paper", "pale", "glowr"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 372, cx = W / 2;
      for (let i = 0; i < 9; i++) { const x0 = cx - 40 + i * 10, x1 = cx - 170 + i * 42; K.Q([[x0, 290], [(x0 + x1) / 2, 316], [x1, 356]], 12, "#1e140c"); K.Q([[x0, 290], [(x0 + x1) / 2, 316], [x1, 356]], 4, "#c86a1a"); }
      for (const [x, y] of [[cx - 130, 330], [cx + 120, 334], [cx - 40, 344], [cx + 50, 340]]) { K.vol(x, y - 12, 8, 9, ["#ccccd8", "#848498", "#3a3a4a"]); K.E(x, y - 8, 3, 5, "#07060c"); K.S([[x - 8, y - 20], [x - 14, y - 34]], 2, "#848498"); K.S([[x + 8, y - 20], [x + 14, y - 34]], 2, "#848498"); }
      for (let i = 0; i < 12; i++) { const y = 290 - i * 18, w = 50 - i * 1.4, x = cx + Math.sin(i * 0.9) * 8; K.P([[x - w, y], [x + w, y - 4], [x + w + 2, y - 18], [x - w + 2, y - 16]], i % 2 ? "#3a2616" : "#1e140c"); for (let c = 0; c < 3; c++) K.S([[x - w + 6 + c * 30, y - 2], [x - w + 12 + c * 30, y - 14]], 1.4, "#ff9a3d"); }
      K.E(cx - 16, 170, 10, 8, "#07060c"); K.E(cx + 16, 170, 10, 8, "#07060c"); eyeGlow(K, cx - 16, 170, 4, "#ff2d2d"); eyeGlow(K, cx + 16, 170, 4, "#ff2d2d");
      K.P([[cx - 28, 196], [cx + 28, 196], [cx + 20, 222 + b], [cx - 20, 222 + b]], "#1e0306"); K.E(cx, 212, 16, 8, K.RG(cx, 212, 1, 18, [[0, "rgba(255,240,160,0.9)"], [1, "rgba(255,154,61,0)"]]));
      for (const [x1, y1, a] of [[cx - 170, 70, -2.6], [cx + 170, 64, -0.5], [cx - 100, 16, -2.1], [cx + 106, 14, -1.0], [cx - 30, 4, -1.8], [cx + 40, 2, -1.3]]) {
        K.Q([[cx, 100], [(cx + x1) / 2, Math.min(100, y1) - 20], [x1, y1]], 12, "#1e140c"); K.Q([[cx, 100], [(cx + x1) / 2, Math.min(100, y1) - 20], [x1, y1]], 3, "#c86a1a");
        K.vol(x1, y1, 9, 8, ["#9a6c3a", "#58391e", "#1e140c"]); for (let f = 0; f < 5; f++) K.S([[x1, y1], [x1 + Math.cos(a + (f - 2) * 0.35) * 18, y1 + Math.sin(a + (f - 2) * 0.35) * 18]], 3, "#58391e");
      }
      for (let i = 0; i < 26; i++) { const s = (ph * 1.5 + i / 26) % 1, x = cx - 150 + (i * 47) % 300 + Math.sin(i + ph * 6.28) * 8, y = 300 - s * 300; K.E(x, y, 6 - s * 4, 9 - s * 5, s < 0.3 ? "#fff0a0" : s < 0.6 ? "#ff9a3d" : "#c8182e"); }
      for (let i = 0; i < 8; i++) { const x = cx - 120 + i * 34, y = 80 + (i % 3) * 16, L = 20 + (i % 4) * 8; K.S([[x, y], [x, y + L]], 1, "#76381a"); K.P([[x - 6, y + L], [x + 6, y + L], [x + 6, y + L + 14], [x - 6, y + L + 14]], i % 2 ? "#ddd4b0" : "#ff9a3d"); }
    } },
    // the Tollkeeper opens up: a clockwork engine of brass gears and chains, a coin slot for a mouth that spits coin like shot
    tollkeeper: { w: 104, h: 120, ramps: ["ink", "gold", "rust", "bone", "night", "glowy", "blood"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 312, cx = W / 2, BR = ["#f6e07a", "#b08a28", "#2e1e06"];
      const gear = (x, y, r, rot) => { for (let i = 0; i < 12; i++) { const a = rot + i / 12 * 6.28; K.P([[x + Math.cos(a - 0.12) * r, y + Math.sin(a - 0.12) * r], [x + Math.cos(a - 0.08) * (r + 7), y + Math.sin(a - 0.08) * (r + 7)], [x + Math.cos(a + 0.08) * (r + 7), y + Math.sin(a + 0.08) * (r + 7)], [x + Math.cos(a + 0.12) * r, y + Math.sin(a + 0.12) * r]], "#86621a"); } K.vol(x, y, r, r, BR); K.E(x, y, r * 0.35, r * 0.35, "#2e1e06"); for (let i = 0; i < 4; i++) { const a = rot + i * 1.57; K.S([[x, y], [x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8]], 3, "#5a3c0e"); } };
      for (const s of [-1, 1]) { K.S([[cx + s * 20, 250], [cx + s * 34, 350]], 10, "#5a3c0e"); gear(cx + s * 30, 300, 12, ph * 6.28 * s); K.P([[cx + s * 14, 340], [cx + s * 54, 340], [cx + s * 54, 352], [cx + s * 14, 352]], "#2e1e06"); }
      K.P([[cx - 70, 110], [cx + 70, 110], [cx + 60, 250], [cx - 60, 250]], K.LG(cx - 70, 0, cx + 70, 0, [[0, "#2e1e06"], [0.5, "#86621a"], [1, "#2e1e06"]]));
      gear(cx - 26, 150, 24, ph * 6.28); gear(cx + 30, 170, 18, -ph * 6.28 * 1.3); gear(cx - 10, 212, 16, ph * 6.28 * 1.6);
      for (let i = 0; i < 8; i++) K.E(cx - 56 + i * 16, 114, 3, 3, "#f6e07a");
      for (const s of [-1, 1]) { K.S([[cx + s * 66, 120], [cx + s * 110, 160 + b]], 10, "#86621a"); gear(cx + s * 110, 160 + b, 10, ph * 12); K.S([[cx + s * 110, 160 + b], [cx + s * 124, 230]], 8, "#86621a"); for (let i = 0; i < 6; i++) K.E(cx + s * 124, 236 + i * 10, 4, 3.4, i % 2 ? "#76381a" : "#9a5226"); }
      const hy = 70 + b; K.P([[cx - 36, hy - 34], [cx + 36, hy - 34], [cx + 30, hy + 34], [cx - 30, hy + 34]], K.LG(cx - 36, 0, cx + 36, 0, [[0, "#86621a"], [0.5, "#f6e07a"], [1, "#5a3c0e"]]));
      for (const s of [-1, 1]) { K.P([[cx + s * 4, hy - 16], [cx + s * 24, hy - 20], [cx + s * 22, hy - 4], [cx + s * 6, hy - 6]], "#07060c"); eyeGlow(K, cx + s * 14, hy - 11, 3.4, "#ff2d2d"); }
      K.R(cx - 24, hy + 8, 48, 18, "#07060c"); for (let i = 0; i < 8; i++) { fang(K, cx - 21 + i * 6, hy + 8, 5, 7, "#d8b440"); fang(K, cx - 21 + i * 6, hy + 26, 5, 7, "#b08a28", -1); }
      for (let i = 0; i < 10; i++) { const s = (ph * 2 + i / 10) % 1; H3.coin(K, cx + (i - 5) * 10 * s, hy + 20 + s * 150, 4.4, 0.8); }
      K.R(cx - 40, hy - 38, 80, 6, "#86621a"); for (let i = 0; i < 7; i++) K.P([[cx - 38 + i * 12, hy - 36], [cx - 32 + i * 12, hy - 62 - (i % 2) * 12], [cx - 26 + i * 12, hy - 36]], i % 2 ? "#d8b440" : "#86621a");
    } },
    // the Old Mouth opens all the way: a jaw like a cave, rows of teeth down its throat, a crown of lures, the light inside
    oldmouth: { w: 128, h: 104, ramps: ["ink", "brine", "corpse", "bone", "blood", "glowc", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 384, cx = W / 2, cy = 170;
      K.vol(cx, cy, 186, 140, ["#3f8a90", "#10283a", "#08141e"]);
      for (let i = 0; i < 30; i++) { const a = K.rng() * 6.28, r = 150 + K.rng() * 30; K.vol(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.75, 5, 4, ["#6cb8b8", "#1a4252", "#08141e"]); }
      K.E(cx, cy + 10, 150, 110 + b, "#1e0306");
      K.E(cx, cy + 20, 60, 44, K.RG(cx, cy + 20, 2, 70, [[0, "rgba(158,240,245,0.8)"], [0.5, "rgba(62,224,232,0.25)"], [1, "rgba(62,224,232,0)"]]));
      for (const [rr, h, col] of [[1, 34, "#f0e8d8"], [0.72, 26, "#d8ccb4"], [0.48, 18, "#b8ac94"]]) for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28, x = cx + Math.cos(a) * 146 * rr, y = cy + 10 + Math.sin(a) * (106 + b) * rr; const ang = Math.atan2(cy + 10 - y, cx - x); K.P([[x + Math.cos(ang + 1.57) * 6, y + Math.sin(ang + 1.57) * 6], [x - Math.cos(ang + 1.57) * 6, y - Math.sin(ang + 1.57) * 6], [x + Math.cos(ang) * h, y + Math.sin(ang) * h]], col); }
      for (let i = 0; i < 5; i++) { const x0 = cx - 100 + i * 50, sw = Math.sin(ph * 6.28 + i) * 14, x1 = x0 + sw, y1 = 10 + (i % 2) * 18; K.Q([[x0, 50], [x0 + sw * 0.5, 30], [x1, y1]], 3, "#28626e"); K.E(x1, y1, 10, 10, K.RG(x1, y1, 1, 12, [[0, "rgba(255,255,255,0.95)"], [0.5, "rgba(158,240,245,0.8)"], [1, "rgba(62,224,232,0)"]])); }
      for (const s of [-1, 1]) for (let e = 0; e < 3; e++) eyeGlow(K, cx + s * (70 + e * 26), 58 + e * 10, 4 - e * 0.6, "#3ee0e8");
    } },
    // the Wyrm grows wings of crystal and its head splits in three, each jaw lit from the throat
    wyrm: { w: 128, h: 108, ramps: ["ink", "salt", "pale", "bone", "blood", "glowc", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2), W = 384, cx = W / 2, flap = Math.sin(ph * Math.PI * 2) * 0.25;
      for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + s * (0.5 + i * 0.22 + flap), L = 150 - i * 12, x0 = cx + s * 30, y0 = 170, x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L * 0.8;
        H3.facet(K, [[x0, y0], [x1, y1], [x0 + Math.cos(a + s * 0.2) * L * 0.6, y0 + Math.sin(a + s * 0.2) * L * 0.5]], H3.SALT, 0.05); K.S([[x0, y0], [x1, y1]], 1.4, "#9ef0f5"); }
      const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([cx + 120 - t * 120 + Math.sin(t * 8 + ph * 6.28) * 14, 300 - t * 140]); }
      for (let i = 0; i < pts.length - 1; i++) { const [x, y] = pts[i], r = 26 - i * 0.4; H3.facet(K, H3.rock(K, x, y, r * 1.1, r, 6, i), H3.SALT, i % 2 ? -0.05 : 0.05); if (i % 2 === 0) H3.shard(K, x, y - r * 0.8, 16 + (i % 4) * 4, -1.57 + 0.3, false); }
      const [nx, ny] = pts[pts.length - 1];
      for (const [dx, dy, a] of [[-60, -40, -0.5], [0, -70, 0], [60, -40, 0.5]]) {   // three heads
        const hx = nx + dx, hy = ny + dy + b * 3; K.Q([[nx, ny], [nx + dx * 0.5, ny + dy * 0.3], [hx, hy + 20]], 16, "#a6aac2");
        H3.facet(K, [[hx - 26, hy], [hx - 14, hy - 18], [hx + 14, hy - 18], [hx + 26, hy], [hx + 18, hy + 14], [hx - 18, hy + 14]], H3.SALT, 0.08);
        K.P([[hx - 22, hy + 10], [hx + 22, hy + 10], [hx + 14, hy + 30 + b * 4], [hx - 14, hy + 30 + b * 4]], "#1e0306"); for (let i = 0; i < 6; i++) fang(K, hx - 18 + i * 7, hy + 10, 5, 8, "#f0f4ff");
        K.E(hx, hy + 20, 12, 7, K.RG(hx, hy + 20, 1, 14, [[0, "rgba(158,240,245,0.9)"], [1, "rgba(62,224,232,0)"]]));
        for (const s of [-1, 1]) eyeGlow(K, hx + s * 9, hy - 6, 2.4, "#3ee0e8"); H3.shard(K, hx - 10, hy - 16, 20, -2.0 + a * 0.3, true); H3.shard(K, hx + 10, hy - 16, 20, -1.1 + a * 0.3, true);
      }
    } },
  };
  // the second form is used once a boss has changed (half a second into the change, inside the flash)
  const P2A = {};
  function p2ArtFor(u) { return u && u.phase2 && P2ART[u.id] && time - u.phase2 > 0.5 ? P2A[u.id] || (P2A[u.id] = { ...P2ART[u.id], key: "p2:" + u.id }) : null; }
  // the change on screen: flicker, shards, the title
  const _enterPhase2V = enterPhase2;
  enterPhase2 = function (f) {
    _enterPhase2V(f);
    if (!P2NAME[f.id]) return;
    f.hurt = 0.9;   // the white flicker while it changes
    setTimeout(() => { if (!battle || f.dead) return; const parts = P2NAME[f.id].split(", "); $("splashName").textContent = parts[0]; $("splashSub").textContent = parts[1] ? parts[1] + " · second phase" : "Second phase"; const sp = $("splash"); sp.hidden = true; void sp.offsetWidth; sp.hidden = false; clearTimeout(sp._t); sp._t = setTimeout(() => { sp.hidden = true; }, 2200); }, 450);
    RIG_FX.push({ kind: "sk:transform", from: unitPos(f), to: [{ ...unitPos(f), top: unitTop(f) }], t0: time, dur: 1.1, col: PHASE2[f.id] ? PHASE2[f.id][1] : "#ffffff" });
  };
  SK_DRAW.transform = function (f, a, k, P) {
    const t = f.to[0], X = P(t).x, Y = P(t).y;
    for (let j = 0; j < 28; j++) { const an = j / 28 * 6.28 + j, d = easeO(a) * (40 + (j % 5) * 22) * k; ctx.globalAlpha = 1 - a; ctx.fillStyle = j % 2 ? f.col : "#ffffff"; ctx.save(); ctx.translate(X + Math.cos(an) * d, Y + Math.sin(an) * d * 0.8); ctx.rotate(an + a * 8); ctx.fillRect(-3 * k, -1.2 * k, 6 * k, 2.4 * k); ctx.restore(); }
    if (a > 0.35 && a < 0.6) { ctx.globalAlpha = 0.7 * (1 - Math.abs(a - 0.47) / 0.13); ctx.fillStyle = "#ffffff"; ctx.fillRect(VP.ox, VP.oy, VIEW_W * k, 192 * k); }
    ctx.globalAlpha = (1 - a) * 0.8; ctx.strokeStyle = f.col; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(X, Y, easeO(a) * 120 * k, 0, 6.28); ctx.stroke();
  };

  // long card texts (the endings run to many paragraphs) scroll inside the card in a compact style
  { const t = $("cardText"); new MutationObserver(() => { const long = t.textContent.length > 600; if (t.classList.contains("long") !== long) t.classList.toggle("long", long); t.scrollTop = 0; }).observe(t, { childList: true, characterData: true, subtree: true }); }
