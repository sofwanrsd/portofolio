import { chromium } from 'playwright';
const URL = process.env.TARGET_URL || 'http://localhost:4321/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);
const data = await page.evaluate(() => {
  const t = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null;
  const heroImg = document.querySelector('#about img');
  const navLinks = [...document.querySelectorAll('header nav a, header a[href^="#"]')]
    .map((a) => a.textContent.trim())
    .filter(Boolean);
  return {
    brand: t('header a, header span, header div'),
    headerText: document.querySelector('header')?.innerText.replace(/\s+/g, ' ').slice(0, 60),
    heroGreeting: [...document.querySelectorAll('#about p')].map((p) => p.textContent.trim()).find((x) => /halo|hi/i.test(x)),
    heroName: t('#about h1'),
    heroImgSrc: heroImg?.getAttribute('src')?.slice(0, 50),
    aboutName: t('#about article h3'),
    certHeading: t('#certifications h2'),
    certCount: document.querySelectorAll('#certifications li').length,
    contactSocials: [...document.querySelectorAll('#contact a[aria-label]')].map((a) => a.getAttribute('aria-label')),
    contactHasBigEmailText: document.querySelector('#contact')?.innerText.includes('rosyidisofwan@gmail.com') ?? false,
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
