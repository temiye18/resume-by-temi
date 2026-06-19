import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve('.tmp-shots/projects');
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
const startBtn = page.getByRole('button', { name: /start fresh/i }).first();
if (await startBtn.count()) await startBtn.click();
else await page.getByRole('link', { name: /open/i }).first().click();

await page.waitForURL(/\/editor\//);
await page.waitForLoadState('networkidle');
await page.getByRole('tab', { name: /sections/i }).waitFor({ timeout: 10_000 });

const projectsHeading = page.getByText(/^Projects$/i).first();
await projectsHeading.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
const projectsRow = projectsHeading.locator('..').first();
await projectsRow.getByRole('button', { name: /add entry/i }).click();
await page.waitForTimeout(300);

// Open the new entry and fill all fields
// Open the new project entry's disclosure
const projectsSection = projectsHeading.locator('xpath=..').locator('xpath=..');
await projectsSection.getByRole('button', { name: /^Project/i }).first().click();
await page.waitForTimeout(300);

// Fill via xpath relative to projects section
const inputs = projectsSection.locator('input');
await inputs.nth(0).fill('ShareSafe');
await inputs.nth(1).fill('Social-media app with geofenced incident alerts');
await inputs.nth(2).fill('https://sharesafe.app');
await inputs.nth(3).fill('https://github.com/you/sharesafe');

await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/01-with-links.png`, fullPage: false });

console.log('errors:', errors.length);
for (const e of errors) console.log('-', e);

await browser.close();
