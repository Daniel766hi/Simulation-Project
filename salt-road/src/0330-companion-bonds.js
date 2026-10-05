  // ================================================================== COMPANION BONDS
  // Three conversations per companion, opened from the party screen as the story moves on.
  const BONDS = {
    ilse: { gates: [2, 5, 8], talks: [
      { title: "The Anvil", lines: [
        ["ilse", "(Ilse is filing a nick out of her hammer.) My father was a smith too. A good one, sober. A bad one, drunk. You learned which by how the anvil sounded when you came home."],
        ["sable", "Is that why you became one?"],
        ["ilse", "I became one because at twelve he couldn't lift the hammer any more and someone had to pay his debts. You want to know a secret? The first thing I ever forged by myself was a set of chains. The Guild ordered them, for debtors. I was proud of the welds."],
        ["ilse", "When Voss came asking for hooks and chains last year, I remembered those welds. I remembered being twelve and not asking who they were for. That's why I said no. Not because I'm brave. Because I'd already been a coward once, and I knew exactly what it tasted like."],
      ], ask: { text: "(She looks at you, waiting to see what you'll make of that.)", options: [
        ["\"Refusing the second time still counts.\"", "Maybe. My hands say it cost something, so maybe it counts. Thank you, courier."],
        ["\"You were twelve. You didn't know.\"", "No. But I know now, and knowing is a debt too. You pay it by refusing, every time, for the rest of your life."],
      ] } },
      { title: "Four Months", lines: [
        ["ilse", "My apprentice, Dario. Fourteen. He fed me with a spoon for four months after they broke my hands. Buttoned my shirts. Wiped my face when I cried, which I did, a lot, where he couldn't see. He always saw."],
        ["ilse", "I was so ashamed. Not of the pain. Of needing him. Of being a thing that had to be done for. I'd spent my whole life being the one who does."],
        ["sable", "And now?"],
        ["ilse", "Now I think the shame was the only real injury. The bones healed in four months. The idea that I'm only worth what my hands can do... that one's taking longer. You carry things for people, courier. Do you ever let anyone carry you?"],
      ], ask: { text: "(The fire pops.)", options: [
        ["\"Not often. I'm working on it.\"", "Good. Work on it. It's the hardest weld there is."],
        ["\"I'm letting you, right now.\"", "(She laughs, surprised, and then doesn't say anything for a while. She doesn't need to.)"],
      ] } },
      { title: "After", lines: [
        ["ilse", "When this is over, I want to make something that can't hurt anybody. A bell, maybe. A plough. A cradle for the Reedholm babies, on stilts, so the water can never reach them."],
        ["ilse", "I've spent my whole life making things strong. I want to spend what's left making things gentle. Is that stupid? It feels stupid, saying it out loud."],
        ["sable", "It sounds like the bravest thing you've said."],
        ["ilse", () => `Then here's a braver one: I'm scared I won't get to. ${G.flags.rookDead ? "Rook didn't get to. The dead don't get an after." : "Not everybody gets an after. You've seen that out here."} So I'm going to say it now, in case: you're the best thing that happened to my hands since Dario and his spoon. There. Forged. Can't unforge it.`],
      ] },
    ] },
    maru: { gates: [3, 6, 9], talks: [
      { title: "The Boat", lines: [
        ["maru", "I was six when I first heard the weather. A storm, a whole day early, coming in from the sea that wasn't there any more. I told my mother not to take the boat across the salt lake. She laughed and kissed my head."],
        ["maru", "I heard the boat go down the next afternoon. Not with my ears. With the thing behind my ears. I heard her call my name under the water, and then I heard nothing, for a very long time."],
        ["sable", "Maru..."],
        ["maru", "I don't tell it for pity. I tell it because you asked, once, why I sing instead of talk. Talking is for people who might be believed. Singing is for everyone else. Nobody argues with a song. They just let it into them."],
      ] },
      { title: "Listening", lines: [
        ["maru", "I wasn't born blind. My eyes went slowly, when I was twelve. Sister Vela said it was the gift eating the rest of me. She said a storm-singer stops looking so she can listen."],
        ["maru", "I used to hate her for saying it like a blessing. Now I think she was right, and I still hate it. Both. You can hold both. That's the first thing blindness teaches you: the dark isn't empty. It's full of everything at once."],
        ["sable", "What do you hear, right now?"],
        ["maru", "Ilse's heart, slower than it was a month ago. Kest counting under her breath. The rain arguing with the roof. And you, courier. You're always holding your breath a little, like you're waiting for bad news. You don't have to. It'll come either way. Breathe while you can."],
      ] },
      { title: "The Shape of a Song", lines: [
        ["maru", "You know how my song ends. I told you in the marsh. I want to tell you the rest of it, because nobody ever asks about the middle."],
        ["maru", "The middle is you, dragging a blind girl out of the Butcher's shadow. It's Ilse humming off-key at the forge. It's Rook apologising to pigeons. It's lanterns and bad soup and a smuggler who swears in four languages. That's most of the song. The end is one note."],
        ["maru", "People think knowing your ending makes you a prisoner. It's the opposite. I stopped being afraid the moment I knew. Everything since has been a gift I didn't have to earn."],
      ], ask: { text: "(She waits, facing exactly where you are.)", options: [
        ["\"I'd change your ending if I could.\"", "I know. That's why you're in the middle of my song, and not the end of it. Promise me something: whatever happens, sing badly at my funeral. Loudly. Out of tune."],
        ["\"Then let's make the middle longer.\"", "(Maru smiles.) That's the most storm-singer thing you've ever said. Yes. Let's."],
      ] } },
    ] },
    rook: { gates: [4, 5, 7], talks: [
      { title: "The Orphanage", lines: [
        ["rook", "I grew up in the Guild orphanage in Oru. They taught us arithmetic, archery and gratitude. Mostly gratitude. Every meal, you thanked the Guild for the meal. Every beating, you thanked the Guild for the lesson."],
        ["rook", "Voss visited when I was ten. He watched me shoot and said, 'That one has steady hands and no questions.' He meant it as praise. I spent twelve years living up to it."],
        ["sable", "Steady hands, no questions."],
        ["rook", "I have questions now. I have nothing but questions. It turns out that's much harder to carry than a bow."],
      ] },
      { title: "The Driver", lines: [
        ["rook", "I should tell you about the night on the Flats properly. There was a driver, an old man called Aba. He had a grandson riding on the wagon with him. When the jackals came, Aba threw the boy up onto a rock."],
        ["rook", "Then he turned around and looked at me. Right at me, holding the torch. He didn't beg. He looked at me like he was trying to remember my face so he could tell someone about it later."],
        ["rook", "The boy lived. I made sure of that, after. It's the only thing I did right that night. Aba didn't. I think about that look every time I draw a bow. I think about it when I sleep."],
      ], ask: { text: "(His hands aren't steady now.)", options: [
        ["\"The boy lived because of you.\"", "The boy lived because his grandfather threw him onto a rock. I just didn't shoot. Don't give me more than I earned. It's kind, but it's heavy."],
        ["\"What would Aba want from you now?\"", "(A long silence.) I think he'd want me to be the man he was trying to remember. The one who stood still and looked. Not the one with the torch."],
      ] } },
      { title: "A Letter", lines: [
        ["rook", "(Rook holds out a folded, much-rewritten letter.) It's for Aba's widow. She lives in Kessa, by the west houses. I've written it forty times. It still doesn't say anything worth saying."],
        ["rook", "I'm going to keep it in my quiver. If something happens to me... I'm not being dramatic. The Bog King is going to be ugly, and I'm going to be standing close to it. If something happens, give it to her. Courier's honour."],
        ["sable", "Courier's honour. But you'll give it to her yourself."],
        ["rook", "Maybe. If I do, I'll probably just stand there and look at her. Like Aba looked at me. Maybe that's the letter. Maybe that's all it ever was."],
      ] },
    ] },
    ada: { gates: [4, 7, 10], talks: [
      { title: "Why the Choir", lines: [
        ["ada", "I joined the Choir at fifteen to escape a marriage. A salt baron's son, forty years old, who collected rare birds and liked to keep them in very small cages. I thought I'd be one of them."],
        ["ada", "The Choir took me in because I could hold a note for a minute without breathing. I stayed because the first time I sang the dead to sleep, I felt useful. Not decorative. Useful."],
        ["sable", "And now the Choir is gone."],
        ["ada", "The Choir was always going to be gone. Everything is. What matters is what you do inside the building before it falls down. That's the only theology I have left, and it fits in a pocket."],
      ] },
      { title: "Sleep Is Not Peace", lines: [
        ["ada", "I have a confession, and you're the closest thing to a priest I've got. I sang hundreds of the dead to sleep. I told their families they were at peace."],
        ["ada", "I don't know if that was true. Sleep isn't peace. Sleep is just... not being awake. Maybe they're dreaming. Maybe they're drowning in the dream. I don't know. I never knew. I said 'peace' because the living needed the word."],
        ["ada", "Was that a lie, courier? Or was it a kindness? I've never been able to tell them apart, and I'm starting to think nobody can."],
      ], ask: { text: "(She's really asking.)", options: [
        ["\"A kindness. The living needed it.\"", "Then I'll keep saying it. But I'll say it knowing I don't know. Maybe that's what makes it a prayer instead of a lie."],
        ["\"Maybe the truth would have been kinder.\"", "Maybe. 'I don't know where they are, but I sang to them.' Yes. That's harder to say. It might be truer. I'll try it."],
      ] } },
      { title: "A Whisper", lines: [
        ["ada", "(Ada's voice is almost gone; she whispers, and somehow everyone hears.) I used to think faith was having the answer. Then I thought it was having the question. Now I think it's just... showing up. Singing when your voice is broken."],
        ["ada", "The Choir sisters in the salt, they sang until the salt closed over their mouths. Nobody told them the King would sleep. They didn't know it would work. They just didn't stop."],
        ["ada", "That's what I want for my life. Not to be right. To not stop. Will you remember that, if I don't get to say it again?"],
      ] },
    ] },
    ren: { gates: [6, 7, 9], talks: [
      { title: "High Ground", lines: [
        ["ren", "I was seven when the last small flood came through Kessa. My mother lifted me onto the roof of the salt shed and went back for my sister. The water came up faster than anyone thought. I watched from the roof."],
        ["ren", "That's why I joined the Oru guard. I wanted to stand on the highest wall in the valley. I wanted to be the one who decides who gets lifted onto the roof. I thought if I was the gate, I'd never have to watch again."],
        ["sable", "And instead?"],
        ["ren", "Instead I became the thing that kept the roof locked. Funny how that happens. You build a wall to keep the water out and one day you notice you're keeping the people out too, and the wall doesn't care which."],
      ] },
      { title: "The Bribe", lines: [
        ["ren", "You heard what the ledger said. Hollis paid me to keep the gate shut this season. I want you to know why, and I want you to know it's not an excuse."],
        ["ren", "My sister survived the flood. She has the coughing sickness now, from the salt dust. The medicine costs more than a captain earns in a year. Hollis paid for a year of medicine. I took it."],
        ["ren", "Twelve thousand people waited outside my gate so one woman could breathe. I did the arithmetic every night. It never came out right. It never comes out right. That's how you know you've done something evil: the sums stop working."],
      ], ask: { text: "(He doesn't look away.)", options: [
        ["\"You loved her. That's not nothing.\"", "No. It's not nothing. It's also not enough. Love is how most terrible things get justified, courier. I'd know."],
        ["\"You're paying it back now.\"", "Trying. Some debts you pay off. Some you just carry until you're strong enough to set them down somewhere useful."],
      ] } },
      { title: "What Makes a Gate Good", lines: [
        ["ren", "I've been thinking about gates. A gate isn't good or bad. It's who holds the key, and why, and whether they'll open it when it costs them something."],
        ["ren", "If I had my life again, I'd want to be the kind of gate that opens. Every time. Even when it's expensive. Especially then."],
        ["ren", "(He grins, suddenly young.) Listen to me. Captain Ren, philosopher. My men would laugh me off the wall. Don't tell them. Or do. Maybe they need to hear it more than I do."],
      ] },
    ] },
    kest: { gates: [8, 9, 11], talks: [
      { title: "The Clockmaker's Daughter", lines: [
        ["kest", "My father made clocks for the Guild towers. Perfect clocks. He said a clock doesn't lie, doesn't sleep, doesn't love anyone, and that's why you can trust it."],
        ["kest", "He died at his bench. They found him in the morning with a spring in one hand and a screwdriver in the other. Every clock in the house was still running. I remember thinking: not one of them noticed."],
        ["kest", "I built the clerks to be like his clocks. Things that wouldn't notice. It took me until the hands to understand that was the problem, not the feature."],
      ] },
      { title: "Jonas's Hands", lines: [
        ["kest", "I want to tell you about the day I knew. A clerk came to my workshop for repairs. The brass had worn through on its left arm, and underneath was a hand. A real one, stitched on with wire."],
        ["kest", "It had a wedding ring. Silver, cheap, engraved: J and S. I sat there holding the arm of my own machine and a stranger's wedding ring for an hour. Then I repaired the brass over it. Because that was the job."],
        ["kest", "I did the job, courier. That's the whole confession. I did the job. I think that's how most of the evil in the world gets done: by people doing the job."],
      ], ask: { text: "(She turns a silver ring over in her fingers. She took it.)", options: [
        ["\"Then stop doing the job. You already have.\"", "I have. It's easier than I thought and harder than I deserved. Somebody in Oru named Sela is missing a husband. I think I know whose ring this is."],
        ["\"You kept the ring.\"", "I couldn't give it back to a machine. I couldn't give it back to anyone. I think there's a woman in Oru named Sela who's missing a husband called Jonas."],
      ] } },
      { title: "The Maker's Debt", lines: [
        ["kest", "Can a maker be forgiven by what she made? The clerks can't forgive me. They don't have the part for it. I never built it."],
        ["kest", "So I have to be forgiven by the people they hurt, and most of them are dead, and the rest are right not to. That leaves me forgiving myself, which feels like cheating at cards against a mirror."],
        ["kest", "So I've decided not to be forgiven. I've decided to be useful instead. Forgiveness is a gift. Usefulness is a job. I know how to do a job. This time I'll choose the right one."],
      ] },
    ] },
    nell: { gates: [10, 11, 12], talks: [
      { title: "The Toll Crate", lines: [
        ["nell", "Want to know how I met my father? I was cargo. Somebody left me in a crate at the Oru toll gate, marked 'goods, undeclared.' A baby, in a box, with a note: 'Can't pay the toll. Can't pay for her.'"],
        ["nell", "Maw was smuggling salt past that gate. He opened the crate expecting brandy. He said I screamed at him like a gull, so that's what he called the ship. Not me. The ship. I was just Nell."],
        ["nell", "I've spent my whole life not paying tolls. You understand? The one time somebody paid a toll for me, it was my mother, and she paid it with me."],
      ] },
      { title: "The First Tollman", lines: [
        ["nell", "I killed a man when I was sixteen. Guild tollman at the Kessa ford. He found the kids we were smuggling under the salt sacks and pulled a knife on a little girl."],
        ["nell", "I don't regret it. I want to be clear about that, because everyone expects you to. I regret that he had a knife, and a job, and a boss who told him children were contraband. I regret the world that made us both stand there. Him? No."],
        ["nell", "Maw held me all night after. He said: 'The sea doesn't forgive and it doesn't blame. It just asks what you'll do tomorrow.' I've been answering that question ever since."],
      ], ask: { text: "(She's watching you for judgement.)", options: [
        ["\"You protected a child.\"", "I did. And I'd do it again, and I'd hate it again. Both. That's the toll I do pay."],
        ["\"It still costs you.\"", "It should. The day it stops costing something, I've become the tollman. Da taught me that too."],
      ] } },
      { title: "Home", lines: [
        ["nell", "The Gull is the only home I've ever had, and I'm about to sail her over a whirlpool. You'd think I'd be sad."],
        ["nell", "I'm not. Home isn't a boat. Home's the people who'd go down with you. Da knew that. That's why he never took payment. You don't charge family for passage."],
        ["nell", "So. You lot are family now. Congratulations. Terrible benefits. No pay. Frequent drowning. Welcome aboard."],
      ] },
    ] },
    warden: { gates: [9, 10, 12], talks: [
      { title: "Forgetting", lines: [
        ["warden", "You asked what it was like, when Voss broke my memory. It was not darkness. Darkness is something. It was... a room where you know there used to be furniture. Dents in the carpet. No chairs."],
        ["warden", "I knew I had loved something. I could feel the shape of the love, like a tongue feels the gap of a missing tooth. I did not know what I had loved. That was the worst part. Grief with no name to put it in."],
        ["warden", "When you brought the shards back, I did not feel whole. I felt... accompanied. As if the missing furniture had come back to sit with me."],
      ] },
      { title: "The First Rain", lines: [
        ["warden", "I remember the first rain. Every drop. I remember the Choir singing the King to sleep, and the salt closing over their mouths, and the people on the hills cheering, not knowing what it cost."],
        ["warden", "That is the loneliness of remembering, courier. Everyone who saw it died four hundred years ago. I am the only one left who knows what the high ground cost. I have been carrying it alone for a very long time."],
        ["sable", "You're not carrying it alone now."],
        ["warden", "No. Now I am telling it to you. That is what memory is for, I think. Not to keep. To give away before you break under it."],
      ] },
      { title: "A Question", lines: [
        ["warden", "I have a question I cannot answer, and you are the wisest person I know, which should worry us both. If I could forget the grief and keep the love, should I?"],
        ["warden", "I could forget the Choir's faces in the salt. I could forget the drivers on the Flats. I would still remember that I loved them. I would simply stop hurting."],
      ], ask: { text: "(The crystal in its chest dims, waiting.)", options: [
        ["\"No. The grief is the love, still working.\"", "...Yes. Yes, I think that is it. Grief is love with nowhere to go. If I cut it away, the love would have nowhere to be. I will keep it. Thank you."],
        ["\"Yes. You've carried enough.\"", "Perhaps. But then who would remember what the hills cost? ...No. I think I will keep it a little longer. Until someone else is ready to carry half."],
      ] } },
    ] },
  };
  function bondLevel(id) { return (G.flags.bonds || {})[id] || 0; }
  function bondAvailable(id) {
    const b = BONDS[id]; if (!b || !G.members.includes(id)) return false;
    const n = bondLevel(id); return n < 3 && G.stage >= b.gates[n];
  }
  function startBond(id) {
    const b = BONDS[id], n = bondLevel(id), talk = b.talks[n];
    talk.lines.forEach((ln, i) => {
      const last = i === talk.lines.length - 1;
      D[`bond_${id}_${n}_${i}`] = say(ln[0], ln[1], last ? (talk.ask ? `bond_${id}_${n}_ask` : null) : `bond_${id}_${n}_${i + 1}`, last && !talk.ask ? () => completeBond(id, n) : undefined);
    });
    if (talk.ask) {
      D[`bond_${id}_${n}_ask`] = { who: "sable", text: talk.ask.text, choices: talk.ask.options.map((o, k) => ({ t: o[0], go: `bond_${id}_${n}_r${k}` })) };
      talk.ask.options.forEach((o, k) => { D[`bond_${id}_${n}_r${k}`] = say(id, o[1], null, () => completeBond(id, n)); });
    }
    openDialog(`bond_${id}_${n}_0`);
  }
  function completeBond(id, n) {
    G.flags.bonds = { ...(G.flags.bonds || {}), [id]: n + 1 };
    const h = G.party[id]; if (h) { h.atk += 1; h.def += 1; h.maxHp += 6; h.hp += 6; }
    Music.sound("heal"); toast(`Bond with ${HEROES[id].name}: ${BONDS[id].talks[n].title} (${n + 1}/3). +1 attack, +1 defence, +6 max health.`);
    if (id === "rook" && n === 2) G.flags.rookLetter = true;
    if (id === "kest" && n === 1) G.flags.jonasRing = true;
    save(); updateHud();
  }
  SPEAKERS.sable = "Sable";

