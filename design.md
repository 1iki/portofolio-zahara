# Design System — Portfolio Interaktif Zahara Elhusna Barok

**Konsep:** "The Console" — bukan sekadar portofolio yang dilihat, tapi sebuah console produksi siaran yang *dioperasikan*. Seluruh halaman diperlakukan sebagai satu mixing board hidup: user menekan tombol, menggeser slider, "menyalakan" channel — merefleksikan Zahara sebagai produser yang mengendalikan alur produksi, bukan sekadar talent di depan kamera.

Prinsip desain: **satu sistem, banyak titik sentuh.** Semua elemen interaktif lanjutan di bawah ini terhubung ke satu bahasa visual yang sama (console/broadcast), bukan gimmick lepas-lepas — supaya tetap kohesif meski maksimal.

---

## 1. Design Tokens

### 1.1 Warna

| Token | Hex | Peran |
|---|---|---|
| `--color-navy-base` | `#0B1D3A` | Background utama, header, footer |
| `--color-navy-deep` | `#071429` | Background section alternatif (lebih gelap) |
| `--color-blue-accent` | `#4A7FE8` | Aksen interaktif — link, hover, border aktif, ikon, glow tombol console |
| `--color-ivory` | `#F5F3EC` | Teks di atas navy, ruang napas section terang |
| `--color-onair-red` | `#E8442C` | **Signature color** — indikator ON AIR/REC/live saja. Eksklusif, jangan didekorasi bebas. |
| `--color-ink` | `#101418` | Teks body di atas background terang |
| `--color-muted` | `#8FA0C2` | Teks sekunder, metadata, caption |
| `--color-divider` | `rgba(245,243,236,0.12)` | Garis pembatas di atas navy |
| `--color-scanline` | `rgba(74,127,232,0.04)` | Overlay grain/scanline, sangat tipis, bukan aksen warna |

### 1.2 Tipografi

| Role | Font | Karakter | Pemakaian |
|---|---|---|---|
| Display | `Fraunces` (600–900, italic aksen) | Serif editorial tebal | Judul hero, judul section |
| Body | `General Sans` / `Inter` | Sans netral | Paragraf, deskripsi |
| Mono/Data | `IBM Plex Mono` | Monospace tipis | Metadata, label tombol console, timecode |

**Skala (desktop):**
```
Hero display   : clamp(3rem, 7vw, 6.5rem) / line-height 0.95
Section title  : clamp(2rem, 4vw, 3.25rem) / line-height 1.05
Card title     : 1.25rem–1.5rem / weight 600
Body           : 1rem–1.0625rem / line-height 1.6
Meta/mono      : 0.75rem–0.8125rem / letter-spacing 0.04em / uppercase
```

### 1.3 Spacing & Grid
- Base unit `8px`. Section padding: `96px` desktop / `56px` mobile.
- Grid karya: `repeat(auto-fill, minmax(280px, 1fr))`, gap `24px`.
- Container max-width `1200px`.
- Radius `4px` (kartu/tombol) — kesan hardware console, bukan bubbly. Dot ON AIR & knob tetap bulat penuh.

---

## 2. Signature System — "The Console"

Satu sistem visual-interaktif yang muncul berulang dalam bentuk berbeda di tiap section, supaya terasa maksimal tapi tetap satu identitas:

| Wujud | Lokasi | Fungsi |
|---|---|---|
| **Nav console** | Hero, sticky saat scroll | Navigasi utama berbentuk deretan tombol fisik (bukan link teks biasa) |
| **Channel dial** | Section Karya | Filter role — diputar/diklik seperti memilih channel TV |
| **Scrub deck** | Kartu karya (hover/tap) | Slider timeline mini untuk scrub preview video |
| **ON AIR dot** | Navbar, kartu aktif, timeline | Indikator status hidup/mati — turunan warna signature |
| **Level meter** | Section Statistik | Bar animasi naik seperti VU meter audio, merepresentasikan angka views |

Semua wujud di atas berbagi bahasa visual yang sama: border tipis, sudut `4px`, label mono uppercase, dan micro-glow biru saat aktif/hover. Ini yang membuat kombinasi maksimal tetap terasa satu sistem, bukan tempelan fitur.

---

## 3. Lapisan Ambient (Global, Seluruh Halaman)

### 3.1 Custom Cursor
- Default: dot kecil biru accent dengan ring tipis mengikuti kursor (lag halus ~80ms).
- Saat hover di kartu video → cursor berubah jadi ikon rec (●) merah kecil + label mono "PLAY".
- Saat hover tombol console → cursor membesar sedikit + ring jadi solid.
- **Wajib fallback:** nonaktif total di touch device (deteksi via `pointer: coarse`), dan disembunyikan jika `prefers-reduced-motion: reduce`.

### 3.2 Scanline & Grain Overlay
- Layer `position: fixed` di atas seluruh halaman, `pointer-events: none`, opacity sangat rendah (~3–5%).
- CSS-only: gradient garis horizontal tipis (scanline) + noise SVG halus (grain), animasi drift lambat (20s loop, translateY tipis).
- Tujuan: atmosfer "layar CRT/monitor siaran" tanpa mengganggu keterbacaan. Matikan otomatis di mobile kecil (`<640px`) untuk performa & fokus konten.

### 3.3 Sound Design (opsional, opt-in)
- Toggle kecil di navbar: ikon speaker (mute by default — **tidak pernah autoplay suara**).
- Jika user mengaktifkan: bunyi klik pendek (~80ms) saat menekan tombol console/dial, bunyi "beep" halus saat ON AIR menyala.
- Semua file audio harus sangat singkat, volume rendah (~15–20%), dan preference disimpan di state sesi saja.

---

## 4. Motion

| Interaksi | Durasi | Easing | Catatan |
|---|---|---|---|
| Hero console power-on (page load) | 900ms | ease-in-out | Sekali saat load; hormati reduced-motion (ganti fade sederhana) |
| Hover kartu karya | 200ms | ease-out | Scale 1.0→1.02 + scrub deck fade-in |
| Video scrub (drag) | real-time | linear | Preview frame mengikuti posisi drag, throttle ~100ms |
| Channel dial filter | 350ms | cubic-bezier(0.22,1,0.36,1) | FLIP-transition grid + bunyi klik opsional |
| ON AIR dot pulse | 1.2s loop | ease-in-out | Aktif saat video preview play/hover |
| Level meter (statistik) | 1200ms, stagger 100ms | ease-out | Naik dari 0 saat masuk viewport |
| Cursor follow | continuous | lag ~80ms | Nonaktif di touch & reduced-motion |
| Scanline drift | 20s loop | linear | Sangat halus, opacity rendah |

---

## 5. Struktur Halaman & Komponen

### 5.1 Navbar (sticky)
- Kiri: nama/logo. Tengah/kanan: **nav console** — tombol fisik bergaya switch (Tentang / Karya / Pengalaman / Kontak), tombol aktif menyala biru.
- Kanan jauh: toggle sound (mute default) + dot ON AIR kecil statis.
- Transparan di hero → solid navy setelah scroll (transition halus).

### 5.2 Hero — Control Panel
- Bukan hero pasif: berbentuk **panel console interaktif** — deretan tombol/knob bergaya hardware (mis. tombol besar "MULAI SIARAN" yang scroll ke section Karya, knob kecil yang toggle antara tagline "Produser / Penulis Naskah / Social Media Specialist" saat diklik).
- Animasi power-on saat load: panel "menyala" bertahap (lampu indikator satu-satu aktif), lalu nama besar (display font) muncul.
- Foto profil di kanan, dengan frame tipis bergaya monitor broadcast.
- Kontak (WA/IG/Email) tetap pill outline, konsisten dengan PDF asli.

### 5.3 Tentang
- Dua kolom: profil diri + mini-timeline edukasi (mono font untuk tanggal).
- Penghargaan sebagai kartu kecil ikon garis tipis custom (bukan clipart generik).

### 5.4 Karya — bagian paling kaya interaksi
**Channel dial (filter):** deretan tombol bulat bergaya channel selector — Semua / Produser / Penulis Naskah / Reporter / Host. Klik → grid re-flow dengan FLIP transition + opsional bunyi klik.

**Kartu karya:**
- Thumbnail + overlay metadata mono (role, tanggal, platform, views).
- Hover/tap → **scrub deck** muncul: slider timeline mini di bawah thumbnail; user drag untuk preview beberapa frame/video (lazy-load thumbnail sprite atau video muted `currentTime` scrubbing).
- ON AIR dot menyala merah saat preview aktif.
- Klik kartu (di luar area scrub) → buka link asli di tab baru.

Data karya nyata (dari PDF) tetap dipakai sebagai isi:
- Konten Momen Ketika (Conitycast) — Produser — Feb–Jun 2025
- Zignal Radio — Produser & Reporter — Mei 2025
- Liputan Weekinshop — Reporter — Mei 2025
- News Broadcast — Penulis Naskah & Reporter — Apr 2025
- Fun With Zahara — Penulis Naskah & Host — Apr 2025
- Journey With Mine — Produser — Des 2024
- Kreasi Bersama Zahara (KREIZA) — Produser & Host — Nov 2024
- Geniverze — Penulis Naskah — Des 2023
- Craftopia — Produser Kreatif — Mar–Mei 2025
- Polimedia Explore (Softnews) — Produser — Sep–Des 2024
- Hardnews — Reporter — Mar–Sep 2024
- MV Cover "Andaikan Kau Datang Kembali" — Asisten Produser — Nov 2023
- Short Movie "Falshback" — Sutradara — Mei 2023

### 5.5 Statistik — Level Meter
- Ditampilkan sebagai bar vertikal/horizontal bergaya VU meter, animasi naik saat scroll masuk viewport:
  - Total konten diproduksi
  - Reels tertinggi: 2.081 views
  - Views YouTube tertinggi: 388
  - Jumlah program yang ditangani

### 5.6 Pengalaman & Organisasi — Timeline horizontal
- Scroll-snap horizontal, progress bar tipis di atas seperti timecode video berjalan mengikuti posisi scroll.
- Item: Ketua Divisi Komunikasi & Informasi (Polimedia TV, Jan 2025–sekarang), Magang Kumon Kalisari Raya (Okt 2021–Jul 2022), dst.

### 5.7 Kontak / Footer
- Pill outline WA/IG/Email (konsisten cover PDF).
- CTA aktif: "Hubungi saya untuk kolaborasi".
- Dot ON AIR di footer dalam kondisi idle (mati) sebagai penutup visual — siaran "selesai".

---

## 6. Copywriting Guidelines
- Bahasa Indonesia aktif, natural, konsisten nada PDF asli.
- Label tombol console berbasis aksi: "MULAI SIARAN", "PUTAR PREVIEW", bukan "Klik di sini".
- Metadata karya singkat & faktual — role, tanggal, platform.
- State kosong (filter tanpa hasil): pesan singkat + tombol reset, gaya "channel tidak ditemukan".

---

## 7. Responsif & Aksesibilitas

- Breakpoint: mobile `<640px`, tablet `640–1024px`, desktop `>1024px`.
- **Custom cursor**: nonaktif di semua touch device.
- **Scanline/grain**: opacity diturunkan/dimatikan di mobile kecil untuk performa & fokus.
- **Sound**: selalu mute by default, tidak pernah autoplay, toggle jelas & tersimpan per sesi.
- **Video scrubbing** di mobile: ganti drag-scrub dengan tap-to-play sederhana (scrub deck disembunyikan, muncul tombol play besar).
- Kontras teks ivory di atas navy sudah memenuhi WCAG AA.
- Fokus keyboard: semua tombol console harus punya `:focus-visible` jelas (outline biru accent), dan berfungsi penuh tanpa mouse — nav console adalah `<button>`/`<a>` asli, bukan `<div>` dekoratif.
- `prefers-reduced-motion: reduce`: matikan power-on animation, cursor follow, scanline drift, pulse; ganti dengan state statis/fade sederhana. Ini bukan opsional — wajib diimplementasikan.

---

## 8. Catatan Implementasi Teknis
- Single-page (React disarankan untuk state filter/scrub yang kompleks) dengan smooth-scroll antar section.
- Data karya sebagai array objek terpisah (bukan hardcode berulang) agar filter, scrub, dan level meter mudah dikelola dari satu sumber.
- Intersection Observer untuk: scroll-reveal, ON AIR dot aktif, level meter animasi, progress bar timeline.
- Video scrub: gunakan sprite thumbnail (beberapa frame statis) untuk performa, atau `<video>` muted dengan `currentTime` di-update saat drag — hindari re-fetch video penuh saat scrub cepat.
- Custom cursor & scanline: implementasi CSS/JS ringan, deteksi kapabilitas device (`matchMedia('(pointer: coarse)')`) sebelum mengaktifkan.
- Sound: preload file audio pendek (<50kb), state toggle di React context/local state, tidak perlu localStorage (lihat batasan storage artifact).
