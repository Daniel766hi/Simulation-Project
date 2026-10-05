  // ================================================================== DUO TECHNIQUES
  // Two companions who have bonded with Sable (bond 2+) and fight side by side can act together. The acting hero
  // pays the first cost, the partner the second. Each hit is struck by its own hero, so damage types still apply.
  const hitBy = (id, target, power, o) => { const u = battle.heroes.find(h => h.id === id); return u && alive(u) && !target.dead ? attackRoll(u, target, power, o) : { dmg: 0 }; };
  const DUOS = [
    { pair: ["sable", "ilse"], name: "Old Friends", target: "enemy", cost: 4, pcost: 3, desc: "Sable cuts, Ilse follows with the hammer: blade then blunt on one target.",
      run: async (t) => { const a = hitBy("sable", t, 1.1); await wait(300); const b = hitBy("ilse", t, 1.15); return `${a.dmg} + ${b.dmg}`; } },
    { pair: ["ilse", "rook"], name: "Anvil and Arrow", target: "enemy", cost: 4, pcost: 3, desc: "Ilse cracks the armour; Rook's arrow through the crack is always critical.",
      run: async (t) => { const a = hitBy("ilse", t, 0.8); if (!t.dead) t.st.brk = 3; await wait(300); if (!t.dead) t.st.mark = true; const b = hitBy("rook", t, 1.5); return `${a.dmg}, armour broken, then ${b.dmg}`; } },
    { pair: ["maru", "ada"], name: "Twin Hymn", target: "allEnemies", cost: 5, pcost: 4, desc: "Two voices: the party heals 14 and stops bleeding, then a storm hits every enemy.",
      run: async () => { for (const h of battle.heroes) if (alive(h)) { h.ref.hp = Math.min(h.ref.maxHp, h.ref.hp + 14); delete h.st.bleed; popupText(h, "+14", "#6bff9a"); } Music.sound("heal"); await wait(400); const parts = battle.foes.filter(f => !f.dead).map(f => hitBy("maru", f, 0.75, { noCrit: true }).dmg); return `party healed, storm ${parts.join(", ")}`; } },
    { pair: ["ren", "warden"], name: "Shieldwall", target: "self", cost: 3, pcost: 3, desc: "Captain and Warden lock shields: the whole party guards, Ren draws every attack, and he heals 18.", std: { wall: true } },
    { pair: ["kest", "nell"], name: "Powder Keg", target: "allEnemies", cost: 5, pcost: 3, desc: "Kest mixes it, Nell lights it: fire across every enemy.",
      run: async () => { battle.forceType = "fire"; try { flash(0.7); shake = 8; const parts = battle.foes.filter(f => !f.dead).map(f => hitBy("kest", f, 1.15, { noCrit: true }).dmg); return `fire ${parts.join(", ")}`; } finally { battle.forceType = null; } } },
    { pair: ["sable", "rook"], name: "Blue Thread", target: "enemy", cost: 4, pcost: 3, desc: "Sable marks the target and Rook shoots through the mark; then Sable finishes it.",
      run: async (t) => { t.st.mark = true; const a = hitBy("rook", t, 1.25); await wait(300); const b = hitBy("sable", t, 1.25); return `${a.dmg} (critical) + ${b.dmg}`; } },
  ];
  const bonded = id => id === "sable" || bondLevel(id) >= 2;
  const duoFor = (u) => DUOS.filter(d => d.pair.includes(u.id)).map(d => ({ d, partner: d.pair.find(x => x !== u.id) }))
    .filter(({ d, partner }) => d.pair.every(bonded) && battle.heroes.some(h => h.id === partner));
  const _menuItemsD = menuItems;
  menuItems = function () {
    const items = _menuItemsD(), m = menuState;
    if (!m || m.page !== "skills" || !battle) return items;
    const u = m.unit, extra = duoFor(u).map(({ d, partner }) => {
      const p = battle.heroes.find(h => h.id === partner), ok = alive(p) && p.ref.sp >= d.pcost && u.ref.sp >= d.cost;
      const skill = { name: d.name, cost: d.cost, target: d.target, duo: d, partner, ...(d.std || {}) };
      return { label: `★ ${d.name} (${d.cost} SP + ${HEROES[partner].name} ${d.pcost})`, sub: d.desc, disabled: !ok, go: () => toTarget({ kind: "skill", skill, target: d.target }) };
    });
    const back = items.findIndex(i => i.label === "Back");
    return back < 0 ? [...items, ...extra] : [...items.slice(0, back), ...extra, ...items.slice(back)];
  };
  const _act2SkillD = act2Skill;
  act2Skill = async function (u, act, s, name) {
    if (!s.duo) return _act2SkillD(u, act, s, name);
    const p = battle.heroes.find(h => h.id === s.partner);
    if (!p || !alive(p) || p.ref.sp < s.duo.pcost) { u.ref.sp += s.cost; blog(`${HEROES[s.partner].name} can't join in right now.`); return true; }
    p.ref.sp -= s.duo.pcost; p.lunge = 1; G.flags.duosUsed = [...new Set([...(G.flags.duosUsed || []), s.name])];
    if (!s.duo.run) { blog(`${name} and ${p.name}: ${s.name}!`); return false; }   // a standard effect (Shieldwall uses Oru's Wall)
    blog(`${name} and ${p.name}: ${s.name}!`); await wait(450);
    const target = act.unit && act.unit.side === "foe" && !act.unit.dead ? act.unit : battle.foes.find(f => !f.dead);
    const text = await s.duo.run(target);
    blog(`${s.name}: ${text}.`); renderCards();
    return true;
  };
  ACHIEVEMENTS.push(["duos", "Side by Side", "Use three different duo techniques.", () => (G.flags.duosUsed || []).length >= 3]);

  // ---- once Chapter I is over, the player hears that the caravan road has opened
  const _updateHintD = update;
  update = function (dt) {
    _updateHintD(dt);
    if (mode === "play" && G && G.stage >= 2 && !G.flags.drySeaHint && !G.flags.epilogue && G.py < DRY.y0 * TILE) {
      G.flags.drySeaHint = true; save();
      card("A road opens", "The Dry Sea", "The dust storms over the old seabed have settled. South of the Glass Flats, past the belled signpost, the caravan road runs down to Tamar's Rest: salt pans, dunes, and people who could use a courier.");
    }
  };
  // ---- the Dry Sea's battles happen on its own ground
  const _areaAtD = areaAt;
  areaAt = function (tx, ty, f) { return ty >= DRY.y0 ? (tx <= 44 ? "flats" : "dunes") : _areaAtD(tx, ty, f); };
  SKIES2.dunes = ["#3a1e3a", "#e0905a"];
  const _drawBattleBg2bD = drawBattleBg2b;
  drawBattleBg2b = function (g, area) {
    if (area !== "dunes") return _drawBattleBg2bD(g, area);
    const t = time;
    g.fillStyle = "#ffd98a"; g.beginPath(); g.arc(250, 62, 16, 0, Math.PI * 2); g.fill();                        // low sun
    g.fillStyle = "rgba(255,217,138,.25)"; g.beginPath(); g.arc(250, 62, 24, 0, Math.PI * 2); g.fill();
    for (const [base, amp, col, sp] of [[92, 10, "#b8704a", 0.02], [104, 8, "#c88a58", 0.035]]) {           // two rows of dunes
      g.fillStyle = col; g.beginPath(); g.moveTo(-10, 130);
      for (let x = -10; x <= VIEW_W + 10; x += 6) g.lineTo(x, base + Math.sin(x * sp + base) * amp);
      g.lineTo(VIEW_W + 10, 130); g.fill();
    }
    g.fillStyle = "#d8a870"; g.fillRect(-10, 116, VIEW_W + 20, 90);                                          // the ground
    g.fillStyle = "#c8945e"; for (let i = 0; i < 18; i++) { const x = (i * 37) % (VIEW_W + 20) - 10, y = 124 + (i * 13) % 60; g.fillRect(x, y, 22, 1); g.fillRect(x + 6, y + 3, 14, 1); }
    if (!REDUCED) { g.fillStyle = "rgba(255,240,210,.18)"; for (let i = 0; i < 5; i++) g.fillRect(-10, 108 + i * 3 + Math.sin(t * 2 + i) * 1.5, VIEW_W + 20, 1); }   // heat shimmer
    return true;
  };

  // ---- foes commit to a target when they choose their move, and the hero cards show who is in danger
  const singleTarget = mv => mv && (mv.power || mv.hits) && !mv.all && !mv.guard && !mv.charge && !mv.brood && !mv.summon && !mv.summonKind && !mv.molt && !mv.feast;
  const _chooseIntentT = chooseIntent;
  chooseIntent = function (f) {
    const mv = _chooseIntentT(f);
    if (battle && singleTarget(mv)) { const live = battle.heroes.filter(alive); if (live.length) mv.targetId = weightedTarget(live).id; }
    return mv;
  };
  const _weightedTargetT = weightedTarget;
  weightedTarget = function (ts) {
    const f = battle && battle.current;
    if (f && f.side === "foe" && f.intent && f.intent.targetId) { const t = ts.find(h => h.id === f.intent.targetId); if (t) return t; }
    return _weightedTargetT(ts);
  };
  const _renderCardsT = renderCards;
  renderCards = function () {
    _renderCardsT();
    if (!battle) return;
    const els = $("cards").children;
    battle.heroes.forEach((h, i) => {
      const n = battle.foes.filter(f => !f.dead && !f.st.stun && f.intent && f.intent.targetId === h.id).length;
      if (n && els[i] && alive(h)) els[i].querySelector(".chips").insertAdjacentHTML("afterbegin", `<span class="chip target">targeted${n > 1 ? " ×" + n : ""}</span>`);
    });
  };
  const targetCss = document.createElement("style");
  // toasts that aren't about the fight wait until it's over instead of covering the foes (battle tips still show)
  const _toastB = toast;
  toast = function (text) {
    if (battle && !/^Tip:/.test(text)) { const tx = text; const later = () => { if (battle) setTimeout(later, 500); else _toastB(tx); }; setTimeout(later, 500); return; }
    _toastB(text);
  };
  // the battle log sat in the top bar, right where the foes' labels are; it now floats free of it:
  // on the open ground between the foes and the heroes (a little wider on phones)
  $("battleUI").appendChild($("blog"));
  targetCss.textContent = ".chip.target{background:#8a1020;color:#fff;font-weight:700}"
    + "#battleUI>.blog{position:absolute;z-index:3;left:50%;top:57%;transform:translateX(-50%);max-width:40%;text-align:center}"
    + "@media (pointer:coarse),(max-width:700px){#battleUI>.blog{top:55%;max-width:70%}}";
  document.head.appendChild(targetCss);

