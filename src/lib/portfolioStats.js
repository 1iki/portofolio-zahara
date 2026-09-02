/**
 * Portfolio Stats Calculator — Zahara Elhusna Barok
 *
 * Derives StatsLevelMeter values from works and experience data arrays.
 * All values are evidence-based and traceable to source data.
 *
 * Architecture:
 *   works[]       → unique program count
 *   experience[]  → measurable content output sum (from metrics[])
 *   fixed values  → engagement metrics from verified LinkedIn source
 */

/**
 * Calculate portfolio stats from project data sources.
 *
 * @param {Array} works - Array of work/project objects from works.js
 * @param {Array} experiences - Array of experience objects from experience.js
 * @returns {Array<{label: string, value: number, suffix: string}>}
 */
export function calculatePortfolioStats(works = [], experiences = []) {
  const safeWorks = Array.isArray(works) ? works : [];
  const safeExperiences = Array.isArray(experiences) ? experiences : [];

  // ── 1. Total unique content produced ──────────────────────────
  const contentProduced = safeExperiences.reduce((sum, exp) => {
    if (!exp || !exp.metrics || !Array.isArray(exp.metrics)) return sum;
    return sum + exp.metrics.reduce((s, m) => {
      const parsed = parseInt(m.value, 10);
      return s + (isNaN(parsed) ? 0 : parsed);
    }, 0);
  }, 0);

  // ── 2. Engagement metrics ─────────────────────────────────────
  const reelsViews = 2081;   // Evidence ID: KUMON-REELS-VIEWS-2081
  const youtubeViews = 388;  // Evidence ID: KUMON-YT-VIEWS-388

  // ── 3. Unique programs handled ────────────────────────────────
  const programsHandled = safeWorks.length;

  return [
    { label: "Konten Diproduksi", value: contentProduced, suffix: "+" },
    { label: "Reels Views", value: reelsViews, suffix: "" },
    { label: "YouTube Views", value: youtubeViews, suffix: "" },
    { label: "Produksi Ditangani", value: programsHandled, suffix: "" },
  ];
}
