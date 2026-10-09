  // ================================================================== BATTLE ENGINE
  let battle = null;
  function unitFromMonster(id, i, n) {
    const m = MONSTERS[id];
    const hpx = Math.round(m.hp * DIFFS[difficulty].hp);
    return { side: "foe", id, name: m.name, sprite: m.sprite, maxHp: hpx, hp: hpx, atk: m.atk, def: m.def, spd: m.spd, boss: !!m.boss,
             st: {}, intent: null, slot: i, count: n, hurt: 0, shake: 0, dead: false, deathT: 0 };
  }
  function heroUnit(id) { const h = G.party[id]; return { side: "hero", id, ref: h, name: h.name, st: {}, hurt: 0 }; }
  const hp = u => u.side === "hero" ? u.ref.hp : u.hp;
  const alive = u => hp(u) > 0;
  function relayout() { const live = battle.foes; live.forEach((f, i) => { f.slot = i; f.count = live.length; }); }

  function startBattle(group, opts = {}) {
    mode = "battle";
    const foes = group.map((id, i) => unitFromMonster(id, i, group.length));
    const counts = {}; foes.forEach(f => { counts[f.id] = (counts[f.id] || 0) + 1; });
    const seen = {}; foes.forEach(f => { if (counts[f.id] > 1) { seen[f.id] = (seen[f.id] || 0) + 1; f.name += " " + "ABC"[seen[f.id] - 1]; } });
    const heroes = (G.active.length ? G.active : G.members.slice(0, 4)).map(heroUnit);
    battle = { foes, heroes, round: 0, queue: [], current: null, over: false, opts, flash: 1, fury: 0, warden: opts.boss === "voss" && G.flags.wardenFree };
    addFury(0); $("banner").hidden = true;
    if (opts.boss) {
      const m = MONSTERS[opts.boss], parts = m.name.split(", ");
      $("splashName").textContent = parts[0]; $("splashSub").textContent = parts[1] || (opts.boss === "wyrm" ? "Optional boss" : "Boss");
      const sp = $("splash"); sp.hidden = true; void sp.offsetWidth; sp.hidden = false; clearTimeout(sp._t); sp._t = setTimeout(() => { sp.hidden = true; }, 2400);
    }
    $("battleUI").hidden = false; $("hud").hidden = true; $("minimap").hidden = true; $("corner").hidden = true;
    shake = 4;
    const boss = opts.boss && MONSTERS[opts.boss];
    Music.sound(boss ? "boss" : "encounter"); Music.play(boss ? boss.music : "battle");
    blog(opts.boss === "voss" ? "Voss spreads his flayed arms. The Bell in his chest begins to ring."
      : opts.boss === "butcher" ? "The Butcher drags his hooks through the dust."
      : opts.boss === "mother" ? "A hundred small mouths open at once."
      : opts.boss === "choirmaster" ? "The Choirmaster raises a baton of bone. The dead begin to hum."
      : opts.boss === "hollis" ? "Hollis rises out of the floodwater, laughing through a ring of teeth."
      : `${group.length > 1 ? "Monsters attack" : "A monster attacks"}!`);
    renderCards(); renderMenu();
    runBattle();
  }
  function blog(text) { if (battle) { battle.log = text; $("blog").textContent = text; } }

  function chooseIntent(f) {
    const m = MONSTERS[f.id];
    const pool = m.moves.filter(mv => mv.w > 0);
    const find = key => ({ ...m.moves.find(x => x[key]) });
    if (f.charged) { f.charged = false; return { ...find("charge"), release: true }; }
    const a2 = chooseIntent2(f, find); if (a2) return a2;
    if (f.id === "butcher") {
      if (f.hp < f.maxHp * 0.5 && !f.raged) { f.raged = true; return find("rage"); }
      if (battle.heroes.some(h => alive(h) && h.st.bleed) && Math.random() < 0.35 && f.hp < f.maxHp) return find("feast");
      if (f.raged && Math.random() < 0.35) return find("rage");
    }
    if (f.id === "mother") {
      const live = battle.foes.filter(x => !x.dead).length;
      if (live < 3 && Math.random() < 0.3) return find("brood");
      if (battle.heroes.filter(h => alive(h) && h.st.bleed).length >= 2 && Math.random() < 0.4) return find("bloodsong");
    }
    if (f.id === "choirmaster" && battle.round % 3 === 0) return find("charge");
    if (f.id === "wyrm") {
      if (f.hp < f.maxHp * 0.5 && !f.phase2) { f.phase2 = true; return { ...find("molt"), announce: "The Wyrm sheds its skin. Underneath, it is raw, red and faster." }; }
      if (battle.round % 4 === 0) return find("charge");
    }
    if (f.id === "voss" && f.hp < f.maxHp * 0.5) {
      if (!f.phase2) { f.phase2 = true; return { ...find("phase2"), announce: "THE BELL SCREAMS. Salt erupts from Voss's skin." }; }
      if (Math.random() < 0.3) return find("phase2");
    }
    if (f.id === "hollis") {
      if (f.hp < f.maxHp * 0.6 && !f.summoned) { f.summoned = true; return { ...find("summon"), announce: "Hollis howls. Drowned guards claw up through the salt." }; }
      if (f.hp < f.maxHp * 0.3 && !f.phase3) { f.phase3 = true; return { ...find("phase3"), announce: "THE TIDE RISES. Hollis splits open and the sea pours out of him." }; }
      if (f.phase3 && Math.random() < 0.3) return find("phase3");
    }
    let total = pool.reduce((s, mv) => s + mv.w, 0), r = Math.random() * total;
    for (const mv of pool) { r -= mv.w; if (r <= 0) return { ...mv }; }
    return { ...pool[0] };
  }
  function foeAtk(f) { return f.atk * DIFFS[difficulty].dmg * (f.st.weak ? 0.7 : 1) * (f.phase2 ? 1.15 : 1) * (f.phase3 ? 1.25 : 1); }
  function intentLabel(f) {
    const mv = f.intent; if (!mv) return "";
    if (f.st.stun) return "stunned";
    if (mv.charge && !mv.release) return `${mv.name}: CHARGING`;
    if (mv.brood || mv.summonKind) return `${mv.name}: summon`;
    if (mv.molt) return `${mv.name}: shed skin`;
    if (mv.summon) return `${mv.name}: summon`;
    if (mv.bloodsong) return `${mv.name}: heal from bleeding`;
    if (mv.bleedAll) return `${mv.name}: bleed all`;
    if (mv.weakAll && !mv.power) return `${mv.name}: weaken all`;
    if (mv.guard) return `${mv.name}: guard` + (mv.heal ? ` +${mv.heal}` : "");
    if (mv.feast) return `${mv.name}: heal ${mv.heal}`;
    const est = Math.max(1, Math.round(foeAtk(f) * (mv.power || 1)));
    return `${mv.name}: ${mv.all ? "all " : ""}${mv.hits ? est + "×" + mv.hits : est}${mv.bleed ? " + bleed" : ""}${mv.drain ? " drain" : ""}${mv.stunChance ? " stun?" : ""}${mv.weakAll ? " weaken" : ""}`;
  }

  async function runBattle() {
    const token = battle;
    if (battle.opts.ambush) {
      await wait(500); if (battle !== token) return;
      const lead = battle.heroes.find(h => h.id === "sable") || battle.heroes[0];
      lead.lunge = 1; flash(0.5); shake = 6; Music.sound("crit");
      const hits = battle.foes.map(f => { const d = damage(f, Math.max(3, Math.round((lead.ref.atk + rstat(lead, "atk")) * 0.8 - f.def * 0.3))); gore(f, 14); return d; });
      G.flags.didAmbush = true; G.flags.ambushCount = (G.flags.ambushCount || 0) + 1;
      blog(`Ambush! ${lead.name} dashes through the pack (${hits.join(", ")}). Your party moves first.`);
      renderCards(); await wait(1100);
      if (battle !== token || checkEnd()) return;
    }
    while (battle === token && !battle.over) {
      battle.round++;
      for (const f of battle.foes) if (!f.dead) f.intent = chooseIntent(f);
      const units = [...battle.heroes.filter(alive), ...battle.foes.filter(f => !f.dead)];
      battle.queue = units.sort((a, b) => spdOf(b) - spdOf(a) + rand(-1.5, 1.5));
      if (battle.opts.ambush && battle.round === 1) battle.queue.sort((a, b) => (a.side === "hero" ? 0 : 1) - (b.side === "hero" ? 0 : 1));
      renderTurnbar();
      for (const u of [...battle.queue]) {
        if (battle !== token || battle.over) return;
        if ((u.side === "foe" && u.dead) || (u.side === "hero" && !alive(u))) continue;
        battle.current = u; renderTurnbar(); renderCards();
        if (u.side === "hero") clearGuardFrom(u.id);
        if (u.st.taunt && --u.st.taunt <= 0) delete u.st.taunt;
        if (u.st.bleed) {
          const d = u.st.bleed.dmg;
          damage(u, d, { silent: true }); popup(u, d, "#ff3b3b"); gore(u, 8); Music.sound("bleed"); blog(`${u.name} bleeds for ${d}.`);
          if (--u.st.bleed.turns <= 0) delete u.st.bleed;
          renderCards(); await wait(500);
          if (!alive(u) || u.dead) { if (checkEnd()) return; continue; }
        }
        for (const k of ["weak", "strong", "brk"]) if (u.st[k] && --u.st[k] <= 0) delete u.st[k];
        if (u.st.stun && rstat(u, "noStun")) { delete u.st.stun; popupText(u, "resisted", "#9ef0f5"); }
        if (u.st.stun) { delete u.st.stun; blog(`${u.name} is stunned and loses the turn.`); await wait(650); continue; }
        if (u.side === "hero") {
          u.ref.sp = Math.min(u.ref.maxSp, u.ref.sp + 2 + rstat(u, "spRegen"));
          const rg = rstat(u, "regen"); if (rg && u.ref.hp < u.ref.maxHp) { u.ref.hp = Math.min(u.ref.maxHp, u.ref.hp + rg); popupText(u, `+${rg}`, "#6bff9a"); }
          renderCards();
          const act = await heroChoose(u);
          if (act === "fled" || battle !== token) return;
          await doHero(u, act);
        } else await doFoe(u);
        renderCards();
        if (checkEnd()) return;
        await wait(220);
      }
      if (battle !== token || battle.over) return;
      if (battle.warden) {
        const v = battle.foes.find(f => !f.dead);
        if (v) { blog("The Warden's light burns through Voss's crystal skin."); await wait(300); damage(v, 10); Music.sound("hit"); for (const h of battle.heroes) if (alive(h)) h.ref.hp = Math.min(h.ref.maxHp, h.ref.hp + 3); renderCards(); await wait(700); if (checkEnd()) return; }
      }
    }
  }
  const spdOf = u => u.side === "hero" ? u.ref.spd + rstat(u, "spd") : u.spd;

  // ---- hero turn: menu driven
  let resolveChoice = null, menuState = null;
  function heroChoose(u) {
    return new Promise(res => { resolveChoice = res; menuState = { unit: u, page: "main", sel: 0 }; renderMenu(); renderCards(); blog(`${u.name}'s turn.`); });
  }
  const itemCount = () => Object.entries(G.items).filter(([, n]) => n > 0);
  function menuItems() {
    const m = menuState; if (!m) return [];
    const u = m.unit, h = u.ref, def = HEROES[u.id];
    if (m.page === "main") return [
      { label: "Attack", sub: `A plain strike (${heroType(h.id)}).`, go: () => toTarget({ kind: "attack", target: "enemy" }) },
      { label: "Skills", sub: `${h.sp} SP`, go: () => { m.page = "skills"; m.sel = 0; } },
      { label: "Guard", sub: "Halve damage until your next turn, +3 SP.", go: () => finish({ kind: "guard" }) },
      ...(battle.fury >= 100 ? [{ label: "★ Chain Assault", sub: "Fury is full. Every standing hero strikes one enemy in turn; the last blow always lands critical.", go: () => toTarget({ kind: "chain", target: "enemy" }) }] : []),
      { label: "Items", sub: itemCount().map(([k, n]) => `${ITEMS[k].name} ×${n}`).join(", ") || "None", go: () => { m.page = "items"; m.sel = 0; }, disabled: !itemCount().length },
      { label: "Flee", sub: battle.opts.boss ? "You can't run from this." : "60% chance.", go: () => finish({ kind: "flee" }), disabled: !!battle.opts.boss },
    ];
    if (m.page === "skills") return [...def.skills.filter(s => !s.lvl || h.level >= s.lvl).map(s => ({ label: `${s.name} (${s.cost} SP)`, sub: skillTypeTag(h.id, s) + s.desc, disabled: h.sp < s.cost, go: () => toTarget({ kind: "skill", skill: s, target: s.target }) })), { label: "Back", go: () => { m.page = "main"; m.sel = 1; } }];
    if (m.page === "items") return [...itemCount().map(([k]) => ({ label: `${ITEMS[k].name} ×${G.items[k]}`, sub: ITEMS[k].desc, go: () => toTarget({ kind: "item", item: k, target: ITEMS[k].target }) })), { label: "Back", go: () => { m.page = "main"; m.sel = 3; } }];
    if (m.page === "target") return [...m.options.map(o => ({ label: o.label, sub: o.sub, go: () => finish({ ...m.action, unit: o.unit }) })), { label: "Back", go: () => { m.page = m.action.kind === "skill" ? "skills" : m.action.kind === "item" ? "items" : "main"; m.sel = 0; } }];
    return [];
  }
  function toTarget(action) {
    const m = menuState, t = action.target;
    if (["self", "allEnemies", "party", "random3", "random5", "allEnemiesItem", "partyItem"].includes(t)) { finish({ ...action, unit: m.unit }); return; }
    let options = [];
    if (t === "enemy") options = battle.foes.filter(f => !f.dead).map(f => ({ unit: f, label: f.name, sub: `${f.hp}/${f.maxHp} HP${f.st.bleed ? " · bleeding" : ""}${f.st.mark ? " · marked" : ""}${f.st.brk ? " · armour broken" : ""}` }));
    if (t === "ally") options = battle.heroes.filter(alive).map(h => ({ unit: h, label: h.name, sub: `${h.ref.hp}/${h.ref.maxHp} HP${h.st.bleed ? " · bleeding" : ""}` }));
    if (t === "fallen") options = battle.heroes.filter(h => !alive(h)).map(h => ({ unit: h, label: h.name, sub: "Fallen" }));
    if (!options.length) { toast("No valid target."); return; }
    if (options.length === 1 && t === "enemy") { finish({ ...action, unit: options[0].unit }); return; }
    m.page = "target"; m.action = action; m.options = options; m.sel = 0; renderMenu(); renderCards();
  }
  function finish(action) {
    const r = resolveChoice; resolveChoice = null; menuState = null; renderMenu(); renderCards();
    if (action.kind === "flee") {
      if (Math.random() < 0.6) { blog("You get away!"); setTimeout(() => endBattle("fled"), 500); r && r("fled"); return; }
      blog("You can't get away!"); r && r({ kind: "nothing" }); return;
    }
    r && r(action);
  }
  function renderMenu() {
    const el = $("menu");
    if (!battle) return;
    if (!menuState) { el.innerHTML = `<div class="title">${battle.current && battle.current.side === "foe" ? "Enemy turn" : "…"}</div>`; return; }
    const items = menuItems();
    menuState.sel = clamp(menuState.sel, 0, items.length - 1);
    const title = { main: `${menuState.unit.name}`, skills: `Skills · ${menuState.unit.ref.sp} SP`, items: "Items", target: "Choose target" }[menuState.page];
    el.innerHTML = `<div class="title">${title}</div>`;
    items.forEach((it, i) => {
      const b = document.createElement("button");
      b.innerHTML = `${it.label}${it.sub ? `<small>${it.sub}</small>` : ""}`;
      b.disabled = !!it.disabled;
      if (i === menuState.sel) b.classList.add("sel");
      if (/Chain Assault/.test(it.label)) b.classList.add("chain");
      b.addEventListener("click", () => { if (!it.disabled) { Music.sound("click"); it.go(); renderMenu(); } });
      b.addEventListener("mouseenter", () => { if (menuState) { menuState.sel = i; highlightTarget(); } });
      el.appendChild(b);
    });
    highlightTarget();
  }
  function highlightTarget() {
    if (!battle) return;
    battle.hoverTarget = null;
    if (menuState && menuState.page === "target") { const o = menuState.options[menuState.sel]; if (o) battle.hoverTarget = o.unit; }
  }
  function battleKey(k) {
    if (battle && battle.waitingContinue && (k === "e" || k === "enter" || k === " ")) { const f = battle.waitingContinue; battle.waitingContinue = null; f(); return; }
    if (!menuState) return;
    const items = menuItems();
    if (["arrowup", "w"].includes(k)) { menuState.sel = (menuState.sel - 1 + items.length) % items.length; Music.sound("click"); renderMenu(); }
    else if (["arrowdown", "s"].includes(k)) { menuState.sel = (menuState.sel + 1) % items.length; Music.sound("click"); renderMenu(); }
    else if (k === "e" || k === "enter" || k === " ") { const it = items[menuState.sel]; if (it && !it.disabled) { Music.sound("click"); it.go(); if (menuState) renderMenu(); } }
    else if (k === "q" || k === "escape" || k === "backspace") { const back = items.find(i => i.label === "Back"); if (back) { back.go(); renderMenu(); } }
    else if (/^[1-9]$/.test(k)) { const it = items[Number(k) - 1]; if (it && !it.disabled) { it.go(); if (menuState) renderMenu(); } }
  }

  // ---- resolving actions
  function addFury(n) { if (!battle) return; battle.fury = Math.min(100, battle.fury + n); const el = $("fury"); $("furyFill").style.width = battle.fury + "%"; el.classList.toggle("full", battle.fury >= 100); $("furyPct").textContent = battle.fury >= 100 ? "Ready" : Math.floor(battle.fury) + "%"; el.title = battle.fury >= 100 ? "Fury is full: Chain Assault is in the menu" : "Fury fills as your party deals and takes damage"; }
  function damage(target, amount, o = {}) {
    let d = amount;
    if (target.st.guard) d = Math.ceil(d / 2);
    if (!o.noFury) addFury(target.side === "hero" ? d * 1.1 : d * 0.45);
    if (target.side === "hero") target.ref.hp = Math.max(0, target.ref.hp - d);
    else {
      target.hp = Math.max(0, target.hp - d);
      if (target.hp === 0 && !target.dead) {
        target.dead = true; target.deathT = 0;
        if (target.boss && battle) for (const f of battle.foes) if (f.summoned && !f.dead) { f.hp = 0; f.dead = true; f.deathT = 0; }
      }
    }
    target.hurt = 0.35; target.shake = 6;
    if (!o.silent) popup(target, d, o.crit ? "#ffcf4a" : target.side === "hero" ? "#ff6b6b" : "#ffffff", o.crit);
    return d;
  }
  function attackRoll(att, target, power, o = {}) {
    if (target.st.veil) { delete target.st.veil; popupText(target, "dodged", "#9ef0f5"); Music.sound("miss"); return { dodged: true, dmg: 0 }; }
    const atk = att.side === "hero" ? (att.ref.atk + rstat(att, "atk")) * (att.st.weak ? 0.7 : 1) * (att.st.strong ? 1.3 : 1) : foeAtk(att);
    const def = (target.side === "hero" ? target.ref.def + rstat(target, "def") : target.def) * (target.st.brk ? 0.3 : 1);
    let dmg = Math.max(1, Math.round((atk * power - def * 0.6) * rand(0.9, 1.1)));
    const crit = !o.noCrit && (Math.random() < 0.1 + rstat(att, "crit") || target.st.mark);
    if (target.st.mark) delete target.st.mark;
    if (crit) dmg = Math.round(dmg * 1.6);
    const dealt = damage(target, dmg, { crit, noFury: o.noFury });
    if (crit) shake = Math.max(shake, 7);
    Music.sound(crit ? "crit" : "hit");
    gore(target, crit ? 22 : 10);
    return { dmg: dealt, crit };
  }
  async function doHero(u, act) {
    const name = u.name;
    if (!act || act.kind === "nothing") { await wait(400); return; }
    u.lunge = 1;
    if (act.kind === "chain") {
      G.flags.didChain = true;
      battle.fury = 0; addFury(0); flash(0.8); shake = 8;
      blog(`${name} calls the Chain Assault!`); await wait(500);
      const team = battle.heroes.filter(alive); let total = 0;
      for (let i = 0; i < team.length; i++) {
        const t = act.unit.dead ? battle.foes.find(f => !f.dead) : act.unit; if (!t) break;
        team[i].lunge = 1; chainBlow(team[i], t, i === team.length - 1); if (i === team.length - 1) t.st.mark = true;
        const r = attackRoll(team[i], t, 1.0, { noFury: true }); total += r.dmg;
        blog(`${team[i].name} strikes${i === team.length - 1 ? " the finishing blow" : ""}! (${r.dmg})`); renderCards(); await wait(380);
      }
      blog(`Chain Assault: ${total} damage in all.`); await wait(600); return;
    }
    if (act.kind === "guard") { u.st.guard = true; u.st.guardSource = u.id; u.ref.sp = Math.min(u.ref.maxSp, u.ref.sp + 3); blog(`${name} braces.`); await wait(500); return; }
    if (act.kind === "attack") {
      const r = attackRoll(u, act.unit, 1.0);
      if (!r.dodged && rstat(u, "bleedHit") && !act.unit.dead && !act.unit.st.bleed) act.unit.st.bleed = { dmg: 2, turns: 2 };
      blog(r.dodged ? `${act.unit.name} dodges.` : `${name} strikes ${act.unit.name} for ${r.dmg}${r.crit ? ". Critical!" : "."}`);
      await wait(700); return;
    }
    if (act.kind === "item") {
      const it = ITEMS[act.item]; G.items[act.item]--;
      if (it.dmg) { flash(0.7); const parts = []; for (const f of battle.foes) if (!f.dead) { parts.push(damage(f, it.dmg)); gore(f, 6); if (it.stunChance && !f.dead && !f.st.stunGuard && Math.random() < (f.boss ? it.stunChance / 2 : it.stunChance)) f.st.stun = true; } Music.sound("crit"); blog(`${name} ${it.stunChance ? "throws a Thunder Echo. The storm remembers" : "hurls an Oil Bomb. Fire everywhere"} (${parts.join(", ")}).`); await wait(800); return; }
      if (it.healAll) { for (const h of battle.heroes) if (alive(h)) { h.ref.hp = Math.min(h.ref.maxHp, h.ref.hp + it.healAll); delete h.st.bleed; popupText(h, `+${it.healAll}`, "#6bff9a"); } flash(0.4); Music.sound("heal"); blog(`${name} passes around ${it.name}. It tastes terrible. It works.`); await wait(700); return; }
      const t = act.unit;
      if (it.heal) { t.ref.hp = Math.min(t.ref.maxHp, t.ref.hp + it.heal); popupText(t, `+${it.heal}`, "#6bff9a"); }
      if (it.cure) delete t.st.bleed;
      if (it.sp) t.ref.sp = Math.min(t.ref.maxSp, t.ref.sp + it.sp);
      if (it.revive) { t.ref.hp = Math.round(t.ref.maxHp * it.revive); t.st = {}; popupText(t, "revived", "#6bff9a"); }
      Music.sound("heal"); blog(`${name} uses ${it.name} on ${t.name}.`); await wait(650); return;
    }
    const s = act.skill; u.ref.sp -= s.cost;
    if (await act2Skill(u, act, s, name)) { await wait(800); return; }
    const liveFoes = () => battle.foes.filter(f => !f.dead);
    if (s.reviveAll) {
      let n = 0; for (const h of battle.heroes) { if (!alive(h)) { h.ref.hp = Math.round(h.ref.maxHp * s.reviveAll); h.st = {}; n++; popupText(h, "risen", "#6bff9a"); } else { h.ref.hp = Math.min(h.ref.maxHp, h.ref.hp + s.healAll); popupText(h, `+${s.healAll}`, "#6bff9a"); } }
      flash(0.9); Music.sound("heal"); blog(`${name} sings the Hymn of Return.${n ? ` ${n} fallen ${n > 1 ? "allies rise" : "ally rises"}.` : " Wounds close."}`);
    }
    else if (s.wall) { for (const h of battle.heroes) if (alive(h)) { h.st.guard = true; h.st.guardSource = u.id; } u.st.taunt = 3; u.ref.hp = Math.min(u.ref.maxHp, u.ref.hp + 18); popupText(u, "+18", "#6bff9a"); shake = 5; blog(`${name} raises Oru's Wall. "Behind me. All of you."`); }
    else if (s.brkAll || s.stunAll) {
      flash(0.8); shake = 7; const parts = [];
      for (const f of liveFoes()) { const r = attackRoll(u, f, s.power, { noCrit: true }); parts.push(r.dmg); if (!f.dead && s.brkAll) f.st.brk = s.brkAll + 1; if (!f.dead && s.stunAll && !f.st.stunGuard && Math.random() < (f.boss ? s.stunAll / 2 : s.stunAll)) { f.st.stun = true; popupText(f, "stunned", "#ffcf4a"); } }
      blog(`${name} unleashes ${s.name} (${parts.join(", ")}).${s.brkAll ? " Armour shatters." : ""}`);
    }
    else if (s.veil) { u.st.veil = true; blog(`${name}'s scarf snaps like a banner. The next blow will miss.`); }
    else if (s.mark) { act.unit.st.mark = true; blog(`${name} marks ${act.unit.name}. The next hit will land true.`); popupText(act.unit, "marked", "#ffb14a"); }
    else if (s.markAll) { for (const f of liveFoes()) { f.st.mark = true; popupText(f, "marked", "#ffb14a"); } blog(`${name} reads every weak spot on the field.`); }
    else if (s.guardAll) { for (const h of battle.heroes) if (alive(h)) { h.st.guard = true; h.st.guardSource = u.id; } blog(`${name} plants her feet. Everyone shelters behind her.`); }
    else if (s.taunt) { u.st.taunt = s.taunt + 1; u.st.guard = true; u.st.guardSource = u.id; blog(`${name} slams his spear on his shield. "Over here!"`); }
    else if (s.strongAll) { for (const h of battle.heroes) if (alive(h)) { h.st.strong = s.strongAll + 1; popupText(h, "strong", "#ffb14a"); } Music.sound("heal"); blog(`${name} sings the Hymn of Iron. Blood runs hot.`); }
    else if (s.healAll) { for (const h of battle.heroes) if (alive(h)) { h.ref.hp = Math.min(h.ref.maxHp, h.ref.hp + s.healAll); delete h.st.bleed; popupText(h, `+${s.healAll}`, "#6bff9a"); } Music.sound("heal"); blog(`${name} raises a Sanctuary. Wounds close.`); }
    else if (s.heal) { const t = act.unit; t.ref.hp = Math.min(t.ref.maxHp, t.ref.hp + s.heal); if (s.cure) delete t.st.bleed; popupText(t, `+${s.heal}`, "#6bff9a"); Music.sound("heal"); blog(`${name} sings a mending song over ${t.name}.`); }
    else if (s.weak) { for (const f of liveFoes()) { f.st.weak = s.weak + 1; popupText(f, "weakened", "#c9a6ff"); } flash(0.6); blog("The lantern flares. The monsters shrink from the light."); }
    else if (/^random\d$/.test(s.target)) { const parts = []; for (let i = 0; i < Number(s.target.slice(6)); i++) { const alv = liveFoes(); if (!alv.length) break; const r = attackRoll(u, pick(alv), s.power); parts.push(r.dmg); await wait(180); } blog(`${name} looses a volley (${parts.join(", ")}).`); }
    else if (s.target === "allEnemies") { flash(0.8); const parts = []; for (const f of liveFoes()) { const r = attackRoll(u, f, s.power, { noCrit: true }); parts.push(r.dmg); } blog(`Lightning tears through the enemies (${parts.join(", ")}).`); }
    else {
      const t = act.unit;
      const exec = s.execute && t.hp < t.maxHp * 0.4;
      let saved = null; if (s.pierce) { saved = { veil: t.st.veil, guard: t.st.guard }; delete t.st.veil; delete t.st.guard; }
      const r = attackRoll(u, t, exec ? s.power * s.execute : s.power);
      if (saved && !t.dead) { if (saved.guard) t.st.guard = saved.guard; }
      if (!r.dodged && s.weakOne && !t.dead) t.st.weak = s.weakOne + 1;
      if (s.refund && t.dead) { u.ref.sp = Math.min(u.ref.maxSp, u.ref.sp + s.refund); popupText(u, `+${s.refund} SP`, "#6f8cff"); }
      let extra = exec && !r.dodged ? " The prayer finds a dying heart." : "";
      if (!r.dodged && s.bleed && !t.dead) { t.st.bleed = { dmg: s.bleed[0], turns: s.bleed[1] }; extra += " It bleeds."; }
      if (!r.dodged && s.brk && !t.dead) { t.st.brk = s.brk + 1; extra += " Armour broken."; }
      if (!r.dodged && s.stun && !t.dead && !t.st.stunGuard && Math.random() < (t.boss ? s.stun * 0.5 : s.stun)) { t.st.stun = true; extra += " Stunned!"; }
      blog(r.dodged ? `${t.name} dodges.` : `${name} uses ${s.name} on ${t.name} for ${r.dmg}.${extra}`);
    }
    await wait(800);
  }
  async function doFoe(f) {
    const mv = f.intent || chooseIntent(f);
    const targets = battle.heroes.filter(alive);
    if (!targets.length) return;
    f.lunge = 1;
    if (mv.announce) { blog(mv.announce); shake = 9; Music.sound("boss"); await wait(1000); }
    if (mv.charge && !mv.release) { f.charged = true; blog(`${f.name} begins the ${mv.name}. Every candle in the hall leans toward you. Brace yourselves!`); await wait(900); return; }
    if (mv.brood || mv.summon || mv.summonKind) {
      const kind = mv.summonKind || (mv.brood ? "spawn" : "drowned"), n = 2;
      for (let i = 0; i < n && battle.foes.filter(x => !x.dead).length < 4; i++) { const u2 = unitFromMonster(kind, 0, 1); u2.summoned = true; u2.name += " " + (battle.foes.length + 1); u2.intent = chooseIntent(u2); battle.foes.push(u2); }
      battle.foes = battle.foes.filter(x => !x.dead || x.deathT < 0.9); relayout();
      blog(mv.summonText || (mv.brood ? "The Mother splits. Leechlings spill out of her, squealing." : (mv.announce ? "The drowned rise to defend their master." : "Hollis calls the drowned."))); await wait(900); return;
    }
    if (mv.molt) { f.st = {}; f.spd += 3; f.hp = Math.min(f.maxHp, f.hp + 30); popupText(f, "+30", "#6bff9a"); blog(`${f.name} molts. Every wound and weakness slides off with its old skin.`); await wait(900); return; }
    if (mv.bloodsong) { const n = battle.heroes.filter(h => alive(h) && h.st.bleed).length, heal = 12 * Math.max(1, n); f.hp = Math.min(f.maxHp, f.hp + heal); popupText(f, `+${heal}`, "#6bff9a"); blog(`${f.name} sings, and your blood flows toward her mouths.`); await wait(900); return; }
    if (mv.bleedAll) { for (const h of targets) { h.st.bleed = { dmg: mv.bleedAll[0], turns: mv.bleedAll[1] }; gore(h, 6); } Music.sound("bleed"); blog(`${f.name} floods your lungs with brine. Everyone bleeds.`); await wait(850); return; }
    if (mv.weakAll && !mv.power) { for (const h of targets) h.st.weak = mv.weakAll + 1; blog(`${f.name} wails. Your party's strength drains away.`); await wait(800); return; }
    if (mv.guard) { f.st.guard = true; f.st.guardUntilNext = true; if (mv.heal) { f.hp = Math.min(f.maxHp, f.hp + mv.heal); popupText(f, `+${mv.heal}`, "#6bff9a"); } blog(`${f.name} uses ${mv.name}.`); await wait(700); return; }
    if (mv.feast) { f.hp = Math.min(f.maxHp, f.hp + mv.heal); popupText(f, `+${mv.heal}`, "#6bff9a"); blog("The Butcher licks the blood from his hooks and grows stronger."); await wait(800); return; }
    const taunter = targets.find(h => h.st.taunt);
    const hitList = mv.all ? targets : [taunter || weightedTarget(targets)];
    const hits = mv.hits || 1, texts = [];
    if (mv.release) { shake = 10; flash(0.5); }
    for (const t of hitList) {
      let total = 0, dodged = false;
      for (let i = 0; i < hits; i++) {
        if (!alive(t)) break;
        const r = attackRoll(f, t, mv.power || 1);
        if (r.dodged) { dodged = true; break; }
        total += r.dmg;
        if (hits > 1) await wait(220);
      }
      if (!dodged && mv.bleed && alive(t)) t.st.bleed = { dmg: mv.bleed[0], turns: mv.bleed[1] };
      if (!dodged && (mv.weakAll || mv.weakOne) && alive(t)) t.st.weak = (mv.weakAll || mv.weakOne) + 1;
      if (!dodged && mv.stunChance && alive(t) && Math.random() < mv.stunChance) t.st.stun = true;
      if (!dodged && mv.drain && total) { const h = Math.round(total * mv.drain); f.hp = Math.min(f.maxHp, f.hp + h); popupText(f, `+${h}`, "#6bff9a"); }
      texts.push(dodged ? `${t.name} dodges` : `${t.name} takes ${total}${mv.bleed ? " and bleeds" : ""}`);
    }
    blog(`${f.name} uses ${mv.name}: ${texts.join(", ")}.`);
    if (f.st.guardUntilNext) { delete f.st.guard; delete f.st.guardUntilNext; }
    await wait(850);
  }
  function weightedTarget(ts) {
    const w = ts.map(t => 1 + (1 - t.ref.hp / t.ref.maxHp) * 1.5 + (t.st.guard ? 0 : 0.5));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < ts.length; i++) { r -= w[i]; if (r <= 0) return ts[i]; }
    return ts[0];
  }
  function clearGuardFrom(id) { for (const h of battle.heroes) if (h.st.guardSource === id) { delete h.st.guard; delete h.st.guardSource; } }
  function checkEnd() {
    if (!battle) return true;   // the battle already ended while this turn was still playing out
    if (battle.foes.every(f => f.dead)) { battle.over = true; setTimeout(() => victory(), 700); return true; }
    if (battle.heroes.every(h => !alive(h))) { battle.over = true; setTimeout(() => defeat(), 900); return true; }
    return false;
  }
  function victory() {
    G.stats = G.stats || {}; G.stats.wins = (G.stats.wins || 0) + 1;
    if (!battle) return;
    G.flags.kills = G.flags.kills || {};
    for (const f of battle.foes) G.flags.kills[f.id] = (G.flags.kills[f.id] || 0) + 1;
    if (battle.opts.boss) grantRelic(battle.opts.boss);
    const xp = battle.foes.reduce((s, f) => s + MONSTERS[f.id].xp, 0);
    const coins = battle.foes.reduce((s, f) => s + Math.round(rand(...MONSTERS[f.id].coin)), 0);
    G.coins += coins;
    const ups = [];
    for (const id of G.members) {
      const h = G.party[id], fought = battle.heroes.some(u => u.id === id);
      if (h.hp <= 0) h.hp = 1;
      h.xp += fought ? xp : Math.round(xp / 2);
      while (h.xp >= xpNeed(h.level)) { h.xp -= xpNeed(h.level); levelUp(h); ups.push(`${h.name} reaches level ${h.level}`); const ult = HEROES[id].skills.find(sk => sk.lvl === h.level); if (ult) ups.push(`${h.name} learns ${ult.name}`); }
    }
    const loot = Math.random() < 0.35 ? pick(["salve", "salve", "tonic"]) : null;
    if (loot) G.items[loot]++;
    Music.play(null); Music.track = null; Music.sound("victory");
    blog(`Victory! +${xp} XP, +${coins} coin${loot ? `, found ${ITEMS[loot].name}` : ""}.${ups.length ? " " + ups.join(". ") + "!" : ""}`);
    const boss = battle.opts.boss;
    if (battle.opts.fieldId) G.defeated.push(battle.opts.fieldId);
    save();
    menuState = null;
    $("menu").innerHTML = `<div class="title">Victory</div>`;
    const b = document.createElement("button"); b.textContent = "Continue"; b.className = "sel";
    b.addEventListener("click", () => endBattle("won", boss)); $("menu").appendChild(b); b.focus({ preventScroll: true });
    battle.waitingContinue = () => endBattle("won", boss);
  }
  function defeat() {
    G.stats = G.stats || {}; G.stats.defeats = (G.stats.defeats || 0) + 1;
    if (!battle) return;
    Music.track = null; Music.sound("defeat");
    blog("Your party falls. The salt closes over you...");
    $("menu").innerHTML = `<div class="title">Defeat</div>`;
    const b = document.createElement("button"); b.textContent = "Wake at the last rest point"; b.className = "sel";
    b.addEventListener("click", () => endBattle("lost")); $("menu").appendChild(b); b.focus({ preventScroll: true });
    battle.waitingContinue = () => endBattle("lost");
  }
  const xpNeed = lvl => 20 + lvl * 18;
  function levelUp(h) { h.level++; h.maxHp += 5; h.hp = Math.min(h.maxHp, h.hp + 5); h.maxSp += 1; h.sp = Math.min(h.maxSp, h.sp + 1); h.atk += 1; if (h.level % 2 === 0) h.def += 1; if (h.level % 3 === 0) h.spd += 1; }
  function endBattle(result, boss) {
    if (!battle) return;
    const opts = battle.opts;
    battle = null; menuState = null; resolveChoice = null;
    $("battleUI").hidden = true; $("hud").hidden = false; $("corner").hidden = false;
    mode = "play"; region = "";
    if (result === "lost") {
      for (const id of G.members) { const h = G.party[id]; h.hp = h.maxHp; h.sp = h.maxSp; }
      G.coins = Math.max(0, G.coins - 5); G.px = G.checkpoint.x; G.py = G.checkpoint.y;
      toast("You wake at the last rest point, bruised and 5 coin lighter.");
      spawnField(); save();
    } else if (result === "fled") {
      const f = field.find(x => x.id === opts.fieldId);
      if (f) {
        f.cool = 3; const d = Math.hypot(G.px - f.px, G.py - f.py) || 1;
        for (let step = 0; step < 10; step++) { const nx = G.px + (G.px - f.px) / d * 2, ny = G.py + (G.py - f.py) / d * 2; if (blocked(nx, ny)) break; G.px = nx; G.py = ny; }
      }
    } else {
      field = field.filter(x => x.id !== opts.fieldId);
      if (boss === "butcher") { G.flags.butcherDead = true; save(); setTimeout(() => openDialog("maru_after_fight"), 200); }
      if (boss === "mother") { G.flags.motherDead = true; save(); setTimeout(() => openDialog("rook_join"), 200); }
      if (boss === "choirmaster") { G.flags.choirDead = true; save(); toast("The Choirmaster's song ends mid-note. Open the chest."); }
      if (boss === "voss") {
        G.flags.vossDead = true; save();
        card("Chapter V", "The Salt-Flayed", G.flags.wardenFree
          ? "Voss comes apart like a pillar of salt in the rain. The Warden lowers its great crystal head, lifts the Bell from his ruined chest, and sets it on the pedestal for you."
          : "Voss falls to his knees, and the crystals eat him from the inside until only a statue of salt remains, one hand still reaching for the Bell. It rests on the pedestal now.");
      }
      act2BossEnd(boss);
      if (boss === "wyrm") { G.flags.wyrmDead = true; save(); setTimeout(() => openDialog("pell_found"), 300); }
      if (boss === "hollis") { G.flags.hollisDead = true; save(); setTimeout(() => openDialog("finale_0"), 300); }
    }
    updateHud();
  }

