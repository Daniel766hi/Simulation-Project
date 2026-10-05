  // ================================================================== NEW GAME+
  // what a finished game hands on is kept in storage too, so closing the tab on the ending card doesn't lose it:
  // the title screen offers it until it is used
  const NG_KEY = "salt-road-ngplus";
  function readNGPlus() { try { const c = JSON.parse(localStorage.getItem(NG_KEY)); return c && c.sable && c.ng ? c : null; } catch { return null; } }
  function startNGPlus(carry) {
    newGame(); Object.assign(G, { coins: carry.coins, relics: carry.relics, items: carry.items, forge: carry.forge, ng: carry.ng }); G.party.sable = carry.sable; G.party.sable.hp = G.party.sable.maxHp; G.flags.kills = carry.kills;
    save(); startGame(); toast(`New Game+ ${carry.ng}. The salt remembers you. So do the monsters.`);
  }
  function showNGPlus() {
    let b2 = $("cardBtn2");
    if (!b2) { b2 = document.createElement("button"); b2.id = "cardBtn2"; b2.className = "ghost"; $("card").appendChild(b2); }
    const carry = { sable: JSON.parse(JSON.stringify(G.party.sable)), coins: G.coins, relics: G.relics || [], items: { ...G.items }, forge: { ...(G.forge || {}) }, kills: { ...(G.flags.kills || {}) }, ng: (G.ng || 0) + 1 };
    try { localStorage.setItem(NG_KEY, JSON.stringify(carry)); } catch { /* storage unavailable */ }
    b2.textContent = `New Game+ ${carry.ng}: keep Sable's level, relics, items, coin and forge; monsters grow stronger`;
    b2.hidden = false;
    b2.onclick = () => {
      b2.hidden = true; delete $("cardBtn").dataset.ending; $("cardBtn").onclick = null; $("cardBtn").textContent = "Continue"; $("card").hidden = true;
      startNGPlus(carry);
    };
  }
  const _showNextCard = showNextCard;
  showNextCard = function () { const b2 = $("cardBtn2"); if (b2) b2.hidden = true; _showNextCard(); };
  const _unitFromMonster = unitFromMonster;
  unitFromMonster = function (id, i, n) { const u = _unitFromMonster(id, i, n); const ng = (G && G.ng) || 0; if (ng) { u.maxHp = u.hp = Math.round(u.hp * (1 + 0.35 * ng)); u.atk = Math.round(u.atk * (1 + 0.2 * ng)); u.def += ng; } return u; };

