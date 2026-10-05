  // ================================================================== JOURNAL
  const CHAPTER_LOG = [
    [1, "Prologue", "The Rain Bell was cut from its tower on the last dry night, and Lio died holding the rope. Elder Nadia asked me to carry one last delivery: bring it home, and let it be rung."],
    [2, "I · The Stolen Bell", "Ilse the smith joined me. She saw a Guild coat with a limp on the tower stairs the night the Bell vanished."],
    [3, "II · The Butcher of the Well", "We killed the Well Butcher and saved Maru. She heard Magister Voss carry the Bell into the Salt Cathedral. His blood-seal needs his signet ring."],
    [4, "III · The Drowned Grove", "Rook, Voss's deserter archer, helped us cut the ring out of the Mother of Leeches. The farmers crawled out of the mud alive."],
    [5, "IV · The Salt Cathedral", "Sister Ada joined us. We silenced the Choirmaster and opened the rain-drop door. Voss waits upstairs with the Bell in his chest."],
    [6, "V · The Salt-Flayed", "Voss is salt. With his last breath he named his paymaster: Guild Master Hollis, waiting at the gates of Oru."],
    [7, "VI · The Drowned Gate", "Captain Ren stands with us. One last delivery."],
  ];
  function openJournal() { mode = "journal"; renderJournal(); $("journalUI").hidden = false; Music.sound("click"); }
  function closeJournal() { $("journalUI").hidden = true; mode = "play"; }
  function renderJournal() {
    const esc = t => t.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
    const story = CHAPTER_LOG.filter(([st]) => G.stage >= st - 1 && (st > 1 || G.stage >= 1)).map(([, t, x]) => `<p><b>${t}.</b> ${val(x)}</p>`).join("") || `<p class="dim">Nothing yet. Talk to Elder Nadia.</p>`;
    const lore = G.flags.lore || [], chests = Object.keys(G.flags.chests || {}).length, shards = (G.flags.shards || []).length, camps = (G.flags.camps || []).length;
    const q = [
      [G.flags.charmReturned, G.flags.benoQuest || G.flags.charmReturned, "Find Beno's charm, lost on the salt north-west of Kessa, and return it to him."],
      [G.flags.wardenFree, G.flags.shardQuest, `Recover the Warden's three memory shards (${shards}/3) and free it.`],
      [lore.length === LORE.length, true, `Read the salt tablets scattered across the Flats (${lore.length}/${LORE.length}). Reading eight, then all sixteen, strengthens the party.`],
      [chests === CHESTS.length, true, `Treasure chests found: ${chests}/${CHESTS.length}.`],
      [camps === CAMPS.length, true, `Campfire talks: ${camps}/${CAMPS.length}. Rest with your companions as the story moves on.`],
      [G.flags.tamThanked, G.flags.tamQuest, G.flags.wyrmDead ? "Take Pell's satchel back to his sister Tam in Kessa." : "Find Tam's brother Pell at the old watchtower in the far north-west. Something lives under it."],
      [forgeTier("atk") + forgeTier("def") === 8, true, `The forge in Odo's shop: blades ${forgeTier("atk")}/4, leathers ${forgeTier("def")}/4.`],
    ].filter(([, show]) => show).map(([done, , t]) => `<li class="${done ? "done" : ""}">${done ? "✓ " : ""}${t}</li>`).join("");
    const tabs = LORE.filter(l => lore.includes(l.id)).map(l => `<li><b>${esc(l.title)}.</b> ${esc(val(l.text))}</li>`).join("") || `<li class="dim">None yet. Look for glowing stones.</li>`;
    const kills = G.flags.kills || {};
    const beasts = Object.keys(BESTIARY).filter(k => kills[k]).map(k => `<li class="beast"><img alt="" data-mon="${k}"><span><b>${esc(MONSTERS[k].name)}</b> ×${kills[k]}. ${esc(BESTIARY[k])}</span></li>`).join("") || `<li class="dim">No monsters defeated yet.</li>`;
    const rel = (G.relics || []).map(r => `<li><b>${RELICS[r].name}</b>: ${RELICS[r].desc}${Object.entries(G.equip || {}).find(([, x]) => x === r) ? ` <span class="done">(worn by ${G.party[Object.entries(G.equip).find(([, x]) => x === r)[0]].name})</span>` : ""}</li>`).join("") || `<li class="dim">Bosses drop relics. None yet.</li>`;
    $("journalBody").innerHTML = `${fallenHtml()}<h3>The story so far</h3>${story}<h3>Tasks</h3><ul>${q}</ul><h3>Relics</h3><ul>${rel}</ul><h3>Bestiary (${Object.keys(BESTIARY).filter(k => kills[k]).length}/${Object.keys(BESTIARY).length})</h3><ul>${beasts}</ul><h3>Salt tablets</h3><ul>${tabs}</ul>${extraJournalHtml()}<p class="dim">Difficulty: ${difficulty[0].toUpperCase() + difficulty.slice(1)} (change it on the title screen).</p>`;
  }
  $("journalClose").addEventListener("click", closeJournal);
  $("journalBtn").addEventListener("click", () => { if (mode === "play") openJournal(); });

