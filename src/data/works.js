/**
 * Portfolio project inventory — Zahara Elhusna Barok
 * Phase 3.1: Explicit Media & Video Integration
 *
 * Schema:
 *   id             — unique kebab-case identifier
 *   title          — display title
 *   program        — subtitle/brand name (nullable)
 *   category       — production context: "magang" | "smk" | "kampus" | "polimedia-tv"
 *   role           — Zahara's role(s)
 *   date           — period string (month/year range or specific date) — display only
 *   startDate      — ISO date string for sorting logic (YYYY-MM-DD)
 *   endDate        — ISO date string for sorting logic (YYYY-MM-DD)
 *   platform       — distribution platform(s)
 *   link           — generic URL for backward compatibility (nullable)
 *   mediaType      — "youtube" | "instagram" | "image" | "drive" | "social"
 *   thumbnail      — explicit thumbnail image URL or local path (nullable)
 *   videoUrl       — explicit iframe embed URL for YouTube (nullable)
 *   externalUrl    — explicit link for Instagram/Drive/External (nullable)
 *   organization   — associated organization (nullable)
 *   description    — portfolio-quality description (nullable)
 *   output         — production count, e.g. "34 episodes" (nullable)
 *   type           — content category for extended filtering (nullable)
 *   featuredEpisode — highlight episode { title, link } (nullable)
 *   source         — provenance: "PDF", "LinkedIn", "PDF+LinkedIn"
 *
 * Sorted newest-first.
 */

export const works = [
  // ───────────────────────────── 2025–2026 ─────────────────────────────

  {
    id: "jejak-flona",
    title: "Jejak Flona",
    program: null,
    category: "kampus",
    role: "Produser",
    date: "Agu 2025 – Jul 2026",
    startDate: "2025-08-01",
    endDate: "2026-07-31",
    platform: "YouTube",
    link: "https://youtu.be/TUFRT9TvHfg",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/TUFRT9TvHfg/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/TUFRT9TvHfg?si=c1bvFGSVu3EhWd-Y",
    externalUrl: "https://youtu.be/TUFRT9TvHfg",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program tugas akhir berformat variety show edukatif untuk anak-anak yang membahas flora dan fauna. Diproduksi bersama tim dan dipublikasikan melalui YouTube.",
    output: null,
    type: "variety",
    featuredEpisode: {
      title: "Misteri Telur Keong",
      link: null,
    },
    source: "LinkedIn",
  },

  {
    id: "rri-bogor-creative-content",
    title: "RRI Bogor — Creative Content",
    program: "Konten Harian",
    category: "magang",
    role: "Creative Support",
    date: "Jan – Apr 2026",
    startDate: "2026-01-01",
    endDate: "2026-04-30",
    platform: "Instagram / TikTok",
    link: "https://www.instagram.com/reel/DUVI8y2kusA/",
    mediaType: "instagram",
    thumbnail: "/projects/rri-bogor-creative-content.webp",
    videoUrl: null,
    externalUrl: "https://www.instagram.com/reel/DUVI8y2kusA/",
    organization: "Lembaga Penyiaran Publik Radio Republik Indonesia",
    description:
      "Program konten harian pada akun resmi RRI Bogor, menyajikan informasi dan promosi lembaga dalam format hiburan-edukatif sesuai tren media sosial. Berperan sebagai talent, cameraman, editor, dan koordinator produksi.",
    output: "34 episodes",
    type: "social",
    featuredEpisode: {
      title: "Obrolan Komunitas",
      link: null,
    },
    source: "LinkedIn",
  },

  {
    id: "rri-bogor-produksi-berita-digital",
    title: "RRI Bogor — Produksi Berita Digital",
    program: null,
    category: "magang",
    role: "Content Creator & Reporter",
    date: "Jan – Apr 2026",
    startDate: "2026-01-01",
    endDate: "2026-04-30",
    platform: "Instagram",
    link: "https://www.instagram.com/reel/DTXWC1LEZ4k/",
    mediaType: "instagram",
    thumbnail: "/projects/rri-bogor-produksi-berita-digital.webp",
    videoUrl: null,
    externalUrl: "https://www.instagram.com/reel/DTXWC1LEZ4k/",
    organization: "Lembaga Penyiaran Publik Radio Republik Indonesia",
    description:
      "Program jurnalisme audio visual yang mengolah isu aktual di wilayah Bogor dan nasional melalui peliputan lapangan serta pengolahan informasi dari rri.co.id. Dipublikasikan melalui Instagram @rribogornews.",
    output: "50 berita",
    type: "news",
    featuredEpisode: null,
    source: "LinkedIn",
  },

  {
    id: "rri-bogor-salah-pintu",
    title: "RRI Bogor — Salah Pintu",
    program: "Ramadan Comedy Series",
    category: "magang",
    role: "Script Writer & Talent Coordinator",
    date: "Jan – Mar 2026",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    platform: "YouTube",
    link: "https://youtu.be/Nf4rjoMd7D4",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/Nf4rjoMd7D4/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/Nf4rjoMd7D4?si=oKB1EaB0OFtPXPsk",
    externalUrl: "https://youtu.be/Nf4rjoMd7D4",
    organization: "Lembaga Penyiaran Publik Radio Republik Indonesia",
    description:
      "Program situasi komedi perdana KMB RRI Bogor yang terdiri dari 10 episode dan dipublikasikan melalui YouTube. Berperan sebagai penulis naskah dalam mengembangkan alur komedi dan pesan program agar selaras dengan identitas RRI sebagai media publik.",
    output: "10 episodes",
    type: "comedy",
    featuredEpisode: {
      title: "Dikejar Debt Collector",
      link: null,
    },
    source: "LinkedIn",
  },

  {
    id: "yukibas",
    title: "Yukibas",
    program: null,
    category: "polimedia-tv",
    role: "Penulis Naskah",
    date: "Sep – Des 2025",
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    platform: "YouTube",
    link: "https://youtu.be/U54IN4LP2-E?si=gzkeIvfzxwB_ohg7",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/U54IN4LP2-E/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/U54IN4LP2-E?si=gzkeIvfzxwB_ohg7",
    externalUrl: "https://youtu.be/U54IN4LP2-E?si=gzkeIvfzxwB_ohg7",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Yukibas merupakan program yang menghadirkan narasumber inspiratif untuk berbagi pengalaman, tips and tricks, topik menarik, serta kisah tokoh berprestasi. Program ini dikemas secara menarik melalui berbagai permainan dan tantangan.",
    output: "7 episodes",
    type: "variety",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  {
    id: "happy-science",
    title: "Happy Science",
    program: null,
    category: "kampus",
    role: "Talent Coordinator",
    date: "Jun 2025",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    platform: "Tugas Akhir",
    link: null,
    mediaType: "image",
    thumbnail: "/projects/happy-science.webp",
    media: [
      {
        src: "/projects/happy-science.webp",
        alt: "Happy Science - Dokumentasi Produksi",
        aspectRatio: "4 / 5"
      },
      {
        src: "/projects/pola-makan-pintar-pompi.webp",
        alt: "Happy Science - Talent Coordination Set",
        aspectRatio: "16 / 9"
      },
      {
        src: "/projects/ngekost-bukan-kabur.webp",
        alt: "Happy Science - Rehearsal Episode",
        aspectRatio: "4 / 5"
      }
    ],
    videoUrl: null,
    externalUrl: null,
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program tugas akhir edukasi anak-anak bertema eksperimen sains. Berperan sebagai talent coordinator yang mengkoordinasikan para talent agar mengikuti arahan program director.",
    output: null,
    type: "education",
    featuredEpisode: null,
    source: "LinkedIn",
  },

  {
    id: "ngekost-bukan-kabur",
    title: "Ngekost Bukan Kabur",
    program: null,
    category: "kampus",
    role: "Clipper & Script Continuity",
    date: "Jun 2025",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    platform: "Tugas Akhir",
    link: null,
    mediaType: "image",
    thumbnail: "/projects/ngekost-bukan-kabur.webp",
    media: [
      {
        src: "/projects/ngekost-bukan-kabur.webp",
        alt: "Ngekost Bukan Kabur - Script Continuity Sheet",
        aspectRatio: "4 / 5"
      },
      {
        src: "/projects/rri-bogor-produksi-berita-digital.webp",
        alt: "Ngekost Bukan Kabur - Scene Take Recording",
        aspectRatio: "16 / 9"
      },
      {
        src: "/projects/rri-bogor-creative-content.webp",
        alt: "Ngekost Bukan Kabur - Location Set Kost",
        aspectRatio: "9 / 16"
      }
    ],
    videoUrl: null,
    externalUrl: null,
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program sitkom tugas akhir yang menceritakan penghuni kost dengan beragam kisah antar karakter. Berperan sebagai clipper dan script continuity — mencatat adegan penting selama produksi dan memastikan kesinambungan naskah.",
    output: null,
    type: "comedy",
    featuredEpisode: null,
    source: "LinkedIn",
  },

  {
    id: "pola-makan-pintar-pompi",
    title: "Pola Makan Pintar (POMPI)",
    program: null,
    category: "kampus",
    role: "Asisten Script",
    date: "Jun 2025",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    platform: "YouTube",
    link: null,
    mediaType: "image",
    thumbnail: "https://i.ytimg.com/vi/ki7SRGrTo40/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/ki7SRGrTo40?si=WJg08kgCbXuT4ZrQ",
    externalUrl: "https://www.youtube.com/embed/ki7SRGrTo40?si=WJg08kgCbXuT4ZrQ",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program tugas akhir edukasi tentang makanan yang dikemas dengan format mitos atau fakta. Berperan sebagai asisten script yang memastikan kesesuaian naskah pada proses produksi dan running time sesuai arahan program director.",
    output: null,
    type: "education",
    featuredEpisode: null,
    source: "LinkedIn",
  },

  // ───────────────────────────── Semester 2025 ─────────────────────────────

  {
    id: "conitycast",
    title: "Konten Momen Ketika",
    program: "Conitycast",
    category: "kampus",
    role: "Produser",
    date: "Feb–Jun 2025",
    startDate: "2025-02-01",
    endDate: "2025-06-30",
    platform: "TikTok/Instagram",
    link: "https://www.tiktok.com/@conitycast/video/7500575189751631159",
    mediaType: "tiktok",
    thumbnail: "https://res.cloudinary.com/drh1tz2wl/image/upload/v1788082255/screenshot_mk2_cl7ilk.png",
    thumbnailType: "project_artwork",
    videoUrl: "https://www.tiktok.com/@conitycast/video/7500575189751631159",
    externalUrl: "https://www.tiktok.com/@conitycast/video/7500575189751631159",
    embedUrl: "https://www.tiktok.com/embed/v2/7500575189751631159",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Projek produksi konten bersama satu kelas selama satu semester dengan target audiens mahasiswa dan sasaran 1.000 views. Terlibat dalam perencanaan konten, penulisan naskah adegan dan media sosial, proses produksi, hingga publikasi di TikTok dan Instagram.",
    output: "32 episodes",
    type: "social",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  {
    id: "zignal-radio",
    title: "Zignal Radio",
    program: null,
    category: "kampus",
    role: "Produser & Reporter",
    date: "21 Mei 2025",
    startDate: "2025-05-21",
    endDate: "2025-05-21",
    platform: "YouTube / Drive",
    link: "https://youtu.be/wli8GlJ3dRE?si=BpkcVH1lEAy2bKaL",
    mediaType: "youtube",
    thumbnail: "https://img.youtube.com/vi/wli8GlJ3dRE/hqdefault.jpg",
    thumbnailType: "official",
    videoUrl: "https://www.youtube.com/embed/wli8GlJ3dRE",
    externalUrl: "https://youtu.be/wli8GlJ3dRE",
    organization: null,
    description: "Program Radio Air Magazine yang mengulik tentang otomotif motor. Berisi liputan secara langsung ke bengkel custom motor, wawancara, dan lain-lain.",
    output: null,
    type: "news",
    featuredEpisode: null,
    source: "PDF",
  },

  {
    id: "liputan-weekinshop",
    title: "Liputan Weekinshop",
    program: null,
    category: "kampus",
    role: "Reporter",
    date: "01 Mei 2025",
    startDate: "2025-05-01",
    endDate: "2025-05-01",
    platform: "Drive",
    link: "https://drive.google.com/file/d/19zXuwa-SE-4UKVopJcE3jmkdyX2REpfJ/view",
    mediaType: "drive",
    thumbnail: "https://res.cloudinary.com/drh1tz2wl/image/upload/v1788082246/Liputan_Weekinshop_p8fwza.png",
    thumbnailType: "project_artwork",
    videoUrl: "https://drive.google.com/file/d/19zXuwa-SE-4UKVopJcE3jmkdyX2REpfJ/preview",
    externalUrl: "https://drive.google.com/file/d/19zXuwa-SE-4UKVopJcE3jmkdyX2REpfJ/view",
    aspectRatio: "portrait",
    organization: null,
    description: "Liputan ini adalah tugas akhir untuk Mata Kuliah Jurnalistik TV. Dengan format individu (Reporter, penulisan naskah, sampai dengan editor) akan tetapi campers diperbolehkan orang lain.",
    output: null,
    type: "news",
    featuredEpisode: null,
    source: "PDF",
  },

  {
    id: "fun-with-zahara",
    title: "Fun With Zahara",
    program: null,
    category: "kampus",
    role: "Penulis Naskah & Host",
    date: "13 April 2025",
    startDate: "2025-04-13",
    endDate: "2025-04-13",
    platform: "YouTube/Drive",
    link: "https://www.youtube.com/watch?v=rb0y07OjLnY",
    mediaType: "youtube",
    thumbnail: "https://img.youtube.com/vi/rb0y07OjLnY/maxresdefault.jpg",
    thumbnailType: "official",
    videoUrl: "https://www.youtube.com/embed/rb0y07OjLnY",
    externalUrl: "https://www.youtube.com/watch?v=rb0y07OjLnY",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program gameshow yang dipublikasikan melalui YouTube dan menghadirkan stranger untuk bermain bersama dengan berbagai tantangan interaktif. Berperan sebagai penulis naskah dan host.",
    output: null,
    type: "variety",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  {
    id: "news-broadcast",
    title: "News Broadcast",
    program: null,
    category: "kampus",
    role: "Penulis Naskah & Reporter",
    date: "Apr 2025",
    startDate: "2025-04-01",
    endDate: "2025-04-30",
    platform: "YouTube",
    link: "https://www.youtube.com/live/tAUPgJXZqD4",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/tAUPgJXZqD4/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/tAUPgJXZqD4",
    externalUrl: "https://www.youtube.com/live/tAUPgJXZqD4",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program berita tugas akhir semester 4 yang disiarkan secara live stream, menyajikan isu-isu terkini dan relevan mulai dari hardnews hingga softnews. Berperan sebagai penulis naskah dan reporter.",
    output: null,
    type: "news",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  {
    id: "news-update-wisuda-polimedia",
    title: "News Update — WISUDA POLIMEDIA 2025",
    program: null,
    category: "polimedia-tv",
    role: "Penulis Naskah & Reporter",
    date: "Mar – Sep 2024",
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    platform: "Instagram / YouTube",
    link: null,
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/4558_xtXAx4/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/4558_xtXAx4?si=9h2Jdwx7kRrYt6ZM",
    externalUrl: "https://www.youtube.com/watch?v=4558_xtXAx4",
    organization: "Polimedia TV",
    description:
      "Program berita yang menyajikan informasi aktual, faktual, dan terpercaya seputar isu dan kegiatan mahasiswa. Bertugas menulis dan membuat naskah berita secara informatif, serta mendistribusikannya melalui Instagram (story & feed) dan YouTube.",
    output: null,
    type: "news",
    featuredEpisode: null,
    source: "LinkedIn",
  },

  {
    id: "craftopia",
    title: "Craftopia",
    program: "Season 2",
    category: "polimedia-tv",
    role: "Produser",
    date: "Mar – Mei 2025",
    startDate: "2025-03-01",
    endDate: "2025-05-31",
    platform: "YouTube",
    link: "https://youtu.be/jUBs0-Of9qY",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/jUBs0-Of9qY/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/jUBs0-Of9qY",
    externalUrl: "https://youtu.be/jUBs0-Of9qY",
    organization: "Polimedia TV",
    description:
      "Program tutorial yang menyajikan kerajinan tangan bermanfaat dari barang bekas secara informatif dan menarik. Bertanggung jawab atas alur produksi, penjadwalan, komunikasi tim, strategi produksi, dan pengelolaan anggaran.",
    output: "6 episodes",
    type: "education",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  // ───────────────────────────── 2024 ─────────────────────────────

  {
    id: "journey-with-mine",
    title: "Journey With Mine",
    program: null,
    category: "kampus",
    role: "Produser",
    date: "Des 2024",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    platform: "YouTube",
    link: "https://youtu.be/x-vjHGCpDX0",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/x-vjHGCpDX0/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/x-vjHGCpDX0",
    externalUrl: "https://youtu.be/x-vjHGCpDX0",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program reality show yang menghadirkan seorang stranger untuk berbagi pengalaman dan mengikuti berbagai aktivitas menarik bersama host. Dipublikasikan melalui YouTube.",
    output: null,
    type: "variety",
    featuredEpisode: {
      title: "Melukis Kue di Little Bom Bom",
      link: null,
    },
    source: "PDF+LinkedIn",
  },

  {
    id: "kreiza",
    title: "Kreasi Bersama Zahara",
    program: "KREIZA",
    category: "kampus",
    role: "Produser & Host",
    date: "Okt – Nov 2024",
    startDate: "2024-10-01",
    endDate: "2024-11-30",
    platform: "YouTube",
    link: "https://youtu.be/aivl_zZ9kkU",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/aivl_zZ9kkU/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/aivl_zZ9kkU",
    externalUrl: "https://youtu.be/aivl_zZ9kkU",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program feature yang mengulik berbagai aktivitas, mulai dari sejarah dan tutorial hingga wawancara dengan pakar di bidang terkait. Berperan sebagai produser dan host.",
    output: null,
    type: "feature",
    featuredEpisode: {
      title: "Rumah Batik Palbatu",
      link: null,
    },
    source: "PDF+LinkedIn",
  },

  {
    id: "polimedia-explore",
    title: "Polimedia Explore",
    program: "Softnews",
    category: "polimedia-tv",
    role: "Redaktur Softnews",
    date: "Sep – Des 2024",
    startDate: "2024-09-01",
    endDate: "2024-12-31",
    platform: "YouTube",
    link: "https://youtu.be/EGW31Ed-HkA",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/EGW31Ed-HkA/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/EGW31Ed-HkA",
    externalUrl: "https://youtu.be/EGW31Ed-HkA",
    organization: "Polimedia TV",
    description:
      "Program berita yang mengeksplorasi kegiatan, tempat, dan makanan menarik, terdiri dari 6 episode. Berperan sebagai redaktur softnews — menyusun timeline, menjadwalkan tim produksi, mengelola anggaran liputan, menentukan lokasi, serta menjalin komunikasi perizinan.",
    output: "6 episodes",
    type: "news",
    featuredEpisode: {
      title: "Studio Cetak Saring, Yori Studio, M Bloc Space",
      link: null,
    },
    source: "PDF+LinkedIn",
  },

  {
    id: "hardnews",
    title: "Redaksi Hardnews",
    program: "Redaksi",
    category: "polimedia-tv",
    role: "Reporter",
    date: "Mar – Sep 2024",
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    platform: "Instagram / YouTube",
    link: "https://www.instagram.com/stories/highlights/18144536632346987/",
    mediaType: "news",
    thumbnail: "https://res.cloudinary.com/drh1tz2wl/image/upload/v1788082245/screenshot_hardnews_bbrboa.png",
    videoUrl: "https://www.instagram.com/stories/highlights/18144536632346987/",
    externalUrl: null,
    organization: "Polimedia TV",
    description:
      "Program berita yang menyajikan informasi aktual, faktual, dan terpercaya seputar isu dan kegiatan mahasiswa. Saya bertugas menulis dan meliput berita secara informatif, serta mendistribusikannya melalui Instagram (story & feed) dan YouTube.",
    output: null,
    type: "news",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  // ───────────────────────────── 2023 ─────────────────────────────

  {
    id: "geniverze",
    title: "Geniverze",
    program: null,
    category: "kampus",
    role: "Penulis Naskah",
    date: "Des 2023",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    platform: "YouTube",
    link: "https://www.youtube.com/live/cVvpvsd_M8Q",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/cVvpvsd_M8Q/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/cVvpvsd_M8Q",
    externalUrl: "https://www.youtube.com/live/cVvpvsd_M8Q",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Program tugas akhir semester 1 berformat variety show yang mengulik kehidupan Generasi Z — mulai dari hobi, gaya berpakaian, hingga gaya hidup.",
    output: null,
    type: "variety",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  {
    id: "mv-cover-andaikan-kau-datang-kembali",
    title: 'MV Cover "Andaikan Kau Datang Kembali"',
    program: null,
    category: "kampus",
    role: "Asisten Produser",
    date: "Nov 2023",
    startDate: "2023-11-01",
    endDate: "2023-11-30",
    platform: "YouTube",
    link: "https://youtu.be/oiZKzxgnuxs",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/oiZKzxgnuxs/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/oiZKzxgnuxs",
    externalUrl: "https://youtu.be/oiZKzxgnuxs",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Berperan sebagai asisten produser dalam produksi music video cover yang dipublikasikan melalui YouTube.",
    output: null,
    type: "film",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },

  {
    id: "short-movie-falshback",
    title: 'Short Movie "Falshback"',
    program: null,
    category: "smk",
    role: "Sutradara",
    date: "Mei 2023",
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    platform: "YouTube",
    link: "https://youtu.be/38JSl2qdAvM",
    mediaType: "youtube",
    thumbnail: "https://i.ytimg.com/vi/38JSl2qdAvM/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/38JSl2qdAvM",
    externalUrl: "https://youtu.be/38JSl2qdAvM",
    organization: "Politeknik Negeri Media Kreatif",
    description:
      "Bertanggung jawab sebagai sutradara dalam produksi film pendek yang dipublikasikan melalui YouTube. Mengarahkan seluruh proses kreatif dari pra-produksi hingga pasca-produksi.",
    output: null,
    type: "film",
    featuredEpisode: null,
    source: "PDF+LinkedIn",
  },
];
