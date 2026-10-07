// Music for the KP congratulations page.
//  - loop: music/loop.mp3, an upbeat background loop (or config.backgroundMusic if set)
//  - Spotify: an embedded track (config.spotifyTrack); while it plays, the page's own music pauses
// A plain <audio> element is used because iPhones mute Web Audio in silent mode but still play it.
window.GiftMusic = (() => {
  const C = window.GIFT || {};
  const loop = new Audio(C.backgroundMusic || "music/loop.mp3");
  loop.preload = "auto";
  loop.loop = true;
  loop.volume = 0.8;

  let enabled = true;        // the ♫ button
  let spotifyPlaying = false;
  let wantLoop = false;
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());

  // Ask iOS 17+ to treat this page's sound as media playback (ignores the silent switch).
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}

  // Must run inside a tap: lets the loop play later without another tap (iOS).
  function unlock() {
    loop.muted = true;
    const p = loop.play();
    if (p && p.then) p.then(() => { if (!wantLoop) loop.pause(); loop.muted = false; }).catch(() => { loop.muted = false; });
    else { loop.pause(); loop.muted = false; }
  }

  function syncLoop() {
    const on = enabled && wantLoop && !spotifyPlaying;
    if (on && loop.paused) loop.play().catch(() => {});
    if (!on && !loop.paused) loop.pause();
    notify();
  }

  function startLoop() { wantLoop = true; syncLoop(); }

  function setEnabled(on) {
    enabled = on;
    if (on) wantLoop = true;
    syncLoop();
  }

  function setSpotifyPlaying(on) { spotifyPlaying = on; if (on) wantLoop = true; syncLoop(); }

  return {
    unlock, startLoop, setEnabled, setSpotifyPlaying,
    onChange: (fn) => listeners.add(fn),
    get enabled() { return enabled; },
    get spotifyPlaying() { return spotifyPlaying; }
  };
})();
