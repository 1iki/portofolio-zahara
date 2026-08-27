import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Extract canonical YouTube 11-character video ID from various YouTube URL formats.
 * Supports: youtu.be, youtube.com/watch?v=, youtube.com/embed/, youtube.com/live/, youtube.com/v/
 */
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:live\/|embed\/|v\/|watch\?v=|\S*?[?&]v=))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/**
 * Generate official high-quality YouTube thumbnail URL.
 */
export function getYouTubeThumbnail(url) {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

/**
 * Generate official fallback YouTube thumbnail URL with step cascade (hqdefault -> 0.jpg).
 */
export function getYouTubeThumbnailFallback(url, step = 1) {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  if (step === 1) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  if (step === 2) return `https://img.youtube.com/vi/${id}/0.jpg`;
  return null;
}

/**
 * Return an array of 4 different frame thumbnails from a YouTube video for ScrubDeck.
 */
export function getYouTubeThumbnailFrames(url) {
  const id = getYouTubeVideoId(url);
  if (!id) return [];
  return [0, 1, 2, 3].map(n => `https://img.youtube.com/vi/${id}/${n}.jpg`);
}

/**
 * Generate canonical YouTube iframe embed URL.
 */
export function getYouTubeEmbedUrl(url) {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

/**
 * Extract Google Drive File ID from Drive URLs.
 */
export function getGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Generate Google Drive iframe preview URL.
 */
export function getGoogleDrivePreviewUrl(urlOrId) {
  if (!urlOrId) return null;
  const id = urlOrId.length > 20 && !urlOrId.includes('/') ? urlOrId : getGoogleDriveFileId(urlOrId);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

/**
 * Resolve project thumbnail URL with defensive fallback cascade.
 * Priority: 1. explicit work.thumbnail -> 2. YouTube thumbnail -> 3. local asset -> 4. null (fallback component indicator)
 */
export function resolveThumbnail(work) {
  if (!work) return null;
  if (work.thumbnail) return work.thumbnail;

  const ytUrl = work.videoUrl || work.link || work.externalUrl;
  const ytThumb = getYouTubeThumbnail(ytUrl);
  if (ytThumb) return ytThumb;

  return null;
}

/**
 * Determine if a project has playable video / iframe media (YouTube, Drive, TikTok).
 */
export function hasPlayableMedia(work) {
  if (!work) return false;

  const type = work.mediaType;
  const hasYtId = Boolean(getYouTubeVideoId(work.videoUrl || work.link || work.externalUrl));
  const hasDriveId = Boolean(getGoogleDriveFileId(work.videoUrl || work.link || work.externalUrl));

  if (type === 'youtube' || hasYtId) return true;
  if (type === 'drive' || hasDriveId) return true;
  if (type === 'tiktok' && (work.videoUrl || work.externalUrl || work.link)) return true;

  return false;
}

/**
 * Resolve project video / embed URL according to mediaType.
 */
export function resolveVideo(work) {
  if (!work) return null;
  if (work.mediaType === 'youtube' || getYouTubeVideoId(work.videoUrl || work.link)) {
    return getYouTubeEmbedUrl(work.videoUrl || work.link);
  }
  if (work.mediaType === 'drive' || getGoogleDriveFileId(work.videoUrl || work.link)) {
    return getGoogleDrivePreviewUrl(work.videoUrl || work.link);
  }
  if (work.mediaType === 'tiktok') {
    return work.videoUrl || work.externalUrl || work.link;
  }
  return work.videoUrl || work.externalUrl || work.link || null;
}
