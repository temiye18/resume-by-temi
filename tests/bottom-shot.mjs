import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});
const page = await context.newPage();
await page.addInitScript(() => {
  try {
    localStorage.setItem(
      'resume-builder.settings',
      JSON.stringify({ state: { themeMode: 'dark' }, version: 0 }),
    );
  } catch {}
});
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 900));
await new Promise((r) => setTimeout(r, 1000));
await page.screenshot({ path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/closing-dark.png' });
await browser.close();
console.log('done');
