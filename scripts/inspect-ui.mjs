// Inspeksi UI referensi (wandev.my.id) untuk mengekstrak design tokens.
// Menjalankan Chromium headless, membaca computed styles, dan menyimpan
// screenshot full-page + JSON ringkasan agar dapat dibaca tanpa melihat gambar.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const URL = process.env.TARGET_URL || 'https://wandev.my.id/';
const OUT_DIR = 'scripts/ui-inspect';
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);

const tokens = await page.evaluate(() => {
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const pick = (s, props) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const c = getComputedStyle(el);
    const out = { selector: s };
    for (const p of props) out[p] = c.getPropertyValue(p);
    return out;
  };
  const props = ['color', 'background-color', 'font-family', 'font-size', 'font-weight', 'letter-spacing', 'text-transform', 'border-radius', 'background-image'];

  // Kumpulkan warna unik dari elemen-elemen kunci.
  const sampleSelectors = ['body', 'header', 'nav', 'h1', 'h2', 'h3', 'a', 'button', 'p', 'section'];
  const samples = sampleSelectors.map((s) => pick(s, props)).filter(Boolean);

  // Warna latar & teks dominan dari body.
  const body = getComputedStyle(document.body);

  // Kumpulkan semua warna background unik di viewport atas.
  const bgColors = new Set();
  const textColors = new Set();
  document.querySelectorAll('*').forEach((el) => {
    const c = getComputedStyle(el);
    if (c.backgroundColor && c.backgroundColor !== 'rgba(0, 0, 0, 0)') bgColors.add(c.backgroundColor);
    if (c.color) textColors.add(c.color);
  });

  // Heading teks untuk memahami hierarki.
  const headings = [...document.querySelectorAll('h1,h2,h3')].slice(0, 12).map((h) => ({
    tag: h.tagName,
    text: h.innerText.trim().slice(0, 60),
    fontSize: getComputedStyle(h).fontSize,
    fontWeight: getComputedStyle(h).fontWeight,
    color: getComputedStyle(h).color,
    textTransform: getComputedStyle(h).textTransform,
  }));

  // Tombol untuk warna aksen.
  const buttons = [...document.querySelectorAll('a,button')].slice(0, 20).map((b) => ({
    text: b.innerText.trim().slice(0, 30),
    bg: getComputedStyle(b).backgroundColor,
    color: getComputedStyle(b).color,
    border: getComputedStyle(b).border,
    borderRadius: getComputedStyle(b).borderRadius,
  })).filter((b) => b.text);

  return {
    bodyBg: body.backgroundColor,
    bodyColor: body.color,
    bodyFont: body.fontFamily,
    uniqueBgColors: [...bgColors].slice(0, 25),
    uniqueTextColors: [...textColors].slice(0, 25),
    samples,
    headings,
    buttons,
  };
});

writeFileSync(`${OUT_DIR}/tokens.json`, JSON.stringify(tokens, null, 2), 'utf8');
await page.screenshot({ path: `${OUT_DIR}/full.png`, fullPage: true });

// Screenshot per-viewport (hero) untuk referensi.
await page.screenshot({ path: `${OUT_DIR}/hero.png` });

console.log(JSON.stringify(tokens, null, 2));
console.log('\nSaved:', `${OUT_DIR}/tokens.json`, `${OUT_DIR}/full.png`, `${OUT_DIR}/hero.png`);

await browser.close();
