  // ================================================================== SUN SHAFTS, HEAT SHIMMER AND MOONLIGHT ON WATER
  // Light with a direction to it. By day, shafts of sun lean down through the green country and the Drowned Grove,
  // fixed to the land so they slide past as the courier walks. At midday on the Dry Sea, the dunes and the salt pans,
  // the air shimmers and the far edge of the view goes pale with heat. At night the water catches the moon in small
  // silver flecks. Reduced motion keeps the shafts still and drops the shimmer and the flecks; Effects: Light skips all three.
  const GREENISH = new Set(["The Drowned Grove", "The Drowning Marsh", "Reedholm", "The Reeds"]);
  const shaftSprite = (() => {   // one soft band of light, drawn once: bright down its middle, gone at its edges and its foot
    const c = document.createElement("canvas"); c.width = 48; c.height = 256; const g2 = c.getContext("2d");
    const across = g2.createLinearGradient(0, 0, 48, 0); across.addColorStop(0, "rgba(255,244,200,0)"); across.addColorStop(0.5, "rgba(255,244,200,1)"); across.addColorStop(1, "rgba(255,244,200,0)");
    g2.fillStyle = across; g2.fillRect(0, 0, 48, 256);
    g2.globalCompositeOperation = "destination-in";
    const down = g2.createLinearGradient(0, 0, 0, 256); down.addColorStop(0, "rgba(0,0,0,1)"); down.addColorStop(0.7, "rgba(0,0,0,0.5)"); down.addColorStop(1, "rgba(0,0,0,0)");
    g2.fillStyle = down; g2.fillRect(0, 0, 48, 256);
    return c; })();
  const sunUp = () => { const s = Math.sin(Math.PI * 2 * (G.clock ?? 0.3)); return Math.max(0, Math.min(1, s * 2.5)); };
  function shaftPass(ox, oy, strength) {
    FXN.shafts++;
    const cell = 90, sway = REDUCED ? 0 : time * 0.25;
    g.save(); g.globalCompositeOperation = "lighter";
    const c0 = Math.floor((ox * 0.6) / cell) - 2;
    for (let c = c0; c <= c0 + Math.ceil(VIEW_W / cell) + 4; c++) {
      if (hash(c * 5 + 3, 77) < 0.45) continue;
      const w = 18 + hash(c, 79) * 26, x = c * cell + hash(c, 81) * cell - ox * 0.6, a = strength * (0.16 + 0.06 * Math.sin(sway + c * 1.9));
      if (a <= 0.01 || x < -140 || x > VIEW_W + 60) continue;
      g.globalAlpha = a;
      g.setTransform(1, 0, -0.45, 1, x, -10);   // leaning with the sun, which stands in the east of a morning and the west by evening
      g.drawImage(shaftSprite, 0, 0, w, VIEW_H + 40);
    }
    g.setTransform(1, 0, 0, 1, 0, 0); g.restore();
  }
  const shimmerBuf = document.createElement("canvas"); shimmerBuf.width = VIEW_W; shimmerBuf.height = VIEW_H;
  const shg = shimmerBuf.getContext("2d");
  const heatHaze = (() => { const c = document.createElement("canvas"); c.width = 4; c.height = VIEW_H; const g2 = c.getContext("2d");
    const gr = g2.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, "rgba(255,236,200,0.22)"); gr.addColorStop(0.35, "rgba(255,236,200,0.06)"); gr.addColorStop(1, "rgba(255,236,200,0)");
    g2.fillStyle = gr; g2.fillRect(0, 0, 4, VIEW_H); return c; })();
  function shimmerPass(heat) {   // each band of rows slides a pixel to and fro, the upper (farther) rows the most
    FXN.shimmer++;
    shg.clearRect(0, 0, VIEW_W, VIEW_H); shg.drawImage(buf, 0, 0);
    for (let y = 0; y < VIEW_H; y += 3) {
      const depth = 1 - y / VIEW_H, dx = Math.round(Math.sin(time * 3.1 + y * 0.21) * Math.sin(time * 0.7 + y * 0.05) * 1.6 * heat * (0.35 + depth));
      if (dx) g.drawImage(shimmerBuf, 0, y, VIEW_W, 3, dx, y, VIEW_W, 3);
    }
    g.globalAlpha = heat; g.drawImage(heatHaze, 0, 0, VIEW_W, VIEW_H); g.globalAlpha = 1;
  }
  function moonPass(ox, oy, nt) {   // silver flecks on open water, each catching the moon for a moment
    FXN.moon++;
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE);
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE); ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE); tx++) {
      if (get(tx, ty) !== T.WATER) continue;
      for (let k = 0; k < 2; k++) {
        const ph = (time * 0.9 + hash(tx * 3 + k, ty) * 7) % 2.2; if (ph > 0.5) continue;
        const a = Math.sin(ph / 0.5 * Math.PI) * nt, x = tx * TILE - ox + 2 + Math.floor(hash(ty + k, tx) * 12), y = ty * TILE - oy + 2 + Math.floor(hash(tx + k * 5, ty + 3) * 12);
        g.fillStyle = `rgba(200,220,255,${0.75 * a})`; g.fillRect(x - 1, y, 3, 1);
        g.fillStyle = `rgba(240,248,255,${a})`; g.fillRect(x, y, 1, 1);
      }
    }
  }
  const _renderWorldLightHeat = renderWorld;
  renderWorld = function () {
    _renderWorldLightHeat();
    if (!G || fxLight() || mode === "battle" || battle) return;
    const tile = tileAt(G.px, G.py); if (OUTDOOR_SKIP.has(tile) || regionOf(Math.floor(G.px / TILE), Math.floor(G.py / TILE)) === "cistern") return;
    const ox = Math.round(camX), oy = Math.round(camY), place = placeAt(), sun = sunUp(), nt = nightness();
    const raining = G.stage >= 7 && !noRainAt(Math.floor(G.px / TILE), Math.floor(G.py / TILE));
    if (sun > 0.2 && !raining && (GREENISH.has(place) || tile === T.GRASS)) shaftPass(ox, oy, sun);
    const c = G.clock ?? 0.3, noon = Math.max(0, 1 - Math.abs(c - 0.25) / 0.12);   // strongest at noon, gone by mid-morning and mid-afternoon
    if (!REDUCED && !raining && SANDY.has(place) && noon > 0.05) shimmerPass(noon);
    if (!REDUCED && nt > 0.4) moonPass(ox, oy, nt);
  };
