import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});

const captures = [
  { name: 'typing-300ms', delay: 300, dark: false },
  { name: 'typing-1100ms', delay: 1100, dark: false },
  { name: 'typing-1900ms', delay: 1900, dark: false },
  { name: 'typing-done-light', delay: 3500, dark: false },
  { name: 'typing-done-dark', delay: 3500, dark: true },
];

for (const c of captures) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: c.dark ? 'dark' : 'light',
  });
  const page = await context.newPage();
  await page.addInitScript(({ dark }) => {
    try {
      localStorage.setItem(
        'resume-builder.settings',
        JSON.stringify({ state: { themeMode: dark ? 'dark' : 'light' }, version: 0 }),
      );
    } catch {}
  }, { dark: c.dark });
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, c.delay));
  await page.screenshot({
    path: `C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/${c.name}.png`,
  });
  console.log(`captured ${c.name}`);
  await context.close();
}

await browser.close();
console.log('done');
