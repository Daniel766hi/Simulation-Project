  // ================================================================== CUTSCENE POLISH AND MORE SCENES
  // Scenes hide the HUD, slide in letterbox bars, push the camera in, light torches at night, keep particles
  // moving, and show their lines as subtitles. New scenes: leaving Kessa, and the Bell coming home at the end.
  function sceneHud(hide) {
    for (const id of ["hud", "corner", "minimap"]) { const e = $(id); if (e) e.style.visibility = hide ? "hidden" : ""; }
    banterEl.classList.toggle("subtitle", hide);
  }
  const subStyle = document.createElement("style");
  subStyle.textContent = "#banter.subtitle{bottom:2%;background:transparent;border:none;font-size:clamp(12px,1.9vw,18px);text-align:center;text-shadow:0 2px 0 #000,0 0 6px #000;max-width:90%}";
  document.head.appendChild(subStyle);
  const _playSceneP = playScene;
  playScene = function (steps, done) {
    _playSceneP(steps, done); if (!scene) return;
    const st0 = steps[0] || {};
    Object.assign(scene, { bar: 0, zoom: 1, zoomTo: st0.zoom || 1.18, rain: 0, rainTo: st0.rain || 0 }); sceneHud(true);
  };
  const _endSceneP = endScene;
  endScene = function () { sceneHud(false); _endSceneP(); };
  const _enterStepP = enterStep;
  enterStep = function () { const st = scene && scene.steps[scene.i]; if (st && st.zoom) scene.zoomTo = st.zoom; if (st && st.rain !== undefined) scene.rainTo = st.rain; _enterStepP(); };
  const _updateP2 = update;
  update = function (dt) {
    _updateP2(dt);
    if (!scene || mode !== "scene") return;
    scene.bar += ((scene.i >= scene.steps.length - 1 ? 0 : 22) - scene.bar) * Math.min(1, dt * 3);
    scene.zoom += (scene.zoomTo - scene.zoom) * Math.min(1, dt * 1.2);
    scene.rain += ((scene.rainTo || 0) - scene.rain) * Math.min(1, dt * 0.8);
    for (const p of particles) if (p.world) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.float ? -10 : 140) * dt; p.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    for (const a of Object.values(scene.actors)) {
      if (a.embers && Math.random() < dt * 14) particles.push({ x: a.px + rand(-10, 10), y: a.py - 40 - rand(0, 20), vx: rand(-8, 8), vy: rand(-30, -10), life: rand(0.6, 1.4), color: pick(["#ffcf4a", "#ff8a3a", "#ff5a3a"]), size: Math.random() < 0.4 ? 2 : 1, world: true, float: true });
      if (a.dance) { a.lift = Math.abs(Math.sin(time * 6 + a.px)) * 5; a.dir = Math.sin(time * 2 + a.py) > 0 ? "left" : "right"; a.walking = true; }
    }
  };
  // letterbox, rain and zoom are drawn over the finished world picture
  const _renderWorldP2 = renderWorld;
  renderWorld = function () {
    _renderWorldP2();
    if (!scene) return;
    if (scene.rain > 0.02 && !REDUCED) { g.fillStyle = `rgba(180,200,240,${0.55 * scene.rain})`; for (let i = 0; i < 120 * scene.rain; i++) { const x = (hash(i, 41) * (VIEW_W + 60) - time * 50) % (VIEW_W + 60), y = (hash(i, 43) * VIEW_H + time * 260) % VIEW_H; g.fillRect(Math.round(x), Math.round(y), 1, 5); } g.fillStyle = `rgba(40,60,90,${0.18 * scene.rain})`; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    const b = Math.round(scene.bar); g.fillStyle = "#000"; g.fillRect(0, 0, VIEW_W, b); g.fillRect(0, VIEW_H - b, VIEW_W, b);
  };
  // camera push-in: crop the centre of the frame while a scene plays
  const _renderP = render;
  render = function () {
    if (!scene || battle || scene.zoom < 1.5) return _renderP();
    renderWorld();
    const z = 2, sw = VIEW_W / z, sh = VIEW_H / z, b = scene.bar;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, (VIEW_W - sw) / 2, (VIEW_H - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height); HI.length = 0;
    ctx.fillStyle = "#000"; const k = canvas.height / VIEW_H; ctx.fillRect(0, 0, canvas.width, b * k); ctx.fillRect(0, canvas.height - b * k, canvas.width, b * k);
    $("minimap").hidden = true;
  };
  // torches carried by scene actors, and the lights they make at night
  const _actorsP2 = act2ActorsB;
  act2ActorsB = function (actors, ox, oy) {
    _actorsP2(actors, ox, oy);
    if (!scene) return;
    for (const a of Object.values(scene.actors)) if (a.torch) actors.push({ y: a.py + 1, draw: () => { const P = P2(g, a.px - ox, a.py - oy - (a.lift || 0)); P(6, -20, 2, 12, "#6b3f24"); const f = Math.sin(time * 14 + a.px); P(5, -26 - Math.abs(f) * 2, 4, 5 + Math.abs(f) * 2, "#ffcf4a"); P(6, -24, 2, 3, "#fff2c0"); } });
  };
  const sceneLights = () => scene ? Object.values(scene.actors).filter(a => a.torch || a.glow) : [];

  const VILLAGER = id => (NPCS.find(n => n.id === id) || {}).look || { robe: "#6a5a4a", hair: "#3a2a1e", skin: "#d9a070" };
  // Leaving Kessa: after Ilse joins, the village comes out to watch them go north.
  function departureScene(then) {
    const hide = ["nadia", "abawidow", "tam", "odo", "ilse"].map(id => NPCS.find(n => n.id === id)).filter(Boolean);
    hide.forEach(n => { n.hidden = true; });
    const sx = Math.floor(G.px / TILE), sy = Math.floor(G.py / TILE);
    playScene([
      { cam: [12, 38], zoom: 1.12, add: {
          sable: { x: 12, y: 41, look: HEROES.sable.look, dir: "up", speed: 26 }, ilse: { x: 13, y: 42, look: HEROES.ilse.look, dir: "up", speed: 26 },
          nadia: { x: 15, y: 41, look: VILLAGER("nadia"), dir: "left" }, aba: { x: 9, y: 39, look: VILLAGER("abawidow"), dir: "right" },
          tam: { x: 10, y: 37, look: VILLAGER("tam"), dir: "right" }, odo: { x: 16, y: 37, look: VILLAGER("odo"), dir: "left" } }, line: [null, "Kessa comes out to watch them go. Nobody says much. There isn't much water to spare for crying."], wait: 3.8 },
      { move: { sable: [12, 37], ilse: [13, 37] }, line: ["Nadia", "(She is holding a small pair of shoes.) Bring it home, Sable. Then let me ring it. Once. For him."] },
      { fn: () => { scene.actors.tam.emote = "dots"; }, line: ["Tam", "If you go past the old watchtower... look for Pell. Please. Just look."] },
      { fn: () => { scene.actors.tam.emote = null; scene.actors.odo.emote = "heart"; }, line: ["Odo", "Salves are half price for couriers! ...Today only. Don't tell anyone."] },
      { fn: () => { scene.actors.odo.emote = null; }, move: { sable: [12, 31], ilse: [13, 31] }, cam: [12, 34], line: [null, "The road north runs white and straight into the Glass Flats. Behind them, the black tower. Ahead, whatever took the Bell."], wait: 4.5 },
      { fade: 1, wait: 1.2 },
      { remove: ["sable", "ilse", "nadia", "aba", "tam", "odo"], fn: () => { hide.forEach(n => { n.hidden = false; }); G.px = 12 * TILE + 8; G.py = 31 * TILE + 8; camX = G.px - VIEW_W / 2; camY = G.py - VIEW_H / 2; for (const f of field) f.cool = 5; }, always: true, fade: 0, wait: 0.8 },
    ], then);
    return [sx, sy];
  }
  const _joinPartyP = joinParty;
  joinParty = function (id) {
    _joinPartyP(id);
    if (id === "ilse" && G.stage <= 2 && !G.flags.departed && G.flags.pro === "done") { G.flags.wantDeparture = true; save(); }
  };
  const _updateDep = update;
  update = function (dt) {   // play the departure as soon as the dialogue and chapter card are out of the way
    _updateDep(dt);
    if (G && G.flags.wantDeparture && mode === "play" && !scene) { G.flags.wantDeparture = false; G.flags.departed = true; save(); departureScene(); }
  };
  // The Bell comes home: before the ending card for "A Bell for Everyone" and "The Last King Sleeps".
  function homecomingScene(kind, then) {
    const hide = NPCS.filter(n => ["nadia", "abawidow", "tam", "odo", "ilse", "ama"].includes(n.id)); hide.forEach(n => { n.hidden = true; });
    G.px = 12 * TILE + 8; G.py = 45 * TILE + 8; G.clock = 0.08; field = [];
    const dancers = {}; ["abawidow", "tam", "odo", "ama"].forEach((id, i) => { dancers["v" + i] = { x: 9 + i * 2, y: 43 + (i % 2), look: VILLAGER(id), dir: "down" }; });
    G.members.slice(1, 5).forEach((id, i) => { dancers["h" + i] = { x: 10 + i * 2, y: 46, look: HEROES[id].look, dir: "up" }; });
    playScene([
      { cam: [14, 41], zoom: 1.1, fade: 1, wait: 0.1, add: { sable: { x: 12, y: 44, look: HEROES.sable.look, dir: "up" }, nadia: { x: 12, y: 40, look: VILLAGER("nadia"), dir: "down", speed: 18 }, ...dancers } },
      { fade: 0, line: [null, kind === "ring" ? "Home. The Bell hangs in the black tower again. The sky over Kessa is the colour of wet slate." : "Home. The sea is quiet, the King is asleep, and the Bell hangs in the black tower again."], fn: () => { G.flags.bellHome = true; }, wait: 4 },
      { move: { nadia: [15, 40] }, untilStill: true, line: ["Nadia", "(She walks to the tower with Lio's shoes under her arm.) Three times. Slow. Like the old song."] },
      { fn: () => { scene.actors.nadia.lift = 18; scene.actors.nadia.dir = "up"; playCine(HOMECOMING_BELL, null, { music: "cine_bell" }); }, rain: 1, wait: 0.2 },
      { zoom: 1.08, cam: [13, 43], line: [null, "And it rains. Soft and ordinary and everywhere, the kind of rain that grows things."], fn: () => { for (const a of Object.values(scene.actors)) if (a !== scene.actors.nadia && a !== scene.actors.sable) a.dance = true; }, wait: 4.5 },
      { line: [null, "Kessa goes out and dances in the mud. Nobody has to share a cup. Up in the tower an old woman holds a pair of small shoes out into the rain, so they can feel it too."], wait: 6 },
      { fade: 1, wait: 1.5 },
      { remove: Object.keys(dancers).concat(["sable", "nadia"]), fn: () => { hide.forEach(n => { n.hidden = false; }); }, always: true, wait: 0.1 },
    ], then);
  }
  const _bellShownP = bellShown;
  // make the tower drawing use the new rule
  const _drawPropP2 = drawProp;
  drawProp = function (g2, pr, x, y) {
    if (pr.type !== "belltower" || !G.flags.bellHome || _bellShownP()) return _drawPropP2(g2, pr, x, y);
    _drawPropP2(g2, pr, x, y);
    const R = (dx, dy, w, h, c) => { g2.fillStyle = c; g2.fillRect(Math.round(x + dx), Math.round(y + dy), w, h); }, sw = Math.round(Math.sin(time * 3) * 2);
    R(-5 + sw, -43, 10, 10, "#1b1633"); R(-4 + sw, -42, 8, 9, "#e8b83a"); R(-3 + sw, -41, 2, 6, "#ffe08a");
  };
  const _endingH = ending;
  ending = function (kind) {
    if ((kind === "ring" || kind === "sleep") && !G.flags.homecomingSeen) { G.flags.homecomingSeen = true; mode = "play"; homecomingScene(kind, () => _endingH(kind)); return; }
    _endingH(kind);
  };

