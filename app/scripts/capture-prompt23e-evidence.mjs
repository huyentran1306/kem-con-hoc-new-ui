import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('bang-chung/prompt23e');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Phụ huynh & Bài học (Mobile 390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await mobileContext.newPage();

  console.log('Chụp Trang chủ phụ huynh...');
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '01_trang_chu_phu_huynh.png') });

  // Mở bài học
  const startBtn = page.locator('button:has-text("Bắt đầu"), button:has-text("BẮT ĐẦU")').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(800);
  }
  const snapBtn = page.locator('text=Dùng bài mẫu, text=Chụp bài').first();
  if (await snapBtn.isVisible()) {
    await snapBtn.click();
    await page.waitForTimeout(1000);
  }
  console.log('Chụp Màn Trước khi giảng...');
  await page.screenshot({ path: path.join(OUT_DIR, '02_truoc_khi_giang_dai_de_va_bac.png') });

  // Mở màn Hỏi con
  const btnExplainNext = page.locator('button:has-text("Bắt đầu hỏi con")').first();
  if (await btnExplainNext.isVisible()) {
    await btnExplainNext.click();
    await page.waitForTimeout(1000);
  }
  console.log('Chụp Màn Hỏi con từng bước (Dải đề 1 dòng)...');
  await page.screenshot({ path: path.join(OUT_DIR, '03_hoi_con_dai_de_1_dong.png') });

  // Mở ngăn Dành riêng cho mẹ
  const btnMom = page.locator('button:has-text("Dành riêng"), button:has-text("Dành cho")').first();
  if (await btnMom.isVisible()) {
    await btnMom.click();
    await page.waitForTimeout(600);
    console.log('Chụp Ngăn Dành cho mẹ đang mở...');
    await page.screenshot({ path: path.join(OUT_DIR, '04_ngan_danh_cho_me_mo.png') });

    // Bấm phím Escape
    console.log('Nhấn phím Esc...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    console.log('Chụp Ngăn Dành cho mẹ đã đóng sau khi nhấn Esc...');
    await page.screenshot({ path: path.join(OUT_DIR, '05_ngan_me_da_dong_sau_esc.png') });
  }

  // 2. Admin (Desktop 1280x800)
  console.log('Chụp Admin...');
  const adminContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const adminPage = await adminContext.newPage();

  // Route intercept
  await adminPage.route('**/api/v1/admin/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        admin: {
          id: 'adm_test',
          email: 'admin@kemconhoc.vn',
          display_name: 'Quản trị viên',
          role: 'superadmin',
        }
      })
    });
  });

  await adminPage.addInitScript(() => {
    localStorage.setItem('kem-con-hoc:admin-token', 'mock_admin_token_test');
  });

  await adminPage.goto('http://localhost:4173/admin/analytics');
  await adminPage.waitForTimeout(1500);

  console.log('Chụp Phân tích học tập...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '06_admin_phan_tich_hoc_tap.png') });

  await adminPage.goto('http://localhost:4173/admin/infra');
  await adminPage.waitForTimeout(1500);

  console.log('Chụp Hạ tầng & lỗi...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '07_admin_ha_tang_doc_anh.png') });

  await browser.close();
  console.log('Hoàn thành chụp tất cả bằng chứng!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
