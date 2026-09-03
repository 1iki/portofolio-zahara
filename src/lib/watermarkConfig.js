/**
 * Watermark Configuration — Zahara Elhusna Barok Portfolio
 *
 * Centralized watermark metadata for script preview and production documentation.
 * Used for both build-time watermark generation and runtime CSS overlay protection.
 */

export const WATERMARK_CONFIG = {
  ownerName: "Zahara Elhusna Barok",
  domain: "zhr-elhusna.vercel.app",
  contactEmail: "zaharaelhusnab@gmail.com",
  linkedinUrl: "https://linkedin.com/in/zahara-elhusna-barok/",
  instagramUrl: "https://instagram.com/zhr.elhusna",

  // Display string for tiled watermark
  text: "zhr-elhusna.vercel.app",

  // Tiled watermark settings for scripts (Option 2 runtime overlay + Option 1 asset generation)
  scriptOverlay: {
    opacity: 0.15, // 15% opacity — clearly visible to claim ownership without destroying script readability
    angle: -30,    // -30 deg diagonal sweep
    fontSize: 13,
    fontFamily: "Courier New, monospace",
    color: "rgba(0, 0, 0, 0.45)",
    tileWidth: 320,
    tileHeight: 140,
  },

  // Photo watermark settings for BTS documentation
  photoWatermark: {
    opacity: 0.40, // 40% subtle opacity in corner
    position: "bottom-right",
    text: "©zhr-elhusna",
  }
};
