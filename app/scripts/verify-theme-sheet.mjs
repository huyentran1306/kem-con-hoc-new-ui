import { chromium } from 'playwright'

async function verify() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await page.goto('http://localhost:5173/')
  await page.waitForTimeout(600)

  // 1. Bấm Dùng thử để vào app
  const trialBtn = page.locator('button:has-text("Dùng thử")').first()
  if (await trialBtn.isVisible()) {
    await trialBtn.click()
    await page.waitForTimeout(600)
  }

  // 2. Chuyển sang tab Con tôi
  const profileTab = page.locator('.bnav-btn:has-text("Con tôi"), button:has-text("Con tôi")').first()
  if (await profileTab.isVisible()) {
    await profileTab.click()
    await page.waitForTimeout(500)
  }

  // 3. Bấm mở "Giao diện cả nhà"
  const themeBtn = page.locator('text=Giao diện cả nhà').first()
  if (await themeBtn.isVisible()) {
    await themeBtn.click()
    await page.waitForTimeout(600)
  }

  // 4. Cuộn xuống cuối bảng trượt
  await page.evaluate(() => {
    const pn = document.querySelector('.sheet .pn')
    if (pn) pn.scrollTop = pn.scrollHeight
  })
  await page.waitForTimeout(400)

  const check = await page.evaluate(() => {
    const pn = document.querySelector('.sheet .pn')
    const actions = document.querySelector('.sheet-actions-bar')
    const btns = actions ? Array.from(actions.querySelectorAll('button')) : []
    const pnRect = pn ? pn.getBoundingClientRect() : null
    return {
      pnWidth: pn ? pn.clientWidth : 0,
      pnScrollWidth: pn ? pn.scrollWidth : 0,
      hasHScroll: pn ? pn.scrollWidth > pn.clientWidth : false,
      btn1: btns[0] ? { text: btns[0].innerText.trim(), width: btns[0].offsetWidth, right: btns[0].getBoundingClientRect().right } : null,
      btn2: btns[1] ? { text: btns[1].innerText.trim(), width: btns[1].offsetWidth, right: btns[1].getBoundingClientRect().right } : null,
      pnRight: pnRect ? pnRect.right : 0,
      isBtn2InsidePn: btns[1] && pnRect ? btns[1].getBoundingClientRect().right <= pnRect.right + 2 : false,
    }
  })

  console.log('--- KẾT QUẢ ĐO THỰC TẾ BẢNG ĐỔI GIAO DIỆN (390px) ---')
  console.log(`Bề rộng khung bảng (clientWidth): ${check.pnWidth}px`)
  console.log(`Bề rộng nội dung (scrollWidth): ${check.pnScrollWidth}px`)
  console.log(`Lỗi cuộn ngang (hasHScroll): ${check.hasHScroll ? '❌ CÓ' : '✓ KHÔNG (0 LỖI)'}`)
  console.log(`Nút 1 ("${check.btn1?.text}"): rộng ${check.btn1?.width}px`)
  console.log(`Nút 2 ("${check.btn2?.text}"): rộng ${check.btn2?.width}px`)
  console.log(`Nút chính nằm trọn trong khung (không bị đẩy ra mép phải): ${check.isBtn2InsidePn ? '✓ ĐÚNG' : '❌ SAI'}`)

  await page.screenshot({ path: 'bang-chung/prompt23z/04_theme_sheet_390.png' })
  console.log('✓ Đã chụp ảnh lưu tại bang-chung/prompt23z/04_theme_sheet_390.png')

  await browser.close()
}

verify().catch(console.error)
