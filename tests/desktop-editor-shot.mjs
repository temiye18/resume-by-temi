import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve('.tmp-shots/mobile-editor');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  baseURL: 'http://localhost:5173',
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 200));
});

await page.goto('/app', { waitUntil: 'networkidle' });

const startBtn = page.getByRole('button', { name: /start fresh|new résumé|new resume/i }).first();
if (await startBtn.count()) {
  await startBtn.click();
} else {
  await page.getByRole('link', { name: /open/i }).first().click();
}
await page.waitForURL(/\/editor\//);
await page.waitForLoadState('networkidle');
await page.getByRole('tab', { name: /sections/i }).waitFor({ timeout: 10_000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/00-desktop-editor.png`, fullPage: false });

console.log('errors:', errors.length);
for (const e of errors) console.log('-', e);

await browser.close();
