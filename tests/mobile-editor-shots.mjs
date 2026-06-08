import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve('.tmp-shots/mobile-editor');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  baseURL: 'http://localhost:5173',
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 200));
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`));

await page.goto('/app', { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/01-dashboard.png`, fullPage: false });

const newButton = page.getByRole('button', { name: /new résumé|new resume/i }).first();
if (await newButton.count()) {
  await newButton.click();
  await page.waitForURL(/\/editor\//);
} else {
  const openLink = page.getByRole('link', { name: /open/i }).first();
  if (await openLink.count()) await openLink.click();
  await page.waitForURL(/\/editor\//);
}

await page.waitForLoadState('networkidle');
await page.getByRole('tab', { name: /sections/i }).waitFor({ timeout: 10_000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/02-editor-sections.png`, fullPage: false });

await page.getByRole('tab', { name: /preview/i }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/03-editor-preview.png`, fullPage: false });

await page.getByRole('tab', { name: /template/i }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/04-editor-template.png`, fullPage: false });

await page.getByRole('tab', { name: /theme/i }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/05-editor-theme.png`, fullPage: false });

await page.getByRole('tab', { name: /export/i }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/06-editor-export.png`, fullPage: false });

console.log('shots written to', OUT);
console.log('errors:', errors.length);
for (const e of errors) console.log('-', e);

await browser.close();
