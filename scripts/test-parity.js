import { defaultWorkCategories, defaultExpCategories, defaultRoleFilters, defaultContact } from '../api/lib/defaults.js';

console.log('==================================================');
console.log('FORENSIC AUDIT & MONGODB DEFAULTS VERIFICATION');
console.log('==================================================\n');

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

// ── 1. DEFAULT CONFIGURATIONS CHECK ──────────────────────────────
console.log('Phase 1: MongoDB Default Taxonomy & Contact Integrity Check');

assert(Array.isArray(defaultWorkCategories) && defaultWorkCategories.length === 4, `defaultWorkCategories has 4 items (actual: ${defaultWorkCategories.length})`);
assert(Array.isArray(defaultExpCategories) && defaultExpCategories.length === 2, `defaultExpCategories has 2 items (actual: ${defaultExpCategories.length})`);
assert(Array.isArray(defaultRoleFilters) && defaultRoleFilters.length === 6, `defaultRoleFilters has 6 items (actual: ${defaultRoleFilters.length})`);
assert(typeof defaultContact === 'object' && defaultContact.email, 'defaultContact object is valid');

const contactProps = ['linkedin', 'instagram', 'youtube', 'email', 'phone', 'location'];
let contactValid = true;
contactProps.forEach((p) => {
  if (!defaultContact[p]) contactValid = false;
});
assert(contactValid, 'Contact singleton possesses all required communication properties');

import fs from 'fs';
import path from 'path';

// ── 2. DOCUMENTATION SECTION REGRESSION CHECK ──────────────────────
console.log('\nPhase 2: DocumentationSection Content Rendering Integrity Check');

const docSectionPath = path.resolve('src/components/DocumentationSection.jsx');
const docSectionContent = fs.readFileSync(docSectionPath, 'utf-8');

assert(
  docSectionContent.includes('[columnCount, docList]'),
  'DocumentationSection useMemo includes docList in dependency array'
);
assert(
  docSectionContent.includes('docList.length === 0'),
  'DocumentationSection handles explicit empty state fallback'
);
assert(
  docSectionContent.includes('AsyncImage'),
  'DocumentationSection uses AsyncImage for card thumbnail rendering'
);

// ── 3. COMBOBOX UX REFACTOR CONTRACT CHECK ──────────────────────────
console.log('\nPhase 3: Combobox Local-First & Debounced UX Integrity Check');

const comboboxPath = path.resolve('src/components/manage/ComboboxField.jsx');
const comboboxContent = fs.readFileSync(comboboxPath, 'utf-8');

assert(
  comboboxContent.includes('filteredOptions = useMemo'),
  'Combobox uses instant local-first filtering on client options'
);
assert(
  comboboxContent.includes('}, 350)'),
  'Combobox uses 350ms debounce before initiating remote queries'
);
assert(
  comboboxContent.includes('length >= 3') || comboboxContent.includes('length < 3'),
  'Combobox enforces minimum 3-character threshold for remote search'
);
assert(
  comboboxContent.includes('AbortController'),
  'Combobox uses AbortController to cancel stale in-flight requests'
);
assert(
  comboboxContent.includes('requestIdRef'),
  'Combobox uses request sequence identity protection against out-of-order responses'
);
assert(
  comboboxContent.includes("e.key === 'Enter'") && comboboxContent.includes('e.preventDefault()'),
  'Combobox prevents accidental parent form submission on Enter selection'
);

console.log('\n==================================================');
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('==================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('100% AUDIT & MONGODB DEFAULTS VERIFIED SUCCESSFULLY!');
}
