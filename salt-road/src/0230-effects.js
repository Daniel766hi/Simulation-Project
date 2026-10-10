  // ================================================================== EFFECTS
  function burst(x, y, color, n, spread = 90) {
    if (REDUCED) n = Math.ceil(n / 4);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * spread;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: 0.5 + Math.random() * 0.6, color, size: Math.random() < 0.35 ? 2 : 1, world: !battle });
    }
  }
  function unitPos(u) {
    if (!u) return { x: VIEW_W / 2, y: 120 };   // never let a missing unit stop a frame
    if (u.side === "foe") {
      const bossU = battle.foes.find(f => f.boss && !f.dead);
      if (bossU && !u.boss) { const minions = battle.foes.filter(f => !f.boss); const i = minions.indexOf(u), n = minions.length; const xs = n === 1 ? [60] : n === 2 ? [50, 270] : [40, 280, 70, 250]; return { x: xs[i % xs.length], y: 104 + (i >= 2 ? 6 : 0) }; }
      if (u.boss) return { x: VIEW_W / 2, y: ["voss", "hollis", "wyrm"].includes(u.sprite) || MONSTERS[u.id].tall ? 116 : 108 };
      const n = u.count, w = VIEW_W / (n + 1); return { x: w * (u.slot + 1), y: 98 };
    }
    const i = battle.heroes.indexOf(u), n = battle.heroes.length;
    return { x: VIEW_W / 2 + (i - (n - 1) / 2) * 44, y: battle.foes.some(f => f.boss && !f.dead) ? 176 : 170 };   // a little lower under a boss's labels
  }
  function gore(u, n) {
    if (!battle) return;
    const p = unitPos(u);
    const cyan = u.side === "foe" && ["choir", "voss", "choirmaster"].includes(u.sprite);
    const blue = u.side === "foe" && ["drowned", "hollis"].includes(u.sprite);
    for (let i = 0; i < (REDUCED ? n / 3 : n); i++) {
      const a = rand(Math.PI * 1.1, Math.PI * 1.9), s = rand(30, 110);
      const col = blue && Math.random() < .4 ? "#3a8fbf" : cyan && Math.random() < .4 ? "#9ef0f5" : Math.random() < .3 ? "#6b0f1d" : "#c8102e";
      particles.push({ x: p.x + rand(-6, 6), y: p.y - (u.side === "foe" ? 30 : 12), vx: Math.cos(a) * s * (Math.random() < .5 ? -1 : 1), vy: Math.sin(a) * s, life: rand(0.5, 1.1), color: col, size: Math.random() < .4 ? 2 : 1, world: false, drip: true });
    }
    if (u.side === "foe") { u.splats = u.splats || []; if (u.splats.length < 8) u.splats.push({ x: rand(-12, 12), y: rand(-40, -8), s: rand(1, 3) }); }
  }
  function popup(u, value, color, crit) { const p = unitPos(u); popups.push({ x: p.x + rand(-6, 6), y: p.y - (u.side === "foe" ? 44 : 40), text: crit ? `${value}!` : `${value}`, color, life: 1.1, big: crit }); }
  function popupText(u, text, color) { const p = unitPos(u); popups.push({ x: p.x, y: p.y - (u.side === "foe" ? 52 : 46), text, color, life: 1.2 }); }
  function flash(a) { if (battle) battle.flash = a; }
  let toastTimer = 0;
  function toast(text) { $("toast").textContent = text; $("toast").hidden = false; toastTimer = 3; }

