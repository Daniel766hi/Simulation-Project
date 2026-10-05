  // ================================================================== KEST'S ALCHEMY
  Object.assign(ITEMS, { panacea: { name: "Kest's Panacea", desc: "Heal the whole party by 40 and cure bleeding.", target: "partyItem", healAll: 40, price: 0 } });
  const RECIPES = [
    { out: "gsalve", ins: { salve: 2 }, note: "Two salves, boiled down with salt-moss." },
    { out: "ether", ins: { tonic: 2 }, note: "Two tonics, distilled over a storm-lamp." },
    { out: "phoenix", ins: { salts: 3 }, note: "Three smelling salts, fused in a crucible. It smells like a burning library." },
    { out: "echo", ins: { fire: 1, tonic: 1 }, note: "An oil bomb and a tonic, shaken very carefully." },
    { out: "panacea", ins: { gsalve: 2, ether: 1 }, note: "Kest's masterpiece. She won't say what else goes in it." },
  ];
  const canCraft = r => Object.entries(r.ins).every(([k, n]) => (G.items[k] || 0) >= n);
  function showAlchemy() {
    const rows = RECIPES.map((r, i) => `<div class="slot"><div><b>${ITEMS[r.out].name}</b><small>${Object.entries(r.ins).map(([k, n]) => `${n} ${ITEMS[k].name} (have ${G.items[k] || 0})`).join(" + ")}</small><small>${r.note} ${ITEMS[r.out].desc}</small></div><span class="dim" style="font-size:12px">have ${G.items[r.out] || 0}</span><button type="button" class="pbtn" data-craft="${i}" ${canCraft(r) ? "" : "disabled"}>Brew</button></div>`).join("");
    showPanel("Kest's Alchemy", `<p class="dim" style="font-size:13px;margin:0 0 6px">"Give me your leftovers and ten minutes. Don't watch. It makes me nervous." Kest brews stronger remedies from what you carry.</p>${rows}`);
  }
  $("pauseUI").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.a === "ach") showAchievements();
    if (b.dataset.a === "alchemy") showAlchemy();
    if (b.dataset.craft !== undefined) { const r = RECIPES[Number(b.dataset.craft)]; if (!canCraft(r)) return; for (const [k, n] of Object.entries(r.ins)) G.items[k] -= n; G.items[r.out] = (G.items[r.out] || 0) + 1; Music.sound("item"); toast(`Kest brews ${ITEMS[r.out].name}.`); save(); updateHud(); showAlchemy(); }
  });
  const _pauseGame = pauseGame;
  pauseGame = function () { _pauseGame(); const al = $("pauseMain").querySelector('[data-a="alchemy"]'); if (al) al.disabled = !(G.members.includes("kest") && pausedFrom === "play"); };

