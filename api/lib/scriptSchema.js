// The seed in src/data/scripts.js is the compatibility baseline.  These fields
// are intentionally listed rather than accepting arbitrary client payloads.
export const SCRIPT_BASELINE_FIELDS = [
  'id', 'title', 'program', 'episode', 'category', 'role', 'date',
  'organization', 'previewPageCount', 'description', 'thumbnailUrl',
  'previewImageUrl', 'format', 'tags',
];

export const SCRIPT_DOCUMENT_FIELDS = [
  ...SCRIPT_BASELINE_FIELDS,
  'externalUrl', 'pdfUrl', 'pdfPublicId', 'pdfFileName', 'originalFilename',
  'previewImagePublicId', 'pageCount', 'createdAt', 'updatedAt',
];

const nullableStrings = new Set([
  'program', 'episode', 'category', 'role', 'date', 'organization', 'previewPageCount',
  'description', 'thumbnailUrl', 'previewImageUrl', 'format', 'externalUrl',
  'pdfUrl', 'pdfPublicId', 'pdfFileName', 'originalFilename', 'previewImagePublicId',
]);

export function normalizeScriptPayload(input, { id } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Payload naskah harus berupa object.');
  }

  const output = {};
  for (const field of SCRIPT_DOCUMENT_FIELDS) {
    if (field in input && !['id', 'createdAt', 'updatedAt'].includes(field)) output[field] = input[field];
  }
  output.id = id || input.id;

  for (const field of SCRIPT_BASELINE_FIELDS) {
    if (!(field in output)) output[field] = field === 'tags' ? [] : null;
  }

  if (typeof output.id !== 'string' || !output.id.trim()) throw new Error('ID naskah wajib berupa string.');
  if (typeof output.title !== 'string' || !output.title.trim()) throw new Error('Judul naskah wajib berupa string.');
  output.id = output.id.trim();
  output.title = output.title.trim();

  for (const field of nullableStrings) {
    if (!(field in output)) continue;
    if (output[field] !== null && typeof output[field] !== 'string') throw new Error(`${field} harus berupa string atau null.`);
    if (typeof output[field] === 'string') output[field] = output[field].trim() || null;
  }
  if (!Array.isArray(output.tags) || output.tags.some((tag) => typeof tag !== 'string')) {
    throw new Error('tags harus berupa array string.');
  }
  output.tags = output.tags.map((tag) => tag.trim()).filter(Boolean);
  if ('pageCount' in output && output.pageCount !== null && (!Number.isInteger(output.pageCount) || output.pageCount < 1)) {
    throw new Error('pageCount harus berupa bilangan bulat positif atau null.');
  }

  // pdfFileName is canonical; retain originalFilename for legacy consumers.
  const fileName = output.pdfFileName || output.originalFilename || null;
  output.pdfFileName = fileName;
  output.originalFilename = fileName;
  return output;
}
