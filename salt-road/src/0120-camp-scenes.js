  // ================================================================== CAMP SCENES
  // Conversations that play when the party rests, once each, as the story moves on.
  const CAMPS = [
    { id: "camp1", when: () => G.members.includes("ilse") && G.stage >= 2, node: "camp1_0" },
    { id: "camp2", when: () => G.members.includes("maru") && G.stage >= 3, node: "camp2_0" },
    { id: "camp3", when: () => G.members.includes("rook") && G.stage >= 4, node: "camp3_0" },
    { id: "camp4", when: () => G.members.includes("ada") && G.stage >= 5, node: "camp4_0" },
    { id: "camp5", when: () => G.members.includes("ren") && G.stage >= 6, node: "camp5_0" },
  ];
  function campScene() {
    const c = CAMPS.find(c => !(G.flags.camps || []).includes(c.id) && c.when());
    if (!c) return false;
    G.flags.camps = [...(G.flags.camps || []), c.id]; save();
    setTimeout(() => openDialog(c.node), 350);
    return true;
  }
  function interlude(title, text) { card("Meanwhile, in Oru", title, text); }

