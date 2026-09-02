/**
 * Media Normalization & Gallery Utilities
 * Portfolio: Zahara Elhusna
 */

export const MAX_MEDIA = 55;

/**
 * Normalizes media array or legacy image fields into a unified array of media objects.
 *
 * Strict Priority Sequence:
 * 1. item.media
 * 2. item.image
 * 3. item.mediaUrl
 * 4. item.thumbnailUrl
 * 5. item.thumbnail
 * 6. fallbackImage
 *
 * Output item structure:
 * {
 *   src: string,
 *   alt: string,
 *   aspectRatio?: string | null,
 *   type: "image" | "video",
 *   videoEmbedUrl?: string | null
 * }
 */
export function normalizeMedia(item, fallbackImage = null) {
  if (!item) return [];

  let sourceMedia = [];

  if (Array.isArray(item.media) && item.media.length > 0) {
    sourceMedia = item.media;
  } else if (item.image) {
    sourceMedia = typeof item.image === 'string'
      ? [{ src: item.image, alt: item.title || "", aspectRatio: item.aspectRatio || null, type: "image" }]
      : [item.image];
  } else if (item.mediaUrl) {
    sourceMedia = [{ src: item.mediaUrl, alt: item.title || "", aspectRatio: item.aspectRatio || null, type: item.type || "image", videoEmbedUrl: item.videoEmbedUrl || item.videoUrl }];
  } else if (item.thumbnailUrl) {
    sourceMedia = [{ src: item.thumbnailUrl, alt: item.title || "", aspectRatio: item.aspectRatio || null, type: item.type || "image", videoEmbedUrl: item.videoEmbedUrl || item.videoUrl }];
  } else if (item.thumbnail) {
    sourceMedia = [{ src: item.thumbnail, alt: item.title || "", aspectRatio: item.aspectRatio || null, type: "image" }];
  } else if (fallbackImage) {
    sourceMedia = typeof fallbackImage === 'string'
      ? [{ src: fallbackImage, alt: item.title || "", aspectRatio: item.aspectRatio || null, type: "image" }]
      : [fallbackImage];
  }

  if (sourceMedia.length > MAX_MEDIA) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Gallery] Item "${item.id || item.title}" exceeds maximum of ${MAX_MEDIA} images (${sourceMedia.length} provided). Truncating to ${MAX_MEDIA}.`);
    }
  }

  const slicedMedia = sourceMedia.slice(0, MAX_MEDIA);

  return slicedMedia
    .map((m, index) => {
      if (typeof m === 'string') {
        return {
          src: m,
          alt: `${item.title || 'Dokumentasi'} - Foto ${index + 1}`,
          aspectRatio: item.aspectRatio || null,
          type: item.type === 'video' ? 'video' : 'image',
          videoEmbedUrl: item.videoEmbedUrl || item.videoUrl || null,
        };
      }

      if (!m || typeof m !== 'object') return null;

      return {
        src: m.src || m.url || '',
        alt: m.alt || `${item.title || 'Dokumentasi'} - Foto ${index + 1}`,
        aspectRatio: m.aspectRatio || item.aspectRatio || null,
        type: m.type || (item.type === 'video' ? 'video' : 'image'),
        videoEmbedUrl: m.videoEmbedUrl || item.videoEmbedUrl || item.videoUrl || null,
      };
    })
    .filter((m) => Boolean(m && m.src));
}

/**
 * Helper to resolve primary thumbnail (media[0]) for cards and grid items.
 * Single Source of Truth helper.
 */
export function resolvePrimaryThumbnail(item, fallback = null) {
  const mediaList = normalizeMedia(item, fallback);
  return mediaList[0]?.src || (typeof fallback === 'string' ? fallback : fallback?.src) || null;
}
