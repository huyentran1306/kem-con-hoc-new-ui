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
  await page.waitForTimeout(600);

  // Đăng nhập dùng thử
  const trialBtn = page.locator('text=Dùng thử không cần tài khoản').first();
  if (await trialBtn.isVisible()) {
    await trialBtn.click();
    await page.waitForTimeout(600);
  }

  // Vào màn scaffold
  await page.evaluate(() => {
    window.__kchPatch({
      problem: {
        ocr: 'Có 4 túi kẹo, mỗi túi 6 viên kẹo, bé cho bạn 7 viên kẹo. Hỏi bé còn lại bao nhiêu viên kẹo?',
        steps: [
          { question: 'Có bao nhiêu túi kẹo và mỗi túi có mấy viên con nhỉ?' },
          { question: 'Vậy có tất cả bao nhiêu viên kẹo tất cả?' }
        ]
      },
      flow: { step: 0, stuck: 0, unlocked: false }
    });
    window.__kchGo('scaffold');
  });
  await page.waitForTimeout(600);

  // Tìm nút 🔒 Dành cho mẹ ▲
  const momHandle = page.locator('button:has-text("Dành cho mẹ")').first();
  await momHandle.click();
  await page.waitForTimeout(400);

  console.log('Chụp 04_ngan_danh_cho_me_mo.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '04_ngan_danh_cho_me_mo.png') });

  // Nhấn Escape
  console.log('Nhấn Escape...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  console.log('Chụp 05_ngan_me_da_dong_sau_esc.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '05_ngan_me_da_dong_sau_esc.png') });

  // Thử lại mở ra và chạm nền mờ backdrop
  await momHandle.click();
  await page.waitForTimeout(400);
  console.log('Chạm nền mờ backdrop...');
  await page.locator('[data-testid="mom-drawer-backdrop"]').click({ position: { x: 20, y: 100 } });
  await page.waitForTimeout(400);
  console.log('Chụp 05b_ngan_me_dong_sau_cham_nen_mo.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '05b_ngan_me_dong_sau_cham_nen_mo.png') });

  await browser.close();
  console.log('Đã test xong Esc và nền mờ!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
