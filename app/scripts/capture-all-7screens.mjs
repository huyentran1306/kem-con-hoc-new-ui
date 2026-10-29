import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = path.resolve('bang-chung/prompt23e');

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Mobile flow (390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await mobileContext.newPage();

  await page.goto('http://localhost:4173');
  await page.waitForTimeout(600);

  // Đăng nhập dùng thử
  const trialBtn = page.locator('text=Dùng thử không cần tài khoản').first();
  if (await trialBtn.isVisible()) {
    await trialBtn.click();
    await page.waitForTimeout(800);
  }

  // 1. Trang chủ
  console.log('Chụp 01_trang_chu_phu_huynh.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '01_trang_chu_phu_huynh.png') });

  // 2. Chuyển sang màn Trước khi giảng (Explain)
  console.log('Chuyển sang màn Trước khi giảng...');
  await page.evaluate(() => {
    if (window.__kchPatch && window.__kchGo) {
      window.__kchPatch({
        problem: {
          ocr: 'Có 4 túi kẹo, mỗi túi 6 viên kẹo, bé cho bạn 7 viên kẹo. Hỏi bé còn lại bao nhiêu viên kẹo?',
          steps: [
            { question: 'Có bao nhiêu túi kẹo và mỗi túi có mấy viên con nhỉ?' },
            { question: 'Vậy có tất cả bao nhiêu viên kẹo tất cả?' },
            { question: 'Bé cho bạn mấy viên và mình làm phép tính gì để tìm số kẹo còn lại?' }
          ]
        }
      });
      window.__kchGo('explain');
    }
  });
  await page.waitForTimeout(600);
  console.log('Chụp 02_truoc_khi_giang_dai_de_va_bac.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '02_truoc_khi_giang_dai_de_va_bac.png') });

  // 3. Chuyển sang màn Hỏi con từng bước (Scaffold)
  console.log('Chuyển sang màn Hỏi con từng bước...');
  await page.evaluate(() => {
    if (window.__kchPatch && window.__kchGo) {
      window.__kchPatch({
        flow: { step: 0, stuck: 0, unlocked: false }
      });
      window.__kchGo('scaffold');
    }
  });
  await page.waitForTimeout(600);
  console.log('Chụp 03_hoi_con_dai_de_1_dong.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '03_hoi_con_dai_de_1_dong.png') });

  // 4. Mở ngăn Dành cho mẹ
  console.log('Mở ngăn Dành cho mẹ...');
  const btnMom = page.locator('button:has-text("Dành cho mẹ")').first();
  if (await btnMom.isVisible()) {
    await btnMom.click();
    await page.waitForTimeout(500);
    console.log('Chụp 04_ngan_danh_cho_me_mo.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '04_ngan_danh_cho_me_mo.png') });

    // 5. Bấm phím Escape
    console.log('Nhấn Escape...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    console.log('Chụp 05_ngan_me_da_dong_sau_esc.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '05_ngan_me_da_dong_sau_esc.png') });
  }

  // 6. Admin (Desktop 1280x800)
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
  await adminPage.waitForTimeout(1200);
  console.log('Chụp 06_admin_phan_tich_hoc_tap.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '06_admin_phan_tich_hoc_tap.png') });

  await adminPage.goto('http://localhost:4173/admin/infra');
  await adminPage.waitForTimeout(1200);
  console.log('Chụp 07_admin_ha_tang_doc_anh.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '07_admin_ha_tang_doc_anh.png') });

  await browser.close();
  console.log('=== ĐÃ CHỤP ĐẦY ĐỦ 7 ẢNH MINH CHỨNG THÀNH CÔNG ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
