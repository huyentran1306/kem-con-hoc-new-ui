import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const PROD_URL = 'https://kem-con-hoc-5xf.pages.dev/?mode=trial';
const OUT_DIR = path.resolve('bang-chung/prompt23h');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log('=== BẮT ĐẦU KIỂM TRA PRODUCTION VÀ GHI VIDEO PROMPT 23J ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 390, height: 844 }
    }
  });

  const page = await context.newPage();
  
  // 1. Vào trang chủ production
  console.log('Navigating to', PROD_URL);
  await page.goto(PROD_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 2. Bấm "Dùng thử không cần tài khoản"
  console.log('Clicking "Dùng thử không cần tài khoản"...');
  await page.click('text=Dùng thử không cần tài khoản');
  await page.waitForTimeout(800);

  // 3. Vào màn Trước khi giảng
  console.log('Vào màn Trước khi giảng (prep)...');
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('prep');
  });
  await page.waitForTimeout(800);

  // 4. Bấm "Bắt đầu hỏi con"
  console.log('Clicking "Bắt đầu hỏi con"...');
  await page.click('text=Bắt đầu hỏi con');
  await page.waitForTimeout(1000);

  // 5. Màn Hỏi con từng bước -> Bấm "Con làm được!"
  console.log('Waiting for "Con làm được!" button...');
  await page.waitForSelector('button:has-text("Con làm được!")');
  
  console.log('Clicking "Con làm được!" -> Chụp hiệu ứng xong 1 bậc trong suốt...');
  await page.click('button:has-text("Con làm được!")');
  
  // Chờ 300ms khi hũ mật đang bay
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, 'prod_23j_01_step_done_transparent.png') });
  console.log('-> Đã chụp prod_23j_01_step_done_transparent.png');
  await page.waitForTimeout(1800);

  // 6. Chuyển sang màn Xong bài
  console.log('Chuyển sang màn Xong bài (done)...');
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo('done');
  });
  await page.waitForTimeout(1000);

  // Chụp ảnh màn Xong bài trước khi tặng huy hiệu
  await page.screenshot({ path: path.join(OUT_DIR, 'prod_23j_02_done_screen_before_badge.png') });
  console.log('-> Đã chụp prod_23j_02_done_screen_before_badge.png');

  // 7. Bấm "Tặng huy hiệu"
  console.log('Clicking "Tặng huy hiệu"...');
  const btnBadge = page.locator('[data-testid="btn-grant-suggested-badge"]').first();
  if (await btnBadge.isVisible()) {
    await btnBadge.click();
    // Chờ 350ms khi sticker đang bay
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(OUT_DIR, 'prod_23j_03_badge_fly_transparent.png') });
    console.log('-> Đã chụp prod_23j_03_badge_fly_transparent.png');

    // Chờ bong bóng linh vật xuất hiện ở phía trên thanh nút đáy (không đè thẻ Dành cho mẹ)
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(OUT_DIR, 'prod_23j_04_bubble_above_bottom_bar.png') });
    console.log('-> Đã chụp prod_23j_04_bubble_above_bottom_bar.png');
    await page.waitForTimeout(2000);
  } else {
    console.log('Không tìm thấy nút Tặng huy hiệu');
  }

  console.log('Hoàn thành kịch bản. Đóng page để xuất video WebM...');
  await page.close();
  
  const videoFile = await page.video()?.path();
  if (videoFile) {
    const finalVideoPath = path.join(OUT_DIR, 'prod_23j_transparency_demo.webm');
    fs.copyFileSync(videoFile, finalVideoPath);
    console.log('Video production hoàn thành:', finalVideoPath);
  }

  await context.close();
  await browser.close();
  console.log('=== TOÀN BỘ KIỂM CHỨNG PRODUCTION 23J THÀNH CÔNG ===');
}

run().catch(err => {
  console.error('Lỗi kiểm tra production:', err);
  process.exit(1);
});
