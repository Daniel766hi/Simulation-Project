  // ================================================================== TALENTS: A PATH FOR EACH FIGHTER
  // At levels 3, 6, 10 and 14 every fighter learns one of two talents, so two Sables can fight differently. The choice
  // comes up after a battle (or any time on the Party screen), and can be changed there later for a little coin.
  // Talents fire on screen: a gold word over the hero and a ring, like the runes.
  const TALENTS = [
    { lvl: 3, name: "Instinct", opts: {
      opener: { name: "First Blood", desc: "the first attack or skill each battle hits 50% harder" },
      secondwind: { name: "Second Wind", desc: "once each battle, falling below 30% health restores a quarter of it" } } },
    { lvl: 6, name: "Craft", opts: {
      bloodletter: { name: "Open Wounds", desc: "30% more damage to foes that are bleeding or have broken armour" },
      bulwark: { name: "Bulwark", desc: "Guard also heals 10% of max health and restores 2 more SP" } } },
    { lvl: 10, name: "Resolve", opts: {
      executioner: { name: "Executioner", desc: "40% more damage to foes below a third of their health" },
      momentum: { name: "Momentum", desc: "each foe you finish restores 4 SP and adds 12 Fury" } } },
    { lvl: 14, name: "Legend", opts: {
      laststand: { name: "Last Stand", desc: "once each battle, a killing blow leaves you standing at 1 health" },
      stormheart: { name: "Storm Heart", desc: "8% more critical hits, and criticals strike at ×2.2 instead of ×1.6" } } },
  ];
  const TAL_ALL = Object.assign({}, ...TALENTS.map(T => T.opts));
  const TAL_SWITCH = 20;
  const talentOf = (id, tier) => ((G.talents || {})[id] || {})[tier] || null;
  const hasTalent = (id, key) => { const t = (G.talents || {})[id]; return !!t && Object.values(t).includes(key); };
  const pendingTiers = id => { const h = G.party[id]; return h ? TALENTS.map((T, i) => i).filter(i => h.level >= TALENTS[i].lvl && !talentOf(id, i)) : []; };
  function learnTalent(id, tier, key, cost = 0) {
    if (!TALENTS[tier] || !TALENTS[tier].opts[key] || !G.party[id] || G.party[id].level < TALENTS[tier].lvl || G.coins < cost) return false;
    G.coins -= cost; G.talents = G.talents || {}; (G.talents[id] = G.talents[id] || {})[tier] = key;
    Music.sound("item"); toast(`${G.party[id].name} learns ${TAL_ALL[key].name}.`); save(); updateHud(); return true;
  }
  const talState = u => { const T = battle.tal || (battle.tal = {}); return T[u.id] || (T[u.id] = {}); };
  const talFx = (u, text, col = "#ffcf4a") => { popupText(u, text, col); chRing(u, col); };
  // ---- what they do
  onBattle("attack", ctx => {
    const { att, target } = ctx;
    if (att.side !== "hero" || target.side !== "foe" || !G.talents || !G.talents[att.id]) return;
    const me = talState(att); let mult = 1, word = "";
    if (hasTalent(att.id, "opener") && !me.opened) { mult *= 1.5; word = "First Blood"; }
    if (hasTalent(att.id, "bloodletter") && (target.st.bleed || target.st.brk)) { mult *= 1.3; word = word || "Open Wounds"; }
    if (hasTalent(att.id, "executioner") && !target.dead && target.hp < target.maxHp / 3) { mult *= 1.4; word = "Executioner"; }
    if (hasTalent(att.id, "stormheart") && !target.st.mark && Math.random() < 0.08) { target.st.mark = true; ctx.lentMark = true; }
    ctx.power *= mult; ctx.talWord = word; ctx.wasUp = !target.dead; ctx.tal = true;
  });
  onBattle("hit", (ctx, r) => {
    if (!ctx.tal) return;
    const { att, target } = ctx, me = talState(att);
    if (ctx.lentMark && target.st.mark) delete target.st.mark;   // a dodge leaves the borrowed mark unused
    me.struck = true;
    if (!r || r.dodged) return;
    if (ctx.talWord && !me.said) { me.said = ctx.talWord; talFx(att, ctx.talWord); setTimeout(() => { if (battle) delete talState(att).said; }, 500); }
    if (r.crit && hasTalent(att.id, "stormheart") && !target.dead) { const extra = Math.round(r.dmg * 0.375); if (extra > 0) { damage(target, extra, { noFury: true }); talFx(target, "Storm Heart", "#8ec8ff"); } }
    if (hasTalent(att.id, "momentum") && ctx.wasUp && target.dead) { att.ref.sp = Math.min(att.ref.maxSp, att.ref.sp + 4); addFury(12); talFx(att, "Momentum +4 SP", "#6f8cff"); }
  });
  onBattle("acted", (u, act) => {
    if (u.side !== "hero") return;
    const me = talState(u); if (me.struck) me.opened = true;
    if (act && act.kind === "guard" && hasTalent(u.id, "bulwark") && alive(u)) {
      const h = Math.max(2, Math.round(u.ref.maxHp * 0.1)); u.ref.hp = Math.min(u.ref.maxHp, u.ref.hp + h); u.ref.sp = Math.min(u.ref.maxSp, u.ref.sp + 2);
      talFx(u, `Bulwark +${h}`, "#6fc0d0"); renderCards();
    }
  });
  onBattle("damaged", ctx => {
    const target = ctx.target;
    if (target.side !== "hero" || !G.talents || !G.talents[target.id]) return;
    const me = talState(target), h = target.ref;
    if (h.hp <= 0 && hasTalent(target.id, "laststand") && !me.stand) { me.stand = true; h.hp = 1; talFx(target, "LAST STAND"); shake = Math.max(shake, 8); Music.sound("crit"); }
    if (h.hp > 0 && h.hp < h.maxHp * 0.3 && hasTalent(target.id, "secondwind") && !me.wind) {
      me.wind = true; const heal = Math.round(h.maxHp * 0.25); h.hp = Math.min(h.maxHp, h.hp + heal);
      setTimeout(() => { if (battle) talFx(target, `Second Wind +${heal}`, "#6bff9a"); }, 200);
    }
  });
  // ---- choosing: after a battle, or on the Party screen
  D.talent_0 = { who: null, text: "", choices: [] };
  function talentDialog(id) {
    const tier = pendingTiers(id)[0]; if (tier === undefined) return false;
    const T = TALENTS[tier], h = G.party[id], n = D.talent_0; n.choices.length = 0;
    n.text = `${h.name} has grown on the road (level ${h.level}). A talent of ${T.name}: choose one. It can be changed later on the Party screen for ${TAL_SWITCH} coin.`;
    for (const [k, t] of Object.entries(T.opts)) n.choices.push({ t: `${t.name}: ${t.desc}`, go: () => { const next = G.members.find(m => m !== id && pendingTiers(m).length) || (pendingTiers(id).length > 1 ? id : null); return next ? "talent_0" : null; },
      act: () => { learnTalent(id, tier, k); const next = pendingTiers(id).length ? id : G.members.find(m => pendingTiers(m).length); if (next) talentDialog(next); } });
    n.choices.push({ t: "Decide later (Party screen, P)", go: null });
    openDialog("talent_0"); return true;
  }
  const _endBattleT = endBattle;
  endBattle = function (result, boss) {
    const o = battle ? battle.opts : null;
    const r = _endBattleT(result, boss);
    if (result === "won") setTimeout(() => talentPrompt(o), 800);
    return r;
  };
  function talentPrompt(o) {
    const who = G.members.find(id => pendingTiers(id).length); if (!who) return;
    const busy = mode !== "play" || dlg || battle || (o && (o.boss || o.deep || o.echo || o.weekly)) || (G.flags.deep && G.flags.deep.active);
    if (!busy) { talentDialog(who); return; }
    const key = `${who}:${pendingTiers(who)[0]}`;
    if (G.flags.talentNag !== key) { G.flags.talentNag = key; toast(`${G.party[who].name} can learn a talent: open the Party screen (P).`); }
  }
  const _renderRosterT = renderRoster;
  renderRoster = function () {
    _renderRosterT();
    const cards = [...$("rosterList").children];
    G.members.forEach((id, i) => {
      const wrap = cards[i], h = G.party[id]; if (!wrap || !h) return;
      TALENTS.forEach((T, tier) => {
        if (h.level < T.lvl) return;
        const cur = talentOf(id, tier);
        if (cur) {
          const other = Object.keys(T.opts).find(k => k !== cur), b = document.createElement("button"); b.type = "button"; b.className = "relic";
          b.innerHTML = `${T.name}: <b>${TAL_ALL[cur].name}</b> <small>${TAL_ALL[cur].desc}. Tap to switch to ${TAL_ALL[other].name} (${TAL_SWITCH} coin).</small>`;
          b.addEventListener("click", () => { if (G.coins < TAL_SWITCH) { toast(`Switching a talent costs ${TAL_SWITCH} coin.`); return; } learnTalent(id, tier, other, TAL_SWITCH); renderRoster(); });
          wrap.appendChild(b);
        } else for (const [k, t] of Object.entries(T.opts)) {
          const b = document.createElement("button"); b.type = "button"; b.className = "relic talk";
          b.innerHTML = `★ Learn ${t.name} <small>${T.name} talent: ${t.desc}</small>`;
          b.addEventListener("click", () => { learnTalent(id, tier, k); renderRoster(); });
          wrap.appendChild(b);
        }
      });
      const next = TALENTS.find(T => h.level < T.lvl);
      if (next) { const s = document.createElement("div"); s.className = "bondline"; s.textContent = `Next talent (${next.name}) at level ${next.lvl}.`; wrap.appendChild(s); }
    });
  };
  ACHIEVEMENTS.push(
    ["talent1", "A Path Chosen", "Learn a talent.", () => Object.values(G.talents || {}).some(t => Object.keys(t).length)],
    ["talent4", "Fully Grown", "Give one fighter all four talents.", () => Object.values(G.talents || {}).some(t => Object.keys(t).length >= 4)],
  );
  setTimeout(() => Object.assign(window.__saltRoad || (window.__saltRoad = {}), {
    talents: () => JSON.parse(JSON.stringify(G.talents || {})),
    learn: (id, tier, key) => learnTalent(id, tier, key),
    pendingTalents: () => Object.fromEntries(G.members.map(id => [id, pendingTiers(id)])),
    talentPrompt: () => talentPrompt(null),
    popups: () => popups.map(x => String(x.text)),
  }), 0);

  // Odo's counter had three smithing lines (the forge, arms and armour, the anvil): they sit together under one now
  if (D.odo_0 && Array.isArray(D.odo_0.choices)) {
    const smithy = D.odo_0.choices.filter(c => ["forge_0", "gear_shop", "anvil_0"].includes(c.go));
    if (smithy.length > 1) {
      D.odo_smith = { who: "odo", text: "(Odo nods at the back room, where Ilse's forge still glows.) The forge works for the whole party. Arms and armour get fitted to each fighter. The anvil takes salt shards and champion cores.", choices: [...smithy, { t: "Back to the shop", go: "odo_0" }] };
      const at = D.odo_0.choices.indexOf(smithy[0]);
      D.odo_0.choices = D.odo_0.choices.filter(c => !smithy.includes(c));
      D.odo_0.choices.splice(at, 0, { t: "Smithing: the forge, arms and armour, the anvil", go: "odo_smith" });
    }
  }

