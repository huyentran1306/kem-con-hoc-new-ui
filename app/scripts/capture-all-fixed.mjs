import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = path.resolve('bang-chung/prompt23e');

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Mobile flow
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await mobileContext.newPage();

  await page.goto('http://localhost:4173');
  await page.waitForTimeout(800);

  // Bấm Dùng thử không cần tài khoản
  const trialBtn = page.locator('text=Dùng thử không cần tài khoản').first();
  if (await trialBtn.isVisible()) {
    console.log('Bấm Dùng thử không cần tài khoản...');
    await trialBtn.click();
    await page.waitForTimeout(1000);
  }

  // 1. Chụp Trang chủ (Thẻ bài cô giao & giao diện mới)
  console.log('Chụp 01_trang_chu_phu_huynh.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '01_trang_chu_phu_huynh.png') });

  // Bắt đầu bài học
  const startBtn = page.locator('button:has-text("Bắt đầu"), button:has-text("BẮT ĐẦU")').first();
  if (await startBtn.isVisible()) {
    console.log('Bấm Bắt đầu bài tối nay...');
    await startBtn.click();
    await page.waitForTimeout(800);
  }

  // Chọn bài mẫu
  const sampleBtn = page.locator('text=Dùng bài mẫu, text=Chụp bài').first();
  if (await sampleBtn.isVisible()) {
    console.log('Bấm Dùng bài mẫu...');
    await sampleBtn.click();
    await page.waitForTimeout(1000);
  }

  // 2. Chụp Màn Trước khi giảng (Dải đề 1 dòng & Bậc câu hỏi 24px)
  console.log('Chụp 02_truoc_khi_giang_dai_de_va_bac.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '02_truoc_khi_giang_dai_de_va_bac.png') });

  // Bấm Bắt đầu hỏi con
  const btnStartScaffold = page.locator('button:has-text("Bắt đầu hỏi con")').first();
  if (await btnStartScaffold.isVisible()) {
    console.log('Bấm Bắt đầu hỏi con...');
    await btnStartScaffold.click();
    await page.waitForTimeout(1000);
  }

  // 3. Chụp Màn Hỏi con từng bước (Dải đề 1 dòng)
  console.log('Chụp 03_hoi_con_dai_de_1_dong.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '03_hoi_con_dai_de_1_dong.png') });

  // 4. Mở ngăn Dành cho mẹ
  const btnMom = page.locator('button:has-text("Dành cho mẹ")').first();
  if (await btnMom.isVisible()) {
    console.log('Bấm mở ngăn Dành cho mẹ...');
    await btnMom.click();
    await page.waitForTimeout(600);
    console.log('Chụp 04_ngan_danh_cho_me_mo.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '04_ngan_danh_cho_me_mo.png') });

    // 5. Bấm phím Escape
    console.log('Nhấn phím Esc...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    console.log('Chụp 05_ngan_me_da_dong_sau_esc.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '05_ngan_me_da_dong_sau_esc.png') });
  }

  // 6. Admin
  console.log('Chuyển sang Admin...');
  const adminContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const adminPage = await adminContext.newPage();

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
    localStorage.setItem('kem-con-hoc:admin-token', 'mock_token_admin');
  });

  await adminPage.goto('http://localhost:4173/admin/analytics');
  await adminPage.waitForTimeout(1500);
  console.log('Chụp 06_admin_phan_tich_hoc_tap.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '06_admin_phan_tich_hoc_tap.png') });

  await adminPage.goto('http://localhost:4173/admin/infra');
  await adminPage.waitForTimeout(1500);
  console.log('Chụp 07_admin_ha_tang_doc_anh.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '07_admin_ha_tang_doc_anh.png') });

  await browser.close();
  console.log('HOÀN TẤT CHỤP TOÀN BỘ 7 ẢNH MINH CHỨNG!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
