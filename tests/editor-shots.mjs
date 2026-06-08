import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});

const captures = [
  { name: 'dashboard-empty-light', url: 'http://localhost:5173/app', dark: false, wait: 1500 },
  { name: 'dashboard-empty-dark', url: 'http://localhost:5173/app', dark: true, wait: 1500 },
  { name: 'about-light', url: 'http://localhost:5173/about', dark: false, wait: 800 },
  { name: 'privacy-light', url: 'http://localhost:5173/privacy', dark: false, wait: 800 },
  { name: 'templates-light', url: 'http://localhost:5173/templates', dark: false, wait: 1500 },
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
  await page.goto(c.url, { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, c.wait));
  await page.screenshot({
    path: `C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/${c.name}.png`,
  });
  console.log(`captured ${c.name}`);
  await context.close();
}

// Editor with a seeded resume
{
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
    } catch {}
  });
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 1500));
  // click "Start fresh"
  await page.locator('button:has-text("Start fresh")').click();
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editor-light.png',
  });
  console.log('captured editor-light');
  await context.close();
}

{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
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
  await page.goto('http://localhost:5173/app', { waitUntil: 'networkidle' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.locator('button:has-text("Start fresh")').click();
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: 'C:/Users/xps/Documents/Projects/YEAR_2025/VIBE_CODE/resume-builder/.tmp-shots/editor-dark.png',
  });
  console.log('captured editor-dark');
  await context.close();
}

await browser.close();
console.log('done');
