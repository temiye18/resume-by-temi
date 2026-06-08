import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  acceptDownloads: true,
});
const page = await context.newPage();
await page.addInitScript(() => {
  try {
    localStorage.setItem(
      'resume-builder.settings',
      JSON.stringify({ state: { themeMode: 'light' }, version: 0 }),
    );
    indexedDB.deleteDatabase('resume-builder');
  } catch {}
});
await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
await new Promise((r) => setTimeout(r, 1500));
await page.locator('button:has-text("Start fresh")').click();
await new Promise((r) => setTimeout(r, 2500));

// Switch to editorial template
await page.locator('button[role="tab"]:has-text("Template")').click();
await new Promise((r) => setTimeout(r, 600));
await page.locator('button:has-text("Editorial")').click();
await new Promise((r) => setTimeout(r, 800));

// Screenshot editor with editorial template
await page.screenshot({
  path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editor-editorial.png',
});
console.log('captured editor-editorial');

// Go to Export tab
await page.locator('button[role="tab"]:has-text("Export")').click();
await new Promise((r) => setTimeout(r, 500));

// Trigger PDF download
const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
await page.locator('button:has-text("Download PDF")').first().click();
const download = await downloadPromise;
const target = 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editorial.pdf';
await download.saveAs(target);
console.log('saved editorial.pdf');

await browser.close();
console.log('done');
