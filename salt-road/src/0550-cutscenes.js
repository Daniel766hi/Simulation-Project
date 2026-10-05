  // ================================================================== CUTSCENES
  // A small scripting system: actors walk, fall and carry things; the camera pans; lines appear in the caption strip.
  // Steps run in order. Play is frozen (mode "scene") until the scene ends, then `done` runs. Esc or E skips.
  let scene = null;
  function playScene(steps, done) {
    scene = { steps, i: 0, t: 0, actors: {}, cam: null, done, prevMode: mode, fade: 0, fadeTo: 0, shakeT: 0 };
    mode = "scene"; banterEl.hidden = true;
    enterStep();
  }
  function enterStep() {
    const st = scene.steps[scene.i]; if (!st) return endScene();
    scene.t = 0;
    if (st.add) for (const [id, a] of Object.entries(st.add)) scene.actors[id] = { dir: "down", walking: false, ...a, px: a.x * TILE + 8, py: a.y * TILE + 8 };
    if (st.remove) for (const id of st.remove) delete scene.actors[id];
    if (st.cam) scene.cam = { x: st.cam[0] * TILE + 8, y: st.cam[1] * TILE + 8 };
    if (st.line) { const [who, text] = st.line; banterEl.innerHTML = `${who ? `<b style="color:var(--scarf)">${who}:</b> ` : ""}${text}`; banterEl.hidden = false; }
    if (st.fade !== undefined) scene.fadeTo = st.fade;
    if (st.shake) shake = Math.max(shake, st.shake);
    if (st.sound) Music.sound(st.sound);
    if (st.fn) st.fn();
    if (st.move) for (const [id, [tx, ty]] of Object.entries(st.move)) { const a = scene.actors[id]; if (a) { a.tx = tx * TILE + 8; a.ty = ty * TILE + 8; } }
  }
  function endScene() { const d = scene.done; scene = null; banterEl.hidden = true; if (mode === "scene") mode = "play"; if (d) d(); }
  function skipScene() { if (!scene) return; for (let k = scene.i; k < scene.steps.length; k++) { const st = scene.steps[k]; if (st.fn && st.always) st.fn(); } scene.i = scene.steps.length; endScene(); }
  const _updateC = update;
  update = function (dt) {
    _updateC(dt);
    if (!scene || mode !== "scene") return;
    const st = scene.steps[scene.i]; scene.t += dt;
    let moving = false;
    for (const a of Object.values(scene.actors)) {
      if (a.tx === undefined) { a.walking = false; continue; }
      const dx = a.tx - a.px, dy = a.ty - a.py, d = Math.hypot(dx, dy), sp = (a.speed || 40) * dt;
      if (d <= sp) { a.px = a.tx; a.py = a.ty; a.tx = undefined; a.walking = false; continue; }
      a.px += dx / d * sp; a.py += dy / d * sp; a.walking = !a.falling; moving = true;
      if (!a.falling) a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    }
    const tgt = scene.cam || { x: G.px, y: G.py };
    const tcx = clamp(tgt.x - VIEW_W / 2, 0, W * TILE - VIEW_W), tcy = clamp(tgt.y - VIEW_H / 2 - 8, 0, H * TILE - VIEW_H);
    camX += (tcx - camX) * Math.min(1, dt * 2.5); camY += (tcy - camY) * Math.min(1, dt * 2.5);
    scene.fade += (scene.fadeTo - scene.fade) * Math.min(1, dt * 2.5);
    const need = st.wait !== undefined ? st.wait : st.line ? 2 + st.line[1].length * 0.04 : 0;
    if (scene.t >= need && !(st.untilStill && moving)) { scene.i++; enterStep(); }
  };
  addEventListener("keydown", e => { if (!scene || mode !== "scene") return; const k = e.key.toLowerCase(); if (k === "escape" || k === "e" || k === "enter") { e.stopImmediatePropagation(); skipScene(); } }, true);
  const _actorsC = act2ActorsB;
  act2ActorsB = function (actors, ox, oy) {
    _actorsC(actors, ox, oy);
    if (!scene) return;
    for (const a of Object.values(scene.actors)) actors.push({ y: a.py + (a.z || 0), draw: () => {
      if (a.draw) { a.draw(g, a.px - ox, a.py - oy, a); return; }
      drawPerson(g, a.px - ox, a.py - oy - (a.lift || 0), { dir: a.dir, walking: a.walking, walk: time * 3.4, bob: 0, ...a.look, glowEyes: !!(a.look && a.look.glowEyes) });
      if (a.carry) { const P = P2(g, a.px - ox, a.py - oy); P(-12, -26, 24, 2, "#6b5a44"); P(-5, -24, 10, 10, "#1b1633"); P(-4, -23, 8, 9, "#e8b83a"); P(-3, -22, 2, 6, "#ffe08a"); }
      if (a.emote) drawEmote(g, a.px - ox + 8, a.py - oy - 30 - (a.lift || 0), a.emote);
    } });
  };
  const _renderWorldC = renderWorld;
  renderWorld = function () { _renderWorldC(); if (scene) { if (scene.fade > 0.01) { g.fillStyle = `rgba(6,4,16,${scene.fade})`; g.fillRect(0, 0, VIEW_W, VIEW_H); } } };
  const _nearestNpcC = nearestNpc;
  nearestNpc = function () { return mode === "scene" ? null : _nearestNpcC(); };

  // ---- the prologue's scenes
  const LIO_LOOK = { robe: "#4a7a9a", hair: "#3a2a1e", skin: "#d9a070", style: { hair: "fringe", eye: "#3a6a8a" } };
  const GUILD_LOOK = { robe: "#3a2a1e", hair: "#1b1633", skin: "#c98d63", style: { hair: "hood", hood: "#2a2a2a", coat: true } };
  const LIMP_LOOK = { robe: "#c9a227", hair: "#5a3a2a", skin: "#b88a64", style: { hair: "cap", coat: true, beard: true } };
  function lioGreets() {
    const lio = NPCS.find(n => n.id === "lio"); const px = Math.floor(G.px / TILE), py = Math.floor(G.py / TILE);
    if (lio) lio.hidden = true;
    playScene([
      { add: { lio: { x: 16, y: 41, look: LIO_LOOK, speed: 70 } }, cam: [14, 41], wait: 0.6 },
      { move: { lio: [px + 1, py] }, untilStill: true, wait: 0.2 },
      { fn: () => { scene.actors.lio.dir = "left"; scene.actors.lio.emote = "heart"; }, line: ["Lio", "SABLE! You're up! Grandma's by the well with the water, she's been asking for you. And after, come to the tower! I polished the ring!"] },
      { fn: () => { scene.actors.lio.emote = null; }, move: { lio: [16, 41] }, untilStill: true, wait: 0.2 },
      { remove: ["lio"], fn: () => { if (lio) lio.hidden = false; }, always: true, wait: 0.1 },
    ]);
  }
  function theftArrive(then) {
    playScene([
      { cam: [15, 37], add: {
          thief1: { x: 14, y: 37, look: GUILD_LOOK, dir: "up", torch: true }, thief2: { x: 17, y: 37, look: GUILD_LOOK, dir: "up", torch: true }, limp: { x: 16, y: 38, look: LIMP_LOOK, dir: "up" },
          fire: { x: 15, y: 39, embers: true, draw: () => {} },
          lio: { x: 15, y: 38, look: LIO_LOOK, lift: 30, dir: "down", emote: "bang" } }, zoom: 1.22, line: [null, "Torches on the tower. Men in Guild coats, hauling the Rain Bell down on ropes. And Lio, halfway up, holding the bell-rope with both hands."], sound: "encounter" },
      { line: ["Lio", "SABLE! I'm holding on! I'm holding on like a courier!"] },
      { fn: () => { scene.actors.limp.dir = "down"; }, line: ["The limping man", "(Tiredly, almost gently.) Let go of the rope, boy. It isn't yours."] },
      { line: ["Lio", "It IS mine! I'm ringing it at the first rain! I'm ringing it for everyone!"] },
      { fn: () => { scene.actors.limp.dir = "left"; }, line: ["The limping man", "(Without looking at you.) Dogs."], wait: 1.6 },
    ], then);
  }
  function theftFall(then) {
    playScene([
      { cam: [15, 37], add: {
          thief1: { x: 14, y: 37, look: GUILD_LOOK, dir: "up", torch: true }, thief2: { x: 17, y: 37, look: GUILD_LOOK, dir: "up", torch: true }, limp: { x: 16, y: 38, look: LIMP_LOOK, dir: "up", torch: true },
          fire: { x: 15, y: 39, embers: true, draw: () => {} },
          lio: { x: 15, y: 38, look: LIO_LOOK, lift: 30, dir: "down" } }, zoom: 1.25, line: [null, "You reach the foot of the stairs as the Bell swings out over the dark on its ropes. The limping man looks straight at you. He has very tired eyes."] },
      { line: [null, "Then he cuts the bell-rope. Lio is still holding it."], wait: 2.2 },
      { fn: () => { const l = scene.actors.lio; l.falling = true; l.speed = 150; l.py -= l.lift; l.lift = 0; }, zoom: 1.4, move: { lio: [15, 40] }, untilStill: true, wait: 0.1 },
      { shake: 6, sound: "defeat", wait: 1.6, fn: () => { scene.actors.lio.draw = (g2, x, y) => { const P = P2(g2, x, y); P(-8, -4, 16, 6, "#1b1633"); P(-7, -3, 14, 4, "#4a7a9a"); P(5, -4, 4, 4, "#d9a070"); P(6, -5, 3, 2, "#3a2a1e"); for (let i = 0; i < 10; i++) P(-12 + i, -1 + (i % 2), 1, 1, "#8a7a5a"); }; } },
      { fn: () => { scene.actors.thief1.carry = true; scene.actors.thief2.carry = true; }, move: { thief1: [14, 30], thief2: [17, 30], limp: [16, 31] }, line: [null, "They go north into the dark with the Bell slung between them on a pole. The limping man looks back, once."] },
      { wait: 1.2, remove: ["thief1", "thief2", "limp"] },
      { cam: [15, 40], zoom: 1.5, line: [null, "You don't remember crossing the square. You remember the sound. You remember that he was still holding the rope."], wait: 3.5 },
    ], then);
  }
  function nadiaMourns(then) {
    const nd = NPCS.find(n => n.id === "nadia"); if (nd) nd.hidden = true;
    playScene([
      { cam: [15, 40], add: { nadia: { x: 12, y: 39, look: nd ? nd.look : {}, speed: 22 } }, fade: 0.3, wait: 0.5 },
      { move: { nadia: [15, 40] }, untilStill: true, line: [null, "At dawn, Nadia walks to the foot of the black tower. Very slowly. She is carrying a small pair of shoes."] },
      { fn: () => { scene.actors.nadia.dir = "up"; }, line: [null, "She sets them down on the bottom step, side by side, the way he always left them, and sits beside them."], wait: 4 },
      { fade: 0, remove: ["nadia"], fn: () => { if (nd) { nd.hidden = false; nd.x = 15; nd.y = 41; nd.px = 15 * TILE + 8; nd.py = 41 * TILE + 8; } G.flags.nadiaAtTower = true; save(); }, always: true, wait: 0.3 },
    ], then);
  }
  const _updateCP = update;
  update = function (dt) {
    _updateCP(dt);
    const f = G && G.flags; if (!f || mode !== "play" || G.stage !== 0) return;
    if (f.pro === "morning" && !f.lioGreeted) { f.lioGreeted = true; save(); lioGreets(); }
    else if (f.pro === "done" && !f.mournPlayed) { f.mournPlayed = true; save(); nadiaMourns(); }
    const nd = NPCS.find(n => n.id === "nadia");
    if (nd && f.nadiaAtTower && !nd.hidden) { nd.px = 15 * TILE + 8; nd.py = 41 * TILE + 8; nd.dir = "up"; }
  };

  // full screen (on phones, also try to lock landscape)
  $("pauseUI").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.dataset.a !== "fullscreen") return;
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) { toast("Full screen isn't available in this browser. Try adding the page to your home screen."); return; }
    Promise.resolve(req.call(el)).then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); resumeGame(); }).catch(() => toast("Full screen was blocked by the browser."));
  });
