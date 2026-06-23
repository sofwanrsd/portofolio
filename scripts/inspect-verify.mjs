import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);
const d = await page.evaluate(() => ({
  navLinks: [...document.querySelectorAll('header a[href^="#"]')].map((a) => a.textContent.trim()),
  certHeading: document.querySelector('#certifications h2')?.textContent.trim(),
  certCards: document.querySelectorAll('#certifications li').length,
  certFirst: document.querySelector('#certifications h3')?.textContent.trim(),
  heroIntro: document.querySelector('#about p')?.textContent.trim(),
  heroImg: document.querySelector('#about img')?.getAttribute('src')?.slice(0, 45),
  aboutName: document.querySelector('#about article h3')?.textContent.trim(),
  aboutDesc: document.querySelector('#about article p')?.textContent.trim(),
}));
console.log(JSON.stringify(d, null, 2));
await browser.close();
