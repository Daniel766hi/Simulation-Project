  // ================================================================== DIALOGUE
  const say = (who, text, go, act) => ({ who, text, go, act });
  const D = {
    // ---- Prologue & Chapter I
    nadia_0: say("nadia", "Sable. Thank the salt you're back. Three nights ago someone climbed the bell tower and cut the Rain Bell loose.", "nadia_1"),
    nadia_1: say("nadia", "Without the Bell, Oru will not open its gates when the rains come, and Kessa drowns with the Flats. And since the Bell was taken... the dead have started walking on the salt.", "nadia_2"),
    nadia_2: say("nadia", "The thief's tracks led north, toward the Well of Nine and the old Salt Cathedral. Maru the storm-singer lives at the Well. If anyone heard them pass, she did.", "nadia_3"),
    nadia_3: { who: "nadia", text: "It's a lot to ask of a courier. Will you carry this one last delivery?", choices: [
      { t: "\"I've never dropped a package. I won't start now.\"", go: "nadia_yes" },
      { t: "\"The dead are walking, and you want me to go toward them?\"", go: "nadia_scared" },
    ] },
    nadia_scared: say("nadia", "I want you to go toward them because you always come back. Take these salves. And don't go alone; Ilse has been sharpening things all night.", null, () => { G.items.salve += 2; toast("+2 Salve"); advance(1); }),
    nadia_yes: say("nadia", "Then take these salves, and don't go alone. Ilse the smith has been sharpening things all night. She has her own reasons to hate whoever did this.", null, () => { G.items.salve += 2; toast("+2 Salve"); advance(1); }),
    nadia_wait: say("nadia", "Follow the gold arrow, Sable. And rest at our well whenever you need it. It is the one thing in Kessa that still works."),
    nadia_grove: say("nadia", "The Drowned Grove? My sister married a palm-farmer there. Nobody has heard from the grove in a month."),
    nadia_late: say("nadia", "The Bell! Oh, Sable. But you look like someone who knows the story isn't finished."),

    ilse_early: say("ilse", "Talk to Nadia first. She's by the well, and she's been waiting for you."),
    ilse_0: say("ilse", "So Nadia's sending you north. Good. I'm coming.", "ilse_1"),
    ilse_1: say("ilse", "Last year a Guild magister named Voss ordered me to forge hooks and chains. Big ones. I refused. His men broke my hands. Took me four months to hold a hammer again.", "ilse_2"),
    ilse_2: { who: "ilse", text: "The night the Bell vanished, I saw a Guild coat on the tower stairs. I'd know that limp anywhere. Will you have me?", choices: [
      { t: "\"Welcome to the delivery, Ilse.\"", go: "ilse_join" },
      { t: "\"This isn't about revenge.\"", go: "ilse_join2" },
    ] },
    ilse_join: say("ilse", "Ha. First time anyone's called me cargo. Let's go.", null, () => joinParty("ilse")),
    ilse_join2: say("ilse", "Everything's about something. But fine: first we get the Bell. Then I get my answer.", null, () => joinParty("ilse")),

    odo_0: { who: "odo", text: "Odo's goods! Guaranteed to keep your blood on the inside. What'll it be?", choices: [
      { t: "Salve (heal 22): 6 coin", go: "odo_0", act: () => buy("salve"), req: () => G.coins >= 6, reqText: "6 coin" },
      { t: "Bitter Tonic (stop bleeding, +6 SP): 5 coin", go: "odo_0", act: () => buy("tonic"), req: () => G.coins >= 5, reqText: "5 coin" },
      { t: "Smelling Salts (revive): 10 coin", go: "odo_0", act: () => buy("salts"), req: () => G.coins >= 10, reqText: "10 coin" },
      { t: "Oil Bomb (14 to every enemy): 12 coin", go: "odo_0", act: () => buy("fire"), req: () => G.coins >= 12 && G.stage >= 3, reqText: "12 coin, sold from Chapter III" },
      { t: "The forge (upgrade the whole party's gear)", go: "forge_0" },
      { t: "Leave", go: "odo_bye" },
    ] },
    forge_0: { who: "odo", text: "Ilse left me the keys to her forge. I'm no smith, but I can follow her notes. Every upgrade works for the whole party, including anyone who joins later.", choices: [
      { t: () => forgeLabel("atk"), go: "forge_0", act: () => forge("atk"), req: () => forgeOk("atk"), reqText: () => forgeReq("atk") },
      { t: () => forgeLabel("def"), go: "forge_0", act: () => forge("def"), req: () => forgeOk("def"), reqText: () => forgeReq("def") },
      { t: "Back to the shop", go: "odo_0" },
    ] },
    odo_bye: say("odo", "Come back alive! Dead customers are terrible for business."),
    tam_0: say("tam", "My brother went out on the salt last week to look for the Bell. They found his cart. Not him. Rest at the village well before you go, courier."),
    tam_late: say("tam", "They say you killed the thing at the Well. My brother's hooks were in its apron. Thank you."),
    tam_quest0: say("tam", "Courier. His hooks were in the Butcher's apron, but they never found my brother Pell. His friend says Pell ran north-west, to the old watchtower, where couriers used to shelter.", "tam_quest1"),
    tam_quest1: say("tam", "Nobody goes there now. The drivers say the salt around the tower moves by itself. Something big lives under it.", "tam_quest2"),
    tam_quest2: { who: "tam", text: "Would you look? Even if it's only his satchel. I just want to know.", choices: [
      { t: "\"I'll bring him home, one way or another.\"", go: "tam_quest_yes" },
      { t: "\"Not now. The Bell comes first.\"", go: "tam_quest_no" },
    ] },
    tam_quest_yes: say("tam", "Thank you. The tower is in the far north-west corner of the Flats. Please be careful. Nobody who goes there comes back.", null, () => { G.flags.tamQuest = true; toast("Side quest: find Pell at the old watchtower (north-west)"); save(); updateHud(); }),
    tam_quest_no: say("tam", "...I understand. I'll be here, if you change your mind."),
    tam_wait: say("tam", "The old watchtower, in the far north-west. Please."),
    tam_after: say("tam", "(Tam holds her brother's satchel against her chest for a long time.) He wrote to me. Every night, he wrote to me, and he never sent them. ...Thank you, courier. He'd have liked you. You never drop a package.", null, () => { if (!G.flags.tamThanked) { G.flags.tamThanked = true; G.items.salts += 2; toast("Tam gives you 2 Smelling Salts"); save(); updateHud(); } }),
    wyrm_scene0: say(null, "Around the foot of the tower the salt is moving, rising and falling like breath. A courier's satchel lies half-buried beside the door.", "wyrm_scene1"),
    wyrm_scene1: { who: null, text: "The ground splits. A serpent of crystal and salt as long as a caravan uncoils from beneath the tower and turns its many-toothed head toward you.", choices: [
      { t: "Fight the Salt Wyrm.", go: null, act: () => startBattle(["wyrm"], { boss: "wyrm", area: "flats" }) },
      { t: "Back away slowly.", go: null, act: () => { G.px = 8 * TILE + 8; G.py = 14 * TILE + 8; } },
    ] },
    pell_found: say(null, "Inside the tower you find Pell. He climbed as high as he could, and wrote until the end. His last letter reads: \"Tam. It's under the tower. It wasn't the Guild, not this. It's older. I'm sorry I didn't come home. Tell the courier, whoever they send, the Wyrm's heart is warm. Use it.\"", "pell_found2"),
    pell_found2: say(null, "In the Wyrm's remains, a crystal heart still glows. When you hold it, warmth spreads through the whole party.", null, () => {
      G.flags.wyrmHeart = true; for (const id of G.members) { const h = G.party[id]; h.maxHp += 10; h.hp = h.maxHp; h.atk += 2; }
      G.keyItems.satchel = true; toast("Wyrm Heart: +10 max health and +2 attack for the whole party. Take Pell's satchel to Tam."); Music.sound("victory"); save(); updateHud(); }),
    well_rest: say(null, "You drink from the well and rest a while. Everyone is fully healed, and your progress is saved.", null, () => restParty()),

    corpse_0: say("corpse", "A courier in a torn scarf, half-buried in salt. Their satchel holds a sealed letter: \"To whoever finds this: the Guild man with the limp paid the jackals. He fed them the drivers. Don't let him reach the Cathedral.\"", null, () => { if (!G.flags.corpse) { G.flags.corpse = true; G.items.salve += 1; G.coins += 6; toast("Found a Salve and 6 coin"); save(); } }),
    pilgrim_0: say("pilgrim", "A driver hangs from a leaning pole, hooks through both shoulders. A Guild seal is nailed to the wood: BY ORDER OF THE WELL. Someone left a waterskin at his feet, never opened.", null, () => { if (!G.flags.pilgrim) { G.flags.pilgrim = true; G.items.tonic += 1; toast("Found a Bitter Tonic"); save(); } }),

    // ---- Chapter II
    maru_early: say("maru", "Someone has been circling this pool since dawn, courier, dragging hooks. Don't face him alone. The smith in Kessa has a hammer and a grudge."),
    maru_scene0: say("maru", "Stay back, courier! He's here. He's been circling the pool since dawn.", "maru_scene1"),
    maru_scene1: say("butcher", "The blind witch heard too much. Magister Voss wants her quiet. Go home, little courier, or I'll hang you next to the drivers.", "maru_scene2"),
    maru_scene2: { who: "butcher", text: "No? Then you're meat.", choices: [{ t: "Draw your blade.", go: null, act: () => startBattle(["butcher"], { boss: "butcher", area: "oasis" }) }] },
    maru_after_fight: say("maru", "You smell of his blood, and I can still breathe. Thank you.", "maru_join1"),
    maru_join1: say("maru", "I heard it all that night. A man with a dragging foot, carrying something that rang with every step. Magister Voss. He took the Bell into the Cathedral to wake what sleeps there.", "maru_join2"),
    maru_join2: say("maru", "But the Cathedral door is sealed with his blood-seal. Only his signet ring can break it, and the ring left with his archer when the archer deserted. I hear a bowstring in the Drowned Grove, east of here. And something much bigger breathing in the pond.", "maru_join3"),
    maru_join3: say("maru", "I carry the Memory Lantern. The Cathedral will need its light. I will come with you. My songs are sharper than they sound.", null, () => { joinParty("maru"); G.keyItems.lantern = true; advance(3); card("Chapter III", "The Drowned Grove", "East of the Well the palms grow thick, and the pond has turned black. The palm-farmers have gone quiet. Somewhere among the trees, Voss's archer is hiding with the ring that opens the Cathedral."); }),
    pool_rest: say(null, "You rest by the cool water of the Well of Nine. Everyone is fully healed, and your progress is saved.", null, () => restParty()),

    // ---- Chapter III
    beno_0: say("beno", "Don't come closer! ...You're not Guild. You've got a courier's scarf.", "beno_1"),
    beno_1: say("beno", "Something came up out of the pond. A big mother-thing, all mouths. It took my mum and the other farmers down into the mud. The archer says he can kill it, but not alone.", "beno_2"),
    beno_2: { who: "beno", text: "And I dropped Mum's charm running from the jackals, north-west of Kessa. Could you find it, if you pass that way? It glows.", choices: [
      { t: "\"I'll find your charm, and your mother.\"", go: "beno_yes" },
      { t: "\"Where's the archer?\"", go: "beno_archer" },
    ] },
    beno_yes: say("beno", "The archer's in the east corner of the grove, past the mud. Please hurry.", null, () => { G.flags.benoQuest = true; G.flags.metBeno = true; toast("Side quest: find Beno's charm"); save(); }),
    beno_archer: say("beno", "East corner, past the mud. He shoots anything that moves, so say hello loudly.", null, () => { G.flags.benoQuest = true; G.flags.metBeno = true; save(); }),
    beno_wait: say("beno", "The archer's in the east corner. And my charm is north-west of Kessa, out on the salt."),
    beno_give: { who: "beno", text: "My charm! You found it!", choices: [
      { t: "Give it back.", go: "beno_thanks" },
      { t: "\"Finder's fee: 5 coin.\"", go: "beno_fee" },
    ] },
    beno_thanks: say("beno", "Mum said it keeps hearts strong. It should be with people who fight. Keep it. I'll follow you. I'm good at finding things!", null, () => { G.keyItems.charm = false; G.flags.charmReturned = true; G.flags.benoFollows = true; G.flags.charmBonus = true; for (const id of G.members) { G.party[id].maxHp += 6; G.party[id].hp += 6; } toast("Beno's charm: +6 max health for everyone. Beno follows you."); save(); updateHud(); }),
    beno_fee: say("beno", "That's... all I have.", null, () => { G.keyItems.charm = false; G.flags.charmReturned = true; G.coins += 5; toast("+5 coin"); save(); }),
    beno_saw: say("beno", "The Guild man with the bell? He ran right through the palms before the mother-thing came! He dropped something shiny in the far corner of the grove."),
    beno_after: say("beno", "I'm right behind you!"),
    beno_mum: say("beno", "Mum! She's alive, she's covered in mud but she's alive! You did it!"),

    rook_0: say("rook", "Stop right there. One more step and you'll be wearing an arrow. ...A courier. With Ilse the smith? She hit me with a hammer once. Deserved it.", "rook_1"),
    rook_1: say("rook", "I was Voss's archer. I stood on the Flats and watched him feed caravan drivers to the jackals so no one could say where the Bell went. I took his signet ring and ran. It's the only thing that breaks his blood-seal.", "rook_2"),
    rook_2: say("rook", "Problem: I was hiding in the pond reeds when the Mother of Leeches came up. She swallowed my pack. The ring is inside her.", "rook_3"),
    rook_3: { who: "rook", text: "She's at the south bank of the pond, sleeping off the farmers. Help me cut the ring out of her, and my bow is yours.", choices: [
      { t: "\"Let's go hunting.\"", go: "rook_yes" },
      { t: "\"Why should I trust a man who worked for Voss?\"", go: "rook_trust" },
    ] },
    rook_trust: say("rook", "You shouldn't. Trust the ring. When it's in your hand, you'll know which side I'm on.", "rook_yes"),
    rook_yes: say("rook", "South bank. Bring salves. She bleeds you slowly and drinks what spills.", null, () => { G.flags.metRook = true; save(); updateHud(); }),
    rook_wait: say("rook", "South bank of the pond. I'll be right behind you."),
    mother_scene: say(null, "The mud heaves. Something the size of a cart unfolds from the bank: a pale, glistening sac covered in small round mouths, and in the middle of it, half-digested, the faces of the palm-farmers.", "mother_scene2"),
    mother_scene2: { who: "rook", text: "There she is. Don't let her drink. Go!", choices: [{ t: "Attack the Mother of Leeches.", go: null, act: () => startBattle(["mother"], { boss: "mother", area: "grove" }) }] },
    rook_join: say("rook", "The ring. Still warm. And the farmers are crawling out of the mud, alive, most of them. Here: it's yours. So is my bow.", null, () => { joinParty("rook"); G.keyItems.signet = true; advance(4); card("Chapter IV", "The Salt Cathedral", "With Voss's signet in hand, the blood-seal on the Cathedral door will open. Inside, something is singing without a tongue, and the dead are listening.");
      interlude("The Flooded Gatehouse", "Hollis wades into the black water under the gatehouse, gold coat and all. Something vast and patient opens its mouths around him. When he comes out, he is smiling far too widely, and his guards will not meet his eyes."); }),
    grove_rest: say(null, "The farmers share their fire and dry bread with you. Everyone is fully healed, and your progress is saved.", null, () => restParty()),

    // ---- Chapter IV
    sign_dark: say(null, "The door is sealed with a crust of dried blood shaped like a Guild seal, and inside it is pitch black. You'll need a light, and whatever opens Voss's seal."),
    sign_seal: say(null, "The blood-seal won't yield to steel. Maru says Voss's archer carries the ring that breaks it, somewhere in the Drowned Grove."),
    sign_lock: say(null, "A heavy door with a keyhole shaped like a drop of rain. Scratched into the wood: VOSS ABOVE."),
    ada_0: say("ada", "Stay back, child of the salt. They chained me here to listen. Every night the Choirmaster conducts the dead, and I am supposed to learn the song.", "ada_1"),
    ada_1: say("ada", "I was a sister of the Choir. We sang to keep the dead asleep. Voss paid our Choirmaster to sing them awake instead. I refused. So here I am.", "ada_2"),
    ada_2: { who: "ada", text: "The Choirmaster keeps the rain-drop key in the chest by the east wall. Break my chains, and I will sing against him.", choices: [
      { t: "Break the chains.", go: "ada_join" },
      { t: "\"Can you fight?\"", go: "ada_fight" },
    ] },
    ada_fight: say("ada", "I can pray a man to death if he is already dying. And I can keep your friends standing. Break the chains.", "ada_join"),
    ada_join: say("ada", "Free. Thank you. When he starts the Requiem, brace yourselves. It's the last song most people hear.", null, () => joinParty("ada")),
    choir_scene: say("choirmaster", "A courier in my Cathedral. Stay for the performance. You will be the finale.", null, () => startBattle(["choirmaster", "choir"], { boss: "choirmaster", area: "cathedral" })),
    key_found: say(null, "Inside the chest, wrapped in a bloody Guild sash: a key shaped like a drop of rain."),

    // ---- Chapter V
    voss_0: say("voss", "The courier. Of course they sent the courier. Do you know what the Rain Bell is? It is a leash. Oru rings it and the gates open for peasants, and the high ground goes to everyone.", "voss_1"),
    voss_1: say("voss", "I'd rather own the high ground. The Warden of this Cathedral agreed, once I cut out its memories. Now the salt raises the dead for me, and they are very hungry.", "voss_2"),
    voss_2: { who: "voss", text: "Behind him the chained Warden groans, its crystal heart cracked in three places. Voss smiles with a mouth full of salt.", choices: [
      { t: "Fight Voss now.", go: null, act: () => startBattle(["voss"], { boss: "voss", area: "cathedral" }) },
      { t: "Retreat. Find a way to free the Warden first.", go: "voss_retreat", req: () => !G.flags.wardenFree },
    ] },
    voss_retreat: say("warden", "(A voice in your head, cold as well water.) Courier. He shattered my memory into three shards and threw them to the salt. Find them. Bring them to me, and I will break these chains.", null, () => { G.flags.shardQuest = true; G.flags.shards = G.flags.shards || []; toast("New quest: find the Warden's three memory shards"); G.px = 34 * TILE + 8; G.py = 13 * TILE + 8; save(); updateHud(); }),
    voss_return: { who: "voss", text: "Back again, courier? Did you bring me more meat?", choices: [
      { t: "Fight Voss.", go: null, act: () => startBattle(["voss"], { boss: "voss", area: "cathedral" }) },
      { t: "Not yet. Step back.", go: "voss_back" },
    ] },
    voss_back: say("voss", "Run along. The salt is patient.", null, () => { G.px = 34 * TILE + 8; G.py = 13 * TILE + 8; }),
    warden_free: say("warden", "My memories... I remember now. The rains, the bell-ringers, the children who played on these steps. HE took that from me. Courier, I will stand with you.", null, () => { G.flags.wardenFree = true; toast("The Warden breaks its chains. It will fight beside you against Voss."); save(); }),
    memory_0: say(null, "A memory flickers in the shard: Voss beside the Kessa well at midnight, taking a heavy purse from a fat man in a gold Guild coat. \"Oru stays shut,\" says the fat man. \"The Guild keeps the high ground. Hollis remembers his friends.\""),
    memory_1: say(null, "A memory flickers in the shard: Voss limping between the palms with a bell wrapped in sacking. A boy in a red cap watches from the reeds. Behind Voss, the black pond begins to bubble."),
    memory_2: say(null, "A memory flickers in the shard: Voss kneeling in the Cathedral, bringing a hammer down on a crystal heart. Where the shards land, the dead in the salt begin to twitch."),
    voss_dying: say("voss", "(Voss, collapsing into salt, laughs through a broken jaw.) You think this was mine? Hollis... the Guild Master... he paid for all of it. He's at the gate of Oru now. The rains will drown your village, and he'll drown... everything... else...", null, () => { advance(6);
      interlude("The Drowned Guard", "Captain Ren watches Hollis's personal guard march into the moat, one by one, at their master's command. They do not come up. At midnight they climb out again, grey and dripping, and take their posts. Ren takes off his Guild badge and throws it into the water."); card("Chapter VI", "The Drowned Gate", "Voss is a pillar of salt. The Bell is yours. But the gates of Oru are held by Guild Master Hollis, who has spent the Guild's fortune on a drowning rite. Captain Ren is waiting at the gate, and so is something that used to be a man."); }),

    // ---- camp scenes
    camp1_0: say("ilse", "(By the fire, Ilse turns her hammer over and over.) Four months, Sable. I learned to hold a spoon again before a hammer. My apprentice fed me like a baby.", "camp1_1"),
    camp1_1: say("sable", "You never told anyone who did it.", "camp1_2"),
    camp1_2: say("ilse", "Who would I tell? The Guild owns the magistrate. But now I have a courier. Couriers deliver everything, don't they? Even the truth.", "camp1_3"),
    camp1_3: say("sable", "Especially the truth. It's the heaviest package, and it always gets there."),
    camp2_0: say("maru", "(Maru tilts her head at the sky.) Rain in nineteen days. Heavy rain. The kind that remembers the sea.", "camp2_1"),
    camp2_1: say("ilse", "You can hear that?", "camp2_2"),
    camp2_2: say("maru", "I can hear everything the sky is planning. I heard my mother's boat go down when I was six, a whole day before it happened. Nobody listened. So I stopped talking and started singing.", "camp2_3"),
    camp2_3: say("maru", "The lantern I carry holds one of her memories. When we reach the Cathedral, the Warden will want it. Memories are the only food a Warden eats."),
    camp3_0: say("rook", "(Rook has not touched his food.) I should say it before the Cathedral. I didn't only watch, that night on the Flats. I held the torch. So Voss could see which drivers were still moving.", "camp3_1"),
    camp3_1: say("ilse", "...", "camp3_2"),
    camp3_2: say("ilse", "My hands healed, archer. Yours will take longer. Eat your food. You'll need them to hold a bow.", "camp3_3"),
    camp3_3: say("rook", "(Quietly.) Thank you, smith."),
    camp4_0: say("ada", "(Ada hums while she stitches Rook's sleeve.) The Choir used to sing so the dead would sleep deeply. Not because the dead are evil. Because waking up is cruel when you're only bones.", "camp4_1"),
    camp4_1: say("maru", "And the ones Voss woke?", "camp4_2"),
    camp4_2: say("ada", "Hungry, and frightened, and they don't know why. When we fight them, I pray over every one. It's the only kindness left to give.", "camp4_3"),
    camp4_3: say("sable", "Then pray loudly, Sister. There are a lot of them."),
    camp5_0: say("ren", "(The campfire hisses under the first drops of rain.) Tomorrow the gate. I wanted to say something inspiring. I've got nothing.", "camp5_1"),
    camp5_1: say("ilse", "A smith, a blind singer, a deserter, a nun, a crooked captain and a courier. Nobody would write a song about us.", "camp5_2"),
    camp5_2: say("maru", "I would. I already have the chorus.", "camp5_3"),
    camp5_3: say("rook", "Does it rhyme 'Hollis' with 'polish'? Because I'd like to see his teeth on the floor.", "camp5_4"),
    camp5_4: say("ada", "Rook.", "camp5_5"),
    camp5_5: say("sable", "Tomorrow we deliver the Bell. The last package. Sleep, everyone. I'll keep watch."),
    gate_rest: say(null, "You rest by the soldiers' fire under the gate wall. Everyone is fully healed, and your progress is saved.", null, () => restParty()),
    __sign: say(null, ""),

    // ---- Chapter VI
    ren_0: say("ren", "Halt. The gates of Oru open for the Rain Bell and nothing else. And whatever is walking the salt at night, it isn't getting in either."),
    ren_bell: say("ren", "...The Rain Bell. And blood to the elbows. Listen, courier. I have a confession. Guild Master Hollis paid me to keep this gate shut this season. I took his money.", "ren_bell2"),
    ren_bell2: say("ren", "Then I watched him walk into the flooded gatehouse and come out... wrong. Bloated. Hungry. His guards drowned standing up and kept walking. He means to flood the whole valley and rule whatever floats.", "ren_bell3"),
    ren_bell3: { who: "ren", text: "I kept this gate shut for money. Let me help you open it for good.", choices: [
      { t: "\"Take up your spear, Captain.\"", go: "ren_join" },
      { t: "\"You'll have to earn it.\"", go: "ren_earn" },
    ] },
    ren_earn: say("ren", "Fair. Watch my back, and I'll take the blows meant for yours.", "ren_join"),
    ren_join: say("ren", "Hollis is at the gate itself, waiting for the rain. Let's not keep him waiting.", null, () => { joinParty("ren"); G.flags.renJoined = true; save(); updateHud(); }),
    hollis_scene: say("hollis", "The Rain Bell. How thoughtful of you to bring it to me, courier. When the rains come, I will ring it underwater, and every drowned thing in this valley will kneel to the Guild.", "hollis_scene2"),
    hollis_scene2: { who: "hollis", text: "His jaw splits sideways into a ring of leech-mouths. Water pours from his gold coat. \"Kneel, or be kneeled on.\"", choices: [
      { t: "\"I deliver packages. Not people.\"", go: null, act: () => startBattle(["hollis", "drowned"], { boss: "hollis", area: "gate" }) },
    ] },
    finale_0: say("ren", "It's over. Hollis is foam on the salt. Feel that? Rain. Ring the Bell, courier. Open the gates.", "act2_1"),
    finale_1: { who: "ren", text: "What do you do with the Rain Bell?", choices: [
      { t: "Ring it. Open the gates for everyone.", go: null, act: () => ending("ring") },
      { t: "Take the Guild's seat. Someone has to rule the high ground.", go: null, act: () => ending("seat") },
    ] },
  };
  function dialogFor(n) {
    switch (n.id) {
      case "nadia": return G.stage === 0 ? "nadia_0" : G.keyItems.bell ? "nadia_late" : G.stage === 3 ? "nadia_grove" : "nadia_wait";
      case "ilse": return G.stage < 1 ? "ilse_early" : "ilse_0";
      case "odo": return "odo_0";
      case "tam":
        if (G.flags.wyrmDead) return "tam_after";
        if (G.flags.tamQuest) return "tam_wait";
        if (G.stage >= 3) return "tam_quest0";
        return G.flags.butcherDead ? "tam_late" : "tam_0";
      case "maru": if (G.stage < 2) return "maru_early"; return G.flags.butcherDead ? "maru_after_fight" : "maru_scene0";
      case "beno": if (G.flags.motherDead && !G.flags.sawMum) { G.flags.sawMum = true; return "beno_mum"; }
        if (G.flags.shardQuest && !(G.flags.shards || []).includes(1)) return "beno_saw";
        if (G.flags.charmReturned) return "beno_after"; if (G.keyItems.charm) return "beno_give"; return G.flags.metBeno ? "beno_wait" : "beno_0";
      case "rook": if (G.flags.motherDead) return "rook_join"; return G.flags.metRook ? "rook_wait" : "rook_0";
      case "ada": return "ada_0";
      case "ren": if (G.keyItems.bell && G.stage >= 6) return "ren_bell"; return "ren_0";
      case "corpse": return "corpse_0";
      case "pilgrim": return "pilgrim_0";
    }
    return dialogForAct2(n);
  }
  const SPEAKERS = { sable: "Sable", butcher: "The Well Butcher", voss: "Magister Voss", warden: "The Warden", choirmaster: "The Choirmaster", hollis: "Guild Master Hollis" };

  const FORGE = {
    atk: { name: "Salt-tempered blades", per: "+2 attack", cost: [20, 45, 80, 130], stat: "atk", amount: 2 },
    def: { name: "Riveted leathers", per: "+1 defence, +6 max health", cost: [18, 40, 70, 115], stat: "def", amount: 1 },
  };
  const forgeTier = k => (G.forge || {})[k] || 0;
  const forgeLabel = k => { const f = FORGE[k], t = forgeTier(k); return t >= f.cost.length ? `${f.name}: fully upgraded` : `${f.name} ${"I II III IV".split(" ")[t]} (${f.per}): ${f.cost[t]} coin`; };
  const forgeOk = k => forgeTier(k) < FORGE[k].cost.length && G.coins >= FORGE[k].cost[forgeTier(k)];
  const forgeReq = k => forgeTier(k) >= FORGE[k].cost.length ? "nothing left" : `${FORGE[k].cost[forgeTier(k)]} coin`;
  function applyForge(h, k, times) { for (let i = 0; i < times; i++) { h[FORGE[k].stat] += FORGE[k].amount; if (k === "def") { h.maxHp += 6; h.hp += 6; } } }
  function forge(k) {
    if (!forgeOk(k)) return;
    G.coins -= FORGE[k].cost[forgeTier(k)];
    G.forge = G.forge || {}; G.forge[k] = forgeTier(k) + 1;
    for (const id of G.members) applyForge(G.party[id], k, 1);
    Music.sound("crit"); toast(`${FORGE[k].name} upgraded: ${FORGE[k].per} for everyone.`); save(); updateHud();
  }
  function buy(id) { const it = ITEMS[id]; if (G.coins < it.price) return; G.coins -= it.price; G.items[id] = (G.items[id] || 0) + 1; toast(`Bought ${it.name}`); Music.sound("item"); save(); updateHud(); }
  function joinParty(id) {
    if (G.members.includes(id)) return;
    G.party[id] = makeHero(id);
    const avg = Math.max(1, Math.round(G.members.reduce((s, m) => s + G.party[m].level, 0) / G.members.length));
    for (let i = 1; i < avg; i++) levelUp(G.party[id]);
    if (G.flags.charmBonus) { G.party[id].maxHp += 6; }
    for (const k of ["atk", "def"]) applyForge(G.party[id], k, forgeTier(k));
    if (G.flags.wyrmHeart) { G.party[id].maxHp += 10; G.party[id].atk += 2; }
    G.party[id].hp = G.party[id].maxHp; G.party[id].sp = G.party[id].maxSp;
    G.members.push(id);
    if (G.active.length < 4) G.active.push(id);
    toast(`${HEROES[id].name} joins the party!${G.active.includes(id) ? "" : " Press P to change who fights."}`);
    Music.sound("item");
    if (id === "ilse") { advance(2); card("Chapter II", "The Butcher of the Well", "Ilse shoulders her hammer. North of Kessa the salt is scattered with bones, and something at the Well of Nine has been hanging travellers from the palms.");
      interlude("The Counting House", "Guild Master Hollis counts coins by candlelight. A clerk reports that the Kessa courier has left the village. Hollis does not look up. \"Couriers get lost on the salt all the time,\" he says. \"Send the Butcher a bonus.\""); }
    save(); updateHud();
  }
  function restParty() { for (const id of G.members) { const h = G.party[id]; h.hp = h.maxHp; h.sp = h.maxSp; } G.checkpoint = { x: G.px, y: G.py }; Music.sound("heal"); toast("Rested. Everyone is healed. Progress saved."); save(); updateHud(); campScene(); }
  function advance(stage) { if (G.stage < stage) { G.stage = stage; spawnField(); applyWorldState(); } save(); }

