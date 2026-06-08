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
await new Promise((r) => setTimeout(r, 3500));

const sections = [
  { id: 'ats', name: 'ats-revealed' },
  { id: 'templates', name: 'templates-revealed' },
  { id: 'principles', name: 'principles-revealed' },
];

for (const s of sections) {
  await page.evaluate((id) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, s.id);
  await new Promise((r) => setTimeout(r, 1400));
  await page.screenshot({
    path: `C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/${s.name}.png`,
  });
  console.log(`captured ${s.name}`);
}

await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
await new Promise((r) => setTimeout(r, 1400));
await page.screenshot({
  path: `C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/closing-revealed.png`,
});
console.log('captured closing-revealed');

await browser.close();
console.log('done');
