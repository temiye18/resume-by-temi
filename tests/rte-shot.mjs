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

const summaryEditor = page.locator('.tiptap-prose').first();
await summaryEditor.click();
await page.keyboard.type('Built tools that scaled to ');
await page.keyboard.type('**10 million**');
await page.keyboard.type(' users while keeping the team to ');
await page.keyboard.type('*four engineers*');
await page.keyboard.type('.');
await new Promise((r) => setTimeout(r, 1200));

await page.screenshot({
  path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editor-rte-typing.png',
});
console.log('captured editor-rte-typing');

// Hover over the bubble menu by selecting some text
await page.evaluate(() => {
  const sel = window.getSelection();
  const editorEl = document.querySelector('.tiptap-prose');
  if (sel && editorEl) {
    const range = document.createRange();
    const textNode = editorEl.querySelector('strong');
    if (textNode) {
      range.selectNodeContents(textNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
});
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({
  path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editor-rte-bubble.png',
});
console.log('captured editor-rte-bubble');

await browser.close();
console.log('done');
