import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = path.resolve('bang-chung/prompt23e');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:4173');
  await page.waitForTimeout(1000);

  // Mở bài học
  const startBtn = page.locator('button:has-text("Bắt đầu"), button:has-text("BẮT ĐẦU")').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(800);
  }
  const snapBtn = page.locator('text=Dùng bài mẫu, text=Chụp bài').first();
  if (await snapBtn.isVisible()) {
    await snapBtn.click();
    await page.waitForTimeout(800);
  }

  // Vào màn Hỏi con
  const btnExplainNext = page.locator('button:has-text("Bắt đầu hỏi con")').first();
  if (await btnExplainNext.isVisible()) {
    await btnExplainNext.click();
    await page.waitForTimeout(1000);
  }

  // Tìm nút 🔒 Dành cho mẹ
  const btnMom = page.locator('button:has-text("Dành cho mẹ")').first();
  if (await btnMom.isVisible()) {
    console.log('Tìm thấy nút Dành cho mẹ, bấm mở...');
    await btnMom.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, '04_ngan_danh_cho_me_mo.png') });
    console.log('Đã chụp 04_ngan_danh_cho_me_mo.png');

    // Bấm Escape
    console.log('Nhấn Escape...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, '05_ngan_me_da_dong_sau_esc.png') });
    console.log('Đã chụp 05_ngan_me_da_dong_sau_esc.png');
  } else {
    console.log('Không thấy nút Dành cho mẹ');
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
