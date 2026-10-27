// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to personalise the page.
//  Everything the page shows comes from here.
//
//  Lines marked  ✏️ ISI  are warm but generic placeholders written without
//  knowing your story. Replace them with your own words, memories and dates.
//  Everything else (name, "21", "from Daniel") is already correct.
// ─────────────────────────────────────────────────────────────
window.BDAY = {
  name: "Karen",
  age: 21,
  from: "Daniel",
  signature: "with love, Daniel",

  // ✏️ ISI: her birthday, e.g. "12 November 2026". Leave "" to hide the date.
  date: "",

  // First screen
  introLine: "Malam ini ada 21 bintang di langit, dan semuanya untukmu.",
  introHint: "Nyalakan suara 🔊, lalu ketuk tombol di bawah.",

  // ── The 21 stars ──────────────────────────────────────────
  // Each star opens a small card. Tapping all 21 joins them into a heart.
  // "title" is the small heading, "text" the message, "photo" (optional) a file in photos/,
  // "pos" (optional) moves the photo crop, e.g. "80% center".
  // ✏️ ISI: all 21 are placeholders. The best version swaps several of them for real
  //   memories ("Kenangan"), things you love about her ("Alasan"), and wishes ("Harapan").
  //   Keep it to 21 items; short texts (1–3 sentences) read best on a phone.
  stars: [
    { title: "Bintang pertama",      text: "Selamat ulang tahun ke-21, Karen. Pelan-pelan saja, ada 20 bintang lagi menunggumu. ✨" },               // ✏️ ISI
    { title: "Harapan",              text: "Semoga umur 21 membawa lebih banyak hari yang ringan dan tawa yang lepas." },                            // ✏️ ISI
    { title: "Satu bab selesai",     text: "Sidang KP sudah kamu lewati. Bab berikutnya pasti seru juga.", photo: "03-senyum-lega.jpg", pos: "85% center" }, // ✏️ ISI
    { title: "Harapan",              text: "Semoga kamu selalu dikelilingi orang-orang yang tulus sayang sama kamu." },                              // ✏️ ISI
    { title: "Kenangan",             text: "Tulis satu kenangan favorit kalian di sini." },                                                          // ✏️ ISI (memory)
    { title: "Alasan",               text: "Tulis satu hal kecil tentang Karen yang selalu bikin kamu senyum." },                                    // ✏️ ISI (reason)
    { title: "Harapan",              text: "Semoga kamu berani mencoba hal-hal baru tahun ini, dan menikmati prosesnya.", photo: "05-percaya-diri.jpg", pos: "75% center" }, // ✏️ ISI
    { title: "Pengingat",            text: "Istirahat itu bukan kalah. Kamu boleh pelan-pelan." },                                                  // ✏️ ISI
    { title: "Harapan",              text: "Semoga semua yang sedang kamu usahakan pelan-pelan jadi kenyataan." },                                  // ✏️ ISI
    { title: "Kenangan",             text: "Tulis satu momen lucu yang masih bikin kalian ketawa." },                                               // ✏️ ISI (memory)
    { title: "Setengah jalan",       text: "Sudah sebelas bintang. Lihat, bentuknya mulai kelihatan…", photo: "04-banyak-cerita.jpg" },           // ✏️ ISI
    { title: "Harapan",              text: "Semoga kamu selalu sehat, cukup tidur, dan cukup makan enak." },                                       // ✏️ ISI
    { title: "Alasan",               text: "Tulis satu sifat Karen yang paling kamu kagumi." },                                                     // ✏️ ISI (reason)
    { title: "Harapan",              text: "Semoga kamu selalu ingat betapa berharganya dirimu, bahkan di hari yang berat." },                     // ✏️ ISI
    { title: "Kenangan",             text: "Tulis tempat favorit kalian, atau hari pertama kalian bertemu.", photo: "02-rapi-formal.jpg" },        // ✏️ ISI (memory)
    { title: "Harapan",              text: "Semoga tahun ini penuh kabar baik yang datang tanpa diduga." },                                         // ✏️ ISI
    { title: "Pengingat",            text: "Kamu nggak harus sempurna untuk disayang." },                                                           // ✏️ ISI
    { title: "Alasan",               text: "Tulis satu kebiasaan kecil Karen yang diam-diam kamu suka." },                                          // ✏️ ISI (reason)
    { title: "Harapan",              text: "Semoga mimpi-mimpi besarmu makin dekat, satu langkah demi satu langkah." },                            // ✏️ ISI
    { title: "Hampir",               text: "Tinggal satu bintang lagi…", photo: "01-mode-serius.jpg" },                                            // ✏️ ISI
    { title: "Bintang ke-21",        text: "Satu bintang untuk setiap tahunmu. Selamat ulang tahun, Karen. 💛" }                                    // ✏️ ISI
  ],

  // Shown when the heart is complete
  heartLine: "21 bintang, satu hati.",

  // ── The cake ──────────────────────────────────────────────
  cakeLine: "Tutup mata, buat satu permohonan, lalu tiup lilinnya.",
  afterBlow: "Semoga permohonanmu terkabul. 🌅",

  // ── The letter ────────────────────────────────────────────
  // ✏️ ISI: the most important part. These paragraphs are placeholders; write your own.
  letterTitle: "Untuk Karen,",
  letter: [
    "Selamat ulang tahun yang ke-21. Hari ini aku cuma mau kamu tahu satu hal: aku senang sekali kamu ada.",               // ✏️ ISI
    "Tahun ini kamu sudah melewati banyak hal, termasuk sidang KP yang akhirnya selesai. Aku bangga sama kamu, dan aku harap kamu juga bangga sama dirimu sendiri.", // ✏️ ISI
    "[Tulis di sini kenangan atau cerita kalian tahun ini.]",                                                              // ✏️ ISI (delete this line or replace it)
    "Semoga umur 21 memberimu keberanian, ketenangan, dan banyak alasan untuk tersenyum. Apa pun yang datang nanti, aku ada di sini.", // ✏️ ISI
    "Selamat ulang tahun, Karen. 💛"                                                                                       // ✏️ ISI
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
  // ✏️ ISI (optional): a Spotify song for the letter, the ID at the end of
  //   open.spotify.com/track/<ID>. Leave "" to hide it.
  spotifyTrack: "",
  spotifyNote: "Lagu untukmu, putar sambil baca suratnya ya 🎧"   // ✏️ ISI if you add a song
};
