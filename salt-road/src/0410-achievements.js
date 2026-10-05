  // ================================================================== ACHIEVEMENTS (kept across playthroughs)
  const ACHIEVEMENTS = [
    ["first", "First Blood", "Win your first battle.", () => (G.stats && G.stats.wins) >= 1],
    ["ambush", "Courier's Charge", "Ambush monsters with a dash.", () => G.flags.didAmbush],
    ["chain", "All Together", "Use a Chain Assault.", () => G.flags.didChain],
    ["bell", "The Stolen Bell", "Recover the Rain Bell.", () => G.keyItems.bell],
    ["gates", "The Open Gate", "Open the gates of Oru.", () => G.stage >= 7],
    ["wyrm", "Under the Tower", "Slay the Salt Wyrm.", () => G.flags.wyrmDead],
    ["mercy", "Not Your Ledger", "Spare Treasurer Quill.", () => G.flags.quillFate === "spared"],
    ["lore", "What the Salt Remembers", "Read all twenty salt tablets.", () => (G.flags.lore || []).length >= LORE.length],
    ["post", "Special Delivery", "Deliver every letter.", () => LETTERS.every(L => delivered(L.id))],
    ["bond", "By the Fire", "Complete a companion's three bonds.", () => Object.values(G.flags.bonds || {}).some(n => n >= 3)],
    ["bonds", "Family", "Complete three bonds with five companions.", () => Object.values(G.flags.bonds || {}).filter(n => n >= 3).length >= 5],
    ["helper", "Somebody Always Comes", "Finish all six side quests.", () => G.flags.choirDone && G.flags.selaDone && G.flags.joryDone && G.flags.anselRest && G.flags.suriRest && (G.flags.orlaGiven || 0) >= 3],
    ["bounty", "Wanted", "Claim all three bounties.", () => (G.flags.bountiesClaimed || []).length >= 3],
    ["forge", "Salt-Tempered", "Fully upgrade the forge.", () => forgeTier("atk") >= FORGE.atk.cost.length && forgeTier("def") >= FORGE.def.cost.length],
    ["truth", "Four Hundred Years Late", "Read the Apology of Oru to the King.", () => G.flags.apologyRead],
    ["ren", "An Open Door", "Reach the end with Ren alive.", () => G.flags.kingDead && G.members.includes("ren")],
    ["letter", "To Whoever Is Left Below", "Open your mother's letter.", () => G.flags.motherLetter],
    ["explore", "Cartographer", "Explore 90% of the world.", () => (G.flags.fog || "").split("").filter(c => c === "1").length >= FW * FH * 0.9],
    ["endings", "Every Road", "See all four endings.", () => ["ring", "crown", "keeper", "sleep"].every(k => achEndings().includes(k))],
  ];
  function achGot() { try { return JSON.parse(localStorage.getItem("salt-road-ach") || "[]"); } catch { return []; } }
  function achEndings() { try { return JSON.parse(localStorage.getItem("salt-road-endings") || "[]"); } catch { return []; } }
  function checkAchievements() {
    if (!G || mode === "title") return;
    const got = achGot(); let changed = false;
    for (const [id, name, , test] of ACHIEVEMENTS) { let ok = false; try { ok = !!test(); } catch { ok = false; } if (ok && !got.includes(id)) { got.push(id); changed = true; setTimeout(() => toast(`🏆 Achievement: ${name}`), 600 + got.length * 50); } }
    if (changed) try { localStorage.setItem("salt-road-ach", JSON.stringify(got)); } catch { /* storage unavailable */ }
  }
  setInterval(checkAchievements, 2000);
  const _ending2 = ending;
  ending = function (kind) { try { const e = achEndings(); if (!e.includes(kind)) localStorage.setItem("salt-road-endings", JSON.stringify([...e, kind])); } catch { /* storage unavailable */ } _ending2(kind); checkAchievements(); showNGPlus(); };
  function showAchievements() {
    const got = achGot();
    showPanel("Achievements", `<p class="dim" style="font-size:13px;margin:0 0 8px">${got.length}/${ACHIEVEMENTS.length} unlocked, across all your playthroughs. Endings seen: ${achEndings().length}/4.</p><ul style="list-style:none;padding:0;display:grid;gap:6px">${ACHIEVEMENTS.map(([id, name, desc]) => `<li style="padding:6px 10px;border:1px solid var(--edge);border-radius:6px;${got.includes(id) ? "border-color:var(--gold)" : "opacity:.55"}"><b style="color:${got.includes(id) ? "var(--gold)" : "var(--text)"}">${got.includes(id) ? "🏆" : "🔒"} ${name}</b> <span class="dim" style="font-size:12px"> · ${desc}</span></li>`).join("")}</ul>`);
  }

