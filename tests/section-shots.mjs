import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await new Promise((r) => setTimeout(r, 800));

const sections = [
  { id: 'ats', name: 'ats' },
  { id: 'templates', name: 'templates' },
  { id: 'principles', name: 'principles' },
];

for (const s of sections) {
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, s.id);
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: `C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/section-${s.name}.png`,
  });
  console.log(`captured ${s.name}`);
}

await browser.close();
console.log('done');
