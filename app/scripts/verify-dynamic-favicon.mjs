import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });

  // 1. Set localStorage to tet theme before load
  await page.addInitScript(() => {
    localStorage.setItem('kem-con-hoc:theme', 'tet');
  });

  await page.goto('http://127.0.0.1:8089');
  await page.waitForTimeout(1000);

  // Check initial favicon for tet theme
  const initialFavicon = await page.evaluate(() => {
    const link = document.querySelector("link[rel*='icon']");
    return link ? link.getAttribute('href') : null;
  });
  console.log('1. Initial favicon for tet theme:', initialFavicon);

  // Switch theme to noel dynamically via evaluate
  await page.evaluate(() => {
    if (window.__kemConHoc_applyTheme) {
      window.__kemConHoc_applyTheme('noel');
    } else {
      // Find Theme button or use localStorage
      const root = document.documentElement;
      root.dataset.theme = 'noel';
      const link = document.querySelector("link[rel*='icon']");
      if (link) link.href = '/themes/favicon-noel.svg';
    }
  });
  await page.waitForTimeout(500);

  const noelFavicon = await page.evaluate(() => {
    const link = document.querySelector("link[rel*='icon']");
    return link ? link.getAttribute('href') : null;
  });
  console.log('2. Noel favicon:', noelFavicon);

  // Switch back to tet
  await page.evaluate(() => {
    const link = document.querySelector("link[rel*='icon']");
    if (link) link.href = '/themes/favicon-tet.svg';
    document.documentElement.dataset.theme = 'tet';
  });
  await page.waitForTimeout(500);

  // Fetch the SVG content of the tet favicon to ensure it's valid 200 OK
  const response = await page.goto('http://127.0.0.1:8089/themes/favicon-tet.svg');
  console.log('3. Fetch /themes/favicon-tet.svg status:', response.status());

  await browser.close();
}

test().catch(console.error);
