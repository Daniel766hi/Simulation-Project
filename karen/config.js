// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to personalise the page.
//  Everything the page shows comes from here.
// ─────────────────────────────────────────────────────────────
window.GIFT = {
  // Name shown big at the top
  name: "Karen",

  // Who it's from: shown in the footer and on the reply button. Leave "" to keep it anonymous.
  from: "",

  // How the letter is signed. Leave "" to use the name above.
  signature: "dengan bangga, dan peluk dari jauh 💖",

  // Small line under the name. Leave "" to hide.
  date: "Sidang Kerja Praktik ✅",

  // A short line under the title
  tagline: "Satu bab selesai. Sekarang waktunya dirayakan, you deserve it 🎉",

  // The letter. Each item is one paragraph.
  letter: [
    "Selamat, Karen! 🎉 Sidang KP-mu akhirnya selesai.",
    "Di balik presentasi hari ini ada laporan yang direvisi berkali-kali, begadang, dan perjalanan bolak-balik ke tempat KP. Semua itu terbayar hari ini.",
    "Aku bangga banget sama kamu. Ini baru satu langkah, dan aku yakin langkah-langkah berikutnya bakal lebih seru lagi.",
    "Sekarang waktunya istirahat sebentar dan merayakan diri sendiri. Kamu pantas mendapatkannya. 💖"
  ],

  // Photos in the photos/ folder. "caption" is optional. "pos" (optional) moves the
  // square crop on the photo wall, e.g. "80% center" to show more of the right side.
  photos: [
    { file: "01-mode-serius.jpg",    caption: "Ekspresi andalan 😗" },
    { file: "02-rapi-formal.jpg",    caption: "Mode rapi: on" },
    { file: "03-senyum-lega.jpg",    caption: "Senyum lega 😊", pos: "85% center" },
    { file: "04-banyak-cerita.jpg",  caption: "Selalu ada cerita baru 🗣️" },
    { file: "05-percaya-diri.jpg",   caption: "Percaya diri ✨", pos: "75% center" }
  ],

  // The checklist on the KP report; tapping "Cap SELESAI!" ticks each one, then stamps it.
  checklist: ["Laporan KP ditulis", "Revisi (berkali-kali)", "Presentasi disiapin", "Sidang KP"],
  stampMessage: "Sidang KP: selesai! You deserve it 🎉",

  // Background music. Leave "" for the built-in upbeat loop (music/loop.mp3).
  backgroundMusic: "",

  // A song played through Spotify's own player: the ID at the end of the link
  // (open.spotify.com/track/<ID>). Leave "" to hide the section.
  spotifyTrack: "",
  spotifyTitle: "",
  spotifyNote: "",

  // Hidden under the scratch card at the very end (scratch to reveal). Use \n for a new line.
  secretMessage: "Sidang KP: ✅\nSekarang tinggal istirahat, jajan, dan cerita-cerita lagi.\nYou deserve it, Karen! 💖",

  // "Karen Wrapped": full-screen story slides (tap right/left, hold to pause).
  // Each slide: kicker (small line), big (large text), sub (line under it), optional photo,
  // optional count (a number that counts up, shown instead of "big"), optional bg (CSS background).
  wrapped: [
    { kicker: "presenting", big: "Karen Wrapped 🎓", sub: "edisi sidang KP", bg: "linear-gradient(160deg,#e8567a,#f4a13a)" },
    { kicker: "status terbaru", big: "Sidang KP ✅", sub: "resmi selesai!", photo: "03-senyum-lega.jpg", bg: "linear-gradient(160deg,#2f8f6f,#7bc8a4)" },
    { kicker: "yang udah dilewatin", big: "laporan · revisi · begadang", sub: "dan semuanya terbayar hari ini", photo: "02-rapi-formal.jpg", bg: "linear-gradient(160deg,#3b2a6b,#8f5bd6)" },
    { kicker: "3 kata tentang kamu", big: "lucu · baik · banyak cerita", sub: "ceritanya nggak pernah abis 🗣️", photo: "04-banyak-cerita.jpg", bg: "linear-gradient(160deg,#c38fe0,#e8567a)" },
    { kicker: "pesan hari ini", big: "You deserve it.", sub: "Selamat ya, Karen 💖", photo: "05-percaya-diri.jpg", bg: "linear-gradient(160deg,#e8567a,#ffb84d)" }
  ],

  // The reply button at the end opens WhatsApp with this message ready to send. "" hides it.
  replyText: "AAAA makasih banyak 😭💖 udah dibikinin halaman ini!!",

  // Flip cards: why they deserve the celebration. Leave [] to hide.
  reasons: [
    "Kamu lucu, selalu bisa bikin ketawa 😂",
    "Kamu baik, ke semua orang",
    "Kamu selalu punya banyak cerita, dan nggak pernah ngebosenin",
    "Kamu udah kerja keras buat KP ini. You deserve it 💖"
  ]
};
