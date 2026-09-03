/**
 * Aspect Ratio Utilities for Public Documentation Section
 * PortoZeze — Zahara Elhusna Portfolio
 */

const FALLBACK_ASPECT_RATIO = '4 / 5';

/**
 * Known standard ratio mappings matching a tolerance of 0.03.
 */
const STANDARD_RATIOS = [
  { ratio: 16 / 9, css: '16 / 9' },
  { ratio: 4 / 5, css: '4 / 5' },
  { ratio: 3 / 2, css: '3 / 2' },
  { ratio: 4 / 3, css: '4 / 3' },
  { ratio: 1 / 1, css: '1 / 1' },
  { ratio: 9 / 16, css: '9 / 16' },
  { ratio: 21 / 9, css: '21 / 9' },
  { ratio: 3 / 4, css: '3 / 4' },
  { ratio: 2 / 3, css: '2 / 3' },
  { ratio: 5 / 4, css: '5 / 4' },
];

/**
 * Validates and formats any raw aspect ratio input (number, "16 / 9", "16:9", "1.777")
 * into a clean CSS aspect-ratio string.
 * Returns null for invalid values (0/0, 1/0, negative, NaN, non-numeric strings).
 *
 * @param {string | number | null | undefined} val
 * @returns {string | null}
 */
export function validateAndFormatAspectRatio(val) {
  if (val === null || val === undefined) return null;

  if (typeof val === 'number') {
    if (!isNaN(val) && isFinite(val) && val > 0) {
      return formatNumericRatio(val);
    }
    return null;
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Reject known invalid string patterns explicitly
    if (trimmed === 'NaN' || trimmed === 'Infinity' || trimmed === '-Infinity') return null;

    // Check if string contains separator '/' or ':'
    if (trimmed.includes('/') || trimmed.includes(':')) {
      const parts = trimmed.split(/[/:]/).map((s) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
        return formatNumericRatio(parts[0] / parts[1]);
      }
      return null;
    }

    // Check if string is a single positive numeric float e.g. "1.7777"
    const num = parseFloat(trimmed);
    if (!isNaN(num) && isFinite(num) && num > 0) {
      return formatNumericRatio(num);
    }
  }

  return null;
}

/**
 * Converts a floating point ratio into a clean CSS string representation.
 * @param {number} ratio
 * @returns {string}
 */
function formatNumericRatio(ratio) {
  for (const std of STANDARD_RATIOS) {
    if (Math.abs(ratio - std.ratio) < 0.03) {
      return std.css;
    }
  }

  // Reduce to simplified fraction
  const precision = 1000;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const w = Math.round(ratio * precision);
  const h = precision;
  const divisor = gcd(w, h);
  const numW = w / divisor;
  const numH = h / divisor;

  if (numW > 0 && numH > 0 && numW <= 100 && numH <= 100) {
    return `${numW} / ${numH}`;
  }

  return `${Number(ratio.toFixed(4))} / 1`;
}

/**
 * Resolves the strongest valid aspect ratio for a documentation item following strict precedence:
 * 1. Dynamically measured browser image dimensions (naturalWidth / naturalHeight)
 * 2. Primary media item aspectRatio (media[0].aspectRatio)
 * 3. Item-level aspectRatio metadata (item.aspectRatio)
 * 4. Fallback ratio ('4 / 5')
 *
 * @param {Object} item - Documentation item record
 * @param {string | null} loadedRatio - Measured browser image aspect ratio string
 * @returns {string} Clean CSS aspect ratio string e.g. "16 / 9"
 */
export function getDocumentationItemAspectRatio(item, loadedRatio = null) {
  // 1. Loaded browser dimension ratio
  const validLoaded = validateAndFormatAspectRatio(loadedRatio);
  if (validLoaded) return validLoaded;

  if (!item) return FALLBACK_ASPECT_RATIO;

  // 2. Primary media object ratio (media[0].aspectRatio)
  if (Array.isArray(item.media) && item.media[0]) {
    const primaryMedia = item.media[0];

    // Check media[0].aspectRatio
    if (primaryMedia.aspectRatio) {
      const validPrimary = validateAndFormatAspectRatio(primaryMedia.aspectRatio);
      if (validPrimary) return validPrimary;
    }

    // Check media[0].width & height
    if (primaryMedia.width && primaryMedia.height && primaryMedia.height > 0) {
      const validMediaDim = validateAndFormatAspectRatio(primaryMedia.width / primaryMedia.height);
      if (validMediaDim) return validMediaDim;
    }
  }

  // 3. Item-level aspectRatio metadata
  if (item.aspectRatio) {
    const validItemRatio = validateAndFormatAspectRatio(item.aspectRatio);
    if (validItemRatio) return validItemRatio;
  }

  // 4. Safe fallback
  return FALLBACK_ASPECT_RATIO;
}

/**
 * Helper to calculate height factor relative to column width (height = width * (1 / ratio)).
 * Used for shortest-column layout distribution.
 *
 * @param {string} ratioStr
 * @returns {number}
 */
export function getHeightFactorFromRatio(ratioStr) {
  const formatted = validateAndFormatAspectRatio(ratioStr) || FALLBACK_ASPECT_RATIO;
  const parts = formatted.split('/').map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
    const numericRatio = parts[0] / parts[1];
    return 1 / numericRatio;
  }
  return 1 / (4 / 5);
}
