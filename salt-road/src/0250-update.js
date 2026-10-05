  // ================================================================== UPDATE
  let hudTimer = 0;
  const onceFlags = {};          // short cooldowns for prompts; kept out of the save on purpose
  const once = (flag, fn) => { if (!onceFlags[flag]) { onceFlags[flag] = true; fn(); setTimeout(() => { onceFlags[flag] = false; }, 4000); } };
  function update(dt) {
    time += dt;
    if (toastTimer > 0 && (toastTimer -= dt) <= 0) $("toast").hidden = true;
    if (mode === "dialog" && dlg && typed < dlg.text.length) { typed = SETTINGS.text === "instant" ? dlg.text.length : typed + dt * (SETTINGS.text === "slow" ? 30 : 60); renderDialog(); }
    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.drip ? 220 : 140) * dt; p.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    popups.forEach(p => { p.life -= dt; p.y -= 16 * dt; }); popups = popups.filter(p => p.life > 0);
    if (battle) {
      for (const u of [...battle.foes, ...battle.heroes]) { u.hurt = Math.max(0, (u.hurt || 0) - dt); u.shake = Math.max(0, (u.shake || 0) - dt * 30); u.lunge = Math.max(0, (u.lunge || 0) - dt * 3); if (u.dead) u.deathT = (u.deathT || 0) + dt; }
      battle.flash = Math.max(0, battle.flash - dt * 2);
    }
    if (shake > 0) shake = Math.max(0, shake - dt * 18);
    if (warpFade > 0) warpFade = Math.max(0, warpFade - dt * 2.5);
    if (mode !== "play") return;

    let mx = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0) + stick.x;
    let my = (keys["s"] || keys["arrowdown"] ? 1 : 0) - (keys["w"] || keys["arrowup"] ? 1 : 0) + stick.y;
    const len = Math.hypot(mx, my);
    if (len > 1) { mx /= len; my /= len; }
    const moving = len > 0.1 || player.dashT > 0;
    player.moving = moving;
    player.sprint = keys["shift"] || keys["k"] || player.sprintTouch;
    player.dashCd = Math.max(0, player.dashCd - dt);
    const dashing = player.dashT > 0;
    if (dashing) { player.dashT -= dt; mx = player.dashX; my = player.dashY; if (player.dashT <= 0 && !REDUCED) burst(G.px, G.py, "#d8d0e6", 4, 30); }
    if (moving) player.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? "right" : "left") : (my > 0 ? "down" : "up");
    const mud = tileAt(G.px, G.py) === T.MUD || tileAt(G.px, G.py) === T.SHALLOW;
    const speed = (dashing ? DASH_SPEED : player.sprint ? 118 : 64) * (mud ? 0.6 : 1);
    let bx = 0, by = 0;
    for (let sub = 0; sub < 3; sub++) {            // small steps so a dash never skips through a wall
      const nx = G.px + mx * speed * dt / 3, ny = G.py + my * speed * dt / 3;
      const bx1 = blocked(nx, G.py); if (!bx1) G.px = nx; else bx = bx1;
      const by1 = blocked(G.px, ny); if (!by1) G.py = ny; else by = by1;
    }
    if (dashing && (bx || by) && !player.bonked) { player.bonked = true; shake = Math.max(shake, 3); Music.sound("hit"); player.dashT = 0; }
    if (!dashing) player.bonked = false;
    for (const b of [bx, by]) {
      if (b === T.LDOOR && !sealOpen()) once("saidDark", () => openDialog(G.keyItems.lantern ? "sign_seal" : "sign_dark"));
      if (b === T.LOCKED) {
        if (G.keyItems.key) { set(34, 11, T.DARK); miniDirty = true; G.keyItems.key = false; G.flags.unlocked = true; advance(5); toast("The rain-drop door grinds open. Something above you stops singing."); burst(34 * TILE + 8, 11 * TILE + 8, "#ffcf4a", 20); save(); updateHud();
          card("Chapter V", "The Salt-Flayed", "Beyond the rain-drop door the air tastes of blood and salt. At the top of the stairs a man in a Guild coat is waiting, and the Rain Bell is ringing in his chest."); }
        else once("saidLock", () => openDialog("sign_lock"));
      }
    }
    if (moving) { player.walk += dt * (player.sprint ? 4.6 : 3.2); player.stepT -= dt; if (player.stepT <= 0) { player.stepT = player.sprint ? 0.22 : 0.32; Music.sound("step"); } }
    if (dashing) player.ghosts.push({ x: G.px, y: G.py, dir: player.dir, life: 0.28, dash: true });
    else if (player.sprint && moving && Math.random() < dt * 14) player.ghosts.push({ x: G.px, y: G.py, dir: player.dir, life: 0.18 });
    if (player.sprint && moving && !dashing && Math.random() < dt * 18) particles.push({ x: G.px + rand(-3, 3), y: G.py + 1, vx: -mx * 20 + rand(-8, 8), vy: -rand(4, 14), life: rand(0.25, 0.45), color: "#cbc3da", size: 1, world: true });
    if (dashing) player.lines.push({ x: G.px + rand(-6, 6), y: G.py - rand(2, 18), dx: player.dashX, dy: player.dashY, life: 0.18 });
    player.lines.forEach(l => l.life -= dt); player.lines = player.lines.filter(l => l.life > 0);
    player.ghosts.forEach(gh => gh.life -= dt); player.ghosts = player.ghosts.filter(gh => gh.life > 0);
    const neck = { x: G.px + (player.dir === "left" ? 3 : player.dir === "right" ? -3 : 0), y: G.py - 12 };
    player.scarf.unshift(neck);
    const sway = Math.sin(time * 5);
    player.scarf = player.scarf.slice(0, 22).map((p, i) => i === 0 ? p : { x: p.x + (moving ? 0 : sway * 0.18), y: p.y + (moving ? 0 : 0.1) });
    // the party's path: a point for every two pixels walked, so followers keep a stride apart whatever the speed
    const pth = player.path || (player.path = []), last = pth[0];
    if (!last || Math.hypot(G.px - last.x, G.py - last.y) > 60) { player.path = [{ x: G.px, y: G.py }]; }
    else if (Math.hypot(G.px - last.x, G.py - last.y) >= 2) { pth.unshift({ x: G.px, y: G.py }); if (pth.length > 90) pth.length = 90; }

    const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE);
    if (get(tx, ty) === T.DARK && ty > 11 && ty < 19) G.checkpoint = { x: 34 * TILE + 8, y: 18 * TILE + 8 };

    // Choirmaster guards the key chest
    if (G.stage >= 4 && !G.flags.choirDead && near({ x: KEY_CHEST.x * TILE + 8, y: KEY_CHEST.y * TILE + 8 }, 30)) once("choirPrompt", () => openDialog("choir_scene"));
    if (!G.keyItems.key && !G.flags.unlocked && G.flags.choirDead && near({ x: KEY_CHEST.x * TILE + 8, y: KEY_CHEST.y * TILE + 8 }, 14)) {
      G.keyItems.key = true; burst(G.px, G.py - 8, "#ffcf4a", 24); Music.sound("item"); save(); updateHud(); openDialog("key_found");
    }
    if (G.flags.benoQuest && !G.keyItems.charm && !G.flags.charmReturned && near(CHARM, 12)) {
      G.keyItems.charm = true; toast("Found Beno's charm! Take it back to him in the grove."); Music.sound("item"); burst(CHARM.x, CHARM.y, "#ff8ab0", 20); save(); updateHud();
    }
    if (G.flags.shardQuest) for (const sh of SHARDS) {
      const found = G.flags.shards;
      if (!found.includes(sh.id) && near({ x: sh.x * TILE + 8, y: sh.y * TILE + 8 }, 13)) {
        found.push(sh.id); burst(sh.x * TILE + 8, sh.y * TILE + 4, "#9ef0f5", 26); Music.sound("item"); toast(`Memory shard ${found.length}/3`); save(); updateHud(); openDialog(sh.node); break;
      }
    }
    G.flags.chests = G.flags.chests || {};
    for (const c of CHESTS) {
      if (G.flags.chests[c.id] || !near({ x: c.x * TILE + 8, y: c.y * TILE + 8 }, 13)) continue;
      G.flags.chests[c.id] = true; burst(c.x * TILE + 8, c.y * TILE, "#ffcf4a", 20); Music.sound("item");
      if (c.item) { G.items[c.item] = (G.items[c.item] || 0) + 1; toast(`Treasure! Found ${ITEMS[c.item].name}.`); } else { G.coins += c.coins; toast(`Treasure! +${c.coins} coin`); }
      save(); updateHud();
    }
    const reg = REGIONS.find(r => tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1);
    const inDark = get(tx, ty) === T.DARK;
    Music.play(tx >= 130 && ty < 90 && !reg ? "deep" : inDark ? "cathedral" : reg ? reg.music : "flats");   // the far east of the old map is the Deep; the Dry Sea below it has its own music
    if (reg && reg.name !== region) {
      const first = region === ""; region = reg.name;
      if (!first) { const bn = $("banner"); $("bannerText").textContent = reg.name; bn.hidden = true; void bn.offsetWidth; bn.hidden = false; clearTimeout(bn._t); bn._t = setTimeout(() => { bn.hidden = true; }, 2800); }
    }
    unstick(); checkWarp(); reveal();
    // story triggers
    act2Triggers();
    if (G.stage >= 2 && !G.flags.butcherDead && near({ x: 36 * TILE + 8, y: 29 * TILE + 8 }, 30)) once("butcherPrompt", () => openDialog("maru_scene0"));
    if (G.stage >= 3 && G.flags.metRook && !G.flags.motherDead && near(MOTHER_POS, 30)) once("motherPrompt", () => openDialog("mother_scene"));
    if (G.flags.unlocked && !G.flags.vossDead && ty <= 10 && near(VOSS_POS, 34)) once("vossPrompt", () => interact());
    if (G.stage >= 6 && G.flags.renJoined && !G.flags.hollisDead && near(HOLLIS_POS, 26)) once("hollisPrompt", () => openDialog("hollis_scene"));
    if (G.flags.tamQuest && !G.flags.wyrmDead && near(WYRM_POS, 30)) once("wyrmPrompt", () => openDialog("wyrm_scene0"));
    if (G.stage >= 6 && !G.flags.renJoined && near({ x: 58 * TILE + 8, y: 12 * TILE + 8 }, 26)) once("renPrompt", () => openDialog("ren_bell"));

    for (const f of field) {
      if (mode !== "play") break;          // a story scene opened this frame
      f.t += dt; f.cool = Math.max(0, f.cool - dt);
      const dx = G.px - f.px, dy = G.py - f.py, d = Math.hypot(dx, dy) || 1;
      let vx, vy;
      if (d < 70 && f.cool <= 0) { vx = dx / d * 38; vy = dy / d * 38; }
      else { vx = (f.hx - f.px) * 0.5 + Math.cos(f.t * 0.8) * 10; vy = (f.hy - f.py) * 0.5 + Math.sin(f.t) * 10; }
      const ex = f.px + vx * dt, ey = f.py + vy * dt;
      const bad = t => SOLID.has(t) || t === T.LDOOR || (f.dark ? t !== T.DARK : t === T.DARK);
      if (!bad(tileAt(ex, f.py))) f.px = ex;
      if (!bad(tileAt(f.px, ey))) f.py = ey;
      const ambush = dashing || player.dashCd > DASH_COOLDOWN - 0.4;   // right after a dash still counts
      if (d < (ambush ? 16 : 12) && f.cool <= 0) {
        const t0 = tileAt(f.px, f.py);
        startBattle(f.group, { fieldId: f.id, ambush, area: f.area || areaAt(Math.floor(f.px / TILE), Math.floor(f.py / TILE), f) });
        break;
      }
    }

    if (G.flags.benoFollows) {
      const b = NPCS.find(n => n.id === "beno");
      const p = player.scarf[Math.min(player.scarf.length - 1, 4 + (G.members.length - 1) * 4)] || { x: G.px, y: G.py - 10 };
      const tx2 = p.x, ty2 = p.y + 10, dd = Math.hypot(tx2 - b.px, ty2 - b.py);
      if (dd > 60) { b.px = tx2; b.py = ty2; }
      else if (dd > 2) { b.dir = player.dir; b.px += (tx2 - b.px) * Math.min(1, dt * 6); b.py += (ty2 - b.py) * Math.min(1, dt * 6); b.walking = player.moving; }
    }
    const tcx = G.px - VIEW_W / 2, tcy = G.py - VIEW_H / 2 - 8;
    camX += (tcx - camX) * Math.min(1, dt * 6); camY += (tcy - camY) * Math.min(1, dt * 6);
    camX = clamp(camX, 0, W * TILE - VIEW_W); camY = clamp(camY, 0, H * TILE - VIEW_H);
    hudTimer -= dt; if (hudTimer <= 0) { updateHud(); hudTimer = 0.4; }
  }

