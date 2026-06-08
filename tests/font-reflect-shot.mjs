import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
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

// Theme tab
await page.locator('button[role="tab"]:has-text("Theme")').click();
await new Promise((r) => setTimeout(r, 500));

// Pick EB Garamond for both heading and body
await page.locator('button:has-text("EB Garamond")').first().click();
await new Promise((r) => setTimeout(r, 300));
await page.locator('button:has-text("EB Garamond")').nth(1).click();
await new Promise((r) => setTimeout(r, 800));

await page.screenshot({
  path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editor-eb-garamond.png',
});
console.log('captured editor-eb-garamond');

await browser.close();
console.log('done');
