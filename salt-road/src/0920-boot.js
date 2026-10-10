  // ================================================================== BOOT
  const saved = load();          // read the save before a fresh game could overwrite it
  newGame(false);
  if (saved && saved.stage > 0) {
    Object.assign(G, saved);
    if (!G.active || !G.active.length) G.active = G.members.slice(0, 4);
    if (G.flags.fog && G.flags.fog.length === 13 * 9) { const old = G.flags.fog; let f = ""; for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) f += x < 13 && old[y * 13 + x] === "1" ? "1" : "0"; G.flags.fog = f; }
    if (!G.flags.fog) { let f = ""; for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) f += x * FOG < OW && y * FOG < OH ? "1" : "0"; G.flags.fog = f; }
    applyWorldState();
    miniDirty = true; spawnField();
    camX = G.px - VIEW_W / 2; camY = G.py - VIEW_H / 2;
    $("startBtn").textContent = "Continue"; $("newBtn").hidden = false;
  }
  updateHud(); resize();
  addEventListener("resize", resize);
  let last = performance.now();
  const loopErrors = window.__saltRoadErrors = [];
  // on a phone there is no console to look in: a caught error also shows as a small note, so it can be screenshotted
  function showErrorNote(msg, where) {
    let el = document.getElementById("errNote");
    if (!el) { el = document.createElement("div"); el.id = "errNote"; el.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:99;max-width:70vw;font:11px/1.3 monospace;background:rgba(40,0,10,.88);color:#ffd0d6;border:1px solid #c8102e;border-radius:6px;padding:4px 8px;pointer-events:auto"; el.title = "Tap to hide"; el.addEventListener("click", () => el.remove()); document.body.appendChild(el); }
    el.textContent = `Salt Road hit an error (${where}, mode ${mode}): ${msg.slice(0, 160)}. The game kept running. A screenshot of this helps. Tap to hide.`;
  }
  addEventListener("unhandledrejection", e => { const msg = String(e.reason && e.reason.message || e.reason); if (!loopErrors.includes(msg)) { loopErrors.push(msg); console.error("Salt Road async error:", e.reason); showErrorNote(msg, "battle/async"); } });
  addEventListener("error", e => { const msg = String(e.message || e.error); if (!loopErrors.includes(msg)) { loopErrors.push(msg); showErrorNote(msg, "input"); } });
  function loop(now) {
    requestAnimationFrame(loop);          // queued first, so one bad frame can never stop the game
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    try {
      if (!paused) { update(dt); if (G && mode !== "title") { G.stats = G.stats || {}; G.stats.time = (G.stats.time || 0) + dt; } }
      if (!SIM.fast) { render(); paintScene(); }   // the balance simulation needs no pictures
    } catch (err) {
      const msg = String(err && err.message || err);
      if (!loopErrors.includes(msg)) { loopErrors.push(msg); console.error("Salt Road frame error:", err); showErrorNote(msg, "frame"); }
    }
  }
  requestAnimationFrame(loop);
  // For quick checks from a browser console, e.g. window.__saltRoad.battle(["ghoul","jackal"])
  window.__saltRoad = { battle: (grp, opts) => startBattle(grp, opts || {}), closeDlg: () => { if (dlg) closeDialogFor(null); }, music: () => Music.track, musicStyle: v => { SETTINGS.musicStyle = v; saveSettings(); return Music.track; }, renderTrack: async (key, secs = 10) => {   // render a track offline for previews and level checks
    const sr = 22050, oc = new OfflineAudioContext(1, sr * secs, sr), keep = { ctx: Music.ctx, bus: Music.bus, sfx: Music.sfx, master: Music.master, noiseBuf: Music.noiseBuf, dist: Music.dist, delay: Music.delay };
    Music.ctx = oc; Music.master = oc.createGain(); Music.master.connect(oc.destination); Music.bus = oc.createGain(); Music.bus.gain.value = 0.5 * 0.8 * (({ lofi: 1.5, trap: 0.7, drill: 0.7, soul: 1.05, darkwave: 1.4, boombap: 1.35, funk: 1.6, blues: 1.15, afro: 1.6, metal: 0.95, dub: 1.15, rock: 0.8, synthwave: 1.35, dnb: 1.3, triphop: 1.15, grime: 1.6, epic: 0.7 })[(TRACKS[key] && TRACKS[key].genre)] || 1); Music.bus.connect(Music.master); Music.sfx = Music.bus; Music.dist = null; Music.delay = null;
    Music.noiseBuf = oc.createBuffer(1, sr, sr); const nd = Music.noiseBuf.getChannelData(0); for (let i = 0; i < sr; i++) nd[i] = Math.random() * 2 - 1;
    const tr = TRACKS[key], dur = 60 / tr.bpm / 4; for (let s = 0, t = 0.05; t < secs - 0.5; s++, t += dur) tr.play(s % 64, t, dur);
    const buf = await oc.startRendering(); Object.assign(Music, keep);
    const d = buf.getChannelData(0); let pk = 0, sq = 0; for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > pk) pk = a; sq += d[i] * d[i]; }
    const rms = Math.sqrt(sq / d.length), n = d.length, ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab); const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
    const g = pk > 0.98 ? 0.98 / pk : 1; for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i] * g)) * 32767, true);
    let bin = ""; const u8 = new Uint8Array(ab); for (let i = 0; i < u8.length; i += 8192) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return { peak: pk, rms, wav: btoa(bin) };
  }, trackKeys: () => Object.keys(TRACKS), rigSheet: (ids, poses, zoom = 3) => { const c = document.createElement("canvas"); c.width = poses.length * RIG_W * zoom; c.height = ids.length * RIG_H * zoom; const g = c.getContext("2d"); g.imageSmoothingEnabled = false; g.fillStyle = "#1d1830"; g.fillRect(0, 0, c.width, c.height);
    ids.forEach((id, r) => poses.forEach((ps, i) => { const fr = rigFrame(id, POSE[ps], "sheet:" + ps + "|g" + gearTiers(id).join("."), 0.3, false); g.drawImage(fr, i * RIG_W * zoom, r * RIG_H * zoom, RIG_W * zoom, RIG_H * zoom); })); return c.toDataURL(); },
  rigPose: (i, name, secs = 3) => { if (battle && battle.heroes[i]) { playAct(battle.heroes[i], name, secs); return true; } return false; }, bossMoves: () => Object.entries(MONSTERS).filter(([, m]) => m.boss).map(([id, m]) => id + ': ' + m.moves.map(mv => mv.name + (mv.announce ? '[A]' : '') + (mv.charge ? '[C]' : '') + (mv.target ? '[' + mv.target + ']' : '') + (mv.all ? '[all]' : '')).join(', ')).join('\n'), sigFx: (kind) => { if (!battle) return false; const f = battle.foes[0]; RIG_FX.push({ kind: 'sig:' + kind, unit: f, t0: time, dur: 1.2, heroes: battle.heroes.map(h => unitPos(h)) }); return true; }, heroSkills: () => Object.entries(HEROES).map(([id, hh]) => id + ': ' + (hh.skills || []).map(s => s.name + '{' + Object.keys(s).filter(k => !['name','desc','cost','lvl','pcost'].includes(k)).map(k => k + (typeof s[k] === 'string' ? '=' + s[k] : '')).join(',') + '}').join(' | ')).join('\n'), skillFxTest: (heroIdx, name, foeTargets) => { if (!battle) return false; const u = battle.heroes[heroIdx]; const s = { name, target: foeTargets ? 'allEnemies' : 'party' }; battle.act = { u, skill: s }; return skillFx(u, { skill: s, unit: null }); }, chainTest: () => { if (!battle) return false; battle.chainT = time; battle.chainN = battle.heroes.length; const t = battle.foes[0]; battle.heroes.forEach((h, i) => setTimeout(() => chainBlow(h, t, i === battle.heroes.length - 1), 400 + i * 380)); return true; }, setStatus: (side, i, st) => { if (!battle) return false; const u = (side === 'hero' ? battle.heroes : battle.foes)[i]; if (!u) return false; Object.assign(u.st, st); renderCards(); return true; }, gearTest: (id, w, a) => { G.gear = G.gear || {}; const cur = G.gear[id] || (G.gear[id] = {}); for (const [slot, t] of [['weapon', w], ['armor', a]]) { if (cur[slot]) applyGear(G.party[id], cur[slot], -1); delete cur[slot]; if (t) { const key = (slot === 'weapon' ? 'w_' + WCLASS[id] : 'a_' + ACLASS[id]) + '_' + t; applyGear(G.party[id], key, 1); cur[slot] = key; } } return { ...G.party[id] }; }, gearShop: who => { refreshGear(who, 'odo_0'); return D.gear_shop.choices.map(c => typeof c.t === 'function' ? c.t() : c.t); }, bossPhaseTest: () => { if (!battle) return null; const f = battle.foes[0]; const before = { hp: f.hp, atk: f.atk }; damage(f, Math.ceil(f.hp - f.maxHp * 0.49), { silent: true }); return { before, after: { hp: f.hp, max: f.maxHp, atk: f.atk, spd: f.spd, phase2: !!f.phase2, charged: !!f.charged } }; }, foeStats: () => battle ? battle.foes.map(f => f.id + ' hp' + f.maxHp + ' atk' + f.atk) : null, endingTest: k => { ending(k); const c = document.getElementById('card'), t = document.getElementById('cardText'), tt = document.getElementById('cardTitle'); const r = tt.getBoundingClientRect(), rt = t.getBoundingClientRect(); return { titleTop: Math.round(r.top), textBottom: Math.round(rt.bottom), vh: innerHeight, scrolls: t.scrollHeight > t.clientHeight, long: t.classList.contains('long') }; }, dialogKeys: () => Object.keys(D), bossArtP2: (id, ph = 0) => { const A = P2ART[id]; if (!A) return null; const u = { id, sprite: MONSTERS[id].sprite, phase2: -10 }; const B = p2ArtFor(u); return artFrame(B, B.key, ph, false).toDataURL(); }, forceWin: () => { if (!battle) return false; for (const f of battle.foes) { f.hp = 0; f.dead = true; } victory(); return true; }, cont: () => battle && battle.waitingContinue ? (battle.waitingContinue(), true) : false, lose: () => battle ? (endBattle("lost"), true) : false, dlgChoices: () => dlg && dlg.choices ? dlg.choices.map(c => typeof c.t === "function" ? c.t() : c.t) : null, voiceWav: async (who, text) => {   // a character's voice speaking a line, rendered offline for previews and level checks
    const buf = await Voice.render(who, text), d = buf.getChannelData(0), sr = buf.sampleRate, n = d.length; let pk = 0, sq = 0; for (let i = 0; i < n; i++) { const a = Math.abs(d[i]); if (a > pk) pk = a; sq += d[i] * d[i]; }
    const ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab), w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i] * 0.6)) * 32767, true);
    let bin = ""; const u8 = new Uint8Array(ab); for (let i = 0; i < u8.length; i += 8192) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return { peak: pk, rms: Math.sqrt(sq / n), secs: n / sr, wav: btoa(bin) };
  },  drawMon: (id, w = 220, h = 150, t) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const M = MONSTERS[id]; const u = { id, name: M.name, sprite: M.sprite, boss: M.boss, hurt: 0, st: {}, hp: M.hp, maxHp: M.hp, side: 'foe', slot: 0, count: 1 }; if (t !== undefined) time = t; drawBattleMonster(M.pal ? palCtx(g, M.pal) : g, u, w / 2, h - 8); return c.toDataURL(); }, monIds: () => Object.keys(MONSTERS), bossArt: (id, ph = 0, white = false) => { const M = MONSTERS[id], u = { id, sprite: M.sprite }; const A = bossArtFor(u); return A ? artFrame(A, A.key, ph, white).toDataURL() : null; }, open: id => openDialog(id), endCine: () => { if (cine) endCine(); }, flee: () => { if (battle) endBattle("fled"); }, state: () => G, mode: () => mode, reach: () => {
    const seen = new Set(), q = [[12, 47]]; seen.add("12,47");
    const pass = (x, y) => { const t = get(x, y); return (!SOLID.has(t) || t === T.LOCKED || t === T.DOOR) && !propSolid.has(x + "," + y); };
    const worldPass = (x, y) => pass(x, y) || [T.GDOOR, T.DEBRIS].includes(get(x, y));
    while (q.length) {
      const [x, y] = q.pop();
      const w = WARPS.find(w => w.x === x && w.y === y);
      if (w) { const k = w.to[0] + "," + w.to[1]; if (!seen.has(k)) { seen.add(k); q.push([w.to[0], w.to[1]]); } }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + "," + (y + dy); if (!seen.has(k) && worldPass(x + dx, y + dy)) { seen.add(k); q.push([x + dx, y + dy]); } }
    }
    const spots = { ...Object.fromEntries(NPCS.map(n => [n.id, [n.x, n.y]])), ...Object.fromEntries(CHESTS.map(c => ["chest_" + c.id, [c.x, c.y]])), ...Object.fromEntries(LORE.map(l => ["lore" + l.id, [l.x, l.y]])),
      ...Object.fromEntries(SHARDS.map(c => ["shard" + c.id, [c.x, c.y]])), key: [40, 17], charm: [11, 15], mother: [62, 43], voss: [34, 8], hollis: [61, 12], bell: [34, 6], gaterest: [56, 15], groverest: [60, 44], wyrm: [7, 11] };
    return Object.entries(spots).filter(([, [x, y]]) => ![[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has((x + dx) + "," + (y + dy)))).map(([k]) => k);
  }, props: () => PROPS.length, battleState: () => battle && battle.foes.map(f => f.name + ":" + f.hp + "/" + f.maxHp).join(" "), clearField: () => { field = []; }, respawn: () => spawnField(), rest: () => restParty(), fish: () => fishing, field: () => field, storm: () => { stormWait = 0; return storm; }, cineTest: k => playCine({ crown: CROWN_END, keeper: KEEPER_END, butcher: CINE_BEFORE.maru_scene0.shots, quill: CINE_BEFORE.quill_scene.shots, maw: CINE_BEFORE.maw_scene.shots, vela: CINE_BEFORE.vela_scene.shots, corvin: CINE_BEFORE.corvin_scene.shots, mother: CINE_BEFORE.mother_scene.shots, maru: MARU_SONG, rook: ROOK_LAST, ren: REN_DOOR, hollis: HOLLIS_UNMASKED, king: KING_RISES, salt: SALT_CHILD, teodor: CINE_BEFORE.hermit5_0.shots, lanterns: CINE_BEFORE.love_h3_0.shots, whistle: CINE_BEFORE.gulp_love0.shots }[k], null, { music: "cine_deep" }), propsList: () => PROPS.map(p => [p.type, p.x, p.y, get(p.x, p.y)]), bopts: () => battle && JSON.stringify(battle.opts), tile: (x, y) => get(x, y), win: () => battle && battle.foes.forEach(f => { f.hp = 1; }), end: k => ending(k), ach: () => achGot(), tp: (x, y) => { G.px = x * TILE + 8; G.py = y * TILE + 8; }, blocked: (x, y) => blocked(x, y), goal: () => goal(), warps: () => WARPS, dialogs: () => D, dlg: () => dlg, talkTo: id => { const n = NPCS.find(n => n.id === id); return n && npcVisible(n) ? dialogFor(n) : undefined; }, npcIds: () => NPCS.filter(n => npcVisible(n)).map(n => n.id), layout: () => {   // screen-space boxes of characters and texts, for the overlap audit
    const cr = canvas.getBoundingClientRect(), d = cr.width / canvas.width, sx = VP.k * d, sy = VP.k * d;
    const box = (x, y, w, h, name) => ({ name, x: cr.left + VP.ox * d + x * sx, y: cr.top + VP.oy * d + y * sy, w: w * sx, h: h * sy });
    const chars = [];
    if (battle) {
      for (const u of [...battle.heroes.filter(h => alive(h)), ...battle.foes.filter(f => !f.dead)]) { const b = spriteBox(u); chars.push(box(b.x, b.y, b.w, b.h, (u.side === "hero" ? "hero:" : "foe:") + u.id)); }
    } else if (cine) chars.push(box(0, 0, VIEW_W, VIEW_H, "cine-art"));   // a caption may touch no part of a cutscene picture
    else if (mode !== "title") chars.push(...worldCharBoxes());
    const texts = HI_LAST.map(t => box(t.x, t.y, t.w, t.h, "label:" + t.text));
    const sel = ["#toast", "#dialog", "#blog", "#cards .card", "#menu", "#turnbar", "#fury", "#banner", "#cineBox", "#banter", "#hud > div", "#corner button", "#minimap", "#rakeUI", "#fishUI", "#pauseBtn"];
    for (const q of sel) for (const e of document.querySelectorAll(q)) {
      if (e.hidden || e.closest("[hidden]")) continue; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      if (r.width < 2 || r.height < 2 || cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
      texts.push({ name: q, x: r.left, y: r.top, w: r.width, h: r.height, faded: +cs.opacity < 0.4 || e.dataset.faded === "1" || !!e.closest('[data-faded="1"]') });
    }
    return { mode, chars, texts };
  }, caravanPos: () => { const n = NPCS.find(n => n.id === 'caravan'); return n && npcVisible(n) ? [n.px, n.py] : null; }, sim: () => ({ makeHero, levelUp, xpNeed, MONSTERS, FIELD, DIFFS, setDiff: d => { difficulty = d; } }) };
})();
