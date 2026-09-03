// The baseline Naskah schema fields for system compatibility.  These fields
// are intentionally listed rather than accepting arbitrary client payloads.
export const SCRIPT_BASELINE_FIELDS = [
  'id', 'title', 'program', 'episode', 'category', 'role', 'date',
  'organization', 'previewPageCount', 'previewPercentage', 'description', 'thumbnailUrl',
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
    if (!(field in output)) output[field] = field === 'tags' ? [] : (field === 'previewPercentage' ? 100 : null);
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

  // previewPercentage: integer 1–100, default 100 for backward compatibility
  if (output.previewPercentage === null || output.previewPercentage === undefined) {
    output.previewPercentage = 100;
  } else {
    const pct = Number(output.previewPercentage);
    if (!Number.isFinite(pct) || !Number.isInteger(pct) || pct < 1 || pct > 100) {
      throw new Error('previewPercentage harus berupa bilangan bulat antara 1 dan 100.');
    }
    output.previewPercentage = pct;
  }

  // pdfFileName is canonical; retain originalFilename for legacy consumers.
  const fileName = output.pdfFileName || output.originalFilename || null;
  output.pdfFileName = fileName;
  output.originalFilename = fileName;
  return output;
}
