import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

/**
 * Upload an image file (base64 string or URL) to Cloudinary in folder `porto-zeze`.
 * @param {string} fileInput - Base64 data URL or remote HTTP URL
 * @param {string} [customPublicId] - Optional custom public ID
 * @returns {Promise<{ src: string, publicId: string, width: number, height: number, aspectRatio: string, type: string }>}
 */
export async function uploadImageToCloudinary(fileInput, customPublicId = null) {
  if (!fileInput || typeof fileInput !== 'string') {
    throw new Error('Input file gambar tidak valid.');
  }

  const options = {
    folder: 'porto-zeze',
    resource_type: 'auto',
    ...(customPublicId ? { public_id: customPublicId } : {}),
  };

  const result = await cloudinary.uploader.upload(fileInput, options);

  const w = result.width || 4;
  const h = result.height || 5;

  return {
    src: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    aspectRatio: `${w} / ${h}`,
    type: result.resource_type === 'video' ? 'video' : 'image',
  };
}

/**
 * Delete an asset from Cloudinary by public ID.
 */
export async function deleteImageFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[Cloudinary] Image delete warning:', err.message);
  }
}

/**
 * Upload a PDF file to Cloudinary under folder `porto-zeze/scripts`.
 * Automatically generates a page-1 image preview URL.
 * @param {string} fileInput - Base64 data URL or HTTP URL of PDF file
 * @param {string} [customPublicId] - Optional custom public ID
 * @returns {Promise<{ pdfUrl: string, pdfPublicId: string, previewImageUrl: string, originalFilename: string, pageCount: number }>}
 */
export async function uploadPdfToCloudinary(fileInput, customPublicId = null) {
  if (!fileInput || typeof fileInput !== 'string') {
    throw new Error('Input file PDF tidak valid.');
  }

  const options = {
    folder: 'porto-zeze/scripts',
    // PDFs uploaded as image resources support deterministic page transforms.
    resource_type: 'image',
    ...(customPublicId ? { public_id: customPublicId } : {}),
  };

  const result = await cloudinary.uploader.upload(fileInput, options);

  // Generate high quality Page 1 image preview URL via Cloudinary URL transformation
  const previewImageUrl = cloudinary.url(result.public_id, {
    resource_type: 'image',
    format: 'jpg',
    page: 1,
    secure: true,
    quality: 'auto',
  });

  await validatePublicImage(previewImageUrl);
  return {
    pdfUrl: result.secure_url,
    pdfPublicId: result.public_id,
    previewImageUrl: previewImageUrl || result.secure_url,
    previewImagePublicId: result.public_id,
    pdfFileName: result.original_filename || 'naskah.pdf',
    originalFilename: result.original_filename || 'naskah.pdf', // legacy alias
    pageCount: result.pages || 1,
  };
}

/**
 * Safely delete a PDF asset from Cloudinary.
 */
export async function deletePdfFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  } catch (err) {
    console.warn('[Cloudinary] PDF delete warning:', err.message);
    throw err;
  }
}

async function validatePublicImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !type.startsWith('image/')) throw new Error(`Preview tidak public/valid (${response.status}, ${type || 'unknown'}).`);
  } finally {
    clearTimeout(timer);
  }
}
