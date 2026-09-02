/**
 * Production Documentation Inventory — Zahara Elhusna Barok
 * Section: "Dokumentasi" (Behind The Scenes & Production Gallery)
 *
 * Requirements:
 * - Photos: medium resolution presentation + corner watermark overlay (~40% opacity).
 * - Videos: Unlisted YouTube/Vimeo iframe embeds (no direct raw .mp4 download links).
 * - Contextual details: Project title, role, location, year, description.
 */

export const docCategories = [
  { id: "all", label: "Semua Dokumentasi" },
  { id: "photo", label: "Foto BTS" },
  { id: "video", label: "Video BTS & Liputan" },
];

/**
 * Category config for numbered grouping headers (same pattern as workCategories.js).
 * Grouped by source context: Kampus / Magang.
 */
export const docGroupConfig = {
  kampus: {
    label: "KAMPUS",
    subtitle: "Politeknik Negeri Media Kreatif",
  },
  magang: {
    label: "MAGANG",
    subtitle: "Pengalaman Profesional",
  },
};

export const documentations = [
  {
    id: "bts-jejak-flona-shooting",
    type: "photo",
    group: "kampus",
    title: "Proses Shooting & Directing Jejak Flona",
    project: "Jejak Flona",
    role: "Produser & Penulis Naskah",
    location: "Studio 2 & Taman Polimedia Jakarta",
    date: "September 2025",
    mediaUrl: "/projects/happy-science.webp",
    thumbnailUrl: "/projects/happy-science.webp",
    media: [
      {
        src: "/projects/happy-science.webp",
        alt: "Dokumentasi Proses Shooting & Directing Jejak Flona",
        aspectRatio: "4 / 5"
      },
      {
        src: "/projects/rri-bogor-creative-content.webp",
        alt: "Proses produksi Jejak Flona",
        aspectRatio: "9 / 16"
      },
      {
        src: "/projects/rri-bogor-produksi-berita-digital.webp",
        alt: "Koordinasi produksi Jejak Flona",
        aspectRatio: "16 / 9"
      },
      {
        src: "/projects/ngekost-bukan-kabur.webp",
        alt: "Pengarahan adegan Jejak Flona",
        aspectRatio: "4 / 5"
      }
    ],
    description: "Dokumentasi proses pengarahan talent anak-anak dan koordinasi tim teknis kamera saat pengambilan gambar variety show edukasi anak Jejak Flona.",
    tags: ["BTS Shooting", "Variety Show", "Polimedia"],
    aspectRatio: "4 / 5",
  },
  {
    id: "bts-rri-salah-pintu-set",
    type: "photo",
    group: "magang",
    title: "Produksi Sitkom Salah Pintu KMB RRI Bogor",
    project: "RRI Bogor — Salah Pintu",
    role: "Script Writer & Talent Coordinator",
    location: "Studio Siaran & Ruang Kerja RRI Bogor",
    date: "Januari 2026",
    mediaUrl: "/projects/rri-bogor-creative-content.webp",
    thumbnailUrl: "/projects/rri-bogor-creative-content.webp",
    media: [
      {
        src: "/projects/rri-bogor-creative-content.webp",
        alt: "Produksi Sitkom Salah Pintu KMB RRI Bogor",
        aspectRatio: "9 / 16"
      },
      {
        src: "/projects/rri-bogor-produksi-berita-digital.webp",
        alt: "Suasana pengarahan naskah adegan Sitkom",
        aspectRatio: "16 / 9"
      },
      {
        src: "/projects/happy-science.webp",
        alt: "Rehearsal ekspresi talent sebelum take video",
        aspectRatio: "4 / 5"
      }
    ],
    description: "Suasana pengarahan naskah adegan dan rehearsal ekspresi talent sebelum take video episode Ramadan Comedy Series di RRI Bogor.",
    tags: ["BTS Sitkom", "RRI Bogor", "Talent Coordination"],
    aspectRatio: "9 / 16",
  },
  {
    id: "bts-craftopia-video",
    type: "video",
    group: "kampus",
    title: "Behind The Scenes Craftopia Season 2",
    project: "Craftopia Season 2",
    role: "Produser",
    location: "Studio Polimedia TV Jakarta",
    date: "Mei 2025",
    videoEmbedUrl: "https://www.youtube.com/embed/jUBs0-Of9qY?si=WJg08kgCbXuT4ZrQ",
    externalUrl: "https://youtu.be/jUBs0-Of9qY",
    thumbnailUrl: "https://i.ytimg.com/vi/jUBs0-Of9qY/hqdefault.jpg",
    description: "Highlight liputan di balik layar alur produksi program tutorial Craftopia Season 2 dari tahap persiapan properti hingga pasca-produksi.",
    tags: ["BTS Video", "Craftopia", "Polimedia TV"],
    // YouTube video content → Supported Video ratio 16:9
    aspectRatio: "16 / 9",
  },
  {
    id: "bts-rri-field-journalism",
    type: "photo",
    group: "magang",
    title: "Proses Peliputan Field Journalism RRI Bogor",
    project: "RRI Bogor — Produksi Berita Digital",
    role: "Content Creator & Reporter",
    location: "Lapangan & Balai Kota Bogor",
    date: "Februari 2026",
    mediaUrl: "/projects/rri-bogor-produksi-berita-digital.webp",
    thumbnailUrl: "/projects/rri-bogor-produksi-berita-digital.webp",
    description: "Dokumentasi peliputan berita digital di lapangan, meliputi riset wawancara narasumber dan pengambilan gambar B-roll audio visual.",
    tags: ["Field Journalism", "Reporter", "RRI Bogor"],
    // Broadcast news photo → Supported Landscape ratio 16:9
    aspectRatio: "16 / 9",
  },
  {
    id: "bts-news-broadcast-video",
    type: "video",
    group: "kampus",
    title: "Behind The Scenes Live Stream News Broadcast",
    project: "News Broadcast Live Stream",
    role: "Penulis Naskah & Reporter",
    location: "Control Room & News Desk Polimedia",
    date: "April 2025",
    videoEmbedUrl: "https://www.youtube.com/embed/tAUPgJXZqD4?si=oKB1EaB0OFtPXPsk",
    externalUrl: "https://www.youtube.com/live/tAUPgJXZqD4",
    thumbnailUrl: "https://i.ytimg.com/vi/tAUPgJXZqD4/hqdefault.jpg",
    description: "Dokumentasi koordinasi tim newsroom, teleprompter, dan pengarahan durasi naskah live broadcast saat siaran berlangsung.",
    tags: ["Live Broadcast", "Newsroom", "Polimedia"],
    // YouTube broadcast thumbnail → Supported Video ratio 16:9
    aspectRatio: "16 / 9",
  },
  {
    id: "bts-ngekost-bukan-kabur",
    type: "photo",
    group: "kampus",
    title: "Script Continuity & Clipping Sitkom Ngekost Bukan Kabur",
    project: "Ngekost Bukan Kabur",
    role: "Clipper & Script Continuity",
    location: "Set Lokasi Kost Polimedia",
    date: "Juni 2025",
    mediaUrl: "/projects/ngekost-bukan-kabur.webp",
    thumbnailUrl: "/projects/ngekost-bukan-kabur.webp",
    description: "Dokumentasi pencatatan lembar adegan dan pemeriksaan kesinambungan (continuity) naskah selama proses shooting sitkom tugas akhir.",
    tags: ["Script Continuity", "Sitkom", "Tugas Akhir"],
    // Intrinsic: 565×800 (0.706) → Supported Portrait ratio 4:5
    aspectRatio: "4 / 5",
  },
];
