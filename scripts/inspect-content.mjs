// Verifikasi konten: dump innerText tiap section + cek duplikasi paragraf,
// jumlah kartu proyek, kelompok riwayat, dan label skill. Untuk memastikan
// layout/konten sudah benar tanpa perlu melihat screenshot.
import { chromium } from 'playwright';

const URL = process.env.TARGET_URL || 'http://localhost:4321/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);

const report = await page.evaluate(() => {
  const txt = (sel) => {
    const el = document.querySelector(sel);
    return el ? el.innerText.replace(/\s+/g, ' ').trim() : null;
  };
  const heroDesc = (() => {
    const el = document.querySelector('#about h1');
    if (!el) return null;
    // paragraf tepat setelah h1
    let p = el.nextElementSibling;
    while (p && p.tagName !== 'P') p = p.nextElementSibling;
    return p ? p.innerText.trim() : null;
  })();
  const aboutCard = (() => {
    const art = document.querySelector('#about article');
    if (!art) return null;
    const p = art.querySelector('p');
    return p ? p.innerText.trim() : null;
  })();
  return {
    heroHeading: txt('#about h1'),
    heroDesc,
    aboutCardDesc: aboutCard,
    heroAboutDuplicate: heroDesc && aboutCard ? heroDesc === aboutCard : false,
    skillTiles: document.querySelectorAll('#skills li, #skills article, #skills [class*="border"]').length,
    skillLabels: [...document.querySelectorAll('#skills')].length
      ? [...document.querySelectorAll('#skills *')]
          .map((e) => e.textContent.trim())
          .filter((t) => /^(Beginner|Intermediate|Advanced|Expert|Pro)$/.test(t))
      : [],
    projectCards: document.querySelectorAll('#projects article').length,
    historyGroupLabels: [...document.querySelectorAll('#history h3')].map((h) => h.textContent.trim()),
    historyEntries: document.querySelectorAll('#history h4').length,
    contactPresent: !!document.querySelector('#contact'),
  };
});

console.log(JSON.stringify(report, null, 2));
await browser.close();
