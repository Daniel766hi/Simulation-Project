  // ================================================================== DRAWING: PEOPLE
  function shadeHex(hex, amt) {
    const n = parseInt(hex.slice(1), 16), f = v => clamp(Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt)), 0, 255);
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  }
  // ---- characters: taller, shaded, outlined sprites with a real walk cycle
  const OUT = "#161226";
  const EXTRA_STYLES = {};
  function personStyle(o) {
    if (o.style) return o.style;
    if (EXTRA_STYLES[o.extra]) return EXTRA_STYLES[o.extra];
    if (o.hero) return { hair: "fringe", coat: true, eye: "#3a6ab0" };
    return ({ hammer: { hair: "bun", sleeveless: true, apron: "#5a3a22", eye: "#4a7a3a" }, blind: { hair: "long", dress: true },
              bow: { hair: "hood", hood: "#3a4a2e", eye: "#8a6a2a" }, veil: { hair: "veil", dress: true, eye: "#5a4a8a" },
              spear: { hair: "helm", armor: true, eye: "#3a3a4a" }, staff: { hair: "long", dress: true, eye: "#6a5a4a" },
              pack: { hair: "bald", beard: true, eye: "#3a2a1a" }, cap: { hair: "cap", eye: "#4a3020" } })[o.extra] || { hair: "tail", eye: "#4a3020" };
  }
  function drawPerson(g, x, y, o) {
    if (o.dead) {
      const X = Math.round(x), Y = Math.round(y), P = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(X + a, Y + b, w, h); };
      P(-12, -7, 24, 9, OUT); P(-11, -5, 11, 6, o.robe); P(-11, -5, 11, 1, shadeHex(o.robe, 0.15)); P(0, -6, 9, 8, o.skin); P(6, -7, 5, 9, o.hair);
      P(3, -3, 1, 1, OUT); P(5, -3, 1, 1, OUT); P(-14, -3, 4, 2, "#2a1e18"); P(-3, -6, 4, 1, "#3ee0e8"); P(-12, 1, 10, 2, "#7a1a22"); P(-6, 2, 4, 1, "#5a0f18");
      return;
    }
    // Chibi proportions: a big expressive head on a small, detailed body
    const st = personStyle(o), dir = o.dir || "down", side = dir === "left" || dir === "right", back = dir === "up";
    const phase = o.walking ? o.walk * Math.PI * 2 : 0;
    // walk: the body rises on each passing step and dips at contact; running bounds higher
    const run = o.walking && o.run, bob = o.walking ? Math.round(Math.abs(Math.sin(phase)) * (run ? 2 : 1.3)) : (Math.sin(time * 1.8 + (o.bob || 0)) > 0.55 ? 1 : 0);
    const skin = o.skin, skinD = shadeHex(skin, -0.2), skinL = shadeHex(skin, 0.14), hair = o.hair, hairD = shadeHex(hair, -0.35), hairL = shadeHex(hair, 0.22);
    const cloth = o.robe, clothD = shadeHex(cloth, -0.32), clothL = shadeHex(cloth, 0.16), pants = st.pants || shadeHex(cloth, -0.5), boots = "#2a1e18", belt = "#5a3a22";
    const eye = o.glowEyes ? "#3ee0e8" : (st.eye || "#3a2a1a");
    g.save(); g.translate(Math.round(x), Math.round(y));
    const sc = (o.small ? 0.8 : 1) * (o.scale || 1); if (sc !== 1) g.scale(sc, sc);
    g.fillStyle = "rgba(20,14,40,.3)"; g.beginPath(); g.ellipse(0, 1, 7, 2.3, 0, 0, Math.PI * 2); g.fill();
    if (dir === "left") g.scale(-1, 1);
    const P = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
    const O = (a, b, w, h, c) => { P(a - 1, b - 1, w + 2, h + 2, OUT); P(a, b, w, h, c); };
    const by = -bob, sw = Math.sin(phase);
    const backGear = () => {
      if (o.extra === "pack") { O(-8, -15 + by, 4, 8, "#8a5533"); P(-8, -15 + by, 4, 1, "#a8703f"); }
      if (o.extra === "bow") { O(-6, -15 + by, 2, 7, "#6b3f24"); P(-6, -17 + by, 1, 2, "#e8e2d0"); P(-5, -18 + by, 1, 3, "#e8e2d0"); }
    };
    if (!back) backGear();
    // legs
    const lift = run ? 2 : 1;
    if (st.dress) {   // the hem swings with the stride and the feet show beneath it in turn
      const hs = o.walking ? Math.round(sw * (side ? 1.4 : 0.8)) : 0;
      O(-4 + hs, -7 + by, 8, 6, cloth); P(-5 + hs, -2 + by, 10, 1, clothD); P(2 + hs, -7 + by, 2, 5, clothD);
      if (side) { const f = Math.round(sw * (run ? 3 : 2)); P(-1 - f, -1 - (sw < -0.3 ? lift - 1 : 0), 3, 1, boots); P(-1 + f, -1 - (sw > 0.3 ? lift - 1 : 0), 3, 1, boots); }
      else { P(-3 + Math.round(sw), -1 - (sw > 0.3 ? 1 : 0), 2, 1, boots); P(1 - Math.round(sw), -1 - (sw < -0.3 ? 1 : 0), 2, 1, boots); }
    } else if (side) {   // stride: the leading foot reaches, the trailing foot pushes off; running folds the knee of the swinging leg
      const f = Math.round(sw * (run ? 3 : 2)), lF = sw > 0.3 ? -lift : 0, lB = sw < -0.3 ? -lift : 0;
      const legB = run && lB ? 2 : 3, legF = run && lF ? 2 : 3;
      O(-1 - f, -5 + by + lB, 2, legB, shadeHex(pants, -0.2)); O(-1 - f - (run && lB ? 1 : 0), -2 + lB - (3 - legB), 3, 2, boots);
      O(-1 + f, -5 + by + lF, 2, legF, pants); O(-1 + f + (run && lF ? 1 : 0), -2 + lF - (3 - legF), 3, 2, boots);
    } else {   // seen from the front or back: the stepping leg lifts and swings a little out
      const lL = sw > 0.3 ? -lift : 0, lR = sw < -0.3 ? -lift : 0, oL = run && lL ? -1 : 0, oR = run && lR ? 1 : 0;
      O(-3 + oL, -5 + by + lL, 2, 3, pants); O(-3 + oL, -2 + lL, 3, 2, boots);
      O(1 + oR, -5 + by + lR, 2, 3, pants); O(1 + oR, -2 + lR, 3, 2, boots);
    }
    // body
    const armSw = Math.round(Math.sin(phase + Math.PI) * (run ? 2.6 : 1.7));
    const sleeve = st.sleeveless ? skin : (st.armor ? "#8a90a8" : cloth);
    if (side) { O(-1 - armSw, -11 + by, 2, 5, shadeHex(sleeve, -0.25)); P(-1 - armSw, -6 + by, 2, 1, skinD); }
    const tw = side ? 6 : 8, tx = side ? -3 : -4;
    O(tx, -12 + by, tw, 7, cloth); P(tx + tw - 2, -12 + by, 2, 7, clothD); P(tx, -12 + by, 1, 7, clothL);
    if (st.coat) { O(tx, -6 + by, tw, 3, cloth); P(tx + tw - 2, -6 + by, 2, 3, clothD); if (!side && !back) P(-1, -6 + by, 2, 3, OUT); }
    if (st.apron && !back) { P(tx + 1, -11 + by, tw - 2, 7, st.apron); P(tx + 1, -11 + by, tw - 2, 1, shadeHex(st.apron, 0.2)); }
    if (st.armor) { P(tx - 1, -12 + by, tw + 2, 2, "#9aa0b8"); P(tx - 1, -12 + by, tw + 2, 1, "#d8dce8"); if (!back) { P(tx + 2, -10 + by, tw - 4, 4, "#4a5a8a"); P(-1, -9 + by, 2, 2, "#ffcf4a"); } }
    if (!st.dress) { P(tx, -7 + by, tw, 1, belt); if (!side && !back) P(-1, -7 + by, 2, 1, "#ffcf4a"); }
    if (o.extra === "veil" && !back) { P(-1, -11 + by, 2, 4, "#c8102e"); P(-2, -10 + by, 4, 1, "#c8102e"); }
    if (o.hero) { P(tx - 1, -13 + by, tw + 2, 2, "#3ee0e8"); P(tx - 1, -12 + by, tw + 2, 1, "#1fb8c2"); }
    if (side) { O(-1 + armSw, -11 + by, 2, 5, sleeve); P(-1 + armSw, -6 + by, 2, 1, skin); }
    else {
      const aL = o.walking ? (armSw > 0 ? (run ? 2 : 1) : armSw < 0 ? -1 : 0) : 0, aR = o.walking ? (armSw < 0 ? (run ? 2 : 1) : armSw > 0 ? -1 : 0) : 0, len = run ? 4 : 5;
      O(-6, -11 + by + aL, 2, len, sleeve); P(-6, -11 + len + by + aL, 2, 1, skin); O(4, -11 + by + aR, 2, len, sleeve); P(4, -11 + len + by + aR, 2, 1, skinD);
    }
    // long hair behind the head
    if (st.hair === "long" || (st.hair === "tail" && (side || back))) { const len = st.hair === "long" ? 13 : 9, trail2 = o.walking ? (side ? -1 - (run ? 1 : 0) : Math.round(sw * 0.8)) : 0; O(-6 + trail2, -22 + by, side ? 7 : 12, len, hair); P(-6 + trail2, -22 + by, 1, len, hairL); }
    // big head
    const hw = side ? 11 : 12, hx = side ? -5 : -6, hy = -24 + by, blink = !o.walking && !o.glowEyes && ((time + (o.bob || 0) * 1.7) % 3.4) < 0.13;
    O(hx, hy, hw, 11, skin);
    if (!back) { P(hx + hw - 2, hy + 1, 2, 9, skinD); P(hx, hy + 7, 1, 2, skinL); }
    if (back) { P(hx, hy, hw, 11, hair); P(hx + hw - 2, hy, 2, 11, hairD); P(hx, hy, hw, 1, hairL); }
    else if (side) {
      if (blink) P(1, hy + 6, 3, 1, OUT); else { P(1, hy + 5, 3, 3, "#f4f0ea"); P(2, hy + 5, 2, 3, eye); P(3, hy + 5, 1, 1, "#ffffff"); } P(1, hy + 4, 3, 1, hairD);
      P(5, hy + 7, 1, 1, skinD); P(2, hy + 9, 2, 1, "#9a4a4a"); P(-1, hy + 8, 2, 1, "rgba(255,120,120,.45)");
    } else {
      if (blink) { P(-4, hy + 6, 3, 1, OUT); P(1, hy + 6, 3, 1, OUT); }
      else { P(-4, hy + 5, 3, 3, "#f4f0ea"); P(1, hy + 5, 3, 3, "#f4f0ea");
      P(-3, hy + 5, 2, 3, eye); P(2, hy + 5, 2, 3, eye); P(-3, hy + 5, 1, 1, "#ffffff"); P(2, hy + 5, 1, 1, "#ffffff"); }
      P(-4, hy + 4, 3, 1, hairD); P(1, hy + 4, 3, 1, hairD);
      P(-1, hy + 9, 2, 1, "#9a4a4a"); P(-5, hy + 8, 2, 1, "rgba(255,120,120,.45)"); P(3, hy + 8, 2, 1, "rgba(255,120,120,.45)");
    }
    // hair and headwear
    const top = (h = 4) => { O(hx, hy - 1, hw, h, hair); P(hx, hy - 1, hw, 1, hairL); };
    switch (st.hair) {
      case "fringe": top(4); if (!back) { P(hx, hy + 2, 2, 5, hair); if (!side) { P(-3, hy + 3, 3, 1, hair); P(1, hy + 3, 4, 2, hair); P(hx + hw - 2, hy + 2, 2, 5, hairD); } else P(-4, hy + 3, 4, 2, hair); } O(-1, hy - 3, 2, 2, hair); break;
      case "bun": top(4); O(side ? -5 : -2, hy - 4, 4, 3, hair); if (!back && !side) { P(hx, hy + 2, 1, 5, hair); P(hx + hw - 1, hy + 2, 1, 5, hairD); } break;
      case "long": top(4); if (!back && !side) { P(hx - 1, hy + 2, 2, 12, hair); P(hx + hw - 1, hy + 2, 2, 12, hairD); } break;
      case "tail": top(4); if (!back && !side) { P(hx, hy + 2, 1, 3, hair); P(hx + hw - 1, hy + 2, 1, 3, hairD); } if (side) O(-7, hy + 2, 2, 7, hair); break;
      case "hood": { const hc = st.hood || clothD; O(hx - 1, hy - 2, hw + 2, 5, hc); if (!back) { P(hx - 1, hy + 2, 2, 8, hc); if (!side) P(hx + hw - 1, hy + 2, 2, 8, hc); P(hx + 1, hy + 3, hw - 2, 1, skinD); } else P(hx - 1, hy + 2, hw + 2, 10, hc); break; }
      case "veil": O(hx - 1, hy - 2, hw + 2, 5, "#2b2350"); P(hx - 1, hy + 2, 2, 12, "#2b2350"); if (!side) P(hx + hw - 1, hy + 2, 2, 12, "#2b2350"); if (back) P(hx - 1, hy + 2, hw + 2, 12, "#2b2350"); else P(hx + 1, hy + 2, hw - 2, 1, "#f2eef8"); break;
      case "helm": O(hx - 1, hy - 2, hw + 2, 6, "#9aa0b8"); P(hx, hy - 2, 4, 1, "#e8ecf8"); if (!back) P(side ? 2 : -1, hy + 3, side ? 1 : 2, 4, "#9aa0b8"); O(side ? -5 : -1, hy - 5, 2, 3, "#c8102e"); break;
      case "cap": O(hx - 1, hy - 2, hw + 2, 4, "#b8473a"); if (!back) P(side ? 0 : hx - 1, hy + 2, side ? 7 : hw + 2, 1, "#8a2a22"); break;
      case "bald": P(hx, hy, hw, 1, skinL); if (st.beard && !back) O(side ? 0 : -4, hy + 8, side ? 5 : 8, 3, hair); break;
      case "goggles": top(4); if (side) O(-7, hy + 2, 2, 7, hair); if (!back) { P(hx, hy + 3, hw, 1, "#6b3f24"); O(side ? 0 : -4, hy + 2, 3, 2, "#9ad8e0"); if (!side) O(1, hy + 2, 3, 2, "#9ad8e0"); } break;
      case "tricorn": top(3); O(hx - 3, hy - 3, hw + 6, 2, "#2a1a14"); O(hx + 1, hy - 6, hw - 2, 3, "#2a1a14"); P(hx - 2, hy - 3, hw + 4, 1, "#c9a227"); if (!back && !side) { P(hx - 1, hy + 2, 2, 7, hair); P(hx + hw - 1, hy + 2, 2, 7, hair); } break;
      case "crystal": P(hx, hy - 1, hw, 2, "#7c74a2"); for (const [cx2, h] of [[-4, 6], [-1, 9], [3, 5]]) { if (side && cx2 > 2) continue; O(cx2, hy - 1 - h, 2, h, "#9ef0f5"); P(cx2, hy - 1 - h, 1, h, "#e8ffff"); } break;
    }
    if (o.extra === "blind" && !back) P(hx, hy + 5, hw, 3, "#e8e4f0");
    if (back) backGear();
    // held things
    if (o.hero) { if (back) { P(-4, -21 + by, 1, 13, "#d8dce8"); P(-5, -14 + by, 3, 1, "#ffcf4a"); } else if (side) { P(-5, -8 + by, 9, 1, "#d8dce8"); P(-6, -9 + by, 1, 3, "#ffcf4a"); } else { O(6, -10 + by, 1, 7, "#d8dce8"); P(5, -10 + by, 3, 1, "#ffcf4a"); } }
    if (o.extra === "hammer" && !back) { P(side ? 1 + armSw : 5, -11 + by, 1, 8, "#6b3f24"); O(side ? -1 + armSw : 3, -14 + by, 5, 3, "#857ea5"); P(side ? -1 + armSw : 3, -14 + by, 5, 1, "#c8c2e0"); }
    if (o.extra === "staff") { P(side ? 3 : 7, -26 + by, 1, 26, "#8a5a33"); O(side ? 2 : 6, -29 + by, 3, 3, "#ffcf4a"); }
    if (o.extra === "spear") { P(side ? 3 : 7, -31 + by, 1, 30, "#8a5a33"); O(side ? 2 : 6, -35 + by, 3, 4, "#d8dce8"); if (!back) { O(side ? -5 : -9, -12 + by, 4, 6, "#4a5a8a"); P(side ? -4 : -8, -10 + by, 2, 2, "#ffcf4a"); } }
    if (o.extra === "bow" && !back) { g.strokeStyle = "#8a5a33"; g.lineWidth = 1; g.beginPath(); g.arc(side ? 3 : 6, -9 + by, 6, -1.3, 1.3); g.stroke(); g.strokeStyle = "rgba(232,226,208,.7)"; g.beginPath(); g.moveTo(side ? 4.5 : 7.5, -15 + by); g.lineTo(side ? 4.5 : 7.5, -3 + by); g.stroke(); }
    if (o.extra === "blind" && !back) { O(side ? 3 : 5, -8 + by, 3, 3, "#ffcf4a"); P(side ? 3 : 5, -8 + by, 3, 1, "#fff1b0"); }
    if (o.extra === "flask" && !back) { O(side ? 3 : 5, -8 + by, 3, 3, "#6fbf62"); P(side ? 3 : 5, -9 + by, 3, 1, "#e8e2d0"); }
    if (o.extra === "cutlass" && !back) { P(side ? 2 + armSw : 6, -13 + by, 1, 8, "#d8dce8"); P(side ? 1 + armSw : 5, -6 + by, 3, 1, "#c9a227"); if (!side) { P(-7, -13 + by, 1, 8, "#d8dce8"); P(-8, -6 + by, 3, 1, "#c9a227"); } }
    if (o.extra === "crystal" && !back) { O(side ? -1 : -2, -11 + by, side ? 3 : 4, 3, "#3ee0e8"); P(side ? 0 : -1, -10 + by, 1, 1, "#e8ffff"); }
    g.restore();
  }
  // running: the whole figure leans into its direction of travel and bounds, sheared about the feet
  const _drawPersonRun = drawPerson;
  drawPerson = function (g, x, y, o) {
    if (!o || !o.run || o.dead) return _drawPersonRun(g, x, y, o);
    const lean = o.dir === "right" ? -0.22 : o.dir === "left" ? 0.22 : 0, hop = Math.abs(Math.sin((o.walk || 0) * Math.PI * 2)) * 1.6;
    g.save(); g.translate(Math.round(x), Math.round(y - hop)); g.transform(1, 0, lean, o.dir === "up" || o.dir === "down" ? 0.94 : 1, 0, 0);
    _drawPersonRun(g, 0, 0, o); g.restore();
  };
  // Dialogue portraits: a shaded bust with a proper face
  function drawBust(p, look) {
    const st = personStyle(look), skin = look.skin, skinD = shadeHex(skin, -0.2), skinL = shadeHex(skin, 0.14), hair = look.hair, hairD = shadeHex(hair, -0.35), hairL = shadeHex(hair, 0.22);
    const cloth = look.robe, clothD = shadeHex(cloth, -0.32), eye = st.eye || "#4a3020";
    const R = (x, y, w, h, c) => { p.fillStyle = c; p.fillRect(x, y, w, h); };
    const bg = p.createLinearGradient(0, 0, 0, 48); bg.addColorStop(0, "#2e2660"); bg.addColorStop(1, "#171230"); p.fillStyle = bg; p.fillRect(0, 0, 48, 48);
    if (st.hair === "long") { R(11, 12, 26, 30, OUT); R(12, 13, 24, 29, hair); R(12, 13, 3, 29, hairL); }
    if (st.hair === "veil") { R(10, 8, 28, 36, OUT); R(11, 9, 26, 36, "#2b2350"); }
    if (st.hair === "hood") { R(9, 7, 30, 36, OUT); R(10, 8, 28, 36, st.hood); R(10, 8, 4, 36, shadeHex(st.hood, 0.15)); }
    // shoulders and clothes
    R(5, 37, 38, 11, OUT); R(6, 38, 36, 10, st.armor ? "#8a90a8" : cloth); R(30, 38, 12, 10, st.armor ? "#6a7088" : clothD);
    if (st.armor) { R(12, 40, 24, 8, "#4a5a8a"); R(22, 41, 4, 4, "#ffcf4a"); R(6, 38, 36, 2, "#d8dce8"); }
    if (st.apron) { R(15, 39, 18, 9, st.apron); R(16, 38, 2, 2, st.apron); R(30, 38, 2, 2, st.apron); }
    if (st.sleeveless) { R(6, 40, 6, 8, skin); R(36, 40, 6, 8, skinD); }
    if (look.extra === "veil") { R(22, 40, 4, 8, "#c8102e"); R(19, 42, 10, 3, "#c8102e"); }
    // neck and face
    R(19, 30, 10, 9, skinD); R(19, 30, 10, 2, shadeHex(skin, -0.35));
    R(14, 10, 20, 23, OUT); R(13, 13, 22, 17, OUT); R(16, 32, 16, 2, OUT);
    R(15, 11, 18, 21, skin); R(14, 14, 20, 15, skin); R(17, 32, 14, 1, skin);
    R(29, 12, 4, 19, skinD); R(33, 15, 1, 13, skinD); R(16, 23, 3, 3, skinL);
    R(12, 19, 2, 6, skin); R(34, 19, 2, 6, skinD);
    if (look.extra === "blind") { R(13, 19, 22, 5, "#e8e4f0"); R(13, 23, 22, 1, "#b8b0c8"); }
    else {
      const glow = look.glowEyes;
      R(17, 20, 6, 3, "#f4f0ea"); R(26, 20, 6, 3, "#f4f0ea");
      R(19, 20, 3, 3, glow ? "#3ee0e8" : eye); R(27, 20, 3, 3, glow ? "#3ee0e8" : eye);
      R(20, 21, 1, 1, "#111"); R(28, 21, 1, 1, "#111"); R(19, 20, 1, 1, "#fff"); R(27, 20, 1, 1, "#fff");
      R(17, 19, 6, 1, "#2b1a1a"); R(26, 19, 6, 1, "#2b1a1a");
    }
    R(17, 17, 6, 1, hairD); R(26, 17, 6, 1, hairD);
    R(24, 22, 2, 5, skinD); R(22, 27, 5, 1, skinD); R(23, 26, 1, 1, skinL);
    R(21, 29, 7, 1, "#8a3a3a"); R(22, 30, 5, 1, "#c07878");
    if (st.beard) { R(15, 26, 18, 7, OUT); R(16, 26, 16, 7, hair); R(21, 29, 7, 1, "#6a2a2a"); R(16, 26, 3, 7, hairL); }
    // hair and headwear
    switch (st.hair) {
      case "fringe": R(13, 7, 22, 7, OUT); R(14, 8, 20, 6, hair); R(14, 8, 20, 1, hairL); R(14, 13, 3, 7, hair); R(18, 13, 4, 4, hair); R(23, 13, 3, 3, hair); R(27, 13, 5, 5, hair); R(31, 13, 3, 7, hairD); R(22, 5, 4, 3, hair); break;
      case "bun": R(13, 7, 22, 6, OUT); R(14, 8, 20, 5, hair); R(14, 8, 20, 1, hairL); R(19, 2, 10, 7, OUT); R(20, 3, 8, 5, hair); R(14, 12, 2, 8, hair); R(32, 12, 2, 8, hairD); break;
      case "long": R(13, 7, 22, 7, OUT); R(14, 8, 20, 6, hair); R(14, 8, 20, 1, hairL); R(12, 12, 4, 20, hair); R(32, 12, 4, 20, hairD); break;
      case "tail": R(13, 7, 22, 7, OUT); R(14, 8, 20, 6, hair); R(14, 8, 20, 1, hairL); R(14, 13, 2, 6, hair); R(32, 13, 2, 6, hairD); R(34, 10, 4, 14, hair); break;
      case "hood": R(12, 8, 24, 6, st.hood); R(12, 13, 3, 18, st.hood); R(33, 13, 3, 18, shadeHex(st.hood, -0.2)); R(15, 13, 18, 2, skinD); break;
      case "veil": R(12, 9, 24, 6, "#2b2350"); R(14, 14, 20, 2, "#f2eef8"); R(11, 14, 4, 26, "#2b2350"); R(33, 14, 4, 26, "#2b2350"); break;
      case "helm": R(12, 5, 24, 11, OUT); R(13, 6, 22, 9, "#9aa0b8"); R(13, 6, 22, 2, "#e8ecf8"); R(22, 13, 4, 10, "#9aa0b8"); R(22, 13, 1, 10, "#e8ecf8"); R(12, 14, 3, 12, "#8a90a8"); R(33, 14, 3, 12, "#6a7088"); R(21, 1, 6, 5, "#c8102e"); break;
      case "cap": R(12, 6, 24, 8, OUT); R(13, 7, 22, 6, "#b8473a"); R(13, 12, 26, 2, "#8a2a22"); R(14, 13, 2, 5, hair); R(32, 13, 2, 5, hair); break;
      case "bald": R(15, 10, 18, 2, skinL); R(12, 14, 2, 6, hair); R(34, 14, 2, 6, hair); break;
      case "goggles": R(13, 7, 22, 7, OUT); R(14, 8, 20, 6, hair); R(14, 8, 20, 1, hairL); R(34, 10, 4, 14, hair); R(13, 12, 22, 3, "#6b3f24"); R(16, 11, 6, 5, OUT); R(17, 12, 4, 3, "#9ad8e0"); R(26, 11, 6, 5, OUT); R(27, 12, 4, 3, "#9ad8e0"); break;
      case "tricorn": R(13, 9, 22, 5, hair); R(12, 13, 3, 12, hair); R(33, 13, 3, 12, hairD); R(6, 6, 36, 6, OUT); R(7, 7, 34, 4, "#2a1a14"); R(14, 2, 20, 6, OUT); R(15, 3, 18, 5, "#2a1a14"); R(7, 10, 34, 1, "#c9a227"); break;
      case "crystal": R(14, 9, 20, 4, "#7c74a2"); for (const [x2, h] of [[16, 8], [22, 11], [28, 7]]) { R(x2 - 1, 9 - h, 5, h + 1, OUT); R(x2, 10 - h, 3, h, "#9ef0f5"); R(x2, 10 - h, 1, h, "#e8ffff"); } break;
    }
    if (look.hero) { R(9, 34, 30, 6, OUT); R(10, 35, 28, 4, "#3ee0e8"); R(10, 38, 28, 1, "#1fb8c2"); R(30, 36, 5, 10, "#3ee0e8"); }
  }
  function drawScarf(g, ox, oy) {
    const pts = player.scarf.slice(0, 10); if (pts.length < 2) return;
    g.lineCap = "round";
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; g.strokeStyle = i % 2 ? "#3ee0e8" : "#1fb8c2"; g.lineWidth = Math.max(1, 3 - i * 0.22); g.beginPath(); g.moveTo(a.x - ox, a.y - oy); g.lineTo(b.x - ox, b.y - oy); g.stroke(); }
  }

