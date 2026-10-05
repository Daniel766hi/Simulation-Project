  // ================================================================== COMBAT DEPTH
  // Two rules that reward reading the enemy instead of mashing Attack:
  // 1. Break the charge. A foe winding up a big attack can be staggered by dealing enough damage before it lands:
  //    it loses the attack, is stunned, and is Exposed (takes 25% more) for 2 rounds. The intent shows what's needed.
  // 2. Bosses shake off stuns: after losing a turn to a stun, a boss can't be stunned again for 2 rounds.
  // the prologue is a tutorial: on a first playthrough its fights keep their hand-tuned numbers on every difficulty
  // (New Game+ starts at chapter 0 too, and keeps its scaling)
  const tutorial = () => G.stage === 0 && !(G.ng > 0);
  const _unitFromMonsterX = unitFromMonster;
  unitFromMonster = function (id, i, n) { const u = _unitFromMonsterX(id, i, n); if (tutorial()) u.maxHp = u.hp = MONSTERS[id].hp; return u; };
  const _foeAtkX = foeAtk;
  foeAtk = function (f) { return _foeAtkX(f) / (tutorial() ? DIFFS[difficulty].dmg : 1); };
  const breakNeed = f => Math.round(f.maxHp * (f.boss ? 0.15 : 0.3));
  const winding = f => f.charged || (f.intent && f.intent.release);
  const _damageX = damage;
  damage = function (target, amount, o = {}) {
    const foe = target.side === "foe";
    const dealt = _damageX(target, foe && target.st.exposed ? Math.round(amount * 1.25) : amount, o);
    if (foe && battle && !target.dead && winding(target)) {
      target.chargeDmg = (target.chargeDmg || 0) + dealt;
      if (target.chargeDmg >= breakNeed(target)) {
        target.charged = false; target.chargeDmg = 0; target.intent = { name: "Staggered" };
        target.st.stun = true; target.st.exposed = 3;   // counts down at the start of each round: 2 full rounds
        popupText(target, "BROKEN", "#ffcf4a"); shake = Math.max(shake, 8); Music.sound("crit");
        setTimeout(() => battle && blog(`${target.name}'s attack breaks apart! It staggers, exposed.`), 60);
      }
    }
    return dealt;
  };
  const _chooseIntentX = chooseIntent;
  chooseIntent = function (f) {   // runs once per foe at the start of each round
    for (const k of ["exposed", "stunGuard"]) if (f.st[k] && --f.st[k] <= 0) delete f.st[k];
    if (f.boss && f.st.stun) f.st.stunGuard = 3;   // it loses this turn; immune for the next two
    if (!winding(f)) f.chargeDmg = 0;
    let mv = _chooseIntentX(f);
    // a boss with a big wind-up it rarely reaches uses it every few rounds, so breaking it is part of every boss fight
    const big = f.boss && MONSTERS[f.id].moves.find(m => m.charge && !m.w);
    if (big && battle && !f.charged && !mv.release && !mv.charge && !mv.announce && battle.round >= 3 && battle.round - (f.lastCharge || 0) >= 4) mv = { ...big };
    if (mv.charge && !mv.release) {
      f.lastCharge = battle ? battle.round : 0;
      if (!G.flags.breakTip) { G.flags.breakTip = true; setTimeout(() => toast("Tip: a foe winding up a big attack can be broken. Hit it hard enough before it lands (see BREAK on its card) and it staggers."), 1200); }
    }
    return mv;
  };
  // shown on its own short line above the foe, so three foes' labels don't run into each other
  function breakInfo(f) {
    if (f.st.stun) return "";
    if (winding(f)) return `BREAK: ${Math.max(0, breakNeed(f) - (f.chargeDmg || 0))} more`;
    return f.st.exposed ? "EXPOSED" : "";
  }

