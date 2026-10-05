  // ================================================================== SANDSTORMS AND MIRAGES
  // Out on the Glass Flats a salt-storm blows up now and then. Visibility drops, and in the blowing salt
  // Sable sees people who aren't there. Walk up to a mirage and it speaks once, then is gone.
  let storm = null, stormWait = 150 + Math.random() * 120, mirage = null;
  const inFlats = () => { const tx = Math.floor(G.px / TILE), ty = Math.floor(G.py / TILE), r = REGIONS.find(r => tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1); return regionOf(tx, ty) === "old" && r && (r.name === "The Glass Flats" || r.name === "Gates of Oru"); };
  const MIRAGES = [
    { id: "mother", when: () => true, look: { robe: "#2a2240", hair: "#3a2a2a", skin: "#e8b48a", style: { hair: "long", dress: true } }, who: "A woman in a cyan scarf", text: "Stay on the rock, love. Someone will come. Someone always comes for the ones who stay." },
    { id: "rook", when: () => (G.flags.fallen || []).includes("rook"), look: () => HEROES.rook.look, who: "Rook", text: "Stop looking back, courier. I spent the bullet on the right thing. First time in my life." },
    { id: "maru", when: () => (G.flags.fallen || []).includes("maru"), look: () => HEROES.maru.look, who: "Maru", text: "(She is humming four notes.) You can hold both, remember? The grief and the going on. Go on." },
    { id: "ren", when: () => (G.flags.fallen || []).includes("ren"), look: () => HEROES.ren.look, who: "Ren", text: "The fine is paid. All of them. Tell the gate I said so." },
    { id: "pell", when: () => G.flags.wyrmDead, look: { robe: "#6b3f24", hair: "#3a2a1e", skin: "#d9a070", style: { hair: "fringe" } }, who: "A boy with a satchel", text: "Tell Tam I'm not scared any more. Tell her the satchel's hers now. She was always faster." },
    { id: "child", when: () => G.flags.ledgerTreeDead, look: { robe: "#8a7a6a", hair: "#5a3a2a", skin: "#d9a070", style: { hair: "bun" } }, who: "A small girl holding a hand that isn't there", text: "Mama says thank you for saying my name. She says it sounds nicer when somebody who isn't sad says it." },
    { id: "king", when: () => G.flags.kingDead, look: { robe: "#3a5a6a", hair: "#c8d8e0", skin: "#8ab0b8", style: { hair: "long", beard: true } }, who: "A tired old man with a crown under his arm", text: "I asked who sings for the ones below. You did. I'm sleeping now. It's warmer than I remembered." },
    { id: "self", when: () => G.stage >= 6, look: () => HEROES.sable.look, who: "Sable, age seventeen", text: "(She's soaked with rain, holding a broken bottle.) You never dropped a package? Liar. ...It's all right. I forgive you. Somebody had to." },
  ];
  const _updateS = update;
  update = function (dt) {
    _updateS(dt);
    if (!G || mode !== "play" || G.flags.epilogue || G.stage < 1) return;
    const flats = inFlats();
    if (storm) {
      storm.t += dt;
      if (storm.t >= storm.dur || !flats) { storm = null; mirage = null; stormWait = 180 + Math.random() * 150; return; }
      if (!mirage && storm.t > 5 && storm.t < storm.dur - 6) {
        const seen = G.flags.mirages || [], pool = MIRAGES.filter(m => m.when() && !seen.includes(m.id));
        if (pool.length) { const m = pool[0], a = Math.random() * Math.PI * 2; for (let k = 0; k < 8; k++) { const x = G.px + Math.cos(a + k) * 70, y = G.py + Math.sin(a + k) * 50; if (!blocked(x, y)) { mirage = { m, x, y, t: 0 }; break; } } }
      }
      if (mirage) { mirage.t += dt; if (Math.hypot(G.px - mirage.x, G.py - mirage.y) < 26) { G.flags.mirages = [...(G.flags.mirages || []), mirage.m.id]; banterQ = [[mirage.m.who, mirage.m.text]]; banterT = 0; mirage = null; save(); } }
    } else if (flats) {
      stormWait -= dt;
      if (stormWait <= 0) { storm = { t: 0, dur: 40 + Math.random() * 20 }; toast("A salt-storm is blowing in off the Flats."); }
    }
  };
  const _renderWorldS = renderWorld;
  renderWorld = function () {
    _renderWorldS();
    if (!storm) return;
    const k = clamp(Math.min(storm.t / 4, (storm.dur - storm.t) / 4), 0, 1), ox = Math.round(camX), oy = Math.round(camY);
    if (mirage) {
      const lk = typeof mirage.m.look === "function" ? mirage.m.look() : mirage.m.look;
      g.globalAlpha = 0.25 + 0.2 * Math.sin(time * 3) * Math.sin(time * 1.3);
      drawPerson(g, mirage.x - ox, mirage.y - oy, { ...lk, dir: G.px < mirage.x ? "left" : "right", walking: false, glowEyes: false });
      g.globalAlpha = 1;
    }
    lg.globalCompositeOperation = "source-over"; lg.clearRect(0, 0, VIEW_W, VIEW_H); lg.fillStyle = `rgba(214,190,150,${0.72 * k})`; lg.fillRect(0, 0, VIEW_W, VIEW_H);
    lg.globalCompositeOperation = "destination-out";
    const cx = G.px - ox, cy = G.py - oy - 8, r = 64, gr = lg.createRadialGradient(cx, cy, 8, cx, cy, r); gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(1, "rgba(0,0,0,0)"); lg.fillStyle = gr; lg.fillRect(cx - r, cy - r, r * 2, r * 2);
    g.drawImage(light, 0, 0);
    if (!REDUCED) { g.fillStyle = `rgba(240,225,195,${0.55 * k})`; for (let i = 0; i < 90; i++) { const x = (hash(i, 31) * (VIEW_W + 80) + time * (260 + hash(i, 33) * 140)) % (VIEW_W + 80) - 40, y = (hash(i, 35) * VIEW_H + Math.sin(time * 2 + i) * 6) % VIEW_H; g.fillRect(Math.round(x), Math.round(y), 3 + ((i % 3) * 2), 1); } }
  };
  ACHIEVEMENTS.push(["mirage", "Somebody Always Comes", "Meet five mirages in the salt-storms.", () => (G.flags.mirages || []).length >= 5]);

