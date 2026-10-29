import { chromium } from 'playwright'

async function runTest23Z() {
  console.log('========================================')
  console.log('🚀 BẮT ĐẦU KIỂM THỬ UI PROMPT 23Z')
  console.log('========================================\n')

  const browser = await chromium.launch()
  const viewports = [
    { width: 360, height: 800, name: '360' },
    { width: 390, height: 844, name: '390' },
    { width: 1280, height: 800, name: '1280' },
  ]

  for (const vp of viewports) {
    console.log(`--- Kiểm tra khổ ${vp.name}px ---`)
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()

    // 1. Mở màn Đăng nhập
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      window.location.hash = ''
    })
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(500)

    // Chụp màn Đăng nhập
    await page.screenshot({ path: `bang-chung/prompt23z/01_login_${vp.name}.png` })
    console.log(`  ✓ Chụp Đăng nhập khổ ${vp.name}px`)

    // Chuyển sang tab "Tạo gia đình mới"
    const regTab = page.locator('button:has-text("Tạo gia đình mới")')
    if (await regTab.isVisible()) {
      await regTab.click()
      await page.waitForTimeout(300)
      await page.screenshot({ path: `bang-chung/prompt23z/02_register_${vp.name}.png` })
      console.log(`  ✓ Chụp Tạo gia đình mới khổ ${vp.name}px`)
    }

    // Mở màn Tham gia gia đình (bấm Có mã mời)
    const joinBtn = page.locator('button:has-text("Có mã mời")')
    if (await joinBtn.isVisible()) {
      await joinBtn.click()
      await page.waitForTimeout(400)
      await page.screenshot({ path: `bang-chung/prompt23z/03_join_invite_${vp.name}.png` })
      console.log(`  ✓ Chụp Tham gia gia đình khổ ${vp.name}px`)

      // Kiểm tra nút Kiểm tra không bị gãy dòng
      const checkBtn = page.locator('button:has-text("Kiểm tra")').first()
      if (await checkBtn.isVisible()) {
        const box = await checkBtn.boundingBox()
        console.log(`    Nút "Kiểm tra" rộng: ${Math.round(box?.width || 0)}px (Yêu cầu >= 100px)`)
      }

      // Đóng màn Tham gia gia đình
      const cancelJoin = page.locator('button:has-text("Quay lại")').first()
      if (await cancelJoin.isVisible()) {
        await cancelJoin.click()
        await page.waitForTimeout(300)
      }
    }

    // 2. Vào App qua Dùng thử
    const trialBtn = page.locator('button:has-text("Dùng thử")').first()
    if (await trialBtn.isVisible()) {
      await trialBtn.click()
      await page.waitForTimeout(600)
    }

    // Mở sheet Giao diện cả nhà
    await page.evaluate(() => {
      if (window.__kchOpenSheet) window.__kchOpenSheet('themePicker')
    })
    await page.waitForTimeout(600)

    // Cuộn xuống cuối bảng trượt
    await page.evaluate(() => {
      const pn = document.querySelector('.sheet .pn')
      if (pn) pn.scrollTop = pn.scrollHeight
    })
    await page.waitForTimeout(400)

    // Kiểm tra thanh cuộn ngang của bảng
    const hScrollCheck = await page.evaluate(() => {
      const pn = document.querySelector('.sheet .pn')
      const actions = document.querySelector('.sheet-actions-bar')
      const btns = actions ? Array.from(actions.querySelectorAll('button')) : []
      const btnInfo = btns.map(b => ({
        text: b.innerText.trim(),
        width: b.offsetWidth,
        rect: b.getBoundingClientRect(),
      }))
      return {
        pnScrollWidth: pn?.scrollWidth || 0,
        pnClientWidth: pn?.clientWidth || 0,
        hasHScroll: (pn?.scrollWidth || 0) > (pn?.clientWidth || 0) + 1,
        btnInfo,
      }
    })

    console.log(`    Bảng trượt scrollW: ${hScrollCheck.pnScrollWidth}px / clientW: ${hScrollCheck.pnClientWidth}px`)
    console.log(`    Thanh cuộn ngang: ${hScrollCheck.hasHScroll ? '❌ CÓ LỖI CUỘN NGANG' : '✓ 0 LỖI (KHÔNG CUỘN NGANG)'}`)
    if (hScrollCheck.btnInfo.length >= 2) {
      console.log(`    Nút 1: "${hScrollCheck.btnInfo[0]?.text}" rộng ${hScrollCheck.btnInfo[0]?.width}px`)
      console.log(`    Nút 2: "${hScrollCheck.btnInfo[1]?.text}" rộng ${hScrollCheck.btnInfo[1]?.width}px`)
    }

    await page.screenshot({ path: `bang-chung/prompt23z/04_theme_sheet_${vp.name}.png` })
    console.log(`  ✓ Chụp Bảng Đổi giao diện khổ ${vp.name}px\n`)

    await context.close()
  }

  await browser.close()
  console.log('🏁 KIỂM THỬ PROMPT 23Z HOÀN TẤT!')
}

runTest23Z().catch(console.error)
