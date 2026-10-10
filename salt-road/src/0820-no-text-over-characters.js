  // ================================================================== NO TEXT OVER CHARACTERS
  // 1. Viewport inset: when a panel covers the bottom of the screen (dialogue, cutscene captions, scene lines),
  //    the picture is drawn smaller above it instead of behind it, so nobody is ever under the text.
  // 2. World overlays (HUD panels, corner buttons, minimap) fade while a character is under them, and toasts and
  //    the area banner move to whichever of two spots covers nobody.
  const VP = { ox: 0, oy: 0, k: 1, inset: false };
  const shown = el => el && !el.hidden && !el.closest("[hidden]") && el.getBoundingClientRect().height > 1;
  function coveringPanel() {
    if (battle || mode === "title") return null;
    if (cine) return shown(cineBox) ? cineBox : null;
    if (mode === "dialog") return shown($("dialog")) ? $("dialog") : null;
    if (mode === "scene" && shown(banterEl)) return banterEl;
    return null;
  }
  function computeVP() {
    const kFull = canvas.width / VIEW_W, panel = coveringPanel();
    VP.ox = 0; VP.oy = 0; VP.k = kFull; VP.inset = false;
    if (!panel) return;
    const cr = canvas.getBoundingClientRect(), dev = canvas.width / cr.width;
    const topDev = (panel.getBoundingClientRect().top - cr.top) * dev - 6 * dev;          // a little air above the panel
    if (topDev >= canvas.height - 1) return;
    const k = Math.max(0.5, Math.min(kFull, topDev / VIEW_H));
    const kSnap = Math.floor(k);                                                             // whole device pixels keep the art crisp
    VP.k = kSnap >= 1 && kSnap / k > 0.8 ? kSnap : k;
    VP.ox = Math.round((canvas.width - VIEW_W * VP.k) / 2); VP.oy = Math.max(0, Math.round((topDev - VIEW_H * VP.k) / 2));
    VP.inset = true;
  }
  const _drawImageVP = ctx.drawImage.bind(ctx);
  ctx.drawImage = function (img, ...a) {
    if (img === buf && VP.inset) {
      const full = a.length === 4 ? a[0] === 0 && a[1] === 0 && a[2] === canvas.width && a[3] === canvas.height
        : a.length === 8 && a[4] === 0 && a[5] === 0 && a[6] === canvas.width && a[7] === canvas.height;
      if (full) {
        ctx.fillStyle = "#0b0916"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const d = [VP.ox, VP.oy, VIEW_W * VP.k, VIEW_H * VP.k];
        return a.length === 4 ? _drawImageVP(img, ...d) : _drawImageVP(img, a[0], a[1], a[2], a[3], ...d);
      }
    }
    return _drawImageVP(img, ...a);
  };
  flushHiText = function () {   // same as before, but in the inset picture's coordinates
    if (!HI.length) return;
    const k = VP.k; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    HI_LAST.length = 0;
    for (const [t, x, y, px, c] of HI) {
      ctx.font = canvasFont(Math.round(px * k));
      const tw = ctx.measureText(t).width / k; HI_LAST.push({ text: t, x: x - tw / 2, y: y - px * 0.8, w: tw, h: px });
      const X = VP.ox + x * k, Y = VP.oy + y * k;
      ctx.fillStyle = "#1b1633"; ctx.fillText(t, Math.round(X + k * 0.75), Math.round(Y + k * 0.75)); ctx.fillStyle = c; ctx.fillText(t, Math.round(X), Math.round(Y));
    }
    HI.length = 0;
  };
  // screen boxes of characters in the world, in CSS pixels (used for fading overlays and by the layout audit)
  function worldCharBoxes() {
    const cr = canvas.getBoundingClientRect(), s = VP.k * cr.width / canvas.width, o = [cr.left + VP.ox * cr.width / canvas.width, cr.top + VP.oy * cr.width / canvas.width];
    const box = (x, y, w, h, name) => ({ name, x: o[0] + x * s, y: o[1] + y * s, w: w * s, h: h * s });
    return worldBufBoxes().map(b => box(b.x, b.y, b.w, b.h, b.name));
  }
  function worldBufBoxes() {   // the same, in picture units
    const out = [{ x: G.px - camX - 7, y: G.py - camY - 26, w: 14, h: 26, name: "player" }];
    for (const n of NPCS) if (npcVisible(n)) { const x = n.px - camX, y = n.py - camY; if (x > -8 && x < VIEW_W + 8 && y > 0 && y < VIEW_H + 20) out.push({ x: x - 7, y: y - 26, w: 14, h: 26, name: "npc:" + n.id }); }
    return out;
  }
  const rectOf = e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const hitRect = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const FADE = ["#hud > div", "#corner button", "#minimap"];
  function placeOverlays() {
    const world = !battle && (mode === "play" || mode === "dialog" || mode === "scene");
    const chars = world && G ? worldCharBoxes() : [];
    for (const q of FADE) for (const el of document.querySelectorAll(q)) {
      const over = world && (mode !== "play" || chars.some(c => hitRect(c, rectOf(el))));
      el.style.transition = "opacity .2s"; el.style.opacity = over ? "0.12" : ""; el.dataset.faded = over ? "1" : "";
    }
    // toasts and the area banner take the open spot nearest their usual place: clear of every character, the
    // dialogue box and the panels that stay solid
    const cr = canvas.getBoundingClientRect();
    const solid = [...chars, ...FADE.flatMap(q => [...document.querySelectorAll(q)]).filter(e => shown(e) && e.dataset.faded !== "1").map(rectOf)];
    for (const q of ["#dialog"]) if (shown($(q.slice(1)))) solid.push(rectOf($(q.slice(1))));
    if (shown(banterEl) && mode !== "play") solid.push(rectOf(banterEl));
    const placedOv = [];
    if (!(mode === "play" && !battle)) { banterEl.style.top = ""; banterEl.style.bottom = "48px"; }
    for (const [el, home] of [[$("banner"), 0.13], [$("toast"), 0.24], ...(mode === "play" && !battle ? [[banterEl, 0.8]] : [])]) {
      if (!shown(el)) continue;
      if (el === banterEl) el.style.bottom = "auto";
      const host = el.offsetParent || document.body, hr = host.getBoundingClientRect();
      el.style.width = ""; el.style.left = "50%";   // measure at the usual centred spot, then keep that size wherever it goes
      const { w, h } = rectOf(el), others = [...solid, ...placedOv];
      el.style.width = Math.ceil(w) + "px"; el.style.boxSizing = "border-box";
      const cands = [];
      for (let fy = 0.04; fy <= 0.9; fy += 0.04) for (const fx of [0.5, 0.3, 0.7, 0.15, 0.85]) {
        const x = clamp(cr.left + cr.width * fx - w / 2, cr.left + 6, cr.right - w - 6), y = cr.top + cr.height * fy;
        if (y + h > cr.bottom - 4) continue;
        cands.push({ x, y, d: Math.abs(fy - home) * 3 + Math.abs(fx - 0.5) });
      }
      // taller than the picture (a long toast on an upright phone): it sits at the top, over whatever is there
      const tall = !cands.length;
      if (tall) cands.push({ x: clamp(cr.left + cr.width / 2 - w / 2, cr.left + 6, Math.max(cr.left + 6, cr.right - w - 6)), y: cr.top + 4, d: 0 });
      cands.sort((a, b) => a.d - b.d);
      const free = tall ? cands[0] : cands.find(c => !others.some(o => hitRect({ x: c.x, y: c.y, w, h }, o)));
      const pick = free || cands[0];
      // nowhere clear (a crowded dialogue on a phone): the toast waits out of sight, and its clock waits with it
      el.style.visibility = free ? "" : "hidden";
      if (!free && el.id === "toast") toastTimer = Math.max(toastTimer, 0.5);
      el.style.left = Math.round(pick.x + w / 2 - hr.left) + "px"; el.style.top = Math.round(pick.y - hr.top) + "px";   // both are centred with translateX(-50%)
      if (free) placedOv.push({ x: pick.x, y: pick.y, w, h });
    }
  }
  const _renderVP = render;
  render = function () { HI_LAST.length = 0; computeVP(); _renderVP(); placeOverlays(); };

