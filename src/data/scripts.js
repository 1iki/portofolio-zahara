/**
 * Script Sample Inventory — Zahara Elhusna Barok
 * Section: "Naskah" (Script Preview)
 *
 * Protection strategy:
 * - Excerpt only (~25-30% of total script length/pages).
 * - Rendered as raster PNG asset with Option 1 composite diagonal watermark.
 * - Layered with Option 2 CSS watermark overlay at runtime.
 * - Non-selectable image container (user-select: none, onContextMenu prevention).
 * - Direct download links disabled.
 */

export const scriptCategories = [
  { id: "all", label: "Semua Naskah" },
  { id: "comedy", label: "Sitkom & Drama" },
  { id: "variety", label: "Talkshow & Variety" },
  { id: "news", label: "Berita & Media" },
];

/**
 * Category config for numbered grouping headers (same pattern as workCategories.js).
 */
export const scriptGroupConfig = {
  comedy: {
    label: "SITKOM & DRAMA",
    subtitle: "Naskah Situasi Komedi & Drama",
  },
  variety: {
    label: "TALKSHOW & VARIETY",
    subtitle: "Naskah Talkshow, Gameshow & Variety Show",
  },
  news: {
    label: "BERITA & MEDIA",
    subtitle: "Naskah Lead Siaran & Berita Digital",
  },
};

export const scripts = [
  {
    id: "rri-salah-pintu-ep01",
    title: "RRI Bogor — Salah Pintu",
    program: "Ramadan Comedy Series",
    episode: "Episode 01: Dikejar Debt Collector",
    category: "comedy",
    role: "Penulis Naskah Utama",
    date: "Januari 2026",
    organization: "Lembaga Penyiaran Publik Radio Republik Indonesia",
    previewPageCount: "Halaman 1–3 dari 12 Halaman (25% Cuplikan)",
    description:
      "Naskah situasi komedi episode perdana KMB RRI Bogor. Menceritakan dinamika kocak penghuni posko yang menghadapi situasi salah paham dengan penagih katering.",
    thumbnailUrl: "/naskah/salah-pintu-ep01.png",
    previewImageUrl: "/naskah/salah-pintu-ep01.png",
    format: "Screenplay / Format Sitkom",
    tags: ["Sitkom", "Comedy", "RRI Bogor", "Scriptwriter"],
  },
  {
    id: "yukibas-spesial",
    title: "Yukibas",
    program: "Talkshow & Gameshow Inspiratif",
    episode: "Episode Spesial: Inspirasi Muda",
    category: "variety",
    role: "Penulis Naskah",
    date: "Oktober 2025",
    organization: "Politeknik Negeri Media Kreatif",
    previewPageCount: "Halaman 1–2 dari 8 Halaman (25% Cuplikan)",
    description:
      "Naskah rundown dan cue card program talkshow interaktif yang memadukan sesi wawancara mendalam narasumber berprestasi dengan segmen permainan tantangan.",
    thumbnailUrl: "/naskah/yukibas-spesial.png",
    previewImageUrl: "/naskah/yukibas-spesial.png",
    format: "Rundown & Dialogue Script",
    tags: ["Talkshow", "Variety Show", "Cue Card", "Penulis Naskah"],
  },
  {
    id: "jejak-flona-telur-keong",
    title: "Jejak Flona",
    program: "Variety Show Edukatif Anak",
    episode: "Episode: Misteri Telur Keong",
    category: "variety",
    role: "Penulis Naskah & Produser",
    date: "September 2025",
    organization: "Politeknik Negeri Media Kreatif",
    previewPageCount: "Halaman 1–3 dari 14 Halaman (20% Cuplikan)",
    description:
      "Naskah tugas akhir berformat variety show sains edukatif untuk anak-anak. Menyajikan penjelasan flora dan fauna melalui gaya penceritaan petualangan yang menyenangkan.",
    thumbnailUrl: "/naskah/jejak-flona-telur-keong.png",
    previewImageUrl: "/naskah/jejak-flona-telur-keong.png",
    format: "TV Script / Educational Variety",
    tags: ["Tugas Akhir", "Edukasi Anak", "Variety Show", "Produser"],
  },
  {
    id: "rri-news-broadcast",
    title: "RRI Bogor — Berita Digital",
    program: "News Audio Visual & Lead Siaran",
    episode: "Draft Lead News & Script Liputan",
    category: "news",
    role: "Penulis Naskah Berita / Reporter",
    date: "Februari 2026",
    organization: "Lembaga Penyiaran Publik Radio Republik Indonesia",
    previewPageCount: "Halaman 1 dari 5 Halaman (20% Cuplikan)",
    description:
      "Draft naskah berita straight news dan lead siaran audio visual untuk platform Instagram @rribogornews dan siaran digital RRI Bogor.",
    thumbnailUrl: "/naskah/rri-news-broadcast.png",
    previewImageUrl: "/naskah/rri-news-broadcast.png",
    format: "News Package / Lead Script",
    tags: ["Hardnews", "Digital News", "RRI Bogor", "Reporter"],
  },
];
