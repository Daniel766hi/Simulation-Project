  // ================================================================== DRAWING: MONSTERS
  function drawFieldMonster(g, f, x, y) {
    x = Math.round(x); y = Math.round(y);
    const lead = MONSTERS[f.group[0]].sprite, bobv = Math.round(Math.abs(Math.sin(f.t * 5)) * 2);
    g.fillStyle = "rgba(20,14,40,.3)"; g.beginPath(); g.ellipse(x, y + 1, 7, 2.5, 0, 0, Math.PI * 2); g.fill();
    if (f.elite) { g.fillStyle = "#ffcf4a"; g.fillRect(x - 3, y - 26, 7, 2); g.fillRect(x - 3, y - 28, 1, 2); g.fillRect(x, y - 28, 1, 2); g.fillRect(x + 3, y - 28, 1, 2); }
    if (drawFieldMonster2(g, f, lead, x, y, bobv)) return;
    if (lead === "jackal") {
      g.fillStyle = "#1b1633"; g.fillRect(x - 8, y - 9 - bobv, 16, 7); g.fillStyle = "#a3242e"; g.fillRect(x - 7, y - 8 - bobv, 12, 5);
      g.fillStyle = "#f2ead8"; g.fillRect(x - 7, y - 8 - bobv, 12, 1); g.fillRect(x + 4, y - 11 - bobv, 5, 5); g.fillStyle = "#1b1633"; g.fillRect(x + 6, y - 10 - bobv, 1, 1);
      g.fillStyle = "#5a0f18"; g.fillRect(x - 6, y - 3, 2, 3); g.fillRect(x + 2, y - 3, 2, 3);
    } else if (lead === "leech") {
      g.fillStyle = "#1b1633"; g.fillRect(x - 8, y - 8, 16, 8); g.fillStyle = "#6b2a5a"; g.fillRect(x - 7, y - 7 - bobv / 2, 14, 6); g.fillStyle = "#9a3f7a"; g.fillRect(x - 7, y - 7 - bobv / 2, 14, 2);
      g.fillStyle = "#c8102e"; g.fillRect(x + 4, y - 6, 3, 3);
    } else if (lead === "choir") {
      const fl = Math.round(Math.sin(f.t * 3) * 2);
      g.fillStyle = "#1b1633"; g.fillRect(x - 5, y - 18 + fl, 10, 16); g.fillStyle = "#d8d4e8"; g.fillRect(x - 4, y - 17 + fl, 8, 15);
      g.fillStyle = "#1b1633"; g.fillRect(x - 3, y - 15 + fl, 2, 2); g.fillRect(x + 1, y - 15 + fl, 2, 2); g.fillStyle = "#c8102e"; g.fillRect(x - 3, y - 13 + fl, 2, 3); g.fillRect(x + 1, y - 13 + fl, 2, 3);
    } else if (lead === "wraith") {
      const fl = Math.round(Math.sin(f.t * 3) * 2);
      g.globalAlpha = 0.85; g.fillStyle = "#1b1633"; g.fillRect(x - 5, y - 18 + fl, 10, 14); g.fillStyle = "#9ab8d8"; g.fillRect(x - 4, y - 17 + fl, 8, 12);
      g.fillStyle = "#d8ecff"; g.fillRect(x - 4, y - 17 + fl, 8, 3); for (let i = 0; i < 3; i++) g.fillRect(x - 4 + i * 3, y - 5 + fl, 2, 2 + (i % 2) * 2);
      g.fillStyle = "#3ee0e8"; g.fillRect(x - 2, y - 14 + fl, 1, 2); g.fillRect(x + 1, y - 14 + fl, 1, 2); g.globalAlpha = 1;
    } else if (lead === "crawler") {
      const leg = Math.round(Math.sin(f.t * 8));
      g.fillStyle = "#1b1633"; g.fillRect(x - 8, y - 9, 16, 7); g.fillStyle = "#f2ead8"; g.fillRect(x - 7, y - 8, 14, 5); g.fillStyle = "#c8c2b0"; for (let i = 0; i < 3; i++) g.fillRect(x - 6 + i * 5, y - 8, 1, 5);
      g.fillStyle = "#f2ead8"; for (let i = 0; i < 3; i++) { g.fillRect(x - 9 - i + leg, y - 3 + i, 2, 1); g.fillRect(x + 7 + i - leg, y - 3 + i, 2, 1); } g.fillRect(x - 11, y - 11, 3, 3); g.fillRect(x + 8, y - 11, 3, 3);
      g.fillStyle = "#c8102e"; g.fillRect(x - 2, y - 7, 1, 1); g.fillRect(x + 1, y - 7, 1, 1);
    } else if (lead === "drowned") {
      g.fillStyle = "#1b1633"; g.fillRect(x - 5, y - 18 - bobv, 10, 16); g.fillStyle = "#5a7a8a"; g.fillRect(x - 4, y - 17 - bobv, 8, 14);
      g.fillStyle = "#8ab0b8"; g.fillRect(x - 3, y - 16 - bobv, 6, 5); g.fillStyle = "#1b1633"; g.fillRect(x - 2, y - 14 - bobv, 1, 1); g.fillRect(x + 1, y - 14 - bobv, 1, 1);
      g.fillStyle = "#2a5a3a"; g.fillRect(x - 4, y - 11 - bobv, 2, 6); g.fillStyle = "#857ea5"; g.fillRect(x + 5, y - 22 - bobv, 1, 18); g.fillStyle = "#3a8fbf"; g.fillRect(x - 3, y - 2, 6, 1);
    } else {
      g.fillStyle = "#1b1633"; g.fillRect(x - 5, y - 17 - bobv, 10, 15); g.fillStyle = "#e8e2f0"; g.fillRect(x - 4, y - 16 - bobv, 8, 13);
      g.fillStyle = "#a3242e"; g.fillRect(x - 3, y - 10 - bobv, 6, 4); g.fillStyle = "#f2ead8"; g.fillRect(x - 3, y - 9 - bobv, 6, 1); g.fillRect(x - 3, y - 7 - bobv, 6, 1);
      g.fillStyle = "#1b1633"; g.fillRect(x - 2, y - 14 - bobv, 1, 2); g.fillRect(x + 1, y - 14 - bobv, 1, 2); g.fillStyle = "#c8102e"; g.fillRect(x - 2, y - 13 - bobv, 1, 1);
      g.fillStyle = "#1b1633"; g.fillRect(x - 3, y - 3, 2, 3); g.fillRect(x + 1, y - 3, 2, 3);
    }
    if (f.group.length > 1) { g.fillStyle = "#1b1633"; g.fillRect(x + 6, y - 20, 7, 7); g.fillStyle = "#c8102e"; g.fillRect(x + 7, y - 19, 5, 5); pixGlyph(g, String(f.group.length), x + 8, y - 18, "#ffffff"); }
  }
  function drawBattleMonster(g, u, cx, cy) {
    const t = time, hurt = u.hurt > 0 && Math.floor(u.hurt * 30) % 2 === 0;
    const R = (x, y, w, h, c) => { g.fillStyle = hurt ? "#ffffff" : c; g.fillRect(Math.round(cx + x), Math.round(cy + y), w, h); };
    const drip = (x, y, len, c = "#c8102e") => { const l = Math.round((Math.sin(t * 2 + x) * 0.5 + 0.5) * len); R(x, y, 1, l, c); R(x, y + l, 2, 1, c); };
    const tri = (x, y, w, h, c) => { g.fillStyle = hurt ? "#fff" : c; g.beginPath(); g.moveTo(cx + x, cy + y + h); g.lineTo(cx + x + w / 2, cy + y); g.lineTo(cx + x + w, cy + y + h); g.fill(); };
    const sp = u.sprite;
    if (sp === "ghoul") {
      const b = Math.round(Math.sin(t * 2) * 1.5);
      R(-10, -46 + b, 20, 40, "#1b1633"); R(-9, -45 + b, 18, 38, "#e8e2f0");
      for (let i = 0; i < 4; i++) { R(-7, -30 + i * 5 + b, 14, 2, "#a3242e"); R(-6, -30 + i * 5 + b, 12, 1, "#f2ead8"); }
      R(-7, -44 + b, 14, 12, "#d8d0e6"); R(-5, -40 + b, 3, 4, "#1b1633"); R(2, -40 + b, 3, 4, "#1b1633"); R(-4, -39 + b, 1, 1, "#ff2d2d"); R(3, -39 + b, 1, 1, "#ff2d2d");
      R(-5, -34 + b, 10, 6, "#5a0f18"); for (let i = 0; i < 5; i++) R(-4 + i * 2, -34 + b, 1, 2, "#f2ead8");
      R(-16, -34 + b, 6, 3, "#e8e2f0"); R(-18, -31 + b, 3, 12, "#e8e2f0"); R(-19, -19 + b, 2, 4, "#1b1633"); R(-17, -19 + b, 1, 5, "#1b1633");
      R(10, -34 + b, 6, 3, "#e8e2f0"); R(15, -31 + b, 3, 12, "#e8e2f0"); R(16, -19 + b, 2, 4, "#1b1633");
      R(-7, -7, 4, 7, "#1b1633"); R(3, -7, 4, 7, "#1b1633");
      drip(-3, -28 + b, 8); drip(4, -26 + b, 6); drip(-16, -18 + b, 5);
    } else if (sp === "jackal") {
      const run = Math.round(Math.sin(t * 6) * 2);
      R(-18, -26, 34, 14, "#1b1633"); R(-17, -25, 32, 12, "#a3242e");
      for (let i = 0; i < 6; i++) R(-15 + i * 5, -25, 3, 2, "#f2ead8");
      for (let i = 0; i < 4; i++) R(-12 + i * 5, -20, 2, 6, "#6b0f1d");
      R(12, -34, 14, 12, "#1b1633"); R(13, -33, 12, 10, "#f2ead8"); R(16, -30, 3, 3, "#1b1633"); R(17, -29, 1, 1, "#ff2d2d");
      R(20, -25, 7, 3, "#5a0f18"); for (let i = 0; i < 4; i++) R(20 + i * 2, -25, 1, 2, "#ffffff");
      R(-14 + run, -13, 3, 12, "#6b0f1d"); R(-6 - run, -13, 3, 12, "#6b0f1d"); R(6 + run, -13, 3, 12, "#6b0f1d"); R(12 - run, -13, 3, 12, "#6b0f1d");
      R(-22, -28, 5, 3, "#a3242e"); drip(0, -13, 6); drip(22, -22, 5);
    } else if (sp === "leech" || sp === "leechling") {
      const k = sp === "leechling" ? 0.55 : 1, sw = Math.sin(t * 2.5 + cx);
      for (let i = 0; i < 5; i++) { const w = Math.round((26 - Math.abs(i - 2) * 4) * k + sw * (i % 2 ? 2 : -2)); R(-w / 2 - 1, (-12 - i * 8) * k, w + 2, Math.round(9 * k), "#1b1633"); R(-w / 2, (-11 - i * 8) * k, w, Math.round(7 * k), i % 2 ? "#6b2a5a" : "#7d3468"); R(-w / 2, (-11 - i * 8) * k, w, 2, "#a0508a"); }
      R(-9 * k, -52 * k, 18 * k, 12 * k, "#1b1633"); R(-8 * k, -51 * k, 16 * k, 10 * k, "#5a0f18");
      for (let i = 0; i < 6; i++) { R((-7 + i * 3) * k, -51 * k, 1, 3, "#f2ead8"); R((-7 + i * 3) * k, -44 * k, 1, 3, "#f2ead8"); }
      R(-3 * k, -48 * k, 6 * k, 4 * k, "#c8102e"); drip(-6 * k, -40 * k, 10 * k); drip(5 * k, -38 * k, 8 * k);
    } else if (sp === "choir") {
      const fl = Math.round(Math.sin(t * 2) * 3);
      R(-11, -52 + fl, 22, 46, "#1b1633"); R(-10, -51 + fl, 20, 44, "#d8d4e8"); R(-10, -30 + fl, 20, 2, "#9a94b0");
      R(-7, -50 + fl, 14, 14, "#efeaf8"); R(-5, -46 + fl, 3, 3, "#1b1633"); R(2, -46 + fl, 3, 3, "#1b1633");
      R(-5, -43 + fl, 3, 5, "#c8102e"); R(2, -43 + fl, 3, 5, "#c8102e");
      R(-3, -40 + fl, 6, 4, "#1b1633");
      R(-16, -32 + fl, 6, 10, "#d8d4e8"); R(-15, -38 + fl, 2, 6, "#f2e6b0"); R(-15, -41 + fl, 2, 3, "#ffcf4a");
      for (let i = 0; i < 4; i++) R(-9 + i * 5, -7 + fl, 3, 4 + (i % 2) * 3, "#d8d4e8");
      drip(-4, -38 + fl, 8); drip(3, -38 + fl, 9);
    } else if (sp === "wraith") {
      const fl = Math.round(Math.sin(t * 2.2 + cx) * 4);
      g.save(); g.globalAlpha *= 0.88;
      R(-12, -60 + fl, 24, 44, "#1b1633"); R(-11, -59 + fl, 22, 42, "#7a98b8"); R(-11, -59 + fl, 22, 12, "#b8d4f0");
      for (let i = 0; i < 5; i++) R(-11 + i * 5, -18 + fl, 3, 6 + (i % 2) * 5, "#7a98b8");
      R(-7, -54 + fl, 14, 12, "#0d1a2e"); R(-4, -50 + fl, 2, 3, "#3ee0e8"); R(2, -50 + fl, 2, 3, "#3ee0e8"); R(-2, -45 + fl, 4, 3, "#1b1633");
      R(-20, -44 + fl, 9, 3, "#b8d4f0"); R(-22, -41 + fl, 3, 8, "#b8d4f0"); R(11, -44 + fl, 9, 3, "#b8d4f0"); R(19, -41 + fl, 3, 8, "#b8d4f0");
      g.restore(); drip(-6, -24 + fl, 8, "#9ef0f5"); drip(5, -22 + fl, 10, "#9ef0f5");
    } else if (sp === "crawler") {
      const lg = Math.round(Math.sin(t * 5) * 2);
      R(-22, -30, 44, 20, "#1b1633"); R(-21, -29, 42, 18, "#f2ead8");
      for (let i = 0; i < 6; i++) { R(-19 + i * 7, -29, 2, 18, "#c8c2b0"); R(-19 + i * 7, -32, 5, 4, "#f2ead8"); }
      for (let i = 0; i < 4; i++) { R(-28 - lg + i * 2, -12 + i * 3, 8, 2, "#e8e2d0"); R(20 + lg - i * 2, -12 + i * 3, 8, 2, "#e8e2d0"); }
      R(-34, -44, 10, 8, "#f2ead8"); R(-34, -36, 4, 10, "#f2ead8"); R(-36, -48, 4, 6, "#f2ead8"); R(-28, -48, 4, 6, "#f2ead8");
      R(24, -44, 10, 8, "#f2ead8"); R(30, -36, 4, 10, "#f2ead8"); R(24, -48, 4, 6, "#f2ead8"); R(32, -48, 4, 6, "#f2ead8");
      R(-8, -38, 16, 10, "#e8e2d0"); R(-6, -35, 3, 3, "#1b1633"); R(3, -35, 3, 3, "#1b1633"); R(-5, -34, 1, 1, "#ff2d2d"); R(4, -34, 1, 1, "#ff2d2d");
      drip(-10, -12, 8); drip(12, -12, 6); drip(-31, -28, 6);
    } else if (sp === "wyrm") {
      const b = Math.sin(t * 1.3) * 3, p2 = u.phase2, body = p2 ? "#c84a4a" : "#b8c8d8", dark = p2 ? "#6b0f1d" : "#5e5680", hi = p2 ? "#ff8a8a" : "#e8ffff";
      for (let i = 0; i < 9; i++) {
        const a = i / 8 * Math.PI * 1.4 - 0.2, rx = Math.cos(a + t * 0.4) * (34 - i * 1.5), ry = -14 - i * 7 + Math.sin(a * 2 + t) * 3 + b * (i / 8);
        const w = 22 - i; R(rx - w / 2 - 1, ry - 6, w + 2, 12, "#1b1633"); R(rx - w / 2, ry - 5, w, 10, body); R(rx - w / 2, ry - 5, w, 2, hi);
        if (i % 2) { g.fillStyle = hurt ? "#fff" : "#9ef0f5"; g.beginPath(); g.moveTo(cx + rx - 3, cy + ry - 5); g.lineTo(cx + rx, cy + ry - 12); g.lineTo(cx + rx + 3, cy + ry - 5); g.fill(); }
      }
      const hx = Math.cos(1.4 * Math.PI - 0.2 + t * 0.4) * 22, hy = -84 + b;
      R(hx - 16, hy - 12, 32, 22, "#1b1633"); R(hx - 15, hy - 11, 30, 20, body); R(hx - 15, hy - 11, 30, 4, hi);
      R(hx - 10, hy - 6, 5, 4, "#1b1633"); R(hx + 5, hy - 6, 5, 4, "#1b1633"); R(hx - 9, hy - 5, 2, 2, p2 ? "#ffcf4a" : "#ff2d2d"); R(hx + 6, hy - 5, 2, 2, p2 ? "#ffcf4a" : "#ff2d2d");
      R(hx - 12, hy + 3, 24, 7, "#5a0f18"); for (let i = 0; i < 8; i++) { R(hx - 11 + i * 3, hy + 3, 1, 3, "#f2ead8"); R(hx - 11 + i * 3, hy + 7, 1, 3, "#f2ead8"); }
      tri(hx - 16, hy - 26, 8, 16, dark); tri(hx + 8, hy - 26, 8, 16, dark); tri(hx - 4, hy - 30, 8, 18, "#9ef0f5");
      if (u.charged) { g.strokeStyle = `rgba(232,255,255,${0.5 + Math.sin(t * 12) * 0.3})`; g.lineWidth = 2; g.beginPath(); g.arc(cx + hx, cy + hy, 26 + Math.sin(t * 8) * 3, 0, Math.PI * 2); g.stroke(); }
      drip(hx - 6, hy + 10, 12); drip(hx + 5, hy + 10, 9); drip(-20, -10, 8);
    } else if (sp === "drowned") {
      const b = Math.round(Math.sin(t * 1.8 + cx) * 1.5);
      R(-11, -52 + b, 22, 46, "#1b1633"); R(-10, -51 + b, 20, 44, "#4a6a7a"); R(-10, -51 + b, 20, 12, "#5a7a8a");
      R(-8, -62 + b, 16, 14, "#1b1633"); R(-7, -61 + b, 14, 12, "#8ab0b8"); R(-7, -61 + b, 14, 3, "#2a5a3a");
      R(-5, -56 + b, 3, 3, "#0d2030"); R(2, -56 + b, 3, 3, "#0d2030"); R(-4, -55 + b, 1, 1, "#9ef0f5"); R(3, -55 + b, 1, 1, "#9ef0f5");
      R(-4, -51 + b, 8, 2, "#0d2030");
      for (let i = 0; i < 3; i++) R(-9 + i * 6, -40 + b, 2, 16, "#2a5a3a");
      R(12, -70 + b, 2, 64, "#857ea5"); R(10, -74 + b, 6, 6, "#b8bccc"); R(14, -68 + b, 4, 2, "#b8bccc");
      R(-8, -7, 5, 7, "#1b1633"); R(3, -7, 5, 7, "#1b1633");
      drip(-6, -30 + b, 10, "#3a8fbf"); drip(4, -26 + b, 12, "#3a8fbf"); drip(0, -48 + b, 6);
    } else if (sp === "butcher") {
      const b = Math.round(Math.sin(t * 1.6) * 1.5);
      R(-20, -70 + b, 40, 64, "#1b1633"); R(-19, -69 + b, 38, 62, "#c99a7a"); R(-17, -54 + b, 34, 46, "#d8d0c0");
      for (const [x, y] of [[-12, -46], [4, -40], [-6, -30], [8, -22], [-14, -18]]) { R(x, y + b, 7, 5, "#8a1020"); R(x + 2, y + 5 + b, 2, 4, "#6b0f1d"); }
      R(-12, -86 + b, 24, 18, "#1b1633"); R(-11, -85 + b, 22, 16, "#c99a7a"); R(-11, -85 + b, 22, 5, "#3a2a1e");
      R(-8, -78 + b, 5, 2, "#1b1633"); R(3, -78 + b, 5, 2, "#1b1633"); R(-7, -77 + b, 2, 1, "#ff2d2d"); R(4, -77 + b, 2, 1, "#ff2d2d");
      R(-6, -73 + b, 12, 3, "#5a0f18");
      for (const [x, y] of [[-19, -60], [14, -50], [-10, -64]]) { R(x, y + b, 8, 5, "#6b2a5a"); R(x + 1, y + 1 + b, 6, 1, "#a0508a"); }
      R(20, -60 + b, 6, 30, "#c99a7a"); R(22, -76 + b, 3, 22, "#6b3f24"); R(18, -86 + b, 16, 12, "#b8bccc"); R(18, -86 + b, 16, 2, "#e8ecf8"); R(22, -80 + b, 8, 5, "#8a1020");
      R(-26, -60 + b, 6, 26, "#c99a7a"); R(-30, -34 + b, 3, 12, "#857ea5"); R(-33, -24 + b, 6, 3, "#857ea5"); R(-33, -27 + b, 3, 3, "#857ea5");
      R(-12, -8, 8, 8, "#1b1633"); R(4, -8, 8, 8, "#1b1633");
      drip(-8, -40 + b, 12); drip(10, -30 + b, 10); drip(26, -74 + b, 14); drip(-31, -22 + b, 8);
    } else if (sp === "mother") {
      const pul = Math.sin(t * 2) * 2;
      g.fillStyle = hurt ? "#fff" : "#1b1633"; g.beginPath(); g.ellipse(cx, cy - 34, 50 + pul, 36 + pul * .5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#8a6a8a"; g.beginPath(); g.ellipse(cx, cy - 34, 48 + pul, 34 + pul * .5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#a888a8"; g.beginPath(); g.ellipse(cx - 8, cy - 46, 30, 14, -0.2, 0, Math.PI * 2); g.fill();
      for (const [x, y] of [[-32, -40], [-18, -22], [-4, -50], [12, -26], [26, -44], [34, -22], [-40, -24], [4, -12]]) { R(x - 3, y - 3, 7, 7, "#1b1633"); R(x - 2, y - 2, 5, 5, "#5a0f18"); R(x - 1, y - 2, 1, 1, "#f2ead8"); R(x + 1, y - 2, 1, 1, "#f2ead8"); R(x, y + 1, 1, 1, "#f2ead8"); }
      for (const [x, y] of [[-14, -36], [6, -40]]) { R(x - 4, y - 5, 9, 10, "#d8c0a8"); R(x - 2, y - 2, 2, 2, "#1b1633"); R(x + 1, y - 2, 2, 2, "#1b1633"); R(x - 2, y + 2, 5, 2, "#5a0f18"); }
      for (const [x, d] of [[-44, 1], [44, -1]]) { R(x, -34, 4 * d || 4, 3, "#d8c0a8"); R(x + 4 * d, -34, 3, 22, "#d8c0a8"); R(x + 4 * d - 1, -12, 5, 3, "#d8c0a8"); }
      drip(-20, -4, 10); drip(18, -6, 12); drip(0, -2, 8); drip(-36, -14, 6);
    } else if (sp === "choirmaster") {
      const b = Math.round(Math.sin(t * 1.5) * 2);
      R(-14, -92 + b, 28, 86, "#1b1633"); R(-13, -91 + b, 26, 84, "#1a1830"); R(-13, -91 + b, 26, 6, "#5a1020");
      for (let i = 0; i < 6; i++) R(-12 + i * 4, -84 + b, 2, 60, "#2a2448");
      R(-9, -108 + b, 18, 18, "#1b1633"); R(-8, -107 + b, 16, 16, "#efeaf8");
      for (let i = 0; i < 4; i++) R(-6 + i * 4, -104 + b, 2, 2, "#1b1633");
      R(-6, -98 + b, 12, 2, "#5a0f18"); for (let i = 0; i < 6; i++) R(-6 + i * 2, -100 + b, 1, 5, "#1b1633");
      R(-22, -80 + b, 8, 4, "#efeaf8"); R(-26, -80 + b, 4, 26, "#efeaf8"); R(-27, -56 + b, 6, 6, "#efeaf8"); R(-26, -54 + b, 4, 1, "#5a0f18"); R(-26, -52 + b, 4, 1, "#5a0f18");
      R(14, -80 + b, 8, 4, "#efeaf8"); R(20, -96 + b + Math.round(Math.sin(t * 4) * 4), 3, 22, "#f2ead8"); R(19, -98 + b + Math.round(Math.sin(t * 4) * 4), 5, 3, "#f2ead8");
      if (u.charged) { g.strokeStyle = `rgba(158,240,245,${0.5 + Math.sin(t * 10) * 0.3})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy - 60, 40 + Math.sin(t * 6) * 4, 0, Math.PI * 2); g.stroke(); }
      drip(-4, -96 + b, 10); drip(3, -96 + b, 12); drip(-24, -50 + b, 8);
    } else if (sp === "voss") {
      const b = Math.round(Math.sin(t * 1.4) * 2), p2 = u.phase2;
      R(-18, -80 + b, 36, 74, "#1b1633"); R(-17, -79 + b, 34, 72, "#2e2a58"); R(-17, -79 + b, 34, 4, "#ffcf4a");
      R(-13, -60 + b, 26, 30, "#b88a7a"); for (let i = 0; i < 4; i++) R(-11, -56 + i * 6 + b, 22, 2, "#8a1020");
      const ring = Math.sin(t * (p2 ? 9 : 4)) * 1.5;
      R(-8 + ring, -54 + b, 16, 14, "#1b1633"); R(-7 + ring, -53 + b, 14, 12, "#ffcf4a"); R(-8 + ring, -42 + b, 16, 2, "#ffcf4a"); R(-4 + ring, -51 + b, 3, 7, "#fff1b0");
      R(-18, -48 + b, 6, 2, "#857ea5"); R(12, -48 + b, 6, 2, "#857ea5");
      R(-12, -98 + b, 24, 20, "#1b1633"); R(-11, -97 + b, 22, 18, "#d8c8b8"); R(-11, -97 + b, 22, 6, "#e8e2f0");
      R(-7, -88 + b, 4, 3, "#1b1633"); R(3, -88 + b, 4, 3, "#1b1633"); R(-6, -87 + b, 2, 1, "#9ef0f5"); R(4, -87 + b, 2, 1, "#9ef0f5");
      R(-6, -83 + b, 12, 3, "#5a0f18"); for (let i = 0; i < 5; i++) R(-5 + i * 2.4, -83 + b, 1, 2, "#e8e2f0");
      const cr = p2 ? [[-14, -104, 10], [8, -108, 12], [-2, -112, 14], [16, -94, 8], [-22, -92, 8], [18, -70, 9], [-26, -64, 10]] : [[-12, -102, 7], [6, -104, 8], [16, -80, 6]];
      for (const [x, y, h] of cr) tri(x, y + b, 6, h, "#9ef0f5");
      R(18, -72 + b, 5, 34, "#a3242e"); for (let i = 0; i < 4; i++) R(18, -70 + i * 8 + b, 5, 2, "#f2ead8"); R(18, -38 + b, 7, 5, "#d8c8b8");
      R(-23, -72 + b, 5, 34, "#2e2a58"); R(-24, -38 + b, 7, 5, "#d8c8b8");
      R(-12, -8, 8, 8, "#1b1633"); R(4, -8, 8, 8, "#1b1633"); R(6, -12, 4, 5, "#3a2a1e");
      drip(20, -40 + b, 12); drip(-4, -30 + b, 10); drip(5, -80 + b, 6);
    } else if (sp === "hollis") {
      const b = Math.round(Math.sin(t * 1.2) * 2), p3 = u.phase3;
      g.fillStyle = hurt ? "#fff" : "#1b1633"; g.beginPath(); g.ellipse(cx, cy - 46 + b, 34, 42, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#8a6a2a"; g.beginPath(); g.ellipse(cx, cy - 46 + b, 32, 40, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hurt ? "#fff" : "#c9a227"; g.beginPath(); g.ellipse(cx, cy - 50 + b, 28, 32, 0, 0, Math.PI * 2); g.fill();
      R(-4, -80 + b, 8, 64, "#8a6a2a"); for (let i = 0; i < 5; i++) R(-2, -74 + i * 11 + b, 4, 4, "#ffcf4a");
      R(-12, -104 + b, 24, 24, "#1b1633"); R(-11, -103 + b, 22, 22, "#b8c8c8"); R(-11, -103 + b, 22, 4, "#2a5a3a");
      R(-7, -97 + b, 4, 3, "#0d2030"); R(3, -97 + b, 4, 3, "#0d2030"); R(-6, -96 + b, 2, 1, "#9ef0f5"); R(4, -96 + b, 2, 1, "#9ef0f5");
      const jaw = p3 ? 10 : 6;
      R(-10, -90 + b, 20, jaw, "#5a0f18"); for (let i = 0; i < 9; i++) { R(-9 + i * 2, -90 + b, 1, 3, "#f2ead8"); R(-9 + i * 2, -90 + jaw - 3 + b, 1, 3, "#f2ead8"); }
      for (const [x, y] of [[-26, -60], [22, -52], [-18, -30], [18, -26]]) { R(x, y + b, 9, 6, "#6b2a5a"); R(x + 1, y + 1 + b, 7, 1, "#a0508a"); R(x + 3, y + 2 + b, 3, 3, "#5a0f18"); }
      R(-38, -60 + b, 6, 30, "#b8c8c8"); R(-40, -30 + b, 8, 5, "#b8c8c8");
      R(32, -60 + b, 6, 20, "#b8c8c8"); for (let i = 0; i < 6; i++) R(36 + (i % 2), -40 + i * 5 + b, 3, 4, "#857ea5"); R(32, -12 + b, 12, 4, "#857ea5"); R(36, -16 + b, 4, 10, "#857ea5");
      if (p3) for (const [x, y, h] of [[-30, -100, 12], [22, -104, 14], [-6, -118, 12]]) tri(x, y + b, 8, h, "#3a8fbf");
      R(-16, -8, 10, 8, "#1b1633"); R(6, -8, 10, 8, "#1b1633");
      drip(-20, -12 + b, 12, "#3a8fbf"); drip(16, -10 + b, 14, "#3a8fbf"); drip(0, -84 + b, 10); drip(-8, -20 + b, 10, "#3a8fbf"); drip(24, -40 + b, 8, "#3a8fbf");
    }
    else drawBattleMonster2(g, u, cx, cy, R, drip, tri, hurt);
    if (u.splats) for (const s of u.splats) R(s.x, s.y, s.s, s.s, "#8a1020");
  }

