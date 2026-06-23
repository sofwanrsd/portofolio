// Verifikasi ikon sosial: pastikan WhatsApp & Email punya path SVG khusus
// (bukan ikon globe generik) di NavBar & Hero.
import { chromium } from 'playwright';

const URL = process.env.TARGET_URL || 'http://localhost:4321/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const links = [...document.querySelectorAll('a[aria-label]')].filter((a) =>
    /whatsapp|email|mail/i.test(a.getAttribute('aria-label') || ''),
  );
  return links.slice(0, 8).map((a) => {
    const svg = a.querySelector('svg');
    const path = svg?.querySelector('path');
    return {
      label: a.getAttribute('aria-label'),
      hasSvg: !!svg,
      pathStart: path ? (path.getAttribute('d') || '').slice(0, 18) : null,
    };
  });
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
