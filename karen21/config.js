// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to change what the page says.
//  Everything the page shows comes from here.
// ─────────────────────────────────────────────────────────────
window.BDAY = {
  name: "Karen",
  age: 21,
  from: "Daniel",
  signature: "with love, Daniel",

  // Shown under her name. Leave "" to hide.
  date: "28 Oktober 2026",

  // First screen
  introLine: "Malam ini ada 21 bintang di langit, dan semuanya buat kamu.",
  introHint: "Nyalakan suaranya 🔊, terus ketuk tombol di bawah ya.",

  // ── The 21 stars ──────────────────────────────────────────
  // Each star opens a small card. Tapping all 21 joins them into a heart.
  // "title" is the small heading, "text" the message, "photo" (optional) a file in photos/,
  // "pos" (optional) moves the photo crop, e.g. "80% center". Keep it to 21 items.
  stars: [
    { title: "Bintang pertama",   text: "Selamat ulang tahun yang ke-21, sayang! 🎉 Masih ada 20 bintang lagi, buka pelan-pelan ya ✨" },
    { title: "Kenangan",          text: "Yang paling pertama muncul tiap aku inget kamu: lucunya kamu. Nggak pernah gagal bikin aku senyum 😆" },
    { title: "Satu bab selesai",  text: "Sidang KP udah kamu lewatin. Aku bangga banget sama kamu!", photo: "03-senyum-lega.jpg", pos: "85% center" },
    { title: "Alasan",            text: "Alasan aku sayang kamu nomor satu: keimutan kamu. Udah, itu nggak bisa dibantah 🤭" },
    { title: "Harapan",           text: "Semoga kamu selalu sehat, cukup tidur, dan cukup makan enak." },
    { title: "Kenangan",          text: "Aku paling suka waktu kamu nelpon terus cerita kejadian-kejadian seru hari itu. Ceritain terus ya, aku selalu mau dengerin 📞" },
    { title: "Alasan",            text: "Kamu rajin dan baik banget. Makin kenal kamu, makin kagum aku.", photo: "05-percaya-diri.jpg", pos: "75% center" },
    { title: "Harapan",           text: "Semoga semua jalan kita dibukakan." },
    { title: "Kenangan",          text: "Tempat kita pertama ketemu? Rahasia, ya kan? 🤫" },
    { title: "Alasan",            text: "Kamu perhatian banget. Makasih ya, aku ngerasain semuanya 💛" },
    { title: "Setengah jalan",    text: "Udah sebelas bintang! Coba lihat, bentuknya mulai keliatan…", photo: "04-banyak-cerita.jpg" },
    { title: "Harapan",           text: "Semoga di-ACC! 🤞" },
    { title: "Harapan",           text: "Semoga kita bisa terus akrab, dan makin akrab lagi." },
    { title: "Pengingat",         text: "Kalau capek, istirahat ya. Kamu nggak harus kuat terus." },
    { title: "Harapan",           text: "Semoga umur 21 bawa banyak kabar baik buat kamu.", photo: "02-rapi-formal.jpg" },
    { title: "Pengingat",         text: "Kamu nggak harus sempurna buat disayang. Aku sayang kamu apa adanya." },
    { title: "Harapan",           text: "Semoga mimpi-mimpi kamu makin dekat, satu langkah demi satu langkah." },
    { title: "Harapan",           text: "Semoga kamu selalu dikelilingi orang-orang yang sayang sama kamu." },
    { title: "Lagu buat kamu",    text: "Serta Mulia, Sal Priadi. Nanti putar di bawah surat ya 🎧" },
    { title: "Hampir",            text: "Tinggal satu bintang lagi…", photo: "01-mode-serius.jpg" },
    { title: "Bintang ke-21",     text: "Satu bintang buat tiap tahun umur kamu. Selamat ulang tahun, sayang. Love u 💛" }
  ],

  // Shown when the heart is complete
  heartLine: "21 bintang, satu hati.",

  // ── The cake ──────────────────────────────────────────────
  cakeLine: "Tutup mata, bikin satu permohonan, terus tiup lilinnya.",
  afterBlow: "Semoga permohonanmu terkabul. 🌅",

  // ── The letter ────────────────────────────────────────────
  letterTitle: "Untuk Karen sayang,",
  letter: [
    "Selamat ulang tahun yang ke-21, sayang! 🎉 Hari ini hari kamu, dan aku seneng banget bisa ikut ngerayainnya.",
    "Tahun ini kamu juga udah lewatin sidang KP. Aku bangga banget sama kamu.",
    "Aku harap kita bisa terus akrab, dan makin mengakrabkan diri satu sama lain. Semoga semua jalan kita dibukakan.",
    "Dan semoga di-ACC ya! 🤞",
    "Love u, sayang. 💛"
  ],

  // Photos shown under the letter as a little "constellation" of moons (files in photos/), up to 5
  photosTitle: "Bintang-bintang favoritku ✦",
  photos: [
    { file: "03-senyum-lega.jpg",   pos: "85% center" },
    { file: "05-percaya-diri.jpg",  pos: "75% center" },
    { file: "04-banyak-cerita.jpg" },
    { file: "02-rapi-formal.jpg" },
    { file: "01-mode-serius.jpg" }
  ],

  // ── Music ─────────────────────────────────────────────────
  // The night sky plays music/night.mp3 and the cake plays music/song.mp3
  // ("Selamat Ulang Tahun" as a lullaby). Both are original renders, free to use.
  // A Spotify song for the letter: the ID at the end of open.spotify.com/track/<ID>. "" hides it.
  // Now: "Serta Mulia" by Sal Priadi.
  spotifyTrack: "1CVUWAC845LKEDHH0l8XG2",
  spotifyNote: "Serta Mulia, Sal Priadi. Putar sambil baca suratnya ya 🎧"
};
