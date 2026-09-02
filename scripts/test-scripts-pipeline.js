import fs from 'fs';
import path from 'path';
import { scripts as seedScripts } from '../src/data/scripts.js';

console.log('====================================================');
console.log('CMS NASKAH + PDF CLOUDINARY UPLOAD PIPELINE VERIFIER');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

// ── 1. SCHEMA INTEGRITY & PRESERVATION ───────────────────────────
console.log('1. Schema Integrity & Property Preservation Check');

assert(Array.isArray(seedScripts) && seedScripts.length === 4, 'Static seed scripts array possesses 4 items');

const requiredFields = [
  'id', 'title', 'program', 'episode', 'category', 'role',
  'date', 'organization', 'previewPageCount', 'description',
  'thumbnailUrl', 'previewImageUrl', 'format', 'tags'
];

let allFieldsPresent = true;
seedScripts.forEach((s) => {
  requiredFields.forEach((f) => {
    if (s[f] === undefined) {
      allFieldsPresent = false;
      console.error(`Missing field "${f}" in script "${s.id}"`);
    }
  });
});

assert(allFieldsPresent, 'All 14 baseline schema properties preserved across static seed data');

// ── 2. FORENSIC SEARCH FOR BANNED PATTERNS ────────────────────────
console.log('\n2. Forensic Security & No-LocalStorage Check');

// Check that client frontend files do NOT import localStorage for scripts
const manageScriptsContent = fs.readFileSync(path.resolve('src/pages/manage/ManageScripts.jsx'), 'utf-8');
const scriptEditorModalContent = fs.readFileSync(path.resolve('src/components/manage/ScriptEditorModal.jsx'), 'utf-8');
const scriptPreviewSectionContent = fs.readFileSync(path.resolve('src/components/ScriptPreviewSection.jsx'), 'utf-8');
const scriptModalContent = fs.readFileSync(path.resolve('src/components/ScriptModal.jsx'), 'utf-8');

assert(!manageScriptsContent.includes('localStorage'), 'ManageScripts.jsx does NOT use localStorage');
assert(!scriptEditorModalContent.includes('localStorage'), 'ScriptEditorModal.jsx does NOT use localStorage');
assert(!scriptPreviewSectionContent.includes('localStorage'), 'ScriptPreviewSection.jsx does NOT use localStorage');

// Check that public component reads dynamically from contentService (not hardcoded static scripts array as truth)
assert(scriptPreviewSectionContent.includes('getScripts'), 'ScriptPreviewSection dynamically fetches scripts via contentService');

// ── 3. CLOUDINARY SERVER SECRET ISOLATION ────────────────────────
console.log('\n3. Cloudinary Secret Isolation Check');

const viteEnvExample = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf-8') : '';
assert(!scriptEditorModalContent.includes('CLOUDINARY_API_SECRET'), 'CLOUDINARY_API_SECRET is NOT exposed in ScriptEditorModal.jsx');
assert(!manageScriptsContent.includes('CLOUDINARY_API_SECRET'), 'CLOUDINARY_API_SECRET is NOT exposed in ManageScripts.jsx');

// ── 4. API & CLOUDINARY HELPER INTEGRITY ─────────────────────────
console.log('\n4. API Route & Cloudinary Helper Verification');

const apiIndexContent = fs.readFileSync(path.resolve('api/index.js'), 'utf-8');
const cloudinaryHelperContent = fs.readFileSync(path.resolve('api/lib/cloudinary.js'), 'utf-8');

assert(apiIndexContent.includes('/upload/script'), 'API endpoint "/upload/script" registered');
assert(apiIndexContent.includes('deletePdfFromCloudinary'), 'DELETE /scripts/:id invokes deletePdfFromCloudinary asset cleanup');
assert(cloudinaryHelperContent.includes('uploadPdfToCloudinary'), 'Cloudinary helper exports uploadPdfToCloudinary');
assert(cloudinaryHelperContent.includes('page: 1'), 'Cloudinary helper generates page 1 image preview for PDF');

// ── 5. FORM & PUBLIC PDF EXPERIENCE ──────────────────────────────
console.log('\n5. Form UI & Public PDF Viewer Verification');

assert(scriptEditorModalContent.includes('handlePdfUpload'), 'ScriptEditorModal handles PDF upload state');
assert(scriptEditorModalContent.includes('pdfUrl'), 'ScriptEditorModal binds pdfUrl metadata');
assert(scriptEditorModalContent.includes('dragActive'), 'ScriptEditorModal supports Drag & Drop PDF zone');
assert(scriptModalContent.includes('Buka Dokumen PDF'), 'ScriptModal provides PDF viewer CTA button when pdfUrl is attached');

console.log('\n====================================================');
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('Static pipeline checks passed. Runtime credentials and external services are not verified by this script.');
}
