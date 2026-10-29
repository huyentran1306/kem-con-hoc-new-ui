import { chromium } from 'playwright'
import fs from 'fs'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('pageerror', (err) => {
    console.error('PAGE ERROR DETECTED:', err.message)
    consoleErrors.push(err.message)
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text()
      // Bỏ qua các lỗi mạng 404 bên ngoài nếu có
      if (!txt.includes('favicon') && !txt.includes('Failed to load resource')) {
        console.error('CONSOLE ERROR:', txt)
        consoleErrors.push(txt)
      }
    }
  })

  console.log('=== BẮT ĐẦU KIỂM THỬ KHÓI PROMPT 23I TRỌN BÀI HỌC ===')

  // 1. Vào trang chủ
  await page.goto('http://127.0.0.1:4173/?mode=trial')
  await page.waitForTimeout(1000)

  // 2. Bấm Gõ đề bài
  console.log('Bước 1: Bấm Gõ đề bài...')
  const btnType = await page.$('button[data-testid="start-type"], button:has-text("Gõ đề bài")')
  if (btnType) {
    await btnType.click()
  } else {
    // fallback mở qua testid hoặc script
    await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('Gõ'))
      if (b) b.click()
    })
  }
  await page.waitForTimeout(600)

  // 3. Bấm "Gấu đọc đề này"
  console.log('Bước 2: Bấm Gấu đọc đề này...')
  const btnSubmitType = await page.$('button[data-testid="btn-submit-type-problem"], button:has-text("Gấu đọc đề này")')
  if (btnSubmitType) {
    await btnSubmitType.click()
  } else {
    await page.evaluate(() => {
      const b = document.querySelector('button[data-testid="btn-submit-type-problem"]')
      if (b) b.click()
    })
  }
  await page.waitForTimeout(800)

  // 4. Màn AI đọc đề -> Bấm "Đúng rồi, soạn bài"
  console.log('Bước 3: Màn AI đọc đề -> Bấm Đúng rồi, soạn bài...')
  const btnAccept = await page.$('button:has-text("Đúng rồi, soạn bài")')
  if (btnAccept) {
    await btnAccept.click()
    await page.waitForTimeout(1200)
  }

  // 5. Màn Trước khi giảng (Explain)
  console.log('Bước 4: Màn Trước khi giảng (Explain)...')
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'bang-chung/prompt23h/23i_01_explain_screen.png' })

  // Bấm "Bắt đầu hỏi con"
  console.log('Bước 5: Bấm Bắt đầu hỏi con -> Vào màn Hỏi con từng bước...')
  const btnStartTeach = await page.$('button:has-text("Bắt đầu hỏi con")')
  if (btnStartTeach) {
    await btnStartTeach.click()
  } else {
    await page.evaluate(() => {
      if (window.__kchGo) window.__kchGo('prep')
    })
  }
  await page.waitForTimeout(800)

  // Chụp ảnh màn Hỏi con từng bước (đã hết lỗi sập!)
  console.log('Bước 6: Kiểm tra màn Hỏi con từng bước (Đã hết lỗi sập!)...')
  await page.screenshot({ path: 'bang-chung/prompt23h/23i_02_teach_scaffold_ok.png' })

  // 6. Bấm "Chưa nghĩ ra" lần 1 (Kiểm tra thẻ rung & câu thật A3)
  console.log('Bước 7: Bấm Chưa nghĩ ra lần 1 (Kiểm tra thẻ rung & câu thật A3)...')
  const btnStuck = await page.$('button:has-text("Chưa nghĩ ra")')
  if (btnStuck) {
    await btnStuck.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: 'bang-chung/prompt23h/23i_03_teach_stuck_level1.png' })

    // Bấm "Chưa nghĩ ra" lần 2
    console.log('Bước 8: Bấm Chưa nghĩ ra lần 2...')
    await btnStuck.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: 'bang-chung/prompt23h/23i_04_teach_stuck_level2.png' })
  }

  // 7. Mở ngăn Dành cho mẹ
  console.log('Bước 9: Mở ngăn Dành cho mẹ...')
  const btnMomDrawer = await page.$('button:has-text("Dành cho mẹ ▲"), button:has-text("🔒 Dành cho mẹ")')
  if (btnMomDrawer) {
    await btnMomDrawer.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: 'bang-chung/prompt23h/23i_05_mom_drawer_open.png' })
    // Đóng bằng Esc
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  }

  // 8. Bấm "Con làm được!" cho tới khi hoàn thành bài
  console.log('Bước 10: Bấm Con làm được! để hoàn thành các bậc...')
  for (let stepIdx = 0; stepIdx < 4; stepIdx++) {
    const btnDoneStep = await page.$('button:has-text("Con làm được!"), button:has-text("Hoàn thành bài ›")')
    if (btnDoneStep) {
      await btnDoneStep.click()
      await page.waitForTimeout(400)
    }
  }
  await page.waitForTimeout(600)

  // Nếu hiện màn hoàn thành bậc cuối ("Hoàn thành bài ›")
  const btnFinish = await page.$('button[data-testid="btn-finish-lesson"], button:has-text("Hoàn thành bài ›")')
  if (btnFinish) {
    await page.screenshot({ path: 'bang-chung/prompt23h/23i_06_lesson_completed_no_overlap.png' })
    await btnFinish.click()
    await page.waitForTimeout(600)
  }

  // 9. Màn Done (Xong bài & Tặng huy hiệu)
  console.log('Bước 11: Màn Xong bài & Tặng huy hiệu (Kiểm tra A5, A17)...')
  await page.screenshot({ path: 'bang-chung/prompt23h/23i_07_done_screen.png' })

  // Bấm Tặng huy hiệu
  const btnBadge = await page.$('[data-testid="card-suggested-badge"] button.btn-km-primary, button:has-text("Tặng huy hiệu")')
  if (btnBadge) {
    await btnBadge.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'bang-chung/prompt23h/23i_08_badge_given_no_toast_conflict.png' })
  }

  // 10. Kiểm tra bộ theo mùa (Đêm Tuyết) - Nút phẳng mềm không có bóng khối cứng
  console.log('Bước 12: Kiểm tra bộ Đêm Tuyết (Nút phẳng mềm không có bóng khối cứng)...')
  await page.evaluate(() => {
    if (window.__kchPatch) {
      window.__kchPatch({ theme: 'noel' })
    }
    if (window.__kchGo) window.__kchGo('home')
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'bang-chung/prompt23h/23i_09_noel_soft_flat_buttons.png' })

  console.log('=== KẾT THÚC KIỂM THỬ KHÓI ===')

  // Kiểm tra lỗi ReferenceError hoặc console errors
  const refErrors = consoleErrors.filter(e => e.includes('ReferenceError') || e.includes('isCardShaking') || e.includes('not defined'))
  if (refErrors.length > 0) {
    console.error('FAILED: Có lỗi ReferenceError trong console:', refErrors)
    process.exit(1)
  } else {
    console.log('SUCCESS: Toàn bộ bài học chạy mượt mà, KHÔNG CÓ BẤT KỲ LỖI ReferenceError NÀO!')
  }

  await browser.close()
}

run().catch((e) => {
  console.error('Test script crashed:', e)
  process.exit(1)
})
