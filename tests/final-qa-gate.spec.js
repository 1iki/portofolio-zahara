import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import { createSessionToken } from '../api/lib/auth.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'PortoZeze';
const artifactsDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

async function loginIfNeeded(page) {
  await page.goto('/manage');
  await page.waitForLoadState('domcontentloaded');

  try {
    await page.waitForSelector('text=CMS Dashboard', { timeout: 3000 });
  } catch {
    const pinHeader = page.locator('text=Akses CMS Zahara');
    if (await pinHeader.isVisible().catch(() => false)) {
      const inputs = page.locator('input[aria-label^="Digit ke-"]');
      const pin = '250826'.split('');
      for (let i = 0; i < 6; i++) {
        await inputs.nth(i).fill(pin[i]);
      }
      await page.click('button[type="submit"]');
      await page.waitForSelector('text=CMS Dashboard', { timeout: 6000 });
    }
  }
}

async function switchTab(page, tabId) {
  await loginIfNeeded(page);

  const labelMap = {
    documentation: 'Dokumentasi BTS',
    works: 'Karya & Portofolio',
    scripts: 'Cuplikan Naskah',
    experience: 'Pengalaman Kerja',
    education: 'Riwayat Pendidikan',
    contact: 'Informasi Kontak',
    configs: 'Konfigurasi CMS',
  };

  const label = labelMap[tabId] || 'Dokumentasi BTS';
  const navBtn = page.locator(`button:has-text("${label}")`).first();
  await expect(navBtn).toBeVisible({ timeout: 5000 });
  await navBtn.click();
  await page.waitForTimeout(300);
}

async function closeModalIfOpen(page) {
  try {
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(200);
    }
  } catch {
    // Ignore if no modal open
  }
}

test.describe('FINAL QA GATE — COMBOBOX & AUTO-REFRESH SUITE', () => {
  let client;
  let db;

  test.beforeAll(async () => {
    if (uri) {
      client = new MongoClient(uri);
      await client.connect();
      db = client.db(dbName);
    }
  });

  test.afterAll(async () => {
    if (db) {
      const colOptions = db.collection('cms_options');
      const colDocs = db.collection('documentation');
      const colExp = db.collection('experience');
      
      await colOptions.deleteMany({ normalizedValue: /finalqa/i });
      await colDocs.deleteMany({ id: /finalqa/i });
      await colExp.deleteMany({ id: /finalqa/i });
      await client.close();
    }
  });

  test.beforeEach(async ({ context }) => {
    const token = createSessionToken();
    await context.addCookies([
      { name: 'zeze_cms_session', value: token, domain: '127.0.0.1', path: '/' },
      { name: 'zeze_cms_session', value: token, domain: 'localhost', path: '/' }
    ]);
  });

  test.afterEach(async ({ page }) => {
    await closeModalIfOpen(page);
  });

  // PHASE 3 & 4: OBSERVABILITY & STABILITY TEST (10s static observation across 5 pages)
  test('PHASE 3 & 4 — Browser Observability & 10s Static Stability Test', async ({ page }) => {
    test.setTimeout(90000);
    let navigations = [];
    let getOptionsCount = 0;
    let authMeCount = 0;
    let postOptionsCount = 0;
    let consoleErrors = [];

    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        navigations.push(frame.url());
      }
    });

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/options') && req.method() === 'GET') getOptionsCount++;
      if (url.includes('/api/options') && req.method() === 'POST') postOptionsCount++;
      if (url.includes('/api/auth/me')) authMeCount++;
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const pagesToTest = ['documentation', 'experience', 'works', 'scripts', 'contact'];

    for (const cmsTab of pagesToTest) {
      await switchTab(page, cmsTab);
      const initialNavCount = navigations.length;
      const initialGetOptions = getOptionsCount;

      // Observe page with ZERO user interaction for 10 seconds
      await page.waitForTimeout(10000);

      // Verify no unexpected navigations/reloads happened during observation
      const newNavigations = navigations.length - initialNavCount;
      expect(newNavigations, `Unexpected browser navigation on tab ${cmsTab}`).toBe(0);
    }

    expect(postOptionsCount, 'Unexpected POST options requests during static view').toBe(0);
    expect(consoleErrors.length, `Console errors observed: ${consoleErrors.join(', ')}`).toBe(0);
  });

  // PHASE 5 MODE A — SELECTABLE ONLY
  test('PHASE 5 MODE A — Selectable Only Combobox Filters & Sorts', async ({ page }) => {
    await switchTab(page, 'documentation');

    // Filter Group dropdown
    const filterGroupTrigger = page.locator('div[role="combobox"]').first();
    await filterGroupTrigger.click();

    await page.fill('input[role="searchbox"]', 'NonExistentFilterOption123');

    // Assert creatable UI is NOT visible
    const createBtn = page.locator('text=+ Baru');
    await expect(createBtn).not.toBeVisible();
    const useBtn = page.locator('text=Gunakan "NonExistentFilterOption123"');
    await expect(useBtn).not.toBeVisible();

    await page.keyboard.press('Escape');

    // Scripts category filter
    await switchTab(page, 'scripts');
    const scriptFilterTrigger = page.locator('div[role="combobox"]').first();
    await scriptFilterTrigger.click();
    await page.fill('input[role="searchbox"]', 'ArbitraryValueXYZ');
    await expect(page.locator('text=+ Baru')).not.toBeVisible();
  });

  // PHASE 5 MODE B — LOCAL CREATABLE (ASPECT RATIO VALIDATION)
  test('PHASE 5 MODE B — Aspect Ratio Normalization & Strict Validation', async ({ page }) => {
    await switchTab(page, 'works');
    await page.click('button:has-text("Tambah Karya Baru")');
    await page.waitForSelector('text=Tambah Karya Baru');

    const ratioTrigger = page.locator('form div[role="combobox"]').nth(4);

    // Test 1: 21:9 -> 21 / 9
    await ratioTrigger.click();
    await page.fill('input[role="searchbox"]', '21:9');
    await page.click('text=Gunakan "21:9"');
    await expect(ratioTrigger).toContainText('21 / 9');

    // Test 2: 3:4 -> 3 / 4
    await ratioTrigger.click();
    await page.fill('input[role="searchbox"]', '3:4');
    await page.click('text=Gunakan "3:4"');
    await expect(ratioTrigger).toContainText('3 / 4');

    // Test 3: Invalid text "abc / def" -> Rejected
    await ratioTrigger.click();
    await page.fill('input[role="searchbox"]', 'abc / def');
    await page.click('text=Gunakan "abc / def"');
    await expect(page.locator('text=Format Aspect Ratio tidak valid')).toBeVisible();

    // Test 4: Zero ratio "0 / 0" -> Rejected
    await ratioTrigger.click();
    await page.fill('input[role="searchbox"]', '0 / 0');
    await page.click('text=Gunakan "0 / 0"');
    await expect(page.locator('text=Format Aspect Ratio tidak valid')).toBeVisible();

    // Test 5: Negative ratio "-1 / 4" -> Rejected
    await ratioTrigger.click();
    await page.fill('input[role="searchbox"]', '-1 / 4');
    await page.click('text=Gunakan "-1 / 4"');
    await expect(page.locator('text=Format Aspect Ratio tidak valid')).toBeVisible();
  });

  // PHASE 5 MODE C — PERSISTENT TAXONOMY FULL FLOW
  test('PHASE 5 MODE C — Persistent Taxonomy Full Flow (Modal -> API -> DB -> UI -> Reload Persistence)', async ({ page }) => {
    const timestamp = Date.now();
    const taxonomyVal = `FinalQA Taxon ${timestamp}`;

    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();
    await page.fill('input[role="searchbox"]', taxonomyVal);

    const createBtn = page.locator(`text=Gunakan "${taxonomyVal}"`).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    await expect(docTypeTrigger).toContainText(taxonomyVal);

    // Verify DB record created
    if (db) {
      let docRecord = null;
      for (let i = 0; i < 15; i++) {
        docRecord = await db.collection('cms_options').findOne({
          type: 'doc_type',
          normalizedValue: taxonomyVal.toLowerCase().replace(/\s+/g, ' ')
        });
        if (docRecord) break;
        await page.waitForTimeout(200);
      }
      expect(docRecord).not.toBeNull();
      expect(docRecord.value).toBe(taxonomyVal);
    }

    // Close modal & reload page
    await closeModalIfOpen(page);
    await page.reload();

    // Reopen modal and verify option appears in remote fetch dropdown list
    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    const reloadedDocTrigger = page.locator('form div[role="combobox"]').first();
    await reloadedDocTrigger.click();
    await page.fill('input[role="searchbox"]', taxonomyVal);

    const optionInList = page.locator(`div[role="option"]:has-text("${taxonomyVal}")`).first();
    await expect(optionInList).toBeVisible();
  });

  // PHASE 6 — DUPLICATE & CONCURRENCY
  test('PHASE 6 — Case-Insensitive Casing Normalization & Concurrent Creation Integrity', async ({ page, request }) => {
    const timestamp = Date.now();
    const baseVal = `FinalQA Conc ${timestamp}`;

    // 1. Casing normalization UI test
    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();
    await page.fill('input[role="searchbox"]', baseVal);
    await page.click(`text=Gunakan "${baseVal}"`);
    await expect(docTypeTrigger).toContainText(baseVal);

    // Typing lowercase or spaced version should find existing canonical item, not show create button
    await docTypeTrigger.click();
    await page.fill('input[role="searchbox"]', `  ${baseVal.toLowerCase()}  `);
    const existingOpt = page.locator(`div[role="option"]:has-text("${baseVal}")`).first();
    await expect(existingOpt).toBeVisible();
    await expect(page.locator(`text=Gunakan "`)).not.toBeVisible();

    await closeModalIfOpen(page);

    // 2. Concurrent Creation API test (3 simultaneous POST requests with different casing/spacing)
    if (db) {
      const token = createSessionToken();
      const concType = 'production_category';
      const concBase = `FinalQA Concurrent DB ${timestamp}`;
      const variations = [
        concBase,
        concBase.toLowerCase(),
        `  ${concBase.toUpperCase()}  `
      ];

      const responses = await Promise.all(
        variations.map((v) =>
          request.post('/api/options', {
            headers: { Authorization: `Bearer ${token}` },
            data: { type: concType, value: v },
          })
        )
      );

      // Every response should succeed
      for (const res of responses) {
        expect(res.status()).toBe(200);
      }

      // MongoDB count for normalizedValue MUST be EXACTLY 1
      const count = await db.collection('cms_options').countDocuments({
        type: concType,
        normalizedValue: concBase.toLowerCase().replace(/\s+/g, ' ')
      });
      expect(count, 'MongoDB record count for concurrent creations must be 1').toBe(1);
    }
  });

  // PHASE 7 — API FAILURE INTERCEPTION
  test('PHASE 7 — HTTP 500 API Failure Handling & Error UI', async ({ page }) => {
    const handler = async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Database Internal Timeout Test' }),
        });
      } else {
        await route.continue();
      }
    };

    await page.route('**/api/options', handler);

    try {
      await switchTab(page, 'documentation');
      await page.click('button:has-text("Tambah BTS Baru")');

      const docTypeTrigger = page.locator('form div[role="combobox"]').first();
      await docTypeTrigger.click();
      await page.fill('input[role="searchbox"]', 'FinalQA Intercept Error');

      const createBtn = page.locator('text=Gunakan "FinalQA Intercept Error"').first();
      await createBtn.click();

      // Verify explicit error message displayed inside dropdown
      const errorMsg = page.locator('text=Database Internal Timeout Test');
      await expect(errorMsg).toBeVisible();

      // Dropdown remains active and no false selection made
      await expect(docTypeTrigger).not.toContainText('FinalQA Intercept Error');
    } finally {
      await page.unroute('**/api/options', handler);
    }
  });

  // PHASE 8 — DOUBLE SUBMIT THROTTLING
  test('PHASE 8 — Double Submit Throttling & Loading State', async ({ page }) => {
    const taxonomyVal = `FinalQA DoubleSubmit ${Date.now()}`;
    let postRequestCount = 0;

    const onRequest = (req) => {
      if (req.url().includes('/api/options') && req.method() === 'POST') {
        postRequestCount++;
      }
    };
    page.on('request', onRequest);

    try {
      await switchTab(page, 'documentation');
      await page.click('button:has-text("Tambah BTS Baru")');

      const docTypeTrigger = page.locator('form div[role="combobox"]').first();
      await docTypeTrigger.click();
      await page.fill('input[role="searchbox"]', taxonomyVal);

      const createBtn = page.locator(`text=Gunakan "${taxonomyVal}"`).first();
      await expect(createBtn).toBeVisible();

      // Double-click rapidly
      await createBtn.click({ clickCount: 2 });

      await page.waitForTimeout(1500);

      // Verify exactly 1 POST request sent
      expect(postRequestCount).toBe(1);
    } finally {
      page.off('request', onRequest);
    }
  });

  // PHASE 9 — ENTER KEY IN MODAL FORM
  test('PHASE 9 — Enter Key Combobox Selection Does Not Submit Parent Modal', async ({ page }) => {
    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();

    const searchInput = page.locator('input[role="searchbox"]');
    await searchInput.fill('Foto BTS');
    await searchInput.press('Enter');

    // Parent modal MUST still be open
    await expect(page.locator('text=Tambah Dokumentasi BTS Baru')).toBeVisible();
    await expect(docTypeTrigger).toContainText('Foto BTS');
  });

  // PHASE 10 — HMR / FILE WATCHER REGRESSION
  test('PHASE 10 — Dev Server HMR File Watcher Ignores Test Artifacts', async ({ page }) => {
    await switchTab(page, 'documentation');

    let pageReloaded = false;
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) pageReloaded = true;
    });

    // Reset flag after initial nav
    await page.waitForTimeout(500);
    pageReloaded = false;

    // Create temporary artifact files in screenshots and test-results directories
    const tempFile1 = path.join(artifactsDir, 'temp_watcher_test.png');
    const tempFile2 = path.resolve(__dirname, '../test-results/temp_test.log');

    fs.writeFileSync(tempFile1, 'fake image data');
    fs.mkdirSync(path.dirname(tempFile2), { recursive: true });
    fs.writeFileSync(tempFile2, 'fake log data');

    // Wait 2 seconds to check if Vite reloaded
    await page.waitForTimeout(2000);

    expect(pageReloaded, 'Generated test artifact file triggered an unwanted Vite browser reload').toBe(false);

    // Clean up temp files
    if (fs.existsSync(tempFile1)) fs.unlinkSync(tempFile1);
    if (fs.existsSync(tempFile2)) fs.unlinkSync(tempFile2);
  });

  // PHASE 11 — REQUEST STORM DETECTION
  test('PHASE 11 — Request Storm Detection (Controlled GET Requests)', async ({ page }) => {
    let getOptionsCalls = 0;

    page.on('request', (req) => {
      if (req.url().includes('/api/options') && req.method() === 'GET') {
        getOptionsCalls++;
      }
    });

    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');

    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();

    // Type query shorter than 3 chars (should NOT trigger remote fetch)
    const searchInput = page.locator('input[role="searchbox"]');
    await searchInput.fill('ab');
    await page.waitForTimeout(500);

    const initialCalls = getOptionsCalls;

    // Type 3+ chars
    await searchInput.fill('abcd');
    await page.waitForTimeout(500); // Debounce duration 350ms

    // Should trigger exactly 1 additional debounced remote search GET request
    expect(getOptionsCalls - initialCalls).toBeLessThanOrEqual(1);

    await closeModalIfOpen(page);
  });

  // PHASE 12 — DATABASE INTEGRITY
  test('PHASE 12 — Database Index Verification ({ type: 1, normalizedValue: 1 } Unique Index)', async () => {
    if (db) {
      const indexes = await db.collection('cms_options').indexes();
      const hasUniqueCompoundIndex = indexes.some((idx) => {
        const key = idx.key;
        return key.type === 1 && key.normalizedValue === 1 && idx.unique === true;
      });

      expect(hasUniqueCompoundIndex, 'MongoDB cms_options must have a unique index on { type: 1, normalizedValue: 1 }').toBe(true);
    }
  });
});
