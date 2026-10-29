import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  // Set theme to tet in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('kem-con-hoc:theme', 'tet');
  });

  // 1. Visit Home
  await page.goto('http://127.0.0.1:8089/');
  await page.waitForTimeout(600);
  const homeFav = await page.evaluate(() => ({
    fav: document.querySelector("link[rel*='icon']").getAttribute('href'),
    theme: document.documentElement.dataset.theme
  }));
  console.log('1. Home (expected tet):', homeFav);

  // 2. Visit /admin
  await page.goto('http://127.0.0.1:8089/#admin');
  await page.waitForTimeout(600);
  const adminFav = await page.evaluate(() => ({
    fav: document.querySelector("link[rel*='icon']").getAttribute('href'),
    theme: document.documentElement.dataset.theme
  }));
  console.log('2. Admin (expected bear):', adminFav);

  // 3. Visit /teacher
  await page.goto('http://127.0.0.1:8089/#teacher');
  await page.waitForTimeout(600);
  const teacherFav = await page.evaluate(() => ({
    fav: document.querySelector("link[rel*='icon']").getAttribute('href'),
    theme: document.documentElement.dataset.theme
  }));
  console.log('3. Teacher (expected bear):', teacherFav);

  await browser.close();
}

test().catch(console.error);
