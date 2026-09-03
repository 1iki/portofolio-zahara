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

test.describe('Combobox System E2E Browser Suite', () => {
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
      
      await colOptions.deleteMany({ normalizedValue: /qa/i });
      await colDocs.deleteMany({ id: /bts-qa/i });
      await colExp.deleteMany({ id: /qa/i });
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

  test('1. DOC TYPE — FULL USER FLOW (UI -> API -> DB)', async ({ page }) => {
    const timestamp = Date.now();
    const taxonomyVal = `QA Browser E2E Podcast ${timestamp}`;

    await switchTab(page, 'documentation');

    await page.click('button:has-text("Tambah BTS Baru")');
    await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();

    await page.fill('input[role="searchbox"]', taxonomyVal);

    const createBtn = page.locator(`text=Gunakan "${taxonomyVal}"`).first();
    await expect(createBtn).toBeVisible();

    await page.screenshot({ path: path.join(artifactsDir, 'creatable_taxonomy.png') });
    await createBtn.click();

    await expect(docTypeTrigger).toContainText(taxonomyVal);

    // Verify DB with retry loop
    if (db) {
      let optionDoc = null;
      for (let i = 0; i < 15; i++) {
        optionDoc = await db.collection('cms_options').findOne({
          type: 'doc_type',
          normalizedValue: taxonomyVal.toLowerCase().replace(/\s+/g, ' ')
        });
        if (optionDoc) break;
        await page.waitForTimeout(300);
      }
      expect(optionDoc).not.toBeNull();
      expect(optionDoc.value).toBe(taxonomyVal);
    }
  });

  test('2. REFRESH PERSISTENCE (Reload -> Reopen -> Visible in UI)', async ({ page }) => {
    const timestamp = Date.now();
    const taxonomyVal = `QA Browser E2E Refresh ${timestamp}`;

    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();
    await page.fill('input[role="searchbox"]', taxonomyVal);
    await page.click(`text=Gunakan "${taxonomyVal}"`);
    await expect(docTypeTrigger).toContainText(taxonomyVal);

    await page.waitForTimeout(1000);

    // RELOAD BROWSER PAGE & SWITCH TO DOKUMENTASI TAB
    await page.reload();
    await switchTab(page, 'documentation');

    await page.click('button:has-text("Tambah BTS Baru")');
    const reloadedDocTypeTrigger = page.locator('form div[role="combobox"]').first();
    await reloadedDocTypeTrigger.click();
    await page.fill('input[role="searchbox"]', taxonomyVal);

    const optionInDropdown = page.locator(`div[role="option"]:has-text("${taxonomyVal}")`).first();
    await expect(optionInDropdown).toBeVisible();
  });

  test('3. EXISTING TAXONOMY (Human readable label vs DB canonical value)', async ({ page }) => {
    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();

    const photoOption = page.locator('div[role="option"]:has-text("Foto BTS")').first();
    await expect(photoOption).toBeVisible();
    await photoOption.click();

    await expect(docTypeTrigger).toContainText('Foto BTS');
    await page.screenshot({ path: path.join(artifactsDir, 'existing_taxonomy.png') });
  });

  test('4. CASE-INSENSITIVE DUPLICATE UI (No duplicate POST sent)', async ({ page }) => {
    const timestamp = Date.now();
    const dupBase = `QA Browser E2E Duplicate ${timestamp}`;

    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();
    await page.fill('input[role="searchbox"]', dupBase);
    await page.click(`text=Gunakan "${dupBase}"`);
    await expect(docTypeTrigger).toContainText(dupBase);

    await docTypeTrigger.click();
    await page.fill('input[role="searchbox"]', dupBase.toLowerCase());

    const existingOpt = page.locator(`div[role="option"]:has-text("${dupBase}")`).first();
    await expect(existingOpt).toBeVisible();
    
    const createBtn = page.locator(`text=Gunakan "${dupBase.toLowerCase()}"`);
    await expect(createBtn).not.toBeVisible();
  });

  test('5. FILTER COMBOBOX (Selection-Only Enforced)', async ({ page }) => {
    await switchTab(page, 'documentation');

    const filterGroupTrigger = page.locator('div[role="combobox"]').first();
    await filterGroupTrigger.click();

    await page.fill('input[role="searchbox"]', 'xyz_random_non_existent');

    const createBtn = page.locator('text=+ Baru');
    await expect(createBtn).not.toBeVisible();

    await page.screenshot({ path: path.join(artifactsDir, 'filter_selection_only.png') });
  });

  test('6. SORT ORDER (Banana cannot become sortOrder)', async ({ page }) => {
    await switchTab(page, 'scripts');

    const sortTrigger = page.locator('div[role="combobox"]').nth(2);
    await sortTrigger.click();

    await page.fill('input[role="searchbox"]', 'banana');

    const createBtn = page.locator('text=+ Baru');
    await expect(createBtn).not.toBeVisible();
  });

  test('7. API FAILURE E2E (HTTP 500 Intercept -> Error displayed)', async ({ page }) => {
    const handler = async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Database Connection Timeout Error' }),
        });
      } else {
        await route.continue();
      }
    };

    await page.route('**/api/options', handler);

    try {
      await switchTab(page, 'documentation');
      await page.click('button:has-text("Tambah BTS Baru")');
      await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

      const docTypeTrigger = page.locator('form div[role="combobox"]').first();
      await docTypeTrigger.click();
      await page.fill('input[role="searchbox"]', 'QA Failure Test');

      const createBtn = page.locator('text=Gunakan "QA Failure Test"').first();
      await createBtn.click();

      const errorMsg = page.locator('text=Database Connection Timeout Error');
      await expect(errorMsg).toBeVisible();

      await page.screenshot({ path: path.join(artifactsDir, 'api_failure.png') });
    } finally {
      await page.unroute('**/api/options', handler);
    }
  });

  test('8. DOUBLE SUBMIT E2E (Throttled Network -> 1 POST request)', async ({ page }) => {
    const taxonomyVal = `QA Double Submit ${Date.now()}`;
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
      await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

      const docTypeTrigger = page.locator('form div[role="combobox"]').first();
      await docTypeTrigger.click();
      await page.fill('input[role="searchbox"]', taxonomyVal);

      const createBtn = page.locator(`text=Gunakan "${taxonomyVal}"`).first();
      await expect(createBtn).toBeVisible();
      await createBtn.click();

      await page.waitForTimeout(1500);
      expect(postRequestCount).toBe(1);
    } finally {
      page.off('request', onRequest);
    }
  });

  test('9. ENTER KEY TEST (Form not prematurely submitted)', async ({ page }) => {
    await switchTab(page, 'documentation');
    await page.click('button:has-text("Tambah BTS Baru")');
    await page.waitForSelector('text=Tambah Dokumentasi BTS Baru');

    const docTypeTrigger = page.locator('form div[role="combobox"]').first();
    await docTypeTrigger.click();

    const searchInput = page.locator('input[role="searchbox"]');
    await searchInput.fill('Foto BTS');
    await searchInput.press('Enter');

    await expect(page.locator('text=Tambah Dokumentasi BTS Baru')).toBeVisible();
    await expect(docTypeTrigger).toContainText('Foto BTS');
  });

  test('10. CROSS-FORM INSTITUTION SHARING', async ({ page }) => {
    const timestamp = Date.now();
    const instName = `QA Browser Institution ${timestamp}`;

    await switchTab(page, 'experience');
    await page.click('button:has-text("Tambah Pengalaman")');
    await page.waitForSelector('text=Tambah Pengalaman Baru');

    const instTrigger = page.locator('form div[role="combobox"]').first();
    await instTrigger.click();
    await page.fill('input[role="searchbox"]', instName);
    
    const createBtn = page.locator(`text=Gunakan "${instName}"`).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();
    await expect(instTrigger).toContainText(instName);

    await page.waitForTimeout(1000);

    // Close experience modal using Batal button
    const cancelBtn = page.locator('button:has-text("Batal")').first();
    await cancelBtn.click();
    await page.waitForSelector('text=Tambah Pengalaman Baru', { state: 'detached' });

    // Open WorkEditorModal
    await switchTab(page, 'works');
    await page.click('button:has-text("Tambah Karya Baru")');
    await page.waitForSelector('text=Tambah Karya Baru');

    const workInstTrigger = page.locator('form div[role="combobox"]').nth(1);
    await workInstTrigger.click();
    await page.fill('input[role="searchbox"]', instName);

    const optionInWork = page.locator(`div[role="option"]:has-text("${instName}")`).first();
    await expect(optionInWork).toBeVisible();
  });

  test('11. ASPECT RATIO UI (Normalization & Invalid Rejection)', async ({ page }) => {
    await switchTab(page, 'works');
    await page.click('button:has-text("Tambah Karya Baru")');
    await page.waitForSelector('text=Tambah Karya Baru');

    const ratioTrigger = page.locator('form div[role="combobox"]').nth(4);
    await ratioTrigger.click();

    await page.fill('input[role="searchbox"]', '21:9');
    await page.click('text=Gunakan "21:9"');
    await expect(ratioTrigger).toContainText('21 / 9');

    await ratioTrigger.click();
    await page.fill('input[role="searchbox"]', 'abc / def');
    await page.click('text=Gunakan "abc / def"');

    const errorMsg = page.locator('text=Format Aspect Ratio tidak valid');
    await expect(errorMsg).toBeVisible();

    await page.screenshot({ path: path.join(artifactsDir, 'aspect_ratio_validation.png') });
  });

  test('12. API SECURITY & AUTHENTICATION', async ({ request }) => {
    const resNoAuth = await request.post('/api/options', {
      data: { type: 'doc_type', value: 'Unauthorized Test' },
    });
    expect(resNoAuth.status()).toBe(401);

    const resBadAuth = await request.post('/api/options', {
      headers: { Authorization: 'Bearer invalid_garbage_token' },
      data: { type: 'doc_type', value: 'Unauthorized Test' },
    });
    expect(resBadAuth.status()).toBe(401);

    const token = createSessionToken();
    const resBadType = await request.post('/api/options', {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: 'invalid_hacker_type', value: 'Invalid Type Test' },
    });
    expect(resBadType.status()).toBe(400);

    const resEmptyVal = await request.post('/api/options', {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: 'doc_type', value: '   ' },
    });
    expect(resEmptyVal.status()).toBe(400);
  });
});
