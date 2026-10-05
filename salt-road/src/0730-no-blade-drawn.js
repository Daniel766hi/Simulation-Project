  // ================================================================== NO BLADE DRAWN: PEACEFUL ROADS
  // Two boss fights on the main road can end without one: Ada sings the Choirmaster's dead to rest, and Nell
  // sings her drowned father his own shanty. A peace is worth what the fight was worth.
  function peaceWin(boss, group) {
    grantRelic(boss);
    const xp = group.reduce((s, id) => s + MONSTERS[id].xp, 0), coins = group.reduce((s, id) => s + MONSTERS[id].coin[0], 0), ups = [];
    G.coins += coins;
    for (const id of G.members) {
      const h = G.party[id]; h.xp += xp;
      while (h.xp >= xpNeed(h.level)) { h.xp -= xpNeed(h.level); levelUp(h); ups.push(`${h.name} reaches level ${h.level}`); const ult = HEROES[id].skills.find(sk => sk.lvl === h.level); if (ult) ups.push(`${h.name} learns ${ult.name}`); }
    }
    G.flags.spared = [...new Set([...(G.flags.spared || []), boss])];
    Music.sound("victory"); toast(`No blade drawn. +${xp} XP, +${coins} coin.${ups.length ? " " + ups.join(". ") + "." : ""}`); save(); updateHud();
  }
  const fightChoir = () => startBattle(["choirmaster", "choir"], { boss: "choirmaster", area: "cathedral" });
  D.choir_scene = { who: "choirmaster", text: "A courier in my Cathedral. Stay for the performance. You will be the finale.", choices: [
    { t: "Draw your blade. (Fight)", go: null, act: fightChoir },
    { t: "Let Ada sing the dead to rest.", go: "choirp_0", req: () => inParty("ada"), reqText: "Sister Ada with you" } ] };
  Object.assign(D, {
    choirp_0: say("ada", "(Ada steps into the aisle and begins the sleeping-words, the ones the Choir taught her to say over the dying. Row by row, the drowned singers close their sewn mouths and sit down in the pews.)", "choirp_1"),
    choirp_1: say("choirmaster", "Stop. STOP. They are mine, I paid for every voice... (His baton conducts nothing. The nave is silent.) ...Do you know what silence sounds like, to a conductor? It sounds like being dead.", "choirp_2"),
    choirp_2: say("ada", adaLine("It sounds like rest. You taught me that, before you sold them. Put the baton down.", "It sounds like rest. You taught me that, before you sold them. Put the baton down."), "choirp_3"),
    choirp_3: say(null, "(He looks at the bone baton for a long time. Then he snaps it across his knee, sits down in the last pew among his choir, and does not get up again. Behind the altar, the chest clicks open.)", null, () => {
      peaceWin("choirmaster", ["choirmaster", "choir"]); G.flags.choirDead = true; G.flags.choirSpared = true; save(); toast("The Choirmaster's song is over. Open the chest."); }),
  });
  const mawOK = () => { const c = G.flags.creed || {}; return bondLevel("nell") >= 1 || c.mercy === "mercy" || c.many === "one"; };
  D.maw_scene4.choices = [...D.maw_scene4.choices, { t: "Let Nell sing him his own shanty.", go: "mawp_0", req: mawOK, reqText: "Nell's trust (a bond talk), or a creed of mercy" }];
  Object.assign(D, {
    mawp_0: say("nell", "(Nell sheathes the cutlass and starts to sing, badly, the smuggler's shanty he taught her on the Gull: 'No toll on the tide, no toll on the sky, no toll on the children who can't pay to fly...')", "mawp_1"),
    mawp_1: say("maw", "(The eels go still. The great drowned head tilts.) ...That's wrong. You're flat on the turn. You were always flat on the turn. (A sound comes out of him that might once have been a laugh.) Nellie. What have I been doing down here?", "mawp_2"),
    mawp_2: say("nell", "Nothing you can't stop, Da. Come up. Or rest. But not this.", "mawp_3"),
    mawp_3: say("maw", "(He lays the anchor across his knees.) I can't come up, girl. His water's in me. But I can stop. Cut the chain yourself; I'd like it to be you. And Nellie... don't pay the toll. Not theirs, not his. Not anybody's.", "maw_after2",
      () => { peaceWin("maw", ["maw", "sailor"]); G.flags.mawDead = true; G.flags.mawSpared = true; save(); }),
  });
  ACHIEVEMENTS.push(["peace", "No Blade Drawn", "End the Choirmaster's and Captain Maw's stories without a fight.", () => G.flags.choirSpared && G.flags.mawSpared]);
  const _extraFatesS3 = extraFates;
  extraFates = function (k) {
    const out = _extraFatesS3(k), f = G.flags;
    if (f.ledgerFate === "burned") out.push("The Guild's ledger burned in one night. For a year nobody in the valley owes anybody anything, and nobody lends anybody anything either. Then, slowly, people start trusting each other with small sums, and writing nothing down.");
    if (f.ledgerFate === "returned") out.push("Every page of the Guild's ledger went home to the name written on it. Some were burned, some forgiven, a few paid in full out of stubborn pride. Nobody tells anybody else what to do with theirs.");
    if (f.ledgerFate === "council") out.push("The Lowland Fund rebuilds three drowned villages in ten years, and prints its accounts on the town hall door. Every generation someone asks whether it is just the Guild again, and every generation the door is checked.");
    if (f.choirSpared) out.push("The Choirmaster never leaves the last pew of the Salt Cathedral. Pilgrims say that, for the rest of his life, he hums the sleeping-words under his breath, and that the Cathedral is the quietest place in the valley.");
    if (f.mawSpared) out.push("On the Gull's rail, under her father's name, Nell carves a second line: HE STOPPED.");
    return out;
  };
  const _extraJournalS3 = extraJournalHtml;
  extraJournalHtml = function () {
    const f = G.flags, rows = [];
    if ((f.kdreams || 0) > 0) rows.push(`<li>${["", "A man in dark water, handing out cups all the same size.", "The water rising, and a bell ringing under it.", "A choir singing him down, and a question you woke before hearing."].slice(1, (f.kdreams || 0) + 1).join(" ")}</li>`);
    const led = G.stage >= 10 && f.quillDead ? (f.ledgerFate ? `<li class="done">✓ The Guild's Master Ledger: ${{ burned: "burned in the plaza", returned: "every page returned to the name on it", council: "given to Mayor Ines's Lowland Fund" }[f.ledgerFate]}.</li>` : `<li>Tobin holds the Guild's Master Ledger in Oru's Guild Hall. Decide what happens to it.</li>`) : "";
    return _extraJournalS3() + (rows.length ? `<h3>Dreams</h3><ul>${rows.join("")}</ul>` : "") + (led ? `<h3>The Master Ledger</h3><ul>${led}</ul>` : "");
  };

