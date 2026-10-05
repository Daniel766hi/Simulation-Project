  // ================================================================== BATTLE LAYOUT: nobody under the text
  // The battle picture is fitted into the room the panels leave (turn order on top, cards and menu below): it is
  // scaled and shifted so that every foe, its labels and every hero sit in open ground. Text drawn on the picture
  // (intents, weaknesses, damage numbers) then steps aside, shrinks or shortens rather than cover a sprite, a
  // panel or other text. On phones the panels themselves are slimmer.
  const blCss = document.createElement("style");
  blCss.textContent = ".battle-top{flex-direction:row;flex-wrap:nowrap;align-items:center}"
    + ".turnbar{flex-wrap:nowrap;overflow:hidden;max-width:none;flex:0 1 auto;min-width:0}.turnbar span{white-space:nowrap}.fury{flex:none}"
    + "@media (pointer:coarse),(max-width:700px),(max-height:500px){"
    + ".battle-top{top:6px;left:6px;gap:4px}.turnbar{gap:3px}.turnbar span{font-size:9px;padding:1px 4px}.fury{font-size:9px;padding:2px 5px;gap:4px}.fury .bar{width:50px}"
    + ".battle-bottom{grid-template-columns:1fr 196px;left:6px;right:6px;bottom:6px;gap:6px}"
    + ".cards{flex-wrap:nowrap;gap:4px}.card{flex:1 1 0;min-width:0;max-width:none;padding:2px 4px;font-size:9px;border-width:1px;border-radius:5px}"
    + ".card .nm{margin-bottom:1px}.card .nm small{display:none}.card .nums{font-size:8px}.card .bar{height:4px}.chips{min-height:0;margin-top:1px}.chip{font-size:8px}"
    + ".menu{display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:4px;max-height:112px;border-width:1px}.menu .title{grid-column:1/-1;font-size:9px}"
    + ".menu button{font-size:11px;padding:3px 6px}.menu button small,.menu button.sel small,.menu button:hover small{display:none}"
    + "#battleUI>.blog{font-size:11px;padding:3px 8px}}";
  document.head.appendChild(blCss);

  // sprite footprints in picture units (what text must never sit on)
  function spriteBox(u) {
    const p = unitPos(u);
    if (u.side === "hero") return { x: p.x - 10, y: p.y - 37, w: 20, h: 39 };
    const A = bossArtFor(u); if (A) return { x: p.x - A.w / 2 + 4, y: p.y - A.h + 6, w: A.w - 8, h: A.h - 4 };
    return u.boss ? { x: p.x - 45, y: p.y - 108, w: 90, h: 110 } : { x: p.x - 19, y: p.y - 46, w: 38, h: 48 };
  }
  // the room each unit needs, labels included
  function unitBlock(u) {
    const p = unitPos(u);
    if (u.side === "hero") return { x: p.x - 11, y: p.y - 38, w: 22, h: 41 };
    const A = bossArtFor(u);
    if (A && A.regular) return { x: p.x - Math.max(30, A.w / 2), y: p.y - A.h - 30, w: Math.max(60, A.w), h: A.h + 32 };
    if (A) return { x: p.x - Math.max(50, A.w / 2), y: p.y - A.h + 2, w: Math.max(100, A.w), h: A.h + 20 };
    return u.boss ? { x: p.x - 50, y: p.y - 108, w: 100, h: 130 } : { x: p.x - 30, y: p.y - 86, w: 60, h: 90 };
  }
  function hiW(t, px) { ctx.font = `${Math.round(px * VP.k)}px 'Pixelify Sans', 'Courier New', monospace`; return ctx.measureText(t).width / VP.k; }
  const overlapArea = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const BL_PANELS = ["#turnbar", "#fury", "#cards .card", "#menu", "#pauseBtn"];
  const unionOf = rs => { if (!rs.length) return null; const x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y)); return { x, y, w: Math.max(...rs.map(r => r.x + r.w)) - x, h: Math.max(...rs.map(r => r.y + r.h)) - y }; };
  function panelRects() {   // battle panels in canvas device pixels, one box per group (the cards row is one box)
    const cr = canvas.getBoundingClientRect(), dev = canvas.width / (cr.width || 1), out = [];
    for (const group of [["#turnbar", "#fury"], ["#cards .card"], ["#menu"], ["#pauseBtn"]]) {
      const rs = [];
      for (const q of group) for (const el of document.querySelectorAll(q)) if (shown(el)) {
        const r = el.getBoundingClientRect(); if (r.width < 2) continue;
        rs.push({ x: (r.left - cr.left) * dev - 3 * dev, y: (r.top - cr.top) * dev - 3 * dev, w: (r.width + 6) * dev, h: (r.height + 6) * dev });
      }
      const u = unionOf(rs); if (u) out.push(u);
    }
    return out;
  }
  let blKey = "", blFit = null;
  function fitBattle() {
    const panels = panelRects(), kFull = canvas.width / VIEW_W;
    const heroes = battle.heroes.filter(h => alive(h)), foes = battle.foes.filter(f => !f.dead);
    const q8 = v => Math.round(v / 8);   // small wobbles (a status chip, a pulsing bar) don't trigger a new fit
    const key = canvas.width + "x" + canvas.height + "|" + panels.map(r => [r.x, r.y, r.w, r.h].map(q8).join(",")).join(";") + "|" + [...heroes, ...foes].map(u => u.id + (u.boss ? "B" : "")).join(",");
    if (key === blKey && blFit) return blFit;
    const blocks = [unionOf(heroes.map(unitBlock)), ...foes.map(unitBlock)].filter(Boolean);   // the heroes stand in one row
    const fits = (k, ox, oy) => blocks.every(b => {
      const r = { x: ox + b.x * k, y: oy + b.y * k, w: b.w * k, h: b.h * k };
      if (r.y < 0 || r.x < -2 || r.x + r.w > canvas.width + 2 || r.y + r.h > canvas.height) return false;
      return panels.every(p => !overlapArea(r, p));
    });
    const solve = k => {
      const oxC = (canvas.width - VIEW_W * k) / 2, oys = [0], oxs = [oxC];
      for (const b of blocks) for (const p of panels) {
        oys.push(p.y - 1 - (b.y + b.h) * k, p.y + p.h + 1 - b.y * k);
        oxs.push(p.x - 1 - (b.x + b.w) * k, p.x + p.w + 1 - b.x * k);
      }
      for (const b of blocks) { oys.push(-b.y * k, canvas.height - (b.y + b.h) * k); oxs.push(-b.x * k, canvas.width - (b.x + b.w) * k); }
      const combos = [];
      for (const oy of oys) for (const ox of oxs) combos.push([Math.abs(oy) + Math.abs(ox - oxC), ox, oy]);
      combos.sort((a, b) => a[0] - b[0]);
      for (const [, ox, oy] of combos) if (fits(k, ox, oy)) return { k, ox: Math.round(ox), oy: Math.round(oy) };
      return null;
    };
    // coarse steps down from full size, then a few halvings between the last miss and the first fit
    let best = solve(kFull), miss = kFull;
    for (let k = kFull * 0.9; !best && k >= 0.5; k *= 0.9) { best = solve(k); if (!best) miss = k; }
    if (best && best.k < kFull) for (let n = 0; n < 4; n++) { const mid = (miss + best.k) / 2, t = solve(mid); if (t) best = t; else miss = mid; }
    if (best && best.k < kFull) { const ks = Math.floor(best.k); if (ks >= 1 && ks / best.k > 0.8) best = solve(ks) || best; }   // whole pixels keep the art crisp
    blKey = key; blFit = best || { k: 0.5, ox: Math.round((canvas.width - VIEW_W * 0.5) / 2), oy: 0 };
    return blFit;
  }
  const _computeVPB = computeVP;
  computeVP = function () {
    _computeVPB();
    if (!battle || mode !== "battle" || $("battleUI").hidden) return;
    const f = fitBattle();
    VP.k = f.k; VP.ox = f.ox; VP.oy = f.oy; VP.inset = f.k !== canvas.width / VIEW_W || f.ox !== 0 || f.oy !== 0;
  };

  // damage numbers start beside the sprite (foes) or above the head (heroes), and stack instead of piling up
  const _popupB = popup, _popupTextB = popupText;
  function besideSprite(u, lift) {
    const b = spriteBox(u), cx = b.x + b.w / 2;
    if (u.side === "hero") { const hs = battle.heroes, last = hs.indexOf(u) === hs.length - 1; return [last ? b.x - 9 : b.x + b.w + 9, b.y + 14 - lift]; }
    const right = cx < VIEW_W / 2;
    return [right ? b.x + b.w + 12 : b.x - 12, b.y + b.h * 0.45 - lift];
  }
  function restack(pp) {
    for (let n = 0; n < 6 && popups.some(q => q !== pp && Math.abs(q.x - pp.x) < 22 && Math.abs(q.y - pp.y) < 9); n++) pp.y -= 9;
  }
  popup = function (u, value, color, crit) {
    _popupB(u, value, color, crit); const pp = popups[popups.length - 1]; if (!pp) return;
    [pp.x, pp.y] = besideSprite(u, 0); pp.x += rand(-2, 2); restack(pp);
  };
  popupText = function (u, text, color) {
    _popupTextB(u, text, color); const pp = popups[popups.length - 1]; if (!pp) return;
    [pp.x, pp.y] = besideSprite(u, 9); restack(pp);
  };

  // picture text: in battle every label is placed against the sprites, the panels and the labels already placed
  function domInPicture(sels, all) {   // page panels as picture-unit boxes
    const cr = canvas.getBoundingClientRect(), dev = canvas.width / (cr.width || 1), out = [];
    for (const q of sels) for (const e of document.querySelectorAll(q)) if (shown(e) && (all || e.dataset.faded !== "1")) {
      const r = e.getBoundingClientRect(); out.push({ x: ((r.left - cr.left) * dev - VP.ox) / VP.k, y: ((r.top - cr.top) * dev - VP.oy) / VP.k, w: r.width * dev / VP.k, h: r.height * dev / VP.k });
    }
    return out;
  }
  function battleObstacles() {
    const out = [...battle.heroes.filter(h => alive(h)), ...battle.foes.filter(f => !f.dead)].map(spriteBox);
    for (const p of panelRects()) out.push({ x: (p.x - VP.ox) / VP.k, y: (p.y - VP.oy) / VP.k, w: p.w / VP.k, h: p.h / VP.k });
    return out;
  }
  flushHiText = function () {
    HI_LAST.length = 0;
    if (!HI.length) return;
    const k = VP.k; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    const cssW = canvas.getBoundingClientRect().width || canvas.width, minPx = 9 * (canvas.width / cssW) / k;   // never under 9 screen pixels
    const solid = battle && mode === "battle" ? battleObstacles() : !battle && G && mode === "play" && !cine ? [...worldBufBoxes(), ...domInPicture([...FADE, "#pauseBtn", "#banner", "#toast"], true)] : [], placed = [];
    const measure = (t, px) => { ctx.font = `${Math.round(px * k)}px 'Pixelify Sans', 'Courier New', monospace`; return ctx.measureText(t).width / k; };
    const boxOf = (t, x, y, px) => { px = Math.max(px, minPx); const w = measure(t, px); x = clamp(x, w / 2 + 1, VIEW_W - w / 2 - 1); return { t, x, y, px, b: { x: x - w / 2 - 0.5, y: y - px * 0.8, w: w + 1, h: px } }; };
    const score = c => { let s = 0; for (const o of solid) s += overlapArea(c.b, o); for (const o of placed) s += overlapArea(c.b, o) * 2; return s; };
    for (const [t0, x0, y0, px0, color, kind] of HI) {
      let pick = boxOf(t0, x0, y0, px0);
      if (solid.length && score(pick) > 0) {
        const cands = [];
        if (kind === "pop") {
          for (const dy of [0, -9, 9, -18, 18, -27]) for (const dx of [0, 14, -14, 28, -28, 42, -42]) cands.push([t0, x0 + dx, y0 + dy, px0]);
          cands.push([t0, x0, y0, Math.max(6, px0 - 2)]);
        } else {
          for (let px = px0; px >= Math.min(px0, 5); px--) cands.push([t0, x0, y0, px]);
          for (const dx of [-30, 30, -60, 60, -90, 90]) cands.push([t0, x0 + dx, y0, Math.min(px0, 6)]);
          for (const dy of [-8, 8, -16, 16, -24, 24, -36, 36, -48, 48]) for (const dx of [0, -24, 24]) cands.push([t0, x0 + dx, y0 + dy, 5]);
          for (let n = t0.length - 1; n >= 4; n--) cands.push([t0.slice(0, n).trimEnd() + "…", x0, y0, 5]);
        }
        let bestS = score(pick);
        for (const c of cands) { const b = boxOf(...c), s = score(b); if (s < bestS) { pick = b; bestS = s; if (!s) break; } }
      }
      placed.push(pick.b);
      const { t, x, y, px } = pick;
      ctx.font = `${Math.round(px * k)}px 'Pixelify Sans', 'Courier New', monospace`;
      HI_LAST.push({ text: t, x: pick.b.x, y: pick.b.y, w: pick.b.w, h: pick.b.h, kind });
      const X = VP.ox + x * k, Y = VP.oy + y * k;
      ctx.fillStyle = "#1b1633"; ctx.fillText(t, Math.round(X + k * 0.75), Math.round(Y + k * 0.75)); ctx.fillStyle = color; ctx.fillText(t, Math.round(X), Math.round(Y));
    }
    HI.length = 0;
  };

  // the battle log takes the first open spot: between the foes and the heroes, under the turn order, or top right
  const _placeB = placeOverlays;
  placeOverlays = function () {
    _placeB();
    const el = $("blog");
    if (!battle || mode !== "battle" || !shown(el)) return;
    const cr = canvas.getBoundingClientRect(), s = VP.k * cr.width / canvas.width, d = cr.width / canvas.width;
    const css = b => ({ x: cr.left + VP.ox * d + b.x * s, y: cr.top + VP.oy * d + b.y * s, w: b.w * s, h: b.h * s });
    const avoid = [...battle.heroes.filter(h => alive(h)), ...battle.foes.filter(f => !f.dead)].map(u => css(spriteBox(u)));
    for (const t of HI_LAST) avoid.push(css(t));
    for (const q of BL_PANELS) for (const e of document.querySelectorAll(q)) if (shown(e)) avoid.push(e.getBoundingClientRect());
    const host = el.offsetParent || document.body, hr = host.getBoundingClientRect();
    el.style.transform = "none";
    const r0 = el.getBoundingClientRect(), w = r0.width, h = r0.height;
    const foeLow = Math.max(0, ...battle.foes.filter(f => !f.dead).map(f => { const b = unitBlock(f); return b.y + b.h; }));
    const heroTop = Math.min(VIEW_H, ...battle.heroes.filter(x => alive(x)).map(x => spriteBox(x).y));
    const midY = cr.top + VP.oy * d + ((foeLow + heroTop) / 2) * s;
    const topBar = Math.max(cr.top + 8, ...["#turnbar", "#fury", "#pauseBtn"].map(q => $(q.slice(1))).filter(shown).map(e => e.getBoundingClientRect().bottom)) + 4;
    const cands = [[cr.left + cr.width / 2 - w / 2, midY - h / 2], [cr.left + 8, topBar], [cr.right - w - 8, topBar],
      [cr.left + 8, midY - h / 2], [cr.right - w - 8, midY - h / 2], [cr.left + cr.width / 2 - w / 2, topBar]];
    let best = cands[0], bestS = Infinity;
    for (const [x, y] of cands) {
      const b = { x, y, w, h }; let sc = 0; for (const a of avoid) sc += overlapArea(b, { x: a.x, y: a.y, w: a.width ?? a.w, h: a.height ?? a.h });
      if (sc < bestS) { best = [x, y]; bestS = sc; if (!sc) break; }
    }
    el.style.left = Math.round(best[0] - hr.left) + "px"; el.style.top = Math.round(best[1] - hr.top) + "px";
  };

  // the compact phone menu has no room for a description under every button; the selected one gets a line
  const compactUI = matchMedia("(pointer:coarse),(max-width:700px),(max-height:500px)");
  const _renderMenuB = renderMenu;
  renderMenu = function () {
    _renderMenuB();
    if (!battle || !menuState || !compactUI.matches) return;
    const it = menuItems()[menuState.sel];
    if (it && it.sub) $("menu").insertAdjacentHTML("beforeend", `<div class="mdesc">${it.sub}</div>`);
  };
  blCss.textContent += ".menu .mdesc{grid-column:1/-1;font-size:10px;color:var(--muted);line-height:1.25}";

  // a battle never starts under an open dialogue box, and no toast (tips included) lands on the fight:
  // it waits and shows when the battle is over
  const _startBattleB = startBattle;
  startBattle = function (...a) {
    if (dlg) closeDialogFor(null);
    const tEl = $("toast"); if (shown(tEl)) { const tx = tEl.textContent; tEl.hidden = true; setTimeout(() => toast(tx), 0); }
    return _startBattleB(...a);
  };
  const _toastBL = toast;
  toast = function (text) {
    if (battle) { const tx = text; const later = () => { if (battle) setTimeout(later, 500); else _toastBL(tx); }; setTimeout(later, 500); return; }
    _toastBL(text);
  };

  // ---- the same art out in the world: roaming monsters and the bosses waiting for you, drawn small into the picture
  const bossIdBySprite = {};
  for (const [id, M] of Object.entries(MONSTERS)) if (M.boss && !bossIdBySprite[M.sprite]) bossIdBySprite[M.sprite] = id;
  function worldArt(g2, id, x, y, sc) {
    const M = MONSTERS[id]; const A = M && bossArtFor({ id, sprite: M.sprite }); if (!A) return 0;
    const fr = artFrame(A, A.key, Math.floor(((time * 1.1 + x * 0.013) % 1 + 1) % 1 * ART_FRAMES), false), w = A.w * sc, h = A.h * sc;
    g2.fillStyle = "rgba(20,14,40,.32)"; g2.beginPath(); g2.ellipse(x, y + 1, Math.max(6, w * 0.32), 2.6, 0, 0, Math.PI * 2); g2.fill();
    const sm = g2.imageSmoothingEnabled; g2.imageSmoothingEnabled = true; g2.drawImage(fr, Math.round(x - w / 2), Math.round(y - h + 1), Math.round(w), Math.round(h)); g2.imageSmoothingEnabled = sm;
    return h;
  }
  const _drawFieldMonsterArt = drawFieldMonster;
  drawFieldMonster = function (g2, f, x, y) {
    x = Math.round(x); y = Math.round(y);
    const bob = Math.round(Math.abs(Math.sin(f.t * 5)) * 1.5), h = worldArt(g2, f.group[0], x, y - bob, 0.44);
    if (!h) return _drawFieldMonsterArt(g2, f, x, y);
    if (f.elite) { g2.fillStyle = "#ffcf4a"; const cy = Math.round(y - h - 4 - bob); g2.fillRect(x - 3, cy, 7, 2); g2.fillRect(x - 3, cy - 2, 1, 2); g2.fillRect(x, cy - 2, 1, 2); g2.fillRect(x + 3, cy - 2, 1, 2); }
  };
  const _drawMiniBossArt = drawMiniBoss;
  drawMiniBoss = function (g2, x, y, kind) { const id = bossIdBySprite[kind]; if (!id || !worldArt(g2, id, Math.round(x), Math.round(y), 0.36)) _drawMiniBossArt(g2, x, y, kind); };

  // ---- the Bestiary shows each monster you have beaten as it looks in battle; portraits are painted a few at a time
  const beastCss = document.createElement("style");
  beastCss.textContent = "li.beast{display:flex;gap:10px;align-items:center;list-style:none;margin:6px 0}li.beast img{flex:none;width:64px;height:64px;object-fit:contain;background:rgba(0,0,0,.25);border:1px solid var(--edge);border-radius:6px}li.beast img:not([src]){visibility:hidden}";
  document.head.appendChild(beastCss);
  const portraitCache = {};
  const _renderJournalArt = renderJournal;
  renderJournal = function () {
    _renderJournalArt();
    const imgs = [...document.querySelectorAll("#journalBody img[data-mon]")];
    const step = () => { const t0 = performance.now(); while (imgs.length && performance.now() - t0 < 12) { const im = imgs.shift(), id = im.dataset.mon, M = MONSTERS[id], A = M && bossArtFor({ id, sprite: M.sprite }); if (!A) continue; im.src = portraitCache[id] || (portraitCache[id] = artFrame(A, A.key, 0, false).toDataURL()); } if (imgs.length && mode === "journal") setTimeout(step, 16); };
    step();
  };

