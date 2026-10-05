  // ================================================================== THE MASTER LEDGER: A RECKONING WITH THE GUILD
  // Once the King's story is known, Tobin the clerk shows Sable the Guild's Master Ledger. Its first entry is
  // Aurel himself, written down as a debt for the sea to collect. Sable decides what happens to every debt in
  // the valley before going down to answer the King.
  Object.assign(D, {
    led_0: say("tobin", "(Tobin has moved into the counting room. He eats bread over an open ledger the size of a door.) Courier. I've been waiting for somebody to ask what this is. It's everything. Every debt the Guild ever wrote, from the first page to Quill's last line.", "led_1"),
    led_1: say("tobin", "The rakers' salt contracts. The farmers' rain insurance. 'Hands collected.' Mayor Ines wants it for the trials. The families who lent the Guild their savings want it kept, because it says what they're owed. And the debtors want it at the bottom of the sea.", "led_2"),
    led_2: say("tobin", "Here's the part I can't stop reading. The first entry, four hundred years old, brown ink: 'AUREL, king. Refused the sale of water. Debt: the lowlands, and everyone in them. To be collected by the sea.' (He looks up.) They wrote him down as a debt, courier. Then they let the sea collect.", "led_3"),
    led_3: { who: "tobin", text: "Nobody else will decide. Everyone agrees it should be the courier who opened the gate. So: what do we do with it?", choices: [
      { t: "\"Burn it. Every page. Nobody owes the Guild anything, ever again.\"", go: "led_burn" },
      { t: "\"Give every page to the person it names. Let them decide what their debt is worth.\"", go: "led_return" },
      { t: "\"Give it to Mayor Ines. The debts get paid to a fund that rebuilds the lowlands, not to the Guild.\"", go: "led_council" },
      { t: "\"Not yet. I need to think.\"", go: null } ] },
    led_burn: say(null, "(The ledger burns all night in the plaza. Debtors come from every corner of Oru to watch; some of them dance. A widow who lent the Guild her husband's savings stands at the edge of the light with nothing in her hands.)", "led_burn2"),
    led_burn2: say("tobin", "Nobody owes anybody now. I wonder who'll lend anybody anything next year. ...It was still right. I think it was still right.", null, () => ledgerDecided("burned")),
    led_return: say(null, "(It takes Tobin and a dozen volunteers forty days to cut the ledger into pages and carry each one to the name written on it. Some people burn theirs. Some frame it. At the salt pans, a raker tears her grandmother's contract in half and uses it to start the evening fire.)", "led_return2"),
    led_return2: say("tobin", "Slow justice. Every page its own small trial, judged by the person it happened to. It's the only kind I trust.", null, () => ledgerDecided("returned")),
    led_council: say(null, "(Mayor Ines takes the ledger with both hands. The debts will still be paid, she promises, but to the Lowland Fund, which will rebuild the drowned farms and dig new wells. The Guild's collectors are hired back at lower wages, in new coats.)", "led_council2"),
    led_council2: say("tobin", "The same pen in a kinder hand. That's either how the world gets better or how the next Guild begins. I'll write it all down, either way.", null, () => ledgerDecided("council")),
    led_after: say("tobin", () => ({ burned: "The plaza still smells of smoke. People keep asking me what they owe. I tell them: nothing. They don't believe me yet.",
      returned: "Page four thousand and twelve delivered this morning. Four thousand to go. My feet hurt. I have never been happier.",
      council: "The Lowland Fund's first well is dug. The collectors grumble about their wages. I write down every coin, where anyone can read it. That part is new." })[G.flags.ledgerFate]),
  });
  { const t0 = D.tobin_0, go0 = t0.go; t0.go = () => G.stage >= 10 && !G.flags.ledgerFate ? "led_0" : val(go0); }   // meeting Tobin late runs straight on into the ledger
  function ledgerDecided(fate) { G.flags.ledgerFate = fate; Music.sound("item"); toast("The Guild's Master Ledger: decided."); save(); updateHud(); }
  const _dialogForLed = dialogFor;
  dialogFor = function (n) {
    if (n.id === "tobin" && G.stage >= 10) return !G.flags.tobinThanked ? "tobin_0" : G.flags.ledgerFate ? "led_after" : "led_0";
    return _dialogForLed(n);
  };
  // the dive waits until the valley's debts are decided: the King's question is about exactly those people
  { const w = WARPS.find(w => w.x === 117 && w.y === 86);
    if (w) { const req = w.req, msg = w.msg; w.req = () => req() && !!G.flags.ledgerFate;
      Object.defineProperty(w, "msg", { get: () => req() ? "Before you go down to answer the King, decide what happens to the Guild's Master Ledger. Tobin has it, in Oru's Guild Hall." : msg }); } }
  const _goalLed = goal;
  goal = function () {
    const t = _goalLed();
    if (G.stage === 12 && G.flags.bellReady && !G.flags.kingDead && !G.flags.ledgerFate && !G.flags.epilogue && !G.flags.job)
      return { ch: t.ch, text: "Before the dive: Tobin holds the Guild's Master Ledger in Oru's Guild Hall. Decide what happens to every debt in the valley.", x: 79, y: 5 };
    return t;
  };

