  // ================================================================== HEROES' SKILLS, THE CHAIN ASSAULT, STATUS ON SHOW
  // Every hero skill has its own look (a veil of scarf, a shield dome, a pillar of healing light, a rain of arrows,
  // cannon fire, a holy beam...), the Chain Assault darkens the field while each hero strikes in turn and ends in a
  // finishing blow, and conditions show on whoever carries them: bleeding drips, stars for a stun, embers when strong.
  const SKILL_FX = {
    "Rending Cut": "rend", "Last Delivery": "rend", "Scarf Veil": "veil", "Courier's Mark": "mark", "Hunter's Eye": "mark",
    Hammerfall: "hammer", Bulwark: "dome", "Anvil Breaker": "shatter", "Storm Song": "storm", "Eye of the Storm": "storm", Mend: "pillar",
    "Lantern Flare": "flare", "Pinning Shot": "arrow", Heartseeker: "arrow", Volley: "volley", "Hymn of Iron": "embers", Sanctuary: "pillars",
    "Last Rites": "holy", "Hymn of Return": "pillars", Phalanx: "dome", Impale: "shatter", "Oru's Wall": "dome", "Acid Flask": "acid",
    Elixir: "pillar", "Smoke Bomb": "smoke", "Philosopher's Fire": "fire", "Twin Cutlass": "rend", Plunder: "coinburst", Broadside: "cannon",
    "Cannon Salvo": "cannon", "Crystal Aegis": "pillar", "Memory Beam": "beam", "Tidal Oath": "embers", Remember: "embers",
  };
  const unitTop = u => { if (u.side === "hero") return 40; const A = bossArtFor(u); return A ? A.h * 0.8 : 44; };
  function skillFx(u, act) {
    const kind = act.skill && SKILL_FX[act.skill.name]; if (!kind || !battle) return false;
    const liveF = battle.foes.filter(f => !f.dead), liveH = battle.heroes.filter(alive);
    const tgt = act.skill.target, units = tgt === "allEnemies" || /^random\d$/.test(tgt || "") ? liveF : tgt === "party" ? liveH : tgt === "self" ? [u] : act.unit ? [act.unit] : [];
    RIG_FX.push({ kind: "sk:" + kind, from: unitPos(u), to: units.map(t => ({ ...unitPos(t), top: unitTop(t) })), t0: time, dur: { volley: 1.1, cannon: 1.2, storm: 1, pillars: 1.1, pillar: 1, holy: 1, dome: 1.1, veil: 1, fire: 1.1 }[kind] || 0.8, col: (FIGHTER[u.id] && FIGHTER[u.id].scarf) || "#ffffff" });
    return true;
  }
  // replace the generic strike effect with the skill's own where it has one, and show support skills too
  const _slashAtSk = slashAt;
  slashAt = function (targets, h) { const a = battle && battle.act; if (a && a.u === h && a.skill && SKILL_FX[a.skill.name]) return; _slashAtSk(targets, h); };
  const _doHeroSk = doHero;
  doHero = async function (u, act) {
    if (battle && act && act.skill) { const b0 = battle; battle.act = { u, skill: act.skill }; setTimeout(() => { if (battle === b0) skillFx(u, act); }, offensive(act) ? 230 : 160); }
    if (battle && act && act.kind === "chain") { battle.chainT = time; battle.chainN = battle.heroes.filter(alive).length; }
    return _doHeroSk(u, act);
  };
  // the Chain Assault: each hero strikes in turn (the engine's loop calls this for each blow)
  function chainBlow(h, t, last) {
    if (!battle || !h || !t) return;
    playAct(h, "strike", 0.34); _slashAtSk([t], h);
    if (last) { RIG_FX.push({ kind: "sk:finisher", from: unitPos(h), to: [{ ...unitPos(t), top: unitTop(t) }], t0: time, dur: 0.9, col: "#ffcf4a" }); shake = Math.max(shake, 12); }
  }
  const SK_DRAW = {
    rend(f, a, k, P) { for (const t of f.to) for (let i = 0; i < 3; i++) { const s = Math.max(0, Math.min(1, a * 2.4 - i * 0.25)); if (!s) continue; const X = P(t).x, Y = P(t).y; ctx.globalAlpha = 1 - a; ctx.strokeStyle = "#ff3a46"; ctx.shadowColor = "#ff2d2d"; ctx.shadowBlur = 10 * k; ctx.lineWidth = 2.4 * k; ctx.beginPath(); const o = (i - 1) * 7 * k; ctx.moveTo(X - 16 * k + o, Y - 16 * k); ctx.lineTo(X - 16 * k + o + 32 * k * s, Y - 16 * k + 32 * k * s); ctx.stroke(); } },
    veil(f, a, k, P) { const t = f.to[0]; if (!t) return; const X = P(t).x, Y = P(t).y; ctx.strokeStyle = "#3ee0e8"; ctx.shadowColor = "#3ee0e8"; ctx.shadowBlur = 12 * k; ctx.lineWidth = 2.4 * k; for (let r = 0; r < 2; r++) { ctx.globalAlpha = (1 - a) * 0.9; ctx.beginPath(); for (let j = 0; j <= 40; j++) { const an = j / 40 * Math.PI * 3 + a * 8 + r * Math.PI, rr = (10 + j * 0.3) * k, yy = Y + (18 - j * 0.9) * k; j ? ctx.lineTo(X + Math.cos(an) * rr, yy + Math.sin(an) * rr * 0.3) : ctx.moveTo(X + Math.cos(an) * rr, yy + Math.sin(an) * rr * 0.3); } ctx.stroke(); } },
    mark(f, a, k, P) { for (const t of f.to) { const X = P(t).x, Y = P(t).y, R = (14 - a * 4) * k; ctx.globalAlpha = Math.min(1, (1 - a) * 2); ctx.strokeStyle = "#ffb14a"; ctx.lineWidth = 1.6 * k; ctx.save(); ctx.translate(X, Y); ctx.rotate(a * 3); ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke(); for (let j = 0; j < 4; j++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(R * 0.5, 0); ctx.lineTo(R * 1.4, 0); ctx.stroke(); } ctx.restore(); } },
    hammer(f, a, k, P) { for (const t of f.to) { const X = P(t).x, Y = P(t).y + 10 * k; ctx.globalAlpha = 1 - a; ctx.strokeStyle = "#ffcf4a"; ctx.lineWidth = 2 * k; for (let j = 0; j < 10; j++) { const an = j / 10 * 6.28; ctx.beginPath(); ctx.moveTo(X + Math.cos(an) * 6 * k, Y + Math.sin(an) * 3 * k); ctx.lineTo(X + Math.cos(an) * (10 + a * 30) * k, Y + Math.sin(an) * (5 + a * 12) * k); ctx.stroke(); } ctx.fillStyle = "#ffcf4a"; for (let j = 0; j < 3; j++) { const an = a * 9 + j * 2.1; ctx.fillRect(X + Math.cos(an) * 12 * k, Y - 30 * k + Math.sin(an) * 3 * k, 2 * k, 2 * k); } } },
    shatter(f, a, k, P) { for (const t of f.to) { const X = P(t).x, Y = P(t).y; for (let j = 0; j < 14; j++) { const an = j / 14 * 6.28 + j, d = a * (20 + (j % 4) * 10) * k; ctx.globalAlpha = 1 - a; ctx.fillStyle = j % 2 ? "#cacee0" : "#7e829c"; ctx.save(); ctx.translate(X + Math.cos(an) * d, Y + Math.sin(an) * d + a * a * 20 * k); ctx.rotate(an + a * 6); ctx.fillRect(-2 * k, -1 * k, 4 * k, 2 * k); ctx.restore(); } } },
    storm(f, a, k, P) { f.to.forEach((t, i) => { const s = a * 1.5 - i * 0.12; if (s < 0 || s > 1) return; const tx = P(t).x, ty = P(t).y; let x = tx + Math.sin(i * 5) * 20 * k, y = VP.oy; ctx.globalAlpha = 1 - s; ctx.strokeStyle = "#9ef0f5"; ctx.shadowColor = "#3ee0e8"; ctx.shadowBlur = 14 * k; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 7; j++) { x += (tx - x) / (7 - j) + (Math.random() - 0.5) * 10 * k; y += (ty - y) / (7 - j); ctx.lineTo(x, y); } ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = k; ctx.stroke(); }); },
    flare(f, a, k, P) { const X = VP.ox + f.from.x * k, Y = VP.oy + (f.from.y - 24) * k; ctx.globalAlpha = (1 - a) * 0.8; const g2 = ctx.createRadialGradient(X, Y, 0, X, Y, (40 + a * 260) * k); g2.addColorStop(0, "rgba(255,240,160,0.9)"); g2.addColorStop(1, "rgba(255,207,74,0)"); ctx.fillStyle = g2; ctx.fillRect(VP.ox, VP.oy, VIEW_W * k, 192 * k); },
    arrow(f, a, k, P) { for (const t of f.to) { const s = Math.min(1, a * 3), X0 = VP.ox + f.from.x * k, Y0 = VP.oy + (f.from.y - 30) * k, X1 = P(t).x, Y1 = P(t).y, x = X0 + (X1 - X0) * s, y = Y0 + (Y1 - Y0) * s; ctx.globalAlpha = 1 - a * 0.6; ctx.strokeStyle = "#ffe08a"; ctx.shadowColor = "#ffcf4a"; ctx.shadowBlur = 10 * k; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(x - (X1 - X0) * 0.12, y - (Y1 - Y0) * 0.12); ctx.lineTo(x, y); ctx.stroke(); if (s >= 1) { ctx.globalAlpha = 1 - a; ctx.beginPath(); ctx.arc(X1, Y1, (a * 20) * k, 0, 6.28); ctx.stroke(); } } },
    volley(f, a, k, P) { for (let i = 0; i < 30; i++) { const t = f.to[i % Math.max(1, f.to.length)]; if (!t) return; const s = Math.min(1, Math.max(0, a * 2 - (i % 8) * 0.07)), X = P(t).x + ((i * 13) % 30 - 15) * k, Y = P(t).y + ((i * 7) % 16 - 8) * k, y = Y - (1 - s) * 140 * k; ctx.globalAlpha = s < 1 ? 1 : 1 - a; ctx.strokeStyle = "#e8e2d0"; ctx.lineWidth = 1.4 * k; ctx.beginPath(); ctx.moveTo(X - 3 * k, y - 12 * k); ctx.lineTo(X, y); ctx.stroke(); } },
    embers(f, a, k, P) { for (const t of f.to) { const X0 = P(t).x; ctx.globalAlpha = Math.sin(a * Math.PI) * 0.5; const g2 = ctx.createRadialGradient(X0, VP.oy + (t.y - 18) * k, 2 * k, X0, VP.oy + (t.y - 18) * k, 26 * k); g2.addColorStop(0, "rgba(255,160,60,0.9)"); g2.addColorStop(1, "rgba(255,120,40,0)"); ctx.fillStyle = g2; ctx.fillRect(X0 - 26 * k, VP.oy + (t.y - 50) * k, 52 * k, 56 * k);
      for (let j = 0; j < 22; j++) { const s = (a * 1.6 + j / 22) % 1, X = X0 + Math.sin(j * 7 + a * 4) * 11 * k, Y = VP.oy + (t.y - s * 54) * k; ctx.globalAlpha = (1 - s) * (1 - a * 0.4); ctx.fillStyle = j % 3 ? "#ff9a3d" : "#ffe08a"; ctx.fillRect(X, Y, 3 * k, 3 * k); } } },
    pillar(f, a, k, P) { for (const t of f.to) { const X = P(t).x, w = (12 - a * 6) * k; ctx.globalAlpha = Math.sin(a * Math.PI) * 0.75; const g2 = ctx.createLinearGradient(X - w, 0, X + w, 0); g2.addColorStop(0, "rgba(107,255,154,0)"); g2.addColorStop(0.5, "rgba(200,255,210,0.95)"); g2.addColorStop(1, "rgba(107,255,154,0)"); ctx.fillStyle = g2; ctx.fillRect(X - w, VP.oy, w * 2, (t.y + 2) * k); for (let j = 0; j < 8; j++) { const s = (a * 1.6 + j / 8) % 1; ctx.fillStyle = "#e8fff0"; ctx.fillRect(X + Math.sin(j * 5) * 10 * k, VP.oy + (t.y - s * 40) * k, 2 * k, 2 * k); } } },
    pillars(f, a, k, P) { SK_DRAW.pillar(f, a, k, P); for (const t of f.to) { ctx.globalAlpha = (1 - a) * 0.9; ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 1.4 * k; ctx.beginPath(); ctx.ellipse(P(t).x, VP.oy + (t.y - 44) * k, 8 * k, 2.5 * k, 0, 0, 6.28); ctx.stroke(); } },
    holy(f, a, k, P) { for (const t of f.to) { const X = P(t).x, w = (18 - a * 10) * k; ctx.globalAlpha = Math.sin(a * Math.PI); const g2 = ctx.createLinearGradient(X - w, 0, X + w, 0); g2.addColorStop(0, "rgba(255,207,74,0)"); g2.addColorStop(0.5, "rgba(255,250,220,1)"); g2.addColorStop(1, "rgba(255,207,74,0)"); ctx.fillStyle = g2; ctx.fillRect(X - w, VP.oy, w * 2, (t.y + 4) * k); } },
    dome(f, a, k, P) { const xs = f.to.map(t => P(t).x), X = (Math.min(...xs) + Math.max(...xs)) / 2, R = ((Math.max(...xs) - Math.min(...xs)) / 2 + 26 * k), Y = VP.oy + (f.to[0] ? f.to[0].y : 170) * k; ctx.globalAlpha = Math.min(1, a * 4) * (1 - a) * 1.4; ctx.strokeStyle = "#6fc0d0"; ctx.fillStyle = "rgba(111,192,208,0.18)"; ctx.shadowColor = "#9ef0f5"; ctx.shadowBlur = 12 * k; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.ellipse(X, Y, R * Math.min(1, a * 3), 52 * k * Math.min(1, a * 3), 0, Math.PI, 0); ctx.fill(); ctx.stroke(); ctx.lineWidth = 0.8 * k; for (let j = 1; j < 5; j++) { ctx.beginPath(); ctx.ellipse(X, Y, R * Math.min(1, a * 3) * j / 5, 52 * k * Math.min(1, a * 3), 0, Math.PI, 0); ctx.stroke(); } },
    smoke(f, a, k, P) { for (const t of f.to) for (let j = 0; j < 6; j++) { const X = P(t).x + Math.sin(j * 2.4) * 12 * k, Y = P(t).y + Math.cos(j * 1.7) * 10 * k - a * 16 * k; ctx.globalAlpha = (1 - a) * 0.55; ctx.fillStyle = "#a8a8ba"; ctx.beginPath(); ctx.arc(X, Y, (6 + a * 10) * k, 0, 6.28); ctx.fill(); } },
    acid(f, a, k, P) { for (const t of f.to) for (let j = 0; j < 16; j++) { const an = j / 16 * 6.28, d = a * 26 * k, X = P(t).x + Math.cos(an) * d, Y = P(t).y + Math.sin(an) * d * 0.6 + a * a * 18 * k; ctx.globalAlpha = 1 - a; ctx.fillStyle = j % 2 ? "#8aff5a" : "#3ec04a"; ctx.beginPath(); ctx.arc(X, Y, 2.4 * k, 0, 6.28); ctx.fill(); } },
    fire(f, a, k, P) { for (const t of f.to) for (let j = 0; j < 22; j++) { const s = (a * 2 + j / 22) % 1, X = P(t).x + Math.sin(j * 3.3 + a * 5) * 16 * k, Y = P(t).y + 20 * k - s * 50 * k, r = (7 - s * 5) * k; ctx.globalAlpha = (1 - s) * (1 - a * 0.3); ctx.fillStyle = s < 0.25 ? "#fff0a0" : s < 0.55 ? "#ff9a3d" : "#c8182e";
      ctx.beginPath(); ctx.moveTo(X, Y - r * 2.2); ctx.quadraticCurveTo(X + r, Y - r * 0.4, X, Y + r); ctx.quadraticCurveTo(X - r, Y - r * 0.4, X, Y - r * 2.2); ctx.fill(); } },
    coinburst(f, a, k, P) { for (const t of f.to) for (let j = 0; j < 12; j++) { const an = -Math.PI / 2 + (j / 11 - 0.5) * 2.4, v = 40 * k, X = P(t).x + Math.cos(an) * v * a * 1.4, Y = P(t).y + Math.sin(an) * v * a * 1.4 + a * a * 50 * k; ctx.globalAlpha = 1 - a * 0.7; ctx.fillStyle = "#d8b440"; ctx.beginPath(); ctx.ellipse(X, Y, 2.6 * k, 2 * k, 0, 0, 6.28); ctx.fill(); } },
    cannon(f, a, k, P) { f.to.concat(f.to).forEach((t, i) => { const s = Math.min(1, Math.max(0, a * 2 - i * 0.12)), X0 = VP.ox + f.from.x * k, Y0 = VP.oy + (f.from.y - 20) * k, X1 = P(t).x + (i % 2 ? 8 : -8) * k, Y1 = P(t).y; if (s < 1) { const x = X0 + (X1 - X0) * s, y = Y0 + (Y1 - Y0) * s - Math.sin(s * Math.PI) * 60 * k; ctx.globalAlpha = 1; ctx.fillStyle = "#1d1830"; ctx.beginPath(); ctx.arc(x, y, 3 * k, 0, 6.28); ctx.fill(); } else { const e = Math.min(1, (a * 2 - i * 0.12 - 1) * 3); ctx.globalAlpha = 1 - e; ctx.fillStyle = "#ff9a3d"; ctx.beginPath(); ctx.arc(X1, Y1, (6 + e * 16) * k, 0, 6.28); ctx.fill(); ctx.fillStyle = "#fff0a0"; ctx.beginPath(); ctx.arc(X1, Y1, (3 + e * 6) * k, 0, 6.28); ctx.fill(); } }); },
    beam(f, a, k, P) { for (const t of f.to) { const X0 = VP.ox + f.from.x * k, Y0 = VP.oy + (f.from.y - 34) * k, X1 = P(t).x, Y1 = P(t).y; ctx.globalAlpha = Math.sin(a * Math.PI); ctx.strokeStyle = "#9ef0f5"; ctx.shadowColor = "#3ee0e8"; ctx.shadowBlur = 16 * k; ctx.lineWidth = (6 - a * 4) * k; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.6 * k; ctx.stroke(); } },
    finisher(f, a, k, P) { const t = f.to[0]; if (!t) return; const X = P(t).x, Y = P(t).y; ctx.globalAlpha = 1 - a; ctx.strokeStyle = "#ffcf4a"; ctx.shadowColor = "#ffcf4a"; ctx.shadowBlur = 18 * k; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(X - 40 * k, Y - 40 * k * (1 - a)); ctx.lineTo(X + 40 * k, Y + 40 * k * (1 - a)); ctx.moveTo(X + 40 * k, Y - 40 * k * (1 - a)); ctx.lineTo(X - 40 * k, Y + 40 * k * (1 - a)); ctx.stroke(); ctx.beginPath(); ctx.arc(X, Y, a * 60 * k, 0, 6.28); ctx.stroke(); if (a < 0.1) { ctx.globalAlpha = 0.5; ctx.fillStyle = "#ffffff"; ctx.fillRect(VP.ox, VP.oy, VIEW_W * k, 192 * k); } },
  };
  // conditions, drawn over whoever carries them
  function drawStatus(k) {
    const units = battle.heroes.filter(alive).concat(battle.foes.filter(f => !f.dead));
    for (const u of units) {
      const st = u.st || {}, p = unitPos(u), X = VP.ox + p.x * k, top = unitTop(u), Yh = VP.oy + (p.y - top) * k;
      if (st.stun) for (let j = 0; j < 3; j++) { const an = time * 5 + j * 2.1; ctx.globalAlpha = 0.95; ctx.fillStyle = "#ffcf4a"; const sx = X + Math.cos(an) * 9 * k, sy = Yh - 4 * k + Math.sin(an) * 2.5 * k; ctx.beginPath(); for (let q = 0; q < 10; q++) { const r = (q % 2 ? 1 : 2.4) * k, aa = q / 10 * 6.28; q ? ctx.lineTo(sx + Math.cos(aa) * r, sy + Math.sin(aa) * r) : ctx.moveTo(sx + Math.cos(aa) * r, sy + Math.sin(aa) * r); } ctx.fill(); }
      if (st.bleed) for (let j = 0; j < 3; j++) { const s = (time * 1.4 + j / 3) % 1; ctx.globalAlpha = 1 - s; ctx.fillStyle = "#c8102e"; ctx.fillRect(X + (j - 1) * 5 * k, Yh + (top * 0.35 + s * top * 0.5) * k, 1.6 * k, 2.4 * k); }
      if (st.strong) for (let j = 0; j < 4; j++) { const s = (time * 1.2 + j / 4) % 1; ctx.globalAlpha = (1 - s) * 0.9; ctx.fillStyle = j % 2 ? "#ff9a3d" : "#ffe08a"; ctx.fillRect(X + Math.sin(j * 4 + time * 3) * 8 * k, Yh + (top - s * top) * k, 1.6 * k, 1.6 * k); }
      if (st.weak) { ctx.globalAlpha = 0.35 + 0.15 * Math.sin(time * 4); ctx.fillStyle = "#b08aff"; ctx.beginPath(); ctx.ellipse(X, Yh + top * 0.55 * k, 11 * k, top * 0.45 * k, 0, 0, 6.28); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  const _drawRigFxSk = drawRigFx;
  drawRigFx = function (k) {
    if (battle && battle.chainT !== undefined) {   // the Chain Assault: the field darkens, speed lines rake across it
      const d = 0.9 + (battle.chainN || 1) * 0.38 + 0.8, a = (time - battle.chainT) / d;
      if (a >= 1) delete battle.chainT;
      else { ctx.save(); ctx.globalAlpha = Math.min(0.55, a * 4, (1 - a) * 3); ctx.fillStyle = "#07060c"; ctx.fillRect(VP.ox, VP.oy, VIEW_W * k, 192 * k); ctx.globalAlpha = Math.min(0.5, (1 - a) * 2); ctx.strokeStyle = "#ffcf4a"; ctx.lineWidth = k; for (let j = 0; j < 18; j++) { const y = VP.oy + ((j * 23 + time * 400) % 192) * k, x = VP.ox + ((j * 67) % VIEW_W) * k; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 * k, y - 12 * k); ctx.stroke(); } ctx.restore(); }
    }
    if (battle) { ctx.save(); drawStatus(k); ctx.restore(); }
    const P = t => ({ x: VP.ox + t.x * k, y: VP.oy + (t.y - (t.top || 40) * 0.55) * k });
    for (let i = RIG_FX.length - 1; i >= 0; i--) {
      const f = RIG_FX[i]; if (!f.kind || !f.kind.startsWith("sk:")) continue;
      const a = (time - f.t0) / f.dur; if (a >= 1 || !battle) { RIG_FX.splice(i, 1); continue; }
      const fn = SK_DRAW[f.kind.slice(3)]; if (fn) { ctx.save(); ctx.lineCap = "round"; fn(f, Math.max(0, a), k, P); ctx.restore(); }
    }
    _drawRigFxSk(k);
  };

