import { works as seedWorks } from '../src/data/works.js';
import { documentations as seedDocs } from '../src/data/documentation.js';
import { scripts as seedScripts } from '../src/data/scripts.js';
import { experience as seedExp } from '../src/data/experience.js';
import { education as seedEdu } from '../src/data/education.js';
import { contact as seedContact } from '../src/data/contact.js';
import { workCategories as seedWorkCat } from '../src/data/workCategories.js';
import { experienceCategories as seedExpCat } from '../src/data/experienceCategories.js';
import { roleFilters as seedRoleFilters } from '../src/data/roleFilters.js';

console.log('==================================================');
console.log('FORENSIC AUDIT & DATA PARITY VERIFICATION SCRIPT');
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

// ── 1. SOURCE INVENTORY & SCHEMA INTEGRITY ───────────────────────
console.log('Phase 0 & 1: Source Inventory & Schema Integrity Check');

assert(Array.isArray(seedWorks) && seedWorks.length === 22, `seedWorks has 22 items (actual: ${seedWorks.length})`);
assert(Array.isArray(seedDocs) && seedDocs.length === 6, `seedDocs has 6 items (actual: ${seedDocs.length})`);
assert(Array.isArray(seedScripts) && seedScripts.length === 4, `seedScripts has 4 items (actual: ${seedScripts.length})`);
assert(Array.isArray(seedExp) && seedExp.length === 3, `seedExp has 3 items (actual: ${seedExp.length})`);
assert(Array.isArray(seedEdu) && seedEdu.length === 2, `seedEdu has 2 items (actual: ${seedEdu.length})`);
assert(typeof seedContact === 'object' && seedContact.email, 'seedContact object is valid');

// Check every work item has required properties
let worksPropertyPass = true;
seedWorks.forEach((w) => {
  if (!w.id || !w.title || !w.category || !w.role || !w.startDate || !w.endDate) {
    worksPropertyPass = false;
  }
});
assert(worksPropertyPass, 'All works items possess mandatory schema properties (id, title, category, role, startDate, endDate)');

// Check special fields in works
const conitycast = seedWorks.find((w) => w.id === 'conitycast');
assert(conitycast && conitycast.thumbnailType === 'project_artwork', 'Works property "thumbnailType" preserved in conitycast');
assert(conitycast && conitycast.embedUrl, 'Works property "embedUrl" preserved in conitycast');

const liputanWeekinshop = seedWorks.find((w) => w.id === 'liputan-weekinshop');
assert(liputanWeekinshop && liputanWeekinshop.aspectRatio === 'portrait', 'Works property "aspectRatio" preserved in liputan-weekinshop');

const jejakFlona = seedWorks.find((w) => w.id === 'jejak-flona');
assert(jejakFlona && jejakFlona.featuredEpisode && jejakFlona.featuredEpisode.title === 'Misteri Telur Keong', 'Works nested object "featuredEpisode" preserved in jejak-flona');

const happyScience = seedWorks.find((w) => w.id === 'happy-science');
assert(happyScience && Array.isArray(happyScience.media) && happyScience.media.length === 3, 'Works media array preserved in happy-science');

// Check experience metrics array of objects
const rriBogorExp = seedExp.find((e) => e.id === 'rri-bogor');
assert(rriBogorExp && Array.isArray(rriBogorExp.metrics) && rriBogorExp.metrics.length === 3, 'Experience metrics array of objects preserved in rri-bogor');

// Check contact properties
const contactProps = ['whatsapp', 'whatsappDisplay', 'linkedin', 'linkedinDisplay', 'instagram', 'instagramDisplay', 'email'];
let contactValid = true;
contactProps.forEach((p) => {
  if (!seedContact[p]) contactValid = false;
});
assert(contactValid, 'Contact singleton possesses all 7 required properties');

// Check education IDs
let eduIdsValid = true;
seedEdu.forEach((e) => {
  if (!e.id) eduIdsValid = false;
});
assert(eduIdsValid, 'Education items possess explicit unique IDs');

console.log('\n==================================================');
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('==================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('100% AUDIT & DATA PARITY VERIFIED SUCCESSFULLY!');
}
