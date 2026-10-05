  // ================================================================== DAY AND NIGHT
  // An eight-minute day. At night the salt goes dark, lamps and windows glow, a vendor opens in Kessa,
  // and pale things come out to hunt. Resting at night sleeps until dawn.
  const DAY_LEN = 480;
  const sunOf = c => Math.sin(Math.PI * 2 * c);
  const nightness = () => { const c = G && G.clock !== undefined ? G.clock : 0.3; return clamp(-sunOf(c) * 1.4 + 0.15, 0, 1); };
  const isNight = () => nightness() > 0.5;
  const timeLabel = () => { const c = G.clock ?? 0.3; return c < 0.08 ? "dawn" : c < 0.42 ? "day" : c < 0.55 ? "dusk" : c < 0.95 ? "night" : "dawn"; };
  const _updateN = update;
  let wasNight = null;
  update = function (dt) {
    _updateN(dt);
    if (!G || mode !== "play" || G.flags.epilogue === "crown") return;
    G.clock = ((G.clock ?? 0.3) + dt / DAY_LEN) % 1;
    const n = isNight();
    if (wasNight !== null && n !== wasNight) { spawnField(); toast(n ? "Night falls. Lamps are lit, and something pale is moving on the salt." : "Dawn. The pale things are gone, for now."); }
    wasNight = n;
  };
  const OUTDOOR_SKIP = new Set([T.DARK, T.ABYSS, T.SPIRE, T.FLOOR]);
  const _renderWorldN = renderWorld;
  renderWorld = function () {
    _renderWorldN();
    const nt = nightness(), here = tileAt(G.px, G.py);
    if (OUTDOOR_SKIP.has(here)) return;
    const c = G.clock ?? 0.3, s = sunOf(c);
    const duskA = clamp(0.16 - Math.abs(s) * 0.5, 0, 0.16); if (duskA > 0) { g.fillStyle = `rgba(255,120,60,${duskA})`; g.fillRect(0, 0, VIEW_W, VIEW_H); }
    if (nt <= 0.02) return;
    const ox = Math.round(camX), oy = Math.round(camY);
    lg.globalCompositeOperation = "source-over"; lg.clearRect(0, 0, VIEW_W, VIEW_H); lg.fillStyle = `rgba(8,10,34,${0.74 * nt})`; lg.fillRect(0, 0, VIEW_W, VIEW_H);
    lg.globalCompositeOperation = "destination-out";
    const hole = (x, y, r, a) => { if (x < -r || y < -r || x > VIEW_W + r || y > VIEW_H + r) return; const gr = lg.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); lg.fillStyle = gr; lg.fillRect(x - r, y - r, r * 2, r * 2); };
    hole(G.px - ox, G.py - oy - 8, 58 + Math.sin(time * 8) * 1.5, 0.95);
    for (const pr of PROPS) if (pr.type === "lamp" || pr.type === "campfire" || pr.type === "candles" || pr.type === "shrine") hole(pr.px - ox, pr.py - oy - 12, pr.type === "lamp" ? 34 : 26, 0.85);
    const tx0 = Math.floor(ox / TILE), ty0 = Math.floor(oy / TILE);
    const lit = [];
    for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / TILE) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / TILE) + 1; tx++) {
      const t = get(tx, ty); if (t === T.DOOR || t === T.FOUNTAIN || t === T.WELL) { hole(tx * TILE + 8 - ox, ty * TILE + 8 - oy, t === T.DOOR ? 20 : 16, 0.7); if (t === T.DOOR) lit.push([tx * TILE + 8 - ox, ty * TILE + 4 - oy]); }
    }
    for (const n of NPCS) if (n.show === undefined || n.show()) hole(n.px - ox, n.py - oy - 10, 14, 0.5);
    for (const f of field) if (f.night) hole(f.px - ox, f.py - oy - 10, 16, 0.6);
    if (typeof sceneLights === "function") for (const a of sceneLights()) hole(a.px - ox + 7, a.py - oy - 22 - (a.lift || 0), a.torch ? 40 : 22, 0.9);
    g.drawImage(light, 0, 0);
    g.globalCompositeOperation = "lighter";
    for (const [x, y] of lit) { const gr = g.createRadialGradient(x, y, 1, x, y, 14); gr.addColorStop(0, `rgba(255,180,90,${0.28 * nt})`); gr.addColorStop(1, "rgba(255,180,90,0)"); g.fillStyle = gr; g.fillRect(x - 14, y - 14, 28, 28); }
    if (nt > 0.6) for (let i = 0; i < 24; i++) { const a = (0.3 + 0.3 * Math.sin(time * 2 + i * 1.7)) * nt; g.fillStyle = `rgba(200,220,255,${a})`; g.fillRect((hash(i, 71) * VIEW_W) | 0, (hash(i, 73) * VIEW_H * 0.4) | 0, 1, 1); }
    g.globalCompositeOperation = "source-over";
  };

  // night hunts: pale packs that only walk after dark, and stay dead once killed
  Object.assign(MONSTERS, {
    nightwraith: { name: "Night Wraith", hp: 50, atk: 12, def: 4, spd: 11, xp: 60, coin: [10, 16], sprite: "ghoul",
      pal: { "#e8e2f0": "#bfe8ff", "#d8d0e6": "#8ab8d8", "#a3242e": "#2a6aff", "#f2ead8": "#e8ffff", "#5a0f18": "#0a1a4a" },
      moves: [{ name: "Cold Hand", w: 3, power: 1.2, weakOne: 2 }, { name: "Wail", w: 1, power: 0.7, all: true }, { name: "Drink Warmth", w: 2, power: 1.0, drain: 0.6 }] },
    moonmother: { name: "The Moon-Mother", hp: 260, atk: 21, def: 6, spd: 9, xp: 220, coin: [60, 60], sprite: "ghoul",
      pal: { "#e8e2f0": "#f0f0ff", "#d8d0e6": "#c0c0e8", "#a3242e": "#e8e8ff", "#f2ead8": "#ffffff", "#5a0f18": "#3a3a8a" },
      moves: [{ name: "Lullaby of Salt", w: 2, power: 0.8, all: true, stunChance: 0.15 }, { name: "Embrace", w: 3, power: 1.5, drain: 0.5 }, { name: "Call the Pale", w: 1, summonKind: "nightwraith", summonText: "The Moon-Mother opens her arms. Pale shapes rise out of the salt to fill them." }] },
  });
  BESTIARY.nightwraith = "The dead of the salt who were never buried. They walk at night looking for warmth, and take it from whoever they find.";
  BESTIARY.moonmother = "The first of the Wraiths: a woman who walked into the Flats at night four hundred years ago to find her children. She is still looking. She thinks you might be them.";
  const NIGHT_HUNTS = [
    { id: "n1", x: 26, y: 33, group: ["nightwraith", "nightwraith"], minStage: 2 }, { id: "n2", x: 50, y: 22, group: ["nightwraith", "nightwraith", "nightwraith"], minStage: 3 },
    { id: "n3", x: 44, y: 44, group: ["nightwraith", "ghoul", "nightwraith"], minStage: 4 }, { id: "n4", x: 20, y: 70, group: ["nightwraith", "nightwraith", "bogghoul"], minStage: 8 },
    { id: "n5", x: 100, y: 72, group: ["nightwraith", "nightwraith", "nightwraith"], minStage: 9 }, { id: "n6", x: 27, y: 2, group: ["moonmother", "nightwraith"], minStage: 5, elite: true },
  ];
  const walkableNear = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const t = get(x + dx, y + dy); if ([T.SALT, T.SAND, T.GRASS, T.MUD, T.SHALLOW, T.PATH].includes(t)) return [x + dx, y + dy]; } return [x, y]; };
  const _spawnFieldN = spawnField;
  spawnField = function () {
    _spawnFieldN();
    if (!G.flags.epilogue && isNight()) for (const h of NIGHT_HUNTS) {
      if (G.defeated.includes(h.id) || G.stage < h.minStage) continue;
      const [x, y] = walkableNear(h.x, h.y);
      field.push({ ...h, x, y, night: true, px: x * TILE + 8, py: y * TILE + 8, hx: x * TILE + 8, hy: y * TILE + 8, t: hash(x, y) * 10, cool: 0 });
    }
  };
  const _drawFM2b = drawFieldMonster2b;
  drawFieldMonster2b = function (g2, f, lead, x, y, bobv) {
    if (!f.night) return _drawFM2b(g2, f, lead, x, y, bobv);
    const P = (a, b, w, h, c) => { g2.fillStyle = c; g2.fillRect(x + a, y + b, w, h); }, fl = Math.round(Math.sin(time * 3 + f.t) * 2), big = f.group[0] === "moonmother";
    g2.globalAlpha = 0.8;
    P(-6, -22 + fl - (big ? 6 : 0), 12, 18 + (big ? 6 : 0), "#1b1633"); P(-5, -21 + fl - (big ? 6 : 0), 10, 16 + (big ? 6 : 0), big ? "#f0f0ff" : "#bfe8ff");
    for (let i = 0; i < 4; i++) P(-5 + i * 3, -5 + fl + ((i + Math.floor(time * 6)) % 2), 2, 3, big ? "#c0c0e8" : "#8ab8d8");
    P(-3, -17 + fl - (big ? 6 : 0), 2, 2, big ? "#3a3a8a" : "#2a6aff"); P(1, -17 + fl - (big ? 6 : 0), 2, 2, big ? "#3a3a8a" : "#2a6aff"); P(-2, -12 + fl - (big ? 6 : 0), 4, 2, "#0a1a4a");
    if (big) { P(-8, -30 + fl, 16, 3, "#e8e8ff"); P(-7, -34 + fl, 2, 4, "#e8e8ff"); P(5, -34 + fl, 2, 4, "#e8e8ff"); }
    g2.globalAlpha = 1; return true;
  };
  const _bossEndN = act2BossEndB;
  act2BossEndB = function (boss) { if (boss === "moonmother") { setTimeout(() => openDialog("moon_after"), 300); return; } return _bossEndN(boss); };
  const _startBattleN = startBattle;
  startBattle = function (group, opts = {}) { if (group && group[0] === "moonmother" && !opts.boss) opts = { ...opts, boss: "moonmother", area: "flats" }; return _startBattleN(group, opts); };

  // Mora, the night vendor
  npc2({ id: "mora", name: "Mora the Night Vendor", x: 18, y: 44, look: { robe: "#2a2a5a", hair: "#1a1a2a", skin: "#b88a64", style: { hair: "hood", hood: "#2a2a5a", dress: true, eye: "#e8c83a" } }, show: () => G.stage >= 2 && isNight() && !G.flags.epilogue });
  const mbuy = (id, price) => { if (G.coins < price) return; G.coins -= price; G.items[id] = (G.items[id] || 0) + 1; toast(`Bought ${ITEMS[id].name}`); Music.sound("item"); save(); updateHud(); };
  Object.assign(RELICS, { moonstone: { name: "Mora's Moonstone", from: "mora", desc: "+2 defence, +8% critical chance, +2 SP each turn.", def: 2, crit: 0.08, spRegen: 2 } });
  Object.assign(D, {
    mora_0: say("mora", "(A woman in a dark hood has spread a blanket under the lamp, covered in small bottles.) Only open at night. In the day, people haggle. At night they tell me what they need it for. It's a better way to do business.", "mora_1"),
    mora_1: say("mora", "I collected debts for the Guild for nine years. I was very good at it. Then one night a woman paid me with her dead son's shoes, because it was all she had, and I realised I'd been very good at something terrible.", "mora_2"),
    mora_2: say("mora", "So now I sell cheap, at night, to people who can't be seen buying. Medicine. Salts. Things for the dying. I'm not paying it back. You can't pay that back. I'm just... going the other way now, as far as I can.", "mora_shop", () => { G.flags.moraMet = true; save(); }),
    mora_shop: { who: "mora", text: "What do you need it for? (You don't have to answer. Most people do.)", choices: [
      { t: "Phoenix Salt (revive at full health): 26 coin", go: "mora_shop", act: () => mbuy("phoenix", 26), req: () => G.coins >= 26, reqText: "26 coin" },
      { t: "Storm Ether (12 SP): 9 coin", go: "mora_shop", act: () => mbuy("ether", 9), req: () => G.coins >= 9, reqText: "9 coin" },
      { t: "Greater Salve (heal 45): 11 coin", go: "mora_shop", act: () => mbuy("gsalve", 11), req: () => G.coins >= 11, reqText: "11 coin" },
      { t: "The moonstone on the corner of the blanket: 140 coin", go: "mora_stone", act: () => { G.coins -= 140; giveRelic("moonstone"); updateHud(); }, req: () => G.coins >= 140 && !(G.relics || []).includes("moonstone"), reqText: "140 coin, once" },
      { t: "\"What are the pale things on the salt?\"", go: "mora_wraith" },
      { t: "Goodnight.", go: null } ] },
    mora_stone: say("mora", "(She turns it over once in her fingers before she gives it up.) That was the shoes' price. I sold them, the next winter, to buy medicine for her other boy. He lived. I kept the stone I bought with what was left. Now it's yours. Go the other way with it."),
    mora_wraith: say("mora", "The unburied. The Flats are full of them. Four hundred years of people who walked out onto the salt and didn't come back. At night they come looking for someone warm. North, past the Cathedral, the first of them walks: a mother, still looking for her children. Be kind if you can. Be quick if you can't.", "mora_shop"),
    moon_after: say("sable", "(The Moon-Mother comes apart like frost in the sun. For a moment her face is only a face, tired and kind.) \"Oh,\" she says. \"You're not mine. But you're somebody's. Go home to them.\" (And then there's only salt, and a small silver ring.)", null, () => { G.flags.moonDone = true; G.coins += 40; save(); updateHud(); }),
  });
  const _dialogForN = dialogFor;
  dialogFor = function (n) { if (n.id === "mora") return G.flags.moraMet ? "mora_shop" : "mora_0"; return _dialogForN(n); };
  const _restN = restParty;
  restParty = function () { const n = isNight(); _restN(); if (n) { G.clock = 0.03; wasNight = false; spawnField(); toast("You sleep until dawn. Everyone is healed. Progress saved."); save(); } };
  const _pauseGameN = pauseGame;
  pauseGame = function () { _pauseGameN(); $("pauseStats").textContent += ` · ${timeLabel()}`; };
  // a fish that only bites after dark
  Object.assign(FISH, { mooneel: { name: "Moon Eel", where: "old", rare: 2, pay: 22, night: true, lore: "Silver-blue and faintly glowing. It only rises when the salt is dark. Old Hake says his wife used to call them 'the stars that fell in the pool'." } });
  FISH_IDS.push("mooneel");
  ACHIEVEMENTS.push(["night", "Be Kind If You Can", "Lay the Moon-Mother to rest.", () => G.flags.moonDone]);

