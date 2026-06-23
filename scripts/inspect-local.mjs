// Inspeksi tampilan lokal (localhost:4321) setelah islands ter-hydrate.
// Mencetak innerText terstruktur + menyimpan screenshot agar bisa diperiksa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.TARGET_URL || 'http://localhost:4321/';
const OUT = 'scripts/ui-inspect';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500); // tunggu hydration + fetch seed

const text = await page.evaluate(() => document.body.innerText);
await page.screenshot({ path: `${OUT}/local-full.png`, fullPage: true });

console.log('===== VISIBLE TEXT =====');
console.log(text);
console.log('\n===== CONSOLE/PAGE ERRORS =====');
console.log(errors.length ? errors.join('\n') : '(none)');

await browser.close();
