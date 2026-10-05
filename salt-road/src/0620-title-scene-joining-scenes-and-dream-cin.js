  // ================================================================== TITLE SCENE, JOINING SCENES AND DREAM CINEMATICS
  // ---- the title screen: a living pixel scene behind the title
  const tStyle = document.createElement("style");
  tStyle.textContent = "#title{background:radial-gradient(ellipse at 50% 42%,rgba(10,8,22,.35),rgba(10,8,22,.62) 60%,rgba(10,8,22,.9))}";
  document.head.appendChild(tStyle);
  function drawTitleScene(g2, t) {
    PX.bands(g2, ["#05040e", "#0a0818", "#120e24", "#1c1434", "#2a1a3e", "#3a2040"], 0, 130); PX.stars(g2, t, 90, 110); PX.moon(g2, 250, 34, 13);
    for (let i = 0; i < 3; i++) PR(g2, wrap(i * 130 - t * 4, VIEW_W + 120) - 120, 22 + i * 14, 110, 5, "#1a1430");
    PX.village(g2, 130, "#140f24"); PX.tower(g2, 238, 130, t, { bell: true });
    PR(g2, 0, 130, VIEW_W, 62, "#c8c2d8"); PR(g2, 0, 130, VIEW_W, 1, "#e8e4f0");
    for (let i = 0; i < 26; i++) PR(g2, wrap(hash(i, 51) * VIEW_W - t * 22, VIEW_W + 20) - 10, 134 + ((hash(i, 53) * 56) | 0), 4 + (i % 3) * 3, 1, "#b0aac4");
    for (let y = 150; y < 192; y += 4) PR(g2, wrap(-t * 22 + y * 3, VIEW_W), y, 30, 2, "#d8d2e6");
    chibi(g2, HEROES.sable.look, { dir: "right", walking: true, walk: t * 1.3, hero: true }, 2, 52, 186);
    for (let i = 0; i < 40; i++) { const ph = (t * (0.3 + hash(i, 5) * 0.4) + hash(i, 7)) % 1; PR(g2, VIEW_W - ph * (VIEW_W + 20), 110 + hash(i, 3) * 80, ph > 0.5 ? 2 : 1, 1, "rgba(240,236,250,.7)"); }
    if (Math.sin(t * 0.7) > 0.93) { PR(g2, 36, 168, 2, 1, "#ff3a3a"); PR(g2, 41, 168, 2, 1, "#ff3a3a"); }
  }
  const _renderT = render;
  let titleHud = false;
  render = function () {
    if (mode !== "title" || battle || cine) { if (titleHud) { titleHud = false; sceneHud(!!scene || !!cine); } return _renderT(); }
    if (!titleHud) { titleHud = true; sceneHud(true); }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; drawTitleScene(g, time); g.restore();
    ctx.imageSmoothingEnabled = false; ctx.drawImage(buf, 0, 0, canvas.width, canvas.height); HI.length = 0; $("minimap").hidden = true;
  };
  // the title screen plays the flats theme once sound is allowed
  addEventListener("pointerdown", () => { if (mode === "title") Music.play("flats"); }, { once: true });

  // ---- joining scenes: each companion steps forward with a name card
  const JOIN_BG = {
    ilse: (g2, t) => { PX.bands(g2, ["#1a0e08", "#2a160c", "#3a1e10"]); PR(g2, 0, 150, VIEW_W, 42, "#2a1a10"); PR(g2, 230, 90, 60, 60, "#3a2414"); PX.fire(g2, 238, 140, 44, 30, t); PR(g2, 60, 136, 34, 8, OUT); PR(g2, 61, 137, 32, 6, "#5e5680"); },
    maru: (g2, t) => { nightBg(g2, t); PX.moon(g2, 60, 40, 10); PR(g2, 0, 150, VIEW_W, 42, "#d8b878"); PR(g2, 200, 150, 90, 12, "#2a7fae"); },
    rook: (g2, t) => AREA_BG.grove(g2, t),
    ada: (g2, t) => AREA_BG.cathedral(g2, t),
    ren: (g2, t) => { PX.bands(g2, ["#e8a878", "#d89070", "#b87a6a"], 0, 150); PR(g2, 0, 150, VIEW_W, 42, "#8a8498"); PR(g2, 40, 40, 240, 110, "#5e5680"); PR(g2, 130, 70, 60, 80, "#3a2a1e"); for (let x = 132; x < 188; x += 8) PR(g2, x, 70, 3, 80, "#6b3f24"); },
    kest: (g2, t) => { PX.bands(g2, ["#141a14", "#1c241a", "#243020"]); PR(g2, 0, 150, VIEW_W, 42, "#3a2a1e"); for (let i = 0; i < 7; i++) { PR(g2, 30 + i * 40, 110, 10, 16, OUT); PR(g2, 31 + i * 40, 111, 8, 14, ["#6bff9a", "#c9a6ff", "#ff6b7a", "#6fb8e8"][i % 4]); } },
    warden: (g2, t) => { PX.bands(g2, ["#06050e", "#0c0a18", "#141024"]); PR(g2, 0, 150, VIEW_W, 42, "#1a1430"); for (let i = 0; i < 8; i++) PR(g2, 40 + i * 32 + Math.round(Math.sin(t * 3 + i) * 2), 60 + (i % 3) * 20, 6, 4, "#857ea5"); for (let i = 0; i < 20; i++) PR(g2, hash(i, 3) * VIEW_W, hash(i, 5) * 150, 2, 2, "#9ef0f5"); },
    nell: (g2, t) => AREA_BG.wreck(g2, t),
  };
  const JOIN_LINE = {
    ilse: "I make ploughs, mostly. Today I'll make an exception.", maru: "I can't see the road. I can hear where it's going. That's usually better.",
    rook: "I owe the Flats a debt. I'll pay it walking behind you.", ada: "(She writes on her slate and turns it round:) \"I will sing again. Not yet. But I'll walk.\"",
    ren: "I've kept the gate shut long enough. Let's see what's on the other side of it.", kest: "Every poison is a medicine at the right dose. I intend to be the right dose.",
    warden: "Four hundred years I guarded a door. Let me guard a person instead.", nell: "My ship, my rules. Rule one: nobody drowns. Rule two: see rule one.",
  };
  function joinScene(id) {
    const h = HEROES[id], bg = JOIN_BG[id] || nightBg;
    return [
      { dur: 3.2, fadeIn: 0.4, line: [h.name, `joins the road. ${h.role}.`], draw: (g2, t, k) => { bg(g2, t); chibi(g2, h.look, { dir: "down", walking: k < 0.5, walk: t * 1.4 }, 3, Math.round(90 + Math.min(1, k * 2) * 70), 176); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + t; PR(g2, 160 + Math.cos(a) * (30 + k * 40), 120 + Math.sin(a) * (16 + k * 20), 2, 2, `rgba(255,226,140,${0.7 * (1 - k)})`); } } },
      { dur: 3.8, fadeOut: 0.5, line: [h.name, JOIN_LINE[id] || "Let's go."], draw: portraitShot(h.look, id === "ada" ? { mouth: "smile" } : id === "maru" ? { mouth: "smile" } : id === "warden" ? {} : { mouth: "smile", brows: id === "rook" || id === "ren" ? "fierce" : undefined }, bg) },
    ];
  }
  const _joinPartyJ = joinParty;
  joinParty = function (id) { const fresh = !G.members.includes(id); _joinPartyJ(id); if (fresh && JOIN_LINE[id]) { G.flags.pendingJoins = [...(G.flags.pendingJoins || []), id]; save(); } };
  const _updateJ2 = update;
  update = function (dt) {   // play a joining scene as soon as the dialogue and any card are done (before the departure scene)
    if (G && mode === "play" && !cine && !scene && (G.flags.pendingJoins || []).length) { const id = G.flags.pendingJoins.shift(); save(); playCine(joinScene(id), null, { music: "village" }); }
    _updateJ2(dt);
  };

  // ---- dreams become cinematics
  const dreamBg = { d1: nightBg, d2: (g2, t) => { PX.bands(g2, ["#1a1008", "#2a1a0c", "#3a2410"]); PX.fire(g2, 150, 150, 20, 26, t); }, d3: (g2, t) => PX.bands(g2, ["#140e1c", "#1e1628", "#2a1e34"]),
    d4: (g2, t) => { PX.bands(g2, ["#101820", "#18222c", "#202c38"]); PX.rain(g2, t, 150); }, d5: deepBg, d6: (g2, t) => { PX.bands(g2, ["#f0c08a", "#f4d0a0", "#f8dcb8"]); } };
  const DREAM_DETAIL = {
    d3: c2 => { PR(c2, 0, 0, 80, 48, "#1e1628"); PR(c2, 18, 26, 44, 16, OUT); PR(c2, 19, 27, 42, 14, "#6b3f24"); PR(c2, 25, 12, 30, 20, OUT); PR(c2, 26, 13, 28, 18, "#e8e2d0"); PR(c2, 38, 19, 4, 4, "#8a1020"); PR(c2, 26, 13, 28, 1, "#c8c0a8"); },
    d4: c2 => { PR(c2, 0, 0, 80, 34, "#18222c"); PR(c2, 0, 34, 80, 14, "#3a3a40"); for (const [x, y] of [[30, 36], [36, 38], [42, 35], [47, 37], [33, 40]]) PR(c2, x, y, 3, 2, "#9ad8e0"); PR(c2, 38, 38, 6, 2, "#6fbf62"); for (let i = 0; i < 10; i++) PR(c2, 20 + i * 4, 42 + (i % 2), 3, 1, "#4a8a5a"); },
    d6: c2 => { PR(c2, 0, 0, 80, 48, "#f4d0a0"); PR(c2, 20, 8, 40, 32, OUT); PR(c2, 21, 9, 38, 30, "#f4f0e8"); for (let r = 0; r < 7; r++) PR(c2, 24, 12 + r * 3, 20 + (r % 3) * 4, 1, "#8a7a6a"); PR(c2, 38, 5, 4, 4, "#8a1020"); },
  };
  const _playDreamC = playDream;
  playDream = function (d) {
    G.flags.dreams = [...(G.flags.dreams || []), d.id]; save();
    const bg = dreamBg[d.id] || nightBg, speakerLook = w => w === "nadia" ? nadiaLook() : w === "sable" ? HEROES.sable.look : null;
    const shots = [{ dur: 2.6, fadeIn: 1, line: [null, `A dream: ${d.title}.`], draw: (g2, t) => { PR(g2, 0, 0, VIEW_W, VIEW_H, "#05040e"); PX.stars(g2, t, 40, VIEW_H); } }];
    d.lines.forEach(([who, text], i) => {
      const look = speakerLook(who), det = DREAM_DETAIL[d.id];
      shots.push({ dur: Math.min(9, 3 + text.length * 0.035), line: [who ? (who === "nadia" ? "Nadia" : "Sable") : null, text], draw: look ? portraitShot(look, d.id === "d4" && who === "sable" ? { tears: true, mouth: "sad" } : who === "nadia" ? { brows: "worried", mouth: "sad" } : { eyes: "down" }, bg)
        : det && i === 0 ? (g2, t) => { bg(g2, t); detail(g2, det, t); } : d.id === "d5" ? portraitShot(MOTHER_LOOK_C, { mouth: "smile", light: "#8ad0ff" }, bg) : d.id === "d1" ? SALT_CHILD[Math.min(i, 3)].draw : (g2, t) => { bg(g2, t); chibi(g2, HEROES.sable.look, { dir: "down", hero: true }, 3, 160, 176); } });
    });
    playCine(shots, () => { if (d.id === "d6") G.flags.motherLetter = true; save(); updateHud(); }, { music: d.id === "d5" ? "cine_deep" : d.id === "d4" ? "cine_grief" : "cine_lullaby" });
  };

