  // ================================================================== ROAD BANTER
  // Companions talk to each other as you walk. Lines appear in a strip at the bottom and never stop play.
  const BANTER = [
    { id: "b1", need: ["ilse", "maru"], where: "old", lines: [["maru", "Ilse, you're humming again."], ["ilse", "I don't hum."], ["maru", "You hum the same four notes when you're worried. It's a forging song. My mother knew it."], ["ilse", "...What's the rest of it?"], ["maru", "I'll teach you. When you stop being worried."]] },
    { id: "b2", need: ["rook", "ilse"], where: "old", lines: [["rook", "Smith. Why do you carry a hammer that big?"], ["ilse", "Why do you carry a bow that small?"], ["rook", "It's a very good bow."], ["ilse", "It's a very good hammer."], ["sable", "(Neither of them says anything else for an hour. They seem pleased.)"]] },
    { id: "b3", need: ["maru"], night: true, lines: [["maru", "It's night, isn't it. The air goes heavier. People think the blind don't notice night."], ["sable", "What's it like, for you?"], ["maru", "Quieter. The world stops showing off. I like it. It's the only time everyone else is as lost as I am."]] },
    { id: "b4", need: ["ada"], where: "old", lines: [["ada", "(Ada writes on her slate and holds it up: 'The salt sings at night. Did you know?')"], ["sable", "I've lived here my whole life. I never heard it."], ["ada", "(She rubs out the words and writes: 'You have to be quiet for a very long time first.')"]] },
    { id: "b5", need: ["ren", "rook"], lines: [["rook", "A magistrate's son. You ever hang anyone, Captain?"], ["ren", "I signed three warrants. I watched all three. I thought if I signed it I owed it to them to watch."], ["rook", "...Huh. That's more than most."], ["ren", "It's not enough. It was never going to be enough."]] },
    { id: "b6", need: ["kest", "ilse"], where: "oru", lines: [["kest", "Your hammer arm's stiff. I can mix you something."], ["ilse", "Last time you mixed something for someone, it was poison."], ["kest", "That was for the Guild. This is for a friend. Different bottle."], ["ilse", "...Is it the same recipe?"], ["kest", "Mostly. Less of the bad bit."]] },
    { id: "b7", need: ["warden"], where: "old", lines: [["warden", "I walked this ground four hundred years ago. There was a river here, and a city of reed boats."], ["sable", "What happened to it?"], ["warden", "The same thing that happens to everything. Somebody decided they needed the water more than somebody else."]] },
    { id: "b8", need: ["nell", "kest"], where: "south", lines: [["nell", "Poisoner. You ever been on a boat?"], ["kest", "Once. I was sick for three days."], ["nell", "Brilliant. When we get to the Gull, you're on bucket duty."], ["kest", "I could poison you, you know."], ["nell", "You'd miss me. Everyone misses me. It's my great curse."]] },
    { id: "b9", need: ["warden", "maru"], where: "spire", lines: [["maru", "Warden. Did you know the storm-singers? The first ones?"], ["warden", "I knew one. She sang me awake the first time. She had a voice like yours: sharp, and afraid, and she did it anyway."], ["maru", "...Thank you."], ["warden", "It was not a compliment. It was a record. But you may have it as both."]] },
    { id: "b10", need: ["ilse"], where: "oru", lines: [["ilse", "Look at them. Silk. Clean boots. My father made their gates, and they paid him in promises."], ["sable", "Are you going to do something stupid?"], ["ilse", "No. I'm going to do something slow. Slow is worse, for people like them. They're used to fast."]] },
    { id: "b11", need: ["ren"], where: "oru", lines: [["ren", "I grew up there. That house, with the blue roof. I used to watch the lower city from my window and think they were a different kind of people."], ["sable", "And now?"], ["ren", "Now I think I was the different kind. The kind that has a window."]] },
    { id: "b12", need: ["nell"], where: "deep", lines: [["nell", "Look at it. A whole palace. Somebody painted those tiles by hand. Somebody's grandmother, probably, and she thought it would last forever."], ["sable", "It did, sort of."], ["nell", "Nobody wants that kind of forever, courier. Underwater and no one to see it."]] },
    { id: "b13", need: ["kest"], where: "mines", lines: [["kest", "These men were paid in salt. You know what salt does to a wound?"], ["sable", "Stings."], ["kest", "Preserves. They could never heal, and they never rotted either. They just stayed hurt. That's the most Guild thing I've ever heard."]] },
    { id: "b14", need: ["warden"], where: "mines", lines: [["warden", "I remember these tunnels. I was built to guard the door they carried the salt through. I never asked who carried it."], ["sable", "You were a door."], ["warden", "A door does not ask. That is exactly what is wrong with doors."]] },
    { id: "b15", need: ["ada", "maru"], lines: [["maru", "Ada. You're writing. I can hear the chalk."], ["ada", "(She presses the slate into Maru's hands. Maru runs her fingers over the chalk.)"], ["maru", "'Your voice is the only one I miss.' ...Oh. Oh, sister. Mine misses yours too."]] },
    { id: "b16", dead: "rook", need: ["ilse"], lines: [["ilse", "I keep making enough stew for one more."], ["sable", "I know."], ["ilse", "He always said it was terrible. He always ate all of it. I didn't understand that until now."]] },
    { id: "b17", dead: "maru", need: ["ada"], lines: [["ada", "(Ada has written the same word on her slate over and over, very small, until it's grey: SING.)"], ["sable", "Ada?"], ["ada", "(She rubs it out, and then, in a hoarse whisper, for the first time in years, she hums four notes. A forging song.)"]] },
    { id: "b18", dead: "ren", need: ["kest"], lines: [["kest", "He paid my fine, you know. The magistrate's son. Before any of this. I never thanked him."], ["sable", "He knew."], ["kest", "Nobody knows. That's the point of saying it. I'll say it to the gate, next time we're in Oru."]] },
    { id: "b19", need: ["nell", "warden"], night: true, lines: [["nell", "Big fellow. Do you sleep?"], ["warden", "I remember. It is the same thing, for me."], ["nell", "What do you remember?"], ["warden", "Tonight? A girl on a rock in the salt, wrapped in a scarf, four hundred years after everything else. I think I will keep that one."]] },
    { id: "b20", need: ["ilse", "kest", "nell"], where: "south", lines: [["nell", "Right. Vote. Best thing to eat when this is over."], ["ilse", "Bread. Real bread, from Kessa, with salt on top."], ["kest", "Anything I didn't have to test for poison first."], ["nell", "Fish. Obviously fish. ...Courier?"], ["sable", "Whatever we're all eating. At the same table."], ["nell", "Ugh. That's a terrible answer. That's the best answer. I hate you."]] },
  ];
  const banterEl = document.createElement("div");
  banterEl.id = "banter"; banterEl.hidden = true;
  banterEl.style.cssText = "position:absolute;left:50%;transform:translateX(-50%);bottom:48px;max-width:min(560px,calc(100% - 32px));background:rgba(18,15,36,.88);border:1px solid var(--edge);border-radius:8px;padding:6px 12px;font-size:14px;line-height:1.35;z-index:4;pointer-events:none";
  $("toast").parentNode.appendChild(banterEl);
  let banterQ = [], banterT = 0, banterIdle = 20;
  function banterReady() {
    const seen = G.flags.banter || [], here = regionOf(Math.floor(G.px / TILE), Math.floor(G.py / TILE));
    return BANTER.find(b => !seen.includes(b.id) && b.need.every(id => G.members.includes(id)) && (!b.where || b.where === here) && (!b.night || isNight()) && (!b.dead || (G.flags.fallen || []).includes(b.dead)) && (!b.when || b.when()));
  }
  const _updateB = update;
  update = function (dt) {
    _updateB(dt);
    if (!G || G.flags.epilogue) return;
    if (mode !== "play") { if (banterQ.length || !banterEl.hidden) { banterEl.hidden = true; } return; }
    if (banterQ.length) {
      banterT -= dt;
      if (banterT <= 0) { const [who, text] = banterQ.shift(); const nm = who === "sable" ? "Sable" : HEROES[who] ? HEROES[who].name : who; banterEl.innerHTML = `<b style="color:var(--scarf)">${nm}:</b> ${text.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c])}`; banterEl.hidden = false; banterT = 2.2 + text.length * 0.045; }
      return;
    }
    if (!banterEl.hidden) { banterT -= dt; if (banterT <= 0) banterEl.hidden = true; return; }
    banterIdle -= dt;
    if (banterIdle > 0 || !player.moving) return;
    banterIdle = 45;
    const b = banterReady(); if (!b) return;
    G.flags.banter = [...(G.flags.banter || []), b.id]; save();
    banterQ = b.lines.slice(); banterT = 0;
  };

