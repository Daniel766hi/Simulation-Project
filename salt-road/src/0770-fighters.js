  // ================================================================== FIGHTERS: THE PARTY, RIGGED AND ANIMATED
  // In battle each hero is a posed figure seen from behind, facing the enemy: a skeleton (hips, torso, head, shoulders,
  // elbows, knees) moved between keyframed poses and dressed per hero (hair, coat, gear, weapon). Like the bosses it is
  // painted at three times the picture's density and reduced to the hero's own palette, so it reads as fine pixel art.
  // Actions are choreographed: a wind-up before the blow, the strike on the frame the damage lands, a recoil when hit,
  // a knee when down, a raised weapon when the battle is won. Monsters get motion too: they rear back before they
  // attack, lunge with squash, stretch and afterimages, reel when hit, and slump as they die.
  const RIG_W = 40, RIG_H = 58, RIG_FOOT = 54;
  const hexShade = (hex, amt) => { const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt)))); return "#" + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, "0")).join(""); };
  const ramp5 = hex => [-0.62, -0.4, -0.18, 0.08, 0.3, 0.5].map(a => hexShade(hex, a));
  const FIGHTER = {
    sable: { hair: "short", coat: "tails", scarf: "#3ee0e8", weapon: "sword", pants: "#241c3a", bag: true },
    ilse: { hair: "bun", coat: "apron", apron: "#5a3a22", weapon: "hammer", bare: true, pants: "#3a2a22" },
    maru: { hair: "long", coat: "robe", weapon: "none", sash: "#bfb8d8", caster: true },
    rook: { hair: "hood", hood: "#3a4a2e", coat: "short", weapon: "bow", quiver: true, pants: "#2e3424" },
    ada: { hair: "veil", coat: "robe", weapon: "book", caster: true, sash: "#c9a227" },
    ren: { hair: "helm", coat: "armor", weapon: "spear", shield: true, pants: "#2a2e44", cape: "#6a1a22" },
    kest: { hair: "goggles", coat: "apron", apron: "#5a3a22", weapon: "flask", pants: "#2e3424" },
    nell: { hair: "tricorn", coat: "tails", weapon: "cutlass", pants: "#2a1a14", sash: "#c9a227" },
    warden: { construct: true, weapon: "none" },
  };
  // poses: root lift (dy, negative is toward the enemy), torso lean, head turn, and each limb's upper and lower angle
  // in degrees (0 hangs straight down, positive swings to the viewer's right); wpn tilts the held weapon
  const POSE = {
    idle: { dy: 0, lean: 3, head: -8, fu: 18, fl: -26, bu: -14, bl: 16, lfu: 9, lfl: -3, lbu: -9, lbl: 3, wpn: 0 },
    windup: { dy: 3, lean: -12, head: -12, fu: 150, fl: -46, bu: -46, bl: 34, lfu: 24, lfl: -18, lbu: -24, lbl: 16, wpn: 24 },
    strike: { dy: -9, lean: 18, head: 2, fu: -74, fl: -8, bu: -34, bl: 26, lfu: -26, lfl: -24, lbu: 24, lbl: 14, wpn: -14 },
    cast: { dy: -2, lean: -3, head: -20, fu: 162, fl: 14, bu: -162, bl: -14, lfu: 10, lfl: -4, lbu: -10, lbl: 4, wpn: 0 },
    guard: { dy: 4, lean: 5, head: 4, fu: 74, fl: -104, bu: -66, bl: 104, lfu: 22, lfl: -20, lbu: -22, lbl: 20, wpn: 64 },
    hurt: { dy: 6, lean: -24, head: -26, fu: 54, fl: 34, bu: -54, bl: -34, lfu: 16, lfl: 2, lbu: -20, lbl: 6, wpn: 34 },
    ko: { dy: 15, lean: 28, head: 42, fu: 24, fl: -12, bu: -8, bl: 12, lfu: 92, lfl: -150, lbu: -44, lbl: 112, wpn: 84 },
    victory: { dy: -3, lean: -6, head: -16, fu: 174, fl: 4, bu: -42, bl: 42, lfu: 11, lfl: -4, lbu: -11, lbl: 4, wpn: 0 },
    item: { dy: 0, lean: 2, head: -14, fu: 124, fl: -72, bu: -16, bl: 16, lfu: 9, lfl: -3, lbu: -9, lbl: 3, wpn: 0 },
    aim: { dy: 2, lean: -5, head: -6, fu: 150, fl: -150, bu: -176, bl: 2, lfu: 22, lfl: -10, lbu: -22, lbl: 10, wpn: 0 },
    loose: { dy: 0, lean: 4, head: -4, fu: 118, fl: -40, bu: -176, bl: 2, lfu: 22, lfl: -10, lbu: -22, lbl: 10, wpn: 0 },
  };
  const PKEYS = Object.keys(POSE.idle);
  const easeO = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
  const mixPose = (a, b, k) => { const o = {}; for (const key of PKEYS) o[key] = a[key] + (b[key] - a[key]) * k; return o; };
  // ---- the painter: a pose in art pixels, feet at (20, RIG_FOOT)
  function paintFighter(K, c, id, P, t) {
    const F = FIGHTER[id] || FIGHTER.sable, look = HEROES[id].look, d2r = Math.PI / 180;
    const [wT, aT] = gearTiers(id), MT = METAL[wT] || { hi: "#e8ecf8", lo: "#8a90a8" }, AM = METAL[aT];   // what the smiths have fitted
    const skin = ramp5(look.skin), hair = ramp5(look.hair), robe = ramp5(look.robe), pants = ramp5(F.pants || hexShade(look.robe, -0.45)), boot = ["#07060c", "#120c0a", "#1e140e", "#36241a", "#523828", "#6e4e38"];
    const R3 = r => [r[4], r[2], r[0]];
    const dir = a => [Math.sin(a * d2r), Math.cos(a * d2r)];
    const add = (p, v, s) => [p[0] + v[0] * s, p[1] + v[1] * s];
    const breathe = Math.sin(t * 2.4) * 0.5;
    const pel = [20, RIG_FOOT - 15 + P.dy + breathe * 0.4];
    const up = [Math.sin(P.lean * d2r), -Math.cos(P.lean * d2r)], rt = [Math.cos(P.lean * d2r), Math.sin(P.lean * d2r)];
    const top = add(pel, up, 12.5), head = add(top, [Math.sin((P.lean + P.head) * d2r), -Math.cos((P.lean + P.head) * d2r)], 7);
    const sF = add(add(top, rt, 5.4), up, -1.2), sB = add(add(top, rt, -5.4), up, -1.2);
    const eF = add(sF, dir(P.fu + P.lean), 6.4), hF = add(eF, dir(P.fu + P.fl + P.lean), 6);
    const eB = add(sB, dir(P.bu + P.lean), 6.4), hB = add(eB, dir(P.bu + P.bl + P.lean), 6);
    const hpF = add(pel, rt, 2.6), hpB = add(pel, rt, -2.6);
    const kF = add(hpF, dir(P.lfu), 7.6), fF = add(kF, dir(P.lfu + P.lfl), 7.6), kB = add(hpB, dir(P.lbu), 7.6), fB = add(kB, dir(P.lbu + P.lbl), 7.6);
    const L = (a, b, w0, w1, r, j = true) => H3.limb(K, a[0], a[1], b[0], b[1], w0, w1, R3(r), j);
    const sway = Math.sin(t * 5.2) * 1.2 - P.dy * 0.08;
    K.E(20 + (P.lean || 0) * 0.08, RIG_FOOT + 1, 9 + Math.min(0, P.dy) * 0.3, 2.2, "rgba(10,6,20,0.45)");
    if (F.construct) return paintConstruct(K, P, t, { pel, top, head, sF, sB, eF, hF, eB, hB, kF, fF, kB, fB, hpF, hpB });
    // cape (behind everything else of the torso) for the captain
    if (F.cape) K.P([[sB[0] - 1, sB[1]], [sF[0] + 1, sF[1]], [pel[0] + 8 + sway, pel[1] + 11], [pel[0] - 8 + sway * 0.6, pel[1] + 12]], K.LG(0, sB[1], 0, pel[1] + 12, [[0, hexShade(F.cape, 0.1)], [1, hexShade(F.cape, -0.45)]]));
    // legs
    L(hpB, kB, 2.9, 2.3, pants); L(kB, fB, 2.3, 1.8, pants, false); K.P([[fB[0] - 2, fB[1] - 1.6], [fB[0] + 2.2, fB[1] - 1.6], [fB[0] + 2.4, fB[1] + 0.8], [fB[0] - 2, fB[1] + 0.8]], "#1e140e");
    L(hpF, kF, 2.9, 2.3, pants); L(kF, fF, 2.3, 1.8, pants, false); K.P([[fF[0] - 2, fF[1] - 1.6], [fF[0] + 2.2, fF[1] - 1.6], [fF[0] + 2.4, fF[1] + 0.8], [fF[0] - 2, fF[1] + 0.8]], "#1e140e");
    for (const k of [kF, kB]) K.E(k[0], k[1], 1.4, 1.1, "#36241a");
    // torso and coat
    const waist = add(pel, up, 1.5), wL = add(waist, rt, -3.9), wR = add(waist, rt, 3.9), shL = add(sB, rt, -1), shR = add(sF, rt, 1);
    if (F.coat === "robe") {
      K.P([shL, shR, add(add(pel, rt, 7 + sway * 0.3), up, -13.5), add(add(pel, rt, -7 + sway * 0.3), up, -13.5)], K.LG(pel[0] - 8, 0, pel[0] + 8, 0, [[0, robe[1]], [0.4, robe[3]], [0.7, robe[2]], [1, robe[0]]]));
      for (let i = 0; i < 4; i++) K.S([add(add(pel, rt, -3 + i * 2), up, 6), add(add(pel, rt, -5.5 + i * 3.6 + sway * 0.3), up, -13)], 0.5, robe[0]);
      if (F.sash) K.S([wL, wR], 1.2, F.sash);
    } else {
      K.P([shL, shR, wR, wL], K.LG(shL[0], 0, shR[0], 0, [[0, robe[1]], [0.45, robe[3]], [1, robe[0]]]));
      K.S([add(top, up, -0.5), waist], 0.5, robe[0]);
      K.P([add(wL, up, 0.6), add(wR, up, 0.6), add(wR, up, -1), add(wL, up, -1)], F.sash || "#523828");
      if (F.coat === "tails") for (const s of [-1, 1]) K.P([add(pel, rt, s * 0.4), add(add(pel, rt, s * 3.8), up, 0.5), add(add(pel, rt, s * 4.6 + sway), up, -10.5), add(add(pel, rt, s * 1.2 + sway * 0.8), up, -9.5)], K.LG(0, pel[1], 0, pel[1] + 10, [[0, robe[2]], [1, robe[0]]]));
      if (F.coat === "short") K.P([add(pel, rt, -3.8), add(pel, rt, 3.8), add(add(pel, rt, 4 + sway * 0.5), up, -4), add(add(pel, rt, -4 + sway * 0.5), up, -4)], robe[1]);
      if (F.coat === "apron") { K.S([shL, add(waist, rt, 2.8)], 0.7, F.apron); K.S([shR, add(waist, rt, -2.8)], 0.7, F.apron); K.P([add(wL, up, 0.4), add(wR, up, 0.4), add(add(pel, rt, 3.8), up, -8), add(add(pel, rt, -3.8), up, -8)], hexShade(F.apron, -0.1)); }
      if (F.coat === "armor") { K.vol((shL[0] + shR[0]) / 2, (shL[1] + waist[1]) / 2, 4.2, 5.6, ["#cacee0", "#7e829c", "#3a3a4a"]); for (const p of [shL, shR]) K.vol(p[0], p[1], 2.8, 2.2, ["#e8ecf8", "#8a90a8", "#3a3a4a"]); for (let i = 0; i < 3; i++) K.P([add(add(pel, rt, -4 + i * 2.8), up, 0.5), add(add(pel, rt, -1.6 + i * 2.8), up, 0.5), add(add(pel, rt, -1.6 + i * 2.8), up, -4), add(add(pel, rt, -4 + i * 2.8), up, -4)], "#7e829c"); }
    }
    if (AM) { K.S([shL, add(top, up, 0.4), shR], 0.7, AM.hi); K.S([wL, wR], 0.6, AM.lo); if (aT >= 3) for (const p of [shL, shR]) { K.vol(p[0], p[1] - 0.4, 2.6, 2, [AM.hi, AM.lo, "#1d1830"]); if (AM.glow) K.E(p[0], p[1] - 0.4, 3.2, 2.6, AM.glow); } }
    // gear on the back: quiver, satchel, the scarf's tails
    if (F.quiver) { K.P([add(add(top, rt, 1.2), up, 1.6), add(add(top, rt, 3.4), up, 0.8), add(add(waist, rt, -0.8), up, 1), add(add(waist, rt, -3), up, 1.6)], "#6b3f24"); for (let i = 0; i < 3; i++) K.S([add(add(top, rt, 1.6 + i * 0.8), up, 1.4), add(add(top, rt, 1.8 + i * 0.9), up, 3.6)], 0.5, i % 2 ? "#e8e2d0" : "#9a1224"); }
    if (F.bag) { K.S([shL, add(waist, rt, 3)], 0.8, "#6b3f24"); K.vol(...add(add(waist, rt, 3.2), up, -1.8), 2.2, 1.8, ["#a8703f", "#6b3f24", "#2a1810"]); }
    if (F.shield) { K.vol(hB[0] - 1, hB[1] - 1, 3.8, 4.4, ["#a8b0c8", "#4a5a8a", "#1a2440"]); K.E(hB[0] - 1, hB[1] - 1, 1.2, 1.2, "#d8b440"); }
    // head: the back of it, a sliver of the face turned toward the enemy's left, and the hair or headgear
    const hx = head[0], hy = head[1];
    K.E(hx - 3.9, hy + 0.6, 1.3, 2.4, skin[3]); K.E(hx - 4.7, hy + 0.9, 0.7, 0.8, skin[4]);
    K.vol(hx, hy, 4.6, 5, R3(skin));
    const H = R3(hair);
    if (F.hair === "short" || F.hair === "goggles" || F.hair === "bun") {
      K.vol(hx + 0.2, hy - 0.8, 5, 4.8, H); K.P([[hx - 4.6, hy], [hx + 4.6, hy], [hx + 3.8, hy + 3.6], [hx - 3.6, hy + 3.4]], hair[1]);
      if (F.hair === "short") for (let i = 0; i < 4; i++) K.P([[hx - 3 + i * 2, hy + 3], [hx - 1.6 + i * 2, hy + 3], [hx - 2 + i * 2 + sway * 0.4, hy + 5.2 + (i % 2)]], hair[2]);
      if (F.hair === "bun") K.vol(hx + 0.4, hy - 4.6, 2.4, 2.2, H);
      if (F.hair === "goggles") { K.S([[hx - 4.8, hy - 0.6], [hx + 4.8, hy - 0.2]], 1.1, "#523828"); K.Q([[hx + 1, hy + 2.6], [hx + 3 + sway, hy + 6], [hx + 1.6 + sway, hy + 9]], 1.8, hair[2]); }
    } else if (F.hair === "long") { K.P([[hx - 4.8, hy - 1], [hx + 4.8, hy - 1], [hx + 4.6 + sway * 0.5, hy + 13], [hx - 4.4 + sway * 0.5, hy + 13]], K.LG(0, hy, 0, hy + 13, [[0, hair[3]], [1, hair[1]]])); K.vol(hx, hy - 1, 5, 4.6, H); for (let i = 0; i < 4; i++) K.S([[hx - 3 + i * 2, hy + 2], [hx - 3.2 + i * 2.1 + sway * 0.5, hy + 12]], 0.5, hair[1]); }
    else if (F.hair === "hood") { K.P([[hx - 5.4, hy + 3.6], [hx - 5.2, hy - 3], [hx, hy - 6.2], [hx + 5.2, hy - 3], [hx + 5.4, hy + 3.6], [hx + 1, hy + 7.4 + sway * 0.3]], K.LG(hx - 5, 0, hx + 5, 0, [[0, hexShade(F.hood, 0.12)], [1, hexShade(F.hood, -0.4)]])); K.S([[hx, hy - 6], [hx + 0.6, hy + 7]], 0.5, hexShade(F.hood, -0.5)); }
    else if (F.hair === "veil") { K.vol(hx, hy - 0.4, 5, 5, ["#ffffff", "#d8d4e8", "#8a86a0"]); K.P([[hx - 5, hy - 1], [hx + 5, hy - 1], [hx + 5.4 + sway * 0.6, hy + 12], [hx - 4.8 + sway * 0.6, hy + 12]], K.LG(0, hy, 0, hy + 12, [[0, "#1d1830"], [1, "#07060c"]])); }
    else if (F.hair === "helm") { K.vol(hx, hy - 0.8, 5.2, 5, ["#e8ecf8", "#8a90a8", "#3a3a4a"]); K.S([[hx - 5, hy + 1.6], [hx + 5, hy + 1.6]], 0.8, "#565a74"); K.Q([[hx, hy - 5.6], [hx + 2 + sway, hy - 8.4], [hx + 5 + sway * 1.4, hy - 6]], 1.8, "#c8182e"); }
    else if (F.hair === "tricorn") { K.vol(hx + 0.2, hy - 0.4, 5, 4.8, H); K.P([[hx - 4.6, hy], [hx + 4.6, hy], [hx + 3.8, hy + 3.4], [hx - 3.6, hy + 3.2]], hair[1]); K.Q([[hx + 1, hy + 2], [hx + 2.4 + sway, hy + 7], [hx + 1 + sway, hy + 11]], 2, hair[2]); K.P([[hx - 6.8, hy - 1.6], [hx, hy - 4.8], [hx + 6.8, hy - 1.6], [hx + 4.6, hy - 5.6], [hx, hy - 7.6], [hx - 4.6, hy - 5.6]], "#1d1830"); K.S([[hx - 6.8, hy - 1.6], [hx, hy - 4.8], [hx + 6.8, hy - 1.6]], 0.7, "#c9a227"); }
    // the scarf: wound at the throat, tails streaming behind with the wind and the motion
    if (F.scarf) {
      const S = ramp5(F.scarf); K.P([add(add(top, rt, -4), up, 1), add(add(top, rt, 4), up, 1), add(add(top, rt, 3.6), up, -1.4), add(add(top, rt, -3.6), up, -1.4)], S[3]);
      for (const k of [0, 1]) { const base = add(add(top, rt, 1.5 + k), up, -0.6), w = Math.sin(t * 7 + k * 1.3) * 2.2; const tip = [base[0] + 7 + w - P.dy * 0.3 + k * 2, base[1] + 9 + k * 2 - P.dy * 0.4]; K.Q([base, [base[0] + 3 + w * 0.5, base[1] + 4], tip], 1.8 - k * 0.4, k ? S[2] : S[4]); }
    }
    // arms, the held things, the weapon
    const sleeve = F.bare ? skin : F.coat === "armor" ? ["#3a3a4a", "#565a74", "#7e829c", "#a6aac2", "#cacee0", "#e8ecf8"] : robe;
    const hand = (p, r) => K.vol(p[0], p[1], 1.9, 1.8, R3(r));
    const cuff = (e2, h2) => { if (F.bare) return; const m = [e2[0] + (h2[0] - e2[0]) * 0.8, e2[1] + (h2[1] - e2[1]) * 0.8]; K.E(m[0], m[1], 1.9, 1.6, sleeve[0]); };
    L(sB, eB, 2.5, 2.1, sleeve); L(eB, hB, 2.1, 1.7, F.bare ? skin : sleeve, false); cuff(eB, hB); hand(hB, skin);
    const fa = Math.atan2(hF[1] - eF[1], hF[0] - eF[0]) + (P.wpn || 0) * d2r;
    const ww = (len, a = fa) => [hF[0] + Math.cos(a) * len, hF[1] + Math.sin(a) * len];
    if (F.weapon === "bow") {   // the bow in the back hand, pointed at the enemy; an arrow on the string while drawn
      const ba = Math.atan2(hB[1] - eB[1], hB[0] - eB[0]), px = -Math.sin(ba), py = Math.cos(ba);
      K.Q([[hB[0] + px * 7, hB[1] + py * 7], [hB[0] + Math.cos(ba) * 3.2, hB[1] + Math.sin(ba) * 3.2], [hB[0] - px * 7, hB[1] - py * 7]], 1.1, wT >= 3 ? MT.lo : "#6b3f24");
      K.S([[hB[0] + px * 7, hB[1] + py * 7], hF, [hB[0] - px * 7, hB[1] - py * 7]], 0.35, "#e8e2d0");
      if (P.fl < -100) K.S([hF, [hB[0] + Math.cos(ba) * 4, hB[1] + Math.sin(ba) * 4]], 0.6, "#c8bca2");
    }
    if (F.weapon === "book") K.P([[hB[0] - 2.4, hB[1] - 1.6], [hB[0] + 2.4, hB[1] - 2.2], [hB[0] + 2.6, hB[1] + 1.6], [hB[0] - 2.2, hB[1] + 2]], "#6a0c18");
    if (F.weapon === "spear") { K.S([ww(-9), ww(15)], 0.9, "#6e4e38"); if (MT.glow) K.E(ww(17)[0], ww(17)[1], 2.6, 2.6, MT.glow); K.P([ww(15), ww(19.5), [ww(15)[0] + Math.cos(fa + 1.57) * 1.2, ww(15)[1] + Math.sin(fa + 1.57) * 1.2]], MT.hi); K.P([ww(15), ww(19.5), [ww(15)[0] - Math.cos(fa + 1.57) * 1.2, ww(15)[1] - Math.sin(fa + 1.57) * 1.2]], MT.lo); }
    L(sF, eF, 2.5, 2.1, sleeve); L(eF, hF, 2.1, 1.7, F.bare ? skin : sleeve, false); cuff(eF, hF);
    if (F.weapon === "sword" || F.weapon === "cutlass") {
      const tip = ww(12), mid = ww(6), bend = F.weapon === "cutlass" ? 1.8 : 0, n = [Math.cos(fa + 1.57), Math.sin(fa + 1.57)];
      if (MT.glow) K.S([ww(2), [tip[0] + n[0] * bend, tip[1] + n[1] * bend]], 3.4, MT.glow);
      K.P([ww(1.6), [tip[0] + n[0] * bend, tip[1] + n[1] * bend], [mid[0] + n[0] * (1.2 + bend * 0.5), mid[1] + n[1] * (1.2 + bend * 0.5)]], MT.hi);
      K.P([ww(1.6), [tip[0] + n[0] * bend, tip[1] + n[1] * bend], [mid[0] - n[0] * 0.9, mid[1] - n[1] * 0.9]], MT.lo);
      K.S([[hF[0] + n[0] * 2, hF[1] + n[1] * 2], [hF[0] - n[0] * 2, hF[1] - n[1] * 2]], 0.9, F.weapon === "cutlass" ? "#c9a227" : "#6e4e38");
      if (F.scarf) K.S([ww(3), ww(10)], 0.35, "#9ef0f5");
    }
    if (F.weapon === "hammer") { K.S([ww(-1), ww(9)], 1, "#6e4e38"); const hd = ww(9.5), n = [Math.cos(fa + 1.57), Math.sin(fa + 1.57)]; K.P([[hd[0] + n[0] * 3, hd[1] + n[1] * 3], [hd[0] - n[0] * 3, hd[1] - n[1] * 3], [ww(12.5)[0] - n[0] * 3, ww(12.5)[1] - n[1] * 3], [ww(12.5)[0] + n[0] * 3, ww(12.5)[1] + n[1] * 3]], K.LG(hd[0] - 3, 0, hd[0] + 3, 0, [[0, MT.hi], [1, MT.lo]])); if (MT.glow) K.E(hd[0], hd[1], 3.6, 3.6, MT.glow); }
    if (F.weapon === "flask") { if (MT.glow) K.E(hF[0] + 0.6, hF[1] - 1.8, 3.2, 3.2, MT.glow); K.vol(hF[0] + 0.6, hF[1] - 1.8, 1.5 + wT * 0.12, 1.8 + wT * 0.12, ["#caffa0", "#62c04a", "#1e5a1e"]); K.E(hF[0] + 0.6, hF[1] - 3.6, 0.6, 0.7, "#c8bca2"); }
    hand(hF, skin);
    if (F.caster && P.fu > 120) for (const p of [hF, hB]) { K.E(p[0], p[1], 3.4, 3.4, K.RG(p[0], p[1], 0.2, 3.6, [[0, "rgba(255,255,255,0.95)"], [0.4, id === "ada" ? "rgba(255,207,74,0.7)" : "rgba(158,240,245,0.7)"], [1, "rgba(62,224,232,0)"]])); }
  }
  // the Warden: a construct of salt crystal, too big for a coat
  function paintConstruct(K, P, t, J) {
    const glow = 0.7 + 0.3 * Math.sin(t * 3);
    const seg = (a, b, w) => { const n = [-(b[1] - a[1]), b[0] - a[0]], l = Math.hypot(...n) || 1; H3.facet(K, [[a[0] + n[0] / l * w, a[1] + n[1] / l * w], [b[0] + n[0] / l * w * 0.8, b[1] + n[1] / l * w * 0.8], [b[0] - n[0] / l * w * 0.8, b[1] - n[1] / l * w * 0.8], [a[0] - n[0] / l * w, a[1] - n[1] / l * w]]); };
    seg(J.hpB, J.kB, 2.4); seg(J.kB, J.fB, 2); seg(J.hpF, J.kF, 2.4); seg(J.kF, J.fF, 2);
    H3.facet(K, [[J.sB[0] - 2, J.sB[1] - 1], [J.sF[0] + 2, J.sF[1] - 1], [J.pel[0] + 4.4, J.pel[1] - 1], [J.pel[0], J.pel[1] + 2], [J.pel[0] - 4.4, J.pel[1] - 1]]);
    K.E((J.sB[0] + J.sF[0]) / 2, J.top[1] + 5, 2.2, 2.6, `rgba(158,240,245,${glow.toFixed(2)})`);
    for (const [a, h] of [[-2.4, 7], [-1.9, 5], [-0.7, 6]]) H3.shard(K, J.top[0] + Math.cos(a) * 4, J.top[1] + Math.sin(a) * 2, h, a, true);
    H3.facet(K, H3.rock(K, J.head[0], J.head[1], 4.6, 4.8, 6, 0.4));
    K.E(J.head[0] - 3.2, J.head[1] + 0.4, 1.2, 0.8, `rgba(158,240,245,${glow.toFixed(2)})`);
    seg(J.sB, J.eB, 2.2); seg(J.eB, J.hB, 1.8); H3.facet(K, H3.rock(K, J.hB[0], J.hB[1], 2.6, 2.4, 6, 0.2));
    seg(J.sF, J.eF, 2.2); seg(J.eF, J.hF, 1.8); H3.facet(K, H3.rock(K, J.hF[0], J.hF[1], 2.6, 2.4, 6, 0.9));
  }
  // ---- frames: painted, reduced to the hero's palette, cached per pose step
  const rigCache = new Map();
  const heroRamps = id => { const k = "fx_" + id; if (!RAMP[k]) { const l = HEROES[id].look, F = FIGHTER[id] || {}; RAMP[k] = [...ramp5(l.robe), ...ramp5(l.hair), ...ramp5(l.skin), ...ramp5(F.pants || hexShade(l.robe, -0.45)), ...(F.scarf ? ramp5(F.scarf) : []), ...(F.hood ? ramp5(F.hood) : []), ...(F.cape ? ramp5(F.cape) : []), ...(F.apron ? ramp5(F.apron) : [])]; } return ["ink", "pale", "bone", "gold", "glowc", "leather", "blood", "salt", k]; };
  function rigFrame(id, pose, key, t, white) {
    const k = id + "|" + key + (white ? "|w" : ""); let fr = rigCache.get(k); if (fr) return fr;
    if (white) { const base = rigFrame(id, pose, key, t, false); fr = document.createElement("canvas"); fr.width = base.width; fr.height = base.height; const c = fr.getContext("2d"); c.drawImage(base, 0, 0); c.globalCompositeOperation = "source-in"; c.fillStyle = "#ffffff"; c.fillRect(0, 0, fr.width, fr.height); }
    else {
      fr = document.createElement("canvas"); fr.width = RIG_W * ART_D; fr.height = RIG_H * ART_D;
      const c = fr.getContext("2d"); c.scale(ART_D, ART_D);
      try { paintFighter(artKit(c, 777 + id.length * 13), c, id, pose, t); } catch (e) { console.error("fighter art", id, e); }
      c.setTransform(1, 0, 0, 1, 0, 0); quantize(c, fr.width, fr.height, heroRamps(id));
    }
    if (rigCache.size > 900) rigCache.clear();
    rigCache.set(k, fr); return fr;
  }
  // ---- choosing the pose: what the hero is doing now, blended from what they were doing
  function heroWants(h) {
    if (!alive(h)) return "ko";
    const r = h.act; if (r && time < r.until) return r.name;
    if (h.hurt > 0.08) return "hurt";
    if (battle && battle.won) return "victory";
    if (h.st && h.st.guard) return "guard";
    return "idle";
  }
  function heroPose(h) {
    const want = heroWants(h);
    if (!h.rig || h.rig.name !== want) h.rig = { name: want, from: h.rig ? h.rig.cur || POSE.idle : POSE.idle, fromName: h.rig ? h.rig.name : "idle", t0: time, dur: want === "strike" || want === "loose" ? 0.07 : want === "hurt" ? 0.06 : want === "ko" ? 0.35 : 0.16 };
    const R = h.rig, k = easeO((time - R.t0) / R.dur), target = POSE[want] || POSE.idle;
    const step = Math.min(8, Math.floor(k * 8)), loop = want === "idle" || want === "guard" || want === "victory" || want === "cast" ? Math.floor(time * 7) % 12 : 0;
    R.cur = mixPose(R.from, target, step / 8);
    return { pose: R.cur, key: `${R.fromName}>${want}@${step}:${loop}`, t: step < 8 ? (R.t0 + step / 8 * R.dur) : loop / 7 };
  }
  function playAct(h, name, secs) { h.act = { name, until: time + secs }; }
  // the fine figure is drawn on the screen itself in battle, like the bosses
  function drawBattleHero(g2, h, x, y) {
    const { pose, key, t } = heroPose(h), white = h.hurt > 0 && Math.floor(h.hurt * 30) % 2 === 0;
    const fr = rigFrame(h.id, pose, key + "|g" + gearTiers(h.id).join("."), t, white), X = x - RIG_W / 2, Y = y - RIG_FOOT;
    if (battle && mode === "battle" && !cine) { const m = g2.getTransform ? g2.getTransform() : { e: 0, f: 0 }; HIRES_Q.push({ fr, x: X + m.e, y: Y + m.f, w: RIG_W, h: RIG_H, alpha: g2.globalAlpha }); return; }
    const sm = g2.imageSmoothingEnabled; g2.imageSmoothingEnabled = true; g2.drawImage(fr, Math.round(X), Math.round(Y), RIG_W, RIG_H); g2.imageSmoothingEnabled = sm;
  }
  // ---- choreography: wind up, then the blow lands on the strike frame
  const RIG_FX = [];
  const offensive = act => act && (act.kind === "attack" || act.kind === "chain" || (act.skill && (act.skill.power || act.skill.target === "allEnemies" || /^random\d$/.test(act.skill.target || ""))));
  function slashAt(targets, h) {
    const F = FIGHTER[h.id] || {}, col = F.scarf || (F.caster ? (h.id === "ada" ? "#ffcf4a" : "#9ef0f5") : "#ffffff");
    for (const f of targets) { if (!f) continue; const p = unitPos(f); RIG_FX.push({ x: p.x, y: p.y - (f.boss ? 50 : 26), t0: time, kind: F.weapon === "bow" ? "arrow" : F.caster ? "burst" : F.weapon === "hammer" ? "impact" : "slash", col, s: f.boss ? 1.6 : 1, a: Math.random() * 0.8 - 0.4 }); }
  }
  const _doHeroRig = doHero;
  doHero = async function (u, act) {
    if (!battle) return;   // the battle ended while this turn waited in the queue
    if (!act || act.kind === "nothing" || !FIGHTER[u.id]) return _doHeroRig(u, act);
    const F = FIGHTER[u.id], liveF = () => battle.foes.filter(f => !f.dead);
    if (act.kind === "guard") { playAct(u, "guard", 0.5); return _doHeroRig(u, act); }
    if (act.kind === "item") { playAct(u, "item", 0.7); return _doHeroRig(u, act); }
    if (offensive(act)) {
      const targets = act.unit && act.unit.side === "foe" ? [act.unit] : liveF();
      const b0 = battle, still = () => battle === b0 && alive(u);   // the battle may have ended during the wind-up
      if (F.caster) { playAct(u, "cast", 0.9); await wait(260); if (!still()) return; slashAt(targets, u); return _doHeroRig(u, act); }
      if (F.weapon === "bow") { playAct(u, "aim", 0.3); await wait(280); if (!still()) return; playAct(u, "loose", 0.5); slashAt(targets, u); return _doHeroRig(u, act); }
      playAct(u, "windup", 0.24); await wait(220); if (!still()) return; playAct(u, "strike", 0.45); slashAt(targets, u); return _doHeroRig(u, act);
    }
    { const b0 = battle; playAct(u, "cast", 0.8); await wait(180); if (battle !== b0) return; }
    return _doHeroRig(u, act);
  };
  const _victoryRig = victory;
  victory = function () { if (battle) battle.won = true; return _victoryRig(); };
  // monsters: rear back before the move
  const _doFoeRig = doFoe;
  doFoe = async function (f) {
    if (!battle) return;   // the battle ended while this turn waited in the queue
    if (battle && !f.dead && !(f.st && f.st.stun)) { const b0 = battle; f.anim = { k: "wind", t0: time }; await wait(260); f.anim = null; if (battle !== b0 || f.dead) return; }   // the battle may have ended during the wind-up
    return _doFoeRig(f);
  };
  function foeMotion(u) {
    let dy = 0, sx = 1, sy = 1, ghosts = null;
    if (u.anim && u.anim.k === "wind") { const s = easeO((time - u.anim.t0) / 0.26); dy -= 6 * s; sx *= 1 + 0.05 * s; sy *= 1 + 0.08 * s; }
    const L2 = u.lunge || 0;
    if (L2 > 0) { const k = Math.sin(Math.min(1, L2) * Math.PI / 2); dy += 15 * k; sx *= 1 - 0.07 * k; sy *= 1 + 0.1 * k; if (L2 > 0.3) ghosts = [{ dy: -8 * k, a: 0.3 }, { dy: -15 * k, a: 0.14 }]; }
    if (u.hurt > 0 && !u.dead) { const k = u.hurt / 0.35; dy -= 6 * k; sx *= 1 + 0.08 * k; sy *= 1 - 0.08 * k; }
    if (u.dead) { const k = Math.min(1, (u.deathT || 0) / 0.9); sy *= 1 - 0.55 * k; sx *= 1 + 0.22 * k; }
    return { dy, sx, sy, ghosts };
  }
  const _drawBattleMonsterRig = drawBattleMonster;
  drawBattleMonster = function (g2, u, cx, cy) {
    if (!battle) return _drawBattleMonsterRig(g2, u, cx, cy);
    const tf = foeMotion(u);
    if (mode === "battle" && !cine && bossArtFor(u)) {
      const n0 = HIRES_Q.length; _drawBattleMonsterRig(g2, u, cx, cy + tf.dy);
      for (let i = n0; i < HIRES_Q.length; i++) Object.assign(HIRES_Q[i], { sx: tf.sx, sy: tf.sy, ghosts: tf.ghosts });
      return;
    }
    g2.save(); g2.translate(cx, cy + tf.dy); g2.scale(tf.sx, tf.sy); _drawBattleMonsterRig(g2, u, 0, 0); g2.restore();
  };
  // strike effects, drawn on the screen above the fighters
  function drawRigFx(k) {
    for (let i = RIG_FX.length - 1; i >= 0; i--) {
      const f = RIG_FX[i]; if (f.dur) continue;   // longer effects keep their own clock (signature moves, taunts)
      const a = (time - f.t0) / 0.32; if (a >= 1 || !battle) { RIG_FX.splice(i, 1); continue; }
      const X = VP.ox + f.x * k, Y = VP.oy + f.y * k, R = 16 * k * f.s;
      ctx.save(); ctx.globalAlpha = 1 - a; ctx.lineCap = "round";
      if (f.kind === "slash") { ctx.strokeStyle = f.col; ctx.shadowColor = f.col; ctx.shadowBlur = 8 * k; ctx.lineWidth = Math.max(1, 2.6 * k * (1 - a)); ctx.beginPath(); ctx.arc(X, Y, R, -2.4 + f.a, -2.4 + f.a + 2.6 * easeO(a * 2.2)); ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = Math.max(1, 1 * k); ctx.stroke(); }
      else if (f.kind === "impact" || f.kind === "burst") { ctx.strokeStyle = f.col; ctx.shadowColor = f.col; ctx.shadowBlur = 10 * k; ctx.lineWidth = Math.max(1, 2 * k); ctx.beginPath(); ctx.arc(X, Y, R * (0.3 + a * 0.9), 0, Math.PI * 2); ctx.stroke(); for (let j = 0; j < 8; j++) { const an = j / 8 * 6.28 + f.a; ctx.beginPath(); ctx.moveTo(X + Math.cos(an) * R * a * 0.6, Y + Math.sin(an) * R * a * 0.6); ctx.lineTo(X + Math.cos(an) * R * (0.4 + a), Y + Math.sin(an) * R * (0.4 + a)); ctx.stroke(); } }
      else if (f.kind === "arrow") { const s = easeO(a * 3), x0 = X, y0 = Y + 90 * k * (1 - s); ctx.strokeStyle = "#e8e2d0"; ctx.lineWidth = Math.max(1, 1.2 * k); ctx.beginPath(); ctx.moveTo(x0, y0 + 10 * k); ctx.lineTo(x0, y0); ctx.stroke(); if (a > 0.3) { ctx.globalAlpha = (1 - a) * 0.9; ctx.strokeStyle = "#ffffff"; ctx.beginPath(); ctx.arc(X, Y, R * 0.5 * a * 2, 0, Math.PI * 2); ctx.stroke(); } }
      ctx.restore();
    }
  }

