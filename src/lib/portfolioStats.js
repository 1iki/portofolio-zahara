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
 *
 * Double-count prevention:
 *   - "Konten Diproduksi" sums ONLY experience.metrics values (unique evidence IDs).
 *     Does not re-count the same outputs from works.js output field.
 *   - "Program Ditangani" counts each works.js entry exactly once by unique id.
 *   - Engagement metrics (views) are fixed factual values from LinkedIn, not derived.
 */

/**
 * Calculate portfolio stats from project data sources.
 *
 * @param {Array} works - Array of work/project objects from works.js
 * @param {Array} experiences - Array of experience objects from experience.js
 * @returns {Array<{label: string, value: number, suffix: string}>}
 */
export function calculatePortfolioStats(works, experiences) {
  // ── 1. Total unique content produced ──────────────────────────
  // Sum of all experience.metrics values (unique evidence per experience entry).
  // Evidence IDs: RRI-NEWS-50, RRI-SALAHPINTU-10, RRI-DAILY-34,
  //               KUMON-FEED-85, KUMON-REELS-9, KUMON-YOUTUBE-15
  // Total: 203
  const contentProduced = experiences.reduce((sum, exp) => {
    if (!exp.metrics || !Array.isArray(exp.metrics)) return sum;
    return sum + exp.metrics.reduce((s, m) => {
      const parsed = parseInt(m.value, 10);
      return s + (isNaN(parsed) ? 0 : parsed);
    }, 0);
  }, 0);

  // ── 2. Engagement metrics ─────────────────────────────────────
  // Fixed factual values from LinkedIn (Kumon internship).
  // Source: linkedin-sample.html lines 280–282
  //   "capaian hingga 2.081 views di Instagram Reels dan 388 views di YouTube"
  // These are NOT computable from project data — they are external platform metrics.
  const reelsViews = 2081;   // Evidence ID: KUMON-REELS-VIEWS-2081
  const youtubeViews = 388;  // Evidence ID: KUMON-YT-VIEWS-388

  // ── 3. Unique programs handled ────────────────────────────────
  // Count of unique project entries in works array.
  // Each works.js entry has a unique `id` — no deduplication needed
  // as long as works.js maintains canonical identity.
  const programsHandled = works.length;

  return [
    { label: "Konten Diproduksi", value: contentProduced, suffix: "+" },
    { label: "Reels Views", value: reelsViews, suffix: "" },
    { label: "YouTube Views", value: youtubeViews, suffix: "" },
    { label: "Produksi Ditangani", value: programsHandled, suffix: "" },
  ];
}
