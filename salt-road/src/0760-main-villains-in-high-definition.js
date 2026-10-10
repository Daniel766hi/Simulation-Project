  // ================================================================== MAIN VILLAINS IN HIGH DEFINITION
  // The story's villains are painted at eight times the picture's density (nearly three times the other bosses) and keep
  // their painted gradients instead of being reduced to a palette: smooth curves, lit tubes for limbs and tentacles,
  // wet eyes and mouths, rim light and film grain. Each keeps its battle size, so every layout still fits.
  const HD_D = 8, HD_S = HD_D / 4;   // canvas pixels per picture pixel; painters draw in units of a quarter pixel
  function crPath(c, pts, closed) {
    const n = pts.length; if (n < 2) return; c.moveTo(pts[0][0], pts[0][1]);
    const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0, segs = closed ? n : n - 1; i < segs; i++) { const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
    if (closed) c.closePath();
  }
  function hdKit(c, K) {
    const rng = K.rng, X = Object.assign({}, K);
    const alpha = (a, fn) => { const o = c.globalAlpha; c.globalAlpha = o * a; fn(); c.globalAlpha = o; };
    Object.assign(X, {
      c, alpha,
      shape(pts, f) { c.fillStyle = f; c.beginPath(); crPath(c, pts, true); c.fill(); },
      line(pts, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); crPath(c, pts, false); c.stroke(); },
      glow(x, y, r, col, a = 1) { c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = a; K.E(x, y, r, r, K.RG(x, y, 0, r, [[0, col], [1, "rgba(0,0,0,0)"]])); c.restore(); },
      blob(x, y, r, n, jag, f, sq = 1) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (1 - jag / 2 + rng() * jag); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * sq]); } X.shape(pts, f); },
      tube(pts, w0, w1, [hi, mid, lo]) {
        const n = pts.length, L = [], R = [], side = [];
        for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
          let nx = -dy / l, ny = dx / l; const w = w0 + (w1 - w0) * i / Math.max(1, n - 1); L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
          if (nx + ny > 0) { nx = -nx; ny = -ny; } side.push([nx, ny, w]); }
        X.shape(L.concat(R.reverse()), mid);
        const off = (k, sgn) => pts.map((p, i) => [p[0] + side[i][0] * side[i][2] * k * sgn, p[1] + side[i][1] * side[i][2] * k * sgn]);
        for (const [k, wk, a] of [[0.62, 0.34, 0.22], [0.55, 0.24, 0.24], [0.5, 0.14, 0.28]]) alpha(a, () => X.line(off(k, -1), (w0 + w1) * wk, lo));
        for (const [k, wk, a] of [[0.3, 0.3, 0.14], [0.4, 0.18, 0.2], [0.45, 0.08, 0.3]]) alpha(a, () => X.line(off(k, 1), (w0 + w1) * wk, hi));
      },
      eyeHD(x, y, r, iris, o = {}) {
        K.E(x, y, r * 1.3, r * 1.1, "rgba(18,4,8,0.7)");
        K.E(x, y, r, r * 0.82, K.RG(x - r * 0.3, y - r * 0.3, 0, r * 1.3, [[0, o.milk || "#fffaf0"], [0.7, o.milk ? "#9aa8a0" : "#e6d6c6"], [1, "#6a4a48"]]));
        if (o.blood) for (let i = 0; i < 6; i++) { const a = rng() * Math.PI * 2; K.S([[x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.78], [x + Math.cos(a + 0.3) * r * 0.55, y + Math.sin(a + 0.2) * r * 0.45]], Math.max(0.6, r * 0.05), "rgba(170,20,30,0.8)"); }
        const lk = o.look || [0, 0], ix = x + lk[0] * r * 0.3, iy = y + lk[1] * r * 0.25, ir = r * (o.iris || 0.55);
        if (iris) K.E(ix, iy, ir, ir, K.RG(ix, iy, 0, ir, [[0, o.core || iris], [0.65, iris], [1, "#050305"]]));
        if (!o.noPupil) o.slit ? K.E(ix, iy, ir * 0.2, ir * 0.85, "#000") : K.E(ix, iy, ir * 0.4, ir * 0.4, "#000");
        K.E(ix - ir * 0.35, iy - ir * 0.38, ir * 0.22, ir * 0.17, "rgba(255,255,255,0.95)");
        if (o.glow) X.glow(ix, iy, r * 2.4, o.glow, 0.8);
        if (o.lid) { K.P([[x - r * 1.1, y - r * 0.9], [x + r * 1.1, y - r * 0.9], [x + r * 1.05, y - r * 0.82 + r * o.lid * 1.4], [x - r * 1.05, y - r * 0.82 + r * o.lid * 1.2]], o.lidCol || "#3a2226"); }
      },
      mouth(x, y, w, h, o = {}) {
        K.E(x, y, w * 1.1, h * 1.14, o.lip || "#4a1a22");
        K.E(x, y, w, h, K.RG(x, y - h * 0.3, 0, Math.max(w, h), [[0, "#3a0810"], [0.6, "#160205"], [1, "#040002"]]));
        if (o.tongue) K.E(x + w * 0.1, y + h * 0.5, w * 0.55, h * 0.38, K.RG(x, y + h * 0.4, 0, w * 0.6, [[0, "#d26a78"], [1, "#6a1a2a"]]));
        const nt = o.teeth || 10, long = o.long || 1, col = o.toothCol || "#ece2c6";
        for (const top of [1, -1]) for (let i = 0; i < nt; i++) {
          const a = top > 0 ? -Math.PI + 0.35 + (Math.PI - 0.7) * (i + 0.5) / nt : 0.35 + (Math.PI - 0.7) * (i + 0.5) / nt;
          const px = x + Math.cos(a) * w * 0.96, py = y + Math.sin(a) * h * 0.96, tw = w * 1.5 / nt, len = h * (0.28 + rng() * 0.3) * long;
          const tx = px + (x - px) * 0.12, ty = py + top * len;
          K.P([[px - tw / 2, py], [px + tw / 2, py], [tx, ty]], K.LG(px, py, tx, ty, [[0, "#8a7a60"], [0.25, col], [1, "#fffaf0"]]));
        }
        if (o.drool) for (let i = 0; i < o.drool; i++) { const dx = x + (rng() - 0.5) * w * 1.4; K.drip(dx, y + h * 0.9, h * (0.5 + rng()), Math.max(1, w * 0.04), o.droolCol || "rgba(200,220,210,0.55)"); }
      },
      veins(x, y, len, ang, depth, col, w) { if (depth <= 0 || len < 2) return; const pts = [[x, y]]; let a = ang, px = x, py = y;
        for (let i = 0; i < 4; i++) { a += (rng() - 0.5) * 0.8; px += Math.cos(a) * len / 4; py += Math.sin(a) * len / 4; pts.push([px, py]); }
        X.line(pts, w, col); X.veins(px, py, len * 0.62, a + 0.5, depth - 1, col, w * 0.7); if (rng() < 0.7) X.veins(pts[2][0], pts[2][1], len * 0.5, a - 0.6, depth - 1, col, w * 0.6); },
      chain(pts, s, col, hi = "#b8b0a8") { let acc = 0, k = 0;
        for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
          for (; acc < L; acc += s * 0.95, k++) { const x = x0 + (x1 - x0) * acc / L, y = y0 + (y1 - y0) * acc / L;
            if (k % 2) K.E(x, y, s * 0.62, s * 0.16, col, a); else { c.strokeStyle = col; c.lineWidth = s * 0.2; c.beginPath(); c.ellipse(x, y, s * 0.6, s * 0.34, a, 0, Math.PI * 2); c.stroke(); c.strokeStyle = hi; c.lineWidth = s * 0.07; c.beginPath(); c.ellipse(x, y, s * 0.6, s * 0.34, a, Math.PI, Math.PI * 1.6); c.stroke(); } }
          acc -= L; } },
      crystal(x, y, len, ang, w, [hi, mid, lo]) { const tx = x + Math.cos(ang) * len, ty = y + Math.sin(ang) * len, nx = -Math.sin(ang) * w, ny = Math.cos(ang) * w;
        const mx = x + Math.cos(ang) * len * 0.15, my = y + Math.sin(ang) * len * 0.15;
        K.P([[x + nx, y + ny], [mx + nx * 0.9, my + ny * 0.9], [tx, ty], [mx, my]], lo); K.P([[x - nx, y - ny], [mx - nx * 0.9, my - ny * 0.9], [tx, ty], [mx, my]], mid);
        K.S([[mx, my], [tx, ty]], Math.max(0.8, w * 0.12), hi); alpha(0.5, () => K.S([[mx - nx * 0.6, my - ny * 0.6], [tx, ty]], Math.max(0.6, w * 0.08), "#ffffff")); },
      coin(x, y, r, rot = 0) { K.E(x, y, r, r * 0.8, "#5a3c0e", rot); K.E(x - r * 0.08, y - r * 0.08, r * 0.86, r * 0.68, K.RG(x - r * 0.3, y - r * 0.3, 0, r, [[0, "#fff0a0"], [0.5, "#d8b440"], [1, "#86621a"]]), rot); K.E(x, y, r * 0.4, r * 0.3, "rgba(90,60,14,0.5)", rot); },
      page(x, y, w, h, rot, col = "#e8dfc2", ink2 = "rgba(120,20,30,0.7)") { c.save(); c.translate(x, y); c.rotate(rot); K.R(-w / 2, -h / 2, w, h, col); K.R(-w / 2, -h / 2, w, h * 0.08, "rgba(0,0,0,0.12)");
        for (let i = 1; i < 7; i++) K.R(-w * 0.38, -h / 2 + h * i / 7.5, w * (0.5 + rng() * 0.26), Math.max(0.6, h * 0.025), ink2); c.restore(); },
      cloth(pts, top, bot, folds, dark = "rgba(0,0,0,0.35)") { const ys = pts.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys); X.shape(pts, K.LG(0, y0, 0, y1, [[0, top], [1, bot]]));
        for (const [xa, ya, xb, yb] of folds || []) { alpha(0.9, () => X.line([[xa, ya], [(xa + xb) / 2 + (rng() - 0.5) * 6, (ya + yb) / 2], [xb, yb]], 3, dark)); alpha(0.35, () => X.line([[xa + 3, ya], [(xa + xb) / 2 + 3, (ya + yb) / 2], [xb + 3, yb]], 1.6, "rgba(255,255,255,0.4)")); } },
      hand(x, y, s, ang, f = "#c9a08a", n = 5, len = 1, claw = "#2a1a14") { K.vol(x, y, s * 0.55, s * 0.5, [f, f, "#3a2020"]);
        for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.32, l = s * (0.9 + rng() * 0.3) * len, mx = x + Math.cos(a) * l * 0.55, my = y + Math.sin(a) * l * 0.55, ex = x + Math.cos(a + 0.15) * l, ey = y + Math.sin(a + 0.15) * l;
          X.tube([[x + Math.cos(a) * s * 0.3, y + Math.sin(a) * s * 0.3], [mx, my], [ex, ey]], s * 0.13, s * 0.08, ["#ffffff", f, "#2a1818"]); K.P([[ex - 1.5, ey], [ex + 1.5, ey], [ex + Math.cos(a + 0.3) * s * 0.25, ey + Math.sin(a + 0.3) * s * 0.25]], claw); } },
    });
    return X;
  }
  // after painting: film grain, a backlight rim and a dark outline around the whole silhouette
  function finishHD(c, W, H, rim) {
    const sil = document.createElement("canvas"); sil.width = W; sil.height = H; const s = sil.getContext("2d");
    const sd = c.getImageData(0, 0, W, H), sdd = sd.data, [rr, rg, rb] = hexRGB(rim || "#9fe8ff"); for (let i = 0; i < sdd.length; i += 4) { const on = sdd[i + 3] > 150; sdd[i] = rr; sdd[i + 1] = rg; sdd[i + 2] = rb; sdd[i + 3] = on ? 255 : 0; } s.putImageData(sd, 0, 0);
    const band = document.createElement("canvas"); band.width = W; band.height = H; const b = band.getContext("2d");
    b.drawImage(sil, 0, 0); b.globalCompositeOperation = "destination-out"; b.drawImage(sil, -HD_D * 0.5, HD_D * 0.45);
    c.save(); c.globalCompositeOperation = "source-atop"; c.globalAlpha = 0.55; c.drawImage(band, 0, 0);
    // soft light from above-left, shadow pooling down-right
    c.globalAlpha = 1; c.fillStyle = (() => { const g = c.createLinearGradient(0, 0, W * 0.6, H); g.addColorStop(0, "rgba(255,240,220,0.06)"); g.addColorStop(0.55, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,10,0.32)"); return g; })(); c.fillRect(0, 0, W, H);
    c.restore();
    const img = c.getImageData(0, 0, W, H), d = img.data; let r = 12345;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; r = (r * 1103515245 + 12345) & 0x7fffffff; const n = ((r >> 16) & 15) - 7.5; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    c.putImageData(img, 0, 0);
    const ol = document.createElement("canvas"); ol.width = W; ol.height = H; const o = ol.getContext("2d");
    const od = c.getImageData(0, 0, W, H), dd = od.data; for (let i = 0; i < dd.length; i += 4) { const on = dd[i + 3] > 150; dd[i] = 7; dd[i + 1] = 6; dd[i + 2] = 12; dd[i + 3] = on ? 255 : 0; } o.putImageData(od, 0, 0);
    c.save(); c.globalCompositeOperation = "destination-over"; const t = Math.max(2, HD_D * 0.28);
    for (const [dx, dy] of [[t, 0], [-t, 0], [0, t], [0, -t], [t * 0.7, t * 0.7], [-t * 0.7, t * 0.7], [t * 0.7, -t * 0.7], [-t * 0.7, -t * 0.7]]) c.drawImage(ol, dx, dy);
    c.restore();
  }
  const TAU = Math.PI * 2, bone3 = ["#fff6e0", "#d8ccae", "#6e6250"], iron3 = ["#9a9aa8", "#4a4a58", "#16161e"];
  const VILLAIN_HD = {
    // ---- Magister Voss: the man who made the Rain Bell a leash. His chest opens like a cabinet and the Bell hangs inside.
    voss: { w: 84, h: 116, rim: "#8ff4ff", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 168, E = X.E;
      // a fan of chains behind him, each ending in a shackled hand
      for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.95 + i * Math.PI * 0.9 / 8 + Math.sin(ph * TAU + i) * 0.03, r = 150 + (i % 2) * 22, ex = cx + Math.cos(a) * r, ey = 150 + Math.sin(a) * r * 0.85;
        X.chain([[cx + Math.cos(a) * 30, 150 + Math.sin(a) * 26], [ex, ey]], 9, "#2a2a34", "#8a8a98"); X.R(ex - 7, ey - 5, 14, 10, "#3a3a46"); X.hand(ex + Math.cos(a) * 12, ey + Math.sin(a) * 12, 13, a, "#9aa0a0", 5, 1.1); }
      // halo of iron spikes
      for (let i = 0; i < 15; i++) { const a = -Math.PI + i * Math.PI / 14, L = 34 + (i % 2) * 20; X.crystal(cx + Math.cos(a) * 44, 78 + Math.sin(a) * 40, L, a, 5, ["#ff8a8a", "#4a4a58", "#1a1a22"]); }
      X.glow(cx, 80, 90, "rgba(255,40,60,0.35)");
      // robe: crimson, split open at the chest; the hem unravels into chains
      X.cloth([[cx - 52, 112], [cx + 52, 112], [cx + 96, 300], [cx + 118, 432], [cx - 118, 432], [cx - 96, 300]], "#9a1224", "#2a0308", [[cx - 30, 170, cx - 70, 420], [cx + 28, 170, cx + 72, 420], [cx - 8, 280, cx - 20, 425], [cx + 10, 280, cx + 24, 425]]);
      for (let i = 0; i < 11; i++) { const x = cx - 110 + i * 22, L = 18 + (i * 37 % 23); X.chain([[x, 428], [x + Math.sin(ph * TAU + i) * 4, 428 + L]], 6, "#2a2a34", "#9a9aa8"); }
      X.line([[cx - 30, 120], [cx - 40, 280], [cx - 74, 430]], 5, "#d8b440"); X.line([[cx + 30, 120], [cx + 40, 280], [cx + 74, 430]], 5, "#d8b440");
      for (let i = 0; i < 8; i++) X.coin(cx - 36 - i * 4.4, 300 + i * 16, 4); 
      // the open chest: ribs pried apart with hooks, the Bell hanging on its chain inside
      X.shape([[cx - 34, 128], [cx + 34, 128], [cx + 40, 200], [cx + 26, 276], [cx - 26, 276], [cx - 40, 200]], X.RG(cx, 210, 6, 80, [[0, "#2a0810"], [0.7, "#12020a"], [1, "#3a0a14"]]));
      for (let i = 0; i < 6; i++) { const y = 138 + i * 22; for (const s of [-1, 1]) X.tube([[cx + s * 10, y], [cx + s * 46, y + 6], [cx + s * 56, y + 22]], 4.2, 2.6, bone3); }
      X.line([[cx, 128], [cx, 176]], 3, "#6a6a78"); X.chain([[cx, 128], [cx, 176]], 7, "#3a3a46", "#b8b0a8");
      const by = 190 + b * 2; X.glow(cx, by + 30, 70, "rgba(62,224,232,0.55)");
      X.shape([[cx - 6, by - 12], [cx + 6, by - 12], [cx + 16, by], [cx + 22, by + 34], [cx + 34, by + 52], [cx - 34, by + 52], [cx - 22, by + 34], [cx - 16, by]], X.LG(cx - 34, 0, cx + 34, 0, [[0, "#5a3c0e"], [0.3, "#f6e07a"], [0.55, "#b08a28"], [1, "#2e1e06"]]));
      E(cx, by + 52, 34, 7, "#1a1206"); E(cx, by + 51, 30, 5, X.RG(cx, by + 51, 0, 30, [[0, "#9ef0f5"], [1, "#1a4252"]]));
      X.tube([[cx, by + 50], [cx + 4, by + 66 + b * 3], [cx - 2, by + 80 + b * 4]], 5, 4, ["#f0a0b0", "#b04a60", "#4a1020"]);   // the clapper is a tongue
      for (let i = 0; i < 3; i++) X.line([[cx - 28 + i * 6, by + 30 - i * 6], [cx - 22 + i * 8, by + 20 - i * 6]], 1.2, "rgba(255,255,255,0.6)");
      // four arms: the upper pair hold the ledger and a quill-knife, the lower pair are shackled and clawing
      X.tube([[cx - 50, 122], [cx - 78, 176], [cx - 64, 222]], 11, 8, ["#c8182e", "#6a0c18", "#1e0306"]);
      X.page(cx - 68, 236, 34, 44, -0.3, "#efe4c4"); X.page(cx - 44, 234, 34, 44, 0.2, "#e6dab8"); X.hand(cx - 60, 224, 11, 0.9, "#e6d0bc");
      X.tube([[cx + 50, 122], [cx + 84, 160], [cx + 96, 118]], 11, 8, ["#c8182e", "#6a0c18", "#1e0306"]); X.hand(cx + 96, 112, 11, -1.8, "#e6d0bc");
      X.shape([[cx + 94, 110], [cx + 102, 30], [cx + 108, 28], [cx + 100, 112]], X.LG(cx + 96, 30, cx + 104, 110, [[0, "#ffffff"], [0.4, "#ccccd8"], [1, "#5e5e70"]]));
      for (let i = 0; i < 9; i++) X.line([[cx + 102 - i * 0.6, 40 + i * 7], [cx + 116 - i * 0.4, 30 + i * 7]], 2, "#ececf2"); X.drip(cx + 100, 112, 18 + b * 4, 2.2, "#9a1224");
      for (const s of [-1, 1]) { X.tube([[cx + s * 36, 262], [cx + s * 70, 290], [cx + s * 84, 326]], 6, 4.5, ["#d8d8e0", "#8a8a98", "#2a2a36"]); X.R(cx + s * 84 - 8, 318, 16, 10, "#2a2a34"); X.hand(cx + s * 86, 336, 10, Math.PI / 2 - s * 0.3, "#c0c4c8", 5, 1.4); }
      // the high collar and the split face: one half a smiling man, the other salt-cracked porcelain with a burning eye
      X.shape([[cx - 50, 116], [cx - 62, 48], [cx - 30, 70], [cx, 60], [cx + 30, 70], [cx + 62, 48], [cx + 50, 116]], X.LG(0, 48, 0, 116, [[0, "#c8182e"], [1, "#40070e"]]));
      X.line([[cx - 62, 48], [cx - 30, 70], [cx, 60], [cx + 30, 70], [cx + 62, 48]], 3, "#f6e07a");
      X.shape([[cx, 26], [cx + 26, 40], [cx + 30, 80], [cx + 16, 110], [cx, 116], [cx - 16, 110], [cx - 30, 80], [cx - 26, 40]], X.RG(cx - 10, 60, 4, 60, [[0, "#f2d2b8"], [0.6, "#c98f72"], [1, "#6e3a34"]]));
      X.c.save(); X.c.beginPath(); X.c.rect(cx, 0, 60, 130); X.c.clip();
      X.shape([[cx, 26], [cx + 26, 40], [cx + 30, 80], [cx + 16, 110], [cx, 116]], X.RG(cx + 10, 60, 4, 50, [[0, "#ffffff"], [0.6, "#dde2ee"], [1, "#8a90a8"]]));
      for (let i = 0; i < 7; i++) X.crack(cx + 2, 40 + i * 10, 26, -0.3 + X.rng() * 0.8, "#3a3a4a", 1.2);
      X.eyeHD(cx + 16, 88, 3, "#ff6a6a", { glow: "rgba(255,80,80,0.6)" }); X.eyeHD(cx + 22, 100, 2.4, "#ff6a6a", { slit: true });
      X.c.restore();
      X.shape([[cx - 28, 24], [cx + 28, 24], [cx + 30, 44], [cx, 30], [cx - 30, 44]], "#16121e"); X.line([[cx - 20, 28], [cx - 8, 20]], 2, "#4a3f7a");
      X.eyeHD(cx - 12, 66, 5.5, "#6a4a30", { look: [0.6, 0], lid: 0.35, lidCol: "#8e5444" });
      X.eyeHD(cx + 13, 66, 7, "#3ee0e8", { core: "#ffffff", glow: "rgba(62,224,232,0.9)", slit: true });
      X.line([[cx - 16, 96], [cx - 6, 99], [cx + 4, 98]], 1.8, "#4a2226");
      X.mouth(cx + 14, 97, 12, 5, { teeth: 7, long: 1.2, lip: "#8a90a8" });
      X.line([[cx - 4, 70], [cx - 6, 86], [cx, 88]], 1.4, "rgba(74,34,38,0.6)");
      // loose pages of the ledger orbiting him
      for (let i = 0; i < 6; i++) { const a = ph * TAU + i * TAU / 6; X.page(cx + Math.cos(a) * 140, 250 + Math.sin(a) * 40 - i * 8, 22, 28, a * 0.5, "#e8dfc2"); }
    } },

    // ---- Hollis: the merchant who drowned rich. Coins grow in his skin, his belly is a mouth, a lure hangs from his brow.
    hollis: { w: 100, h: 116, rim: "#ffe07a", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 200, E = X.E, skin = ["#b4ccbc", "#5e7466", "#1e2a26"];
      for (let i = 0; i < 14; i++) { const y = 460 - ((ph * 120 + i * 37) % 440); E(60 + (i * 97 % 290), y, 2 + i % 3, 2 + i % 3, "rgba(166,226,220,0.45)"); }
      for (const s of [-1, 1]) { X.tube([[cx + s * 60, 380], [cx + s * 70, 430], [cx + s * 66, 452]], 26, 22, skin); E(cx + s * 70, 454, 34, 12, "#2e403a"); for (let k = 0; k < 5; k++) E(cx + s * 54 + k * 7 * s, 410 + k * 6, 5, 4, "#e8e0cc"); }
      // the drowned body: a vast bloated sphere, veined, barnacled, scaled with coins
      X.vol(cx, 270 + b * 2, 158, 150 + b * 3, skin);
      for (let i = 0; i < 12; i++) X.veins(cx - 120 + X.rng() * 240, 170 + X.rng() * 200, 40, X.rng() * TAU, 3, "rgba(46,64,58,0.7)", 2);
      for (let i = 0; i < 70; i++) { const a = -1.4 + X.rng() * 1.9, r = 60 + X.rng() * 90; X.coin(cx + Math.cos(a) * r, 270 + Math.sin(a) * r, 6 + X.rng() * 5, a); }
      for (let i = 0; i < 24; i++) { const x = cx - 150 + X.rng() * 90, y = 250 + X.rng() * 120; E(x, y, 6, 5, "#c8bca2"); E(x, y - 1, 2.5, 2, "#4a4238"); }
      // the waistcoat, burst
      for (const s of [-1, 1]) { X.shape([[cx + s * 64, 146], [cx + s * 36, 140], [cx + s * 34, 250], [cx + s * 58, 262]], X.LG(0, 140, 0, 262, [[0, "#b08a28"], [1, "#2e1e06"]])); X.line([[cx + s * 38, 142], [cx + s * 36, 250]], 2, "#f6e07a");
        for (let k = 0; k < 4; k++) X.line([[cx + s * 58, 262 + k * 4], [cx + s * (70 + k * 8), 300 + k * 18]], 2, "#86621a"); }
      for (let i = 0; i < 4; i++) X.coin(cx - 44, 160 + i * 26, 6);
      // the belly mouth, vertical, vomiting coins
      const mo = 1 + b * 0.12; X.c.save(); X.c.translate(cx + 4, 290); X.c.rotate(Math.PI / 2); X.mouth(0, 0, 76 * mo, 30 * mo, { teeth: 14, long: 1.4, lip: "#5a3a4a", tongue: true, toothCol: "#f6e07a" }); X.c.restore();
      for (let i = 0; i < 26; i++) { const t = (ph + i / 26) % 1; X.coin(cx + 6 + Math.sin(i * 1.7) * 22 * t, 360 + t * 90, 6, i); }
      for (let i = 0; i < 22; i++) X.coin(cx - 60 + X.rng() * 140, 440 + X.rng() * 20, 7, X.rng());
      // eels slithering out of holes in his flank
      for (const [x, y, s] of [[cx - 130, 230, -1], [cx + 138, 320, 1]]) { E(x, y, 12, 10, "#0a1418"); X.tube([[x, y], [x + s * 30, y - 20 + b * 6], [x + s * 50, y + 10], [x + s * 70, y - 12 - b * 5]], 8, 5, ["#6cb8b8", "#1a4252", "#08141e"]); X.eyeHD(x + s * 68, y - 14 - b * 5, 3, "#ffcf4a", { glow: "rgba(255,207,74,0.5)" }); }
      // arms, sausage fingers heavy with rings; a mouth in the left palm; a little bell in the right
      X.tube([[cx - 140, 200], [cx - 176, 270], [cx - 160, 320]], 26, 20, skin); X.hand(cx - 158, 334, 24, 1.4, "#8ea898", 5, 0.9);
      X.mouth(cx - 158, 334, 9, 5, { teeth: 6 }); for (let i = 0; i < 4; i++) E(cx - 170 + i * 8, 350, 4, 2.5, "#f6e07a");
      X.tube([[cx + 140, 200], [cx + 180, 250], [cx + 176, 300]], 26, 20, skin); X.hand(cx + 176, 312, 24, 1.8, "#8ea898", 5, 0.9);
      X.glow(cx + 176, 346, 30, "rgba(62,224,232,0.5)"); X.shape([[cx + 170, 330], [cx + 182, 330], [cx + 190, 356], [cx + 162, 356]], X.LG(cx + 162, 0, cx + 190, 0, [[0, "#86621a"], [0.4, "#f6e07a"], [1, "#5a3c0e"]]));
      // the head: small on that body, drowned, milky-eyed, gold-toothed, under a barnacled hat
      X.vol(cx, 104, 54, 50, ["#c8dccf", "#7e9484", "#2e403a"]);
      for (let i = 0; i < 12; i++) { const x = cx - 50 + i * 9; X.line([[x, 70], [x - 6 + Math.sin(ph * TAU + i) * 4, 110], [x - 2, 150 + (i % 3) * 14]], 3, i % 2 ? "#465228" : "#62703a"); }
      X.eyeHD(cx - 20, 98, 11, "#a4b8a6", { milk: "#dfe8e0", noPupil: true, blood: true }); X.eyeHD(cx + 22, 96, 13, "#a4b8a6", { milk: "#dfe8e0", noPupil: true, blood: true, look: [0.4, 0.2] });
      X.mouth(cx, 128, 28, 12 + b * 2, { teeth: 10, toothCol: "#f6e07a", lip: "#44584e", drool: 4 });
      X.shape([[cx - 40, 64], [cx + 40, 64], [cx + 34, 14], [cx - 30, 10]], X.LG(0, 10, 0, 64, [[0, "#465228"], [1, "#1c2012"]])); E(cx, 64, 60, 9, "#2e361c");
      for (let i = 0; i < 9; i++) E(cx - 30 + X.rng() * 60, 20 + X.rng() * 40, 4, 3.5, "#c8bca2");
      X.tube([[cx + 10, 20], [cx + 40, -4 + 20], [cx + 76, 10], [cx + 90, 44 + b * 4]], 3, 2, ["#a4b8a6", "#44584e", "#1e2a26"]);
      X.glow(cx + 90, 50 + b * 4, 36, "rgba(255,207,74,0.8)"); E(cx + 90, 50 + b * 4, 8, 8, X.RG(cx + 88, 48 + b * 4, 0, 8, [[0, "#fff0a0"], [1, "#c86a1a"]]));
    } },

    // ---- The Drowned King: four hundred years below. Crowned with drowned hands, jaw hanging to his ribs, a choir inside him.
    king: { w: 112, h: 118, rim: "#9ef0f5", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 224, E = X.E, pale = ["#dfe8e0", "#7e9484", "#1e2a26"];
      // the jellyfish mantle behind him, glassy, lit from within
      X.alpha(0.55, () => X.shape([[cx - 200, 250], [cx - 190, 110], [cx - 110, 20], [cx, 0], [cx + 110, 20], [cx + 190, 110], [cx + 200, 250], [cx + 150, 230], [cx + 100, 262], [cx + 40, 236], [cx - 20, 266], [cx - 80, 236], [cx - 140, 262]], X.RG(cx, 120, 10, 220, [[0, "rgba(62,138,144,0.2)"], [0.7, "rgba(40,98,110,0.7)"], [1, "rgba(166,226,220,0.9)"]])));
      for (let i = 0; i < 40; i++) { const a = X.rng() * Math.PI, r = 60 + X.rng() * 140, x = cx + Math.cos(a + Math.PI) * r, y = 180 - Math.sin(a) * r * 0.85; X.glow(x, y, 7 + (i % 3) * 3, i % 4 ? "rgba(62,224,232,0.8)" : "rgba(255,120,200,0.7)", 0.6 + 0.4 * Math.sin(ph * TAU + i)); }
      for (let i = 0; i < 12; i++) { const x = cx - 180 + i * 32; X.alpha(0.5, () => X.line([[x, 250], [x + Math.sin(ph * TAU + i) * 12, 330], [x - 6, 420], [x + Math.sin(ph * TAU + i * 2) * 10, 470]], 2.5, "#6cb8b8")); }
      // a tide of drowned arms rising behind and below him
      for (let i = 0; i < 17; i++) { const x = 16 + i * 26 + X.rng() * 14, top = 230 + X.rng() * 170, lean = (x - 224) * 0.35 + (X.rng() - 0.5) * 60, sway = Math.sin(ph * TAU + i * 1.7) * 10, ex = x + lean + sway, ang = Math.atan2(top - 470, ex - x);
        X.tube([[x, 480], [x + lean * 0.3, (480 + top) / 2 + 20], [x + lean * 0.8 + sway * 0.6, top + 30], [ex, top]], 10 + X.rng() * 4, 6, pale); X.hand(ex + Math.cos(ang) * 6, top + Math.sin(ang) * 6, 13 + X.rng() * 5, ang + (X.rng() - 0.5) * 0.6, "#b8c8bc", 5, 1.3, "#0a1418"); }
      for (let i = 0; i < 7; i++) { const x = 40 + i * 62 + (i % 2) * 14, y = 404 + ((i * 37) % 50); X.vol(x, y, 16, 18, pale); X.eyeHD(x - 5, y - 2, 3, null, { milk: "#cad8c8", noPupil: true }); X.eyeHD(x + 6, y - 2, 3, null, { milk: "#cad8c8", noPupil: true }); X.mouth(x, y + 9, 5, 4, { teeth: 4 }); }
      // the King's body: a gaunt giant, ribs splayed open over a choir of small faces
      X.shape([[cx - 70, 170], [cx + 70, 170], [cx + 80, 260], [cx + 60, 380], [cx - 60, 380], [cx - 80, 260]], X.LG(cx - 80, 0, cx + 80, 0, [[0, "#a4b8a6"], [0.45, "#5e7466"], [1, "#1e2a26"]]));
      X.shape([[cx - 40, 200], [cx + 40, 200], [cx + 46, 300], [cx - 46, 300]], X.RG(cx, 250, 6, 70, [[0, "#12303a"], [1, "#040a10"]]));
      for (let i = 0; i < 9; i++) { const x = cx - 30 + (i % 3) * 30, y = 220 + Math.floor(i / 3) * 26; E(x, y, 9, 10, "#6a8a88"); X.eyeHD(x - 3, y - 2, 1.6, null, { milk: "#1a1a22", noPupil: true }); E(x, y + 5, 3, 4 + Math.sin(ph * TAU * 2 + i) * 1.5, "#040002"); }
      X.glow(cx, 250, 60, "rgba(62,224,232,0.35)");
      for (let i = 0; i < 6; i++) for (const s of [-1, 1]) X.tube([[cx + s * 8, 196 + i * 18], [cx + s * 58, 206 + i * 18], [cx + s * 74, 222 + i * 16]], 4.5, 3, bone3);
      // arms: long enough to reach you
      for (const s of [-1, 1]) { X.tube([[cx + s * 66, 176], [cx + s * 126, 240], [cx + s * 150, 320 + b * 6]], 15, 9, pale); X.hand(cx + s * 152, 338 + b * 6, 20, Math.PI / 2 - s * 0.4, "#b8c8bc", 5, 1.9, "#0a1418"); }
      // the head: an elongated skull, hollow eyes with a pinprick of light, the jaw hanging down to his chest
      X.shape([[cx - 46, 70], [cx - 36, 30], [cx, 20], [cx + 36, 30], [cx + 46, 70], [cx + 40, 130], [cx - 40, 130]], X.RG(cx - 14, 60, 6, 80, [[0, "#ececf2"], [0.6, "#a4b8a6"], [1, "#2e403a"]]));
      for (const s of [-1, 1]) { E(cx + s * 20, 84, 15, 19, "#030608"); X.glow(cx + s * 20, 86, 26, "rgba(62,224,232,0.9)"); E(cx + s * 20, 86, 3, 3, "#e8ffff"); }
      E(cx, 108, 5, 8, "#0a1418");
      const jaw = 66 + b * 8; X.shape([[cx - 34, 124], [cx + 34, 124], [cx + 26, 132 + jaw], [cx, 144 + jaw], [cx - 26, 132 + jaw]], X.LG(0, 124, 0, 144 + jaw, [[0, "#040a10"], [1, "#12303a"]]));
      for (let i = 0; i < 11; i++) { const x = cx - 30 + i * 6; X.P([[x - 2.2, 122], [x + 2.2, 122], [x, 146 + (i % 3) * 5]], "#e8e0cc"); X.P([[x - 2.2, 130 + jaw], [x + 2.2, 130 + jaw], [x, 110 + jaw + (i % 2) * 6]], "#c8bca2"); }
      X.line([[cx - 34, 124], [cx - 30, 136 + jaw]], 4, "#7e9484"); X.line([[cx + 34, 124], [cx + 30, 136 + jaw]], 4, "#7e9484");
      X.glow(cx, 130 + jaw * 0.6, 22, "rgba(62,224,232,0.5)");
      // the crown: seven drowned hands, grown into a ring of green gold
      E(cx, 38, 50, 12, X.LG(cx - 50, 0, cx + 50, 0, [[0, "#2e1e06"], [0.35, "#b08a28"], [0.6, "#6a7a3a"], [1, "#2e1e06"]]));
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.33, x = cx + (i - 3) * 15; X.tube([[x, 36], [x + Math.cos(a) * 14, 36 + Math.sin(a) * 26], [x + Math.cos(a) * 20, 36 + Math.sin(a) * 40]], 4.5, 3.5, pale); X.hand(x + Math.cos(a) * 22, 36 + Math.sin(a) * 46, 8, a, "#b8c8bc", 5, 1.1); }
      for (let i = 0; i < 5; i++) { X.glow(cx - 36 + i * 18, 40, 8, "rgba(62,224,232,0.9)"); E(cx - 36 + i * 18, 40, 3, 3, "#9ef0f5"); }
      for (let i = 0; i < 10; i++) { const y = 150 - ((ph * 150 + i * 30) % 150); E(cx - 20 + Math.sin(i * 3) * 30, y, 2 + i % 3, 2 + i % 3, "rgba(200,240,240,0.5)"); }
    } },

    // ---- The Butcher: Voss's hangman. A second mouth in the gut, a third arm from his back, hooks through his shoulders.
    butcher: { w: 76, h: 104, rim: "#ff7a6a", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 152, E = X.E, fl = ["#f2d2b8", "#ad7058", "#2a1418"];
      for (const s of [-1, 1]) { X.tube([[cx + s * 30, 300], [cx + s * 38, 360], [cx + s * 36, 396]], 22, 18, ["#8e6a4c", "#36241a", "#120a06"]); X.shape([[cx + s * 14, 392], [cx + s * 62, 392], [cx + s * 66, 414], [cx + s * 10, 414]], "#1d1830"); }
      // the hook-and-chain rig through his shoulders
      for (const s of [-1, 1]) X.chain([[cx + s * 60, 118], [cx + s * 90, 40], [cx + s * 70, 0]], 8, "#3a2a22", "#bc7038");
      // third arm from the back, over the shoulder, holding a meat hook with something on it
      X.tube([[cx + 30, 110], [cx + 70, 50], [cx + 40, 20]], 13, 10, fl); X.hand(cx + 36, 16, 12, -2.4, "#c98f72");
      X.line([[cx + 30, 12], [cx + 10, 30], [cx + 12, 60]], 4, "#bc7038"); X.vol(cx + 10, 86, 16, 26, ["#ee3a46", "#9a1224", "#40070e"]); X.tube([[cx + 6, 70], [cx + 16, 110]], 3, 2, bone3);
      // the gut: vast, stitched, split down the middle by a mouth full of teeth
      X.vol(cx, 226 - b, 96, 100 + b * 2, fl);
      X.dots(160, cx - 90, 140, cx + 90, 310, "rgba(42,20,24,0.45)", 1.1);
      for (let i = 0; i < 8; i++) X.veins(cx - 70 + X.rng() * 140, 160 + X.rng() * 130, 30, X.rng() * TAU, 3, "rgba(106,12,24,0.45)", 1.6);
      const mo = 1 + b * 0.15; X.c.save(); X.c.translate(cx, 240); X.c.rotate(Math.PI / 2); X.mouth(0, 0, 60 * mo, 24 * mo, { teeth: 12, long: 1.5, lip: "#6e3a34", tongue: true, drool: 0 }); X.c.restore();
      for (let i = 0; i < 9; i++) { const y = 176 + i * 15; X.line([[cx - 36, y], [cx - 24, y + 4]], 2.4, "#2a1418"); X.line([[cx + 24, y + 4], [cx + 36, y]], 2.4, "#2a1418"); }
      for (let i = 0; i < 5; i++) X.drip(cx - 10 + i * 5, 300, 12 + X.rng() * 26 + b * 3, 2.4, "#9a1224");
      // the apron, ripped open over the gut-mouth and soaked
      for (const s of [-1, 1]) X.cloth([[cx + s * 20, 120], [cx + s * 66, 120], [cx + s * 84, 330], [cx + s * 36, 338]], "#ddd4b0", "#948a70", [[cx + s * 40, 140, cx + s * 58, 320]]);
      for (const [x, y, r] of [[cx - 50, 170, 20], [cx + 56, 230, 26], [cx - 60, 290, 22], [cx + 44, 310, 18]]) { E(x, y, r, r * 0.8, X.RG(x, y, 2, r, [[0, "#9a1224"], [0.6, "#6a0c18"], [1, "rgba(64,7,14,0.1)"]])); X.drip(x, y + r * 0.5, r * 1.2, 2.4, "#6a0c18"); }
      // left arm drags a hook on a chain; right arm lifts the cleaver
      X.tube([[cx - 70, 126], [cx - 106, 200], [cx - 112, 262]], 22, 16, fl); X.hand(cx - 112, 276, 16, 1.6, "#c98f72");
      X.chain([[cx - 112, 280], [cx - 118, 360], [cx - 104, 400]], 9, "#4e2410", "#bc7038"); X.line([[cx - 104, 400], [cx - 90, 414], [cx - 78, 400]], 5, "#9a5226"); X.line([[cx - 104, 400], [cx - 92, 412], [cx - 80, 402]], 1.6, "#e8e0cc");
      X.tube([[cx + 70, 120], [cx + 108, 80], [cx + 116, 40]], 22, 16, fl); X.hand(cx + 116, 32, 16, -1.6, "#c98f72");
      X.line([[cx + 116, 34], [cx + 120, 4]], 7, "#36241a");
      X.shape([[cx + 96, 10], [cx + 110, -8 + 8], [cx + 150, -6 + 8], [cx + 150, 44], [cx + 122, 44]], X.LG(cx + 96, 0, cx + 150, 44, [[0, "#e8e0cc"], [0.3, "#a2957c"], [0.6, "#76381a"], [1, "#2a1208"]]));
      X.line([[cx + 110, 0], [cx + 150, 2]], 2.4, "#ffffff"); E(cx + 134, 24, 10, 6, "#6a0c18"); X.drip(cx + 136, 34, 20 + b * 4, 2.4, "#9a1224"); X.crack(cx + 120, 12, 18, 0.5, "#2a1208", 1.2);
      // head in a sack hood: nails through it, one eye hole burning, the stitched mouth torn open
      X.vol(cx, 86, 42, 46, ["#ddd4b0", "#948a70", "#36241a"]); X.dots(90, cx - 36, 46, cx + 36, 128, "rgba(82,56,40,0.5)", 1);
      X.line([[cx - 42, 118], [cx + 42, 118]], 6, "#523828"); X.line([[cx - 12, 118], [cx - 20, 146], [cx - 8, 146]], 3, "#523828");
      for (const [x, y, a] of [[cx - 30, 60, -0.6], [cx + 34, 70, 0.5], [cx - 8, 44, -1.4]]) { X.line([[x, y], [x + Math.cos(a) * 16, y + Math.sin(a) * 16]], 3, "#6a6a78"); E(x, y, 4, 4, "#3a3a46"); X.drip(x, y + 3, 10, 1.6, "#6a0c18"); }
      E(cx + 12, 78, 11, 10, "#07060c"); X.eyeHD(cx + 12, 78, 6, "#ff2d2d", { glow: "rgba(255,45,45,0.9)", slit: true, blood: true });
      X.mouth(cx - 4, 104, 22, 9 + b * 2, { teeth: 10, long: 1.3, lip: "#523828", drool: 3, droolCol: "rgba(154,18,36,0.8)" });
      for (let i = 0; i < 6; i++) X.line([[cx - 22 + i * 8, 92], [cx - 20 + i * 8, 116]], 1.4, "#2a1418");
      for (let i = 0; i < 12; i++) { const a = ph * TAU * (1 + i % 3) + i; E(cx - 110 + i * 20 + Math.cos(a) * 20, 180 + Math.sin(a * 1.3) * 60, 2.4, 1.8, "#07060c"); E(cx - 110 + i * 20 + Math.cos(a) * 20 + 2, 178 + Math.sin(a * 1.3) * 60, 2, 1, "rgba(200,220,255,0.5)"); }
    } },

    // ---- The Choirmaster: sold his choir to Voss. Organ pipes for wings, mouths singing all over his robe, eyes sewn shut.
    choirmaster: { w: 72, h: 116, rim: "#ffcf4a", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 144, E = X.E;
      // organ pipes fanning from his back, each ending in a mouth; candles guttering on top
      for (let i = 0; i < 11; i++) { const o = i - 5, h = 250 - Math.abs(o) * 22, x = cx + o * 25, top = 250 - h;
        X.shape([[x - 9, 260], [x + 9, 260], [x + 9, top + 12], [x - 9, top + 12]], X.LG(x - 9, 0, x + 9, 0, [[0, "#5a3c0e"], [0.35, "#f6e07a"], [0.6, "#b08a28"], [1, "#2e1e06"]]));
        X.mouth(x, top + 34, 7, 5 + Math.sin(ph * TAU * 2 + i) * 2, { teeth: 5, lip: "#86621a" });
        X.R(x - 5, top - 2, 10, 14, "#ece2c6"); X.drip(x - 4, top + 10, 8 + (i % 3) * 5, 1.6, "#ece2c6"); X.glow(x, top - 8, 18, "rgba(255,180,60,0.8)"); E(x, top - 6 + Math.sin(ph * TAU * 3 + i), 2.6, 5, "#fff0a0");
        X.alpha(0.3, () => { X.c.strokeStyle = "#ffcf4a"; X.c.lineWidth = 1.2; for (let k = 1; k < 3; k++) { X.c.beginPath(); X.c.arc(x, top + 34, 8 + ((ph * 30 + k * 10) % 26), -2.4, -0.7); X.c.stroke(); } }); }
      // the robe: tall, black-violet, crusted with singing mouths
      X.cloth([[cx - 40, 110], [cx + 40, 110], [cx + 70, 300], [cx + 96, 452], [cx - 96, 452], [cx - 70, 300]], "#332c52", "#07060c", [[cx - 20, 150, cx - 60, 440], [cx + 20, 150, cx + 58, 440], [cx, 200, cx - 6, 446]]);
      for (let i = 0; i < 14; i++) { const x = cx - 90 + i * 13.5, y = 446 + (i % 2) * 8; X.P([[x, 440], [x + 13, 440], [x + 6, y + 12]], "#07060c"); }
      for (const [x, y, s] of [[cx - 36, 300, 12], [cx + 30, 280, 10], [cx - 10, 360, 14], [cx + 44, 380, 11], [cx - 56, 400, 10], [cx + 12, 424, 9]]) { const o = 0.7 + 0.3 * Math.sin(ph * TAU * 2 + x); X.mouth(x, y, s, s * 0.8 * o, { teeth: 7, lip: "#6e3a34", tongue: true, drool: 1 }); }
      // the birdcage in his chest, with a little skeleton bird that still sings
      X.shape([[cx - 26, 150], [cx + 26, 150], [cx + 30, 230], [cx - 30, 230]], X.RG(cx, 190, 4, 50, [[0, "#6a2a18"], [1, "#12060a"]]));
      X.glow(cx, 196, 44, "rgba(255,160,60,0.55)");
      for (let i = 0; i < 7; i++) X.line([[cx - 24 + i * 8, 150], [cx - 26 + i * 8.6, 232]], 2, "#d8b440"); X.line([[cx - 30, 150], [cx, 136], [cx + 30, 150]], 3, "#d8b440");
      X.line([[cx - 12, 200], [cx + 12, 200]], 2, "#d8b440"); E(cx, 190, 6, 5, "#e8e0cc"); E(cx + 5, 184, 3.5, 3.5, "#e8e0cc"); X.P([[cx + 8, 184], [cx + 14, 186], [cx + 8, 187]], "#e8e0cc"); X.line([[cx - 4, 190], [cx - 14, 196 + b * 2]], 1.4, "#e8e0cc");
      // arms: the right conducts with a baton of spine, the left trails ribbons of sheet music
      X.tube([[cx + 38, 118], [cx + 78, 90], [cx + 96, 40 + b * 6]], 8, 6, ["#6a5f9a", "#221e38", "#07060c"]); X.hand(cx + 98, 32 + b * 6, 10, -1.4, "#dcdce4", 5, 1.6);
      for (let i = 0; i < 9; i++) { const x = cx + 104 + i * 4, y = 20 + b * 6 - i * 9; E(x, y, 3.5, 2.6, "#e8e0cc"); E(x - 3, y + 1, 1.4, 1, "#a2957c"); }
      X.tube([[cx - 38, 118], [cx - 70, 170], [cx - 90, 210]], 8, 6, ["#6a5f9a", "#221e38", "#07060c"]); X.hand(cx - 92, 220, 10, 1.9, "#dcdce4", 5, 1.8);
      for (let i = 0; i < 5; i++) X.page(cx - 110 - i * 8, 250 + i * 34 + Math.sin(ph * TAU + i) * 6, 20, 26, 0.4 * Math.sin(i + ph * TAU), "#f4eed6", "rgba(20,20,30,0.7)");
      // the head: a porcelain mask in a hood, eyes sewn shut, jaw unhinged far past a jaw's length
      X.shape([[cx - 40, 110], [cx - 44, 50], [cx - 20, 14], [cx + 20, 14], [cx + 44, 50], [cx + 40, 110]], X.LG(0, 14, 0, 110, [[0, "#221e38"], [1, "#07060c"]]));
      X.shape([[cx - 26, 48], [cx - 22, 30], [cx, 24], [cx + 22, 30], [cx + 26, 48], [cx + 22, 84], [cx - 22, 84]], X.RG(cx - 8, 44, 4, 44, [[0, "#ffffff"], [0.6, "#ccccd8"], [1, "#5e5e70"]]));
      for (const s of [-1, 1]) { X.line([[cx + s * 18, 54], [cx + s * 6, 56]], 2, "#3a3a4a"); for (let k = 0; k < 4; k++) X.line([[cx + s * (7 + k * 3.4), 50], [cx + s * (8 + k * 3.4), 60]], 1.2, "#6a0c18"); X.drip(cx + s * 12, 60, 14 + b * 2, 1.4, "#9a1224"); }
      X.crack(cx + 6, 28, 22, 1.4, "#5e5e70", 1.2);
      const jaw = 40 + b * 8; X.shape([[cx - 18, 76], [cx + 18, 76], [cx + 12, 84 + jaw], [cx - 12, 84 + jaw]], X.LG(0, 76, 0, 84 + jaw, [[0, "#040002"], [1, "#2a0810"]]));
      X.shape([[cx - 14, 84 + jaw], [cx + 14, 84 + jaw], [cx + 10, 94 + jaw], [cx - 10, 94 + jaw]], "#ccccd8");
      for (let i = 0; i < 6; i++) { X.P([[cx - 14 + i * 5.6, 76], [cx - 10 + i * 5.6, 76], [cx - 12 + i * 5.6, 86]], "#ece2c6"); X.P([[cx - 12 + i * 4.8, 84 + jaw], [cx - 8 + i * 4.8, 84 + jaw], [cx - 10 + i * 4.8, 76 + jaw]], "#ece2c6"); }
      X.tube([[cx, 90], [cx + 3, 100 + jaw * 0.6], [cx - 2, 110 + jaw]], 4, 3, ["#f0a0b0", "#b04a60", "#4a1020"]);
    } },

    // ---- Quill: the Guild's bookkeeper. A bird-skull with a pen for a beak, quills down his back, an inkwell for a heart.
    quill: { w: 64, h: 116, rim: "#ffe0a0", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 128, E = X.E;
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.26, L = 150 - Math.abs(i - 4) * 12, x0 = cx + (i - 4) * 4, y0 = 170, tx = x0 + Math.cos(a) * L, ty = y0 + Math.sin(a) * L;
        X.line([[x0, y0], [tx, ty]], 2.2, "#c8c0a8"); for (let k = 0; k < 16; k++) { const t = 0.25 + k / 20, px = x0 + (tx - x0) * t, py = y0 + (ty - y0) * t; for (const s of [-1, 1]) X.line([[px, py], [px + Math.cos(a + s * 0.5) * 14 * (1 - t * 0.5), py + Math.sin(a + s * 0.5) * 14 * (1 - t * 0.5)]], 1.6, t > 0.8 ? "#9a1224" : "#ece6d4"); }
        X.drip(tx, ty + 4, 10 + (i % 3) * 5, 1.6, "#9a1224"); }
      // pen-nib legs
      for (const s of [-1, 1]) { X.tube([[cx + s * 14, 330], [cx + s * 18, 400], [cx + s * 16, 440]], 6, 4, ["#6a5f9a", "#221e38", "#07060c"]); X.P([[cx + s * 16 - 8, 438], [cx + s * 16 + 8, 438], [cx + s * 16 + s * 18, 462]], X.LG(0, 438, 0, 462, [[0, "#f6e07a"], [1, "#5a3c0e"]])); X.line([[cx + s * 16, 440], [cx + s * 16 + s * 12, 458]], 1.2, "#2e1e06"); }
      // the coat: long tails, gold trim, pages nailed to it
      X.cloth([[cx - 32, 150], [cx + 32, 150], [cx + 46, 260], [cx + 60, 380], [cx + 34, 372], [cx, 340], [cx - 34, 372], [cx - 60, 380], [cx - 46, 260]], "#332c52", "#0e0c18", [[cx - 20, 170, cx - 44, 370], [cx + 20, 170, cx + 44, 370]]);
      X.line([[cx - 24, 152], [cx - 34, 260], [cx - 58, 378]], 3, "#d8b440"); X.line([[cx + 24, 152], [cx + 34, 260], [cx + 58, 378]], 3, "#d8b440");
      for (const [x, y, r] of [[cx - 40, 290, -0.3], [cx + 38, 310, 0.25], [cx - 28, 340, 0.1]]) { X.page(x, y, 22, 28, r); E(x, y - 11, 2.4, 2.4, "#6a6a78"); }
      // the inkwell in his chest, feeding red "ink" through tubes into him
      X.shape([[cx - 22, 176], [cx + 22, 176], [cx + 26, 250], [cx - 26, 250]], X.RG(cx, 212, 4, 44, [[0, "#3a0810"], [1, "#0a0204"]]));
      X.glow(cx, 220, 40, "rgba(238,58,70,0.55)"); X.shape([[cx - 12, 206], [cx + 12, 206], [cx + 16, 240], [cx - 16, 240]], X.LG(cx - 16, 0, cx + 16, 0, [[0, "#1a0206"], [0.4, "#c8182e"], [1, "#40070e"]])); E(cx, 206, 12, 4, "#ee3a46");
      for (const s of [-1, 1]) X.tube([[cx + s * 8, 208], [cx + s * 24, 190], [cx + s * 20, 164]], 2.4, 2, ["#ff8a8a", "#9a1224", "#40070e"]);
      // arms with fingers that are pen nibs; one hand unrolls the ledger to the floor
      X.tube([[cx - 30, 158], [cx - 56, 220], [cx - 50, 270]], 7, 5, ["#6a5f9a", "#221e38", "#07060c"]);
      for (let i = 0; i < 5; i++) { const a = 1.2 + (i - 2) * 0.22, x0 = cx - 50, y0 = 274; X.shape([[x0 - 1.6, y0], [x0 + 1.6, y0], [x0 + Math.cos(a) * 34, y0 + Math.sin(a) * 34]], X.LG(x0, y0, x0 + Math.cos(a) * 34, y0 + Math.sin(a) * 34, [[0, "#dcdce4"], [0.5, "#f6e07a"], [1, "#5a3c0e"]])); }
      X.tube([[cx + 30, 158], [cx + 60, 200], [cx + 64, 250]], 7, 5, ["#6a5f9a", "#221e38", "#07060c"]); X.hand(cx + 64, 258, 8, 1.5, "#dcdce4", 5, 1.5);
      X.shape([[cx + 50, 262], [cx + 80, 262], [cx + 86, 440 + b * 4], [cx + 56, 450 + b * 4]], X.LG(cx + 50, 0, cx + 86, 0, [[0, "#bab08e"], [0.5, "#f4eed6"], [1, "#948a70"]]));
      for (let i = 0; i < 16; i++) X.line([[cx + 58 + i * 0.3, 276 + i * 10.5], [cx + 70 + (i * 7 % 10), 276 + i * 10.5]], 1.4, i % 4 ? "rgba(20,20,30,0.7)" : "rgba(154,18,36,0.9)");
      E(cx + 68, 262, 17, 6, "#948a70");
      // a long neck of vertebrae up to the skull
      for (let i = 0; i < 6; i++) X.vol(cx + Math.sin(ph * TAU + i * 0.5) * 2, 146 - i * 9, 7, 5, bone3);
      // the head: a bird skull, monocle, tiny hat, and a beak that is a long split nib, dripping
      X.vol(cx, 76, 28, 26, ["#fff6e0", "#c8bca2", "#4a4238"]);
      X.shape([[cx + 14, 70], [cx + 110, 88 + b * 2], [cx + 14, 94]], X.LG(cx + 14, 0, cx + 110, 0, [[0, "#c8bca2"], [0.4, "#f6e07a"], [0.8, "#b08a28"], [1, "#2e1e06"]]));
      X.line([[cx + 40, 84], [cx + 110, 88 + b * 2]], 1.6, "#2e1e06"); E(cx + 44, 84, 3, 3, "#2e1e06");
      X.drip(cx + 106, 90 + b * 2, 22 + b * 6, 2.4, "#9a1224");
      for (let i = 0; i < 4; i++) X.eyeHD(cx + 24 + i * 14, 78 + i * 1.5, 2.6 - i * 0.3, "#ee3a46", { slit: true });
      E(cx - 6, 72, 12, 13, "#07060c"); X.eyeHD(cx - 6, 72, 6, "#f6e07a", { glow: "rgba(246,224,122,0.7)", slit: true });
      X.c.strokeStyle = "#d8b440"; X.c.lineWidth = 2.4; X.c.beginPath(); X.c.arc(cx - 6, 72, 12, 0, TAU); X.c.stroke(); X.line([[cx - 16, 80], [cx - 30, 150]], 1, "#d8b440");
      X.R(cx - 20, 30, 34, 26, "#0e0c18"); X.R(cx - 30, 52, 54, 6, "#0e0c18"); X.R(cx - 20, 46, 34, 4, "#9a1224");
    } },

    // ---- The Tollkeeper: a clerk the desert kept. Bound in receipts, a wax seal for a face, stamp-blocks for hands.
    tollkeeper: { w: 64, h: 116, rim: "#ffd680", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 128, E = X.E, paper = ["#f4eed6", "#bab08e", "#4a4238"];
      // ledger pages growing from his shoulders like shelf fungus
      for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1, k = Math.floor(i / 2); X.page(cx + s * (40 + k * 10), 150 - k * 16 + Math.sin(ph * TAU + i) * 2, 34 - k * 3, 20, s * (0.5 + k * 0.12), "#e8dfc2", "rgba(90,40,20,0.6)"); }
      for (const s of [-1, 1]) X.tube([[cx + s * 12, 320], [cx + s * 14, 400], [cx + s * 12, 450]], 5, 3.5, bone3);
      for (const s of [-1, 1]) E(cx + s * 16, 452, 14, 6, "#36241a");
      // the rotted Guild coat over a body bound in receipt strips
      X.shape([[cx - 30, 150], [cx + 30, 150], [cx + 36, 330], [cx - 36, 330]], X.LG(cx - 36, 0, cx + 36, 0, [[0, "#ddd4b0"], [0.5, "#bab08e"], [1, "#6a6250"]]));
      for (let i = 0; i < 16; i++) { const y = 156 + i * 11; X.line([[cx - 32, y + (i % 2) * 4], [cx + 32, y + 6 - (i % 2) * 4]], 4, i % 3 ? "#e8dfc2" : "#c8bca2"); X.line([[cx - 24, y + 2], [cx + 10, y + 3]], 0.8, "rgba(80,40,20,0.5)"); }
      for (let i = 0; i < 6; i++) E(cx - 20 + X.rng() * 40, 170 + X.rng() * 150, 6, 4, "rgba(118,56,26,0.45)");
      X.cloth([[cx - 36, 146], [cx - 16, 146], [cx - 20, 330], [cx - 48, 380], [cx - 58, 300]], "#76381a", "#2a1208", [[cx - 30, 170, cx - 46, 360]]);
      X.cloth([[cx + 36, 146], [cx + 16, 146], [cx + 20, 330], [cx + 48, 380], [cx + 58, 300]], "#76381a", "#2a1208", [[cx + 30, 170, cx + 46, 360]]);
      for (let i = 0; i < 6; i++) X.line([[cx - 56 + i * 4, 300 + i * 12], [cx - 50 + i * 4, 330 + i * 10]], 1.4, "#1e0e06");
      // a necklace of toll coins, strung on wire
      for (let i = 0; i < 11; i++) { const a = 0.35 + i * 0.22; X.coin(cx + Math.cos(a) * 32, 140 + Math.sin(a) * 30, 5, a); }
      // right hand: a great wooden stamp raised to fall; left: bone fingers holding a lantern that drips coins
      X.tube([[cx + 30, 156], [cx + 60, 120], [cx + 62, 70 + b * 10]], 6, 5, paper);
      X.shape([[cx + 50, 64 + b * 10], [cx + 74, 64 + b * 10], [cx + 72, 30 + b * 10], [cx + 52, 30 + b * 10]], X.LG(cx + 50, 0, cx + 74, 0, [[0, "#9a6c3a"], [0.5, "#58391e"], [1, "#1e140c"]]));
      E(cx + 62, 30 + b * 10, 14, 8, "#9a6c3a"); X.R(cx + 36, 64 + b * 10, 52, 14, "#3a2616"); X.R(cx + 36, 76 + b * 10, 52, 8, "#9a1224");
      X.tube([[cx - 30, 156], [cx - 60, 210], [cx - 58, 250]], 6, 5, paper); X.hand(cx - 58, 256, 8, 1.5, "#e8e0cc", 5, 1.5);
      X.line([[cx - 58, 262], [cx - 58, 290]], 2, "#4e2410"); X.glow(cx - 58, 312, 44, "rgba(255,190,80,0.8)");
      X.shape([[cx - 72, 292], [cx - 44, 292], [cx - 40, 330], [cx - 76, 330]], X.LG(cx - 76, 0, cx - 40, 0, [[0, "#2e1e06"], [0.5, "#fff0a0"], [1, "#2e1e06"]]));
      for (let i = 0; i < 4; i++) X.line([[cx - 72 + i * 10, 292], [cx - 74 + i * 11, 330]], 1.4, "#2e1e06");
      for (let i = 0; i < 6; i++) { const t = (ph + i / 6) % 1; X.coin(cx - 58 + Math.sin(i) * 6, 336 + t * 110, 4.5, i); }
      // the head: a cracked wax seal for a face, a coin-slot mouth, two stamped eye-holes; the rotted Guild cap
      X.vol(cx, 96, 36, 38, ["#ff6a6a", "#9a1224", "#2a0308"]);
      X.c.strokeStyle = "#6a0c18"; X.c.lineWidth = 3; X.c.beginPath(); X.c.arc(cx, 96, 28, 0, TAU); X.c.stroke();
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; E(cx + Math.cos(a) * 36, 96 + Math.sin(a) * 38, 4, 4, "#9a1224"); }
      X.crack(cx - 10, 70, 40, 1.2, "#2a0308", 1.6); X.crack(cx + 14, 110, 26, -0.5, "#2a0308", 1.4);
      for (const s of [-1, 1]) { E(cx + s * 13, 90, 7, 7, "#07060c"); X.glow(cx + s * 13, 90, 18, "rgba(255,200,80,0.9)"); E(cx + s * 13, 90, 2.2, 2.2, "#fff0a0"); }
      X.R(cx - 14, 112, 28, 5, "#07060c"); X.glow(cx, 114, 14, "rgba(255,200,80,0.5)");
      X.shape([[cx - 40, 66], [cx - 30, 40], [cx + 30, 40], [cx + 40, 66]], X.LG(0, 40, 0, 66, [[0, "#76381a"], [1, "#2a1208"]])); X.R(cx - 44, 62, 88, 6, "#1e0e06"); X.coin(cx, 52, 6);
    } },

    // ---- Corvin: a lord the salt took slowly. Crystals burst from his shoulders; one arm is all crystal; a cracked gold mask.
    corvin: { w: 104, h: 118, rim: "#e8ecff", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 208, E = X.E, salt = ["#ffffff", "#a6aac2", "#565a74"], sk = ["#ffffff", "#cacee0", "#7e829c"];
      // the throne of salt spires and coin heaps
      for (let i = 0; i < 17; i++) { const o = i - 8, L = 260 - Math.abs(o) * 22 + (i % 3) * 20; X.crystal(cx + o * 22, 380, L, -Math.PI / 2 + o * 0.07, 16 - Math.abs(o) * 0.6, salt); }
      for (let i = 0; i < 6; i++) X.glow(cx - 160 + i * 64, 160 + (i % 2) * 60, 22, "rgba(255,255,255,0.6)", 0.4 + 0.4 * Math.sin(ph * TAU + i));
      for (let i = 0; i < 60; i++) X.coin(cx - 190 + X.rng() * 380, 430 + X.rng() * 36, 6 + X.rng() * 3, X.rng());
      for (let i = 0; i < 6; i++) X.page(cx - 170 + i * 66, 440 + (i % 2) * 10, 30, 22, (X.rng() - 0.5) * 0.8);
      // seated: robe of deep purple and gold over legs gone to salt
      X.cloth([[cx - 70, 200], [cx + 70, 200], [cx + 110, 330], [cx + 130, 440], [cx - 130, 440], [cx - 110, 330]], "#463e6e", "#141222", [[cx - 40, 220, cx - 90, 430], [cx + 40, 220, cx + 90, 430]]);
      X.line([[cx - 108, 330], [cx + 108, 330]], 4, "#d8b440"); X.line([[cx - 128, 436], [cx + 128, 436]], 5, "#d8b440");
      for (let i = 0; i < 9; i++) { const x = cx - 96 + i * 24; X.line([[x, 336], [x + 6, 352], [x, 368], [x - 6, 384], [x, 400]], 1.6, "rgba(216,180,64,0.8)"); X.coin(x, 420, 4); }
      for (let i = 0; i < 30; i++) { const x = cx - 110 + X.rng() * 220, y = 360 + X.rng() * 76; X.crystal(x, y, 8 + X.rng() * 12, -Math.PI / 2 + (X.rng() - 0.5), 2.5, salt); }
      for (let i = 0; i < 5; i++) X.crack(cx - 80 + i * 40, 230, 60, Math.PI / 2 + (X.rng() - 0.5) * 0.5, "rgba(202,206,224,0.8)", 2.4);
      for (const s of [-1, 1]) { X.crystal(cx + s * 80, 440, 40, -Math.PI / 2 + s * 0.5, 9, salt); X.crystal(cx + s * 50, 440, 30, -Math.PI / 2 - s * 0.3, 7, salt); }
      // torso of white statue-skin, glowing cracks, a heavy gold chain and medallion
      X.shape([[cx - 60, 110], [cx + 60, 110], [cx + 70, 220], [cx - 70, 220]], X.LG(cx - 70, 0, cx + 70, 0, [[0, "#ffffff"], [0.5, "#cacee0"], [1, "#7e829c"]]));
      for (let i = 0; i < 10; i++) { X.crack(cx - 50 + X.rng() * 100, 120 + X.rng() * 90, 30, X.rng() * TAU, "#ffcf4a", 2.2); }
      X.glow(cx, 170, 60, "rgba(255,207,74,0.25)");
      for (let i = 0; i < 17; i++) { const a = 0.3 + i * 0.16; E(cx + Math.cos(a) * 52, 118 + Math.sin(a) * 58, 5, 4, "#d8b440"); }
      X.coin(cx, 184, 16); E(cx, 184, 7, 7, "#9a1224");
      // crystals erupting from his shoulders and back
      for (const s of [-1, 1]) for (let i = 0; i < 6; i++) X.crystal(cx + s * (50 + i * 6), 120 - i * 2, 50 + i * 12, -Math.PI / 2 + s * (0.4 + i * 0.18), 9 + i, salt);
      // left arm: flesh-white, holding golden scales tipped to one side; right arm: crystal all the way down, a spike for a hand
      X.tube([[cx - 62, 124], [cx - 100, 190], [cx - 104, 250]], 14, 11, sk); X.hand(cx - 104, 262, 13, 1.5, "#dfe2ee", 5, 1.2);
      X.line([[cx - 104, 268], [cx - 104, 300]], 2.4, "#d8b440"); X.line([[cx - 140, 300 + b * 4], [cx - 68, 300 - b * 4]], 3, "#d8b440");
      for (const [x, dy] of [[cx - 140, b * 4], [cx - 68, -b * 4]]) { X.line([[x, 300 + dy], [x - 12, 322 + dy], [x + 12, 322 + dy], [x, 300 + dy]], 1.2, "#d8b440"); E(x, 324 + dy, 14, 4, "#b08a28"); }
      X.coin(cx - 140, 318 + b * 4, 5); X.coin(cx - 136, 314 + b * 4, 5);
      for (let i = 0; i < 5; i++) X.crystal(cx + 62 + i * 14, 130 + i * 30, 44, 0.9 + i * 0.12, 13 - i, salt);
      X.crystal(cx + 124, 270, 70, 1.3, 10, salt);
      // the head: half a cracked gold mask, half salt with a wet red eye weeping crystals; a crown of salt
      X.shape([[cx - 36, 60], [cx - 30, 28], [cx, 20], [cx + 30, 28], [cx + 36, 60], [cx + 28, 104], [cx, 114], [cx - 28, 104]], X.RG(cx + 8, 56, 4, 60, [[0, "#ffffff"], [0.6, "#cacee0"], [1, "#7e829c"]]));
      X.c.save(); X.c.beginPath(); X.c.rect(cx - 60, 0, 60, 130); X.c.clip();
      X.shape([[cx - 36, 60], [cx - 30, 28], [cx, 20], [cx + 2, 114], [cx - 28, 104]], X.LG(cx - 36, 20, cx, 114, [[0, "#fff0a0"], [0.4, "#d8b440"], [1, "#5a3c0e"]]));
      E(cx - 16, 62, 8, 4, "#2e1e06"); X.line([[cx - 26, 90], [cx - 6, 94]], 2.4, "#5a3c0e");
      X.c.restore();
      X.line([[cx, 20], [cx - 4, 50], [cx + 4, 70], [cx - 2, 114]], 2.4, "#2e1e06");
      X.eyeHD(cx + 16, 62, 7, "#c8182e", { blood: true, look: [-0.5, 0.1], core: "#ff7a6a" });
      for (let i = 0; i < 3; i++) X.crystal(cx + 16 + i * 2, 70 + i * 8, 10, Math.PI / 2, 2, salt);
      X.line([[cx + 6, 94], [cx + 24, 92]], 2, "#565a74");
      for (let i = 0; i < 7; i++) X.crystal(cx - 30 + i * 10, 30, 24 + (i % 2) * 18, -Math.PI / 2 + (i - 3) * 0.12, 5, salt);
    } },

    // ---- Maw: Nell's father, given a ship that can't sink. Fused to the hull, his jaw an angler's trap, a lantern for a lure.
    maw: { w: 96, h: 118, rim: "#6cf0f0", paint(X, ph) {
      const b = Math.sin(ph * TAU), cx = 192, E = X.E, drown = ["#a4b8a6", "#44584e", "#1e2a26"], wood = ["#9a6c3a", "#58391e", "#1e140c"];
      // the hull he grew into: planks, ribs, portholes with eyes behind them
      X.shape([[cx - 150, 300], [cx + 150, 300], [cx + 130, 420], [cx + 70, 468], [cx - 70, 468], [cx - 130, 420]], X.LG(0, 300, 0, 468, [[0, "#78502a"], [1, "#1e140c"]]));
      for (let i = 0; i < 7; i++) X.line([[cx - 146 + i * 3, 316 + i * 22], [cx + 146 - i * 3, 316 + i * 22]], 2, "#1e140c");
      for (let i = 0; i < 40; i++) { const x = cx - 130 + X.rng() * 260, y = 320 + X.rng() * 140; E(x, y, 5, 4, "#c8bca2"); E(x, y - 1, 2, 1.6, "#4a4238"); }
      for (let i = 0; i < 4; i++) { const x = cx - 96 + i * 64, y = 370 + (i % 2) * 20; E(x, y, 17, 17, "#9a5226"); E(x, y, 13, 13, "#08141e"); X.eyeHD(x, y, 8, "#ffcf4a", { look: [Math.sin(ph * TAU + i), 0.2], slit: true }); X.alpha(0.35, () => E(x - 4, y - 4, 5, 3, "#ffffff")); }
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) X.tube([[cx + s * 60, 300], [cx + s * (110 + i * 12), 260 - i * 30], [cx + s * (130 + i * 14), 300 - i * 34]], 6, 4, bone3);
      for (let i = 0; i < 12; i++) X.line([[cx - 140 + i * 24, 300], [cx - 144 + i * 24 + Math.sin(ph * TAU + i) * 8, 340], [cx - 138 + i * 24, 380]], 3, i % 2 ? "#465228" : "#2e361c");
      // the sailor's torso, bloated and grey, coat in rags, an anchor chain run straight through him
      X.vol(cx, 230, 86, 90 + b * 2, drown);
      for (let i = 0; i < 8; i++) X.veins(cx - 60 + X.rng() * 120, 170 + X.rng() * 110, 34, X.rng() * TAU, 3, "rgba(30,42,38,0.7)", 1.8);
      for (const s of [-1, 1]) X.cloth([[cx + s * 30, 144], [cx + s * 86, 160], [cx + s * 100, 320], [cx + s * 44, 312]], "#523828", "#1e140c", [[cx + s * 60, 170, cx + s * 80, 300]]);
      for (let i = 0; i < 10; i++) X.line([[cx - 100 + i * 22, 312], [cx - 98 + i * 22, 330 + (i * 13 % 17)]], 4, "#36241a");
      X.chain([[cx - 150, 150], [cx - 40, 220], [cx + 60, 250], [cx + 160, 330]], 11, "#4e2410", "#bc7038"); E(cx - 40, 220, 10, 8, "#2a0810"); E(cx + 60, 250, 10, 8, "#2a0810");
      // the harpoon arm and the anchor
      X.tube([[cx + 80, 170], [cx + 124, 220], [cx + 150, 200]], 16, 12, drown); X.line([[cx + 150, 200], [cx + 180, 60]], 5, "#58391e");
      X.shape([[cx + 180, 60], [cx + 170, 84], [cx + 182, 78], [cx + 190, 40], [cx + 194, 80], [cx + 188, 84]], "#9a9aa8");
      X.tube([[cx - 80, 170], [cx - 126, 230], [cx - 130, 290]], 16, 12, drown); X.hand(cx - 130, 302, 16, 1.6, "#8ea898", 5, 1.1);
      X.line([[cx - 130, 310], [cx - 130, 420]], 7, "#76381a"); X.line([[cx - 160, 330], [cx - 100, 330]], 6, "#76381a");
      X.line([[cx - 176, 390], [cx - 170, 420], [cx - 130, 432], [cx - 90, 420], [cx - 84, 390]], 7, "#76381a"); X.line([[cx - 176, 390], [cx - 170, 420], [cx - 130, 432]], 2, "#bc7038");
      // the head: sailor's cap, milky eyes, a beard of tentacles, and a lower jaw that opens into an angler's trap
      X.vol(cx, 104, 48, 44, drown);
      X.eyeHD(cx - 18, 92, 9, "#a6e2dc", { milk: "#cad8c8", noPupil: true, blood: true }); X.eyeHD(cx + 18, 90, 9, "#a6e2dc", { milk: "#cad8c8", noPupil: true, blood: true });
      const jaw = 30 + b * 10; X.mouth(cx, 128 + jaw * 0.4, 50, 18 + jaw * 0.6, { teeth: 14, long: 2.3, lip: "#2e403a", toothCol: "#dfe8e0" });
      for (let i = 0; i < 10; i++) { const x = cx - 40 + i * 9; X.tube([[x, 150 + jaw], [x + Math.sin(ph * TAU + i) * 10, 180 + jaw], [x - 6 + Math.sin(ph * TAU * 2 + i) * 8, 210 + jaw]], 4, 1.6, ["#a6e2dc", "#3f8a90", "#10283a"]); }
      X.shape([[cx - 44, 70], [cx + 44, 70], [cx + 38, 40], [cx - 38, 40]], X.LG(0, 40, 0, 70, [[0, "#221e38"], [1, "#07060c"]])); E(cx, 70, 56, 8, "#141222"); E(cx, 50, 8, 5, "#d8b440");
      X.tube([[cx - 10, 42], [cx - 30, 10], [cx - 70, 0], [cx - 90, 30 + b * 5]], 3, 2, drown);
      X.glow(cx - 90, 38 + b * 5, 44, "rgba(108,240,240,0.9)"); E(cx - 90, 38 + b * 5, 9, 9, X.RG(cx - 92, 36 + b * 5, 0, 9, [[0, "#ffffff"], [1, "#3f8a90"]]));
      for (let i = 0; i < 12; i++) { const y = 300 - ((ph * 300 + i * 25) % 300); E(cx - 120 + (i * 53 % 240), y, 2 + i % 3, 2 + i % 3, "rgba(166,226,220,0.4)"); }
    } },
  };
  for (const [id, V] of Object.entries(VILLAIN_HD)) BOSS_ART[id] = { w: V.w, h: V.h, hd: true, key: id, rim: V.rim, ramps: [], paint: V.paint };
  for (const [id, M] of Object.entries(MONSTERS)) if (M.boss && (BOSS_ART[M.sprite] || BOSS_ART[id])) M.tall = true;
  const ART_FRAMES = 6, artCache = new Map(), hdUsed = new Map(), hdPending = new Set();
  const artMemo = new Map();
  const bossArtFor = u => {   // the fine art for any monster: a boss's own painting, or the body its kind shares, in its colours
    const M = u && MONSTERS[u.id]; if (!M) return null;
    if (u.phase2) { const p2 = p2ArtFor(u); if (p2) return p2; }   // a boss in its second form (SECOND PHASES)
    if (M.boss && (BOSS_ART[u.id] || BOSS_ART[u.sprite])) { const k = BOSS_ART[u.id] && u.id !== u.sprite ? u.id : u.sprite; const A = u.id === "oldmouth" ? BOSS_ART.angler : BOSS_ART[k]; A.key = A.key || (u.id === "oldmouth" ? "oldmouth" : k); return A; }
    const base = REG_ART_ID[u.id] || REG_ART[u.sprite]; if (!base) return null;
    if (artMemo.has(u.id)) return artMemo.get(u.id);
    const v = REG_ART_ID[u.id] ? null : VARIANT[u.id] || null, sc = (v && v.scale) || (M.boss ? 1.6 : 1);
    const A = { key: "reg:" + u.id, w: Math.round(base.w * sc), h: Math.round(base.h * sc), scale: sc, v: v && v.hue !== undefined ? v : null, ramps: v && v.hue !== undefined ? variantRamps(base.ramps, v) : base.ramps, paint: base.paint, regular: !M.boss };
    artMemo.set(u.id, A); return A;
  };
  function artFrame(A, key, phase, white) {
    const k = key + "|" + phase + (white ? "|w" : "");
    if (A.hd) hdUsed.set(key, performance.now());
    let fr = artCache.get(k); if (fr) return fr;
    if (white) { const base = artFrame(A, key, phase, false); fr = document.createElement("canvas"); fr.width = base.width; fr.height = base.height; const c = fr.getContext("2d"); c.drawImage(base, 0, 0); c.globalCompositeOperation = "source-in"; c.fillStyle = "#ffffff"; c.fillRect(0, 0, fr.width, fr.height); if (artCache.has(key + "|" + phase)) artCache.set(k, fr); return fr; }
    if (A.hd && !A.sync) {   // a main villain: the first frame paints now, the rest a frame at a time in the background
      const have = [...Array(ART_FRAMES).keys()].map(p => artCache.get(key + "|" + p)).find(Boolean);
      if (have) { if (!hdPending.has(k)) { hdPending.add(k); setTimeout(() => { hdPending.delete(k); A.sync = true; try { artFrame(A, key, phase, false); } finally { A.sync = false; } }, 30 + hdPending.size * 60); } return have; }
    }
    if (A.hd) {   // a main villain: painted at high definition and kept smooth; a villain unseen for a few seconds is let go
      const now = performance.now(); for (const [old, t] of hdUsed) if (old !== key && now - t > 4000) { hdUsed.delete(old); for (const ck of [...artCache.keys()]) if (ck.startsWith(old + "|")) artCache.delete(ck); }
      fr = document.createElement("canvas"); fr.width = A.w * HD_D; fr.height = A.h * HD_D;
      const c = fr.getContext("2d"); c.scale(HD_S, HD_S);
      try { A.paint(hdKit(c, artKit(c, 1234 + key.length * 77)), phase / ART_FRAMES); } catch (e) { console.error("villain art", key, e); }
      c.setTransform(1, 0, 0, 1, 0, 0); finishHD(c, fr.width, fr.height, A.rim);
      artCache.set(k, fr); return fr;
    }
    fr = document.createElement("canvas"); fr.width = A.w * ART_D; fr.height = A.h * ART_D;
    const c = fr.getContext("2d");
    if (A.scale && A.scale !== 1) c.scale(A.scale, A.scale);
    try { A.paint(artKit(c, 1234 + key.length * 77), phase / ART_FRAMES, A.variant); } catch (e) { console.error("monster art", key, e); }
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (A.v) recolour(c, fr.width, fr.height, A.v);
    quantize(c, fr.width, fr.height, A.ramps);
    artCache.set(k, fr); return fr;
  }
  const HIRES_Q = [];
  const _drawBattleMonsterArt = drawBattleMonster;
  drawBattleMonster = function (g2, u, cx, cy) {
    const A = bossArtFor(u);
    if (!A) return _drawBattleMonsterArt(g2, u, cx, cy);
    const key = A.key, phase = Math.floor(((time * (A.regular ? 1.3 : 0.9) + (A.regular ? cx * 0.013 : 0)) % 1) * ART_FRAMES), white = u.hurt > 0 && Math.floor(u.hurt * 30) % 2 === 0;
    const fr = artFrame(A, key, phase, white), x = cx - A.w / 2, y = cy - A.h + 2;
    if (battle && mode === "battle" && !cine) {   // the fine version is drawn on the screen itself, after the picture
      const m = g2.getTransform ? g2.getTransform() : { e: 0, f: 0 };
      HIRES_Q.push({ fr, x: x + m.e, y: y + m.f, w: A.w, h: A.h, alpha: g2.globalAlpha });
      return;
    }
    const sm = g2.imageSmoothingEnabled; g2.imageSmoothingEnabled = true; g2.drawImage(fr, Math.round(x), Math.round(y), A.w, A.h); g2.imageSmoothingEnabled = sm;
  };

