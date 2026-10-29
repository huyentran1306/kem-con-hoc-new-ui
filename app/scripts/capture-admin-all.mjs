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

  // Intercept all admin API calls (chỉ intercept request tới gateway hoặc api)
  await adminPage.route('**/*api/v1/admin/*', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/login') || url.includes('/admin/me')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          token: 'mock_token_valid',
          admin: { id: 'adm_1', email: 'admin@kemconhoc.vn', display_name: 'Quản trị viên', role: 'superadmin' }
        })
      });
      return;
    }

    if (url.includes('/analytics')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          kpis: {
            active_families: 18,
            sessions_count: 142,
            median_minutes: 15,
            badges_granted: 135,
            suggested_rate: 78,
            top_stuck_skill: "Đọc hiểu đề (kẹt 52% số ca)",
          },
          traits_by_grade: [
            { grade: "Lớp 1", kien_nhan: 35, sang_tao: 25, tap_trung: 22, ti_mi: 18, family_count: 8 },
            { grade: "Lớp 2", kien_nhan: 38, sang_tao: 22, tap_trung: 24, ti_mi: 16, family_count: 7 },
            { grade: "Lớp 3", kien_nhan: 40, sang_tao: 20, tap_trung: 25, ti_mi: 15, family_count: 9 },
          ],
          problem_types: [
            { type: "Bảng nhân, chia lặp lại", creativity_pct: 9, sessions: 42, family_count: 12 },
            { type: "Toán lời văn 2 bước", creativity_pct: 27, sessions: 30, family_count: 8 },
          ],
          skills_by_grade: [
            { grade: "Lớp 1", doc_hieu_de: 48, chon_phep_tinh: 40, tinh_toan: 12, don_vi: 25, viet_loi_giai: 44, kiem_tra_lai: 58, family_count: 8 },
            { grade: "Lớp 2", doc_hieu_de: 52, chon_phep_tinh: 36, tinh_toan: 14, don_vi: 28, viet_loi_giai: 40, kiem_tra_lai: 55, family_count: 7 },
            { grade: "Lớp 3", doc_hieu_de: 55, chon_phep_tinh: 33, tinh_toan: 10, don_vi: 22, viet_loi_giai: 42, kiem_tra_lai: 50, family_count: 9 },
          ],
          content_insight: "Bài lặp lại cho ít Sáng tạo nhất. Gợi ý cho Router sư phạm: xen bài tình huống.",
        })
      });
      return;
    }

    if (url.includes('/infra-usage')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          checkedAt: new Date().toISOString(),
          aiCalls: { total: 184, failed: 0 },
          aiNeurons: { used: 14200, limit: 100000 },
          d1Size: { bytes: 4200000, limit: 500000000 },
          clientErrors: { last24h: 0, total: 3 },
          workChecks: { total: 42, ok: 42, rate: 100 }
        })
      });
      return;
    }

    // Default 200 OK for other admin APIs
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });

  await adminPage.goto('http://localhost:4173/admin');
  await adminPage.waitForTimeout(600);

  const emailInput = adminPage.locator('input[type="email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill('admin@kemconhoc.vn');
    await adminPage.locator('input[type="password"]').first().fill('123456');
    await adminPage.locator('button:has-text("Đăng nhập")').first().click();
    await adminPage.waitForTimeout(1000);
  }

  // Chuyển sang Phân tích học tập bằng click vào sidebar
  console.log('Click vào menu Phân tích học tập...');
  const navAnalytics = adminPage.locator('text=Phân tích học tập').first();
  await navAnalytics.click();
  await adminPage.waitForTimeout(1200);

  console.log('Chụp 06_admin_phan_tich_hoc_tap.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '06_admin_phan_tich_hoc_tap.png') });

  // Chuyển sang Hạ tầng & lỗi bằng click sidebar
  console.log('Click vào menu Hạ tầng...');
  const navInfra = adminPage.locator('text=Hạ tầng').first();
  await navInfra.click();
  await adminPage.waitForTimeout(1200);

  console.log('Chụp 07_admin_ha_tang_doc_anh.png...');
  await adminPage.screenshot({ path: path.join(OUT_DIR, '07_admin_ha_tang_doc_anh.png') });

  await browser.close();
  console.log('Chụp hoàn tất cả 2 màn hình admin!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
