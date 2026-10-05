  // ================================================================== DRAWING: PROPS & AMBIENCE
  function drawProp(g, pr, x, y) {
    x = Math.round(x); y = Math.round(y);
    const R = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(x + dx, y + dy, w, h); };
    const sh = (w = 7) => { g.fillStyle = "rgba(20,14,40,.28)"; g.beginPath(); g.ellipse(x, y + 6, w, 2.4, 0, 0, Math.PI * 2); g.fill(); };
    const k = pr.seed, t = time;
    switch (pr.type) {
      case "lamp": {
        sh(4); R(-1, -14, 2, 20, "#3a2a1e"); R(-3, -18, 6, 5, "#1b1633"); R(-2, -17, 4, 3, "#ffcf4a");
        const a = 0.18 + Math.sin(t * 6 + k * 20) * 0.03, gr = g.createRadialGradient(x, y - 15, 1, x, y - 15, 22);
        gr.addColorStop(0, `rgba(255,200,110,${a * 2})`); gr.addColorStop(1, "rgba(255,200,110,0)"); g.fillStyle = gr; g.fillRect(x - 22, y - 37, 44, 44); break; }
      case "stall": sh(9); R(-8, -4, 16, 10, "#8a5533"); R(-8, -4, 16, 2, "#6b3f24"); R(-9, -16, 1, 20, "#6b3f24"); R(8, -16, 1, 20, "#6b3f24");
        for (let i = 0; i < 6; i++) R(-9 + i * 3, -18, 3, 5, i % 2 ? "#f2ead8" : pr.color); R(-6, -6, 3, 2, "#ff8a5c"); R(-1, -6, 3, 2, "#6fbf62"); R(4, -6, 3, 2, "#ffcf4a"); break;
      case "barrel": sh(5); R(-4, -6, 8, 12, "#1b1633"); R(-3, -5, 6, 10, "#8a5533"); R(-3, -3, 6, 1, "#5e5680"); R(-3, 2, 6, 1, "#5e5680"); break;
      case "crate": sh(6); R(-5, -6, 10, 11, "#1b1633"); R(-4, -5, 8, 9, "#b98a52"); R(-4, -5, 8, 1, "#d9a86c"); R(-4, -1, 8, 1, "#8a5533"); R(-1, -5, 1, 9, "#8a5533"); break;
      case "sign": sh(4); R(-1, -8, 2, 14, "#6b3f24"); R(-7, -13, 14, 7, "#1b1633"); R(-6, -12, 12, 5, "#b98a52"); R(-4, -10, 8, 1, "#6b3f24");
        if (Math.hypot(pr.px - G.px, pr.py - G.py) < 20 && mode === "play") drawPrompt(g, x, y - 18); break;
      case "cart": sh(10); R(-9, -8, 18, 7, "#1b1633"); R(-8, -7, 16, 5, "#8a5533"); R(-8, -7, 16, 1, "#b98a52"); R(-7, -2, 5, 5, "#1b1633"); R(-6, -1, 3, 3, "#6b3f24"); R(4, 0, 6, 2, "#6b3f24"); R(9, -10, 1, 6, "#6b3f24"); R(-5, -10, 7, 3, "#d8d0c0"); R(6, 2, 3, 1, "#7a1a22"); break;
      case "deadtree": sh(6); R(-1, -16, 3, 22, "#4a3a2e"); R(-6, -14, 5, 1, "#4a3a2e"); R(-6, -18, 1, 4, "#4a3a2e"); R(2, -11, 6, 1, "#4a3a2e"); R(7, -15, 1, 4, "#4a3a2e"); R(0, -20, 1, 4, "#4a3a2e");
        if (k > 0.6) { R(4, -10, 1, 5, "#857ea5"); R(3, -5, 3, 3, "#d8d0c0"); } break;
      case "pillar": sh(5); g.fillStyle = "#1b1633"; g.beginPath(); g.moveTo(x - 5, y + 5); g.lineTo(x - 3, y - 16); g.lineTo(x + 1, y - 22); g.lineTo(x + 5, y - 12); g.lineTo(x + 5, y + 5); g.fill();
        g.fillStyle = "#e8ffff"; g.beginPath(); g.moveTo(x - 4, y + 4); g.lineTo(x - 2, y - 15); g.lineTo(x + 1, y - 20); g.lineTo(x + 4, y - 12); g.lineTo(x + 4, y + 4); g.fill(); R(-1, -14, 1, 14, "#b8f4f8"); R(2, -10, 1, 12, "#cfeff5"); break;
      case "skulls": R(-5, 1, 4, 3, "#f6f2e8"); R(-4, 2, 1, 1, "#3a2a2a"); R(1, 2, 4, 3, "#f6f2e8"); R(3, 3, 1, 1, "#3a2a2a"); R(-2, 0, 5, 2, "#e8e2d8"); break;
      case "reeds": for (let i = 0; i < 3; i++) { const sw = Math.round(Math.sin(t * 2 + k * 10 + i) * 1.2); R(-4 + i * 3 + sw, -8 + (i % 2) * 2, 1, 10 - (i % 2) * 2, "#3a7a3a"); R(-4 + i * 3 + sw, -9 + (i % 2) * 2, 1, 3, "#8a5a33"); } break;
      case "mushrooms": R(-3, 1, 1, 3, "#e8e2d8"); R(-5, -1, 5, 2, "#c8102e"); R(-4, -1, 1, 1, "#fff"); R(2, 2, 1, 2, "#e8e2d8"); R(1, 1, 3, 1, "#9a3f7a"); break;
      case "flowers": R(-3, 1, 2, 2, "#ff8ab0"); R(2, 3, 2, 2, "#ffd24a"); R(0, -1, 2, 2, "#b08aff"); break;
      case "statue": sh(7); R(-6, -24, 12, 30, "#1b1633"); R(-5, -23, 10, 28, "#5e5680"); R(-4, -28, 8, 7, "#1b1633"); R(-3, -27, 6, 6, "#7c74a2"); R(-2, -25, 1, 1, "#1b1633"); R(1, -25, 1, 1, "#1b1633"); R(-2, -22, 1, 4, "#9ef0f5"); R(-5, -14, 10, 2, "#433d63"); R(-7, 4, 14, 2, "#433d63"); break;
      case "candles": for (const [dx, h] of [[-4, 6], [0, 9], [4, 5]]) { R(dx, 4 - h, 2, h, "#f2e6b0"); const fl = Math.round(Math.sin(t * 9 + dx + k * 5)); R(dx, 1 - h + fl, 2, 2, "#ffcf4a"); R(dx, 2 - h, 1, 1, "#fff1b0"); } R(-5, 4, 11, 1, "#7a1a22"); break;
      case "chains": for (let i = 0; i < 6; i++) R(Math.round(Math.sin(t + k * 6) * (i / 3)), -24 + i * 4, 2, 3, i % 2 ? "#857ea5" : "#5e5680"); R(-1, 0, 4, 3, "#857ea5"); break;
      case "grave": R(-3, -6, 7, 10, "#1b1633"); R(-2, -5, 5, 8, "#aba4c8"); R(-2, -5, 5, 1, "#c8c2e0"); R(0, -4, 1, 4, "#5e5680"); R(-1, -3, 3, 1, "#5e5680"); break;
      case "cairn": sh(9); R(-8, -2, 16, 8, "#857ea5"); R(-6, -8, 12, 7, "#aba4c8"); R(-4, -13, 8, 6, "#857ea5"); R(-2, -17, 4, 5, "#c8c2e0");
        R(-4, -14 + Math.round(Math.sin(t * 3) * 1), 9, 2, "#3ee0e8"); R(4, -13 + Math.round(Math.sin(t * 3 + 1)), 3, 5, "#1fb8c2"); break;
      case "tower": sh(12); R(-10, -34, 20, 40, "#1b1633"); R(-9, -33, 18, 38, "#857ea5"); for (let i = 0; i < 4; i++) R(-9, -28 + i * 9, 18, 1, "#5e5680");
        R(-11, -38, 4, 5, "#857ea5"); R(-3, -38, 5, 5, "#857ea5"); R(6, -38, 5, 5, "#857ea5"); R(-3, -24, 5, 7, "#120f24"); R(-2, -2, 4, 8, "#120f24"); R(4, -36, 4, 10, "#a8403a"); R(4, -36, 1, 16, "#3a2a1e"); break;
      case "campfire": { sh(8); R(-6, 2, 12, 3, "#4a3a2e"); R(-5, 0, 3, 3, "#6b3f24"); R(2, 0, 3, 3, "#6b3f24");
        const f = Math.sin(t * 12 + k * 7);
        g.fillStyle = "#c8102e"; g.beginPath(); g.moveTo(x - 5, y + 2); g.lineTo(x, y - 9 - f * 2); g.lineTo(x + 5, y + 2); g.fill();
        g.fillStyle = "#ffcf4a"; g.beginPath(); g.moveTo(x - 3, y + 2); g.lineTo(x + f, y - 5); g.lineTo(x + 3, y + 2); g.fill();
        const gr = g.createRadialGradient(x, y - 2, 1, x, y - 2, 30); gr.addColorStop(0, "rgba(255,150,60,.35)"); gr.addColorStop(1, "rgba(255,150,60,0)"); g.fillStyle = gr; g.fillRect(x - 30, y - 32, 60, 60);
        if (Math.random() < 0.08 && !REDUCED) particles.push({ x: pr.px + rand(-2, 2), y: pr.py - 6, vx: rand(-6, 6), vy: -rand(20, 40), life: rand(0.4, 0.9), color: "#ffb14a", size: 1, world: true });
        break; }
      case "shrine": { sh(10); R(-9, -22, 18, 26, OUT); R(-8, -21, 16, 24, "#aba4c8"); R(-8, -21, 16, 3, "#c8c2e0"); R(-5, -16, 10, 14, "#332e4f");
        const done = (G.flags.tones || []).length && SHRINES.some(s2 => s2.x === pr.x && s2.y - 1 === pr.y && (G.flags.tones || []).includes(s2.id));
        const a = done ? 0.9 : 0.35 + Math.sin(t * 3 + k * 5) * 0.25; g.fillStyle = `rgba(158,240,245,${a})`; g.fillRect(x - 3, y - 13, 6, 8); R(-10, 3, 20, 2, "#857ea5");
        if (Math.hypot(pr.px - G.px, pr.py + 16 - G.py) < 26 && mode === "play" && G.stage === 10) drawPrompt(g, x, y - 28); break; }
      case "whirlpool": { for (let i = 0; i < 4; i++) { g.strokeStyle = `rgba(200,240,255,${0.5 - i * 0.1})`; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 4 + i * 5 + Math.sin(t * 3 + i) * 1.5, t * (2 + i) , t * (2 + i) + Math.PI * 1.4); g.stroke(); } break; }
      case "board": sh(9); R(-9, -18, 18, 13, OUT); R(-8, -17, 16, 11, "#8a5533"); R(-6, -15, 5, 4, "#e8e2d0"); R(1, -15, 5, 6, "#e8e2d0"); R(-5, -10, 4, 3, "#e8e2d0"); R(-7, -5, 1, 10, "#6b3f24"); R(6, -5, 1, 10, "#6b3f24"); R(-5, -14, 3, 1, "#8a1020"); R(2, -13, 3, 1, "#8a1020");
        if (Math.hypot(pr.px - G.px, pr.py - G.py) < 22 && mode === "play") drawPrompt(g, x, y - 24); break;
      case "banner": { const w = Math.round(Math.sin(t * 2 + k * 8) * 1); R(-1, -14, 2, 4, "#3a2a1e"); R(-4, -11, 8, 12 + w, "#c9a227"); R(-4, -11, 8, 2, "#8a6a2a"); R(-2, -6, 4, 4, "#1b1633"); R(-1, -5, 2, 2, "#c8102e"); break; }
    }
  }
  function drawTablet(g, x, y, fresh) {
    x = Math.round(x); y = Math.round(y);
    if (fresh) { const gr = g.createRadialGradient(x, y - 4, 1, x, y - 4, 14); gr.addColorStop(0, `rgba(158,240,245,${0.35 + Math.sin(time * 3) * 0.1})`); gr.addColorStop(1, "rgba(158,240,245,0)"); g.fillStyle = gr; g.fillRect(x - 14, y - 18, 28, 28); }
    g.fillStyle = "rgba(20,14,40,.28)"; g.beginPath(); g.ellipse(x, y + 5, 6, 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1b1633"; g.fillRect(x - 5, y - 9, 10, 14); g.fillStyle = fresh ? "#c8c2e0" : "#857ea5"; g.fillRect(x - 4, y - 8, 8, 12); g.fillRect(x - 3, y - 10, 6, 2);
    g.fillStyle = fresh ? "#3ee0e8" : "#5e5680"; for (let i = 0; i < 3; i++) g.fillRect(x - 2, y - 6 + i * 3, 4, 1);
    if (Math.hypot(x + camX - G.px, y + camY - G.py) < 20 && mode === "play") drawPrompt(g, x, y - 16);
  }
  function drawAmbient(g, ox, oy) {
    if (REDUCED) return;
    const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE), t0 = get(tx, ty);
    const reg = REGIONS.find(r => tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1);
    const name = t0 === T.DARK ? "cathedral" : reg ? reg.name : "";
    for (let i = 0; i < 28; i++) {
      const h1 = hash(i, 91), h2 = hash(i, 93);
      if (name === "The Drowned Grove") {
        const x = (h1 * VIEW_W + Math.sin(time * .7 + i) * 14) % VIEW_W, y = (h2 * VIEW_H + Math.cos(time * .5 + i * 2) * 10) % VIEW_H;
        const a = Math.max(0, Math.sin(time * 2 + i * 1.7)); g.fillStyle = `rgba(200,255,120,${a * .9})`; g.fillRect(Math.round(x), Math.round(y), 1, 1);
        g.fillStyle = `rgba(200,255,120,${a * .25})`; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
      } else if (name === "cathedral") {
        const x = (h1 * VIEW_W + time * 3 * (h2 - .5)) % VIEW_W, y = VIEW_H - ((h2 * VIEW_H + time * (6 + h1 * 6)) % VIEW_H);
        g.fillStyle = i % 3 ? "rgba(255,180,90,.5)" : "rgba(158,240,245,.45)"; g.fillRect(Math.round(x), Math.round(y), 1, 1);
      } else if (name === "Gates of Oru" && G.stage >= 6) {
        const x = (h1 * (VIEW_W + 40) - time * 30) % (VIEW_W + 40), y = (h2 * VIEW_H + time * 190) % VIEW_H;
        g.fillStyle = "rgba(170,200,240,.55)"; g.fillRect(Math.round((x + VIEW_W + 40) % (VIEW_W + 40)), Math.round(y), 1, 4);
      } else if (name === "Kessa") {
        if (i > 8) break;
        const x = (h1 * VIEW_W + Math.sin(time * .4 + i) * 20) % VIEW_W, y = (h2 * VIEW_H - time * 4) % VIEW_H;
        g.fillStyle = "rgba(255,240,200,.25)"; g.fillRect(Math.round(x), Math.round((y + VIEW_H) % VIEW_H), 1, 1);
      } else {
        const x = (h1 * VIEW_W + time * (40 + h2 * 50)) % (VIEW_W + 30) - 15, y = h2 * VIEW_H + Math.sin(time + i) * 3;
        g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(Math.round(x), Math.round(y), 3 + Math.round(h1 * 4), 1);
      }
    }
    if (G.stage >= 6 && name === "Gates of Oru") { g.fillStyle = "rgba(20,40,80,.18)"; g.fillRect(0, 0, VIEW_W, VIEW_H); }
  }

