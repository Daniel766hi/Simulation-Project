  // ================================================================== BOSS ART: FINE PIXELS
  // Bosses are painted at three times the battle picture's density with real shapes, gradients and texture, then
  // reduced to a limited palette with ordered dithering, so they read as pixel art, only finer. Frames are cached
  // (six per idle loop, plus a white hit-flash of each). In battle they are drawn straight onto the screen above
  // the picture; anywhere else (cutscenes, intros) the same art is drawn into the picture at its own resolution.
  const ART_D = 3;
  const RAMP = {
    ink: ["#07060c", "#120f1c", "#1d1830"],
    night: ["#241d40", "#342a5c", "#4a3f7a", "#6a5f9a"],
    flesh: ["#2a1418", "#4a2226", "#6e3a34", "#8e5444", "#ad7058", "#c98f72", "#e2b394", "#f2d2b8"],
    pale: ["#3a3a4a", "#5e5e70", "#848498", "#a8a8ba", "#ccccd8", "#ececf2"],
    corpse: ["#1e2a26", "#2e403a", "#44584e", "#5e7466", "#7e9484", "#a4b8a6", "#cad8c8"],
    blood: ["#1e0306", "#40070e", "#6a0c18", "#9a1224", "#c8182e", "#ee3a46"],
    bone: ["#4a4238", "#766a58", "#a2957c", "#c8bca2", "#e8e0cc"],
    rot: ["#1c2012", "#2e361c", "#465228", "#62703a", "#84904e", "#a8b068"],
    brine: ["#08141e", "#10283a", "#1a4252", "#28626e", "#3f8a90", "#6cb8b8", "#a6e2dc"],
    salt: ["#565a74", "#7e829c", "#a6aac2", "#cacee0", "#e8ecf8", "#ffffff"],
    gold: ["#2e1e06", "#5a3c0e", "#86621a", "#b08a28", "#d8b440", "#f6e07a"],
    rust: ["#2a1208", "#4e2410", "#76381a", "#9a5226", "#bc7038"],
    leather: ["#1e140e", "#36241a", "#523828", "#6e4e38", "#8e6a4c"],
    cloth: ["#141222", "#221e38", "#332c52", "#463e6e"],
    leech: ["#1e0a18", "#3a1230", "#5a1e48", "#7a3060", "#9c4a7a", "#c07098", "#e0a0bc"],
    glowc: ["#1fb8c2", "#3ee0e8", "#9ef0f5"],
    glowy: ["#c86a1a", "#ff9a3d", "#ffcf4a", "#fff0a0"],
    glowr: ["#ff2d2d", "#ff7a6a"],
    storm: ["#1a2440", "#2a3a66", "#4a64a0", "#7a9ad8", "#c8d8ff"],
    wood: ["#1e140c", "#3a2616", "#58391e", "#78502a", "#9a6c3a"],
    paper: ["#6a6250", "#948a70", "#bab08e", "#ddd4b0", "#f4eed6"],
  };
  const hexRGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.5);
  function quantize(c, w, h, ramps, spread = 26) {
    const pal = [...new Set(ramps.flatMap(r => RAMP[r]))].map(hexRGB), img = c.getImageData(0, 0, w, h), d = img.data;
    const cache = new Map();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
      const b = BAYER[(y & 3) * 4 + (x & 3)] * spread, r = d[i] + b, g2 = d[i + 1] + b, bl = d[i + 2] + b;
      const key = (r >> 3) << 10 | (g2 >> 3) << 5 | (bl >> 3); let best = cache.get(key);
      if (best === undefined) { let bd = 1e9; for (let k = 0; k < pal.length; k++) { const p = pal[k], dd = (p[0] - r) ** 2 * 0.9 + (p[1] - g2) ** 2 * 1.2 + (p[2] - bl) ** 2 * 0.8; if (dd < bd) { bd = dd; best = k; } } cache.set(key, best); }
      const p = pal[best]; d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255;
    }
    // a one-pixel dark outline around the silhouette, like hand-made pixel art
    const a0 = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) a0[i] = d[i * 4 + 3] ? 1 : 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (a0[i]) continue;
      if ((x > 0 && a0[i - 1]) || (x < w - 1 && a0[i + 1]) || (y > 0 && a0[i - w]) || (y < h - 1 && a0[i + w])) { const j = i * 4; d[j] = 7; d[j + 1] = 6; d[j + 2] = 12; d[j + 3] = 255; } }
    c.putImageData(img, 0, 0);
  }
  // a small painting kit in art pixels
  function artKit(c, seed) {
    let s = seed >>> 0; const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const fill = f => { c.fillStyle = f; };
    const K = {
      rng,
      E(x, y, rx, ry, f, rot = 0) { fill(f); c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); c.fill(); },
      P(pts, f) { fill(f); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); },
      S(pts, w, col, cap = "round") { c.strokeStyle = col; c.lineWidth = w; c.lineCap = cap; c.lineJoin = "round"; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); },
      Q(pts, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.beginPath(); c.moveTo(...pts[0]); for (let i = 1; i < pts.length - 1; i += 2) c.quadraticCurveTo(...pts[i], ...pts[i + 1]); c.stroke(); },
      R(x, y, w, h, f) { fill(f); c.fillRect(x, y, w, h); },
      RG(x, y, r0, r1, stops) { const g2 = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, col]) => g2.addColorStop(o, col)); return g2; },
      LG(x0, y0, x1, y1, stops) { const g2 = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g2.addColorStop(o, col)); return g2; },
      // a lit volume: highlight up-left, core, shadow down-right
      vol(x, y, rx, ry, [hi, mid, lo], rot = 0) { K.E(x, y, rx, ry, K.RG(x - rx * 0.35, y - ry * 0.4, Math.min(rx, ry) * 0.1, Math.max(rx, ry) * 1.25, [[0, hi], [0.45, mid], [1, lo]]), rot); },
      dots(n, x0, y0, x1, y1, col, r = 1) { for (let i = 0; i < n; i++) K.E(x0 + rng() * (x1 - x0), y0 + rng() * (y1 - y0), r, r, col); },
      teeth(x, y, n, w, h, col, dn = 1, sp = 0) { for (let i = 0; i < n; i++) { const tx = x + i * (w + sp); K.P([[tx, y], [tx + w, y], [tx + w / 2, y + h * dn * (0.7 + rng() * 0.5)]], col); } },
      drip(x, y, len, w, col) { K.S([[x, y], [x, y + len]], w, col); K.E(x, y + len, w * 0.8, w, col); },
      crack(x, y, len, ang, col, w = 1) { const pts = [[x, y]]; let a = ang, px = x, py = y; for (let i = 0; i < 5; i++) { a += (rng() - 0.5) * 1.1; px += Math.cos(a) * len / 5; py += Math.sin(a) * len / 5; pts.push([px, py]); } K.S(pts, w, col); },
      stitch(x0, y0, x1, y1, n, col, w = 1.4) { K.S([[x0, y0], [x1, y1]], w, col); const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 4, ny = dx / L * 4; for (let i = 0; i <= n; i++) { const px = x0 + dx * i / n, py = y0 + dy * i / n; K.S([[px - nx, py - ny], [px + nx, py + ny]], w, col); } },
      eye(x, y, r, glow, pupil = "#07060c") { K.E(x, y, r * 1.5, r * 1.5, "rgba(0,0,0,0.55)"); K.E(x, y, r, r, glow); K.E(x - r * 0.2, y - r * 0.2, r * 0.35, r * 0.35, "#ffffff"); if (pupil) K.E(x + r * 0.15, y + r * 0.1, r * 0.3, r * 0.55, pupil); },
      rim(pts, col, w = 1.5) { K.S([...pts, pts[0]], w, col); },
    };
    return K;
  }
  const ink = "#07060c";
  // ---- the bosses. Each: size in picture pixels, the palette ramps it may use, and a painter (K, phase 0..1, variant)
  const BOSS_ART = {
    butcher: { w: 76, h: 104, ramps: ["ink", "flesh", "blood", "leather", "rust", "bone", "paper", "glowr", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 228, H = 312, cx = W / 2;
      // legs and boots
      for (const s of [-1, 1]) { K.P([[cx + s * 12, 228], [cx + s * 44, 228], [cx + s * 40, 292], [cx + s * 16, 292]], K.LG(0, 228, 0, 292, [[0, "#36241a"], [1, "#1e140e"]])); K.P([[cx + s * 10, 286], [cx + s * 48, 286], [cx + s * 50, 306], [cx + s * 8, 306]], "#1d1830"); }
      // bloated gut, stretched and scarred
      K.vol(cx, 170 - b * 0.3, 70, 74 + b, ["#e2b394", "#ad7058", "#4a2226"]);
      K.E(cx + 26, 196, 30, 26, "rgba(74,34,38,0.45)");
      K.dots(90, cx - 60, 110, cx + 60, 230, "rgba(42,20,24,0.5)", 0.9);
      K.stitch(cx - 34, 128, cx - 20, 226, 9, "#2a1418", 1.6);
      // the apron: filthy canvas, soaked
      K.P([[cx - 44, 110], [cx + 44, 110], [cx + 62, 252], [cx - 60, 254]], K.LG(0, 110, 0, 254, [[0, "#ddd4b0"], [0.6, "#bab08e"], [1, "#948a70"]]));
      for (const [x, y, rx, ry] of [[cx - 12, 150, 22, 16], [cx + 20, 196, 26, 22], [cx - 30, 222, 18, 14], [cx + 4, 238, 30, 10]]) K.E(x, y, rx, ry, K.RG(x, y, 2, rx, [[0, "#9a1224"], [0.6, "#6a0c18"], [1, "rgba(64,7,14,0.2)"]]));
      for (let i = 0; i < 7; i++) K.drip(cx - 50 + i * 17 + K.rng() * 6, 244 + K.rng() * 8, 10 + K.rng() * 22 + b, 2.2, "#6a0c18");
      K.S([[cx - 44, 110], [cx - 30, 70]], 3, "#523828"); K.S([[cx + 44, 110], [cx + 30, 70]], 3, "#523828");
      // arms: the left drags a meat hook on a chain, the right lifts the cleaver. Muscle, hair, veins.
      const limb = (x0, y0, x1, y1, w0, w1) => { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
        K.P([[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], K.LG(x0 + nx * w0, y0 + ny * w0, x0 - nx * w0, y0 - ny * w0, [[0, "#e2b394"], [0.35, "#ad7058"], [1, "#4a2226"]]));
        K.E((x0 + x1) / 2 + nx * w0 * 0.3, (y0 + y1) / 2 + ny * w0 * 0.3, Math.hypot(x1 - x0, y1 - y0) * 0.32, w0 * 0.55, "rgba(242,210,184,0.25)", a);
        K.Q([[x0 - nx * w0 * 0.3, y0 - ny * w0 * 0.3], [(x0 + x1) / 2 + nx * 3, (y0 + y1) / 2], [x1 - nx * w1 * 0.2, y1 - ny * w1 * 0.2]], 1.2, "rgba(74,34,38,0.7)");
        for (let i = 0; i < 16; i++) { const t2 = K.rng(), px = x0 + (x1 - x0) * t2 + nx * (K.rng() - 0.5) * w0 * 1.6, py = y0 + (y1 - y0) * t2 + ny * (K.rng() - 0.5) * w0 * 1.6; K.S([[px, py], [px + 1.5, py + 2.5]], 0.8, "rgba(42,20,24,0.6)"); } };
      K.vol(cx - 60, 118, 22, 18, ["#e2b394", "#ad7058", "#4a2226"]); K.vol(cx + 60, 110, 22, 18, ["#e2b394", "#ad7058", "#4a2226"]);
      limb(cx - 66, 116, cx - 82, 170, 17, 13); limb(cx - 82, 170, cx - 88, 214, 13, 11);
      K.vol(cx - 88, 218, 12, 11, ["#c98f72", "#6e3a34", "#2a1418"]); for (let f = 0; f < 4; f++) K.E(cx - 96 + f * 5, 226, 3, 4, "#8e5444");
      for (let i = 0; i < 9; i++) { const y = 228 + i * 9, x = cx - 88 + Math.sin(i * 0.8 + b * 0.3) * 2; K.S([[x - 3, y - 3], [x + 3, y + 3]], 2.2, i % 2 ? "#76381a" : "#9a5226"); }
      K.Q([[cx - 88, 302], [cx - 78, 312], [cx - 68, 298]], 4, "#bc7038"); K.Q([[cx - 88, 302], [cx - 80, 310], [cx - 70, 300]], 1.4, "#e8e0cc");
      limb(cx + 66, 108, cx + 86, 70, 17, 13); limb(cx + 86, 70, cx + 88, 38, 13, 11);
      K.vol(cx + 88, 34, 12, 11, ["#c98f72", "#6e3a34", "#2a1418"]);
      K.S([[cx + 88, 34], [cx + 92, 12]], 5, "#36241a");
      K.P([[cx + 72, 16], [cx + 84, 2], [cx + 110, 4], [cx + 110, 30], [cx + 92, 30]], K.LG(cx + 72, 2, cx + 110, 30, [[0, "#c8bca2"], [0.45, "#76381a"], [1, "#2a1208"]]));
      K.S([[cx + 84, 2], [cx + 110, 4]], 2, "#e8e0cc"); K.E(cx + 98, 18, 6, 4, "#6a0c18"); K.drip(cx + 100, 24, 12, 2, "#9a1224"); K.crack(cx + 90, 10, 14, 0.5, "#2a1208", 1);
      // head in a sack hood, one eye hole
      K.vol(cx, 68, 30, 34, ["#bab08e", "#948a70", "#523828"]);
      K.dots(60, cx - 26, 38, cx + 26, 100, "rgba(82,56,40,0.55)", 0.8);
      K.S([[cx - 30, 92], [cx + 30, 92]], 4, "#523828"); K.S([[cx - 8, 92], [cx - 14, 112], [cx - 6, 112]], 2, "#523828");
      K.E(cx + 9, 62, 8, 7, ink); K.eye(cx + 9, 62, 4, "#ff2d2d");
      K.E(cx - 6, 84, 13, 5, ink); K.teeth(cx - 17, 81, 7, 3, 5, "#e8e0cc");
      K.E(cx - 14, 50, 8, 10, "rgba(106,12,24,0.55)");
      // flies
      for (let i = 0; i < 7; i++) { const a = ph * Math.PI * 2 + i * 0.9; K.E(cx - 60 + Math.cos(a * (1 + i % 3)) * 40 + i * 16, 140 + Math.sin(a * 2 + i) * 30, 1.6, 1.2, ink); }
    } },
    mother: { w: 112, h: 84, ramps: ["ink", "leech", "blood", "pale", "bone", "flesh", "glowr"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2), W = 336, H = 252, cx = W / 2;
      // the swollen mound, glossy, with things inside
      K.vol(cx, 162 + b * 2, 158, 88 - b * 3, ["#e0a0bc", "#7a3060", "#1e0a18"]);
      for (const [x, y, r, a] of [[cx - 70, 170, 26, 0.4], [cx + 40, 150, 30, -0.3], [cx - 10, 196, 24, 1.2], [cx + 96, 188, 18, 0.2]]) { K.E(x, y, r, r * 0.55, "rgba(30,10,24,0.45)", a); K.E(x - r * 0.4, y - 4, r * 0.3, r * 0.26, "rgba(236,236,242,0.25)"); K.E(x + r * 0.5, y + 2, r * 0.18, r * 0.35, "rgba(236,236,242,0.18)", a); }
      for (let i = 0; i < 7; i++) K.Q([[cx - 150 + i * 6, 150 + i * 14], [cx, 96 + i * 20 + b * 2], [cx + 150 - i * 6, 150 + i * 14]], 1.6, "rgba(30,10,24,0.55)");
      K.E(cx - 60, 110, 50, 16, "rgba(255,255,255,0.18)"); K.E(cx - 76, 106, 18, 6, "rgba(255,255,255,0.3)");
      // lamprey mouths around the crown
      for (const [x, y, r] of [[cx - 110, 128, 17], [cx - 50, 98, 15], [cx + 60, 100, 16], [cx + 118, 130, 18], [cx + 4, 118, 12]]) {
        K.E(x, y, r + 3, r * 0.8 + 3, "#3a1230"); K.E(x, y, r, r * 0.8, "#1e0306");
        for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; K.P([[x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8], [x + Math.cos(a + 0.2) * r, y + Math.sin(a + 0.2) * r * 0.8], [x + Math.cos(a + 0.1) * r * 0.55, y + Math.sin(a + 0.1) * r * 0.44]], "#e8e0cc"); }
        K.E(x, y, r * 0.3, r * 0.24, "#9a1224");
      }
      // a face, half swallowed, stretched over the crown of the mound
      K.P([[cx - 34, 110 + b], [cx - 28, 60 + b], [cx - 4, 44 + b], [cx + 22, 58 + b], [cx + 30, 110 + b]], K.RG(cx - 10, 60, 4, 60, [[0, "#ececf2"], [0.5, "#a8a8ba"], [1, "#5a1e48"]]));
      K.E(cx - 14, 74 + b, 7, 9, ink); K.E(cx + 8, 76 + b, 6, 8, ink); K.E(cx - 14, 76 + b, 1.8, 1.8, "#ff2d2d");
      K.drip(cx - 16, 82 + b, 16, 1.6, "#9c4a7a"); K.drip(cx + 8, 84 + b, 12, 1.4, "#9c4a7a");
      K.P([[cx - 14, 92 + b], [cx + 6, 92 + b], [cx + 2, 124 + b * 2], [cx - 10, 124 + b * 2]], "#1e0306"); K.teeth(cx - 12, 92 + b, 5, 3, 4, "#c8bca2");
      for (let i = 0; i < 6; i++) K.Q([[cx - 30 + i * 11, 104 + b], [cx - 28 + i * 11, 90], [cx - 34 + i * 12, 60]], 1, "rgba(90,30,72,0.6)");
      K.S([[cx - 34, 96], [cx - 42, 108], [cx - 38, 122]], 3, "#7a3060");
      // leechlings at the rim
      for (let i = 0; i < 9; i++) { const x = cx - 150 + i * 36 + Math.sin(ph * 6.28 + i) * 4, y = 240 - (i % 2) * 8; K.Q([[x, y], [x + 8, y - 10 - Math.sin(ph * 6.28 + i) * 5], [x + 18, y - 4]], 5, "#5a1e48"); K.E(x + 18, y - 4, 3, 3, "#9a1224"); }
      for (let i = 0; i < 8; i++) K.drip(cx - 120 + i * 34, 236, 6 + K.rng() * 10, 2.4, "#3a1230");
    } },
    choirmaster: { w: 72, h: 116, ramps: ["ink", "cloth", "night", "pale", "bone", "blood", "glowy", "paper"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 216, H = 348, cx = W / 2;
      // a halo of guttering candles behind the head
      for (let i = 0; i < 9; i++) { const a = Math.PI * (0.1 + i * 0.1), x = cx + Math.cos(a) * 64, y = 96 - Math.sin(a) * 54; K.R(x - 3, y, 6, 16, "#ddd4b0"); K.drip(x - 2, y + 2, 5, 1.2, "#f4eed6"); const f = 6 + Math.sin(ph * 12.6 + i) * 2; K.E(x, y - f / 2, 3, f / 2 + 1, "#ff9a3d"); K.E(x, y - f / 2 + 1, 1.4, f / 3, "#fff0a0"); }
      // the long robe, torn at the hem
      K.P([[cx - 34, 124], [cx + 34, 124], [cx + 70, 330], [cx - 70, 330]], K.LG(cx - 70, 0, cx + 70, 0, [[0, "#141222"], [0.35, "#332c52"], [0.55, "#221e38"], [1, "#07060c"]]));
      for (let i = 0; i < 6; i++) K.S([[cx - 20 + i * 8, 140], [cx - 44 + i * 18, 326]], 1.4, "rgba(70,62,110,0.5)");
      for (let i = 0; i < 12; i++) K.P([[cx - 70 + i * 12, 328], [cx - 64 + i * 12, 344 + K.rng() * 4], [cx - 58 + i * 12, 328]], "#141222");
      // the chest opened like a hymnal: ribs over a dark hollow
      K.E(cx, 170, 20, 34, "#1e0306"); for (let i = 0; i < 6; i++) { K.Q([[cx - 18, 148 + i * 10], [cx, 142 + i * 10], [cx + 18, 148 + i * 10]], 2.6, "#c8bca2"); }
      K.S([[cx, 140], [cx, 204]], 3, "#a2957c"); K.E(cx, 180, 4, 5, "#ff9a3d");
      // the high collar and the gaunt head
      K.P([[cx - 30, 124], [cx - 20, 96], [cx + 20, 96], [cx + 30, 124]], "#221e38"); K.S([[cx - 30, 124], [cx - 20, 96]], 2, "#463e6e"); K.S([[cx + 30, 124], [cx + 20, 96]], 2, "#463e6e");
      K.vol(cx, 72 + b, 18, 30, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      K.E(cx - 8, 64 + b, 6, 4, "#3a3a4a"); K.E(cx + 8, 64 + b, 6, 4, "#3a3a4a");
      for (const x of [-8, 8]) for (let k = -1; k <= 1; k++) K.S([[cx + x + k * 3 - 1, 61 + b], [cx + x + k * 3 + 1, 67 + b]], 1.2, "#40070e");
      // the mouth sewn into a smile far too wide
      K.Q([[cx - 16, 84 + b], [cx, 94 + b], [cx + 16, 84 + b]], 2.4, "#40070e");
      for (let k = 0; k < 7; k++) { const x = cx - 14 + k * 4.6, y = 84 + b + Math.sin(k / 6 * Math.PI) * 8; K.S([[x, y - 3], [x, y + 3]], 1.3, "#1e0306"); }
      K.drip(cx - 12, 88 + b, 12, 1.4, "#9a1224"); K.drip(cx + 10, 90 + b, 8, 1.4, "#9a1224");
      K.E(cx, 46 + b, 18, 6, "rgba(20,18,34,0.6)");
      // arms: one raised with the bone baton, one pointing
      K.S([[cx + 30, 130], [cx + 52, 96], [cx + 60, 56]], 8, "#221e38"); K.S([[cx + 60, 56], [cx + 64, 44]], 5, "#a8a8ba");
      K.S([[cx + 64, 44], [cx + 92, 2]], 3.4, "#e8e0cc"); K.E(cx + 92, 2, 4, 4, "#c8bca2");
      K.S([[cx - 30, 130], [cx - 56, 170], [cx - 70, 200]], 8, "#221e38"); for (let f = 0; f < 4; f++) K.S([[cx - 70, 200], [cx - 78 - f * 3, 222 + f]], 1.6, "#a8a8ba");
      // hymn pages in the air
      for (let i = 0; i < 4; i++) { const a = ph * Math.PI * 2 + i * 1.6, x = cx - 80 + i * 50 + Math.cos(a) * 6, y = 230 + Math.sin(a) * 12 - i * 30; K.P([[x, y], [x + 12, y - 3], [x + 14, y + 12], [x + 2, y + 15]], "#ddd4b0"); for (let l = 0; l < 3; l++) K.S([[x + 3, y + 3 + l * 4], [x + 11, y + 1 + l * 4]], 0.8, "#6a6250"); }
    } },
    voss: { w: 84, h: 116, ramps: ["ink", "blood", "flesh", "salt", "glowc", "gold", "bone", "cloth"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 252, H = 348, cx = W / 2;
      // legs: raw muscle
      for (const s of [-1, 1]) { K.P([[cx + s * 8, 236], [cx + s * 38, 236], [cx + s * 34, 334], [cx + s * 12, 334]], K.LG(0, 236, 0, 334, [[0, "#9a1224"], [1, "#40070e"]])); for (let i = 0; i < 6; i++) K.S([[cx + s * (12 + i * 4), 240], [cx + s * (14 + i * 3), 330]], 1, "rgba(238,58,70,0.45)"); }
      K.R(cx - 40, 214, 80, 26, "#221e38"); K.R(cx - 40, 214, 80, 5, "#b08a28");
      // the flayed torso: striated muscle, ribs showing
      K.vol(cx, 170, 50, 60, ["#ee3a46", "#9a1224", "#1e0306"]);
      for (let i = 0; i < 14; i++) K.Q([[cx - 46 + i * 7, 116], [cx - 40 + i * 6, 170], [cx - 44 + i * 7, 226]], 1.2, "rgba(30,3,6,0.5)");
      // the Rain Bell, grown into his chest, glowing through cracked ribs
      K.E(cx, 176, 34, 38, K.RG(cx, 176, 4, 40, [[0, "rgba(158,240,245,0.9)"], [0.6, "rgba(62,224,232,0.35)"], [1, "rgba(62,224,232,0)"]]));
      K.P([[cx - 16, 152], [cx + 16, 152], [cx + 26, 196], [cx - 26, 196]], K.LG(cx - 26, 0, cx + 26, 0, [[0, "#5a3c0e"], [0.35, "#f6e07a"], [0.7, "#b08a28"], [1, "#2e1e06"]]));
      K.E(cx, 152, 16, 5, "#d8b440"); K.R(cx - 28, 194, 56, 6, "#86621a"); K.E(cx, 202, 5, 5, "#86621a");
      K.crack(cx - 4, 160, 30, 1.3, "#2e1e06", 1.4); K.crack(cx + 8, 170, 22, 2.0, "#2e1e06", 1.2);
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) K.Q([[cx + s * 20, 136 + i * 16], [cx + s * 40, 132 + i * 16], [cx + s * 48, 142 + i * 16]], 3, "#e8e0cc");
      // salt bursting out of him in crystals
      const crys = (x, y, h2, a, big) => { const w2 = h2 * 0.32; const tip = [x + Math.cos(a) * h2, y + Math.sin(a) * h2], l = [x + Math.cos(a - 1.57) * w2, y + Math.sin(a - 1.57) * w2], r = [x + Math.cos(a + 1.57) * w2, y + Math.sin(a + 1.57) * w2]; K.P([l, tip, r], "#cacee0"); K.P([l, tip, [x, y]], "#ffffff"); K.P([r, tip, [x, y]], "#7e829c"); if (big) K.S([[x, y], tip], 1, "#9ef0f5"); };
      for (const [x, y, h2, a] of [[cx - 50, 124, 40, -2.3], [cx - 40, 116, 30, -1.9], [cx + 48, 122, 44, -0.8], [cx + 56, 132, 28, -0.3], [cx - 20, 226, 20, 2.2], [cx + 30, 230, 24, 0.9], [cx + 6, 60, 36, -1.6], [cx - 18, 64, 26, -2.0], [cx + 26, 64, 28, -1.1]]) crys(x, y, h2 + b, a, h2 > 30);
      // arms: one a crystal claw
      K.S([[cx - 46, 130], [cx - 70, 180], [cx - 74, 226]], 12, "#9a1224"); for (let f = 0; f < 4; f++) crys(cx - 74 + f * 4, 226, 16, 1.4 + f * 0.2, false);
      K.S([[cx + 46, 130], [cx + 68, 172], [cx + 60, 214]], 12, "#9a1224"); K.S([[cx + 46, 130], [cx + 68, 172], [cx + 60, 214]], 3, "rgba(238,58,70,0.6)");
      // the head: half face, half raw, one eye turned to salt
      K.vol(cx, 92 + b, 24, 28, ["#e2b394", "#ad7058", "#4a2226"]);
      K.P([[cx, 64 + b], [cx + 26, 80 + b], [cx + 22, 116 + b], [cx, 120 + b]], "#9a1224");
      for (let i = 0; i < 5; i++) K.S([[cx + 3 + i * 4, 70 + b], [cx + 3 + i * 4, 114 + b]], 1, "rgba(30,3,6,0.5)");
      K.eye(cx - 10, 90 + b, 4, "#e2b394", ink); K.eye(cx + 11, 90 + b, 5, "#9ef0f5", null);
      K.P([[cx - 10, 106 + b], [cx + 16, 106 + b], [cx + 12, 114 + b], [cx - 6, 114 + b]], "#1e0306"); K.teeth(cx - 8, 106 + b, 7, 3, 4, "#e8e0cc");
      K.S([[cx - 30, 124], [cx + 30, 124]], 4, "#b08a28");
    } },
    hollis: { w: 100, h: 116, ramps: ["ink", "gold", "corpse", "brine", "bone", "blood", "rot", "glowy"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 300, H = 348, cx = W / 2;
      // legs, drowned and swollen, in rotting hose
      for (const s of [-1, 1]) { K.vol(cx + s * 30, 300, 22, 40, ["#7e9484", "#44584e", "#1e2a26"]); K.E(cx + s * 32, 336, 28, 10, "#1e140e"); }
      // the gut: a merchant's coat stretched over a drowned belly
      K.vol(cx, 190, 104, 116 + b, ["#f6e07a", "#b08a28", "#2e1e06"]);
      K.P([[cx - 8, 80], [cx + 8, 80], [cx + 20, 300], [cx - 20, 300]], K.LG(0, 80, 0, 300, [[0, "#44584e"], [1, "#1e2a26"]]));
      for (let i = 0; i < 7; i++) { const y = 110 + i * 27; K.vol(cx - 22, y, 7, 7, ["#f6e07a", "#b08a28", "#5a3c0e"]); }
      K.E(cx + 4, 212, 22, 14, "#1e0306"); K.teeth(cx - 16, 204, 9, 4, 6, "#e8e0cc");
      // barnacles and weed
      for (let i = 0; i < 26; i++) { const a = K.rng() * 6.28, r = 60 + K.rng() * 40, x = cx + Math.cos(a) * r, y = 200 + Math.sin(a) * r * 1.05; K.vol(x, y, 4, 4, ["#e8e0cc", "#a2957c", "#4a4238"]); K.E(x, y - 1, 1.2, 1.2, ink); }
      for (let i = 0; i < 8; i++) { const x = cx - 90 + i * 26; K.Q([[x, 150 + (i % 3) * 30], [x + 6 + b, 200], [x - 4, 250 + (i % 2) * 20]], 3, "#465228"); }
      // arms: bloated, eels pouring from the sleeves
      K.vol(cx - 104, 170, 24, 44, ["#d8b440", "#86621a", "#2e1e06"], 0.3); K.vol(cx + 104, 170, 24, 44, ["#d8b440", "#86621a", "#2e1e06"], -0.3);
      K.vol(cx - 116, 222, 16, 16, ["#a4b8a6", "#5e7466", "#1e2a26"]); K.vol(cx + 116, 222, 16, 16, ["#a4b8a6", "#5e7466", "#1e2a26"]);
      for (const s of [-1, 1]) for (let e = 0; e < 3; e++) { const x0 = cx + s * 118, y0 = 232; const w2 = Math.sin(ph * 6.28 + e) * 8; K.Q([[x0, y0], [x0 + s * (10 + e * 8) + w2, y0 + 30], [x0 + s * (4 + e * 12), y0 + 60 + e * 14]], 5 - e, e % 2 ? "#28626e" : "#1a4252"); K.E(x0 + s * (4 + e * 12), y0 + 60 + e * 14, 3.4, 2.6, "#3f8a90"); }
      // the hook spear
      K.S([[cx + 128, 90], [cx + 118, 330]], 4, "#58391e"); K.Q([[cx + 128, 90], [cx + 146, 70], [cx + 136, 52]], 4, "#a6aac2");
      // the head: bloated, a mouth split far too wide, coins for eyes
      K.vol(cx, 60 + b * 0.5, 40, 40, ["#cad8c8", "#7e9484", "#2e403a"]);
      K.E(cx, 74 + b * 0.5, 30, 16, "#1e0306"); K.teeth(cx - 28, 64 + b * 0.5, 14, 3, 7, "#e8e0cc"); K.teeth(cx - 26, 88 + b * 0.5, 13, 3, -6, "#c8bca2");
      K.E(cx, 80 + b * 0.5, 10, 6, "#9a1224");
      for (const x of [-16, 16]) { K.vol(cx + x, 44 + b * 0.5, 9, 9, ["#f6e07a", "#d8b440", "#5a3c0e"]); K.S([[cx + x - 4, 44 + b * 0.5], [cx + x + 4, 44 + b * 0.5]], 1.2, "#5a3c0e"); }
      K.E(cx, 20 + b * 0.5, 30, 8, "rgba(30,42,38,0.7)");
      for (let i = 0; i < 6; i++) K.drip(cx - 30 + i * 12, 94 + b * 0.5, 6 + K.rng() * 12, 1.6, "#3f8a90");
    } },
    quill: { w: 64, h: 116, ramps: ["ink", "cloth", "pale", "paper", "gold", "blood", "bone", "night", "rust"], paint(K, ph, v) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 192, H = 348, cx = W / 2, toll = v === "tollkeeper";
      const coat = toll ? ["#5a3c0e", "#b08a28", "#2e1e06"] : ["#463e6e", "#221e38", "#07060c"];
      // quills bristling from the back like a porcupine
      for (let i = 0; i < 16; i++) { const a = -Math.PI * (0.15 + i * 0.045), x0 = cx + (i - 8) * 3, y0 = 120; const L = 60 + K.rng() * 40; const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L; K.S([[x0, y0], [x1, y1]], 2.2, "#f4eed6"); K.S([[x0 + (x1 - x0) * 0.4, y0 + (y1 - y0) * 0.4], [x1, y1]], 4.4, "rgba(221,212,176,0.8)"); K.E(x0 + (x1 - x0) * 0.05, y0 + (y1 - y0) * 0.05, 2, 2, "#07060c"); }
      // long coat, legs like stilts
      K.P([[cx - 30, 120], [cx + 30, 120], [cx + 40, 290], [cx - 40, 290]], K.LG(cx - 40, 0, cx + 40, 0, [[0, coat[2]], [0.4, coat[0]], [1, coat[2]]]));
      for (const s of [-1, 1]) K.S([[cx + s * 14, 286], [cx + s * 16, 340]], 6, "#141222");
      // the ledger chained to his chest
      K.P([[cx - 24, 150], [cx + 24, 146], [cx + 26, 208], [cx - 22, 212]], "#523828"); K.P([[cx - 20, 152], [cx + 20, 150], [cx + 22, 204], [cx - 18, 206]], "#ddd4b0");
      for (let l = 0; l < 9; l++) K.S([[cx - 16, 158 + l * 5], [cx + 16, 156 + l * 5]], 0.9, l === 4 ? "#9a1224" : "#6a6250");
      for (const s of [-1, 1]) for (let i = 0; i < 5; i++) K.S([[cx + s * (24 + i * 2), 150 - i * 6], [cx + s * (26 + i * 2), 146 - i * 6]], 2, "#9a5226");
      if (toll) for (let i = 0; i < 14; i++) K.vol(cx - 30 + K.rng() * 60, 220 + K.rng() * 60, 4, 4, ["#f6e07a", "#b08a28", "#5a3c0e"]);
      // arms that reach the knees, ink-black fingers
      for (const s of [-1, 1]) { K.S([[cx + s * 30, 128], [cx + s * 44, 200], [cx + s * 46, 262]], 6, coat[0]); K.S([[cx + s * 46, 262], [cx + s * 48, 276]], 4, "#a8a8ba"); for (let f = 0; f < 4; f++) K.S([[cx + s * 48, 276], [cx + s * (48 + f * 3), 306 + f * 2]], 1.6, "#07060c"); K.drip(cx + s * 52, 306, 10, 1.2, "#07060c"); }
            // head: gaunt, cracked spectacles, ink running from the mouth; the tollkeeper has a coin slot for a mouth
      K.vol(cx, 86 + b, 20, 28, toll ? ["#d8b440", "#86621a", "#2e1e06"] : ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      for (const x of [-9, 9]) { K.E(cx + x, 82 + b, 7, 6, "#1d1830"); c2(K, cx + x, 82 + b); }
      K.S([[cx - 2, 82 + b], [cx + 2, 82 + b]], 1.4, "#b08a28");
      if (toll) { K.R(cx - 12, 100 + b, 24, 4, "#07060c"); K.vol(cx, 96 + b, 5, 5, ["#f6e07a", "#d8b440", "#5a3c0e"]); }
      else { K.E(cx, 102 + b, 8, 4, "#07060c"); K.drip(cx - 2, 104 + b, 16 + b * 2, 2, "#07060c"); K.drip(cx + 4, 104 + b, 9, 1.4, "#07060c"); }
      K.P([[cx - 22, 64 + b], [cx + 22, 64 + b], [cx + 16, 40 + b], [cx - 16, 40 + b]], toll ? "#5a3c0e" : "#141222"); K.R(cx - 26, 62 + b, 52, 4, toll ? "#86621a" : "#221e38");
      function c2(K2, x, y) { K2.E(x, y, 6, 5, "rgba(158,240,245,0.35)"); K2.S([[x - 6, y], [x - 4, y - 4], [x, y - 5], [x + 5, y - 3], [x + 6, y], [x + 4, y + 4], [x, y + 5], [x - 5, y + 3], [x - 6, y]], 1.2, "#b08a28"); K2.S([[x - 3, y - 4], [x + 1, y + 1], [x - 1, y + 5]], 0.8, "#ececf2"); K2.E(x + 1, y + 1, 1.6, 1.6, "#9a1224"); }
    } },
    gulp: { w: 112, h: 92, ramps: ["ink", "rot", "corpse", "bone", "pale", "blood", "glowy", "flesh"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 336, H = 276, cx = W / 2;
      // hind legs splayed
      for (const s of [-1, 1]) { K.vol(cx + s * 128, 230, 40, 34, ["#84904e", "#465228", "#1c2012"], s * 0.4); for (let t = 0; t < 4; t++) K.E(cx + s * (110 + t * 12), 266, 7, 4, "#2e361c"); }
      // the body: warty, wet, heaving
      K.vol(cx, 170, 150, 96 + b, ["#a8b068", "#465228", "#1c2012"]);
      K.dots(160, cx - 140, 90, cx + 140, 250, "rgba(28,32,18,0.55)", 2.4);
      for (let i = 0; i < 40; i++) { const x = cx - 130 + K.rng() * 260, y = 100 + K.rng() * 130; K.vol(x, y, 3 + K.rng() * 4, 3 + K.rng() * 3, ["#a8b068", "#62703a", "#2e361c"]); }
      // the pale belly, full of what it swallowed: faces pressing out
      K.vol(cx, 208, 110, 54 + b * 0.5, ["#cad8c8", "#7e9484", "#2e403a"]);
      for (const [x, y, s] of [[cx - 60, 204, 1], [cx - 10, 222, 1.2], [cx + 48, 206, 0.9], [cx + 90, 222, 0.7], [cx - 96, 222, 0.7]]) { K.vol(x, y, 13 * s, 15 * s, ["#ececf2", "#a8a8ba", "#5e5e70"]); K.E(x - 4 * s, y - 3 * s, 2.4 * s, 2 * s, ink); K.E(x + 4 * s, y - 3 * s, 2.4 * s, 2 * s, ink); K.E(x, y + 6 * s, 3 * s, 4 * s, ink); }
      // the great mouth, hands reaching out of it
      K.Q([[cx - 150, 150], [cx, 186 + b], [cx + 150, 150]], 8, "#1c2012"); K.E(cx, 164 + b, 120, 22, "#1e0306");
      for (let i = 0; i < 4; i++) { const x = cx - 70 + i * 46 + Math.sin(ph * 6.28 + i) * 4; K.S([[x, 170 + b], [x - 4, 146], [x - 2, 132]], 5, "#a8a8ba"); for (let f = 0; f < 4; f++) K.S([[x - 2, 132], [x - 8 + f * 4, 120 - (f % 2) * 4]], 1.8, "#ccccd8"); }
      // bulging eyes and a crown of reeds
      for (const s of [-1, 1]) { K.vol(cx + s * 86, 88, 30, 30, ["#a8b068", "#465228", "#1c2012"]); K.E(cx + s * 86, 86, 20, 20, "#ffcf4a"); K.E(cx + s * 86, 86, 4, 17, ink); K.E(cx + s * 80, 80, 5, 5, "#fff0a0"); }
      for (let i = 0; i < 9; i++) K.S([[cx - 40 + i * 10, 80], [cx - 46 + i * 11, 30 - (i % 3) * 10]], 3, i % 2 ? "#62703a" : "#84904e");
      for (let i = 0; i < 10; i++) K.drip(cx - 110 + i * 24, 176 + b, 8 + K.rng() * 16, 2, "#62703a");
    } },
    maw: { w: 96, h: 118, ramps: ["ink", "corpse", "brine", "leather", "rust", "bone", "blood", "rot", "glowc"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 288, H = 354, cx = W / 2;
      // legs and sea boots
      for (const s of [-1, 1]) { K.P([[cx + s * 10, 250], [cx + s * 44, 250], [cx + s * 40, 330], [cx + s * 14, 330]], "#1e140e"); K.E(cx + s * 30, 336, 26, 10, "#07060c"); }
      // the coat, rotted to ribbons over a drowned chest
      K.vol(cx, 186, 70, 84, ["#a4b8a6", "#44584e", "#1e2a26"]);
      for (let i = 0; i < 6; i++) K.Q([[cx - 36, 130 + i * 14], [cx, 124 + i * 14], [cx + 36, 130 + i * 14]], 3, "#cad8c8");
      for (let i = 0; i < 16; i++) { const x = cx - 80 + i * 10, top = 104 + Math.abs(i - 8) * 3; const len = 120 + K.rng() * 60 + b * 2; K.P([[x, top], [x + 9, top], [x + 7 + Math.sin(ph * 6.28 + i) * 3, top + len], [x + 1, top + len - 8]], i % 3 ? "#36241a" : "#523828"); }
      K.P([[cx - 30, 104], [cx + 30, 104], [cx + 14, 230], [cx - 14, 230]], "rgba(30,42,38,0.9)");
      // an anchor on a chain
      for (let i = 0; i < 14; i++) K.S([[cx + 93, 126 + i * 11], [cx + 99, 134 + i * 11]], 2.6, i % 2 ? "#76381a" : "#9a5226");
      K.S([[cx + 96, 280], [cx + 96, 336]], 7, "#4e2410"); K.Q([[cx + 64, 318], [cx + 96, 346], [cx + 128, 318]], 7, "#76381a"); K.S([[cx + 80, 290], [cx + 112, 290]], 6, "#76381a");
      // arms: one on the chain, one dragging a net of the dead
      K.S([[cx - 60, 124], [cx - 88, 190], [cx - 90, 250]], 16, "#36241a"); K.vol(cx - 90, 256, 12, 12, ["#a4b8a6", "#5e7466", "#1e2a26"]);
      K.S([[cx + 60, 124], [cx + 86, 150], [cx + 94, 140]], 16, "#36241a"); K.vol(cx + 94, 136, 12, 12, ["#a4b8a6", "#5e7466", "#1e2a26"]);
      // barnacles and a crab on the shoulder
      for (let i = 0; i < 18; i++) K.vol(cx - 70 + K.rng() * 140, 110 + K.rng() * 120, 3, 3, ["#e8e0cc", "#a2957c", "#4a4238"]);
      K.vol(cx - 56, 110, 12, 8, ["#bc7038", "#9a5226", "#2a1208"]); K.S([[cx - 66, 106], [cx - 76, 96]], 2.4, "#9a5226"); K.S([[cx - 46, 106], [cx - 38, 96]], 2.4, "#9a5226");
      // the head: rotted, eels in the sockets, a beard of weed, the tricorn
      K.vol(cx, 74 + b, 30, 34, ["#a4b8a6", "#5e7466", "#1e2a26"]);
      for (const x of [-12, 12]) { K.E(cx + x, 68 + b, 8, 7, ink); const w2 = Math.sin(ph * 6.28 + x) * 5; K.Q([[cx + x, 68 + b], [cx + x * 2.2 + w2, 60 + b], [cx + x * 3, 74 + b + w2]], 3.4, "#3f8a90"); K.E(cx + x * 3, 74 + b + w2, 2.6, 2, "#6cb8b8"); }
      K.E(cx, 94 + b, 14, 6, "#1e0306"); K.teeth(cx - 12, 90 + b, 6, 3, 5, "#c8bca2", 1, 1);
      for (let i = 0; i < 10; i++) K.Q([[cx - 22 + i * 5, 98 + b], [cx - 24 + i * 5 + Math.sin(ph * 6.28 + i) * 3, 118], [cx - 20 + i * 5, 136]], 2.4, i % 2 ? "#465228" : "#62703a");
      K.P([[cx - 50, 50 + b], [cx + 50, 50 + b], [cx + 30, 36 + b], [cx, 28 + b], [cx - 30, 36 + b]], "#1e140e"); K.P([[cx - 30, 36 + b], [cx - 24, 8 + b], [cx + 24, 8 + b], [cx + 30, 36 + b]], "#36241a"); K.S([[cx - 50, 50 + b], [cx + 50, 50 + b]], 2, "#6e4e38");
    } },
    colossus: { w: 112, h: 118, ramps: ["ink", "salt", "pale", "blood", "glowc", "night", "bone"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, H = 354, cx = W / 2;
      const block = (x, y, w2, h2) => { K.P([[x, y], [x + w2, y], [x + w2, y + h2], [x, y + h2]], K.LG(x, y, x + w2, y + h2, [[0, "#e8ecf8"], [0.5, "#a6aac2"], [1, "#565a74"]])); K.S([[x, y + h2], [x, y], [x + w2, y]], 1.4, "#ffffff"); K.crack(x + w2 * 0.3, y + h2 * 0.2, Math.min(w2, h2) * 0.8, 1.2, "#565a74"); };
      // legs of stacked salt
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) block(cx + s * 40 - 22, 250 + i * 32, 44 + (i % 2) * 6, 32);
      // arms, great blocks hanging to the ground
      for (const s of [-1, 1]) { for (let i = 0; i < 4; i++) block(cx + s * 118 - 22 + (i % 2) * 3, 110 + i * 46, 44, 46); for (let f = 0; f < 3; f++) block(cx + s * 118 - 20 + f * 14, 294, 12, 26); }
      // the torso: packed salt with the Choir inside it, mouths open
      block(cx - 84, 96, 168, 160);
      for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) { const x = cx - 64 + q * 32 + (r % 2) * 10, y = 116 + r * 34; K.vol(x, y, 11, 13, ["#ececf2", "#a8a8ba", "#5e5e70"]); K.E(x - 4, y - 3, 2.4, 2.8, ink); K.E(x + 4, y - 3, 2.4, 2.8, ink); K.E(x, y + 5, 3, 4 + Math.sin(ph * 6.28 + r + q) * 1.5, ink); K.S([[x - 12, y - 10], [x + 12, y - 10]], 3, "#565a74"); }
      K.E(cx + 30, 200, 6, 4, "#9a1224"); K.drip(cx + 30, 202, 18, 1.6, "#9a1224");
      // the head, and a crown of crystal
      block(cx - 36, 40 + b, 72, 60);
      K.eye(cx - 16, 66 + b, 6, "#3ee0e8", null); K.eye(cx + 16, 66 + b, 6, "#3ee0e8", null);
      K.R(cx - 20, 84 + b, 40, 6, ink);
      for (let i = 0; i < 7; i++) { const x = cx - 36 + i * 12, h2 = 26 + (i % 3) * 14 + (i === 3 ? 20 : 0); K.P([[x, 42 + b], [x + 6, 42 + b - h2], [x + 12, 42 + b]], "#cacee0"); K.P([[x + 6, 42 + b - h2], [x + 12, 42 + b], [x + 6, 42 + b]], "#7e829c"); K.S([[x + 5, 40 + b], [x + 6, 44 + b - h2]], 1, "#9ef0f5"); }
      K.E(cx, 40, 60, 14, K.RG(cx, 40, 2, 60, [[0, "rgba(158,240,245,0.35)"], [1, "rgba(158,240,245,0)"]]));
    } },
    vela: { w: 96, h: 118, ramps: ["ink", "storm", "cloth", "pale", "glowc", "blood", "night", "salt"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 4, W = 288, H = 354, cx = W / 2;
      // hair that is a storm: lightning tendrils
      for (let i = 0; i < 12; i++) { const a = -Math.PI * (0.08 + i * 0.075); let x = cx, y = 80 + b; const pts = [[x, y]]; for (let k = 0; k < 6; k++) { x += Math.cos(a + (K.rng() - 0.5) * 0.9) * 16; y += Math.sin(a + (K.rng() - 0.5) * 0.9) * 16; pts.push([x, y]); } K.S(pts, 4, "#4a64a0"); K.S(pts, 1.6, (i + Math.floor(ph * 6)) % 4 === 0 ? "#ffffff" : "#c8d8ff"); }
      // the habit, torn and floating, no feet
      K.P([[cx - 28, 124 + b], [cx + 28, 124 + b], [cx + 56, 290 + b], [cx + 30, 330 + b], [cx + 6, 300 + b], [cx - 16, 336 + b], [cx - 36, 300 + b], [cx - 56, 322 + b]], K.LG(cx - 56, 0, cx + 56, 0, [[0, "#141222"], [0.4, "#2a3a66"], [1, "#07060c"]]));
      for (let i = 0; i < 5; i++) K.S([[cx - 16 + i * 8, 140 + b], [cx - 40 + i * 20, 300 + b]], 1.2, "rgba(122,154,216,0.4)");
      K.P([[cx - 30, 124 + b], [cx + 30, 124 + b], [cx + 22, 160 + b], [cx - 22, 160 + b]], "#ececf2");
      // arms flung out, lightning in the hands
      for (const s of [-1, 1]) { K.S([[cx + s * 26, 132 + b], [cx + s * 70, 116 + b], [cx + s * 104, 92 + b]], 9, "#221e38"); K.S([[cx + s * 104, 92 + b], [cx + s * 112, 86 + b]], 5, "#a8a8ba");
        let x = cx + s * 112, y = 86 + b; const pts = [[x, y]]; for (let k = 0; k < 5; k++) { x += s * (6 + K.rng() * 8); y += (K.rng() - 0.3) * 22; pts.push([x, y]); } K.S(pts, 3, "#7a9ad8"); K.S(pts, 1.2, "#ffffff"); K.E(cx + s * 112, 86 + b, 10, 10, K.RG(cx + s * 112, 86 + b, 1, 12, [[0, "rgba(255,255,255,0.9)"], [1, "rgba(122,154,216,0)"]])); }
      // the face: white eyes, the mouth's stitches torn open in a scream
      K.P([[cx - 26, 110 + b], [cx - 20, 50 + b], [cx + 20, 50 + b], [cx + 26, 110 + b]], "#141222");
      K.vol(cx, 84 + b, 17, 24, ["#ececf2", "#a8a8ba", "#3a3a4a"]);
      K.eye(cx - 7, 78 + b, 4.4, "#ffffff", null); K.eye(cx + 7, 78 + b, 4.4, "#ffffff", null);
      K.E(cx, 98 + b, 7, 9, "#1e0306");
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) K.S([[cx + s * 6, 92 + b + k * 5], [cx + s * 11, 90 + b + k * 5]], 1, "#40070e");
      for (const x of [-7, 7]) K.drip(cx + x, 82 + b, 18, 1.2, "#c8d8ff");
      // rain
      for (let i = 0; i < 24; i++) { const x = K.rng() * W, y = (K.rng() * H + ph * H) % H; K.S([[x, y], [x - 2, y + 9]], 1, "rgba(200,216,255,0.5)"); }
    } },
    king: { w: 112, h: 118, ramps: ["ink", "corpse", "brine", "pale", "bone", "glowc", "gold", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, H = 354, cx = W / 2;
      // the throne: the drowned, woven together
      const body = (x, y, a, s) => { const dx = Math.cos(a) * 30 * s, dy = Math.sin(a) * 30 * s; K.S([[x - dx, y - dy], [x + dx, y + dy]], 16 * s, "#2e403a"); K.S([[x - dx, y - dy], [x + dx, y + dy]], 12 * s, "#5e7466"); K.S([[x - dx * 0.9, y - dy * 0.9 - 2], [x + dx * 0.9, y + dy * 0.9 - 2]], 4 * s, "#a4b8a6"); K.vol(x + dx * 1.15, y + dy * 1.15, 7 * s, 8 * s, ["#cad8c8", "#7e9484", "#2e403a"]); K.E(x + dx * 1.15 - 2 * s, y + dy * 1.15 - 1, 1.4 * s, 1.4 * s, ink); K.E(x + dx * 1.15 + 2 * s, y + dy * 1.15 - 1, 1.4 * s, 1.4 * s, ink); K.S([[x - dx, y - dy], [x - dx - 8 * s, y - dy + 10 * s]], 3 * s, "#a4b8a6"); };
      K.P([[cx - 162, 352], [cx - 158, 150], [cx - 120, 96], [cx - 60, 80], [cx + 60, 80], [cx + 120, 96], [cx + 158, 150], [cx + 162, 352]], K.LG(0, 80, 0, 352, [[0, "#1a4252"], [1, "#08141e"]]));
      for (let layer = 0; layer < 3; layer++) for (let i = 0; i < 16; i++) { const x = cx - 150 + K.rng() * 300, y = 120 + layer * 70 + K.rng() * 70; body(x, y, (K.rng() - 0.5) * 2.6, 1.25 + layer * 0.15); }
      for (let i = 0; i < 14; i++) { const a = K.rng() * 6.28, x = cx - 150 + K.rng() * 300, y = 110 + K.rng() * 230; K.S([[x, y], [x + Math.cos(a) * 18, y + Math.sin(a) * 18]], 4, "#7e9484"); for (let f = 0; f < 4; f++) K.S([[x + Math.cos(a) * 18, y + Math.sin(a) * 18], [x + Math.cos(a + (f - 1.5) * 0.35) * 26, y + Math.sin(a + (f - 1.5) * 0.35) * 26]], 1.4, "#a4b8a6"); }
      for (let i = 0; i < 14; i++) body(cx - 130 + i * 20, 104 + (i % 3) * 8, -1.3 + (i % 2) * 2.6, 1.0);
      K.E(cx, 250, 150, 100, "rgba(8,20,30,0.25)");
      // the figure in the middle: robes of weed, a young tired face, a crown of hands
      K.P([[cx - 44, 150], [cx + 44, 150], [cx + 60, 330], [cx - 60, 330]], K.LG(cx - 60, 0, cx + 60, 0, [[0, "#10283a"], [0.5, "#28626e"], [1, "#08141e"]]));
      for (let i = 0; i < 9; i++) K.Q([[cx - 40 + i * 10, 152], [cx - 44 + i * 11 + Math.sin(ph * 6.28 + i) * 3, 240], [cx - 42 + i * 10, 330]], 2, "rgba(108,184,184,0.4)");
      K.vol(cx, 110 + b, 26, 32, ["#ccccd8", "#848498", "#3a3a4a"]);
      K.E(cx - 10, 106 + b, 5, 3, "#3a3a4a"); K.E(cx + 10, 106 + b, 5, 3, "#3a3a4a"); K.E(cx - 10, 107 + b, 2, 1.6, "#3ee0e8"); K.E(cx + 10, 107 + b, 2, 1.6, "#3ee0e8");
      K.S([[cx - 16, 100 + b], [cx - 4, 102 + b]], 1.2, "#3a3a4a"); K.S([[cx + 16, 100 + b], [cx + 4, 102 + b]], 1.2, "#3a3a4a");
      K.S([[cx - 6, 124 + b], [cx + 6, 124 + b]], 1.6, "#3a3a4a"); K.S([[cx - 12, 112 + b], [cx - 14, 120 + b]], 1, "rgba(62,224,232,0.6)");
      for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.12 + i * 0.095), x = cx + Math.cos(a) * 26, y = 84 + b + Math.sin(a) * 18; const x2 = cx + Math.cos(a) * 44, y2 = 84 + b + Math.sin(a) * 40; K.S([[x, y], [x2, y2]], 5, "#a4b8a6"); for (let f = 0; f < 4; f++) K.S([[x2, y2], [x2 + Math.cos(a + (f - 1.5) * 0.3) * 9, y2 + Math.sin(a + (f - 1.5) * 0.3) * 9]], 1.8, "#cad8c8"); }
      // pale lights drifting up
      for (let i = 0; i < 10; i++) { const x = cx - 150 + i * 32, y = 340 - ((ph * 200 + i * 37) % 300); K.E(x, y, 3, 3, K.RG(x, y, 0, 4, [[0, "rgba(158,240,245,0.9)"], [1, "rgba(62,224,232,0)"]])); }
    } },
    corvin: { w: 104, h: 118, ramps: ["ink", "gold", "bone", "cloth", "blood", "pale", "paper", "glowy"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 1.5, W = 312, H = 354, cx = W / 2;
      // the seat: a hill of coins and ledgers
      for (let i = 0; i < 90; i++) { const x = cx - 150 + K.rng() * 300, y = 270 + K.rng() * 80 - Math.abs(x - cx) * 0.3; K.vol(x, y, 6, 4, ["#f6e07a", "#b08a28", "#5a3c0e"]); }
      for (let i = 0; i < 6; i++) { const x = cx - 140 + i * 52, y = 300 + (i % 2) * 20; K.P([[x, y], [x + 34, y - 6], [x + 36, y + 14], [x + 2, y + 20]], "#523828"); K.P([[x + 2, y + 2], [x + 32, y - 3], [x + 33, y + 10], [x + 4, y + 15]], "#ddd4b0"); }
      // the robe of office, heavy with chains
      K.P([[cx - 50, 120], [cx + 50, 120], [cx + 80, 290], [cx - 80, 290]], K.LG(cx - 80, 0, cx + 80, 0, [[0, "#141222"], [0.5, "#463e6e"], [1, "#07060c"]]));
      K.P([[cx - 50, 120], [cx + 50, 120], [cx + 46, 150], [cx - 46, 150]], "#6a0c18");
      for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const a = Math.PI * (0.1 + i * 0.07), x = cx - Math.cos(a) * (60 + r * 10), y = 134 + Math.sin(a) * (30 + r * 14); K.vol(x, y, 4, 3, ["#f6e07a", "#b08a28", "#5a3c0e"]); }
      K.vol(cx, 196, 14, 14, ["#f6e07a", "#d8b440", "#5a3c0e"]); K.S([[cx - 6, 196], [cx + 6, 196]], 2, "#5a3c0e");
      // arms: one weighs coins on scales, the other clutches a ledger
      K.S([[cx - 48, 130], [cx - 84, 184], [cx - 92, 226]], 12, "#332c52"); K.S([[cx - 92, 226], [cx - 96, 240]], 7, "#c8bca2");
      K.S([[cx - 96, 240], [cx - 96, 286]], 2, "#b08a28"); K.S([[cx - 130, 250], [cx - 62, 250]], 2.4, "#b08a28");
      for (const x of [-130, -62]) { K.S([[cx + x, 250], [cx + x - 10, 272], [cx + x + 10, 272], [cx + x, 250]], 1, "#86621a"); K.E(cx + x, 272, 12, 4, "#b08a28"); }
      K.vol(cx - 130, 266, 6, 4, ["#f6e07a", "#b08a28", "#5a3c0e"]);
      K.S([[cx + 48, 130], [cx + 80, 180], [cx + 76, 224]], 12, "#332c52"); K.P([[cx + 58, 216], [cx + 100, 206], [cx + 106, 250], [cx + 62, 258]], "#523828"); K.P([[cx + 62, 218], [cx + 98, 210], [cx + 102, 246], [cx + 66, 252]], "#ddd4b0");
      for (let f = 0; f < 4; f++) K.S([[cx + 70 + f * 8, 212], [cx + 72 + f * 8, 226]], 3, "#c8bca2");
      // the head: a mummified face behind a cracked gold mask, and a mitre of office
      K.vol(cx, 90 + b, 26, 32, ["#c8bca2", "#766a58", "#2e1e06"]);
      K.P([[cx - 22, 70 + b], [cx + 22, 70 + b], [cx + 20, 104 + b], [cx, 114 + b], [cx - 20, 104 + b]], K.LG(cx - 22, 0, cx + 22, 0, [[0, "#86621a"], [0.4, "#f6e07a"], [1, "#5a3c0e"]]));
      K.crack(cx + 8, 72 + b, 36, 1.7, "#2e1e06", 1.6); K.P([[cx + 6, 76 + b], [cx + 22, 70 + b], [cx + 20, 96 + b]], "#766a58");
      K.E(cx - 9, 86 + b, 5, 3, ink); K.E(cx + 11, 86 + b, 5, 3, ink); K.E(cx + 11, 86 + b, 1.6, 1.6, "#ffcf4a");
      K.R(cx - 8, 100 + b, 16, 2.4, ink);
      K.P([[cx - 26, 66 + b], [cx + 26, 66 + b], [cx + 16, 14 + b], [cx, 2 + b], [cx - 16, 14 + b]], K.LG(0, 2, 0, 66, [[0, "#f6e07a"], [1, "#86621a"]])); K.S([[cx, 6 + b], [cx, 62 + b]], 2, "#6a0c18"); K.S([[cx - 20, 40 + b], [cx + 20, 40 + b]], 2, "#6a0c18");
    } },
    ledgertree: { w: 112, h: 118, ramps: ["ink", "wood", "paper", "blood", "pale", "rot", "glowr", "bone"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, H = 354, cx = W / 2;
      // roots: debtors, bound and grown into the wood
      for (let i = 0; i < 7; i++) { const x0 = cx - 30 + i * 10, x1 = cx - 150 + i * 50; K.Q([[x0, 280], [(x0 + x1) / 2, 300], [x1, 344]], 10, "#3a2616"); K.Q([[x0, 280], [(x0 + x1) / 2, 300], [x1, 344]], 4, "#58391e"); }
      for (const [x, y, a] of [[cx - 110, 318, -0.4], [cx + 96, 322, 0.5], [cx - 40, 334, 0.1]]) { K.vol(x, y - 12, 7, 8, ["#ccccd8", "#848498", "#3a3a4a"]); K.S([[x, y - 4], [x + Math.sin(a) * 6, y + 20]], 8, "#848498"); K.S([[x - 10, y + 4], [x + 10, y + 12]], 3, "#3a2616"); K.E(x - 2, y - 13, 1.4, 1.4, ink); K.E(x + 3, y - 13, 1.4, 1.4, ink); K.E(x, y - 8, 2, 2.6, ink); }
      // the trunk: ledgers stacked and fused, bark of paper
      for (let i = 0; i < 12; i++) { const y = 280 - i * 18, w2 = 44 - i * 1.2 + Math.sin(i * 1.7) * 6, x = cx + Math.sin(i * 0.9) * 8; K.P([[x - w2, y], [x + w2, y - 4], [x + w2 + 2, y - 18], [x - w2 + 2, y - 16]], i % 2 ? "#58391e" : "#3a2616"); K.P([[x - w2 + 4, y - 3], [x + w2 - 2, y - 7], [x + w2 - 1, y - 14], [x - w2 + 5, y - 11]], i % 3 === 0 ? "#bab08e" : "#948a70"); for (let l = 0; l < 3; l++) K.S([[x - w2 + 8, y - 5 - l * 3], [x + w2 - 6, y - 8 - l * 3]], 0.6, "#6a6250"); }
      // the face in the trunk: an open ledger for a mouth
      K.E(cx - 14, 170, 8, 6, ink); K.E(cx + 14, 170, 8, 6, ink); K.eye(cx - 14, 170, 3, "#ff2d2d", null); K.eye(cx + 14, 170, 3, "#ff2d2d", null);
      K.P([[cx - 22, 196], [cx + 22, 196], [cx + 16, 214 + b], [cx - 16, 214 + b]], "#1e0306"); K.teeth(cx - 20, 196, 8, 4, 5, "#ddd4b0");
      // branches, and what hangs from them
      const br = (x0, y0, x1, y1, w2) => { K.Q([[x0, y0], [(x0 + x1) / 2, Math.min(y0, y1) - 20], [x1, y1]], w2, "#3a2616"); K.Q([[x0, y0], [(x0 + x1) / 2, Math.min(y0, y1) - 20], [x1, y1]], w2 * 0.4, "#58391e"); };
      br(cx, 90, cx - 150, 70, 12); br(cx, 90, cx + 150, 64, 12); br(cx - 10, 96, cx - 90, 20, 8); br(cx + 10, 96, cx + 96, 18, 8); br(cx, 92, cx + 4, 6, 8);
      K.E(cx, 60, 150, 56, "rgba(26,16,10,0.6)");
      for (let i = 0; i < 16; i++) { const x = cx - 140 + K.rng() * 280, y = 36 + K.rng() * 60; K.E(x, y, 14 + K.rng() * 10, 9 + K.rng() * 6, i % 2 ? "#4a1418" : "#3a1a14"); }
      for (let i = 0; i < 12; i++) { const x = cx - 130 + i * 24, y = 70 + (i % 3) * 12, L = 16 + (i % 4) * 8 + Math.sin(ph * 6.28 + i) * 3; K.S([[x, y], [x, y + L]], 1, "#76381a"); if (i % 3 === 1) { K.vol(x, y + L + 8, 6, 8, ["#ccccd8", "#848498", "#3a3a4a"]); K.S([[x, y + L + 14], [x, y + L + 30]], 5, "#848498"); } else { K.P([[x - 6, y + L], [x + 6, y + L], [x + 6, y + L + 14], [x - 6, y + L + 14]], "#ddd4b0"); K.S([[x - 4, y + L + 5], [x + 4, y + L + 5]], 0.8, "#9a1224"); } }
      for (let i = 0; i < 9; i++) { const x = cx - 120 + K.rng() * 240, y = 30 + K.rng() * 50; K.eye(x, y, 2.4, "#ff2d2d", null); }
    } },
    wyrm: { w: 112, h: 96, ramps: ["ink", "salt", "pale", "bone", "blood", "glowc"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2), W = 336, H = 288, cx = W / 2;
      // the coils: plates of salt crystal, segment by segment
      const pts = []; for (let i = 0; i <= 26; i++) { const t2 = i / 26; pts.push([cx + 130 - t2 * 250 + Math.sin(t2 * 9 + ph * 6.28) * 18, 262 - t2 * 150 - Math.sin(t2 * 5) * 26]); }
      for (let i = pts.length - 1; i >= 0; i--) { const [x, y] = pts[i], r = 14 + i * 0.8; K.vol(x, y, r * 1.1, r, ["#e8ecf8", "#a6aac2", "#565a74"]); K.P([[x - r * 0.6, y - r * 0.6], [x, y - r * 1.5], [x + r * 0.6, y - r * 0.6]], "#cacee0"); K.P([[x, y - r * 1.5], [x + r * 0.6, y - r * 0.6], [x, y - r * 0.6]], "#7e829c"); if (i % 3 === 0) K.crack(x - r * 0.5, y, r, 0.3, "#565a74"); }
      // the head: a skull of salt, horns of crystal, the jaw open
      const [hx, hy] = pts[pts.length - 1];
      K.vol(hx + 6, hy - 30 + b * 3, 46, 36, ["#ffffff", "#cacee0", "#7e829c"]);
      for (const s of [-1, 1]) { K.P([[hx + 6 + s * 20, hy - 56 + b * 3], [hx + 6 + s * 44, hy - 118 + b * 3], [hx + 6 + s * 34, hy - 52 + b * 3]], "#cacee0"); K.P([[hx + 6 + s * 44, hy - 118 + b * 3], [hx + 6 + s * 34, hy - 52 + b * 3], [hx + 6 + s * 28, hy - 60 + b * 3]], "#7e829c"); K.S([[hx + 6 + s * 26, hy - 60 + b * 3], [hx + 6 + s * 42, hy - 110 + b * 3]], 1, "#9ef0f5"); }
      for (const s of [-1, 1]) { K.E(hx + 6 + s * 16, hy - 36 + b * 3, 10, 8, ink); K.eye(hx + 6 + s * 16, hy - 36 + b * 3, 4, "#3ee0e8", null); }
      K.P([[hx - 30, hy - 14 + b * 3], [hx + 42, hy - 14 + b * 3], [hx + 34, hy + 22 + b * 6], [hx - 22, hy + 22 + b * 6]], "#1e0306");
      K.teeth(hx - 28, hy - 14 + b * 3, 12, 5, 12, "#e8e0cc"); K.teeth(hx - 20, hy + 20 + b * 6, 10, 5, -10, "#c8bca2");
      K.E(hx + 6, hy + 8 + b * 4, 14, 6, "#9a1224");
    } },
  };
  BOSS_ART.tollkeeper = { ...BOSS_ART.quill, variant: "tollkeeper" };
  // ---- boss paintings, second pass: the two that borrowed a body, and fuller versions of the Colossus and the Ledger Tree
  Object.assign(BOSS_ART, {
    angler: { w: 124, h: 96, ramps: ["ink", "brine", "corpse", "bone", "blood", "glowc", "rust", "night"], paint(K, ph) {
      const b = Math.sin(ph * Math.PI * 2) * 3, W = 372, H = 288, cx = 158;
      // The Old Mouth: an angler older than the lake, barnacled, three lures, the teeth full of what it caught
      const lures = [[cx - 110, 34], [cx - 40, 14], [cx + 30, 30]];
      lures.forEach(([lx0, ly0], i) => { const lx = lx0 + Math.sin(ph * Math.PI * 2 + i * 2) * 10, ly = ly0 + b; K.Q([[cx - 40 + i * 30, 110], [lx0 + 20, ly0 + 40], [lx, ly]], 3, "#28626e"); K.E(lx, ly, 18, 18, K.RG(lx, ly, 1, 18, [[0, "rgba(255,255,255,0.95)"], [0.4, "rgba(158,240,245,0.7)"], [1, "rgba(62,224,232,0)"]])); K.E(lx, ly, 5, 5, "#ffffff"); });
      K.vol(cx + 20, 176 + b, 150, 96, ["#28626e", "#10283a", "#08141e"]);
      K.dots(120, cx - 120, 100, cx + 160, 260, "rgba(108,184,184,0.3)", 1.3);
      for (let i = 0; i < 40; i++) { const a = K.rng() * 6.28, r = 60 + K.rng() * 70, x = cx + 40 + Math.cos(a) * r * 1.3, y = 170 + Math.sin(a) * r * 0.75; K.vol(x, y, 4, 4, ["#e8e0cc", "#a2957c", "#4a4238"]); K.E(x, y - 1, 1.2, 1.2, ink); }
      for (let i = 0; i < 5; i++) K.Q([[cx + 70 + i * 16, 110], [cx + 80 + i * 18, 170], [cx + 72 + i * 16, 250]], 3, "#1a4252");
      // the jaw: most of the body, hinged open
      K.P([[cx - 150, 172 + b], [cx + 60, 96 + b], [cx + 70, 248 + b]], "#1e0306");
      for (let i = 0; i < 12; i++) { const t2 = i / 11, x = cx - 140 + t2 * 190, y0 = 172 + b - t2 * 72, y1 = 172 + b + t2 * 72; K.P([[x, y0], [x + 11, y0 - 3], [x + 6, y0 + 22 + (i % 3) * 8]], "#e8e0cc"); K.P([[x, y1], [x + 11, y1 + 3], [x + 6, y1 - 20 - (i % 2) * 8]], "#c8bca2"); }
      K.vol(cx - 40, 182 + b, 10, 12, ["#e8e0cc", "#a2957c", "#4a4238"]); K.E(cx - 44, 180 + b, 2.4, 3, ink); K.E(cx - 36, 180 + b, 2.4, 3, ink);
      K.S([[cx - 10, 150 + b], [cx + 10, 200 + b]], 3, "#4e2410"); K.Q([[cx + 10, 200 + b], [cx + 18, 210 + b], [cx + 10, 216 + b]], 3, "#76381a");
      K.eye(cx + 60, 120 + b, 11, "#9ef0f5", ink); K.E(cx + 60, 120 + b, 16, 16, "rgba(158,240,245,0.15)");
      for (const s of [-1, 1]) K.Q([[cx + 168, 176 + b], [cx + 196, 176 + b + s * 30], [cx + 184, 176 + b + s * 60]], 7, "#1a4252");
      for (let i = 0; i < 6; i++) K.drip(cx - 100 + i * 34, 240 + b, 8 + K.rng() * 10, 1.6, "#3f8a90");
    } },
    houndg: { w: 100, h: 60, ramps: ["ink", "blood", "gold", "rust", "bone", "leather", "glowr", "cloth"], paint(K, ph) {
      const run = Math.sin(ph * Math.PI * 2), W = 300, H = 180, cx = 132;
      // the Guild Hound: a jackal bred for the gate, in plate and a brass muzzle, dragging its own chain
      for (const [x, d] of [[62, 1], [92, -1], [166, 1], [192, -1]]) { const sw = run * d * 9; K.S([[x, 110], [x + sw * 0.4, 140], [x + sw, 168]], 11, "#6a0c18"); K.S([[x, 112], [x + sw * 0.4, 140]], 4, "#c8182e"); K.P([[x + sw - 8, 164], [x + sw + 10, 164], [x + sw + 8, 174], [x + sw - 6, 174]], "#2e1e06"); }
      K.vol(cx, 100, 86, 38, ["#ee3a46", "#9a1224", "#1e0306"]);
      for (let i = 0; i < 9; i++) K.Q([[cx - 64 + i * 15, 76], [cx - 58 + i * 15, 100], [cx - 64 + i * 15, 124]], 3, "#e8e0cc");
      // plates of Guild armour riveted straight into the flesh
      for (let i = 0; i < 4; i++) { const x = cx - 70 + i * 34; K.P([[x, 66], [x + 34, 62], [x + 36, 92], [x + 2, 96]], K.LG(x, 62, x + 36, 96, [[0, "#f6e07a"], [0.5, "#b08a28"], [1, "#2e1e06"]])); K.E(x + 6, 70, 2, 2, "#2e1e06"); K.E(x + 30, 68, 2, 2, "#2e1e06"); K.drip(x + 18, 94, 8, 1.4, "#9a1224"); }
      K.Q([[cx - 84, 94], [cx - 116, 70 + run * 6], [cx - 124, 44]], 7, "#9a1224"); for (let i = 0; i < 5; i++) K.E(cx - 90 - i * 7, 88 - i * 9 + run, 3, 3, "#c8bca2");
      // the chain from its collar, links dragging behind
      for (let i = 0; i < 12; i++) { const x = cx - 40 - i * 10, y = 132 + Math.sin(i * 0.8 + ph * 6.28) * 3 + i * 2.6; K.S([[x - 4, y - 3], [x + 4, y + 3]], 3, i % 2 ? "#76381a" : "#9a5226"); }
      // head: bare skull under a brass muzzle cage, one eye burning
      K.vol(cx + 96, 64, 28, 24, ["#e8e0cc", "#a2957c", "#4a4238"]);
      K.P([[cx + 100, 72], [cx + 150, 76], [cx + 146, 92], [cx + 98, 90]], "#c8bca2"); K.teeth(cx + 104, 76, 9, 4, 7, "#ffffff"); K.teeth(cx + 102, 90, 8, 4, -6, "#e8e0cc");
      for (let i = 0; i < 5; i++) K.S([[cx + 102 + i * 11, 66], [cx + 100 + i * 11, 98]], 2.2, "#d8b440"); K.S([[cx + 96, 70], [cx + 152, 74]], 2.4, "#b08a28"); K.S([[cx + 96, 94], [cx + 150, 96]], 2.4, "#b08a28");
      K.E(cx + 86, 58, 7, 6, ink); K.eye(cx + 86, 58, 3.4, "#ff2d2d", null);
      K.P([[cx + 72, 44], [cx + 80, 20], [cx + 88, 46]], "#766a58"); K.P([[cx + 94, 40], [cx + 104, 18], [cx + 108, 44]], "#766a58");
      K.S([[cx + 70, 84], [cx + 86, 104]], 9, "#b08a28"); K.vol(cx + 76, 96, 5, 5, ["#f6e07a", "#b08a28", "#2e1e06"]);
      K.drip(cx + 128, 98, 16, 2, "#9a1224");
    } },
  });
  // the Colossus: salt grown, not stacked; cracks bleeding brine, the Choir's faces pushing out of it
  BOSS_ART.colossus.paint = function (K, ph) {
    const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, H = 354, cx = 168;
    const salt = (x, y, rx, ry, rot = 0) => K.vol(x, y, rx, ry, ["#ffffff", "#a6aac2", "#565a74"], rot);
    const crys = (x, y, h2, a) => { const w2 = h2 * 0.3, tip = [x + Math.cos(a) * h2, y + Math.sin(a) * h2], l = [x + Math.cos(a - 1.57) * w2, y + Math.sin(a - 1.57) * w2], r = [x + Math.cos(a + 1.57) * w2, y + Math.sin(a + 1.57) * w2]; K.P([l, tip, r], "#cacee0"); K.P([l, tip, [x, y]], "#ffffff"); K.P([r, tip, [x, y]], "#7e829c"); };
    for (const s of [-1, 1]) { salt(cx + s * 44, 300, 30, 50, s * 0.1); salt(cx + s * 48, 340, 38, 14); }
    salt(cx, 180, 104, 112);
    for (const s of [-1, 1]) { salt(cx + s * 112, 150, 34, 52, s * 0.4); salt(cx + s * 126, 236, 30, 56, s * 0.15); salt(cx + s * 128, 296, 34, 24); for (let f = 0; f < 3; f++) crys(cx + s * (116 + f * 12), 312, 20, 1.57 + s * 0.2); }
    for (let i = 0; i < 16; i++) K.crack(cx - 90 + K.rng() * 180, 90 + K.rng() * 180, 28 + K.rng() * 30, K.rng() * 6.28, "#565a74", 1.6);
    for (let i = 0; i < 6; i++) { const x = cx - 80 + K.rng() * 160, y = 110 + K.rng() * 140; K.crack(x, y, 26, 1.4, "#6a0c18", 2); K.drip(x + 2, y + 18, 16 + K.rng() * 12, 1.6, "#9a1224"); }
    // faces pressing out of the salt, mouths open on the note that holds it together
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4 - (r % 2); q++) { const x = cx - 66 + q * 44 + (r % 2) * 22, y = 132 + r * 44; K.vol(x, y, 15, 17, ["#ececf2", "#a8a8ba", "#5e5e70"]); K.E(x - 5, y - 4, 3, 3.6, ink); K.E(x + 5, y - 4, 3, 3.6, ink); K.E(x, y + 7, 4, 6 + Math.sin(ph * 6.28 + r * 2 + q) * 2, ink); K.Q([[x - 16, y - 12], [x, y - 20], [x + 16, y - 12]], 2.4, "#848498"); }
    // the head: a crystal skull, a crown of spears of salt
    salt(cx, 64 + b, 40, 38);
    K.E(cx - 15, 62 + b, 9, 10, ink); K.E(cx + 15, 62 + b, 9, 10, ink); K.eye(cx - 15, 62 + b, 5, "#3ee0e8", null); K.eye(cx + 15, 62 + b, 5, "#3ee0e8", null);
    K.P([[cx - 20, 84 + b], [cx + 20, 84 + b], [cx + 14, 98 + b], [cx - 14, 98 + b]], ink); K.teeth(cx - 18, 84 + b, 8, 4, 8, "#ffffff");
    for (let i = 0; i < 9; i++) crys(cx - 36 + i * 9, 36 + b, 24 + (i % 3) * 14 + (i === 4 ? 26 : 0), -1.57 + (i - 4) * 0.14);
    for (const [x, y, h2, a] of [[cx - 96, 104, 40, -2.4], [cx + 96, 104, 44, -0.7], [cx - 60, 110, 26, -2.0], [cx + 64, 112, 28, -1.1]]) crys(x, y, h2, a);
    K.E(cx, 30, 70, 20, K.RG(cx, 30, 2, 70, [[0, "rgba(158,240,245,0.3)"], [1, "rgba(158,240,245,0)"]]));
  };
  // the Ledger Tree: a real crown of gnarled branches, leaves of paper, the hanged debtors, a face in the trunk
  BOSS_ART.ledgertree.paint = function (K, ph) {
    const b = Math.sin(ph * Math.PI * 2) * 2, W = 336, H = 354, cx = 168;
    for (let i = 0; i < 8; i++) { const x0 = cx - 34 + i * 10, x1 = cx - 160 + i * 46; K.Q([[x0, 286], [(x0 + x1) / 2, 306], [x1, 350]], 11, "#1e140c"); K.Q([[x0, 286], [(x0 + x1) / 2, 306], [x1, 350]], 5, "#58391e"); }
    for (const [x, y] of [[cx - 118, 326], [cx + 104, 330], [cx - 44, 340], [cx + 36, 344]]) { K.vol(x, y - 14, 8, 9, ["#ccccd8", "#848498", "#3a3a4a"]); K.S([[x, y - 5], [x + 2, y + 14]], 9, "#848498"); K.S([[x - 12, y + 2], [x + 12, y + 10]], 4, "#3a2616"); K.E(x - 3, y - 15, 1.6, 1.6, ink); K.E(x + 3, y - 15, 1.6, 1.6, ink); K.E(x, y - 9, 2.4, 3, ink); }
    // trunk: bark of ledger spines, twisted
    K.P([[cx - 48, 292], [cx + 48, 292], [cx + 34, 180], [cx + 24, 90], [cx - 24, 90], [cx - 34, 180]], K.LG(cx - 48, 0, cx + 48, 0, [[0, "#1e140c"], [0.35, "#58391e"], [0.6, "#78502a"], [1, "#1e140c"]]));
    for (let i = 0; i < 14; i++) { const y = 282 - i * 14; K.Q([[cx - 44 + i * 1.4, y], [cx, y - 6 + Math.sin(i) * 4], [cx + 44 - i * 1.4, y]], 2, i % 3 === 0 ? "#bab08e" : "#3a2616"); }
    for (let i = 0; i < 10; i++) K.P([[cx - 36 + K.rng() * 60, 120 + K.rng() * 150], [cx - 26 + K.rng() * 60, 118 + K.rng() * 150], [cx - 28 + K.rng() * 60, 132 + K.rng() * 150]], "#ddd4b0");
    K.E(cx - 15, 176, 9, 7, ink); K.E(cx + 15, 176, 9, 7, ink); K.eye(cx - 15, 176, 3.4, "#ff2d2d", null); K.eye(cx + 15, 176, 3.4, "#ff2d2d", null);
    K.P([[cx - 24, 204], [cx + 24, 204], [cx + 18, 228 + b], [cx - 18, 228 + b]], "#1e0306"); K.teeth(cx - 22, 204, 9, 4, 7, "#ddd4b0"); K.teeth(cx - 18, 226 + b, 8, 4, -6, "#bab08e");
    // branches reaching out like arms, knuckled and forked
    const br = (x0, y0, x1, y1, w2, d) => { const mx = (x0 + x1) / 2 + d * 20, my = Math.min(y0, y1) - 18; K.Q([[x0, y0], [mx, my], [x1, y1]], w2, "#1e140c"); K.Q([[x0, y0], [mx, my], [x1, y1]], w2 * 0.45, "#58391e"); return [x1, y1]; };
    const tips = [];
    for (const [x1, y1, w2, d] of [[cx - 150, 64, 14, -1], [cx + 150, 58, 14, 1], [cx - 100, 18, 10, -1], [cx + 104, 14, 10, 1], [cx - 30, 4, 9, 0], [cx + 40, 8, 9, 0]]) { const t = br(cx, 104, x1, y1, w2, d); tips.push(t); br(t[0], t[1], t[0] + d * 22 + 10, t[1] - 16, 4, d); br(t[0], t[1], t[0] + d * 26 - 8, t[1] + 14, 4, d); }
    // leaves of paper in clusters, with red ink bleeding through
    for (let i = 0; i < 60; i++) { const [tx, ty] = tips[i % tips.length], x = tx + (K.rng() - 0.5) * 70, y = ty + (K.rng() - 0.5) * 44; const a = K.rng() * 6.28; K.P([[x, y], [x + Math.cos(a) * 8, y + Math.sin(a) * 8], [x + Math.cos(a + 0.9) * 9, y + Math.sin(a + 0.9) * 9]], i % 4 === 0 ? "#948a70" : "#ddd4b0"); if (i % 5 === 0) K.E(x + 2, y + 2, 1.6, 1.6, "#9a1224"); }
    // the hanged: debtors on ropes of red tape, and pages turning on threads
    for (let i = 0; i < 10; i++) { const x = cx - 140 + i * 31, y = 64 + (i % 3) * 10, L = 18 + (i % 4) * 8 + Math.sin(ph * 6.28 + i) * 3; K.S([[x, y], [x, y + L]], 1.2, "#9a1224"); if (i % 3 === 1) { K.vol(x, y + L + 8, 6, 8, ["#ccccd8", "#848498", "#3a3a4a"]); K.S([[x, y + L + 14], [x, y + L + 34]], 6, "#848498"); K.S([[x - 6, y + L + 18], [x + 6, y + L + 18]], 3, "#848498"); } else { K.P([[x - 6, y + L], [x + 6, y + L], [x + 6, y + L + 14], [x - 6, y + L + 14]], "#ddd4b0"); K.S([[x - 4, y + L + 5], [x + 4, y + L + 5]], 0.8, "#9a1224"); } }
    for (let i = 0; i < 8; i++) { const [tx, ty] = tips[i % tips.length]; K.eye(tx + (K.rng() - 0.5) * 40, ty + (K.rng() - 0.5) * 24, 2.6, "#ff2d2d", null); }
  };


