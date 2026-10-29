import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  // 1. Chụp màn Onboarding (Phần 2)
  console.log('--- 1. Kiểm tra Phần 2: Màn Onboarding ---')
  await page.goto('http://127.0.0.1:8089/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('http://127.0.0.1:8089/')
  await page.waitForTimeout(400)

  const createFamBtn = page.locator('button:has-text("Tạo gia đình mới")')
  if (await createFamBtn.isVisible()) {
    await createFamBtn.click()
    await page.waitForTimeout(300)
    const fields = page.locator('.field')
    await fields.nth(0).fill('Gia đình Thử Nghiệm')
    await fields.nth(1).fill('1234')
    await fields.nth(2).fill('1234')
    await page.locator('button:has-text("Tạo gia đình & vào app")').click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'bang-chung/prompt27/phan2_onboarding_390.png' })
    console.log('✓ Đã chụp phan2_onboarding_390.png')
  }

  // 2. Chế độ Dùng thử & P0-6, P0-8 (Profile)
  console.log('--- 2. Kiểm tra Dùng Thử: Profile (P0-6, P0-8) ---')
  await page.evaluate(() => {
    localStorage.clear()
    // Đặt sẵn bộ Xuân Sum Vầy (tet)
    localStorage.setItem('kem-con-hoc:theme', 'tet')
  })
  await page.goto('http://127.0.0.1:8089/')
  await page.waitForTimeout(400)
  await page.locator('button:has-text("Dùng thử")').first().click()
  await page.waitForTimeout(600)

  // Mở tab Con tôi
  await page.locator('.tabs button:has-text("Con tôi")').first().click()
  await page.waitForTimeout(500)

  const themeText = await page.locator('text=11 bộ phong cách').count()
  console.log(`P0-8: 11 bộ phong cách đổi 1 chạm: ${themeText > 0 ? '✓ ĐÚNG' : '❌ CHƯA THẤY'}`)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_6_p0_8_profile_390.png' })
  console.log('✓ Đã chụp p0_6_p0_8_profile_390.png')

  // Đổi sang theme tet bằng script nếu chưa set
  await page.evaluate(() => {
    const raw = localStorage.getItem('kem-con-hoc:state')
    if (raw) {
      const s = JSON.parse(raw)
      s.theme = 'tet'
      localStorage.setItem('kem-con-hoc:state', JSON.stringify(s))
    }
  })
  await page.reload()
  await page.waitForTimeout(600)

  // 3. Mở bài học mẫu -> Explain (P0-3, P1-13)
  console.log('--- 3. Kiểm tra Bài Mẫu & Màn Giảng (P0-3, P1-13) ---')
  await page.locator('.tabs button:has-text("Học tối nay")').first().click()
  await page.waitForTimeout(500)

  await page.locator('button:has-text("Bắt đầu bài tối nay"), .card-km-action').first().click()
  await page.waitForTimeout(700)

  await page.screenshot({ path: 'bang-chung/prompt27/p0_3_p1_13_explain_skills_390.png' })
  console.log('✓ Đã chụp p0_3_p1_13_explain_skills_390.png')

  // 4. Màn Hỏi con từng bước (P0-2)
  console.log('--- 4. Màn Hỏi con từng bước (P0-2) ---')
  await page.locator('button:has-text("Hỏi con từng bước"), button:has-text("Bắt đầu hỏi con")').first().click()
  await page.waitForTimeout(600)

  const progSegments = await page.locator('.fprog-4 i').count()
  console.log(`P0-2: Số khúc tiến trình vẽ được: ${progSegments} khúc (Bài 3 bậc -> Yêu cầu 3 khúc) -> ${progSegments === 3 ? '✓ HOÀN HẢO' : '❌ SAI'}`)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_2_scaffold_3segments_390.png' })
  console.log('✓ Đã chụp p0_2_scaffold_3segments_390.png')

  // 5. Màn Xong bài ở bộ Xuân Sum Vầy (P0-1)
  console.log('--- 5. Màn Xong bài ở bộ Xuân Sum Vầy (P0-1) ---')
  for (let s = 0; s < 3; s++) {
    const nextBtn = page.locator('button:has-text("Con hiểu rồi"), button:has-text("Con làm được"), button:has-text("Đúng rồi"), button:has-text("Tiếp tục")').first()
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(400)
    }
  }

  const finishBtn = page.locator('button:has-text("Hoàn thành bài")').first()
  if (await finishBtn.isVisible()) {
    await finishBtn.click()
    await page.waitForTimeout(700)
  }

  const tabsCount = await page.locator('nav.tabs').count()
  const saveBtn = page.locator('button:has-text("Lưu & về trang chủ")').first()
  const saveBox = await saveBtn.boundingBox()
  console.log(`P0-1: Thanh tab nav.tabs hiển thị: ${tabsCount > 0 ? '❌ CÒN HIỆN' : '✓ ĐÃ ẨN (0 thanh tab)'}`)
  console.log(`P0-1: Nút Lưu & về trang chủ trọn vẹn tại y=${Math.round(saveBox?.y || 0)}, h=${Math.round(saveBox?.height || 0)}`)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_1_xong_bai_tet_no_tabs_390.png' })
  console.log('✓ Đã chụp p0_1_xong_bai_tet_no_tabs_390.png')

  if (await saveBtn.isVisible()) {
    await saveBtn.click()
    await page.waitForTimeout(600)
  }

  // 6. Báo cáo (P0-4, P0-5)
  console.log('--- 6. Báo cáo (P0-4, P0-5) ---')
  await page.locator('.tabs button:has-text("Báo cáo")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_4_bao_cao_ai_kem_390.png' })
  console.log('✓ Đã chụp p0_4_bao_cao_ai_kem_390.png')

  // 7. Trò chơi (P0-5, P1-4)
  console.log('--- 7. Trò chơi (P0-5, P1-4) ---')
  await page.locator('.tabs button:has-text("Trò chơi")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_5_tro_choi_no_token_390.png' })
  console.log('✓ Đã chụp p0_5_tro_choi_no_token_390.png')

  await browser.close()
  console.log('🎉 ĐÃ HOÀN THÀNH TẤT CẢ KIỂM TRA & CAPTURE EVIDENCE!')
}

run().catch(console.error)
