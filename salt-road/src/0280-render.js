  // ================================================================== RENDER
  const canvas = $("game"), ctx = canvas.getContext("2d");
  const buf = document.createElement("canvas"); buf.width = VIEW_W; buf.height = VIEW_H;
  const g = buf.getContext("2d");
  const light = document.createElement("canvas"); light.width = VIEW_W; light.height = VIEW_H;
  const lg = light.getContext("2d");
  const heroLook = (dir, full) => ({ ...HEROES.sable.look, dir, walking: full && player.moving, run: full && player.moving && player.sprint, walk: player.walk, glowEyes: tileAt(G.px, G.py) === T.DARK });

  // Text is drawn at screen resolution on top of the scaled pixel image, never inside the tiny buffer.
  const HI = [];
  const HI_LAST = [];
  function hiText(text, x, y, px, color, kind) { if (HI.length < 200) HI.push([String(text), x, y, px, color, kind]); }
  function flushHiText() {
    if (!HI.length) return;
    const k = canvas.width / VIEW_W; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    HI_LAST.length = 0;
    for (const [t, x, y, px, c] of HI) {
      ctx.font = `${Math.round(px * k)}px 'Pixelify Sans', 'Courier New', monospace`;
      const tw = ctx.measureText(t).width / k; HI_LAST.push({ text: t, x: x - tw / 2, y: y - px * 0.8, w: tw, h: px });   // buffer units, for the layout audit
      ctx.fillStyle = "#1b1633"; ctx.fillText(t, Math.round(x * k + k * 0.75), Math.round(y * k + k * 0.75)); ctx.fillStyle = c; ctx.fillText(t, Math.round(x * k), Math.round(y * k));
    }
    HI.length = 0;
  }
  function render() {
    if (battle) renderBattle(); else renderWorld();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
    flushHiText();
    if (!battle && showMap && mode !== "title") drawMinimap(); else $("minimap").hidden = true;
  }
  function renderWorld() {
    const sx = shake && !REDUCED && SETTINGS.shake ? rand(-.5, .5) * shake : 0, sy = shake && !REDUCED && SETTINGS.shake ? rand(-.5, .5) * shake : 0;
    const ox = Math.round(camX + sx), oy = Math.round(camY + sy);
    g.fillStyle = "#120f24"; g.fillRect(0, 0, VIEW_W, VIEW_H);
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE);
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE) + 1; tx++) {
      const t = get(tx, ty), nv = VARIANTS[t] || 1;
      let v = Math.floor(hash(tx, ty) * nv);
      if (t === T.WATER) v = (v + Math.floor(time * 2)) % 3;
      g.drawImage(tileCanvas(t, v), tx * TILE - ox, ty * TILE - oy);
      const up = get(tx, ty - 1), X = tx * TILE - ox, Y = ty * TILE - oy;
      if (!SOLID.has(t) && [T.WALL, T.HOUSE, T.ROCK, T.CRYSTAL, T.CITY, T.GATE].includes(up)) { g.fillStyle = "rgba(20,14,40,.28)"; g.fillRect(X, Y, TILE, 4); g.fillStyle = "rgba(20,14,40,.14)"; g.fillRect(X, Y + 4, TILE, 3); }
      if (t === T.WATER) {
        const wave = Math.floor(time * 3 + tx) % 3;
        if (up !== T.WATER && up !== T.BRIDGE) { g.fillStyle = "rgba(230,250,255,.75)"; g.fillRect(X, Y, TILE, 1); g.fillStyle = "rgba(230,250,255,.35)"; g.fillRect(X + wave * 4, Y + 2, 5, 1); }
        if (get(tx - 1, ty) !== T.WATER && get(tx - 1, ty) !== T.BRIDGE) { g.fillStyle = "rgba(230,250,255,.5)"; g.fillRect(X, Y, 1, TILE); }
        if (get(tx + 1, ty) !== T.WATER && get(tx + 1, ty) !== T.BRIDGE) { g.fillStyle = "rgba(230,250,255,.5)"; g.fillRect(X + TILE - 1, Y, 1, TILE); }
      }
    }
    for (const pr of PROPS) if (pr.flat && Math.abs(pr.px - ox - VIEW_W / 2) < VIEW_W && Math.abs(pr.py - oy - VIEW_H / 2) < VIEW_H) drawProp(g, pr, pr.px - ox, pr.py - oy);
    for (const l of LORE) if (Math.abs(l.x * TILE - ox - VIEW_W / 2) < VIEW_W) drawTablet(g, l.x * TILE + 8 - ox, l.y * TILE + 8 - oy, !(G.flags.lore || []).includes(l.id));
    // the grove pond runs dark until the Mother dies
    if (!G.flags.motherDead) { g.fillStyle = "rgba(40,10,30,.55)"; g.fillRect(58 * TILE - ox, 38 * TILE - oy, 6 * TILE, 5 * TILE); }
    if (!G.keyItems.key && !G.flags.unlocked) drawChest(g, KEY_CHEST.x * TILE + 8 - ox, KEY_CHEST.y * TILE + 8 - oy);
    for (const c of CHESTS) if (!(G.flags.chests || {})[c.id]) drawChest(g, c.x * TILE + 8 - ox, c.y * TILE + 8 - oy);
    if (G.flags.benoQuest && !G.keyItems.charm && !G.flags.charmReturned) drawSparkle(g, CHARM.x - ox, CHARM.y - oy, "#ff8ab0");
    if (G.flags.shardQuest) for (const sh of SHARDS) if (!G.flags.shards.includes(sh.id)) drawShard(g, sh.x * TILE + 8 - ox, sh.y * TILE + 8 - oy);
    if (G.flags.vossDead && !G.keyItems.bell) drawBell(g, 34 * TILE + 8 - ox, 5 * TILE + 8 - oy);

    const actors = [];
    for (const n of NPCS) {
      if (!npcVisible(n) || (n.id === "ada" && G.stage < 4)) continue;
      actors.push({ y: n.py, draw: () => {
        drawPerson(g, n.px - ox, n.py - oy, { dir: n.dir || "down", walking: n.walking, walk: n.walking ? time * 3.2 : player.walk, bob: n.bob, ...n.look });
        if (!n.look.dead) npcActivity(g, n, n.px - ox, n.py - oy);
        if (n.id === "ada") { g.fillStyle = "#857ea5"; for (let i = 0; i < 4; i++) { g.fillRect(Math.round(n.px - ox) - 9 + i * 2, Math.round(n.py - oy) - 12 + i, 2, 1); g.fillRect(Math.round(n.px - ox) + 7 - i * 2, Math.round(n.py - oy) - 12 + i, 2, 1); } }
        const isNear = !(n.id === "beno" && G.flags.benoFollows) && Math.hypot(n.px - G.px, n.py - G.py) < 22 && mode === "play";
        if (isNear) drawPrompt(g, n.px - ox, n.py - oy - 32);
        else if (questMarker(n)) drawMarker(g, n.px - ox, n.py - oy - 32);
      } });
    }
    const trail = player.scarf;
    const fdir = player.fdir || (player.fdir = {});
    G.members.slice(1).forEach((id, i) => {   // each follower faces the way it is walking along the trail, and keeps its own step
      const path = player.path && player.path.length ? player.path : [{ x: G.px, y: G.py }], idx = Math.min(path.length - 1, 7 * (i + 1));
      const p0 = path[idx], p = { x: p0.x, y: p0.y - 10 }, q0 = path[Math.max(0, idx - 2)] || p0, q = { x: q0.x, y: q0.y - 10 };
      const dx = q.x - p.x, dy = q.y - p.y;
      if (Math.hypot(dx, dy) > 0.6) fdir[id] = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      const dir = fdir[id] || player.dir;
      actors.push({ y: p.y + 9, draw: () => drawPerson(g, p.x - ox, p.y + 10 - oy, { ...HEROES[id].look, dir, walking: player.moving, run: player.moving && player.sprint, walk: player.walk + i * 0.37, bob: 1.3 + i * 1.7, glowEyes: false }) });
    });
    if (!G.flags.butcherDead && G.stage >= 2) actors.push({ y: 28 * TILE + 8, draw: () => drawMiniBoss(g, 38 * TILE + 8 - ox, 28 * TILE + 8 - oy, "butcher") });
    if (!G.flags.motherDead && G.stage >= 3) actors.push({ y: MOTHER_POS.y, draw: () => drawMiniBoss(g, MOTHER_POS.x - ox, MOTHER_POS.y - oy, "mother") });
    if (!G.flags.choirDead && G.stage >= 4) actors.push({ y: KEY_CHEST.y * TILE + 2, draw: () => drawMiniBoss(g, (KEY_CHEST.x - 1) * TILE + 8 - ox, KEY_CHEST.y * TILE - oy, "choirmaster") });
    if (G.flags.unlocked && !G.flags.vossDead) {
      actors.push({ y: VOSS_POS.y, draw: () => drawMiniBoss(g, VOSS_POS.x - ox, VOSS_POS.y - oy, "voss") });
      actors.push({ y: 4 * TILE + 8, draw: () => drawWardenChained(g, 31 * TILE + 8 - ox, 5 * TILE + 8 - oy) });
    }
    if (G.flags.tamQuest && !G.flags.wyrmDead) actors.push({ y: WYRM_POS.y, draw: () => drawWyrmMound(g, WYRM_POS.x - ox, WYRM_POS.y - oy) });
    if (G.stage >= 6 && !G.flags.hollisDead) actors.push({ y: HOLLIS_POS.y, draw: () => drawMiniBoss(g, HOLLIS_POS.x - ox, HOLLIS_POS.y - oy, "hollis") });
    for (const f of field) actors.push({ y: f.py, draw: () => drawFieldMonster(MONSTERS[f.group[0]].pal ? palCtx(g, MONSTERS[f.group[0]].pal) : g, f, f.px - ox, f.py - oy) });
    act2Actors(actors, ox, oy);
    for (const pr of PROPS) if (!pr.flat && Math.abs(pr.px - ox - VIEW_W / 2) < VIEW_W / 2 + 40 && Math.abs(pr.py - oy - VIEW_H / 2) < VIEW_H / 2 + 40) actors.push({ y: pr.py, draw: () => drawProp(g, pr, pr.px - ox, pr.py - oy) });
    actors.push({ y: G.py, draw: () => {
      for (const gh of player.ghosts) {
        g.globalAlpha = Math.min(1, gh.life * (gh.dash ? 2.6 : 2));
        drawPerson(g, gh.x - ox, gh.y - oy, gh.dash ? { ...heroLook(gh.dir, false), robe: "#3ee0e8", hair: "#1fb8c2", skin: "#9ef0f5" } : heroLook(gh.dir, false));
      }
      g.globalAlpha = 1; g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 1;
      for (const l of player.lines) { g.globalAlpha = l.life * 5; g.beginPath(); g.moveTo(Math.round(l.x - ox), Math.round(l.y - oy)); g.lineTo(Math.round(l.x - ox - l.dx * 14), Math.round(l.y - oy - l.dy * 14)); g.stroke(); }
      g.globalAlpha = 1; drawScarf(g, ox, oy); drawPerson(g, G.px - ox, G.py - oy, heroLook(player.dir, true));
    } });
    actors.sort((a, b) => a.y - b.y).forEach(a => a.draw());
    for (const p of particles) if (p.world) { g.fillStyle = p.color; g.globalAlpha = Math.min(1, p.life * 2); g.fillRect(Math.round(p.x - ox), Math.round(p.y - oy), p.size, p.size); }
    g.globalAlpha = 1;
    drawAmbient(g, ox, oy);
    g.globalAlpha = 1;

    if (tileAt(G.px, G.py) === T.DARK) {
      lg.globalCompositeOperation = "source-over"; lg.fillStyle = "rgba(6,4,16,0.94)"; lg.fillRect(0, 0, VIEW_W, VIEW_H);
      lg.globalCompositeOperation = "destination-out";
      const glow = (x, y, r, a = 1) => { const gr = lg.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); lg.fillStyle = gr; lg.fillRect(x - r, y - r, r * 2, r * 2); };
      const cx = G.px - ox, cy = G.py - oy - 8, r = 70 + Math.sin(time * 9) * 2 + Math.sin(time * 23) * 1.5;
      const grd = lg.createRadialGradient(cx, cy, 8, cx, cy, r); grd.addColorStop(0, "rgba(0,0,0,1)"); grd.addColorStop(0.7, "rgba(0,0,0,.75)"); grd.addColorStop(1, "rgba(0,0,0,0)");
      lg.fillStyle = grd; lg.beginPath(); lg.arc(cx, cy, r, 0, Math.PI * 2); lg.fill();
      for (const f of field) if (f.dark) glow(f.px - ox, f.py - oy - 10, 12, .8);
      if (G.flags.unlocked && !G.flags.vossDead) glow(VOSS_POS.x - ox, VOSS_POS.y - oy - 14, 34, .85);
      if (!G.flags.choirDead && G.stage >= 4) glow((KEY_CHEST.x - 1) * TILE + 8 - ox, KEY_CHEST.y * TILE - 14 - oy, 26, .8);
      if (G.stage >= 4 && !G.members.includes("ada")) glow(30 * TILE + 8 - ox, 17 * TILE - oy, 14, .6);
      for (const pr of PROPS) if (pr.type === "candles") glow(pr.px - ox, pr.py - oy - 6, 16 + Math.sin(time * 7 + pr.seed * 9) * 1.5, .7);
      g.drawImage(light, 0, 0);
      g.fillStyle = "rgba(255,160,90,.05)"; g.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    const here = tileAt(G.px, G.py);
    if (here === T.ABYSS) {
      lg.globalCompositeOperation = "source-over"; lg.fillStyle = "rgba(2,8,24,0.92)"; lg.fillRect(0, 0, VIEW_W, VIEW_H);
      lg.globalCompositeOperation = "destination-out";
      const cx = G.px - ox, cy = G.py - oy - 8, r = 64 + Math.sin(time * 3) * 3, gr = lg.createRadialGradient(cx, cy, 6, cx, cy, r);
      gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)"); lg.fillStyle = gr; lg.fillRect(cx - r, cy - r, r * 2, r * 2);
      for (const f of field) { const a = lg.createRadialGradient(f.px - ox, f.py - oy - 10, 1, f.px - ox, f.py - oy - 10, 14); a.addColorStop(0, "rgba(0,0,0,.8)"); a.addColorStop(1, "rgba(0,0,0,0)"); lg.fillStyle = a; lg.fillRect(f.px - ox - 14, f.py - oy - 24, 28, 28); }
      g.drawImage(light, 0, 0); g.fillStyle = "rgba(40,120,200,.08)"; g.fillRect(0, 0, VIEW_W, VIEW_H);
    } else if (here === T.SPIRE) {
      g.fillStyle = "rgba(10,14,40,.45)"; g.fillRect(0, 0, VIEW_W, VIEW_H);
      if ((time % 5) < 0.12 && !REDUCED) { g.fillStyle = "rgba(220,240,255,.35)"; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    }
    if (G.stage >= 7 && ![T.DARK, T.ABYSS, T.SPIRE, T.FLOOR].includes(here)) {
      g.fillStyle = "rgba(20,30,60,.22)"; g.fillRect(0, 0, VIEW_W, VIEW_H);
      if (!REDUCED) { g.fillStyle = "rgba(180,200,240,.5)"; for (let i = 0; i < 70; i++) { const x = (hash(i, 7) * (VIEW_W + 60) - time * 40) % (VIEW_W + 60), y = (hash(i, 9) * VIEW_H + time * 220) % VIEW_H; g.fillRect(Math.round((x + VIEW_W + 60) % (VIEW_W + 60)), Math.round(y), 1, 5); } }
    }
    if (warpFade > 0) { g.fillStyle = `rgba(6,4,16,${warpFade})`; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    if (mode === "play") drawCompass(g, ox, oy);
    const vg = g.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45, VIEW_W / 2, VIEW_H / 2, VIEW_W * 0.7);
    vg.addColorStop(0, "rgba(18,15,36,0)"); vg.addColorStop(1, "rgba(18,15,36,.5)");
    g.fillStyle = vg; g.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  function drawMiniBoss(g, x, y, kind) {
    if (drawMiniBoss2(g, Math.round(x), Math.round(y), kind)) return;
    x = Math.round(x); y = Math.round(y);
    g.fillStyle = "rgba(20,14,40,.35)"; g.beginPath(); g.ellipse(x, y + 1, 10, 3, 0, 0, Math.PI * 2); g.fill();
    const fl = Math.round(Math.sin(time * 2) * 1);
    if (kind === "butcher") {
      g.fillStyle = "#1b1633"; g.fillRect(x - 8, y - 22, 16, 22); g.fillStyle = "#c99a7a"; g.fillRect(x - 7, y - 21, 14, 20); g.fillStyle = "#d8d0c0"; g.fillRect(x - 6, y - 16, 12, 14);
      g.fillStyle = "#8a1020"; g.fillRect(x - 4, y - 13, 3, 3); g.fillRect(x + 2, y - 8, 3, 3); g.fillStyle = "#b8bccc"; g.fillRect(x + 7, y - 26, 5, 5); g.fillStyle = "#6b3f24"; g.fillRect(x + 8, y - 21, 1, 8);
    } else if (kind === "mother") {
      g.fillStyle = "#1b1633"; g.beginPath(); g.ellipse(x, y - 10, 18 + fl, 12, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#8a6a8a"; g.beginPath(); g.ellipse(x, y - 10, 17 + fl, 11, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#5a0f18"; for (const [dx, dy] of [[-8, -12], [2, -15], [9, -8], [-3, -6]]) g.fillRect(x + dx, y + dy, 3, 3);
    } else if (kind === "choirmaster") {
      g.fillStyle = "#1b1633"; g.fillRect(x - 6, y - 32 + fl, 12, 32); g.fillStyle = "#1a1830"; g.fillRect(x - 5, y - 31 + fl, 10, 30); g.fillStyle = "#efeaf8"; g.fillRect(x - 4, y - 38 + fl, 8, 7);
      g.fillStyle = "#5a0f18"; g.fillRect(x - 3, y - 34 + fl, 6, 1); g.fillStyle = "#f2ead8"; g.fillRect(x + 6, y - 36 + fl + Math.round(Math.sin(time * 4) * 2), 1, 9);
    } else if (kind === "hollis") {
      g.fillStyle = "#1b1633"; g.beginPath(); g.ellipse(x, y - 13, 12, 14, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = "#c9a227"; g.beginPath(); g.ellipse(x, y - 13, 11, 13, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#b8c8c8"; g.fillRect(x - 4, y - 32 + fl, 8, 8); g.fillStyle = "#5a0f18"; g.fillRect(x - 3, y - 27 + fl, 6, 2); g.fillStyle = "#3a8fbf"; g.fillRect(x - 6, y - 1, 12, 1);
    } else {
      g.fillStyle = "#1b1633"; g.fillRect(x - 7, y - 26 + fl, 14, 26); g.fillStyle = "#2e2a58"; g.fillRect(x - 6, y - 25 + fl, 12, 24); g.fillStyle = "#ffcf4a"; g.fillRect(x - 3, y - 17 + fl, 6, 5);
      g.fillStyle = "#d8c8b8"; g.fillRect(x - 4, y - 31 + fl, 8, 7); g.fillStyle = "#9ef0f5"; g.fillRect(x - 3, y - 29 + fl, 1, 1); g.fillRect(x + 2, y - 29 + fl, 1, 1); g.fillRect(x - 6, y - 35 + fl, 2, 4); g.fillRect(x + 4, y - 36 + fl, 2, 5);
    }
  }
  function drawWyrmMound(g, x, y) {
    x = Math.round(x); y = Math.round(y);
    const br = Math.sin(time * 1.5) * 1.5;
    g.fillStyle = "rgba(20,14,40,.3)"; g.beginPath(); g.ellipse(x, y + 2, 16, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#c3b8d8"; g.beginPath(); g.ellipse(x, y - 2, 14 + br, 6 + br / 2, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#9ef0f5"; for (const [dx, h] of [[-8, 6], [-2, 9], [5, 7]]) { g.beginPath(); g.moveTo(x + dx - 2, y - 3); g.lineTo(x + dx, y - 3 - h - br); g.lineTo(x + dx + 2, y - 3); g.fill(); }
    g.fillStyle = "#8a5533"; g.fillRect(x + 12, y - 3, 5, 4); g.fillStyle = "#3ee0e8"; g.fillRect(x + 12, y - 3, 5, 1);
  }
  function drawWardenChained(g, x, y) {
    x = Math.round(x); y = Math.round(y);
    const free = G.flags.wardenFree;
    g.globalAlpha = free ? 1 : 0.8;
    g.fillStyle = "#1b1633"; g.fillRect(x - 11, y - 26, 22, 26); g.fillStyle = "#5e5680"; g.fillRect(x - 10, y - 25, 20, 24);
    g.fillStyle = "#9ef0f5"; g.fillRect(x - 8, y - 32, 3, 6); g.fillRect(x + 5, y - 33, 3, 7);
    g.fillStyle = free ? "#3ee0e8" : "#2a6a70"; g.fillRect(x - 3, y - 17, 6, 6);
    if (!free) { g.fillStyle = "#1b1633"; g.fillRect(x - 3, y - 17, 1, 6); g.fillRect(x + 1, y - 15, 2, 1); g.fillStyle = "#857ea5"; for (let i = 0; i < 5; i++) { g.fillRect(x - 16 + i * 2, y - 20 + i, 2, 1); g.fillRect(x + 14 - i * 2, y - 20 + i, 2, 1); } }
    g.globalAlpha = 1;
  }
  function renderBattle() {
    const B = battle, area = B.opts.area || "flats";
    const sx = shake && !REDUCED && SETTINGS.shake ? rand(-.5, .5) * shake : 0, sy = shake && !REDUCED && SETTINGS.shake ? rand(-.5, .5) * shake : 0;
    g.save(); g.translate(Math.round(sx), Math.round(sy));
    const sky = g.createLinearGradient(0, 0, 0, 120);
    const skies = { cathedral: ["#0c0a1c", "#2a2448"], oasis: ["#3a1f4a", "#c46a4a"], grove: ["#1a2a24", "#4a6a4a"], gate: ["#0e1a2e", "#3a5a7a"], flats: ["#2a1a3e", "#b0506a"] };
    const sk = skies[area] || SKIES2[area] || skies.flats; sky.addColorStop(0, sk[0]); sky.addColorStop(1, sk[1]);
    g.fillStyle = sky; g.fillRect(-10, -10, VIEW_W + 20, 130);
    if (area === "cathedral") {
      g.fillStyle = "#1b1633"; for (let i = 0; i < 6; i++) { const x = 20 + i * 56; g.fillRect(x, 20, 14, 100); g.fillRect(x - 4, 16, 22, 6); }
      g.fillStyle = "#5a1020"; for (let i = 0; i < 6; i++) g.fillRect(24 + i * 56, 60 + (i % 2) * 20, 2, 30);
      for (let i = 0; i < 5; i++) { const x = 46 + i * 58, fl = Math.sin(time * 8 + i) * 1; g.fillStyle = "#f2e6b0"; g.fillRect(x, 96, 2, 8); g.fillStyle = "#ffcf4a"; g.fillRect(x, 93 + fl, 2, 3); }
      g.fillStyle = "#2a2448"; g.fillRect(-10, 118, VIEW_W + 20, 90);
      g.fillStyle = "#9ef0f5"; for (const [x, h] of [[8, 18], [300, 22], [270, 12]]) { g.beginPath(); g.moveTo(x, 122); g.lineTo(x + 5, 122 - h); g.lineTo(x + 10, 122); g.fill(); }
    } else if (area === "grove") {
      g.fillStyle = "#0f1a14"; for (let i = 0; i < 7; i++) { const x = i * 52 - 10; g.fillRect(x + 20, 40, 4, 80); for (const d of [-16, -8, 8, 16]) g.fillRect(x + 22 + (d < 0 ? d : 2), 36 + Math.abs(d) / 3, Math.abs(d), 3); }
      g.fillStyle = "#2a1a2a"; g.fillRect(-10, 112, VIEW_W + 20, 96); g.fillStyle = "#3a2a3a"; for (let i = 0; i < 10; i++) g.fillRect(i * 34, 122 + (i % 3) * 12, 20, 2);
      g.fillStyle = "rgba(107,42,90,.5)"; g.beginPath(); g.ellipse(VIEW_W / 2, 150, 120, 14, 0, 0, Math.PI * 2); g.fill();
    } else if (drawBattleBg2(g, area)) { /* Act II backgrounds */
    } else if (area === "gate") {
      g.fillStyle = "#1b2440"; g.fillRect(-10, 30, VIEW_W + 20, 90); g.fillStyle = "#2a3a5a"; for (let i = 0; i < 8; i++) g.fillRect(i * 44, 20, 30, 12);
      g.fillStyle = "#3a2a1e"; g.fillRect(VIEW_W / 2 - 30, 44, 60, 76); g.fillStyle = "#ffcf4a"; for (let x = -26; x < 30; x += 9) g.fillRect(VIEW_W / 2 + x, 44, 2, 76);
      for (let i = 0; i < 40; i++) { const x = (i * 53 + time * 60) % (VIEW_W + 20) - 10, y = (i * 37 + time * 200) % 200; g.fillStyle = "rgba(158,200,240,.35)"; g.fillRect(x, y, 1, 4); }
      g.fillStyle = "#26344e"; g.fillRect(-10, 118, VIEW_W + 20, 90); g.fillStyle = "rgba(58,143,191,.35)"; g.fillRect(-10, 150 + Math.sin(time) * 2, VIEW_W + 20, 60);
    } else {
      g.fillStyle = "#ffcf8a"; g.beginPath(); g.arc(250, 70, 16, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,207,138,.25)"; g.fillRect(-10, 96, VIEW_W + 20, 3);
      if (area === "oasis") { g.fillStyle = "#1b1633"; for (const x of [30, 280]) { g.fillRect(x, 60, 3, 58); for (const d of [-14, -7, 7, 14]) g.fillRect(x + (d < 0 ? d : 3), 58 + Math.abs(d) / 3, Math.abs(d), 2); } }
      g.fillStyle = area === "oasis" ? "#3f6a4a" : "#d8d0e6"; g.fillRect(-10, 116, VIEW_W + 20, 90);
      g.fillStyle = area === "oasis" ? "#2f5a3a" : "#c3b8d8"; for (let i = 0; i < 9; i++) g.fillRect(i * 40 - 10 + (i % 2) * 12, 124 + (i % 3) * 14, 26, 1);
      g.fillStyle = "#f2ead8"; for (const [x, y] of [[40, 140], [230, 150], [150, 132]]) { g.fillRect(x, y, 6, 2); g.fillRect(x + 1, y - 2, 2, 2); }
    }
    const drawOrder = [...B.foes].sort((a, b) => (a.boss ? 0 : 1) - (b.boss ? 0 : 1));
    for (const f of drawOrder) {
      const p = unitPos(f);
      if (f.dead && f.deathT > 0.9) { g.fillStyle = f.sprite === "drowned" || f.sprite === "hollis" ? "#1f4a6a" : "#6b0f1d"; g.beginPath(); g.ellipse(p.x, p.y + 2, 16, 3, 0, 0, Math.PI * 2); g.fill(); continue; }
      g.fillStyle = "rgba(10,6,20,.35)"; g.beginPath(); g.ellipse(p.x, p.y + 1, f.boss ? 30 : 16, 4, 0, 0, Math.PI * 2); g.fill();
      g.save();
      if (f.dead) g.globalAlpha = Math.max(0, 1 - f.deathT / 0.9);
      const lunge = 0, sh = f.shake ? rand(-f.shake, f.shake) * .5 : 0;   // the lunge itself is drawn as motion (FIGHTERS)
      drawBattleMonster(MONSTERS[f.id].pal ? palCtx(g, MONSTERS[f.id].pal) : g, f, p.x + sh, p.y + lunge);
      g.restore();
      if (f.dead) continue;
      const fa = !f.boss && bossArtFor(f), bw = f.boss ? 90 : 34, by = f.boss ? p.y + 8 : p.y - Math.max(52, fa ? fa.h + 6 : 60);
      g.fillStyle = "#1b1633"; g.fillRect(p.x - bw / 2 - 1, by - 1, bw + 2, 5); g.fillStyle = "#4a0a14"; g.fillRect(p.x - bw / 2, by, bw, 3);
      g.fillStyle = "#e0243f"; g.fillRect(p.x - bw / 2, by, Math.round(bw * f.hp / f.maxHp), 3);
      const label = intentLabel(f), danger = f.intent && (f.intent.all || (f.intent.power || 0) >= 1.3 || (f.intent.charge && !f.intent.release));
      const ly = f.boss ? by + 11 : by - 4;
      hiText(label, p.x, ly, 7, f.st.stun ? "#ffcf4a" : danger ? "#ff6b6b" : "#f3efe6");
      const extra = [[breakInfo(f), "#ff9a3d"], [affShort(f.id), "#ffcf4a"]].filter(([t]) => t);   // break window, then weaknesses learned so far
      if (f.boss) {   // a boss keeps them on its label's line (break on the left, weaknesses on the right), clear of the heroes below
        const half = hiW(label, 7) / 2 + 6;
        extra.forEach(([t, c]) => { const w = hiW(t, 6) / 2; hiText(t, /BREAK|EXPOSED/.test(t) ? p.x - half - w : p.x + half + w, ly, 6, c); });
      } else extra.forEach(([t, c], i) => hiText(t, p.x, ly - 9 * (i + 1), 6, c));
      const sts = Object.keys(f.st).filter(k => ["bleed", "stun", "weak", "guard", "mark", "brk"].includes(k));
      sts.forEach((k, i) => { g.fillStyle = { bleed: "#c8102e", stun: "#ffcf4a", weak: "#b08aff", guard: "#6fc0d0", mark: "#ff9a3d", brk: "#aa5a5a" }[k]; g.fillRect(p.x + bw / 2 + 3 + i * 5, by, 4, 3); });
      if (B.hoverTarget === f || B.current === f) { g.strokeStyle = B.current === f ? "#ff6b6b" : "#ffcf4a"; g.lineWidth = 1; const w2 = f.boss ? 60 : 34; g.strokeRect(p.x - w2 / 2 + .5, p.y - (f.boss ? 108 : 56) + .5, w2, f.boss ? 112 : 58); }
    }
    for (const h of B.heroes) {
      const p = unitPos(h), dead = !alive(h);
      g.save(); if (dead) g.globalAlpha = 0.4;
      const sh = h.shake ? rand(-h.shake, h.shake) * .4 : 0;
      drawBattleHero(g, h, p.x + sh, p.y);
      g.restore();
      if (B.current === h) { g.fillStyle = "#ffcf4a"; g.beginPath(); g.moveTo(p.x - 3, p.y - 50); g.lineTo(p.x + 3, p.y - 50); g.lineTo(p.x, p.y - 46); g.fill(); }
      if (B.hoverTarget === h) { g.strokeStyle = "#6bff9a"; g.strokeRect(p.x - 11.5, p.y - 46.5, 23, 48); }
      if (h.st.guard) { g.strokeStyle = "rgba(111,192,208,.8)"; g.beginPath(); g.arc(p.x, p.y - 10, 13, 0, Math.PI * 2); g.stroke(); }
      if (h.st.veil) { g.strokeStyle = "rgba(62,224,232,.7)"; g.setLineDash([2, 2]); g.beginPath(); g.arc(p.x, p.y - 10, 11, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
      if (h.st.strong) { g.fillStyle = "rgba(255,160,60,.7)"; g.fillRect(p.x - 1, p.y - 30 - Math.round(time * 20) % 6, 2, 3); }
      if (h.st.taunt) { g.strokeStyle = "rgba(120,220,120,.8)"; g.strokeRect(p.x - 10.5, p.y - 24.5, 21, 27); }
    }
    if (B.warden) { g.globalAlpha = .85; drawWardenChained(g, 26, 150); g.globalAlpha = 1; }
    for (const p of particles) if (!p.world) { g.fillStyle = p.color; g.globalAlpha = Math.min(1, p.life * 2); g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); }
    g.globalAlpha = 1;
    for (const p of popups) {
      hiText(p.text, p.x, p.y, p.big ? 11 : 8, p.color, "pop");
    }
    if (B.flash > 0) { g.fillStyle = `rgba(255,255,255,${B.flash * .6})`; g.fillRect(-10, -10, VIEW_W + 20, VIEW_H + 20); }
    const vg = g.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.4, VIEW_W / 2, VIEW_H / 2, VIEW_W * 0.7);
    vg.addColorStop(0, "rgba(40,0,10,0)"); vg.addColorStop(1, "rgba(40,0,10,.55)");
    g.fillStyle = vg; g.fillRect(-10, -10, VIEW_W + 20, VIEW_H + 20);
    g.restore();
  }
  function questMarker(n) { const t = goal(); return (n.x === t.x && n.y === t.y) || (n.id === "beno" && G.keyItems.charm && !G.flags.charmReturned); }
  function drawPrompt(g, x, y) { const b = Math.round(Math.sin(time * 6)); x = Math.round(x); y = Math.round(y); g.fillStyle = "#1b1633"; g.fillRect(x - 5, y - 6 + b, 10, 9); g.fillStyle = "#f3efe6"; g.fillRect(x - 4, y - 5 + b, 8, 7); pixGlyph(g, "E", x - 1, y - 4 + b, "#1b1633"); }
  // a 3x5 pixel font for the tiny labels drawn inside the game image (crisp at any scale)
  const GLYPHS = { E: "111100110100111", 0: "111101101101111", 1: "010110010010111", 2: "111001111100111", 3: "111001111001111", 4: "101101111001001", 5: "111100111001111", 6: "111100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001111" };
  function pixGlyph(g2, text, x, y, col) { g2.fillStyle = col; [...text].forEach((ch, n) => { const m = GLYPHS[ch]; if (!m) return; for (let i = 0; i < 15; i++) if (m[i] === "1") g2.fillRect(Math.round(x) + n * 4 + (i % 3), Math.round(y) + Math.floor(i / 3), 1, 1); }); }
  function drawMarker(g, x, y) { const b = Math.round(Math.sin(time * 5) * 2); x = Math.round(x); y = Math.round(y); g.fillStyle = "#1b1633"; g.fillRect(x - 2, y - 9 + b, 5, 11); g.fillStyle = "#ffcf4a"; g.fillRect(x - 1, y - 8 + b, 3, 6); g.fillRect(x - 1, y - 1 + b, 3, 2); }
  function drawChest(g, x, y) { x = Math.round(x); y = Math.round(y); g.fillStyle = "#1b1633"; g.fillRect(x - 7, y - 9, 14, 11); g.fillStyle = "#8a5533"; g.fillRect(x - 6, y - 8, 12, 9); g.fillStyle = "#ffcf4a"; g.fillRect(x - 6, y - 5, 12, 1); g.fillRect(x - 1, y - 6, 2, 3); if (Math.floor(time * 3) % 2) { g.fillStyle = "#ffffff"; g.fillRect(x + 5, y - 11, 1, 1); } }
  function drawSparkle(g, x, y, c) { x = Math.round(x); y = Math.round(y); const s = 2 + Math.round(Math.abs(Math.sin(time * 4)) * 3); g.fillStyle = c; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = "#ffffff"; g.fillRect(x, y - s - 1, 1, s); g.fillRect(x, y + 2, 1, s); g.fillRect(x - s - 1, y, s, 1); g.fillRect(x + 2, y, s, 1); }
  function drawShard(g, x, y) {
    x = Math.round(x); y = Math.round(y) - 4 - Math.round(Math.sin(time * 3) * 2);
    const gr = g.createRadialGradient(x, y, 1, x, y, 12); gr.addColorStop(0, "rgba(158,240,245,.7)"); gr.addColorStop(1, "rgba(158,240,245,0)");
    g.fillStyle = gr; g.fillRect(x - 12, y - 12, 24, 24);
    g.fillStyle = "#1b1633"; g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 5, y); g.lineTo(x, y + 7); g.lineTo(x - 5, y); g.fill();
    g.fillStyle = "#9ef0f5"; g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 3, y); g.lineTo(x, y + 5); g.lineTo(x - 3, y); g.fill();
  }
  function drawBell(g, x, y) { x = Math.round(x); y = Math.round(y) - 6 - Math.round(Math.sin(time * 3) * 2); g.fillStyle = "#1b1633"; g.fillRect(x - 6, y - 8, 12, 11); g.fillStyle = "#ffcf4a"; g.fillRect(x - 5, y - 7, 10, 9); g.fillRect(x - 6, y + 1, 12, 2); g.fillStyle = "#fff1b0"; g.fillRect(x - 3, y - 6, 2, 5); g.fillStyle = "#8a1020"; g.fillRect(x + 2, y - 2, 2, 3); }
  function drawCompass(g, ox, oy) {
    const t = routedGoal(); if (!t.text) return;
    const gx = t.x * TILE + 8 - ox, gy = t.y * TILE + 8 - oy;
    if (gx > 8 && gx < VIEW_W - 8 && gy > 8 && gy < VIEW_H - 8) { if (!NPCS.some(n => n.x === t.x && n.y === t.y && npcVisible(n))) drawMarker(g, gx, gy - 14); return; }
    const cx = VIEW_W / 2, cy = VIEW_H / 2, a = Math.atan2(gy - cy, gx - cx);
    const k = Math.min((VIEW_W / 2 - 16) / Math.abs(Math.cos(a) || 1e-6), (VIEW_H / 2 - 16) / Math.abs(Math.sin(a) || 1e-6));
    const x = cx + Math.cos(a) * k, y = cy + Math.sin(a) * k;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(a);
    const pulse = 1 + Math.sin(time * 6) * 0.12; g.scale(pulse, pulse);
    g.fillStyle = "#1b1633"; g.beginPath(); g.moveTo(9, 0); g.lineTo(-6, -7); g.lineTo(-3, 0); g.lineTo(-6, 7); g.closePath(); g.fill();
    g.fillStyle = "#ffcf4a"; g.beginPath(); g.moveTo(7, 0); g.lineTo(-4, -5); g.lineTo(-2, 0); g.lineTo(-4, 5); g.closePath(); g.fill();
    g.restore();
    const dist = Math.round(Math.hypot(gx - (G.px - ox), gy - (G.py - oy)) / TILE), ly = y > VIEW_H - 24 ? y - 11 : y + 14;
    hiText(`${dist}m`, x, ly, 7, "#ffcf4a");
  }
  const MINI = { [T.SALT]: "#e3dde9", [T.BONES]: "#e3dde9", [T.SAND]: "#e6c98f", [T.GRASS]: "#4f9a57", [T.MUD]: "#4a4a3a", [T.WATER]: "#2a7fae", [T.PALM]: "#2a6f40", [T.WALL]: "#5e5680", [T.DARK]: "#332e4f", [T.HOUSE]: "#d9a86c", [T.ROOF]: "#a8403a", [T.DOOR]: "#6b3f24", [T.PATH]: "#d3c1a3", [T.ROCK]: "#857ea5", [T.BRIDGE]: "#9a6a3e", [T.CRYSTAL]: "#9ef0f5", [T.LOCKED]: "#ffcf4a", [T.WELL]: "#2a7fae", [T.GATE]: "#ffcf4a", [T.LDOOR]: "#8a1020", [T.CITY]: "#3b4f9a", [T.PEDESTAL]: "#aba4c8",
    [T.COBBLE]: "#9a94a8", [T.SHALLOW]: "#5aa0a8", [T.DECK]: "#9a6a3e", [T.HULL]: "#4a3020", [T.ABYSS]: "#1a2a4a", [T.CORAL]: "#c8506a", [T.CLIFF]: "#2a2438", [T.STONE]: "#7a7488",
    [T.SPIRE]: "#3a4468", [T.SWALL]: "#1e2440", [T.ROOFB]: "#3a5aa8", [T.FOUNTAIN]: "#6fb8e8", [T.FLOOR]: "#b08a5a", [T.GDOOR]: "#ffcf4a", [T.DEBRIS]: "#6b4a2a", [T.STAIRS]: "#c8c2e0" };
  let miniBase = null, miniDirty = true;
  // Local minimap: a 72x54-tile window around the party over a fogged map of the whole world
  const miniOff = document.createElement("canvas"); miniOff.width = W; miniOff.height = H;
  function drawMinimap() {
    const c = $("minimap"); c.hidden = false;
    const m = c.getContext("2d"), o = miniOff.getContext("2d");
    if (!miniBase || miniDirty) {
      miniBase = o.createImageData(W, H);
      for (let i = 0; i < W * H; i++) { const n = parseInt((MINI[map[i]] || "#000000").slice(1), 16); miniBase.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4); }
      o.putImageData(miniBase, 0, 0);
      const fog = G.flags.fog || ""; o.fillStyle = "#0c0a18";
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (fog[y * FW + x] !== "1") o.fillRect(x * FOG, y * FOG, FOG, FOG);
      miniDirty = false;
    }
    const px = Math.floor(G.px / TILE), py = Math.floor(G.py / TILE);
    const vx = clamp(px - 36, 0, W - 72), vy = clamp(py - 27, 0, H - 54);
    m.fillStyle = "#0c0a18"; m.fillRect(0, 0, 72, 54);
    m.drawImage(miniOff, vx, vy, 72, 54, 0, 0, 72, 54);
    const fog = G.flags.fog || "";
    m.fillStyle = "#ffffff"; for (const w of WARPS) if (fog[Math.floor(w.y / FOG) * FW + Math.floor(w.x / FOG)] === "1" && (!w.req || w.req())) m.fillRect(w.x - vx, w.y - vy, 1, 1);
    m.fillStyle = "#c8102e"; for (const f of field) m.fillRect(Math.floor(f.px / TILE) - vx, Math.floor(f.py / TILE) - vy, 1, 1);
    const t = routedGoal();
    if (t.text && Math.floor(time * 3) % 2) {
      const gx = t.x - vx, gy = t.y - vy; m.fillStyle = "#ffcf4a";
      if (gx >= 0 && gy >= 0 && gx < 72 && gy < 54) m.fillRect(gx - 1, gy - 1, 3, 3);
      else m.fillRect(clamp(gx, 0, 70), clamp(gy, 0, 52), 2, 2);
    }
    m.fillStyle = "#3ee0e8"; m.fillRect(px - vx - 1, py - vy - 1, 3, 3); m.fillStyle = "#fff"; m.fillRect(px - vx, py - vy, 1, 1);
  }
  function drawPortrait(npc, who) {
    const c = $("portrait"), p = c.getContext("2d");
    p.setTransform(1, 0, 0, 1, 0, 0);
    if (npc && !npc.look.dead) { drawBust(p, npc.look); return; }
    p.fillStyle = "#231d45"; p.fillRect(0, 0, c.width, c.height);
    p.setTransform(48 / 21, 0, 0, 48 / 21, 0, 0);
    const R = (x, y, w, h, col) => { p.fillStyle = col; p.fillRect(x, y, w, h); };
    if (who === "voss") { R(5, 5, 11, 11, "#d8c8b8"); R(7, 9, 2, 1, "#9ef0f5"); R(12, 9, 2, 1, "#9ef0f5"); R(4, 1, 2, 4, "#9ef0f5"); R(14, 0, 2, 5, "#9ef0f5"); R(7, 13, 7, 2, "#5a0f18"); R(3, 16, 15, 5, "#2e2a58"); R(8, 17, 5, 3, "#ffcf4a"); return; }
    if (who === "butcher") { R(5, 4, 11, 12, "#c99a7a"); R(5, 4, 11, 3, "#3a2a1e"); R(7, 9, 2, 1, "#ff2d2d"); R(12, 9, 2, 1, "#ff2d2d"); R(8, 13, 5, 2, "#5a0f18"); R(3, 16, 15, 5, "#d8d0c0"); R(6, 17, 3, 2, "#8a1020"); return; }
    if (who === "warden") { R(4, 5, 13, 14, "#5e5680"); R(6, 2, 2, 3, "#9ef0f5"); R(13, 1, 2, 4, "#9ef0f5"); R(9, 11, 3, 3, "#3ee0e8"); R(6, 8, 2, 1, "#1b1633"); R(13, 8, 2, 1, "#1b1633"); return; }
    if (who === "choirmaster") { R(5, 3, 11, 11, "#efeaf8"); for (let i = 0; i < 4; i++) R(6 + i * 3, 6, 1, 1, "#1b1633"); R(7, 10, 7, 1, "#5a0f18"); for (let i = 0; i < 4; i++) R(7 + i * 2, 9, 1, 3, "#1b1633"); R(3, 14, 15, 7, "#1a1830"); return; }
    if (who === "hollis") { R(5, 3, 11, 10, "#b8c8c8"); R(5, 3, 11, 2, "#2a5a3a"); R(7, 6, 2, 1, "#9ef0f5"); R(12, 6, 2, 1, "#9ef0f5"); R(6, 9, 9, 3, "#5a0f18"); for (let i = 0; i < 5; i++) R(6 + i * 2, 9, 1, 1, "#f2ead8"); R(2, 13, 17, 8, "#c9a227"); R(9, 14, 3, 6, "#ffcf4a"); return; }
    if (!npc) { p.fillStyle = dlg && dlg.text.startsWith("A memory") ? "#9ef0f5" : "#ffcf4a"; p.fillRect(8, 4, 5, 10); p.fillRect(8, 16, 5, 2); return; }
    if (npc.look.dead) { drawPerson(p, 10.5, 14, npc.look); return; }
  }

