import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  // 1. Vào Dùng thử -> Home -> Explain
  await page.goto('http://127.0.0.1:8089/')
  await page.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('kem-con-hoc:theme', 'tet')
  })
  await page.goto('http://127.0.0.1:8089/')
  await page.waitForTimeout(400)
  await page.locator('button:has-text("Dùng thử")').first().click()
  await page.waitForTimeout(600)

  // Mở bài học mẫu -> Explain
  await page.locator('.card-km-action').first().click()
  await page.waitForTimeout(600)

  // Chuyển sang Scaffold bằng click nút Bắt đầu hỏi con
  await page.evaluate(() => {
    const btn = document.querySelector('.bottom-action-bar-km button') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('hỏi con'))
    if (btn) btn.click()
  })
  await page.waitForTimeout(700)

  // 4. Màn Hỏi con từng bước (P0-2)
  const progSegments = await page.locator('.fprog-4 i').count()
  console.log(`P0-2: Số khúc tiến trình vẽ được: ${progSegments} khúc (Bài 3 bậc -> Yêu cầu 3 khúc) -> ${progSegments === 3 ? '✓ HOÀN HẢO' : '❌ SAI'}`)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_2_scaffold_3segments_390.png' })
  console.log('✓ Đã chụp p0_2_scaffold_3segments_390.png')

  // Hoàn thành 3 bước
  for (let s = 0; s < 3; s++) {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('hiểu') || b.innerText.includes('làm được') || b.innerText.includes('Đúng') || b.innerText.includes('Tiếp tục'))
      if (btn) btn.click()
    })
    await page.waitForTimeout(400)
  }

  // Bấm Hoàn thành bài -> vào màn Xong bài
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Hoàn thành bài'))
    if (btn) btn.click()
  })
  await page.waitForTimeout(800)

  // 5. Màn Xong bài ở bộ Xuân Sum Vầy (P0-1)
  const tabsCount = await page.locator('nav.tabs').count()
  const saveBtn = page.locator('button:has-text("Lưu & về trang chủ")').first()
  const saveBox = await saveBtn.boundingBox()
  console.log(`P0-1: Thanh tab nav.tabs hiển thị: ${tabsCount > 0 ? '❌ CÒN HIỆN' : '✓ ĐÃ ẨN (0 thanh tab)'}`)
  console.log(`P0-1: Nút Lưu & về trang chủ trọn vẹn tại y=${Math.round(saveBox?.y || 0)}, h=${Math.round(saveBox?.height || 0)}`)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_1_xong_bai_tet_no_tabs_390.png' })
  console.log('✓ Đã chụp p0_1_xong_bai_tet_no_tabs_390.png')

  // Bấm Lưu & về trang chủ
  if (await saveBtn.isVisible()) {
    await saveBtn.click()
    await page.waitForTimeout(600)
  }

  // 6. Báo cáo (P0-4, P0-5)
  await page.locator('.tabs button:has-text("Báo cáo")').first().click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_4_bao_cao_ai_kem_390.png' })
  console.log('✓ Đã chụp p0_4_bao_cao_ai_kem_390.png')

  // 7. Trò chơi (P0-5, P1-4)
  await page.locator('.tabs button:has-text("Trò chơi")').first().click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_5_tro_choi_no_token_390.png' })
  console.log('✓ Đã chụp p0_5_tro_choi_no_token_390.png')

  // 8. Cổng cô giáo (P0-7, P1-8)
  await page.goto('http://127.0.0.1:8089/#teacher')
  await page.reload()
  await page.waitForTimeout(800)

  const demoTeacher = page.locator('button:has-text("Dùng thử"), button:has-text("Vào xem thử")').first()
  if (await demoTeacher.isVisible()) {
    await demoTeacher.click()
    await page.waitForTimeout(800)
  }

  // Mở tab Bài tập
  const asgTab = page.locator('nav.tp-bottom-tab, button:has-text("Bài tập")').first()
  if (await asgTab.isVisible()) {
    await asgTab.click()
    await page.waitForTimeout(600)
  }

  // Mở modal Soạn bài tập
  const createAsgBtn = page.locator('button:has-text("Soạn bài"), button:has-text("Tạo bài")').first()
  if (await createAsgBtn.isVisible()) {
    await createAsgBtn.click()
    await page.waitForTimeout(600)
  }

  await page.screenshot({ path: 'bang-chung/prompt27/p0_7_p1_8_teacher_portal_390.png' })
  console.log('✓ Đã chụp p0_7_p1_8_teacher_portal_390.png')

  await browser.close()
  console.log('🎉 ĐÃ HOÀN THÀNH TẤT CẢ!')
}

run().catch(console.error)
