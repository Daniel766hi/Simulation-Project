  // ================================================================== ARMS AND ARMOUR, HARDER ROADS, BOSS PHASES
  // Each hero has a weapon and an armour slot beside the relic. Gear comes in five tiers per weapon kind, sold by the
  // smiths (Odo in Kessa, Dov in Oru, Qasim on the Dry Sea) as the story opens up; buying fits it at once and trades
  // the old piece in for half its price. It shows in battle: the blade's metal and glow, the armour's trim and
  // pauldrons. Because gear can be bought, every monster is a quarter tougher than before (health and attack).
  // Bosses have a second phase: at half health they change, speak, grow stronger and faster, and ready their worst.
  const WCLASS = { sable: "sword", ilse: "hammer", maru: "focus", rook: "bow", ada: "focus", ren: "spear", kest: "flask", nell: "cutlass", warden: "core" };
  const ACLASS = { sable: "medium", ilse: "heavy", maru: "light", rook: "medium", ada: "light", ren: "heavy", kest: "light", nell: "medium", warden: "heavy" };
  const WNAMES = {
    sword: ["Salt-Iron Sword", "Riverglass Blade", "Guild Sabre", "Stormglass Edge", "Tidebreaker"], hammer: ["Smith's Maul", "Rivet Hammer", "Bellfounder", "Thunder Anvil", "Oru's Hammer"],
    bow: ["Reed Bow", "Horn Bow", "Guild Longbow", "Storm Recurve", "Heron's Reach"], spear: ["Watch Spear", "Ashwood Pike", "Gatewarden", "Stormpike", "Oath of Oru"],
    cutlass: ["Rusty Cutlass", "Brine Cutlass", "Corsair's Edge", "Gale Cutlass", "Maw's Tooth"], flask: ["Tin Flask", "Copper Still", "Glass Retort", "Storm Alembic", "Philosopher's Vessel"],
    focus: ["Reed Pipe", "Choir Bell", "Silver Hymnal", "Storm Tuning Fork", "First Rain's Note"], core: ["Salt Core", "Quartz Heart", "Guild Lodestone", "Stormglass Core", "Memory Crystal"],
  };
  const ANAMES = { light: ["Travel Cloak", "Padded Robe", "Warded Vestments", "Stormsilk", "Veil of the Nine"], medium: ["Leather Jerkin", "Studded Coat", "Guild Brigandine", "Stormscale", "Tide-Plate Coat"], heavy: ["Iron Vest", "Ring Mail", "Gate Plate", "Storm Plate", "Wall of Oru"] };
  const WATK = [2, 4, 7, 10, 14], WPRICE = [30, 70, 140, 240, 380], ADEF = [1, 2, 4, 6, 9], AHP = [6, 12, 20, 30, 44], APRICE = [25, 60, 120, 210, 340];
  const GEAR = {};
  for (const [cls, names] of Object.entries(WNAMES)) names.forEach((name, i) => {
    const a = WATK[i], st = cls === "hammer" ? { atk: Math.round(a * 1.25), spd: i >= 2 ? -1 : 0 } : cls === "bow" ? { atk: a, spd: i >= 1 ? 1 : 0 } : cls === "spear" ? { atk: a, def: Math.ceil(i / 2) }
      : cls === "cutlass" ? { atk: Math.round(a * 0.85), spd: 1 + (i >= 3 ? 1 : 0) } : cls === "flask" ? { atk: Math.round(a * 0.8), maxSp: 2 * (i + 1) } : cls === "focus" ? { atk: Math.round(a * 0.6), maxSp: 3 * (i + 1) }
      : cls === "core" ? { atk: Math.round(a * 0.8), def: i + 1 } : { atk: a };
    GEAR[`w_${cls}_${i + 1}`] = { name, slot: "weapon", cls, tier: i + 1, st, price: WPRICE[i] };
  });
  for (const [cls, names] of Object.entries(ANAMES)) names.forEach((name, i) => {
    const d = ADEF[i], st = cls === "heavy" ? { def: Math.round(d * 1.3), maxHp: Math.round(AHP[i] * 1.2), spd: i >= 2 ? -1 : 0 } : cls === "light" ? { def: Math.max(1, Math.round(d * 0.7)), maxHp: Math.round(AHP[i] * 0.8), maxSp: 2 * (i + 1) } : { def: d, maxHp: AHP[i] };
    GEAR[`a_${cls}_${i + 1}`] = { name, slot: "armor", cls, tier: i + 1, st, price: APRICE[i] };
  });
  const statText = st => Object.entries(st).filter(([, v]) => v).map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${{ atk: "ATK", def: "DEF", spd: "SPD", maxHp: "HP", maxSp: "SP" }[k]}`).join(", ");
  const gearOf = id => ((G.gear || {})[id]) || {};
  function applyGear(h, key, sign) {
    const g = GEAR[key]; if (!g) return;
    for (const [k, v] of Object.entries(g.st)) { if (!v) continue; h[k] += sign * v; }
    if (g.st.maxHp) h.hp = sign > 0 ? Math.min(h.maxHp, h.hp + g.st.maxHp) : Math.min(h.hp, h.maxHp);
    if (g.st.maxSp) h.sp = sign > 0 ? Math.min(h.maxSp, h.sp + g.st.maxSp) : Math.min(h.sp, h.maxSp);
    h.hp = Math.max(1, h.hp);
  }
  function fitGear(id, key) {   // buy and fit: the old piece goes back for half its price
    const g = GEAR[key], h = G.party[id]; if (!g || !h) return;
    G.gear = G.gear || {}; const cur = G.gear[id] || (G.gear[id] = {}), old = cur[g.slot], refund = old ? Math.floor(GEAR[old].price / 2) : 0;
    const cost = g.price - refund; if (G.coins < cost) return;
    G.coins -= cost; if (old) applyGear(h, old, -1); applyGear(h, key, 1); cur[g.slot] = key;
    Music.sound("item"); toast(`${h.name} takes the ${g.name}.${refund ? ` (${refund} coin back for the old one)` : ""}`); save(); updateHud();
  }
  const shopTier = () => G.stage >= 10 ? 5 : G.stage >= 7 ? 4 : G.stage >= 5 ? 3 : G.stage >= 3 ? 2 : 1;
  const nextGear = (id, slot) => { const cls = slot === "weapon" ? WCLASS[id] : ACLASS[id], have = GEAR[gearOf(id)[slot]], t = have ? have.tier : 0, top = shopTier(); return t < top ? `${slot === "weapon" ? "w" : "a"}_${cls}_${top}` : null; };   // the best in stock, not one step at a time
  // the shop: next piece for each fighter, weapon and armour; the node is refreshed in place after every purchase
  D.gear_shop = { who: "odo", text: "", choices: [] };
  function refreshGear(who, back) {
    const node = D.gear_shop, fighters = (G.active && G.active.length ? G.active : G.members).slice(0, 4);
    node.who = who; node.choices.length = 0;
    node.text = `${{ odo: "(Odo lays out what Ilse's forge can make.) Only the fighters get fitted, mind. Rest someone and bring someone else if you want them seen to.", dov: "(Dov clears the anvil.) Tell me who's fighting and I'll make it fit. The old kit I'll take back at half.", qasim: "(Qasim unrolls a cloth of blades and mail from the caravans.) Salt buys salt, courier. Coin buys the rest." }[who] || "Arms and armour."} (Best on offer now: tier ${shopTier()} of 5.)`;
    for (const id of fighters) for (const slot of ["weapon", "armor"]) {
      const key = nextGear(id, slot); if (!key || !WCLASS[id]) continue;
      const g = GEAR[key], old = gearOf(id)[slot], refund = old ? Math.floor(GEAR[old].price / 2) : 0, cost = g.price - refund;
      node.choices.push({ t: `${G.party[id].name}: ${g.name} (${statText(g.st)}) · ${cost} coin${refund ? ` after trade-in` : ""}`, go: "gear_shop", act: () => { fitGear(id, key); refreshGear(who, back); }, req: () => G.coins >= cost, reqText: `${cost} coin` });
    }
    if (!node.choices.length) node.text += " Your fighters already carry the best I have. Come back when the road opens further.";
    node.choices.push({ t: "That's all", go: back });
  }
  const gearChoice = (who, back) => ({ t: "Arms and armour, fitted to each fighter", go: "gear_shop", act: () => refreshGear(who, back) });
  if (D.odo_0 && D.odo_0.choices) D.odo_0.choices.splice(D.odo_0.choices.length - 1, 0, gearChoice("odo", "odo_0"));
  if (D.dov_0 && D.dov_0.choices) D.dov_0.choices.splice(D.dov_0.choices.length - 1, 0, gearChoice("dov", "dov_0"));
  if (D.qasim_0 && Array.isArray(D.qasim_0.choices)) D.qasim_0.choices.splice(Math.max(0, D.qasim_0.choices.length - 1), 0, gearChoice("qasim", "qasim_0"));
  // the party screen shows what each hero carries
  const _renderRosterG = renderRoster;
  renderRoster = function () {
    _renderRosterG();
    const cards = [...$("rosterList").children];
    G.members.forEach((id, i) => { const c = cards[i]; if (!c || !WCLASS[id]) return; const gr = gearOf(id), row = document.createElement("div"); row.className = "bondline";
      row.textContent = `Weapon: ${gr.weapon ? `${GEAR[gr.weapon].name} (${statText(GEAR[gr.weapon].st)})` : "the one they came with"} · Armour: ${gr.armor ? `${GEAR[gr.armor].name} (${statText(GEAR[gr.armor].st)})` : "travel clothes"}`;
      c.insertBefore(row, c.children[1] || null); });
  };
  // New Game+ carries coin, not fitted gear: at an ending the gear is sold back at half
  const _endingG = ending;
  ending = function (kind) {
    let back = 0; for (const [id, gr] of Object.entries(G.gear || {})) for (const slot of ["weapon", "armor"]) if (gr[slot] && G.party[id]) { applyGear(G.party[id], gr[slot], -1); back += Math.floor(GEAR[gr[slot]].price / 2); delete gr[slot]; }
    if (back) { G.coins += back; }
    return _endingG(kind);
  };
  // how gear looks on the battle figure: metal and glow by weapon tier, trim and pauldrons by armour tier
  const METAL = [null, { hi: "#cacee0", lo: "#6e7290" }, { hi: "#e8fcff", lo: "#8ab8c8", glow: null }, { hi: "#fff4b0", lo: "#b08a28" }, { hi: "#e8ffff", lo: "#3ee0e8", glow: "rgba(158,240,245,0.55)" }, { hi: "#dffff6", lo: "#28a896", glow: "rgba(110,255,220,0.6)" }];
  const gearTiers = id => { const gr = gearOf(id); return [gr.weapon ? GEAR[gr.weapon].tier : 0, gr.armor ? GEAR[gr.armor].tier : 0]; };
  // ---- a quarter tougher everywhere
  const _unitFromMonsterG = unitFromMonster;
  unitFromMonster = function (id, i, n) { const u = _unitFromMonsterG(id, i, n); u.maxHp = u.hp = Math.round(u.hp * 1.25); u.atk = Math.round(u.atk * 1.25); return u; };
  // ---- boss phases
  const PHASE2 = {
    butcher: ["Now I'm hungry.", "#c8182e"], mother: ["My children. Drink!", "#c07098"], choirmaster: ["Crescendo! All of you, sing!", "#ffcf4a"], voss: ["The Bell is mine. It rings for me!", "#3ee0e8"],
    hollis: ["The tide comes in. It always comes in!", "#3ee0c8"], quill: ["Audit complete. Seizing everything.", "#c8182e"], gulp: ["Croak! Swallow them whole!", "#a8b068"], maw: ["Down with the ship, then! All of us!", "#28a896"],
    colossus: ["We scream. We scream.", "#9ef0f5"], vela: ["Hear the storm. Hear it end you.", "#c8d8ff"], king: ["Then drown with us. All of you.", "#9ef0f5"], corvin: ["Every debt. Every name. Paid.", "#ffcf4a"],
    ledgertree: ["The interest is due.", "#ff2d2d"], tollkeeper: ["Final audit. No appeals.", "#ffcf4a"], oldmouth: ["Hunger.", "#3ee0e8"], wyrm: ["Hhhsssss!", "#e8ecf8"],
  };
  const OWN_PHASES = new Set(["hollis"]);
  function enterPhase2(f) {
    const [line] = PHASE2[f.id]; f.phase2 = time;
    // Hollis was built with phases of his own (the drowned at 60%, the Tide at 30%, which hits a quarter harder):
    // he still transforms, but without the extra strength on top, which made him harder than the Drowned King
    if (!OWN_PHASES.has(f.id)) { f.atk = Math.round(f.atk * 1.2); f.def += 2; f.spd += 2; }
    const M = MONSTERS[f.id]; if (M && M.moves.some(m => m.charge) && !f.charged) f.charged = true;   // its worst move comes next
    shake = Math.max(shake, 14); flash(1); Music.sound("boss");
    blog(`${f.name.split(",")[0]} changes. The second phase begins.`);
    for (let i = RIG_FX.length - 1; i >= 0; i--) if (RIG_FX[i].kind === "say" && RIG_FX[i].unit === f) RIG_FX.splice(i, 1);   // one bubble at a time
    RIG_FX.push({ kind: "say", text: line, unit: f, t0: time, dur: 3 }); Voice.say(f.id, line);
  }
  const _damagePh = damage;
  damage = function (target, amount, o = {}) {
    const r = _damagePh(target, amount, o);
    if (battle && target && target.side === "foe" && target.boss && !target.phase2 && !target.dead && target.hp > 0 && target.hp <= target.maxHp * 0.5 && PHASE2[target.id]) enterPhase2(target);
    return r;
  };
  const _drawRigFxPh = drawRigFx;
  drawRigFx = function (k) {
    if (battle) for (const f of battle.foes) if (f.phase2 && !f.dead && PHASE2[f.id]) {   // a pulsing aura and sparks around a boss in its second phase
      const p = unitPos(f), col = PHASE2[f.id][1], top = unitTop(f), X = VP.ox + p.x * k, Y = VP.oy + (p.y - top * 0.5) * k, pulse = 0.5 + 0.5 * Math.sin(time * 4);
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.18 + 0.12 * pulse + (time - f.phase2 < 0.6 ? 0.5 * (1 - (time - f.phase2) / 0.6) : 0);
      const g2 = ctx.createRadialGradient(X, Y, 4 * k, X, Y, top * 0.75 * k); g2.addColorStop(0, col); g2.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g2; ctx.fillRect(X - top * k, Y - top * k, top * 2 * k, top * 2 * k);
      ctx.globalAlpha = 0.9; ctx.fillStyle = col; for (let j = 0; j < 10; j++) { const s = (time * 0.8 + j / 10) % 1; ctx.fillRect(X + Math.sin(j * 5.1 + time) * top * 0.45 * k, Y + (top * 0.5 - s * top) * k, 1.6 * k, 1.6 * k); }
      ctx.restore();
    }
    _drawRigFxPh(k);
  };

