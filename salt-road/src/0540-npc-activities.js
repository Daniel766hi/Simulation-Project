  // ================================================================== NPC ACTIVITIES
  // Every NPC is doing something: working, pacing, fidgeting, or at least looking around. Drawn around them each frame.
  const ICON = {
    note: ["01100", "01010", "01000", "11000", "11000"], dots: ["00000", "00000", "10101", "00000", "00000"], bang: ["00100", "00100", "00100", "00000", "00100"],
    heart: ["01010", "11111", "11111", "01110", "00100"], zzz: ["11110", "00100", "01000", "11110", "00000"], drop: ["00100", "01110", "01110", "11111", "01110"],
  };
  function drawEmote(g2, x, y, kind, a = 1) {
    const rows = ICON[kind]; if (!rows) return; x = Math.round(x); y = Math.round(y);
    g2.globalAlpha = a; g2.fillStyle = "#1b1633"; g2.fillRect(x - 5, y - 5, 11, 10); g2.fillStyle = "#f2ead8"; g2.fillRect(x - 4, y - 4, 9, 8); g2.fillRect(x - 1, y + 4, 2, 2);
    g2.fillStyle = kind === "heart" ? "#c8102e" : kind === "drop" ? "#3a8fbf" : "#1b1633";
    rows.forEach((r, j) => [...r].forEach((c, i) => { if (c === "1") g2.fillRect(x - 2 + i, y - 3 + j, 1, 1); }));
    g2.globalAlpha = 1;
  }
  const P2 = (g2, x, y) => (a, b, w, h, c) => { g2.fillStyle = c; g2.fillRect(Math.round(x + a), Math.round(y + b), w, h); };
  const sparks = (P, t, x0, y0, seed) => { const ph = (t * 1.1 + seed) % 1; if (ph < 0.25) for (let i = 0; i < 4; i++) P(x0 + Math.cos(i * 1.7) * ph * 30, y0 - Math.abs(Math.sin(i * 2.3)) * ph * 24, 1, 1, i % 2 ? "#ffcf4a" : "#ff8a3a"); return ph; };
  const anvil = (P, dx) => { P(dx - 5, -2, 11, 3, "#1b1633"); P(dx - 4, -6, 9, 4, "#5e5680"); P(dx - 6, -7, 13, 2, "#857ea5"); P(dx - 2, -2, 5, 6, "#3a3450"); };
  // id -> { pace: px radius (walks back and forth), draw(P, t, n) }
  const ACTS = {
    nadia: { draw: (P, t) => { P(9, -4, 7, 7, "#1b1633"); P(10, -3, 5, 5, "#6b3f24"); P(10, -3, 5, 1, "#3a8fbf"); const a = Math.sin(t * 2); P(5, -14 + a * 3, 6, 1, "#8a7a6a"); if (a > 0.9) P(12, -8, 1, 2, "#6fb8e8"); } },
    nadia2: { draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 0.7) > 0.6) drawEmote(g2, x + 8, y - 30, "dots", 0.9); } },
    ilse: { draw: (P, t, n) => { anvil(P, 11); const ph = sparks(P, t, 11, -8, 0.3); P(4, -20 + (ph < 0.12 ? 8 : 0), 2, 8, "#6b3f24"); P(2, -22 + (ph < 0.12 ? 8 : 0), 6, 3, "#857ea5"); n.dir = "right"; } },
    dov: { draw: (P, t, n) => { anvil(P, -11); const ph = sparks(P, t, -11, -8, 0.7); P(-6, -20 + (ph < 0.12 ? 8 : 0), 2, 8, "#6b3f24"); P(-8, -22 + (ph < 0.12 ? 8 : 0), 6, 3, "#857ea5"); n.dir = "left"; } },
    odo: { draw: (P, t) => { const ph = (t * 0.8) % 1, h = Math.sin(ph * Math.PI) * 14; P(7, -16 - h, 2, 2, "#ffcf4a"); } },
    tam: { pace: 14, look: "up", draw: (P, t, n, g2, x, y) => { if (!n.walking && Math.sin(t * 0.5) > 0.5) drawEmote(g2, x + 8, y - 30, "dots"); } },
    abawidow: { draw: (P, t) => { for (const [dx, s] of [[-14, 0], [12, 1.7]]) { const b = Math.round(Math.abs(Math.sin(t * 3 + s)) * 1); P(dx - 4, -6, 9, 5, "#1b1633"); P(dx - 3, -5, 7, 3, "#e8e2d0"); P(dx + (s ? -5 : 3), -8 + b, 3, 3, "#d8d0c0"); P(dx + (s ? -6 : 5), -9 + b, 1, 2, "#8a7a6a"); P(dx - 3, -2, 1, 3, "#5a4a3a"); P(dx + 2, -2, 1, 3, "#5a4a3a"); } } },
    beno: { draw: (P, t) => { const a = Math.sin(t * 2.5); P(8, -18 + a * 3, 2, 18, "#6b3f24"); P(6, -1 + a * 3, 6, 2, "#857ea5"); } },
    lio: { pace: 12, draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 1.3) > 0.4) drawEmote(g2, x + 8, y - 30, "note"); } },
    ama: { draw: (P, t) => { for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1; P(6 + ph * 8, -14 - Math.sin(ph * Math.PI) * 8, 4, 3, "#f2ead8"); } P(8, -4, 10, 6, "#6b3f24"); P(9, -3, 8, 1, "#e8e2d0"); } },
    hake: { draw: (P, t, n) => { n.dir = "down"; P(4, -12, 1, 2, "#6b3f24"); for (let i = 0; i < 12; i++) P(5 + i, -14 + i * 0.3, 1, 1, "#6b3f24"); const bob = Math.round(Math.sin(t * 2.2) * 1.5); for (let i = 0; i < 14; i++) P(17, -10 + i, 1, 1, "rgba(230,230,230,.6)"); P(16, 4 + bob, 3, 3, "#c8102e"); P(16, 4 + bob, 3, 1, "#f2ead8"); } },
    mora: { draw: (P, t) => { P(9, -10, 5, 6, "#1b1633"); P(10, -9, 3, 4, "#ffcf4a"); for (let i = 0; i < 4; i++) P(-14 + i * 3, 2, 2, 4, ["#6bff9a", "#c9a6ff", "#ff6b7a", "#6fb8e8"][i]); } },
    sarn: { draw: (P, t) => { const a = Math.sin(t * 4) > 0 ? 1 : 0; P(8, -16, 3, 1, "#b8bccc"); P(8, -15 + a, 3, 1, "#b8bccc"); if (Math.sin(t * 1.3) > 0.8) P(12, -10 + ((t * 20) % 12), 2, 1, "#5a7a3a"); } },
    yusra: { draw: (P, t) => { const a = Math.sin(t * 1.5) * 2; P(-16, -12, 1, 10, "#6b5a44"); P(-22, -12 + a, 6, 1, "#c9a227"); P(-15, -12 - a, 6, 1, "#c9a227"); P(-20, -11 + a, 2, 2, "#e8b83a"); } },
    bram: { draw: (P, t) => { const a = Math.sin(t * 5) * 2; P(6 + a, -12, 4, 5, "#c8c2e0"); P(5 - a, -11, 3, 3, "#e8e2d0"); } },
    gguard: { pace: 16, draw: () => {} }, hale: { pace: 10, draw: (P) => { for (const dx of [-16, -12]) { P(dx, -6, 4, 6, "#1b1633"); P(dx + 1, -5, 2, 4, "#c8b890"); } } },
    sela: { draw: (P, t) => { const a = Math.abs(Math.sin(t * 3)) * 2; P(7, -8 + a, 8, 4, "#1b1633"); P(8, -7 + a, 6, 2, "#d9a070"); } },
    pip: { pace: 8, draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 2) > 0.7) drawEmote(g2, x + 8, y - 30, "note"); } },
    tobin: { draw: (P, t) => { P(6, -8, 10, 7, "#f2ead8"); for (let i = 0; i < 3; i++) P(7, -7 + i * 2, 4 + ((t * 6 + i) % 4), 1, "#5a4a3a"); P(12 + Math.sin(t * 8) * 2, -12, 1, 6, "#1b1633"); } },
    ines: { draw: (P, t, n, g2, x, y) => { n.dir = Math.sin(t * 0.6) > 0 ? "left" : "right"; P(7, -10, 6, 8, "#f2ead8"); if (Math.sin(t * 0.9) > 0.85) drawEmote(g2, x + 8, y - 30, "bang"); } },
    oskar: { draw: (P, t) => { const ph = (t * 1.2) % 1; P(10, -16 + (ph < 0.15 ? 6 : 0), 2, 7, "#6b3f24"); P(8, -18 + (ph < 0.15 ? 6 : 0), 6, 3, "#857ea5"); P(14, -10, 2, 14, "#8a6438"); } },
    nell: { draw: (P, t) => { sparks(P, t, 10, -6, 0.1); P(7, -10, 5, 2, "#b8bccc"); } },
    ansel: { draw: (P, t) => { P(9, -12, 5, 7, "#1b1633"); P(10, -11, 3, 5, Math.sin(t * 3) > 0 ? "#ffcf4a" : "#ffe08a"); } },
    orla: { draw: (P, t) => { for (let i = 0; i < 5; i++) { const a = t * 1.5 + i * 1.26; P(Math.cos(a) * 12, -16 + Math.sin(a) * 6, 1, 3, "rgba(180,200,240,.8)"); } } },
    tamsin: { draw: (P, t, n, g2, x, y) => { if (Math.sin(t * 0.4) > 0.3) drawEmote(g2, x + 8, y - 30, "zzz", 0.8); } },
    kest: { draw: (P, t) => { P(7, -12, 4, 6, "#1b1633"); P(8, -11, 2, 4, "#6bff9a"); if (Math.sin(t * 6) > 0.5) P(8, -15 - ((t * 10) % 4), 1, 1, "#aaffcc"); } },
    wren: { pace: 6, draw: (P) => { P(-12, -8, 8, 8, "#1b1633"); P(-11, -7, 6, 6, "#c8b890"); } },
    oldhake: null,
  };
  const REST_EMOTES = ["dots", "note", "heart", "drop"];
  function npcActivity(g2, n, x, y) {
    const t = time + (n.bob || 0), a = ACTS[n.id], P = P2(g2, x, y);
    if (a && a.draw) a.draw(P, t, n, g2, x, y);
    else {   // everyone else: looks around now and then, and sometimes has something on their mind
      const k = Math.floor(t / 3.5 + hash(n.x, n.y) * 7) % 4; if (Math.hypot(n.px - G.px, n.py - G.py) > 30) n.dir = ["down", "left", "down", "right"][k];
      const e = (t * 0.23 + hash(n.x * 3, n.y)) % 1; if (e < 0.12) drawEmote(g2, x + 8, y - 30, REST_EMOTES[Math.floor(hash(n.x, n.y * 7) * REST_EMOTES.length)], Math.min(1, e * 20));
    }
  }
  const _updateA = update;
  update = function (dt) {
    _updateA(dt);
    if (!G || (mode !== "play" && mode !== "scene")) return;
    for (const n of NPCS) {
      const a = ACTS[n.id]; if (!a || !a.pace) continue;
      if (n.hx === undefined) { n.hx = n.px; n.hy = n.py; }
      if (dlg && mode === "dialog") continue;
      const near = Math.hypot(n.hx - G.px, n.hy - G.py) < 30;
      if (near) {   // come back to their post and face you when you come close
        const dx = n.hx - n.px; n.px += dx * Math.min(1, dt * 6); n.walking = Math.abs(dx) > 1;
        if (!n.walking) n.dir = Math.abs(G.px - n.px) > Math.abs(G.py - n.py) ? (G.px > n.px ? "right" : "left") : (G.py > n.py ? "down" : "up");
        continue;
      }
      const t = time * 0.7 + (n.bob || 0), s = Math.sin(t), c = Math.cos(t);
      n.px = n.hx + s * a.pace; n.walking = Math.abs(c) > 0.25; n.dir = n.walking ? (c > 0 ? "right" : "left") : (a.look || "down");
    }
  };

