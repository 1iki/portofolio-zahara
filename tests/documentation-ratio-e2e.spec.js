import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactsDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

test.describe('PUBLIC DOKUMENTASI IMAGE RATIO E2E VERIFICATION', () => {
  test('Verify documentation cards dynamically follow natural image aspect ratios', async ({ page }) => {
    // 1. Open public root page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Scroll to #dokumentasi section
    const docSection = page.locator('#dokumentasi');
    await expect(docSection).toBeVisible({ timeout: 10000 });
    await docSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Allow AsyncImages to load and layout to stabilize

    // 3. Find documentation card buttons
    const docCards = page.locator('#dokumentasi button[aria-label^="Lihat dokumentasi:"]');
    const cardCount = await docCards.count();

    expect(cardCount, 'Public Dokumentasi section must contain at least 1 card').toBeGreaterThan(0);

    const ratioResults = [];

    // 4. Measure card bounding box vs natural image aspect ratio for each card
    for (let i = 0; i < cardCount; i++) {
      const card = docCards.nth(i);
      const title = (await card.getAttribute('aria-label')) || `Card ${i + 1}`;

      const boundingBox = await card.boundingBox();
      expect(boundingBox).not.toBeNull();

      const cardWidth = boundingBox.width;
      const cardHeight = boundingBox.height;
      const cardRatio = cardWidth / cardHeight;

      // Locate img element inside card
      const imgLocator = card.locator('img');
      await expect(imgLocator).toBeVisible();

      // Read natural dimensions from browser DOM
      const dimensions = await imgLocator.evaluate((img) => ({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
      }));

      expect(dimensions.complete, `Image in card ${i + 1} must be complete`).toBe(true);
      expect(dimensions.naturalWidth, `Image in card ${i + 1} must have naturalWidth > 0`).toBeGreaterThan(0);
      expect(dimensions.naturalHeight, `Image in card ${i + 1} must have naturalHeight > 0`).toBeGreaterThan(0);

      const imageRatio = dimensions.naturalWidth / dimensions.naturalHeight;
      const diff = Math.abs(cardRatio - imageRatio);

      ratioResults.push({
        index: i + 1,
        title: title.replace('Lihat dokumentasi: ', ''),
        naturalWidth: dimensions.naturalWidth,
        naturalHeight: dimensions.naturalHeight,
        imageRatio: Number(imageRatio.toFixed(4)),
        cardRatio: Number(cardRatio.toFixed(4)),
        diff: Number(diff.toFixed(4)),
        passed: diff <= 0.02,
      });

      // Assert card ratio matches natural image ratio within tolerance of 0.02
      expect(diff, `Card ${i + 1} (${title}) cardRatio (${cardRatio.toFixed(4)}) vs imageRatio (${imageRatio.toFixed(4)}) difference must be <= 0.02`).toBeLessThanOrEqual(0.02);
    }

    console.log('\n--- DOCUMENTATION CARD RATIO E2E VERIFICATION RESULTS ---');
    console.table(ratioResults);

    // 5. Visual QA — Capture Screenshot
    const screenshotPath = path.join(artifactsDir, 'documentation_ratio_fix.png');
    await docSection.screenshot({ path: screenshotPath });
    console.log(`[Visual QA] Section screenshot saved to: ${screenshotPath}\n`);
  });
});
