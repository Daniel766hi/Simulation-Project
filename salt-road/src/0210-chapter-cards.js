  // ================================================================== CHAPTER CARDS
  let cardQueue = [];
  let cardHeldToast = null;
  function card(kicker, title, text) { cardQueue.push({ kicker, title, text }); if (mode !== "card") showNextCard(); }
  function showNextCard() {
    const c = cardQueue.shift(); if (!c) return;
    mode = "card";
    if (!$("toast").hidden) { cardHeldToast = $("toast").textContent; $("toast").hidden = true; }   // a card is read on its own; the toast returns after
    $("cardKicker").textContent = c.kicker; $("cardTitle").textContent = c.title; $("cardText").textContent = c.text; setScene(c.title);
    $("card").hidden = false; $("cardBtn").focus({ preventScroll: true });
  }
  function closeCard() {
    if (cardQueue.length) { showNextCard(); return; }
    $("card").hidden = true; mode = battle ? "battle" : "play";
    if (cardHeldToast) { const t = cardHeldToast; cardHeldToast = null; setTimeout(() => toast(t), 200); }
  }
  $("cardBtn").addEventListener("click", () => { if ($("cardBtn").dataset.ending) return; closeCard(); });

