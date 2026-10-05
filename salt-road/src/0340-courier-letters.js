  // ================================================================== COURIER LETTERS
  // Sable is a courier: some people ask you to carry letters. Delivering one reveals a small story.
  const LETTERS = [
    { id: "odo", from: "odo", to: "yusra", when: () => G.stage >= 7, toName: "Yusra in Oru",
      give: "Odo turns his cap over in his hands. \"You're going to Oru? My daughter's there. Yusra. We haven't spoken in nine years. I said some things about her husband. He died last winter. I never wrote. Could you... give her this?\"",
      text: "\"Yusra. I was wrong about him, and I was wrong to say it, and I was wrong to let nine years go by because I was too proud to be wrong. I'm old and the water's rising. If you'll have me, I'll come up the hill. If not, I understand. Your father, who is sorry.\"",
      reply: "(Yusra reads it twice. Then she laughs and cries at the same time.) The stubborn old goat. Nine years. ...Tell him to come up the hill. Tell him I kept his room. Here, for your trouble.", reward: { coins: 40, item: "gsalve" } },
    { id: "bram", from: "bram", to: "tobin", when: () => G.flags.quillDead, toName: "Tobin in the Guild Hall",
      give: "Bram slides a note across the counter. \"My little brother Tobin works for the Guild. Worked. Whatever he does now. We fell out over it. If you see him, give him this. Don't read it. Actually, read it, I don't care.\"",
      text: "\"Tobin. I heard what you did with the ledger pages. I always said the Guild would make you small. I was wrong. You made yourself big, in the worst place, at the worst time. Come home for supper. Mum's recipe. I burned it. Your brother.\"",
      reply: "(Tobin holds the note very carefully, like it's worth more than the grain.) He burned it. Of course he burned it. ...I'll go home for supper. Thank you, courier.", reward: { coins: 30, item: "ether" } },
    { id: "oskar", from: "oskar", to: "nadia", when: () => G.stage >= 9 && G.flags.gulpDead, toName: "Elder Nadia in Kessa",
      give: "Oskar hands you a letter sealed with reed-wax. \"Nadia and I were young together, a long time ago. Before Kessa and Reedholm stopped talking to each other. Before the Guild told us we were different kinds of people. Would you carry this to her?\"",
      text: "\"Nadia. Fifty years ago you said Kessa and Reedholm were one village with a marsh in the middle. I laughed. I was wrong, and the flood has proved it: we drown together or we build together. Come and see the stilts. Bring your people. We have room. We have always had room. Oskar.\"",
      reply: "(Nadia presses the letter to her chest.) Oskar. That old fool. That dear old fool. ...Fifty years. Tell him Kessa is coming. Tell him to build the stilts high.", reward: { coins: 50, item: "phoenix" } },
    { id: "rook", from: null, to: "abawidow", when: () => G.flags.rookDead && G.flags.rookLetter, toName: "Aba's widow in Kessa", auto: true,
      text: "\"To the wife of Aba the driver. I was the archer holding the torch the night your husband died. I did not kill him. I did not save him. I stood there and watched him throw your grandson onto a rock and turn to look at me. I have seen that look every night since. I do not ask forgiveness. I only want you to know that he was brave, and that someone saw it, and that I have tried to spend what is left of my life deserving to have seen it. Rook.\"",
      reply: "(The old woman reads it slowly, lips moving. Then she folds it and puts it inside her dress, over her heart.) He looked at everyone like that. Like he was memorising you. ...Is the archer dead? (You nod.) Then tell the dead I read it. Tell them the boy is fifteen now, and tall, and he still climbs rocks.", reward: { coins: 0, item: null } },
    { id: "liv", from: "saved4", to: "suri", when: () => G.stage >= 12, toName: "the drowned mother in the Deep",
      give: "Liv presses a letter into your hand, fierce and wet-eyed. \"Dad says you're going down to the bottom. Mum's down there. The drowned took her last spring. If you see her... I know it's stupid. Just in case.\"",
      text: "\"Mum. It's Liv. I'm taller now. Dad cries at night when he thinks I'm asleep. We built the stilts higher like you said. The twins can swim. I can throw a spear better than any boy in Reedholm. I'm not scared of the water any more, because you're in it. Sleep well. Don't come back up. We love you too much to see you like that. Liv.\"",
      reply: "(The drowned woman reads it with hands like pale roots. Something in her face, under the brine, becomes a mother's face.) She's taller. She's not scared. ...Then I can sleep. Tell her I heard. Tell her I'm proud. Tell her I won't come back up.", reward: { coins: 0, item: null } },
  ];
  const carrying = id => (G.flags.carry || []).includes(id), delivered = id => (G.flags.delivered || []).includes(id);
  function letterDialog(n) {
    for (const L of LETTERS) {
      if (delivered(L.id)) continue;
      if (carrying(L.id) && n.id === L.to) {
        D.__letterDel = say(null, `You hand over the letter. It reads: ${L.text}`, "__letterRep");
        D.__letterRep = say(n.id, L.reply, null, () => {
          G.flags.carry = (G.flags.carry || []).filter(x => x !== L.id); G.flags.delivered = [...(G.flags.delivered || []), L.id];
          if (L.reward.coins) G.coins += L.reward.coins; if (L.reward.item) G.items[L.reward.item] = (G.items[L.reward.item] || 0) + 1;
          G.flags.courierRep = (G.flags.courierRep || 0) + 1; Music.sound("item");
          toast(`Letter delivered (${G.flags.delivered.length}/${LETTERS.length}).${L.reward.coins ? ` +${L.reward.coins} coin` : ""}${L.reward.item ? `, ${ITEMS[L.reward.item].name}` : ""}`); save(); updateHud();
        });
        return "__letterDel";
      }
      if (!carrying(L.id) && L.from && n.id === L.from && L.when()) {
        D.__letterGive = say(n.id, L.give, null, () => { G.flags.carry = [...(G.flags.carry || []), L.id]; toast(`You carry a letter for ${L.toName}.`); Music.sound("click"); save(); updateHud(); });
        return "__letterGive";
      }
    }
    return null;
  }

