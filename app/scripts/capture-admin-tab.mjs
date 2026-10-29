import { chromium } from 'playwright';
import path from 'path';

const OUT_DIR = path.resolve('bang-chung/prompt23e');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const adminContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const adminPage = await adminContext.newPage();

  // Intercept admin endpoints
  await adminPage.route('**/*admin/auth/login*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        token: 'mock_token_valid',
        admin: {
          id: 'adm_test',
          email: 'admin@kemconhoc.vn',
          display_name: 'Quản trị viên',
          role: 'superadmin',
        }
      })
    });
  });

  await adminPage.route('**/*admin/me*', async (route) => {
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

  await adminPage.goto('http://localhost:4173/admin');
  await adminPage.waitForTimeout(600);

  // Điền form đăng nhập
  const emailInput = adminPage.locator('input[type="email"]').first();
  if (await emailInput.isVisible()) {
    console.log('Điền email và pass đăng nhập admin...');
    await emailInput.fill('admin@kemconhoc.vn');
    await adminPage.locator('input[type="password"], input[type="text"]').first().fill('password123');
    await adminPage.locator('button:has-text("Đăng nhập")').first().click();
    await adminPage.waitForTimeout(1000);
  }

  // Chuyển sang tab Phân tích học tập
  console.log('Chuyển sang Phân tích học tập...');
  const navAnalytics = adminPage.locator('text=Phân tích học tập').first();
  if (await navAnalytics.isVisible()) {
    await navAnalytics.click();
    await adminPage.waitForTimeout(1000);
  } else {
    await adminPage.goto('http://localhost:4173/admin/analytics');
    await adminPage.waitForTimeout(1000);
  }

  console.log('Chụp 06_admin_phan_tich_hoc_tap.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '06_admin_phan_tich_hoc_tap.png') });

  // Chuyển sang tab Hạ tầng
  console.log('Chuyển sang Hạ tầng & lỗi...');
  const navInfra = adminPage.locator('text=Hạ tầng').first();
  if (await navInfra.isVisible()) {
    await navInfra.click();
    await adminPage.waitForTimeout(1000);
  } else {
    await adminPage.goto('http://localhost:4173/admin/infra');
    await adminPage.waitForTimeout(1000);
  }

  console.log('Chụp 07_admin_ha_tang_doc_anh.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '07_admin_ha_tang_doc_anh.png') });

  await browser.close();
  console.log('Chụp hoàn tất!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
