  // ================================================================== STORY ILLUSTRATIONS
  // Each chapter card, memorial and ending gets a small animated painting.
  const sceneCanvas = $("cardArt"), sc2 = sceneCanvas.getContext("2d");
  let sceneKey = null;
  const SCENE_BY_TITLE = {
    "The Stolen Bell": "bell", "The Butcher of the Well": "well", "The Drowned Grove": "grove", "The Salt Cathedral": "cathedral", "The Salt-Flayed": "voss",
    "The Drowned Gate": "gate", "The Rains": "rains", "The Open Gate": "granary", "The Drowning Marsh": "marsh", "Rook": "rookGrave", "The Wreck Coast": "wrecks",
    "The Three Tones": "shrines", "The Storm Spire": "spire", "The Drowned King": "whirl", "A Bell for Everyone": "endRing", "The Equal Sea": "endCrown", "The Keeper of the Deep": "endKeeper", "The Last King Sleeps": "endRing",
  };
  function setScene(title) { sceneKey = SCENE_BY_TITLE[title] || null; sceneCanvas.hidden = !sceneKey; }
  function paintScene() {
    if (!sceneKey || $("card").hidden) return;
    const g = sc2, t = time, Wd = 240, Hd = 100;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    const sky = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, Hd); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, Wd, Hd); };
    const stars = n => { for (let i = 0; i < n; i++) { const a = 0.4 + Math.sin(t * 2 + i) * 0.3; g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect((hash(i, 1) * Wd) | 0, (hash(i, 2) * 50) | 0, 1, 1); } };
    const rain = (n, a = 0.5) => { g.fillStyle = `rgba(180,200,240,${a})`; for (let i = 0; i < n; i++) { const x = (hash(i, 5) * (Wd + 30) - t * 30 + Wd + 30) % (Wd + 30) - 15, y = (hash(i, 6) * Hd + t * 160) % Hd; g.fillRect(x | 0, y | 0, 1, 4); } };
    const moon = (x, y, r, c = "#f2e6c0") => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    const person = (x, y, c, h = 12) => { R(x - 2, y - h, 4, h - 4, c); R(x - 2, y - h - 4, 4, 4, c); R(x - 2, y - 4, 1, 4, c); R(x + 1, y - 4, 1, 4, c); };
    switch (sceneKey) {
      case "bell": sky("#0c0a24", "#3a2250"); stars(40); moon(190, 22, 10);
        R(0, 78, Wd, 22, "#1a1430"); for (const [x, w, h] of [[20, 30, 18], [60, 26, 14], [150, 34, 20], [196, 28, 16]]) { R(x, 78 - h, w, h, "#241c3e"); R(x - 2, 78 - h - 4, w + 4, 5, "#3a2040"); R(x + 8, 78 - h + 6, 4, 4, Math.sin(t * 3 + x) > 0 ? "#ffcf6a" : "#8a6a3a"); }
        R(104, 18, 14, 60, "#241c3e"); R(100, 14, 22, 6, "#3a2040"); R(106, 22, 10, 12, "#0c0a18"); g.strokeStyle = "#6a5a8a"; g.beginPath(); g.moveTo(111, 22); g.lineTo(111 + Math.sin(t) * 2, 30); g.stroke();
        R(108, 30, 1, 1, "#c8102e"); R(114, 32, 1, 2, "#c8102e"); break;
      case "well": sky("#3a0a18", "#c8503a"); moon(40, 30, 14, "#ff9a5a");
        R(0, 80, Wd, 20, "#2a1a14"); for (const x of [150, 200]) { R(x, 30, 4, 50, "#1a0a0a"); for (const d of [-16, -8, 8, 16]) R(x + (d < 0 ? d : 4), 28 + Math.abs(d) / 3, Math.abs(d), 2, "#1a0a0a"); }
        for (const [x, y] of [[146, 44], [206, 50]]) { const sw = Math.sin(t * 1.5 + x) * 2; R(x + sw, 30, 1, y - 30, "#6a5a4a"); person(x + sw, y + 14, "#1a0a0a"); }
        R(90, 70, 26, 12, "#4a3a3a"); R(92, 72, 22, 6, "#1a0a0a"); R(88, 58, 3, 14, "#3a2a1a"); R(115, 58, 3, 14, "#3a2a1a"); R(86, 56, 34, 3, "#6a2020"); break;
      case "grove": sky("#0a1a14", "#2a4a3a"); stars(10);
        for (let i = 0; i < 9; i++) { const x = i * 28 + 4; R(x + 10, 28, 3, 60, "#0a140e"); for (const d of [-12, -6, 6, 12]) R(x + 11 + (d < 0 ? d : 2), 26 + Math.abs(d) / 3, Math.abs(d), 2, "#0a140e"); }
        g.fillStyle = "#08100c"; g.beginPath(); g.ellipse(120, 84, 90, 12, 0, 0, Math.PI * 2); g.fill();
        for (let i = 0; i < 6; i++) { const a = Math.max(0, Math.sin(t * 1.3 + i * 1.7)); g.fillStyle = `rgba(255,220,120,${a})`; g.fillRect(60 + i * 22, 82 + (i % 2) * 3, 2, 1); g.fillRect(64 + i * 22, 82 + (i % 2) * 3, 2, 1); }
        g.fillStyle = "rgba(200,160,220,.6)"; for (let i = 0; i < 5; i++) { const y = 84 - ((t * 8 + i * 9) % 20); g.fillRect(80 + i * 18, y | 0, 2, 2); } break;
      case "cathedral": sky("#0a0a1a", "#2a2448"); stars(30); R(0, 84, Wd, 16, "#e3dde9");
        R(70, 30, 100, 54, "#332e4f"); R(110, 8, 20, 22, "#332e4f"); R(116, 0, 8, 10, "#433d63"); for (let i = 0; i < 5; i++) R(78 + i * 20, 44, 6, 14, `rgba(158,240,245,${0.4 + Math.sin(t * 2 + i) * 0.3})`);
        R(112, 64, 16, 20, "#120f24"); R(116, 70, 8, 8, "#8a1020"); R(119, 72, 2, 2, "#ffcf4a"); break;
      case "voss": sky("#0a0814", "#2a1a34"); R(0, 82, Wd, 18, "#1a1428");
        for (let i = 0; i < 20; i++) R(40 + i * 8, 60 + Math.sin(i) * 4, 3, 22, "#9ef0f5");
        R(108, 28, 24, 54, "#2e2a58"); R(112, 16, 16, 14, "#d8c8b8"); for (const [x, h] of [[110, 10], [118, 14], [126, 9]]) { g.fillStyle = "#9ef0f5"; g.beginPath(); g.moveTo(x, 16); g.lineTo(x + 3, 16 - h); g.lineTo(x + 6, 16); g.fill(); }
        const gl = 0.5 + Math.sin(t * 6) * 0.4; g.fillStyle = `rgba(255,207,74,${gl})`; g.beginPath(); g.arc(120, 46, 10, 0, Math.PI * 2); g.fill(); R(116, 42, 8, 8, "#ffcf4a"); break;
      case "gate": sky("#0e1a2e", "#3a5a7a"); rain(60);
        R(0, 20, Wd, 50, "#1b2440"); R(96, 30, 48, 50, "#3a2a1e"); for (let x = 98; x < 144; x += 6) R(x, 30, 2, 50, "#ffcf4a");
        const lv = 80 - Math.sin(t * 0.8) * 3; R(0, lv, Wd, Hd - lv, "rgba(58,143,191,.8)"); g.fillStyle = "#c9a227"; g.beginPath(); g.ellipse(120, lv - 6, 12, 16, 0, 0, Math.PI * 2); g.fill(); R(116, lv - 30, 8, 8, "#b8c8c8"); break;
      case "rains": sky("#141c30", "#3a4a68"); R(0, 30, Wd, 50, "#2a3050"); for (let i = 0; i < 10; i++) R(i * 26, 20 + (i % 3) * 6, 20, 14, "#3a5aa8");
        R(94, 34, 52, 46, "#1a1418"); R(96, 34, 20, 46, "#3a2a1e"); R(124, 34, 20, 46, "#3a2a1e");
        for (let i = 0; i < 18; i++) person(20 + i * 12 + (Math.sin(t + i) * 1), 94, i % 3 ? "#1a1a2a" : "#2a2a3a", 10 + (i % 3) * 2);
        rain(90, 0.55); break;
      case "granary": sky("#1a2238", "#3a4a68"); R(40, 20, 160, 70, "#5a4a3a"); R(40, 16, 160, 6, "#3a5aa8"); R(100, 44, 40, 46, "#3a2a1e");
        for (let i = 0; i < 4; i++) { R(96, 50 + i * 10, 48, 2, "#8a8aa0"); R(100 + i * 12, 48, 2, 40, "#8a8aa0"); }
        for (const x of [60, 180]) { R(x - 5, 60, 10, 30, "#8a6a2a"); R(x - 4, 52, 8, 8, "#a88a3a"); R(x - 9, 64, 4, 8, "#d9a070"); R(x + 5, 64, 4, 8, "#d9a070"); R(x - 2, 55, 1, 1, "#ff6b3a"); R(x + 1, 55, 1, 1, "#ff6b3a"); }
        rain(50, 0.4); break;
      case "marsh": sky("#1a2418", "#4a5a3a"); rain(40, 0.35);
        const wl = 74 + Math.sin(t) * 2; R(0, wl, Wd, Hd - wl, "#3a5a4a");
        for (const [x, w] of [[40, 30], [90, 36], [150, 28]]) { R(x, 40, w, 16, "#8a5a33"); R(x - 2, 34, w + 4, 7, "#a8403a"); for (let k = 0; k < 3; k++) R(x + 3 + k * (w / 3), 56, 2, wl - 56 + 10, "#5a3a20"); R(x + 8, 44, 4, 4, "#ffcf6a"); }
        R(0, 62, Wd, 3, "#8a5a33"); R(196, wl - 6, 8, 6, "#e8c83a"); R(208, wl - 6, 8, 6, "#e8c83a"); R(199, wl - 5, 2, 4, "#111"); R(211, wl - 5, 2, 4, "#111"); break;
      case "rookGrave": sky("#2a2040", "#e8a070"); moon(200, 70, 16, "#ffcf8a");
        R(0, 80, Wd, 20, "#3a5a4a"); R(100, 46, 40, 6, "#8a5a33"); for (const x of [104, 134]) R(x, 52, 3, 30, "#5a3a20");
        R(108, 40, 24, 6, "#6b5a4a"); g.strokeStyle = "#8a5a33"; g.lineWidth = 2; g.beginPath(); g.arc(120, 38, 12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); R(118, 20, 2, 18, "#d8dce8"); R(117, 18, 4, 3, "#e8e2d0");
        for (let i = 0; i < 6; i++) { const y = 30 - ((t * 5 + i * 7) % 30); g.fillStyle = `rgba(255,220,160,${0.5})`; g.fillRect(110 + i * 4, y | 0, 1, 1); } break;
      case "wrecks": sky("#1a2a3e", "#6a8aa8"); const sea = 70 + Math.sin(t * 0.7) * 2; R(0, sea, Wd, Hd - sea, "#3a5a7a"); R(0, 80, Wd, 20, "#d8c89a");
        for (const [x, w, h] of [[20, 50, 20], [100, 60, 26], [180, 44, 18]]) { g.fillStyle = "#2a1a10"; g.beginPath(); g.moveTo(x, 82); g.lineTo(x + w * 0.2, 82 - h); g.lineTo(x + w, 82 - h * 0.6); g.lineTo(x + w * 0.9, 82); g.fill(); R(x + w * 0.4, 82 - h - 16, 2, 18, "#2a1a10"); }
        g.fillStyle = "rgba(220,240,255,.5)"; for (let i = 0; i < 12; i++) g.fillRect((i * 21 + t * 8) % Wd, sea + 2 + (i % 3) * 3, 8, 1); break;
      case "shrines": sky("#10101e", "#3a3a5a"); stars(30); R(0, 80, Wd, 20, "#2a2a3e");
        [["#3a8fbf", 50], ["#e8e2f0", 120], ["#3ee0e8", 190]].forEach(([c, x], i) => { R(x - 12, 50, 24, 30, "#aba4c8"); R(x - 12, 48, 24, 3, "#c8c2e0"); const a = 0.4 + Math.sin(t * 2 + i * 2) * 0.35; g.fillStyle = c; g.globalAlpha = a; g.fillRect(x - 4, 56, 8, 14); g.globalAlpha = a * 0.3; g.beginPath(); g.arc(x, 62, 22, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }); break;
      case "spire": sky("#06081a", "#1e2440");
        for (let i = 0; i < 6; i++) { g.fillStyle = "#12142a"; g.beginPath(); g.moveTo(i * 50 - 10, 100); g.lineTo(i * 50 + 20, 60 + (i % 3) * 10); g.lineTo(i * 50 + 50, 100); g.fill(); }
        R(112, 6, 16, 90, "#1e2440"); R(108, 2, 24, 6, "#2e3660"); for (let i = 0; i < 6; i++) R(118, 14 + i * 13, 4, 4, "#3ee0e8");
        if ((t % 2.4) < 0.18) { g.strokeStyle = "#e8f4ff"; g.lineWidth = 2; g.beginPath(); let x = 120, y = 0; g.moveTo(x, y); while (y < 60) { x += rand(-10, 10); y += rand(6, 12); g.lineTo(x, y); } g.stroke(); g.fillStyle = "rgba(220,240,255,.3)"; g.fillRect(0, 0, Wd, Hd); }
        rain(60, 0.4); break;
      case "whirl": sky("#02060e", "#0a1830");
        for (let i = 0; i < 7; i++) { g.strokeStyle = `rgba(160,220,255,${0.6 - i * 0.07})`; g.lineWidth = 2; g.beginPath(); g.arc(120, 50, 8 + i * 9, t * (1 + i * 0.2), t * (1 + i * 0.2) + Math.PI * 1.3); g.stroke(); }
        for (let i = 0; i < 7; i++) { R(111 + i * 3, 46, 2, 6, "#8ab0b8"); R(111 + i * 3, 44, 2, 2, "#c8d8e0"); }
        R(116, 52, 8, 8, "#c8d8e0"); R(118, 54, 1, 1, "#3ee0e8"); R(121, 54, 1, 1, "#3ee0e8"); break;
      case "endRing": sky("#3a5a8a", "#f2c08a"); moon(120, 70, 26, "#ffdf9a");
        R(0, 70, Wd, 30, "#4a7a4a"); g.fillStyle = "#3a6a3a"; g.beginPath(); g.moveTo(0, 80); g.quadraticCurveTo(60, 50, 120, 72); g.quadraticCurveTo(180, 52, 240, 76); g.lineTo(240, 100); g.lineTo(0, 100); g.fill();
        for (let i = 0; i < 22; i++) person(10 + i * 10.5, 86 + Math.sin(i) * 3, "#1a2a1a", 9 + (i % 3));
        R(116, 20, 8, 8, "#ffcf4a"); R(114, 27, 12, 2, "#ffcf4a"); for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(255,220,120,${0.5 - ((t + i) % 3) / 6})`; g.beginPath(); g.arc(120, 24, 8 + ((t * 10 + i * 10) % 30), 0, Math.PI * 2); g.stroke(); } break;
      case "endCrown": sky("#0a1a2e", "#1a3a5a"); R(0, 30, Wd, 70, "rgba(40,90,140,.9)");
        g.fillStyle = "rgba(20,40,70,.9)"; for (const x of [30, 80, 170, 210]) { g.fillRect(x, 60, 12, 40); g.fillRect(x - 3, 56, 18, 5); }
        for (let i = 0; i < 10; i++) g.fillRect(i * 24, 30 + Math.sin(t + i) * 1, 16, 1);
        for (let i = 0; i < 9; i++) { R(106 + i * 3, 70 - (i % 2) * 4, 2, 10, "#8ab0b8"); } R(110, 78, 20, 10, "#5a7a8a"); break;
      case "endKeeper": sky("#02060e", "#0a1830"); const a = 0.3 + Math.sin(t) * 0.1; g.fillStyle = `rgba(200,230,255,${a})`; g.beginPath(); g.moveTo(100, 0); g.lineTo(140, 0); g.lineTo(160, 100); g.lineTo(80, 100); g.fill();
        R(104, 60, 32, 30, "#2a3a4a"); R(100, 56, 40, 6, "#3a4a5a"); person(120, 74, "#3b2f7a", 14); R(117, 62, 6, 2, "#3ee0e8");
        for (let i = 0; i < 12; i++) { const y = 100 - ((t * 6 + i * 11) % 100); g.fillStyle = "rgba(160,220,255,.5)"; g.fillRect((60 + i * 11) | 0, y | 0, 1, 2); }
        for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(255,255,255,${0.6 - ((t * 0.5 + i / 4) % 1) * 0.6})`; g.fillRect(126 + i * 4, 54 - ((t * 8 + i * 5) % 20), 1, 1); } break;
    }
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, 0, Wd, 1); g.fillRect(0, Hd - 1, Wd, 1);
  }

