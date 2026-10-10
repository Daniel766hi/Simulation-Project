  // ================================================================== SIDE QUEST: THE GRANARY THIEF
  // Oru's gates are open, but the granary still locks at dusk. Someone small is stealing from it at night.
  const WREN_SACKS = [{ x: 76, y: 18 }, { x: 102, y: 24 }, { x: 88, y: 31 }];
  npc2({ id: "hale", name: "Sergeant Hale", x: 92, y: 30, look: { robe: "#6a5a2a", hair: "#4a3a2a", skin: "#c98d63", style: { hair: "helm", armor: true, beard: true } }, show: () => G.stage >= 8 && !G.flags.epilogue });
  npc2({ id: "wren", name: "Wren", x: 76, y: 30, look: { robe: "#5a4a3a", hair: "#a86a3a", skin: "#d9a070", style: { hair: "fringe", eye: "#3a6a3a" } }, show: () => G.flags.wrenQuest && !G.flags.wrenFate && isNight() && !G.flags.epilogue });
  Object.assign(D, {
    hale_0: say("hale", "(A tired sergeant is counting sacks by lamplight, and getting a different number every time.) Gates are open, the Mayor says. Grain for everyone, the Mayor says. Then why am I still short three sacks every morning?", "hale_1"),
    hale_1: { who: "hale", text: "Somebody's getting into the granary at night. Small. Quick. Knows the drains. Catch the thief and bring them to me, and the watch pays sixty coin. I don't care how. I care about the count.", choices: [
      { t: "\"I'll find them.\"", go: null, act: () => { G.flags.wrenQuest = true; toast("Side quest: find the granary thief in Oru, at night"); save(); updateHud(); } },
      { t: "\"The gates are open. Why is the granary still locked?\"", go: "hale_2" } ] },
    hale_2: say("hale", "Because the Mayor opened the gates and the council kept the keys. Politics. I don't make it. I just count it. ...Find the thief, courier. Please. If the count's short again, it's my stripes.", null, () => { G.flags.wrenQuest = true; toast("Side quest: find the granary thief in Oru, at night"); save(); updateHud(); }),
    hale_wait: say("hale", "Still short. Night's when they come. Lower city, west side, if I had to guess."),
    wren_0: say("wren", "(A girl of eleven or twelve freezes halfway out of a drain, a sack of grain on her back bigger than she is.) Don't. Please. It's not for me. It's for the Wick Street houses. The gates are open, but nobody opened the granary for us.", "wren_1"),
    wren_1: say("wren", "My brother's got the cough. Mrs Anneth has four little ones and no husband since the Rains. The council says there's grain for everyone. Everyone means everyone who can pay the ration fee.", "wren_2"),
    wren_2: { who: "wren", text: "So. Are you going to take me to Hale? He's not cruel. He'll just have to. That's what the watch is for.", choices: [
      { t: "\"I'm sorry. Come with me to the sergeant.\"", go: "wren_turn" },
      { t: "\"Show me where it goes. I'll help you carry.\"", go: "wren_help" },
      { t: "(Ren) \"A magistrate's son can pay a fine and argue a case.\"", go: "wren_ren", req: () => G.members.includes("ren") && G.coins >= 40, reqText: "Ren in the party, 40 coin" } ] },
    wren_turn: say("wren", "(She puts the sack down very carefully, so none spills.) Okay. ...Can you take this to Wick Street first? The blue door. Just this once. Then I'll come.", null, () => { G.flags.wrenFate = "turned"; G.coins += 60; toast("Hale pays sixty coin. He doesn't look happy about it either."); Music.sound("item"); save(); updateHud(); }),
    wren_help: say("wren", "(She stares at you as if you've started speaking another language.) ...Really? There are three more sacks I hid in the city: by the north houses, by the east wall, by the gate road. If you bring them here before morning, I'll get them to Wick Street.", null, () => { G.flags.wrenHelp = true; toast("Carry Wren's three hidden sacks back to her (Oru, at night)"); save(); updateHud(); }),
    wren_ren: say("ren", "(Ren kneels so he's at her height.) I signed warrants for people who stole bread, once. I watched them hang. I'm not doing it again. Sergeant Hale will get a paid fine, a written complaint to the council about the ration fee, and a very long lecture from a magistrate's son.", "wren_ren2"),
    wren_ren2: say("wren", "(She looks from Ren to you.) Is he always like this?", "wren_ren3"),
    wren_ren3: say("sable", "Only when it matters.", null, () => { G.flags.wrenFate = "pardoned"; G.coins -= 40; toast("Ren pays the fine and files a complaint. The council drops the ration fee within the week."); Music.sound("victory"); save(); updateHud(); }),
    wren_wait: say("wren", "Three sacks. North houses, east wall, gate road. Hurry, it'll be light soon."),
    wren_done: say("wren", "(She counts them twice, the way Hale does.) All of them. You carried grain for strangers in the middle of the night. ...Here. It's my mum's thimble. It's the only thing I've got that isn't stolen.", null, () => { G.flags.wrenFate = "helped"; giveRelic("thimble"); Music.sound("victory"); save(); updateHud(); }),
    hale_turned: say("hale", "(Hale won't quite meet your eyes.) The count's right. I let her off with a warning. What else was I going to do? Hang a child for grain? ...Don't tell the council I said that."),
    hale_helped: say("hale", "Count's still short. Three sacks, one night, then never again. Whoever it was, they stopped. I don't want to know. I really, really don't want to know."),
    hale_pardoned: say("hale", "The council dropped the ration fee. The count's short every morning now, officially, by exactly as much as the Wick Street houses eat. I've never been happier to be wrong."),
  });
  Object.assign(RELICS, { thimble: { name: "Wren's Thimble", from: "wren", desc: "+2 speed. Regenerate 2 health each turn.", spd: 2, regen: 2 } });
  const _dialogForW = dialogFor;
  dialogFor = function (n) {
    const f = G.flags;
    if (n.id === "hale") { if (f.wrenFate) return `hale_${f.wrenFate}`; return f.wrenQuest ? "hale_wait" : "hale_0"; }
    if (n.id === "wren") { if (f.wrenHelp) return (f.wrenSacks || []).length >= 3 ? "wren_done" : "wren_wait"; return "wren_0"; }
    return _dialogForW(n);
  };
  const _updateW = update;
  update = function (dt) {
    _updateW(dt);
    const f = G && G.flags; if (!f || mode !== "play" || !f.wrenHelp || f.wrenFate || !isNight()) return;
    WREN_SACKS.forEach((s2, i) => { if ((f.wrenSacks || []).includes(i) || !near({ x: s2.x * TILE + 8, y: s2.y * TILE + 8 }, 14)) return; f.wrenSacks = [...(f.wrenSacks || []), i]; Music.sound("item"); toast(`A sack of grain, hidden under a cart (${f.wrenSacks.length}/3)`); save(); updateHud(); });
  };
  const _extraJournalW = extraJournalHtml;
  extraJournalHtml = function () {
    const f = G.flags; if (!f.wrenQuest) return _extraJournalW();
    const t = f.wrenFate ? { turned: "You brought Wren to Sergeant Hale.", helped: "You helped Wren carry the grain to Wick Street.", pardoned: "Ren paid Wren's fine and the ration fee was dropped." }[f.wrenFate] : f.wrenHelp ? `Carry Wren's hidden sacks back to her at night (${(f.wrenSacks || []).length}/3).` : "Find the granary thief in Oru's lower city, at night.";
    return _extraJournalW() + `<h3>The Granary Thief</h3><p class="dim" style="font-size:13px">${t}</p>`;
  };
  const _extraFatesW = extraFates;
  extraFates = function () { const out = _extraFatesW(), w = G.flags.wrenFate;
    if (w === "helped") out.push("Wick Street eats every night now. Nobody asks where the first three sacks came from. Wren wears a courier's scarf, a size too big.");
    if (w === "pardoned") out.push("The ration fee is gone from Oru's laws. In the margin of the council record, someone has written: 'at the insistence of a magistrate's son, and a thief of eleven.'");
    if (w === "turned") out.push("Wren's brother got over the cough. She still steals, sometimes. Hale still lets her off. They have come to an understanding.");
    return out; };
  const _chronicleW = chronicle;
  chronicle = function () { const P = _chronicleW(), w = G.flags.wrenFate;
    if (w) P.splice(P.length - 1, 0, ["The Granary Thief", { turned: "In Oru, a girl named Wren was caught stealing grain for the poor of Wick Street, and handed to the watch. The watch let her go. History does not record this as a victory for anyone, which is how you know it happened.", helped: "In Oru, the courier caught a thief of eleven carrying grain for Wick Street, and instead of stopping her, carried the rest. A chronicle should not approve of theft. This one declines to comment.", pardoned: "In Oru, Captain Ren paid a child's fine for stolen grain and argued the ration fee out of the city's laws. The best law I ever recorded was written because a thief got caught." }[w]]);
    return P; };
  EPI.hale = () => G.flags.wrenFate ? D[`hale_${G.flags.wrenFate}`].text : "The count's never right. I've stopped minding.";
  ACHIEVEMENTS.push(["wren", "Everyone Means Everyone", "Settle the matter of the granary thief.", () => !!G.flags.wrenFate]);

