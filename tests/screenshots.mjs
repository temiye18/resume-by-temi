import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', '.tmp-shots');
mkdirSync(outDir, { recursive: true });

const targets = [
  { name: 'landing-desktop-light', width: 1440, height: 900, dark: false },
  { name: 'landing-desktop-dark', width: 1440, height: 900, dark: true },
  { name: 'landing-tablet-light', width: 820, height: 1180, dark: false },
];

const browser = await chromium.launch({
  executablePath:
    'C:/Users/xps/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
});
for (const t of targets) {
  const context = await browser.newContext({
    viewport: { width: t.width, height: t.height },
    deviceScaleFactor: 2,
    colorScheme: t.dark ? 'dark' : 'light',
  });
  const page = await context.newPage();
  await page.addInitScript(({ dark }) => {
    try {
      localStorage.setItem(
        'resume-builder.settings',
        JSON.stringify({ state: { themeMode: dark ? 'dark' : 'light' }, version: 0 }),
      );
    } catch {}
  }, { dark: t.dark });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: join(outDir, `${t.name}-fold.png`),
    fullPage: false,
  });
  await page.screenshot({
    path: join(outDir, `${t.name}-full.png`),
    fullPage: true,
  });
  console.log(`captured ${t.name}`);
  await context.close();
}
await browser.close();
console.log('done');
