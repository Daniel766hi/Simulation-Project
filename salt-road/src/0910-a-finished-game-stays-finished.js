  // ================================================================== A FINISHED GAME STAYS FINISHED
  // At an ending the game hands its gear and tempering back as coin (for New Game+) and deletes the save. Daily
  // tasks, gifts and renown kept saving afterwards, which wrote that stripped game back: a reload offered "Continue"
  // into Chapter XII with the gear gone. Now nothing is saved from the ending until a new game or the epilogue.
  let gameDone = false;
  const _saveDone = save;
  save = function () {
    if (gameDone) return;
    _saveDone();
    // a New Game+ run starts before Chapter I, where a reload begins afresh: its offer stays on the title until then
    if (G && G.ng && G.stage > 0) { const c = readNGPlus(); if (c && c.ng <= G.ng) try { localStorage.removeItem(NG_KEY); } catch { /* storage unavailable */ } }
  };
  const _endingDone = ending;
  ending = function (kind) { gameDone = true; return _endingDone(kind); };
  const _finalCreditsDone = finalCredits;
  finalCredits = function () { gameDone = true; return _finalCreditsDone(); };
  const _startEpilogueDone = startEpilogue;
  startEpilogue = function (kind) { gameDone = false; return _startEpilogueDone(kind); };
  const _newGameDone = newGame;
  newGame = function (persist) { gameDone = false; return _newGameDone(persist); };

  // ---- the title screen: what Continue leads to, and New Game+ when a finished game left one
  const titleCss = document.createElement("style");
  titleCss.textContent = "#saveSum{margin:-4px 0 0;max-width:68ch;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}#saveSum b{color:var(--text);font-weight:500}"
    + "#ngBtn{border-color:var(--gold);color:var(--gold)}.screen .ghost.armed{border-color:var(--blood);color:#ffb3bf}.screen .ghost:focus-visible{outline:2px solid var(--gold);outline-offset:2px}";
  document.head.appendChild(titleCss);
  const sumEl = document.createElement("p"); sumEl.id = "saveSum"; sumEl.hidden = true;
  $("startBtn").insertAdjacentElement("afterend", sumEl);
  const ngBtn = document.createElement("button"); ngBtn.id = "ngBtn"; ngBtn.className = "ghost"; ngBtn.type = "button"; ngBtn.hidden = true;
  $("newBtn").insertAdjacentElement("afterend", ngBtn);
  let ngArmed = 0;
  function titleSummary() {
    if (mode !== "title" || !G) return;
    const has = G.stage > 0, t = has ? goal() : null;
    sumEl.hidden = !has;
    if (has) sumEl.innerHTML = `<b>${t.ch || "The Salt Road"}</b> · ${fmtTime(G.stats && G.stats.time)} played · ${G.members.map(id => `${G.party[id].name} ${G.party[id].level}`).slice(0, 4).join(", ")}${G.members.length > 4 ? ` +${G.members.length - 4}` : ""}${G.ng ? ` · New Game+ ${G.ng}` : ""}`;
    const c = readNGPlus();
    ngBtn.hidden = !c;
    if (c) ngBtn.textContent = `New Game+ ${c.ng}: Sable at level ${c.sable.level}, with your relics, items, coin and forge`;
  }
  ngBtn.addEventListener("click", () => {
    const c = readNGPlus(); if (!c) { titleSummary(); return; }
    if (G.stage > 0 && Date.now() - ngArmed > 5000) { ngArmed = Date.now(); ngBtn.textContent = "This replaces your saved game. Press again to begin New Game+"; ngBtn.classList.add("armed"); setTimeout(() => { if (Date.now() - ngArmed >= 5000) { ngBtn.classList.remove("armed"); titleSummary(); } }, 5000); return; }
    ngBtn.classList.remove("armed"); startNGPlus(c);
  });
  setTimeout(titleSummary, 0);
  localStorage.ready.then(() => setTimeout(titleSummary, 0));

  // ---- coming back after a while: the last page of Tobin's Chronicle and where the road was heading
  const AWAY = 60 * 60 * 1000;
  const _saveSeen = save;
  save = function () { if (G && mode !== "title") G.lastPlayed = Date.now(); _saveSeen(); };
  const _startGameRecap = startGame;
  startGame = function () {
    const away = G && G.stage > 0 && !G.flags.epilogue && G.lastPlayed && Date.now() - G.lastPlayed >= AWAY;
    _startGameRecap();
    if (!away) return;
    const pages = chronicle().filter(([h]) => h), [head, text] = pages[pages.length - 1] || ["", ""], t = goal();
    card("Previously", head || t.ch || "The Salt Road", `${text}${t.text ? ` Where the road leads now: ${t.text}` : ""}`.trim());
  };

