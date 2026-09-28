// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to personalise the birthday page.
//  Everything the page shows comes from here.
// ─────────────────────────────────────────────────────────────
window.BIRTHDAY = {
  // Your best friend's name (shown big at the top)
  name: "Sherryn",

  // Who it's from (shown at the end of the letter)
  from: "Your best friend, Daniel",

  // Optional: their birthday, shown under the title. Leave "" to hide.
  date: "30 September",

  // A short line under the title
  tagline: "Another year of you, and the world is better for it.",

  // The letter. Each item is one paragraph.
  letter: [
    "Happy birthday! I wanted to make you something a little different this year, so here it is: a small corner of the internet that is only about you.",
    "Thank you for all the laughs, the late-night talks, and for always showing up. I'm so lucky to call you my best friend.",
    "From climbing Andong in the dark to sunsets at Prambanan and shouting along at concerts, every adventure is better with you. Here's to another year of them.",
    "I wish you all the best for your wlw life. You certainly deserve better, and I hope this year gives you exactly that."
  ],

  // Photos: put the image files in the  birthday/photos/  folder,
  // then list them here. "caption" is optional. "pos" (optional) moves the
  // square crop on the photo wall, e.g. "center 70%" to show lower down.
  photos: [
    { file: "01-andong-summit.jpg",    caption: "We made it to the top of Andong!" },
    { file: "02-prambanan-sunset.jpg", caption: "Golden hour at Prambanan", pos: "center 70%" },
    { file: "03-prambanan-field.jpg",  caption: "Main character energy" },
    { file: "04-prambanan-pose.jpg",   caption: "Posing like a pro", pos: "center 70%" },
    { file: "05-concert-crowd.jpg",    caption: "Concert night" },
    { file: "06-concert-selfie.jpg",   caption: "Front row attitude" },
    { file: "07-concert-blur.jpg",     caption: "Too hyped to hold the camera still" },
    { file: "08-concert-stage.jpg",    caption: "Screaming every lyric" },
    { file: "09-festival-silly.jpg",   caption: "Serious faces only" },
    { file: "10-cafe-rock.jpg",        caption: "Rock on" },
    { file: "11-cafe-thinking.jpg",    caption: "Deep in thought (not really)" },
    { file: "12-mirror.jpg",           caption: "Spot the photobomber" }
  ],

  // Lyrics shown line by line while the birthday song plays ({name} becomes the name above).
  songLyrics: [
    "Selamat ulang tahun",
    "Selamat ulang tahun",
    "Selamat ulang tahun, {name}",
    "Selamat ulang tahun"
  ],

  // Background music. Leave "" for the built-in upbeat loop (music/loop.mp3), or put an
  // audio file in the music folder (e.g. "music/other.mp3") to loop that instead.
  backgroundMusic: "",

  // The song for her, played through Spotify's own player. This is the ID at the end of the
  // Spotify link (open.spotify.com/track/<ID>). Leave "" to hide the section.
  // Now: "Semua Aku Dirayakan" by Nadin Amizah.
  spotifyTrack: "4rcuS31IcZynp91dqvmhmA",
  spotifyNote: "Putar ini sambil baca suratnya ya 💌",

  // Hidden under the scratch card at the very end (scratch to reveal). Use \n for a new line.
  secretMessage: "Kamu resmi naik level! 🎉\nSemoga tahun ini penuh ketawa, petualangan seru, dan orang-orang yang pantas buat kamu. 💖",

  // "Sherryn Wrapped": full-screen story slides (tap right/left, hold to pause).
  // Each slide: kicker (small line), big (large text), sub (line under it), optional photo,
  // optional count (a number that counts up, shown instead of "big"), optional bg (CSS background).
  wrapped: [
    { kicker: "presenting", big: "Sherryn Wrapped 🎁", sub: "edisi ulang tahun", bg: "linear-gradient(160deg,#e8567a,#f4a13a)" },
    { kicker: "titik tertinggi kita", count: 1692, big: "mdpl", sub: "Puncak Alap-Alap, Gunung Andong ⛰️", photo: "01-andong-summit.jpg", bg: "linear-gradient(160deg,#3b2a6b,#8f5bd6)" },
    { kicker: "spot golden hour favorit", big: "Prambanan 🛕", sub: "matahari terbenam, tapi kamu yang bersinar", photo: "02-prambanan-sunset.jpg", bg: "linear-gradient(160deg,#f4a13a,#e8567a)" },
    { kicker: "genre andalan", big: "Konser & festival 🎸", sub: "ikut teriak di setiap lagu", photo: "06-concert-selfie.jpg", bg: "linear-gradient(160deg,#1f1b2e,#e8567a)" },
    { kicker: "pose paling sering", big: "🤘 ✌️", sub: "metal hands & peace sign. klasik.", photo: "10-cafe-rock.jpg", bg: "linear-gradient(160deg,#2f8f6f,#7bc8a4)" },
    { kicker: "lagu buat kamu", big: "Semua Aku Dirayakan", sub: "Nadin Amizah 🎧", bg: "linear-gradient(160deg,#6fa8dc,#c38fe0)" },
    { kicker: "5 kata tentang kamu", big: "baik · jujur · terus terang · impulsif · lucu", sub: "(impulsifnya pakai haha)", bg: "linear-gradient(160deg,#c38fe0,#e8567a)" },
    { kicker: "30 september", big: "Semua kamu dirayakan.", sub: "Happy birthday, Sherryn 💖", photo: "11-cafe-thinking.jpg", bg: "linear-gradient(160deg,#e8567a,#ffb84d)" }
  ],

  // The "Balas ke Daniel" button at the end opens WhatsApp with this message ready to send.
  replyText: "DANIEL 😭💖 makasih banyak kadonya!!",

  // A few things you love about them (shown as little cards). Leave [] to hide.
  reasons: [
    "You're kind, always",
    "You're honest with me, even when it's not the easy thing to say",
    "You say things straight, no beating around the bush",
    "You're impulsive (haha), which is how we end up on the best adventures",
    "Talking to you is never boring: the jokes never stop"
  ]
};
