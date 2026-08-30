/**
 * Professional Experience & Organization Data — Zahara Elhusna Barok
 *
 * Source: Verified CV and Portfolio inventory.
 * Academic/coursework projects belong exclusively to works.js (Karya page).
 *
 * Schema:
 *   id               — unique identifier
 *   type             — category slug: "magang" | "organisasi"
 *   position         — job title / role held
 *   organization     — organization or institution name
 *   location         — city / location
 *   startDate        — ISO format date string (YYYY-MM-DD)
 *   endDate          — ISO format date string (YYYY-MM-DD)
 *   dateLabel        — human-readable presentation string
 *   responsibilities — array of visual bullet points representing duties
 *   metrics          — array of output objects { value, label } or null
 */

export const experience = [
  {
    id: "rri-bogor",
    type: "magang",
    position: "Content Creator & Reporter",
    organization: "Radio Republik Indonesia (RRI) Bogor",
    location: "Bogor",
    startDate: "2026-01-01",
    endDate: "2026-04-30",
    dateLabel: "Jan 2026 – Apr 2026",
    responsibilities: [
      "Memproduksi 50 berita digital untuk Instagram @rribogornews melalui riset, peliputan, penulisan, dan editing.",
      "Menulis naskah dan terlibat sebagai Talent Coordinator dalam produksi 10 episode Program Salah Pintu untuk YouTube RRI Bogor.",
      "Berperan sebagai Creative Support konten harian untuk Instagram dan TikTok sebanyak 34 konten harian.",
    ],
    metrics: [
      {
        value: "50",
        label: "BERITA DIGITAL",
      },
      {
        value: "10",
        label: "EPISODE",
      },
      {
        value: "34",
        label: "KONTEN HARIAN",
      },
    ],
  },
  {
    id: "polimedia-tv-org",
    type: "organisasi",
    position: "Ketua Divisi Komunikasi dan Informasi",
    organization: "Polimedia TV",
    location: "Jakarta",
    startDate: "2025-01-01",
    endDate: "2025-07-31",
    dateLabel: "Jan 2025 – Jul 2025",
    responsibilities: [
      "Mengkoordinasikan tim Public Relations, Partnership, Social Media, dan Desain.",
      "Aktif berkontribusi dalam produksi konten media sosial.",
      "Berkontribusi lintas peran sebagai Produser dan Reporter.",
    ],
    metrics: null,
  },
  {
    id: "kumon-kalisari",
    type: "magang",
    position: "Social Media Internship",
    organization: "Kumon Kalisari Raya",
    location: "Jakarta",
    startDate: "2021-10-01",
    endDate: "2022-07-31",
    dateLabel: "Okt 2021 – Jul 2022",
    responsibilities: [
      "Mengkoordinasikan produksi konten dari perencanaan hingga publikasi, termasuk penjadwalan sampai evaluasi.",
      "Merancang konsep dan mengelola konten Instagram serta YouTube berdasarkan insight audiens dan tren digital.",
      "Memproduksi 85 feed, 9 Reels, dan 15 video YouTube.",
    ],
    metrics: [
      {
        value: "85",
        label: "FEED",
      },
      {
        value: "9",
        label: "REELS",
      },
      {
        value: "15",
        label: "VIDEO YOUTUBE",
      },
    ],
  },
];
