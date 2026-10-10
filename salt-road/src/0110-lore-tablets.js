  // ================================================================== LORE TABLETS
  const LORE = [
    { id: 0, x: 6, y: 30, title: "The First Rain", text: "Before Kessa, the Flats were a sea. When it dried, the drowned did not leave. They wait under the salt for water, and they are very patient." },
    { id: 1, x: 27, y: 24, title: "The Nine Sisters", text: "The Well of Nine was dug by nine sisters. Each gave one year of her voice to make the water sweet. The ninth sister kept singing anyway, and became the first Storm-singer." },
    { id: 2, x: 44, y: 40, title: "A Torn Ledger", text: "Guild ledger, torn out: \"Oru gate, dry season. Sold: high-ground plots, 400. Sold: rain insurance, 1,200. Bell tithe: paid by Hollis, personally, in cash.\"" },
    { id: 3, x: 60, y: 34, title: "A Farmer's Carving", text: "Carved into a palm: \"Mother came up when the pond went black. She sings like my mum used to. That is how she gets you. Don't listen. DON'T LISTEN.\"" },
    { id: 4, x: 28, y: 16, title: "The Hymnal Margin", text: "Written in a Choir hymnal: \"Sleep, sleep, the salt is deep. The Bell will ring and you will keep.\" The last line is scratched out. Rewritten in red: \"The Bell will ring and you will WAKE.\"" },
    { id: 5, x: 45, y: 12, title: "The Warden's Oath", text: "An inscription by the river: \"I am the Warden. I remember every rain. If ever I forget, ring the Bell three times beside me, and remind me who I am.\"" },
    { id: 6, x: 66, y: 24, title: "The Courier's Cairn", text: "Every courier who died on the salt has a stone here. The newest stone has no name yet. Someone has scratched a little scarf into it." },
    { id: 7, x: 3, y: 41, title: "Nadia's Marker", text: "An old boundary stone: \"Kessa was founded by the people the Guild left below the waterline. We ring the Bell for everyone, or it is not a bell. It is a lock.\"" },
  ];
  function readLore(l) {
    G.flags.lore = G.flags.lore || [];
    const fresh = !G.flags.lore.includes(l.id);
    if (fresh) { G.flags.lore.push(l.id); G.coins += 4; burst(l.x * TILE + 8, l.y * TILE, "#9ef0f5", 16); Music.sound("item"); }
    D.__lore = say(null, `SALT TABLET · ${l.title.toUpperCase()}\n${val(l.text)}${fresh ? `\n(Tablet ${G.flags.lore.length}/${LORE.length} recorded in your journal. +4 coin.)` : ""}`, null, () => {
      if (fresh && G.flags.lore.length >= 16 && !G.flags.loreBonus2) {
        G.flags.loreBonus2 = true; for (const id of G.members) { G.party[id].maxSp += 2; G.party[id].sp += 2; G.party[id].def += 1; }
        toast("All sixteen tablets read. The salt remembers everything: +2 max SP and +1 defence for the party."); Music.sound("victory");
      }
      if (fresh && G.flags.lore.length >= 8 && !G.flags.loreBonus) {
        G.flags.loreBonus = true; for (const id of G.members) { G.party[id].maxSp += 2; G.party[id].sp += 2; }
        toast("All eight tablets read. The salt remembers you: +2 max SP for the whole party."); Music.sound("victory");
      }
      save(); updateHud();
    });
    openDialog("__lore");
  }

