import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});
const context = await browser.newContext({
  viewport: { width: 900, height: 1170 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(
  'file:///C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editorial.pdf',
  { waitUntil: 'networkidle' },
);
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({
  path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editorial-rendered.png',
});
console.log('captured editorial-rendered');
await browser.close();
