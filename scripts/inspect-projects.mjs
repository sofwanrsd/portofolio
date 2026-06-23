// Cek kontras elemen di bagian Proyek (badge kategori, tab filter aktif,
// tombol GitHub) di light & dark mode.
import { chromium } from 'playwright';

const URL = process.env.TARGET_URL || 'http://localhost:4321/';
function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg, bg) {
  const L1 = lum(fg), L2 = lum(bg);
  return ((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2);
}
const parse = (s) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);

const browser = await chromium.launch();
async function run(dark) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  if (dark) await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(1500);
  const s = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { text: el.textContent.trim().slice(0, 16), color: cs.color, bg: cs.backgroundColor };
    };
    return {
      categoryBadge: pick('#projects article span'),
      activeTab: pick('#projects [aria-pressed="true"]'),
      githubBtn: pick('#projects article a'),
    };
  });
  const out = {};
  for (const [k, v] of Object.entries(s)) out[k] = v ? { ...v, ratio: ratio(parse(v.color), parse(v.bg)) } : null;
  console.log(`\n== ${dark ? 'DARK' : 'LIGHT'} ==`);
  console.log(JSON.stringify(out, null, 2));
  await page.close();
}
await run(false);
await run(true);
await browser.close();
