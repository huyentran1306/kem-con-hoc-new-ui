import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 440, height: 956 } });
  await page.goto('http://127.0.0.1:8089');
  await page.waitForTimeout(600);

  // Click trial button
  await page.click('button:has-text("Dùng thử")');
  await page.waitForTimeout(600);

  // Click "Con tôi" tab
  await page.click('button:has-text("Con tôi")');
  await page.waitForTimeout(600);

  // Click "Giao diện cả nhà"
  await page.click('button:has-text("Giao diện cả nhà")');
  await page.waitForTimeout(600);

  // Check buttons inside theme sheet
  const sheetBtns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean));
  console.log('Buttons inside sheet:', sheetBtns.filter(t => t.includes('Xuân') || t.includes('Tuyết') || t.includes('Gấu') || t.includes('Kẹo')));

  // Click "Xuân Sum Vầy"
  await page.click('button:has-text("Xuân Sum Vầy")');
  await page.waitForTimeout(600);

  const favTet = await page.evaluate(() => document.querySelector("link[rel*='icon']").getAttribute('href'));
  console.log('Favicon after clicking Xuân Sum Vầy:', favTet);

  // Click "Đêm Tuyết"
  await page.click('button:has-text("Đêm Tuyết")');
  await page.waitForTimeout(600);

  const favNoel = await page.evaluate(() => document.querySelector("link[rel*='icon']").getAttribute('href'));
  console.log('Favicon after clicking Đêm Tuyết:', favNoel);

  // Click "Bạn Gấu"
  await page.click('button:has-text("Bạn Gấu")');
  await page.waitForTimeout(600);

  const favBear = await page.evaluate(() => document.querySelector("link[rel*='icon']").getAttribute('href'));
  console.log('Favicon after clicking Bạn Gấu:', favBear);

  await browser.close();
}

run().catch(console.error);
