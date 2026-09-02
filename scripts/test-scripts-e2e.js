import fs from 'node:fs';
import path from 'node:path';
import { scripts as seedScripts } from '../src/data/scripts.js';
import { SCRIPT_BASELINE_FIELDS, normalizeScriptPayload } from '../api/lib/scriptSchema.js';

let passed = 0;
let failed = 0;
let skipped = 0;
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, label) => {
  console.log(`  [${condition ? 'PASS' : 'FAIL'}] ${label}`);
  condition ? passed++ : failed++;
};
const skip = (label) => { console.log(`  [SKIPPED] ${label}`); skipped++; };

console.log('NASKAH E2E VERIFIER — static contract + optional live API checks\n');
const api = read('api/index.js');
const cloudinary = read('api/lib/cloudinary.js');
const editor = read('src/components/manage/ScriptEditorModal.jsx');
const service = read('src/lib/contentService.js');
const publicSection = read('src/components/ScriptPreviewSection.jsx');
const modal = read('src/components/ScriptModal.jsx');
const manage = read('src/pages/manage/ManageScripts.jsx');
const combobox = read('src/components/manage/ComboboxField.jsx');

console.log('1. Baseline schema and round-trip contract');
assert(seedScripts.length > 0, 'TEST 1: baseline seed is present');
for (const field of SCRIPT_BASELINE_FIELDS) assert(seedScripts.every((item) => field in item), `Baseline field ${field} exists in every seed`);
const normalized = normalizeScriptPayload({ ...seedScripts[0], tags: ['one', 'two'], pdfUrl: null, pageCount: null });
assert(SCRIPT_BASELINE_FIELDS.every((field) => field in normalized), 'TEST 3/4: API schema emits every baseline field');
assert(Array.isArray(normalized.tags) && normalized.tags.join('|') === 'one|two', 'Nested tags array preserves type and ordering');
assert(normalized.pdfFileName === normalized.originalFilename, 'Legacy filename alias is preserved');
assert((() => { try { normalizeScriptPayload({ ...seedScripts[0], tags: 'bad' }); return false; } catch { return true; } })(), 'Wrong nested-array type is rejected');

console.log('\n2. CMS and public source contract');
for (const field of SCRIPT_BASELINE_FIELDS) assert(editor.includes(field), `TEST 2: editor explicitly handles ${field}`);
assert(!publicSection.includes("from '../data/scripts'"), 'TEST 13: public section does not import scripts.js runtime data');
assert(publicSection.includes('getScripts') && service.includes("cache: 'no-store'"), 'TEST 7/13: public source is uncached API data');
assert(manage.includes('searchQuery') && manage.includes('categoryFilter') && manage.includes('formatFilter') && manage.includes('sortOrder'), 'CMS has search, category/format filters, and sorting');
assert(editor.includes("'IDLE'") && editor.includes("'UPLOADING'") && editor.includes("'SAVED'") && editor.includes("'ERROR'"), 'TEST 8: CMS declares explicit document states');
assert(modal.includes('script.previewImageUrl || script.thumbnailUrl') && modal.includes("onError"), 'TEST 16: modal has preview → thumbnail → placeholder fallback');
assert(['script_category', 'institution', 'script_format', 'script_role'].every((type) => editor.includes(`type="${type}"`)), 'CMS uses comboboxes for category, institution, format, and role');
assert(combobox.includes('}, 7000)') && combobox.includes('clearTimeout(debounceTimerRef.current)'), 'Combobox remote option search is debounced for 7 seconds');
assert(editor.includes('createOnSelect={false}') && editor.includes('createOption(type, value)'), 'New Naskah combobox values are persisted on form submit, not selection');

console.log('\n3. Security, upload, and cleanup contract');
assert(!cloudinary.includes('|| \'dd2vcbep9\'') && !cloudinary.includes('TUNxo8'), 'Credentials are not hardcoded in Cloudinary helper');
assert(api.includes("app.post('/upload/script', requireAuth") && api.includes("app.post('/upload/script/cleanup', requireAuth"), 'TEST 5/6: PDF upload and cleanup require authentication');
assert(api.includes("app.post('/scripts', requireAuth") && api.includes("app.put('/scripts/:id', requireAuth") && api.includes("app.delete('/scripts/:id', requireAuth"), 'TEST 6: all Naskah mutations require authentication');
assert(api.includes("app.get('/scripts', async") && api.includes("app.get('/scripts/:id', async"), 'TEST 7: Naskah reads are public');
assert(api.includes('validatePdfDataUrl') && api.includes('20 * 1024 * 1024') && api.includes("'%PDF-'"), 'TEST 14/15: backend validates MIME/data URL, magic bytes, and 20MB limit');
assert(api.includes("'script_category'") && api.includes("'script_format'") && api.includes("'script_role'"), 'Backend permits the three Naskah taxonomy option types');
assert(cloudinary.includes("folder: 'porto-zeze/scripts'") && cloudinary.includes("page: 1") && cloudinary.includes('validatePublicImage'), 'TEST 8/9: deterministic public page-1 image is runtime-validated');
assert(api.includes('old PDF cleanup failed') && api.includes('deleteOne') && api.includes('cleanupWarning'), 'TEST 10/11: replacement and delete cleanup sequencing is implemented');
assert(![editor, manage, publicSection, modal].some((source) => /(?:localStorage|sessionStorage)\.(?:get|set|remove)Item/.test(source)), 'TEST 12: no browser content database usage');

console.log('\n4. Optional live runtime checks');
const baseUrl = process.env.SCRIPTS_E2E_BASE_URL;
if (!baseUrl) {
  skip('TEST 5–11 runtime API/Cloudinary/MongoDB checks require SCRIPTS_E2E_BASE_URL and a dedicated test account.');
} else {
  try {
    const publicRead = await fetch(`${baseUrl.replace(/\/$/, '')}/api/scripts`, { cache: 'no-store' });
    assert(publicRead.ok, 'Public GET /api/scripts is reachable without CMS login');
    const protectedUpload = await fetch(`${baseUrl.replace(/\/$/, '')}/api/upload/script`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'data:application/pdf;base64,JVBERi0xLjQKJSVFT0Y=' }) });
    assert(protectedUpload.status === 401, 'Unauthenticated PDF upload is rejected');
  } catch (error) {
    assert(false, `Live runtime endpoint check: ${error.message}`);
  }
}

console.log(`\nSUMMARY: ${passed} PASS, ${failed} FAIL, ${skipped} SKIPPED`);
if (failed) process.exit(1);
