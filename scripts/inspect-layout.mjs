// Diagnosa tata letak: ukur bounding box bagian-bagian kunci + cek overflow
// horizontal, pada lebar desktop dan mobile. Cetak metrik agar bisa dianalisis.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.TARGET_URL || 'http://localhost:4321/';
const OUT = 'scripts/ui-inspect';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function audit(width, height, tag) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const data = await page.evaluate((vw) => {
    const out = { viewport: vw, scrollWidth: document.documentElement.scrollWidth, overflowX: document.documentElement.scrollWidth > vw };
    const sel = {
      header: 'header',
      heroSection: '#about',
      heroImg: '#about img',
      skills: '#skills',
      projects: '#projects',
      projectCards: '#projects article',
      history: '#history',
      historyGroups: '#history h3',
    };
    out.boxes = {};
    for (const [k, s] of Object.entries(sel)) {
      const els = [...document.querySelectorAll(s)];
      out.boxes[k] = els.slice(0, 6).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      });
    }
    // Deteksi elemen yang melebar melewati viewport
    const wide = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 1 && r.height > 0) {
        wide.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 60), w: Math.round(r.width) });
      }
    });
    out.tooWide = wide.slice(0, 10);
    return out;
  }, width);

  await page.screenshot({ path: `${OUT}/layout-${tag}.png`, fullPage: true });
  console.log(`\n===== ${tag} (${width}x${height}) =====`);
  console.log(JSON.stringify(data, null, 2));
  await page.close();
}

await audit(1440, 1000, 'desktop');
await audit(390, 800, 'mobile');

await browser.close();
