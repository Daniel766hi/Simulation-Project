  // ================================================================== VILLAINS' SIGNATURE MOVES AND TAUNTS
  // A boss's area attacks and charged ultimates each get their own effect on screen (Voss's bell rings out in shock
  // waves, Hollis sends a tide through the party, Vela calls lightning down on each hero, the Colossus splits the
  // floor, Quill makes it rain coins and ledger pages...), and every great villain opens the fight with a taunt in
  // its own voice.
  const SIG = {
    butcher: { "Butcher's Sweep": "quake" }, mother: { "Tidal Maw": "tide" }, choirmaster: { Dirge: "dirge", Requiem: "dirge" },
    voss: { "Toll of Salt": "bell", "The Bell Screams": "bell" }, hollis: { Riptide: "tide", "The Tide Rises": "tide" },
    quill: { Foreclose: "coins", "Compound Interest": "coins" }, gulp: { "Belly Flop": "quake" }, maw: { "Eel Brood": "eels", "Salt the Wound": "eels" },
    colossus: { "Salt Quake": "quake", Collapse: "quake" }, vela: { Thunderhead: "lightning", "The Last Note": "lightning" },
    king: { "Tide of the Dead": "tide", "The Last Rain": "tide" }, corvin: { "Open the Sluice": "tide", "Forty Thousand": "coins" },
    oldmouth: { Undertow: "undertow" }, ledgertree: { "Compound Interest": "coins" }, tollkeeper: { Levy: "coins", "Final Audit": "coins" },
    wyrm: { "Crystal Breath": "breath", "Salt Storm": "breath" },
  };
  const TAUNT = {
    butcher: "Fresh meat. Hold still.", mother: "Come, little ones. Mother is thirsty.", choirmaster: "From the top. And this time, with screaming.",
    voss: "You carry what you are given. Give me the Bell.", hollis: "Everything that floats belongs to the Guild!", quill: "Your account is overdue. Payment in full.",
    gulp: "Croak. Croak. Hungry.", maw: "All hands! Bring the little courier aboard!", colossus: "We sing. We sing. We sing.",
    vela: "Listen. This is the last note of the world.", king: "Four hundred years. Who sings for the ones below?", corvin: "I wrote the first ledger. Your name is in it.",
    ledgertree: "What is owed is owed.", tollkeeper: "Nine coins. Nine. Or the road keeps you.", oldmouth: "Hungry. So hungry. Come closer.", wyrm: "Hsssss.",
  };
  // speak a whole line at once, in the character's voice (the battle has no typewriter to follow)
  Voice.say = function (who, text) {
    const ctx = Music.ctx; if (!ctx || !Music.on || SETTINGS.voice !== "voiced") return;
    const P = profileFor(who); if (!P) return;
    const dest = this.bus(ctx, P, Music.sfx).input; let t = ctx.currentTime + 0.05;
    if (P.bell) this.bellRing(ctx, dest, t, P.bell);
    for (const s of syllables(text)) { const dur = 0.105 / P.pace * (s.v.length > 1 ? 1.25 : 1) * (s.end ? 1.35 : 1); this.syl(ctx, dest, P, s, t, dur); t += dur + s.pause / P.pace; }
  };
  const _startBattleSig = startBattle;
  startBattle = function (group, opts = {}) {
    const r = _startBattleSig(group, opts), id = opts.boss;
    if (battle && id && TAUNT[id] && !opts.echo) setTimeout(() => {
      if (!battle || battle.over) return;
      const f = battle.foes.find(x => x.id === id); if (!f) return;
      Voice.say(id, TAUNT[id]);
      RIG_FX.push({ kind: "say", text: TAUNT[id], unit: f, t0: time, dur: 3 });
    }, 900);
    return r;
  };
  const _doFoeSig = doFoe;
  doFoe = async function (f) {
    const M = MONSTERS[f.id], mv = f.intent || (f.charged && M ? M.moves.find(m => m.charge) : null), kind = mv && SIG[f.id] && SIG[f.id][mv.name];
    if (battle && kind && !f.dead && !(f.st && f.st.stun) && !(mv.charge && !f.charged)) {
      const dur = kind === "lightning" ? 1.1 : kind === "tide" ? 1.2 : 1;
      setTimeout(() => { if (battle) RIG_FX.push({ kind: "sig:" + kind, unit: f, t0: time, dur, heroes: battle.heroes.filter(alive).map(h => unitPos(h)) }); if (kind === "quake" || kind === "bell") shake = Math.max(shake, 10); }, 200);
    }
    return _doFoeSig(f);
  };
  // the drawing of each: screen coordinates, k device pixels per picture pixel; a runs 0..1
  const SIG_DRAW = {
    bell(f, a, k, X, Y) {   // shock waves from the Bell in his chest, and salt flung at the party
      for (let i = 0; i < 4; i++) { const s = Math.max(0, a * 1.4 - i * 0.18); if (s <= 0 || s > 1) continue; ctx.globalAlpha = (1 - s) * 0.9; ctx.strokeStyle = i % 2 ? "#ffffff" : "#9ef0f5"; ctx.shadowColor = "#3ee0e8"; ctx.shadowBlur = 14 * k; ctx.lineWidth = (3 - s * 2) * k; ctx.beginPath(); ctx.ellipse(X, Y, s * 190 * k, s * 110 * k, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.shadowBlur = 0; ctx.fillStyle = "#e8ecf8"; for (let i = 0; i < 18; i++) { const an = Math.PI * (0.1 + i / 18 * 0.8), d = a * 150 * k; ctx.globalAlpha = 1 - a; ctx.fillRect(X + Math.cos(an) * d, Y + Math.sin(an) * d * 0.8, 2 * k, 2 * k); }
    },
    tide(f, a, k) {   // a wave rises and sweeps across the party, foam on its crest
      const W2 = VIEW_W * k, top = VP.oy + (192 - 70 * Math.sin(Math.min(1, a) * Math.PI)) * k, x0 = VP.ox + (-60 + a * 440) * k;
      ctx.globalAlpha = 0.75 * Math.sin(Math.min(1, a) * Math.PI); const gr = ctx.createLinearGradient(0, top, 0, VP.oy + 192 * k); gr.addColorStop(0, "rgba(108,184,184,0.95)"); gr.addColorStop(1, "rgba(8,20,30,0.95)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(VP.ox, VP.oy + 192 * k); for (let x = 0; x <= VIEW_W; x += 8) { const yy = top + Math.sin(x * 0.06 + a * 12) * 6 * k - Math.max(0, 40 - Math.abs(VP.ox + x * k - x0) / k) * 0.9 * k; ctx.lineTo(VP.ox + x * k, yy); } ctx.lineTo(VP.ox + W2, VP.oy + 192 * k); ctx.fill();
      ctx.fillStyle = "rgba(230,250,250,0.9)"; for (let x = 0; x <= VIEW_W; x += 5) { const yy = top + Math.sin(x * 0.06 + a * 12) * 6 * k - Math.max(0, 40 - Math.abs(VP.ox + x * k - x0) / k) * 0.9 * k; ctx.fillRect(VP.ox + x * k, yy - k, 3 * k, 2 * k); }
    },
    lightning(f, a, k, X, Y, fx) {   // bolts from the storm above onto every hero, one after another
      fx.heroes.forEach((h, i) => { const s = a * 1.6 - i * 0.2; if (s < 0 || s > 1) return; const tx = VP.ox + h.x * k, ty = VP.oy + (h.y - 20) * k; let x = tx + (Math.sin(i * 7) * 30) * k, y = VP.oy; const pts = [[x, y]]; for (let j = 0; j < 8; j++) { x += (tx - x) / (8 - j) + (Math.random() - 0.5) * 14 * k; y += (ty - y) / (8 - j); pts.push([x, y]); }
        ctx.globalAlpha = 1 - s; ctx.strokeStyle = "#7a9ad8"; ctx.shadowColor = "#c8d8ff"; ctx.shadowBlur = 16 * k; ctx.lineWidth = 4 * k; ctx.beginPath(); pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5 * k; ctx.stroke();
        ctx.globalAlpha = (1 - s) * 0.5; ctx.fillStyle = "#c8d8ff"; ctx.beginPath(); ctx.arc(tx, ty + 18 * k, 14 * k * (1 - s * 0.5), 0, Math.PI * 2); ctx.fill(); });
      if (a < 0.12) { ctx.globalAlpha = 0.35 * (1 - a / 0.12); ctx.fillStyle = "#ffffff"; ctx.fillRect(VP.ox, VP.oy, VIEW_W * k, 192 * k); }
    },
    quake(f, a, k) {   // the floor splits under the party and throws up dust
      const y0 = VP.oy + 150 * k; ctx.globalAlpha = 1 - a; ctx.strokeStyle = "#1a1024"; ctx.lineWidth = 2 * k;
      for (let i = 0; i < 7; i++) { let x = VP.ox + (30 + i * 45) * k, y = y0 + (i % 3) * 8 * k; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (Math.sin(i * 3 + j) * 12) * k * Math.min(1, a * 3); y += 5 * k * Math.min(1, a * 3); ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.fillStyle = "rgba(200,180,150,0.6)"; for (let i = 0; i < 26; i++) { const x = VP.ox + ((i * 37) % VIEW_W) * k, y = y0 + 20 * k - a * (20 + (i % 5) * 12) * k; ctx.beginPath(); ctx.arc(x, y, (3 + a * 6) * k, 0, Math.PI * 2); ctx.fill(); }
    },
    coins(f, a, k, X, Y, fx) {   // a rain of coins and ledger pages over the party
      for (let i = 0; i < 40; i++) { const x = VP.ox + ((i * 53) % VIEW_W) * k + Math.sin(a * 6 + i) * 6 * k, y = VP.oy + (-20 + ((a * 260 + i * 17) % 220)) * k; ctx.globalAlpha = Math.min(1, (1 - a) * 2);
        if (i % 3) { ctx.fillStyle = "#d8b440"; ctx.beginPath(); ctx.ellipse(x, y, 3 * k, 2 * k * Math.abs(Math.sin(a * 20 + i)), 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff4b0"; ctx.fillRect(x - k, y - k, k, k); }
        else { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(a * 8 + i)); ctx.fillStyle = "#ddd4b0"; ctx.fillRect(-4 * k, -5 * k, 8 * k, 10 * k); ctx.fillStyle = "#9a1224"; ctx.fillRect(-3 * k, -2 * k, 6 * k, k); ctx.restore(); } }
    },
    dirge(f, a, k, X, Y) {   // staves of music sweep down from the conductor, pale faces singing in them
      for (let s = 0; s < 3; s++) { const yy = Y + (20 + a * 90 + s * 16) * k; ctx.globalAlpha = (1 - a) * 0.7; ctx.strokeStyle = "#ffcf4a"; ctx.lineWidth = k; for (let l = 0; l < 5; l++) { ctx.beginPath(); for (let x = -140; x <= 140; x += 10) { const px = X + x * k, py = yy + l * 2.2 * k + Math.sin(x * 0.05 + a * 10 + s) * 6 * k; x === -140 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke(); }
        ctx.fillStyle = "rgba(236,236,242,0.8)"; for (let n = 0; n < 5; n++) { const px = X + (-120 + n * 60 + s * 20) * k, py = yy + 4 * k; ctx.beginPath(); ctx.ellipse(px, py, 3 * k, 4 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#07060c"; ctx.fillRect(px - k, py, 2 * k, 2 * k); ctx.fillStyle = "rgba(236,236,242,0.8)"; } }
    },
    breath(f, a, k, X, Y) {   // a cone of crystal breath poured over the party
      for (let i = 0; i < 70; i++) { const s = ((a * 1.3 + i / 70) % 1), an = Math.PI / 2 + (Math.sin(i * 12.9) * 0.6), d = s * 150 * k; ctx.globalAlpha = (1 - s) * (1 - a * 0.6); ctx.fillStyle = i % 4 ? "#e8ecf8" : "#9ef0f5"; ctx.fillRect(X + Math.cos(an) * d, Y + Math.sin(an) * d, (1.5 + s * 3) * k, (1.5 + s * 3) * k); }
    },
    eels(f, a, k, X, Y, fx) {   // eels streaking out of the water at each hero
      fx.heroes.forEach((h, i) => { const s = Math.min(1, Math.max(0, a * 1.5 - i * 0.12)); const tx = VP.ox + h.x * k, ty = VP.oy + (h.y - 14) * k, x = X + (tx - X) * s, y = Y + (ty - Y) * s - Math.sin(s * Math.PI) * 30 * k;
        ctx.globalAlpha = 1 - a * 0.7; ctx.strokeStyle = "#28626e"; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 1; j < 6; j++) ctx.lineTo(x - (tx - X) * 0.04 * j + Math.sin(a * 20 + j) * 3 * k, y - (ty - Y) * 0.04 * j); ctx.stroke(); ctx.fillStyle = "#ffcf4a"; ctx.fillRect(x - k, y - k, 2 * k, 2 * k); });
    },
    undertow(f, a, k, X, Y) {   // the water turns and pulls toward the mouth
      ctx.strokeStyle = "rgba(108,184,184,0.8)"; for (let r = 0; r < 5; r++) { ctx.globalAlpha = (1 - a) * 0.8; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(X, Y + 50 * k, (130 - r * 22) * k * (1 - a * 0.5), a * 8 + r, a * 8 + r + 4.2); ctx.stroke(); }
    },
  };
  // taunts: a speech bubble over the villain, typed out while it speaks
  function drawSay(f, a, k) {
    const u = f.unit; if (!battle || !battle.foes.includes(u)) return;
    const p = unitPos(u), shown = f.text.slice(0, Math.ceil(f.text.length * Math.min(1, a * 2.2)));
    ctx.font = `${Math.round(7 * k)}px 'Pixelify Sans', 'Courier New', monospace`;
    const lines = []; let line = ""; for (const wd of f.text.split(" ")) { const tryL = line ? line + " " + wd : wd; if (ctx.measureText(tryL).width > 150 * k && line) { lines.push(line); line = wd; } else line = tryL; } lines.push(line);
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 12 * k, bh = lines.length * 9 * k + 5 * k;
    const mx = VP.ox + (p.x + (u.boss ? 18 : 8)) * k, my = VP.oy + (p.y - (u.boss ? 92 : 44)) * k;   // beside the head, tail toward the mouth
    const X = Math.max(VP.ox + 4 * k, Math.min(VP.ox + VIEW_W * k - w - 4 * k, mx + 14 * k)), Y = Math.max(VP.oy + 14 * k, my);
    ctx.globalAlpha = Math.min(1, (1 - a) * 5); ctx.fillStyle = "rgba(14,11,30,0.92)"; ctx.strokeStyle = "#c8102e"; ctx.lineWidth = Math.max(1, k);
    ctx.fillRect(X, Y - 11 * k, w, bh); ctx.strokeRect(X, Y - 11 * k, w, bh);
    ctx.beginPath(); ctx.moveTo(X + 1, Y - 6 * k); ctx.lineTo(mx, my); ctx.lineTo(X + 1, Y - 1 * k); ctx.fill();
    ctx.fillStyle = "#f3efe6"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    let left = shown.length; lines.forEach((l, i) => { const part = l.slice(0, Math.max(0, left)); left -= l.length + 1; if (part) ctx.fillText(part, X + 6 * k, Y - 4 * k + i * 9 * k); });
  }
  const _drawRigFxSig = drawRigFx;
  drawRigFx = function (k) {
    for (let i = RIG_FX.length - 1; i >= 0; i--) {
      const f = RIG_FX[i]; if (!f.dur || !(f.kind === "say" || (f.kind || "").startsWith("sig:"))) continue;   // only this module's own effects (skills draw theirs elsewhere)
      const a = (time - f.t0) / f.dur; if (a >= 1 || !battle || !f.unit) { RIG_FX.splice(i, 1); continue; }
      ctx.save();
      if (f.kind === "say") drawSay(f, a, k);
      else { const p = unitPos(f.unit), X = VP.ox + p.x * k, Y = VP.oy + (p.y - (f.unit.boss ? 60 : 30)) * k, fn = SIG_DRAW[f.kind.slice(4)]; if (fn) fn(f.unit, a, k, X, Y, f); }
      ctx.restore();
    }
    _drawRigFxSig(k);
  };

