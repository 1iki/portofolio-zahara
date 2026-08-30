/**
 * Build-Time Watermark Generator (Option 1 — Raster PNG Output)
 *
 * Usage:
 *   node scripts/generate-watermark.js
 *
 * This script:
 *   1. Composes a screenplay page layout as SVG (intermediate step).
 *   2. Renders the SVG to a raster PNG via sharp — ensuring no selectable text remains.
 *   3. Saves the final PNG to /public/naskah/.
 *   4. Removes any leftover .svg files from the output directory.
 *
 * The result is a permanent, composite-watermarked raster image that cannot be
 * text-selected, Ctrl+F searched, or copy-pasted even when accessed directly via URL.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WATERMARK_TEXT = "ZAHARA ELHUSNA BAROK  |  zhr-elhusna.vercel.app  |  SAMPLE PREVIEW";

// Ensure output directory exists
const targetDir = path.join(__dirname, '..', 'public', 'naskah');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

/**
 * Escape XML special characters to prevent SVG parse errors.
 */
function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a screenplay page as SVG string (intermediate — will be rasterized to PNG).
 */
function createScriptSvg({ title, episode, date, type, sceneHeading, actionLines, dialogueLines, pageNum = 1 }) {
  const width = 800;
  const height = 1050;

  // Escape all user-facing text for XML safety
  const eTitle = escXml(title);
  const eEpisode = episode ? escXml(episode) : '';
  const eDate = escXml(date);
  const eType = escXml(type);
  const eScene = sceneHeading.map(escXml);
  const eAction = actionLines.map(escXml);
  const eDialogue = dialogueLines.map(d => ({ char: escXml(d.char), text: escXml(d.text) }));
  const eWatermark = escXml(WATERMARK_TEXT);

  // Generate tiled watermark rows
  const watermarkRows = [];
  for (let y = -100; y < height + 200; y += 140) {
    for (let x = -100; x < width + 300; x += 320) {
      watermarkRows.push(`<text x="${x}" y="${y}" class="wm">${eWatermark}</text>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .bg{fill:#0b182d}.paper{fill:#071224;stroke:#1e3a5f;stroke-width:1.5}
      .ht{font-family:Courier New,monospace;font-size:14px;font-weight:700;fill:#4a7fe8;letter-spacing:1px}
      .hm{font-family:Courier New,monospace;font-size:11px;fill:#88a2c8}
      .rl{stroke:#1e3a5f;stroke-width:1}
      .sh{font-family:Courier New,monospace;font-size:13px;font-weight:700;fill:#fff;letter-spacing:.5px}
      .at{font-family:Courier New,monospace;font-size:12px;fill:#d0e0f8}
      .cn{font-family:Courier New,monospace;font-size:12px;font-weight:700;fill:#fff}
      .dt{font-family:Courier New,monospace;font-size:12px;fill:#9bb5db}
      .pt{font-family:Courier New,monospace;font-size:11px;font-style:italic;fill:#6b89b5}
      .pn{font-family:Courier New,monospace;font-size:11px;fill:#5c7b9e}
      .wm{font-family:Courier New,monospace;font-size:11px;font-weight:700;fill:rgba(74,127,232,.16);letter-spacing:2px}
    </style>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#071224" stop-opacity="0"/>
      <stop offset="40%" stop-color="#071224" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#071224" stop-opacity="1"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" class="bg"/>
  <rect x="25" y="25" width="750" height="1000" rx="4" class="paper"/>

  <g transform="translate(60,65)">
    <text x="0" y="0" class="ht">${eTitle} ${eEpisode ? '- ' + eEpisode : ''}</text>
    <text x="0" y="20" class="hm">PENULIS NASKAH: ZAHARA ELHUSNA BAROK | PERIODE: ${eDate} | KATEGORI: ${eType.toUpperCase()}</text>
    <line x1="0" y1="30" x2="680" y2="30" class="rl"/>
  </g>

  <g transform="translate(75,130)">
    <text x="640" y="0" class="pn">${pageNum}.</text>
    <text x="0" y="30" class="sh">${eScene[0] || ''}</text>
    <text x="0" y="60" class="at">${eAction[0] || ''}</text>
    <text x="0" y="80" class="at">${eAction[1] || ''}</text>
    <g transform="translate(180,120)">
      <text x="40" y="0" class="cn">${eDialogue[0]?.char || ''}</text>
      <text x="0" y="20" class="dt">${eDialogue[0]?.text || ''}</text>
    </g>
    <text x="0" y="190" class="sh">${eScene[1] || ''}</text>
    <text x="0" y="220" class="at">${eAction[2] || ''}</text>
    <g transform="translate(180,260)">
      <text x="40" y="0" class="cn">${eDialogue[1]?.char || ''}</text>
      <text x="20" y="18" class="pt">(tersenyum santai)</text>
      <text x="-40" y="38" class="dt">${eDialogue[1]?.text || ''}</text>
    </g>
    <text x="0" y="350" class="at">${eAction[3] || ''}</text>
    <g transform="translate(180,390)">
      <text x="40" y="0" class="cn">${eDialogue[2]?.char || ''}</text>
      <text x="-20" y="20" class="dt">${eDialogue[2]?.text || ''}</text>
    </g>
  </g>

  <g transform="rotate(-30 400 525)">${watermarkRows.join('')}</g>

  <rect x="25" y="600" width="750" height="425" fill="url(#fade)"/>

  <g transform="translate(400,880)" text-anchor="middle">
    <rect x="-240" y="-30" width="480" height="50" rx="8" fill="#0b1e38" stroke="#254b7c" stroke-width="1"/>
    <text x="0" y="-8" font-family="Courier New,monospace" font-size="12" font-weight="bold" fill="#4a7fe8">[ CUPLIKAN NASKAH - HANYA SAMPAI HALAMAN 1 ]</text>
    <text x="0" y="10" font-family="sans-serif" font-size="11" fill="#9bb5db">Naskah lengkap tersedia atas permintaan untuk keperluan rekrutmen / kerja sama.</text>
  </g>
</svg>`;
}

// ── Script definitions ────────────────────────────────────────────────

const scriptsToGenerate = [
  {
    fileName: 'salah-pintu-ep01.png',
    title: 'RRI BOGOR - SALAH PINTU',
    episode: 'Episode 01: Dikejar Debt Collector',
    date: 'Januari 2026',
    type: 'Situasi Komedi',
    sceneHeading: ['INT. RUANG TAMU POSKO - DAY', 'INT. DAPUR - CONTINUOUS'],
    actionLines: [
      'SUASANA TENANG TERUSIK OLEH KETUKAN PINTU KENCANG DARI LUAR.',
      'BAMBANG TERKEJUT HINGGA KOPI DI CANGKIRNYA TUMPAH SEDIKIT.',
      'SITI MENGINTIP DARI BALIK TIRAI DENGAN WAJAH WASPADA.',
      'BAMBANG BERUSAHA BERSEMBUNYI DI BALIK MEJA TULIS.'
    ],
    dialogueLines: [
      { char: 'BAMBANG', text: 'Biarin aja! Jangan dibuka! Itu pasti penagih utang katering kemaren!' },
      { char: 'SITI', text: 'Bambang... pintu belakang kan udah digembok sama Pak RT?' },
      { char: 'BAMBANG', text: 'Aduhh... ya udah, kita pura-pura jadi patung aja!' }
    ]
  },
  {
    fileName: 'yukibas-spesial.png',
    title: 'YUKIBAS',
    episode: 'Episode Spesial: Inspirasi Muda',
    date: 'Oktober 2025',
    type: 'Talkshow dan Gameshow',
    sceneHeading: ['INT. STUDIO PANGGUNG UTAMA - NIGHT', 'INT. SEGMEN GAME ZONE - CONTINUOUS'],
    actionLines: [
      'LAMPU STUDIO MEREDUP SEBELUM LIGHTING BLUE-ACCENT MENYALA MERIAH.',
      'AUDIENS BERTEPUK TANGAN HISTERIS SAAT MUSIC INTRO DIMAINKAN.',
      'HOST MELANGKAH MAJU DENGAN MICROPHONE DIGITAL DI TANGAN.',
      'BOARD GAME INTERAKTIF DIBUKA DI ATAS MEJA ORANGE.'
    ],
    dialogueLines: [
      { char: 'HOST', text: 'Selamat malam semuanya! Selamat datang di YUKIBAS!' },
      { char: 'GUEST (TOKOH MUDA)', text: 'Terima kasih udah diundang! Siap banget ikutan challenge malam ini.' },
      { char: 'HOST', text: 'Oke! Sebelum tanya-tanya serius, kita mainkan babak kilat dulu!' }
    ]
  },
  {
    fileName: 'jejak-flona-telur-keong.png',
    title: 'JEJAK FLONA',
    episode: 'Episode: Misteri Telur Keong',
    date: 'September 2025',
    type: 'Variety Show Edukasi',
    sceneHeading: ['EXT. TEPI DANAU PEMUDA - MORNING', 'EXT. AREA TROPIS - CONTINUOUS'],
    actionLines: [
      'KAMERA CLOSE-UP PADA GUMPALAN MERAH PINK DI BATANG ENCHENG GONDOK.',
      'DUA ANTAK (KIDS HOST) DATANG MEMBAWA KACA PEMBESAR KHUSUS.',
      'DESAIN ANIMASI INFOGRAFIK MUNCUL MENJELASKAN KEONG MAS.',
      'ANTAK TERSENYUM GEMBIRA MENEMUKAN TEMUAN SAINS HARI INI.'
    ],
    dialogueLines: [
      { char: 'HOST ANTAK', text: 'Wah, teman-teman lihat! Ada bulatan merah muda di pinggir air!' },
      { char: 'EXPERT FLONA', text: 'Nah, itu adalah telur keong mas! Hati-hati ya, jangan dipegang sembarangan.' },
      { char: 'HOST ANTAK', text: 'Kenapa gitu, Kak? Yuk kita cari tahu di laboratorium!' }
    ]
  },
  {
    fileName: 'rri-news-broadcast.png',
    title: 'RRI BOGOR - BERITA DIGITAL',
    episode: 'Naskah Lead News Audio Visual',
    date: 'Februari 2026',
    type: 'Jurnalisme / Audio Visual',
    sceneHeading: ['INT. RUANG REDAKSI NEWS - DAY', 'EXT. LAPANGAN BOGOR - DAY'],
    actionLines: [
      'ANCHOR DUDUK DI FRONT DESK DENGAN DISPLAY RUNNING TEXT RRI BOGOR.',
      'FOOTAGE CLIP LIPUTAN LAPANGAN DITAMPILKAN SECARA OVERLAY (B-ROLL).',
      'REPORTER MENYAMPAIKAN STRIKE TALK SECARA DIRECT-TO-CAMERA.',
      'GRAPHIC LOWER-THIRD NAMA REPORTER MUNCUL DI LAYAR.'
    ],
    dialogueLines: [
      { char: 'ANCHOR', text: 'Pendengar dan pemirsa RRI News, inilah kabar utama dari wilayah Bogor.' },
      { char: 'REPORTER LAPANGAN', text: 'Saat ini pemerintah kota Bogor resmi meluncurkan program transportasi terpadu.' },
      { char: 'ANCHOR', text: 'Informasi selengkapnya dapat diakses di portal rri.co.id.' }
    ]
  }
];

// ── Main Execution ────────────────────────────────────────────────────

async function main() {
  // Step 1: Remove any leftover .svg files from output dir
  const existingFiles = fs.readdirSync(targetDir);
  for (const file of existingFiles) {
    if (file.endsWith('.svg')) {
      fs.unlinkSync(path.join(targetDir, file));
      console.log(`[CLEANUP] Removed leftover SVG: ${file}`);
    }
  }

  // Step 2: Generate PNG raster assets via SVG → sharp
  for (const script of scriptsToGenerate) {
    const svgContent = createScriptSvg(script);
    const outputPath = path.join(targetDir, script.fileName);

    await sharp(Buffer.from(svgContent))
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    console.log(`[WATERMARK PNG] Created: ${outputPath}`);
  }

  // Step 3: Verify no SVG files remain
  const finalFiles = fs.readdirSync(targetDir);
  const svgRemaining = finalFiles.filter(f => f.endsWith('.svg'));
  if (svgRemaining.length > 0) {
    console.error(`WARNING: ${svgRemaining.length} SVG file(s) still present!`);
  } else {
    console.log(`✅ Verification: 0 SVG files in /public/naskah/ — only PNG raster output.`);
  }

  console.log(`✅ Done. ${scriptsToGenerate.length} PNG files created.`);
}

main().catch(err => {
  console.error('Watermark generation failed:', err);
  process.exit(1);
});
